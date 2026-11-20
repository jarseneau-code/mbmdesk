/* ============ Annual renewal: same structure as a new client, for someone who already knows us ============ */
const RENEW_BLURBS = {
  1: { fr: 'vos visites, vos résultats, ce qu’on a vu', en: 'your visits, your results, what we saw' },
  2: { fr: 'le même programme, ajusté à votre maison', en: 'the same program, fitted to your home' },
  3: { fr: 'rénovation, sous-sol, bébé : dites-le-nous', en: 'renovation, basement, baby: tell us' },
  4: { fr: 'une signature, au prix fidélité', en: 'one signature, at the loyalty price' },
  5: { fr: 'votre place dans la tournée du printemps', en: 'your spot on the spring route' },
};
const dlLong = (p) => fmtDate(renewDeadline(p), { day: 'numeric', month: 'long' });
function renewHanger(p, c) {
  const r = RN(p), n = (r.visits || []).length, dl = dlLong(p), q = quote(p);
  return {
    tag: `${t('Avis de fin d’année', 'Year-end notice')} · ${c.dateL}`, kick: t(`Bilan ${PREV} préparé pour`, `${PREV} review prepared for`), name: householdOf(p),
    where: `${p.client.address}, ${p.client.city}`,
    visit: t(`${esc(c.first)} est passé${c.e} avec votre bilan`, `${esc(c.first)} stopped by with your review`),
    checks: [[true, t(`${n} visites sur ${n} faites en ${PREV}`, `${n} of ${n} visits done in ${PREV}`)], [true, t(`Programme ${SEASON} prêt · prix fidélité`, `${SEASON} program ready · loyalty price`)],
      [!!p.signature, p.signature ? t(`Renouvelé pour ${SEASON}`, `Renewed for ${SEASON}`) : t(`À vous : renouveler d’ici le ${dl}`, `Your turn: renew by ${dl}`)]],
    coupon: t('Coupon · renouvellement', 'Coupon · renewal'), go: t('Détacher et ouvrir mon bilan', 'Tear off and open my review'),
    kicker: t(`Année ${PREV} terminée · MBM ${esc(c.br)}`, `${PREV} complete · MBM ${esc(c.br)}`),
    title: t('Une année de protection. <em>La prochaine</em> est prête.', 'One year of protection. <em>The next one</em> is ready.'),
    lede: t(`${esc(c.first)} a laissé cet avis de fin d’année sur votre poignée. Détachez le coupon : votre bilan ${PREV}, visite par visite, et votre programme ${SEASON}, au prix fidélité jusqu’au ${dl}.`, `${esc(c.first)} left this year-end notice on your handle. Tear off the coupon: your ${PREV} review, visit by visit, and your ${SEASON} program, at the loyalty price until ${dl}.`),
    blurbs: RENEW_BLURBS, img: 'detail',
    seal: { top: t('Prix', 'Loyalty'), big: t(`−${q.discPct || 5} %`, `−${q.discPct || 5}%`), bot: t('fidélité', 'price') },
  };
}

/* ---------- Hero: copy, card and photo chip, step by step ---------- */
function renewHero(p, step) {
  const r = RN(p), rep = p.rep || repFor(p.branch), repFn = rep.team ? t('votre conseiller', 'your advisor') : firstName(rep.name), fn = firstName(p.client.first || p.client.name);
  const n = (r.visits || []).length, calls = r.calls || [], [h0, h1] = r.health || [0, 0], dl = dlLong(p), sn = seasonNo(p);
  const callTxt = calls.length === 1 ? t(`, un appel de service réglé en ${calls[0].hours} h`, `, one service call solved within ${calls[0].hours} h`) : calls.length ? t(`, ${calls.length} appels de service réglés`, `, ${calls.length} service calls solved`) : '';
  if (step === 1) return {
    kicker: t(`Année ${PREV} · ${n} visites sur ${n} · ${householdOf(p)}`, `${PREV} · ${n} of ${n} visits · ${householdOf(p)}`),
    title: t(`Votre bilan <em>${PREV}</em> est prêt.`, `Your <em>${PREV}</em> review is ready.`),
    sub: t(`${cap1(numWord(n, true))} visites${callTxt} et un indice de protection passé de ${h0} à ${h1}. Voici ce qu’on a fait, ce qu’on a vu et ce qu’on vous propose pour ${SEASON}.`, `${cap1(numWord(n))} visits${callTxt} and a protection score up from ${h0} to ${h1}. Here is what we did, what we saw and what we suggest for ${SEASON}.`),
    actions: [[t('Voir mon bilan', 'See my review'), 'bilan-sec', 'green'], p.stage >= 2 ? [t(`Mon programme ${SEASON}`, `My ${SEASON} program`), '@programme', 'ghost'] : [t('Ce qu’on a vu', 'What we saw'), 'observations', 'ghost']] };
  if (step === 2) return {
    kicker: t(`Programme ${SEASON} · prix fidélité jusqu’au ${dl}`, `${SEASON} program · loyalty price until ${dl}`),
    title: t(`Votre <em>${ordinal(sn, true)}</em> année est prête.`, `Your <em>${ordinal(sn)}</em> year is ready.`),
    sub: t(`Ce qui a fonctionné en ${PREV} est reconduit, ce que votre technicien a vu s’ajoute. Retirez ou ajoutez un traitement : le prix se recalcule, et le prix fidélité tient jusqu’au ${dl}.`, `What worked in ${PREV} is kept, what your technician saw is added. Remove or add a treatment: the price updates, and the loyalty price holds until ${dl}.`),
    actions: [[t('Voir le programme', 'See the program'), 'programme', 'green'], [t(`Comparer avec ${PREV}`, `Compare with ${PREV}`), 'compare', 'ghost']] };
  if (step === 3) return {
    kicker: t('Avant de renouveler · deux minutes', 'Before you renew · two minutes'),
    title: t('Quelque chose a <em>changé</em> ?', 'Has anything <em>changed</em>?'),
    sub: t(`Un sous-sol aménagé, un bébé, un nouveau chien ? Dites-le ici : ${repFn} ajuste la superficie, les produits et les consignes avant le printemps. Rien n’a changé ? Un clic suffit.`, `A finished basement, a baby, a new dog? Tell us here: ${repFn} adjusts the area, the products and the instructions before spring. Nothing changed? One click is enough.`),
    actions: [[RN(p).changesAt ? t('Voir mes ajustements', 'See my changes') : t('Confirmer mes ajustements', 'Confirm my changes'), 'ajust-sec', 'green']] };
  if (step === 4) return {
    kicker: t(`Renouvellement · ${SEASON} · ${ordinal(sn, true)} année`, `Renewal · ${SEASON} · ${ordinal(sn)} year`),
    title: p.signature ? t('C’est <em>renouvelé</em>. Merci !', 'It’s <em>renewed</em>. Thank you!') : t('Une année de plus, <em>une signature</em>.', 'One more year, <em>one signature</em>.'),
    sub: p.signature ? t(`Votre renouvellement ${SEASON} est signé, au prix fidélité. Votre maison garde sa place dans la tournée du printemps.`, `Your ${SEASON} renewal is signed, at the loyalty price. Your home keeps its spot on the spring route.`) : t('Il reprend le programme accepté et vos ajustements, au prix fidélité. Lisez-le ici et signez en une minute.', 'It repeats the program you accepted and your changes, at the loyalty price. Read it here and sign in a minute.'),
    actions: [[p.signature ? t('Voir le renouvellement signé', 'See the signed renewal') : t('Lire et signer', 'Read and sign'), 'agreement', 'green']] };
  if (step === 5) return {
    kicker: t(`${cap1(ordinal(sn, true))} année · première visite semaine du ${fmtDate(FIRST_PASSAGE, { day: 'numeric', month: 'long' })}`, `${ordinal(sn)} year · first visit week of ${fmtDate(FIRST_PASSAGE, { month: 'long', day: 'numeric' })}`),
    title: t(`Merci de rester avec nous, <em>${esc(fn)}</em>.`, `Thanks for staying with us, <em>${esc(fn)}</em>.`),
    sub: t('Votre maison garde sa place dans la tournée de votre secteur, avec le même technicien. Voici ce qu’on prépare pour avril, ce qu’il vous reste à faire et ce qui arrive après chaque visite.', 'Your home keeps its spot on your area’s route, with the same technician. Here is what we are preparing for April, what is left for you to do and what happens after each visit.'),
    actions: pendingOffers(p).length ? [[t('Voir la recommandation de votre expert', 'See your expert’s recommendation'), 'offres', 'green'], [prepLabel(p), 'preparer', 'ghost']] : [[prepLabel(p), 'preparer', 'green'], [t('Voir un rapport de visite', 'See a visit report'), 'rapport', 'ghost']] };
  return null;
}
function renewCard(p, step) {
  const row = (k, v, cls = '') => `<div class="hc__row ${cls}"><span>${k}</span><b>${v}</b></div>`;
  const r = RN(p), [h0, h1] = r.health || [0, 0], calls = r.calls || [];
  if (step === 1) return `<aside class="hc" aria-label="${t('Indice de protection', 'Protection score')}"><div class="hc__head"><span>${t('Indice de protection', 'Protection score')}</span><span class="tag tag--ok">+${h1 - h0} ${t('points', 'points')}</span></div>
    <div class="hc__ring">${ringSvg(h1, 84, 8)}<div><b class="hc__big num">${h1}<small class="hc__of">/100</small></b><span class="small">${t(`en octobre, contre ${h0} en avril`, `in October, against ${h0} in April`)}</span></div></div>
    <div class="hc__rows">${row(t('Visites', 'Visits'), `${(r.visits || []).length}/${(r.visits || []).length}`)}${row(t('Appels de service', 'Service calls'), calls.length ? t(`${calls.length}, réglé en ${calls[0].hours} h`, `${calls.length}, solved in ${calls[0].hours} h`) : '0')}${row(t('Client depuis', 'Client since'), String(p.since))}</div></aside>`;
  if (step === 2) {
    const c = renewCompare(p), q = c.q, days = renewDaysLeft(p);
    return `<aside class="hc" aria-label="${t('Votre programme en bref', 'Your program at a glance')}"><div class="hc__head"><span>${t(`Programme ${SEASON}`, `${SEASON} program`)}</span><span class="tag tag--green">${icon('shield')}${t(`Fidélité −${q.discPct} %`, `Loyalty −${q.discPct}%`)}</span></div>
      <div class="hc__money"><b class="num" data-count="${q.monthly}" data-fmt="money">${fmtMoney(q.monthly)}</b><span class="small">${t('par mois sur 12 mois + tx', 'a month over 12 months + tax')}</span></div>
      <div class="hc__rows">${row(t(`Année ${SEASON}`, `${SEASON}`), `${fmtMoney(c.now, 0)} ${t('+ tx', '+ tax')}`)}${row(t(`Année ${PREV}`, `${PREV}`), `${fmtMoney(c.prev.total, 0)} ${t('+ tx', '+ tax')}`)}${row(t('À programme égal', 'Same program'), `${c.samePct <= 0 ? '−' : '+'}${fmtPct(Math.abs(c.samePct))}`, c.samePct <= 0 ? 'is-pos' : '')}</div>
      <p class="hc__foot">${p.signature ? t('Prix fidélité garanti : renouvellement signé.', 'Loyalty price locked in: renewal signed.') : t(`Prix fidélité garanti encore <b>${days} jour${days > 1 ? 's' : ''}</b>, jusqu’au ${dlLong(p)}.`, `Loyalty price guaranteed for <b>${days} more day${days > 1 ? 's' : ''}</b>, until ${dlLong(p)}.`)}</p></aside>`;
  }
  if (step === 3) {
    const ch = (r.changes || []).filter((k) => k !== 'none');
    return `<aside class="hc" aria-label="${t('Votre maison', 'Your home')}"><div class="hc__head"><span>${t('Votre maison', 'Your home')}</span>${r.changesAt ? `<span class="tag tag--ok">${icon('check')}${t('Confirmé', 'Confirmed')}</span>` : `<span class="tag tag--warn">${t('À confirmer', 'To confirm')}</span>`}</div>
      <div class="hc__rows">${row(t('Superficie', 'Area'), esc(fmtArea(areaOf(p))))}${row(t('Mesurée', 'Measured'), t(`en ${PREV}`, `in ${PREV}`))}${row(t('Changements', 'Changes'), ch.length ? String(ch.length) : t('aucun', 'none'))}${row(t('Paiement', 'Payment'), esc(payMethodLabel(p)))}</div>
      <p class="hc__foot">${t('Rien à remplir de nouveau : on part de votre dossier.', 'Nothing to fill in again: we start from your file.')}</p></aside>`;
  }
  if (step === 4) {
    const s = p.signature;
    return `<aside class="hc" aria-label="${t('Statut du renouvellement', 'Renewal status')}"><div class="hc__head"><span>${t('Renouvellement', 'Renewal')} ${SEASON}</span>${s ? `<span class="tag tag--ok">${icon('check')}${t('Signé', 'Signed')}</span>` : `<span class="tag tag--warn">${t('À signer', 'To sign')}</span>`}</div>
      <div class="hc__rows">${row(t('N°', 'No.'), esc(docId(p)))}${row(t('Année', 'Year'), t(`${SEASON} · ${ordinal(seasonNo(p), true)}`, `${SEASON} · ${ordinal(seasonNo(p))}`))}${row(t('Total, taxes incluses', 'Total, tax included'), fmtMoney(quote(p).total))}${s ? row(t('Signé par', 'Signed by'), `${esc(s.name)}, ${fmtDateShort(s.signedAt)}`) : row(t('Prix fidélité', 'Loyalty price'), t(`jusqu’au ${dlLong(p)}`, `until ${dlLong(p)}`), 'is-pos')}</div>
      ${s ? `<p class="hc__foot">${p.countersigned ? `${t('Contresigné par', 'Countersigned by')} ${esc(p.countersigned.name)}.` : t('Votre bureau contresigne dans les minutes qui suivent.', 'Your office countersigns within minutes.')}</p>` : ''}</aside>`;
  }
  return null;
}
function renewChip(p, step) {
  const r = RN(p), [h0, h1] = r.health || [0, 0];
  if (step === 1) return `<span>${t('Indice de protection', 'Protection score')}</span><b>${h0} → ${h1}<small>/100</small></b>`;
  if (step === 2) return p.signature ? `<span>${t('Prix fidélité', 'Loyalty price')}</span><b>${t('Garanti', 'Locked in')}</b>` : `<span>${t('Prix fidélité garanti', 'Loyalty price guaranteed')}</span><b>${renewDaysLeft(p)} <small>${t('jours', 'days')}</small></b>`;
  if (step === 3) return `<span>${t('Superficie', 'Area')}</span><b>${esc(fmtArea(areaOf(p)))}</b>`;
  if (step === 4) return `<span>${t('Renouvellement', 'Renewal')}</span><b>${esc(docId(p))}</b>`;
  return null;
}

/* ---------- Step 1: the year review ---------- */
const ribbonPos = (iso) => { const d = parseDay(iso); return d ? clamp(((d.getMonth() + 1 + (d.getDate() - 1) / 31 - 4) / 7) * 100, 1, 99) : 0; };
function ribbonHtml(p) {
  const r = RN(p), months = S.lang === 'en' ? ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'] : ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct'];
  const pts = (r.visits || []).map((v) => ({ at: v.date, k: 'visit', b: String(v.n), l: fmtDate(v.date, { day: 'numeric', month: 'short' }) }))
    .concat((r.extras || []).map((x) => ({ at: x.date, k: 'extra', b: '+', l: ADD[x.key] ? tx(ADD[x.key].name) : '' })))
    .concat((r.calls || []).map((c) => ({ at: c.date, k: 'call', b: '!', l: t(`Appel · ${c.hours} h`, `Call · ${c.hours} h`) })));
  return `<div class="ribbon reveal" aria-hidden="true"><div class="ribbon__months">${months.map((m) => `<span>${m}</span>`).join('')}</div>
    <div class="ribbon__track"><i class="ribbon__fill"></i>${pts.map((x) => `<span class="ribbon__pt is-${x.k}" style="left:${ribbonPos(x.at).toFixed(1)}%;--x:${Math.round(ribbonPos(x.at) * 0.6)}"><b>${esc(x.b)}</b><small>${esc(x.l)}</small></span>`).join('')}</div>
    <div class="ribbon__key"><span><i class="is-visit"></i>${t('Visite du programme', 'Program visit')}</span><span><i class="is-extra"></i>${t('Ajout en cours d’année', 'Add-on during the year')}</span><span><i class="is-call"></i>${t('Appel de service', 'Service call')}</span></div></div>`;
}
function visitCardHtml(v, i) {
  const ex = EXPERT[v.by] || EXPERTS[0], P = PASSAGES[v.n - 1];
  return `<article class="vcard reveal" style="--d:${i * 70}ms">
    <div class="vcard__head"><span class="vcard__n">0${v.n}</span><div class="vcard__when"><b>${t(`Visite ${v.n}`, `Visit ${v.n}`)}${P ? ` · ${esc(tx(P).toLowerCase())}` : ''}</b><span>${esc(cap1(fmtDate(v.date, { weekday: 'long', day: 'numeric', month: 'long' })))}</span></div></div>
    <ul class="vcard__done">${(v.done || []).map((x) => `<li>${icon('check')}<span>${esc(tx(x))}</span></li>`).join('')}</ul>
    <p class="vcard__note">${esc(tx(v.note))}</p>
    <div class="vcard__foot"><span class="avatar">${esc(initials(ex.name))}</span><span><b>${esc(ex.name)}</b>${t('Activité :', 'Activity:')} ${esc(tx(v.w).toLowerCase())}</span></div>
  </article>`;
}
function gainsHtml(p) {
  const r = RN(p), [h0, h1] = r.health || [0, 0];
  return `<div class="bento bento--4 gains">
    <article class="tile tile--hero gain reveal"><span class="tile__k">${t('Indice de protection de la maison', 'Home protection score')}</span>
      <div class="gain__vs"><span class="gain__from num">${h0}</span>${icon('arrowR')}<b class="tile__v num" data-count="${h1}" data-fmt="int">${h1}</b><small>/100</small></div>
      <div class="gain__bar" aria-hidden="true"><b style="width:${h1}%"></b><i style="left:${h0}%"></i></div>
      <span class="tile__s">${t(`D’avril à octobre ${PREV}`, `April to October ${PREV}`)} · ${esc(healthLabel(h1))}</span></article>
    ${(r.stats || []).map((s, i) => `<article class="tile reveal" style="--d:${(i + 1) * 60}ms"><span class="tile__k">${esc(tx(s.k))}</span><b class="tile__v num">${esc(tx(s.v))}</b><span class="tile__s">${esc(tx(s.s))}</span></article>`).join('')}
  </div>`;
}
function obsCardHtml(p, o, i) {
  const ex = EXPERT[o.by] || EXPERTS[0], a = ADD[o.addon];
  const tag = o.kind === 'keep' ? `<span class="tag tag--ok">${icon('refresh')}${t(`Reconduit en ${SEASON}`, `Kept for ${SEASON}`)}</span>` : `<span class="tag tag--green">${icon('plus')}${t(`Nouveau en ${SEASON}`, `New for ${SEASON}`)}</span>`;
  return `<article class="obs reveal" style="--d:${i * 70}ms">
    <div class="obs__ic ${o.good ? 'is-good' : ''}">${o.good ? icon('shield') : o.key ? probIcon(o.key) : icon('leaf')}</div>
    <div class="obs__txt"><div class="obs__top"><b class="h4">${esc(tx(o.title || (PROB[o.key] || {})))}</b>${tag}</div>
      <p>${esc(tx(o.note))}</p>
      <span class="obs__by">${esc(ex.name)} · ${esc(tx(ex.role))}${a ? ` <i aria-hidden="true">→</i> ${esc(tx(a.name))}` : ''}</span></div>
  </article>`;
}
function rateHtml(p) {
  const r = RN(p), rep = p.rep || repFor(p.branch), fnR = rep.team ? t('Votre bureau', 'Your office') : firstName(rep.name), low = r.rating && r.rating <= 2;
  return `<div class="card rate" id="rate">
    <div class="rate__head"><div class="stack" style="gap:8px"><p class="eyebrow">${t('Votre avis', 'Your opinion')}</p><h2 class="h3">${t(`Comment s’est passée votre année ${PREV} ?`, `How was your ${PREV}?`)}</h2></div><p class="small" style="margin:0">${t(`${fnR} lit chaque réponse. Une année décevante ? On vous rappelle avant de parler de ${SEASON}.`, `${fnR} reads every answer. A disappointing year? We call you before talking about ${SEASON}.`)}</p></div>
    <div class="rating rating--lg" role="group" aria-label="${t('Note de l’année', 'Year rating')}">${RENEW_RATES.map((x) => `<button type="button" data-action="renew-rate" data-v="${x.v}" ${pressed(r.rating === x.v)}><span class="rate__bars" style="--c:#${lawnColor(14 + x.v * 16).slice(1)}">${[1, 2, 3, 4, 5].map((k) => `<span${k <= x.v ? ' class="is-on"' : ''}></span>`).join('')}</span>${esc(tx(x))}</button>`).join('')}</div>
    ${low ? `<p class="rate__low">${icon('phone')}<span>${t(`Désolé que l’année vous ait déçu. ${fnR} vous appelle d’ici demain pour en parler, avant tout renouvellement.`, `Sorry the year let you down. ${fnR} will call you by tomorrow to talk about it, before any renewal.`)}</span></p>` : ''}
    <div class="field"><label class="field__label" for="rn-comment">${t(`Un mot pour ${fnR}`, `A word for ${fnR}`)} <span class="opt">${t('facultatif', 'optional')}</span></label><textarea class="textarea" id="rn-comment" data-renew="comment" rows="2" placeholder="${t('Ce qu’on a bien fait, ce qu’on peut faire mieux…', 'What went well, what we can do better…')}">${esc(r.comment || '')}</textarea></div>
    ${r.reviewedAt ? `<div class="rate__done"><span class="small">${icon('check')}${t('Bilan confirmé le', 'Review confirmed on')} ${esc(fmtDateShort(r.reviewedAt))}</span><a class="btn btn--green" href="#${p.slug}-programme">${t(`Voir mon programme ${SEASON}`, `See my ${SEASON} program`)}${icon('arrowR')}</a></div>` : `<button class="btn btn--green btn--block" data-action="renew-reviewed">${t(`Confirmer et voir mon programme ${SEASON}`, `Confirm and see my ${SEASON} program`)}${icon('arrowR')}</button>`}
  </div>`;
}
function viewRenewReview(p) {
  const r = RN(p), [, h1] = r.health || [0, 0], probs = (r.obs || []).filter((o) => !o.good && o.key).map((o) => o.key);
  return `${viewHero(p, 1)}
  <section class="section" id="bilan-sec"><div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">${t(`Année ${PREV} · visite par visite`, `${PREV} · visit by visit`)}</p><h2 class="h2">${t(`${cap1(numWord((r.visits || []).length, true))} visites, <em>autant de rapports</em>.`, `${cap1(numWord((r.visits || []).length))} visits, <em>as many reports</em>.`)}</h2><p class="lede">${t('Ce que votre technicien a fait, l’activité observée et ce qu’il a noté. Les rapports avec photos reçus par courriel pendant l’année, réunis au même endroit.', 'What your technician did, the activity seen and what they noted. The photo reports you got by email during the year, all in one place.')}</p></div>
    ${ribbonHtml(p)}
    <div class="vcards">${(r.visits || []).map(visitCardHtml).join('')}</div>
  </div></section>
  <section class="section" id="resultats"><div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">${t('Résultats', 'Results')}</p><h2 class="h2">${t('Ce que votre maison <em>a gagné</em>.', 'What your home <em>gained</em>.')}</h2></div>
    ${gainsHtml(p)}
    <p class="tiny" style="margin:14px 0 0">${t('Relevés de votre technicien aux visites 1 et 4 : stations, traces et points d’entrée. Indice de 0 à 100, à titre indicatif.', 'Readings by your technician at visits 1 and 4: stations, signs and entry points. Score from 0 to 100, for illustration.')}</p>
  </div></section>
  <section class="section" id="observations"><div class="wrap split">
    <div class="stack" style="gap:24px">
      <div class="section-head reveal" style="margin:0"><p class="eyebrow">${t('Ce qu’on a vu', 'What we saw')}</p><h2 class="h2">${t(`Votre programme ${SEASON} <em>part de là</em>.`, `Your ${SEASON} program <em>starts there</em>.`)}</h2><p class="lede">${t('Chaque observation de l’année devient une décision : on garde ce qui marche, on ajoute ce qui manque.', 'Every observation from the year becomes a decision: we keep what works and add what is missing.')}</p></div>
      <div class="obsl">${(r.obs || []).map((o, i) => obsCardHtml(p, o, i)).join('')}</div>
    </div>
    <aside class="sticky"><div class="card plancard reveal"><div class="plancard__head"><div class="stack" style="gap:4px"><p class="eyebrow">${t(`Votre maison en octobre ${PREV}`, `Your home in October ${PREV}`)}</p><b class="h4">${esc(p.client.address)}</b></div><span class="tag tag--ok">${h1}/100</span></div>
      <div class="plan-wrap">${planSvg(p, { probs, now: h1, after: h1, caption: t(`mesurés en ${PREV}`, `measured in ${PREV}`) })}</div>
      <p class="tiny" style="margin:0">${t('Les repères montrent ce que votre technicien a noté à la dernière visite.', 'The markers show what your technician noted at the last visit.')}</p></div></aside>
  </div></section>
  <section class="section" id="avis"><div class="wrap">${rateHtml(p)}</div></section>`;
}

/* ---------- Step 2: next year's program ---------- */
function renewBaseCardHtml(p) {
  const prev = prevSeason(p), pb = (prev.lines.find((l) => l.key === 'base') || {}).amount || 0;
  return `<article class="basecard">
    <div class="basecard__top"><div class="stack" style="gap:8px"><span class="row" style="gap:8px">${seal()}<span class="tag tag--ok">${icon('refresh')}${t('Reconduit', 'Renewed')}</span></span><h3 class="h3">${esc(tx(BASE.name))}</h3><p class="small" style="margin:0">${t(`Pour une maison de ${fmtArea(areaOf(p))}${Math.abs(areaOf(p) - prev.area) < 50 ? `, mesurée en ${PREV}` : ', selon vos ajustements'}`, `For a ${fmtArea(areaOf(p))} home${Math.abs(areaOf(p) - prev.area) < 50 ? `, measured in ${PREV}` : ', based on your changes'}`)}</p></div>
      <div class="basecard__price"><b>${fmtMoney(basePrice(p), 0)}</b><span class="small">${t(`${fmtMoney(pb, 0)} en ${PREV}`, `${fmtMoney(pb, 0)} in ${PREV}`)}</span></div></div>
    <ul class="incl">${BASE.includes.map((x) => `<li>${icon('check')}<span>${esc(tx(x))}</span></li>`).join('')}</ul>
  </article>`;
}
function renewAddonCardHtml(p, a) {
  const on = isSelected(p, a.key), kind = renewKind(p, a.key), ob = (RN(p).obs || []).find((o) => o.addon === a.key), prev = prevSeason(p).lines.find((l) => l.key === a.key);
  const tag = kind === 'keep' ? `<span class="tag tag--ok">${prev && prev.kind === 'upsell' ? t(`Ajouté en ${PREV}`, `Added in ${PREV}`) : t(`En ${PREV}`, `In ${PREV}`)}</span>` : kind === 'new' ? `<span class="tag tag--green">${t('Nouveau', 'New')}</span>` : '';
  return `<article class="addon ${on ? 'is-on' : ''}" data-addon="${a.key}">
    <div class="addon__main"><div class="addon__title"><b class="h4">${esc(tx(a.name))}</b>${tag}${a.division === 'vext' ? `<span class="tag tag--vext">${t('3 saisons', '3 seasons')}</span>` : ''}</div>
      <p class="small" style="margin:0">${esc(tx(a.desc))}</p>
      ${ob ? `<p class="addon__why">${icon(kind === 'keep' ? 'refresh' : 'sparkle')}<span>${esc(tx(ob.note))}</span></p>` : ''}</div>
    <div class="addon__side"><span class="addon__price">${fmtMoney(addonAmount(p, a), 0)}${prev ? `<small>${t(`${fmtMoney(prev.amount, 0)} en ${PREV}`, `${fmtMoney(prev.amount, 0)} in ${PREV}`)}</small>` : ''}</span><button class="switch" role="switch" aria-checked="${on}" data-action="toggle-addon" data-k="${a.key}" aria-label="${esc(tx(a.name))}" ${p.signature ? 'disabled' : ''}></button></div>
  </article>`;
}
function renewReceiptHtml(p) {
  const c = renewCompare(p), q = c.q, r = RN(p), days = renewDaysLeft(p), signed = !!p.signature;
  const lines = q.lines.map((l) => `<div class="receipt__row"><span>${esc(l.label)}${renewKind(p, l.key) === 'new' ? ` <em class="receipt__new">${t('nouveau', 'new')}</em>` : ''}</span><span>${fmtMoney(l.amount)}</span></div>`).join('');
  const vs = c.samePct <= 0
    ? t(`En ${PREV} : ${fmtMoney(c.prev.total)}. À programme égal, ${SEASON} coûte ${fmtPct(-c.samePct)} de moins, grâce au prix fidélité.`, `In ${PREV}: ${fmtMoney(c.prev.total)}. For the same program, ${SEASON} costs ${fmtPct(-c.samePct)} less, thanks to the loyalty price.`)
    : t(`En ${PREV} : ${fmtMoney(c.prev.total)}. À programme égal, ${SEASON} coûte ${fmtPct(c.samePct)} de plus.`, `In ${PREV}: ${fmtMoney(c.prev.total)}. For the same program, ${SEASON} costs ${fmtPct(c.samePct)} more.`);
  const cta = signed ? `<a class="btn btn--green btn--block" href="#${p.slug}-saison">${t('Aller à ma protection', 'Go to my protection')}${icon('arrowR')}</a>`
    : r.acceptedAt ? `<a class="btn btn--green btn--block" href="#${p.slug}-ajustements">${t('Continuer : mes ajustements', 'Continue: my changes')}${icon('arrowR')}</a>`
      : `<button class="btn btn--green btn--block" data-action="renew-accept">${t('Je renouvelle ce programme', 'I renew this program')}${icon('arrowR')}</button>`;
  return `<div class="receipt" id="receipt">
    <div class="row" style="justify-content:space-between"><p class="eyebrow">${t(`Votre année ${SEASON}`, `Your ${SEASON}`)}</p>${signed ? `<span class="tag tag--ok">${icon('check')}${t('Renouvelé', 'Renewed')}</span>` : r.acceptedAt ? `<span class="tag tag--ok">${icon('check')}${t('Accepté', 'Accepted')}</span>` : `<span class="tiny">${t(`${ordinal(seasonNo(p), true)} année`, `${ordinal(seasonNo(p))} year`)}</span>`}</div>
    <div class="receipt__month"><div><b>${fmtMoney(q.monthly)}</b> <span>${t('/ mois + tx', '/ month + tax')}</span></div><span>${t('sur 12 mois', 'over 12 months')}</span></div>
    <div class="loyal ${signed ? 'is-locked' : days <= 7 ? 'is-soon' : ''}"><div class="loyal__top"><b>${icon('shield')}${t(`Prix fidélité −${q.discPct} %`, `Loyalty price −${q.discPct}%`)}</b><span>${signed ? t('Garanti', 'Locked in') : t(`encore ${days} jour${days > 1 ? 's' : ''}`, `${days} day${days > 1 ? 's' : ''} left`)}</span></div>
      <div class="loyal__bar" aria-hidden="true"><i style="width:${signed ? 100 : clamp(Math.round((days / 30) * 100), 4, 100)}%"></i></div>
      <span class="loyal__sub">${signed ? t('Le rabais s’applique à toute l’année, ajouts compris.', 'The discount applies to the whole year, add-ons included.') : t(`Renouvelez d’ici le ${dlLong(p)} : le rabais s’applique à toute l’année.`, `Renew by ${dlLong(p)}: the discount applies to the whole year.`)}</span></div>
    <div class="receipt__rows">
      ${lines}
      ${q.discount ? `<div class="receipt__row is-promo"><span>${esc(discLabel(p, q))}</span><span>− ${fmtMoney(q.discount)}</span></div>` : ''}
      <div class="receipt__row is-sub"><span>${t(`Programme ${SEASON}`, `${SEASON} program`)}</span><span>${fmtMoney(c.now)}</span></div>
      <div class="receipt__row"><span>${t('TPS', 'GST')}</span><span>${fmtMoney(q.tps)}</span></div>
      <div class="receipt__row"><span>${t('TVQ', 'QST')}</span><span>${fmtMoney(q.tvq)}</span></div>
      <div class="receipt__row is-total"><span>${t('Total, taxes incluses', 'Total, tax included')}</span><span>${fmtMoney(q.total)}</span></div>
    </div>
    <p class="receipt__vs">${icon('trend')}<span>${esc(vs)}</span></p>
    ${cta}
    <button class="btn btn--ghost btn--block btn--sm" data-action="ask-open">${icon('chat')}${t('Une question avant de renouveler ?', 'A question before renewing?')}</button>
    <p class="tiny" style="margin:0">${t(`Grille de prix de démonstration (${SEASON} : +${fmtPct(GRID_UP * 100)}). Aucune information de paiement n’est demandée ici.`, `Demo price grid (${SEASON}: +${fmtPct(GRID_UP * 100)}). No payment details are asked here.`)}</p>
  </div>`;
}
function compareHtml(p) {
  const c = renewCompare(p), q = c.q, f = 1 - q.discPct / 100;
  const keys = Array.from(new Set(c.prev.lines.map((l) => l.key).concat(q.lines.map((l) => l.key))));
  const name = (k) => (k === 'base' ? tx(BASE.name).replace(String(SEASON), '').trim() : ADD[k] ? tx(ADD[k].name) : k);
  const rows = keys.map((k) => {
    const a = c.prev.lines.find((l) => l.key === k), b = q.lines.find((l) => l.key === k);
    const st = a && b ? `<span class="tag tag--ok">${t('Reconduit', 'Kept')}</span>` : b ? `<span class="tag tag--green">${t('Nouveau', 'New')}</span>` : `<span class="tag">${t('Retiré', 'Removed')}</span>`;
    return `<tr><td><b>${esc(name(k))}</b>${a && a.kind === 'upsell' ? `<span>${t(`ajouté en cours d’année, ${fmtDate(a.date, { day: 'numeric', month: 'long' })}`, `added during the year, ${fmtDate(a.date, { month: 'long', day: 'numeric' })}`)}</span>` : ''}</td><td class="r num">${a ? fmtMoney(a.amount) : '—'}</td><td class="r num">${b ? fmtMoney(b.amount) : '—'}</td><td>${st}</td></tr>`;
  }).join('');
  return `<div class="card card--table reveal" id="compare-table"><div class="table-wrap"><table class="itable itable--cmp">
    <thead><tr><th>${t('Service', 'Service')}</th><th class="r">${PREV}</th><th class="r">${SEASON}</th><th>${t(`En ${SEASON}`, `In ${SEASON}`)}</th></tr></thead>
    <tbody>${rows}${q.discount ? `<tr class="is-promo"><td><b>${esc(discLabel(p, q))}</b><span>${t(`renouvellement signé d’ici le ${dlLong(p)}`, `renewal signed by ${dlLong(p)}`)}</span></td><td class="r num">${c.prev.discount ? `− ${fmtMoney(c.prev.discount)}` : '—'}</td><td class="r num">− ${fmtMoney(q.discount)}</td><td></td></tr>` : ''}</tbody>
    <tfoot><tr><td>${t('Année, avant taxes', 'Year, before tax')}</td><td class="r num">${fmtMoney(c.prev.total)}</td><td class="r num">${fmtMoney(c.now)}</td><td></td></tr>
      <tr class="is-same"><td>${t('À programme égal', 'Same program')}</td><td class="r num">${fmtMoney(c.samePrev)}</td><td class="r num">${fmtMoney(round2(c.sameNow))}</td><td><span class="tag ${c.samePct <= 0 ? 'tag--ok' : 'tag--warn'}">${c.samePct <= 0 ? '−' : '+'}${fmtPct(Math.abs(c.samePct))}</span></td></tr></tfoot>
  </table></div></div>
  <p class="tiny" style="margin:12px 0 0">${f * (1 + GRID_UP) < 1 ? t(`La grille ${SEASON} augmente de ${fmtPct(GRID_UP * 100)} (produits, main-d’œuvre et carburant) : le prix fidélité fait plus que la compenser.`, `The ${SEASON} grid goes up ${fmtPct(GRID_UP * 100)} (products, labour and fuel): the loyalty price more than makes up for it.`) : t(`La grille ${SEASON} augmente de ${fmtPct(GRID_UP * 100)} (produits, main-d’œuvre et carburant).`, `The ${SEASON} grid goes up ${fmtPct(GRID_UP * 100)} (products, labour and fuel).`)} ${t('Montants avant taxes.', 'Amounts before tax.')}</p>`;
}
function viewRenewProgram(p) {
  const keep = ADDONS.filter((a) => renewKind(p, a.key) === 'keep'), news = ADDONS.filter((a) => renewKind(p, a.key) === 'new'), others = ADDONS.filter((a) => renewKind(p, a.key) === 'other');
  return `${viewHero(p, 2)}
  <section class="section" id="programme"><div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">${t(`Programme ${SEASON} · ${householdOf(p)} · ${ordinal(seasonNo(p), true)} année`, `${SEASON} program · ${householdOf(p)} · ${ordinal(seasonNo(p))} year`)}</p><h2 class="h2">${t('Le même programme, <em>en mieux</em>.', 'The same program, <em>only better</em>.')}</h2><p class="lede">${t(`Ce qui a fonctionné en ${PREV} est reconduit. Ce que votre technicien a vu cette année s’ajoute. Activez ou retirez un traitement : le prix se recalcule.`, `What worked in ${PREV} is kept. What your technician saw this year is added. Turn a treatment on or off: the price recalculates.`)}</p></div>
    <div class="split">
      <div class="prog" id="prog">
        ${renewBaseCardHtml(p)}
        ${keep.length ? `<p class="eyebrow" style="margin-top:10px">${t(`Reconduit de ${PREV}`, `Kept from ${PREV}`)}</p><div class="addons">${keep.map((a) => renewAddonCardHtml(p, a)).join('')}</div>` : ''}
        ${news.length ? `<p class="eyebrow" style="margin-top:10px">${t(`Nouveau pour ${SEASON} · selon votre bilan`, `New for ${SEASON} · from your review`)}</p><div class="addons">${news.map((a) => renewAddonCardHtml(p, a)).join('')}</div>` : ''}
        <p class="eyebrow" style="margin-top:10px">${t('Aussi offert', 'Also available')}</p><div class="addons">${others.map((a) => renewAddonCardHtml(p, a)).join('')}</div>
      </div>
      <aside class="sticky" id="receipt-wrap">${renewReceiptHtml(p)}</aside>
    </div>
  </div></section>
  <section class="section" id="compare"><div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">${PREV} → ${SEASON}</p><h2 class="h2">${t('Ligne par ligne, <em>sans surprise</em>.', 'Line by line, <em>no surprises</em>.')}</h2><p class="lede">${t(`Ce que vous aviez en ${PREV}, ce que vous aurez en ${SEASON}, et ce que ça change sur la facture.`, `What you had in ${PREV}, what you will have in ${SEASON}, and what it changes on the bill.`)}</p></div>
    <div id="compare-wrap">${compareHtml(p)}</div>
  </div></section>
  <section class="section" id="saison-tl"><div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">${t('Calendrier, de novembre à octobre', 'Calendar, November to October')}</p><h2 class="h2">${t('Les mêmes jours, <em>le même technicien</em>.', 'Same days, <em>same technician</em>.')}</h2><p class="lede">${t('Votre maison garde sa place dans la tournée de la rue. Texto la veille, consignes laissées sur place, rapport avec photos le soir même.', 'Your home keeps its spot on the street’s route. A text the day before, instructions left on site, a photo report that evening.')}</p></div>
    <div class="card card--flat tl" id="timeline">${timelineHtml(p)}</div>
  </div></section>`;
}
/* Light refresh after a switch: cards, receipt, hero card, comparison, calendar */
function refreshRenewProgram(p) {
  $$('.addon[data-addon]').forEach((el) => { const a = ADD[el.dataset.addon]; if (a) el.outerHTML = renewAddonCardHtml(p, a); });
  replaceEl('receipt', renewReceiptHtml(p));
  const hc = $('.hero .hc'); if (hc) hc.outerHTML = heroCard(p, 2);
  const cw = $('#compare-wrap'); if (cw) { cw.innerHTML = compareHtml(p); $$('.reveal', cw).forEach((e) => e.classList.add('is-in')); }
  const tl = $('#timeline'); if (tl) tl.innerHTML = timelineHtml(p);
}

/* ---------- Step 3: what changed in the home ---------- */
function renewChangesHtml(p) {
  const r = RN(p), ch = r.changes || [], rep = p.rep || repFor(p.branch);
  const areaChg = ch.some((k) => (RENEW_CHANGES.find((x) => x.key === k) || {}).area);
  const prevA = prevSeason(p).area, area = areaOf(p), min = Math.round((prevA * 0.6) / 50) * 50, max = Math.round((prevA * 1.4) / 50) * 50;
  const pct = Math.round(((clamp(area, min, max) - min) / (max - min)) * 100);
  return `<header class="qsec__head"><span class="qsec__n">${r.changesAt ? icon('check') : '01'}</span><div class="stack" style="gap:4px"><h3 class="h3">${t(`Qu’est-ce qui change en ${SEASON} ?`, `What changes in ${SEASON}?`)}</h3><p class="small" style="margin:0">${t('Cochez tout ce qui s’applique. Rien n’a changé ? Un seul clic.', 'Tick everything that applies. Nothing changed? One click.')}</p></div></header>
    <div class="qlist">
      <div class="chips">${RENEW_CHANGES.map((x) => `<button type="button" class="chip chip--lg" data-action="renew-change" data-v="${x.key}" ${pressed(ch.includes(x.key))}>${icon(x.icon)}${esc(tx(x))}</button>`).join('')}</div>
      ${areaChg ? `<div class="field rn-area"><label class="field__label" for="rn-area">${t('Nouvelle superficie de la maison', 'New home area')} <span class="opt">${t(`${fmtArea(prevA)} mesurés en ${PREV}`, `${fmtArea(prevA)} measured in ${PREV}`)}</span></label>
        <div class="area-read"><b id="rn-area-val">${esc(fmtArea(area))}</b><span class="small" id="rn-area-price">${fmtMoney(quote(p).monthly)} ${t('/ mois + tx', '/ month + tax')}</span></div>
        <input type="range" class="range" id="rn-area" data-renew="area" min="${min}" max="${max}" step="50" value="${clamp(area, min, max)}" style="--p:${pct}%">
        <p class="field__help">${t(`Une estimation suffit : ${rep.team ? 'votre technicien' : firstName(rep.name)} mesure à la première visite et vous écrit si l’écart dépasse 10 %.`, `An estimate is enough: ${rep.team ? 'your technician' : firstName(rep.name)} measures at the first visit and writes to you if it is off by more than 10%.`)}</p></div>` : ''}
    </div>`;
}
function callbackHtml(p) {
  const r = RN(p), rep = p.rep || repFor(p.branch), fnR = rep.team ? t('Votre bureau', 'Your office') : firstName(rep.name);
  if (r.callbackAt) return `<p class="eyebrow">${t('Rappel demandé', 'Call requested')}</p><b class="h4">${t(`${fnR} vous rappelle d’ici demain, 18 h.`, `${fnR} calls you back by tomorrow, 6 PM.`)}</b><p class="small" style="margin:0">${t(`Demandé le ${fmtDateTime(r.callbackAt)}. Au ${esc(p.client.phone || A(p).phone || 'numéro au dossier')}.`, `Requested on ${fmtDateTime(r.callbackAt)}. At ${esc(p.client.phone || A(p).phone || 'the number on file')}.`)}</p>`;
  return `<p class="eyebrow">${t('Vous préférez en parler ?', 'Rather talk about it?')}</p><div class="row" style="gap:12px;flex-wrap:nowrap"><span class="avatar">${esc(initials(rep.name))}</span><div><b class="h4">${esc(rep.name)}</b><div class="small">${esc(repTitle(rep))} · MBM ${esc(branchName(p.branch))}</div></div></div><p class="small" style="margin:0">${t('Dix minutes au téléphone, sans engagement. On ajuste le programme avec vous.', 'Ten minutes on the phone, no commitment. We adjust the program with you.')}</p><button class="btn btn--ghost btn--sm" style="justify-self:start" data-action="renew-callback">${icon('phone')}${t(`${fnR} me rappelle`, `${fnR} calls me back`)}</button>`;
}
function renewConfirmHtml(p) {
  const r = RN(p), ch = (r.changes || []).filter((k) => k !== 'none').map((k) => tx(RENEW_CHANGES.find((x) => x.key === k) || {}).toLowerCase()).filter(Boolean);
  if (r.changesAt) return `<div class="qsubmit" id="rn-confirm"><div class="row" style="justify-content:space-between"><b class="h4">${icon('check')} ${t('Ajustements confirmés le', 'Changes confirmed on')} ${esc(fmtDateShort(r.changesAt))}</b><a class="btn btn--green btn--sm" href="#${p.slug}-renouvellement">${t('Signer mon renouvellement', 'Sign my renewal')}${icon('arrowR')}</a></div><p class="small" style="margin:0">${ch.length ? t(`Noté : ${listJoin(ch)}. Vous pouvez encore modifier vos réponses.`, `Noted: ${listJoin(ch)}. You can still change your answers.`) : t('Rien n’a changé : votre renouvellement reprend votre dossier tel quel.', 'Nothing changed: your renewal uses your file as is.')}</p></div>`;
  return `<div class="qsubmit" id="rn-confirm"><b class="h3" style="color:inherit">${t('Tout est juste ? Votre renouvellement se prépare à l’envoi.', 'All good? Your renewal is prepared when you send.')}</b>
    <p class="small" style="margin:0">${ch.length ? t(`À ajuster : ${listJoin(ch)}.`, `To adjust: ${listJoin(ch)}.`) : (r.changes || []).includes('none') ? t('Rien n’a changé : on reprend votre dossier tel quel.', 'Nothing changed: we use your file as is.') : t('Cochez « Rien n’a changé » ou ce qui s’applique, puis confirmez.', 'Tick “Nothing changed” or what applies, then confirm.')}</p>
    <button class="btn btn--green btn--block" data-action="renew-confirm" ${arr(r.changes) ? '' : 'disabled'}>${icon('check')}${t('Confirmer mes ajustements', 'Confirm my changes')}</button></div>`;
}
function viewRenewChanges(p) {
  const r = RN(p), tk = (p.onboarding && p.onboarding.prefs) || {};
  const notices = [tk.sms !== false ? t('texto la veille', 'text the day before') : '', tk.email !== false ? t('rapport par courriel', 'report by email') : ''].filter(Boolean);
  return `${viewHero(p, 3)}
  <section class="section" id="ajust-sec"><div class="wrap split">
    <div class="stack" style="gap:20px">
      <article class="card qsec ${r.changesAt ? 'is-done' : ''}" id="rn-changes">${renewChangesHtml(p)}</article>
      <article class="card qsec ${r.changesAt ? 'is-done' : ''}">
        <header class="qsec__head"><span class="qsec__n">${r.changesAt ? icon('check') : '02'}</span><div class="stack" style="gap:4px"><h3 class="h3">${t('Accès et consignes', 'Access and instructions')}</h3><p class="small" style="margin:0">${t('Ce que votre technicien sait déjà, à vérifier en dix secondes.', 'What your technician already knows, to check in ten seconds.')}</p></div></header>
        <div class="qlist"><div class="fields">
          <div class="field"><label class="field__label" for="rn-access">${t('Accès à la maison', 'Access to the house')}</label><input class="input" id="rn-access" data-renew="access" value="${esc(r.access || '')}" placeholder="${t('Porte de côté, garage, code…', 'Side door, garage, code…')}"></div>
          <div class="field"><label class="field__label" for="rn-pets">${t('Animaux', 'Pets')}</label><input class="input" id="rn-pets" data-renew="pets" value="${esc(r.pets || '')}" placeholder="${t('Ex. : chien dans la cour arrière', 'E.g. dog in the backyard')}"></div>
          <div class="field span2"><label class="field__label" for="rn-note">${t('Une note pour votre technicien', 'A note for your technician')} <span class="opt">${t('facultatif', 'optional')}</span></label><textarea class="textarea" id="rn-note" data-renew="changeNote" rows="2" placeholder="${t('Pièces à éviter, aquarium, chambre de bébé…', 'Rooms to avoid, aquarium, baby’s room…')}">${esc(r.changeNote || '')}</textarea></div>
        </div></div>
      </article>
      ${renewConfirmHtml(p)}
    </div>
    <aside class="sticky stack" style="gap:16px">
      <div class="card stack" style="gap:14px"><p class="eyebrow">${t('Ce qui ne change pas', 'What stays the same')}</p>
        <dl class="kv kv--tight"><dt>${t('Technicien', 'Technician')}</dt><dd>Jonathan R.</dd><dt>${t('Tournée', 'Route')}</dt><dd>${t(`MBM ${esc(branchName(p.branch))}, même rue, même jour`, `MBM ${esc(branchName(p.branch))}, same street, same day`)}</dd><dt>${t('Avis', 'Notices')}</dt><dd>${esc(cap1(listJoin(notices)) || '—')}</dd><dt>${t('Paiement', 'Payment')}</dt><dd>${esc(payMethodLabel(p))}</dd></dl>
        <p class="tiny" style="margin:0">${t('Rien à ressaisir : votre mode de paiement reste celui de votre dossier.', 'Nothing to re-enter: your payment method stays the one on file.')}</p></div>
      <div class="card stack" style="gap:12px" id="rn-call">${callbackHtml(p)}</div>
    </aside>
  </div></section>`;
}
