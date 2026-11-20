/* ============ Corporate sites ============ */
const isCorp = (p) => Array.isArray(p.sites) && p.sites.length > 0;
const sitesOf = (p) => (isCorp(p) ? p.sites : []);
const siteById = (p, id) => sitesOf(p).find((s) => s.id === id) || null;
const isReturning = (p) => !!p.since && p.since < SEASON;
const seasonsWith = (p) => (p.since ? SEASON - p.since : 0);

/* ============ Account: invoices, payments and what comes next (demo ledger, built from the file) ============ */
const TAXF = 1 + TPS + TVQ;
const withTax = (n) => round2((Number(n) || 0) * TAXF);
const taxParts = (gross) => { const sub = round2(gross / TAXF); return { sub, tps: round2(sub * TPS), tvq: round2(gross - sub - round2(sub * TPS)) }; };
function hasAccount(p) { return !!p.signature || isReturning(p); }
function payMethod(p) { return (p.account && p.account.method) || null; }
function payMethodLabel(p) {
  const m = payMethod(p);
  if (!m) return t('Aucun mode de paiement au dossier', 'No payment method on file');
  if (m.kind === 'card') return `${m.label} •••• ${m.last4}`;
  if (m.kind === 'pad') return t(`Prélèvement · ${m.label} •••• ${m.last4}`, `Pre-authorized debit · ${m.label} •••• ${m.last4}`);
  return t(`Virement (TEF) · •••• ${m.last4}`, `Transfer (EFT) · •••• ${m.last4}`);
}
const invNo = (p, key, year) => `FAC-${year}-${String(hashStr(p.slug + ':' + key) % 900000 + 100000)}`;
const monthStart = (y, m) => new Date(y, m, 1);
function ledger(p) {
  const today = new Date(); today.setHours(23, 59, 59, 0);
  const past = (d) => (parseDay(d) || new Date(8.64e15)) <= today;
  const corp = isCorp(p), manual = p.payments || {}, auto = !!(p.account && p.account.autopay);
  const items = [], upcoming = [];
  const q = quote(p), season = round2(q.season - q.discount);
  const addInv = (o) => { const inv = Object.assign({ kind: 'inv', status: 'paid' }, o); items.push(inv); return inv; };
  const addPay = (date, amount, label, ref) => items.push({ kind: 'pay', id: `pay-${ref}-${date}`, date, amount: -round2(amount), label, ref });
  const settle = (inv, autoDate) => {
    if (manual[inv.id]) { inv.status = 'paid'; inv.paidAt = manual[inv.id]; addPay(isoDay(parseDay(manual[inv.id])), inv.amount, t('Paiement reçu (espace client)', 'Payment received (client space)'), inv.no); return; }
    if (autoDate && past(autoDate)) { inv.status = 'paid'; inv.paidAt = autoDate; addPay(autoDate, inv.amount, payMethodLabel(p), inv.no); return; }
    inv.status = inv.due && past(inv.due) && daysUntil(inv.due) < 0 ? 'overdue' : 'due';
  };
  /* Multi-year agreement: last season's consolidated invoices at the agreement's amount, then the first one of the new year */
  if (isTerm(p)) {
    const tm = TM(p), sq = siteQuote(p), tot = sq.reduce((s, x) => s + x.total, 0) || 1, terms = (p.billing && p.billing.terms) || 30, n2 = sq.length;
    const part = round2(termAmount(p, PREV) / 4);
    if (tm.start <= PREV) [['-04-30', 1], ['-06-30', 2], ['-08-31', 3], ['-10-31', 4]].forEach(([md, n]) => {
      const date = `${PREV}${md}`;
      let acc = 0;
      const lines = sq.map((s, i) => { const v = i === n2 - 1 ? round2(part - acc) : round2((part * s.total) / tot); acc = round2(acc + v); return { label: `${tx(s.name)} · ${t(`visite ${n}`, `visit ${n}`)}`, amount: v }; });
      const inv = addInv({ id: `t${PREV}-${n}`, no: invNo(p, `t${PREV}-${n}`, PREV), date, year: PREV, label: t(`Facture consolidée · visite ${n}`, `Consolidated invoice · visit ${n}`), sub: t(`Entente ${tm.no} · an ${termYearNo(p, PREV)} · ${n2} ${siteNoun(p, n2)}`, `Agreement ${tm.no} · year ${termYearNo(p, PREV)} · ${n2} ${siteNoun(p, n2)}`), lines, amount: withTax(part), due: isoDay(addDays(date, terms)) });
      settle(inv, n < 4 ? isoDay(addDays(date, 26)) : null);
    });
    if (SEASON <= tm.end) upcoming.push({ date: `${SEASON}-04-30`, amount: withTax(round2(termTotal(p, SEASON) / 4)), label: t(`Facture consolidée ${SEASON} · visite 1 · an ${termYearNo(p, SEASON)}`, `${SEASON} consolidated invoice · visit 1 · year ${termYearNo(p, SEASON)}`) });
  }
  /* Year 2026 for returning clients */
  if (isReturning(p) && !isTerm(p)) {
    const h = (p.history && p.history[2026]) || {};
    if (corp) {
      const sites26 = sitesOf(p).filter((s) => (s.since || 0) <= 2026);
      [['2026-04-30', 1, []], ['2026-06-30', 2, ['rampants']], ['2026-08-31', 3, []], ['2026-10-31', 4, ['drains']]].forEach(([date, n, extra]) => {
        const lines = [];
        sites26.forEach((s) => {
          const i = sitesOf(p).indexOf(s);
          lines.push({ label: `${tx(s.name)} · ${t(`visite ${n}`, `visit ${n}`)}`, amount: round2((siteBase(s.area) / 4) * 0.96) });
          extra.forEach((k) => lines.push({ label: `${tx(s.name)} · ${tx(ADD[k].name).toLowerCase()}`, amount: round2(addonForSite(p, ADD[k], s, i) * 0.96) }));
        });
        const sub = round2(lines.reduce((t2, l) => t2 + l.amount, 0) * (1 - (Number(p.proposal.discountPct) || 0) / 100));
        const inv = addInv({ id: `c26-${n}`, no: invNo(p, 'c26-' + n, 2026), date, year: 2026, label: t(`Facture consolidée · visite ${n}`, `Consolidated invoice · visit ${n}`), sub: t(`${sites26.length} sites · BC ${p.billing ? p.billing.po.replace('2027', '2026') : ''}`, `${sites26.length} sites · PO ${p.billing ? p.billing.po.replace('2027', '2026') : ''}`), lines, discountPct: Number(p.proposal.discountPct) || 0, amount: withTax(sub), due: isoDay(addDays(date, (p.billing && p.billing.terms) || 30)) });
        settle(inv, n < 4 ? isoDay(addDays(date, 26)) : null);
      });
    } else {
      /* Last year at last year's grid: the program first, add-ons sold during the year as their own invoices */
      const ps = prevSeason(p), prog = ps.lines.filter((l) => l.kind !== 'upsell'), pd = Number(h.discountPct) || 0;
      const progGross = round2(prog.reduce((s, l) => s + l.amount, 0)), prev = round2(progGross * (1 - pd / 100));
      const r26 = prog.map((l) => ({ label: l.label, amount: l.amount }));
      if (pd) r26.push({ label: t(`Rabais de ${pd} %`, `${pd}% discount`), amount: -round2(progGross - prev) });
      const inv = addInv({ id: 'r26', no: invNo(p, 'r26', 2026), date: '2026-03-02', year: 2026, label: t('Programme Protection 2026', '2026 Protection Program'), sub: t('10 versements préautorisés, mars à décembre', '10 pre-authorized payments, March to December'), lines: r26, amount: withTax(prev), due: '2026-03-02', plan: 10 });
      const per = round2(inv.amount / 10);
      let paidSum = 0;
      for (let k = 0; k < 10; k++) {
        const dd = isoDay(monthStart(2026, 2 + k));
        if (past(dd)) { addPay(dd, k === 9 ? inv.amount - paidSum : per, `${t('Versement', 'Payment')} ${k + 1}/10 · ${payMethodLabel(p)}`, inv.no); paidSum = round2(paidSum + per); }
        else upcoming.push({ date: dd, amount: k === 9 ? round2(inv.amount - per * 9) : per, label: `${t('Versement', 'Payment')} ${k + 1}/10 · ${t('programme 2026', '2026 program')}` });
      }
      inv.status = paidSum >= inv.amount - 0.01 ? 'paid' : 'plan';
      (h.upsells || []).forEach((u, j) => {
        const a = ADD[u.key]; if (!a) return;
        const amt = round2(priceAt(a, ps.area, p.proposal.injectTrees) / (1 + GRID_UP));
        const ui = addInv({ id: `u26-${j}`, no: invNo(p, 'u26-' + j, 2026), date: u.date, year: 2026, label: tx(a.name), sub: t('Ajout recommandé par votre technicien', 'Add-on recommended by your technician'), lines: [{ label: tx(a.name), amount: amt }], amount: withTax(amt), due: u.date });
        settle(ui, isoDay(addDays(u.date, 1)));
      });
    }
  }
  /* Year 2027, once the agreement is signed */
  if (p.signature && !isTerm(p)) {
    const sd = isoDay(parseDay(p.signature.signedAt));
    if (corp) {
      upcoming.push({ date: '2026-12-31', amount: null, label: t(`Prochaine facture consolidée · visite de décembre, ${sitesOf(p).length} sites`, `Next consolidated invoice · December visit, ${sitesOf(p).length} sites`) });
    } else {
      if (p.proposal.promo !== false) {
        const fi = addInv({ id: 'f26', no: invNo(p, 'f26', 2026), date: sd, year: 2026, label: t('Intervention initiale, automne 2026', 'First treatment, fall 2026'), sub: t('Offre en cours, dès la signature', 'Current offer, right after signing'), lines: [{ label: t('Intervention initiale', 'First treatment'), amount: PROMO_PRICE }], amount: withTax(PROMO_PRICE), due: sd });
        settle(fi, auto ? isoDay(addDays(sd, 1)) : null);
      }
      const lines = q.lines.map((l) => ({ label: l.label, amount: l.amount }));
      if (q.discount) lines.push({ label: discLabel(p, q), amount: -q.discount });
      const pi = addInv({ id: 'p27', no: invNo(p, 'p27', 2027), date: sd, year: 2027, label: t(`Programme Protection ${SEASON}`, `${SEASON} Protection Program`), sub: t(`Entente ${docId(p)} · 12 versements préautorisés`, `Agreement ${docId(p)} · 12 pre-authorized payments`), lines, amount: withTax(season), due: sd, plan: 12 });
      const per = round2(pi.amount / 12);
      const sdd = parseDay(sd), startYear = isReturning(p) ? 2027 : sdd.getFullYear(), startMonth = isReturning(p) ? 0 : sdd.getMonth() + 1;
      let paidSum = 0;
      for (let k = 0; k < 12; k++) {
        const dd = isoDay(monthStart(startYear, startMonth + k)), amt = k === 11 ? round2(pi.amount - per * 11) : per;
        if (past(dd)) { addPay(dd, amt, `${t('Versement', 'Payment')} ${k + 1}/12 · ${payMethodLabel(p)}`, pi.no); paidSum = round2(paidSum + amt); }
        else upcoming.push({ date: dd, amount: amt, label: `${t('Versement', 'Payment')} ${k + 1}/12 · ${t(`programme ${SEASON}`, `${SEASON} program`)}` });
      }
      pi.status = paidSum >= pi.amount - 0.01 ? 'paid' : 'plan';
    }
  }
  /* Accepted expert recommendations: billed after the service */
  (p.offers || []).filter((o) => o.status === 'accepted').forEach((o) => {
    upcoming.push({ date: null, amount: withTax(offerAmount(p, o)), label: `${offerTitle(o)} · ${t('facturé après le service', 'billed after the service')}`, when: o.when ? tx(o.when) : '', offer: o.id });
  });
  items.sort((x, y) => (x.date === y.date ? (x.kind === 'inv' ? -1 : 1) : String(x.date).localeCompare(String(y.date))));
  let run = 0;
  items.forEach((e) => { run = round2(run + e.amount); e.balance = run; });
  upcoming.sort((x, y) => String(x.date || '9999').localeCompare(String(y.date || '9999')));
  const invoices = items.filter((e) => e.kind === 'inv').reverse();
  const open = invoices.filter((e) => e.status === 'due' || e.status === 'overdue');
  const dueNow = round2(open.reduce((s, e) => s + e.amount, 0));
  const aging = { current: 0, d30: 0, d60: 0, d90: 0 };
  open.forEach((e) => { const late = -(daysUntil(e.due) || 0); if (late <= 0) aging.current += e.amount; else if (late <= 30) aging.d30 += e.amount; else if (late <= 60) aging.d60 += e.amount; else aging.d90 += e.amount; });
  const nextPay = upcoming.find((u) => u.date && u.amount);
  return { items, invoices, open, dueNow, balance: run, upcoming, nextPay, aging, plan: round2(upcoming.filter((u) => u.date && u.amount).reduce((s, u) => s + u.amount, 0)) };
}
const invStatusTag = (e) => ({
  paid: `<span class="tag tag--ok">${t('Payée', 'Paid')}</span>`,
  plan: `<span class="tag tag--info">${t('Plan de paiement', 'Payment plan')}</span>`,
  due: `<span class="tag tag--warn">${t('À payer', 'Due')}</span>`,
  overdue: `<span class="tag tag--alert">${t('En retard', 'Overdue')}</span>`,
}[e.status] || '');

/* ============ Expert recommendations sent during the year ============ */
const offerTitle = (o) => (o.title ? tx(o.title) : ADD[o.key] ? tx(ADD[o.key].name) : '—');
function offerAmount(p, o) {
  if (o.amount != null) return Number(o.amount) || 0;
  const a = ADD[o.key]; if (!a) return 0;
  if (isCorp(p) && o.site) { const i = sitesOf(p).findIndex((s) => s.id === o.site); if (i >= 0) return addonForSite(p, a, sitesOf(p)[i], i); }
  return addonAmount(p, a);
}
const offerBy = (o) => EXPERT[o.by] || EXPERTS[0];
const pendingOffers = (p) => (p.offers || []).filter((o) => o.status === 'sent');
function offerStats(list) {
  const all = list.flatMap((p) => (p.offers || []).map((o) => ({ p, o })));
  const acc = all.filter((x) => x.o.status === 'accepted'), sent = all.filter((x) => x.o.status === 'sent');
  const decided = all.filter((x) => x.o.status !== 'sent').length;
  return { all, acc, sent, rate: decided ? Math.round((acc.length / decided) * 100) : 0, revenue: round2(acc.reduce((s, x) => s + offerAmount(x.p, x.o), 0)), open: round2(sent.reduce((s, x) => s + offerAmount(x.p, x.o), 0)) };
}

/* ============ CRM connection (demo) ============ */
function crmOn() { return !!(S.crm && S.crm.on); }
function crmName() { const c = CRMS.find((x) => x.key === (S.crm && S.crm.vendor)); return c ? c.name : 'CRM'; }
function crmOf(p) {
  const r = (S.crmData || {})[p.slug];
  if (r) return r;
  const win = clamp(40 + p.stage * 9 + (hashStr(p.slug) % 12), 20, 95);
  return { since: p.since || null, seasons: seasonsWith(p), ltv: 0, score: p.stage >= 5 || isReturning(p) ? { renew: clamp(70 + (hashStr(p.slug) % 25), 0, 99), upsell: 40 + (hashStr(p.slug + 'u') % 40), churn: 5 + (hashStr(p.slug + 'c') % 15) } : { win },
    best: { fr: 'Texto, en soirée', en: 'Text, in the evening' }, events: (p.activity || []).slice(0, 3).map((e) => ({ at: e.at, kind: 'note', fr: e.fr, en: e.en })), insight: null, nba: null };
}
const NBA_ICON = { call: 'phone', offer: 'sparkle', followup: 'send', task: 'flag', visit: 'calendar', discount: 'shield', invoice: 'alert' };
/* Next best actions: the CRM's own suggestions, plus what the portal sees happening in each file */
function nbaList(list) {
  const out = [];
  list.forEach((p) => {
    const c = (S.crmData || {})[p.slug];
    if (c && c.nba) out.push({ p, ...c.nba, src: 'crm' });
    pendingOffers(p).forEach((o) => { const age = -(daysUntil(o.at) || 0); if (age >= 2 && !(c && c.nba && c.nba.kind === 'followup')) out.push({ p, kind: 'followup', prio: 2, src: 'portal', fr: `Recommandation « ${offerTitle(o)} » sans réponse depuis ${age} jours : courte relance.`, en: `“${offerTitle(o)}” recommendation unanswered for ${age} days: short reminder.` }); });
    if (hasAccount(p)) { const L = ledger(p); if (L.dueNow > 0) out.push({ p, kind: 'invoice', prio: L.open.some((e) => e.status === 'overdue') ? 1 : 3, src: 'portal', fr: `${fmtMoney(L.dueNow)} à recevoir (${L.open.map((e) => e.no).join(', ')}).`, en: `${fmtMoney(L.dueNow)} receivable (${L.open.map((e) => e.no).join(', ')}).` }); }
    if (isRenewal(p)) {
      const dl = renewDaysLeft(p);
      if (!p.signature && dl <= 14 && !(c && c.nba)) out.push({ p, kind: 'followup', prio: dl <= 7 ? 1 : 2, src: 'portal', fr: `Prix fidélité : plus que ${dl} jours pour renouveler (étape ${p.stage} sur 5).`, en: `Loyalty price: ${dl} days left to renew (step ${p.stage} of 5).` });
      else if (p.stage === 4 && !p.signature && !(c && c.nba)) out.push({ p, kind: 'followup', prio: 2, src: 'portal', fr: 'Renouvellement prêt, pas encore signé : rappel avec le lien.', en: 'Renewal ready, not signed yet: reminder with the link.' });
    } else if (isTerm(p)) {
      if (p.stage === 4 && !amendSigned(p) && !(c && c.nba)) out.push({ p, kind: 'followup', prio: 2, src: 'portal', fr: `Budget ${SEASON} accepté, avenant pas encore signé : rappel avant le conseil.`, en: `${SEASON} budget accepted, amendment not signed yet: reminder before the board meeting.` });
    } else if (p.stage === 4 && !p.signature && !(c && c.nba)) out.push({ p, kind: 'followup', prio: 2, src: 'portal', fr: 'Entente prête, pas encore signée : rappel avec le lien.', en: 'Agreement ready, not signed yet: reminder with the link.' });
  });
  return out.sort((a, b) => a.prio - b.prio).slice(0, 7);
}
/* What a connected CRM lets the portal tell the client about their own history */
function clientInsights(p) {
  if (!crmOn()) return [];
  const out = [];
  if (p.slug === 'nordelys') {
    out.push({ icon: 'shield', fr: 'Votre année 2026 : aucune non-conformité à l’audit HACCP, 312 vérifications de stations notées, et chaque appel de service réglé en moins de 4 h.', en: 'Your 2026: no HACCP audit finding, 312 station checks logged, and every service call solved within 4 h.' });
    out.push({ icon: 'building', fr: 'La boulangerie de Terrebonne s’ajoute en 2027 : elle entre dans la tournée de Laval, sans frais de déplacement.', en: 'The Terrebonne bakery joins in 2027: it goes on the Laval route, with no travel fee.' });
  } else if (p.slug === 'simard') {
    out.push({ icon: 'sun', fr: 'En août 2026, des guêpes sont revenues sous la galerie malgré le bouclier. Cette année, on retire les nids en prévention, dès le début de l’été.', en: 'In August 2026, wasps came back under the porch despite the shield. This year, nests are removed as a preventive at the start of summer.' });
    out.push({ icon: 'shield', fr: `Votre ${seasonsWith(p)}e année avec nous : merci ! Votre fidélité vous donne 10 % sur tout ajout cette année.`, en: `Your ${seasonsWith(p)}th year with us: thank you! Your loyalty gets you 10% off any add-on this year.` });
  } else if (p.slug === 'bergeron') {
    out.push({ icon: 'home', fr: 'Cet automne, quatre maisons de votre secteur à Lévis ont eu des souris. La vôtre, aucune : l’exclusion de 2025 tient toujours.', en: 'This fall, four homes in your part of Lévis had mice. Yours had none: the 2025 exclusion still holds.' });
    out.push({ icon: 'shield', fr: `Votre ${ordinal(seasonNo(p), true)} année avec nous : le prix fidélité s’applique à tout le programme, ajouts en cours d’année compris.`, en: `Your ${ordinal(seasonNo(p))} year with us: the loyalty price applies to the whole program, add-ons during the year included.` });
  } else if (p.slug === 'riverain') {
    out.push({ icon: 'alert', fr: 'Des travaux d’égout commencent en avril sur le boulevard Marie-Victorin : les rats se déplacent pendant les chantiers. Le Riverain II est dans le périmètre.', en: 'Sewer work starts on boulevard Marie-Victorin in April: rats move around during construction. Le Riverain II is inside the perimeter.' });
    out.push({ icon: 'building', fr: 'Vos rapports d’intervention sont classés par immeuble : votre conseil d’administration les retrouve d’une année à l’autre.', en: 'Your intervention reports are filed by building: your board finds them from one year to the next.' });
  } else if (p.slug === 'tremblay' || p.slug === 'gagnon' || p.slug === 'nguyen') {
    out.push({ icon: 'users', fr: `${2 + (hashStr(p.slug) % 4)} voisins de votre rue sont déjà protégés par MBM : les visites se font le même jour, et vous profitez du rabais voisin.`, en: `${2 + (hashStr(p.slug) % 4)} neighbours on your street are already protected by MBM: visits happen the same day, and you get the neighbour discount.` });
  } else if (hasAccount(p)) {
    out.push({ icon: 'leaf', fr: 'Vos rapports de visite et votre historique sont synchronisés : votre conseiller voit la même chose que vous.', en: 'Your visit reports and history are synced: your advisor sees the same thing you do.' });
  }
  return out;
}
