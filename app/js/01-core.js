'use strict';
/* ============ Core helpers ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
/* French typography: no line break before : ; ! ? » or after « */
const frnb = (s) => (S.lang === 'fr' ? String(s).replace(/ ([:;!?»])/g, ' $1').replace(/« /g, '« ') : String(s));
const esc = (s) => frnb(String(s == null ? '' : s)).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const clone = (o) => JSON.parse(JSON.stringify(o));
const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
function hashStr(s) { s = String(s); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function slugify(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40); }
function initials(name) { return String(name || '').split(/[\s-]+/).filter((w) => w && /[A-Za-zÀ-ÿ]/.test(w[0])).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'MB'; }
const firstName = (n) => String(n || '').trim().split(/\s+/)[0] || '';
function safeImg(u) { u = String(u || ''); return /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/.test(u) ? u : ''; }
function deepMerge(a, b) {
  const out = Array.isArray(a) ? a.slice() : { ...a };
  Object.keys(b || {}).forEach((k) => { out[k] = isObj(a && a[k]) && isObj(b[k]) ? deepMerge(a[k], b[k]) : b[k]; });
  return out;
}

/* ============ Storage (guarded) ============ */
const store = {
  get(k, f) { try { const v = localStorage.getItem(k); return v == null ? f : JSON.parse(v); } catch (e) { return f; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
};

/* ============ State & language ============ */
const S = { lang: 'fr', portals: {}, order: [], unlocked: new Set(), adminOk: false, caps: {}, ui: {}, route: {}, seen: {}, chat: {} };
const t = (fr, en) => (S.lang === 'en' && en != null ? en : frnb(fr));
const tx = (o) => (o == null ? '' : typeof o === 'string' ? o : S.lang === 'en' && o.en != null ? o.en : o.fr);
const loc = () => (S.lang === 'en' ? 'en-CA' : 'fr-CA');
function listJoin(items) {
  const a = items.filter(Boolean);
  if (a.length < 2) return a.join('');
  return `${a.slice(0, -1).join(', ')} ${t('et', 'and')} ${a[a.length - 1]}`;
}
const cap1 = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);

/* ============ Formatting ============ */
function fmtMoney(n, dec = 2) { return new Intl.NumberFormat(loc(), { style: 'currency', currency: 'CAD', minimumFractionDigits: dec, maximumFractionDigits: dec }).format(Number(n) || 0); }
function fmtInt(n) { return new Intl.NumberFormat(loc(), { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0)); }
function fmtArea(n) { return `${fmtInt(n)} ${t('pi²', 'sq ft')}`; }
function parseDay(v) {
  if (!v) return null;
  if (v instanceof Date) return new Date(v.getTime());
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(String(v));
  if (!m) { const d = new Date(v); return isNaN(d) ? null : d; }
  return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
}
const pad2 = (n) => String(n).padStart(2, '0');
const isoDay = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const isoLocal = (d) => `${isoDay(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:00`;
const nowIso = () => isoLocal(new Date());
function addDays(d, n) { const x = parseDay(d) || new Date(); x.setDate(x.getDate() + n); return x; }
/* French dates say "1er décembre", not "1 décembre" */
function fmtDate(v, o) { const d = parseDay(v); if (!d) return '—'; const out = d.toLocaleDateString(loc(), o || { day: 'numeric', month: 'long', year: 'numeric' }); return S.lang === 'en' ? out : out.replace(/(^|\s)1 (?=\D)/, '$11er '); }
const fmtDateShort = (v) => fmtDate(v, { day: 'numeric', month: 'short' });
const fmtDateLong = (v) => fmtDate(v, { weekday: 'long', day: 'numeric', month: 'long' });
function fmtHour(h, m = 0) {
  if (S.lang === 'en') { const ap = h >= 12 ? 'PM' : 'AM'; const hh = ((h + 11) % 12) + 1; return m ? `${hh}:${pad2(m)} ${ap}` : `${hh} ${ap}`; }
  return m ? `${h} h ${pad2(m)}` : `${h} h`;
}
function fmtDateTime(v) { const d = parseDay(v); if (!d) return '—'; return `${fmtDate(d)}, ${fmtHour(d.getHours(), d.getMinutes())}`; }
function daysUntil(v) { const d = parseDay(v); if (!d) return null; const a = new Date(); a.setHours(0, 0, 0, 0); return Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - a) / 86400000); }
function ago(v) {
  const d = parseDay(v); if (!d) return '';
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return t('à l’instant', 'just now');
  const m = s / 60, h = m / 60, dd = h / 24;
  if (m < 60) return t(`il y a ${Math.round(m)} min`, `${Math.round(m)} min ago`);
  if (h < 24) return t(`il y a ${Math.round(h)} h`, `${Math.round(h)} h ago`);
  if (dd < 21) return t(`il y a ${Math.round(dd)} j`, `${Math.round(dd)} d ago`);
  return fmtDateShort(d);
}

/* ============ Icons ============ */
const ICONS = {
  check: '<path d="M5 12.5l4.2 4.2L19 7"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>',
  arrowL: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  chevL: '<path d="M15 6l-6 6 6 6"/>',
  chevR: '<path d="M9 6l6 6-6 6"/>',
  chevD: '<path d="M6 9l6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  /* The MBM drop (the brand mark is a drop made of leaves) */
  leaf: '<path d="M12 3c3.3 3.7 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 2.7-7.3 6-11z"/><path d="M12 10v9M12 14.2l-2.4-2M12 16.8l2.4-2"/>',
  sprout: '<path d="M12 21v-9"/><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6z"/><path d="M12 14c0-4 3-7 7-7 0 4-3 7-7 7z"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  bug: '<rect x="8" y="7" width="8" height="12" rx="4"/><path d="M12 7V5M9 4l1.5 2M15 4l-1.5 2M8 11H4M8 15H4M16 11h4M16 15h4M12 11v8"/>',
  tree: '<circle cx="12" cy="9" r="6"/><path d="M12 15v6M9 21h6"/>',
  shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.6c1.8.7 3 2.5 3.5 5.4"/>',
  home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>',
  building: '<rect x="4" y="3" width="11" height="18" rx="1"/><path d="M15 9h5v12h-5M8 7h3M8 11h3M8 15h3"/>',
  chat: '<path d="M4 5h16v11H9l-5 4V5z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01"/>',
  send: '<path d="M4 12l16-8-6 16-2.5-6.5L4 12z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  alert: '<path d="M12 3l9.5 17h-19L12 3z"/><path d="M12 10v4M12 17v.5"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.5M14 20h.5M17.5 17.5H21V21h-3.5z"/>',
  truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>',
  layout: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M9 10h12"/>',
  door: '<path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M4 21h16"/><circle cx="15" cy="12" r="1"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
  ruler: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  card: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  plug: '<path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0z"/><path d="M12 16v5"/>',
  bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  file: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6"/>',
  flower: '<circle cx="12" cy="9" r="2.5"/><path d="M12 11.5V21M12 4.5V3M7.6 6.3l-1-1M16.4 6.3l1-1M6 9H4.5M18 9h1.5M9 17c-2 0-3.5-1-4-3 2 0 3.5 1 4 3zM15 16c2 0 3.5-1 4-3-2 0-3.5 1-4 3z"/>',
};
/* Photos travel in the encrypted bundle: blob URLs on the hosted site, relative paths elsewhere */
const asset = (path) => (window.VD_ASSETS && window.VD_ASSETS[path]) || path;
function icon(name, cls = '') { return `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`; }
/* A generic scalloped seal with a check mark (a "protected" badge) */
function seal(cls = '') {
  let bumps = '';
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; bumps += `<circle cx="${(12 + Math.cos(a) * 9).toFixed(2)}" cy="${(12 + Math.sin(a) * 9).toFixed(2)}" r="2.7"/>`; }
  return `<svg class="seal ${cls}" viewBox="0 0 24 24" aria-hidden="true"><g fill="var(--green)"><circle cx="12" cy="12" r="9.2"/>${bumps}</g><path d="M8 12.3l2.6 2.6L16.2 9.4" fill="none" stroke="var(--on-green)" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function ringSvg(pct, size = 64, stroke = 6) {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r, h = size / 2;
  return `<svg class="mini-ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="var(--sheet-2)" stroke-width="${stroke}"/><circle class="mini-ring__fg" cx="${h}" cy="${h}" r="${r}" fill="none" stroke="var(--green)" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C * (1 - clamp(pct, 0, 100) / 100)).toFixed(2)}" transform="rotate(-90 ${h} ${h})"/></svg>`;
}

/* ============ Toasts & modal ============ */
function toast(msg, opts = {}) {
  let host = $('#toasts');
  if (!host) { host = document.createElement('div'); host.id = 'toasts'; host.className = 'toasts'; host.setAttribute('role', 'status'); host.setAttribute('aria-live', 'polite'); document.body.appendChild(host); }
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="dot"></span><span>${esc(msg)}</span>`;
  host.appendChild(el);
  setTimeout(() => { el.classList.add('is-out'); setTimeout(() => el.remove(), 380); }, opts.ms || 3200);
}
function openModal(html, onMount) {
  closeModal();
  const m = document.createElement('div');
  m.className = 'modal';
  m.id = 'modal';
  m.setAttribute('role', 'dialog');
  m.setAttribute('aria-modal', 'true');
  m.innerHTML = `<div class="modal__card">${html}</div>`;
  m.addEventListener('click', (e) => { if (e.target === m) closeModal(); });
  document.body.appendChild(m);
  const f = m.querySelector('input, select, textarea');
  if (f) setTimeout(() => { try { f.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 60);
  if (onMount) onMount(m);
  return m;
}
function closeModal() { const m = $('#modal'); if (m) m.remove(); }
async function copyText(text, label) {
  try { await navigator.clipboard.writeText(text); toast(label || t('Copié', 'Copied')); return true; }
  catch (e) { toast(t('Sélectionnez le texte pour le copier', 'Select the text to copy it')); return false; }
}
