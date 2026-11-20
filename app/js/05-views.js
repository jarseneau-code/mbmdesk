/* ============ Shared pieces ============ */
/* MBM logo in colour, for light backgrounds (LOGO_WM is the version with white lettering, for dark ones) */
function vdBadge(lg = false) { return `<span class="vd-badge ${lg ? 'vd-badge--lg' : ''}"><img src="${LOGO_COLOR}" alt="MBM Gestion parasitaire" width="${lg ? 125 : 91}" height="${lg ? 44 : 32}"></span>`; }
const WINNIA_PATHS = '<path class="wl-a" d="M272.602 79.2314L227.062 0.353374L318.142 0.353382L272.602 79.2314Z"/><path d="M50.3789 0.37207H90.1602L75.29 26.127L102.864 76.1699L118.518 49.1152L147.469 98.8955L102.798 176.103L75.2324 128.699L75.1855 128.728L0.634766 0.200195L50.3789 0.37207Z"/><path d="M164.614 0.37207H204.396L189.525 26.127L217.1 76.1689L232.752 49.1152L261.702 98.8955L217.032 176.103L189.468 128.699L189.421 128.728L114.87 0.200195L164.614 0.37207Z"/><path d="M806.817 76.3195V69.71H831.411V138.419H806.817V130.887C801.13 138.726 792.214 140.724 785.451 140.724C778.073 140.724 769.004 138.572 760.704 129.811C754.094 122.74 750.866 114.901 750.866 104.602C750.866 91.6906 755.939 82.6217 761.472 77.0881C767.313 71.2471 776.382 67.4043 786.22 67.4043C797.287 67.4043 803.896 73.0916 806.817 76.3195ZM791.753 88.309C788.679 88.309 784.529 89.3849 780.994 92.7666C777.612 95.9945 776.075 100.452 776.075 103.987C776.075 107.984 777.766 112.288 780.84 115.208C783.453 117.668 787.757 119.82 791.907 119.82C795.903 119.82 799.9 118.129 802.974 115.055C805.126 112.903 807.585 109.521 807.585 103.987C807.585 100.76 806.663 96.4556 802.82 92.7666C800.515 90.6146 796.979 88.309 791.753 88.309Z"/><path d="M718.867 69.71H743.461V138.419H718.867V69.71Z"/><path d="M635.465 138.419V69.71H660.059V78.3178C666.822 69.4025 675.891 68.1729 681.885 68.1729C688.956 68.1729 696.488 69.8637 702.175 75.551C708.016 81.392 708.631 87.233 708.631 94.7648V138.419H684.037V103.68C684.037 99.6836 684.191 93.6888 680.963 90.3072C678.658 87.8478 675.583 87.3867 673.124 87.3867C669.281 87.3867 666.053 88.7701 664.055 90.6146C661.596 92.9203 660.059 97.3779 660.059 101.528V138.419H635.465Z"/><path d="M552.062 138.419V69.71H576.656V78.3178C583.419 69.4025 592.488 68.1729 598.483 68.1729C605.554 68.1729 613.086 69.8637 618.773 75.551C624.614 81.392 625.229 87.233 625.229 94.7648V138.419H600.635V103.68C600.635 99.6836 600.789 93.6888 597.561 90.3072C595.255 87.8478 592.181 87.3867 589.722 87.3867C585.879 87.3867 582.651 88.7701 580.653 90.6146C578.193 92.9203 576.656 97.3779 576.656 101.528V138.419H552.062Z"/><path d="M517.296 69.71H541.89V138.419H517.296V69.71Z"/><path class="wl-a" d="M517.296 60.4863H541.889V35.8933H517.296V60.4863Z"/><path class="wl-a" d="M719.06 60.3994H743.653V35.8064H719.06V60.3994Z"/><path d="M353.029 35.8936H380.851L398.681 102.143L420.355 35.8936H441.567L461.703 102.143L481.07 35.8936H508.892L476.152 138.419H448.945L430.346 79.0863L410.671 138.419H383.618L353.029 35.8936Z"/>';
function winniaLogo(cls = '') { return `<span class="wlogo ${cls}" role="img" aria-label="Winnia"><svg viewBox="0 0 832 176" aria-hidden="true">${WINNIA_PATHS}</svg></span>`; }
function winniaMark() { return winniaLogo(); }
function langToggle() {
  return `<span class="lang" role="group" aria-label="${t('Langue', 'Language')}"><button type="button" data-action="lang" data-v="fr" aria-pressed="${S.lang === 'fr'}">FR</button><button type="button" data-action="lang" data-v="en" aria-pressed="${S.lang === 'en'}">EN</button></span>`;
}
function qrSvg(text) {
  if (typeof window.qrcode !== 'function') return `<span class="qr-fallback">${icon('qr')}<br>QR</span>`;
  try {
    const q = window.qrcode(0, 'M'); q.addData(String(text)); q.make();
    const n = q.getModuleCount(); let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    return `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" shape-rendering="crispEdges" aria-hidden="true"><rect x="-1" y="-1" width="${n + 2}" height="${n + 2}" fill="#FFFFFF"/><path d="${d}" fill="#14201A"/></svg>`;
  } catch (e) { return `<span class="qr-fallback">QR</span>`; }
}
/* ============ Gate: the door hanger ============ */
const STEP_BLURBS = {
  1: { fr: 'cinq minutes de questions sur votre maison', en: 'five minutes of questions about your home' },
  2: { fr: 'votre plan d’action, calculé sur-le-champ', en: 'your action plan, priced on the spot' },
  3: { fr: 'un technicien certifié confirme tout sur place', en: 'a certified technician confirms everything on site' },
  4: { fr: 'signée en ligne, sans paperasse', en: 'signed online, no paperwork' },
  5: { fr: 'préparation, avis de visite et rapports avec photos', en: 'prep, visit notices and photo reports' },
};
/* The arrival page: the door hanger the advisor left on the client's door handle, with a perforated coupon at the
   bottom. The right code tears the coupon off (see tearPass) and the space opens; a wrong one makes the hanger
   wobble on the handle. */
const passNo = (p) => `MBM-${String(hashStr(p.slug) % 9000 + 1000)}`;
const NEXT_TODO = {
  1: { fr: 'À vous : 5 minutes d’évaluation', en: 'Your turn: a 5-minute assessment' },
  2: { fr: 'À vous : découvrir votre plan d’action', en: 'Your turn: see your action plan' },
  3: { fr: 'À vous : choisir le moment de l’inspection', en: 'Your turn: pick a time for the inspection' },
  4: { fr: 'À vous : signer l’entente en ligne', en: 'Your turn: sign the agreement online' },
  5: { fr: 'Votre protection est planifiée', en: 'Your protection is planned' },
};
function hangerChecks(p) {
  const corp = isCorp(p), measured = corp || Number(A(p).area) > 0;
  const first = corp ? t(`${sitesOf(p).length} sites inspectés · ${fmtArea(areaOf(p))}`, `${sitesOf(p).length} sites inspected · ${fmtArea(areaOf(p))}`)
    : measured ? t(`Maison repérée · ${fmtArea(areaOf(p))}`, `Home located · ${fmtArea(areaOf(p))}`) : t('Propriété repérée par photo aérienne', 'Property located from aerial photos');
  return [[true, first], [true, t('Inspection gratuite offerte', 'Free inspection offered')], [p.stage >= 5, tx(NEXT_TODO[Math.min(5, Math.max(1, p.stage))])]];
}
/* What the hanger says, journey by journey (strings are HTML-safe: names are escaped here) */
function hangerModel(p) {
  const rep = p.rep || repFor(p.branch), c = { rep, e: rep.g === 'f' ? 'e' : '', br: branchName(p.branch), first: firstName(rep.name), dateL: fmtDate(p.createdAt, { day: 'numeric', month: 'long' }) };
  if (isRenewal(p)) return renewHanger(p, c);
  if (isTerm(p)) return termHanger(p, c);
  return {
    tag: `${t('Avis de passage', 'Visit notice')} · ${c.dateL}`, kick: t('Préparé pour', 'Prepared for'), name: householdOf(p),
    where: isCorp(p) ? `${sitesOf(p).length} sites · ${sitesOf(p).map((x) => x.city).join(', ')}` : `${p.client.address}, ${p.client.city}`,
    visit: isOrg(p) ? t(`${esc(c.first)} est passé${c.e} vous voir`, `${esc(c.first)} stopped by`) : t(`${esc(c.first)} est passé${c.e} dans votre rue`, `${esc(c.first)} stopped by your street`), checks: hangerChecks(p),
    coupon: t('Coupon · espace client', 'Coupon · client space'), go: t('Détacher et ouvrir mon espace', 'Tear off and open my space'),
    kicker: t(`Protection ${SEASON} · MBM ${esc(c.br)}`, `${SEASON} protection · MBM ${esc(c.br)}`),
    title: t('La protection de votre maison <em>commence sur le pas de la porte</em>.', 'Protecting your home <em>starts at your front door</em>.'),
    lede: t(`${esc(c.first)} a laissé cet accroche-porte sur votre poignée pendant la tournée de votre rue. Détachez le coupon avec votre code : il ouvre votre espace MBM, de l’évaluation à la première intervention, en passant par l’inspection gratuite.`, `${esc(c.first)} left this door hanger on your handle during the route on your street. Tear off the coupon with your code: it opens your MBM space, from the assessment to the first treatment, with a free inspection along the way.`),
    blurbs: STEP_BLURBS, seal: null, img: 'detail',
  };
}
function viewGate(p) {
  const rep = p.rep || repFor(p.branch), br = branchName(p.branch), H = hangerModel(p);
  const others = demoClients().filter((x) => x.slug !== p.slug).slice(0, 3);
  return `<main class="arrive">
    <div class="arrive__bg" aria-hidden="true"><img src="${asset('assets/maison.webp')}" alt="" decoding="async"></div>
    <div class="wrap arrive__top">
      <span class="arrive__lockup"><img src="${LOGO_WM}" alt="MBM Gestion parasitaire" width="100" height="35"><i aria-hidden="true"></i><span>${t('Espace client', 'Client space')}</span></span>
      <span class="row arrive__tools">${langToggle()}<a class="btn btn--sm arrive__staff" href="#admin">${t('Équipe MBM', 'MBM team')}${icon('arrowR')}</a></span>
    </div>
    <div class="wrap arrive__grid">
      <div class="porch">
        <span class="door" aria-hidden="true"></span>
        <div class="sway" id="sway">
          <form class="dh" id="hanger" data-form="gate" novalidate autocomplete="off">
            <div class="dh__main">
              <div class="dh__top" style="--img:url('${asset(`assets/${H.img}.webp`)}')"><span class="dh__slit" aria-hidden="true"></span>${H.seal ? `<span class="dh__seal" aria-hidden="true"><small>${esc(H.seal.top)}</small><b>${esc(H.seal.big)}</b><small>${esc(H.seal.bot)}</small></span>` : ''}<img src="${LOGO_WM}" alt="MBM Gestion parasitaire" width="150" height="53"><span class="dh__tag">${H.tag}</span></div>
              <div class="dh__body">
                <div class="dh__who"><p class="dh__kick">${H.kick}</p><p class="dh__name">${esc(H.name)}</p><p class="dh__addr">${esc(H.where)}</p></div>
                <div class="dh__visit"><span class="dh__av">${esc(initials(rep.name))}</span><span><b>${H.visit}</b><small>${esc(repTitle(rep))} · MBM ${esc(br)}</small></span></div>
                <ul class="dh__check">${H.checks.map(([done, label]) => `<li class="${done ? 'is-done' : ''}"><i>${done ? icon('check') : ''}</i>${esc(label)}</li>`).join('')}</ul>
              </div>
            </div>
            <div class="dh__coupon">
              <span class="dh__zip" aria-hidden="true"></span><span class="dh__cut" aria-hidden="true">${icon('scissors')}</span>
              <p class="dh__clabel"><b>${H.coupon}</b><span>N° ${passNo(p)}</span></p>
              <div class="dh__row">
                <div class="dh__qr" role="img" aria-label="${t('Code QR de votre espace', 'QR code for your space')}">${qrSvg(portalLink(p))}</div>
                <div class="field"><label class="field__label" for="gate-code">${t('Code d’accès', 'Access code')}</label><input class="input mono" id="gate-code" name="code" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${t('Sous le code QR', 'Under the QR code')}"></div>
              </div>
              <div class="dh__demo"><span class="dh__demo-l"><b>${t('Démo', 'Demo')}</b><code id="demo-code">${'•'.repeat(Math.min(10, p.code.length))}</code><button class="dh__eye" type="button" data-action="reveal-code" aria-label="${t('Afficher le code', 'Show the code')}" title="${t('Afficher le code', 'Show the code')}">${icon('eye')}</button></span><button class="btn btn--xs btn--ink" type="button" data-action="use-code">${t('Remplir le code', 'Fill in the code')}</button></div>
              <p class="dh__err" id="gate-err" role="alert"></p>
              <button class="btn btn--green btn--block dh__go" type="submit">${H.go}${icon('arrowR')}</button>
            </div>
          </form>
        </div>
        <span class="knob" aria-hidden="true"></span>
      </div>
      <div class="arrive__copy">
        <p class="arrive__kick"><span class="pulse"></span>${H.kicker}</p>
        <h1 class="arrive__title">${H.title}</h1>
        <p class="arrive__lede">${H.lede}</p>
        <ol class="arrive__steps">${stepsOf(p).map((s) => `<li><b>0${s.n}</b><span><strong>${tx(s)}</strong> · ${esc(tx(H.blurbs[s.n]))}</span></li>`).join('')}</ol>
        <div class="arrive__ex"><span class="arrive__ex-l">${t('Autres exemples', 'Other examples')}</span>${others.map((x) => `<button class="chip" type="button" data-action="demo-client" data-slug="${x.slug}">${icon(x.icon)}${esc(x.label)}</button>`).join('')}</div>
      </div>
    </div>
    <div class="wrap arrive__foot">${winniaLogo('wlogo--sm')}<span>${t('Concept conçu par Winnia pour MBM Gestion parasitaire. Clients, conseillers et prix fictifs. Le logo et la marque MBM appartiennent à MBM Gestion parasitaire.', 'Concept designed by Winnia for MBM Gestion parasitaire. Fictional clients, advisors and prices. The MBM logo and brand belong to MBM Gestion parasitaire.')}</span><a class="arrive__team" href="#admin">${t('Équipe MBM', 'MBM team')}${icon('arrowR')}</a></div>
  </main>`;
}
/* ============ Portal shell ============ */
function viewHeader(p, step) {
  const rep = p.rep || repFor(p.branch);
  const ST = stepsOf(p);
  const tabs = ST.map((s) => {
    if (s.n > p.stage) return `<span class="tab is-locked" aria-disabled="true" title="${esc(t(`Après : ${tx(ST[s.n - 2]).toLowerCase()}`, `After: ${tx(ST[s.n - 2]).toLowerCase()}`))}"><span class="tab__n">${icon('lock')}</span><span class="tab__l">${tx(s)}</span></span>`;
    const done = isStepDone(p, s.n), cur = s.n === step;
    const isNew = s.n === p.stage && !done && !cur && !(S.seen[p.slug] || {})[s.n];
    return `<a class="tab ${done ? 'is-done' : ''} ${S.justUnlocked === s.n ? 'is-entering' : ''}" href="#${p.slug}-${s.key}" ${cur ? 'aria-current="page"' : ''}><span class="tab__n">${done ? icon('check') : `0${s.n}`}</span><span class="tab__l">${tx(s)}</span>${isNew ? `<span class="tab__new" aria-label="${t('Nouveau', 'New')}"></span>` : ''}</a>`;
  }).join('');
  const acct = hasAccount(p), L = acct ? ledger(p) : null, offersN = pendingOffers(p).length;
  const badge = L && L.dueNow > 0 ? `<span class="tab__badge">${fmtMoney(L.dueNow, 0)}</span>` : offersN ? `<span class="tab__badge">${offersN}</span>` : '';
  const acctTab = acct ? `<a class="tab tab--acct" href="#${p.slug}-compte" ${step === 'compte' ? 'aria-current="page"' : ''}><span class="tab__l">${t('Mon compte', 'My account')}</span>${badge}</a>` : '';
  const opts = ST.filter((s) => s.n <= p.stage).map((s) => `<option value="${s.key}" ${s.n === step ? 'selected' : ''}>${s.n}. ${tx(s)}</option>`).join('') + (acct ? `<option value="compte" ${step === 'compte' ? 'selected' : ''}>${t('Mon compte', 'My account')}</option>` : '');
  return `<header class="phead">
    <div class="phead__in">
      <a class="brand" href="#${p.slug}" aria-label="MBM Gestion parasitaire">${vdBadge()}<span class="brand__sub">${isTerm(p) ? t('Suivi d’entente', 'Agreement space') : isCorp(p) ? t('Espace entreprise', 'Business space') : t('Mon espace client', 'My client space')}</span></a>
      <nav class="tabs" aria-label="${t('Vos étapes', 'Your steps')}">${tabs}${acctTab}</nav>
      <div class="steps-mobile"><label class="sr-only" for="step-select">${t('Étape', 'Step')}</label><select class="select" id="step-select" data-change="goto-step">${opts}</select></div>
      <div class="phead__r">
        ${langToggle()}
        <button class="who btn--contact" data-action="toggle-contact" aria-expanded="false" aria-controls="contact-pop"><span class="avatar">${esc(initials(rep.name))}</span><span class="who__t btn-label"><b>${esc(rep.team ? t('Nous joindre', 'Contact us') : firstName(rep.name))}</b><small>${esc(rep.team ? branchName(p.branch) : repRole(rep))}</small></span></button>
        <div class="contact-pop" id="contact-pop" hidden>
          <div class="row"><span class="avatar">${esc(initials(rep.name))}</span><div><b style="font-size:15px">${esc(rep.name)}</b><div class="small">${esc(repTitle(rep))} · MBM ${esc(branchName(p.branch))}</div></div></div>
          <p class="small" style="margin:0">${t(`Une question sur un nuisible ou sur votre dossier ? Écrivez ou appelez ${esc(rep.team ? 'votre bureau' : firstName(rep.name))} directement. Une urgence : ligne 24/7, ${MBM_LINE}.`, `A question about a pest or your file? Write or call ${esc(rep.team ? 'your office' : firstName(rep.name))} directly. An emergency: 24/7 line, ${MBM_LINE}.`)}</p>
          <div class="copyline"><span>${esc(rep.phone)}</span><button class="btn btn--xs btn--ghost" data-action="copy" data-text="${esc(rep.phone)}">${icon('copy')}${t('Copier', 'Copy')}</button></div>
          <div class="copyline"><span>${esc(rep.email)}</span><button class="btn btn--xs btn--ghost" data-action="copy" data-text="${esc(rep.email)}">${icon('copy')}${t('Copier', 'Copy')}</button></div>
        </div>
      </div>
    </div>
  </header>`;
}
/* The next visit for a signed client: the first treatment within 48 h, the follow-up three weeks later, then the spring visit */
function nextVisit(p) {
  /* The initial treatment and its follow-up only exist for a new client: a renewal or an agreement starts with the prevention visits */
  const sd = !isRenewal(p) && !isTerm(p) && p.signature && parseDay(p.signature.signedAt);
  const list = sd ? [[addDays(sd, 2), t('Intervention initiale', 'First treatment')], [addDays(sd, 21), t('Suivi du traitement', 'Treatment follow-up')]] : [];
  list.push([parseDay(FIRST_PASSAGE), t('Visite de prévention 1', 'Prevention visit 1')]);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const hit = list.find(([d]) => d >= now) || list[list.length - 1];
  return { date: isoDay(hit[0]), label: hit[1] };
}
/* The preparation button speaks to a home, a building or several sites */
const prepLabel = (p) => isCorp(p) ? t('Préparer mes sites', 'Get my sites ready') : isOrg(p) ? t('Préparer le bâtiment', 'Get the building ready') : t('Préparer ma maison', 'Get my home ready');
function heroCopy(p, step) {
  if (step !== 'compte') { const c = isRenewal(p) ? renewHero(p, step) : isTerm(p) ? termHero(p, step) : null; if (c) return c; }
  const rep = p.rep || repFor(p.branch), fn = firstName(p.client.first || p.client.name);
  const repFn = rep.team ? t('votre conseiller', 'your advisor') : firstName(rep.name);
  const a = A(p), q = qProgress(p), corp = isCorp(p), nSites = sitesOf(p).length;
  if (step === 'compte') {
    return { kicker: corp ? t(`${p.client.name} · client depuis ${p.since}`, `${p.client.name} · client since ${p.since}`) : isReturning(p) ? t(`${householdOf(p)} · client depuis ${p.since}`, `${householdOf(p)} · client since ${p.since}`) : t(`Compte client · ${householdOf(p)}`, `Client account · ${householdOf(p)}`),
      title: t('Votre compte, <em>limpide</em>.', 'Your account, <em>crystal clear</em>.'),
      sub: corp ? t('Factures consolidées par site, bon de commande, échéances et état de compte : tout ce que vos comptes fournisseurs demandent, au même endroit.', 'Consolidated invoices by site, purchase order, due dates and statement: everything your accounts payable team asks for, in one place.') : t('Vos factures, vos versements et ce qui s’en vient. Rien à chercher, personne à appeler.', 'Your invoices, your payments and what is coming. Nothing to look for, no one to call.'),
      actions: [[t('Voir mes factures', 'See my invoices'), 'factures', 'green'], [t('État de compte', 'Statement'), 'releve', 'ghost']] };
  }
  const nv = nextVisit(p);
  const d = {
    1: { kicker: t(`Préparé pour ${householdOf(p)} · ${p.client.city}`, `Prepared for ${householdOf(p)} · ${p.client.city}`),
      title: isOrg(p) ? t('Parlez-nous de votre <em>bâtiment</em>.', 'Tell us about your <em>building</em>.') : t('Parlez-nous de votre <em>maison</em>.', 'Tell us about your <em>home</em>.'),
      sub: t(`Cinq minutes de questions, et votre plan d’action se calcule tout seul. ${cap1(repFn)} le validera avec vous à l’inspection.`, `Five minutes of questions and your action plan prices itself. ${cap1(repFn)} will confirm it with you at the inspection.`),
      actions: [[a.submittedAt ? t('Revoir mes réponses', 'Review my answers') : q.done ? t('Continuer l’évaluation', 'Continue the assessment') : t('Commencer l’évaluation', 'Start the assessment'), 'diagnostic-form', 'green'], [isOrg(p) ? t('Voir mon bâtiment', 'See my building') : t('Voir ma maison', 'See my home'), 'plancard', 'ghost']] },
    2: { kicker: t(`Plan d’action v${p.proposal.version}, préparé le ${fmtDate(p.proposal.date, { day: 'numeric', month: 'long' })}`, `Action plan v${p.proposal.version}, prepared ${fmtDate(p.proposal.date, { month: 'long', day: 'numeric' })}`),
      title: corp ? t(`Un programme, <em>${nSites} sites</em>.`, `One program, <em>${nSites} sites</em>.`) : t('Votre plan d’action <em>est prêt</em>.', 'Your action plan <em>is ready</em>.'),
      sub: corp ? t('Chaque site est chiffré selon sa superficie et ses risques. Une seule entente, une facture consolidée par mois, le détail par site.', 'Each site is priced on its area and its risks. One agreement, one consolidated invoice a month, itemized by site.') : t('Chaque traitement recommandé vient d’une réponse de votre évaluation. Ajustez-le : le prix se recalcule devant vous.', 'Every recommended treatment comes from one of your answers. Adjust it and the price updates in front of you.'),
      actions: [[t('Voir le plan', 'See the plan'), 'programme', 'green'], p.stage > 2 ? [t('Aller à l’inspection', 'Go to the inspection'), '@visite', 'ghost'] : [t('Voir le calendrier', 'See the calendar'), 'saison-tl', 'ghost']] },
    3: { kicker: t(`Inspection gratuite avec ${rep.name}`, `Free inspection with ${rep.name}`),
      title: corp ? t('On inspecte <em>vos sites</em>.', 'We inspect <em>your sites</em>.') : isOrg(p) ? t('On inspecte <em>votre bâtiment</em>.', 'We inspect <em>your building</em>.') : t('On vient voir <em>chez vous</em>.', 'We come <em>to your home</em>.'),
      sub: t(`${cap1(repFn)} confirme le nuisible, trouve la cause et les points d’entrée, et ajuste votre plan avec vous. Une urgence ? La ligne 24/7 répond tout de suite.`, `${cap1(repFn)} confirms the pest, finds the cause and the entry points, and fine-tunes your plan with you. An emergency? The 24/7 line answers right away.`),
      actions: [[p.visit ? t('Voir ma réservation', 'See my booking') : t('Choisir une date', 'Pick a date'), 'booker-sec', 'green']] },
    4: { kicker: t(`Entente de service · ${SEASON}`, `Service agreement · ${SEASON}`),
      title: p.signature ? t('C’est <em>signé</em>. Merci !', 'It’s <em>signed</em>. Thank you!') : t('Votre entente, <em>en clair</em>.', 'Your agreement, <em>in plain words</em>.'),
      sub: p.signature ? t('Voici votre entente signée. Elle reprend mot pour mot le plan validé à l’inspection.', 'Here is your signed agreement. It repeats, word for word, the plan confirmed at the inspection.') : t('Elle reprend le plan validé à l’inspection : mêmes traitements, même prix. Lisez-la ici et signez en une minute.', 'It repeats the plan confirmed at the inspection: same treatments, same price. Read it here and sign in a minute.'),
      actions: [[p.signature ? t('Voir l’entente signée', 'See the signed agreement') : t('Lire et signer', 'Read and sign'), 'agreement', 'green']] },
    5: { kicker: corp ? t(`Programme ${SEASON} · ${nSites} sites · prochaine visite le ${fmtDate(nv.date, { day: 'numeric', month: 'long' })}`, `${SEASON} program · ${nSites} sites · next visit ${fmtDate(nv.date, { month: 'long', day: 'numeric' })}`) : `${nv.label} · ${cap1(fmtDateLong(nv.date))}`,
      title: corp ? t(`Votre programme ${SEASON}, <em>sur ${nSites} sites</em>.`, `Your ${SEASON} program, <em>across ${nSites} sites</em>.`) : isReturning(p) ? t(`Content de vous revoir, <em>${esc(fn)}</em>.`, `Good to see you again, <em>${esc(fn)}</em>.`) : isOrg(p) ? t(`Bienvenue chez MBM, <em>${esc(p.client.name)}</em>.`, `Welcome to MBM, <em>${esc(p.client.name)}</em>.`) : t(`Bienvenue chez MBM, <em>${esc(fn)}</em>.`, `Welcome to MBM, <em>${esc(fn)}</em>.`),
      sub: corp ? t('Vos sites sont inscrits aux tournées de Laval. Rapports par site, registre des stations, recommandations de nos experts et facturation consolidée : tout passe par ici.', 'Your sites are on the Laval routes. Reports by site, station log, recommendations from our experts and consolidated billing: it all happens here.') : isOrg(p) ? t('Votre bâtiment est inscrit à la tournée de votre secteur. Voici ce qu’on prépare, ce qu’il vous reste à faire et ce qui arrive après chaque visite.', 'Your building is on your area’s route. Here is what we are preparing, what is left for you to do and what happens after each visit.') : t('Votre maison est inscrite à la tournée de votre secteur. Voici ce qu’on prépare, ce qu’il vous reste à faire et ce qui arrive après chaque visite.', 'Your home is on your area’s route. Here is what we are preparing, what is left for you to do and what happens after each visit.'),
      actions: pendingOffers(p).length ? [[t('Voir la recommandation de votre expert', 'See your expert’s recommendation'), 'offres', 'green'], [prepLabel(p), 'preparer', 'ghost']] : [[prepLabel(p), 'preparer', 'green'], [t('Voir un rapport de visite', 'See a visit report'), 'rapport', 'ghost']] },
  }[step];
  return d;
}
function heroCard(p, step) {
  if (step !== 'compte') { const h = isRenewal(p) ? renewCard(p, step) : isTerm(p) ? termCard(p, step) : null; if (h) return h; }
  const row = (k, v, cls = '') => `<div class="hc__row ${cls}"><span>${k}</span><b>${v}</b></div>`;
  const rep = p.rep || repFor(p.branch);
  if (step === 'compte') {
    const L = ledger(p), corp = isCorp(p);
    const big = L.dueNow > 0 ? L.dueNow : 0;
    const head = L.dueNow > 0 ? (L.open.some((e) => e.status === 'overdue') ? `<span class="tag tag--alert">${t('En retard', 'Overdue')}</span>` : `<span class="tag tag--warn">${t('À payer', 'Due')}</span>`) : `<span class="tag tag--ok">${icon('check')}${t('À jour', 'Up to date')}</span>`;
    return `<aside class="hc" aria-label="${t('Solde du compte', 'Account balance')}"><div class="hc__head"><span>${t('Montant exigible', 'Amount due')}</span>${head}</div>
      <div class="hc__money"><b class="num" data-count="${big}" data-fmt="money">${fmtMoney(big)}</b><span class="small">${L.dueNow > 0 && L.open[0] ? `${t('Échéance', 'Due')} ${fmtDate(L.open[0].due, { day: 'numeric', month: 'long' })}` : t('Rien à payer aujourd’hui', 'Nothing to pay today')}</span></div>
      <div class="hc__rows">${L.nextPay ? row(t('Prochain prélèvement', 'Next payment'), `${fmtMoney(L.nextPay.amount)} · ${fmtDateShort(L.nextPay.date)}`) : ''}${corp ? row(t('Modalités', 'Terms'), t(`Net ${p.billing.terms} jours`, `Net ${p.billing.terms} days`)) + row(t('Bon de commande', 'Purchase order'), esc(p.billing.po)) : row(t('Solde du plan', 'Plan balance'), fmtMoney(L.plan))}${row(t('Paiement', 'Payment'), esc(payMethodLabel(p)))}</div></aside>`;
  }
  if (step === 1) {
    const q = qProgress(p), sub = A(p).submittedAt;
    const tag = sub ? `<span class="tag tag--ok">${icon('check')}${t('Envoyée', 'Sent')} ${fmtDateShort(sub)}</span>` : q.done ? `<span class="tag tag--warn">${t('En cours', 'In progress')}</span>` : `<span class="tag">${t('À commencer', 'Not started')}</span>`;
    const note = sub ? t('Vos réponses ont servi à calculer votre plan d’action. Vous pouvez encore les modifier.', 'Your answers were used to price your action plan. You can still change them.') : t('Environ cinq minutes. Chaque réponse est enregistrée au fur et à mesure.', 'About five minutes. Every answer is saved as you go.');
    return `<aside class="hc" aria-label="${t('Votre évaluation', 'Your assessment')}"><div class="hc__head"><span>${t('Votre évaluation', 'Your assessment')}</span>${tag}</div>
      <div class="hc__ring">${ringSvg(q.pct, 84, 8)}<div><b class="hc__big num">${q.pct} %</b><span class="small">${t(`${q.done} sur ${q.total} sections`, `${q.done} of ${q.total} sections`)}</span></div></div>
      <p class="hc__foot">${note}</p></aside>`;
  }
  if (step === 2) {
    const qu = quote(p), corp = isCorp(p);
    return `<aside class="hc" aria-label="${t('Votre plan en bref', 'Your plan at a glance')}"><div class="hc__head"><span>${t('Votre plan en bref', 'Your plan at a glance')}</span><span class="tag">v${esc(p.proposal.version)}</span></div>
      <div class="hc__money"><b class="num" data-count="${corp ? qu.season - qu.discount : qu.monthly}" data-fmt="money">${fmtMoney(corp ? qu.season - qu.discount : qu.monthly)}</b><span class="small">${corp ? t(`pour l’année, ${sitesOf(p).length} sites + tx`, `for the year, ${sitesOf(p).length} sites + tax`) : t('par mois sur 12 mois + tx', 'a month over 12 months + tax')}</span></div>
      <div class="hc__rows">${corp ? row(t('Facturation', 'Billing'), t('Après chaque visite', 'After each visit')) + row(t('Modalités', 'Terms'), t(`Net ${(p.billing && p.billing.terms) || 30} jours`, `Net ${(p.billing && p.billing.terms) || 30} days`)) : row(t(`Plan ${SEASON}`, `${SEASON} plan`), `${fmtMoney(qu.season - qu.discount, 0)} ${t('+ tx', '+ tax')}`)}${row(t('Traitements ciblés', 'Targeted treatments'), String(qu.lines.length - 1))}${qu.discount ? row(t(`Rabais ${corp ? 'multisite' : ''} ${qu.discPct} %`, `${corp ? 'Multi-site' : ''} ${qu.discPct}% discount`), `− ${fmtMoney(qu.discount, 0)}`, 'is-pos') : ''}${qu.promo ? row(t('Intervention initiale', 'First treatment'), fmtMoney(qu.promo), 'is-pos') : ''}</div>
      <p class="hc__foot">${p.proposal.acceptedAt ? `${t('Accepté le', 'Accepted')} ${fmtDate(p.proposal.acceptedAt, { day: 'numeric', month: 'long' })}` : `${t('Valide jusqu’au', 'Valid until')} ${fmtDate(p.proposal.validUntil, { day: 'numeric', month: 'long', year: 'numeric' })}`}</p></aside>`;
  }
  if (step === 3) {
    const v = p.visit;
    if (v) {
      const s = visitStart(v), past = visitEnd(v) < new Date();
      return `<aside class="hc" aria-label="${t('Votre inspection', 'Your inspection')}"><div class="hc__head"><span>${v.mode === 'video' ? t('Votre appel vidéo', 'Your video call') : t('Votre inspection', 'Your inspection')}</span><span class="tag ${past ? '' : 'tag--ok'}">${past ? t('Faite', 'Done') : t('Réservée', 'Booked')}</span></div>
        <div class="hc__date"><div class="hc__cal"><span>${s.toLocaleDateString(loc(), { month: 'short' }).replace('.', '').toUpperCase()}</span><b>${s.getDate()}</b></div><div><b class="h4">${cap1(s.toLocaleDateString(loc(), { weekday: 'long' }))}</b><span class="small" style="display:block;margin-top:3px">${v.mode === 'video' ? fmtHour(s.getHours(), s.getMinutes()) + ', 15 min' : (() => { const w = WINDOWS.find((x) => x.k === v.window) || WINDOWS[0]; return `${tx(w)}, ${fmtHour(w.from)} – ${fmtHour(w.to)}`; })()}</span></div></div>
        <div class="hc__rows">${row(t('Avec', 'With'), esc(rep.name))}${row(t('Présence', 'Presence'), v.presence === 'non' ? t('Extérieur seulement', 'Outside only') : t('Sur place', 'On site'))}</div></aside>`;
    }
    return `<aside class="hc" aria-label="${t('Votre inspection', 'Your inspection')}"><div class="hc__head"><span>${t('Votre inspection', 'Your inspection')}</span><span class="tag tag--warn">${t('À réserver', 'To book')}</span></div>
      <div class="hc__rows">${row(t('Durée', 'Length'), t('30 à 45 minutes', '30 to 45 minutes'))}${row(t('Coût', 'Cost'), t('Gratuite', 'Free'))}${row(t('Avec', 'With'), esc(rep.name))}${row(t('Ou encore', 'Or'), t('Appel vidéo de 15 min', '15-min video call'))}</div></aside>`;
  }
  if (step === 4) {
    const s = p.signature;
    return `<aside class="hc" aria-label="${t('Statut de l’entente', 'Agreement status')}"><div class="hc__head"><span>${t('Entente de service', 'Service agreement')}</span>${s ? `<span class="tag tag--ok">${icon('check')}${t('Signée', 'Signed')}</span>` : `<span class="tag tag--warn">${t('À signer', 'To sign')}</span>`}</div>
      <div class="hc__rows">${row(t('N°', 'No.'), esc(docId(p)))}${row(t('Année', 'Year'), String(SEASON))}${row(t('Total, taxes incluses', 'Total, tax included'), fmtMoney(quote(p).total))}${s ? row(t('Signée par', 'Signed by'), `${esc(s.name)}, ${fmtDateShort(s.signedAt)}`) : row(t('Basée sur', 'Based on'), `${t('Plan d’action', 'Action plan')} v${esc(p.proposal.version)}`)}</div>
      ${s ? `<p class="hc__foot">${p.countersigned ? `${t('Contresignée par', 'Countersigned by')} ${esc(p.countersigned.name)}.` : t('Votre bureau contresigne dans les minutes qui suivent.', 'Your office countersigns within minutes.')}</p>` : ''}</aside>`;
  }
  const pct = obProgress(p), nv = nextVisit(p), dl = daysUntil(nv.date);
  const tk = (p.onboarding && p.onboarding.tasks) || {};
  const nextT = obTasks(p).find((x) => !tk[x.id] && x.owner === 'you');
  return `<aside class="hc" aria-label="${t('Compte à rebours', 'Countdown')}"><div class="hc__head"><span>${esc(nv.label)}</span><span class="tag">${pct} % ${t('prêt', 'ready')}</span></div>
    <div class="hc__count"><b class="num" data-count="${Math.max(0, dl)}" data-fmt="int">${Math.max(0, dl)}</b><span class="small">${dl === 1 ? t('jour', 'day') : t('jours', 'days')}<br>${fmtDate(nv.date, { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
    <div class="hc__bar" aria-hidden="true"><i style="width:${pct}%"></i></div>
    ${nextT ? `<p class="hc__foot">${t('À faire de votre côté :', 'Your next step:')} <b>${esc(taskLabel(p, nextT))}</b></p>` : `<p class="hc__foot">${t('Tout est prêt de votre côté.', 'Everything is ready on your side.')}</p>`}</aside>`;
}
/* Illustrations: the home starts out grey (desaturated) and comes to life as the journey moves forward */
const HERO_PHOTO = { 1: ['detail', 0.42, 0.93], 2: ['detail', 0.78, 0.98], 3: ['maison', 1, 1], 4: ['detail', 1, 1.01], 5: ['maison', 1.04, 1.02], compte: ['detail', 1.08, 1.02] };
/* A returning client is already protected: the image stays in full colour */
const FLOW_PHOTO = {
  renewal: { 1: ['detail', 1.06, 1.02], 2: ['detail', 1.08, 1.03], 3: ['maison', 1, 1], 4: ['detail', 1.04, 1.02], 5: ['maison', 1.04, 1.02] },
  term: { 1: ['maison', 1, 1], 2: ['detail', 1.04, 1.02], 3: ['detail', 1.08, 1.03], 4: ['maison', 1.02, 1.01], 5: ['maison', 1.04, 1.02] },
};
function heroChip(p, step) {
  if (step !== 'compte') { const c = isRenewal(p) ? renewChip(p, step) : isTerm(p) ? termChip(p, step) : null; if (c) return c; }
  const started = A(p).submittedAt || qProgress(p).done;
  if (step === 1) return started ? `<span>${t('Indice de protection', 'Protection index')}</span><b>${healthNow(p)}<small>/100</small></b>` : `<span>${isOrg(p) ? t('Votre bâtiment', 'Your building') : t('Votre maison', 'Your home')}</span><b>${t('À évaluer', 'To assess')}</b>`;
  if (step === 2) return `<span>${t('Dans un an', 'In a year')}</span><b>${healthNow(p)} → ${healthAfter(p)}<small>/100</small></b>`;
  if (step === 3) return `<span>${t('Inspection', 'Inspection')}</span><b>${t('Gratuite', 'Free')}</b>`;
  if (step === 4) return `<span>${t('Entente', 'Agreement')}</span><b>${esc(docId(p))}</b>`;
  if (step === 5) { const nv = nextVisit(p); return `<span>${esc(nv.label)}</span><b>${fmtDate(nv.date, { day: 'numeric', month: 'long' })}</b>`; }
  return isReturning(p) ? `<span>${t('Client depuis', 'Client since')}</span><b>${p.since}</b>` : `<span>${t('Année', 'Year')}</span><b>${SEASON}</b>`;
}
function viewHero(p, step) {
  const c = heroCopy(p, step), rep = p.rep || repFor(p.branch);
  const PH = (step !== 'compte' && FLOW_PHOTO[flowOf(p).key]) || HERO_PHOTO;
  const [ph, sat, bri] = PH[step] || HERO_PHOTO[step] || HERO_PHOTO[1];
  /* Targets: an id to scroll to, "@key" for another step, "!action" for a button action */
  const actions = c.actions.map(([label, target, kind, ic]) => target.charAt(0) === '@'
    ? `<a class="btn btn--${kind}" href="#${p.slug}-${target.slice(1)}">${esc(label)}${kind === 'green' ? icon('arrowR') : ''}</a>`
    : target.charAt(0) === '!' ? `<button class="btn btn--${kind}" data-action="${target.slice(1)}">${ic ? icon(ic) : ''}${esc(label)}</button>`
      : `<button class="btn btn--${kind}" data-action="scroll-to" data-target="${target}">${esc(label)}${kind === 'green' ? icon('arrowR') : ''}</button>`).join('');
  return `<section class="hero" aria-labelledby="hero-title">
    <div class="wrap hero__grid">
      <div class="hero__copy">
        <p class="hero__kicker"><span class="pulse"></span><span>${esc(c.kicker)}</span></p>
        <h1 class="display" id="hero-title">${c.title}</h1>
        <p class="lede">${esc(c.sub)}</p>
        <div class="hero__actions">${actions}</div>
        <div class="hero__rep"><span class="avatar">${esc(initials(rep.name))}</span><span><b>${esc(rep.name)}</b><small>${esc(repTitle(rep))} · MBM ${esc(branchName(p.branch))}</small></span></div>
      </div>
      <div class="hero__visual">
        <figure class="hero__media hero__media--${ph}" style="--sat:${sat};--bri:${bri}"><img class="hero__img" src="${asset(`assets/${ph}.webp`)}" alt="" decoding="async"><figcaption class="hero__chip">${heroChip(p, step)}</figcaption></figure>
        ${heroCard(p, step)}
      </div>
    </div>
    ${viewJourney(p, step)}
  </section>`;
}
function viewJourney(p, step) {
  const ST = stepsOf(p);
  const li = ST.map((s) => {
    const st = stepState(p, s.n), when = stepDate(p, s.n);
    const sub = st === 'done' ? (when ? `${t('Fait', 'Done')} ${fmtDateShort(when)}` : t('Fait', 'Done')) : st === 'current' ? (s.n === step ? t('Vous êtes ici', 'You are here') : t('En cours', 'In progress')) : st === 'open' ? t('Disponible', 'Available') : t(`Après : ${tx(ST[s.n - 2]).toLowerCase()}`, `After: ${tx(ST[s.n - 2]).toLowerCase()}`);
    return `<li class="jsteps__i is-${st} ${s.n === step ? 'is-here' : ''}">${st !== 'locked' ? `<a href="#${p.slug}-${s.key}" aria-label="${t('Aller à', 'Go to')} ${tx(s)}"></a>` : ''}<span class="jsteps__bar" aria-hidden="true"><i></i></span><span class="jsteps__n">${st === 'done' ? icon('check') : ''}0${s.n}</span><span class="jsteps__l">${tx(s)}</span><span class="jsteps__s">${esc(sub)}</span></li>`;
  }).join('');
  return `<div class="journey"><div class="wrap"><ol class="jsteps" aria-label="${t('Votre parcours', 'Your journey')}">${li}</ol></div></div>`;
}
function viewFooter(p) {
  return `<footer class="pfoot"><div class="wrap"><div class="pfoot__panel">
    <div class="pfoot__top">
      <p class="pfoot__line">${isCorp(p) ? t('Des sites protégés <em>toute l’année</em>, sans avoir à y penser.', 'Sites protected <em>all year</em>, without a second thought.') : isOrg(p) ? t('Un bâtiment protégé <em>toute l’année</em>, sans avoir à y penser.', 'A building protected <em>all year</em>, without a second thought.') : t('Une maison protégée <em>toute l’année</em>, sans avoir à y penser.', 'A home protected <em>all year</em>, without a second thought.')}</p>
      <div class="pfoot__vd"><img src="${LOGO_WM}" alt="MBM Gestion parasitaire" width="208" height="73"><span>${t(`Votre espace client · ${SEASON}`, `Your client space · ${SEASON}`)}</span></div>
    </div>
    <div class="pfoot__bot">
      <div class="pfoot__brand">${winniaLogo('wlogo--md')}<span>${t('Conçu par Winnia pour MBM Gestion parasitaire', 'Designed by Winnia for MBM Gestion parasitaire')}</span></div>
      <p>${t('Concept de démonstration. Clients, conseillers, factures et prix fictifs. Le logo et la marque MBM appartiennent à MBM Gestion parasitaire.', 'Demonstration concept. Fictional clients, advisors, invoices and prices. The MBM logo and brand belong to MBM Gestion parasitaire.')}</p>
      <span class="row pfoot__tools">${langToggle()}<a class="btn btn--xs" href="#admin">${icon('layout')}${t('Console', 'Console')}</a><button class="btn btn--xs" data-action="lock">${icon('lock')}${t('Verrouiller', 'Lock')}</button></span>
    </div>
  </div></div></footer>`;
}
/* ============ Demo dock: switch examples, jump steps, move the file forward ============ */
function demoClients() {
  return [
    { slug: 'tremblay', icon: 'home', label: t('Résidentiel · nouveau client', 'Residential · new client') },
    { slug: 'bergeron', icon: 'refresh', label: t('Renouvellement annuel', 'Annual renewal') },
    { slug: 'riverain', icon: 'calendar', label: t('Entente de 4 ans · an 2', '4-year agreement · year 2') },
    { slug: 'nordelys', icon: 'building', label: t('Agroalimentaire · 3 sites', 'Food plant · 3 sites') },
    { slug: 'jardins-du-parc', icon: 'users', label: t('Copropriété · 48 unités', 'Condo · 48 units') },
    { slug: 'desjardins', icon: 'sparkle', label: t('Client · recommandation en attente', 'Client · pending recommendation') },
    { slug: 'simard', icon: 'shield', label: t('Client fidèle · historique', 'Loyal client · history') },
  ].filter((x) => S.portals[x.slug]);
}
function viewDemoDock(p, step) {
  const acct = hasAccount(p);
  const ST = stepsOf(p);
  const next = p.stage < 5 ? { action: 'demo-next', label: t('Étape suivante', 'Next step'), sub: tx(ST[p.stage]) }
    : step !== 'compte' && acct ? { href: `#${p.slug}-compte`, label: t('Voir le compte', 'See the account'), sub: t('Factures et relevé', 'Invoices and statement') }
      : { href: S.adminOk ? `#admin-${p.slug}` : '#admin', label: t('Vue MBM', 'MBM view'), sub: t('Console du dossier', 'File console') };
  const dots = ST.map((s) => {
    const st = s.n < p.stage || isStepDone(p, s.n) ? 'done' : s.n === p.stage ? 'current' : 'locked';
    const inner = st === 'done' ? icon('check') : String(s.n);
    return s.n <= p.stage ? `<a class="dock__dot is-${st} ${s.n === step ? 'is-on' : ''}" href="#${p.slug}-${s.key}" aria-label="${esc(tx(s))}" title="${esc(tx(s))}">${inner}</a>` : `<span class="dock__dot is-locked" title="${esc(tx(s))}">${inner}</span>`;
  }).join('<i class="dock__link" aria-hidden="true"></i>') + (acct ? `<i class="dock__link" aria-hidden="true"></i><a class="dock__dot dock__dot--acct ${step === 'compte' ? 'is-on' : ''}" href="#${p.slug}-compte" aria-label="${t('Mon compte', 'My account')}" title="${t('Mon compte', 'My account')}">${icon('receipt')}</a>` : '');
  const fill = step === 1 && flowOf(p).key === 'onboarding' && !A(p).submittedAt ? `<button class="dock__btn" data-action="demo-fill">${icon('sparkle')}<span>${t('Remplir un exemple', 'Fill a sample')}</span></button>` : '';
  const known = demoClients().some((x) => x.slug === p.slug);
  const open = next.action ? `<button class="dock__next" data-action="${next.action}">` : `<a class="dock__next" href="${next.href}">`;
  return `<div class="dock" role="region" aria-label="${t('Contrôles de démo', 'Demo controls')}">
    <div class="dock__who"><span class="dock__badge"><i aria-hidden="true"></i>${t('Démo', 'Demo')}</span><label class="sr-only" for="dock-client">${t('Exemple de client', 'Sample client')}</label><select id="dock-client" class="dock__select" data-change="demo-client">${known ? '' : `<option value="${esc(p.slug)}" selected>${esc(householdOf(p))}</option>`}${demoClients().map((x) => `<option value="${x.slug}" ${x.slug === p.slug ? 'selected' : ''}>${esc(x.label)}</option>`).join('')}</select></div>
    <div class="dock__steps" aria-label="${t('Étapes', 'Steps')}">${dots}</div>
    ${fill}
    ${open}<span class="dock__next-l"><b>${esc(next.label)}</b><small>${esc(next.sub)}</small></span>${icon('arrowR')}${next.action ? '</button>' : '</a>'}
    <button class="dock__icon" data-action="demo-reset" aria-label="${t('Recommencer la démo', 'Restart the demo')}" title="${t('Recommencer la démo', 'Restart the demo')}">${icon('refresh')}<span class="dock__icon-l">${t('Confirmer ?', 'Confirm?')}</span></button>
  </div>`;
}
const viewDemoPill = viewDemoDock;

/* ============ Virtual advisor ============ */
function aiBadgeText() { return S.caps.sample ? t('Propulsé par Claude', 'Powered by Claude') : t('Réponses de base · Claude s’active en ligne', 'Basic answers · Claude turns on online'); }
function askLog(p) {
  if (!S.chat[p.slug]) S.chat[p.slug] = [{ role: 'bot', text: t(`Bonjour ${firstName(p.client.first || p.client.name)} ! Je réponds à vos questions sur les nuisibles, les traitements et votre dossier. Pour une vraie inspection, ${firstName((p.rep || repFor(p.branch)).name)} passe sur place.`, `Hi ${firstName(p.client.first || p.client.name)}! I answer questions about pests, the treatments and your file. For a real inspection, ${firstName((p.rep || repFor(p.branch)).name)} comes on site.`) }];
  return S.chat[p.slug];
}
function bubblesHtml(p) {
  const log = askLog(p);
  const chips = log.length < 3 ? `<div class="ask__sugg">${[12, 3, 4, 6, 9].map((i) => FAQ[i]).map((f) => `<button class="chip" data-action="ask-sugg" data-q="${esc(tx(f.q))}">${esc(tx(f.q))}</button>`).join('')}</div>` : '';
  return log.map((m) => `<div class="bubble bubble--${m.role === 'me' ? 'me' : 'bot'}">${esc(m.text)}</div>`).join('') + chips;
}
function viewAsk(p) {
  return `<section class="ask" id="ask" aria-label="${t('Conseiller virtuel', 'Virtual advisor')}">
    <div class="ask__head"><div class="row" style="gap:10px;flex-wrap:nowrap"><span class="avatar">${icon('leaf')}</span><div><b class="h4">${t('Conseiller virtuel', 'Virtual advisor')}</b><div class="tiny" id="ask-mode">${aiBadgeText()}</div></div></div><button class="iconbtn" data-action="ask-close" aria-label="${t('Fermer', 'Close')}">${icon('x')}</button></div>
    <div class="ask__log" id="ask-log" aria-live="polite">${bubblesHtml(p)}</div>
    <form class="ask__form" data-form="ask"><label class="sr-only" for="ask-input">${t('Votre question', 'Your question')}</label><input class="input" id="ask-input" placeholder="${t('Ex. : c’est sécuritaire pour mon chien ?', 'E.g. is it safe for my dog?')}" autocomplete="off"><button class="btn btn--green" type="submit" aria-label="${t('Envoyer', 'Send')}">${icon('send')}</button></form>
  </section>`;
}
function viewPortal(p, step) {
  const views = Object.assign({ 1: viewStep1, 2: viewStep2, 3: viewStep3, 4: viewStep4, 5: viewStep5, compte: viewAccount },
    isRenewal(p) ? { 1: viewRenewReview, 2: viewRenewProgram, 3: viewRenewChanges, 4: viewStep4 } : isTerm(p) ? { 1: viewTermAgreement, 2: viewTermReview, 3: viewTermBudget, 4: viewTermApproval } : {});
  return `<div class="portal ${isCorp(p) ? 'is-corp' : ''} is-${flowOf(p).key}" data-step="${step === 'compte' ? 0 : step}" data-view="${step === 'compte' ? 'compte' : 'step'}">
    ${viewHeader(p, step)}
    <main id="main">${views[step](p)}</main>
    ${viewFooter(p)}
    ${viewDemoDock(p, step)}
    ${S.ui.askOpen ? viewAsk(p) : `<button class="ask-fab" data-action="ask-open">${icon('leaf')}<span>${t('Une question ?', 'A question?')}</span></button>`}
  </div>`;
}
