'use strict';
const express = require('express');
const router = express.Router();
const UserModel = require('../models/User');
const { optionalAuth, authMiddleware } = require('../middlewares/authMiddleware');

// Lưu trạng thái giao dịch nạp / nâng cấp theo transactionCode
const pendingTransactions = new Map();

// Cấu hình ngân hàng VietQR của hệ thống ConnectCV
const BANK_CONFIG = {
  bankId: process.env.VIETQR_BANK_ID || 'MB',
  accountNo: process.env.VIETQR_ACCOUNT_NO || '0987654321',
  accountName: process.env.VIETQR_ACCOUNT_NAME || 'CONG TY CONNECTCV AI'
};

const PACKAGES = {
  FREE: { name: 'ConnectCV Cơ Bản', amount: 0, durationDays: 3650 },
  PRO_MONTHLY: { name: 'ConnectCV Pro Tháng', amount: 20000, durationDays: 30 },
  PRO_YEARLY: { name: 'ConnectCV Pro Năm', amount: 199000, durationDays: 365 },
  PRO_LIFETIME: { name: 'ConnectCV Pro Trọn Gói', amount: 199000, durationDays: 365 },
  MAX_MONTHLY: { name: 'ConnectCV MAX VIP Tháng', amount: 49000, durationDays: 30 },
  MAX_YEARLY: { name: 'ConnectCV MAX VIP Năm', amount: 399000, durationDays: 365 }
};

/**
 * @route   POST /api/payment/create-qr
 * @desc    VietQR Dynamic Generation
 * Body: { packageType: "PRO_MONTHLY" | "PRO_LIFETIME", amount }
 */
router.post('/create-qr', optionalAuth, (req, res) => {
  try {
    const { packageType = 'PRO_MONTHLY', amount } = req.body;

    const selectedPkg = PACKAGES[packageType] || PACKAGES.PRO_MONTHLY;
    const finalAmount = amount ? parseInt(amount) : selectedPkg.amount;

    const userId = req.user?.id || `usr_google_${Math.floor(100000 + Math.random() * 900000)}`;
    const sanitizedId = userId.replace(/[^a-zA-Z0-9_]/g, '');
    const transferContent = `UPGRADE_${sanitizedId}`;

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // URL chuẩn sinh mã VietQR ảnh động NAPAS qua VietQR API Gateway
    const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-compact2.png?amount=${finalAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

    const txnRecord = {
      transactionId,
      userId,
      packageType,
      amount: finalAmount,
      transferContent,
      bank: BANK_CONFIG.bankId,
      accountNo: BANK_CONFIG.accountNo,
      accountName: BANK_CONFIG.accountName,
      status: 'PENDING', // PENDING -> SUCCESS
      qrUrl,
      createdAt: new Date().toISOString()
    };

    pendingTransactions.set(transferContent, txnRecord);
    pendingTransactions.set(transactionId, txnRecord);

    return res.json({
      success: true,
      data: {
        transactionId,
        transferContent,
        amount: finalAmount,
        bankName: BANK_CONFIG.bankId,
        accountNo: BANK_CONFIG.accountNo,
        accountName: BANK_CONFIG.accountName,
        qrUrl,
        instructions: `Quét mã QR bằng App Ngân Hàng bất kỳ. Giữ nguyên nội dung chuyển khoản "${transferContent}" để hệ thống tự động kích hoạt gói Pro trong vài giây.`
      }
    });
  } catch (error) {
    console.error('Lỗi POST /api/payment/create-qr:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khởi tạo mã thanh toán VietQR.' });
  }
});

/**
 * @route   GET /api/payment/check-status
 * @desc    Transaction Status Polling: Frontend tự động polling kiểm tra trạng thái
 * Query: transactionId hoặc transferContent
 */
router.get('/check-status', optionalAuth, (req, res) => {
  try {
    const { transactionId, transferContent } = req.query;
    const key = transferContent || transactionId;

    if (!key) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp transactionId hoặc transferContent.' });
    }

    const txn = pendingTransactions.get(key);

    if (!txn) {
      return res.json({
        success: true,
        status: 'PENDING',
        isPro: !!req.user?.isPro,
        message: 'Đang chờ nhận chuyển khoản...'
      });
    }

    if (txn.status === 'SUCCESS') {
      return res.json({
        success: true,
        status: 'SUCCESS',
        isPro: true,
        message: 'Giao dịch thành công! Tài khoản của bạn đã được nâng cấp lên ConnectCV Pro.'
      });
    }

    return res.json({
      success: true,
      status: 'PENDING',
      isPro: !!req.user?.isPro,
      message: 'Đang lắng nghe giao dịch chuyển khoản VietQR...'
    });
  } catch (error) {
    console.error('Lỗi GET /api/payment/check-status:', error);
    return res.status(500).json({ success: false, message: 'Lỗi kiểm tra trạng thái thanh toán.' });
  }
});

/**
 * @route   POST /api/payment/mock-confirm
 * @desc    Mô phỏng xác nhận thanh toán thành công ngay lập tức (dành cho demo & kiểm thử)
 * Body: { transferContent, transactionId }
 */
router.post('/mock-confirm', optionalAuth, (req, res) => {
  try {
    const { transferContent, transactionId } = req.body;
    const key = transferContent || transactionId;

    let targetTxn = null;
    if (key && pendingTransactions.has(key)) {
      targetTxn = pendingTransactions.get(key);
      targetTxn.status = 'SUCCESS';
    }

    const userId = targetTxn?.userId || req.user?.id;
    const pkg = targetTxn?.packageType || 'PRO_MONTHLY';
    let updatedUser = null;
    if (userId) {
      updatedUser = UserModel.update(userId, { isPro: true, plan: pkg });
    }

    return res.json({
      success: true,
      message: 'Xác nhận thanh toán thành công! Gói cước đã được kích hoạt ngay lập tức.',
      isPro: true,
      plan: pkg,
      user: UserModel.toPublicJSON(updatedUser || { id: userId, isPro: true, plan: pkg })
    });
  } catch (error) {
    console.error('Lỗi POST /api/payment/mock-confirm:', error);
    return res.status(500).json({ success: false, message: 'Lỗi xác nhận mô phỏng.' });
  }
});

module.exports = router;
