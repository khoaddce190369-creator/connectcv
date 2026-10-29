'use strict';
const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middlewares/authMiddleware');

/**
 * Trích xuất từ khóa ATS phổ biến từ văn bản JD
 */
function extractKeywordsFromJD(text = '') {
  const commonTech = [
    'Figma', 'UI/UX', 'Design System', 'Wireframing', 'Prototyping', 'Fintech',
    'Mobile App', 'Responsive Design', 'Illustrator', 'Photoshop', 'Typography',
    'Branding', 'User Research', 'Usability Testing', 'React', 'HTML/CSS',
    'Tailwind CSS', 'TypeScript', 'Agile', 'Scrum', 'Design Thinking'
  ];

  const found = [];
  const lower = text.toLowerCase();
  for (const tech of commonTech) {
    if (lower.includes(tech.toLowerCase())) {
      found.push(tech);
    }
  }
  return found.length > 0 ? found : ['UI/UX', 'Figma', 'Design System', 'Wireframing'];
}

/**
 * @route   POST /api/cv/tailor
 * @desc    Smart Resume Builder & ATS CV Optimizer
 * Input: Text mô tả công việc (jd) và Object Profile của ứng viên.
 */
router.post('/tailor', optionalAuth, async (req, res) => {
  try {
    const { jd, jdText, profile } = req.body;
    const jobDescription = jd || jdText;

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_JD',
        message: 'Vui lòng cung cấp nội dung bản mô tả công việc (JD).'
      });
    }

    const candidateProfile = profile || {
      fullName: 'Nguyễn Minh Tuấn',
      title: 'UI/UX Designer',
      summary: 'Designer có 3 năm kinh nghiệm trong thiết kế giao diện web và mobile.',
      skills: ['Figma', 'UI Design', 'Wireframing'],
      experience: [
        {
          company: 'Tech Startup',
          position: 'UI Designer',
          description: 'Thiết kế giao diện ứng dụng di động cho khách hàng.'
        }
      ]
    };

    // 1. Phân tích từ khóa ATS từ JD
    const jdKeywords = extractKeywordsFromJD(jobDescription);
    const candidateSkills = (candidateProfile.skills || []).map(s => String(s).toLowerCase());

    // 2. Tính toán missingKeywords & matchScore
    const matchedKeywords = [];
    const missingKeywords = [];

    jdKeywords.forEach(kw => {
      if (candidateSkills.some(cs => cs.includes(kw.toLowerCase()) || kw.toLowerCase().includes(cs))) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    // Điểm matchScore (thang 100)
    const baseScore = jdKeywords.length > 0 
      ? Math.round((matchedKeywords.length / jdKeywords.length) * 100)
      : 75;
    const matchScore = Math.min(98, Math.max(62, baseScore));

    // 3. Tự động viết lại Tóm tắt chuyên môn bám sát JD (Tailored Summary)
    const primarySkill = matchedKeywords[0] || 'UI/UX Design';
    const topKeywords = matchedKeywords.slice(0, 3).join(', ');
    const tailoredSummary = `${candidateProfile.fullName || 'Ứng viên'} là chuyên gia ${candidateProfile.title || 'Product Designer'} với năng lực vững chắc về ${topKeywords || primarySkill}. Có kinh nghiệm thực chiến trong việc chuẩn hóa quy trình thiết kế, tối ưu chỉ số chuyển đổi sản phẩm và phối hợp chặt chẽ với đội ngũ kỹ thuật theo chuẩn Agile. Định hướng đóng góp giá trị đột phá cho mục tiêu tăng trưởng của vị trí mục tiêu tại quý công ty.`;

    // 4. Tự động sinh các gạch đầu dòng mô tả kinh nghiệm chuẩn STAR bám sát JD
    const tailoredExperience = [
      `Dẫn dắt thiết kế giao diện và trải nghiệm người dùng với ${matchedKeywords.slice(0, 2).join(' & ') || 'Figma & Design System'}, giúp giảm 35% thời gian bàn giao dự án cho đội ngũ lập trình.`,
      `Áp dụng phương pháp nghiên cứu người dùng và tối ưu luồng thao tác (User Journey), gia tăng tỷ lệ kích hoạt tài khoản lên 28% trong vòng 3 tháng đầu triển khai.`,
      `Xây dựng và duy trì thư viện thành phần chuẩn hóa (Reusable Components), đảm bảo tính nhất quán trên cả nền tảng Web & Mobile theo các tiêu chí kiểm định chất lượng nghiêm ngặt.`
    ];

    return res.json({
      success: true,
      data: {
        matchScore,
        atsStatus: matchScore >= 80 ? 'Chuẩn ATS Tối Ưu' : 'Cần Bổ Sung Từ Khóa',
        matchedKeywords,
        missingKeywords,
        tailoredSummary,
        tailoredExperience,
        recommendations: [
          `Nên chèn thêm các từ khóa: ${missingKeywords.slice(0, 3).join(', ')} vào phần kỹ năng chuyên môn.`,
          'Bổ sung thêm các số liệu định lượng (%, doanh thu, lượt tải) vào phần kinh nghiệm làm việc.',
          'Đảm bảo định dạng xuất file PDF sử dụng font chữ chuẩn không chân để bộ quét ATS dễ bóc tách dữ liệu.'
        ]
      }
    });
  } catch (error) {
    console.error('Lỗi POST /api/cv/tailor:', error);
    return res.status(500).json({
      success: false,
      code: 'TAILOR_ERROR',
      message: 'Không thể phân tích tối ưu CV. Vui lòng thử lại.'
    });
  }
});

/**
 * @route   POST /api/cv/download-pdf
 * @desc    Tải file PDF CV chuẩn ATS
 */
router.post('/download-pdf', (req, res) => {
  try {
    const { cvData, htmlContent } = req.body;
    
    // Trả về tín hiệu thành công kèm cấu hình tải client-side an toàn hoặc stream
    return res.json({
      success: true,
      message: 'Sẵn sàng kết xuất PDF CV chuẩn ATS.',
      downloadMode: 'client_ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Lỗi POST /api/cv/download-pdf:', error);
    return res.status(500).json({ success: false, message: 'Lỗi xuất file PDF.' });
  }
});

/**
 * @route   GET /api/cv/templates
 * @desc    Danh sách mẫu CV chuẩn ATS từ thư mục assets
 */
router.get('/templates', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const templatesDir = path.join(__dirname, '../../../connectcv/assets/templates');
    const htmlDir = path.join(__dirname, '../../../connectcv/assets/template-library');
    
    let templateFiles = [];
    if (fs.existsSync(templatesDir)) {
      templateFiles = fs.readdirSync(templatesDir).filter(f => f.endsWith('.png'));
    }

    const availableHtmls = fs.existsSync(htmlDir)
      ? fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'))
      : [];

    const templates = templateFiles.map((file, idx) => {
      const baseName = file.replace(/\.png$/, '');
      const cleanName = baseName.replace(/^\d+_/, '').replace(/_/g, ' ');
      
      // Tìm file HTML tương ứng
      let matchedHtml = availableHtmls.find(h => h.replace(/\.html$/, '') === baseName);
      if (!matchedHtml) {
        matchedHtml = availableHtmls.find(h => h.includes(baseName) || baseName.includes(h.replace(/\.html$/, '')));
      }

      // Xác định style phong cách
      let style = 'Hiện Đại 2 Cột';
      if (baseName.toLowerCase().includes('harvard') || baseName.toLowerCase().includes('classic')) {
        style = 'Cổ Điển Harvard';
      } else if (baseName.toLowerCase().includes('minimal') || baseName.toLowerCase().includes('toi_gian')) {
        style = 'Tối Giản Chuẩn ATS';
      } else if (baseName.toLowerCase().includes('pro') || baseName.toLowerCase().includes('chuyen_nghiep')) {
        style = 'Chuyên Nghiệp';
      } else if (baseName.toLowerCase().includes('impressive') || baseName.toLowerCase().includes('an_tuong')) {
        style = 'Ấn Tượng Sáng Tạo';
      }

      return {
        id: baseName,
        index: idx,
        fileName: file,
        htmlFile: matchedHtml || null,
        imageUrl: `assets/templates/${file}`,
        name: cleanName.length > 30 ? cleanName.substring(0, 30) + '...' : cleanName,
        style
      };
    });

    return res.json({
      success: true,
      count: templates.length,
      templates
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh mục template.' });
  }
});

/**
 * @route   GET /api/cv/template/:id
 * @desc    Lấy nội dung HTML mẫu CV có thể chỉnh sửa trực tiếp (Live Editable)
 */
router.get('/template/:id', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const templateId = req.params.id;
    const htmlDir = path.join(__dirname, '../../../connectcv/assets/template-library');

    if (!fs.existsSync(htmlDir)) {
      return res.status(404).json({ success: false, message: 'Thư viện mẫu CV chưa sẵn sàng.' });
    }

    const availableHtmls = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));

    // Tìm file HTML tương ứng với templateId
    let targetFile = availableHtmls.find(h => h.replace(/\.html$/, '') === templateId);
    if (!targetFile) {
      targetFile = availableHtmls.find(h => h.includes(templateId) || templateId.includes(h.replace(/\.html$/, '')));
    }
    // Nếu vẫn không tìm thấy, fallback về mẫu tiêu chuẩn đầu tiên
    if (!targetFile && availableHtmls.length > 0) {
      targetFile = availableHtmls[0];
    }

    if (!targetFile) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mẫu CV này.' });
    }

    const filePath = path.join(htmlDir, targetFile);
    const rawContent = fs.readFileSync(filePath, 'utf8');

    // Bóc tách Style CSS
    let styleCss = '';
    const styleMatch = rawContent.match(/<style\b[^>]*>([\s\S]*?)<\/style>/i);
    if (styleMatch) {
      styleCss = styleMatch[1];
    }

    // Bóc tách khối nội dung CV (thẻ .cv-page-container hoặc body)
    let cvHtml = '';
    const containerMatch = rawContent.match(/<div[^>]*class=["'][^"']*cv-page-container[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*(?:<script|$)/i);
    if (containerMatch) {
      cvHtml = containerMatch[1];
    } else {
      const bodyMatch = rawContent.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
      cvHtml = bodyMatch ? bodyMatch[1] : rawContent;
    }

    // Loại bỏ thanh toolbar nếu có trong template
    cvHtml = cvHtml.replace(/<div\b[^>]*class=["'][^"']*cv-toolbar[^"']*["'][\s\S]*?<\/div>/gi, '');
    cvHtml = cvHtml.replace(/<script\b[\s\S]*?<\/script>/gi, '');

    // Đảm bảo các trường tiêu đề và nội dung đều có thuộc tính contenteditable="true"
    cvHtml = cvHtml.replace(/<([a-z0-9]+)([^>]*?)contenteditable=["']false["']([^>]*?)>/gi, '<$1$2contenteditable="true"$3>');

    // Gán contenteditable cho các thẻ tiêu biểu nếu chưa có
    cvHtml = cvHtml.replace(/<(h[1-6]|p|li|span\b(?![^>]*contenteditable))([^>]*?)>/gi, (match, tag, rest) => {
      if (rest.includes('contenteditable')) return match;
      return `<${tag}${rest} contenteditable="true">`;
    });

    return res.json({
      success: true,
      templateId,
      fileName: targetFile,
      styleCss,
      cvHtml
    });
  } catch (err) {
    console.error('Lỗi GET /api/cv/template/:id:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải mẫu CV.' });
  }
});

module.exports = router;
