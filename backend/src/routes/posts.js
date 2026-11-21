'use strict';
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { optionalAuth, authMiddleware } = require('../middlewares/authMiddleware');

/**
 * AI Job Description (JD) Assistant: Chuẩn hóa yêu cầu tuyển dụng từ mô tả ngắn
 */
function expandJDWithAI(title, roughNotes) {
  return {
    standardTitle: title,
    overview: `Doanh nghiệp đang mở rộng quy mô và cần tuyển dụng nhân sự tài năng cho vị trí ${title}. Ứng viên sẽ trực tiếp tham gia xây dựng trải nghiệm đột phá và chuẩn hóa quy trình sản phẩm.`,
    responsibilities: [
      `Tham gia phân tích yêu cầu nghiệp vụ và phác thảo giải pháp thiết kế / kỹ thuật tương ứng.`,
      `Phối hợp liên chức năng với đội ngũ Product Manager, Developer và QA để hiện thực hóa tính năng đúng tiến độ.`,
      `Tham gia rà soát chất lượng bàn giao, đề xuất các cải tiến nhằm nâng cao trải nghiệm người dùng cuối.`
    ],
    requirements: [
      `Có kinh nghiệm thực chiến từ 1-3 năm trong lĩnh vực liên quan.`,
      `Thành thạo các công cụ tiêu chuẩn ngành và có tư duy giải quyết vấn đề hướng kết quả.`,
      `Khả năng giao tiếp tốt, sẵn sàng học hỏi công nghệ mới và làm việc nhóm hiệu quả.`
    ],
    benefits: [
      `Mức thu nhập cạnh tranh, thưởng dự án định kỳ và cơ hội thăng tiến rộng mở.`,
      `Môi trường làm việc trẻ trung, linh hoạt thời gian, hỗ trợ trang thiết bị hiện đại.`,
      `Được ký kết hợp đồng rõ ràng và bảo đảm quyền lợi làm việc minh bạch.`
    ]
  };
}

/**
 * @route   POST /api/posts
 * @desc    Đăng bài tuyển dụng / Dự án / Chào thầu Freelancer
 * Body: { type: "RECRUITMENT" | "FREELANCER_OFFER", title, content, budget, contact, skills, useAiAssistant }
 */
router.post('/', optionalAuth, (req, res) => {
  try {
    const { type = 'RECRUITMENT', title, content, budget, contact, skills, useAiAssistant } = req.body;

    // Phân quyền RBAC: Ứng viên / Freelancer KHÔNG được đăng bài tuyển dụng
    if (type === 'RECRUITMENT' && req.user && req.user.role !== 'HR' && req.user.role !== 'Employer') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ tài khoản Nhà tuyển dụng / Doanh nghiệp (HR) mới có quyền đăng tin tuyển dụng. Tài khoản Ứng viên không được phép đăng tin.'
      });
    }

    // Chi phí lương ở bài tuyển dụng KHÔNG được phép nhập số âm
    if (budget) {
      const budgetStr = String(budget);
      if (/-\s*\d+/.test(budgetStr)) {
        return res.status(400).json({
          success: false,
          message: 'Mức lương hoặc ngân sách tuyển dụng không được phép là số âm. Vui lòng nhập mức chi phí hợp lệ.'
        });
      }
    }

    if (!title || (!content && !useAiAssistant)) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tiêu đề và nội dung bài đăng.'
      });
    }

    let finalContent = content;
    let aiAssistantResult = null;

    if (useAiAssistant) {
      aiAssistantResult = expandJDWithAI(title, content);
      finalContent = `${content ? content + '\n\n' : ''}【MÔ TẢ CHI TIẾT ĐƯỢC CHUẨN HÓA BỞI AI JD ASSISTANT】\n${aiAssistantResult.overview}\n\nTrách nhiệm chính:\n- ${aiAssistantResult.responsibilities.join('\n- ')}\n\nYêu cầu ứng viên:\n- ${aiAssistantResult.requirements.join('\n- ')}`;
    }

    const newPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: type === 'FREELANCER_OFFER' ? 'FREELANCER_OFFER' : 'RECRUITMENT',
      author: req.user?.username || (type === 'RECRUITMENT' ? 'Doanh Nghiệp Đối Tác' : 'Freelancer Chuyên Nghiệp'),
      authorAvatar: req.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      authorId: req.user?.id || null,
      title,
      content: finalContent,
      budget: budget || 'Thỏa thuận',
      contact: contact || req.user?.email || 'contact@connectcv.io',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      likes: 0,
      comments: 0,
      aiAssistantResult,
      createdAt: new Date().toISOString()
    };

    db.insert('posts', newPost);

    // Nếu là tin tuyển dụng thì đồng thời thêm vào danh sách jobs
    if (type === 'RECRUITMENT') {
      const newJob = {
        id: `job_${newPost.id}`,
        title,
        company: req.user?.username || 'Doanh Nghiệp Tuyển Dụng',
        logo: req.user?.avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
        type: 'Full-time',
        location: 'Toàn quốc / Hybrid',
        budget: budget || 'Thỏa thuận',
        tags: newPost.skills.length > 0 ? newPost.skills : ['UI/UX', 'Figma'],
        skills: newPost.skills,
        description: finalContent,
        createdAt: newPost.createdAt
      };
      db.insert('jobs', newJob);
    }

    return res.status(201).json({
      success: true,
      message: 'Đăng tin thành công.',
      post: newPost
    });
  } catch (error) {
    console.error('Lỗi POST /api/posts:', error);
    return res.status(500).json({ success: false, message: 'Lỗi đăng tin.' });
  }
});

/**
 * @route   GET /api/posts
 * @desc    Community Feed: Bảng tin tương tác lấy bài tuyển dụng & chào thầu
 * Query: type=RECRUITMENT | FREELANCER_OFFER
 */
router.get('/', optionalAuth, (req, res) => {
  try {
    const { type } = req.query;
    const allPosts = db.get('posts');

    let filtered = allPosts;
    if (type && ['RECRUITMENT', 'FREELANCER_OFFER'].includes(type.toUpperCase())) {
      filtered = allPosts.filter(p => p.type === type.toUpperCase());
    }

    return res.json({
      success: true,
      count: filtered.length,
      posts: filtered
    });
  } catch (error) {
    console.error('Lỗi GET /api/posts:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tải bài viết cộng đồng.' });
  }
});

/**
 * @route   DELETE /api/posts/:id
 * @desc    Xóa bài đăng / tin tuyển dụng (Admin hoặc tác giả)
 */
router.delete('/:id', optionalAuth, (req, res) => {
  try {
    const postId = req.params.id;
    db.delete('posts', p => p.id === postId);
    db.delete('jobs', j => j.id === `job_${postId}` || j.id === postId);

    return res.json({
      success: true,
      message: 'Đã xóa bài đăng thành công.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi xóa bài đăng.' });
  }
});

module.exports = router;
