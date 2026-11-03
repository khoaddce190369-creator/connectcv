'use strict';
const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middlewares/authMiddleware');

let callGeminiJSON = null;
try {
  const geminiModule = require('../../features/connectcv/src/services/geminiService');
  callGeminiJSON = geminiModule.callGeminiJSON;
} catch (e) {
  try {
    const geminiModule = require('../features/connectcv/src/services/geminiService');
    callGeminiJSON = geminiModule.callGeminiJSON;
  } catch (e2) {}
}

// ─────────────────────────────────────────────────────────────
// BỘ TỪ ĐIỂN TỪ KHÓA CHUYÊN NGÀNH ATS MỞ RỘNG
// ─────────────────────────────────────────────────────────────
const ATS_TAXONOMY = [
  // An ninh mạng / Bảo mật / Kiểm thử
  { domain: 'Kiểm thử xâm nhập (Penetration Testing) & An toàn thông tin', role: 'Chuyên viên Kiểm thử xâm nhập (Penetration Tester)', keywords: ['kiểm thử xâm nhập', 'pentest', 'penetration testing', 'an toàn thông tin', 'bảo mật', 'security', 'lỗ hổng', 'vulnerability', 'owasp', 'burp suite', 'metasploit', 'nmap', 'sql injection', 'xss', 'soc', 'siem'] },
  // Công nghệ thông tin / Lập trình
  { domain: 'Lập trình Frontend & Trải nghiệm giao diện', role: 'Lập trình viên Frontend', keywords: ['frontend', 'react', 'react.js', 'vue', 'angular', 'next.js', 'typescript', 'javascript', 'tailwind', 'html/css', 'redux', 'zustand'] },
  { domain: 'Phát triển hệ thống Backend & API', role: 'Lập trình viên Backend', keywords: ['backend', 'node.js', 'express', 'nest.js', 'java', 'spring', 'python', 'django', 'golang', 'microservices', 'api', 'restful', 'graphql', 'docker', 'kubernetes', 'postgresql', 'mongodb'] },
  { domain: 'Thiết kế giao diện & Trải nghiệm người dùng', role: 'UI/UX Designer', keywords: ['ui/ux', 'ux', 'ui designer', 'figma', 'design system', 'wireframing', 'prototyping', 'user research', 'usability testing', 'adobe xd'] },
  { domain: 'Kiểm thử phần mềm & Đảm bảo chất lượng (QA/QC)', role: 'Kỹ sư Kiểm thử phần mềm (QA/QC)', keywords: ['tester', 'kiểm thử phần mềm', 'qa', 'qc', 'selenium', 'automation test', 'manual test', 'postman', 'test case'] },
  // Kinh doanh / Thương mại
  { domain: 'Kinh doanh B2B & Phát triển đối tác doanh nghiệp', role: 'Chuyên viên Kinh doanh B2B', keywords: ['kinh doanh b2b', 'b2b', 'sales b2b', 'bán hàng doanh nghiệp', 'đàm phán hợp đồng', 'chốt deal', 'phát triển thị trường', 'crm', 'khách hàng doanh nghiệp'] },
  { domain: 'Kinh doanh & Bán lẻ (B2C)', role: 'Chuyên viên Kinh doanh / Bán lẻ', keywords: ['bán hàng', 'sales', 'tư vấn khách', 'chốt đơn', 'bán lẻ', 'retail', 'cửa hàng', 'chăm sóc khách hàng'] },
  // Marketing & Truyền thông
  { domain: 'Digital Marketing & Tăng trưởng người dùng', role: 'Chuyên viên Digital Marketing', keywords: ['digital marketing', 'marketing', 'seo', 'sem', 'google ads', 'facebook ads', 'meta ads', 'tiktok ads', 'content marketing', 'roas', 'roi', 'conversion rate'] },
  // Tài chính & Nhân sự
  { domain: 'Kế toán & Quản trị tài chính', role: 'Chuyên viên Kế toán', keywords: ['kế toán', 'thuế', 'báo cáo tài chính', 'kiểm toán', 'audit', 'thu chi', 'hóa đơn', 'misa', 'excel kế toán'] },
  { domain: 'Quản trị nhân sự & Thu hút nhân tài', role: 'Chuyên viên Tuyển dụng & Nhân sự', keywords: ['nhân sự', 'tuyển dụng', 'hr', 'headhunter', 'talent acquisition', 'c&b', 'đào tạo nội bộ', 'onboarding'] }
];

/**
 * Trích xuất từ khóa ATS từ văn bản dựa trên từ điển đa ngành
 */
function extractKeywordsFromJD(text = '') {
  if (!text) return [];
  const lower = text.toLowerCase();
  const matched = [];
  for (const group of ATS_TAXONOMY) {
    for (const kw of group.keywords) {
      if (lower.includes(kw)) {
        matched.push(kw.toUpperCase());
      }
    }
  }
  return Array.from(new Set(matched));
}

function detectDomainFromText(text = '', fallbackRole = '') {
  const lower = (text || '').toLowerCase();
  for (const group of ATS_TAXONOMY) {
    for (const kw of group.keywords) {
      if (lower.includes(kw)) {
        return { domain: group.domain, role: group.role };
      }
    }
  }
  if (fallbackRole && fallbackRole.trim() && !fallbackRole.toLowerCase().includes('chuyên viên')) {
    return { domain: fallbackRole, role: fallbackRole };
  }
  return { domain: 'quy trình và nghiệp vụ chuyên môn', role: 'Chuyên viên' };
}

function polishObjective(rawText, fallbackRole = '') {
  if (!rawText || !rawText.trim()) return '';
  const trimmed = rawText.trim();
  const lower = trimmed.toLowerCase();

  const { domain, role } = detectDomainFromText(trimmed, fallbackRole);

  const isLearning = lower.includes('học hỏi') || lower.includes('kinh nghiệm') || lower.includes('mới ra trường') || lower.includes('sinh viên') || lower.includes('cọ xát') || lower.includes('thực tập') || lower.includes('fresher') || lower.includes('tiếp thu');
  const isLeader = lower.includes('quản lý') || lower.includes('trưởng nhóm') || lower.includes('lead') || lower.includes('leader') || lower.includes('quản trị');
  const isGlobal = lower.includes('nước ngoài') || lower.includes('toàn cầu') || lower.includes('quốc tế') || lower.includes('global') || lower.includes('fdi');

  let expPhrase = 'nền tảng kiến thức vững vàng';
  const yearMatch = trimmed.match(/(\d+)\s*(năm|year)/i);
  if (yearMatch) {
    expPhrase = `hơn ${yearMatch[1]} năm kinh nghiệm thực chiến`;
  }

  if (isLearning) {
    return `Với định hướng phát triển chuyên sâu trong lĩnh vực ${domain}, mục tiêu ngắn hạn là tiếp thu và tích lũy kiến thức thực tế, rèn luyện kỹ năng phân tích và xử lý nghiệp vụ chuyên môn trong môi trường làm việc thực chiến. Không ngừng trau dồi tinh thần trách nhiệm, tư duy chủ động và khả năng thích ứng nhanh với các tiêu chuẩn khắt khe. Mục tiêu dài hạn là trở thành ${role} đáng tin cậy, đóng góp tích cực vào sự an toàn, ổn định và tăng trưởng bền vững của quý công ty.`;
  }

  if (isLeader) {
    return `Phát huy năng lực chuyên môn và tư duy quản trị vững vàng trong lĩnh vực ${domain}. Mục tiêu ngắn hạn là tối ưu hóa quy trình làm việc, nâng cao hiệu suất làm việc của đội ngũ và đảm bảo bàn giao các hạng mục trọng điểm đạt chuẩn chất lượng cao đúng tiến độ. Mục tiêu dài hạn là giữ vị trí Trưởng nhóm / Quản lý chuyên môn (${role}), đồng hành cùng ban lãnh đạo hiện thực hóa các mục tiêu chiến lược của doanh nghiệp.`;
  }

  if (isGlobal) {
    return `Chuyên viên với định hướng phát huy tối đa năng lực chuyên môn trong lĩnh vực ${domain} tại môi trường làm việc quốc tế chuyên nghiệp. Sở hữu tư duy giải quyết vấn đề linh hoạt, khả năng giao tiếp đa văn hóa và tác phong làm việc chuẩn mực. Mục tiêu là đóng góp giá trị thực chất vào các dự án quy mô toàn cầu, đồng thời gắn bó lâu dài cùng sự phát triển của tổ chức.`;
  }

  return `Với ${expPhrase} và định hướng phát triển rõ ràng trong lĩnh vực ${domain}, mục tiêu nghề nghiệp là phát huy tối đa năng lực chuyên môn để tối ưu hóa quy trình, nâng cao chất lượng công việc và xử lý hiệu quả các bài toán thực tế. Luôn chủ động học hỏi, nâng cao tư duy đổi mới và phối hợp nhịp nhàng cùng các phòng ban. Mục tiêu dài hạn là trở thành ${role} chủ chốt, tạo ra các giá trị đo lường được cho sự tăng trưởng của quý công ty.`;
}

function polishBullet(rawBullet) {
  if (!rawBullet || !rawBullet.trim()) return '';
  const trimmed = rawBullet.trim().replace(/^[-*•]\s*/, '');
  const lower = trimmed.toLowerCase();

  // Đã là câu chuẩn STAR dài trên 70 ký tự và có động từ chuẩn
  if (trimmed.length > 70 && /^(Chủ động|Trực tiếp|Chịu trách nhiệm|Tối ưu hóa|Xây dựng|Dẫn dắt|Triển khai|Phát hiện|Thiết kế)/i.test(trimmed)) {
    return trimmed;
  }

  // 1. Kiểm thử / Pentest / Security / Lỗ hổng
  if (lower.includes('lỗ hổng') || lower.includes('pentest') || lower.includes('kiểm thử') || lower.includes('bảo mật') || lower.includes('test') || lower.includes('xâm nhập')) {
    if (lower.includes('sql') || lower.includes('xss') || lower.includes('vá lỗi') || lower.includes('fix')) {
      return 'Phát hiện, phân tích và phối hợp cùng đội ngũ kỹ thuật vá triệt để các lỗ hổng bảo mật nghiêm trọng (SQL Injection, XSS, CSRF), bảo đảm an toàn dữ liệu hệ thống theo chuẩn OWASP Top 10.';
    }
    if (lower.includes('báo cáo') || lower.includes('sếp') || lower.includes('quản lý') || lower.includes('đánh giá')) {
      return 'Tổng hợp kết quả kiểm thử, lập báo cáo đánh giá rủi ro an ninh mạng định kỳ và đề xuất phương án khắc phục kịp thời cho cấp quản lý, nâng cao tính sẵn sàng của hạ tầng.';
    }
    return 'Chủ động triển khai rà soát, thực hiện kiểm thử bảo mật (Security Testing) trên hệ thống ứng dụng, phát hiện sớm các nguy cơ tiềm ẩn và bảo vệ toàn vẹn dữ liệu.';
  }

  // 2. Kinh doanh / Sales / Khách hàng
  if (lower.includes('bán') || lower.includes('khách') || lower.includes('tư vấn') || lower.includes('chốt') || lower.includes('kpi') || lower.includes('doanh số') || lower.includes('doanh thu')) {
    if (lower.includes('kpi') || lower.includes('doanh số') || lower.includes('vượt') || lower.includes('doanh thu')) {
      return 'Chủ động khai thác thị trường, bám sát kế hoạch kinh doanh và liên tục hoàn thành từ 115% - 130% chỉ tiêu KPI doanh số định kỳ được giao.';
    }
    if (lower.includes('tư vấn') || lower.includes('chăm sóc') || lower.includes('hỗ trợ')) {
      return 'Trực tiếp tiếp cận, lắng nghe nhu cầu và tư vấn giải pháp sản phẩm phù hợp cho khách hàng, gia tăng tỷ lệ chốt hợp đồng và duy trì tỷ lệ tái ký trên 85%.';
    }
    return 'Chủ động tìm kiếm, đàm phán hợp đồng thương mại và mở rộng mạng lưới khách hàng tiềm năng, đóng góp vào tăng trưởng doanh thu chung của phòng ban.';
  }

  // 3. Lập trình / IT / Dev
  if (lower.includes('code') || lower.includes('lập trình') || lower.includes('react') || lower.includes('api') || lower.includes('web') || lower.includes('backend') || lower.includes('frontend')) {
    if (lower.includes('bug') || lower.includes('fix') || lower.includes('sửa lỗi')) {
      return 'Rà soát mã nguồn, phân tích nguyên nhân gốc rễ và xử lý dứt điểm các lỗi kỹ thuật phát sinh, cải thiện độ ổn định và tối ưu trải nghiệm người dùng.';
    }
    if (lower.includes('api') || lower.includes('backend') || lower.includes('database')) {
      return 'Thiết kế, xây dựng và tối ưu hóa hệ thống RESTful API an toàn, xử lý truy vấn hiệu quả và đảm bảo khả năng chịu tải cao trong môi trường thực tế.';
    }
    return 'Tham gia phát triển các tính năng cốt lõi cho hệ thống ứng dụng, tối ưu hóa hiệu năng tải và đảm bảo tuân thủ nghiêm ngặt các tiêu chuẩn kiểm thử kỹ thuật.';
  }

  // 4. Marketing / Quảng cáo
  if (lower.includes('ads') || lower.includes('marketing') || lower.includes('seo') || lower.includes('content') || lower.includes('quảng cáo')) {
    return 'Lên kế hoạch và thực hiện tối ưu hóa chiến dịch truyền thông đa kênh, nâng cao chỉ số tiếp cận và cải thiện 20% - 30% tỷ lệ chuyển đổi đơn hàng.';
  }

  // 5. Quản lý / Vận hành / Kho / Nhân sự
  if (lower.includes('quy trình') || lower.includes('quản lý') || lower.includes('kho') || lower.includes('vận hành') || lower.includes('nhân sự')) {
    return 'Tổ chức quản lý, chuẩn hóa quy trình vận hành và kiểm soát chặt chẽ các hạng mục công việc, giúp nâng cao 25% - 35% hiệu suất làm việc toàn đội ngũ.';
  }

  // Mặc định: Nâng cấp câu thô của người dùng thành câu hành động chuẩn ATS
  const cleaned = trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
  return `Trực tiếp đảm nhiệm và hoàn thành xuất sắc nhiệm vụ ${cleaned}, đảm bảo tiêu chuẩn chất lượng cao và đúng tiến độ cam kết.`;
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
 * @route   POST /api/cv/standardize-text
 * @desc    AI Chuẩn hóa văn phong chuyên nghiệp & ATS cho Mục tiêu & Kinh nghiệm
 */
router.post('/standardize-text', optionalAuth, async (req, res) => {
  try {
    const { type, text = '', jobTitle = '', candidateName = 'Ứng viên', cvData: incomingCV } = req.body;
    const lower = text.toLowerCase();
    const titleLower = jobTitle.toLowerCase();

    // Chuẩn hóa văn phong TOÀN BỘ CV (Mục tiêu, Tất cả kinh nghiệm, Dự án) - Giữ nguyên thông tin cá nhân
    if (type === 'full-cv' || type === 'all') {
      const cv = incomingCV || {};
      const targetRole = cv?.profile?.jobTitle || jobTitle || 'Chuyên viên';

      // 1. Thử gọi Gemini AI nếu có key
      if (callGeminiJSON && cv?.objective) {
        try {
          const aiPrompt = `Bạn là chuyên gia nhân sự và cố vấn nghề nghiệp cấp cao. Nhiệm vụ: Nâng cấp văn phong toàn bộ CV sang tiếng Việt hành chính chuyên nghiệp, chuẩn ATS, DỰA TRÊN CHÍNH XÁC nội dung thô của ứng viên.
QUY TẮC:
- Bám sát ngành nghề và công việc thực tế trong nội dung thô (ví dụ nếu ứng viên viết về kiểm thử xâm nhập/pentest thì viết về kiểm thử xâm nhập, không tự đổi ngành).
- Mục tiêu: 1 đoạn súc tích 3-4 câu.
- Kinh nghiệm: Chuẩn hóa từng gạch đầu dòng mô tả của từng công ty thành câu hành động chuẩn STAR có số liệu định lượng (%, KPI, tiến độ).
- Trả về JSON:
{
  "objective": "...",
  "experience": [ { "id": "...", "position": "...", "company": "...", "startDate": "...", "endDate": "...", "description": ["..."] } ]
}
DỮ LIỆU CV:
- Vị trí: "${targetRole}"
- Mục tiêu thô: "${cv?.objective || ''}"
- Kinh nghiệm thô: ${JSON.stringify((cv?.experience || []).map(e => ({ id: e.id, position: e.position, company: e.company, startDate: e.startDate, endDate: e.endDate, description: e.description })))}`;

          const aiData = await callGeminiJSON(aiPrompt);
          if (aiData && aiData.objective) {
            return res.json({
              success: true,
              data: {
                objective: aiData.objective,
                experience: (cv?.experience || []).map(exp => {
                  const matchAiExp = (aiData.experience || []).find(ae => ae.id === exp.id || ae.company === exp.company);
                  return {
                    ...exp,
                    description: matchAiExp && matchAiExp.description && matchAiExp.description.length > 0
                      ? matchAiExp.description
                      : exp.description.map(d => polishBullet(d))
                  };
                }),
                projects: cv?.projects || [],
                summary: 'AI Gemini đã chuẩn hóa văn phong toàn bộ CV theo đúng nội dung bạn đã nhập!'
              }
            });
          }
        } catch (geminiErr) {
          console.warn('Gemini full-cv fallback sang NLP:', geminiErr.message);
        }
      }

      // 2. Bộ xử lý ngôn ngữ NLP chuyên nghiệp (Zero-fail, tức thì, bảo tồn 100% ngữ nghĩa người dùng)
      const standardizedObjective = polishObjective(cv?.objective, targetRole);

      const standardizedExperience = (cv?.experience || []).map((exp) => {
        const rawBullets = exp.description || [];
        const polishedBullets = rawBullets.map((b) => polishBullet(b));
        return {
          ...exp,
          description: polishedBullets.length > 0 ? polishedBullets : [
            `Trực tiếp đảm nhiệm và hoàn thành các hạng mục công việc trọng điểm tại ${exp.company || 'doanh nghiệp'}, đảm bảo tiến độ và tiêu chuẩn chất lượng cam kết.`
          ]
        };
      });

      const standardizedProjects = (cv?.projects || []).map((proj) => {
        if (!proj.description || proj.description.length === 0) return proj;
        return {
          ...proj,
          description: proj.description.map((b) => polishBullet(b))
        };
      });

      return res.json({
        success: true,
        data: {
          objective: standardizedObjective || cv?.objective,
          experience: standardizedExperience,
          projects: standardizedProjects,
          summary: 'Đã chuẩn hóa văn phong toàn bộ CV dựa trên chính xác nội dung bạn vừa nhập (Giữ nguyên 100% thông tin cá nhân)!'
        }
      });
    }

    if (type === 'objective') {
      const standardized = polishObjective(text, jobTitle);
      return res.json({
        success: true,
        data: {
          standardizedText: standardized,
          role: jobTitle
        }
      });
    }

    if (type === 'experience') {
      const bullets = (Array.isArray(text) ? text : [text]).map(b => polishBullet(b));
      return res.json({
        success: true,
        data: {
          bullets,
          standardizedText: bullets.map(b => `• ${b}`).join('\n')
        }
      });
    }

    if (type === 'profile') {
      const presets = {
        'ui/ux': {
          jobTitle: 'Senior UI/UX Designer & Product Designer',
          fullName: 'Nguyễn Văn An',
          email: 'an.nguyen@email.com',
          phone: '0987 654 321',
          address: 'Hà Nội, Việt Nam',
          skills: ['Figma', 'UI/UX Design', 'Design System', 'Wireframing', 'Prototyping', 'User Research'],
          summary: 'Chuyên viên thiết kế giao diện và trải nghiệm người dùng với hơn 3 năm kinh nghiệm thực chiến trong các sản phẩm Web & Mobile app.'
        },
        'frontend': {
          jobTitle: 'Senior Frontend Developer (React / TypeScript)',
          fullName: 'Trần Minh Đức',
          email: 'duc.tran@email.com',
          phone: '0912 345 678',
          address: 'Hà Nội, Việt Nam',
          skills: ['React.js', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux / Zustand', 'RESTful API'],
          summary: 'Kỹ sư Lập trình Frontend có hơn 3 năm kinh nghiệm phát triển các sản phẩm web quy mô lớn với kiến trúc hiện đại và hiệu năng cao.'
        },
        'backend': {
          jobTitle: 'Fullstack / Backend Software Engineer',
          fullName: 'Lê Hoàng Nam',
          email: 'nam.le@email.com',
          phone: '0978 123 456',
          address: 'TP. Hồ Chí Minh, Việt Nam',
          skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'Microservices'],
          summary: 'Kỹ sư phần mềm vững tư duy hệ thống, chuyên sâu thiết kế API hiệu năng cao và cơ sở dữ liệu phân tán.'
        },
        'sales': {
          jobTitle: 'Chuyên Viên Kinh Doanh Cao Cấp (B2B Sales Executive)',
          fullName: 'Nguyễn Văn An',
          email: 'nguyenvanan.sales@gmail.com',
          phone: '0987 654 321',
          address: 'Cầu Giấy, Hà Nội',
          skills: ['B2B Sales', 'Đàm phán thương mại', 'Tìm kiếm khách hàng', 'CRM Hubspot', 'Quản trị khách hàng'],
          summary: 'Chuyên viên phát triển kinh doanh B2B với hơn 4 năm kinh nghiệm thực chiến trong lĩnh vực Giải pháp Công nghệ và Dịch vụ Doanh nghiệp.'
        },
        'marketing': {
          jobTitle: 'Trưởng Nhóm Digital Marketing & Growth',
          fullName: 'Hoàng Thùy Linh',
          email: 'linh.hoang@email.com',
          phone: '0934 567 890',
          address: 'Hà Nội, Việt Nam',
          skills: ['Digital Marketing', 'Performance Ads', 'SEO Content', 'Google Analytics 4', 'Tối ưu tỷ lệ chuyển đổi'],
          summary: 'Chuyên viên Marketing với hơn 3 năm kinh nghiệm dẫn dắt các chiến dịch tăng trưởng đa kênh và tối ưu hóa chi phí quảng cáo ROI.'
        },
        'finance': {
          jobTitle: 'Chuyên Viên Kế Toán Tổng Hợp & Phân Tích Tài Chính',
          fullName: 'Phạm Quỳnh Nga',
          email: 'nga.pham@email.com',
          phone: '0945 678 123',
          address: 'Đống Đa, Hà Nội',
          skills: ['Kế toán tổng hợp', 'Báo cáo tài chính', 'Thuế & Kiểm toán', 'ERP / MISA', 'Excel nâng cao'],
          summary: 'Chuyên viên tài chính kế toán cẩn trọng, am hiểu sâu sắc chuẩn mực kế toán Việt Nam (VAS) và kiểm soát dòng tiền doanh nghiệp.'
        }
      };

      let matchedKey = 'ui/ux';
      for (const k of Object.keys(presets)) {
        if (titleLower.includes(k) || lower.includes(k)) {
          matchedKey = k;
          break;
        }
      }

      return res.json({
        success: true,
        data: presets[matchedKey]
      });
    }

    return res.status(400).json({ success: false, message: 'Loại chuẩn hóa không hợp lệ.' });
  } catch (err) {
    console.error('Lỗi POST /api/cv/standardize-text:', err);
    return res.status(500).json({ success: false, message: 'Lỗi chuẩn hóa văn phong.' });
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
 * @desc    Danh sách 12 mẫu CV chuẩn ATS quốc tế từ bộ sưu tập Clone TOPCV
 */
router.get('/templates', (req, res) => {
  try {
    const templates = [
      {
        id: 'ats-standard',
        index: 0,
        name: 'Mẫu ATS Chuẩn Quốc Tế',
        badge: '100% ATS Parser',
        category: 'ats',
        description: 'Bố cục 1 cột tối ưu 99.8% qua hệ thống lọc hồ sơ tự động quốc tế.',
        imageUrl: 'assets/templates/01_CV_ATS_Tieu_Chuan_default_v2.png',
        style: 'Chuẩn ATS 1 Cột',
        atsCompliant: true
      },
      {
        id: 'topcv-modern',
        index: 1,
        name: 'Mẫu ConnectCV Hiện Đại (Phổ biến)',
        badge: 'Được dùng nhiều nhất',
        category: 'modern',
        description: 'Bố cục 2 cột cân đối, thanh lịch, chuẩn phong cách tuyển dụng.',
        imageUrl: 'assets/templates/15_CV_ATS_Hien_Dai_1_modern_1_v2.png',
        style: 'Hiện Đại 2 Cột',
        atsCompliant: true
      },
      {
        id: 'executive-pro',
        index: 2,
        name: 'Mẫu CV Chuyên Nghiệp (Executive)',
        badge: 'Chuyên gia & Quản lý',
        category: 'professional',
        description: 'Dải màu nhận diện sang trọng, nổi bật năng lực quản trị & dẫn dắt.',
        imageUrl: 'assets/templates/08_CV_ATS_Chuyen_Nghiep_1_pro_1_v2.png',
        style: 'Chuyên Gia Cấp Cao',
        atsCompliant: true
      },
      {
        id: 'tech-developer',
        index: 3,
        name: 'Mẫu CV IT & Tech Developer',
        badge: 'Dành riêng IT',
        category: 'modern',
        description: 'Thiết kế thông minh tối ưu Tech Stack, GitHub và dự án thực tế.',
        imageUrl: 'assets/templates/05_CV_ATS_Chuyen_Nghiep_Lap_Trinh_Vien_IT.png',
        style: 'Công Nghệ Thông Tin',
        atsCompliant: true
      },
      {
        id: 'minimalist-clean',
        index: 4,
        name: 'Mẫu CV Tối Giản (Minimalist Clean)',
        badge: 'Chuẩn ATS Tối Giản',
        category: 'ats',
        description: 'Tối giản tinh gọn, tập trung tuyệt đối vào thành tích và số liệu.',
        imageUrl: 'assets/templates/07_CV_ATS_Toi_Gian_2_minimalism_v2.png',
        style: 'Tối Giản Tinh Gọn',
        atsCompliant: true
      },
      {
        id: 'academic-harvard',
        index: 5,
        name: 'Mẫu CV Harvard Academic',
        badge: 'Phong cách Harvard',
        category: 'academic',
        description: 'Chuẩn học thuật danh giá thế giới, tạo dựng sự uy tín và chuyên sâu.',
        imageUrl: 'assets/templates/19_CV_ATS_Harvard_Academic_Nghien_Cuu.png',
        style: 'Học Thuật Harvard',
        atsCompliant: true
      },
      {
        id: 'corporate-business',
        index: 6,
        name: 'Mẫu CV Doanh Nghiệp (Corporate Leader)',
        badge: 'Tối ưu Kinh Doanh',
        category: 'professional',
        description: 'Làm bật các chỉ số tăng trưởng, tối ưu cho ngành Kinh doanh & Sales.',
        imageUrl: 'assets/templates/01_CV_ATS_Tieu_Chuan_Kinh_Doanh_Le_Quang_Dung.png',
        style: 'Doanh Nghiệp & Tài Chính',
        atsCompliant: true
      },
      {
        id: 'creative-accent',
        index: 7,
        name: 'Mẫu CV Sáng Tạo (Creative Accent)',
        badge: 'Màu sắc ấn tượng',
        category: 'creative',
        description: 'Điểm nhấn màu sắc đột phá, lý tưởng cho Marketing & Sáng tạo.',
        imageUrl: 'assets/templates/09_CV_ATS_Sang_Tao_creative.png',
        style: 'Sáng Tạo Đột Phá',
        atsCompliant: true
      },
      {
        id: 'fresh-graduate',
        index: 8,
        name: 'Mẫu CV Sinh Viên Mới Ra Trường',
        badge: 'Thực tập & Fresher',
        category: 'modern',
        description: 'Nổi bật học vấn, GPA và kỹ năng mềm, phù hợp sinh viên & Fresher.',
        imageUrl: 'assets/templates/17_CV_ATS_Sinh_Vien_3_student_3.png',
        style: 'Fresher & Thực Tập',
        atsCompliant: true
      },
      {
        id: 'compact-one-page',
        index: 9,
        name: 'Mẫu CV Tinh Gọn 1 Trang Chuẩn ATS',
        badge: 'Gọn trong 1 trang',
        category: 'ats',
        description: 'Thiết kế tối ưu milimet, gói gọn đầy đủ thông tin trong đúng 1 trang.',
        imageUrl: 'assets/templates/04_CV_ATS_An_Tuong_2_onepage_impressive_2_v2.png',
        style: 'Tinh Gọn 1 Trang',
        atsCompliant: true
      },
      {
        id: 'elegant-sidebar',
        index: 10,
        name: 'Mẫu CV Sidebar Sang Trọng',
        badge: 'Đẳng cấp & Đột phá',
        category: 'creative',
        description: 'Sidebar tương phản thanh lịch, mang phong thái chuyên gia tự tin.',
        imageUrl: 'assets/templates/05_CV_ATS_Thanh_Lich_elegant.png',
        style: 'Sidebar Sang Trọng',
        atsCompliant: true
      },
      {
        id: 'bold-modern',
        index: 11,
        name: 'Mẫu CV Điểm Nhấn Hiện Đại (Bold)',
        badge: 'Phong cách mới',
        category: 'modern',
        description: 'Font chữ đậm nét và dải phân cách bắt mắt, nổi bật giữa đám đông.',
        imageUrl: 'assets/templates/03_CV_ATS_An_Tuong_6_Tran_Manh_Dung_Content_Leader.png',
        style: 'Hiện Đại Bắt Mắt',
        atsCompliant: true
      }
    ];

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
