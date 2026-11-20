/* ============ Navigation and motion ============ */
const reduceMotion = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
function navigate() {
  if (document.startViewTransition && !reduceMotion() && !rendering) {
    /* A transition can be cut short (the viewport changes, another navigation starts): that is not an error */
    try { const vt = document.startViewTransition(() => render()); ['ready', 'finished', 'updateCallbackDone'].forEach((k) => { if (vt && vt[k]) vt[k].catch(() => {}); }); return; } catch (e) { /* fall back */ }
  }
  render();
}
function afterRender() {
  requestAnimationFrame(() => { initReveal(); countUp(); });
}
/* A fresh screen (new route) plays its entrance once; re-renders of the same screen stay still */
function markEntering(key) {
  const fresh = key !== S.ui.viewKey, html = document.documentElement;
  S.ui.viewKey = key;
  clearTimeout(S.ui.enterT);
  if (fresh && !reduceMotion()) { html.classList.add('is-fresh'); S.ui.enterT = setTimeout(() => html.classList.remove('is-fresh'), 3300); }
  else html.classList.remove('is-fresh');
  return fresh;
}
/* Titles rise word by word, each word out of its own mask. Punctuation stays glued to the word before it. */
const PUNCT_RE = /^[.,;:!?…»)]+$/;
function splitWords(el) {
  if (!el || el.dataset.split) return;
  el.dataset.split = '1';
  let i = 0;
  const walk = (node) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 1) { if (n.tagName !== 'BR') walk(n); return; }
      if (n.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/([ \n\t]+)/).forEach((tok) => {
        if (!tok) return;
        if (/^[ \n\t]+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
        if (PUNCT_RE.test(tok)) { const sp = document.createElement('span'); sp.className = 'wp'; sp.style.setProperty('--i', i); sp.textContent = tok; frag.appendChild(sp); return; }
        tok.replace(/-(?=.)/g, '-\u0000').split('\u0000').forEach((part) => {
          const w = document.createElement('span'), sp = document.createElement('span');
          w.className = 'w'; sp.textContent = part; sp.style.setProperty('--i', i++);
          w.appendChild(sp); frag.appendChild(w);
        });
      });
      n.replaceWith(frag);
    });
  };
  walk(el);
}
function splitTitles(root) { $$('.hero .display, .arrive__title, .section-head .h2', root).forEach(splitWords); }
/* Arrival door hanger: it sways a little on the handle as the pointer moves (fine pointers, motion allowed) */
function initPass() {
  const stage = $('.arrive'), sway = $('#sway');
  if (!stage || !sway || reduceMotion() || !window.matchMedia('(pointer: fine)').matches) return;
  let raf = 0;
  stage.addEventListener('pointermove', (e) => {
    if (sway.classList.contains('is-off')) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = sway.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, ((e.clientX - (r.left + r.width / 2)) / Math.max(r.width, 1)) * 1.2));
      sway.classList.add('is-live');
      sway.style.transform = `rotate(${(x * -1.6).toFixed(2)}deg)`;
    });
  });
  stage.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); sway.classList.remove('is-live'); sway.style.transform = ''; });
}
/* The right code: the perforation lights up, the coupon tears off, the hanger swings, then the light comes on */
function tearPass(done) {
  const hanger = $('#hanger'), sway = $('#sway'), stage = $('.arrive');
  if (!hanger || reduceMotion()) { done(); return; }
  if (sway) { sway.classList.add('is-off'); sway.classList.remove('is-live', 'is-shake'); sway.style.transform = ''; void sway.offsetWidth; sway.classList.add('is-swing'); }
  ['detail', 'maison'].forEach((n) => { const im = new Image(); im.src = asset(`assets/${n}.webp`); if (im.decode) im.decode().catch(() => {}); });
  hanger.classList.add('is-torn');
  setTimeout(() => { if (stage) stage.classList.add('is-leaving'); }, 700);
  setTimeout(done, 1650);
}
/* A wrong code: the hanger wobbles on the handle */
function shakePass() {
  const sway = $('#sway'); if (!sway || reduceMotion()) return;
  sway.classList.remove('is-shake'); sway.style.transform = ''; void sway.offsetWidth; sway.classList.add('is-shake');
}
/* Header gains a hairline once the page scrolls; the hero photo drifts a little slower than the page */
let scrollBound = false, scrollTick = false;
function syncScroll() {
  const y = window.scrollY || 0;
  const h = $('.phead') || $('.adm__top'); if (h) h.classList.toggle('is-scrolled', y > 6);
  const img = $('.hero__img'); if (img && !reduceMotion()) img.style.setProperty('--px', Math.min(y * 0.06, 22).toFixed(1) + 'px');
}
function bindScroll() {
  if (scrollBound) return; scrollBound = true;
  window.addEventListener('scroll', () => { if (scrollTick) return; scrollTick = true; requestAnimationFrame(() => { scrollTick = false; syncScroll(); }); }, { passive: true });
}
let revealIO = null;
function initReveal() {
  const els = $$('.reveal:not(.is-in)');
  if (!els.length) return;
  if (!('IntersectionObserver' in window) || reduceMotion()) { els.forEach((e) => e.classList.add('is-in')); return; }
  if (!revealIO) revealIO = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  els.forEach((e) => revealIO.observe(e));
}
function countUp() {
  $$('[data-count]').forEach((el) => {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    const to = Number(el.dataset.count) || 0, fmt = el.dataset.fmt;
    const f = (v) => (fmt === 'money' ? fmtMoney(v) : fmt === 'int' ? fmtInt(v) : String(Math.round(v)));
    if (reduceMotion() || !to) { el.textContent = f(to); return; }
    const t0 = performance.now(), dur = 950;
    const tick = (now) => { const q = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - q, 3); el.textContent = f(to * e); if (q < 1) requestAnimationFrame(tick); else el.textContent = f(to); };
    requestAnimationFrame(tick);
  });
}
/* A small burst of leaves when the client says yes */
function celebrate(el) {
  if (!el || reduceMotion()) return;
  const r = el.getBoundingClientRect(), host = document.createElement('div');
  host.className = 'burst'; host.style.left = `${r.left + r.width / 2}px`; host.style.top = `${r.top + r.height / 2}px`;
  const colors = ['#56AE34', '#84CC16', '#A3E635', '#2D6B1C', '#E3B21F'];
  for (let i = 0; i < 16; i++) {
    const s = document.createElement('i'), a = (i / 16) * Math.PI * 2 + Math.random() * 0.4, d = 46 + Math.random() * 54;
    s.style.setProperty('--x', `${Math.cos(a) * d}px`); s.style.setProperty('--y', `${Math.sin(a) * d - 20}px`); s.style.setProperty('--r', `${Math.round(Math.random() * 360)}deg`);
    s.style.background = colors[i % colors.length]; host.appendChild(s);
  }
  document.body.appendChild(host);
  setTimeout(() => host.remove(), 1100);
}

/* ============ Demo examples ============ */
function switchDemoClient(slug) {
  if (!S.portals[slug]) return;
  S.unlocked.add(slug); saveUnlocked();
  if (location.hash === `#${slug}`) render(); else location.hash = slug;
}

/* ============ Expert recommendations ============ */
function decideOffer(p, id, status, el) {
  const o = (p.offers || []).find((x) => x.id === id); if (!o) return;
  if (status === 'accepted') { o.amount = offerAmount(p, o); log(p, `Recommandation acceptée en ligne : ${offerTitle(o)}`, `Recommendation accepted online: ${ADD[o.key] ? ADD[o.key].name.en : offerTitle(o)}`); }
  else if (status === 'declined') log(p, `Recommandation refusée : ${offerTitle(o)}`, `Recommendation declined: ${ADD[o.key] ? ADD[o.key].name.en : offerTitle(o)}`);
  o.status = status; o.decidedAt = status === 'sent' ? null : nowIso();
  persist(p);
  if (status === 'accepted') celebrate(el);
  $$(`#offer-${CSS.escape(id)}`).forEach((card) => { card.outerHTML = offerCardHtml(p, o); });
  refreshHeader(p);
  const tl = $('#saison-5 .tl'); if (tl) tl.innerHTML = timelineHtml(p, true);
  toast(status === 'accepted' ? t(`C’est ajouté à votre plan. ${firstName(offerBy(o).name)} est avisé.`, `Added to your plan. ${firstName(offerBy(o).name)} has been notified.`) : status === 'declined' ? t('Noté. On vous la proposera seulement si le besoin revient.', 'Noted. We will only suggest it again if the need comes back.') : t('Recommandation rouverte', 'Recommendation reopened'));
}
function offerField(el) {
  const p = S.portals[S.route.slug]; if (!p || !S.ui.offerDraft) return;
  S.ui.offerDraft[el.dataset.offer] = el.value;
  const amt = $('#of-amt'); if (amt) amt.textContent = fmtMoney(offerAmount(p, { key: S.ui.offerDraft.key, site: S.ui.offerDraft.site || null }));
}
const WHEN_TXT = { p1: ['Avec la visite 1, printemps 2027', 'With visit 1, spring 2027'], p2: ['Visite 2, début d’été 2027', 'Visit 2, early summer 2027'], p3: ['Visite 3, fin d’été 2027', 'Visit 3, late summer 2027'], p4: ['Visite 4, automne 2027', 'Visit 4, fall 2027'], now: ['Dès que possible', 'As soon as possible'] };
function sendOffer(p) {
  if (!p || !S.ui.offerDraft) return;
  const f = S.ui.offerDraft, a = ADD[f.key]; if (!a) return;
  const note = String(f.note || '').trim();
  const site = f.site ? siteById(p, f.site) : null;
  const w = WHEN_TXT[f.when] || WHEN_TXT.now;
  const o = { id: `of-${Date.now().toString(36)}`, key: f.key, site: site ? site.id : null, by: f.by || 'jroy', at: nowIso(), status: 'sent', evidence: f.evidence || ((PROBLEMS.find((pr) => pr.addon === a.key) || {}).key || ''),
    note: note ? { fr: note, en: note } : { fr: `Recommandé après observation chez vous${site ? ` (${tx(site.name)})` : ''} : ${tx(a.desc).charAt(0).toLowerCase()}${tx(a.desc).slice(1)}`, en: `Recommended after looking at your property${site ? ` (${site.name.en})` : ''}: ${a.desc.en.charAt(0).toLowerCase()}${a.desc.en.slice(1)}` },
    when: { fr: w[0] + (site ? ` · ${site.name.fr.toLowerCase()}` : ''), en: w[1] + (site ? ` · ${site.name.en.toLowerCase()}` : '') } };
  o.amount = offerAmount(p, o);
  p.offers.push(o);
  log(p, `Recommandation envoyée par ${offerBy(o).name} : ${tx(a.name).toLowerCase()}`, `Recommendation sent by ${offerBy(o).name}: ${a.name.en.toLowerCase()}`);
  persist(p);
  S.ui.offerDraft = null;
  render({ keepScroll: true });
  toast(t(`Envoyée à ${householdOf(p)} : elle apparaît dans son portail.`, `Sent to ${householdOf(p)}: it shows up in their portal.`));
}

/* ============ Payments (demo: uses the method on file, nothing is charged) ============ */
function payInvoiceModal(p, id) {
  const L = ledger(p), e = L.invoices.find((x) => x.id === id); if (!e) return;
  openModal(`<div class="modal__head"><div class="stack" style="gap:4px"><p class="eyebrow">${t('Paiement', 'Payment')} · ${esc(e.no)}</p><h2 class="h3">${esc(e.label)}</h2></div><button class="iconbtn" data-action="close-modal" aria-label="${t('Fermer', 'Close')}">${icon('x')}</button></div>
    <div class="paysum"><span>${t('Montant', 'Amount')}</span><b class="num">${fmtMoney(e.amount)}</b></div>
    <div class="paycard paycard--lg ${payMethod(p) ? `paycard--${payMethod(p).kind}` : ''}">${icon(payMethod(p) && payMethod(p).kind === 'card' ? 'card' : 'building')}<div class="stack" style="gap:2px"><b>${esc(payMethodLabel(p))}</b><span class="small">${t('Mode de paiement au dossier', 'Payment method on file')}</span></div></div>
    <button class="btn btn--green btn--block" data-action="pay-confirm" data-id="${esc(e.id)}">${icon('check')}${t(`Payer ${fmtMoney(e.amount)}`, `Pay ${fmtMoney(e.amount)}`)}</button>
    <p class="tiny" style="margin:0">${t('Démonstration : aucun montant n’est prélevé. En production, le paiement passe par le fournisseur de paiement de MBM.', 'Demo: nothing is charged. In production, payment goes through MBM’s payment provider.')}</p>`);
}
function payInvoice(p, id) {
  const L = ledger(p), e = L.invoices.find((x) => x.id === id); if (!e) return;
  p.payments = p.payments || {}; p.payments[id] = nowIso();
  log(p, `Paiement reçu en ligne : ${e.no} (${fmtMoney(e.amount)})`, `Payment received online: ${e.no} (${fmtMoney(e.amount)})`);
  persist(p);
  const btn = $(`[data-action="pay-confirm"][data-id="${CSS.escape(id)}"]`);
  celebrate(btn);
  closeModal();
  render({ keepScroll: true });
  toast(t('Paiement reçu. Merci !', 'Payment received. Thank you!'));
}

/* ============ CRM connection ============ */
function connectCrm(btn) {
  const vendor = S.ui.crmPick || (S.crm && S.crm.vendor) || 'salesforce';
  if (btn) { btn.disabled = true; btn.innerHTML = `${icon('refresh', 'spin')}${t('Synchronisation…', 'Syncing…')}`; }
  setTimeout(() => {
    S.crm = { on: true, vendor, at: nowIso() };
    store.set(LS_KEY + ':crm', S.crm);
    closeModal();
    render({ keepScroll: true });
    toast(t(`Connecté à ${crmName()} : ${S.order.length} dossiers synchronisés`, `Connected to ${crmName()}: ${S.order.length} files synced`));
  }, 1100);
}

/* ============ Invoice and statement PDFs ============ */
function pdfHeader(doc, p, title, metaLines, whoLabel) {
  const W = doc.internal.pageSize.getWidth(), m = 52;
  doc.setFillColor(11, 43, 60); doc.rect(0, 0, W, 86, 'F'); doc.setFillColor(0, 174, 239); doc.rect(0, 86, W, 3, 'F');
  try { doc.addImage(LOGO_WM, 'PNG', m, 22, 120, 42, 'mbm-logo', 'FAST'); } catch (e) { /* ignore */ }
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
  doc.text(pdfText(title), W - m, 46, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text(pdfText(`MBM Gestion parasitaire · ${officeOf(p.branch)} · ${t('ligne 24/7', '24/7 line')} ${MBM_LINE}`), W - m, 62, { align: 'right' });
  let y = 118;
  doc.setTextColor(93, 107, 117); doc.setFontSize(8.5); doc.text(pdfText((whoLabel || t('FACTURÉ À', 'BILLED TO')).toUpperCase()), m, y);
  doc.setTextColor(11, 27, 38); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text(pdfText(p.client.name), m, y + 15);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
  const who = [isOrg(p) && p.client.first ? `${p.client.first} ${p.client.last}` : '', `${p.client.address}, ${p.client.city}`, isCorp(p) && p.billing ? p.billing.ap : (p.client.email || '')].filter(Boolean);
  who.forEach((l, i) => doc.text(pdfText(l), m, y + 30 + i * 13));
  metaLines.forEach(([k, v], i) => { doc.setTextColor(93, 107, 117); doc.text(pdfText(k), W - m - 150, y + i * 15); doc.setTextColor(11, 27, 38); doc.text(pdfText(v), W - m, y + i * 15, { align: 'right' }); });
  return Math.max(y + 30 + who.length * 13, y + metaLines.length * 15) + 26;
}
function downloadInvoicePdf(p, id) {
  if (!window.jspdf || !window.jspdf.jsPDF) { toast(t('Le PDF n’est pas disponible ici', 'The PDF is not available here')); return; }
  const L = ledger(p), e = L.invoices.find((x) => x.id === id); if (!e) return;
  const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'letter' }), W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), m = 52;
  const meta = [[t('Facture', 'Invoice'), e.no], [t('Date', 'Date'), fmtDate(e.date)], [t('Échéance', 'Due'), fmtDate(e.due || e.date)]];
  if (isCorp(p) && p.billing) meta.push([t('Bon de commande', 'Purchase order'), e.year === 2026 ? p.billing.po.replace('2027', '2026') : p.billing.po], [t('Modalités', 'Terms'), t(`Net ${p.billing.terms} jours`, `Net ${p.billing.terms} days`)]);
  let y = pdfHeader(doc, p, t('FACTURE', 'INVOICE'), meta);
  doc.setDrawColor(11, 27, 38); doc.setLineWidth(1.2); doc.line(m, y, W - m, y); y += 18;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(11, 27, 38); doc.text(pdfText(e.label), m, y); y += 14;
  if (e.sub) { doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(93, 107, 117); doc.text(pdfText(e.sub), m, y); y += 18; }
  doc.setFontSize(10); doc.setTextColor(11, 27, 38);
  const lines = (e.lines || []).slice();
  if (e.discountPct) { const gross = lines.reduce((s2, l) => s2 + l.amount, 0); lines.push({ label: t(`Rabais multisite ${e.discountPct} %`, `${e.discountPct}% multi-site discount`), amount: -round2((gross * e.discountPct) / 100) }); }
  lines.forEach((l) => { if (y > H - 170) { doc.addPage(); y = m; } doc.setFont('helvetica', 'normal'); doc.text(doc.splitTextToSize(pdfText(l.label), W - m * 2 - 120)[0], m, y); doc.text(pdfText(l.amount < 0 ? `- ${fmtMoney(-l.amount)}` : fmtMoney(l.amount)), W - m, y, { align: 'right' }); y += 17; });
  const tp = taxParts(e.amount);
  y += 4; doc.setDrawColor(221, 229, 234); doc.setLineWidth(.8); doc.line(W - m - 230, y, W - m, y); y += 16;
  [[t('Sous-total', 'Subtotal'), tp.sub], [t('TPS (5 %)', 'GST (5%)'), tp.tps], [t('TVQ (9,975 %)', 'QST (9.975%)'), tp.tvq]].forEach(([k, v]) => { doc.setTextColor(93, 107, 117); doc.text(pdfText(k), W - m - 230, y); doc.setTextColor(11, 27, 38); doc.text(pdfText(fmtMoney(v)), W - m, y, { align: 'right' }); y += 16; });
  doc.setLineWidth(1.4); doc.setDrawColor(11, 27, 38); doc.line(W - m - 230, y - 4, W - m, y - 4); y += 12;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text(pdfText(t('Total', 'Total')), W - m - 230, y); doc.text(pdfText(fmtMoney(e.amount)), W - m, y, { align: 'right' }); y += 34;
  const paid = e.status === 'paid';
  doc.setFillColor(...(paid ? [228, 244, 234] : e.status === 'plan' ? [220, 231, 241] : [247, 233, 198])); doc.roundedRect(m, y, W - m * 2, 40, 8, 8, 'F');
  doc.setTextColor(...(paid ? [14, 122, 62] : e.status === 'plan' ? [44, 91, 132] : [133, 86, 0])); doc.setFontSize(11);
  doc.text(pdfText(paid ? t(`PAYÉE${e.paidAt ? ` LE ${fmtDate(e.paidAt).toUpperCase()}` : ''}`, `PAID${e.paidAt ? ` ON ${fmtDate(e.paidAt).toUpperCase()}` : ''}`) : e.status === 'plan' ? t(`PAYABLE EN ${e.plan} VERSEMENTS PRÉAUTORISÉS`, `PAYABLE IN ${e.plan} PRE-AUTHORIZED PAYMENTS`) : t(`À PAYER AVANT LE ${fmtDate(e.due).toUpperCase()}`, `DUE BY ${fmtDate(e.due).toUpperCase()}`)), m + 16, y + 25);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(93, 107, 117);
  doc.text(pdfText(`${t('Mode de paiement', 'Payment method')} : ${payMethodLabel(p)}`), m, y + 64);
  doc.setFontSize(8); doc.text(pdfText(t('Document de démonstration préparé par Winnia pour MBM Gestion parasitaire. Client, montants et numéros fictifs.', 'Demo document prepared by Winnia for MBM Gestion parasitaire. Fictional client, amounts and numbers.')), m, H - 30);
  saveFile(`facture-${e.no}.pdf`, doc.output('blob'), 'application/pdf');
}
function downloadStatementPdf(p) {
  if (!window.jspdf || !window.jspdf.jsPDF) { toast(t('Le PDF n’est pas disponible ici', 'The PDF is not available here')); return; }
  const L = ledger(p), doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'letter' }), W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), m = 52;
  let y = pdfHeader(doc, p, t('ÉTAT DE COMPTE', 'STATEMENT'), [[t('Date', 'Date'), fmtDate(new Date())], [t('Solde', 'Balance'), fmtMoney(L.balance)], [t('Exigible', 'Due now'), fmtMoney(L.dueNow)]]);
  const cols = [m, m + 82, W - m - 190, W - m - 100, W - m];
  const head = () => { doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(93, 107, 117); [t('DATE', 'DATE'), t('OPÉRATION', 'TRANSACTION')].forEach((h, i) => doc.text(pdfText(h), cols[i], y)); [t('DÉBIT', 'CHARGE'), t('CRÉDIT', 'CREDIT'), t('SOLDE', 'BALANCE')].forEach((h, i) => doc.text(pdfText(h), cols[i + 2] + (i === 2 ? 0 : 0), y, { align: 'right' })); y += 8; doc.setDrawColor(11, 27, 38); doc.line(m, y, W - m, y); y += 16; };
  head();
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(11, 27, 38);
  L.items.forEach((e) => {
    if (y > H - 70) { doc.addPage(); y = m; head(); doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(11, 27, 38); }
    doc.text(pdfText(fmtDate(e.date, { day: 'numeric', month: 'short', year: 'numeric' })), cols[0], y);
    doc.text(doc.splitTextToSize(pdfText(e.kind === 'inv' ? `${e.no} · ${e.label}` : e.label), cols[2] - cols[1] - 70)[0], cols[1], y);
    if (e.amount > 0) doc.text(pdfText(fmtMoney(e.amount)), cols[2], y, { align: 'right' });
    if (e.amount < 0) doc.text(pdfText(fmtMoney(-e.amount)), cols[3], y, { align: 'right' });
    doc.text(pdfText(fmtMoney(e.balance)), cols[4], y, { align: 'right' });
    y += 16;
  });
  doc.setFontSize(8); doc.setTextColor(93, 107, 117); doc.text(pdfText(t('Document de démonstration préparé par Winnia pour MBM Gestion parasitaire. Données fictives.', 'Demo document prepared by Winnia for MBM Gestion parasitaire. Fictional data.')), m, H - 30);
  saveFile(`etat-de-compte-mbm-${p.slug}.pdf`, doc.output('blob'), 'application/pdf');
}
