'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let warnedFallbackOnce = false;

class FeatureBudget {
  constructor(file, limit = 150) {
    this.file = file;
    this.limit = limit;
    this.queue = Promise.resolve();
    this.records = {};
    this.persistenceMode = 'file';
    try {
      if (file && fs.existsSync(file)) {
        this.records = JSON.parse(fs.readFileSync(file, 'utf8')) || {};
      }
    } catch {
      this.records = {};
      this.persistenceMode = 'memory-fallback';
    }
  }

  consume(userId) {
    const run = this.queue.then(async () => {
      const day = new Date().toISOString().slice(0, 10);
      const id = crypto.createHash('sha256').update(String(userId || 'guest')).digest('hex');
      const draft = Object.fromEntries(Object.entries(this.records).filter(([, v]) => v && v.day === day));
      const row = draft[id] || { day, count: 0 };
      if (row.count >= this.limit) {
        throw Object.assign(new Error('Daily feature budget reached'), { status: 429, code: 'QUOTA_EXCEEDED' });
      }
      if (Object.keys(draft).length >= 25000 && !draft[id]) {
        const oldestKey = Object.keys(draft)[0];
        if (oldestKey) delete draft[oldestKey];
      }
      row.count++;
      draft[id] = row;
      this.records = draft;

      if (this.file) {
        try {
          await fs.promises.mkdir(path.dirname(this.file), { recursive: true });
          const tmp = this.file + '.' + crypto.randomUUID() + '.tmp';
          try {
            await fs.promises.writeFile(tmp, JSON.stringify(draft), { mode: 0o600 });
            await fs.promises.rename(tmp, this.file);
            this.persistenceMode = 'file';
          } catch (writeErr) {
            await fs.promises.unlink(tmp).catch(() => {});
            this.persistenceMode = 'memory-fallback';
          }
        } catch {
          this.persistenceMode = 'memory-fallback';
        }
      }
    });
    this.queue = run.catch(() => {});
    return run;
  }
}

let instance;

function getQuotaStatus() {
  if (process.env.FEATURE_STORE_BACKEND === 'firestore') {
    return { backend: 'firestore', ready: true };
  }
  const durableConfigured = Boolean(process.env.FEATURE_STATE_DIR && process.env.FEATURE_SINGLE_PROCESS === 'true');
  return {
    backend: instance ? instance.persistenceMode : (durableConfigured ? 'file' : 'local-file-with-memory-fallback'),
    durableConfigured,
    ready: true
  };
}

function consumeFeatureBudget(userId) {
  if (process.env.FEATURE_STORE_BACKEND === 'firestore') {
    return require('../../../../src/services/accountStore').store().consume(userId);
  }
  if (process.env.NODE_ENV === 'production' && (!process.env.FEATURE_STATE_DIR || process.env.FEATURE_SINGLE_PROCESS !== 'true') && !warnedFallbackOnce) {
    warnedFallbackOnce = true;
    console.warn('[FeatureBudget] Durable store env not configured; using local file/in-memory quota fallback so user requests are not blocked.');
  }
  if (!instance) {
    const stateDir = process.env.FEATURE_STATE_DIR || path.resolve(__dirname, '../../data');
    instance = new FeatureBudget(path.resolve(stateDir, 'feature-budget.json'));
  }
  return instance.consume(userId);
}

module.exports = { FeatureBudget, consumeFeatureBudget, getQuotaStatus };
