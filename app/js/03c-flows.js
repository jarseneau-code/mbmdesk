/* ============ Annual renewal: loyalty price, last year against the next one, what the technician saw ============ */
const RN = (p) => p.renewal || (p.renewal = {});
const seasonNo = (p) => (p.since ? SEASON - p.since + 1 : 1);
function renewDeadline(p) { return RN(p).deadline || isoDay(addDays(new Date(), 21)); }
function renewDaysLeft(p) { return Math.max(0, daysUntil(renewDeadline(p)) || 0); }
function priceAt(a, area, trees) {
  if (!a) return 0;
  if (a.price.perUnit) return a.price.perUnit * Math.max(1, Number(trees) || 1);
  return Math.round((a.price.fixed || 0) + (a.price.perSqft || 0) * (Number(area) || 0));
}
const prevHistory = (p) => (p.history && p.history[PREV]) || {};
/* The season before, at that year's grid: what the client actually had (program, then add-ons sold in season) */
function prevSeason(p) {
  const h = prevHistory(p), area = Number(h.area) || areaOf(p), k = 1 + GRID_UP, trees = p.proposal.injectTrees;
  const line = (key, label, amount, kind, extra) => Object.assign({ key, label, amount: round2(amount / k), kind }, extra || {});
  const lines = [line('base', t(`Programme Protection ${PREV}`, `${PREV} Protection Program`), siteBase(area), 'base')];
  (h.addons || []).forEach((key) => { if (ADD[key]) lines.push(line(key, tx(ADD[key].name), priceAt(ADD[key], area, trees), 'addon')); });
  (h.upsells || []).forEach((u) => { if (ADD[u.key] && !lines.some((l) => l.key === u.key)) lines.push(line(u.key, tx(ADD[u.key].name), priceAt(ADD[u.key], area, trees), 'upsell', { date: u.date })); });
  const disc = Number(h.discountPct) || 0, gross = round2(lines.reduce((s, l) => s + l.amount, 0));
  return { lines, area, gross, discount: round2((gross * disc) / 100), total: round2(gross * (1 - disc / 100)), keys: lines.map((l) => l.key) };
}
/* keep: the client had it last season · new: recommended from what we saw · other: catalog */
function renewKind(p, key) {
  if (prevSeason(p).keys.includes(key)) return 'keep';
  return (RN(p).obs || []).some((o) => o.addon === key && o.kind === 'new') ? 'new' : 'other';
}
function renewCompare(p) {
  const prev = prevSeason(p), q = quote(p), f = 1 - q.discPct / 100;
  const same = q.lines.filter((l) => prev.keys.includes(l.key));
  const sameNow = round2(same.reduce((s, l) => s + l.amount, 0) * f);
  const samePrev = round2(prev.lines.filter((l) => same.some((x) => x.key === l.key)).reduce((s, l) => s + l.amount, 0));
  const now = round2(q.season - q.discount);
  return { prev, q, now, sameNow, samePrev, samePct: samePrev ? ((sameNow - samePrev) / samePrev) * 100 : 0, diff: round2(now - prev.total) };
}
function renewStepDone(p, n) {
  const r = RN(p);
  return { 1: !!r.reviewedAt, 2: !!r.acceptedAt, 3: !!r.changesAt, 4: !!p.signature, 5: obProgress(p) >= 100 }[n] || false;
}
function renewStepDate(p, n) { const r = RN(p); return { 1: r.reviewedAt, 2: r.acceptedAt, 3: r.changesAt, 4: p.signature && p.signature.signedAt }[n] || null; }

/* ============ Multi-year agreement: indexed yearly amounts, commitments, options for next year ============ */
const TM = (p) => p.term || (p.term = {});
function termYears(p) { const tm = TM(p), out = []; for (let y = tm.start; y <= tm.end; y++) out.push(y); return out; }
const termLen = (p) => TM(p).end - TM(p).start + 1;
const termYearNo = (p, y = SEASON) => y - TM(p).start + 1;
/* Years already delivered (the review covers the last one) */
const termDone = (p) => clamp(PREV - TM(p).start + 1, 0, termLen(p));
const amendOf = (p) => TM(p).amendment || (TM(p).amendment = { no: `AV-${SEASON}-01`, po: '', signature: null, countersigned: null });
const amendSigned = (p) => !!amendOf(p).signature;
/* The agreement's scope at this year's grid, with the agreement discount: the amount for SEASON */
function termBase(p) { const q = quote(p); return round2(q.season - q.discount); }
function termAmount(p, y) { return round2(termBase(p) * Math.pow(1 + (Number(TM(p).indexPct) || 0) / 100, y - SEASON)); }
const termOpts = (p) => TM(p).options || [];
const termOptsOn = (p) => termOpts(p).filter((o) => o.on);
function termOptPrice(p, o) {
  const a = ADD[o.key]; if (!a) return 0;
  const site = sitesOf(p).find((s) => s.id === o.site) || { area: areaOf(p) };
  return round2(priceAt(a, site.area, o.trees) * (1 - (Number(p.proposal.discountPct) || 0) / 100));
}
const termOptTotal = (p) => round2(termOptsOn(p).reduce((s, o) => s + termOptPrice(p, o), 0));
function termTotal(p, y = SEASON) { return round2(termAmount(p, y) + (y === SEASON ? termOptTotal(p) : 0)); }
const termValue = (p) => round2(termYears(p).reduce((s, y) => s + termAmount(p, y), 0));
/* Interventions a year: four prevention visits plus every treatment window, on every building */
function termVisits(p) {
  const per = 4 + ADDONS.filter((a) => isSelected(p, a.key) && !a.price.perUnit).reduce((s, a) => s + a.when.length, 0);
  return per * Math.max(1, sitesOf(p).length);
}
function healthMap(p, y) { const tm = TM(p); return y === 'base' ? tm.baseline || null : (tm.health || {})[y] || null; }
const siteHealth = (p, id, y) => { const h = healthMap(p, y); return h && h[id] != null ? h[id] : null; };
function termHealth(p, y) {
  const h = healthMap(p, y); if (!h) return null;
  const v = sitesOf(p).map((s) => h[s.id]).filter((x) => x != null);
  return v.length ? Math.round(v.reduce((s, x) => s + x, 0) / v.length) : null;
}
function termCommits(p) {
  const tm = TM(p), sites = sitesOf(p), target = tm.target || 80, ty = tm.targetYear || 3, n = sites.length;
  const ok = sites.filter((s) => (siteHealth(p, s.id, PREV) || 0) >= target).length;
  const visits = termVisits(p), calls = (tm.calls || {})[PREV] || [0, 0], word = siteNoun(p, n);
  const due = termYearNo(p, PREV) >= ty;
  return [
    { k: 'health', icon: 'shield', fr: `Indice de protection de ${target} ou plus dans chaque ${siteNoun(p, 1)}, d’ici la fin de l’an ${ty}`, en: `A protection score of ${target} or more in every ${siteNoun(p, 1)}, by the end of year ${ty}`,
      short: { fr: `Indice de ${target} et plus`, en: `Score of ${target} and up` }, value: `${ok}/${n}`, status: ok === n ? 'met' : due ? 'risk' : 'track', sub: ok === n ? t(`Les ${n} ${word} y sont déjà`, `All ${n} ${word} are there already`) : t(`${ok} ${word} sur ${n} y sont; plan en place pour ${n - ok > 1 ? 'les autres' : 'le dernier'}`, `${ok} of ${n} ${word} are there; a plan is in place for the rest`) },
    { k: 'visits', icon: 'truck', fr: '100 % des interventions prévues faites', en: '100% of planned interventions done', short: { fr: 'Interventions faites', en: 'Interventions done' }, value: `${visits}/${visits}`, status: 'met', sub: t(`Aucune annulée en ${PREV}, toutes à la date prévue`, `None cancelled in ${PREV}, all on the planned date`) },
    { k: 'calls', icon: 'clock', fr: 'Appels de service réglés en moins de 24 h', en: 'Service calls solved within 24 h', short: { fr: 'Appels réglés en 24 h', en: 'Calls solved in 24 h' }, value: `${calls[1]} h`, status: calls[1] <= 24 ? 'met' : 'risk', sub: t(`${calls[0]} appels en ${PREV}, ${calls[1]} h en moyenne`, `${calls[0]} calls in ${PREV}, ${calls[1]} h on average`) },
    { k: 'reports', icon: 'file', fr: `Un rapport après chaque intervention et un bilan annuel par ${siteNoun(p, 1)}`, en: `A report after each intervention and a yearly review per ${siteNoun(p, 1)}`, short: { fr: 'Rapports et bilans', en: 'Reports and reviews' }, value: String(visits + n), status: 'met', sub: t(`${visits} rapports et ${n} bilans en ${PREV}`, `${visits} reports and ${n} reviews in ${PREV}`) },
  ];
}
function termStepDone(p, n) { const tm = TM(p); return { 1: !!tm.overviewAt, 2: !!tm.reviewAt, 3: !!tm.budgetAt, 4: amendSigned(p), 5: obProgress(p) >= 100 }[n] || false; }
function termStepDate(p, n) { const tm = TM(p), am = amendOf(p); return { 1: tm.overviewAt, 2: tm.reviewAt, 3: tm.budgetAt, 4: am.signature && am.signature.signedAt }[n] || null; }

/* ============ Moving a renewal or an agreement forward (client actions, demo dock and console) ============ */
function renewReviewed(p) {
  const r = RN(p);
  if (!r.reviewedAt) { r.reviewedAt = nowIso(); log(p, `Bilan ${PREV} consulté${r.rating ? `, année notée ${r.rating}/5` : ''}`, `${PREV} review viewed${r.rating ? `, year rated ${r.rating}/5` : ''}`); }
  advanceTo(p, 2);
}
function renewAccept(p) {
  const r = RN(p);
  if (!r.acceptedAt) { r.acceptedAt = nowIso(); p.proposal.acceptedAt = r.acceptedAt; log(p, `Programme ${SEASON} accepté au prix fidélité (${fmtMoney(quote(p).season - quote(p).discount)} + tx)`, `${SEASON} program accepted at the loyalty price`); }
  advanceTo(p, 3);
}
function renewConfirm(p) {
  const r = RN(p);
  if (!arr(r.changes)) r.changes = ['none'];
  if (!r.changesAt) {
    r.changesAt = nowIso();
    const list = r.changes.filter((k) => k !== 'none').map((k) => (RENEW_CHANGES.find((x) => x.key === k) || {}).fr).filter(Boolean);
    log(p, list.length ? `Ajustements confirmés : ${list.join(', ').toLowerCase()}` : 'Ajustements confirmés : rien n’a changé', list.length ? 'Changes confirmed' : 'Changes confirmed: nothing changed');
  }
  p.onboarding.tasks = Object.assign(p.onboarding.tasks || {}, { prefs: true, access: true });
  advanceTo(p, 4);
}
function renewAdvance(p) {
  const n = p.stage;
  if (n === 1) { if (!RN(p).rating) RN(p).rating = 5; renewReviewed(p); return { key: 'programme', msg: t(`Votre programme ${SEASON} est prêt`, `Your ${SEASON} program is ready`) }; }
  if (n === 2) { renewAccept(p); return { key: 'ajustements', msg: t('Programme accepté au prix fidélité', 'Program accepted at the loyalty price') }; }
  if (n === 3) { renewConfirm(p); return { key: 'renouvellement', msg: t('Ajustements confirmés. Votre renouvellement est prêt.', 'Changes confirmed. Your renewal is ready.') }; }
  if (n === 4) {
    if (!p.signature) { const nm = p.client.first ? `${p.client.first} ${p.client.last}` : p.client.name; signNow(p, { name: nm, mode: 'type', text: nm, image: null }); }
    advanceTo(p, 5); return { key: 'saison', msg: t('Renouvellement signé', 'Renewal signed') };
  }
  return null;
}
function renewBack(p) {
  const n = Math.max(1, p.stage - 1), r = RN(p);
  if (n <= 4) { p.signature = null; p.countersigned = null; }
  if (n <= 3) r.changesAt = null;
  if (n <= 2) { r.acceptedAt = null; p.proposal.acceptedAt = null; }
  if (n <= 1) r.reviewedAt = null;
  p.stage = n;
  log(p, `Renouvellement ramené à l’étape ${n}`, `Renewal moved back to step ${n}`);
}
function termSeen(p) { const tm = TM(p); if (!tm.overviewAt) { tm.overviewAt = nowIso(); log(p, 'Entente consultée en ligne', 'Agreement viewed online'); } advanceTo(p, 2); }
function termAck(p) { const tm = TM(p); if (!tm.reviewAt) { tm.reviewAt = nowIso(); log(p, `Bilan de l’an ${termDone(p)} consulté`, `Year ${termDone(p)} review viewed`); } advanceTo(p, 3); }
function termApprove(p) {
  const tm = TM(p);
  if (!tm.budgetAt) { tm.budgetAt = nowIso(); log(p, `Budget ${SEASON} accepté : ${fmtMoney(termTotal(p))} + tx, ${termOptsOn(p).length} option(s)`, `${SEASON} budget accepted: ${fmtMoney(termTotal(p))} + tax, ${termOptsOn(p).length} option(s)`); }
  advanceTo(p, 4);
}
function signAmendment(p, sig, po) {
  const tm = TM(p), am = amendOf(p);
  am.signature = Object.assign({ signedAt: nowIso(), hash: sigHash(p) }, sig);
  if (po) am.po = po;
  if (!tm.budgetAt) tm.budgetAt = am.signature.signedAt;
  log(p, `Budget ${SEASON} approuvé en ligne (avenant ${am.no})`, `${SEASON} budget approved online (amendment ${am.no})`);
  advanceTo(p, 5);
  persist(p);
  scheduleAmendCountersign(p);
}
function scheduleAmendCountersign(p) {
  if (amendOf(p).countersigned) return;
  setTimeout(() => {
    const q = S.portals[p.slug]; if (!q || !isTerm(q)) return;
    const am = amendOf(q); if (!am.signature || am.countersigned) return;
    am.countersigned = { name: (q.rep || repFor(q.branch)).name, signedAt: nowIso() };
    log(q, `Avenant ${am.no} contresigné par ${am.countersigned.name}`, `Amendment ${am.no} countersigned by ${am.countersigned.name}`);
    persist(q);
    if (S.route.view === 'portal' && S.route.slug === q.slug) {
      if ($('#sigs')) { replaceEl('sigs', amendSigsHtml(q)); replaceEl('signbox', amendSignboxHtml(q)); }
      refreshHeader(q);
    }
    toast(t(`Contresigné par ${firstName(am.countersigned.name)}`, `Countersigned by ${firstName(am.countersigned.name)}`));
  }, 2600);
}
function termAdvance(p) {
  const n = p.stage;
  if (n === 1) { termSeen(p); return { key: 'bilan', msg: t(`Le bilan de l’an ${termDone(p)} est ouvert`, `The year ${termDone(p)} review is open`) }; }
  if (n === 2) { termAck(p); return { key: 'budget', msg: t(`Le budget ${SEASON} est prêt`, `The ${SEASON} budget is ready`) }; }
  if (n === 3) { termApprove(p); return { key: 'approbation', msg: t('Budget accepté. L’approbation est prête à signer.', 'Budget accepted. The approval is ready to sign.') }; }
  if (n === 4) {
    if (!amendSigned(p)) signAmendment(p, { name: `${p.client.first} ${p.client.last}`, mode: 'type', text: `${p.client.first} ${p.client.last}`, image: null }, '');
    advanceTo(p, 5); return { key: 'saison', msg: t(`Budget ${SEASON} approuvé`, `${SEASON} budget approved`) };
  }
  return null;
}
function termBack(p) {
  const n = Math.max(1, p.stage - 1), tm = TM(p), am = amendOf(p);
  if (n <= 4) { am.signature = null; am.countersigned = null; }
  if (n <= 3) tm.budgetAt = null;
  if (n <= 2) tm.reviewAt = null;
  if (n <= 1) tm.overviewAt = null;
  p.stage = n;
  log(p, `Suivi d’entente ramené à l’étape ${n}`, `Agreement follow-up moved back to step ${n}`);
}
