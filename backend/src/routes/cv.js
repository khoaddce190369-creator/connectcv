'use strict';
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { optionalAuth } = require('../middlewares/authMiddleware');
const { sanitizeText, processCvEditorAgent } = require('../services/cvEditorAgentService');
const {
  resolveCallerIdentity,
  checkBurstRateLimit,
  canConsumeDailyLlmQuota,
  recordLlmConsumption
} = require('../services/cvAiQuotaService');

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
// BỘ TỪ ĐIỂN TỪ KHÓA CHUYÊN NGÀNH ATS MỞ RỘNG ĐA NGÀNH
// ─────────────────────────────────────────────────────────────
const ATS_TAXONOMY = [
  { domain: 'Kiểm thử xâm nhập (Penetration Testing) & An toàn thông tin', role: 'Chuyên viên An toàn thông tin', keywords: ['kiểm thử xâm nhập', 'pentest', 'penetration testing', 'an toàn thông tin', 'bảo mật', 'security', 'lỗ hổng', 'vulnerability', 'owasp', 'burp suite', 'metasploit', 'nmap', 'sql injection', 'xss', 'soc', 'siem'] },
  { domain: 'Lập trình Frontend & Phát triển giao diện Web', role: 'Lập trình viên Frontend', keywords: ['frontend', 'react', 'react.js', 'vue', 'angular', 'next.js', 'typescript', 'javascript', 'tailwind', 'html/css', 'redux', 'zustand'] },
  { domain: 'Phát triển hệ thống Backend & Kiến trúc API', role: 'Lập trình viên Backend', keywords: ['backend', 'node.js', 'express', 'nest.js', 'java', 'spring', 'python', 'django', 'golang', 'microservices', 'restful api', 'graphql', 'docker', 'kubernetes', 'postgresql', 'mongodb'] },
  { domain: 'Phân tích dữ liệu & Business Intelligence', role: 'Chuyên viên Phân tích dữ liệu (Data Analyst)', keywords: ['data analyst', 'phân tích dữ liệu', 'power bi', 'powerbi', 'tableau', 'sql', 'python', 'etl', 'data warehouse', 'bigquery', 'looker'] },
  { domain: 'Thiết kế giao diện & Trải nghiệm người dùng', role: 'UI/UX Designer', keywords: ['ui/ux', 'ui designer', 'ux designer', 'figma', 'design system', 'wireframing', 'prototyping', 'user research', 'usability testing', 'adobe xd'] },
  { domain: 'Kiểm thử phần mềm & Đảm bảo chất lượng (QA/QC)', role: 'Kỹ sư QA/QC', keywords: ['tester', 'kiểm thử phần mềm', 'qa/qc', 'selenium', 'playwright', 'cypress', 'automation test', 'manual test', 'postman', 'test case'] },
  { domain: 'Kinh doanh B2B & Phát triển đối tác doanh nghiệp', role: 'Chuyên viên Kinh doanh B2B', keywords: ['kinh doanh b2b', 'b2b sales', 'b2b', 'sales b2b', 'bán hàng doanh nghiệp', 'đàm phán hợp đồng', 'chốt hợp đồng', 'chốt deal', 'phát triển thị trường', 'crm', 'hubspot', 'salesforce', 'khách hàng doanh nghiệp', 'smes', 'kpi doanh số', 'lead generation', 'cold outreach'] },
  { domain: 'Kinh doanh & Tư vấn Bán hàng', role: 'Chuyên viên Kinh doanh', keywords: ['kinh doanh', 'bán hàng', 'sales executive', 'sales', 'tư vấn khách hàng', 'chốt đơn', 'bán lẻ', 'retail', 'chăm sóc khách hàng', 'doanh thu', 'doanh số', 'kpi'] },
  { domain: 'Digital Marketing & Tăng trưởng', role: 'Chuyên viên Digital Marketing', keywords: ['digital marketing', 'marketing', 'seo', 'sem', 'google ads', 'facebook ads', 'meta ads', 'tiktok ads', 'content marketing', 'google analytics', 'roas', 'roi', 'conversion rate'] },
  { domain: 'Kế toán, Kiểm toán & Quản trị tài chính', role: 'Chuyên viên Kế toán - Tài chính', keywords: ['kế toán', 'thuế', 'báo cáo tài chính', 'kiểm toán', 'audit', 'vas', 'ifrs', 'thu chi', 'hóa đơn', 'misa', 'sap', 'erp', 'tín dụng', 'ngân hàng'] },
  { domain: 'Quản trị nhân sự & Thu hút nhân tài', role: 'Chuyên viên Nhân sự (HR)', keywords: ['nhân sự', 'tuyển dụng', 'hr generalist', 'headhunter', 'talent acquisition', 'c&b', 'đào tạo nội bộ', 'onboarding', 'luật lao động'] },
  { domain: 'Quản lý dự án & Điều phối vận hành', role: 'Quản lý dự án (Project Manager)', keywords: ['quản lý dự án', 'project manager', 'pmp', 'agile', 'scrum', 'jira', 'vận hành', 'chuỗi cung ứng', 'logistics', 'xuất nhập khẩu'] }
];

function extractNumericTokens(text = '') {
  const matches = String(text || '').match(/\d+(?:[.,]\d+)?%?/g) || [];
  return Array.from(new Set(matches.map(m => m.replace(/,/g, '.'))));
}

function hasExactSameNumbers(originalText, candidateText) {
  const origNums = extractNumericTokens(originalText);
  const candNums = extractNumericTokens(candidateText);
  // Every original number must still exist
  for (const n of origNums) {
    if (!candNums.includes(n)) return false;
  }
  // Candidate must NOT invent any new numbers not in original
  for (const n of candNums) {
    if (!origNums.includes(n)) return false;
  }
  return true;
}

/**
 * Trích xuất từ khóa ATS từ JD (kết hợp từ điển chuyên ngành + thuật ngữ thực tế trong JD)
 */
function extractKeywordsFromJD(text = '') {
  const clean = sanitizeText(text, 10000);
  if (!clean) return [];
  const lower = clean.toLowerCase();
  const matched = [];
  const seenLower = new Set();

  // 1. Score taxonomy groups so we prioritize keywords belonging to the JD's actual industry
  const scoredGroups = ATS_TAXONOMY.map(group => {
    const hits = group.keywords.filter(kw => {
      if (kw.length <= 3) {
        return new RegExp(`(?:^|[^a-z0-9])${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[^a-z0-9])`, 'i').test(lower);
      }
      return lower.includes(kw);
    });
    return { group, hits };
  }).filter(x => x.hits.length > 0).sort((a, b) => b.hits.length - a.hits.length);

  for (const { hits } of scoredGroups) {
    for (const kw of hits) {
      const k = kw.toLowerCase();
      if (!seenLower.has(k)) {
        seenLower.add(k);
        const formattedKw = kw.length <= 4
          ? kw.toUpperCase()
          : kw.split(/\s+/).map(w => {
              if (/^(?:b2b|b2c|kpi|crm|seo|sem|roi|roas|sql|api|ui\/ux|qa\/qc|c&b|vas|ifrs|erp|sap|hr|it|pmp|etl)$/i.test(w)) return w.toUpperCase();
              if (/^smes$/i.test(w)) return 'SMEs';
              return w.charAt(0).toUpperCase() + w.slice(1);
            }).join(' ');
        matched.push(formattedKw);
      }
    }
  }

  // 2. Also extract explicit uppercase/CamelCase technical/business acronyms from the JD (e.g. CRM, B2B, KPI, HubSpot, SQL)
  const STOP_ACRONYMS = new Set(['CV', 'JD', 'TP', 'HCM', 'HN', 'VN', 'VND', 'USD', 'TOP', 'THE', 'AND', 'FOR', 'WITH', 'PRO', 'VIP']);
  for (const m of clean.matchAll(/\b([A-Z][A-Za-z0-9+#./-]{1,18})\b/g)) {
    const token = m[1].replace(/[.,;:/-]+$/, '');
    if (token.length < 2 || STOP_ACRONYMS.has(token.toUpperCase())) continue;
    if (/^[A-Z]{2,10}$/.test(token) || /[A-Z].*[A-Z]|[+#.]/.test(token)) {
      const k = token.toLowerCase();
      if (!seenLower.has(k)) {
        seenLower.add(k);
        matched.push(token);
      }
    }
  }

  return matched.slice(0, 18);
}

function detectDomainFromText(text = '', fallbackRole = '') {
  const combined = `${fallbackRole || ''} ${text || ''}`.toLowerCase();
  let bestGroup = null;
  let bestCount = 0;

  for (const group of ATS_TAXONOMY) {
    let count = 0;
    for (const kw of group.keywords) {
      if (kw.length <= 3) {
        if (new RegExp(`(?:^|[^a-z0-9])${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[^a-z0-9])`, 'i').test(combined)) count++;
      } else if (combined.includes(kw)) {
        count += 2;
      }
    }
    if (count > bestCount) {
      bestCount = count;
      bestGroup = group;
    }
  }

  const cleanFallback = sanitizeText(fallbackRole, 120);
  if (bestGroup) {
    return {
      domain: bestGroup.domain,
      role: cleanFallback || bestGroup.role
    };
  }
  if (cleanFallback) {
    return { domain: cleanFallback, role: cleanFallback };
  }
  return { domain: 'nghiệp vụ chuyên môn', role: 'Chuyên viên' };
}

// Formalize colloquialisms while preserving 100% of numbers, KPIs, company names, and domain terms!
function formalizeColloquialVietnamese(str) {
  let s = sanitizeText(str, 2000).replace(/\s+/g, ' ').trim();
  if (!s) return '';
  const replacements = [
    [/\b(?:bọn mình|tụi mình|chúng em|bọn em)\b/gi, 'đội ngũ'],
    [/^(?:mình|em|tôi)\s+(?:đã\s+|ừng\s+|có\s+)?/i, ''],
    [/\blàm sale\b/gi, 'triển khai kinh doanh'],
    [/\bđi sale\b/gi, 'phát triển thị trường và tiếp cận khách hàng'],
    [/\bchốt khách\b/gi, 'đàm phán và chốt hợp đồng với khách hàng'],
    [/\bkiếm khách\b/gi, 'tìm kiếm và mở rộng tệp khách hàng'],
    [/\bfix bug\b/gi, 'phân tích và xử lý triệt để lỗi kỹ thuật'],
    [/\blàm web\b/gi, 'phát triển ứng dụng web'],
    [/\bbáo cáo sếp\b/gi, 'tổng hợp báo cáo cho cấp quản lý']
  ];
  for (const [re, rep] of replacements) {
    s = s.replace(re, rep);
  }
  return s.replace(/\s+/g, ' ').trim();
}

const STRONG_OPENING_VERBS_RE = /^(?:Chủ động|Trực tiếp|Liên tục|Phối hợp|Phát triển|Chăm sóc|Thu thập|Xây dựng|Thiết kế|Triển khai|Tối ưu|Quản lý|Đàm phán|Phân tích|Dẫn dắt|Rà soát|Lên kế hoạch|Tham gia|Đảm nhiệm|Vận hành|Thực hiện|Kiểm soát|Nghiên cứu|Tư vấn|Hỗ trợ|Đạt|Mang về|Tổng hợp|Tổ chức|Phụ trách|Điều phối|Kết quả)/i;

const ACTION_PREFIX_ROTATION = [
  'Trực tiếp thực hiện ',
  'Chủ động triển khai ',
  'Phụ trách và tối ưu ',
  'Phối hợp thực hiện '
];

/**
 * Chuẩn hóa 1 gạch đầu dòng chuẩn ATS:
 * - TUYỆT ĐỐI KHÔNG bịa thêm con số mới (không sinh 115%-130%, 28%, 35%...)
 * - BẢO TOÀN 100% mọi con số, KPI, doanh thu, tên công cụ thực tế của ứng viên
 */
function polishBullet(rawBullet, index = 0) {
  const cleaned = formalizeColloquialVietnamese(String(rawBullet || '').replace(/^[-*•+]\s*/, ''));
  if (!cleaned) return '';

  let result;
  if (STRONG_OPENING_VERBS_RE.test(cleaned)) {
    result = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  } else {
    const prefix = ACTION_PREFIX_ROTATION[index % ACTION_PREFIX_ROTATION.length];
    const firstWord = cleaned.split(/\s+/)[0] || '';
    const isAcronym = /^[A-Z0-9]{2,}/.test(firstWord);
    const lowered = isAcronym ? cleaned : (cleaned.charAt(0).toLowerCase() + cleaned.slice(1));
    result = `${prefix}${lowered}`;
  }

  if (!/[.!?]$/.test(result)) result += '.';
  return result;
}

function polishBulletList(rawBullets = []) {
  const arr = Array.isArray(rawBullets)
    ? rawBullets
    : String(rawBullets || '').split(/\n+|(?<=[.!?])\s+(?=[A-ZÀ-Ỹ•*-])/);
  const rawSeen = new Set();
  const seen = new Set();
  const out = [];
  for (const b of arr) {
    const rawKey = formalizeColloquialVietnamese(String(b || '').replace(/^[-*•+]\s*/, ''))
      .toLowerCase()
      .replace(/[^a-z0-9\u00C0-\u1EF9]/g, '');
    if (!rawKey || rawSeen.has(rawKey)) continue;
    rawSeen.add(rawKey);

    const p = polishBullet(b, out.length);
    if (!p) continue;
    const normKey = p.toLowerCase().replace(/[^a-z0-9\u00C0-\u1EF9]/g, '');
    if (!normKey || seen.has(normKey)) continue;
    seen.add(normKey);
    out.push(p);
  }
  return out;
}

/**
 * Chuẩn hóa Mục tiêu nghề nghiệp:
 * - Bảo toàn 100% số năm kinh nghiệm, chỉ số KPI/doanh thu (VD: 150%, 4 năm, 2 năm) và ngành thực tế của ứng viên!
 */
function polishObjective(rawText, fallbackRole = '') {
  const cleaned = formalizeColloquialVietnamese(rawText);
  const { domain, role } = detectDomainFromText(cleaned, fallbackRole);
  if (!cleaned) {
    return `Ứng viên vị trí ${role} với định hướng phát triển chuyên sâu trong lĩnh vực ${domain}, mong muốn vận dụng năng lực chuyên môn để tối ưu hiệu quả công việc và đóng góp giá trị bền vững cho doanh nghiệp.`;
  }

  // If the candidate already wrote a detailed objective (>= 65 chars or contains concrete numbers),
  // preserve ALL their facts & numbers and polish grammar/framing cleanly!
  const hasConcreteNumbers = /\d/.test(cleaned);
  if (cleaned.length >= 65 || hasConcreteNumbers) {
    let polished = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    if (!/[.!?]$/.test(polished)) polished += '.';
    if (polished.length < 130) {
      polished += ` Định hướng gắn bó lâu dài ở vị trí ${role} và đóng góp hiệu quả thực chất cho mục tiêu phát triển của doanh nghiệp.`;
    }
    return polished;
  }

  return `${cleaned.charAt(0).toUpperCase() + cleaned.slice(1).replace(/[.!?]+$/, '')}. Định hướng phát triển chuyên sâu trong lĩnh vực ${domain} ở vị trí ${role}, chủ động tối ưu quy trình làm việc và đóng góp giá trị thực tiễn cho doanh nghiệp.`;
}

/**
 * @route   POST /api/cv/tailor
 * @desc    Smart Resume Builder & ATS CV Optimizer (100% Fact-Grounded, Zero Industry/Metric Hallucination)
 */
router.post('/tailor', optionalAuth, async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, code: 'INVALID_BODY', message: 'Dữ liệu yêu cầu không hợp lệ.' });
    }

    const { jd, jdText, profile } = req.body;
    const rawJd = jd !== undefined ? jd : jdText;
    if (typeof rawJd !== 'string' || !rawJd.trim()) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_JD',
        message: 'Vui lòng cung cấp nội dung bản mô tả công việc (JD).'
      });
    }
    if (rawJd.length > 12000) {
      return res.status(400).json({
        success: false,
        code: 'JD_TOO_LONG',
        message: 'Bản mô tả công việc (JD) quá dài (tối đa 12.000 ký tự).'
      });
    }
    if (profile !== undefined && (profile === null || typeof profile !== 'object' || Array.isArray(profile))) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_PROFILE',
        message: 'Dữ liệu hồ sơ (profile) không hợp lệ.'
      });
    }

    const burst = checkBurstRateLimit(req, res, 'cv-tailor');
    if (!burst.allowed) return res.status(burst.status).json(burst.body);

    const jobDescription = sanitizeText(rawJd, 12000);
    const candidateProfile = profile || {};
    const candidateName = sanitizeText(candidateProfile.fullName || '', 80);
    const rawTitle = sanitizeText(candidateProfile.title || candidateProfile.jobTitle || '', 120);
    const rawSummary = sanitizeText(candidateProfile.summary || candidateProfile.objective || '', 2000);
    const rawSkills = Array.isArray(candidateProfile.skills)
      ? candidateProfile.skills.map(s => sanitizeText(typeof s === 'string' ? s : s?.name || '', 80)).filter(Boolean)
      : [];
    const rawExperience = Array.isArray(candidateProfile.experience) ? candidateProfile.experience : [];

    // Detect real industry/domain from BOTH candidate CV and JD (never hardcode UI/UX!)
    const { domain, role: detectedRole } = detectDomainFromText(
      `${rawTitle} ${rawSummary} ${rawSkills.join(' ')} ${jobDescription}`,
      rawTitle
    );

    // 1. Extract ATS keywords from JD and compare against ENTIRE candidate CV text
    const jdKeywords = extractKeywordsFromJD(jobDescription);
    const fullCandidateCorpus = [
      rawTitle,
      rawSummary,
      ...rawSkills,
      ...rawExperience.map(e => `${e?.position || ''} ${e?.company || ''} ${Array.isArray(e?.description) ? e.description.join(' ') : (e?.description || '')}`)
    ].join(' ').toLowerCase();

    const matchedKeywords = [];
    const missingKeywords = [];
    for (const kw of jdKeywords) {
      if (fullCandidateCorpus.includes(kw.toLowerCase())) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    }

    const matchScore = jdKeywords.length > 0
      ? Math.min(98, Math.max(35, Math.round((matchedKeywords.length / jdKeywords.length) * 100)))
      : 75;

    // 2. Fact-grounded Tailored Summary (preserves candidate's real numbers & real industry!)
    let tailoredSummary = polishObjective(rawSummary, detectedRole);
    const relevantFocus = (matchedKeywords.length > 0 ? matchedKeywords : jdKeywords).slice(0, 3);
    if (relevantFocus.length > 0) {
      const notYetInSummary = relevantFocus.filter(kw => !tailoredSummary.toLowerCase().includes(kw.toLowerCase()));
      if (notYetInSummary.length > 0) {
        tailoredSummary = `${tailoredSummary.replace(/[.!?]+$/, '')}, tập trung phát huy năng lực về ${notYetInSummary.join(', ')} phù hợp với yêu cầu vị trí ${detectedRole}.`;
      }
    }
    if (candidateName && !tailoredSummary.toLowerCase().includes(candidateName.toLowerCase()) && !rawSummary) {
      tailoredSummary = `${candidateName} — ${tailoredSummary}`;
    }

    // 3. Fact-grounded Tailored Experience (ONLY polishes candidate's real bullets; ZERO fabricated metrics or wrong-industry tasks!)
    let sourceBullets = [];
    if (rawExperience.length > 0) {
      const firstExp = rawExperience[0];
      if (Array.isArray(firstExp?.description)) {
        sourceBullets = firstExp.description;
      } else if (typeof firstExp?.description === 'string' && firstExp.description.trim()) {
        sourceBullets = firstExp.description
          .split(/\n+|(?<=[.!?])\s+(?=[A-ZÀ-Ỹ•*-])/)
          .map(s => s.trim())
          .filter(Boolean);
      }
    }

    let tailoredExperience = polishBulletList(sourceBullets);
    if (tailoredExperience.length === 0) {
      // Honest placeholder bullets for empty CVs — NEVER invent fake numbers like 35% or 28%!
      const focusKw = relevantFocus.join(', ') || domain;
      tailoredExperience = [
        `Trực tiếp triển khai các nghiệp vụ trọng tâm về ${focusKw} cho vị trí ${detectedRole}, đạt [nhập % KPI hoặc kết quả thực tế của bạn].`,
        `Phối hợp chặt chẽ cùng các bộ phận liên quan để tối ưu quy trình làm việc trong mảng ${domain}, đảm bảo chất lượng và tiến độ cam kết.`
      ];
    }

    const recommendations = [];
    if (missingKeywords.length > 0) {
      recommendations.push(`Nếu bạn thực sự có kinh nghiệm với "${missingKeywords.slice(0, 4).join(', ')}", hãy bổ sung vào mục Kỹ năng hoặc minh chứng cụ thể trong Kinh nghiệm làm việc.`);
    } else {
      recommendations.push('Hồ sơ của bạn đã bao phủ tốt các từ khóa trọng tâm trong bản mô tả công việc (JD).');
    }
    recommendations.push('Giữ nguyên các số liệu thành tích thực tế của bạn (KPI, doanh thu, quy mô dự án) và tuyệt đối không điền số liệu giả định khi phỏng vấn.');
    recommendations.push('Sử dụng bố cục rõ ràng và font chữ chuẩn tiếng Việt để hệ thống ATS trích xuất chính xác 100% thông tin.');

    return res.json({
      success: true,
      data: {
        matchScore,
        atsStatus: matchScore >= 75 ? 'Chuẩn ATS Tối Ưu' : 'Cần Bổ Sung Từ Khóa Thực Tế',
        matchedKeywords,
        missingKeywords,
        tailoredSummary,
        tailoredExperience,
        recommendations
      }
    });
  } catch (error) {
    console.error('Lỗi POST /api/cv/tailor:', error.message);
    return res.status(500).json({
      success: false,
      code: 'TAILOR_ERROR',
      message: 'Không thể phân tích tối ưu CV. Vui lòng thử lại.'
    });
  }
});

/**
 * @route   POST /api/cv/standardize-text
 * @desc    AI Chuẩn hóa văn phong chuyên nghiệp & ATS (Bảo toàn 100% số liệu thật, không nhân đôi bullet)
 */
router.post('/standardize-text', optionalAuth, async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu yêu cầu không hợp lệ.' });
    }

    const { type, text = '', jobTitle = '', cvData: incomingCV } = req.body;
    const safeTitle = sanitizeText(jobTitle, 120);
    const lower = typeof text === 'string' ? text.toLowerCase() : '';
    const titleLower = safeTitle.toLowerCase();

    const burst = checkBurstRateLimit(req, res, 'cv-standardize');
    if (!burst.allowed) return res.status(burst.status).json(burst.body);

    // Chuẩn hóa văn phong TOÀN BỘ CV (Mục tiêu, Kinh nghiệm, Dự án) - Bảo toàn 100% số liệu & trường ẩn
    if (type === 'full-cv' || type === 'all') {
      if (incomingCV !== undefined && (incomingCV === null || typeof incomingCV !== 'object' || Array.isArray(incomingCV))) {
        return res.status(400).json({ success: false, message: 'Dữ liệu cvData không hợp lệ.' });
      }
      const cv = incomingCV || {};
      const targetRole = sanitizeText(cv?.profile?.jobTitle || safeTitle || 'Chuyên viên', 120);
      const identity = resolveCallerIdentity(req);

      // 1. Thử gọi Gemini AI nếu còn quota và có nội dung, nhưng KIỂM ĐỊNH NGHIÊM NGẶT chống bịa số liệu!
      if (callGeminiJSON && cv?.objective && canConsumeDailyLlmQuota(identity).allowed) {
        try {
          const aiPrompt = `Bạn là chuyên gia nhân sự chuẩn hóa văn phong CV tiếng Việt.
QUY TẮC BẮT BUỘC (TUYỆT ĐỐI TUÂN THỦ):
1. BẢO TOÀN 100% SỰ THẬT & SỐ LIỆU: Giữ nguyên chính xác mọi con số, phần trăm, KPI, doanh thu, thời gian, tên công ty/công cụ trong bản gốc (VD: có "125% - 140%", "3.2 tỷ VNĐ", "18 - 25 hợp đồng" thì BẮT BUỘC giữ đúng y hệt các con số đó). TUYỆT ĐỐI KHÔNG tự bịa bất kỳ con số mới nào!
2. KHÔNG ĐỔI NGÀNH: Bám sát đúng ngành nghề thực tế của ứng viên.
3. KHÔNG TRÙNG LẶP: Mỗi gạch đầu dòng kinh nghiệm phải khác biệt, tương ứng 1-1 với ý gốc của ứng viên.
4. Trả về JSON hợp lệ:
{
  "objective": "...",
  "experience": [ { "id": "...", "description": ["..."] } ]
}
DỮ LIỆU GỐC:
- Vị trí: ${JSON.stringify(targetRole)}
- Mục tiêu gốc: ${JSON.stringify(sanitizeText(cv.objective, 2000))}
- Kinh nghiệm gốc: ${JSON.stringify((cv.experience || []).map(e => ({ id: e.id, company: e.company, position: e.position, description: e.description })))}`;

          const aiData = await callGeminiJSON(aiPrompt, 'gemini-2.5-flash-lite', { timeoutMs: 14000, maxOutputTokens: 2000 });
          recordLlmConsumption(identity);

          if (aiData && typeof aiData.objective === 'string') {
            const safeObj = hasExactSameNumbers(cv.objective, aiData.objective)
              ? sanitizeText(aiData.objective, 2500)
              : polishObjective(cv.objective, targetRole);

            const verifiedExperience = (cv.experience || []).map(exp => {
              const rawBullets = Array.isArray(exp.description) ? exp.description : [];
              const matchAiExp = (aiData.experience || []).find(ae => ae && (ae.id === exp.id || ae.company === exp.company));
              let nextBullets;
              if (matchAiExp && Array.isArray(matchAiExp.description) && matchAiExp.description.length === rawBullets.length) {
                // Verify bullet-by-bullet that ZERO numbers were lost or fabricated!
                const checkedBullets = matchAiExp.description.map((candB, idx) => {
                  const origB = rawBullets[idx] || '';
                  return hasExactSameNumbers(origB, candB) ? sanitizeText(candB, 1000) : polishBullet(origB, idx);
                });
                nextBullets = polishBulletList(checkedBullets);
              } else {
                nextBullets = polishBulletList(rawBullets);
              }
              return {
                ...exp,
                description: nextBullets.length > 0 ? nextBullets : rawBullets
              };
            });

            const verifiedProjects = (cv.projects || []).map(proj => {
              if (!Array.isArray(proj.description) || proj.description.length === 0) return proj;
              return {
                ...proj,
                description: polishBulletList(proj.description)
              };
            });

            return res.json({
              success: true,
              data: {
                objective: safeObj,
                experience: verifiedExperience,
                projects: verifiedProjects,
                summary: 'Đã chuẩn hóa văn phong CV chuyên nghiệp (bảo toàn 100% số liệu thực tế và thông tin cá nhân)!'
              }
            });
          }
        } catch (geminiErr) {
          console.warn('Gemini full-cv fallback sang bộ chuẩn hóa bảo toàn số liệu:', geminiErr.message);
        }
      }

      // 2. Bộ chuẩn hóa văn phong bảo toàn 100% sự thật & số liệu thực tế (Zero-hallucination, Zero-duplication)
      const standardizedObjective = polishObjective(cv?.objective, targetRole);

      const standardizedExperience = (cv?.experience || []).map(exp => {
        const rawBullets = Array.isArray(exp.description) ? exp.description : [];
        const polishedBullets = polishBulletList(rawBullets);
        return {
          ...exp,
          description: polishedBullets.length > 0 ? polishedBullets : [
            `Trực tiếp đảm nhiệm công việc vị trí ${sanitizeText(exp.position || targetRole, 100)} tại ${sanitizeText(exp.company || 'doanh nghiệp', 120)}, đảm bảo chất lượng và tiến độ đề ra.`
          ]
        };
      });

      const standardizedProjects = (cv?.projects || []).map(proj => {
        if (!Array.isArray(proj.description) || proj.description.length === 0) return proj;
        return {
          ...proj,
          description: polishBulletList(proj.description)
        };
      });

      return res.json({
        success: true,
        data: {
          objective: standardizedObjective || cv?.objective,
          experience: standardizedExperience,
          projects: standardizedProjects,
          summary: 'Đã chuẩn hóa văn phong CV chuyên nghiệp (bảo toàn 100% số liệu thực tế và thông tin cá nhân)!'
        }
      });
    }

    if (type === 'objective') {
      if (typeof text !== 'string') {
        return res.status(400).json({ success: false, message: 'Nội dung mục tiêu phải là chuỗi văn bản.' });
      }
      const standardized = polishObjective(text, safeTitle);
      return res.json({
        success: true,
        data: {
          standardizedText: standardized,
          role: safeTitle
        }
      });
    }

    if (type === 'experience') {
      const bullets = polishBulletList(Array.isArray(text) ? text : String(text || '').split('\n'));
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
        id: 'tech-developer',
        index: 0,
        name: 'Mẫu CV Lập Trình Viên IT',
        badge: 'Ngành IT Hot',
        category: 'modern',
        description: 'Thiết kế tối ưu Tech Stack, GitHub, dự án thực tế và chỉ số hiệu năng hệ thống.',
        imageUrl: 'assets/templates/05_CV_ATS_Chuyen_Nghiep_Lap_Trinh_Vien_IT.png',
        style: 'Công Nghệ Thông Tin',
        atsCompliant: true
      },
      {
        id: 'corporate-business',
        index: 1,
        name: 'Mẫu CV Kinh Doanh & Sales',
        badge: 'Tối ưu Kinh Doanh',
        category: 'ats',
        description: 'Bố cục 1 cột chuẩn ATS làm nổi bật KPI doanh số, tệp khách hàng và tăng trưởng.',
        imageUrl: 'assets/templates/01_CV_ATS_Tieu_Chuan_Kinh_Doanh_Le_Quang_Dung.png',
        style: 'Kinh Doanh & Bán Hàng',
        atsCompliant: true
      },
      {
        id: 'fresher-dev',
        index: 2,
        name: 'Mẫu CV Sinh Viên CNTT & Fresher',
        badge: 'Thực tập & Fresher IT',
        category: 'modern',
        description: 'Dành cho sinh viên IT/Fresher Developer: nổi bật đồ án, ngôn ngữ lập trình và GPA.',
        imageUrl: 'assets/templates/17_CV_ATS_Sinh_Vien_CNTT_Fresher_Developer.png',
        style: 'CNTT & Phần Mềm',
        atsCompliant: true
      },
      {
        id: 'digital-marketing',
        index: 3,
        name: 'Mẫu CV Digital Marketing',
        badge: 'Marketing & Growth',
        category: 'creative',
        description: 'Bố cục hiện đại giúp trình bày chiến dịch quảng cáo, ROI, traffic và kỹ năng SEO/Ads.',
        imageUrl: 'assets/templates/07_CV_ATS_Hien_Dai_Digital_Marketing_Executive.png',
        style: 'Marketing & Truyền Thông',
        atsCompliant: true
      },
      {
        id: 'data-analyst',
        index: 4,
        name: 'Mẫu CV Data Analyst (Phân Tích Dữ Liệu)',
        badge: 'Dữ Liệu & Tech',
        category: 'ats',
        description: 'Chuẩn ATS 1 cột tập trung vào SQL, Python, PowerBI và kết quả phân tích dữ liệu.',
        imageUrl: 'assets/templates/09_CV_ATS_Tieu_Chuan_Data_Analyst_Phan_Tich_Du_Lieu.png',
        style: 'Công Nghệ & Dữ Liệu',
        atsCompliant: true
      },
      {
        id: 'hr-generalist',
        index: 5,
        name: 'Mẫu CV Nhân Sự (HR Generalist)',
        badge: 'Hành Chính & Nhân Sự',
        category: 'professional',
        description: 'Phong cách tinh gọn, lịch sự, tối ưu cho tuyển dụng, C&B và đào tạo nội bộ.',
        imageUrl: 'assets/templates/06_CV_ATS_Don_Gian_Nhan_Su_HR_Generalist.png',
        style: 'Nhân Sự & Quản Trị',
        atsCompliant: true
      },
      {
        id: 'fullstack-dev',
        index: 6,
        name: 'Mẫu CV Kỹ Sư Phần Mềm (Dev)',
        badge: 'Software Engineer',
        category: 'professional',
        description: 'Cấu trúc chuyên nghiệp cho Backend/Fullstack Developer, kiến trúc hệ thống và CI/CD.',
        imageUrl: 'assets/templates/20_CV_ATS_Dev_Lap_Trinh_Vien_dev_1.png',
        style: 'Công Nghệ Thông Tin',
        atsCompliant: true
      },
      {
        id: 'junior-audit',
        index: 7,
        name: 'Mẫu CV Kế Toán & Kiểm Toán',
        badge: 'Chuẩn ATS Tài Chính',
        category: 'ats',
        description: 'Trình bày mạch lạc chứng chỉ nghề nghiệp, nghiệp vụ kiểm toán và báo cáo tài chính.',
        imageUrl: 'assets/templates/02_CV_ATS_Junior_Audit_Ke_Toan_Nguyen_Minh_Trang.png',
        style: 'Kế Toán & Kiểm Toán',
        atsCompliant: true
      },
      {
        id: 'uiux-designer',
        index: 8,
        name: 'Mẫu CV Thiết Kế UI/UX & Product',
        badge: 'Product & Design',
        category: 'creative',
        description: 'Cân bằng giữa thẩm mỹ và chuẩn ATS, làm bật tư duy sản phẩm, Figma và Design System.',
        imageUrl: 'assets/templates/13_CV_ATS_Thiet_Ke_UI_UX_Product_Designer.png',
        style: 'Thiết Kế UI/UX',
        atsCompliant: true
      },
      {
        id: 'project-manager',
        index: 9,
        name: 'Mẫu CV Quản Lý Dự Án (Harvard)',
        badge: 'Phong cách Harvard',
        category: 'academic',
        description: 'Chuẩn học thuật & quản trị quốc tế, tôn lên năng lực điều phối tiến độ và ngân sách.',
        imageUrl: 'assets/templates/04_CV_ATS_Harvard_Standard_Classic_Quan_Ly_Du_An.png',
        style: 'Quản Lý Dự Án',
        atsCompliant: true
      },
      {
        id: 'banking-credit',
        index: 10,
        name: 'Mẫu CV Tài Chính & Ngân Hàng',
        badge: 'Tín Dụng & Đầu Tư',
        category: 'professional',
        description: 'Bố cục trang trọng, phù hợp chuyên viên quan hệ khách hàng, thẩm định tín dụng.',
        imageUrl: 'assets/templates/11_CV_ATS_Ngan_Hang_Tin_Dung.png',
        style: 'Tài Chính & Ngân Hàng',
        atsCompliant: true
      },
      {
        id: 'content-leader',
        index: 11,
        name: 'Mẫu CV Content & Sáng Tạo',
        badge: 'Truyền Thông & Nội Dung',
        category: 'creative',
        description: 'Font chữ sắc nét, nổi bật thành tích chiến dịch nội dung, thương hiệu và dẫn dắt team.',
        imageUrl: 'assets/templates/03_CV_ATS_An_Tuong_6_Tran_Manh_Dung_Content_Leader.png',
        style: 'Truyền Thông & Sáng Tạo',
        atsCompliant: true
      }
    ];

    const likeRecords = db.get('cvTemplateLikes') || [];
    const likeMap = new Map(likeRecords.map(item => [String(item.id), Number(item.likes || 0)]));
    const enriched = templates.map(tpl => ({
      ...tpl,
      likes: likeMap.get(String(tpl.id)) || 0
    }));

    return res.json({
      success: true,
      count: enriched.length,
      templates: enriched
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh mục template.' });
  }
});

/**
 * @route   POST /api/cv/templates/:id/like
 * @desc    Ghi nhận lượt yêu thích hoặc sử dụng mẫu CV và lưu vào store
 */
router.post('/templates/:id/like', (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) {
      return res.status(400).json({ success: false, message: 'Thiếu mã mẫu CV.' });
    }
    const action = req.body && req.body.action ? String(req.body.action) : 'like';
    const delta = action === 'unlike' ? -1 : 1;

    const list = db.get('cvTemplateLikes');
    const existing = list.find(item => String(item.id) === id);
    let nextLikes = 0;

    if (existing) {
      nextLikes = Math.max(0, Number(existing.likes || 0) + delta);
      db.update('cvTemplateLikes', item => String(item.id) === id, {
        likes: nextLikes,
        updatedAt: new Date().toISOString()
      });
    } else {
      nextLikes = Math.max(0, delta);
      db.insert('cvTemplateLikes', {
        id,
        likes: nextLikes,
        updatedAt: new Date().toISOString()
      });
    }

    return res.json({ success: true, id, likes: nextLikes });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật lượt yêu thích mẫu CV.' });
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

/**
 * @route   POST /api/cv/ai-agent
 * @desc    Sandboxed AI Agent v3.0 chỉnh sửa trực tiếp CV trên /cv-editor (Durable Quota + Multi-clause + Contrast Guard)
 */
router.post('/ai-agent', optionalAuth, async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    const identity = resolveCallerIdentity(req);
    const result = await processCvEditorAgent(req.body, {
      checkBurst: () => checkBurstRateLimit(req, res, 'cv-ai-agent'),
      canUseLlm: () => canConsumeDailyLlmQuota(identity),
      onLlmUsed: () => recordLlmConsumption(identity)
    });
    return res.status(result.status).json(result.body);
  } catch {
    console.error('[POST /api/cv/ai-agent] AGENT_INTERNAL_ERROR');
    return res.status(503).json({ success: false, code: 'AGENT_UNAVAILABLE', message: 'Trợ lý AI Agent hiện đang bận. Vui lòng thử lại sau ít giây.' });
  }
});

router._internals = {
  polishBullet,
  polishBulletList,
  polishObjective,
  hasExactSameNumbers,
  extractKeywordsFromJD
};

module.exports = router;
