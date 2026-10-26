'use strict';

/**
 * Middleware kiểm tra Role người dùng theo RBAC
 * @param {...string} allowedRoles - Danh sách role được phép: 'HR', 'Student', 'Employer', 'Admin'
 */
function checkRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'AUTH_REQUIRED',
        message: 'Vui lòng đăng nhập để tiếp tục.'
      });
    }

    const userRole = req.user.role;
    // Cho phép nếu role khớp hoặc người dùng là Admin
    if (allowedRoles.includes(userRole) || userRole === 'Admin') {
      return next();
    }

    return res.status(403).json({
      success: false,
      code: 'PERMISSION_DENIED',
      message: `Tài khoản của bạn (${userRole}) không có quyền thực hiện hành động này. Yêu cầu quyền: ${allowedRoles.join(', ')}`
    });
  };
}

/**
 * Middleware kiểm tra tài khoản Pro
 */
function requirePro(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      code: 'AUTH_REQUIRED',
      message: 'Vui lòng đăng nhập để tiếp tục.'
    });
  }

  if (req.user.isPro) {
    return next();
  }

  return res.status(402).json({
    success: false,
    code: 'PRO_REQUIRED',
    message: 'Tính năng này yêu cầu tài khoản ConnectCV Pro. Vui lòng quét mã VietQR nâng cấp tài khoản!'
  });
}

module.exports = {
  checkRole,
  requirePro
};
