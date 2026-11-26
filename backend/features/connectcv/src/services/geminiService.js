const { providerErrorCode } = require('./securityError');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const keyManager = require('./keyManager');
require('dotenv').config();

const genAI = {
  getGenerativeModel(options) {
    const activeKey = keyManager.getActiveKey().apiKey;
    const client = new GoogleGenerativeAI(activeKey);
    return client.getGenerativeModel(options);
  }
};

function extractJSON(rawText) {
  if (!rawText) throw new Error('Nội dung từ Gemini AI rỗng.');
  const text = rawText.trim();

  try { return JSON.parse(text); } catch (e) {}

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch?.[1]) {
    try { return JSON.parse(fenceMatch[1].trim()); } catch (e) {}
  }

  const fb = text.indexOf('{'), fb2 = text.indexOf('[');
  let start = -1, end = -1;
  if (fb !== -1 && (fb2 === -1 || fb < fb2)) { start = fb; end = text.lastIndexOf('}'); }
  else if (fb2 !== -1)                        { start = fb2; end = text.lastIndexOf(']'); }

  if (start !== -1 && end > start) {
    try { return JSON.parse(text.substring(start, end + 1).trim()); } catch (e) {}
  }

  throw new Error('Không thể trích xuất JSON từ phản hồi AI.');
}

async function withTimeout(promise, ms = 45000) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) =>
        timer = setTimeout(() => reject(Object.assign(new Error('Gemini response deadline exceeded'), { code: 'AI_TIMEOUT' })), ms)
      )
    ]);
  } finally {
    clearTimeout(timer);
  }
}

const MODEL_CHAIN = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash'
];

async function callGeminiJSON(prompt, preferredModel = 'gemini-2.5-flash-lite', options = {}) {
  const timeoutMs = Number.isFinite(options.timeoutMs) && options.timeoutMs > 0 ? options.timeoutMs : 45000;
  const maxOutputTokens = Number.isFinite(options.maxOutputTokens) && options.maxOutputTokens > 0 ? options.maxOutputTokens : 8192;
  return keyManager.executeWithRetry(async (activeApiKey) => {
    const client = new GoogleGenerativeAI(activeApiKey);
    const modelsToTry = [preferredModel, ...MODEL_CHAIN.filter(m => m !== preferredModel)];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = client.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json', maxOutputTokens, thinkingConfig: { thinkingBudget: 0 } }
        }, { timeout: timeoutMs });

        const result = await withTimeout(
          model.generateContent(prompt),
          timeoutMs
        );

        const text = result.response.text();
        return extractJSON(text);
      } catch (error) {
        if (keyManager.isAuthError(error)) {
          throw error;
        }
        if (keyManager.isRateLimitError(error)) {
          console.warn('[Gemini] AI_RATE_LIMIT: trying fallback model');
        } else {
          console.warn('[Gemini] Model fallback failed:', providerErrorCode(error));
        }
        lastError = error;
      }
    }

    console.error('[Gemini] Toàn bộ model đều thất bại:', providerErrorCode(lastError));
    throw lastError || new Error('AI tạm thời không khả dụng. Vui lòng thử lại sau ít phút.');
  }, 'callGeminiJSON');
}

async function callGeminiText(prompt, preferredModel = 'gemini-2.5-flash-lite') {
  return keyManager.executeWithRetry(async (activeApiKey) => {
    const client = new GoogleGenerativeAI(activeApiKey);
    const modelsToTry = [preferredModel, ...MODEL_CHAIN.filter(m => m !== preferredModel)];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = client.getGenerativeModel({ model: modelName, generationConfig: { maxOutputTokens: 4096, thinkingConfig: { thinkingBudget: 0 } } }, { timeout: 45000 });
        const result = await withTimeout(model.generateContent(prompt), 45000);
        return result.response.text();
      } catch (error) {
        if (keyManager.isAuthError(error)) {
          throw error;
        }
        if (keyManager.isRateLimitError(error)) {
          console.warn('[Gemini] AI_RATE_LIMIT: trying fallback model');
        } else {
          console.warn('[Gemini] Model fallback failed:', providerErrorCode(error));
        }
        lastError = error;
      }
    }

    throw lastError || new Error('AI tạm thời không khả dụng. Vui lòng thử lại sau ít phút.');
  }, 'callGeminiText');
}

module.exports = {
  genAI,
  keyManager,
  callGeminiJSON,
  callGeminiText,
  extractJSON
};
