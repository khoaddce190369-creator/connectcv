'use strict';

// Identity is supplied by the existing authentication middleware, never by body/headers.
// This module owns feature admission, input validation ordering (ALWAYS validate BEFORE rate-limit/quota!), and rate-limit headers.

const VALID_TTS_VOICES = ['vi-VN-HoaiMyNeural', 'vi-VN-NamMinhNeural'];
const SSML_OR_HTML_MARKUP_RE = /<\/?(?:speak|prosody|voice|break|audio|phoneme|say-as|sub|mark|lexicon|lang|emphasis|mstts:[a-z0-9_-]+|ssml|script|iframe|img|svg|style|html|body|div|span|p|s|xml)\b[^<>]*>|<\?xml|<!DOCTYPE|<!--/i;

function validateLiveSummaryRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { status: 400, payload: { success: false, code: 'INTERVIEW_INPUT_INVALID', message: 'Dữ liệu tóm tắt phỏng vấn không hợp lệ.' } };
  }
  const versionError = require('../services/interviewSummaryGrounding').summaryVersionError(body);
  if (versionError) return { status: 409, payload: versionError };

  const rawHist = body.history !== undefined ? body.history : body.conversationHistory;
  if (!Array.isArray(rawHist)) {
    return { status: 400, payload: { success: false, code: 'INTERVIEW_INPUT_INVALID', message: 'Lịch sử phỏng vấn (history) phải là mảng hợp lệ.' } };
  }
  if (rawHist.length === 0) {
    return { status: 400, payload: { success: false, code: 'INTERVIEW_INPUT_INVALID', message: 'Không có lịch sử phỏng vấn để tóm tắt.' } };
  }
  if (rawHist.slice(-40).some(turn => !turn || typeof turn !== 'object' || String(turn.message ?? turn.content ?? '').length > 3000)) {
    return { status: 400, payload: { success: false, code: 'INTERVIEW_INPUT_INVALID', message: 'Lịch sử phỏng vấn không hợp lệ hoặc câu trả lời vượt 3.000 ký tự.' } };
  }
  return null;
}

function validateTtsRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { status: 400, payload: { success: false, code: 'TTS_INPUT_INVALID', message: 'Dữ liệu yêu cầu đọc giọng nói không hợp lệ.' } };
  }
  if (typeof body.text !== 'string' || !body.text.trim()) {
    return { status: 400, payload: { success: false, code: 'TTS_INPUT_INVALID', message: 'Vui lòng cung cấp nội dung văn bản (text)!' } };
  }
  if (body.text.length > 3500) {
    return { status: 400, payload: { success: false, code: 'TTS_TEXT_TOO_LONG', message: `Văn bản đọc quá dài (${body.text.length}/3.500 ký tự). Vui lòng rút gọn dưới 3.500 ký tự.` } };
  }
  if (SSML_OR_HTML_MARKUP_RE.test(body.text)) {
    return { status: 400, payload: { success: false, code: 'TTS_SSML_NOT_ALLOWED', message: 'TTS chỉ chấp nhận văn bản thuần túy, không hỗ trợ thẻ đánh dấu SSML hoặc HTML.' } };
  }
  if (body.voice !== undefined && body.voice !== null && body.voice !== '') {
    if (typeof body.voice !== 'string' || !VALID_TTS_VOICES.includes(body.voice.trim())) {
      return {
        status: 400,
        payload: {
          success: false,
          code: 'TTS_VOICE_INVALID',
          message: `Giọng đọc "${String(body.voice).slice(0, 40)}" không được hỗ trợ. Chỉ chấp nhận: ${VALID_TTS_VOICES.join(', ')}.`,
          allowedVoices: VALID_TTS_VOICES
        }
      };
    }
  }
  const cleaned = require('../services/ttsService').cleanTextForSpeech(body.text);
  if (!cleaned) {
    return { status: 400, payload: { success: false, code: 'TTS_INPUT_INVALID', message: 'Nội dung văn bản sau khi loại bỏ thẻ đánh dấu đang trống.' } };
  }
  return null;
}

function createFeatureSecurity({ consumeBudget = userId => require('../services/featureBudget').consumeFeatureBudget(userId), clock = Date.now } = {}) {
  const buckets = new Map();

  async function featureSecurity(req, res, next) {
    if ((req.method === 'GET' || req.method === 'HEAD') && !String(req.path || '').endsWith('/download-docx')) {
      return next();
    }
    if (process.env.NODE_ENV === 'production' && req.featureIdentityVerified !== true) {
      return res.status(503).json({ success: false, code: 'AUTH_INTEGRATION_REQUIRED', message: 'Tính năng đang chờ tích hợp xác thực tài khoản.' });
    }
    if (!req.user || typeof req.user.id !== 'string' || !req.user.id || req.user.id.length > 200) {
      return res.status(401).json({ success: false, code: 'AUTH_REQUIRED', message: 'Vui lòng đăng nhập để sử dụng chức năng này.' });
    }
    res.setHeader('Cache-Control', 'no-store');

    const fullPath = ((req.baseUrl || '') + (req.path || '')).replace(/\/+$/, '').toLowerCase();
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ success: false, code: 'INVALID_JSON_BODY', message: 'Nội dung yêu cầu không hợp lệ.' });
    }

    // ── 1. Generic field-type & payload-size guards FIRST (never burn quota on malformed inputs!) ──
    for (const key of ['message', 'userMessage', 'question', 'candidateAnswer', 'jobTitle', 'companyName', 'position', 'reviewText', 'answer', 'text', 'jdText']) {
      if (body[key] !== undefined && body[key] !== null && typeof body[key] !== 'string') {
        return res.status(400).json({ success: false, code: 'INVALID_FIELD_TYPE', message: 'Trường văn bản không hợp lệ: ' + key });
      }
    }
    for (const key of ['history', 'messages', 'conversationHistory']) {
      if (body[key] !== undefined) {
        const a = body[key];
        if (!Array.isArray(a) || a.length > 100 || JSON.stringify(a).length > 48000) {
          return res.status(400).json({ success: false, code: 'INVALID_HISTORY', message: 'Lịch sử hội thoại quá dài hoặc không hợp lệ.' });
        }
      }
    }
    for (const key of ['userProfile', 'profile', 'candidateProfile', 'currentProfile']) {
      if (body[key] !== undefined) {
        const p = body[key];
        if (p === null || Array.isArray(p) || !['object', 'string'].includes(typeof p)) {
          return res.status(400).json({ success: false, code: 'INVALID_PROFILE', message: 'Hồ sơ không hợp lệ.' });
        }
        const text = JSON.stringify(p, (k, v) => (/avatar|photo/i.test(k) ? undefined : v));
        if (text.length > 60000) {
          return res.status(400).json({ success: false, code: 'INVALID_PROFILE', message: 'Hồ sơ quá dài.' });
        }
      }
    }

    // ── 2. Endpoint-specific validation BEFORE rate-limit and quota consumption (Fixes M7!) ──
    if (fullPath === '/api/interview/live-summary') {
      const sumErr = validateLiveSummaryRequest(body);
      if (sumErr) return res.status(sumErr.status).json(sumErr.payload);
    }
    if (fullPath === '/api/interview/tts') {
      const ttsErr = validateTtsRequest(body);
      if (ttsErr) return res.status(ttsErr.status).json(ttsErr.payload);
    }
    if (fullPath === '/api/interview/live-chat') {
      const prepared = require('../services/interviewLiveSession').prepareLiveInput(body);
      if (prepared.error) return res.status(400).json(prepared.error);
      req.liveInterviewPrepared = prepared;
      req.body = prepared.value;
    }
    if (fullPath === '/api/cv/generate') {
      const { validateGeneration, validationResponse } = require('../services/cvGenerationValidation');
      const result = validateGeneration(req.body);
      if (result.error) return res.status(400).json(validationResponse(result.error));
      req.body = result.value;
    }
    if (fullPath === '/api/interview/evaluate') {
      const { validateEvaluation, evaluationError } = require('../services/interviewEvaluationService');
      const result = validateEvaluation(req.body);
      if (result.error) return res.status(400).json(evaluationError(result.error));
      req.body = result.value;
    }
    if (fullPath === '/api/interview/debrief') {
      const publication = require('../../public/js/community-publication');
      const result = publication.validate(req.body);
      if (Object.keys(result.fieldErrors).length) return res.status(400).json(publication.errorResponse(result));
      req.body = result.value;
    }
    if (fullPath === '/api/chatbot/message') {
      const { validateChat, chatError } = require('../services/chatbotService');
      const result = validateChat(req.body);
      if (result.error) return res.status(400).json(chatError(result.error));
      req.body = result.value;
    }
    if (fullPath === '/api/chatbot/agent' || fullPath === '/api/cv/agent') {
      const { validateAgentInput } = require('../services/cvAgentService');
      const result = validateAgentInput(req.body);
      if (result.error) return res.status(400).json({ success: false, code: 'AGENT_INPUT_INVALID', message: result.error.details[0]?.message || 'Dữ liệu AI Agent không hợp lệ.' });
      req.body = result.value;
    }

    // ── 3. Rate-limiting with transparent RateLimit-* headers (Fixes L1!) ──
    const utility = ['/api/cv/templates/recommend', '/api/cv/auto-match-jobs', '/api/cv/render', '/api/interview/tts'].includes(fullPath);
    const isInterviewInteractive = ['/api/interview/live-chat', '/api/interview/live-summary'].includes(fullPath);
    const ai = ['/api/cv/generate', '/api/cv/translate', '/api/cv/ats-score', '/api/cv/agent', '/api/chatbot/message', '/api/chatbot/agent', '/api/interview/start', '/api/interview/transcribe', '/api/interview/live-chat', '/api/interview/live-summary', '/api/interview/evaluate', '/api/interview/proposal'].includes(fullPath);

    const group = utility ? 'utility' : (isInterviewInteractive ? 'interview' : 'action');
    const now = clock();
    const windowMs = 300000;
    const limit = utility ? 120 : (isInterviewInteractive ? 60 : 15);
    if (buckets.size > 10000) {
      for (const [k, v] of buckets) if (v.until <= now) buckets.delete(k);
    }

    const accountKey = 'account:' + group + ':' + req.user.id;
    const socketKey = 'socket:' + group + ':' + (req.socket?.remoteAddress || 'unknown');
    const keys = [accountKey, socketKey];

    for (const key of keys) {
      const v = buckets.get(key);
      const cap = key.startsWith('account:') ? limit : 400;
      if (v && v.until > now && v.count >= cap) {
        const retrySec = Math.max(1, Math.ceil((v.until - now) / 1000));
        res.setHeader('Retry-After', String(retrySec));
        res.setHeader('RateLimit-Limit', String(limit));
        res.setHeader('RateLimit-Remaining', '0');
        res.setHeader('RateLimit-Reset', String(retrySec));
        return res.status(429).json({
          success: false,
          code: 'FEATURE_RATE_LIMIT',
          message: `Bạn đã gửi quá nhiều yêu cầu liên tiếp. Vui lòng chờ ${retrySec} giây rồi thử lại.`
        });
      }
    }
    if (buckets.size >= 15000) {
      return res.status(503).json({ success: false, code: 'SERVICE_BUSY', message: 'Hệ thống đang quá tải tạm thời. Vui lòng thử lại sau giây lát.' });
    }
    for (const key of keys) {
      let v = buckets.get(key);
      if (!v || v.until <= now) v = { count: 0, until: now + windowMs };
      v.count++;
      buckets.set(key, v);
    }
    const acctState = buckets.get(accountKey);
    if (acctState) {
      res.setHeader('RateLimit-Limit', String(limit));
      res.setHeader('RateLimit-Remaining', String(Math.max(0, limit - acctState.count)));
      res.setHeader('RateLimit-Reset', String(Math.max(1, Math.ceil((acctState.until - now) / 1000))));
    }

    // ── 4. Daily feature quota (never blocks with 503 config errors!) ──
    const localAgent = (fullPath === '/api/chatbot/agent' || fullPath === '/api/cv/agent') && require('../services/cvAgentService').isDeterministicAgentRequest(req.body);
    const localChat = fullPath === '/api/chatbot/message' && require('../services/chatbotService').localTopic(req.body.message) !== null;
    try {
      if (ai && !localChat && !localAgent && !req.liveInterviewPrepared?.plan.local) {
        await consumeBudget(req.user.id);
      }
    } catch (error) {
      if (error && error.status === 429) {
        return res.status(429).json({
          success: false,
          code: 'QUOTA_EXCEEDED',
          message: 'Bạn đã đạt hạn mức lượt đánh giá AI chuyên sâu trong ngày. Vui lòng quay lại vào ngày mai.'
        });
      }
      // Never block interview coaching if an external quota store experiences a transient error
      console.warn('[FeatureSecurity] Quota store fallback active');
    }
    next();
  }

  return featureSecurity;
}

const featureSecurity = createFeatureSecurity();
module.exports = { featureSecurity, createFeatureSecurity, VALID_TTS_VOICES };
