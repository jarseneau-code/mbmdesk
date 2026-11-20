/* ============ Console (offices & head office) ============ */
function portalList() {
  const f = S.ui.branch || 'all';
  return S.order.map((s) => S.portals[s]).filter((p) => p && !p.deleted && (f === 'all' || p.branch === f));
}
const seasonValue = (p) => { if (isTerm(p)) return termTotal(p); const q = quote(p); return q.season - q.discount; };
function admTop() {
  return `<header class="adm__top"><div class="wrap">
    <a class="brand" href="#admin" aria-label="${t('Console MBM', 'MBM console')}">${vdBadge()}<span class="adm__title">${t('Console', 'Console')}</span></a>
    <span class="adm__by">${t('par', 'by')} ${winniaLogo('wlogo--sm')}</span>
    <span style="flex:1"></span>
    ${crmPillHtml()}
    ${langToggle()}
    <a class="btn btn--ghost btn--sm" href="#${DEFAULT_SLUG}">${icon('eye')}<span class="btn-label">${t('Portail démo', 'Demo portal')}</span></a>
    <button class="iconbtn" data-action="lock" aria-label="${t('Verrouiller', 'Lock')}">${icon('lock')}</button>
  </div></header>`;
}
function viewAdminGate() {
  return `<main class="adm-gate wrap"><div class="card adm-gate__card">
    <div class="row" style="justify-content:space-between">${vdBadge(true)}${winniaLogo('wlogo--md')}</div>
    <h1 class="h2">${t('Console des <em>bureaux</em>', 'Office <em>console</em>')}</h1>
    <p class="small" style="margin:0">${t('Pipeline, création de portails sur le pas de la porte et suivi des dossiers, secteur par secteur.', 'Pipeline, doorstep portal creation and file tracking, area by area.')}</p>
    <form class="stack" data-form="admin-gate" novalidate autocomplete="off" style="gap:12px">
      <div class="field"><label class="field__label" for="adm-pin">${t('Code de la console', 'Console code')}</label><input class="input mono" id="adm-pin" type="text" autocapitalize="characters" spellcheck="false"></div>
      <p class="hanger__err" id="adm-err" role="alert"></p>
      <button class="btn btn--ink btn--block" type="submit">${t('Entrer', 'Enter')}${icon('arrowR')}</button>
    </form>
    <div class="gate__hint"><span class="small">${t('Démo · code :', 'Demo · code:')} <code id="adm-demo">${'•'.repeat(ADMIN_PIN.length)}</code></span><span class="row" style="gap:6px"><button class="btn btn--xs btn--ghost" type="button" data-action="reveal-pin">${t('Afficher', 'Show')}</button><button class="btn btn--xs btn--ink" type="button" data-action="use-pin">${t('Remplir', 'Fill in')}</button></span></div>
    <a class="link small" href="#${DEFAULT_SLUG}">${t('Retour au portail client', 'Back to the client portal')}</a>
  </div></main>`;
}
function kpisHtml(list) {
  const week = list.filter((p) => { const d = daysUntil(p.createdAt); return d != null && d > -7; }).length;
  const signed = list.filter((p) => p.signature);
  const open = list.filter((p) => !p.signature && A(p).submittedAt);
  const withProp = list.filter((p) => A(p).submittedAt);
  const upcoming = list.filter((p) => p.visit && visitEnd(p.visit) > new Date()).length;
  const sum = (a) => a.reduce((s, p) => s + seasonValue(p), 0);
  const rate = withProp.length ? Math.round((signed.length / withProp.length) * 100) : 0;
  const k = (label, val, small) => `<div class="kpi"><span>${label}</span><b>${val}</b><small>${small}</small></div>`;
  return `<div class="kpis">
    ${k(t('Dossiers actifs', 'Active files'), fmtInt(list.length), t(`${week} nouveaux cette semaine`, `${week} new this week`))}
    ${k(t(`Valeur signée ${SEASON}`, `${SEASON} signed value`), fmtMoney(sum(signed), 0), t(`${signed.length} clients signés`, `${signed.length} signed clients`))}
    ${k(t('Pipeline ouvert', 'Open pipeline'), fmtMoney(sum(open), 0), t(`${open.length} propositions en cours`, `${open.length} proposals in progress`))}
    ${k(t('Taux de signature', 'Signature rate'), `${rate} %`, t(`${upcoming} visites à venir`, `${upcoming} upcoming visits`))}
    ${k(t('Ajouts en cours d’année', 'Add-ons during the year'), fmtMoney(offerStats(list).revenue, 0), t(`${offerStats(list).sent.length} recommandations en attente`, `${offerStats(list).sent.length} recommendations pending`))}
  </div>`;
}
function kcardStatus(p) {
  if (isRenewal(p)) {
    const r = RN(p);
    return { 1: r.reviewedAt ? t('Bilan consulté', 'Review viewed') : t('Bilan envoyé', 'Review sent'), 2: t(`Programme ${SEASON} · fidélité −${quote(p).discPct} %`, `${SEASON} program · loyalty −${quote(p).discPct}%`), 3: r.changesAt ? t('Ajustements reçus', 'Changes received') : t('Ajustements à confirmer', 'Changes to confirm'), 4: p.signature ? t('Renouvelé', 'Renewed') : t('Renouvellement à signer', 'Renewal to sign') }[p.stage]
      || (p.signature ? `${t('Renouvelé', 'Renewed')} ${fmtDateShort(p.signature.signedAt)} · ${obProgress(p)} %` : t('Client', 'Client'));
  }
  if (isTerm(p)) {
    const tm = TM(p);
    return { 1: t(`An ${termDone(p)} sur ${termLen(p)} · bilan envoyé`, `Year ${termDone(p)} of ${termLen(p)} · review sent`), 2: tm.reviewAt ? t('Bilan consulté', 'Review viewed') : t(`Bilan de l’an ${termDone(p)}`, `Year ${termDone(p)} review`), 3: tm.meeting ? t(`Rencontre ${fmtDateShort(tm.meeting.at)}`, `Meeting ${fmtDateShort(tm.meeting.at)}`) : t(`Budget ${SEASON} à approuver`, `${SEASON} budget to approve`), 4: t('Avenant à signer', 'Amendment to sign') }[p.stage]
      || t(`Budget ${SEASON} approuvé`, `${SEASON} budget approved`);
  }
  return null;
}
function kcardHtml(p) {
  const a = A(p), src = SOURCES[p.source] || SOURCES.web;
  /* Renewals and agreements have their own wording; a new client's file follows the onboarding steps */
  let status = kcardStatus(p);
  if (!status) {
    if (p.stage === 1) status = a.submittedAt ? t('Évaluation reçue', 'Assessment received') : `${t('Évaluation', 'Assessment')} ${qProgress(p).pct} %`;
    else if (p.stage === 2) status = `${t('Plan d’action', 'Action plan')} v${p.proposal.version}`;
    else if (p.stage === 3) status = p.visit ? `${p.visit.mode === 'video' ? t('Appel', 'Call') : t('Inspection', 'Inspection')} ${fmtDateShort(p.visit.date)}` : t('Inspection à réserver', 'Inspection to book');
    else if (p.stage === 4) status = p.signature ? t('Signée', 'Signed') : t('Entente à signer', 'Agreement to sign');
    else status = p.signature ? `${t('Signé', 'Signed')} ${fmtDateShort(p.signature.signedAt)} · ${obProgress(p)} %` : t('Client', 'Client');
  }
  const showVal = !!a.submittedAt;
  const po = pendingOffers(p).length, c = crmOn() ? (S.crmData || {})[p.slug] : null;
  return `<a class="kcard" href="#admin-${esc(p.slug)}">
    <div class="kcard__top"><span class="kcard__name">${esc(householdOf(p))}</span>${showVal ? `<span class="kcard__val">${fmtMoney(seasonValue(p), 0)}</span>` : ''}</div>
    <span class="kcard__meta">${isTerm(p) ? `${icon('building')}${esc(p.client.city)} · ${sitesOf(p).length} ${esc(siteNoun(p, sitesOf(p).length))}` : `${icon(src.icon)}${esc(tx(src))} · ${esc(p.client.city)}${isCorp(p) ? ` · ${sitesOf(p).length} ${t('sites', 'sites')}` : ''}`}</span>
    <span class="kcard__meta"><span class="tag">${esc(status)}</span>${isTerm(p) ? `<span class="tag tag--info">${t(`Entente ${TM(p).start}–${TM(p).end}`, `${TM(p).start}–${TM(p).end} agreement`)}</span>` : isCorp(p) ? `<span class="tag tag--info">${t('Corporatif', 'Corporate')}</span>` : isOrg(p) ? `<span class="tag tag--info">${t('Commercial', 'Commercial')}</span>` : ''}${p.since && p.since < SEASON && !isTerm(p) ? `<span class="tag">${t(`Depuis ${p.since}`, `Since ${p.since}`)}</span>` : ''}${isRenewal(p) && !p.signature ? `<span class="tag ${renewDaysLeft(p) <= 7 ? 'tag--alert' : 'tag--warn'}">${icon('clock')}${t(`J-${renewDaysLeft(p)}`, `${renewDaysLeft(p)} d`)}</span>` : ''}${po ? `<span class="tag tag--green">${icon('sparkle')}${po}</span>` : ''}</span>
    ${c && c.nba ? `<span class="kcard__nba">${icon(NBA_ICON[c.nba.kind] || 'flag')}<span>${esc(tx(c.nba))}</span></span>` : ''}
  </a>`;
}
const admFlowKey = () => (FLOWS[S.ui.admFlow] ? S.ui.admFlow : 'onboarding');
const LAST_COL = { onboarding: { fr: `Clients ${SEASON}`, en: `${SEASON} clients` }, renewal: { fr: `Renouvelés ${SEASON}`, en: `Renewed for ${SEASON}` }, term: { fr: 'Budget approuvé', en: 'Budget approved' } };
function kanbanHtml(list) {
  const fk = admFlowKey(), q = normCode(S.ui.q || '');
  const match = (p) => !q || normCode(`${householdOf(p)} ${p.client.name} ${p.client.city} ${p.code} ${branchName(p.branch)}`).includes(q);
  const inFlow = list.filter((p) => flowOf(p).key === fk);
  return `<div class="kanban" id="kanban">${FLOWS[fk].steps.map((s) => {
    const items = inFlow.filter((p) => p.stage === s.n && match(p)).sort((x, y) => String(y.createdAt).localeCompare(String(x.createdAt)));
    const val = items.filter((p) => A(p).submittedAt).reduce((sum, p) => sum + seasonValue(p), 0);
    return `<section class="kcol" aria-label="${esc(tx(s))}"><div class="kcol__head"><b>${s.n}. ${s.n === 5 ? esc(tx(LAST_COL[fk])) : esc(tx(s))}</b><span>${items.length}${val ? ` · ${fmtMoney(val, 0)}` : ''}</span></div>${items.map(kcardHtml).join('') || `<p class="tiny" style="padding:4px">${t('Aucun dossier', 'No files')}</p>`}</section>`;
  }).join('')}</div>`;
}
/* The figures that matter for each journey, above its pipeline */
function flowStripHtml(list, fk) {
  const L = list.filter((p) => flowOf(p).key === fk), k = (label, val, sub) => `<div class="fstrip__i"><span>${label}</span><b class="num">${val}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
  if (fk === 'renewal') {
    const done = L.filter((p) => p.signature), open = L.filter((p) => !p.signature), dl = L.length ? Math.min(...open.map(renewDaysLeft).concat([99])) : 0;
    const anyDl = L.find((p) => !p.signature) || L[0];
    return `<div class="fstrip">${k(t('À renouveler', 'To renew'), open.length, t(`${open.filter((p) => p.stage >= 3).length} programmes acceptés`, `${open.filter((p) => p.stage >= 3).length} programs accepted`))}${k(t('Renouvelés', 'Renewed'), `${done.length} · ${L.length ? Math.round((done.length / L.length) * 100) : 0} %`, t(`${fmtMoney(done.reduce((s, p) => s + seasonValue(p), 0), 0)} signés`, `${fmtMoney(done.reduce((s, p) => s + seasonValue(p), 0), 0)} signed`))}${k(t(`Valeur ${SEASON} en jeu`, `${SEASON} value at stake`), fmtMoney(open.reduce((s, p) => s + seasonValue(p), 0), 0), t('au prix fidélité', 'at the loyalty price'))}${k(t('Prix fidélité', 'Loyalty price'), anyDl ? fmtDate(renewDeadline(anyDl), { day: 'numeric', month: 'short' }) : '—', open.length ? t(`plus que ${dl} jours`, `${dl} days left`) : '')}</div>`;
  }
  if (fk === 'term') {
    const ok = L.filter((p) => amendSigned(p)), rest = L.reduce((s, p) => s + termYears(p).filter((y) => y >= SEASON).reduce((x, y) => x + termAmount(p, y), 0), 0);
    const cms = L.flatMap((p) => termCommits(p)), met = cms.filter((c) => c.status === 'met').length;
    return `<div class="fstrip">${k(t('Ententes actives', 'Active agreements'), L.length, t(`${L.reduce((s, p) => s + sitesOf(p).length, 0)} immeubles et sites`, `${L.reduce((s, p) => s + sitesOf(p).length, 0)} buildings and sites`))}${k(t('Valeur à venir', 'Value ahead'), fmtMoney(rest, 0), t(`de ${SEASON} à la fin des ententes`, `from ${SEASON} to the end of the agreements`))}${k(t(`Budgets ${SEASON} approuvés`, `${SEASON} budgets approved`), `${ok.length}/${L.length}`, t(`${L.filter((p) => p.stage === 4).length} avenant à signer`, `${L.filter((p) => p.stage === 4).length} amendment to sign`))}${k(t('Engagements atteints', 'Commitments met'), `${met}/${cms.length}`, t(`bilans ${PREV}`, `${PREV} reviews`))}</div>`;
  }
  const open = L.filter((p) => p.stage < 5), signed = L.filter((p) => p.signature), withProp = L.filter((p) => A(p).submittedAt);
  return `<div class="fstrip">${k(t('En cours', 'In progress'), open.length, t(`${open.filter((p) => p.stage === 1).length} à l’évaluation`, `${open.filter((p) => p.stage === 1).length} at the assessment`))}${k(t('Signés', 'Signed'), signed.length, t(`${fmtMoney(signed.reduce((s, p) => s + seasonValue(p), 0), 0)} pour ${SEASON}`, `${fmtMoney(signed.reduce((s, p) => s + seasonValue(p), 0), 0)} for ${SEASON}`))}${k(t('Propositions ouvertes', 'Open proposals'), fmtMoney(open.filter((p) => A(p).submittedAt).reduce((s, p) => s + seasonValue(p), 0), 0), t(`${open.filter((p) => A(p).submittedAt).length} dossiers`, `${open.filter((p) => A(p).submittedAt).length} files`))}${k(t('Taux de signature', 'Signature rate'), `${withProp.length ? Math.round((signed.length / withProp.length) * 100) : 0} %`, t('depuis le diagnostic', 'from the diagnosis'))}</div>`;
}
function pipelineHtml(list) {
  const fk = admFlowKey();
  const tabs = Object.values(FLOWS).map((f) => `<button type="button" role="tab" class="ftab" data-action="adm-flow" data-v="${f.key}" aria-selected="${f.key === fk}">${icon(f.icon)}<span>${esc(tx(f))}</span><b>${list.filter((p) => flowOf(p).key === f.key).length}</b></button>`).join('');
  return `<section class="stack" id="pipeline" style="gap:14px"><div class="row" style="justify-content:space-between"><h2 class="h3">${t('Pipeline', 'Pipeline')}</h2><div class="search"><label class="sr-only" for="adm-search">${t('Rechercher', 'Search')}</label>${icon('search')}<input class="input" id="adm-search" placeholder="${t('Nom, ville, code…', 'Name, city, code…')}" value="${esc(S.ui.q || '')}"></div></div>
    <div class="ftabs" role="tablist" aria-label="${t('Parcours', 'Journeys')}">${tabs}</div>
    ${flowStripHtml(list, fk)}
    ${kanbanHtml(list)}</section>`;
}
function barsHtml(rows) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return `<div class="bars">${rows.map((r) => `<div class="bar"><span>${esc(r.label)}</span><div class="bar__track"><i style="width:${Math.round((r.n / max) * 100)}%"></i></div><b>${r.n}</b></div>`).join('')}</div>`;
}
function feedHtml(list, n = 8) {
  const items = [];
  list.forEach((p) => (p.activity || []).forEach((e) => items.push({ p, e })));
  items.sort((x, y) => String(y.e.at).localeCompare(String(x.e.at)));
  return `<ul class="feed">${items.slice(0, n).map(({ p, e }) => `<li><b>${esc(householdOf(p))}</b><span>${esc(tx(e))} · ${esc(ago(e.at))}</span></li>`).join('') || `<li><span>${t('Rien pour le moment', 'Nothing yet')}</span></li>`}</ul>`;
}
function viewAdmin() {
  const list = portalList();
  const bySource = Object.keys(SOURCES).map((k) => ({ label: tx(SOURCES[k]), n: list.filter((p) => p.source === k).length })).filter((r) => r.n);
  const byBranch = BRANCHES.map((b) => ({ label: b.name, n: list.filter((p) => p.branch === b.key).length })).filter((r) => r.n).sort((x, y) => y.n - x.n).slice(0, 8);
  const branchOpts = `<option value="all">${t('Tous les secteurs', 'All areas')}</option>${BRANCHES.map((b) => `<option value="${b.key}" ${S.ui.branch === b.key ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}`;
  return `<div class="adm">${admTop()}<main class="wrap adm__body">
    <div class="adm__bar">
      <div class="stack" style="gap:8px"><p class="eyebrow">${t('Console MBM', 'MBM console')} · ${esc(S.ui.branch && S.ui.branch !== 'all' ? branchName(S.ui.branch) : t('Longueuil et Québec', 'Longueuil and Québec City'))}</p><h1 class="h2">${t('Du pas de la porte <em>à la protection</em>.', 'From the doorstep <em>to protection</em>.')}</h1></div>
      <div class="row"><label class="sr-only" for="adm-branch">${t('Secteur', 'Area')}</label><select class="select" id="adm-branch" data-change="adm-branch" style="width:auto;min-height:40px">${branchOpts}</select><button class="btn btn--green" data-action="new-portal">${icon('plus')}${t('Nouveau client', 'New client')}</button></div>
    </div>
    ${kpisHtml(list)}
    <div class="adm__duo">${nbaPanelHtml(list)}${offersPanelHtml(list)}</div>
    ${pipelineHtml(list)}
    <section class="adm__grid">
      <div class="card stack" style="gap:14px"><b class="h4">${t('Par source', 'By source')}</b>${barsHtml(bySource)}<p class="tiny" style="margin:0">${t('Chaque accroche-porte laissé pendant une tournée arrive avec un code QR : il devient un dossier mesurable.', 'Every door hanger left during a route comes with a QR code: it becomes a measurable file.')}</p></div>
      <div class="card stack" style="gap:14px"><b class="h4">${t('Par secteur', 'By area')}</b>${barsHtml(byBranch)}</div>
      <div class="card stack" style="gap:6px"><b class="h4">${t('Activité récente', 'Recent activity')}</b>${feedHtml(list)}</div>
    </section>
    <div class="row" style="justify-content:space-between"><p class="tiny" style="margin:0">${t('Données de démonstration. En production, chaque bureau voit ses dossiers; la direction voit l’ensemble.', 'Demo data. In production, each office sees its own files; management sees everything.')}</p><button class="btn btn--xs btn--ghost" data-action="adm-reset-all">${icon('refresh')}${t('Réinitialiser la démo', 'Reset the demo')}</button></div>
  </main></div>`;
}
function admProposalHtml(p) {
  const q = quote(p), recs = recommendations(p);
  return `<section class="card stack" id="adm-prop" style="gap:14px">
    <div class="row" style="justify-content:space-between"><b class="h4">${t('Plan d’action', 'Action plan')} v${esc(p.proposal.version)}</b><span class="tag">${fmtMoney(q.season - q.discount, 0)} ${t('/ an', '/ year')}${isCorp(p) ? ` · ${t(`${sitesOf(p).length} sites`, `${sitesOf(p).length} sites`)}` : ` · ${fmtMoney(q.monthly)} ${t('/ mois', '/ month')}`}</span></div>
    ${isCorp(p) ? `<ul class="sites">${siteQuote(p).map((s, i) => `<li class="site"><span class="site__n">${i + 1}</span><div class="site__txt"><b>${esc(tx(s.name))}</b><span>${esc(s.city)} · ${esc(fmtArea(s.area))}</span></div><div class="site__meta"><b class="num">${fmtMoney(s.total, 0)}</b><span>${t('avant rabais', 'before discount')}</span></div></li>`).join('')}</ul>` : ''}
    <div class="fields">
      ${isCorp(p) ? '' : `<div class="field"><label class="field__label" for="adm-area">${t('Superficie mesurée (pi²)', 'Measured area (sq ft)')}</label><input class="input num" id="adm-area" type="number" min="300" step="50" data-adm="area" value="${areaOf(p)}"></div>`}
      <div class="field"><label class="field__label" for="adm-disc">${t('Rabais (%)', 'Discount (%)')}</label><input class="input num" id="adm-disc" type="number" min="0" max="30" step="1" data-adm="discountPct" value="${Number(p.proposal.discountPct) || 0}"></div>
    </div>
    <div class="prefs">
      <div class="pref"><div><b>${esc(tx(BASE.name))}</b><span>${fmtMoney(basePrice(p), 0)} · ${t('toujours inclus', 'always included')}</span></div><span class="tag tag--ok">${t('Inclus', 'Included')}</span></div>
      ${ADDONS.map((a) => { const r = recs.find((x) => x.key === a.key); return `<div class="pref"><div><b>${esc(tx(a.name))}${r ? ` <span class="tag ${r.priority === 'high' ? 'tag--alert' : 'tag--info'}">${r.priority === 'high' ? t('Prioritaire', 'Priority') : t('Recommandé', 'Recommended')}</span>` : ''}</b><span>${fmtMoney(addonAmount(p, a), 0)}${a.price.perUnit ? ` · ${stationsOf(p)} ${t('stations', 'stations')}` : ''}</span></div><button class="switch" role="switch" aria-checked="${isSelected(p, a.key)}" data-action="adm-addon" data-k="${a.key}" aria-label="${esc(tx(a.name))}"></button></div>`; }).join('')}
      <div class="pref"><div><b>${t('Intervention initiale (offre)', 'First treatment (offer)')}</b><span>${fmtMoney(PROMO_PRICE)}</span></div><button class="switch" role="switch" aria-checked="${p.proposal.promo !== false}" data-action="adm-promo" aria-label="${t('Intervention initiale (offre)', 'First treatment (offer)')}"></button></div>
    </div>
    <p class="tiny" style="margin:0">${t('Chaque modification crée une nouvelle version, visible tout de suite dans le portail du client.', 'Every change creates a new version, visible right away in the client’s portal.')}</p>
  </section>`;
}
function stageRows(p) {
  if (isRenewal(p)) {
    const r = RN(p), d = (x) => (x ? fmtDateShort(x) : '');
    return [
      [stepLabel(1, p), r.reviewedAt ? `${t('Consulté le', 'Viewed')} ${d(r.reviewedAt)}${r.rating ? ` · ${r.rating}/5` : ''}` : t('Envoyé, pas encore ouvert', 'Sent, not opened yet')],
      [stepLabel(2, p), r.acceptedAt ? `${t('Accepté le', 'Accepted')} ${d(r.acceptedAt)} · ${fmtMoney(quote(p).season - quote(p).discount, 0)}` : `${fmtMoney(quote(p).season - quote(p).discount, 0)} · ${t('fidélité jusqu’au', 'loyalty until')} ${fmtDate(renewDeadline(p), { day: 'numeric', month: 'short' })}`],
      [stepLabel(3, p), r.changesAt ? `${t('Confirmés le', 'Confirmed')} ${d(r.changesAt)}${(r.changes || []).filter((k) => k !== 'none').length ? ` · ${(r.changes || []).filter((k) => k !== 'none').length} ${t('changement(s)', 'change(s)')}` : ` · ${t('aucun changement', 'no change')}`}` : r.callbackAt ? t('Rappel demandé', 'Call requested') : '—'],
      [stepLabel(4, p), p.signature ? `${t('Signé le', 'Signed')} ${d(p.signature.signedAt)}${p.countersigned ? ` · ${t('contresigné', 'countersigned')}` : ''}` : '—'],
      [stepLabel(5, p), p.stage >= 5 ? `${obProgress(p)} % ${t('prêt', 'ready')}` : '—'],
    ];
  }
  if (isTerm(p)) {
    const tm = TM(p), am = amendOf(p), d = (x) => (x ? fmtDateShort(x) : '');
    return [
      [stepLabel(1, p), tm.overviewAt ? `${t('Consultée le', 'Viewed')} ${d(tm.overviewAt)}` : t(`An ${termDone(p)} sur ${termLen(p)}`, `Year ${termDone(p)} of ${termLen(p)}`)],
      [stepLabel(2, p), tm.reviewAt ? `${t('Consulté le', 'Viewed')} ${d(tm.reviewAt)}` : t('Envoyé', 'Sent')],
      [stepLabel(3, p), `${fmtMoney(termTotal(p), 0)} · ${termOptsOn(p).length} ${t('option(s)', 'option(s)')}${tm.budgetAt ? ` · ${t('accepté', 'accepted')}` : ''}${tm.meeting ? ` · ${t('rencontre', 'meeting')} ${d(tm.meeting.at)}` : ''}`],
      [stepLabel(4, p), am.signature ? `${t('Signé le', 'Signed')} ${d(am.signature.signedAt)}${am.countersigned ? ` · ${t('contresigné', 'countersigned')}` : ''}` : `${t('Avenant', 'Amendment')} ${esc(am.no)}`],
      [stepLabel(5, p), p.stage >= 5 ? t(`An ${termYearNo(p, SEASON)} lancé`, `Year ${termYearNo(p, SEASON)} under way`) : '—'],
    ];
  }
  return null;
}
function admStageHtml(p) {
  const a = A(p), v = p.visit;
  const rows = stageRows(p) || [
    [stepLabel(1), a.submittedAt ? `${t('Envoyé le', 'Sent')} ${fmtDateShort(a.submittedAt)}` : `${qProgress(p).pct} % ${t('rempli', 'filled')}`],
    [stepLabel(2), p.proposal.acceptedAt ? `${t('Acceptée le', 'Accepted')} ${fmtDateShort(p.proposal.acceptedAt)}` : a.submittedAt ? `v${p.proposal.version}, ${t('en attente', 'pending')}` : '—'],
    [stepLabel(3), v ? `${esc(cap1(visitWhen(v)))}` : '—'],
    [stepLabel(4), p.signature ? `${t('Signée le', 'Signed')} ${fmtDateShort(p.signature.signedAt)}${p.countersigned ? ` · ${t('contresignée', 'countersigned')}` : ''}` : '—'],
    [stepLabel(5), p.stage >= 5 ? `${obProgress(p)} % ${t('prêt', 'ready')}` : '—'],
  ];
  return `<section class="card stack" style="gap:14px"><div class="row" style="justify-content:space-between"><b class="h4">${isRenewal(p) ? t('Renouvellement', 'Renewal') : isTerm(p) ? t('Suivi d’entente', 'Agreement follow-up') : t('Étape du dossier', 'File stage')}</b><span class="stagepill">${p.stage}/5 · ${esc(stepLabel(p.stage, p))}</span></div>
    <dl class="kv">${rows.map(([k, val]) => `<dt>${esc(k)}</dt><dd>${val}</dd>`).join('')}</dl>
    <div class="row"><button class="btn btn--sm btn--ghost" data-action="adm-stage" data-d="-1" ${p.stage <= 1 ? 'disabled' : ''}>${icon('arrowL')}${t('Reculer', 'Back')}</button><button class="btn btn--sm btn--ink" data-action="adm-stage" data-d="1" ${p.stage >= 5 ? 'disabled' : ''}>${t('Débloquer l’étape suivante', 'Unlock the next step')}${icon('arrowR')}</button></div></section>`;
}
/* Console panels for the two new journeys */
function admRenewHtml(p) {
  const r = RN(p), c = renewCompare(p), ch = (r.changes || []).filter((k) => k !== 'none');
  return `<section class="card stack" style="gap:14px"><div class="row" style="justify-content:space-between"><b class="h4">${t(`Année ${PREV} → ${SEASON}`, `${PREV} → ${SEASON}`)}</b><span class="tag ${renewDaysLeft(p) <= 7 && !p.signature ? 'tag--alert' : 'tag--info'}">${p.signature ? t('Renouvelé', 'Renewed') : t(`Fidélité J-${renewDaysLeft(p)}`, `Loyalty ${renewDaysLeft(p)} d`)}</span></div>
    <div class="mini-kpis"><div><span>${PREV}</span><b class="num">${fmtMoney(c.prev.total, 0)}</b></div><div><span>${SEASON}</span><b class="num">${fmtMoney(c.now, 0)}</b></div><div><span>${t('Protection', 'Protection')}</span><b class="num">${(r.health || [])[0]} → ${(r.health || [])[1]}</b></div></div>
    <dl class="kv"><dt>${t('Note de l’année', 'Year rating')}</dt><dd>${r.rating ? `${r.rating}/5 · ${esc(tx(RENEW_RATES[r.rating - 1]))}` : '—'}</dd>${r.comment ? `<dt>${t('Commentaire', 'Comment')}</dt><dd>${esc(r.comment)}</dd>` : ''}<dt>${t('Ajustements', 'Changes')}</dt><dd>${r.changesAt ? (ch.length ? esc(ch.map((k) => tx(RENEW_CHANGES.find((x) => x.key === k) || {})).join(', ')) : t('Aucun', 'None')) : '—'}</dd>${r.callbackAt ? `<dt>${t('Rappel', 'Call back')}</dt><dd>${t('Demandé le', 'Requested')} ${esc(fmtDateTime(r.callbackAt))}</dd>` : ''}<dt>${t('Programme', 'Program')}</dt><dd>${esc(quote(p).lines.map((l) => l.label).join(', '))}</dd></dl></section>`;
}
function admTermHtml(p) {
  const tm = TM(p), cm = termCommits(p);
  return `<section class="card stack" style="gap:14px"><div class="row" style="justify-content:space-between"><b class="h4">${t('Entente', 'Agreement')} ${esc(tm.no)}</b><span class="tag tag--info">${tm.start}–${tm.end}</span></div>
    <div class="table-wrap"><table class="itable itable--mini"><thead><tr><th>${t('Année', 'Year')}</th><th class="r">${t('Montant', 'Amount')}</th><th class="r">${t('Indice', 'Score')}</th><th>${t('Statut', 'Status')}</th></tr></thead><tbody>${termYears(p).map((y) => `<tr><td>${y}</td><td class="r num">${fmtMoney(y === SEASON ? termTotal(p) : termAmount(p, y), 0)}</td><td class="r num">${termHealth(p, y) != null ? termHealth(p, y) : '—'}</td><td>${y <= PREV ? `<span class="tag tag--ok">${t('Livrée', 'Delivered')}</span>` : y === SEASON ? `<span class="tag ${amendSigned(p) ? 'tag--ok' : 'tag--warn'}">${amendSigned(p) ? t('Approuvée', 'Approved') : t('À approuver', 'To approve')}</span>` : `<span class="tag">${t('À venir', 'Upcoming')}</span>`}</td></tr>`).join('')}</tbody></table></div>
    <dl class="kv"><dt>${t('Engagements', 'Commitments')}</dt><dd>${cm.filter((c) => c.status === 'met').length}/${cm.length} ${t('atteints', 'met')}</dd><dt>${t(`Options ${SEASON}`, `${SEASON} options`)}</dt><dd>${termOpts(p).map((o) => `${esc(tx(ADD[o.key].name))} ${o.on ? '✓' : '·'}`).join(', ') || '—'}</dd>${tm.meeting ? `<dt>${t('Rencontre', 'Meeting')}</dt><dd>${esc(fmtDateTime(tm.meeting.at))}</dd>` : ''}</dl></section>`;
}
function admAiHtml(p) {
  const ch = S.ui.channel || 'sms', f = S.ui.followup && S.ui.followup.slug === p.slug ? S.ui.followup : null;
  return `<section class="card stack" id="adm-ai" style="gap:14px">
    <div class="row" style="justify-content:space-between"><b class="h4">${t('Relance intelligente', 'Smart follow-up')}</b><span class="tag ${S.caps.sample ? 'tag--ok' : ''}" id="ai-mode-adm">${S.caps.sample ? 'Claude' : t('Modèle de base', 'Basic template')}</span></div>
    <div class="row"><div class="seg" role="group" aria-label="${t('Canal', 'Channel')}"><button type="button" data-action="adm-channel" data-v="sms" ${pressed(ch === 'sms')}>${t('Texto', 'Text')}</button><button type="button" data-action="adm-channel" data-v="email" ${pressed(ch === 'email')}>${t('Courriel', 'Email')}</button></div><button class="btn btn--sm btn--ink" data-action="adm-gen" id="adm-gen">${icon('sparkle')}${t('Rédiger', 'Draft')}</button></div>
    <div id="adm-ai-out">${f ? `<div class="smsbox">${esc(f.text)}</div><button class="btn btn--xs btn--ghost" style="margin-top:8px" data-action="copy" data-text="${esc(f.text)}">${icon('copy')}${t('Copier', 'Copy')}</button>` : `<p class="small" style="margin:0">${t('Un message adapté à l’étape et à la situation du client, prêt à copier.', 'A message fitted to the client’s stage and situation, ready to copy.')}</p>`}</div>
  </section>`;
}
function viewAdminDetail(p) {
  const a = A(p), src = SOURCES[p.source] || SOURCES.web, rep = p.rep || repFor(p.branch);
  const answers = a.submittedAt || qProgress(p).done ? `<dl class="kv">
      <dt>${t('Propriété', 'Property')}</dt><dd>${esc(tx(PROP_TYPES.find((x) => x.key === propTypeOf(p)) || PROP_TYPES[0]))} · ${esc(fmtArea(areaOf(p)))}</dd>
      <dt>${t('Fréquence', 'Frequency')}</dt><dd>${a.rating ? `${esc(tx(RATINGS[a.rating - 1]))} · ${t('protection', 'protection')} ${healthNow(p)}/100` : '—'}</dd>
      <dt>${t('Famille', 'Household')}</dt><dd>${a.kids ? `${t('Enfants', 'Kids')} : ${a.kids === 'oui' ? t('oui', 'yes') : t('non', 'no')}` : '—'}${arr(a.pets) ? ` · ${(a.pets || []).map((k) => ({ chien: t('chien', 'dog'), chat: t('chat', 'cat'), aucun: t('aucun animal', 'no pets') }[k])).join(', ')}` : ''}</dd>
      <dt>${t('Pièces', 'Rooms')}</dt><dd>${arr(a.zones) ? esc(a.zones.map((k) => (zoneChoices(p).find((z) => z.key === k) ? tx(zoneChoices(p).find((z) => z.key === k)) : k)).join(', ')) : '—'}</dd>
      <dt>${t('Autour', 'Around')}</dt><dd>${t(`${treesOf(p)} arbre(s) ou haie(s) contre la maison`, `${treesOf(p)} tree(s) or hedge(s) against the house`)}${a.treeSick ? ` · ${t('bois ou débris contre la maison', 'wood or debris against the house')}` : ''}</dd>
      <dt>${t('Objectifs', 'Goals')}</dt><dd>${arr(a.goals) ? esc((a.goals || []).map((k) => GOAL[k] ? tx(GOAL[k]) : k).join(', ')) : '—'}</dd>
      ${a.notes ? `<dt>${t('Note', 'Note')}</dt><dd>${esc(a.notes)}</dd>` : ''}
    </dl>` : `<p class="small" style="margin:0">${t('Le client n’a pas encore commencé son évaluation.', 'The client has not started the assessment yet.')}</p>`;
  return `<div class="adm">${admTop()}<main class="wrap adm__body">
    <div class="adm__bar">
      <div class="stack" style="gap:10px"><a class="link small" href="#admin">${icon('arrowL')} ${t('Pipeline', 'Pipeline')}</a><h1 class="h2">${esc(householdOf(p))}</h1>
        <div class="row" style="gap:8px"><span class="stagepill">${icon(flowOf(p).icon)}${esc(tx(flowOf(p)))} · ${t('étape', 'step')} ${p.stage} · ${esc(stepLabel(p.stage, p))}</span><span class="tag">${icon(src.icon)}${esc(tx(src))}</span><span class="tag">${icon('pin')}MBM ${esc(branchName(p.branch))}</span>${isTerm(p) ? `<span class="tag tag--info">${icon('building')}${sitesOf(p).length} ${esc(siteNoun(p, sitesOf(p).length))}</span>` : isCorp(p) ? `<span class="tag tag--info">${icon('building')}${t(`Corporatif · ${sitesOf(p).length} sites`, `Corporate · ${sitesOf(p).length} sites`)}</span>` : isOrg(p) ? `<span class="tag tag--info">${t('Commercial', 'Commercial')}</span>` : ''}${p.since && p.since < SEASON ? `<span class="tag">${t(`Client depuis ${p.since}`, `Client since ${p.since}`)}</span>` : ''}</div></div>
      <div class="row"><a class="btn btn--ink" href="#${esc(p.slug)}">${icon('eye')}${t('Ouvrir le portail', 'Open the portal')}</a><button class="btn btn--ghost" data-action="share-portal" data-slug="${esc(p.slug)}">${icon('qr')}${t('Code QR et texto', 'QR code and text')}</button></div>
    </div>
    <div class="detail">
      <div>
        <section class="card stack" style="gap:14px"><b class="h4">${t('Contact et accès', 'Contact and access')}</b>
          <dl class="kv"><dt>${t('Client', 'Client')}</dt><dd>${esc(p.client.name)}${p.client.title ? ` · ${esc(tx(p.client.title))}` : ''}${isOrg(p) && p.client.first ? `<br><span class="small">${esc(p.client.first)} ${esc(p.client.last)}</span>` : ''}</dd>
          <dt>${t('Adresse', 'Address')}</dt><dd>${esc(p.client.address)}, ${esc(p.client.city)}</dd>
          <dt>${t('Courriel', 'Email')}</dt><dd>${esc(p.client.email || a.email || '—')}</dd>
          <dt>${t('Cellulaire', 'Mobile')}</dt><dd>${esc(p.client.phone || a.phone || '—')}</dd>
          <dt>${t('Conseiller', 'Advisor')}</dt><dd>${esc(rep.name)}</dd>
          <dt>${t('Code d’accès', 'Access code')}</dt><dd><span class="copyline"><span>${esc(p.code)}</span><button class="btn btn--xs btn--ghost" data-action="copy" data-text="${esc(p.code)}">${icon('copy')}${t('Copier', 'Copy')}</button></span></dd>
          <dt>${t('Créé', 'Created')}</dt><dd>${esc(fmtDateTime(p.createdAt))}</dd></dl>
        </section>
        <section class="card stack" style="gap:16px"><div class="row" style="justify-content:space-between"><b class="h4">${isReturning(p) && a.submittedAt ? t(`Évaluation initiale · ${String(a.submittedAt).slice(0, 4)}`, `First assessment · ${String(a.submittedAt).slice(0, 4)}`) : t('Évaluation', 'Assessment')}</b>${a.submittedAt ? `<span class="tag tag--ok">${icon('check')}${t('Reçu', 'Received')} ${fmtDateShort(a.submittedAt)}</span>` : `<span class="tag tag--warn">${qProgress(p).pct} %</span>`}</div>
          ${planSvg(p)}
          <ul class="findings">${findingsHtml(p)}</ul>
          ${safeImg(a.photo) ? `<img src="${safeImg(a.photo)}" alt="${t('Photo envoyée par le client', 'Photo sent by the client')}" style="border-radius:12px;max-height:220px;object-fit:cover;width:100%">` : ''}
          ${answers}
        </section>
        ${admOfferHtml(p)}
        ${a.submittedAt ? admProposalHtml(p) : ''}
      </div>
      <div>
        ${admCrmHtml(p)}
        ${admStageHtml(p)}
        ${isTerm(p) ? admTermHtml(p) : isRenewal(p) ? admRenewHtml(p) : ''}
        ${admAccountHtml(p)}
        ${admAiHtml(p)}
        <section class="card stack" style="gap:6px"><b class="h4">${t('Journal', 'Log')}</b><ul class="feed">${(p.activity || []).slice(0, 12).map((e) => `<li>${esc(tx(e))}<span>${esc(fmtDateTime(e.at))}</span></li>`).join('') || `<li><span>—</span></li>`}</ul></section>
      </div>
    </div>
  </main></div>`;
}

/* ============ New client, QR and text message ============ */
function newPortalModal() {
  const np = S.ui.np = S.ui.np || { segment: 'residentiel', source: 'porte-a-porte' };
  openModal(`<div class="modal__head"><div class="stack" style="gap:4px"><p class="eyebrow">${t('Nouveau client', 'New client')}</p><h2 class="h3">${t('Créer un portail sur le pas de la porte', 'Create a portal at the door')}</h2></div><button class="iconbtn" data-action="close-modal" aria-label="${t('Fermer', 'Close')}">${icon('x')}</button></div>
    <form class="stack" data-form="new-portal" novalidate style="gap:16px">
      <div class="seg" role="group" aria-label="${t('Segment', 'Segment')}"><button type="button" data-action="np-seg" data-v="residentiel" ${pressed(np.segment === 'residentiel')}>${t('Résidentiel', 'Residential')}</button><button type="button" data-action="np-seg" data-v="commercial" ${pressed(np.segment === 'commercial')}>${t('Commercial', 'Commercial')}</button></div>
      <div class="fields">
        ${np.segment === 'commercial' ? `<div class="field span2"><label class="field__label" for="np-org">${t('Entreprise ou syndicat', 'Business or condo board')}</label><input class="input" id="np-org" name="org" required></div>` : ''}
        <div class="field"><label class="field__label" for="np-first">${t('Prénom', 'First name')}</label><input class="input" id="np-first" name="first" required></div>
        <div class="field"><label class="field__label" for="np-last">${t('Nom', 'Last name')}</label><input class="input" id="np-last" name="last" required></div>
        <div class="field span2"><label class="field__label" for="np-address">${t('Adresse', 'Address')}</label><input class="input" id="np-address" name="address" placeholder="${t('Ex. : 25, rue des Lilas', 'E.g. 25 Lilac Street')}" required></div>
        <div class="field"><label class="field__label" for="np-city">${t('Ville', 'City')}</label><input class="input" id="np-city" name="city" required></div>
        <div class="field"><label class="field__label" for="np-phone">${t('Cellulaire', 'Mobile')} <span class="opt">${t('facultatif', 'optional')}</span></label><input class="input" id="np-phone" name="phone" type="tel"></div>
        <div class="field span2"><label class="field__label" for="np-email">${t('Courriel', 'Email')} <span class="opt">${t('facultatif', 'optional')}</span></label><input class="input" id="np-email" name="email" type="email"></div>
        <div class="field span2"><label class="field__label" for="np-branch">${t('Secteur', 'Area')}</label><select class="select" id="np-branch" name="branch">${BRANCHES.map((b) => `<option value="${b.key}" ${b.key === (S.ui.branch && S.ui.branch !== 'all' ? S.ui.branch : 'longueuil') ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select></div>
      </div>
      <div class="field"><span class="field__label">${t('Source', 'Source')}</span><div class="chips">${Object.keys(SOURCES).map((k) => `<button type="button" class="chip" data-action="np-source" data-v="${k}" ${pressed(np.source === k)}>${icon(SOURCES[k].icon)}${esc(tx(SOURCES[k]))}</button>`).join('')}</div></div>
      <p class="hanger__err" id="np-err" role="alert"></p>
      <button class="btn btn--green btn--block" type="submit">${icon('qr')}${t('Créer le portail et le code QR', 'Create the portal and QR code')}</button>
    </form>`);
}
function createPortal(form) {
  const np = S.ui.np || { segment: 'residentiel', source: 'porte-a-porte' };
  const v = (n) => String((form.elements[n] && form.elements[n].value) || '').trim();
  const org = np.segment === 'commercial' ? v('org') : '';
  const first = v('first'), last = v('last'), address = v('address'), city = v('city');
  const err = $('#np-err');
  if ((np.segment === 'commercial' && !org) || !first || !last || !address || !city) { if (err) err.textContent = t('Remplissez le nom, l’adresse et la ville.', 'Fill in the name, address and city.'); return; }
  let base = slugify(org || last) || 'client';
  if (STEP_KEYS.concat(['compte']).some((k) => base === k || base.endsWith('-' + k)) || ['admin', 'lock'].includes(base)) base += '-mbm';
  let slug = base, i = 2;
  while (S.portals[slug]) slug = `${base}-${i++}`;
  const branch = v('branch') || 'longueuil';
  const rep = repFor(branch);
  const p = hydrate({
    slug, stage: 1, segment: np.segment, source: np.source, branch, createdAt: nowIso(),
    client: { first, last, name: org || `${first} ${last}`, org: !!org, title: null, email: v('email'), phone: v('phone'), address, city },
    answers: { name: `${first} ${last}`, email: v('email'), phone: v('phone'), address, city, type: org ? 'commerce' : undefined },
    activity: [{ at: nowIso(), fr: `Portail créé par ${rep.name} (${tx(SOURCES[np.source])})`, en: `Portal created by ${rep.name} (${SOURCES[np.source].en})` }],
  });
  S.portals[slug] = p; S.order.push(slug);
  persist(p);
  shareModal(p, true);
  if (S.route.view === 'admin') { const k = $('#kanban'); if (k) k.outerHTML = kanbanHtml(portalList()); }
}
function smsText(p) {
  const rep = p.rep || repFor(p.branch), fn = p.client.first || firstName(p.client.name);
  return t(`Bonjour ${fn}, ici ${rep.team ? 'l’équipe' : firstName(rep.name)} de MBM Gestion parasitaire. Comme promis, voici votre espace personnalisé : ${portalLink(p)}\nCode : ${p.code}\nÇa prend 5 minutes et votre plan d’action se calcule tout seul. L’inspection est gratuite.`,
    `Hi ${fn}, it’s ${rep.team ? 'the team' : firstName(rep.name)} from MBM Gestion parasitaire. As promised, here is your personal space: ${portalLink(p)}\nCode: ${p.code}\nIt takes 5 minutes and your action plan prices itself. The inspection is free.`);
}
function shareModal(p, fresh) {
  const link = portalLink(p), sms = smsText(p);
  openModal(`<div class="modal__head"><div class="stack" style="gap:4px"><p class="eyebrow">${fresh ? t('Portail prêt', 'Portal ready') : t('Partager le portail', 'Share the portal')}</p><h2 class="h3">${esc(householdOf(p))}</h2></div><button class="iconbtn" data-action="close-modal" aria-label="${t('Fermer', 'Close')}">${icon('x')}</button></div>
    <div class="ready"><div class="ready__qr" role="img" aria-label="${t('Code QR du portail', 'Portal QR code')}">${qrSvg(link)}</div>
      <div class="stack" style="gap:12px">
        <p class="small" style="margin:0">${t('Sur la tablette, sur le pas de la porte : le client scanne le code et tombe directement sur son évaluation.', 'On the tablet, at the door: the client scans the code and lands right on their assessment.')}</p>
        <div class="field"><span class="field__label">${t('Code d’accès', 'Access code')}</span><div class="copyline"><span>${esc(p.code)}</span><button class="btn btn--xs btn--ghost" data-action="copy" data-text="${esc(p.code)}">${icon('copy')}${t('Copier', 'Copy')}</button></div></div>
        <div class="field"><span class="field__label">${t('Lien', 'Link')}</span><div class="copyline"><span>${esc(link)}</span><button class="btn btn--xs btn--ghost" data-action="copy" data-text="${esc(link)}">${icon('copy')}${t('Copier', 'Copy')}</button></div></div>
      </div>
    </div>
    <div class="field"><span class="field__label">${t('Texto prêt à envoyer', 'Text message, ready to send')}</span><div class="smsbox">${esc(sms)}</div><button class="btn btn--sm btn--ghost" style="justify-self:start" data-action="copy" data-text="${esc(sms)}">${icon('copy')}${t('Copier le texto', 'Copy the text')}</button></div>
    <div class="row"><a class="btn btn--ink" href="#${esc(p.slug)}" data-action="close-modal">${icon('eye')}${t('Ouvrir le portail', 'Open the portal')}</a>${fresh ? `<a class="btn btn--ghost" href="#admin-${esc(p.slug)}" data-action="close-modal">${t('Voir le dossier', 'See the file')}</a>` : ''}</div>`);
}

/* ============ Follow-up drafts ============ */
function templateFollowup(p, ch) {
  const fn = p.client.first || firstName(p.client.name), rep = p.rep || repFor(p.branch), r = rep.team ? 'l’équipe' : firstName(rep.name), link = portalLink(p), q = quote(p);
  const recs = recommendations(p).filter((x) => isSelected(p, x.key)).map((x) => tx(ADD[x.key].name).toLowerCase());
  const tk = (p.onboarding && p.onboarding.tasks) || {}, left = obTasks(p).filter((x) => x.owner === 'you' && !tk[x.id]).length;
  const v = p.visit;
  const fr = {
    1: `Bonjour ${fn}, ici ${r} de MBM Gestion parasitaire. Votre évaluation vous attend : 5 minutes, et votre plan d’action se calcule tout seul. L’inspection est gratuite. ${link} (code : ${p.code})`,
    2: `Bonjour ${fn}, votre plan d’action est prêt : ${fmtMoney(q.monthly)} par mois + tx${recs.length ? `, avec ${listJoin(recs)}` : ''}. Je peux passer faire l’inspection gratuite cette semaine. Choisissez votre plage ici : ${link}`,
    3: v ? `Bonjour ${fn}, petit rappel : on passe ${visitWhen(v)} pour l’inspection. ${v.presence === 'non' ? 'Pas besoin d’être là pour l’extérieur, je vous laisse le compte rendu avec photos.' : 'Au plaisir de vous rencontrer !'}` : `Bonjour ${fn}, il ne reste qu’à réserver votre inspection gratuite (30 à 45 minutes). Les plages de la semaine sont ici : ${link}`,
    4: `Bonjour ${fn}, merci pour l’inspection ! Votre entente est prête à signer en ligne, ça prend une minute. Les traitements commencent dans les 48 heures suivant la signature : ${link}`,
    5: `Bonjour ${fn}, bienvenue chez MBM ! ${left ? `Il vous reste ${left} petite${left > 1 ? 's' : ''} chose${left > 1 ? 's' : ''} à préparer` : 'Tout est prêt de votre côté'} avant la première intervention : ${link}`,
  };
  const en = {
    1: `Hi ${fn}, it’s ${rep.team ? 'the team' : firstName(rep.name)} from MBM Gestion parasitaire. Your assessment is waiting: 5 minutes and your action plan prices itself. The inspection is free. ${link} (code: ${p.code})`,
    2: `Hi ${fn}, your action plan is ready: ${fmtMoney(q.monthly)} a month + tax${recs.length ? `, including ${listJoin(recs)}` : ''}. I can come by for the free inspection this week. Pick your slot here: ${link}`,
    3: v ? `Hi ${fn}, a quick reminder: we’re coming by ${visitWhen(v)} for the inspection. ${v.presence === 'non' ? 'No need to be home for the outside, I’ll leave you the summary with photos.' : 'Looking forward to meeting you!'}` : `Hi ${fn}, all that’s left is to book your free inspection (30 to 45 minutes). This week’s slots are here: ${link}`,
    4: `Hi ${fn}, thanks for the inspection! Your agreement is ready to sign online, it takes a minute. Treatments start within 48 hours of signing: ${link}`,
    5: `Hi ${fn}, welcome to MBM! ${left ? `You have ${left} small thing${left > 1 ? 's' : ''} left to prepare` : 'Everything is ready on your side'} before the first treatment: ${link}`,
  };
  const fl = flowFollowup(p, { fn, r, link, left });
  const body = fl ? fl.body : (S.lang === 'en' ? en : fr)[p.stage];
  if (ch !== 'email') return body;
  const subj = fl ? fl.subj : { 1: t('Votre évaluation MBM', 'Your MBM assessment'), 2: t('Votre plan d’action est prêt', 'Your action plan is ready'), 3: t('Votre inspection gratuite', 'Your free inspection'), 4: t('Votre entente est prête à signer', 'Your agreement is ready to sign'), 5: t('Bienvenue chez MBM', 'Welcome to MBM') }[p.stage];
  return `${t('Objet', 'Subject')} : ${subj}\n\n${body}\n\n${rep.name}\n${repTitle(rep)} · MBM Gestion parasitaire\n${rep.phone} · ${t('urgence 24/7', '24/7 emergency')} ${MBM_LINE}`;
}
function flowFollowup(p, c) {
  const { fn, r, link, left } = c, q = quote(p);
  if (isRenewal(p)) {
    const R = RN(p), dl = fmtDate(renewDeadline(p), { day: 'numeric', month: 'long' }), n = seasonNo(p), adds = q.lines.filter((l) => renewKind(p, l.key) === 'new').map((l) => l.label.toLowerCase());
    const fr = {
      1: `Bonjour ${fn}, ici ${r} de MBM Gestion parasitaire. Votre bilan ${PREV} est prêt : ${(R.visits || []).length} visites, un indice de protection passé de ${(R.health || [])[0]} à ${(R.health || [])[1]}. Votre programme ${SEASON} vous attend au prix fidélité jusqu’au ${dl} : ${link} (code : ${p.code})`,
      2: `Bonjour ${fn}, votre programme ${SEASON} est prêt : ${fmtMoney(q.monthly)} par mois + tx au prix fidélité, jusqu’au ${dl}.${adds.length ? ` On ajoute ${listJoin(adds)}, selon ce qu’on a vu cet automne.` : ''} ${link}`,
      3: `Bonjour ${fn}, une dernière vérification avant de renouveler : quelque chose a changé chez vous cette année ? Deux minutes ici : ${link}`,
      4: `Bonjour ${fn}, votre renouvellement ${SEASON} est prêt à signer, ça prend une minute. Le prix fidélité tient jusqu’au ${dl} : ${link}`,
      5: `Bonjour ${fn}, merci de renouveler pour une ${ordinal(n, true)} année ! Première visite la semaine du 19 avril. ${left ? `Il vous reste ${left} petite${left > 1 ? 's' : ''} chose${left > 1 ? 's' : ''} à préparer` : 'Tout est prêt de votre côté'} : ${link}`,
    };
    const en = {
      1: `Hi ${fn}, it’s ${r} from MBM Gestion parasitaire. Your ${PREV} review is ready: ${(R.visits || []).length} visits, a protection score up from ${(R.health || [])[0]} to ${(R.health || [])[1]}. Your ${SEASON} program is waiting at the loyalty price until ${dl}: ${link} (code: ${p.code})`,
      2: `Hi ${fn}, your ${SEASON} program is ready: ${fmtMoney(q.monthly)} a month + tax at the loyalty price, until ${dl}. ${link}`,
      3: `Hi ${fn}, one last check before renewing: has anything changed at your place this year? Two minutes here: ${link}`,
      4: `Hi ${fn}, your ${SEASON} renewal is ready to sign, it takes a minute. The loyalty price holds until ${dl}: ${link}`,
      5: `Hi ${fn}, thanks for renewing for a ${ordinal(n)} year! First visit the week of April 19: ${link}`,
    };
    const subj = { 1: t(`Votre bilan ${PREV} est prêt`, `Your ${PREV} review is ready`), 2: t(`Votre programme ${SEASON}, au prix fidélité`, `Your ${SEASON} program, at the loyalty price`), 3: t('Quelque chose a changé chez vous ?', 'Has anything changed at your place?'), 4: t('Votre renouvellement est prêt à signer', 'Your renewal is ready to sign'), 5: t(`Merci pour cette ${ordinal(n, true)} année`, `Thank you for this ${ordinal(n)} year`) }[p.stage];
    return { body: (S.lang === 'en' ? en : fr)[p.stage], subj };
  }
  if (isTerm(p)) {
    const tm = TM(p), yn = termDone(p), cm = termCommits(p), met = cm.filter((x) => x.status === 'met').length, w = siteNoun(p, 2);
    const fr = {
      1: `Bonjour ${fn}, ici ${r} de MBM Gestion parasitaire. Le bilan de l’an ${yn} de votre entente est en ligne : ${termVisits(p)} interventions sur ${termVisits(p)}, ${met} engagements sur ${cm.length} atteints. ${link} (code : ${p.code})`,
      2: `Bonjour ${fn}, le rapport annuel ${PREV} par ${siteNoun(p, 1)} est prêt pour votre conseil d’administration, en PDF dans votre espace : ${link}`,
      3: `Bonjour ${fn}, le budget ${SEASON} (an ${termYearNo(p, SEASON)}) est prêt : ${fmtMoney(termAmount(p, SEASON), 0)} + tx selon l’entente, et ${termOpts(p).length} option(s) proposée(s) par nos experts. Je peux le présenter à votre conseil : ${link}`,
      4: `Bonjour ${fn}, l’approbation du budget ${SEASON} est prête à signer en ligne (avenant ${amendOf(p).no}) : ${link}`,
      5: `Bonjour ${fn}, merci ! Le budget ${SEASON} est approuvé. L’an ${termYearNo(p, SEASON)} commence la semaine du 19 avril dans vos ${sitesOf(p).length} ${w} : ${link}`,
    };
    const en = {
      1: `Hi ${fn}, it’s ${r} from MBM Gestion parasitaire. Your agreement’s year ${yn} review is online: ${termVisits(p)} of ${termVisits(p)} interventions, ${met} of ${cm.length} commitments met. ${link} (code: ${p.code})`,
      2: `Hi ${fn}, the ${PREV} annual report by ${siteNoun(p, 1)} is ready for your board, as a PDF in your space: ${link}`,
      3: `Hi ${fn}, the ${SEASON} budget (year ${termYearNo(p, SEASON)}) is ready: ${fmtMoney(termAmount(p, SEASON), 0)} + tax per the agreement, plus ${termOpts(p).length} option(s) from our experts. I can present it to your board: ${link}`,
      4: `Hi ${fn}, the ${SEASON} budget approval is ready to sign online (amendment ${amendOf(p).no}): ${link}`,
      5: `Hi ${fn}, thank you! The ${SEASON} budget is approved. Year ${termYearNo(p, SEASON)} starts the week of April 19 across your ${sitesOf(p).length} ${w}: ${link}`,
    };
    const subj = { 1: t(`Bilan de l’an ${yn} de votre entente`, `Your agreement’s year ${yn} review`), 2: t(`Rapport annuel ${PREV} pour votre conseil`, `${PREV} annual report for your board`), 3: t(`Budget ${SEASON} · an ${termYearNo(p, SEASON)}`, `${SEASON} budget · year ${termYearNo(p, SEASON)}`), 4: t(`Approbation du budget ${SEASON}`, `${SEASON} budget approval`), 5: t(`Budget ${SEASON} approuvé`, `${SEASON} budget approved`) }[p.stage];
    return { body: (S.lang === 'en' ? en : fr)[p.stage], subj };
  }
  return null;
}
function followupPrompt(p, ch) {
  const a = A(p), q = quote(p), rep = p.rep || repFor(p.branch);
  const facts = [
    `Client : ${householdOf(p)}, ${p.client.city}${isOrg(p) ? ' (client commercial)' : ''}. Prénom à utiliser : ${p.client.first || firstName(p.client.name)}.`,
    `Parcours : ${tx(flowOf(p))}. Étape actuelle : ${p.stage}/5 (${stepLabel(p.stage, p)}).`,
    isRenewal(p) ? `Renouvellement : client depuis ${p.since}, année ${PREV} de ${(RN(p).visits || []).length} visites, indice de protection de ${(RN(p).health || [])[0]} à ${(RN(p).health || [])[1]}, prix fidélité de ${quote(p).discPct} % jusqu’au ${fmtDate(renewDeadline(p), { day: 'numeric', month: 'long' })}.` : '',
    isTerm(p) ? `Entente pluriannuelle ${TM(p).no} (${TM(p).start} à ${TM(p).end}), ${sitesOf(p).length} ${siteNoun(p, 2)}; an ${termDone(p)} terminé; budget ${SEASON} : ${Math.round(termTotal(p))} $ avant taxes.` : '',
    a.submittedAt ? `Bâtiment : environ ${areaOf(p)} pi²; signes notés : ${(a.problems || []).map((k) => PROB[k] && PROB[k].fr).filter(Boolean).join(', ') || 'aucun'}; ce qui compte : ${(a.goals || []).map((k) => GOAL[k] && GOAL[k].fr).filter(Boolean).join(', ') || 'non précisé'}.` : 'L’évaluation n’est pas encore remplie.',
    a.submittedAt ? `Plan d’action : ${q.lines.map((l) => l.label).join(', ')}; ${Math.round(q.season - q.discount)} $ pour l’année, ${q.monthly.toFixed(2)} $ par mois, taxes en sus.` : '',
    p.visit ? `Inspection : ${visitWhen(p.visit)} (${p.visit.mode === 'video' ? 'appel vidéo' : 'sur place'}).` : '',
    p.signature ? `Entente signée le ${fmtDate(p.signature.signedAt)}.` : '',
    `Lien du portail : ${portalLink(p)} · code : ${p.code}.`,
    `Signataire : ${rep.name}, ${repTitle(rep)}, MBM Gestion parasitaire (${branchName(p.branch)}), ${rep.phone}. Ligne d’urgence 24/7 : ${MBM_LINE}.`,
  ].filter(Boolean).join('\n');
  return `Tu rédiges une relance pour un conseiller de MBM Gestion parasitaire, entreprise québécoise de gestion parasitaire responsable (bureaux à Longueuil et à Québec).
${facts}

Canal : ${ch === 'email' ? 'courriel, avec une ligne « Objet : … » puis 70 à 110 mots et la signature' : 'texto de 320 caractères au maximum, sans signature formelle'}.
Langue : ${S.lang === 'en' ? 'anglais canadien' : 'français québécois'}.
Ton : rassurant, discret, concret, sans pression. Mentionne un détail précis du dossier, et une seule action claire pour le client. Inclus le lien du portail si l’étape demande une action du client. N’invente aucun prix, aucune promotion ni aucune date.
Réponds seulement avec le message, sans guillemets ni commentaire.`;
}
