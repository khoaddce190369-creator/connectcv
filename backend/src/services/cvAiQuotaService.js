'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const QUOTA_FILE = path.resolve(
  process.env.CV_AI_QUOTA_FILE || path.join(__dirname, '../../data/cv-ai-quota.json')
);

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes sliding window
const LIMITS = {
  guest: { burstPer5Min: 30, dailyLlmCalls: 25 },
  user: { burstPer5Min: 80, dailyLlmCalls: 120 },
  pro: { burstPer5Min: 200, dailyLlmCalls: 500 }
};

let state = { days: {}, windows: {} };
try {
  if (fs.existsSync(QUOTA_FILE)) {
    const parsed = JSON.parse(fs.readFileSync(QUOTA_FILE, 'utf8'));
    if (parsed && typeof parsed === 'object') {
      state.days = parsed.days || {};
      state.windows = parsed.windows || {};
    }
  }
} catch {}

let persistTimer = null;
function schedulePersist() {
  if (persistTimer) return;
  persistTimer = setTimeout(async () => {
    persistTimer = null;
    try {
      await fs.promises.mkdir(path.dirname(QUOTA_FILE), { recursive: true });
      const tmp = `${QUOTA_FILE}.${process.pid}.${Date.now()}.tmp`;
      await fs.promises.writeFile(tmp, JSON.stringify(state), { mode: 0o600 });
      await fs.promises.rename(tmp, QUOTA_FILE);
    } catch {}
  }, 250);
  if (typeof persistTimer.unref === 'function') persistTimer.unref();
}

function normalizeIp(req) {
  const raw = String(req.ip || req.socket?.remoteAddress || '127.0.0.1').trim();
  return raw.replace(/^::ffff:/i, '');
}

function resolveCallerIdentity(req) {
  if (req.userId && req.user) {
    const isPro = Boolean(req.user.isPro || req.user.plan === 'pro' || req.user.role === 'Admin');
    const tier = isPro ? 'pro' : 'user';
    const hash = crypto.createHash('sha256').update(`u:${req.userId}`).digest('hex').slice(0, 24);
    return { tier, key: `u_${hash}`, limits: LIMITS[tier], authenticated: true };
  }
  const ip = normalizeIp(req);
  const hash = crypto.createHash('sha256').update(`g:${ip}`).digest('hex').slice(0, 24);
  return { tier: 'guest', key: `g_${hash}`, limits: LIMITS.guest, authenticated: false };
}

function pruneExpired(now, today) {
  if (Object.keys(state.windows).length > 5000) {
    for (const [k, v] of Object.entries(state.windows)) {
      if (!v || v.resetAt <= now) delete state.windows[k];
    }
  }
  for (const d of Object.keys(state.days)) {
    if (d !== today) delete state.days[d];
  }
}

function checkBurstRateLimit(req, res, bucketScope = 'cv-ai') {
  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);
  pruneExpired(now, today);

  const identity = resolveCallerIdentity(req);
  const winKey = `${bucketScope}:${identity.key}`;
  let win = state.windows[winKey];
  if (!win || win.resetAt <= now) {
    win = { count: 0, resetAt: now + WINDOW_MS };
  }

  const maxBurst = identity.limits.burstPer5Min;
  const remaining = Math.max(0, maxBurst - win.count - 1);
  const retrySec = Math.max(1, Math.ceil((win.resetAt - now) / 1000));

  if (res && typeof res.setHeader === 'function') {
    res.setHeader('RateLimit-Limit', String(maxBurst));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, maxBurst - Math.min(maxBurst, win.count + 1))));
    res.setHeader('RateLimit-Reset', String(retrySec));
  }

  if (win.count >= maxBurst) {
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('Retry-After', String(retrySec));
    }
    return {
      allowed: false,
      identity,
      status: 429,
      body: {
        success: false,
        code: 'AGENT_RATE_LIMIT',
        message: identity.authenticated
          ? `Bạn thao tác quá nhanh (${maxBurst} yêu cầu/5 phút). Vui lòng thử lại sau ${retrySec} giây.`
          : `Bạn đã gửi quá nhiều yêu cầu liên tiếp (${maxBurst} yêu cầu/5 phút). Vui lòng chờ ${retrySec} giây hoặc đăng nhập để có hạn mức cao hơn.`
      }
    };
  }

  win.count += 1;
  state.windows[winKey] = win;
  schedulePersist();
  return { allowed: true, identity, remaining };
}

function canConsumeDailyLlmQuota(identity) {
  const today = new Date().toISOString().slice(0, 10);
  if (!state.days[today]) state.days[today] = {};
  const used = Number(state.days[today][identity.key] || 0);
  return {
    allowed: used < identity.limits.dailyLlmCalls,
    used,
    limit: identity.limits.dailyLlmCalls
  };
}

function recordLlmConsumption(identity) {
  const today = new Date().toISOString().slice(0, 10);
  if (!state.days[today]) state.days[today] = {};
  state.days[today][identity.key] = Number(state.days[today][identity.key] || 0) + 1;
  schedulePersist();
}

function resetQuotaForTests() {
  state = { days: {}, windows: {} };
}

module.exports = {
  resolveCallerIdentity,
  checkBurstRateLimit,
  canConsumeDailyLlmQuota,
  recordLlmConsumption,
  resetQuotaForTests
};
