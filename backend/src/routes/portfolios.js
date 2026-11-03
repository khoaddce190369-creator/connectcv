'use strict';
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { optionalAuth } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/portfolios
 * @desc    Lấy danh sách dự án cho Visual Portfolio Showcase (Waterfall Grid)
 */
router.get('/', optionalAuth, (req, res) => {
  try {
    const list = db.get('portfolios') || [];
    return res.json({
      success: true,
      count: list.length,
      portfolios: list
    });
  } catch (error) {
    console.error('Lỗi GET /api/portfolios:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách portfolio.' });
  }
});

/**
 * @route   GET /api/portfolios/by-subdomain/:subdomain
 * @desc    Lấy hồ sơ cá nhân và các dự án của ứng viên dựa theo Subdomain public
 */
router.get('/by-subdomain/:subdomain', optionalAuth, (req, res) => {
  try {
    const subdomain = String(req.params.subdomain || '').toLowerCase().trim();
    const allPortfolios = db.get('portfolios') || [];
    const allCandidates = db.get('candidates') || [];

    // Tìm dự án khớp subdomain
    const userProjects = allPortfolios.filter(p => (p.subdomain || '').toLowerCase() === subdomain);

    // Tìm candidate tương ứng nếu có
    const candidate = allCandidates.find(c => 
      (c.subdomain && c.subdomain.toLowerCase() === subdomain) ||
      (c.name && c.name.toLowerCase().replace(/[^a-z0-9]/g, '-').includes(subdomain))
    );

    const firstProject = userProjects[0];
    const authorName = firstProject ? firstProject.author : (candidate ? candidate.name : subdomain.replace(/-/g, ' ').toUpperCase());
    const authorRole = firstProject ? firstProject.authorRole : (candidate ? (candidate.role || 'Chuyên viên Freelancer') : 'Creative Designer & Developer');
    const authorAvatar = firstProject ? firstProject.authorAvatar : (candidate ? candidate.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop');

    const profile = {
      subdomain,
      name: authorName,
      role: authorRole,
      avatar: authorAvatar,
      bio: candidate ? candidate.bio : (firstProject ? firstProject.description : 'Chuyên gia giàu kinh nghiệm thực chiến trên nền tảng ConnectCV.'),
      skills: candidate ? candidate.skills : (firstProject ? firstProject.tags : ['Design', 'Frontend', 'Creative']),
      rating: candidate ? candidate.rating : 4.9,
      experienceYears: candidate ? candidate.experienceYears : 3,
      verified: true,
      publicUrl: `https://connectcv.vn/p/${subdomain}`
    };

    return res.json({
      success: true,
      profile,
      projects: userProjects.length > 0 ? userProjects : (firstProject ? [firstProject] : allPortfolios.slice(0, 2))
    });
  } catch (error) {
    console.error('Lỗi GET /api/portfolios/by-subdomain:', error);
    return res.status(500).json({ success: false, message: 'Lỗi truy xuất public portfolio theo subdomain.' });
  }
});

/**
 * @route   GET /api/portfolios/my
 * @desc    Lấy danh sách dự án portfolio của chính ứng viên hiện tại
 */
router.get('/my', optionalAuth, (req, res) => {
  try {
    const list = db.get('portfolios') || [];
    const userId = req.user?.id || req.query.userId;
    const username = req.user?.username || req.query.username;
    const subdomain = req.user?.subdomain || req.query.subdomain;
    const author = req.query.author;

    let userPortfolios = [];
    if (userId || username || subdomain || author) {
      userPortfolios = list.filter(p => 
        (userId && p.authorId === userId) ||
        (author && p.author && p.author.toLowerCase().includes(author.toLowerCase())) ||
        (username && p.author && p.author.toLowerCase() === username.toLowerCase()) ||
        (subdomain && p.subdomain && p.subdomain.toLowerCase() === subdomain.toLowerCase())
      );
    }
    // Nếu chưa có dự án cá nhân, trả về rỗng để hiển thị empty state
    return res.json({
      success: true,
      count: userPortfolios.length,
      portfolios: userPortfolios
    });
  } catch (error) {
    console.error('Lỗi GET /api/portfolios/my:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tải portfolio cá nhân.' });
  }
});

/**
 * @route   GET /api/portfolios/:id
 * @desc    Xem chi tiết dự án trong Modal hoặc trang tĩnh riêng biệt
 */
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const list = db.get('portfolios') || [];
    const item = list.find(p => p.id === req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dự án portfolio.' });
    }

    return res.json({
      success: true,
      portfolio: item
    });
  } catch (error) {
    console.error('Lỗi GET /api/portfolios/:id:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tải chi tiết portfolio.' });
  }
});

/**
 * @route   POST /api/portfolios
 * @desc    Tạo hoặc thêm dự án mới vào Portfolio kèm Subdomain Public
 */
router.post('/', optionalAuth, (req, res) => {
  try {
    // Phân quyền RBAC: Nhà tuyển dụng KHÔNG được tạo portfolio ứng viên
    if (req.user && (req.user.role === 'HR' || req.user.role === 'Employer')) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản Nhà tuyển dụng / Doanh nghiệp không thể tạo Portfolio ứng viên. Vui lòng sử dụng tài khoản Ứng viên / Freelancer.'
      });
    }

    const { 
      title, 
      subdomain, 
      author, 
      authorRole, 
      authorAvatar, 
      image, 
      tags, 
      budget, 
      duration, 
      description 
    } = req.body;

    if (!title || !image) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tiêu đề và ảnh bìa dự án.'
      });
    }

    // Chuẩn hóa subdomain (VD: "an-nguyen")
    const cleanSubdomain = (subdomain || (author ? author.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'creator'))
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');

    const newPortfolio = {
      id: `pf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      subdomain: cleanSubdomain,
      author: author || (req.user && req.user.username) || 'ConnectCV Creator',
      authorAvatar: authorAvatar || (req.user && req.user.avatar) || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      authorRole: authorRole || (req.user && req.user.title) || 'Product Designer & Freelancer',
      authorId: req.user ? req.user.id : `usr_${Date.now()}`,
      image,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : ['Design', 'UI/UX']),
      budget: budget || '$2,000 USD',
      duration: duration || '3 tuần',
      likes: 1,
      description: description || 'Dự án hoàn thiện chuyên nghiệp, minh họa năng lực thiết kế thực chiến.',
      createdAt: new Date().toISOString()
    };

    db.insert('portfolios', newPortfolio);

    return res.status(201).json({
      success: true,
      message: 'Tạo dự án và thiết lập subdomain công khai thành công.',
      subdomain: cleanSubdomain,
      publicUrl: `/p/${cleanSubdomain}`,
      portfolio: newPortfolio
    });
  } catch (error) {
    console.error('Lỗi POST /api/portfolios:', error);
    return res.status(500).json({ success: false, message: 'Lỗi thêm dự án vào portfolio.' });
  }
});

/**
 * @route   DELETE /api/portfolios/:id
 * @desc    Xóa một dự án khỏi portfolio
 */
router.delete('/:id', optionalAuth, (req, res) => {
  try {
    const list = db.get('portfolios') || [];
    const index = list.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dự án portfolio.' });
    }
    list.splice(index, 1);
    db.saveData();
    return res.json({ success: true, message: 'Đã xóa dự án portfolio thành công.' });
  } catch (error) {
    console.error('Lỗi DELETE /api/portfolios/:id:', error);
    return res.status(500).json({ success: false, message: 'Lỗi xóa dự án.' });
  }
});

module.exports = router;
