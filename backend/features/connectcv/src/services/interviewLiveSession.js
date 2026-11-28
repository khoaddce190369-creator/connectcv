'use strict';

const Joi = require('joi');
const bank = require('./interviewQuestionBank');
const policy = require('./interviewTurnPolicy');

const ALLOWED_LEVEL_INPUTS = ['intern', 'fresher', 'junior', 'middle', 'senior', 'lead'];

const historyItem = Joi.object({
  role: Joi.string().valid('interviewer', 'candidate', 'assistant', 'user').required(),
  message: Joi.string().allow('').max(4000),
  content: Joi.string().allow('').max(4000),
  questionId: Joi.string().allow(null, '').max(120)
}).or('message', 'content');

const schema = Joi.object({
  action: Joi.string().valid('start', 'reply', 'skip', 'hint'),
  jobTitle: Joi.string().allow('').max(150).default(''),
  industry: Joi.string().allow('').max(70),
  level: Joi.string().allow('').max(60),
  message: Joi.string().allow('').max(3000),
  userMessage: Joi.string().allow('').max(3000),
  jdText: Joi.string().allow('').max(5000).default(''),
  candidateProfile: Joi.alternatives().try(Joi.string().allow('').max(3000), Joi.object()).optional(),
  history: Joi.array().items(historyItem).max(100),
  conversationHistory: Joi.array().items(historyItem).max(100),
  currentQuestionId: Joi.string().allow(null, '').max(120),
  askedQuestionIds: Joi.array().items(Joi.string().max(120)).max(1000).default([]),
  skippedTopics: Joi.array().items(Joi.string().max(80)).max(1000).default([]),
  followUpDepth: Joi.number().integer().min(0).max(2).default(0),
  consecutiveSkips: Joi.number().integer().min(0).max(50).default(0),
  allowFreeformQuestion: Joi.boolean().default(false)
}).required();

function allowedIndustriesSummary() {
  return bank.catalog().industries.map(row => ({ id: row.id, label: row.label }));
}

function invalid(field, message, extra = {}) {
  return {
    success: false,
    code: 'INTERVIEW_INPUT_INVALID',
    message,
    fieldErrors: { [field]: message },
    ...extra
  };
}

function computeStageAndPhase({ isStart, isFollowUp, isHint, complete, askedCount, totalAvailableInBank }) {
  if (complete) return { stage: 4, interviewPhase: 'completed' };
  if (isStart || askedCount <= 1) return { stage: 1, interviewPhase: 'opening' };
  if (isHint) return { stage: askedCount <= 4 ? 2 : 3, interviewPhase: 'coaching_hint' };
  if (isFollowUp) return { stage: askedCount <= 4 ? 2 : 3, interviewPhase: 'follow_up' };
  const total = Math.max(8, totalAvailableInBank || 13);
  const ratio = askedCount / total;
  if (ratio <= 0.35 || askedCount <= 4) return { stage: 2, interviewPhase: 'technical' };
  if (ratio < 0.85) return { stage: 3, interviewPhase: 'behavioral_scenario' };
  return { stage: 4, interviewPhase: 'closing' };
}

function prepareLiveInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: invalid('body', 'Dữ liệu yêu cầu phỏng vấn không hợp lệ.') };
  }

  // Specific length checks BEFORE generic Joi error so >3000 char messages report accurate field error (M7)
  for (const msgKey of ['message', 'userMessage']) {
    if (typeof body[msgKey] === 'string' && body[msgKey].length > 3000) {
      return { error: invalid('message', `Câu trả lời quá dài (${body[msgKey].length}/3.000 ký tự). Vui lòng tóm gọn dưới 3.000 ký tự.`) };
    }
  }
  if (body.action !== undefined && !['start', 'reply', 'skip', 'hint'].includes(String(body.action))) {
    return {
      error: invalid('action', 'Hành động (action) không hợp lệ. Chỉ hỗ trợ: start, reply, skip, hint.', {
        allowedActions: ['start', 'reply', 'skip', 'hint']
      })
    };
  }

  const checked = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (checked.error) {
    const firstField = String(checked.error.details[0]?.path?.[0] || 'message');
    return { error: invalid(firstField, 'Kiểm tra câu trả lời, ngành nghề, cấp độ và lịch sử phỏng vấn.') };
  }

  const value = checked.value;
  let requestedLevelRaw = value.level;
  if (requestedLevelRaw === undefined || requestedLevelRaw === null) {
    requestedLevelRaw = 'fresher';
  } else if (typeof requestedLevelRaw === 'string' && requestedLevelRaw.trim() === '') {
    return {
      error: invalid('level', 'Cấp độ ứng tuyển không được để trống. Chọn: Intern, Fresher, Junior, Middle, Senior hoặc Lead.', {
        allowedLevels: ALLOWED_LEVEL_INPUTS
      })
    };
  }
  const requestedNorm = String(requestedLevelRaw).trim().toLowerCase();
  const normalizedLevel = bank.normalizeLevel(requestedLevelRaw);
  if (!normalizedLevel) {
    return {
      error: invalid('level', `Cấp độ "${String(requestedLevelRaw).slice(0, 40)}" không hợp lệ. Vui lòng chọn: Intern, Fresher, Junior, Middle, Senior hoặc Lead.`, {
        allowedLevels: ALLOWED_LEVEL_INPUTS
      })
    };
  }
  value.requestedLevel = /^(?:intern|internship|thực tập|thuc tap|sinh viên|sinh vien)/i.test(requestedNorm) ? 'intern' : normalizedLevel;
  value.level = normalizedLevel;

  const hasExplicitHistoryProp = Array.isArray(body.history) || Array.isArray(body.conversationHistory);
  const history = value.history || value.conversationHistory || [];
  const answer = (value.userMessage || value.message || '').trim();
  value.action = value.action || (!answer && !history.length ? 'start' : 'reply');

  const rawIndustry = typeof value.industry === 'string' ? value.industry.trim() : '';
  if (rawIndustry && !bank.normalizeIndustry(rawIndustry)) {
    return {
      error: invalid('industry', 'Ngành nghề đã chọn không nằm trong danh mục hỗ trợ. Vui lòng chọn một ngành hợp lệ.', {
        allowedIndustries: allowedIndustriesSummary()
      })
    };
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
    return {
      error: invalid('industry', 'Chưa nhận diện được ngành nghề từ chức danh này. Vui lòng chọn Ngành nghề phù hợp hoặc bổ sung mô tả công việc (JD).', {
        allowedIndustries: allowedIndustriesSummary()
      })
    };
  }

  const totalBankQuestions = bank.pairRows(value.industry, value.level).length;
  const preAskedIds = new Set(value.action === 'start' ? [] : value.askedQuestionIds);
  for (const h of value.action === 'start' ? [] : history) {
    if (h.questionId) preAskedIds.add(h.questionId);
  }
  const last = [...history].reverse().find(h => ['interviewer', 'assistant'].includes(h.role));
  const lastInterviewerText = String(last?.message || last?.content || '');
  const sessionAlreadyEnded = value.action !== 'start' && !value.currentQuestionId && (
    (totalBankQuestions > 0 && preAskedIds.size >= totalBankQuestions) ||
    (history.length >= 2 && /(?:câu hỏi cuối cùng của phiên|câu hỏi cuối cùng trong phiên|phiên phỏng vấn hiện tại đã hoàn thành)/i.test(lastInterviewerText))
  );

  if (sessionAlreadyEnded) {
    value.message = answer;
    value.history = history;
    return {
      value,
      plan: {
        current: null,
        next: null,
        intent: { type: 'complete', reason: 'session_already_completed' },
        alreadyCompleted: true,
        allowFollowUp: false,
        consecutiveSkips: value.consecutiveSkips || 0,
        difficultyAdjusted: false,
        totalBankQuestions,
        question: '',
        askedQuestionIds: [...preAskedIds],
        skippedTopics: [...(value.skippedTopics || [])],
        local: true
      }
    };
  }

  if (value.action !== 'start') {
    if (!hasExplicitHistoryProp || history.length === 0) {
      return { error: invalid('history', 'Thiếu lịch sử hội thoại phỏng vấn (history). Hãy bắt đầu phiên phỏng vấn trước.') };
    }
    if (!value.currentQuestionId && !value.allowFreeformQuestion) {
      return { error: invalid('currentQuestionId', 'Thiếu mã câu hỏi hiện tại (currentQuestionId). Hãy gửi kèm câu hỏi đang trả lời.') };
    }
  }

  if (value.action === 'reply' && !answer) {
    return { error: invalid('message', 'Vui lòng nhập câu trả lời, bấm "Gợi ý trả lời" hoặc bấm "Bỏ qua câu này".') };
  }

  const current = value.currentQuestionId ? bank.getQuestion(value.currentQuestionId) : null;
  if (value.currentQuestionId && (!current || current.industry !== value.industry)) {
    return { error: invalid('currentQuestionId', 'Câu hỏi không thuộc ngành của phiên hiện tại. Hãy bắt đầu lại phiên.') };
  }
  if (value.action !== 'start' && !current && !last) {
    return { error: invalid('history', 'Chưa có câu hỏi để đánh giá. Hãy bắt đầu phiên trước.') };
  }

  const ids = new Set(preAskedIds);
  if (current) ids.add(current.id);

  let intent;
  if (value.action === 'skip') intent = { type: 'skip', reason: 'explicit_action_skip' };
  else if (value.action === 'hint') intent = { type: 'hint', reason: 'explicit_action_hint' };
  else intent = policy.detectTurnIntent(answer);

  const isSkipOrNoAnswer = intent.type === 'skip' || intent.type === 'no_answer';
  const nextConsecutiveSkips = value.action === 'start' ? 0 : (isSkipOrNoAnswer ? (value.consecutiveSkips || 0) + 1 : 0);

  const skippedTopics = new Set(value.action === 'start' ? [] : value.skippedTopics);
  if (current && isSkipOrNoAnswer) skippedTopics.add(current.topic);

  const LEVEL_LADDER = ['fresher', 'junior', 'middle', 'senior', 'lead'];
  let next = null;
  let difficultyAdjusted = false;

  if (intent.type === 'hint') {
    next = current;
  } else if (value.action === 'start' || ids.size < totalBankQuestions) {
    if (nextConsecutiveSkips >= 2) {
      const baseIdx = Math.max(0, LEVEL_LADDER.indexOf(value.level));
      const stepOffset = nextConsecutiveSkips >= 3 ? 2 : 1;
      const targetIdx = Math.max(0, baseIdx - stepOffset);
      for (let idx = targetIdx; idx <= baseIdx && !next; idx++) {
        next = bank.selectQuestion({
          industry: value.industry,
          level: LEVEL_LADDER[idx],
          excludeIds: [...ids],
          excludeTopics: [...skippedTopics, ...(current ? [current.topic] : [])],
          jobTitle: value.jobTitle,
          jdText: value.jdText,
          candidateProfile: value.candidateProfile,
          preferFoundational: true
        });
      }
      difficultyAdjusted = Boolean(next && (next.level !== value.level || nextConsecutiveSkips >= 2));
    }
    if (!next) {
      next = bank.selectQuestion({
        industry: value.industry,
        level: value.level,
        excludeIds: [...ids],
        excludeTopics: [...skippedTopics, ...(current ? [current.topic] : [])],
        jobTitle: value.jobTitle,
        jdText: value.jdText,
        candidateProfile: value.candidateProfile
      });
    }
  }

  const allowFollowUp = Boolean(
    value.action === 'reply' &&
    intent.type === 'answer' &&
    current &&
    value.followUpDepth === 0 &&
    answer.length >= 20
  );

  value.message = answer;
  value.history = history;
  return {
    value,
    plan: {
      current,
      next,
      intent,
      alreadyCompleted: false,
      allowFollowUp,
      consecutiveSkips: nextConsecutiveSkips,
      difficultyAdjusted,
      totalBankQuestions,
      question: current?.question || (last?.message || last?.content || '').slice(0, 1500),
      askedQuestionIds: [...ids],
      skippedTopics: [...skippedTopics],
      local: value.action === 'start' || intent.type !== 'answer'
    }
  };
}

function questionView(q) {
  return q ? { id: q.id, question: q.question, topic: q.topic, industry: q.industry, level: q.level, answerType: q.answerType } : null;
}

function decorateTurn(data, input, plan) {
  const isStart = input.action === 'start';
  const isHint = plan.intent?.type === 'hint' || data?.decision === 'hint';
  const levelNote = input.requestedLevel === 'intern' ? 'Cấp độ Intern sử dụng bộ câu hỏi nền tảng Fresher.' : undefined;

  if ((data && data.isFollowUp && plan.current) || (isHint && plan.current)) {
    const cur = questionView(plan.current);
    const askedList = [...new Set([...plan.askedQuestionIds, cur.id])].slice(-1000);
    const stageInfo = computeStageAndPhase({
      isStart: false,
      isFollowUp: !isHint,
      isHint,
      complete: false,
      askedCount: askedList.length,
      totalAvailableInBank: plan.totalBankQuestions
    });
    return {
      ...data,
      stage: stageInfo.stage,
      interviewPhase: data?.interviewPhase || stageInfo.interviewPhase,
      currentQuestion: cur,
      askedQuestionIds: askedList,
      skippedTopics: plan.skippedTopics,
      followUpDepth: isHint ? (input.followUpDepth || 0) : Math.min(2, (input.followUpDepth || 0) + 1),
      consecutiveSkips: plan.consecutiveSkips || 0,
      sessionComplete: false,
      industry: input.industry,
      level: input.level,
      requestedLevel: input.requestedLevel || input.level,
      ...(levelNote ? { levelNote } : {}),
      totalQuestionsInBank: plan.totalBankQuestions,
      bankStatus: 'editorial_draft',
      assessmentNotice: 'Bộ câu hỏi biên tập luyện tập · Nhận xét và điểm số là ước lượng tham khảo giúp cải thiện cách trả lời.'
    };
  }

  const next = questionView(plan.next);
  const complete = !next;
  const askedList = [...new Set([...plan.askedQuestionIds, ...(next ? [next.id] : [])])].slice(-1000);
  const stageInfo = computeStageAndPhase({
    isStart,
    isFollowUp: false,
    isHint: false,
    complete,
    askedCount: askedList.length,
    totalAvailableInBank: plan.totalBankQuestions
  });
  return {
    ...data,
    stage: stageInfo.stage,
    interviewPhase: complete ? 'completed' : stageInfo.interviewPhase,
    currentQuestion: next,
    askedQuestionIds: askedList,
    skippedTopics: plan.skippedTopics,
    followUpDepth: 0,
    consecutiveSkips: plan.consecutiveSkips || 0,
    difficultyAdjusted: Boolean(plan.difficultyAdjusted),
    effectiveQuestionLevel: next?.level || input.level,
    sessionComplete: complete,
    industry: input.industry,
    level: input.level,
    requestedLevel: input.requestedLevel || input.level,
    ...(levelNote ? { levelNote } : {}),
    totalQuestionsInBank: plan.totalBankQuestions,
    bankStatus: 'editorial_draft',
    assessmentNotice: 'Bộ câu hỏi biên tập luyện tập · Nhận xét và điểm số là ước lượng tham khảo giúp cải thiện cách trả lời.'
  };
}

module.exports = { prepareLiveInput, decorateTurn, questionView, allowedIndustriesSummary };
