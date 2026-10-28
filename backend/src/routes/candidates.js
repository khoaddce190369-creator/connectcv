'use strict';
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { optionalAuth, authMiddleware } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/filter/candidates
 * @desc    Talent Sourcing: Lọc ứng viên theo năm kinh nghiệm & danh sách kỹ năng
 * Body: { minExperienceYears, skills: [] }
 */
router.post('/filter/candidates', optionalAuth, (req, res) => {
  try {
    const { minExperienceYears = 0, skills = [] } = req.body;
    const allCandidates = db.get('candidates');

    const filtered = allCandidates.filter(c => {
      // 1. Kiểm tra năm kinh nghiệm tối thiểu
      if (minExperienceYears && c.experienceYears < parseInt(minExperienceYears)) {
        return false;
      }

      // 2. Kiểm tra kỹ năng bắt buộc
      if (skills && skills.length > 0) {
        const cSkills = (c.skills || []).map(s => String(s).toLowerCase());
        const matchedSkill = skills.some(reqSkill => 
          cSkills.some(cs => cs.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(cs))
        );
        if (!matchedSkill) return false;
      }

      return true;
    });

    // Tính điểm % Match tương thích
    const reqSkills = skills.length > 0 ? skills : ['Figma', 'Design System'];
    const enriched = filtered.map(c => {
      const cSkills = (c.skills || []).map(s => String(s).toLowerCase());
      let hit = 0;
      reqSkills.forEach(rs => {
        if (cSkills.some(cs => cs.includes(rs.toLowerCase()))) hit++;
      });
      const matchScore = Math.min(97, Math.max(70, Math.round((hit / Math.max(1, reqSkills.length)) * 100)));

      return {
        ...c,
        matchScore
      };
    });

    return res.json({
      success: true,
      count: enriched.length,
      candidates: enriched
    });
  } catch (error) {
    console.error('Lỗi POST /api/filter/candidates:', error);
    return res.status(500).json({ success: false, message: 'Lỗi lọc danh sách ứng viên.' });
  }
});

/**
 * @route   GET /api/applications
 * @desc    Recruiter Portal: Thống kê & Danh sách ứng viên cho Kanban Pipeline
 */
router.get('/applications', optionalAuth, (req, res) => {
  try {
    const { jobId } = req.query;
    const allApplications = db.get('applications');

    let list = allApplications;
    if (jobId) {
      list = allApplications.filter(a => a.jobId === jobId);
    }

    // Thống kê số lượng hồ sơ theo từng cột Kanban
    const stats = {
      total: list.length,
      applied: list.filter(a => a.status === 'Applied').length,
      shortlisted: list.filter(a => a.status === 'Shortlisted').length,
      interview: list.filter(a => a.status === 'Interview').length,
      hired: list.filter(a => a.status === 'Hired').length,
      rejected: list.filter(a => a.status === 'Rejected').length
    };

    return res.json({
      success: true,
      stats,
      applications: list
    });
  } catch (error) {
    console.error('Lỗi GET /api/applications:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách hồ sơ ứng tuyển.' });
  }
});

/**
 * @route   POST /api/applications/status
 * @desc    Kanban Pipeline: Cập nhật trạng thái kéo-thả của hồ sơ ứng viên
 * Body: { applicationId, newStatus: "Applied" | "Shortlisted" | "Interview" | "Hired" | "Rejected" }
 */
router.post('/applications/status', optionalAuth, (req, res) => {
  try {
    const { applicationId, newStatus } = req.body;
    const validStatuses = ['Applied', 'Shortlisted', 'Interview', 'Hired', 'Rejected'];

    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái không hợp lệ. Phải thuộc: ${validStatuses.join(', ')}`
      });
    }

    const updated = db.update('applications', a => a.id === applicationId, {
      status: newStatus,
      updatedAt: new Date().toISOString()
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ ứng tuyển.' });
    }

    return res.json({
      success: true,
      message: `Đã chuyển trạng thái sang "${newStatus}" thành công.`,
      application: updated
    });
  } catch (error) {
    console.error('Lỗi POST /api/applications/status:', error);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái Kanban.' });
  }
});

/**
 * @route   POST /api/applications/apply
 * @desc    Ứng viên nộp hồ sơ vào tin tuyển dụng
 */
router.post('/applications/apply', optionalAuth, (req, res) => {
  try {
    // Phân quyền RBAC: Nhà tuyển dụng KHÔNG được nộp đơn ứng tuyển
    if (req.user && (req.user.role === 'HR' || req.user.role === 'Employer')) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản Nhà tuyển dụng / Doanh nghiệp không thể nộp hồ sơ ứng tuyển việc làm. Vui lòng sử dụng tài khoản Ứng viên.'
      });
    }

    const { jobId, jobTitle, candidateName, candidateEmail, portfolioUrl, matchScore } = req.body;

    const newApp = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      candidateName: candidateName || req.user?.username || 'Ứng viên ConnectCV',
      candidateEmail: candidateEmail || req.user?.email || 'ungvien@email.com',
      candidateAvatar: req.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      jobId: jobId || 'job_1',
      jobTitle: jobTitle || 'Vị trí Thiết kế Sáng tạo',
      status: 'Applied',
      matchScore: matchScore || 88,
      portfolioUrl: portfolioUrl || '/freelancer-profile.html',
      appliedAt: new Date().toISOString()
    };

    db.insert('applications', newApp);

    return res.status(201).json({
      success: true,
      message: 'Nộp hồ sơ ứng tuyển thành công!',
      application: newApp
    });
  } catch (error) {
    console.error('Lỗi POST /api/applications/apply:', error);
    return res.status(500).json({ success: false, message: 'Lỗi nộp hồ sơ.' });
  }
});

module.exports = router;
