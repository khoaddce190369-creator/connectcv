'use strict';
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { optionalAuth } = require('../middlewares/authMiddleware');

/**
 * Tính % Match giữa tin tuyển dụng và hồ sơ ứng viên
 */
function calculateJobMatch(job, userSkills = []) {
  if (!userSkills || userSkills.length === 0) return 82; // Mặc định hiển thị điểm chuẩn
  const jobSkills = (job.skills || job.tags || []).map(s => String(s).toLowerCase());
  const userSkillSet = userSkills.map(s => String(s).toLowerCase());

  let matched = 0;
  jobSkills.forEach(js => {
    if (userSkillSet.some(us => us.includes(js) || js.includes(us))) {
      matched++;
    }
  });

  const percentage = Math.round((matched / Math.max(1, jobSkills.length)) * 100);
  return Math.min(96, Math.max(65, percentage));
}

/**
 * @route   GET /api/jobs and GET /api/jobs/search
 * @desc    Tìm kiếm việc làm & dự án có phân trang
 * Query: keyword, location, page, limit
 */
const handleSearch = (req, res) => {
  try {
    const { keyword = '', location = '', page = 1, limit = 10 } = req.query;
    const allJobs = db.get('jobs');

    const kw = String(keyword).toLowerCase().trim();
    const loc = String(location).toLowerCase().trim();

    const filtered = allJobs.filter(j => {
      const matchKw = !kw || 
        j.title.toLowerCase().includes(kw) || 
        j.description.toLowerCase().includes(kw) ||
        (j.tags && j.tags.some(t => t.toLowerCase().includes(kw))) ||
        (j.skills && j.skills.some(s => s.toLowerCase().includes(kw)));
      
      const matchLoc = !loc || (j.location && j.location.toLowerCase().includes(loc));
      return matchKw && matchLoc;
    });

    const userSkills = req.user?.skills || ['Figma', 'UI/UX', 'Design System'];
    const jobsWithMatch = filtered.map(j => ({
      ...j,
      matchScore: calculateJobMatch(j, userSkills)
    }));

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginated = jobsWithMatch.slice(startIndex, startIndex + parseInt(limit));

    return res.json({
      success: true,
      total: filtered.length,
      page: parseInt(page),
      totalPages: Math.ceil(filtered.length / parseInt(limit)),
      jobs: paginated
    });
  } catch (error) {
    console.error('Lỗi GET /api/jobs/search:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tìm kiếm việc làm.' });
  }
};

router.get('/', optionalAuth, handleSearch);
router.get('/search', optionalAuth, handleSearch);

/**
 * @route   POST /api/filter/jobs
 * @desc    Bộ lọc việc làm đa tiêu chí: Freelance/Full-time, minBudget, tags công nghệ
 * Body: { type, minBudget, tags: [], userProfile }
 */
router.post('/filter', optionalAuth, (req, res) => {
  try {
    const { type, minBudget, tags = [], userProfile } = req.body;
    const allJobs = db.get('jobs');

    const filtered = allJobs.filter(j => {
      // Lọc theo loại hình (Freelance / Full-time)
      if (type && type !== 'all' && j.type.toLowerCase() !== type.toLowerCase()) {
        return false;
      }

      // Lọc theo ngân sách tối thiểu
      if (minBudget && j.minBudget && j.minBudget < parseInt(minBudget)) {
        return false;
      }

      // Lọc theo tags công nghệ
      if (tags && tags.length > 0) {
        const jTags = (j.tags || []).map(t => t.toLowerCase());
        const hasTag = tags.some(t => jTags.includes(t.toLowerCase()));
        if (!hasTag) return false;
      }

      return true;
    });

    const userSkills = userProfile?.skills || req.user?.skills || ['Figma', 'UI/UX'];
    const enriched = filtered.map(j => ({
      ...j,
      matchScore: calculateJobMatch(j, userSkills)
    }));

    return res.json({
      success: true,
      count: enriched.length,
      jobs: enriched
    });
  } catch (error) {
    console.error('Lỗi POST /api/filter/jobs:', error);
    return res.status(500).json({ success: false, message: 'Lỗi lọc tin tuyển dụng.' });
  }
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Lấy chi tiết công việc
 */
router.get('/:id', optionalAuth, (req, res) => {
  const allJobs = db.get('jobs');
  const job = allJobs.find(j => j.id === req.params.id);

  if (!job) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy công việc.' });
  }

  const userSkills = req.user?.skills || ['Figma', 'Design System'];
  return res.json({
    success: true,
    job: {
      ...job,
      matchScore: calculateJobMatch(job, userSkills)
    }
  });
});

module.exports = router;
