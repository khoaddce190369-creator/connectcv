'use strict';
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
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
 * @route   POST /api/auth/google
 * @desc    Google OAuth2 & JWT Workflow
 * Body: { googleToken, email, name, role }
 */
router.post('/google', async (req, res) => {
  try {
    const { googleToken, email, name, role } = req.body;

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
      // Giải mã payload từ JWT Google (base64)
      try {
        const parts = googleToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          userEmail = payload.email || userEmail;
          userName = payload.name || userName;
          userAvatar = payload.picture || userAvatar;
          googleId = payload.sub;
        }
      } catch (err) {
        console.warn('Không thể parse googleToken base64, sử dụng thông tin dự phòng:', err.message);
      }
    }

    if (!userEmail) {
      userEmail = `user_${Date.now()}@connectcv.io`;
    }
    if (!userName) {
      userName = userEmail.split('@')[0];
    }

    // Tìm hoặc tạo User trong database (theo User Schema: id, username, password_hash: null, isPro, role)
    let user = UserModel.findByEmail(userEmail);
    if (!user) {
      user = UserModel.create({
        id: googleId ? `usr_google_${googleId}` : undefined,
        username: userName,
        email: userEmail,
        password_hash: null,
        isPro: false,
        role: role === 'HR' ? 'HR' : 'Student',
        avatar: userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        aiCredits: 15
      });
    } else if (userAvatar && !user.avatar) {
      UserModel.update(user.id, { avatar: userAvatar });
    }

    const jwtToken = generateToken(user);
    const publicUser = UserModel.toPublicJSON(user);

    return res.json({
      success: true,
      message: 'Đăng nhập Google thành công.',
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
 * @desc    Hỗ trợ đăng nhập Email/Password & 1-Click Demo Roles
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_EMAIL',
        message: 'Vui lòng nhập email đăng nhập.'
      });
    }

    let user = UserModel.findByEmail(email);

    // Nếu là tài khoản demo hoặc chưa có thì tự động tạo cho tiện trải nghiệm
    if (!user) {
      const assignedRole = role === 'hr' || email.includes('novatech') ? 'HR' : 'Student';
      user = UserModel.create({
        username: email.split('@')[0],
        email: email,
        password_hash: password || null,
        isPro: assignedRole === 'HR',
        role: assignedRole,
        aiCredits: assignedRole === 'HR' ? 50 : 20
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
 * @desc    Đổi role nhanh phục vụ testing
 */
router.post('/switch-role', authMiddleware, (req, res) => {
  const { newRole } = req.body;
  if (!['HR', 'Student', 'Employer'].includes(newRole)) {
    return res.status(400).json({ success: false, message: 'Role không hợp lệ.' });
  }

  const updated = UserModel.update(req.user.id, { role: newRole });
  const jwtToken = generateToken(updated);

  return res.json({
    success: true,
    jwtToken,
    user: UserModel.toPublicJSON(updated)
  });
});

module.exports = router;
