/* ============ Multi-year agreement: a follow-up space for a 3 or 4-year agreement ============ */
function termBlurbs(p) {
  const done = termDone(p), next = termYearNo(p, SEASON), w = siteNoun(p, 1);
  return {
    1: { fr: `${numWord(termLen(p), true)} années, une à une`, en: `${numWord(termLen(p))} years, one by one` },
    2: { fr: `l’an ${done}, ${w} par ${w}, engagements compris`, en: `year ${done}, ${w} by ${w}, commitments included` },
    3: { fr: `le montant de l’an ${next}, plus les options proposées`, en: `the year ${next} amount, plus the suggested options` },
    4: { fr: 'une approbation signée en ligne, prête pour votre conseil', en: 'an approval signed online, ready for your board' },
    5: { fr: 'interventions, rapports et facturation consolidée', en: 'interventions, reports and consolidated billing' },
  };
}
function termTitle(yn, N) {
  const left = N - yn;
  const done = yn === 1 ? t('Une année de faite.', 'One year done.') : t(`${cap1(numWord(yn, true))} années de faites.`, `${cap1(numWord(yn))} years done.`);
  const rest = left <= 0 ? t('<em>Le bilan final</em> est prêt.', '<em>The final review</em> is ready.') : left === 1 ? t('<em>Une</em> dernière à venir.', '<em>One</em> more to go.') : t(`<em>${cap1(numWord(left, true))}</em> à venir.`, `<em>${cap1(numWord(left))}</em> to go.`);
  return `${done} ${rest}`;
}
function termHanger(p, c) {
  const tm = TM(p), yn = termDone(p), N = termLen(p), v = termVisits(p), cm = termCommits(p), met = cm.filter((x) => x.status === 'met').length, ok = amendSigned(p), sites = sitesOf(p);
  return {
    tag: t(`Bilan annuel · an ${yn} sur ${N}`, `Annual review · year ${yn} of ${N}`), kick: t('Préparé pour', 'Prepared for'), name: p.client.name,
    where: (() => { const units = sites.reduce((s, x) => s + (Number(x.units) || 0), 0), cities = Array.from(new Set(sites.map((s) => s.city))); return `${sites.length} ${siteNoun(p, sites.length)} · ${units ? t(`${units} logements`, `${units} units`) : ''}${units ? ` · ${cities[0]}${cities.length > 1 ? t(' et environs', ' area') : ''}` : cities.join(', ')}`; })(),
    visit: t(`${esc(c.first)} est passé${c.e} à votre bureau`, `${esc(c.first)} stopped by your office`),
    checks: [[true, t(`${v} interventions sur ${v} en ${PREV}`, `${v} of ${v} interventions in ${PREV}`)], [true, t(`Engagements : ${met} sur ${cm.length} atteints`, `Commitments: ${met} of ${cm.length} met`)],
      [ok, ok ? t(`Budget ${SEASON} approuvé`, `${SEASON} budget approved`) : t(`À vous : approuver le budget ${SEASON}`, `Your turn: approve the ${SEASON} budget`)]],
    coupon: t('Coupon · suivi d’entente', 'Coupon · agreement'), go: t('Détacher et ouvrir mon entente', 'Tear off and open my agreement'),
    kicker: t(`Entente ${tm.start}–${tm.end} · MBM ${esc(c.br)}`, `${tm.start}–${tm.end} agreement · MBM ${esc(c.br)}`),
    title: termTitle(yn, N),
    lede: t(`${esc(c.first)} a laissé ce bilan à votre bureau. Détachez le coupon : le bilan de l’an ${yn}, ${siteNoun(p, 1)} par ${siteNoun(p, 1)}, le budget ${SEASON} et l’approbation en ligne, prête pour votre conseil.`, `${esc(c.first)} left this review at your office. Tear off the coupon: the year ${yn} review, ${siteNoun(p, 1)} by ${siteNoun(p, 1)}, the ${SEASON} budget and the online approval, ready for your board.`),
    blurbs: termBlurbs(p), img: 'maison',
    seal: { top: t('An', 'Year'), big: `${yn}/${N}`, bot: `${tm.start}–${String(tm.end).slice(2)}` },
  };
}

/* ---------- Hero ---------- */
function termHero(p, step) {
  const tm = TM(p), yn = termDone(p), next = termYearNo(p, SEASON), N = termLen(p), n = sitesOf(p).length, w = siteNoun(p, n), rep = p.rep || repFor(p.branch), fr = rep.team ? t('votre conseiller', 'your advisor') : firstName(rep.name);
  const cm = termCommits(p), met = cm.filter((x) => x.status === 'met').length, ok = amendSigned(p);
  if (step === 1) return {
    kicker: t(`Entente ${tm.no} · an ${yn} sur ${N} terminé`, `Agreement ${tm.no} · year ${yn} of ${N} completed`),
    title: t('Votre entente, <em>année par année</em>.', 'Your agreement, <em>year by year</em>.'),
    sub: t(`${cap1(numWord(N, true))} années, ${numWord(n, p.sitesWord && p.sitesWord.fem)} ${w}, un seul dossier. Ce qui est prévu, ce qui est fait, ce qui reste, et ce que coûte chaque année, indexation comprise.`, `${cap1(numWord(N))} years, ${numWord(n)} ${w}, one file. What is planned, what is done, what is left, and what each year costs, indexation included.`),
    actions: [[t('Voir l’entente', 'See the agreement'), 'entente-sec', 'green'], p.stage >= 2 ? [t(`Bilan de l’an ${yn}`, `Year ${yn} review`), '@bilan', 'ghost'] : [t('Ce que couvre l’entente', 'What it covers'), 'couverture', 'ghost']] };
  if (step === 2) return {
    kicker: t(`Bilan de l’an ${yn} · ${n} ${w} · ${termVisits(p)} interventions`, `Year ${yn} review · ${n} ${w} · ${termVisits(p)} interventions`),
    title: t(`L’an ${yn}, <em>${siteNoun(p, 1)} par ${siteNoun(p, 1)}</em>.`, `Year ${yn}, <em>${siteNoun(p, 1)} by ${siteNoun(p, 1)}</em>.`),
    sub: t(`${met} engagements sur ${cm.length} atteints, l’indice de protection de chaque ${siteNoun(p, 1)} depuis l’évaluation, et la note de l’entomologiste. Le bilan que votre conseil va vous demander, prêt à télécharger.`, `${met} of ${cm.length} commitments met, each ${siteNoun(p, 1)}’s protection score since the evaluation, and the entomologist’s note. The review your board will ask for, ready to download.`),
    actions: [[t('Voir le bilan', 'See the review'), 'bilan-sec', 'green'], [t('Rapport PDF', 'PDF report'), '!term-report', 'ghost', 'download']] };
  if (step === 3) return {
    kicker: t(`Budget ${SEASON} · an ${next} de l’entente · indexation ${tm.indexPct} %`, `${SEASON} budget · year ${next} of the agreement · ${tm.indexPct}% indexation`),
    title: t(`Un budget <em>${SEASON}</em> sans surprise.`, `A <em>${SEASON}</em> budget with no surprises.`),
    sub: t(`Le montant de l’an ${next} est fixé par l’entente. Nos experts proposent ${numWord(termOpts(p).length, true)} option${termOpts(p).length > 1 ? 's' : ''}, chacune liée à une observation du bilan. Ajoutez-les ou non : le total se recalcule.`, `The year ${next} amount is set by the agreement. Our experts suggest ${numWord(termOpts(p).length)} option${termOpts(p).length > 1 ? 's' : ''}, each tied to an observation from the review. Add them or not: the total recalculates.`),
    actions: [[t('Voir le budget', 'See the budget'), 'budget-sec', 'green'], [t('Planifier la rencontre', 'Plan the meeting'), 'rencontre', 'ghost']] };
  if (step === 4) return {
    kicker: t(`Approbation · budget ${SEASON} · avenant ${amendOf(p).no}`, `Approval · ${SEASON} budget · amendment ${amendOf(p).no}`),
    title: ok ? t(`Budget ${SEASON} <em>approuvé</em>.`, `${SEASON} budget <em>approved</em>.`) : t(`Le budget ${SEASON}, <em>signé en ligne</em>.`, `The ${SEASON} budget, <em>signed online</em>.`),
    sub: ok ? t(`Merci ! ${cap1(fr)} contresigne et votre conseil reçoit la copie signée. L’an ${next} est lancé.`, `Thank you! ${cap1(fr)} countersigns and your board gets the signed copy. Year ${next} is under way.`) : t(`Le document reprend le montant de l’an ${next} et les options choisies. Signez-le ici; ${fr} le contresigne et votre conseil reçoit la copie.`, `The document repeats the year ${next} amount and the options you chose. Sign it here; ${fr} countersigns it and your board gets the copy.`),
    actions: [[ok ? t('Voir l’approbation signée', 'See the signed approval') : t('Lire et approuver', 'Read and approve'), 'agreement', 'green']] };
  if (step === 5) return {
    kicker: t(`Année ${SEASON} · an ${next} sur ${N} · ${n} ${w}`, `${SEASON} · year ${next} of ${N} · ${n} ${w}`),
    title: t(`L’an ${next}, <em>sur ${numWord(n, p.sitesWord && p.sitesWord.fem)} ${w}</em>.`, `Year ${next}, <em>across ${numWord(n)} ${w}</em>.`),
    sub: t(`Vos ${w} sont inscrits aux tournées de prévention. Rapports avec photos par ${siteNoun(p, 1)}, recommandations de nos experts et facturation consolidée : tout passe par ici, jusqu’en ${tm.end}.`, `Your ${w} are on the prevention routes. Photo reports by ${siteNoun(p, 1)}, recommendations from our experts and consolidated billing: it all happens here, until ${tm.end}.`),
    actions: [[t('L’entente en un coup d’œil', 'The agreement at a glance'), 'suite', 'green'], [t('Préparer l’année', 'Prepare the year'), 'preparer', 'ghost']] };
  return null;
}
function termCard(p, step) {
  const row = (k, v, cls = '') => `<div class="hc__row ${cls}"><span>${k}</span><b>${v}</b></div>`;
  const tm = TM(p), ys = termYears(p), yn = termDone(p), N = termLen(p);
  if (step === 1) {
    const billed = round2(ys.filter((y) => y <= PREV).reduce((s, y) => s + termAmount(p, y), 0));
    return `<aside class="hc" aria-label="${t('Votre entente', 'Your agreement')}"><div class="hc__head"><span>${t('Entente', 'Agreement')} ${esc(tm.no)}</span><span class="tag">${t(`An ${yn} sur ${N}`, `Year ${yn} of ${N}`)}</span></div>
      <div class="hc__years" aria-hidden="true">${ys.map((y) => `<i class="${y <= PREV ? 'is-done' : y === SEASON ? 'is-next' : ''}"><b>${y}</b></i>`).join('')}</div>
      <div class="hc__rows">${row(t(`Valeur sur ${N} ans`, `Value over ${N} years`), `${fmtMoney(termValue(p), 0)} ${t('+ tx', '+ tax')}`)}${row(t('Livré à ce jour', 'Delivered so far'), `${fmtMoney(billed, 0)} · ${Math.round((billed / termValue(p)) * 100)} %`)}${row(t('Fin de l’entente', 'Agreement ends'), fmtDate(`${tm.end}-12-31`, { day: 'numeric', month: 'long', year: 'numeric' }))}</div></aside>`;
  }
  if (step === 2) {
    const cm = termCommits(p), met = cm.filter((x) => x.status === 'met').length;
    return `<aside class="hc" aria-label="${t('Engagements', 'Commitments')}"><div class="hc__head"><span>${t('Engagements de l’entente', 'Agreement commitments')}</span><span class="tag ${met === cm.length ? 'tag--ok' : 'tag--info'}">${met}/${cm.length}</span></div>
      <ul class="hc__commits">${cm.map((c) => `<li class="is-${c.status}"><i>${c.status === 'met' ? icon('check') : ''}</i><span>${esc(tx(c.short || c))}</span><b class="num">${esc(c.value)}</b></li>`).join('')}</ul>
      <p class="hc__foot">${t(`Indice moyen : ${termHealth(p, 'base')} à l’évaluation, <b>${termHealth(p, PREV)}</b> en ${PREV}.`, `Average score: ${termHealth(p, 'base')} at the evaluation, <b>${termHealth(p, PREV)}</b> in ${PREV}.`)}</p></aside>`;
  }
  if (step === 3) {
    const tot = termTotal(p), prev = termAmount(p, PREV), opts = termOptsOn(p);
    return `<aside class="hc" aria-label="${t('Budget en bref', 'Budget at a glance')}"><div class="hc__head"><span>${t(`Budget ${SEASON}`, `${SEASON} budget`)}</span><span class="tag">${t(`An ${termYearNo(p, SEASON)}`, `Year ${termYearNo(p, SEASON)}`)}</span></div>
      <div class="hc__money"><b class="num" data-count="${tot}" data-fmt="money">${fmtMoney(tot)}</b><span class="small">${t('avant taxes, pour l’année', 'before tax, for the year')}</span></div>
      <div class="hc__rows">${row(t('Montant de l’entente', 'Agreement amount'), fmtMoney(termAmount(p, SEASON), 0))}${row(t(`Options choisies (${opts.length})`, `Chosen options (${opts.length})`), opts.length ? `+ ${fmtMoney(termOptTotal(p), 0)}` : '—')}${row(t(`En ${PREV}`, `In ${PREV}`), fmtMoney(prev, 0))}</div>
      <p class="hc__foot">${tm.budgetAt ? `${t('Accepté le', 'Accepted')} ${fmtDate(tm.budgetAt, { day: 'numeric', month: 'long' })}` : t(`Indexation de ${tm.indexPct} % prévue à l’entente.`, `${tm.indexPct}% indexation set in the agreement.`)}</p></aside>`;
  }
  if (step === 4) {
    const am = amendOf(p), s = am.signature;
    return `<aside class="hc" aria-label="${t('Statut de l’approbation', 'Approval status')}"><div class="hc__head"><span>${t('Avenant', 'Amendment')} ${esc(am.no)}</span>${s ? `<span class="tag tag--ok">${icon('check')}${t('Approuvé', 'Approved')}</span>` : `<span class="tag tag--warn">${t('À signer', 'To sign')}</span>`}</div>
      <div class="hc__rows">${row(t('Entente', 'Agreement'), esc(tm.no))}${row(t(`Budget ${SEASON}`, `${SEASON} budget`), `${fmtMoney(termTotal(p), 0)} ${t('+ tx', '+ tax')}`)}${row(t('Options', 'Options'), String(termOptsOn(p).length))}${s ? row(t('Approuvé par', 'Approved by'), `${esc(s.name)}, ${fmtDateShort(s.signedAt)}`) : row(t('Signataire', 'Signatory'), esc(`${p.client.first} ${p.client.last}`))}</div>
      ${s ? `<p class="hc__foot">${am.countersigned ? `${t('Contresigné par', 'Countersigned by')} ${esc(am.countersigned.name)}.` : t('Contresignature dans les minutes qui suivent.', 'Countersignature within minutes.')}</p>` : ''}</aside>`;
  }
  return null;
}
function termChip(p, step) {
  const tm = TM(p);
  if (step === 1) return `<span>${t('Entente', 'Agreement')}</span><b>${tm.start} – ${tm.end}</b>`;
  if (step === 2) return `<span>${t('Indice moyen', 'Average score')}</span><b>${termHealth(p, 'base')} → ${termHealth(p, PREV)}<small>/100</small></b>`;
  if (step === 3) return `<span>${t('Indexation', 'Indexation')}</span><b>+${tm.indexPct}<small>${t(' %', '%')}</small></b>`;
  if (step === 4) return `<span>${t('Avenant', 'Amendment')}</span><b>${esc(amendOf(p).no)}</b>`;
  return null;
}

/* ---------- Step 1: the agreement, year by year ---------- */
function yearsHtml(p) {
  const tm = TM(p), ys = termYears(p), N = ys.length, ok = amendSigned(p), target = tm.target || 80, v = termVisits(p);
  const cards = ys.map((y, i) => {
    const past = y <= PREV, cur = y === SEASON, last = y === tm.end, st = past ? 'done' : cur ? 'next' : 'future', h = past ? termHealth(p, y) : null;
    const status = past ? `${icon('check')}${t('Terminée', 'Completed')}` : cur ? (ok ? `${icon('check')}${t('Budget approuvé', 'Budget approved')}` : tm.budgetAt ? t('Approbation à signer', 'Approval to sign') : t('Budget à approuver', 'Budget to approve')) : t('À venir', 'Upcoming');
    const kv = [[t('Budget', 'Budget'), fmtMoney(cur ? termTotal(p, y) : termAmount(p, y), 0)], [t('Interventions', 'Interventions'), past ? `${v}/${v}` : t(`${v} prévues`, `${v} planned`)], [t('Indice moyen', 'Average score'), h != null ? `${h}/100` : t(`cible ${target}`, `target ${target}`)]];
    const foot = last ? t(`Fin de l’entente · 31 déc. ${y}`, `Agreement ends · Dec 31, ${y}`) : cur ? t('Vous êtes ici', 'You are here') : '';
    return `<article class="ycard is-${st} reveal" style="--d:${i * 80}ms"><div class="ycard__top"><span class="ycard__n">${t(`An ${i + 1}`, `Year ${i + 1}`)}</span><span class="ycard__st">${status}</span></div><b class="ycard__y">${y}</b><dl class="ycard__kv">${kv.map(([k, x]) => `<div><dt>${k}</dt><dd class="num">${x}</dd></div>`).join('')}</dl>${foot ? `<span class="ycard__end">${foot}</span>` : ''}</article>`;
  }).join('');
  const done = ys.filter((y) => y <= PREV).length;
  return `<div class="years" style="--n:${N}"><div class="years__track" aria-hidden="true"><i style="width:${((done / N) * 100).toFixed(1)}%"></i>${ys.map((y, i) => `<span class="${y <= PREV ? 'is-done' : y === SEASON ? 'is-next' : ''}" style="left:${(((i + 0.5) / N) * 100).toFixed(1)}%"></span>`).join('')}</div><div class="years__grid">${cards}</div></div>`;
}
const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function whenLabel(a) {
  if (a.when.length > 1) return t(`${a.when.length} interventions`, `${a.when.length} treatments`);
  const m = Math.floor(a.when[0][0]) - 1;
  return t(`en ${MONTHS_FR[m]}`, `in ${MONTHS_EN[m]}`);
}
function scopeLine(p) {
  const adds = ADDONS.filter((a) => isSelected(p, a.key)).map((a) => (a.division === 'vext' ? tx(a.name) : tx(a.name).toLowerCase()));
  const n = sitesOf(p).length;
  return t(`Programme Protection${adds.length ? `, ${listJoin(adds)}` : ''}, dans ${numWord(n, p.sitesWord && p.sitesWord.fem)} ${siteNoun(p, n)}`, `Protection Program${adds.length ? `, ${listJoin(adds)}` : ''}, across ${numWord(n)} ${siteNoun(p, n)}`);
}
function termScopeHtml(p) {
  const adds = ADDONS.filter((a) => isSelected(p, a.key)), n = sitesOf(p).length;
  return `<article class="card stack scope reveal" style="gap:18px"><div class="row" style="justify-content:space-between"><b class="h4">${t('Le programme de chaque année', 'Each year’s program')}</b><span class="tag tag--info">${icon('building')}${n} ${esc(siteNoun(p, n))}</span></div>
    <ul class="incl">${BASE.includes.map((x) => `<li>${icon('check')}<span>${esc(tx(x))}</span></li>`).join('')}</ul>
    ${adds.length ? `<div class="scope__adds"><p class="eyebrow">${t('Inclus à l’entente', 'Included in the agreement')}</p><ul>${adds.map((a) => `<li>${a.division === 'vext' ? `<span class="tag tag--vext">${t('3 saisons', '3 seasons')}</span>` : icon('shield')}<b>${esc(tx(a.name))}</b><span>${esc(whenLabel(a))}</span></li>`).join('')}</ul></div>` : ''}
  </article>`;
}
function termSitesHtml(p) {
  return `<ul class="sites reveal">${sitesOf(p).map((s, i) => `<li class="site"><span class="site__n">${i + 1}</span><div class="site__txt"><b>${esc(tx(s.name))}</b><span>${esc(s.address)}, ${esc(s.city)}</span></div><div class="site__meta"><b class="num">${esc(fmtArea(s.area))}</b><span>${s.units ? t(`${s.units} logements`, `${s.units} units`) : t(`${s.trees} stations`, `${s.trees} stations`)}</span></div><span class="tag">${t(`Depuis ${s.since}`, `Since ${s.since}`)}</span></li>`).join('')}</ul>`;
}
function termCondHtml(p) {
  const tm = TM(p), N = termLen(p), s = p.signature, rep = p.rep || repFor(p.branch), terms = (p.billing && p.billing.terms) || 30;
  const go = p.stage <= 1 && !tm.overviewAt ? `<button class="btn btn--green btn--block" data-action="term-seen">${t(`Voir le bilan de l’an ${termDone(p)}`, `See the year ${termDone(p)} review`)}${icon('arrowR')}</button>` : `<a class="btn btn--green btn--block" href="#${p.slug}-bilan">${t(`Voir le bilan de l’an ${termDone(p)}`, `See the year ${termDone(p)} review`)}${icon('arrowR')}</a>`;
  return `<div class="card stack reveal" style="gap:14px"><div class="row" style="justify-content:space-between"><p class="eyebrow">${t('Conditions', 'Terms')}</p>${vdBadge()}</div>
      <dl class="kv kv--tight"><dt>${t('N°', 'No.')}</dt><dd class="mono">${esc(tm.no)}</dd><dt>${t('Signée', 'Signed')}</dt><dd>${s ? `${esc(fmtDate(s.signedAt, { day: 'numeric', month: 'long', year: 'numeric' }))} · ${esc(s.name)}${p.countersigned ? `, ${esc(p.countersigned.name)}` : ''}` : '—'}</dd>
        <dt>${t('Durée', 'Term')}</dt><dd>${t(`${cap1(numWord(N, true))} années, ${tm.start} à ${tm.end}`, `${cap1(numWord(N))} years, ${tm.start} to ${tm.end}`)}</dd><dt>${t('Indexation', 'Indexation')}</dt><dd>${t(`${tm.indexPct} % par année, au 1er janvier`, `${tm.indexPct}% a year, on January 1`)}</dd>
        <dt>${t('Révision', 'Review')}</dt><dd>${t('Bilan et budget chaque novembre', 'Review and budget every November')}</dd><dt>${t('Facturation', 'Billing')}</dt><dd>${t(`Consolidée après chaque visite, net ${terms}`, `Consolidated after each visit, net ${terms}`)}</dd>
        <dt>${t('Résiliation', 'Termination')}</dt><dd>${t('Préavis de 90 jours avant une année', '90 days’ notice before a year')}</dd><dt>${t('Contact', 'Contact')}</dt><dd>${esc(rep.name)}</dd></dl></div>
    <div class="card stack reveal" style="gap:12px"><p class="eyebrow">${t('Engagements de MBM', 'MBM’s commitments')}</p><ul class="cmini">${termCommits(p).map((c) => `<li class="is-${c.status}"><i>${c.status === 'met' ? icon('check') : ''}</i><span>${esc(tx(c))}</span></li>`).join('')}</ul>${go}</div>`;
}
function viewTermAgreement(p) {
  const tm = TM(p), N = termLen(p);
  return `${viewHero(p, 1)}
  <section class="section" id="entente-sec"><div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">${t(`Entente ${tm.no} · ${tm.start} – ${tm.end}`, `Agreement ${tm.no} · ${tm.start} – ${tm.end}`)}</p><h2 class="h2">${t(`${cap1(numWord(N, true))} années, <em>une seule entente</em>.`, `${cap1(numWord(N))} years, <em>one agreement</em>.`)}</h2><p class="lede">${t(`Chaque année a son budget, indexé de ${tm.indexPct} % au 1er janvier, et son bilan. Vous êtes à la fin de l’an ${termDone(p)} : le budget de l’an ${termYearNo(p, SEASON)} est prêt.`, `Each year has its budget, indexed ${tm.indexPct}% on January 1, and its review. You are at the end of year ${termDone(p)}: the year ${termYearNo(p, SEASON)} budget is ready.`)}</p></div>
    ${yearsHtml(p)}
  </div></section>
  <section class="section" id="couverture"><div class="wrap split">
    <div class="stack" style="gap:22px">
      <div class="section-head reveal" style="margin:0"><p class="eyebrow">${t('Ce que couvre l’entente', 'What the agreement covers')}</p><h2 class="h2">${t(`Chaque année, <em>dans chaque ${siteNoun(p, 1)}</em>.`, `Every year, <em>in every ${siteNoun(p, 1)}</em>.`)}</h2></div>
      ${termScopeHtml(p)}
      ${termSitesHtml(p)}
    </div>
    <aside class="sticky stack" style="gap:16px">${termCondHtml(p)}</aside>
  </div></section>`;
}

/* ---------- Step 2: last year's review, building by building ---------- */
const COMMIT_ST = { met: { fr: 'Atteint', en: 'Met', cls: 'ok' }, track: { fr: 'En bonne voie', en: 'On track', cls: 'info' }, risk: { fr: 'À risque', en: 'At risk', cls: 'alert' } };
function commitHtml(c, i) {
  const st = COMMIT_ST[c.status] || COMMIT_ST.met;
  return `<article class="commit is-${c.status} reveal" style="--d:${i * 60}ms"><div class="commit__top"><span class="commit__ic">${icon(c.icon)}</span><span class="tag tag--${st.cls}">${c.status === 'met' ? icon('check') : ''}${esc(tx(st))}</span></div><b class="commit__v num">${esc(c.value)}</b><p class="commit__l">${esc(tx(c))}</p><span class="commit__s">${esc(c.sub)}</span></article>`;
}
function sparkHtml(vals, target) {
  const W = 560, H = 128, px = 12, py = 14, lo = 40, hi = 100, n = vals.length;
  const X = (i) => px + (n > 1 ? (i * (W - px * 2)) / (n - 1) : (W - px * 2) / 2);
  const Y = (v) => H - py - ((clamp(v, lo, hi) - lo) / (hi - lo)) * (H - py * 2);
  const pts = vals.map((v, i) => [X(i), Y(v)]);
  const d = pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('');
  const area = `${d}L${pts[n - 1][0].toFixed(1)} ${H - py}L${pts[0][0].toFixed(1)} ${H - py}Z`;
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path class="spark__area" d="${area}"/><path class="spark__target" d="M${px} ${Y(target).toFixed(1)}H${W - px}"/><path class="spark__line" d="${d}"/>${pts.map((q, i) => `<circle class="spark__pt ${i === n - 1 ? 'is-last' : ''}" cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${i === n - 1 ? 7 : 5}"/>`).join('')}</svg>`;
}
function bldgHtml(p, s, i) {
  const tm = TM(p), target = tm.target || 80, ys = termYears(p).filter((y) => y <= PREV), b = siteHealth(p, s.id, 'base');
  const vals = [b].concat(ys.map((y) => siteHealth(p, s.id, y))).filter((v) => v != null), last = vals[vals.length - 1], ok = last >= target;
  const labels = [t(`Éval. ${tm.start - 1}`, `Eval. ${tm.start - 1}`)].concat(ys.map(String)), note = (tm.notes || {})[s.id];
  const per = Math.round(termVisits(p) / Math.max(1, sitesOf(p).length)), calls = ((tm.callsBy || {})[PREV] || {})[s.id];
  return `<article class="bldg reveal" style="--d:${i * 70}ms">
    <div class="bldg__top"><span class="site__n">${i + 1}</span><div class="site__txt"><b>${esc(tx(s.name))}</b><span>${esc(s.address)} · ${esc(s.city)}</span></div><span class="tag ${ok ? 'tag--ok' : 'tag--warn'}">${ok ? `${icon('check')}${t(`${target} et plus`, `${target} and up`)}` : t(`Cible ${target}`, `Target ${target}`)}</span></div>
    <div class="bldg__score"><b class="num">${last}</b><span>/100</span><em class="${last - b >= 0 ? 'is-up' : ''}">${last - b >= 0 ? '+' : '−'}${Math.abs(last - b)} ${t('depuis l’évaluation', 'since the evaluation')}</em></div>
    ${sparkHtml(vals, target)}
    <div class="bldg__years">${labels.slice(0, vals.length).map((l, j) => `<span>${esc(l)}<b class="num">${vals[j]}</b></span>`).join('')}</div>
    <dl class="bldg__kv"><div><dt>${t('Superficie', 'Area')}</dt><dd>${esc(fmtArea(s.area))}</dd></div><div><dt>${t('Interventions', 'Interventions')}</dt><dd>${per}/${per}</dd></div><div><dt>${t('Appels', 'Calls')}</dt><dd>${calls != null ? calls : '—'}</dd></div></dl>
    ${note ? `<p class="bldg__note">${esc(tx(note))}</p>` : ''}
  </article>`;
}
const shortName = (a) => ({ exclusion: { fr: 'Exclusion', en: 'Exclusion' }, faune: { fr: 'Faune', en: 'Wildlife' }, punaises: { fr: 'Punaises', en: 'Bed bugs' }, rampants: { fr: 'Rampants', en: 'Crawlers' }, charpentieres: { fr: 'Charpentières', en: 'Carpenter ants' }, drains: { fr: 'Drains', en: 'Drains' }, odeurs: { fr: 'Odeurs', en: 'Odours' }, guepes: { fr: 'Guêpes', en: 'Wasps' }, bouclier: { fr: 'Bouclier', en: 'Shield' } }[a.key] || a.name);
function termTableHtml(p) {
  const sites = sitesOf(p), tm = TM(p), adds = ADDONS.filter((a) => isSelected(p, a.key) && !a.price.perUnit), callsBy = (tm.callsBy || {})[PREV] || {};
  const cols = [{ label: t('Prévention', 'Prevention'), n: 4 }].concat(adds.map((a) => ({ label: tx(shortName(a)), n: a.when.length })));
  const cell = (n) => `<td class="r num"><span class="tdone">${icon('check')}${n}/${n}</span></td>`;
  const totCalls = Object.values(callsBy).reduce((s, x) => s + x, 0);
  return `<div class="table-wrap"><table class="itable itable--term"><thead><tr><th>${esc(cap1(siteNoun(p, 1)))}</th>${cols.map((c) => `<th class="r">${esc(c.label)}</th>`).join('')}<th class="r">${t('Appels', 'Calls')}</th><th class="r">${t(`Indice ${PREV}`, `${PREV} score`)}</th></tr></thead>
    <tbody>${sites.map((s, i) => `<tr><td><b>${esc(tx(s.name))}</b><span>${esc(s.city)} · ${esc(fmtArea(s.area))}</span></td>${cols.map((c) => cell(c.n)).join('')}<td class="r num">${callsBy[s.id] != null ? callsBy[s.id] : '—'}</td><td class="r num"><b>${siteHealth(p, s.id, PREV) != null ? siteHealth(p, s.id, PREV) : '—'}</b></td></tr>`).join('')}</tbody>
    <tfoot><tr><td>${t('Total', 'Total')}</td>${cols.map((c) => `<td class="r num">${c.n * sites.length}/${c.n * sites.length}</td>`).join('')}<td class="r num">${totCalls || ((tm.calls || {})[PREV] || [0])[0]}</td><td class="r num">${termHealth(p, PREV)}</td></tr></tfoot>
  </table></div>`;
}
function viewTermReview(p) {
  const tm = TM(p), yn = termDone(p), n = sitesOf(p).length, w = siteNoun(p, n);
  const go = p.stage <= 2 && !tm.reviewAt ? `<button class="btn btn--green" data-action="term-ack">${t(`Passer au budget ${SEASON}`, `Go to the ${SEASON} budget`)}${icon('arrowR')}</button>` : `<a class="btn btn--green" href="#${p.slug}-budget">${t(`Voir le budget ${SEASON}`, `See the ${SEASON} budget`)}${icon('arrowR')}</a>`;
  return `${viewHero(p, 2)}
  <section class="section" id="engagements"><div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">${t(`Engagements de l’entente · bilan de l’an ${yn}`, `Agreement commitments · year ${yn} review`)}</p><h2 class="h2">${t('Ce qu’on a promis, <em>ce qu’on a livré</em>.', 'What we promised, <em>what we delivered</em>.')}</h2></div>
    <div class="commits">${termCommits(p).map(commitHtml).join('')}</div>
  </div></section>
  <section class="section" id="bilan-sec"><div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">${t(`Bilan ${PREV} · ${siteNoun(p, 1)} par ${siteNoun(p, 1)}`, `${PREV} review · ${siteNoun(p, 1)} by ${siteNoun(p, 1)}`)}</p><h2 class="h2">${t(`${cap1(numWord(n, p.sitesWord && p.sitesWord.fem))} ${w}, <em>${numWord(n)} bilans</em>.`, `${cap1(numWord(n))} ${w}, <em>${numWord(n)} reviews</em>.`)}</h2><p class="lede">${t(`L’indice de protection mesuré chaque automne depuis l’évaluation de ${tm.start - 1}, les interventions faites et la note de l’entomologiste. La ligne pointillée marque l’engagement de l’entente.`, `The protection score measured every fall since the ${tm.start - 1} evaluation, the interventions done and the entomologist’s note. The dotted line marks the agreement’s commitment.`)}</p></div>
    <div class="bldgs">${sitesOf(p).map((s, i) => bldgHtml(p, s, i)).join('')}</div>
  </div></section>
  <section class="section" id="interventions"><div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">${t(`Interventions ${PREV}`, `${PREV} interventions`)}</p><h2 class="h2">${t('Tout ce qui était prévu, <em>fait</em>.', 'Everything planned, <em>done</em>.')}</h2></div>
    <div class="card card--table reveal">${termTableHtml(p)}</div>
    <div class="term-go"><div class="stack" style="gap:4px"><b class="h4">${t(`Le rapport annuel ${PREV}, pour votre conseil`, `The ${PREV} annual report, for your board`)}</b><span class="small">${t(`Engagements, indice par ${siteNoun(p, 1)} et recommandations pour ${SEASON}, en un PDF.`, `Commitments, score by ${siteNoun(p, 1)} and recommendations for ${SEASON}, in one PDF.`)}</span></div><div class="row"><button class="btn btn--ghost" data-action="term-report">${icon('download')}${t('Télécharger le PDF', 'Download the PDF')}</button>${go}</div></div>
  </div></section>`;
}

/* ---------- Step 3: next year's budget ---------- */
function termBaseCardHtml(p) {
  const tm = TM(p), yn = termYearNo(p, SEASON), base = termAmount(p, SEASON), prev = termAmount(p, PREV), d = 1 - (Number(p.proposal.discountPct) || 0) / 100;
  const rows = siteQuote(p).map((s) => Object.assign({}, s, { v: round2(s.total * d) })), max = Math.max(1, ...rows.map((r) => r.v));
  return `<article class="basecard tbase">
    <div class="basecard__top"><div class="stack" style="gap:8px"><span class="row" style="gap:8px">${seal()}<span class="tag tag--ok">${icon('lock')}${t('Fixé par l’entente', 'Set by the agreement')}</span></span><h3 class="h3">${t(`Montant de l’an ${yn}`, `Year ${yn} amount`)}</h3><p class="small" style="margin:0">${esc(scopeLine(p))}</p></div>
      <div class="basecard__price"><b>${fmtMoney(base, 0)}</b><span class="small">${t(`${fmtMoney(prev, 0)} en ${PREV} · +${tm.indexPct} %`, `${fmtMoney(prev, 0)} in ${PREV} · +${tm.indexPct}%`)}</span></div></div>
    <ul class="sitesq__list">${rows.map((r) => `<li><div class="sitesq__name"><b>${esc(tx(r.name))}</b><span>${esc(r.city)} · ${esc(fmtArea(r.area))}</span></div><div class="sitesq__bar" aria-hidden="true"><i style="width:${Math.round((r.v / max) * 100)}%"></i></div><b class="num">${fmtMoney(r.v, 0)}</b></li>`).join('')}</ul>
  </article>`;
}
function termOptHtml(p, o) {
  const a = ADD[o.key], site = sitesOf(p).find((s) => s.id === o.site), ex = EXPERT[o.by] || EXPERTS[0], locked = amendSigned(p);
  return `<article class="addon topt ${o.on ? 'is-on' : ''}" data-opt="${esc(o.id)}">
    <div class="addon__main"><div class="addon__title"><b class="h4">${esc(tx(a.name))}${o.trees ? ` · ${t(`${o.trees} stations`, `${o.trees} stations`)}` : ''}</b>${site ? `<span class="tag tag--info">${icon('building')}${esc(tx(site.name))}</span>` : ''}${o.goal === 'health' ? `<span class="tag tag--alert">${t('Engagement de l’entente', 'Agreement commitment')}</span>` : ''}</div>
      <p class="addon__why">${icon(o.ev ? 'sparkle' : 'alert')}<span>${esc(tx(o.note))}</span></p>
      <span class="topt__by"><span class="avatar">${esc(initials(ex.name))}</span>${esc(ex.name)} · ${esc(tx(ex.role))}</span></div>
    <div class="addon__side"><span class="addon__price">${fmtMoney(termOptPrice(p, o), 0)}<small>${t('au tarif de l’entente', 'at the agreement rate')}</small></span><button class="switch" role="switch" aria-checked="${!!o.on}" data-action="term-opt" data-id="${esc(o.id)}" aria-label="${esc(tx(a.name))}" ${locked ? 'disabled' : ''}></button></div>
  </article>`;
}
function termReceiptHtml(p) {
  const tm = TM(p), yn = termYearNo(p, SEASON), base = termAmount(p, SEASON), prev = termAmount(p, PREV), opts = termOptsOn(p), tot = termTotal(p);
  const tps = round2(tot * TPS), tvq = round2(tot * TVQ), diff = prev ? ((tot - prev) / prev) * 100 : 0, signed = amendSigned(p), terms = (p.billing && p.billing.terms) || 30;
  const site = (o) => { const s = sitesOf(p).find((x) => x.id === o.site); return s ? tx(s.name) : ''; };
  const cta = signed ? `<a class="btn btn--green btn--block" href="#${p.slug}-saison">${t(`Voir l’année ${SEASON}`, `See ${SEASON}`)}${icon('arrowR')}</a>`
    : tm.budgetAt ? `<a class="btn btn--green btn--block" href="#${p.slug}-approbation">${t('Signer l’approbation', 'Sign the approval')}${icon('arrowR')}</a>`
      : `<button class="btn btn--green btn--block" data-action="term-approve">${t(`Accepter le budget ${SEASON}`, `Accept the ${SEASON} budget`)}${icon('arrowR')}</button>`;
  return `<div class="receipt" id="receipt">
    <div class="row" style="justify-content:space-between"><p class="eyebrow">${t(`Budget ${SEASON} · an ${yn}`, `${SEASON} budget · year ${yn}`)}</p>${signed ? `<span class="tag tag--ok">${icon('check')}${t('Approuvé', 'Approved')}</span>` : tm.budgetAt ? `<span class="tag tag--ok">${icon('check')}${t('Accepté', 'Accepted')}</span>` : `<span class="tiny mono">${esc(tm.no)}</span>`}</div>
    <div class="receipt__month"><div><b>${fmtMoney(tot, 0)}</b> <span>${t('+ tx, l’année', '+ tax, the year')}</span></div><span>${t('facturé après chaque visite', 'billed after each visit')}</span></div>
    <div class="receipt__rows">
      <div class="receipt__row"><span>${t(`Montant de l’an ${yn} (entente)`, `Year ${yn} amount (agreement)`)}</span><span>${fmtMoney(base)}</span></div>
      ${opts.map((o) => `<div class="receipt__row"><span>${esc(tx(ADD[o.key].name))} · ${esc(site(o))}</span><span>${fmtMoney(termOptPrice(p, o))}</span></div>`).join('')}
      <div class="receipt__row is-sub"><span>${t(`Budget ${SEASON}`, `${SEASON} budget`)}</span><span>${fmtMoney(tot)}</span></div>
      <div class="receipt__row"><span>${t('TPS', 'GST')}</span><span>${fmtMoney(tps)}</span></div>
      <div class="receipt__row"><span>${t('TVQ', 'QST')}</span><span>${fmtMoney(tvq)}</span></div>
      <div class="receipt__row is-total"><span>${t('Total, taxes incluses', 'Total, tax included')}</span><span>${fmtMoney(round2(tot + tps + tvq))}</span></div>
    </div>
    <dl class="kv kv--doc"><dt>${t(`Par rapport à ${PREV}`, `Compared with ${PREV}`)}</dt><dd>${diff >= 0 ? '+' : '−'}${fmtPct(Math.abs(diff))}</dd><dt>${t('dont l’indexation', 'of which indexation')}</dt><dd>+${fmtPct(tm.indexPct, 0)}</dd><dt>${t('Modalités', 'Terms')}</dt><dd>${t(`Net ${terms} jours`, `Net ${terms} days`)}</dd></dl>
    ${cta}
    <p class="tiny" style="margin:0">${t(`Les options valent pour ${SEASON} seulement : elles ne reviennent en ${SEASON + 1} qu’avec votre accord.`, `Options apply to ${SEASON} only: they come back in ${SEASON + 1} only with your approval.`)}</p>
  </div>`;
}
function meetHtml(p) {
  const tm = TM(p), rep = p.rep || repFor(p.branch), m = tm.meeting;
  const mode = (x) => (x === 'site' ? t('À votre bureau', 'At your office') : t('Visioconférence', 'Video call'));
  const when = (iso) => { const d = parseDay(iso); return { day: cap1(d.toLocaleDateString(loc(), { weekday: 'long', day: 'numeric', month: 'long' })), short: cap1(d.toLocaleDateString(loc(), { weekday: 'short', day: 'numeric', month: 'short' })), hour: fmtHour(d.getHours(), d.getMinutes()), mon: d.toLocaleDateString(loc(), { month: 'short' }).replace('.', '').toUpperCase(), d: d.getDate() }; };
  if (m && !S.ui.meetEdit) {
    const w = when(m.at);
    return `<div class="meet__done"><span class="stamp">${icon('check')}${t('Rencontre confirmée', 'Meeting confirmed')}</span>
      <div class="hc__date"><div class="hc__cal"><span>${esc(w.mon)}</span><b>${w.d}</b></div><div><b class="h4">${esc(w.day)}</b><span class="small" style="display:block;margin-top:3px">${esc(w.hour)} · ${esc(mode(m.mode))} · 30 min</span></div></div>
      <p class="small" style="margin:0">${t(`${esc(firstName(rep.name))} vous envoie l’invitation, avec le bilan en PDF à joindre à l’ordre du jour de votre conseil.`, `${esc(firstName(rep.name))} sends you the invitation, with the review PDF to attach to your board’s agenda.`)}</p>
      <button class="btn btn--ghost btn--sm" style="justify-self:start" data-action="term-meet-edit">${t('Changer la date', 'Change the date')}</button></div>`;
  }
  return `<div class="stack" style="gap:16px"><div class="row" style="gap:12px;flex-wrap:nowrap"><span class="avatar avatar--lg">${esc(initials(rep.name))}</span><div class="stack" style="gap:2px"><b class="h4">${esc(rep.name)}</b><span class="small">${esc(repTitle(rep))} · MBM ${esc(branchName(p.branch))}</span></div></div>
    <div class="windows windows--3">${(tm.slots || []).map((s) => { const w = when(s.at); return `<button type="button" class="window" data-action="term-meet" data-v="${esc(s.at)}" ${pressed(m && m.at === s.at)}><b>${esc(w.day)}</b><span>${esc(w.hour)} · ${esc(mode(s.mode))}</span></button>`; }).join('')}</div>
    <p class="tiny" style="margin:0">${t('Heure de l’Est. Une autre date vous convient mieux ? Écrivez-lui directement.', 'Eastern Time. Another date works better? Write to them directly.')}</p></div>`;
}
function projectionHtml(p) {
  const tm = TM(p), ys = termYears(p), vals = ys.map((y) => ({ y, base: termAmount(p, y), opt: y === SEASON ? termOptTotal(p) : 0 })), max = Math.max(...vals.map((v) => v.base + v.opt)) * 1.2;
  return `<div class="section-head reveal"><p class="eyebrow">${t('Projection', 'Projection')}</p><h2 class="h2">${t(`Jusqu’en ${tm.end}, <em>sans surprise</em>.`, `Until ${tm.end}, <em>no surprises</em>.`)}</h2><p class="lede">${t(`Chaque année suit l’indexation de ${tm.indexPct} % prévue à l’entente. Les options de ${SEASON} s’ajoutent cette année seulement.`, `Each year follows the ${tm.indexPct}% indexation set in the agreement. The ${SEASON} options apply this year only.`)}</p></div>
    <div class="card proj reveal"><div class="proj__bars" style="--n:${vals.length}">${vals.map((v) => {
    const st = v.y <= PREV ? 'is-done' : v.y === SEASON ? 'is-next' : '';
    const sub = v.y <= PREV ? t('livré', 'delivered') : v.y === SEASON ? t('budget proposé', 'proposed budget') : t(`indexé +${tm.indexPct} %`, `indexed +${tm.indexPct}%`);
    return `<div class="proj__col ${st}"><div class="proj__bar"><i style="height:${((v.base / max) * 100).toFixed(1)}%"></i>${v.opt ? `<em style="height:${((v.opt / max) * 100).toFixed(1)}%"></em>` : ''}<span class="proj__v num">${fmtMoney(v.base + v.opt, 0)}</span></div><span class="proj__y">${v.y}</span><span class="proj__s">${esc(sub)}</span></div>`;
  }).join('')}</div>
      <div class="proj__key"><span><i></i>${t('Montant de l’entente', 'Agreement amount')}</span><span><i class="is-opt"></i>${t(`Options ${SEASON}`, `${SEASON} options`)}</span><span class="tiny">${t(`Avant taxes. Valeur de l’entente : ${fmtMoney(termValue(p), 0)}.`, `Before tax. Agreement value: ${fmtMoney(termValue(p), 0)}.`)}</span></div></div>`;
}
function viewTermBudget(p) {
  const tm = TM(p), yn = termYearNo(p, SEASON), rep = p.rep || repFor(p.branch);
  return `${viewHero(p, 3)}
  <section class="section" id="budget-sec"><div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">${t(`Budget ${SEASON} · an ${yn} de l’entente`, `${SEASON} budget · year ${yn} of the agreement`)}</p><h2 class="h2">${t(`Le montant de l’an ${yn}, <em>et ce qu’on propose</em>.`, `The year ${yn} amount, <em>and what we suggest</em>.`)}</h2><p class="lede">${t(`Le montant de base est fixé par l’entente : celui de ${PREV}, indexé de ${tm.indexPct} %. Les options viennent du bilan; chacune a sa raison et son prix. Ajoutez-les ou non, le total se recalcule.`, `The base amount is set by the agreement: the ${PREV} amount, indexed ${tm.indexPct}%. The options come from the review; each has its reason and its price. Add them or not, the total recalculates.`)}</p></div>
    <div class="split">
      <div class="prog" id="prog">
        ${termBaseCardHtml(p)}
        <p class="eyebrow" style="margin-top:10px">${t(`Options proposées pour ${SEASON}`, `Options suggested for ${SEASON}`)}</p>
        <div class="addons" id="term-opts">${termOpts(p).map((o) => termOptHtml(p, o)).join('')}</div>
      </div>
      <aside class="sticky" id="receipt-wrap">${termReceiptHtml(p)}</aside>
    </div>
  </div></section>
  <section class="section" id="rencontre"><div class="wrap split">
    <div class="section-head reveal" style="margin:0"><p class="eyebrow">${t('Présenter le budget', 'Presenting the budget')}</p><h2 class="h2">${t(`Votre conseil a des questions ? <em>${esc(firstName(rep.name))} y répond</em>.`, `Your board has questions? <em>${esc(firstName(rep.name))} answers them</em>.`)}</h2><p class="lede">${t(`Trente minutes, à votre bureau ou en visioconférence : le bilan de l’an ${termDone(p)}, le budget ${SEASON} et les options, présentés à votre conseil d’administration.`, `Thirty minutes, at your office or by video call: the year ${termDone(p)} review, the ${SEASON} budget and the options, presented to your board.`)}</p></div>
    <div class="card meet" id="meet">${meetHtml(p)}</div>
  </div></section>
  <section class="section" id="projection"><div class="wrap">${projectionHtml(p)}</div></section>`;
}
function refreshTermBudget(p) {
  $$('.topt[data-opt]').forEach((el) => { const o = termOpts(p).find((x) => x.id === el.dataset.opt); if (o) el.outerHTML = termOptHtml(p, o); });
  replaceEl('receipt', termReceiptHtml(p));
  const hc = $('.hero .hc'); if (hc) hc.outerHTML = heroCard(p, 3);
  const pj = $('#projection .wrap'); if (pj) { pj.innerHTML = projectionHtml(p); $$('.reveal', pj).forEach((e) => e.classList.add('is-in')); splitTitles(pj); }
}

/* ---------- Step 4: the annual approval (and amendment) ---------- */
function amendSections(p) {
  const tm = TM(p), am = amendOf(p), yn = termYearNo(p, SEASON), N = termLen(p), base = termAmount(p, SEASON), prev = termAmount(p, PREV), opts = termOptsOn(p), br = branchName(p.branch);
  const disc = Number(p.proposal.discountPct) || 0, terms = (p.billing && p.billing.terms) || 30, signed = p.signature ? fmtDate(p.signature.signedAt, { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
  const site = (o) => { const s = sitesOf(p).find((x) => x.id === o.site); return s ? tx(s.name) : ''; };
  const last = yn >= N;
  return [
    { title: t('Objet', 'Purpose'), paras: [t(`Le présent document approuve le budget de l’an ${yn} (année ${SEASON}) de l’entente ${tm.no}, conclue le ${signed} entre MBM Gestion parasitaire (${br}) et ${p.client.name}, pour les années ${tm.start} à ${tm.end}.`, `This document approves the year ${yn} budget (${SEASON}) of agreement ${tm.no}, made on ${signed} between MBM Gestion parasitaire (${br}) and ${p.client.name}, for ${tm.start} to ${tm.end}.`)] },
    { title: t(`Montant de l’an ${yn}`, `Year ${yn} amount`), paras: [t(`Conformément à l’entente, le montant de l’an ${yn} est celui de ${PREV} (${fmtMoney(prev)}), indexé de ${tm.indexPct} % : ${fmtMoney(base)}, avant taxes, pour le programme prévu sur les ${sitesOf(p).length} ${siteNoun(p, 2)}.`, `As set in the agreement, the year ${yn} amount is the ${PREV} amount (${fmtMoney(prev)}), indexed ${tm.indexPct}%: ${fmtMoney(base)}, before tax, for the planned program on the ${sitesOf(p).length} ${siteNoun(p, 2)}.`)] },
    { title: t(`Avenant ${am.no}`, `Amendment ${am.no}`), paras: [opts.length ? t(`Les services suivants s’ajoutent pour l’année ${SEASON} seulement, au tarif de l’entente${disc ? ` (rabais de ${disc} %)` : ''} :`, `The following services are added for ${SEASON} only, at the agreement rate${disc ? ` (${disc}% discount)` : ''}:`) : t(`Aucune option n’est ajoutée : le programme ${SEASON} suit l’entente.`, `No option is added: the ${SEASON} program follows the agreement.`)], rows: opts.map((o) => [`${tx(ADD[o.key].name)}${o.trees ? ` (${o.trees} ${t('stations', 'stations')})` : ''} · ${site(o)}`, termOptPrice(p, o)]) },
    { title: t(`Budget ${SEASON}`, `${SEASON} budget`), budget: true },
    { title: t('Facturation', 'Billing'), paras: [t(`Une facture consolidée est émise après chaque visite, avec le détail par ${siteNoun(p, 1)}, payable à ${terms} jours${am.po ? `, avec le bon de commande ${am.po}` : ''}. Les factures restent disponibles dans l’espace client.`, `A consolidated invoice is issued after each visit, itemized by ${siteNoun(p, 1)}, payable within ${terms} days${am.po ? `, with purchase order ${am.po}` : ''}. Invoices stay available in the client space.`)] },
    { title: t('Autres conditions', 'Other terms'), paras: [last ? t(`Toutes les autres conditions de l’entente ${tm.no} demeurent. L’entente prend fin le 31 décembre ${tm.end}; MBM présente le bilan des ${N} années et une proposition de renouvellement en septembre ${tm.end}.`, `All other terms of agreement ${tm.no} remain. The agreement ends on December 31, ${tm.end}; MBM presents the review of the ${N} years and a renewal proposal in September ${tm.end}.`) : t(`Toutes les autres conditions de l’entente ${tm.no} demeurent. Le bilan de l’an ${yn} et le budget de l’an ${yn + 1} seront présentés en novembre ${SEASON}.`, `All other terms of agreement ${tm.no} remain. The year ${yn} review and the year ${yn + 1} budget will be presented in November ${SEASON}.`)] },
  ];
}
function amendBudgetRows(p) {
  const tot = termTotal(p), tps = round2(tot * TPS), tvq = round2(tot * TVQ);
  return { rows: [[t(`Montant de l’an ${termYearNo(p, SEASON)}`, `Year ${termYearNo(p, SEASON)} amount`), termAmount(p, SEASON)]].concat(termOptsOn(p).map((o) => [tx(ADD[o.key].name), termOptPrice(p, o)])).concat([[t('TPS (5 %)', 'GST (5%)'), tps], [t('TVQ (9,975 %)', 'QST (9.975%)'), tvq]]), total: round2(tot + tps + tvq) };
}
function amendSigBlock(p, side) {
  const am = amendOf(p);
  if (side === 'client') {
    const s = am.signature;
    const mark = s ? (s.mode === 'draw' && safeImg(s.image) ? `<img src="${safeImg(s.image)}" alt="${t('Signature de', 'Signature of')} ${esc(s.name)}">` : `<span class="typed">${esc(s.text || s.name)}</span>`) : `<span class="pending">${t('En attente d’approbation', 'Awaiting approval')}</span>`;
    return `<div class="sig"><span class="tiny" style="color:#5A625C">${t('Pour', 'For')} ${esc(p.client.name)}</span><div class="sig__box">${mark}</div><span class="sig__who">${esc(s ? s.name : `${p.client.first} ${p.client.last}`)}</span><span class="sig__meta">${s ? `${t('Approuvé électroniquement le', 'Approved electronically on')} ${esc(fmtDateTime(s.signedAt))}<br>${t('Empreinte', 'Fingerprint')} ${esc(s.hash || '')}` : esc(tx(p.client.title || ''))}</span></div>`;
  }
  const c = am.countersigned, rep = p.rep || repFor(p.branch);
  return `<div class="sig"><span class="tiny" style="color:#5A625C">${t('Pour MBM Gestion parasitaire', 'For MBM Gestion parasitaire')}</span><div class="sig__box">${c ? `<span class="typed">${esc(c.name)}</span>` : `<span class="pending">${t('Contresigné après l’approbation', 'Countersigned after approval')}</span>`}</div><span class="sig__who">${esc(rep.name)}</span><span class="sig__meta">${c ? `${t('Contresigné le', 'Countersigned on')} ${esc(fmtDateTime(c.signedAt))}` : esc(repTitle(rep))}</span></div>`;
}
const amendSigsHtml = (p) => `<div class="sigs" id="sigs">${amendSigBlock(p, 'client')}${amendSigBlock(p, 'vd')}</div>`;
function amendSignboxHtml(p) {
  const am = amendOf(p), yn = termYearNo(p, SEASON), tot = termTotal(p), terms = (p.billing && p.billing.terms) || 30;
  const rows = [[t(`Montant de l’an ${yn}`, `Year ${yn} amount`), fmtMoney(termAmount(p, SEASON))], [t('Options ajoutées', 'Added options'), termOptsOn(p).length ? fmtMoney(termOptTotal(p)) : '—'], [t('Total, taxes incluses', 'Total, tax included'), fmtMoney(withTax(tot))], [t('Facturation', 'Billing'), t(`Consolidée, net ${terms} j`, `Consolidated, net ${terms} d`)]];
  const termsHtml = `<dl class="kv" style="grid-template-columns:minmax(0,1fr) auto">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd class="num" style="text-align:right;font-weight:650">${esc(v)}</dd>`).join('')}</dl>`;
  if (am.signature) {
    const s = am.signature;
    return `<aside class="card signbox sticky" id="signbox"><span class="stamp" style="justify-self:start">${icon('check')}${t('Approuvé', 'Approved')}</span><div><b class="h4">${t('Approuvé par', 'Approved by')} ${esc(s.name)}</b><p class="small" style="margin:6px 0 0">${esc(fmtDateTime(s.signedAt))}. ${am.countersigned ? `${t('Contresigné par', 'Countersigned by')} ${esc(am.countersigned.name)}.` : t('Contresignature en cours…', 'Countersignature in progress…')}</p></div>${termsHtml}
      ${window.jspdf ? `<button class="btn btn--ink btn--block" data-action="term-amend-pdf">${icon('download')}${t('Télécharger l’approbation (PDF)', 'Download the approval (PDF)')}</button>` : ''}
      <a class="btn btn--green btn--block" href="#${p.slug}-saison">${t(`Aller à l’année ${SEASON}`, `Go to ${SEASON}`)}${icon('arrowR')}</a></aside>`;
  }
  const mode = S.ui.signMode || 'draw', nm = S.ui.sigName != null ? S.ui.sigName : `${p.client.first} ${p.client.last}`, po = S.ui.amPo != null ? S.ui.amPo : am.po || '';
  return `<aside class="card signbox sticky" id="signbox"><div><b class="h4">${t(`Approuver le budget ${SEASON}`, `Approve the ${SEASON} budget`)}</b><p class="small" style="margin:6px 0 0">${t(`Votre signature approuve le budget ${SEASON} et l’avenant ${esc(am.no)}.`, `Your signature approves the ${SEASON} budget and amendment ${esc(am.no)}.`)}</p></div>${termsHtml}
    <div class="field"><label class="field__label" for="am-po">${t(`Bon de commande ${SEASON}`, `${SEASON} purchase order`)} <span class="opt">${t('facultatif', 'optional')}</span></label><input class="input mono" id="am-po" value="${esc(po)}" placeholder="${esc((p.billing && p.billing.po) || 'BC-…')}" autocomplete="off"></div>
    <div class="field"><label class="field__label" for="sig-name">${t('Nom complet', 'Full name')}</label><input class="input" id="sig-name" value="${esc(nm)}" autocomplete="name"></div>
    <div class="seg" role="group" aria-label="${t('Méthode de signature', 'Signature method')}"><button type="button" data-action="sign-mode" data-v="draw" ${pressed(mode === 'draw')}>${t('Dessiner', 'Draw')}</button><button type="button" data-action="sign-mode" data-v="type" ${pressed(mode === 'type')}>${t('Taper', 'Type')}</button></div>
    <div class="pad" id="sig-pad">${mode === 'draw' ? `<canvas id="sig-canvas" aria-label="${t('Zone de signature : signez avec la souris ou le doigt', 'Signature pad: sign with your mouse or finger')}"></canvas><span class="pad__hint">${t('Signez ici', 'Sign here')}</span>` : `<span class="pad__typed" id="sig-typed">${esc(nm)}</span>`}</div>
    ${mode === 'draw' ? `<button class="link small" style="justify-self:start" data-action="sig-clear">${t('Effacer', 'Clear')}</button>` : ''}
    <label class="check"><input type="checkbox" id="sig-agree"><span>${t(`Je suis autorisé à approuver ce budget au nom de ${esc(p.client.name.replace(/\.$/, ''))}.`, `I am authorized to approve this budget on behalf of ${esc(p.client.name.replace(/\.$/, ''))}.`)}</span></label>
    <p class="hanger__err" id="sig-err" role="alert"></p>
    <button class="btn btn--green btn--block" data-action="sign">${icon('pen')}${t('Approuver et signer', 'Approve and sign')}</button>
    <p class="tiny" style="margin:0">${t('On enregistre l’heure de signature et une empreinte du document. Votre conseil reçoit la copie signée.', 'We record the time of signature and a fingerprint of the document. Your board gets the signed copy.')}</p></aside>`;
}
function viewTermApproval(p) {
  const tm = TM(p), am = amendOf(p), yn = termYearNo(p, SEASON), money = (v) => fmtMoney(v);
  const body = amendSections(p).map((s, i) => {
    let extra = '';
    if (s.rows && s.rows.length) extra = `<table><thead><tr><th>${t('Service ajouté', 'Added service')}</th><th class="r">${t('Montant', 'Amount')}</th></tr></thead><tbody>${s.rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="r">${money(v)}</td></tr>`).join('')}</tbody></table>`;
    if (s.budget) { const b = amendBudgetRows(p); extra = `<table><thead><tr><th>${t('Poste', 'Item')}</th><th class="r">${t('Montant', 'Amount')}</th></tr></thead><tbody>${b.rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="r">${money(v)}</td></tr>`).join('')}</tbody><tfoot><tr><td>${t('Total, taxes incluses', 'Total, tax included')}</td><td class="r">${money(b.total)}</td></tr></tfoot></table>`; }
    return `<h3><span>${i + 1}.</span>${esc(s.title)}</h3>${(s.paras || []).map((x) => `<p>${esc(x)}</p>`).join('')}${extra}`;
  }).join('');
  return `${viewHero(p, 4)}
  <section class="section" id="agreement"><div class="wrap"><div class="agree">
    <article class="paper" aria-label="${t('Approbation annuelle', 'Annual approval')}">
      <div class="paper__head"><div class="stack" style="gap:6px">${vdBadge(true)}<h2>${t(`Approbation annuelle · An ${yn} (${SEASON})`, `Annual approval · Year ${yn} (${SEASON})`)}</h2><p style="margin:0;color:#5A625C">${esc(p.client.name)} · ${t('Entente', 'Agreement')} ${esc(tm.no)}</p></div>
        <div class="paper__meta">${t('Avenant', 'Amendment')} ${esc(am.no)}<br>${t('Préparé le', 'Prepared')} ${esc(fmtDate(p.createdAt))}<br>${am.signature ? `${t('Approuvé le', 'Approved')} ${esc(fmtDate(am.signature.signedAt))}` : t('En attente d’approbation', 'Awaiting approval')}</div></div>
      ${body}
      ${amendSigsHtml(p)}
      <p class="paper__note">${t('Modèle de démonstration préparé par Winnia. Le texte final est à valider par MBM Gestion parasitaire et ses conseillers juridiques.', 'Demo template prepared by Winnia. The final text is to be validated by MBM Gestion parasitaire and its legal advisors.')}</p>
    </article>
    ${amendSignboxHtml(p)}
  </div></div></section>`;
}

/* ---------- Step 5 add-on: the agreement's years stay in view ---------- */
function termNextHtml(p) {
  const tm = TM(p), yn = termYearNo(p, SEASON), N = termLen(p), last = SEASON >= tm.end, rep = p.rep || repFor(p.branch);
  return `<section class="section" id="suite"><div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">${t(`Entente ${tm.no} · an ${yn} sur ${N}`, `Agreement ${tm.no} · year ${yn} of ${N}`)}</p><h2 class="h2">${last ? t('La dernière année <em>de l’entente</em>.', 'The agreement’s <em>last year</em>.') : t(`L’an ${yn}, <em>et la suite</em>.`, `Year ${yn}, <em>and what comes next</em>.`)}</h2></div>
    ${yearsHtml(p)}
    <p class="tiny" style="margin:16px 0 0">${last ? t(`L’entente prend fin le 31 décembre ${tm.end}. ${firstName(rep.name)} vous présente le bilan des ${N} années et une proposition de renouvellement en septembre.`, `The agreement ends on December 31, ${tm.end}. ${firstName(rep.name)} presents the review of the ${N} years and a renewal proposal in September.`) : t(`Prochain bilan et budget de l’an ${yn + 1} : novembre ${SEASON}. Fin de l’entente : 31 décembre ${tm.end}.`, `Next review and year ${yn + 1} budget: November ${SEASON}. Agreement ends: December 31, ${tm.end}.`)}</p>
  </div></section>`;
}

/* ---------- PDFs: the annual report for the board, the signed approval ---------- */
function pdfWriter(doc, m, startY) {
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  const st = { y: startY };
  const need = (h) => { if (st.y + h > H - 56) { doc.addPage(); st.y = m; } };
  return {
    st, W, H,
    h(txt) { need(72); st.y += 10; doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(11, 27, 38); doc.text(pdfText(txt), m, st.y); st.y += 8; doc.setDrawColor(221, 229, 234); doc.setLineWidth(0.8); doc.line(m, st.y, W - m, st.y); st.y += 16; },
    p(txt, size = 10, color = [38, 56, 69]) { doc.setFont('helvetica', 'normal'); doc.setFontSize(size); doc.setTextColor(...color); doc.splitTextToSize(pdfText(txt), W - m * 2).forEach((ln) => { need(size + 4); doc.text(ln, m, st.y); st.y += size + 4; }); st.y += 4; },
    row(k, v, bold) { need(16); doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(10); doc.setTextColor(11, 27, 38); doc.text(doc.splitTextToSize(pdfText(k), W - m * 2 - 160)[0], m + 6, st.y); doc.text(pdfText(v), W - m, st.y, { align: 'right' }); st.y += 15; },
    gap(n = 8) { st.y += n; },
    foot() { doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(93, 107, 117); doc.text(pdfText(t('Document de démonstration préparé par Winnia pour MBM Gestion parasitaire. Client, immeubles et montants fictifs.', 'Demo document prepared by Winnia for MBM Gestion parasitaire. Fictional client, buildings and amounts.')), m, H - 30); },
  };
}
function downloadTermReport(p) {
  if (!window.jspdf || !window.jspdf.jsPDF) { toast(t('Le PDF n’est pas disponible ici', 'The PDF is not available here')); return; }
  const tm = TM(p), doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'letter' }), m = 52, cm = termCommits(p), yn = termDone(p);
  const y0 = pdfHeader(doc, p, t(`BILAN ${PREV}`, `${PREV} REVIEW`), [[t('Entente', 'Agreement'), tm.no], [t('Année', 'Year'), t(`An ${yn} sur ${termLen(p)}`, `Year ${yn} of ${termLen(p)}`)], [t('Date', 'Date'), fmtDate(new Date())]], t('PRÉPARÉ POUR', 'PREPARED FOR'));
  const w = pdfWriter(doc, m, y0);
  w.h(t('Sommaire', 'Summary'));
  w.p(t(`${termVisits(p)} interventions prévues, ${termVisits(p)} faites sur ${sitesOf(p).length} ${siteNoun(p, 2)}. Indice de protection moyen : ${termHealth(p, 'base')} à l’évaluation de ${tm.start - 1}, ${termHealth(p, PREV)} à l’automne ${PREV}. ${cm.filter((c) => c.status === 'met').length} engagements sur ${cm.length} atteints.`, `${termVisits(p)} interventions planned, ${termVisits(p)} done across ${sitesOf(p).length} ${siteNoun(p, 2)}. Average protection score: ${termHealth(p, 'base')} at the ${tm.start - 1} evaluation, ${termHealth(p, PREV)} in the fall of ${PREV}. ${cm.filter((c) => c.status === 'met').length} of ${cm.length} commitments met.`));
  w.h(t('Engagements de l’entente', 'Agreement commitments'));
  cm.forEach((c) => { w.row(tx(c), `${c.value} · ${tx(COMMIT_ST[c.status] || COMMIT_ST.met)}`); w.p(c.sub, 9, [93, 107, 117]); });
  w.h(t(`Par ${siteNoun(p, 1)}`, `By ${siteNoun(p, 1)}`));
  sitesOf(p).forEach((s) => {
    const vals = [siteHealth(p, s.id, 'base')].concat(termYears(p).filter((y) => y <= PREV).map((y) => siteHealth(p, s.id, y))).filter((v) => v != null);
    w.row(`${tx(s.name)} · ${s.address}, ${s.city}`, `${vals.join(' > ')} /100`, true);
    const note = (tm.notes || {})[s.id]; if (note) w.p(tx(note), 9.5, [93, 107, 117]);
  });
  if (termOpts(p).length) {
    w.h(t(`Recommandations pour ${SEASON}`, `Recommendations for ${SEASON}`));
    termOpts(p).forEach((o) => { const s = sitesOf(p).find((x) => x.id === o.site); w.row(`${tx(ADD[o.key].name)}${s ? ` · ${tx(s.name)}` : ''}`, `${fmtMoney(termOptPrice(p, o))}${o.on ? '' : t(' (suggestion)', ' (suggestion)')}`); w.p(tx(o.note), 9.5, [93, 107, 117]); });
  }
  w.h(t(`Budget ${SEASON}`, `${SEASON} budget`));
  w.row(t(`Montant de l’an ${termYearNo(p, SEASON)} (indexé de ${tm.indexPct} %)`, `Year ${termYearNo(p, SEASON)} amount (indexed ${tm.indexPct}%)`), fmtMoney(termAmount(p, SEASON)));
  w.row(t('Options retenues', 'Chosen options'), fmtMoney(termOptTotal(p)));
  w.row(t('Total avant taxes', 'Total before tax'), fmtMoney(termTotal(p)), true);
  w.foot();
  saveFile(`bilan-${PREV}-${p.slug}.pdf`, doc.output('blob'), 'application/pdf');
}
function downloadAmendPdf(p) {
  if (!window.jspdf || !window.jspdf.jsPDF) { toast(t('Le PDF n’est pas disponible ici', 'The PDF is not available here')); return; }
  const tm = TM(p), am = amendOf(p), doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'letter' }), m = 52;
  const y0 = pdfHeader(doc, p, t('APPROBATION', 'APPROVAL'), [[t('Avenant', 'Amendment'), am.no], [t('Entente', 'Agreement'), tm.no], [t('Année', 'Year'), String(SEASON)]], t('CLIENT', 'CLIENT'));
  const w = pdfWriter(doc, m, y0);
  amendSections(p).forEach((s, i) => {
    w.h(`${i + 1}. ${s.title}`);
    (s.paras || []).forEach((x) => w.p(x));
    (s.rows || []).forEach(([k, v]) => w.row(k, fmtMoney(v)));
    if (s.budget) { const b = amendBudgetRows(p); b.rows.forEach(([k, v]) => w.row(k, fmtMoney(v))); w.row(t('Total, taxes incluses', 'Total, tax included'), fmtMoney(b.total), true); }
  });
  const s = am.signature, c = am.countersigned;
  w.h(t('Signatures', 'Signatures'));
  const lines = [s ? `${t('Approuvé par', 'Approved by')} ${s.name}, ${fmtDateTime(s.signedAt)} · ${t('empreinte', 'fingerprint')} ${s.hash || ''}` : t('En attente d’approbation', 'Awaiting approval'), c ? `${t('Contresigné par', 'Countersigned by')} ${c.name}, MBM ${branchName(p.branch)}, ${fmtDateTime(c.signedAt)}` : t('Contresignature à venir', 'Countersignature pending')];
  lines.forEach((l) => w.p(l, 9.5));
  w.foot();
  saveFile(`approbation-${SEASON}-${p.slug}.pdf`, doc.output('blob'), 'application/pdf');
}
