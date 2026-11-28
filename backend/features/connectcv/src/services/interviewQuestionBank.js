'use strict';

const crypto = require('node:crypto');
const meta = require('../../assets/interview-bank/catalog.json');
const seed = require('../../assets/interview-bank/seed.json');
const STATUS = 'editorial_draft';
const normalize = value => typeof value === 'string' ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() : '';
const industries = new Map(meta.industries.map(row => [row.id, row]));
const levels = new Set(meta.levels.map(row => row.id));
const validText = (value, min, max) => typeof value === 'string' && value.trim().length >= min && value.length <= max;
const validList = (value, min = 1) => Array.isArray(value) && value.length >= min && value.length <= 12 && value.every(x => validText(x, 3, 600));
const copy = value => JSON.parse(JSON.stringify(value));

const STOP_WORDS = new Set([
  'va', 'cua', 'trong', 'cho', 'voi', 'mot', 'cac', 'nhu', 'the', 'nao', 'khi', 'ban', 'co', 'khong',
  'de', 'la', 'duoc', 'tu', 've', 'nay', 'do', 'se', 'da', 'nhung', 'hay', 'hoac', 'neu', 'thi', 'tai',
  'sau', 'truoc', 'hon', 'nhat', 'nhieu', 'it', 'moi', 'tung', 'nhau', 'ra', 'vao', 'len', 'xuong',
  'vi', 'sao', 'lam', 'cach', 'dung', 'su', 'viec', 'cong', 'ty', 'tri', 'kinh', 'nghiem', 'nam',
  'and', 'for', 'with', 'how', 'what', 'when', 'where', 'why', 'you', 'your', 'are', 'from', 'that',
  'this', 'have', 'has', 'will', 'can', 'not', 'but', 'into', 'about', 'using', 'used', 'work', 'role',
  'job', 'years', 'experience', 'team', 'senior', 'junior', 'middle', 'fresher', 'lead', 'intern'
]);

const SUBTRACKS = {
  js_frontend: ['javascript', 'js', 'react', 'vue', 'angular', 'frontend', 'front end', 'typescript', 'css', 'html', 'dom', 'closure', 'spread', 'nullish', 'const', 'undefined', 'map', 'nextjs', 'tailwind'],
  backend_api_db: ['backend', 'back end', 'api', 'rest', 'http', 'sql', 'postgresql', 'postgres', 'mysql', 'database', 'transaction', 'webhook', 'cache', 'queue', 'microservices', 'outbox', 'join', 'index', 'btree', 'pagination', 'nodejs', 'node', 'java', 'python', 'golang', 'spring', 'dotnet', 'express', 'graphql'],
  qa_testing: ['qa', 'tester', 'test', 'testing', 'unit test', 'integration test', 'flaky', 'mock', 'automation', 'bug', 'reproduction', 'regression', 'playwright', 'selenium', 'cypress'],
  devops_infra: ['devops', 'sre', 'docker', 'kubernetes', 'k8s', 'ci cd', 'cicd', 'deploy', 'backup', 'restore', 'load test', 'sli', 'slo', 'timeout', 'monitoring', 'terraform', 'ansible', 'linux', 'cloud', 'sysadmin', 'system admin'],
  cyber_soc_ir: ['soc', 'siem', 'wazuh', 'splunk', 'elk', 'qradar', 'alert', 'triage', 'incident', 'ir', 'nist', 'edr', 'malware', 'ransomware', 'forensic', 'pcap', 'wireshark', 'threat hunting', 'log', 'blue team', 'containment', 'phishing', 'spf', 'dkim', 'dmarc', 'ioc', 'mttd', 'mttr'],
  cyber_appsec_pentest: ['pentest', 'pentester', 'penetration', 'burp', 'burp suite', 'owasp', 'sqli', 'sql injection', 'xss', 'idor', 'ssrf', 'jwt', 'waf', 'appsec', 'sast', 'dast', 'sca', 'devsecops', 'bug bounty', 'vdp', 'stride', 'threat modeling', 'web security', 'csrf', 'cve', 'exploit', 'kali', 'nmap'],
  cyber_cloud_network_ad: ['cloud security', 'aws', 'gcp', 'azure', 'iam', 'zero trust', 'firewall', 'ids', 'ips', 'tls', 'https', 'ssh', 'active directory', 'kerberoasting', 'lsass', 'red team', 'purple team', 'mitre', 'att ck', 'tiering', 'kms', 'cryptography', 'hashing', 'encryption', 'secrets', 'supply chain', 'sbom', 'mfa'],
  cyber_grc_lead: ['grc', 'iso 27001', 'soc 2', 'pci', 'compliance', 'risk', 'ciso', 'roadmap', 'vendor', 'tprm', 'budget', 'tabletop', 'board', 'governance', 'audit', 'security champions', 'chinh sach', 'tuan thu'],
  marketing_seo_content: ['seo', 'content', 'blog', 'copywriting', 'social', 'organic', 'keyword', 'editorial', 'bien tap'],
  marketing_perf_brand: ['ads', 'performance', 'facebook ads', 'google ads', 'roas', 'ctr', 'brand', 'pr', 'campaign', 'funnel', 'crm', 'email marketing']
};

const CYBER_STRONG_SIGNALS = [
  'cybersecurity', 'cyber security', 'an toan thong tin', 'an ninh mang', 'infosec', 'information security',
  'soc analyst', 'soc', 'siem', 'wazuh', 'splunk', 'pentest', 'pentester', 'penetration test', 'burp suite',
  'owasp', 'appsec', 'devsecops', 'red team', 'blue team', 'purple team', 'threat hunting', 'incident response',
  'malware', 'ransomware', 'forensics', 'wireshark', 'nmap', 'mitre', 'zero trust', 'edr', 'firewall',
  'ids ips', 'kerberoasting', 'lsass', 'bug bounty', 'vulnerability assessment', 'cloud security',
  'network security', 'security engineer', 'security analyst', 'chuyen vien bao mat', 'ky su bao mat',
  'bao mat mang', 'bao mat ung dung', 'ciso', 'grc', 'iso 27001', 'ctf'
];

const PURE_SWE_TITLE_SIGNALS = [
  'software engineer', 'software developer', 'frontend', 'front end', 'backend developer', 'backend engineer',
  'fullstack', 'full stack', 'web developer', 'mobile developer', 'ios developer', 'android developer',
  'react developer', 'node developer', 'java developer', 'python developer', 'lap trinh vien',
  'qa engineer', 'qa tester', 'software tester', 'manual tester', 'automation tester', 'data engineer', 'ai engineer', 'system admin'
];

// Extra JD domain cues so generic titles like "Chuyên viên" + domain JD (e.g. nursing JD) accurately detect the domain!
const JD_EXTRA_DOMAIN_SIGNALS = {
  'healthcare-medical': ['benh nhan', 'nguoi benh', 'dieu duong', 'y lenh', 'benh an', 'phac do', 'kiem soat nhiem khuan', 'khoa lam sang', 'tiem truyen', 'sinh ton', 'nha thuoc', 'duoc lam sang'],
  'data-analytics': ['power bi', 'tableau', 'dashboard', 'phan tich so lieu', 'data warehouse', 'cohort', 'a b test', 'ab test'],
  'product-project': ['user story', 'product backlog', 'acceptance criteria', 'roadmap san pham', 'sprint planning', 'stakeholder'],
  'engineering-manufacturing': ['ban ve ky thuat', 'autocad', 'cnc', 'cong truong', 'an toan lao dong', 'day chuyen san xuat', 'plc', 'bao tri may'],
  'logistics-supply-chain': ['incoterms', 'to khai hai quan', 'bill of lading', 'packing list', 'xuat nhap khau', 'ton kho', 'wms'],
  'legal-real-estate': ['hop dong thuong mai', 'phap ly du an', 'so hong', 'quy hoach', 'tranh chap', 'cong chung']
};

function stringifyProfile(profile) {
  if (!profile) return '';
  if (typeof profile === 'string') return profile.slice(0, 3000);
  if (typeof profile === 'object') {
    try {
      const parts = [];
      for (const [k, v] of Object.entries(profile)) {
        if (/avatar|photo|email|phone|address|password|secret|token|fullName|name/i.test(k)) continue;
        if (typeof v === 'string') parts.push(v);
        else if (Array.isArray(v)) parts.push(v.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '));
        else if (v && typeof v === 'object') parts.push(JSON.stringify(v));
      }
      return parts.join(' ').slice(0, 3000);
    } catch { return ''; }
  }
  return '';
}

function hasPhrase(paddedNormalizedText, phrase) {
  const clean = normalize(phrase);
  return Boolean(clean && paddedNormalizedText.includes(` ${clean} `));
}

function tokenizeMeaningful(text) {
  const norm = normalize(text);
  if (!norm) return [];
  const words = norm.split(' ').filter(w => w.length >= 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
  return [...new Set(words)];
}

function normalizeLevel(value) {
  const key = normalize(value);
  if (!key) return null;
  const aliases = {
    intern: 'fresher',
    internship: 'fresher',
    'thuc tap': 'fresher',
    'thuc tap sinh': 'fresher',
    'sinh vien': 'fresher',
    'entry level': 'fresher',
    entry: 'fresher',
    'moi vao nghe': 'fresher',
    'moi ra truong': 'fresher',
    'chua co kinh nghiem': 'fresher',
    '0 nam': 'fresher',
    fresher: 'fresher',
    junior: 'junior',
    jr: 'junior',
    '1 nam': 'junior',
    '2 nam': 'junior',
    '1 2 nam': 'junior',
    mid: 'middle',
    middle: 'middle',
    'mid level': 'middle',
    intermediate: 'middle',
    'junior mid': 'middle',
    '2 4 nam': 'middle',
    '3 nam': 'middle',
    '4 nam': 'middle',
    senior: 'senior',
    sr: 'senior',
    expert: 'senior',
    'chuyen gia': 'senior',
    'cao cap': 'senior',
    '5 nam': 'senior',
    '6 nam': 'senior',
    '7 nam': 'senior',
    '8 nam': 'senior',
    'tren 5 nam': 'senior',
    lead: 'lead',
    'team lead': 'lead',
    'tech lead': 'lead',
    leader: 'lead',
    manager: 'lead',
    'truong nhom': 'lead',
    'truong phong': 'lead',
    'quan ly': 'lead',
    head: 'lead',
    director: 'lead',
    'giam doc': 'lead',
    principal: 'lead',
    staff: 'lead'
  };
  if (aliases[key]) return aliases[key];
  const yrMatch = key.match(/^(\d{1,2})\s*nam(?:\s+kinh\s+nghiem)?$/);
  if (yrMatch) {
    const yrs = parseInt(yrMatch[1], 10);
    if (yrs === 0) return 'fresher';
    if (yrs <= 2) return 'junior';
    if (yrs <= 4) return 'middle';
    if (yrs <= 7) return 'senior';
    return 'lead';
  }
  return null;
}

function normalizeIndustry(value) {
  const key = normalize(value);
  if (!key) return null;
  const matches = meta.industries.filter(row => [row.id, row.label, ...row.aliases].some(alias => normalize(alias) === key));
  if (matches.length === 1) return matches[0].id;
  if (matches.length > 1) {
    const byIdMatch = matches.find(m => normalize(m.id) === key);
    if (byIdMatch) return byIdMatch.id;
    return matches[0].id;
  }
  return null;
}

function resolveIndustry(jobTitle) {
  const exact = normalizeIndustry(jobTitle);
  if (exact) return exact;
  const title = ` ${normalize(jobTitle)} `;
  if (!title.trim() || title.trim().length > 300) return null;
  const matchedEntries = meta.industries
    .filter(row => row.id !== 'general-professional')
    .map(row => {
      const matchedAliases = row.aliases.map(normalize).filter(a => hasPhrase(title, a));
      const maxLen = matchedAliases.reduce((mx, a) => Math.max(mx, a.length), 0);
      const maxWords = matchedAliases.reduce((mx, a) => Math.max(mx, a.split(' ').length), 0);
      return { id: row.id, aliases: matchedAliases, maxLen, maxWords };
    })
    .filter(entry => entry.aliases.length > 0);
  if (matchedEntries.length === 1) return matchedEntries[0].id;
  if (matchedEntries.length > 1) {
    matchedEntries.sort((a, b) => (b.maxWords - a.maxWords) || (b.maxLen - a.maxLen) || (b.aliases.length - a.aliases.length));
    return matchedEntries[0].id;
  }
  return null;
}

function resolveIndustryFromContext({ industry, jobTitle = '', jdText = '', candidateProfile = '', allowRefinement = false } = {}) {
  const explicit = normalizeIndustry(industry);
  const profileStr = stringifyProfile(candidateProfile);
  const titleNorm = ` ${normalize(jobTitle)} `;
  const combinedNorm = ` ${normalize(`${jobTitle} ${jdText} ${profileStr}`)} `;

  if (explicit === 'software-engineering' && allowRefinement) {
    const titleResolved = resolveIndustry(jobTitle);
    const hasPureSweTitle = PURE_SWE_TITLE_SIGNALS.some(sig => hasPhrase(titleNorm, sig));
    if (titleResolved === 'cybersecurity' && !hasPureSweTitle) return 'cybersecurity';
    if (!hasPureSweTitle) {
      const cyberHits = CYBER_STRONG_SIGNALS.filter(sig => hasPhrase(combinedNorm, sig)).length;
      if (cyberHits >= 2) return 'cybersecurity';
    }
  }
  if (explicit) return explicit;

  const fromTitle = resolveIndustry(jobTitle);
  if (fromTitle) return fromTitle;

  const contextNorm = ` ${normalize(`${jdText} ${profileStr}`)} `;
  if (contextNorm.trim().length >= 6) {
    const scored = meta.industries
      .filter(row => row.id !== 'general-professional')
      .map(row => {
        const aliasHits = new Set(row.aliases.filter(alias => hasPhrase(combinedNorm, alias)).map(normalize)).size;
        const extraDomainSignals = JD_EXTRA_DOMAIN_SIGNALS[row.id] || [];
        const extraHits = extraDomainSignals.filter(sig => hasPhrase(combinedNorm, sig)).length;
        const extraCyber = row.id === 'cybersecurity'
          ? CYBER_STRONG_SIGNALS.filter(sig => hasPhrase(combinedNorm, sig)).length
          : 0;
        return { id: row.id, score: aliasHits * 2 + extraHits * 2 + extraCyber };
      })
      .sort((a, b) => b.score - a.score);

    if (scored[0] && scored[0].score >= 2 && (!scored[1] || scored[0].score > scored[1].score)) {
      return scored[0].id;
    }
    if (normalize(jdText).length >= 25) {
      return 'general-professional';
    }
  }
  return null;
}

function validateRecord(row) {
  const errors = [];
  if (!row || typeof row !== 'object' || Array.isArray(row)) return ['RECORD_OBJECT_REQUIRED'];
  if (!validText(row.id, 3, 90) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.id)) errors.push('INVALID_ID');
  if (!industries.has(row.industry)) errors.push('INVALID_INDUSTRY');
  if (!levels.has(row.level)) errors.push('INVALID_LEVEL');
  if (!validText(row.topic, 3, 80) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.topic)) errors.push('INVALID_TOPIC');
  if (!validText(row.question, 20, 800)) errors.push('INVALID_QUESTION');
  if (!validText(row.answerSample, 80, 2400)) errors.push('INVALID_ANSWER');
  if (!['knowledge', 'scenario', 'behavioral'].includes(row.answerType)) errors.push('INVALID_ANSWER_TYPE');
  if (!validList(row.keyPoints, 2)) errors.push('INVALID_KEY_POINTS');
  if (!validList(row.redFlags)) errors.push('INVALID_RED_FLAGS');
  if (!validList(row.evidencePrompts)) errors.push('INVALID_EVIDENCE_PROMPTS');
  if (row.reviewStatus !== STATUS) errors.push('UNSUPPORTED_REVIEW_STATUS');
  if (!row.provenance || row.provenance.kind !== 'editorial' || !Array.isArray(row.provenance.referenceUrls) || row.provenance.referenceUrls.length > 8 || row.provenance.referenceUrls.some(url => {
    try { const parsed = new URL(url); return parsed.protocol !== 'https:' || parsed.username || parsed.password; } catch { return true; }
  })) errors.push('INVALID_PROVENANCE');
  return errors;
}

function validateImport(rows) {
  if (!Array.isArray(rows) || rows.length > 100000) return { valid: false, errors: [{ index: null, codes: ['RECORD_ARRAY_REQUIRED_OR_LIMIT_EXCEEDED'] }] };
  const ids = new Set(), questions = new Set(), errors = [];
  rows.forEach((row, index) => {
    const codes = validateRecord(row);
    if (row && typeof row === 'object') {
      if (ids.has(row.id)) codes.push('DUPLICATE_ID');
      ids.add(row.id);
      const questionKey = normalize(row.question);
      if (questions.has(questionKey)) codes.push('DUPLICATE_QUESTION');
      questions.add(questionKey);
    }
    if (codes.length) errors.push({ index, codes });
  });
  return { valid: errors.length === 0, errors };
}

const records = seed.records.map(row => ({
  ...row,
  reviewStatus: STATUS,
  evidencePrompts: row.evidencePrompts || ['Nếu nêu kinh nghiệm, dùng bối cảnh, phần việc và bằng chứng thật của bạn; nói rõ khi chưa từng thực hiện.'],
  provenance: {
    kind: 'editorial',
    referenceUrls: row.referenceUrls || [],
    note: 'Biên soạn để luyện tập; tài liệu tham khảo hỗ trợ khái niệm, không chứng minh tần suất tuyển dụng.'
  }
}));
const checked = validateImport(records);
if (!checked.valid) throw new Error('INTERVIEW_BANK_INVALID_SEED: ' + JSON.stringify(checked.errors));
const byId = new Map(records.map(row => [row.id, row]));
const byPair = new Map();
const rowIndexMeta = new Map();
for (const row of records) {
  const key = `${row.industry}/${row.level}`;
  if (!byPair.has(key)) byPair.set(key, []);
  byPair.get(key).push(row);
  const fullText = ` ${normalize(`${row.topic} ${row.question} ${(row.keyPoints || []).join(' ')} ${row.answerSample}`)} `;
  const questionNorm = ` ${normalize(`${row.topic} ${row.question}`)} `;
  const matchedTracks = Object.entries(SUBTRACKS)
    .filter(([, terms]) => terms.some(t => hasPhrase(fullText, t)))
    .map(([name]) => name);
  const isPureJsTrivia = questionNorm.includes(' trong javascript ') || /\b(closure|const reference|strict equality objects|nullish default values|spread shallow|map result return)\b/.test(questionNorm);
  rowIndexMeta.set(row.id, { fullText, tokens: new Set(tokenizeMeaningful(fullText)), tracks: new Set(matchedTracks), isPureJsTrivia });
}
function pairRows(industry, level) { return byPair.get(`${industry}/${level}`) || []; }

function catalog() {
  const coverage = meta.industries.flatMap(industry => meta.levels.map(level => {
    const count = pairRows(industry.id, level.id).length;
    return { industry: industry.id, level: level.id, draftCount: count, reviewedCount: 0, target: meta.targetPerIndustryLevel, remainingReviewed: meta.targetPerIndustryLevel, remainingAuthored: Math.max(0, meta.targetPerIndustryLevel - count), targetMet: false };
  }));
  return {
    schemaVersion: meta.schemaVersion,
    language: meta.language,
    industries: copy(meta.industries),
    levels: copy(meta.levels),
    targetPerIndustryLevel: meta.targetPerIndustryLevel,
    totalTarget: meta.industries.length * meta.levels.length * meta.targetPerIndustryLevel,
    totalDrafts: records.length,
    totalReviewed: 0,
    targetMet: false,
    status: 'SEED_ONLY_EXPANSION_AND_REVIEW_PENDING',
    disclosure: meta.disclosure,
    answerPolicy: meta.answerPolicy,
    coverage
  };
}

function listQuestions({ industry, level, topic, search, offset = 0, limit = 20, status = STATUS } = {}) {
  const industryId = normalizeIndustry(industry), levelId = normalizeLevel(level);
  const pageOffset = Number.isSafeInteger(Number(offset)) && Number(offset) >= 0 ? Math.min(Number(offset), 100000) : 0;
  const pageLimit = Number.isSafeInteger(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;
  const query = normalize(typeof search === 'string' ? search.slice(0, 150) : '').split(' ').filter(Boolean);
  const rows = industryId && levelId && status === STATUS ? pairRows(industryId, levelId).filter(row =>
    (topic === undefined || row.topic === topic) && query.every(word => normalize(`${row.question} ${row.topic}`).includes(word))) : [];
  return { items: copy(rows.slice(pageOffset, pageOffset + pageLimit)), total: rows.length, offset: pageOffset, limit: pageLimit, nextOffset: pageOffset + pageLimit < rows.length ? pageOffset + pageLimit : null, industry: industryId, level: levelId, reviewStatus: STATUS, disclosure: meta.disclosure };
}

function getQuestion(id, scope) {
  if (typeof id !== 'string' || id.length > 90) return null;
  const row = byId.get(id);
  if (!row) return null;
  if (scope && (normalizeIndustry(scope.industry) !== row.industry || normalizeLevel(scope.level) !== row.level)) return null;
  return copy(row);
}

function scoreRowForProfile(row, profileCtx) {
  const metaRow = rowIndexMeta.get(row.id);
  if (!metaRow) return 0;
  let score = 0;
  for (const tok of profileCtx.titleTokens) {
    if (metaRow.tokens.has(tok) || hasPhrase(metaRow.fullText, tok)) score += 5;
  }
  for (const tok of profileCtx.detailTokens) {
    if (metaRow.tokens.has(tok)) score += 3;
  }
  for (const track of profileCtx.activeTracks) {
    if (metaRow.tracks.has(track)) score += 8;
  }
  if (metaRow.isPureJsTrivia && !profileCtx.activeTracks.has('js_frontend') && profileCtx.activeTracks.size > 0) {
    score -= 12;
  }
  return score;
}

function selectQuestion({ industry, level, excludeIds = [], excludeTopics = [], seed: selectionSeed, jobTitle = '', jdText = '', candidateProfile = '', preferFoundational = false } = {}) {
  const industryId = normalizeIndustry(industry), levelId = normalizeLevel(level);
  if (!industryId || !levelId) return null;
  const ids = new Set(Array.isArray(excludeIds) ? excludeIds.filter(x => typeof x === 'string').slice(0, 10000) : []);
  const topics = new Set(Array.isArray(excludeTopics) ? excludeTopics.filter(x => typeof x === 'string').slice(0, 1000) : []);
  const available = pairRows(industryId, levelId).filter(row => !ids.has(row.id) && !topics.has(row.topic));
  if (!available.length) return null;

  // Stage 1 Opening: start every fresh session with the natural Self-Introduction & Role Motivation question!
  if (ids.size === 0 && !selectionSeed && !preferFoundational) {
    const introQ = available.find(r => r.topic === 'opening-self-intro');
    if (introQ) return copy(introQ);
  }

  // When stepping down after consecutive skips, prioritize shorter, approachable foundational/behavioral questions
  if (preferFoundational) {
    const gentlePool = available
      .filter(r => r.topic !== 'opening-self-intro')
      .sort((a, b) => {
        const aEasy = (a.answerType === 'behavioral' ? 0 : 1);
        const bEasy = (b.answerType === 'behavioral' ? 0 : 1);
        if (aEasy !== bEasy) return aEasy - bEasy;
        return a.question.length - b.question.length;
      });
    if (gentlePool.length) return copy(gentlePool[0]);
  }

  // Alternate naturally between domain/technical questions and HR behavioral STAR questions across turns
  const turnNum = ids.size;
  let stagePreferred = available;
  if (turnNum >= 1 && turnNum <= 2) {
    const domainFirst = available.filter(r => !r.topic.startsWith('hr-'));
    if (domainFirst.length) stagePreferred = domainFirst;
  } else if (turnNum === 3 || turnNum === 6 || turnNum === 9) {
    const behavioralFirst = available.filter(r => r.answerType === 'behavioral');
    if (behavioralFirst.length) stagePreferred = behavioralFirst;
  }

  const profileStr = stringifyProfile(candidateProfile);
  const titleNorm = normalize(jobTitle);
  const jdNorm = normalize(jdText);
  const profNorm = normalize(profileStr);
  const contextText = [titleNorm, jdNorm, profNorm].filter(Boolean).join(' ');

  if (!contextText && !(typeof selectionSeed === 'string' && selectionSeed.length <= 200)) {
    return copy(stagePreferred[0]);
  }

  let candidatePool = stagePreferred;
  if (contextText) {
    const paddedContext = ` ${contextText} `;
    const titleTokens = tokenizeMeaningful(titleNorm);
    const titleSet = new Set(titleTokens);
    const detailTokens = tokenizeMeaningful(`${jdNorm} ${profNorm}`).filter(t => !titleSet.has(t));
    const activeTracks = new Set(
      Object.entries(SUBTRACKS)
        .filter(([, terms]) => terms.some(t => hasPhrase(paddedContext, t)))
        .map(([name]) => name)
    );
    const profileCtx = { titleTokens, detailTokens, activeTracks };
    const scored = stagePreferred.map((row, idx) => ({ row, idx, score: scoreRowForProfile(row, profileCtx) }));
    scored.sort((a, b) => (b.score - a.score) || (a.idx - b.idx));
    const topScore = scored[0].score;
    if (topScore > 0) {
      const floor = Math.max(topScore - 4, Math.ceil(topScore * 0.7));
      candidatePool = scored.filter(item => item.score >= floor).map(item => item.row);
    } else {
      const nonPenalized = scored.filter(item => item.score >= 0).map(item => item.row);
      candidatePool = nonPenalized.length ? nonPenalized : stagePreferred;
    }
  }

  const effectiveSeed = typeof selectionSeed === 'string' && selectionSeed.length <= 200
    ? selectionSeed
    : (contextText ? `${industryId}|${levelId}|${turnNum}|${titleNorm}|${jdNorm.slice(0, 300)}|${profNorm.slice(0, 300)}` : '');

  const index = effectiveSeed
    ? crypto.createHash('sha256').update(effectiveSeed).digest().readUInt32BE(0) % candidatePool.length
    : 0;
  return copy(candidatePool[index]);
}

module.exports = {
  catalog,
  listQuestions,
  selectQuestion,
  getQuestion,
  pairRows,
  resolveIndustry,
  resolveIndustryFromContext,
  normalizeIndustry,
  normalizeLevel,
  validateRecord,
  validateImport
};
