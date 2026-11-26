/**
 * ConnectCV AI Agent Editor v2.0
 * Real-time Sandboxed CV Editor with Visual Before/After Diff,
 * Selective Apply, Undo/Redo Stack, Live Visual Preview Sync, and Zero-XSS DOM Rendering.
 *
 * Security Boundary: ONLY mutates whitelisted CV profile fields.
 * ZERO arbitrary DOM tampering, ZERO eval/script injection, ZERO system/token access.
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────
  // 1. STATE, HISTORY & SAFE IN-MEMORY STORES
  // ─────────────────────────────────────────────────────────
  let agentHistory = [];
  let undoStack = [];
  let redoStack = [];
  let activeOperation = null;
  let agentGeneration = 0;
  let autoApply = true;
  let cardSeq = 0;
  let followUpSeq = 0;

  // Store action cards & follow-ups in RAM by opaque ID (NEVER inline JSON in onclick!)
  const actionCardStore = new Map();
  const followUpStore = new Map();

  const FIELD_LABELS = {
    fullName: 'Họ và tên',
    targetRole: 'Vị trí mục tiêu',
    phone: 'Số điện thoại',
    email: 'Email',
    address: 'Địa chỉ',
    birth: 'Ngày sinh',
    summary: 'Tóm tắt bản thân',
    website: 'Website',
    linkedin: 'LinkedIn',
    github: 'GitHub'
  };

  // ─────────────────────────────────────────────────────────
  // 2. SECURITY SANITIZER & HTML ESCAPER
  // ─────────────────────────────────────────────────────────
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function sanitize(str, maxLen = 2000) {
    if (str === null || str === undefined) return '';
    let s = String(str);
    s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
    s = s.replace(/<!--[\s\S]*?-->/g, '');
    // Strip real HTML tags only; keep technical text like "latency < 100ms" or "uptime > 99.9%"
    s = s.replace(/<\s*\/?\s*[a-zA-Z][a-zA-Z0-9:-]*(?:\s+[^<>]*)?\/?\s*>/g, '');
    s = s.replace(/<\s*\/?\s*(?:script|iframe|object|embed|svg|math|img|style|link|meta|form|input|body|html)\b[^<>]*$/gi, '');
    s = s.replace(/(?:javascript|vbscript)\s*:/gi, '');
    s = s.replace(/data\s*:\s*text\/html/gi, '');
    return s.trim().slice(0, maxLen);
  }

  function truncatePreview(str, maxLen = 180) {
    const clean = String(str || '').trim();
    if (clean.length <= maxLen) return clean;
    return clean.slice(0, maxLen - 1) + '…';
  }

  // ─────────────────────────────────────────────────────────
  // 3. PROFILE READ / WRITE HELPERS (WITH OPTIONAL SECTIONS)
  // ─────────────────────────────────────────────────────────
  function readRawProfileJson() {
    try {
      const val = document.getElementById('cv-profile')?.value || '{}';
      const parsed = JSON.parse(val);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeOptionalProfileKeys(updates) {
    const textarea = document.getElementById('cv-profile');
    if (!textarea || !updates || typeof updates !== 'object') return;
    const current = readRawProfileJson();
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined) delete current[k];
      else current[k] = v;
    }
    textarea.value = JSON.stringify(current, null, 2);
  }

  function getExperienceList() {
    if (typeof window.getCvExperienceList === 'function') return window.getCvExperienceList();
    if (Array.isArray(window.currentExperienceList)) return window.currentExperienceList;
    const p = readRawProfileJson();
    return Array.isArray(p.experience) ? p.experience : [];
  }

  function setExperienceList(list) {
    if (typeof window.setCvExperienceList === 'function') {
      window.setCvExperienceList(list);
    } else {
      window.currentExperienceList = list;
      if (typeof window.renderExperienceList === 'function') window.renderExperienceList();
    }
  }

  function getEducationList() {
    if (typeof window.getCvEducationList === 'function') return window.getCvEducationList();
    if (Array.isArray(window.currentEducationList)) return window.currentEducationList;
    const p = readRawProfileJson();
    return Array.isArray(p.education) ? p.education : [];
  }

  function setEducationList(list) {
    if (typeof window.setCvEducationList === 'function') {
      window.setCvEducationList(list);
    } else {
      window.currentEducationList = list;
      if (typeof window.renderEducationList === 'function') window.renderEducationList();
    }
  }

  function captureSnapshot() {
    const raw = readRawProfileJson();
    const skillsVal = document.getElementById('prof-skills')?.value || '';
    const skills = skillsVal.split(',').map(s => s.trim()).filter(Boolean);
    const snap = {
      fullName: document.getElementById('prof-fullname')?.value || '',
      targetRole: document.getElementById('prof-role')?.value || '',
      phone: document.getElementById('prof-phone')?.value || '',
      email: document.getElementById('prof-email')?.value || '',
      address: document.getElementById('prof-address')?.value || '',
      birth: document.getElementById('prof-birth')?.value || '',
      summary: document.getElementById('prof-summary')?.value || '',
      skills,
      experience: JSON.parse(JSON.stringify(getExperienceList())),
      education: JSON.parse(JSON.stringify(getEducationList()))
    };
    if (Array.isArray(raw.projects)) snap.projects = JSON.parse(JSON.stringify(raw.projects));
    if (Array.isArray(raw.certifications)) snap.certifications = JSON.parse(JSON.stringify(raw.certifications));
    if (Array.isArray(raw.languages)) snap.languages = JSON.parse(JSON.stringify(raw.languages));
    for (const linkKey of ['website', 'linkedin', 'github']) {
      if (typeof raw[linkKey] === 'string' && raw[linkKey]) snap[linkKey] = raw[linkKey];
    }
    return snap;
  }

  function restoreSnapshot(snap) {
    if (!snap || typeof snap !== 'object') return;
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };
    setVal('prof-fullname', snap.fullName);
    setVal('prof-role', snap.targetRole);
    setVal('prof-phone', snap.phone);
    setVal('prof-email', snap.email);
    setVal('prof-address', snap.address);
    setVal('prof-birth', snap.birth);
    setVal('prof-summary', snap.summary);
    setVal('prof-skills', Array.isArray(snap.skills) ? snap.skills.join(', ') : (snap.skills || ''));
    setExperienceList(JSON.parse(JSON.stringify(snap.experience || [])));
    setEducationList(JSON.parse(JSON.stringify(snap.education || [])));

    // Restore optional keys into #cv-profile JSON before syncing
    writeOptionalProfileKeys({
      projects: snap.projects,
      certifications: snap.certifications,
      languages: snap.languages,
      website: snap.website,
      linkedin: snap.linkedin,
      github: snap.github
    });

    if (typeof window.syncProfileFormToJSON === 'function') {
      window.syncProfileFormToJSON();
    }
    triggerLivePreviewRefresh();
  }

  function highlightElement(el) {
    if (!el) return;
    el.classList.remove('cv-agent-highlight');
    // Force reflow so repeat edits re-trigger pulse animation
    void el.offsetWidth;
    el.classList.add('cv-agent-highlight');
    setTimeout(() => {
      el.classList.remove('cv-agent-highlight');
    }, 2200);
  }

  function triggerLivePreviewRefresh() {
    if (typeof window.refreshCvVisualPreviewFromProfile === 'function') {
      try {
        window.refreshCvVisualPreviewFromProfile();
      } catch (e) {
        console.warn('[CV Agent] Preview refresh skipped');
      }
    }
  }

  // ─────────────────────────────────────────────────────────
  // 4. DIFF BUILDER (BEFORE -> AFTER PREVIEW)
  // ─────────────────────────────────────────────────────────
  function buildActionDiff(action, snap) {
    if (!action || typeof action !== 'object') return [];
    const type = String(action.type || '').toUpperCase();
    const p = action.payload || {};
    const diffs = [];

    switch (type) {
      case 'SET_SUMMARY':
        diffs.push({
          label: 'Tóm tắt bản thân',
          before: truncatePreview(snap.summary || '(trống)', 180),
          after: truncatePreview(sanitize(p.summary ?? p.text ?? '', 3000), 180)
        });
        break;

      case 'ADD_SKILLS': {
        const existingLower = new Set((snap.skills || []).map(s => s.toLowerCase()));
        const adding = (Array.isArray(p.skills) ? p.skills : [])
          .map(s => sanitize(s, 80))
          .filter(s => s && !existingLower.has(s.toLowerCase()));
        diffs.push({
          label: 'Thêm kỹ năng',
          before: adding.length ? '' : '(Các kỹ năng này đã có sẵn trong CV)',
          after: adding.length ? adding.map(s => `+ ${s}`).join(', ') : ''
        });
        break;
      }

      case 'REMOVE_SKILL': {
        const target = sanitize(p.skill || '', 80);
        const exists = (snap.skills || []).some(s => s.toLowerCase() === target.toLowerCase());
        diffs.push({
          label: 'Xóa kỹ năng',
          before: exists ? `- ${target}` : `(Không có "${target}" trong CV)`,
          after: ''
        });
        break;
      }

      case 'SET_SKILLS': {
        const oldSkills = snap.skills || [];
        const newSkills = (Array.isArray(p.skills) ? p.skills : []).map(s => sanitize(s, 80)).filter(Boolean);
        diffs.push({
          label: 'Danh sách kỹ năng',
          before: truncatePreview(oldSkills.join(', ') || '(trống)', 140),
          after: truncatePreview(newSkills.join(', ') || '(trống)', 140)
        });
        break;
      }

      case 'UPDATE_PERSONAL_INFO':
      case 'UPDATE_LINKS': {
        for (const [k, val] of Object.entries(p)) {
          if (FIELD_LABELS[k]) {
            diffs.push({
              label: FIELD_LABELS[k],
              before: truncatePreview(snap[k] || '(trống)', 120),
              after: truncatePreview(sanitize(val, 250) || '(xóa trống)', 120)
            });
          }
        }
        break;
      }

      case 'ADD_EXPERIENCE':
        diffs.push({
          label: `Thêm kinh nghiệm: ${sanitize(p.role || p.company || 'Mới', 80)}`,
          before: '',
          after: truncatePreview(`${p.company || ''} • ${p.role || ''} (${p.time || ''}) — ${(p.bullets || []).join(' | ')}`, 200)
        });
        break;

      case 'UPDATE_EXPERIENCE': {
        const idx = parseInt(p.index, 10);
        const oldExp = Array.isArray(snap.experience) ? snap.experience[idx] : null;
        if (!oldExp) {
          diffs.push({ label: `Kinh nghiệm #${idx + 1}`, before: '(Không tìm thấy mục này)', after: '' });
        } else {
          const oldText = `${oldExp.company || ''} • ${oldExp.role || ''} — ${(oldExp.bullets || []).join(' | ')}`;
          const newText = `${p.company ?? oldExp.company ?? ''} • ${p.role ?? oldExp.role ?? ''} — ${(p.bullets ?? oldExp.bullets ?? []).join(' | ')}`;
          diffs.push({
            label: `Sửa kinh nghiệm #${idx + 1}`,
            before: truncatePreview(oldText, 160),
            after: truncatePreview(newText, 160)
          });
        }
        break;
      }

      case 'REMOVE_EXPERIENCE': {
        const idx = parseInt(p.index, 10);
        const oldExp = Array.isArray(snap.experience) ? snap.experience[idx] : null;
        diffs.push({
          label: `Xóa kinh nghiệm #${idx + 1}`,
          before: oldExp ? truncatePreview(`${oldExp.company || ''} — ${oldExp.role || ''}`, 140) : '(Không tìm thấy mục này)',
          after: ''
        });
        break;
      }

      case 'ADD_EDUCATION':
        diffs.push({
          label: 'Thêm học vấn',
          before: '',
          after: truncatePreview(`${p.school || ''} — ${p.degree || ''} (${p.time || ''})`, 180)
        });
        break;

      case 'UPDATE_EDUCATION': {
        const idx = parseInt(p.index, 10);
        const oldEdu = Array.isArray(snap.education) ? snap.education[idx] : null;
        if (!oldEdu) {
          diffs.push({ label: `Học vấn #${idx + 1}`, before: '(Không tìm thấy mục này)', after: '' });
        } else {
          diffs.push({
            label: `Sửa học vấn #${idx + 1}`,
            before: truncatePreview(`${oldEdu.school || ''} — ${oldEdu.degree || ''} (${oldEdu.highlight || ''})`, 140),
            after: truncatePreview(`${p.school ?? oldEdu.school ?? ''} — ${p.degree ?? oldEdu.degree ?? ''} (${p.highlight ?? oldEdu.highlight ?? ''})`, 140)
          });
        }
        break;
      }

      case 'REMOVE_EDUCATION': {
        const idx = parseInt(p.index, 10);
        const oldEdu = Array.isArray(snap.education) ? snap.education[idx] : null;
        diffs.push({
          label: `Xóa học vấn #${idx + 1}`,
          before: oldEdu ? truncatePreview(`${oldEdu.school || ''} — ${oldEdu.degree || ''}`, 140) : '(Không tìm thấy mục này)',
          after: ''
        });
        break;
      }

      case 'ADD_PROJECT':
        diffs.push({
          label: `Thêm dự án: ${sanitize(p.name || 'Mới', 80)}`,
          before: '',
          after: truncatePreview(`${p.name || ''} (${p.role || ''}) — ${p.description || (p.bullets || []).join(' | ')}`, 180)
        });
        break;

      case 'SET_LANGUAGES':
        diffs.push({
          label: 'Ngoại ngữ',
          before: truncatePreview((snap.languages || []).join(', ') || '(trống)', 120),
          after: truncatePreview((p.languages || []).join(', ') || '(trống)', 120)
        });
        break;

      case 'SET_CERTIFICATIONS': {
        const fmt = arr => (arr || []).map(c => (typeof c === 'string' ? c : c?.name || '')).filter(Boolean).join(', ');
        diffs.push({
          label: 'Chứng chỉ',
          before: truncatePreview(fmt(snap.certifications) || '(trống)', 120),
          after: truncatePreview(fmt(p.certifications) || '(trống)', 120)
        });
        break;
      }

      case 'REPLACE_PROFILE': {
        const changedKeys = Object.keys(p).map(k => FIELD_LABELS[k] || k);
        diffs.push({
          label: 'Cập nhật nhiều mục CV',
          before: '',
          after: `Cập nhật các phần: ${changedKeys.join(', ')}`
        });
        break;
      }

      default:
        break;
    }

    return diffs;
  }

  // ─────────────────────────────────────────────────────────
  // 5. ACTION APPLICATOR (STRICT SANDBOX)
  // ─────────────────────────────────────────────────────────
  function applyAction(action) {
    if (!action || typeof action !== 'object') return false;
    const type = String(action.type || '').toUpperCase();
    const payload = action.payload || {};

    switch (type) {
      case 'SET_SUMMARY': {
        const text = sanitize(payload.summary ?? payload.text ?? '', 3000);
        const el = document.getElementById('prof-summary');
        if (el && text && el.value !== text) {
          el.value = text;
          highlightElement(el);
          return true;
        }
        return false;
      }

      case 'ADD_SKILLS': {
        const newSkills = Array.isArray(payload.skills)
          ? payload.skills.map(s => sanitize(s, 80)).filter(Boolean)
          : [];
        const el = document.getElementById('prof-skills');
        if (!el || !newSkills.length) return false;
        const current = el.value.split(',').map(s => s.trim()).filter(Boolean);
        const currentLower = new Set(current.map(s => s.toLowerCase()));
        let added = 0;
        for (const s of newSkills) {
          if (!currentLower.has(s.toLowerCase())) {
            current.push(s);
            currentLower.add(s.toLowerCase());
            added++;
          }
        }
        if (added === 0) return false;
        el.value = current.join(', ');
        highlightElement(el);
        return true;
      }

      case 'REMOVE_SKILL': {
        const target = sanitize(payload.skill || '', 80).toLowerCase();
        const el = document.getElementById('prof-skills');
        if (!el || !target) return false;
        const current = el.value.split(',').map(s => s.trim()).filter(Boolean);
        const filtered = current.filter(s => s.toLowerCase() !== target);
        if (filtered.length === current.length) return false;
        el.value = filtered.join(', ');
        highlightElement(el);
        return true;
      }

      case 'SET_SKILLS': {
        const skills = Array.isArray(payload.skills)
          ? payload.skills.map(s => sanitize(s, 80)).filter(Boolean)
          : [];
        const el = document.getElementById('prof-skills');
        if (!el) return false;
        const nextVal = skills.join(', ');
        if (el.value.trim() === nextVal) return false;
        el.value = nextVal;
        highlightElement(el);
        return true;
      }

      case 'UPDATE_PERSONAL_INFO': {
        let changed = false;
        const map = {
          fullName: 'prof-fullname',
          targetRole: 'prof-role',
          phone: 'prof-phone',
          email: 'prof-email',
          address: 'prof-address',
          birth: 'prof-birth'
        };
        for (const [key, id] of Object.entries(map)) {
          if (payload[key] !== undefined) {
            const el = document.getElementById(id);
            const cleanVal = sanitize(payload[key], key === 'address' ? 250 : 150);
            if (el && el.value !== cleanVal) {
              el.value = cleanVal;
              highlightElement(el);
              changed = true;
            }
          }
        }
        return changed;
      }

      case 'UPDATE_LINKS': {
        const updates = {};
        let changed = false;
        const raw = readRawProfileJson();
        for (const k of ['website', 'linkedin', 'github']) {
          if (payload[k] !== undefined) {
            const clean = sanitize(payload[k], 250);
            if (raw[k] !== clean) {
              updates[k] = clean || undefined;
              changed = true;
            }
          }
        }
        if (changed) writeOptionalProfileKeys(updates);
        return changed;
      }

      case 'ADD_EXPERIENCE': {
        const list = getExperienceList();
        const item = {
          company: sanitize(payload.company || '', 150),
          role: sanitize(payload.role || '', 150),
          time: sanitize(payload.time || '', 100),
          bullets: Array.isArray(payload.bullets)
            ? payload.bullets.map(b => sanitize(b, 1000)).filter(Boolean)
            : []
        };
        if (!item.company && !item.role && !item.bullets.length) return false;
        list.push(item);
        setExperienceList(list);
        highlightElement(document.getElementById('prof-experience-list'));
        return true;
      }

      case 'UPDATE_EXPERIENCE': {
        const idx = parseInt(payload.index, 10);
        const list = getExperienceList();
        if (isNaN(idx) || idx < 0 || idx >= list.length) return false;
        if (payload.company !== undefined) list[idx].company = sanitize(payload.company, 150);
        if (payload.role !== undefined) list[idx].role = sanitize(payload.role, 150);
        if (payload.time !== undefined) list[idx].time = sanitize(payload.time, 100);
        if (payload.bullets !== undefined) {
          list[idx].bullets = Array.isArray(payload.bullets)
            ? payload.bullets.map(b => sanitize(b, 1000)).filter(Boolean)
            : [];
        }
        setExperienceList(list);
        highlightElement(document.getElementById('prof-experience-list'));
        return true;
      }

      case 'REMOVE_EXPERIENCE': {
        const idx = parseInt(payload.index, 10);
        const list = getExperienceList();
        if (isNaN(idx) || idx < 0 || idx >= list.length) return false;
        list.splice(idx, 1);
        setExperienceList(list);
        return true;
      }

      case 'ADD_EDUCATION': {
        const list = getEducationList();
        const item = {
          school: sanitize(payload.school || '', 150),
          degree: sanitize(payload.degree || '', 150),
          time: sanitize(payload.time || '', 100),
          highlight: sanitize(payload.highlight || '', 500)
        };
        if (!item.school && !item.degree) return false;
        list.push(item);
        setEducationList(list);
        highlightElement(document.getElementById('prof-education-list'));
        return true;
      }

      case 'UPDATE_EDUCATION': {
        const idx = parseInt(payload.index, 10);
        const list = getEducationList();
        if (isNaN(idx) || idx < 0 || idx >= list.length) return false;
        if (payload.school !== undefined) list[idx].school = sanitize(payload.school, 150);
        if (payload.degree !== undefined) list[idx].degree = sanitize(payload.degree, 150);
        if (payload.time !== undefined) list[idx].time = sanitize(payload.time, 100);
        if (payload.highlight !== undefined) list[idx].highlight = sanitize(payload.highlight, 500);
        setEducationList(list);
        highlightElement(document.getElementById('prof-education-list'));
        return true;
      }

      case 'REMOVE_EDUCATION': {
        const idx = parseInt(payload.index, 10);
        const list = getEducationList();
        if (isNaN(idx) || idx < 0 || idx >= list.length) return false;
        list.splice(idx, 1);
        setEducationList(list);
        return true;
      }

      case 'ADD_PROJECT': {
        const raw = readRawProfileJson();
        const projects = Array.isArray(raw.projects) ? [...raw.projects] : [];
        projects.push({
          name: sanitize(payload.name || '', 150),
          role: sanitize(payload.role || '', 150),
          time: sanitize(payload.time || '', 100),
          description: sanitize(payload.description || '', 1000),
          bullets: Array.isArray(payload.bullets) ? payload.bullets.map(b => sanitize(b, 800)).filter(Boolean) : []
        });
        writeOptionalProfileKeys({ projects });
        return true;
      }

      case 'UPDATE_PROJECT': {
        const idx = parseInt(payload.index, 10);
        const raw = readRawProfileJson();
        const projects = Array.isArray(raw.projects) ? [...raw.projects] : [];
        if (isNaN(idx) || idx < 0 || idx >= projects.length) return false;
        const target = { ...(projects[idx] || {}) };
        if (payload.name !== undefined) target.name = sanitize(payload.name, 150);
        if (payload.role !== undefined) target.role = sanitize(payload.role, 150);
        if (payload.time !== undefined) target.time = sanitize(payload.time, 100);
        if (payload.description !== undefined) target.description = sanitize(payload.description, 1000);
        if (payload.bullets !== undefined) target.bullets = Array.isArray(payload.bullets) ? payload.bullets.map(b => sanitize(b, 800)).filter(Boolean) : [];
        projects[idx] = target;
        writeOptionalProfileKeys({ projects });
        return true;
      }

      case 'REMOVE_PROJECT': {
        const idx = parseInt(payload.index, 10);
        const raw = readRawProfileJson();
        const projects = Array.isArray(raw.projects) ? [...raw.projects] : [];
        if (isNaN(idx) || idx < 0 || idx >= projects.length) return false;
        projects.splice(idx, 1);
        writeOptionalProfileKeys({ projects });
        return true;
      }

      case 'SET_LANGUAGES': {
        const languages = Array.isArray(payload.languages)
          ? payload.languages.map(l => sanitize(l, 100)).filter(Boolean)
          : [];
        writeOptionalProfileKeys({ languages });
        return true;
      }

      case 'SET_CERTIFICATIONS': {
        const certs = Array.isArray(payload.certifications)
          ? payload.certifications.map(c => {
              if (typeof c === 'string') return sanitize(c, 200);
              if (c && typeof c === 'object') {
                return {
                  name: sanitize(c.name || '', 200),
                  issuer: sanitize(c.issuer || '', 150),
                  time: sanitize(c.time || '', 100)
                };
              }
              return null;
            }).filter(Boolean)
          : [];
        writeOptionalProfileKeys({ certifications: certs });
        return true;
      }

      case 'REPLACE_PROFILE': {
        let changed = false;
        const info = {};
        for (const k of ['fullName', 'targetRole', 'phone', 'email', 'address', 'birth']) {
          if (payload[k] !== undefined) info[k] = payload[k];
        }
        if (Object.keys(info).length && applyAction({ type: 'UPDATE_PERSONAL_INFO', payload: info })) changed = true;
        const links = {};
        for (const k of ['website', 'linkedin', 'github']) {
          if (payload[k] !== undefined) links[k] = payload[k];
        }
        if (Object.keys(links).length && applyAction({ type: 'UPDATE_LINKS', payload: links })) changed = true;
        if (payload.summary !== undefined && applyAction({ type: 'SET_SUMMARY', payload: { summary: payload.summary } })) changed = true;
        if (Array.isArray(payload.skills) && applyAction({ type: 'SET_SKILLS', payload: { skills: payload.skills } })) changed = true;
        if (Array.isArray(payload.experience)) {
          setExperienceList(payload.experience.map(e => ({
            company: sanitize(e?.company || '', 150),
            role: sanitize(e?.role || '', 150),
            time: sanitize(e?.time || '', 100),
            bullets: Array.isArray(e?.bullets) ? e.bullets.map(b => sanitize(b, 1000)).filter(Boolean) : []
          })));
          changed = true;
        }
        if (Array.isArray(payload.education)) {
          setEducationList(payload.education.map(e => ({
            school: sanitize(e?.school || '', 150),
            degree: sanitize(e?.degree || '', 150),
            time: sanitize(e?.time || '', 100),
            highlight: sanitize(e?.highlight || '', 500)
          })));
          changed = true;
        }
        if (Array.isArray(payload.languages)) {
          writeOptionalProfileKeys({ languages: payload.languages.map(l => sanitize(l, 100)).filter(Boolean) });
          changed = true;
        }
        return changed;
      }

      default:
        return false;
    }
  }

  function applyActionsBatch(actions, options = {}) {
    if (!Array.isArray(actions) || actions.length === 0) return 0;
    const before = captureSnapshot();

    let appliedCount = 0;
    for (const action of actions) {
      if (applyAction(action)) appliedCount++;
    }

    if (appliedCount > 0) {
      undoStack.push(before);
      if (undoStack.length > 25) undoStack.shift();
      redoStack = [];

      if (typeof window.syncProfileFormToJSON === 'function') {
        window.syncProfileFormToJSON();
      }
      triggerLivePreviewRefresh();

      if (!options.silent && typeof window.showToastSuccess === 'function') {
        window.showToastSuccess(`AI Agent đã áp dụng ${appliedCount} thay đổi vào CV!`, 'Cập nhật CV');
      }
      updateHistoryButtons();
    }
    return appliedCount;
  }

  function undoLastAction() {
    if (undoStack.length === 0) {
      if (typeof window.showToastInfo === 'function') {
        window.showToastInfo('Không còn thay đổi nào để hoàn tác.', 'Hoàn tác');
      }
      return false;
    }
    const current = captureSnapshot();
    const previous = undoStack.pop();
    redoStack.push(current);
    if (redoStack.length > 25) redoStack.shift();

    restoreSnapshot(previous);
    if (typeof window.showToastSuccess === 'function') {
      window.showToastSuccess('Đã hoàn tác thay đổi gần nhất của AI Agent!', 'Hoàn tác thành công');
    }
    updateHistoryButtons();
    return true;
  }

  function redoLastAction() {
    if (redoStack.length === 0) {
      if (typeof window.showToastInfo === 'function') {
        window.showToastInfo('Không còn thay đổi nào để làm lại.', 'Làm lại');
      }
      return false;
    }
    const current = captureSnapshot();
    const next = redoStack.pop();
    undoStack.push(current);

    restoreSnapshot(next);
    if (typeof window.showToastSuccess === 'function') {
      window.showToastSuccess('Đã khôi phục thay đổi của AI Agent!', 'Làm lại thành công');
    }
    updateHistoryButtons();
    return true;
  }

  function updateHistoryButtons() {
    const btnUndo = document.getElementById('btn-cv-agent-undo');
    const btnRedo = document.getElementById('btn-cv-agent-redo');
    if (btnUndo) btnUndo.disabled = undoStack.length === 0;
    if (btnRedo) btnRedo.disabled = redoStack.length === 0;
  }

  // ─────────────────────────────────────────────────────────
  // 6. VISUAL DIFF CARD RENDERER (ZERO INLINE DATA / ZERO XSS)
  // ─────────────────────────────────────────────────────────
  function formatAgentText(text) {
    if (typeof window.renderMarkdownSafe === 'function') {
      return window.renderMarkdownSafe(text);
    }
    return escapeHtml(text || '').replace(/\n/g, '<br/>');
  }

  function renderDiffHtml(diffs) {
    if (!diffs || !diffs.length) return '';
    return diffs.map(d => `
      <div class="cv-agent-diff-box">
        <div class="cv-agent-diff-label">${escapeHtml(d.label)}</div>
        ${d.before ? `<div class="cv-diff-old">${escapeHtml(d.before)}</div>` : ''}
        ${d.after ? `<div class="cv-diff-new">${escapeHtml(d.after)}</div>` : ''}
      </div>
    `).join('');
  }

  function renderActionCard(actions, status, beforeSnapshot) {
    if (!Array.isArray(actions) || actions.length === 0) return '';
    const snap = beforeSnapshot || captureSnapshot();
    const cardId = 'agent-card-' + (++cardSeq);
    const normalizedStatus = status === true ? 'applied' : (status === false ? 'pending' : status);

    actionCardStore.set(cardId, {
      actions,
      status: normalizedStatus,
      appliedCount: normalizedStatus === 'applied' ? actions.length : 0
    });
    if (actionCardStore.size > 60) {
      const oldestKey = actionCardStore.keys().next().value;
      actionCardStore.delete(oldestKey);
    }

    const itemsHtml = actions.map((act, idx) => {
      const typeLabel = escapeHtml(String(act.type || '').replace(/_/g, ' '));
      const desc = escapeHtml(sanitize(act.description || 'Chỉnh sửa trường CV', 200));
      const diffs = buildActionDiff(act, snap);
      const checkboxHtml = normalizedStatus === 'pending'
        ? `<input type="checkbox" class="cv-agent-item-check" data-card-id="${cardId}" data-action-idx="${idx}" checked />`
        : '';

      return `
        <li class="cv-agent-action-item">
          <div class="cv-agent-action-head">
            ${checkboxHtml}
            <span class="cv-agent-type-badge">${typeLabel}</span>
            <span class="cv-agent-action-desc">${desc}</span>
          </div>
          ${renderDiffHtml(diffs)}
        </li>
      `;
    }).join('');

    let footerHtml = '';
    if (normalizedStatus === 'applied') {
      footerHtml = `
        <span class="cv-agent-status-ok">
          <i class="fa-solid fa-circle-check"></i> Đã đồng bộ trực tiếp vào CV
        </span>
        <button type="button" onclick="window.cvAgentUndo()" class="cv-agent-btn-subtle cv-agent-ml-auto">
          <i class="fa-solid fa-rotate-left"></i> Hoàn tác
        </button>
      `;
    } else if (normalizedStatus === 'noop') {
      footerHtml = `
        <span class="cv-agent-status-warn">
          <i class="fa-solid fa-triangle-exclamation"></i> Không có thay đổi mới (dữ liệu đã khớp hoặc vị trí không tồn tại)
        </span>
      `;
    } else {
      footerHtml = `
        <button type="button" onclick="window.applyCvAgentCard('${cardId}')" class="cv-agent-btn-apply">
          <i class="fa-solid fa-check"></i> Áp Dụng Mục Đã Chọn
        </button>
        <button type="button" onclick="window.dismissCvAgentCard('${cardId}')" class="cv-agent-btn-subtle">
          Bỏ qua
        </button>
      `;
    }

    const headerTitle = normalizedStatus === 'applied'
      ? 'Đã áp dụng vào CV:'
      : (normalizedStatus === 'noop' ? 'Kết quả kiểm tra CV:' : 'Đề xuất chỉnh sửa CV (Xem Diff trước khi áp dụng):');

    return `
      <div class="cv-agent-card" id="${cardId}">
        <div class="cv-agent-card-header">
          <span class="cv-agent-card-title">
            <i class="fa-solid fa-code-compare"></i> ${headerTitle}
          </span>
          <span class="cv-agent-card-count">${actions.length} thay đổi</span>
        </div>
        <ul class="cv-agent-action-list">${itemsHtml}</ul>
        <div class="cv-agent-card-footer" id="${cardId}-footer">${footerHtml}</div>
      </div>
    `;
  }

  function applyCardById(cardId) {
    const entry = actionCardStore.get(cardId);
    if (!entry || entry.status !== 'pending') return;

    const cardEl = document.getElementById(cardId);
    let selectedActions = entry.actions;
    if (cardEl) {
      const checks = cardEl.querySelectorAll('input.cv-agent-item-check');
      if (checks.length > 0) {
        selectedActions = [];
        checks.forEach(cb => {
          const i = parseInt(cb.getAttribute('data-action-idx'), 10);
          if (cb.checked && entry.actions[i]) selectedActions.push(entry.actions[i]);
          cb.disabled = true;
        });
      }
    }

    if (selectedActions.length === 0) {
      if (typeof window.showToastInfo === 'function') {
        window.showToastInfo('Bạn chưa chọn mục nào để áp dụng.', 'AI Agent');
      }
      if (cardEl) cardEl.querySelectorAll('input.cv-agent-item-check').forEach(cb => { cb.disabled = false; });
      return;
    }

    const count = applyActionsBatch(selectedActions, { silent: false });
    entry.status = count > 0 ? 'applied' : 'noop';
    entry.appliedCount = count;

    const footer = document.getElementById(cardId + '-footer');
    if (footer) {
      if (count > 0) {
        footer.innerHTML = `
          <span class="cv-agent-status-ok">
            <i class="fa-solid fa-circle-check"></i> Đã áp dụng ${count} thay đổi vào CV
          </span>
          <button type="button" onclick="window.cvAgentUndo()" class="cv-agent-btn-subtle cv-agent-ml-auto">
            <i class="fa-solid fa-rotate-left"></i> Hoàn tác
          </button>
        `;
      } else {
        footer.innerHTML = `
          <span class="cv-agent-status-warn">
            <i class="fa-solid fa-triangle-exclamation"></i> Không có thay đổi mới (dữ liệu đã khớp sẵn)
          </span>
        `;
      }
    }
  }

  function dismissCardById(cardId) {
    const entry = actionCardStore.get(cardId);
    if (!entry || entry.status !== 'pending') return;
    entry.status = 'dismissed';
    const cardEl = document.getElementById(cardId);
    if (cardEl) {
      cardEl.querySelectorAll('input.cv-agent-item-check').forEach(cb => { cb.disabled = true; });
    }
    const footer = document.getElementById(cardId + '-footer');
    if (footer) {
      footer.innerHTML = `<span class="cv-agent-status-muted"><i class="fa-solid fa-ban"></i> Đã bỏ qua đề xuất này</span>`;
    }
  }

  function registerFollowUpsHtml(followUps, runnerName) {
    if (!Array.isArray(followUps) || followUps.length === 0) return '';
    const buttons = followUps.map(fu => {
      const clean = sanitize(fu, 150);
      if (!clean) return '';
      const id = 'fu-' + (++followUpSeq);
      followUpStore.set(id, clean);
      if (followUpStore.size > 100) {
        const oldest = followUpStore.keys().next().value;
        followUpStore.delete(oldest);
      }
      return `<button type="button" onclick="window.${runnerName}('${id}')" class="cv-agent-followup-chip">${escapeHtml(clean)} &rarr;</button>`;
    }).filter(Boolean).join('');

    if (!buttons) return '';
    return `
      <div class="cv-agent-followups">
        <div class="cv-agent-followups-title"><i class="fa-solid fa-compass"></i> Gợi ý bước tiếp theo:</div>
        <div class="cv-agent-followups-list">${buttons}</div>
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────
  // 7. STUDIO DRAWER CONTROLLER & LIFECYCLE
  // ─────────────────────────────────────────────────────────
  function toggleCvAgentDrawer(forceOpen) {
    const drawer = document.getElementById('cv-agent-editor-drawer');
    if (!drawer) return;
    const isCurrentlyOpen = !drawer.classList.contains('hidden');
    const shouldOpen = forceOpen !== undefined ? forceOpen : !isCurrentlyOpen;

    if (shouldOpen) {
      drawer.classList.remove('hidden');
      setTimeout(() => {
        const inp = document.getElementById('cv-agent-input');
        if (inp) inp.focus();
      }, 80);
    } else {
      drawer.classList.add('hidden');
    }
  }

  function setBusyUi(busy) {
    const sendBtn = document.getElementById('btn-cv-agent-send');
    const stopBtn = document.getElementById('btn-cv-agent-stop');
    if (sendBtn) sendBtn.disabled = busy;
    if (stopBtn) stopBtn.classList.toggle('hidden', !busy);
  }

  function stopActiveRequest() {
    if (activeOperation) {
      const op = activeOperation;
      activeOperation = null;
      op.controller.abort();
      setBusyUi(false);
    }
  }

  function clearCvAgentHistory() {
    agentGeneration++;
    stopActiveRequest();
    agentHistory = [];
    actionCardStore.clear();
    followUpStore.clear();
    const container = document.getElementById('cv-agent-messages');
    if (container) {
      container.innerHTML = `
        <div class="flex items-start gap-2 text-xs">
          <div class="cv-agent-avatar"><i class="fa-solid fa-robot"></i></div>
          <div class="cv-agent-bubble-bot">
            <div class="font-bold text-purple-700 text-xs">Đã làm mới hội thoại AI Agent 🤖</div>
            <p class="text-slate-600 mt-1">Tôi sẵn sàng đọc CV hiện tại và áp dụng các chỉnh sửa theo yêu cầu của bạn.</p>
          </div>
        </div>
      `;
    }
  }

  async function sendCvAgentMessage(customText) {
    const inputEl = document.getElementById('cv-agent-input');
    const container = document.getElementById('cv-agent-messages');
    const fromInput = customText === undefined;
    const text = (fromInput ? (inputEl ? inputEl.value : '') : String(customText || '')).trim();

    if (!text || activeOperation) return;
    if (text.length > 2000) {
      if (typeof window.showToastError === 'function') {
        window.showToastError('Yêu cầu tối đa 2.000 ký tự.', 'Yêu cầu quá dài');
      }
      return;
    }

    // Only clear input box when user actually sent from the input box (preserve draft if chip clicked!)
    if (fromInput && inputEl) inputEl.value = '';

    const operation = { generation: agentGeneration, controller: new AbortController() };
    activeOperation = operation;
    const isCurrent = () => activeOperation === operation && agentGeneration === operation.generation;
    setBusyUi(true);

    // 1. User bubble (strictly escaped)
    const userBubble = document.createElement('div');
    userBubble.className = 'flex items-start justify-end gap-2 text-xs';
    userBubble.innerHTML = `
      <div class="cv-agent-bubble-user">
        <div class="cv-agent-bubble-user-label">Bạn (Yêu cầu AI Agent)</div>
        <div class="whitespace-pre-line">${escapeHtml(text)}</div>
      </div>
      <div class="cv-agent-avatar-user"><i class="fa-solid fa-user"></i></div>
    `;
    container.appendChild(userBubble);
    container.scrollTop = container.scrollHeight;

    // 2. Typing indicator
    const typingId = 'agent-typing-' + Date.now();
    const typingBubble = document.createElement('div');
    typingBubble.id = typingId;
    typingBubble.className = 'flex items-start gap-2 text-xs';
    typingBubble.innerHTML = `
      <div class="cv-agent-avatar"><i class="fa-solid fa-robot"></i></div>
      <div class="cv-agent-typing">
        <i class="fa-solid fa-circle-notch fa-spin text-purple-600"></i>
        <span>ConnectCV Agent đang phân tích CV &amp; tạo bản vá...</span>
      </div>
    `;
    container.appendChild(typingBubble);
    container.scrollTop = container.scrollHeight;

    const beforeSnapshot = captureSnapshot();
    const targetJob = document.getElementById('cv-jd')?.value || '';
    let timer, cancel;

    try {
      const request = async () => {
        const res = await fetch('/api/chatbot/agent', {
          method: 'POST',
          signal: operation.controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: agentHistory.slice(-6),
            currentProfile: beforeSnapshot,
            targetJob: targetJob.slice(0, 4000)
          })
        });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('NON_JSON_RESPONSE');
        }
        return await res.json();
      };

      const cancelled = new Promise((_, reject) => {
        cancel = () => reject(new Error('AGENT_CANCELLED'));
        operation.controller.signal.addEventListener('abort', cancel, { once: true });
      });

      const resData = await Promise.race([
        request(),
        cancelled,
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            operation.controller.abort();
            reject(new Error('AGENT_TIMEOUT'));
          }, 60000);
        })
      ]);

      if (!isCurrent()) return;
      document.getElementById(typingId)?.remove();

      if (resData.success && resData.data) {
        const agentData = resData.data;
        agentHistory.push({ role: 'user', message: text });
        agentHistory.push({ role: 'assistant', message: agentData.reply });
        if (agentHistory.length > 20) agentHistory = agentHistory.slice(-20);

        // Determine card status honestly based on actual appliedCount!
        let cardStatus = 'pending';
        if (autoApply && Array.isArray(agentData.actions) && agentData.actions.length > 0) {
          const appliedCount = applyActionsBatch(agentData.actions, { silent: false });
          cardStatus = appliedCount > 0 ? 'applied' : 'noop';
        }

        const modeLabel = agentData.mode === 'security-guard'
          ? 'Sandbox Guard'
          : (agentData.mode === 'fast-local' ? 'Fast Edit' : 'Live Agent');

        const botBubble = document.createElement('div');
        botBubble.className = 'flex items-start gap-2 text-xs';
        botBubble.innerHTML = `
          <div class="cv-agent-avatar"><i class="fa-solid fa-robot"></i></div>
          <div class="cv-agent-bubble-bot">
            <div class="cv-agent-bubble-head">
              <span class="font-bold text-purple-700 flex items-center gap-1.5">
                <i class="fa-solid fa-sparkles text-purple-500"></i> ConnectCV AI Agent
              </span>
              <span class="cv-agent-mode-pill">${escapeHtml(modeLabel)}</span>
            </div>
            ${agentData.thought ? `
              <div class="cv-agent-thought">
                <i class="fa-solid fa-brain text-purple-500"></i>
                <span><b>Phân tích:</b> ${escapeHtml(sanitize(agentData.thought, 500))}</span>
              </div>
            ` : ''}
            <div class="text-xs text-slate-800 leading-relaxed">${formatAgentText(agentData.reply)}</div>
            ${renderActionCard(agentData.actions, cardStatus, beforeSnapshot)}
            ${registerFollowUpsHtml(agentData.suggestedFollowUps, 'runCvAgentFollowUp')}
          </div>
        `;
        container.appendChild(botBubble);
      } else {
        if (fromInput && inputEl && !inputEl.value) inputEl.value = text;
        const errBubble = document.createElement('div');
        errBubble.className = 'cv-agent-error';
        errBubble.textContent = 'Lỗi: ' + (resData.message || 'Không thể nhận phản hồi từ AI Agent.');
        container.appendChild(errBubble);
      }
    } catch (err) {
      document.getElementById(typingId)?.remove();
      if (!isCurrent()) return;
      if (fromInput && inputEl && !inputEl.value) inputEl.value = text;
      const errBubble = document.createElement('div');
      errBubble.className = 'cv-agent-error';
      errBubble.textContent = err?.message === 'AGENT_CANCELLED'
        ? 'Đã dừng yêu cầu AI Agent. Câu lệnh đã được giữ lại.'
        : 'Mất kết nối hoặc AI Agent quá thời gian chờ. Câu lệnh vẫn được giữ để bạn thử lại.';
      container.appendChild(errBubble);
    } finally {
      clearTimeout(timer);
      if (cancel) operation.controller.signal.removeEventListener('abort', cancel);
      if (activeOperation === operation) {
        activeOperation = null;
        setBusyUi(false);
        container.scrollTop = container.scrollHeight;
      }
    }
  }

  // Cleanup private state on account logout
  window.addEventListener('connectcv:logout', () => {
    agentGeneration++;
    stopActiveRequest();
    agentHistory = [];
    undoStack = [];
    redoStack = [];
    actionCardStore.clear();
    followUpStore.clear();
    const input = document.getElementById('cv-agent-input');
    if (input) input.value = '';
    updateHistoryButtons();
  });

  // ─────────────────────────────────────────────────────────
  // 8. GLOBAL API EXPORTS
  // ─────────────────────────────────────────────────────────
  window.getCvCurrentSnapshot = captureSnapshot;
  window.getCvAgentAutoApply = () => autoApply;
  window.applyCvAgentActionsBatch = applyActionsBatch;
  window.renderCvAgentActionCard = renderActionCard;
  window.applyCvAgentCard = applyCardById;
  window.dismissCvAgentCard = dismissCardById;
  window.toggleCvAgentDrawer = toggleCvAgentDrawer;
  window.clearCvAgentHistory = clearCvAgentHistory;
  window.stopCvAgentRequest = stopActiveRequest;
  window.sendCvAgentMessage = () => sendCvAgentMessage();
  window.sendCvAgentPrompt = text => sendCvAgentMessage(text);
  window.runCvAgentFollowUp = id => {
    const prompt = followUpStore.get(id);
    if (prompt) sendCvAgentMessage(prompt);
  };
  window.cvAgentUndo = undoLastAction;
  window.cvAgentRedo = redoLastAction;
  window.toggleCvAgentAutoApply = function (checkbox) {
    autoApply = !!checkbox.checked;
    if (typeof window.showToastInfo === 'function') {
      window.showToastInfo(
        autoApply ? 'Đã bật tự động áp dụng bản vá vào CV' : 'Đã tắt tự động áp dụng. Bạn có thể xem Diff và duyệt từng mục.',
        'Cài đặt AI Agent'
      );
    }
  };

  // Keyboard shortcut: Enter to send (without Shift)
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('cv-agent-input');
    if (input) {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendCvAgentMessage();
        }
      });
    }
    updateHistoryButtons();
  });
})();
