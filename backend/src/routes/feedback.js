'use strict';
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const UserModel = require('../models/User');
const { optionalAuth } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/feedback/client
 * @desc    System Rating & Feedback: Đánh giá số sao (1-5) & nội dung góp ý
 * Body: { rating, comment, userName }
 */
router.post('/client', optionalAuth, (req, res) => {
  try {
    const { rating, comment } = req.body;
    const numRating = Number(rating);

    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Số sao đánh giá phải từ 1 đến 5 sao.'
      });
    }

    const newFeedback = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userName: req.user?.username || req.body.userName || 'Người dùng ẩn danh',
      userRole: req.user?.role || 'Job Seeker',
      rating: numRating,
      comment: comment || 'Hệ thống hoạt động rất tốt!',
      createdAt: new Date().toISOString()
    };

    db.insert('feedback', newFeedback);

    return res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn đã đóng góp ý kiến đánh giá hệ thống!',
      feedback: newFeedback
    });
  } catch (error) {
    console.error('Lỗi POST /api/feedback/client:', error);
    return res.status(500).json({ success: false, message: 'Lỗi gửi đánh giá.' });
  }
});

/**
 * @route   GET /api/feedback/client
 * @desc    Lấy danh sách đánh giá hệ thống
 */
router.get('/client', (req, res) => {
  try {
    const list = db.get('feedback');
    return res.json({
      success: true,
      feedbacks: list
    });
  } catch (error) {
    console.error('Lỗi GET /api/feedback/client:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tải đánh giá.' });
  }
});

/**
 * @route   POST /api/feedback/interview-share
 * @desc    Community Debrief & Bonus Credits: Chia sẻ câu hỏi phỏng vấn -> tự động cộng AI Credits
 * Body: { companyName, position, questionsEncountered, tips }
 */
router.post('/interview-share', optionalAuth, (req, res) => {
  try {
    const { companyName, position, questionsEncountered, tips } = req.body;

    if (!companyName || !questionsEncountered) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tên công ty và các câu hỏi phỏng vấn thực tế bạn đã gặp.'
      });
    }

    const newShare = {
      id: `is_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      companyName,
      position: position || 'UI/UX Designer',
      questionsEncountered,
      tips: tips || 'Nên chuẩn bị kỹ phần case study và các chỉ số đo lường hiệu quả thiết kế.',
      submittedBy: req.user?.id || 'anonymous',
      authorName: req.user?.username || 'Thành viên cộng đồng',
      createdAt: new Date().toISOString()
    };

    db.insert('interviewShares', newShare);

    // Tự động cộng thêm +5 AI Credits cho người dùng nếu đã đăng nhập
    let updatedCredits = null;
    if (req.user && req.user.id) {
      const user = UserModel.findById(req.user.id);
      if (user) {
        const nextCredits = (user.aiCredits || 0) + 5;
        UserModel.update(req.user.id, { aiCredits: nextCredits });
        updatedCredits = nextCredits;
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn đã chia sẻ trải nghiệm phỏng vấn! Hệ thống đã tự động cộng +5 AI Credits vào tài khoản.',
      bonusCredits: 5,
      currentCredits: updatedCredits,
      share: newShare
    });
  } catch (error) {
    console.error('Lỗi POST /api/feedback/interview-share:', error);
    return res.status(500).json({ success: false, message: 'Lỗi chia sẻ phỏng vấn.' });
  }
});

/**
 * @route   GET /api/feedback/interview-shares
 * @desc    Lấy danh sách chia sẻ kinh nghiệm phỏng vấn cộng đồng
 */
router.get('/interview-shares', (req, res) => {
  try {
    const list = db.get('interviewShares');
    return res.json({
      success: true,
      shares: list
    });
  } catch (error) {
    console.error('Lỗi GET /api/feedback/interview-shares:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tải chia sẻ phỏng vấn.' });
  }
});

module.exports = router;
