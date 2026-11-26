'use strict';

const { createClient } = require('@libsql/client');

/**
 * Normalized Turso (libSQL) schema & data-driven row mapper.
 * Core fields are stored in typed SQL columns with indexes for fast queries;
 * any additional/dynamic fields are stored compactly in extra_json.
 */
const TABLES = {
  users: {
    table: 'users',
    columns: [
      ['id', 'id', 'text'],
      ['username', 'username', 'text'],
      ['email', 'email', 'text'],
      ['password_hash', 'password_hash', 'text'],
      ['role', 'role', 'text'],
      ['is_pro', 'isPro', 'bool'],
      ['ai_credits', 'aiCredits', 'int'],
      ['company', 'company', 'text'],
      ['title', 'title', 'text'],
      ['avatar', 'avatar', 'text'],
      ['created_at', 'createdAt', 'text']
    ],
    ddl: `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT,
      email TEXT,
      password_hash TEXT,
      role TEXT,
      is_pro INTEGER DEFAULT 0,
      ai_credits INTEGER DEFAULT 15,
      company TEXT,
      title TEXT,
      avatar TEXT,
      created_at TEXT,
      extra_json TEXT
    )`,
    indexes: ['CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)']
  },
  jobs: {
    table: 'jobs',
    columns: [
      ['id', 'id', 'text'],
      ['title', 'title', 'text'],
      ['company', 'company', 'text'],
      ['logo', 'logo', 'text'],
      ['type', 'type', 'text'],
      ['category', 'category', 'text'],
      ['location', 'location', 'text'],
      ['budget', 'budget', 'text'],
      ['min_budget', 'minBudget', 'int'],
      ['experience_years', 'experienceYears', 'int'],
      ['description', 'description', 'text'],
      ['skills_json', 'skills', 'json'],
      ['tags_json', 'tags', 'json'],
      ['created_at', 'createdAt', 'text']
    ],
    ddl: `CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT,
      company TEXT,
      logo TEXT,
      type TEXT,
      category TEXT,
      location TEXT,
      budget TEXT,
      min_budget INTEGER,
      experience_years INTEGER,
      description TEXT,
      skills_json TEXT,
      tags_json TEXT,
      created_at TEXT,
      extra_json TEXT
    )`,
    indexes: ['CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category)']
  },
  portfolios: {
    table: 'portfolios',
    columns: [
      ['id', 'id', 'text'],
      ['title', 'title', 'text'],
      ['author', 'author', 'text'],
      ['subdomain', 'subdomain', 'text'],
      ['author_avatar', 'authorAvatar', 'text'],
      ['author_role', 'authorRole', 'text'],
      ['image', 'image', 'text'],
      ['tags_json', 'tags', 'json'],
      ['budget', 'budget', 'text'],
      ['duration', 'duration', 'text'],
      ['likes', 'likes', 'int'],
      ['description', 'description', 'text'],
      ['created_at', 'createdAt', 'text']
    ],
    ddl: `CREATE TABLE IF NOT EXISTS portfolios (
      id TEXT PRIMARY KEY,
      title TEXT,
      author TEXT,
      subdomain TEXT,
      author_avatar TEXT,
      author_role TEXT,
      image TEXT,
      tags_json TEXT,
      budget TEXT,
      duration TEXT,
      likes INTEGER DEFAULT 0,
      description TEXT,
      created_at TEXT,
      extra_json TEXT
    )`,
    indexes: ['CREATE INDEX IF NOT EXISTS idx_portfolios_subdomain ON portfolios(subdomain)']
  },
  candidates: {
    table: 'candidates',
    columns: [
      ['id', 'id', 'text'],
      ['name', 'name', 'text'],
      ['avatar', 'avatar', 'text'],
      ['role', 'role', 'text'],
      ['experience_years', 'experienceYears', 'int'],
      ['skills_json', 'skills', 'json'],
      ['rating', 'rating', 'real'],
      ['completed_projects', 'completedProjects', 'int'],
      ['portfolio_url', 'portfolioUrl', 'text'],
      ['is_pro', 'isPro', 'bool']
    ],
    ddl: `CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY,
      name TEXT,
      avatar TEXT,
      role TEXT,
      experience_years INTEGER,
      skills_json TEXT,
      rating REAL,
      completed_projects INTEGER,
      portfolio_url TEXT,
      is_pro INTEGER DEFAULT 0,
      extra_json TEXT
    )`,
    indexes: []
  },
  applications: {
    table: 'applications',
    columns: [
      ['id', 'id', 'text'],
      ['candidate_name', 'candidateName', 'text'],
      ['candidate_email', 'candidateEmail', 'text'],
      ['candidate_avatar', 'candidateAvatar', 'text'],
      ['job_id', 'jobId', 'text'],
      ['job_title', 'jobTitle', 'text'],
      ['status', 'status', 'text'],
      ['match_score', 'matchScore', 'int'],
      ['portfolio_url', 'portfolioUrl', 'text'],
      ['applied_at', 'appliedAt', 'text']
    ],
    ddl: `CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      candidate_name TEXT,
      candidate_email TEXT,
      candidate_avatar TEXT,
      job_id TEXT,
      job_title TEXT,
      status TEXT,
      match_score INTEGER,
      portfolio_url TEXT,
      applied_at TEXT,
      extra_json TEXT
    )`,
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id)',
      'CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)'
    ]
  },
  posts: {
    table: 'posts',
    columns: [
      ['id', 'id', 'text'],
      ['type', 'type', 'text'],
      ['author', 'author', 'text'],
      ['author_avatar', 'authorAvatar', 'text'],
      ['title', 'title', 'text'],
      ['content', 'content', 'text'],
      ['budget', 'budget', 'text'],
      ['contact', 'contact', 'text'],
      ['likes', 'likes', 'int'],
      ['comments', 'comments', 'int'],
      ['created_at', 'createdAt', 'text']
    ],
    ddl: `CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      type TEXT,
      author TEXT,
      author_avatar TEXT,
      title TEXT,
      content TEXT,
      budget TEXT,
      contact TEXT,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      created_at TEXT,
      extra_json TEXT
    )`,
    indexes: ['CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type)']
  },
  feedback: {
    table: 'feedback',
    columns: [
      ['id', 'id', 'text'],
      ['user_name', 'userName', 'text'],
      ['user_role', 'userRole', 'text'],
      ['rating', 'rating', 'int'],
      ['comment', 'comment', 'text'],
      ['created_at', 'createdAt', 'text']
    ],
    ddl: `CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      user_name TEXT,
      user_role TEXT,
      rating INTEGER,
      comment TEXT,
      created_at TEXT,
      extra_json TEXT
    )`,
    indexes: []
  },
  interviewShares: {
    table: 'interview_shares',
    columns: [
      ['id', 'id', 'text'],
      ['company_name', 'companyName', 'text'],
      ['position', 'position', 'text'],
      ['questions_encountered', 'questionsEncountered', 'text'],
      ['tips', 'tips', 'text'],
      ['submitted_by', 'submittedBy', 'text'],
      ['created_at', 'createdAt', 'text']
    ],
    ddl: `CREATE TABLE IF NOT EXISTS interview_shares (
      id TEXT PRIMARY KEY,
      company_name TEXT,
      position TEXT,
      questions_encountered TEXT,
      tips TEXT,
      submitted_by TEXT,
      created_at TEXT,
      extra_json TEXT
    )`,
    indexes: []
  },
  cvTemplateLikes: {
    table: 'cv_template_likes',
    columns: [
      ['id', 'id', 'text'],
      ['likes', 'likes', 'int']
    ],
    ddl: `CREATE TABLE IF NOT EXISTS cv_template_likes (
      id TEXT PRIMARY KEY,
      likes INTEGER DEFAULT 0,
      extra_json TEXT
    )`,
    indexes: []
  }
};

const KV_DDL = `CREATE TABLE IF NOT EXISTS kv_collections (
  collection_name TEXT NOT NULL,
  item_key TEXT NOT NULL,
  data_json TEXT NOT NULL,
  updated_at TEXT,
  PRIMARY KEY (collection_name, item_key)
)`;

function encodeValue(val, type) {
  if (val === undefined || val === null) return null;
  if (type === 'bool') return val ? 1 : 0;
  if (type === 'int') return Number.isFinite(Number(val)) ? Math.trunc(Number(val)) : null;
  if (type === 'real') return Number.isFinite(Number(val)) ? Number(val) : null;
  if (type === 'json') return JSON.stringify(val);
  return String(val);
}

function decodeValue(val, type) {
  if (val === null || val === undefined) return undefined;
  if (type === 'bool') return Boolean(val);
  if (type === 'int' || type === 'real') return Number(val);
  if (type === 'json') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return val;
}

function toRow(collection, item) {
  const spec = TABLES[collection];
  const knownKeys = new Set(spec.columns.map(([, prop]) => prop));
  const extra = {};
  for (const [k, v] of Object.entries(item || {})) {
    if (!knownKeys.has(k) && v !== undefined) extra[k] = v;
  }
  const id = String(item?.id || `row_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  const args = spec.columns.map(([, prop, type]) => (prop === 'id' ? id : encodeValue(item?.[prop], type)));
  args.push(Object.keys(extra).length ? JSON.stringify(extra) : null);
  return { id, args };
}

function fromRow(collection, row) {
  const spec = TABLES[collection];
  const obj = {};
  for (const [col, prop, type] of spec.columns) {
    const decoded = decodeValue(row[col], type);
    if (decoded !== undefined) obj[prop] = decoded;
  }
  if (row.extra_json) {
    try {
      Object.assign(obj, JSON.parse(row.extra_json));
    } catch { /* ignore malformed extra_json */ }
  }
  return obj;
}

function buildUpsertSql(spec) {
  const cols = [...spec.columns.map(([col]) => col), 'extra_json'];
  const placeholders = cols.map(() => '?').join(', ');
  return `INSERT OR REPLACE INTO ${spec.table} (${cols.join(', ')}) VALUES (${placeholders})`;
}

class TursoAdapter {
  constructor() {
    this.url = (process.env.TURSO_DATABASE_URL || '').trim();
    this.authToken = (process.env.TURSO_AUTH_TOKEN || '').trim();
    this.enabled = Boolean(this.url && this.authToken);
    this.client = this.enabled ? createClient({ url: this.url, authToken: this.authToken }) : null;
  }

  async ensureSchema() {
    if (!this.enabled) return;
    const stmts = [];
    for (const spec of Object.values(TABLES)) {
      stmts.push(spec.ddl);
      for (const idx of spec.indexes) stmts.push(idx);
    }
    stmts.push(KV_DDL);
    await this.client.batch(stmts, 'write');
  }

  async hasAnyData() {
    if (!this.enabled) return false;
    for (const spec of Object.values(TABLES)) {
      const res = await this.client.execute(`SELECT 1 FROM ${spec.table} LIMIT 1`);
      if (res.rows.length > 0) return true;
    }
    const kvRes = await this.client.execute('SELECT 1 FROM kv_collections LIMIT 1');
    return kvRes.rows.length > 0;
  }

  async loadAll() {
    if (!this.enabled) return null;
    const data = {};
    for (const [collection, spec] of Object.entries(TABLES)) {
      const res = await this.client.execute(`SELECT * FROM ${spec.table}`);
      data[collection] = res.rows.map(r => fromRow(collection, r));
    }
    const kvRes = await this.client.execute('SELECT collection_name, item_key, data_json FROM kv_collections');
    for (const row of kvRes.rows) {
      const col = row.collection_name;
      let parsed;
      try { parsed = JSON.parse(row.data_json); } catch { continue; }
      if (row.item_key === '__map__') {
        data[col] = parsed;
      } else {
        if (!Array.isArray(data[col])) data[col] = [];
        data[col].push(parsed);
      }
    }
    if (!data.payments) data.payments = {};
    return data;
  }

  async upsertItem(collection, item) {
    if (!this.enabled || !item) return;
    if (TABLES[collection]) {
      const spec = TABLES[collection];
      const { args } = toRow(collection, item);
      await this.client.execute({ sql: buildUpsertSql(spec), args });
      return;
    }
    const key = String(item.id || `item_${Date.now()}`);
    await this.client.execute({
      sql: 'INSERT OR REPLACE INTO kv_collections (collection_name, item_key, data_json, updated_at) VALUES (?, ?, ?, ?)',
      args: [collection, key, JSON.stringify(item), new Date().toISOString()]
    });
  }

  async syncCollection(collection, value) {
    if (!this.enabled) return;
    const stmts = [];
    if (TABLES[collection]) {
      const spec = TABLES[collection];
      const sql = buildUpsertSql(spec);
      stmts.push(`DELETE FROM ${spec.table}`);
      const list = Array.isArray(value) ? value : [];
      for (const item of list) {
        if (!item || typeof item !== 'object') continue;
        stmts.push({ sql, args: toRow(collection, item).args });
      }
      await this.client.batch(stmts, 'write');
      return;
    }
    stmts.push({ sql: 'DELETE FROM kv_collections WHERE collection_name = ?', args: [collection] });
    const now = new Date().toISOString();
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        const key = String(item?.id || `idx_${i}`);
        stmts.push({
          sql: 'INSERT OR REPLACE INTO kv_collections (collection_name, item_key, data_json, updated_at) VALUES (?, ?, ?, ?)',
          args: [collection, key, JSON.stringify(item), now]
        });
      }
    } else if (value && typeof value === 'object') {
      stmts.push({
        sql: 'INSERT OR REPLACE INTO kv_collections (collection_name, item_key, data_json, updated_at) VALUES (?, ?, ?, ?)',
        args: [collection, '__map__', JSON.stringify(value), now]
      });
    }
    await this.client.batch(stmts, 'write');
  }

  async syncAll(allData) {
    if (!this.enabled || !allData || typeof allData !== 'object') return;
    const stmts = [];
    const now = new Date().toISOString();

    for (const [collection, value] of Object.entries(allData)) {
      if (TABLES[collection]) {
        const spec = TABLES[collection];
        const sql = buildUpsertSql(spec);
        stmts.push(`DELETE FROM ${spec.table}`);
        const list = Array.isArray(value) ? value : [];
        for (const item of list) {
          if (!item || typeof item !== 'object') continue;
          stmts.push({ sql, args: toRow(collection, item).args });
        }
      } else {
        stmts.push({ sql: 'DELETE FROM kv_collections WHERE collection_name = ?', args: [collection] });
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            const item = value[i];
            const key = String(item?.id || `idx_${i}`);
            stmts.push({
              sql: 'INSERT OR REPLACE INTO kv_collections (collection_name, item_key, data_json, updated_at) VALUES (?, ?, ?, ?)',
              args: [collection, key, JSON.stringify(item), now]
            });
          }
        } else if (value && typeof value === 'object') {
          stmts.push({
            sql: 'INSERT OR REPLACE INTO kv_collections (collection_name, item_key, data_json, updated_at) VALUES (?, ?, ?, ?)',
            args: [collection, '__map__', JSON.stringify(value), now]
          });
        }
      }
    }

    if (stmts.length > 0) {
      await this.client.batch(stmts, 'write');
    }
  }
}

module.exports = { TursoAdapter, TABLES };
