'use strict';
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const UserModel = require('../models/User');
const { authMiddleware, optionalAuth, JWT_SECRET } = require('../middlewares/authMiddleware');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      isPro: user.isPro
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * @route   GET /api/auth/config
 * @desc    Cung cấp cấu hình công khai (Google Client ID) cho frontend
 */
router.get('/config', (req, res) => {
  return res.json({
    success: true,
    googleClientId: process.env.GOOGLE_CLIENT_ID || ''
  });
});

/**
 * @route   POST /api/auth/google
 * @desc    Google OAuth2 & JWT Workflow
 * Body: { googleToken, email, name, role, mode }
 */
router.post('/google', async (req, res) => {
  try {
    const { googleToken, email, name, role, mode } = req.body;

    if (!googleToken && !email) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_CREDENTIALS',
        message: 'Vui lòng cung cấp googleToken hoặc email xác thực.'
      });
    }

    // Xác định thông tin user từ googleToken hoặc body
    let userEmail = email;
    let userName = name;
    let userAvatar = req.body.avatar;
    let googleId = null;

    if (googleToken) {
      try {
        // Xác thực Token trực tiếp từ máy chủ Google
        const tokenQuery = googleToken.includes('.') ? `id_token=${encodeURIComponent(googleToken)}` : `access_token=${encodeURIComponent(googleToken)}`;
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?${tokenQuery}`);
        if (verifyRes.ok) {
          const gData = await verifyRes.json();
          userEmail = gData.email || userEmail;
          userName = gData.name || userName;
          userAvatar = gData.picture || userAvatar;
          googleId = gData.sub;
        } else if (googleToken.includes('.')) {
          // Fallback base64 decode nếu đang offline hoặc dev token
          const parts = googleToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            userEmail = payload.email || userEmail;
            userName = payload.name || userName;
            userAvatar = payload.picture || userAvatar;
            googleId = payload.sub;
          }
        }
      } catch (err) {
        console.warn('Lỗi xác thực Google tokeninfo, fallback base64:', err.message);
        if (googleToken.includes('.')) {
          const parts = googleToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            userEmail = payload.email || userEmail;
            userName = payload.name || userName;
            userAvatar = payload.picture || userAvatar;
            googleId = payload.sub;
          }
        }
      }
    }

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy thông tin email từ tài khoản Google.'
      });
    }

    userEmail = userEmail.toLowerCase().trim();
    if (!userName) {
      userName = userEmail.split('@')[0];
    }

    // Tìm kiếm User trong database
    let user = UserModel.findByEmail(userEmail);

    // QUY TẮC NGHIỆP VỤ: Chưa có tài khoản đăng ký thì không được đăng nhập
    if (mode === 'login') {
      if (!user) {
        return res.status(404).json({
          success: false,
          code: 'USER_NOT_REGISTERED',
          message: 'Tài khoản Google này chưa được đăng ký. Vui lòng đăng ký tài khoản trước!',
          googleEmail: userEmail,
          googleName: userName,
          googleAvatar: userAvatar
        });
      }
      // Người dùng đã có tài khoản: Cập nhật avatar nếu thiếu, KHÔNG ĐỔI ROLE
      if (userAvatar && !user.avatar) {
        user = UserModel.update(user.id, { avatar: userAvatar }) || user;
      }
    } else {
      // mode === 'register' hoặc mặc định
      if (!user) {
        // Tạo tài khoản mới với Role cố định (không được đổi role sau này)
        const assignedRole = (role === 'HR' || role === 'Employer') ? 'HR' : 'Student';
        user = UserModel.create({
          id: googleId ? `usr_google_${googleId}` : undefined,
          username: userName,
          email: userEmail,
          password_hash: null,
          isPro: assignedRole === 'HR',
          role: assignedRole,
          avatar: userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
          aiCredits: assignedRole === 'HR' ? 40 : 20
        });
      } else {
        // Nếu tài khoản đã tồn tại thì giữ nguyên role ban đầu
        if (userAvatar && !user.avatar) {
          user = UserModel.update(user.id, { avatar: userAvatar }) || user;
        }
      }
    }

    const jwtToken = generateToken(user);
    const publicUser = UserModel.toPublicJSON(user);

    return res.json({
      success: true,
      message: mode === 'register' ? 'Đăng ký tài khoản thành công.' : 'Đăng nhập Google thành công.',
      jwtToken,
      user: publicUser
    });
  } catch (error) {
    console.error('Lỗi POST /api/auth/google:', error);
    return res.status(500).json({
      success: false,
      code: 'AUTH_FAILED',
      message: 'Lỗi xác thực Google. Vui lòng thử lại.'
    });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký tài khoản mới (Ứng viên hoặc Doanh nghiệp)
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ Email và Mật khẩu.'
      });
    }

    const existingUser = UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được đăng ký tài khoản trên hệ thống. Vui lòng đăng nhập.'
      });
    }

    const assignedRole = role === 'HR' || role === 'Employer' ? 'HR' : 'Student';
    const newUser = UserModel.create({
      username: username || email.split('@')[0],
      email: email.toLowerCase(),
      password_hash: password,
      role: assignedRole,
      isPro: false,
      aiCredits: assignedRole === 'HR' ? 40 : 20
    });

    const jwtToken = generateToken(newUser);
    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công.',
      jwtToken,
      user: UserModel.toPublicJSON(newUser)
    });
  } catch (error) {
    console.error('Lỗi POST /api/auth/register:', error);
    return res.status(500).json({ success: false, message: 'Lỗi đăng ký tài khoản.' });
  }
});

/**
 * @route   GET /api/auth/users
 * @desc    Danh sách người dùng cho Admin Dashboard
 */
router.get('/users', optionalAuth, (req, res) => {
  try {
    const users = UserModel.findAll();
    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi lấy danh sách user.' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập bằng Email & Mật khẩu (Kiểm tra nghiêm ngặt tài khoản đã đăng ký)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Vui lòng nhập đầy đủ Email và Mật khẩu.'
      });
    }

    const user = UserModel.findByEmail(email.toLowerCase().trim());

    // QUY TẮC: Chưa có tài khoản đăng ký thì không được đăng nhập
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_REGISTERED',
        message: 'Tài khoản này chưa được đăng ký trong hệ thống. Vui lòng đăng ký trước khi đăng nhập!'
      });
    }

    // Kiểm tra mật khẩu nếu tài khoản có mật khẩu
    if (user.password_hash && user.password_hash !== password) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_PASSWORD',
        message: 'Mật khẩu không chính xác.'
      });
    }

    const jwtToken = generateToken(user);
    const publicUser = UserModel.toPublicJSON(user);

    return res.json({
      success: true,
      message: 'Đăng nhập thành công.',
      jwtToken,
      user: publicUser
    });
  } catch (error) {
    console.error('Lỗi POST /api/auth/login:', error);
    return res.status(500).json({
      success: false,
      code: 'LOGIN_FAILED',
      message: 'Lỗi đăng nhập. Vui lòng thử lại.'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Session Verification: Validate token & khôi phục role, isPro trên giao diện
 */
router.get('/me', authMiddleware, (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
});

/**
 * @route   POST /api/auth/switch-role
 * @desc    Đổi role: Khóa cố định vai trò sau khi đăng ký
 */
router.post('/switch-role', authMiddleware, (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Vai trò tài khoản đã được cố định sau khi đăng ký và không thể thay đổi.'
  });
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Cập nhật thông tin hồ sơ ứng viên (Candidate Profile) & đồng bộ portfolio
 */
router.put('/profile', optionalAuth, (req, res) => {
  try {
    const userId = req.user?.id || req.body.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để cập nhật hồ sơ.' });
    }

    const {
      fullName,
      username,
      avatar,
      title,
      bio,
      phone,
      location,
      skills,
      hourlyRate,
      experienceYears,
      subdomain,
      linkedin,
      github,
      website
    } = req.body;

    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (username !== undefined) updates.username = username;
    if (avatar !== undefined) updates.avatar = avatar;
    if (title !== undefined) updates.title = title;
    if (bio !== undefined) updates.bio = bio;
    if (phone !== undefined) updates.phone = phone;
    if (location !== undefined) updates.location = location;
    if (skills !== undefined) updates.skills = Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []);
    if (hourlyRate !== undefined) updates.hourlyRate = hourlyRate;
    if (experienceYears !== undefined) updates.experienceYears = experienceYears;
    if (subdomain !== undefined) updates.subdomain = subdomain;
    if (linkedin !== undefined) updates.linkedin = linkedin;
    if (github !== undefined) updates.github = github;
    if (website !== undefined) updates.website = website;

    const updatedUser = UserModel.update(userId, updates);

    // Đồng bộ sang bảng candidates nếu đã có hoặc thêm mới
    try {
      const candidates = db.get('candidates') || [];
      const candIndex = candidates.findIndex(c => c.id === userId || c.userId === userId || (updates.username && c.name === updates.username));
      const candData = {
        id: userId,
        userId: userId,
        name: updates.fullName || updates.username || req.user?.username || 'Ứng viên ConnectCV',
        role: updates.title || 'Chuyên viên tài năng',
        avatar: updates.avatar || req.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        experienceYears: parseInt(updates.experienceYears || 2),
        skills: updates.skills || ['Figma', 'UI/UX', 'ATS CV'],
        rating: 5.0,
        bio: updates.bio || '',
        subdomain: updates.subdomain || '',
        portfolioUrl: updates.subdomain ? `/p/${updates.subdomain}` : '/freelancer-profile.html',
        isPro: req.user?.isPro || false
      };

      if (candIndex !== -1) {
        candidates[candIndex] = { ...candidates[candIndex], ...candData };
      } else {
        candidates.push(candData);
      }
      db.saveData();
    } catch (candErr) {
      console.warn('Lỗi đồng bộ bảng candidates:', candErr.message);
    }

    return res.json({
      success: true,
      message: 'Cập nhật thông tin hồ sơ ứng viên thành công!',
      user: UserModel.toPublicJSON(updatedUser || { ...req.user, ...updates })
    });
  } catch (error) {
    console.error('Lỗi PUT /api/auth/profile:', error);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật hồ sơ.' });
  }
});

module.exports = router;
