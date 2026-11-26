'use strict';

const Joi = require('joi');
const bank = require('./interviewQuestionBank');
const policy = require('./interviewTurnPolicy');

const historyItem = Joi.object({
  role: Joi.string().valid('interviewer', 'candidate', 'assistant', 'user').required(),
  message: Joi.string().allow('').max(4000),
  content: Joi.string().allow('').max(4000),
  questionId: Joi.string().max(120)
}).or('message', 'content');

const schema = Joi.object({
  action: Joi.string().valid('start', 'reply', 'skip'),
  jobTitle: Joi.string().allow('').max(150).default(''),
  industry: Joi.string().allow('').max(70),
  level: Joi.string().valid('intern', 'fresher', 'junior', 'middle', 'senior', 'lead').default('fresher'),
  message: Joi.string().allow('').max(3000),
  userMessage: Joi.string().allow('').max(3000),
  jdText: Joi.string().allow('').max(5000).default(''),
  candidateProfile: Joi.alternatives().try(Joi.string().allow('').max(3000), Joi.object()).optional(),
  history: Joi.array().items(historyItem).max(100),
  conversationHistory: Joi.array().items(historyItem).max(100),
  currentQuestionId: Joi.string().allow(null, '').max(120),
  askedQuestionIds: Joi.array().items(Joi.string().max(120)).max(1000).default([]),
  skippedTopics: Joi.array().items(Joi.string().max(80)).max(1000).default([]),
  followUpDepth: Joi.number().integer().min(0).max(2).default(0)
}).required();

function invalid(field, message) {
  return { success: false, code: 'INTERVIEW_INPUT_INVALID', message, fieldErrors: { [field]: message } };
}

function prepareLiveInput(body) {
  const checked = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (checked.error) {
    return { error: invalid(String(checked.error.details[0].path[0] || 'message'), 'Kiểm tra câu trả lời, ngành, cấp độ và lịch sử phỏng vấn.') };
  }
  const value = checked.value;
  if (value.level === 'intern') value.level = 'fresher';
  const history = value.history || value.conversationHistory || [];
  const answer = (value.userMessage || value.message || '').trim();
  value.action = value.action || (!answer && !history.length ? 'start' : 'reply');
  const rawIndustry = typeof value.industry === 'string' ? value.industry.trim() : '';
  if (rawIndustry && !bank.normalizeIndustry(rawIndustry)) {
    return { error: invalid('industry', 'Chọn ngành phù hợp trước khi bắt đầu; hệ thống không tự gán mọi vị trí thành IT.') };
  }
  value.industry = bank.resolveIndustryFromContext({
    industry: rawIndustry,
    jobTitle: value.jobTitle,
    jdText: value.jdText,
    candidateProfile: value.candidateProfile,
    allowRefinement: value.action === 'start'
  });
  const sectors = bank.catalog().industries;
  if (!value.industry || !sectors.some(s => s.id === value.industry)) {
    return { error: invalid('industry', 'Chọn ngành phù hợp trước khi bắt đầu; hệ thống không tự gán mọi vị trí thành IT.') };
  }
  if (value.action === 'reply' && !answer) {
    return { error: invalid('message', 'Nhập câu trả lời hoặc chọn Bỏ qua câu này.') };
  }
  const current = value.currentQuestionId ? bank.getQuestion(value.currentQuestionId) : null;
  if (value.currentQuestionId && (!current || current.industry !== value.industry || current.level !== value.level)) {
    return { error: invalid('currentQuestionId', 'Câu hỏi không thuộc ngành và cấp độ của phiên hiện tại. Hãy bắt đầu lại phiên.') };
  }
  const last = [...history].reverse().find(h => ['interviewer', 'assistant'].includes(h.role));
  if (value.action !== 'start' && !current && !last) {
    return { error: invalid('history', 'Chưa có câu hỏi để đánh giá. Hãy bắt đầu phiên trước.') };
  }
  const ids = new Set(value.action === 'start' ? [] : value.askedQuestionIds);
  for (const h of value.action === 'start' ? [] : history) {
    if (h.questionId) ids.add(h.questionId);
  }
  if (current) ids.add(current.id);
  const intent = value.action === 'skip' ? { type: 'skip' } : policy.detectTurnIntent(answer);
  const skippedTopics = new Set(value.action === 'start' ? [] : value.skippedTopics);
  if (current && intent.type !== 'answer') skippedTopics.add(current.topic);
  const next = bank.selectQuestion({
    industry: value.industry,
    level: value.level,
    excludeIds: [...ids],
    excludeTopics: [...skippedTopics, ...(current ? [current.topic] : [])],
    jobTitle: value.jobTitle,
    jdText: value.jdText,
    candidateProfile: value.candidateProfile
  });
  const allowFollowUp = Boolean(value.action === 'reply' && intent.type === 'answer' && current && value.followUpDepth === 0 && answer.length >= 25);
  value.message = answer;
  value.history = history;
  return {
    value,
    plan: {
      current,
      next,
      intent,
      allowFollowUp,
      question: current?.question || (last?.message || last?.content || '').slice(0, 1500),
      askedQuestionIds: [...ids],
      skippedTopics: [...skippedTopics],
      local: value.action === 'start' || intent.type !== 'answer'
    }
  };
}

function questionView(q) {
  return q ? { id: q.id, question: q.question, topic: q.topic, industry: q.industry, level: q.level } : null;
}

function decorateTurn(data, input, plan) {
  if (data && data.isFollowUp && plan.current) {
    const cur = questionView(plan.current);
    return {
      ...data,
      currentQuestion: cur,
      askedQuestionIds: [...new Set([...plan.askedQuestionIds, cur.id])].slice(-1000),
      skippedTopics: plan.skippedTopics,
      followUpDepth: Math.min(2, (input.followUpDepth || 0) + 1),
      sessionComplete: false,
      industry: input.industry,
      level: input.level,
      bankStatus: 'editorial_draft',
      assessmentNotice: 'Nhận xét AI dùng để luyện tập; trích dẫn đúng nguồn chưa chứng minh đánh giá chuyên môn là đúng.'
    };
  }
  const next = questionView(plan.next);
  return {
    ...data,
    currentQuestion: next,
    askedQuestionIds: [...new Set([...plan.askedQuestionIds, ...(next ? [next.id] : [])])].slice(-1000),
    skippedTopics: plan.skippedTopics,
    followUpDepth: 0,
    sessionComplete: !next,
    industry: input.industry,
    level: input.level,
    bankStatus: 'editorial_draft',
    assessmentNotice: 'Nhận xét AI dùng để luyện tập; trích dẫn đúng nguồn chưa chứng minh đánh giá chuyên môn là đúng.'
  };
}

module.exports = { prepareLiveInput, decorateTurn, questionView };
