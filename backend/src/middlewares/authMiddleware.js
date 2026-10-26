'use strict';
const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'connectcv_super_secret_jwt_key_2026';

function authMiddleware(req, res, next) {
  let token = null;

  // 1. Kiểm tra header Authorization
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      code: 'AUTH_REQUIRED',
      message: 'Yêu cầu đăng nhập. Vui lòng gửi JWT token qua Authorization: Bearer <token>'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'Tài khoản liên kết với token này không tồn tại.'
      });
    }

    req.user = UserModel.toPublicJSON(user);
    req.userId = user.id;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'
    });
  }
}

// Optional Auth: nếu có token thì parse, nếu không có thì vẫn next()
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = UserModel.findById(decoded.id);
      if (user) {
        req.user = UserModel.toPublicJSON(user);
        req.userId = user.id;
      }
    } catch (_) {
      // Bỏ qua lỗi token trong optional auth
    }
  }
  next();
}

module.exports = {
  authMiddleware,
  optionalAuth,
  JWT_SECRET
};
