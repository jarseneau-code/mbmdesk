/* ============ Corporate sites ============ */
function sitesListHtml(p) {
  return `<div class="field"><span class="field__label">${t('Vos sites', 'Your sites')} <span class="opt">${t(`${sitesOf(p).length} sites · ${fmtArea(areaOf(p))} au total`, `${sitesOf(p).length} sites · ${fmtArea(areaOf(p))} in total`)}</span></span>
    <ul class="sites">${sitesOf(p).map((s, i) => `<li class="site"><span class="site__n">${i + 1}</span><div class="site__txt"><b>${esc(tx(s.name))}</b><span>${esc(s.address)}, ${esc(s.city)}</span></div><div class="site__meta"><b class="num">${esc(fmtArea(s.area))}</b><span>${t(`${s.trees} stations`, `${s.trees} stations`)}</span></div>${s.since >= SEASON ? `<span class="tag tag--green">${t(`Nouveau ${SEASON}`, `New ${SEASON}`)}</span>` : `<span class="tag">${t(`Depuis ${s.since}`, `Since ${s.since}`)}</span>`}</li>`).join('')}</ul>
    <p class="field__help">${t('Les superficies et les stations ont été relevées pendant l’inspection des sites. Votre chargé de projet ajoute un site en quelques minutes.', 'The areas and stations were recorded during the site inspection. Your project manager adds a site in a few minutes.')}</p></div>`;
}
function sitesBreakdownHtml(p) {
  const rows = siteQuote(p);
  const max = Math.max(1, ...rows.map((r) => r.total));
  return `<article class="card sitesq"><div class="row" style="justify-content:space-between"><div class="stack" style="gap:4px"><p class="eyebrow">${t('Détail par site', 'By site')}</p><b class="h4">${t('Chaque site, ses risques, son prix', 'Each site, its risks, its price')}</b></div><span class="tag tag--info">${icon('building')}${t(`${rows.length} sites`, `${rows.length} sites`)}</span></div>
    <ul class="sitesq__list">${rows.map((r) => `<li><div class="sitesq__name"><b>${esc(tx(r.name))}</b><span>${esc(r.city)} · ${esc(fmtArea(r.area))}</span></div><div class="sitesq__bar" aria-hidden="true"><i style="width:${Math.round((r.total / max) * 100)}%"></i></div><b class="num">${fmtMoney(r.total, 0)}</b></li>`).join('')}</ul>
    <p class="tiny" style="margin:0">${t('Programme et traitements choisis, avant le rabais multisite et les taxes.', 'Program and chosen treatments, before the multi-site discount and taxes.')}</p></article>`;
}
function receiptCorpHtml(p) {
  const q = quote(p), accepted = !!p.proposal.acceptedAt, rows = siteQuote(p), bl = p.billing || {};
  return `<div class="receipt" id="receipt">
    <div class="row" style="justify-content:space-between"><p class="eyebrow">${t(`Programme ${SEASON} · ${rows.length} sites`, `${SEASON} program · ${rows.length} sites`)}</p>${accepted ? `<span class="tag tag--ok">${icon('check')}${t('Acceptée', 'Accepted')}</span>` : `<span class="tiny">v${esc(p.proposal.version)}</span>`}</div>
    <div class="receipt__month"><div><b>${fmtMoney(q.season - q.discount, 0)}</b> <span>${t('+ tx, l’année', '+ tax, the year')}</span></div><span>${t('facturé après chaque visite', 'billed after each visit')}</span></div>
    <div class="receipt__rows">
      ${rows.map((r) => `<div class="receipt__row"><span>${esc(tx(r.name))}</span><span>${fmtMoney(r.total)}</span></div>`).join('')}
      ${q.discount ? `<div class="receipt__row is-promo"><span>${t(`Rabais multisite ${q.discPct} %`, `${q.discPct}% multi-site discount`)}</span><span>− ${fmtMoney(q.discount)}</span></div>` : ''}
      <div class="receipt__row is-sub"><span>${t(`Programme ${SEASON}`, `${SEASON} program`)}</span><span>${fmtMoney(q.season - q.discount)}</span></div>
      <div class="receipt__row"><span>${t('TPS', 'GST')}</span><span>${fmtMoney(q.tps)}</span></div>
      <div class="receipt__row"><span>${t('TVQ', 'QST')}</span><span>${fmtMoney(q.tvq)}</span></div>
      <div class="receipt__row is-total"><span>${t('Total, taxes incluses', 'Total, tax included')}</span><span>${fmtMoney(q.total)}</span></div>
    </div>
    <dl class="kv kv--doc"><dt>${t('Facturation', 'Billing')}</dt><dd>${t('Consolidée, chaque mois avec visite', 'Consolidated, each month with a visit')}</dd><dt>${t('Modalités', 'Terms')}</dt><dd>${t(`Net ${bl.terms || 30} jours`, `Net ${bl.terms || 30} days`)}</dd><dt>${t('Bon de commande', 'Purchase order')}</dt><dd class="mono">${esc(bl.po || '—')}</dd></dl>
    ${accepted ? `<a class="btn btn--green btn--block" href="#${p.slug}-visite">${t('Voir la visite des sites', 'See the site visit')}${icon('arrowR')}</a>` : `<button class="btn btn--green btn--block" data-action="accept-proposal">${t('J’accepte, je planifie la visite', 'I accept, plan the visit')}${icon('arrowR')}</button>`}
    <p class="tiny" style="margin:0">${t('Grille de prix de démonstration. Chaque bureau règle ses prix dans la console.', 'Demo price grid. Each office sets its prices in the console.')}</p>
  </div>`;
}
function sitesSeasonHtml(p) {
  const rows = siteQuote(p);
  return `<section class="section" id="sites"><div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">${t(`Vos ${siteNoun(p, 2)} cette année`, `Your ${siteNoun(p, 2)} this year`)}</p><h2 class="h2">${t(`${cap1(numWord(rows.length, p.sitesWord && p.sitesWord.fem))} ${siteNoun(p, rows.length)}, <em>un seul dossier</em>.`, `${cap1(numWord(rows.length))} ${siteNoun(p, rows.length)}, <em>one file</em>.`)}</h2></div>
    <div class="bento ${rows.length === 4 ? 'bento--4e' : 'bento--3'}">${rows.map((r, i) => `<article class="card sitecard reveal" style="--d:${i * 80}ms">
      <div class="row" style="justify-content:space-between"><span class="site__n">${i + 1}</span>${isTerm(p) ? `<span class="tag">${t(`An ${termYearNo(p, SEASON)} sur ${termLen(p)}`, `Year ${termYearNo(p, SEASON)} of ${termLen(p)}`)}</span>` : r.since >= SEASON ? `<span class="tag tag--green">${t('Nouveau', 'New')}</span>` : `<span class="tag">${t(`Client depuis ${r.since}`, `Client since ${r.since}`)}</span>`}</div>
      <div class="stack" style="gap:2px"><b class="h4">${esc(tx(r.name))}</b><span class="small">${esc(r.address)}, ${esc(r.city)}</span></div>
      <dl class="kv kv--tight"><dt>${t('Superficie', 'Area')}</dt><dd class="num">${esc(fmtArea(r.area))}</dd><dt>${t('Stations', 'Stations')}</dt><dd>${r.trees}</dd><dt>${t('Année', 'Year')}</dt><dd class="num">${fmtMoney(r.total, 0)}</dd><dt>${t('Prochaine visite', 'Next visit')}</dt><dd>${isTerm(p) ? t('Semaine du 19 avril', 'Week of April 19') : t('Décembre, avant 6 h', 'December, before 6 AM')}</dd></dl>
    </article>`).join('')}</div>
  </div></section>`;
}

/* ============ Expert recommendations (in-season upsells) ============ */
function offerCardHtml(p, o) {
  const ex = offerBy(o), amt = offerAmount(p, o), site = o.site ? siteById(p, o.site) : null;
  const status = o.status === 'accepted' ? `<span class="stamp">${icon('check')}${t('Ajouté à votre plan', 'Added to your plan')}</span>` : o.status === 'declined' ? `<span class="tag">${t('Pas cette année', 'Not this year')}</span>` : `<span class="tag tag--green">${icon('bell')}${t('Nouveau', 'New')}</span>`;
  return `<article class="offer-card is-${o.status}" id="offer-${esc(o.id)}">
    <div class="offer-card__top"><div class="offer-card__who"><span class="avatar">${esc(initials(ex.name))}</span><div><b>${esc(ex.name)}</b><span>${esc(tx(ex.role))} · MBM ${esc(branchName(p.branch))} · ${esc(ago(o.at))}</span></div></div>${status}</div>
    <div class="offer-card__body">
      <div class="offer-card__ev">${o.evidence ? probIcon(o.evidence) : icon('leaf')}</div>
      <div class="stack" style="gap:8px;min-width:0">
        <div class="offer-card__title"><b class="h3">${esc(offerTitle(o))}</b>${site ? `<span class="tag tag--info">${icon('building')}${esc(tx(site.name))}</span>` : ''}</div>
        ${o.note ? `<blockquote class="offer-card__note">${esc(tx(o.note))}</blockquote>` : ''}
        <div class="offer-card__meta">${o.when ? `<span>${icon('calendar')}${esc(tx(o.when))}</span>` : ''}${ADD[o.key] ? `<span>${icon('info')}${esc(tx(ADD[o.key].desc))}</span>` : ''}</div>
      </div>
    </div>
    <div class="offer-card__foot"><div class="offer-card__price"><b class="num">${fmtMoney(amt)}</b><span>${t('+ taxes · facturé après le service', '+ tax · billed after the service')}</span></div>
      ${o.status === 'sent' ? `<div class="row" style="gap:8px"><button class="btn btn--ghost btn--sm" data-action="offer-decline" data-id="${esc(o.id)}">${t('Pas cette année', 'Not this year')}</button><button class="btn btn--green" data-action="offer-accept" data-id="${esc(o.id)}">${icon('check')}${t('Accepter', 'Accept')}</button></div>` : o.status === 'accepted' ? `<span class="small">${t('Accepté le', 'Accepted')} ${esc(fmtDate(o.decidedAt, { day: 'numeric', month: 'long' }))}</span>` : `<button class="btn btn--ghost btn--sm" data-action="offer-reopen" data-id="${esc(o.id)}">${t('Revoir', 'Reconsider')}</button>`}
    </div>
  </article>`;
}
function insightsHtml(p) {
  const ins = clientInsights(p);
  if (!ins.length) return '';
  return `<div class="insights reveal"><div class="insights__head"><span class="insights__badge">${icon('sparkle')}${t('Selon votre dossier', 'From your file')}</span><span class="tiny">${t('Synchronisé avec votre dossier MBM', 'Synced with your MBM file')}</span></div>${ins.map((x) => `<p class="insight">${icon(x.icon)}<span>${esc(tx(x))}</span></p>`).join('')}</div>`;
}
function offersSectionHtml(p) {
  const list = (p.offers || []).slice().sort((a, b) => (a.status === 'sent' ? -1 : 1) - (b.status === 'sent' ? -1 : 1) || String(b.at).localeCompare(String(a.at)));
  const ins = insightsHtml(p);
  if (!list.length && !ins) return '';
  return `<section class="section" id="offres"><div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">${t('Recommandé par votre équipe MBM', 'Recommended by your MBM team')}</p><h2 class="h2">${list.length ? t('Nos experts ont <em>remarqué</em> quelque chose.', 'Our experts <em>noticed</em> something.') : t('Ce que votre dossier <em>nous dit</em>.', 'What your file <em>tells us</em>.')}</h2>${list.length ? `<p class="lede">${t('Quand un technicien ou notre entomologiste voit un risque chez vous, il vous l’envoie ici, avec la raison, une photo et le prix. Vous décidez en un clic.', 'When a technician or our entomologist sees a risk at your place, they send it here, with the reason, a photo and the price. You decide in one click.')}</p>` : ''}</div>
    <div class="offers">${list.map((o) => offerCardHtml(p, o)).join('')}${ins}</div>
  </div></section>`;
}
function accountMiniHtml(p) {
  if (!hasAccount(p)) return `<div class="card stack" style="gap:10px"><p class="eyebrow">${t('Votre compte', 'Your account')}</p><p class="small" style="margin:0">${t('Votre compte s’ouvre à la signature : factures, versements et état de compte, ici même.', 'Your account opens when you sign: invoices, payments and statement, right here.')}</p></div>`;
  const L = ledger(p);
  return `<a class="card acctmini" href="#${p.slug}-compte"><div class="row" style="justify-content:space-between"><p class="eyebrow">${t('Mon compte', 'My account')}</p>${icon('arrowR')}</div>
    <div class="acctmini__n"><b class="num">${fmtMoney(L.dueNow)}</b><span class="small">${L.dueNow > 0 ? t('à payer', 'due') : t('à payer aujourd’hui', 'due today')}</span></div>
    <span class="small">${L.nextPay ? t(`Prochain prélèvement : ${fmtMoney(L.nextPay.amount)} le ${fmtDate(L.nextPay.date, { day: 'numeric', month: 'long' })}`, `Next payment: ${fmtMoney(L.nextPay.amount)} on ${fmtDate(L.nextPay.date, { month: 'long', day: 'numeric' })}`) : t(`${L.invoices.length} factures · état de compte`, `${L.invoices.length} invoices · statement`)}</span></a>`;
}

/* ============ My account: balance, invoices, statement, what comes next ============ */
function invoiceRowsHtml(p, L) {
  if (!L.invoices.length) return `<p class="small">${t('Aucune facture pour l’instant.', 'No invoices yet.')}</p>`;
  return `<div class="table-wrap"><table class="itable"><thead><tr><th>${t('Facture', 'Invoice')}</th><th>${t('Date', 'Date')}</th><th>${t('Description', 'Description')}</th><th class="r">${t('Montant', 'Amount')}</th><th>${t('Statut', 'Status')}</th><th class="r"><span class="sr-only">${t('Actions', 'Actions')}</span></th></tr></thead><tbody>
    ${L.invoices.map((e) => `<tr class="is-${e.status}"><td class="mono">${esc(e.no)}</td><td>${esc(fmtDate(e.date, { day: 'numeric', month: 'short', year: 'numeric' }))}</td><td><b>${esc(e.label)}</b>${e.sub ? `<span>${esc(e.sub)}</span>` : ''}</td><td class="r num">${fmtMoney(e.amount)}</td><td>${invStatusTag(e)}${e.status === 'due' || e.status === 'overdue' ? `<span class="tiny" style="display:block;margin-top:4px">${t('Échéance', 'Due')} ${esc(fmtDateShort(e.due))}</span>` : ''}</td><td class="r"><span class="row" style="gap:6px;justify-content:flex-end;flex-wrap:nowrap">${e.status === 'due' || e.status === 'overdue' ? `<button class="btn btn--xs btn--green" data-action="pay-invoice" data-id="${esc(e.id)}">${t('Payer', 'Pay')}</button>` : ''}<button class="btn btn--xs btn--ghost" data-action="invoice-pdf" data-id="${esc(e.id)}" aria-label="${t('Télécharger la facture', 'Download the invoice')} ${esc(e.no)}">${icon('download')}PDF</button></span></td></tr>`).join('')}
  </tbody></table></div>`;
}
function statementHtml(p, L) {
  const rows = L.items.slice().reverse();
  return `<div class="table-wrap"><table class="itable itable--stmt"><thead><tr><th>${t('Date', 'Date')}</th><th>${t('Opération', 'Transaction')}</th><th class="r">${t('Débit', 'Charge')}</th><th class="r">${t('Crédit', 'Credit')}</th><th class="r">${t('Solde', 'Balance')}</th></tr></thead><tbody>
    ${rows.map((e) => `<tr><td>${esc(fmtDate(e.date, { day: 'numeric', month: 'short', year: 'numeric' }))}</td><td><b>${e.kind === 'inv' ? `${t('Facture', 'Invoice')} ${esc(e.no)}` : esc(t('Paiement', 'Payment'))}</b><span>${esc(e.kind === 'inv' ? e.label : e.label)}</span></td><td class="r num">${e.amount > 0 ? fmtMoney(e.amount) : ''}</td><td class="r num">${e.amount < 0 ? fmtMoney(-e.amount) : ''}</td><td class="r num"><b>${fmtMoney(e.balance)}</b></td></tr>`).join('')}
  </tbody></table></div>`;
}
function upcomingHtml(p, L) {
  if (!L.upcoming.length) return `<p class="small">${t('Rien de prévu pour l’instant.', 'Nothing planned yet.')}</p>`;
  const list = L.upcoming.filter((u) => !u.date).concat(L.upcoming.filter((u) => u.date).slice(0, 5));
  return `<ul class="upcoming">${list.map((u) => `<li><span class="upcoming__d">${u.date ? `<b>${parseDay(u.date).getDate()}</b><span>${parseDay(u.date).toLocaleDateString(loc(), { month: 'short' }).replace('.', '')}</span>` : icon('sparkle')}</span><div><b>${esc(u.label)}</b>${u.when ? `<span>${esc(u.when)}</span>` : u.date ? `<span>${esc(cap1(fmtDateLong(u.date)))}</span>` : ''}</div><b class="num">${u.amount != null ? fmtMoney(u.amount) : '—'}</b></li>`).join('')}</ul>`;
}
function viewAccount(p) {
  const L = ledger(p), corp = isCorp(p), m = payMethod(p);
  const planInv = L.invoices.find((e) => e.plan && e.year === SEASON) || L.invoices.find((e) => e.plan);
  const paidPlan = planInv ? round2(L.items.filter((e) => e.kind === 'pay' && e.ref === planInv.no).reduce((s, e) => s - e.amount, 0)) : 0;
  const planPct = planInv ? Math.round((paidPlan / planInv.amount) * 100) : 0;
  const paidYear = round2(L.items.filter((e) => e.kind === 'pay' && String(e.date).startsWith('2026')).reduce((s, e) => s - e.amount, 0));
  const tiles = corp ? `
      <article class="tile tile--hero reveal"><span class="tile__k">${t('Solde à payer', 'Balance due')}</span><b class="tile__v num" data-count="${L.dueNow}" data-fmt="money">${fmtMoney(L.dueNow)}</b><span class="tile__s">${L.open[0] ? t(`${L.open.length} facture · échéance ${fmtDate(L.open[0].due, { day: 'numeric', month: 'long' })}`, `${L.open.length} invoice · due ${fmtDate(L.open[0].due, { month: 'long', day: 'numeric' })}`) : t('Aucune facture ouverte', 'No open invoice')}</span>${L.open[0] ? `<button class="btn btn--green btn--sm" data-action="pay-invoice" data-id="${esc(L.open[0].id)}">${icon('card')}${t('Payer par TEF', 'Pay by EFT')}</button>` : ''}</article>
      <article class="tile reveal" style="--d:60ms"><span class="tile__k">${t('Âge des comptes', 'Aging')}</span><div class="aging">${[['current', t('Courant', 'Current')], ['d30', '1–30 j'], ['d60', '31–60 j'], ['d90', '60 j +']].map(([k, lb]) => `<div class="${L.aging[k] > 0 ? 'is-on' : ''}"><span>${lb}</span><b class="num">${fmtMoney(L.aging[k], 0)}</b></div>`).join('')}</div><span class="tile__s">${t('Payé en 2026 :', 'Paid in 2026:')} ${fmtMoney(paidYear, 0)}</span></article>
      <article class="tile reveal" style="--d:120ms"><span class="tile__k">${t('Bon de commande', 'Purchase order')}</span><b class="tile__v tile__v--sm mono">${esc(p.billing.po)}</b><span class="tile__s">${t(`Net ${p.billing.terms} jours · facture consolidée par mois`, `Net ${p.billing.terms} days · consolidated monthly invoice`)}</span></article>
      <article class="tile reveal" style="--d:180ms"><span class="tile__k">${t('Comptes fournisseurs', 'Accounts payable')}</span><b class="tile__v tile__v--sm">${esc(p.billing.ap)}</b><span class="tile__s">${esc(payMethodLabel(p))}</span></article>`
    : `
      <article class="tile tile--hero reveal"><span class="tile__k">${t('À payer aujourd’hui', 'Due today')}</span><b class="tile__v num" data-count="${L.dueNow}" data-fmt="money">${fmtMoney(L.dueNow)}</b><span class="tile__s">${L.dueNow > 0 ? t('Une facture attend votre paiement', 'An invoice is waiting for payment') : t('Tout est payé. Merci !', 'Everything is paid. Thank you!')}</span>${L.open[0] ? `<button class="btn btn--green btn--sm" data-action="pay-invoice" data-id="${esc(L.open[0].id)}">${icon('card')}${t('Payer maintenant', 'Pay now')}</button>` : ''}</article>
      <article class="tile reveal" style="--d:60ms"><span class="tile__k">${t('Prochain prélèvement', 'Next payment')}</span><b class="tile__v num">${L.nextPay ? fmtMoney(L.nextPay.amount) : '—'}</b><span class="tile__s">${L.nextPay ? esc(cap1(fmtDateLong(L.nextPay.date))) : t('Aucun prélèvement prévu', 'No payment scheduled')}</span></article>
      <article class="tile reveal" style="--d:120ms"><span class="tile__k">${t(`Plan de paiement ${planInv ? planInv.year : SEASON}`, `${planInv ? planInv.year : SEASON} payment plan`)}</span><b class="tile__v num">${planPct} %</b><div class="hc__bar" aria-hidden="true"><i style="width:${planPct}%"></i></div><span class="tile__s">${planInv ? t(`${fmtMoney(paidPlan)} payés sur ${fmtMoney(planInv.amount)}`, `${fmtMoney(paidPlan)} paid of ${fmtMoney(planInv.amount)}`) : '—'}</span></article>
      <article class="tile reveal" style="--d:180ms"><span class="tile__k">${t('Mode de paiement', 'Payment method')}</span><div class="paycard ${m ? `paycard--${m.kind}` : ''}">${icon(m && m.kind === 'card' ? 'card' : 'building')}<b>${esc(payMethodLabel(p))}</b></div><span class="tile__s">${p.account && p.account.autopay ? t('Prélèvements automatiques activés', 'Automatic payments on') : t('Paiement à la réception', 'Payment on receipt')}</span></article>`;
  return `${viewHero(p, 'compte')}
  <section class="section"><div class="wrap"><div class="bento bento--4">${tiles}</div></div></section>
  ${pendingOffers(p).length ? `<section class="section" id="offres-compte"><div class="wrap"><div class="section-head reveal"><p class="eyebrow">${t('À décider', 'To decide')}</p><h2 class="h2">${t('Une recommandation <em>vous attend</em>.', 'A recommendation is <em>waiting for you</em>.')}</h2></div><div class="offers">${pendingOffers(p).map((o) => offerCardHtml(p, o)).join('')}</div></div></section>` : ''}
  <section class="section" id="factures"><div class="wrap">
    <div class="section-head reveal"><p class="eyebrow">${t('Factures', 'Invoices')}</p><h2 class="h2">${t('Chaque facture, <em>en un clic</em>.', 'Every invoice, <em>in one click</em>.')}</h2></div>
    <div class="card card--table reveal">${invoiceRowsHtml(p, L)}</div>
  </div></section>
  <section class="section" id="releve"><div class="wrap split">
    <div class="stack" style="gap:18px"><div class="section-head reveal" style="margin:0"><p class="eyebrow">${t('État de compte', 'Statement of account')}</p><h2 class="h2">${t('Toutes les opérations, <em>dans l’ordre</em>.', 'Every transaction, <em>in order</em>.')}</h2></div>
      <div class="card card--table reveal">${statementHtml(p, L)}</div>
      <button class="btn btn--ghost" style="justify-self:start" data-action="statement-pdf">${icon('download')}${t('Télécharger l’état de compte (PDF)', 'Download the statement (PDF)')}</button></div>
    <aside class="sticky stack" style="gap:16px"><div class="card stack reveal" style="gap:14px"><b class="h4">${t('À venir', 'Coming up')}</b>${upcomingHtml(p, L)}</div>
      <div class="card stack reveal" style="gap:10px"><b class="h4">${t('Une question sur une facture ?', 'A question about an invoice?')}</b><p class="small" style="margin:0">${t(`${firstName((p.rep || repFor(p.branch)).name)} voit la même chose que vous. Écrivez-lui, la facture est déjà jointe.`, `${firstName((p.rep || repFor(p.branch)).name)} sees the same thing you do. Write to them, the invoice is already attached.`)}</p><button class="btn btn--ghost btn--sm" style="justify-self:start" data-action="toggle-contact">${icon('chat')}${t('Joindre mon conseiller', 'Contact my advisor')}</button></div></aside>
  </div></section>`;
}
