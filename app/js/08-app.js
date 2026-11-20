/* ============ State ============ */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SEED_BY_SLUG = {};
S.lastWritten = {}; S.pending = {}; S.ui.bumped = {};
function hydrate(o) {
  const p = deepMerge(clone(PORTAL_TEMPLATE), o || {});
  if (!p.rep || !p.rep.name) p.rep = repFor(p.branch);
  if (!p.client.name) p.client.name = `${p.client.first} ${p.client.last}`.trim();
  if (!p.code) p.code = makeCode(p, 'v1');
  if (!Array.isArray(p.activity)) p.activity = [];
  if (!isObj(p.answers)) p.answers = {};
  if (!Array.isArray(p.offers)) p.offers = [];
  if (!isObj(p.payments)) p.payments = {};
  if (A(p).submittedAt && !p.proposal.date) { p.proposal.date = isoDay(parseDay(A(p).submittedAt)); p.proposal.validUntil = isoDay(addDays(A(p).submittedAt, 30)); }
  return p;
}
function buildSeeds() {
  const now = new Date(), list = seedClients(now).concat(seedFlowClients(now));
  list.forEach((o) => { SEED_BY_SLUG[o.slug] = clone(o); });
  return list.map(hydrate);
}
function loadState() {
  S.lang = store.get(LS_KEY + ':lang', 'fr') === 'en' ? 'en' : 'fr';
  S.crmData = Object.assign(seedCrm(new Date()), seedFlowCrm(new Date()));
  const crm = store.get(LS_KEY + ':crm', null);
  S.crm = isObj(crm) && crm.on ? crm : { on: false, vendor: 'salesforce' };
  const seeds = buildSeeds();
  S.portals = {}; S.order = [];
  seeds.forEach((p) => { S.portals[p.slug] = p; S.order.push(p.slug); });
  const saved = store.get(LS_KEY, null);
  if (saved && saved.v === 2 && isObj(saved.portals)) {
    Object.keys(saved.portals).forEach((slug) => {
      const sp = saved.portals[slug];
      if (!isObj(sp) || !isObj(sp.client)) return;
      S.portals[slug] = hydrate(sp);
      if (!S.order.includes(slug)) S.order.push(slug);
    });
  }
  const un = store.get(LS_KEY + ':unlocked', []);
  S.unlocked = new Set(Array.isArray(un) ? un : []);
  S.adminOk = store.get(LS_KEY + ':admin', false) === true;
  S.ui.admFlow = store.get(LS_KEY + ':flow', 'onboarding');
}
let saveTimer = 0;
function saveLocalNow() {
  clearTimeout(saveTimer);
  if (store.set(LS_KEY, { v: 2, portals: S.portals })) return;
  const slim = clone(S.portals);
  Object.values(slim).forEach((p) => { if (p.answers) p.answers.photo = null; if (p.signature) p.signature.image = null; });
  store.set(LS_KEY, { v: 2, portals: slim });
}
function saveLocal() { clearTimeout(saveTimer); saveTimer = setTimeout(saveLocalNow, 250); }
function saveUnlocked() { store.set(LS_KEY + ':unlocked', Array.from(S.unlocked)); }
function log(p, fr, en) { p.activity.unshift({ at: nowIso(), fr, en: en || fr }); if (p.activity.length > 40) p.activity.length = 40; }
function advanceTo(p, n) { if (p.stage >= n) return false; p.stage = n; S.justUnlocked = n; return true; }
function bumpVersion(p) {
  if (S.ui.bumped[p.slug]) return;
  const [ma, mi] = String(p.proposal.version || '1.0').split('.').map(Number);
  p.proposal.version = `${ma || 1}.${(mi || 0) + 1}`;
  p.proposal.date = isoDay(new Date());
  S.ui.bumped[p.slug] = true;
}

/* ============ Persistence: browser, plus the shared artifact database when the page is published ============ */
function stableStringify(v) {
  if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']';
  if (isObj(v)) return '{' + Object.keys(v).sort().filter((k) => v[k] !== undefined).map((k) => JSON.stringify(k) + ':' + stableStringify(v[k])).join(',') + '}';
  return JSON.stringify(v === undefined ? null : v);
}
function persist(p) {
  saveLocal();
  if (!p || !S.caps.db || S.dbReadOnly) return;
  clearTimeout(S.pending[p.slug]);
  S.pending[p.slug] = setTimeout(() => flush(p.slug), 700);
}
function dbBody(p) {
  const b = JSON.parse(JSON.stringify(p));
  if (JSON.stringify(b).length > 240000 && b.answers) b.answers.photo = null;
  if (JSON.stringify(b).length > 240000 && b.signature) b.signature.image = null;
  return b;
}
async function flush(slug) {
  const p = S.portals[slug]; if (!p || !S.caps.db) return;
  const body = dbBody(p);
  S.lastWritten[slug] = stableStringify(body);
  try { await S.caps.db.doc('portals/' + slug).set(body); }
  catch (e) {
    const c = e && e.code;
    if (['not_granted', 'revoked', 'invalid_argument', 'permission_denied', 'not_writer'].includes(c)) { S.dbReadOnly = true; toast(t('Vous consultez cet espace : vos changements restent dans ce navigateur.', 'You are viewing this space: your changes stay in this browser.')); }
  }
}
function initDb(db) {
  S.caps.db = db;
  try {
    db.collection('portals').onSnapshot((snap) => {
      const changed = [];
      snap.docChanges().forEach((chg) => {
        const id = chg.doc.id;
        if (chg.type === 'removed') { if (SEED_BY_SLUG[id]) { S.portals[id] = hydrate(clone(SEED_BY_SLUG[id])); changed.push(id); } return; }
        const data = chg.doc.data();
        if (!isObj(data) || !isObj(data.client)) return;
        if (S.lastWritten[id] && S.lastWritten[id] === stableStringify(data)) return;
        S.portals[id] = hydrate(data);
        if (!S.order.includes(id)) S.order.push(id);
        changed.push(id);
      });
      if (changed.length) { saveLocal(); onRemoteChange(changed); }
    }, () => { /* keep the local copy */ });
  } catch (e) { /* database unavailable */ }
}
function onRemoteChange(ids) {
  const r = S.route, ae = document.activeElement;
  if (ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)) return;
  if ($('#modal')) return;
  if (r.view === 'admin' || (r.view === 'admin-edit' && ids.includes(r.slug))) { render({ keepScroll: true }); return; }
  if (r.view === 'portal' && ids.includes(r.slug) && S.unlocked.has(r.slug)) render({ keepScroll: true });
}

/* ============ Runtime capabilities (only inside a claude.ai artifact viewer) ============ */
function initCaps() {
  const c = window.claude;
  if (!c || typeof c.use !== 'function') return;
  const use = (n) => { try { return Promise.resolve(c.use(n)).catch(() => null); } catch (e) { return Promise.resolve(null); } };
  use('db').then((db) => { if (db) initDb(db); });
  use('user').then(async (u) => {
    S.caps.user = u; if (!u) return;
    try { if (await u.canEdit()) { S.adminOk = true; if ($('.adm-gate')) render(); } } catch (e) { /* ignore */ }
  });
  use('sample').then(async (s) => {
    S.caps.sample = s || null;
    if (s) { try { const lim = await s.limits(); S.caps.sampleImages = !!(lim && lim.images); } catch (e) { S.caps.sampleImages = false; } }
    refreshAiBadges();
  });
  use('downloads').then((d) => { S.caps.downloads = d || null; });
}
function refreshAiBadges() {
  const m = $('#ask-mode'); if (m) m.textContent = aiBadgeText();
  const a = $('#ai-mode-adm'); if (a) { a.textContent = S.caps.sample ? 'Claude' : t('Modèle de base', 'Basic template'); a.className = `tag ${S.caps.sample ? 'tag--ok' : ''}`; }
}
const SAMPLE_OFF = ['not_granted', 'sampling_disabled', 'capability_disabled', 'capability_removed', 'not_declared'];

/* ============ Routing & rendering ============ */
function parseHash() {
  let h = '';
  try { h = decodeURIComponent((location.hash || '').slice(1)); } catch (e) { h = ''; }
  if (!h) return { view: 'portal', slug: DEFAULT_SLUG };
  if (h === 'admin') return { view: 'admin' };
  if (h.startsWith('admin-')) return { view: 'admin-edit', slug: h.slice(6) };
  if (h === 'lock') return { view: 'lock' };
  if (h.endsWith('-compte')) { const slug = h.slice(0, -7); if (S.portals[slug]) return { view: 'portal', slug, step: 'compte' }; }
  /* #slug-key: the key is looked up in the portal's own journey (renewal and agreement keys differ from a new client's) */
  for (const key of STEP_KEYS) if (h.endsWith('-' + key)) { const slug = h.slice(0, -(key.length + 1)), p = S.portals[slug]; if (p) { const st = stepsOf(p).find((x) => x.key === key); return { view: 'portal', slug, step: st ? st.n : null }; } }
  if (S.portals[h]) return { view: 'portal', slug: h };
  return { view: 'portal', slug: DEFAULT_SLUG };
}
function replaceEl(id, html) { const el = document.getElementById(id); if (el) el.outerHTML = html; }
const curP = () => S.portals[S.route.slug] || S.portals[DEFAULT_SLUG];
const curStep = () => +(($('.portal') || {}).dataset || {}).step || 0;
let rendering = false;
function render(opts = {}) {
  if (rendering) { setTimeout(() => render(opts), 0); return; }
  rendering = true;
  try { renderNow(opts); } finally { rendering = false; }
}
function renderNow(opts) {
  const ae = document.activeElement;
  if (ae && ae !== document.body && $('#app') && $('#app').contains(ae) && typeof ae.blur === 'function') ae.blur();
  const r = (S.route = parseHash());
  closeModal();
  document.documentElement.lang = S.lang === 'en' ? 'en-CA' : 'fr-CA';
  const app = $('#app'), y = window.scrollY;
  if (r.view === 'lock') {
    S.unlocked = new Set(); saveUnlocked(); S.adminOk = false; store.set(LS_KEY + ':admin', false);
    /* Site en ligne : verrouiller oublie aussi le mot de passe du site sur cet appareil et revient à la page d'entrée */
    if (window.VD_SITE && typeof window.VD_SITE.lock === 'function') { window.VD_SITE.lock(); return; }
    location.hash = DEFAULT_SLUG; return;
  }
  if (r.view === 'admin' || r.view === 'admin-edit') {
    if (!S.adminOk) { markEntering('admin-gate'); app.innerHTML = viewAdminGate(); window.scrollTo(0, 0); return; }
    if (r.view === 'admin-edit' && !S.portals[r.slug]) { location.hash = 'admin'; return; }
    const fresh = markEntering(r.view === 'admin' ? 'admin' : 'admin:' + r.slug);
    app.innerHTML = r.view === 'admin' ? viewAdmin() : viewAdminDetail(S.portals[r.slug]);
    settle(app, fresh);
    window.scrollTo(0, opts.keepScroll ? y : 0); syncScroll();
    if (S.ui.scrollTo) { const id = S.ui.scrollTo; S.ui.scrollTo = null; setTimeout(() => scrollToId(id), 60); }
    afterRender();
    return;
  }
  const p = curP();
  if (!S.unlocked.has(p.slug)) { markEntering('gate:' + p.slug); app.innerHTML = viewGate(p); splitTitles(app); window.scrollTo(0, 0); initPass(); return; }
  const step = r.step === 'compte' ? (hasAccount(p) ? 'compte' : p.stage) : r.step && r.step <= p.stage ? r.step : p.stage;
  if (step !== 'compte') (S.seen[p.slug] = S.seen[p.slug] || {})[step] = true;
  const fresh = markEntering(p.slug + ':' + step);
  app.innerHTML = viewPortal(p, step);
  settle(app, fresh);
  window.scrollTo(0, opts.keepScroll ? y : 0); syncScroll();
  if (step === 4 && needsSignature(p)) requestAnimationFrame(initSigPad);
  afterRender();
  if (S.ui.askOpen) scrollAskLog();
  if (S.justUnlocked) setTimeout(() => { S.justUnlocked = null; }, 1600);
}
const needsSignature = (p) => (isTerm(p) ? !amendSigned(p) : !p.signature);
const signboxFor = (p) => (isTerm(p) ? amendSignboxHtml(p) : signboxHtml(p));
/* Same screen re-rendered: words are split again (same line breaks) and what was revealed stays revealed */
function settle(root, fresh) {
  splitTitles(root);
  if (!fresh) $$('.reveal', root).forEach((e) => e.classList.add('is-in'));
}
function refreshHeader(p) {
  const step = S.route.step === 'compte' && hasAccount(p) ? 'compte' : (curStep() || p.stage);
  const h = $('.phead'); if (h) h.outerHTML = viewHeader(p, step);
  const pill = $('.dock'); if (pill) pill.outerHTML = viewDemoDock(p, step);
  const hc = $('.hero .hc'); if (hc) hc.outerHTML = heroCard(p, step);
  const j = $('.journey'); if (j) j.outerHTML = viewJourney(p, step);
  syncScroll();
}
function scrollToId(id) {
  const el = document.getElementById(id); if (!el) return;
  const head = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--head-h'), 10) || 64;
  const top = el.getBoundingClientRect().top + window.scrollY - head - 16;
  window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
function setPressed(sel, fn) { $$(sel).forEach((b) => b.setAttribute('aria-pressed', String(!!fn(b)))); }

/* ============ Diagnosis ============ */
function refreshDiag(p, layout) {
  if (layout) { const w = $('#plan-live'); if (w) w.innerHTML = planSvg(p); } else updatePlans(p);
  $$('[data-area-label]').forEach((el) => { el.textContent = `≈ ${fmtArea(areaOf(p))}`; });
  const f = $('#findings'); if (f) f.innerHTML = findingsHtml(p);
  const sc = $('#score'); if (sc) sc.innerHTML = scoreHtml(p);
  QSECTIONS.forEach((s, i) => {
    const el = $(`#q-${s.id}`); if (!el) return;
    const d = s.done(A(p)); el.classList.toggle('is-done', d);
    const n = $('.qsec__n', el); if (n) n.innerHTML = d ? icon('check') : String(i + 1);
  });
  replaceEl('qsubmit', qSubmitHtml(p));
  const hc = $('.hero .hc'); if (hc && curStep() === 1) hc.outerHTML = heroCard(p, 1);
}
function onAnswers(p, o = {}) { persist(p); refreshDiag(p, o.layout); }
function syncClientFromAnswers(p) {
  const a = A(p);
  if (filled(a.email)) p.client.email = a.email.trim();
  if (filled(a.phone)) p.client.phone = a.phone.trim();
  if (filled(a.address)) p.client.address = a.address.trim();
  if (filled(a.city)) p.client.city = a.city.trim();
  if (!isOrg(p) && filled(a.name)) { const parts = a.name.trim().split(/\s+/); p.client.name = a.name.trim(); p.client.first = parts[0]; if (parts.length > 1) p.client.last = parts.slice(1).join(' '); }
}
function demoAnswers(p) {
  if (p && isOrg(p)) return { type: propTypeOf(p) === 'condo' ? 'condo' : 'commerce', area: 22000, zones: ['cuisine', 'garage', 'exterieur'], rating: 3, problems: ['rats', 'crottes', 'mouches', 'gardemanger'], noProblem: false, kids: 'non', pets: ['aucun'], watering: 'brut', mowing: 'service', trees: 6, treeSick: true, pests: ['guepes'], goals: ['prevenir', 'audit', 'discret'], notes: t('Accès par le quai arrière. Visites idéalement avant 6 h ou le dimanche.', 'Access through the back dock. Visits ideally before 6 AM or on Sundays.') };
  return { type: 'maison', area: 2200, zones: ['cuisine', 'sous-sol', 'grenier'], rating: 2, problems: ['crottes', 'grattements', 'fourmis_int', 'odeur'], noProblem: false, kids: 'oui', pets: ['chien'], watering: 'fini', mowing: 'moi', trees: 2, treeSick: true, pests: ['araignees', 'guepes'], goals: ['vite', 'prevenir', 'eco'], notes: t('Grattements au plafond du sous-sol depuis octobre. Chien à la maison le jour.', 'Scratching in the basement ceiling since October. Dog at home during the day.') };
}
function submitDiag(p) {
  const a = A(p);
  if (QSECTIONS.some((s) => !s.done(a))) { toast(t('Il reste quelques sections à remplir', 'A few sections are still empty')); return; }
  a.submittedAt = nowIso();
  syncClientFromAnswers(p);
  p.proposal.date = isoDay(new Date()); p.proposal.validUntil = isoDay(addDays(new Date(), 30));
  log(p, 'Évaluation envoyée, plan d’action généré', 'Assessment sent, action plan generated');
  advanceTo(p, 2); persist(p);
  toast(t('Votre plan d’action est prêt', 'Your action plan is ready'));
  location.hash = `${p.slug}-proposition`;
}
async function demoFill(p) {
  if (S.ui.filling) return;
  S.ui.filling = true;
  const a = A(p), D = demoAnswers(p);
  const target = window.innerWidth < 900 ? 'plancard' : 'diagnostic-form';
  scrollToId(target);
  await sleep(450);
  const steps = [
    () => { a.type = D.type; a.area = D.area; a.zones = D.zones; return true; },
    () => { a.rating = D.rating; a.noProblem = false; },
    ...D.problems.map((k) => () => { a.problems = Array.from(new Set([...(a.problems || []), k])); }),
    () => { a.kids = D.kids; a.pets = D.pets; a.watering = D.watering; a.mowing = D.mowing; },
    () => { a.trees = D.trees; a.treeSick = D.treeSick; a.pests = D.pests; return true; },
    () => { a.goals = D.goals; if (!filled(a.notes)) a.notes = D.notes; },
  ];
  for (const st of steps) {
    if (curStep() !== 1) break;
    const layout = st() === true;
    replaceEl('qcol', qColumnHtml(p));
    refreshDiag(p, layout);
    await sleep(320);
  }
  persist(p);
  S.ui.filling = false;
  const pill = $('.dock'); if (pill) pill.outerHTML = viewDemoDock(p, curStep() || 1);
  toast(t('Évaluation type remplie : vérifiez et envoyez', 'Sample assessment filled: check it and send'));
}

/* ============ Steps 2 to 5 ============ */
function refreshStep2(p) {
  if (isRenewal(p)) { refreshRenewProgram(p); return; }
  const recs = recommendations(p);
  $$('.addon[data-addon]').forEach((el) => { const a = ADD[el.dataset.addon]; if (a) el.outerHTML = addonCardHtml(p, a, recs.find((r) => r.key === a.key) || null); });
  replaceEl('receipt', receiptHtml(p));
  const hc = $('.hero .hc'); if (hc) hc.outerHTML = heroCard(p, 2);
  const tl = $('#timeline'); if (tl) tl.innerHTML = timelineHtml(p);
  updatePlans(p);
  replaceEl('gauge', gaugeHtml(p));
}
function acceptProposal(p) {
  if (!p.proposal.acceptedAt) { p.proposal.acceptedAt = nowIso(); log(p, `Plan d’action v${p.proposal.version} accepté`, `Action plan v${p.proposal.version} accepted`); }
  advanceTo(p, 3); persist(p);
  toast(t('Plan accepté. Choisissez le moment de votre inspection.', 'Plan accepted. Pick a time for your inspection.'));
  location.hash = `${p.slug}-visite`;
}
function rerenderBooker(p) { replaceEl('booker', bookerHtml(p)); }
function bookVisit(p) {
  const b = bookingState(p);
  if (!b.day || (b.mode === 'video' ? !b.time : !b.window)) return;
  p.visit = { mode: b.mode, date: b.day, window: b.mode === 'terrain' ? b.window : null, time: b.mode === 'video' ? b.time : null, presence: b.presence, access: b.access, petsNote: b.petsNote, notes: b.notes, bookedAt: nowIso() };
  S.ui.rebook = false;
  log(p, `${b.mode === 'video' ? 'Appel vidéo' : 'Inspection'} réservé${b.mode === 'video' ? '' : 'e'} : ${visitWhen(p.visit)}`, `${b.mode === 'video' ? 'Video call' : 'Inspection'} booked: ${visitWhen(p.visit)}`);
  persist(p);
  const sec = $('#booker-sec .wrap'); if (sec) sec.innerHTML = visitConfirmHtml(p);
  refreshHeader(p);
  toast(t('C’est réservé. À bientôt !', 'Booked. See you soon!'));
}
function measureAndPublish(p) {
  const measured = Math.round((areaOf(p) * 1.04) / 50) * 50;
  A(p).area = measured;
  bumpVersion(p);
  if (!p.visit || visitEnd(p.visit) > new Date()) {
    const d = addDays(new Date(), -1);
    p.visit = Object.assign({ mode: 'terrain', window: 'am', presence: 'oui', access: '', petsNote: '', notes: '', bookedAt: isoLocal(addDays(new Date(), -3)) }, p.visit || {}, { date: isoDay(d) });
  }
  log(p, `Inspection faite : ${fmtInt(measured)} pi² mesurés, plan ajusté (v${p.proposal.version}) et entente publiée`, `Inspection done: ${measured} sq ft measured, plan adjusted (v${p.proposal.version}) and agreement published`);
  return measured;
}
function sigHash(p) {
  const h = hashStr(contractPlain(p) + nowIso()).toString(16).toUpperCase().padStart(8, '0');
  const h2 = hashStr(h + p.slug).toString(16).toUpperCase().padStart(8, '0');
  return `${h.slice(0, 4)}-${h.slice(4, 8)}-${h2.slice(0, 4)}`;
}
function scheduleCountersign(p) {
  if (p.countersigned) return;
  setTimeout(() => {
    const q = S.portals[p.slug];
    if (!q || !q.signature || q.countersigned) return;
    q.countersigned = { name: (q.rep || repFor(q.branch)).name, signedAt: nowIso() };
    q.onboarding.tasks = q.onboarding.tasks || {};
    q.onboarding.tasks.file = true;
    q.onboarding.startedAt = q.onboarding.startedAt || nowIso();
    log(q, `Contresignée par ${q.countersigned.name}`, `Countersigned by ${q.countersigned.name}`);
    persist(q);
    if (S.route.view === 'portal' && S.route.slug === q.slug) {
      if ($('#sigs')) { replaceEl('sigs', `<div class="sigs" id="sigs">${sigBlock(q, 'client')}${sigBlock(q, 'vd')}</div>`); replaceEl('signbox', signboxHtml(q)); }
      refreshHeader(q);
      if ($('#tasks')) { replaceEl('tasks', tasksHtml(q)); const pc = $('#ob-pct'); if (pc) pc.textContent = `${obProgress(q)} %`; }
    }
    toast(t(`Contresignée par ${firstName(q.countersigned.name)}`, `Countersigned by ${firstName(q.countersigned.name)}`));
  }, 2600);
}
function signNow(p, sig) {
  p.signature = Object.assign({ signedAt: nowIso(), hash: sigHash(p) }, sig);
  /* Demo: the payment method confirmed with the branch at signing (never entered in the portal) */
  if (!p.account) p.account = { method: { kind: 'card', label: 'Visa', last4: String(1000 + (hashStr(p.slug) % 9000)) }, autopay: true };
  if (isRenewal(p)) {
    log(p, `Renouvellement ${SEASON} signé en ligne (${ordinal(seasonNo(p), true)} année)`, `${SEASON} renewal signed online`);
    /* A returning client: access, notices and the route are already known */
    p.onboarding.tasks = Object.assign(p.onboarding.tasks || {}, { prefs: true, access: true, zones: true, route: true });
    p.onboarding.startedAt = p.onboarding.startedAt || nowIso();
  } else log(p, 'Entente signée en ligne', 'Agreement signed online');
  advanceTo(p, 5);
  persist(p);
  scheduleCountersign(p);
}
function doSign(p) {
  const name = (($('#sig-name') || {}).value || '').trim(), agree = !!($('#sig-agree') && $('#sig-agree').checked), err = $('#sig-err');
  const mode = S.ui.signMode || 'draw';
  const fail = (m) => { if (err) err.textContent = m; };
  if (!name) return fail(t('Entrez votre nom complet.', 'Enter your full name.'));
  if (mode === 'draw' && !S.ui.sigDirty) return fail(t('Signez dans la zone prévue, ou choisissez « Taper ».', 'Sign in the pad, or choose “Type”.'));
  if (!agree) return fail(t('Cochez la case pour confirmer.', 'Tick the box to confirm.'));
  const sig = { name, mode, image: mode === 'draw' ? trimCanvas($('#sig-canvas')) : null, text: mode === 'type' ? name : '' };
  if (isTerm(p)) {
    signAmendment(p, sig, (($('#am-po') || {}).value || '').trim());
    S.ui.amPo = null;
    render({ keepScroll: true });
    toast(t(`Budget ${SEASON} approuvé. Merci !`, `${SEASON} budget approved. Thank you!`));
    return;
  }
  signNow(p, sig);
  render({ keepScroll: true });
  toast(isRenewal(p) ? t(`Renouvellement signé. Merci pour cette ${ordinal(seasonNo(p), true)} année !`, `Renewal signed. Thank you for this ${ordinal(seasonNo(p))} year!`) : t('Entente signée. Bienvenue chez MBM !', 'Agreement signed. Welcome to MBM!'));
}
/* Demo and console: move a file one step forward, filling in what that step needs */
function advancePortal(p) {
  if (isRenewal(p)) return renewAdvance(p);
  if (isTerm(p)) return termAdvance(p);
  const n = p.stage;
  if (n === 1) {
    const a = A(p);
    if (QSECTIONS.some((s) => !s.done(a))) Object.keys(demoAnswers(p)).forEach((k) => { if (!filled(a[k]) && !arr(a[k])) a[k] = demoAnswers(p)[k]; });
    if (QSECTIONS.some((s) => !s.done(a))) Object.assign(a, demoAnswers(p));
    a.submittedAt = nowIso(); syncClientFromAnswers(p);
    p.proposal.date = isoDay(new Date()); p.proposal.validUntil = isoDay(addDays(new Date(), 30));
    log(p, 'Évaluation envoyée, plan d’action généré', 'Assessment sent, action plan generated');
    advanceTo(p, 2); return { key: 'proposition', msg: t('Votre plan d’action est prêt', 'Your action plan is ready') };
  }
  if (n === 2) {
    if (!p.proposal.acceptedAt) { p.proposal.acceptedAt = nowIso(); log(p, `Plan d’action v${p.proposal.version} accepté`, `Action plan v${p.proposal.version} accepted`); }
    advanceTo(p, 3); return { key: 'visite', msg: t('Plan d’action accepté', 'Action plan accepted') };
  }
  if (n === 3) {
    const m = measureAndPublish(p);
    advanceTo(p, 4); return { key: 'entente', msg: t(`Inspection faite : ${fmtArea(m)}, points d’entrée repérés. Votre entente est prête.`, `Inspection done: ${fmtArea(m)}, entry points found. Your agreement is ready.`) };
  }
  if (n === 4) {
    if (!p.signature) signNow(p, { name: p.client.first ? `${p.client.first} ${p.client.last}` : p.client.name, mode: 'type', text: p.client.first ? `${p.client.first} ${p.client.last}` : p.client.name, image: null });
    advanceTo(p, 5); return { key: 'saison', msg: t('Entente signée', 'Agreement signed') };
  }
  return null;
}
function stepBack(p) {
  if (isRenewal(p)) { renewBack(p); return; }
  if (isTerm(p)) { termBack(p); return; }
  const n = Math.max(1, p.stage - 1);
  if (n <= 4) { p.signature = null; p.countersigned = null; }
  if (n <= 3) { p.visit = null; }
  if (n <= 2) { p.proposal.acceptedAt = null; }
  if (n <= 1) { A(p).submittedAt = null; }
  p.stage = n;
  log(p, `Dossier ramené à l’étape ${n}`, `File moved back to step ${n}`);
}
function resetPortal(slug) {
  const seed = SEED_BY_SLUG[slug];
  if (seed) S.portals[slug] = hydrate(clone(seed));
  else { const p = S.portals[slug]; if (!p) return; const fresh = hydrate({ slug, stage: 1, segment: p.segment, source: p.source, branch: p.branch, createdAt: p.createdAt, code: p.code, client: p.client, answers: { name: p.client.name, email: p.client.email, phone: p.client.phone, address: p.client.address, city: p.client.city }, activity: p.activity.slice(-1) }); S.portals[slug] = fresh; }
  S.ui.booking = null; S.ui.sigName = null; S.ui.rebook = false; S.ui.baMode = 'now'; S.ui.meetEdit = false; S.ui.amPo = null; delete S.chat[slug]; delete S.ui.bumped[slug];
  persist(S.portals[slug]);
}
function resetAll() {
  const seeds = buildSeeds();
  const created = S.order.filter((s) => !SEED_BY_SLUG[s]);
  S.portals = {}; S.order = [];
  seeds.forEach((p) => { S.portals[p.slug] = p; S.order.push(p.slug); });
  S.chat = {}; S.ui.bumped = {}; S.ui.booking = null; S.ui.followup = null;
  saveLocalNow();
  if (S.caps.db && !S.dbReadOnly) {
    seeds.forEach((p) => flush(p.slug));
    created.forEach((s) => { try { S.caps.db.doc('portals/' + s).delete(); } catch (e) { /* ignore */ } });
  }
}

/* ============ Signature pad ============ */
function initSigPad() {
  const c = $('#sig-canvas'); if (!c) return;
  const ctx = c.getContext('2d');
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = c.getBoundingClientRect();
  c.width = Math.round(rect.width * dpr); c.height = Math.round(rect.height * dpr);
  ctx.scale(dpr, dpr); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#10255A'; ctx.lineWidth = 2.4;
  S.ui.sigDirty = false;
  let pts = [], down = false;
  const pos = (e) => { const r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  c.addEventListener('pointerdown', (e) => { down = true; pts = [pos(e)]; try { c.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } const h = $('.pad__hint'); if (h) h.style.opacity = '0'; });
  c.addEventListener('pointermove', (e) => {
    if (!down) return;
    pts.push(pos(e));
    const n = pts.length;
    if (n === 2) { ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); const m = mid(pts[0], pts[1]); ctx.lineTo(m.x, m.y); ctx.stroke(); }
    else if (n > 2) { const [a, b, d] = pts.slice(-3); const m1 = mid(a, b), m2 = mid(b, d); ctx.beginPath(); ctx.moveTo(m1.x, m1.y); ctx.quadraticCurveTo(b.x, b.y, m2.x, m2.y); ctx.stroke(); }
    S.ui.sigDirty = true;
  });
  const end = () => { if (down && pts.length === 1) { ctx.beginPath(); ctx.arc(pts[0].x, pts[0].y, 1.3, 0, Math.PI * 2); ctx.fillStyle = '#10255A'; ctx.fill(); S.ui.sigDirty = true; } down = false; };
  c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end); c.addEventListener('pointerleave', end);
}
function trimCanvas(c) {
  if (!c) return null;
  const ctx = c.getContext('2d'), w = c.width, h = c.height, data = ctx.getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (data[(y * w + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  if (x1 <= x0 || y1 <= y0) return c.toDataURL('image/png');
  const pad = 8, cw = Math.min(w, x1 - x0 + pad * 2), ch = Math.min(h, y1 - y0 + pad * 2);
  const out = document.createElement('canvas'), k = Math.min(1, 480 / cw);
  out.width = Math.round(cw * k); out.height = Math.round(ch * k);
  out.getContext('2d').drawImage(c, Math.max(0, x0 - pad), Math.max(0, y0 - pad), cw, ch, 0, 0, out.width, out.height);
  return out.toDataURL('image/png');
}

/* ============ Files: calendar invite and signed PDF ============ */
async function saveFile(filename, data, type) {
  if (S.caps.downloads) {
    try { const r = await S.caps.downloads.save({ filename, data }); if (r && (r.status === 'saved' || r.status === 'delivered')) toast(t('Fichier enregistré', 'File saved')); }
    catch (e) { if (!e || !['cancelled', 'declined'].includes(e.code)) toast(t('Le fichier n’a pas pu être enregistré ici', 'The file could not be saved here')); }
    return;
  }
  try {
    const blob = data instanceof Blob ? data : new Blob([data], { type: type || 'application/octet-stream' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  } catch (e) { toast(t('Le fichier n’a pas pu être enregistré ici', 'The file could not be saved here')); }
}
const pdfText = (s) => String(s == null ? '' : s).replace(/[   ]/g, ' ').replace(/≈/g, 'env.').replace(/[−]/g, '-').replace(/[“”]/g, '"');
function downloadPdf(p) {
  if (!window.jspdf || !window.jspdf.jsPDF) { toast(t('Le PDF n’est pas disponible ici', 'The PDF is not available here')); return; }
  const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'letter' });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), m = 56, q = quote(p);
  let y = m;
  const need = (h) => { if (y + h > H - m) { doc.addPage(); y = m; } };
  const para = (txt, size = 10, gap = 4) => { doc.setFontSize(size); doc.splitTextToSize(pdfText(txt), W - m * 2).forEach((ln) => { need(size + 4); doc.text(ln, m, y); y += size + 4; }); y += gap; };
  doc.setFillColor(0, 174, 239); doc.rect(0, 0, W, 8, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(11, 27, 38);
  doc.text(pdfText(t(`Entente de service - ${SEASON}`, `Service agreement - ${SEASON}`)), m, y + 8); y += 30;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(93, 107, 117);
  doc.text(pdfText(`${docId(p)} · ${householdOf(p)} · ${p.client.address}, ${p.client.city}`), m, y); y += 24;
  doc.setTextColor(11, 27, 38);
  contractSections(p).forEach((s) => {
    need(40); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text(pdfText(`${s.n}. ${s.title}`), m, y); y += 16;
    doc.setFont('helvetica', 'normal');
    s.paras.forEach((x) => para(x));
    if (s.table) {
      const rows = q.lines.map((l) => [l.label, fmtMoney(l.amount)]);
      if (q.discount) rows.push([t(`Rabais de ${q.discPct} %`, `${q.discPct}% discount`), `- ${fmtMoney(q.discount)}`]);
      if (q.promo) rows.push([t('Intervention initiale, automne 2026 (offre)', 'First treatment, fall 2026 (offer)'), fmtMoney(q.promo)]);
      rows.push([t('TPS (5 %)', 'GST (5%)'), fmtMoney(q.tps)], [t('TVQ (9,975 %)', 'QST (9.975%)'), fmtMoney(q.tvq)], [t('Total, taxes incluses', 'Total, tax included'), fmtMoney(q.total)]);
      doc.setFontSize(10);
      rows.forEach((r, i) => { need(16); const last = i === rows.length - 1; doc.setFont('helvetica', last ? 'bold' : 'normal'); doc.text(pdfText(r[0]), m + 8, y); doc.text(pdfText(r[1]), W - m, y, { align: 'right' }); y += 15; });
      y += 6;
    }
  });
  need(120); y += 16;
  const s = p.signature, c = p.countersigned, colW = (W - m * 2 - 30) / 2;
  if (s && s.mode === 'draw' && safeImg(s.image)) { try { doc.addImage(s.image, 'PNG', m, y, 150, 50); } catch (e) { /* ignore */ } }
  else if (s) { doc.setFont('times', 'italic'); doc.setFontSize(22); doc.setTextColor(16, 37, 90); doc.text(pdfText(s.text || s.name), m, y + 38); }
  if (c) { doc.setFont('times', 'italic'); doc.setFontSize(22); doc.setTextColor(16, 37, 90); doc.text(pdfText(c.name), m + colW + 30, y + 38); }
  y += 56; doc.setDrawColor(11, 27, 38); doc.line(m, y, m + colW, y); doc.line(m + colW + 30, y, W - m, y); y += 14;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(93, 107, 117);
  const left = s ? [s.name, fmtDateTime(s.signedAt), `${t('Empreinte', 'Fingerprint')} ${s.hash || ''}`] : [t('En attente de signature', 'Awaiting signature')];
  const right = c ? [c.name, `MBM Gestion parasitaire · ${branchName(p.branch)}`, fmtDateTime(c.signedAt)] : [t('Contresignature à venir', 'Countersignature pending')];
  doc.text(left.flatMap((l) => doc.splitTextToSize(pdfText(l), colW)), m, y, { lineHeightFactor: 1.4 });
  doc.text(right.flatMap((l) => doc.splitTextToSize(pdfText(l), colW)), m + colW + 30, y, { lineHeightFactor: 1.4 });
  doc.setFontSize(8); doc.text(pdfText(t('Modèle de démonstration préparé par Winnia pour MBM Gestion parasitaire. Données fictives.', 'Demo template prepared by Winnia for MBM Gestion parasitaire. Fictional data.')), m, H - 30);
  const name = `entente-mbm-${p.slug}.pdf`;
  saveFile(name, doc.output('blob'), 'application/pdf');
}

/* ============ Photo and AI analysis ============ */
function downscale(file, max) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.72)); };
      img.onerror = rej; img.src = fr.result;
    };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}
function dataUrlToBlob(u) {
  const [h, b] = u.split(','), mime = (/data:([^;]+)/.exec(h) || [])[1] || 'image/jpeg', bin = atob(b), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return new Blob([out], { type: mime });
}
async function handlePhoto(p, file) {
  if (!file || !/^image\//.test(file.type)) { toast(t('Choisissez une image', 'Choose an image')); return; }
  try {
    A(p).photo = await downscale(file, 960); A(p).photoAi = null;
    persist(p); replaceEl('qcol', qColumnHtml(p)); refreshDiag(p);
    toast(t('Photo ajoutée', 'Photo added'));
  } catch (e) { toast(t('Cette image n’a pas pu être lue', 'This image could not be read')); }
}
async function analyzePhoto(p) {
  const out = $('#photo-ai-out'), btn = $('#photo-ai-btn'), a = A(p);
  if (!out || !safeImg(a.photo)) return;
  if (!S.caps.sample || !S.caps.sampleImages) {
    out.innerHTML = `<div class="ai-note">${t('L’identification par Claude s’active dans la version en ligne de ce portail. D’ici là, votre conseiller verra la photo avant l’inspection.', 'Identification by Claude turns on in the online version of this portal. Until then, your advisor will see the photo before the inspection.')}</div>`;
    return;
  }
  if (btn) btn.disabled = true;
  out.innerHTML = `<div class="ai-note">${t('Identification en cours…', 'Identifying…')}</div>`;
  const keys = PROBLEMS.map((x) => `${x.key}: ${x.fr}`).join('\n');
  const prompt = `Tu es entomologiste pour MBM Gestion parasitaire, au Québec. Un client a joint une photo d’un insecte, d’un animal ou de traces chez lui. Identifie seulement ce qui est clairement visible (espèce probable et signes), parmi ces signes (clé : description) :\n${keys}\n\nRéponds uniquement avec ce JSON : {"problems": ["clé", ...], "summary": "deux phrases au maximum, en ${S.lang === 'en' ? 'anglais' : 'français québécois'}, ton rassurant : nomme le nuisible probable et précise que le technicien confirmera à l’inspection"}. Si la photo ne montre aucun nuisible ni aucune trace, renvoie une liste vide et explique-le dans summary.`;
  try {
    const res = await S.caps.sample.json(prompt, { images: [dataUrlToBlob(a.photo)], modelTier: 'default', cache: false });
    const found = (res && Array.isArray(res.problems) ? res.problems : []).filter((k) => PROB[k]);
    a.problems = Array.from(new Set([...(a.problems || []), ...found]));
    if (found.length) a.noProblem = false;
    a.photoAi = { summary: String((res && res.summary) || '').slice(0, 400), found, at: nowIso() };
    persist(p); replaceEl('qcol', qColumnHtml(p)); refreshDiag(p);
    toast(found.length ? t(`${found.length} signe(s) repéré(s) sur la photo`, `${found.length} sign(s) spotted in the photo`) : t('Identification terminée', 'Identification done'));
  } catch (e) {
    if (e && SAMPLE_OFF.includes(e.code)) { S.caps.sample = null; refreshAiBadges(); }
    out.innerHTML = `<div class="ai-note">${t('L’identification n’a pas pu se faire. Votre conseiller verra la photo avant l’inspection.', 'The identification could not run. Your advisor will see the photo before the inspection.')}</div>`;
    if (btn) btn.disabled = false;
  }
}

/* ============ Virtual advisor ============ */
const normTxt = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function localAnswer(q) {
  const s = normTxt(q);
  let best = null, score = 0;
  FAQ.forEach((f) => { let sc = 0; f.k.forEach((k) => { if (s.includes(normTxt(k))) sc += k.length; }); if (sc > score) { score = sc; best = f; } });
  return best ? tx(best.a) : t('Bonne question. Je n’ai pas de réponse précise ici : votre conseiller peut vous répondre directement, avec le bouton de contact en haut de la page.', 'Good question. I don’t have a precise answer here: your advisor can answer you directly with the contact button at the top of the page.');
}
function askContext(p) {
  const a = A(p), q = quote(p), rep = p.rep || repFor(p.branch);
  return `Tu es le conseiller virtuel de MBM Gestion parasitaire, entreprise québécoise de gestion parasitaire responsable (bureaux à Longueuil et à Québec, assistance 24/7 au ${MBM_LINE}, certifiée GreenPro et QualityPro). Tu réponds dans le portail client de ${householdOf(p)} (${p.client.city}), suivi par ${rep.name}, MBM ${branchName(p.branch)}.
Règles : réponds en ${S.lang === 'en' ? 'anglais' : 'français québécois'}, en deux à cinq phrases, rassurant et concret, à partir de pratiques reconnues de gestion parasitaire intégrée. Ne promets aucun résultat précis, ne donne aucun autre prix que ceux du plan ci-dessous et ne demande jamais d’information de paiement. Pour une identification sûre, suggère l’inspection gratuite ou le conseiller; pour une urgence, la ligne 24/7. Pour la sécurité des enfants et des animaux : stations d’appâts verrouillées, produits ciblés seulement là où il le faut, et le technicien laisse la consigne exacte (temps avant de revenir dans une pièce traitée).
Services MBM : évaluation, inspection et identification des nuisibles; gestion parasitaire par lutte biologique intégrée; extermination intérieure et extérieure et traitement-choc; plan de gestion parasitaire sur mesure; gestion des odeurs. Traitements du plan : exclusion des rongeurs, stations d’appâts verrouillées, raton laveur et écureuil, punaises de lit, blattes et fourmis, fourmis charpentières, traitement biologique des drains, retrait de nids de guêpes, bouclier extérieur 3 saisons. Appel de satisfaction dans la semaine qui suit chaque intervention; appels de service sans frais entre les visites.
Dossier : environ ${areaOf(p)} pi²; signes notés : ${(a.problems || []).map((k) => PROB[k] && PROB[k].fr).filter(Boolean).join(', ') || 'aucun'}; pièces : ${(a.zones || []).join(', ') || 'non précisé'}; enfants : ${a.kids || 'non précisé'}; animaux : ${(a.pets || []).join(', ') || 'non précisé'}; ce qui compte : ${(a.goals || []).map((k) => GOAL[k] && GOAL[k].fr).filter(Boolean).join(', ') || 'non précisé'}.
${a.submittedAt ? `Plan d’action proposé : ${q.lines.map((l) => `${l.label} (${Math.round(l.amount)} $)`).join(', ')}; ${Math.round(q.season - q.discount)} $ pour l’année, ${q.monthly.toFixed(2)} $ par mois, taxes en sus.` : 'L’évaluation n’est pas encore envoyée.'} Étape actuelle : ${stepLabel(p.stage, p)}. Traitements ciblés dans les 48 heures qui suivent la signature; première visite de prévention la semaine du 19 avril 2027.${isRenewal(p) ? `
Parcours : renouvellement annuel. Client depuis ${p.since} (${ordinal(seasonNo(p), true)} année en ${SEASON}). Année ${PREV} : ${(RN(p).visits || []).length} visites, indice de protection de ${(RN(p).health || [])[0]} à ${(RN(p).health || [])[1]}. Prix fidélité de ${quote(p).discPct} % jusqu’au ${fmtDate(renewDeadline(p), { day: 'numeric', month: 'long' })}.` : ''}${isTerm(p) ? `
Parcours : entente pluriannuelle ${TM(p).no}, ${TM(p).start} à ${TM(p).end}, ${sitesOf(p).length} ${siteNoun(p, 2)}. An ${termDone(p)} terminé; budget ${SEASON} : ${Math.round(termTotal(p))} $ avant taxes, indexation de ${TM(p).indexPct} %.` : ''}`;
}
function scrollAskLog() { const b = $('#ask-log'); if (b) b.scrollTop = b.scrollHeight; }
function renderAskLog(p) { const b = $('#ask-log'); if (b) { b.innerHTML = bubblesHtml(p); scrollAskLog(); } }
function openAsk(p) {
  S.ui.askOpen = true;
  const fab = $('.ask-fab');
  if (fab) fab.outerHTML = viewAsk(p);
  else if (!$('#ask') && $('.portal')) $('.portal').insertAdjacentHTML('beforeend', viewAsk(p));
  scrollAskLog();
  setTimeout(() => { const i = $('#ask-input'); if (i) i.focus({ preventScroll: true }); }, 60);
}
function closeAsk() {
  S.ui.askOpen = false;
  const a = $('#ask'); if (a) a.outerHTML = `<button class="ask-fab" data-action="ask-open">${icon('leaf')}<span>${t('Une question ?', 'A question?')}</span></button>`;
}
async function askSend(p, text) {
  text = String(text || '').trim();
  if (!text || S.ui.asking) return;
  const logArr = askLog(p);
  logArr.push({ role: 'me', text });
  renderAskLog(p);
  S.ui.asking = true;
  if (S.caps.sample) {
    logArr.push({ role: 'bot', text: '…' });
    renderAskLog(p);
    const turns = logArr.slice(1, -1).map((m) => ({ role: m.role === 'me' ? 'user' : 'assistant', content: m.text }));
    const input = [{ role: 'user', content: askContext(p) }, { role: 'assistant', content: t('Compris. Je suis prêt à répondre au client.', 'Understood. Ready to answer the client.') }, ...turns];
    try {
      const res = await S.caps.sample(input, { modelTier: 'quick', cache: false, onText: ({ text: tt }) => { logArr[logArr.length - 1].text = tt; const bs = $$('#ask-log .bubble--bot'); const last = bs[bs.length - 1]; if (last) last.textContent = tt; scrollAskLog(); } });
      logArr[logArr.length - 1].text = (res && res.text && res.text.trim()) || localAnswer(text);
    } catch (e) {
      logArr[logArr.length - 1].text = (e && e.text) || localAnswer(text);
      if (e && SAMPLE_OFF.includes(e.code)) { S.caps.sample = null; refreshAiBadges(); }
    }
  } else {
    await sleep(380);
    logArr.push({ role: 'bot', text: localAnswer(text) });
  }
  S.ui.asking = false;
  renderAskLog(p);
}

/* ============ Console actions ============ */
async function genFollowup(p) {
  const ch = S.ui.channel || 'sms', out = $('#adm-ai-out'), btn = $('#adm-gen');
  let text = '';
  if (S.caps.sample) {
    if (btn) btn.disabled = true;
    if (out) out.innerHTML = `<p class="small" style="margin:0">${t('Rédaction en cours…', 'Drafting…')}</p>`;
    try { const res = await S.caps.sample(followupPrompt(p, ch), { modelTier: 'quick', cache: false }); text = String((res && res.text) || '').trim(); }
    catch (e) { if (e && SAMPLE_OFF.includes(e.code)) { S.caps.sample = null; refreshAiBadges(); } }
    if (btn) btn.disabled = false;
  }
  if (!text) text = templateFollowup(p, ch);
  S.ui.followup = { slug: p.slug, text };
  replaceEl('adm-ai', admAiHtml(p));
}
function admChange(p, key, raw) {
  const v = Number(raw);
  if (key === 'area' && clamp(Math.round(v), 300, 250000) === areaOf(p)) return;
  if (key === 'discountPct' && clamp(Math.round(v) || 0, 0, 30) === (Number(p.proposal.discountPct) || 0)) return;
  if (key === 'area') { if (!(v > 0)) return; A(p).area = clamp(Math.round(v), 300, 250000); bumpVersion(p); log(p, `Superficie ajustée à ${fmtInt(A(p).area)} pi² (v${p.proposal.version})`, `Area adjusted to ${A(p).area} sq ft (v${p.proposal.version})`); }
  if (key === 'discountPct') { p.proposal.discountPct = clamp(Math.round(v) || 0, 0, 30); bumpVersion(p); log(p, `Rabais de ${p.proposal.discountPct} % (v${p.proposal.version})`, `${p.proposal.discountPct}% discount (v${p.proposal.version})`); }
  persist(p);
  render({ keepScroll: true });
}

/* ============ Events ============ */
const ACTIONS = {
  'reveal-code': () => { const c = $('#demo-code'); if (c) c.textContent = curP().code; },
  'use-code': () => { const i = $('#gate-code'); if (i) { i.value = curP().code; i.focus(); } },
  'reveal-pin': () => { const c = $('#adm-demo'); if (c) c.textContent = ADMIN_PIN; },
  'use-pin': () => { const i = $('#adm-pin'); if (i) { i.value = ADMIN_PIN; i.focus(); } },
  lang: (el) => { S.lang = el.dataset.v === 'en' ? 'en' : 'fr'; store.set(LS_KEY + ':lang', S.lang); S.chat = {}; render({ keepScroll: true }); },
  'toggle-contact': (el) => { const pop = $('#contact-pop'); if (!pop) return; pop.hidden = !pop.hidden; el.setAttribute('aria-expanded', String(!pop.hidden)); },
  copy: (el) => copyText(el.dataset.text || ''),
  'scroll-to': (el) => scrollToId(el.dataset.target),
  lock: () => { location.hash = 'lock'; },
  'close-modal': () => closeModal(),
  'q-set': (el) => {
    const p = curP(), a = A(p), k = el.dataset.k;
    const val = ['rating', 'area'].includes(k) ? Number(el.dataset.v) : el.dataset.v;
    a[k] = val;
    if (k === 'area') {
      const r = $('#q-area');
      if (r) { r.value = val; const min = +r.min, max = +r.max; r.style.setProperty('--p', `${Math.round(((clamp(val, min, max) - min) / (max - min)) * 100)}%`); }
      const av = $('#area-val'); if (av) av.textContent = fmtArea(val);
      const am = $('#area-m2'); if (am) am.textContent = `≈ ${fmtInt(val / 10.764)} m²`;
      setPressed('.preset[data-k="area"]', (b) => Number(b.dataset.v) === val);
    } else setPressed(`[data-action="q-set"][data-k="${k}"]`, (b) => b.dataset.v === String(val));
    onAnswers(p, { layout: k === 'type' });
  },
  'q-toggle': (el) => {
    const p = curP(), a = A(p), k = el.dataset.k, v = el.dataset.v;
    const excl = { pets: 'aucun', pests: 'none' }[k];
    let list = Array.isArray(a[k]) ? a[k].slice() : [];
    if (list.includes(v)) list = list.filter((x) => x !== v);
    else if (excl && v === excl) list = [v];
    else list = list.filter((x) => x !== excl).concat(v);
    a[k] = list;
    setPressed(`[data-action="q-toggle"][data-k="${k}"]`, (b) => list.includes(b.dataset.v));
    onAnswers(p);
  },
  'toggle-prob': (el) => {
    const p = curP(), a = A(p), k = el.dataset.k;
    const list = new Set(a.problems || []);
    if (list.has(k)) list.delete(k); else list.add(k);
    a.problems = Array.from(list); a.noProblem = false;
    el.setAttribute('aria-pressed', String(list.has(k)));
    setPressed('[data-action="no-prob"]', () => false);
    onAnswers(p);
  },
  'no-prob': () => {
    const p = curP(), a = A(p);
    a.noProblem = !a.noProblem; if (a.noProblem) a.problems = [];
    setPressed('.prob', () => false); setPressed('[data-action="no-prob"]', () => a.noProblem);
    onAnswers(p);
  },
  trees: (el) => {
    const p = curP(), a = A(p), max = isOrg(p) ? 40 : 12;
    a.trees = clamp(treesOf(p) + Number(el.dataset.d), 0, max);
    const tv = $('#trees-val'); if (tv) tv.textContent = a.trees;
    onAnswers(p, { layout: true });
  },
  'photo-ai': () => analyzePhoto(curP()),
  'submit-diag': () => submitDiag(curP()),
  'demo-fill': () => demoFill(curP()),
  'demo-next': () => { const p = curP(); const r = advancePortal(p); if (!r) return; persist(p); toast(r.msg); location.hash = `${p.slug}-${r.key}`; },
  'demo-reset': (el) => {
    if (el.dataset.armed !== '1') { el.dataset.armed = '1'; el.classList.add('is-armed'); setTimeout(() => { if (el.isConnected) { el.dataset.armed = ''; el.classList.remove('is-armed'); } }, 3200); return; }
    const p = curP(); resetPortal(p.slug); toast(t('Démo remise à zéro', 'Demo reset'));
    if (location.hash === `#${p.slug}`) render(); else location.hash = p.slug;
  },
  'toggle-addon': (el) => { const p = curP(); p.proposal.addons = p.proposal.addons || {}; p.proposal.addons[el.dataset.k] = !isSelected(p, el.dataset.k); persist(p); refreshStep2(p); },
  'accept-proposal': () => acceptProposal(curP()),
  'ba-mode': (el) => {
    S.ui.baMode = el.dataset.v === 'after' ? 'after' : 'now';
    const svg = $('#ba-plan svg.plan'); if (svg) svg.classList.toggle('is-after', S.ui.baMode === 'after');
    setPressed('[data-action="ba-mode"]', (b) => b.dataset.v === S.ui.baMode);
  },
  'ask-open': () => openAsk(curP()),
  'ask-close': () => closeAsk(),
  'ask-sugg': (el) => askSend(curP(), el.dataset.q),
  'visit-mode': (el) => { const p = curP(), b = bookingState(p); b.mode = el.dataset.v === 'video' ? 'video' : 'terrain'; b.day = null; b.window = null; b.time = null; rerenderBooker(p); },
  'pick-day': (el) => { const p = curP(), b = bookingState(p); b.day = el.dataset.day; b.window = null; b.time = null; rerenderBooker(p); },
  'pick-window': (el) => { const p = curP(); bookingState(p).window = el.dataset.v; rerenderBooker(p); },
  'pick-time': (el) => { const p = curP(); bookingState(p).time = el.dataset.v; rerenderBooker(p); },
  'cal-move': (el) => { const p = curP(), b = bookingState(p); b.month = new Date(b.month.getFullYear(), b.month.getMonth() + Number(el.dataset.dir), 1); rerenderBooker(p); },
  'visit-presence': (el) => { const p = curP(); bookingState(p).presence = el.dataset.v; setPressed('[data-action="visit-presence"]', (b) => b.dataset.v === el.dataset.v); },
  'book-visit': () => bookVisit(curP()),
  rebook: () => { const p = curP(); S.ui.rebook = true; S.ui.booking = null; const sec = $('#booker-sec .wrap'); if (sec) sec.innerHTML = bookerHtml(p); },
  ics: () => { const p = curP(); if (p.visit) saveFile(`inspection-mbm-${p.slug}.ics`, icsFor(p), 'text/calendar'); },
  'sign-mode': (el) => { const p = curP(); const n = $('#sig-name'); if (n) S.ui.sigName = n.value; const po = $('#am-po'); if (po) S.ui.amPo = po.value; S.ui.signMode = el.dataset.v; replaceEl('signbox', signboxFor(p)); if (S.ui.signMode === 'draw') requestAnimationFrame(initSigPad); },
  'sig-clear': () => { const c = $('#sig-canvas'); if (!c) return; c.getContext('2d').clearRect(0, 0, c.width, c.height); S.ui.sigDirty = false; const h = $('.pad__hint'); if (h) h.style.opacity = '1'; },
  sign: () => doSign(curP()),
  pdf: () => downloadPdf(curP()),
  pref: (el) => {
    const p = curP(); p.onboarding.prefs = p.onboarding.prefs || {};
    const k = el.dataset.k; p.onboarding.prefs[k] = !p.onboarding.prefs[k];
    el.setAttribute('aria-checked', String(!!p.onboarding.prefs[k]));
    p.onboarding.tasks = p.onboarding.tasks || {};
    if (!p.onboarding.tasks.prefs) { p.onboarding.tasks.prefs = true; replaceEl('tasks', tasksHtml(p)); }
    persist(p); refreshObBits(p);
  },
  'new-portal': () => newPortalModal(),
  'demo-client': (el) => switchDemoClient(el.dataset.slug),
  'offer-accept': (el) => decideOffer(curP(), el.dataset.id, 'accepted', el),
  'offer-decline': (el) => decideOffer(curP(), el.dataset.id, 'declined', el),
  'offer-reopen': (el) => decideOffer(curP(), el.dataset.id, 'sent', el),
  'pay-invoice': (el) => payInvoiceModal(curP(), el.dataset.id),
  'pay-confirm': (el) => payInvoice(curP(), el.dataset.id),
  'invoice-pdf': (el) => downloadInvoicePdf(curP(), el.dataset.id),
  'statement-pdf': () => downloadStatementPdf(curP()),
  'crm-connect': () => crmConnectModal(),
  'crm-pick': (el) => { S.ui.crmPick = el.dataset.v; setPressed('[data-action="crm-pick"]', (b) => b.dataset.v === el.dataset.v); },
  'crm-on': (el) => connectCrm(el),
  'crm-off': () => { S.crm = { on: false, vendor: S.crm.vendor }; store.set(LS_KEY + ':crm', S.crm); closeModal(); render({ keepScroll: true }); toast(t('CRM déconnecté', 'CRM disconnected')); },
  'nba-offer': (el) => { const p = S.portals[el.dataset.slug]; if (!p) return; S.ui.offerDraft = { slug: p.slug, key: el.dataset.k, site: el.dataset.site || (isCorp(p) ? sitesOf(p)[0].id : ''), by: 'slev', evidence: '', when: 'p1', note: '' }; S.ui.scrollTo = 'adm-offer'; if (S.route.view === 'admin-edit' && S.route.slug === p.slug) { render({ keepScroll: true }); } },
  'offer-send': () => sendOffer(S.portals[S.route.slug]),
  'np-seg': (el) => {
    const form = $('form[data-form="new-portal"]'), keep = {};
    if (form) Array.from(form.elements).forEach((x) => { if (x.name) keep[x.name] = x.value; });
    S.ui.np = Object.assign(S.ui.np || {}, { segment: el.dataset.v });
    newPortalModal();
    const f2 = $('form[data-form="new-portal"]'); if (f2) Object.keys(keep).forEach((n) => { if (f2.elements[n]) f2.elements[n].value = keep[n]; });
  },
  'np-source': (el) => { S.ui.np = Object.assign(S.ui.np || {}, { source: el.dataset.v }); setPressed('[data-action="np-source"]', (b) => b.dataset.v === el.dataset.v); },
  'share-portal': (el) => { const p = S.portals[el.dataset.slug]; if (p) shareModal(p, false); },
  'adm-addon': (el) => { const p = S.portals[S.route.slug]; if (!p) return; p.proposal.addons = p.proposal.addons || {}; p.proposal.addons[el.dataset.k] = !isSelected(p, el.dataset.k); bumpVersion(p); log(p, `Plan ajusté : ${tx(ADD[el.dataset.k].name)} ${p.proposal.addons[el.dataset.k] ? 'ajouté' : 'retiré'} (v${p.proposal.version})`, `Proposal adjusted: ${ADD[el.dataset.k].name.en} ${p.proposal.addons[el.dataset.k] ? 'added' : 'removed'} (v${p.proposal.version})`); persist(p); render({ keepScroll: true }); },
  'adm-promo': () => { const p = S.portals[S.route.slug]; if (!p) return; p.proposal.promo = p.proposal.promo === false; bumpVersion(p); persist(p); render({ keepScroll: true }); },
  'adm-stage': (el) => {
    const p = S.portals[S.route.slug]; if (!p) return;
    if (Number(el.dataset.d) > 0) { const r = advancePortal(p); if (r) toast(t(`Étape débloquée : ${stepLabel(p.stage, p)}`, `Step unlocked: ${stepLabel(p.stage, p)}`)); }
    else stepBack(p);
    persist(p); render({ keepScroll: true });
  },
  'adm-flow': (el) => { S.ui.admFlow = FLOWS[el.dataset.v] ? el.dataset.v : 'onboarding'; store.set(LS_KEY + ':flow', S.ui.admFlow); const sec = $('#pipeline'); if (sec) { sec.outerHTML = pipelineHtml(portalList()); requestAnimationFrame(initReveal); } else render({ keepScroll: true }); },
  /* Renewal */
  'renew-rate': (el) => {
    const p = curP(), r = RN(p), v = Number(el.dataset.v);
    r.rating = v;
    if (v <= 2 && !r.callbackAt) { r.callbackAt = nowIso(); log(p, `Année notée ${v}/5 : rappel demandé avant le renouvellement`, `Year rated ${v}/5: call requested before the renewal`); }
    persist(p);
    const c = $('#rn-comment'); if (c) r.comment = c.value;
    replaceEl('rate', rateHtml(p));
    if (v >= 4) celebrate($(`[data-action="renew-rate"][data-v="${v}"]`));
  },
  'renew-reviewed': () => { const p = curP(); const c = $('#rn-comment'); if (c) RN(p).comment = c.value; renewReviewed(p); persist(p); toast(t(`Merci ! Voici votre programme ${SEASON}.`, `Thank you! Here is your ${SEASON} program.`)); location.hash = `${p.slug}-programme`; },
  'renew-accept': (el) => { const p = curP(); celebrate(el); renewAccept(p); persist(p); toast(t('Programme accepté. Un dernier coup d’œil à votre maison ?', 'Program accepted. One last look at your home?')); location.hash = `${p.slug}-ajustements`; },
  'renew-change': (el) => {
    const p = curP(), r = RN(p), v = el.dataset.v;
    let list = Array.isArray(r.changes) ? r.changes.slice() : [];
    if (list.includes(v)) list = list.filter((x) => x !== v);
    else if (v === 'none') list = ['none'];
    else list = list.filter((x) => x !== 'none').concat(v);
    r.changes = list;
    const areaChg = list.some((k) => (RENEW_CHANGES.find((x) => x.key === k) || {}).area);
    if (!areaChg && Math.abs(areaOf(p) - prevSeason(p).area) >= 1) A(p).area = prevSeason(p).area;
    persist(p);
    const box = $('#rn-changes'); if (box) box.innerHTML = renewChangesHtml(p);
    replaceEl('rn-confirm', renewConfirmHtml(p));
    const hc = $('.hero .hc'); if (hc) hc.outerHTML = heroCard(p, 3);
  },
  'renew-callback': () => { const p = curP(), r = RN(p); if (!r.callbackAt) { r.callbackAt = nowIso(); log(p, 'Rappel demandé avant le renouvellement', 'Call requested before the renewal'); persist(p); } const box = $('#rn-call'); if (box) box.innerHTML = callbackHtml(p); toast(t('C’est noté : on vous rappelle d’ici demain.', 'Noted: we will call you back by tomorrow.')); },
  'renew-confirm': (el) => {
    const p = curP(), r = RN(p);
    ['access', 'pets', 'changeNote'].forEach((k) => { const i = $(`[data-renew="${k}"]`); if (i) r[k] = i.value; });
    if (Math.abs(areaOf(p) - prevSeason(p).area) >= 50) { bumpVersion(p); log(p, `Superficie ajustée par le client : ${fmtInt(areaOf(p))} pi²`, `Area adjusted by the client: ${areaOf(p)} sq ft`); }
    celebrate(el); renewConfirm(p); persist(p);
    toast(t('Ajustements confirmés. Votre renouvellement est prêt à signer.', 'Changes confirmed. Your renewal is ready to sign.'));
    location.hash = `${p.slug}-renouvellement`;
  },
  /* Multi-year agreement */
  'term-seen': () => { const p = curP(); termSeen(p); persist(p); location.hash = `${p.slug}-bilan`; },
  'term-ack': () => { const p = curP(); termAck(p); persist(p); toast(t(`Bilan consulté. Voici le budget ${SEASON}.`, `Review viewed. Here is the ${SEASON} budget.`)); location.hash = `${p.slug}-budget`; },
  'term-report': () => downloadTermReport(curP()),
  'term-amend-pdf': () => downloadAmendPdf(curP()),
  'term-opt': (el) => {
    const p = curP(), o = termOpts(p).find((x) => x.id === el.dataset.id); if (!o || amendSigned(p)) return;
    o.on = !o.on;
    log(p, `Option ${o.on ? 'ajoutée' : 'retirée'} au budget ${SEASON} : ${tx(ADD[o.key].name).toLowerCase()}`, `Option ${o.on ? 'added to' : 'removed from'} the ${SEASON} budget: ${ADD[o.key].name.en.toLowerCase()}`);
    persist(p); refreshTermBudget(p);
  },
  'term-approve': (el) => { const p = curP(); celebrate(el); termApprove(p); persist(p); toast(t('Budget accepté. L’approbation est prête à signer.', 'Budget accepted. The approval is ready to sign.')); location.hash = `${p.slug}-approbation`; },
  'term-meet': (el) => {
    const p = curP(), tm = TM(p), slot = (tm.slots || []).find((x) => x.at === el.dataset.v); if (!slot) return;
    tm.meeting = { at: slot.at, mode: slot.mode, bookedAt: nowIso() }; S.ui.meetEdit = false;
    log(p, `Rencontre budgétaire réservée : ${fmtDateTime(slot.at)}`, `Budget meeting booked: ${fmtDateTime(slot.at)}`);
    persist(p);
    const box = $('#meet'); if (box) box.innerHTML = meetHtml(p);
    toast(t('Rencontre confirmée. L’invitation part par courriel.', 'Meeting confirmed. The invitation goes out by email.'));
  },
  'term-meet-edit': () => { const p = curP(); S.ui.meetEdit = true; const box = $('#meet'); if (box) box.innerHTML = meetHtml(p); },
  'adm-channel': (el) => { S.ui.channel = el.dataset.v; const p = S.portals[S.route.slug]; if (p) { if (S.ui.followup && S.ui.followup.slug === p.slug) S.ui.followup = null; replaceEl('adm-ai', admAiHtml(p)); } },
  'adm-gen': () => { const p = S.portals[S.route.slug]; if (p) genFollowup(p); },
  'adm-reset-all': (el) => {
    if (el.dataset.armed !== '1') { el.dataset.armed = '1'; el.lastChild.textContent = t('Confirmer la remise à zéro', 'Confirm the reset'); setTimeout(() => { if (el.isConnected) { el.dataset.armed = ''; el.lastChild.textContent = t('Réinitialiser la démo', 'Reset the demo'); } }, 3500); return; }
    resetAll(); toast(t('Démo réinitialisée', 'Demo reset')); render();
  },
};
function refreshObBits(p) {
  const pc = $('#ob-pct'); if (pc) pc.textContent = `${obProgress(p)} %`;
  const hc = $('.hero .hc'); if (hc && curStep() === 5) hc.outerHTML = heroCard(p, 5);
}
function onClick(e) {
  const pop = $('#contact-pop');
  if (pop && !pop.hidden && !e.target.closest('#contact-pop') && !e.target.closest('[data-action="toggle-contact"]')) { pop.hidden = true; const b = $('[data-action="toggle-contact"]'); if (b) b.setAttribute('aria-expanded', 'false'); }
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const fn = ACTIONS[el.dataset.action];
  if (!fn) return;
  if (el.tagName === 'BUTTON' || el.getAttribute('href') === '#') e.preventDefault();
  fn(el, e);
  requestAnimationFrame(initReveal);
}
let inputTimer = 0;
function onInput(e) {
  const el = e.target;
  if (el.dataset.q) {
    const p = curP(), a = A(p), k = el.dataset.q;
    if (el.type === 'checkbox') return;
    if (k === 'area') {
      const val = Number(el.value); a.area = val;
      el.style.setProperty('--p', `${Math.round(((val - +el.min) / (+el.max - +el.min)) * 100)}%`);
      const av = $('#area-val'); if (av) av.textContent = fmtArea(val);
      const am = $('#area-m2'); if (am) am.textContent = `≈ ${fmtInt(val / 10.764)} m²`;
      setPressed('.preset[data-k="area"]', (b) => Number(b.dataset.v) === val);
      $$('[data-area-label]').forEach((x) => { x.textContent = `≈ ${fmtArea(val)}`; });
      clearTimeout(inputTimer); inputTimer = setTimeout(() => onAnswers(p), 180);
      return;
    }
    a[k] = el.value;
    clearTimeout(inputTimer); inputTimer = setTimeout(() => onAnswers(p), 260);
    return;
  }
  if (el.dataset.visit) { const b = bookingState(curP()); b[el.dataset.visit] = el.value; return; }
  if (el.dataset.renew) {
    const p = curP(), r = RN(p), k = el.dataset.renew;
    if (k === 'area') {
      const val = Number(el.value); A(p).area = val;
      el.style.setProperty('--p', `${Math.round(((val - +el.min) / (+el.max - +el.min)) * 100)}%`);
      const av = $('#rn-area-val'); if (av) av.textContent = fmtArea(val);
      const ap = $('#rn-area-price'); if (ap) ap.textContent = `${fmtMoney(quote(p).monthly)} ${t('/ mois + tx', '/ month + tax')}`;
      clearTimeout(inputTimer); inputTimer = setTimeout(() => { persist(p); const hc = $('.hero .hc'); if (hc) hc.outerHTML = heroCard(p, 3); }, 220);
      return;
    }
    r[k] = el.value;
    clearTimeout(inputTimer); inputTimer = setTimeout(() => persist(p), 300);
    return;
  }
  if (el.id === 'am-po') { S.ui.amPo = el.value; return; }
  if (el.id === 'sig-name') { S.ui.sigName = el.value; const ty = $('#sig-typed'); if (ty) ty.textContent = el.value; return; }
  if (el.id === 'adm-search') { S.ui.q = el.value; replaceEl('kanban', kanbanHtml(portalList())); return; }
  if (el.dataset.offer === 'note') { if (S.ui.offerDraft) S.ui.offerDraft.note = el.value; return; }
}
function onChange(e) {
  const el = e.target, ch = el.dataset.change;
  if (ch === 'goto-step') { location.hash = `${curP().slug}-${el.value}`; return; }
  if (ch === 'demo-client') { switchDemoClient(el.value); return; }
  if (el.dataset.offer) { offerField(el); return; }
  if (ch === 'photo') { handlePhoto(curP(), el.files && el.files[0]); return; }
  if (ch === 'promo') { const p = curP(); p.proposal.promo = !!el.checked; persist(p); refreshStep2(p); return; }
  if (ch === 'task') { const p = curP(); p.onboarding.tasks = p.onboarding.tasks || {}; p.onboarding.tasks[el.dataset.k] = !!el.checked; persist(p); replaceEl('tasks', tasksHtml(p)); refreshObBits(p); return; }
  if (ch === 'adm-branch') { S.ui.branch = el.value; render(); return; }
  if (el.dataset.q === 'treeSick') { const p = curP(); A(p).treeSick = !!el.checked; onAnswers(p, { layout: true }); return; }
  if (el.dataset.adm) { const p = S.portals[S.route.slug]; if (p) admChange(p, el.dataset.adm, el.value); }
}
function onSubmit(e) {
  const f = e.target, kind = f.dataset && f.dataset.form;
  if (!kind) return;
  e.preventDefault();
  if (kind === 'gate') {
    const p = curP(), v = ($('#gate-code') || {}).value || '', err = $('#gate-err');
    if ($('#hanger.is-torn')) return;
    if (normCode(v) === normCode(p.code)) {
      if (err) err.textContent = '';
      S.unlocked.add(p.slug); saveUnlocked(); log(p, 'Espace ouvert par le client', 'Space opened by the client'); persist(p);
      tearPass(() => { render(); toast(t(`Bienvenue, ${firstName(p.client.first || p.client.name)}`, `Welcome, ${firstName(p.client.first || p.client.name)}`)); });
    } else {
      if (err) err.textContent = v.trim() ? t('Ce code ne correspond pas. Il est imprimé sous le code QR de votre accroche-porte.', 'This code does not match. It is printed under the QR code on your door hanger.') : t('Entrez le code imprimé sur votre accroche-porte.', 'Enter the code printed on your door hanger.');
      shakePass();
    }
    return;
  }
  if (kind === 'admin-gate') {
    const v = ($('#adm-pin') || {}).value || '', err = $('#adm-err');
    if (normCode(v) === normCode(ADMIN_PIN)) { S.adminOk = true; store.set(LS_KEY + ':admin', true); render(); }
    else if (err) err.textContent = t('Code incorrect.', 'Incorrect code.');
    return;
  }
  if (kind === 'ask') { const i = $('#ask-input'); const v = i ? i.value : ''; if (i) i.value = ''; askSend(curP(), v); return; }
  if (kind === 'new-portal') { createPortal(f); return; }
}
function bindEvents() {
  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('change', onChange);
  document.addEventListener('submit', onSubmit);
  window.addEventListener('hashchange', navigate);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if ($('#modal')) { closeModal(); return; }
    if (S.ui.askOpen) { closeAsk(); return; }
    const pop = $('#contact-pop'); if (pop && !pop.hidden) pop.hidden = true;
  });
  bindScroll();
}

/* ============ Boot ============ */
function boot() {
  document.documentElement.classList.add('js', 'is-boot');
  setTimeout(() => document.documentElement.classList.remove('is-boot'), 3000);
  loadState();
  bindEvents();
  initCaps();
  render();
}
boot();
