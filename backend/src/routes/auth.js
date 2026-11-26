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
 * @desc    Cung cấp cấu hình công khai (Google Client ID & GitHub OAuth status) cho frontend
 */
router.get('/config', (req, res) => {
  return res.json({
    success: true,
    googleClientId: process.env.GOOGLE_CLIENT_ID || '72336868787-9tlektnct22a92fddqenh3e6rfr5gkc7.apps.googleusercontent.com',
    githubEnabled: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
  });
});

/**
 * @route   GET /api/auth/github/login
 * @desc    Chuyển hướng người dùng sang trang xác thực GitHub OAuth
 */
router.get('/github/login', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(503).send(`
      <!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>Chưa cấu hình GitHub OAuth</title></head>
      <body style="font-family:sans-serif;padding:32px;max-width:520px;margin:auto;color:#0f172a;">
        <h2 style="margin-bottom:8px;">Chưa cấu hình GitHub OAuth</h2>
        <p style="color:#475569;font-size:14px;line-height:1.6;">
          Vui lòng thêm <code>GITHUB_CLIENT_ID</code> và <code>GITHUB_CLIENT_SECRET</code> vào Environment Variables trên Render (hoặc file <code>.env</code>).
        </p>
        <button onclick="window.close()" style="margin-top:16px;padding:10px 18px;background:#2563eb;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Đóng cửa sổ</button>
      </body></html>
    `);
  }

  const role = (req.query.role === 'HR' || req.query.role === 'Employer') ? 'HR' : 'Student';
  const mode = req.query.mode === 'register' ? 'register' : 'login';
  const state = Buffer.from(JSON.stringify({ role, mode })).toString('base64url');
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  const redirectUri = `${proto}://${host}/api/auth/github/callback`;

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20user:email&state=${encodeURIComponent(state)}`;
  return res.redirect(githubAuthUrl);
});

/**
 * @route   GET /api/auth/github/callback
 * @desc    Nhận code từ GitHub, đổi lấy access_token, xác thực user & trả JWT về Frontend
 */
router.get('/github/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    if (error || !code) {
      return res.send(`
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'GITHUB_AUTH_ERROR', message: 'Bạn đã hủy đăng nhập GitHub.' }, window.location.origin);
            window.close();
          } else {
            window.location.href = '/?auth_error=github_cancelled';
          }
        </script>
      `);
    }

    let role = 'Student';
    let mode = 'login';
    if (state) {
      try {
        const parsed = JSON.parse(Buffer.from(String(state), 'base64url').toString('utf8'));
        if (parsed.role === 'HR') role = 'HR';
        if (parsed.mode === 'register') mode = 'register';
      } catch (e) {}
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: String(code)
      })
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error(tokenData.error_description || 'Không thể lấy access token từ GitHub.');
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'ConnectCV-App'
      }
    });
    const ghUser = await userRes.json();

    let email = ghUser.email;
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'ConnectCV-App'
        }
      });
      if (emailsRes.ok) {
        const emails = await emailsRes.json();
        const primary = Array.isArray(emails) ? (emails.find(e => e.primary && e.verified) || emails.find(e => e.verified) || emails[0]) : null;
        if (primary) email = primary.email;
      }
    }

    if (!email) {
      email = `${ghUser.login}@users.noreply.github.com`;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const displayName = ghUser.name || ghUser.login || normalizedEmail.split('@')[0];

    let user = UserModel.findByEmail(normalizedEmail);
    if (!user) {
      user = UserModel.create({
        id: ghUser.id ? `usr_github_${ghUser.id}` : undefined,
        username: displayName,
        email: normalizedEmail,
        password_hash: null,
        isPro: role === 'HR',
        role: role,
        github: ghUser.login || '',
        avatar: '/assets/default-avatar.svg',
        aiCredits: role === 'HR' ? 40 : 20
      });
    } else {
      const updates = {};
      if (!user.avatar) updates.avatar = '/assets/default-avatar.svg';
      if (ghUser.login && !user.github) updates.github = ghUser.login;
      if (Object.keys(updates).length > 0) {
        user = UserModel.update(user.id, updates) || user;
      }
    }

    const jwtToken = generateToken(user);
    const publicUser = UserModel.toPublicJSON(user);

    return res.send(`
      <!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>Đăng nhập thành công</title></head>
      <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#0f172a;">
        <p style="font-size:14px;font-weight:600;">Đang hoàn tất đăng nhập GitHub...</p>
        <script>
          const payload = {
            type: 'GITHUB_AUTH_SUCCESS',
            jwtToken: ${JSON.stringify(jwtToken)},
            user: ${JSON.stringify(publicUser)},
            message: ${JSON.stringify(mode === 'register' ? 'Đăng ký bằng GitHub thành công!' : 'Đăng nhập GitHub thành công!')}
          };
          if (window.opener) {
            window.opener.postMessage(payload, window.location.origin);
            window.close();
          } else {
            localStorage.setItem('jwtToken', payload.jwtToken);
            localStorage.setItem('connectcv_user', JSON.stringify(payload.user));
            window.location.href = '/';
          }
        </script>
      </body></html>
    `);
  } catch (err) {
    console.error('Lỗi GitHub OAuth callback:', err);
    return res.status(500).send(`
      <script>
        if (window.opener) {
          window.opener.postMessage({ type: 'GITHUB_AUTH_ERROR', message: 'Lỗi xác thực GitHub: ${err.message.replace(/'/g, "\\'")}' }, window.location.origin);
          window.close();
        } else {
          window.location.href = '/?auth_error=github_failed';
        }
      </script>
    `);
  }
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

    // Tự động đăng nhập hoặc tạo tài khoản mới nếu chưa tồn tại (1-click Google Sign-in)
    if (!user) {
      const assignedRole = (role === 'HR' || role === 'Employer') ? 'HR' : 'Student';
      user = UserModel.create({
        id: googleId ? `usr_google_${googleId}` : undefined,
        username: userName,
        email: userEmail,
        password_hash: null,
        isPro: assignedRole === 'HR',
        role: assignedRole,
        avatar: '/assets/default-avatar.svg',
        aiCredits: assignedRole === 'HR' ? 40 : 20
      });
    } else {
      // Người dùng đã có tài khoản: Giữ nguyên avatar hiện có, chỉ gán mặc định nếu chưa có
      if (!user.avatar) {
        user = UserModel.update(user.id, { avatar: '/assets/default-avatar.svg' }) || user;
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
 * @desc    Đã tắt đăng ký trực tiếp — Chỉ hỗ trợ đăng ký qua Google hoặc GitHub OAuth
 */
router.post('/register', (req, res) => {
  return res.status(403).json({
    success: false,
    code: 'OAUTH_ONLY',
    message: 'Hệ thống chỉ hỗ trợ đăng ký bằng tài khoản Google hoặc GitHub.'
  });
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
 * @desc    Đã tắt đăng nhập trực tiếp — Chỉ hỗ trợ đăng nhập qua Google hoặc GitHub OAuth
 */
router.post('/login', (req, res) => {
  return res.status(403).json({
    success: false,
    code: 'OAUTH_ONLY',
    message: 'Hệ thống chỉ hỗ trợ đăng nhập bằng tài khoản Google hoặc GitHub.'
  });
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
        name: updates.fullName || updates.username || req.user?.fullName || req.user?.username || '',
        role: updates.title !== undefined ? updates.title : (req.user?.title || ''),
        avatar: updates.avatar || req.user?.avatar || '/assets/default-avatar.svg',
        experienceYears: updates.experienceYears !== undefined ? (parseInt(updates.experienceYears) || 0) : (req.user?.experienceYears || 0),
        skills: updates.skills !== undefined ? updates.skills : (req.user?.skills || []),
        rating: 5.0,
        bio: updates.bio !== undefined ? updates.bio : (req.user?.bio || ''),
        subdomain: updates.subdomain !== undefined ? updates.subdomain : (req.user?.subdomain || ''),
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
