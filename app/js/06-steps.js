/* ============ Step 1: assessment ============ */
function factsHtml() {
  return `<div class="facts">${FACTS.map((f) => `<div class="fact"><b>${esc(f.v)}</b><span>${esc(tx(f))}</span></div>`).join('')}</div>`;
}
function probIcon(k) {
  const g = {
    crottes: [[8, 15, 20], [12, 17, -10], [16, 14, 30], [11, 11, 0], [17, 18, -30], [7, 19, 10]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="2.2" ry="1.3" fill="#3E2E26" transform="rotate(${r} ${x} ${y})"/>`).join(''),
    grattements: '<path d="M6 18l5-10M10 19l5-10M14 20l5-10" stroke="#5E4E42" stroke-width="1.8" stroke-linecap="round"/>',
    rats: '<path d="M8 15c-3 0-4 2-5 4" stroke="#55443A" stroke-width="1.4" fill="none" stroke-linecap="round"/><ellipse cx="12" cy="14" rx="6" ry="3.6" fill="#55443A"/><ellipse cx="18" cy="12.6" rx="3.4" ry="2.6" fill="#55443A"/><circle cx="17.4" cy="10" r="1.6" fill="#7A675A"/><circle cx="19.6" cy="12" r=".6" fill="#F4EFE8"/>',
    ratons: '<path d="M7 9l-1.5-4 4 2.5M19 9l1.5-4-4 2.5" fill="#6F6155"/><circle cx="13" cy="13.5" r="6.8" fill="#8C7B6B"/><path d="M6.6 12.5c2-2 4.2-2 6.4-.6 2.2-1.4 4.4-1.4 6.4.6-1.5 2.6-4.3 2.7-6.4 1.3-2.1 1.4-4.9 1.3-6.4-1.3z" fill="#2A2420"/><circle cx="10.2" cy="12.6" r="1" fill="#F4EFE8"/><circle cx="15.8" cy="12.6" r="1" fill="#F4EFE8"/>',
    coquerelles: '<path d="M9 10l-3-2M9 16l-3 2M13 9.5V6M13 16.5V20M17 10l3-2M17 16l3 2M19 12l4-3M19 14l4 3" stroke="#5A3018" stroke-width="1" stroke-linecap="round"/><ellipse cx="13" cy="13" rx="6.4" ry="3.6" fill="#8A4B2A"/><ellipse cx="18" cy="13" rx="2" ry="2.3" fill="#5A3018"/>',
    fourmis_int: [6, 13, 20].map((x, i) => `<g transform="translate(${x} ${13 + (i % 2 ? -2 : 2)})"><circle cx="-2.4" r="1.4" fill="#2B1B10"/><circle r="1" fill="#2B1B10"/><circle cx="2" r="1.2" fill="#2B1B10"/></g>`).join(''),
    sciure: '<path d="M5 20q8-10 16 0z" fill="#E3CA94" stroke="#B9975A"/><g transform="translate(14 9) rotate(-30) scale(1.4)"><circle cx="-2.4" r="1.3" fill="#2B1B10"/><circle r=".9" fill="#2B1B10"/><circle cx="2" r="1.1" fill="#2B1B10"/></g>',
    piqures: [[7, 9], [10, 12], [13, 15], [16, 18], [19, 21], [15, 9]].map(([x, y]) => `<circle cx="${x}" cy="${y - 2}" r="1.6" fill="#B5473A"/>`).join(''),
    gardemanger: '<path d="M8 10l-4 3.4l4-1l4 1zM18 9l-4 3.4l4-1l4 1zM13 16l-4 3.4l4-1l4 1z" fill="#C7A35A" stroke="#8D7136" stroke-width=".7"/>',
    mouches: [[8, 10], [14, 8], [18, 13], [10, 16], [16, 19], [12, 12]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#4D5961"/><path d="M${x - 2} ${y - 1.6}l2 1.6l2-1.6" stroke="#9AA6AE" stroke-width=".7" fill="none"/>`).join(''),
    nid_guepes: '<path d="M13 4v3" stroke="#8D7A52" stroke-width="1.4"/><ellipse cx="13" cy="14" rx="6.5" ry="7.5" fill="#DCCCA4" stroke="#A8956A"/><path d="M7 11q6 2.4 12 0M6.6 15q6.4 2.4 12.8 0" stroke="#B9A57A" fill="none"/><ellipse cx="20.5" cy="8" rx="2.4" ry="1.4" fill="#E0A526"/>',
    odeur: '<g stroke="#7F8F5A" stroke-width="1.8" fill="none" stroke-linecap="round"><path d="M8 21c-3-4 3-6 0-10s3-6 0-8"/><path d="M13 21c-3-4 3-6 0-10s3-6 0-8"/><path d="M18 21c-3-4 3-6 0-10s3-6 0-8"/></g>',
  }[k] || '';
  return `<svg viewBox="0 0 26 26" aria-hidden="true"><rect width="26" height="26" rx="8" fill="#E7F3F8"/>${g}</svg>`;
}
const pressed = (cond) => `aria-pressed="${!!cond}"`;
function chipsHtml(key, items, multi, a) {
  return items.map((it) => {
    const v = it.key, on = multi ? (a[key] || []).includes(v) : String(a[key]) === String(v);
    return `<button type="button" class="chip" data-action="${multi ? 'q-toggle' : 'q-set'}" data-k="${key}" data-v="${esc(v)}" ${pressed(on)}>${it.icon ? icon(it.icon) : ''}${esc(tx(it))}</button>`;
  }).join('');
}
function qSecHead(p, s, n, intro) {
  const done = s.done(A(p));
  return `<header class="qsec__head"><span class="qsec__n">${done ? icon('check') : String(n).padStart(2, '0')}</span><div class="stack" style="gap:4px"><h3 class="h3">${esc(tx(s))}</h3><p class="small" style="margin:0">${esc(intro)}</p></div></header>`;
}
/* Rooms where the client sees signs (they light up on the plan) */
function zoneChoices(p) {
  if (isOrg(p)) return [{ key: 'cuisine', fr: 'Rez-de-chaussée, cuisine', en: 'Ground floor, kitchen' }, { key: 'chambres', fr: 'Étages', en: 'Upper floors' }, { key: 'sous-sol', fr: 'Sous-sol', en: 'Basement' }, { key: 'garage', fr: propTypeOf(p) === 'commerce' ? 'Quai ou entrepôt' : 'Garage', en: propTypeOf(p) === 'commerce' ? 'Dock or warehouse' : 'Garage' }, { key: 'grenier', fr: 'Toit', en: 'Roof' }, { key: 'exterieur', fr: 'Extérieur, conteneurs', en: 'Outside, dumpsters' }];
  return [{ key: 'cuisine', fr: 'Cuisine', en: 'Kitchen' }, { key: 'sous-sol', fr: 'Sous-sol', en: 'Basement' }, { key: 'chambres', fr: 'Chambres', en: 'Bedrooms' }, { key: 'grenier', fr: 'Entretoit', en: 'Attic' }, { key: 'garage', fr: 'Garage', en: 'Garage' }, { key: 'exterieur', fr: 'Extérieur', en: 'Outside' }];
}
function qColumnHtml(p) {
  const a = A(p), org = isOrg(p);
  const area = areaOf(p), max = org ? 150000 : 6000, min = org ? 2000 : 500;
  const presets = org ? [{ v: 5000, fr: 'Petit', en: 'Small' }, { v: 15000, fr: 'Moyen', en: 'Medium' }, { v: 40000, fr: 'Grand', en: 'Large' }, { v: 80000, fr: 'Très grand', en: 'Very large' }] : AREA_PRESETS;
  const pctA = Math.round(((clamp(area, min, max) - min) / (max - min)) * 100);
  const sec = (id) => QSECTIONS.find((s) => s.id === id);
  const isDone = (id) => sec(id).done(a);
  const groups = Object.keys(PROB_GROUPS).map((g) => `<p class="eyebrow prob__group">${esc(tx(PROB_GROUPS[g]))}</p>${PROBLEMS.filter((pr) => pr.group === g).map((pr) => `<button type="button" class="prob" data-action="toggle-prob" data-k="${pr.key}" ${pressed((a.problems || []).includes(pr.key))}>${probIcon(pr.key)}<span>${esc(tx(pr))}</span></button>`).join('')}`).join('');
  const photo = safeImg(a.photo);
  const ai = a.photoAi;
  return `<div class="stack" id="qcol" style="gap:20px">
    <article class="card qsec ${isDone('prop') ? 'is-done' : ''}" id="q-prop">
      ${qSecHead(p, sec('prop'), 1, org ? t('Vérifiez vos coordonnées et décrivez le bâtiment à protéger.', 'Check your details and describe the building to protect.') : t('Vérifiez vos coordonnées et dites-nous à quoi ressemble votre maison.', 'Check your details and tell us what your home looks like.'))}
      <div class="qlist">
        <div class="fields">
          <div class="field"><label class="field__label" for="q-name">${org ? t('Personne-ressource', 'Contact person') : t('Nom', 'Name')}</label><input class="input" id="q-name" data-q="name" value="${esc(a.name || '')}" autocomplete="name"></div>
          <div class="field"><label class="field__label" for="q-email">${t('Courriel', 'Email')}</label><input class="input" id="q-email" type="email" data-q="email" value="${esc(a.email || '')}" autocomplete="email"></div>
          <div class="field"><label class="field__label" for="q-phone">${t('Cellulaire', 'Mobile')} <span class="opt">${t('pour les avis de visite', 'for visit notices')}</span></label><input class="input" id="q-phone" type="tel" data-q="phone" value="${esc(a.phone || '')}" autocomplete="tel"></div>
          <div class="field"><label class="field__label" for="q-city">${t('Ville', 'City')}</label><input class="input" id="q-city" data-q="city" value="${esc(a.city || '')}"></div>
          <div class="field span2"><label class="field__label" for="q-address">${t('Adresse', 'Address')}</label><input class="input" id="q-address" data-q="address" value="${esc(a.address || '')}" autocomplete="street-address"></div>
        </div>
        <div class="field"><span class="field__label">${t('Type de propriété', 'Property type')}</span><div class="chips">${chipsHtml('type', PROP_TYPES, false, a)}</div></div>
        ${isCorp(p) ? sitesListHtml(p) : `<div class="field">
          <label class="field__label" for="q-area">${org ? t('Superficie du bâtiment', 'Building area') : t('Superficie habitable', 'Living area')} <span class="opt">${t('approximative', 'approximate')}</span></label>
          <div class="area-read"><b id="area-val">${esc(fmtArea(area))}</b><span class="small mono" id="area-m2">≈ ${fmtInt(area / 10.764)} m²</span></div>
          <input type="range" class="range" id="q-area" data-q="area" min="${min}" max="${max}" step="${org ? 500 : 50}" value="${clamp(area, min, max)}" style="--p:${pctA}%">
          <div class="presets">${presets.map((pr) => `<button type="button" class="preset" data-action="q-set" data-k="area" data-v="${pr.v}" ${pressed(Number(a.area) === pr.v)}><b>${esc(tx(pr))}</b><span>≈ ${esc(fmtArea(pr.v))}</span></button>`).join('')}</div>
          <p class="field__help">${t('Pas certain ? Choisissez une taille. Votre technicien la confirme pendant l’inspection.', 'Not sure? Pick a size. Your technician confirms it during the inspection.')}</p>
        </div>`}
      </div>
    </article>

    <article class="card qsec ${isDone('lawn') ? 'is-done' : ''}" id="q-lawn">
      ${qSecHead(p, sec('lawn'), 2, t('Cochez tout ce que vous voyez. Le plan de votre maison réagit à chaque réponse.', 'Tick everything you see. The plan of your home reacts to each answer.'))}
      <div class="qlist">
        <div class="field"><span class="field__label">${t('Où voyez-vous des signes ?', 'Where do you see signs?')}</span><div class="chips">${chipsHtml('zones', zoneChoices(p), true, a)}</div></div>
        <div class="field"><span class="field__label">${t('À quelle fréquence ?', 'How often?')}</span><div class="rating">${RATINGS.map((r) => `<button type="button" data-action="q-set" data-k="rating" data-v="${r.v}" ${pressed(Number(a.rating) === r.v)}><i style="background:#${lawnColor(30 + r.v * 11).slice(1)}"></i>${esc(tx(r))}</button>`).join('')}</div></div>
        <div class="field"><span class="field__label">${t('Ce que vous remarquez', 'What you notice')}</span><div class="probs">${groups}</div>
          <button type="button" class="chip" style="justify-self:start" data-action="no-prob" ${pressed(a.noProblem === true)}>${icon('check')}${t('Rien de visible : c’est de la prévention', 'Nothing visible: it’s prevention')}</button></div>
        <div class="field"><span class="field__label">${t('Une photo de l’insecte ou des traces', 'A photo of the insect or the signs')} <span class="opt">${t('facultatif', 'optional')}</span></span>
          <div class="photo" id="photo-box">
            <div class="photo__img">${photo ? `<img src="${photo}" alt="${t('Photo des signes', 'Photo of the signs')}">` : icon('camera')}</div>
            <div class="stack" style="gap:8px">
              <p class="small" style="margin:0">${photo ? t('Photo ajoutée. Votre conseiller la verra avant l’inspection.', 'Photo added. Your advisor will see it before the inspection.') : t('Un insecte, des crottes, un nid ? Une photo aide nos techniciens à identifier le nuisible avant l’inspection.', 'An insect, droppings, a nest? A photo helps our technicians identify the pest before the inspection.')}</p>
              <div class="row" style="gap:8px">
                <label class="btn btn--sm btn--ghost" for="q-photo">${icon('camera')}${photo ? t('Changer', 'Change') : t('Ajouter une photo', 'Add a photo')}</label>
                <input class="sr-only" id="q-photo" type="file" accept="image/*" data-change="photo">
                ${photo ? `<button type="button" class="btn btn--sm btn--ink" data-action="photo-ai" id="photo-ai-btn">${icon('sparkle')}${t('Identifier avec l’IA', 'Identify with AI')}</button>` : ''}
              </div>
            </div>
          </div>
          <div id="photo-ai-out">${ai ? `<div class="ai-note"><b>${t('Identification :', 'Identification:')}</b> ${esc(ai.summary)}</div>` : ''}</div>
        </div>
      </div>
    </article>

    <article class="card qsec ${isDone('life') ? 'is-done' : ''}" id="q-life">
      ${qSecHead(p, sec('life'), 3, t('Pour adapter les produits et les consignes de sécurité aux gens et aux animaux sur place.', 'To fit the products and safety instructions to the people and pets on site.'))}
      <div class="qlist">
        <div class="field"><span class="field__label">${org ? t('Des enfants fréquentent les lieux ?', 'Do children use the premises?') : t('Des enfants à la maison ?', 'Kids at home?')}</span><div class="chips">${chipsHtml('kids', [{ key: 'oui', fr: 'Oui', en: 'Yes' }, { key: 'non', fr: 'Non', en: 'No' }], false, a)}</div></div>
        <div class="field"><span class="field__label">${t('Des animaux ?', 'Any pets?')}</span><div class="chips">${chipsHtml('pets', [{ key: 'chien', fr: 'Chien', en: 'Dog' }, { key: 'chat', fr: 'Chat', en: 'Cat' }, { key: 'aucun', fr: 'Aucun', en: 'None' }], true, a)}</div></div>
        <div class="field"><span class="field__label">${t('Sous-sol', 'Basement')}</span><div class="chips">${chipsHtml('watering', [{ key: 'fini', fr: 'Fini et aménagé', en: 'Finished' }, { key: 'brut', fr: 'Non fini', en: 'Unfinished' }, { key: 'vide', fr: 'Vide sanitaire ou dalle', en: 'Crawl space or slab' }], false, a)}</div></div>
        <div class="field"><span class="field__label">${t('Déjà essayé', 'Already tried')} <span class="opt">${t('facultatif', 'optional')}</span></span><div class="chips">${chipsHtml('mowing', [{ key: 'moi', fr: org ? 'Entretien à l’interne' : 'Pièges ou produits du commerce', en: org ? 'In-house maintenance' : 'Store-bought traps or products' }, { key: 'service', fr: org ? 'Un autre fournisseur' : 'Un autre exterminateur', en: org ? 'Another provider' : 'Another exterminator' }], false, a)}</div></div>
      </div>
    </article>

    <article class="card qsec ${isDone('around') ? 'is-done' : ''}" id="q-around">
      ${qSecHead(p, sec('around'), 4, t('Branches, bois et fondation : c’est souvent par là que les nuisibles entrent.', 'Branches, wood and foundation: that’s often where pests get in.'))}
      <div class="qlist">
        <div class="field"><span class="field__label">${org ? t('Arbres ou haies contre le bâtiment', 'Trees or hedges against the building') : t('Arbres ou haies qui touchent la maison', 'Trees or hedges touching the house')}</span>
          <div class="row"><span class="stepper"><button type="button" class="iconbtn" data-action="trees" data-d="-1" aria-label="${t('Un de moins', 'One less')}">${icon('minus')}</button><b id="trees-val">${treesOf(p)}</b><button type="button" class="iconbtn" data-action="trees" data-d="1" aria-label="${t('Un de plus', 'One more')}">${icon('plus')}</button></span>
          <label class="check"><input type="checkbox" id="q-treesick" data-q="treeSick" ${a.treeSick ? 'checked' : ''}><span>${org ? t('Palettes, débris ou végétation contre le bâtiment', 'Pallets, debris or plants against the building') : t('Bois de chauffage, souches ou débris contre la maison', 'Firewood, stumps or debris against the house')}</span></label></div></div>
        <div class="field"><span class="field__label">${t('L’été, autour de la maison ?', 'In summer, around the house?')}</span><div class="chips">${chipsHtml('pests', PESTS.concat([{ key: 'none', fr: 'Aucun problème', en: 'No problem' }]), true, a)}</div>
          <p class="field__help">${t('Le bouclier extérieur protège la fondation au printemps, en été et à l’automne, dans le même dossier.', 'The exterior shield protects the foundation in spring, summer and fall, in the same file.')}</p></div>
      </div>
    </article>

    <article class="card qsec ${isDone('goals') ? 'is-done' : ''}" id="q-goals">
      ${qSecHead(p, sec('goals'), 5, t('Choisissez ce qui compte le plus pour vous.', 'Pick what matters most to you.'))}
      <div class="qlist"><div class="chips">${chipsHtml('goals', GOALS, true, a)}</div>
        <div class="field"><label class="field__label" for="q-notes">${t('Une note pour votre conseiller', 'A note for your advisor')} <span class="opt">${t('facultatif', 'optional')}</span></label><textarea class="textarea" id="q-notes" data-q="notes" rows="3" placeholder="${t('Où exactement, depuis quand, animal à la maison, heures d’accès…', 'Where exactly, since when, pets at home, access hours…')}">${esc(a.notes || '')}</textarea></div>
      </div>
    </article>
    ${qSubmitHtml(p)}
  </div>`;
}
function qSubmitHtml(p) {
  const q = qProgress(p), a = A(p);
  const missing = QSECTIONS.filter((s) => !s.done(a));
  if (a.submittedAt) {
    return `<div class="qsubmit" id="qsubmit"><div class="row" style="justify-content:space-between"><b class="h4">${icon('check')} ${t('Évaluation envoyée', 'Assessment sent')} ${fmtDateShort(a.submittedAt)}</b>${p.stage >= 2 ? `<a class="btn btn--green btn--sm" href="#${p.slug}-proposition">${t('Voir mon plan d’action', 'See my action plan')}${icon('arrowR')}</a>` : ''}</div><p class="small" style="margin:0">${t('Vous pouvez encore modifier vos réponses : votre plan se met à jour automatiquement.', 'You can still change your answers: your plan updates automatically.')}</p></div>`;
  }
  return `<div class="qsubmit" id="qsubmit">
    <b class="h3" style="color:inherit">${t('Prêt ? Votre plan d’action se calcule à l’envoi.', 'Ready? Your action plan is priced when you send.')}</b>
    <p class="small" style="margin:0">${missing.length ? t(`Il reste : ${listJoin(missing.map((s) => tx(s).toLowerCase()))}.`, `Still to do: ${listJoin(missing.map((s) => tx(s).toLowerCase()))}.`) : t('Tout est rempli. Votre conseiller reçoit votre évaluation en même temps que vous recevez votre plan.', 'Everything is filled in. Your advisor gets your assessment as you get your plan.')}</p>
    <button class="btn btn--green btn--block" data-action="submit-diag" ${missing.length ? 'disabled' : ''}>${icon('send')}${t('Envoyer mon évaluation', 'Send my assessment')} · ${q.pct} %</button>
  </div>`;
}
function findingsHtml(p) {
  const probs = A(p).problems || [];
  if (!probs.length) return `<li class="findings__empty">${A(p).noProblem ? t('Rien de visible : on mise sur la prévention et le colmatage des accès.', 'Nothing visible: we focus on prevention and sealing the entry points.') : t('Cochez ce que vous voyez : le plan de votre maison se met à jour.', 'Tick what you see: the plan of your home updates.')}</li>`;
  return probs.map((k) => {
    const pr = PROB[k]; if (!pr) return '';
    const add = pr.addon ? ADD[pr.addon] : null;
    return `<li><span class="dot" style="color:${pr.color}"></span><span>${esc(tx(pr))}</span>${add ? `<span class="tag ${pr.sev >= 2 ? 'tag--warn' : ''}">${esc(tx(add.name))}</span>` : `<span class="tag tag--ok">${t('Inclus', 'Included')}</span>`}</li>`;
  }).join('');
}
function scoreHtml(p) {
  const v = healthNow(p);
  return `<span class="score__val num">${v}<small>/ 100</small></span><div class="stack" style="gap:8px;flex:1;min-width:0"><b class="h4">${t('Indice de protection', 'Protection index')} · ${esc(healthLabel(v))}</b><div class="gauge__track"><i style="width:${v}%;background:${healthColor(v)}"></i></div></div>`;
}
function planCardHtml(p) {
  return `<div class="card plancard" id="plancard">
    <div class="plancard__head"><div class="stack" style="gap:4px"><p class="eyebrow">${isOrg(p) ? t('Votre bâtiment, en coupe', 'Your building, in cutaway') : t('Votre maison, en coupe', 'Your home, in cutaway')}</p><b class="h4">${esc(p.client.address || A(p).address || '')}</b></div><span class="tag tag--info">${icon('sparkle')}${t('En direct', 'Live')}</span></div>
    <div class="plan-wrap" id="plan-live">${planSvg(p)}</div>
    <div class="score" id="score">${scoreHtml(p)}</div>
    <div class="stack" style="gap:10px"><p class="eyebrow">${t('Ce qu’on remarque', 'What we notice')}</p><ul class="findings" id="findings">${findingsHtml(p)}</ul></div>
  </div>`;
}
function viewStep1(p) {
  return `${viewHero(p, 1)}
  <section class="section" style="padding-top:clamp(40px,5vw,64px)"><div class="wrap">${factsHtml()}</div></section>
  <section class="section" id="diagnostic-form"><div class="wrap split">
    ${qColumnHtml(p)}
    <aside class="sticky">${planCardHtml(p)}</aside>
  </div></section>`;
}

/* ============ Step 2: action plan ============ */
function baseCardHtml(p) {
  return `<article class="basecard">
    <div class="basecard__top"><div class="stack" style="gap:8px"><span class="row" style="gap:8px">${seal()}<span class="tag tag--ok">${t('Inclus', 'Included')}</span></span><h3 class="h3">${esc(tx(BASE.name))}</h3><p class="small" style="margin:0">${isCorp(p) ? t(`${sitesOf(p).length} sites · ${fmtArea(areaOf(p))} au total`, `${sitesOf(p).length} sites · ${fmtArea(areaOf(p))} in total`) : isOrg(p) ? t(`Pour un bâtiment d’environ ${fmtArea(areaOf(p))}`, `For a building of about ${fmtArea(areaOf(p))}`) : t(`Pour une maison d’environ ${fmtArea(areaOf(p))}`, `For a home of about ${fmtArea(areaOf(p))}`)}</p></div>
    <div class="basecard__price"><b>${fmtMoney(basePrice(p), 0)}</b><span class="small">${t('pour l’année', 'for the year')}</span></div></div>
    <ul class="incl">${BASE.includes.map((x) => `<li>${icon('check')}<span>${esc(tx(x))}</span></li>`).join('')}</ul>
  </article>`;
}
function addonCardHtml(p, a, rec) {
  const on = isSelected(p, a.key);
  return `<article class="addon ${on ? 'is-on' : ''}" data-addon="${a.key}">
    <div class="addon__main"><div class="addon__title"><b class="h4">${esc(tx(a.name))}</b>${rec && rec.priority === 'high' ? `<span class="tag tag--alert">${t('Prioritaire', 'Priority')}</span>` : ''}${rec && !rec.preselect ? `<span class="tag tag--info">${t('Suggestion', 'Suggestion')}</span>` : ''}${a.division === 'vext' ? `<span class="tag tag--vext">${t('3 saisons', '3 seasons')}</span>` : ''}${a.price.perUnit ? `<span class="tag">${t(`${stationsOf(p)} stations`, `${stationsOf(p)} stations`)}</span>` : ''}</div>
      <p class="small" style="margin:0">${esc(tx(a.desc))}</p>
      ${rec ? `<p class="addon__why">${icon('sparkle')}<span>${esc(tx(rec.reason))}</span></p>` : ''}</div>
    <div class="addon__side"><span class="addon__price">${fmtMoney(addonAmount(p, a), 0)}</span><button class="switch" role="switch" aria-checked="${on}" data-action="toggle-addon" data-k="${a.key}" aria-label="${esc(tx(a.name))}"></button></div>
  </article>`;
}
function receiptHtml(p) {
  if (isCorp(p)) return receiptCorpHtml(p);
  const q = quote(p), accepted = !!p.proposal.acceptedAt;
  const lines = q.lines.map((l) => `<div class="receipt__row"><span>${esc(l.label)}</span><span>${fmtMoney(l.amount)}</span></div>`).join('');
  return `<div class="receipt" id="receipt">
    <div class="row" style="justify-content:space-between"><p class="eyebrow">${t(`Votre plan ${SEASON}`, `Your ${SEASON} plan`)}</p>${accepted ? `<span class="tag tag--ok">${icon('check')}${t('Accepté', 'Accepted')}</span>` : `<span class="tiny">v${esc(p.proposal.version)}</span>`}</div>
    <div class="receipt__month"><div><b>${fmtMoney(q.monthly)}</b> <span>${t('/ mois + tx', '/ month + tax')}</span></div><span>${t('sur 12 mois', 'over 12 months')}</span></div>
    <div class="receipt__rows">
      ${lines}
      ${q.discount ? `<div class="receipt__row is-promo"><span>${t(`Rabais de ${q.discPct} %`, `${q.discPct}% discount`)}</span><span>− ${fmtMoney(q.discount)}</span></div>` : ''}
      <div class="receipt__row is-sub"><span>${t(`Plan ${SEASON}`, `${SEASON} plan`)}</span><span>${fmtMoney(q.season - q.discount)}</span></div>
      ${q.promo ? `<div class="receipt__row is-promo"><span>${t('Intervention initiale, cet automne (offre en cours)', 'First treatment this fall (current offer)')}</span><span>${fmtMoney(q.promo)}</span></div>` : ''}
      <div class="receipt__row"><span>${t('TPS', 'GST')}</span><span>${fmtMoney(q.tps)}</span></div>
      <div class="receipt__row"><span>${t('TVQ', 'QST')}</span><span>${fmtMoney(q.tvq)}</span></div>
      <div class="receipt__row is-total"><span>${t('Total, taxes incluses', 'Total, tax included')}</span><span>${fmtMoney(q.total)}</span></div>
    </div>
    <label class="check" style="color:#2A302B"><input type="checkbox" id="promo-box" data-change="promo" ${q.promo ? 'checked' : ''} ${accepted ? 'disabled' : ''}><span>${t('Commencer dès cet automne : intervention initiale à 49,99 $', 'Start this fall: first treatment at $49.99')}</span></label>
    ${accepted ? `<a class="btn btn--green btn--block" href="#${p.slug}-visite">${t('Voir mon inspection', 'See my inspection')}${icon('arrowR')}</a>` : `<button class="btn btn--green btn--block" data-action="accept-proposal">${t('J’accepte, je réserve mon inspection', 'I accept, book my inspection')}${icon('arrowR')}</button>`}
    <button class="btn btn--ghost btn--block btn--sm" data-action="ask-open">${icon('chat')}${t('Une question avant de décider ?', 'A question before deciding?')}</button>
    <p class="tiny" style="margin:0">${t('Grille de prix de démonstration : chaque bureau règle ses prix dans la console. Aucune information de paiement n’est demandée ici.', 'Demo price grid: each office sets its prices in the console. No payment details are asked here.')}</p>
  </div>`;
}
/* The calendar runs from November 2026 (right after the inspection) to October 2027 */
const tlPct = (m) => clamp((((m >= 11 ? m - 11 : m + 1)) / 12) * 100, 0, 100);
function timelineHtml(p, withNow) {
  const months = S.lang === 'en' ? ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'] : ['Nov', 'Déc', 'Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct'];
  const rows = seasonRows(p);
  return `<div class="tl__grid">
    <div></div><div class="tl__months">${months.map((m, i) => `<span${i === 2 ? ' class="is-year"' : ''}>${m}${i === 0 ? ' <i>2026</i>' : i === 2 ? ' <i>2027</i>' : ''}</span>`).join('')}</div>
    <div class="tl__label"><b>${t('Visites', 'Visits')}</b></div><div class="tl__passes">${PASSAGES.map((x) => `<span class="tl__pass" style="left:${tlPct(x.a)}%;width:${tlPct(x.b) - tlPct(x.a)}%" title="${esc(tx(x))}">${x.n}</span>`).join('')}</div>
    ${rows.map((r) => `<div class="tl__label">${r.kind === 'vext' ? `<span class="tag tag--vext">${t('Bouclier', 'Shield')}</span>` : ''}<span>${esc(r.label)}</span></div><div class="tl__track">${r.marks.map((m) => `<i class="tl__mark is-${r.kind}" style="left:${tlPct(m.a)}%;width:${Math.max(2, tlPct(m.b) - tlPct(m.a))}%"></i>`).join('')}</div>`).join('')}
  </div>
  <div class="tl__key"><span><i style="background:var(--green)"></i>${t('Inclus au programme', 'Included in the program')}</span><span><i style="border:2px dashed var(--green-deep)"></i>${t('Au besoin, inclus', 'As needed, included')}</span><span><i style="background:var(--soil)"></i>${t('Traitement ciblé', 'Targeted treatment')}</span><span><i style="background:var(--vext)"></i>${t('Bouclier extérieur', 'Exterior shield')}</span>${withNow ? '' : ''}</div>`;
}
function gaugeHtml(p) {
  const now = healthNow(p), after = healthAfter(p);
  return `<div class="gauge" id="gauge">
    <div class="gauge__row"><span>${t('Aujourd’hui', 'Today')}</span><div class="gauge__track"><i style="width:${now}%;background:${healthColor(now)}"></i></div><b>${now}</b></div>
    <div class="gauge__row"><span>${t('Dans un an', 'In a year')}</span><div class="gauge__track"><i style="width:${after}%;background:${healthColor(after)}"></i></div><b>${after}</b></div>
  </div>`;
}
function baHtml(p) {
  const mode = S.ui.baMode || 'now';
  return `<div class="stack" style="gap:12px"><div class="seg" role="group" aria-label="${t('Vue', 'View')}" style="justify-self:start"><button type="button" data-action="ba-mode" data-v="now" ${pressed(mode === 'now')}>${t('Aujourd’hui', 'Today')}</button><button type="button" data-action="ba-mode" data-v="after" ${pressed(mode === 'after')}>${t(`Automne ${SEASON}`, `Fall ${SEASON}`)}</button></div><div class="plan-wrap" id="ba-plan">${planSvg(p, { mode })}</div></div>
    <div class="stack" style="gap:22px">
      <div class="section-head" style="margin:0"><p class="eyebrow">${t('Avant, après', 'Before, after')}</p><h2 class="h2">${isOrg(p) ? t('Le même bâtiment, <em>protégé</em>.', 'The same building, <em>protected</em>.') : t('La même maison, <em>protégée</em>.', 'The same home, <em>protected</em>.')}</h2><p class="body">${t('Projection indicative à partir de votre évaluation et des traitements choisis : les nuisibles partis, les points d’entrée colmatés, le périmètre sous surveillance. Retirez un traitement prioritaire : l’écart se voit tout de suite.', 'An indicative projection based on your assessment and the treatments you chose: pests gone, entry points sealed, the perimeter under watch. Remove a priority treatment and the gap shows right away.')}</p></div>
      ${gaugeHtml(p)}
      <p class="tiny" style="margin:0">${t('Indice de protection de 0 à 100, à titre illustratif.', 'Protection index from 0 to 100, for illustration.')}</p>
    </div>`;
}
function viewStep2(p) {
  const recs = recommendations(p);
  const recKeys = recs.map((r) => r.key);
  const others = ADDONS.filter((a) => !recKeys.includes(a.key));
  const faqKeys = [4, 3, 9, 10];
  return `${viewHero(p, 2)}
  <section class="section" id="programme"><div class="wrap">
    <div class="section-head"><p class="eyebrow">${t(`Plan d’action v${p.proposal.version} · ${householdOf(p)}`, `Action plan v${p.proposal.version} · ${householdOf(p)}`)}</p><h2 class="h2">${isOrg(p) ? t('Un plan bâti pour <em>votre</em> bâtiment.', 'A plan built for <em>your</em> building.') : t('Un plan bâti pour <em>votre</em> maison.', 'A plan built for <em>your</em> home.')}</h2><p class="lede">${t('Le programme de base vous protège toute l’année. Les traitements ciblés répondent à ce que vous avez noté. Activez ou retirez-en un : le prix se recalcule.', 'The base program protects you all year. The targeted treatments answer what you noted. Turn one on or off and the price recalculates.')}</p></div>
    <div class="split">
      <div class="prog" id="prog">
        ${baseCardHtml(p)}
        ${isCorp(p) ? sitesBreakdownHtml(p) : ''}
        ${recs.length ? `<p class="eyebrow" style="margin-top:10px">${isOrg(p) ? t('Recommandé pour votre bâtiment', 'Recommended for your building') : t('Recommandé pour votre maison', 'Recommended for your home')}</p><div class="addons">${recs.map((r) => addonCardHtml(p, ADD[r.key], r)).join('')}</div>` : ''}
        <p class="eyebrow" style="margin-top:10px">${t('Aussi offert', 'Also available')}</p><div class="addons">${others.map((a) => addonCardHtml(p, a, null)).join('')}</div>
      </div>
      <aside class="sticky" id="receipt-wrap">${receiptHtml(p)}</aside>
    </div>
  </div></section>
  <section class="section" id="saison-tl"><div class="wrap">
    <div class="section-head"><p class="eyebrow">${t('Calendrier, de novembre à octobre', 'Calendar, November to October')}</p><h2 class="h2">${t('On agit maintenant, <em>on prévient ensuite</em>.', 'We act now, <em>then we prevent</em>.')}</h2><p class="lede">${t('Les traitements ciblés commencent dans les 48 heures qui suivent la signature. Les visites de prévention sont regroupées par secteur : un texto la veille, un rapport avec photos après chaque visite.', 'Targeted treatments start within 48 hours of signing. Prevention visits are grouped by area: a text the day before, a photo report after every visit.')}</p></div>
    <div class="card card--flat tl" id="timeline">${timelineHtml(p)}</div>
  </div></section>
  <section class="section" id="avant-apres"><div class="wrap ba">${baHtml(p)}</div></section>
  <section class="section" id="questions"><div class="wrap split">
    <div class="section-head" style="margin:0"><p class="eyebrow">${t('Questions fréquentes', 'Common questions')}</p><h2 class="h2">${t('Avant de <em>dire oui</em>.', 'Before you <em>say yes</em>.')}</h2><button class="btn btn--ghost" style="justify-self:start" data-action="ask-open">${icon('leaf')}${t('Poser une autre question', 'Ask another question')}</button></div>
    <div class="faq">${faqKeys.map((i) => `<details><summary>${esc(tx(FAQ[i].q))}${icon('plus')}</summary><p>${esc(tx(FAQ[i].a))}</p></details>`).join('')}</div>
  </div></section>`;
}

/* ============ Step 3: inspection ============ */
function bookingState(p) {
  if (!S.ui.booking || S.ui.booking.slug !== p.slug) {
    const v = p.visit || {};
    const first = (() => { const d = addDays(new Date(), 1); for (let i = 0; i < 60 && !windowsFor(isoDay(d)).some((x) => !x.off); i++) d.setDate(d.getDate() + 1); return d; })();
    S.ui.booking = { slug: p.slug, month: new Date(first.getFullYear(), first.getMonth(), 1), mode: v.mode || 'terrain', day: null, window: null, time: null, presence: v.presence || 'oui', access: v.access || '', petsNote: v.petsNote || ((A(p).pets || []).includes('chien') ? t('Chien à la maison', 'Dog at home') : (A(p).pets || []).includes('chat') ? t('Chat à la maison', 'Cat at home') : ''), notes: v.notes || '' };
  }
  return S.ui.booking;
}
function calendarHtml(b) {
  const m = b.month, y = m.getFullYear(), mo = m.getMonth();
  const lead = (new Date(y, mo, 1).getDay() + 6) % 7, days = new Date(y, mo + 1, 0).getDate();
  const todayIso = isoDay(new Date());
  const dows = S.lang === 'en' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
  let cells = dows.map((d) => `<span class="cal__dow">${d}</span>`).join('');
  for (let i = 0; i < lead; i++) cells += '<span></span>';
  for (let d = 1; d <= days; d++) {
    const iso = isoDay(new Date(y, mo, d));
    const av = (b.mode === 'video' ? videoFor(iso) : windowsFor(iso)).some((s) => !s.off);
    cells += av ? `<button type="button" class="cal__day is-avail ${iso === todayIso ? 'is-today' : ''}" data-action="pick-day" data-day="${iso}" ${pressed(b.day === iso)} aria-label="${esc(fmtDateLong(iso))}">${d}</button>` : `<span class="cal__day ${iso === todayIso ? 'is-today' : ''}" aria-hidden="true">${d}</span>`;
  }
  const now = new Date();
  const canPrev = y > now.getFullYear() || mo > now.getMonth();
  return `<div class="cal"><div class="cal__head"><b>${m.toLocaleDateString(loc(), { month: 'long', year: 'numeric' })}</b><div class="row" style="gap:6px"><button type="button" class="iconbtn" data-action="cal-move" data-dir="-1" aria-label="${t('Mois précédent', 'Previous month')}" ${canPrev ? '' : 'disabled'}>${icon('chevL')}</button><button type="button" class="iconbtn" data-action="cal-move" data-dir="1" aria-label="${t('Mois suivant', 'Next month')}">${icon('chevR')}</button></div></div><div class="cal__grid">${cells}</div></div>`;
}
function bookerHtml(p) {
  const b = bookingState(p), rep = p.rep || repFor(p.branch);
  const slots = b.day ? (b.mode === 'video' ? videoFor(b.day) : windowsFor(b.day)) : [];
  const ready = b.day && (b.mode === 'video' ? b.time : b.window);
  const slotHtml = b.mode === 'video'
    ? `<div class="windows">${slots.map((s) => { const [h, mi] = s.t.split(':').map(Number); return `<button type="button" class="window" data-action="pick-time" data-v="${s.t}" ${pressed(b.time === s.t)} ${s.off ? 'disabled' : ''}><b>${fmtHour(h, mi)}</b><span>15 min</span></button>`; }).join('')}</div>`
    : `<div class="windows">${slots.map((w) => `<button type="button" class="window" data-action="pick-window" data-v="${w.k}" ${pressed(b.window === w.k)} ${w.off ? 'disabled' : ''}><b>${esc(tx(w))}</b><span>${fmtHour(w.from)} – ${fmtHour(w.to)}</span></button>`).join('')}</div>`;
  return `<div class="booker" id="booker">
    <div class="card stack" style="gap:20px">
      <div class="seg" role="group" aria-label="${t('Type de rencontre', 'Meeting type')}"><button type="button" data-action="visit-mode" data-v="terrain" ${pressed(b.mode === 'terrain')}>${t('Inspection sur place', 'On-site inspection')}</button><button type="button" data-action="visit-mode" data-v="video" ${pressed(b.mode === 'video')}>${t('Appel vidéo, 15 min', 'Video call, 15 min')}</button></div>
      ${calendarHtml(b)}
      <div class="stack" style="gap:10px"><div class="row" style="justify-content:space-between"><b class="h4">${b.day ? esc(cap1(fmtDateLong(b.day))) : t('Choisissez une journée', 'Pick a day')}</b><span class="tiny">${t('Heure de l’Est', 'Eastern Time')}</span></div>
        ${b.day ? slotHtml : `<p class="small" style="margin:0">${t('Les journées marquées d’un point ont des disponibilités dans votre secteur. Une urgence ? La ligne 24/7 répond tout de suite.', 'Days with a dot have openings in your area. An emergency? The 24/7 line answers right away.')}</p>`}
        ${b.mode === 'terrain' ? `<p class="tiny" style="margin:0">${t('On vous écrit 30 minutes avant d’arriver. Nos techniciens sont certifiés, discrets et clairement identifiés.', 'We text you 30 minutes before arriving. Our technicians are certified, discreet and clearly identified.')}</p>` : ''}
      </div>
    </div>
    <div class="stack" style="gap:20px">
      <div class="card repcard"><span class="avatar avatar--lg">${esc(initials(rep.name))}</span><div class="stack" style="gap:2px"><b class="h4">${esc(rep.name)}</b><span class="small">${esc(repTitle(rep))} · MBM ${esc(branchName(p.branch))}</span>${rep.years ? `<span class="tiny">${t(`${rep.years} ans d’expérience`, `${rep.years} years of experience`)}</span>` : ''}</div></div>
      <div class="card stack" style="gap:16px">
        ${b.mode === 'terrain' ? `<div class="field"><span class="field__label">${t('Devez-vous être là ?', 'Do you need to be there?')}</span><div class="seg" role="group"><button type="button" data-action="visit-presence" data-v="oui" ${pressed(b.presence === 'oui')}>${t('Oui, je vous ouvre', 'Yes, I’ll let you in')}</button><button type="button" data-action="visit-presence" data-v="non" ${pressed(b.presence === 'non')}>${t('Non, l’extérieur seulement', 'No, outside only')}</button></div></div>
        <div class="field"><label class="field__label" for="v-access">${isOrg(p) ? t('Accès au bâtiment', 'Access to the building') : t('Accès à la maison', 'Access to the house')}</label><input class="input" id="v-access" data-visit="access" value="${esc(b.access)}" placeholder="${t('Porte de côté, garage, code…', 'Side door, garage, code…')}"></div>
        <div class="field"><label class="field__label" for="v-pets">${t('Animaux sur place', 'Pets on site')}</label><input class="input" id="v-pets" data-visit="petsNote" value="${esc(b.petsNote)}" placeholder="${t('Ex. : chat à l’étage', 'E.g. cat upstairs')}"></div>` : ''}
        <div class="field"><label class="field__label" for="v-notes">${t('Quelque chose à préparer ?', 'Anything to prepare?')}</label><textarea class="textarea" id="v-notes" data-visit="notes" rows="2" placeholder="${t('Questions, endroits à regarder en priorité…', 'Questions, places to check first…')}">${esc(b.notes)}</textarea></div>
        <button class="btn btn--green btn--block" data-action="book-visit" ${ready ? '' : 'disabled'}>${ready ? `${icon('calendar')}${t('Réserver', 'Book')} ${esc(fmtDate(b.day, { weekday: 'short', day: 'numeric', month: 'short' }))}${b.mode === 'video' ? `, ${fmtHour(...b.time.split(':').map(Number))}` : `, ${esc(tx(WINDOWS.find((w) => w.k === b.window)).toLowerCase())}`}` : t('Choisissez une journée et une plage', 'Choose a day and a time slot')}</button>
      </div>
      <div class="card stack" style="gap:12px"><p class="eyebrow">${t('Pendant l’inspection', 'During the inspection')}</p><ol class="todo"><li>${t('Inspection de l’intérieur et de l’extérieur, du sous-sol à l’entretoit', 'Inside and outside inspection, from the basement to the attic')}</li><li>${t('Identification du nuisible et de la cause de sa présence', 'Identify the pest and why it’s there')}</li><li>${t('Repérage des points d’entrée, photos à l’appui', 'Locate the entry points, with photos')}</li><li>${t('Ajustement de votre plan, en direct', 'Fine-tune your plan, on the spot')}</li></ol></div>
    </div>
  </div>`;
}
function visitConfirmHtml(p) {
  const v = p.visit, rep = p.rep || repFor(p.branch), s = visitStart(v), past = visitEnd(v) < new Date();
  return `<div class="booker" id="booker">
    <div class="card confirm">
      <div class="row" style="justify-content:space-between"><span class="stamp">${icon('check')}${past ? t('Inspection faite', 'Inspection done') : t('Réservée', 'Booked')}</span><span class="tiny">${t('Réservée le', 'Booked')} ${fmtDateShort(v.bookedAt)}</span></div>
      <div class="confirm__date"><div class="hc__cal"><span>${s.toLocaleDateString(loc(), { month: 'short' }).replace('.', '').toUpperCase()}</span><b>${s.getDate()}</b></div><div class="stack" style="gap:2px"><b class="h3">${esc(cap1(visitWhen(v)))}</b><span class="small">${v.mode === 'video' ? t('Appel vidéo de 15 minutes. Le lien arrive par courriel.', '15-minute video call. The link arrives by email.') : `${esc(p.client.address)}, ${esc(p.client.city)}`}</span></div></div>
      <dl class="kv"><dt>${t('Avec', 'With')}</dt><dd>${esc(rep.name)}, ${esc(repTitle(rep).toLowerCase())}</dd>${v.mode === 'terrain' ? `<dt>${t('Présence', 'Presence')}</dt><dd>${v.presence === 'non' ? t('Extérieur seulement, compte rendu par courriel', 'Outside only, summary by email') : t('Vous serez sur place', 'You will be home')}</dd>${v.access ? `<dt>${t('Accès', 'Access')}</dt><dd>${esc(v.access)}</dd>` : ''}${v.petsNote ? `<dt>${t('Animaux', 'Pets')}</dt><dd>${esc(v.petsNote)}</dd>` : ''}` : ''}${v.notes ? `<dt>${t('Notes', 'Notes')}</dt><dd>${esc(v.notes)}</dd>` : ''}</dl>
      <div class="row">${!past ? `<button class="btn btn--ink btn--sm" data-action="ics">${icon('calendar')}${t('Ajouter à mon calendrier', 'Add to my calendar')}</button><button class="btn btn--ghost btn--sm" data-action="rebook">${t('Changer la date', 'Change the date')}</button>` : ''}</div>
    </div>
    <div class="stack" style="gap:20px">
      <div class="card stack" style="gap:12px"><p class="eyebrow">${t('Et ensuite', 'What comes next')}</p><ol class="todo"><li>${t(`${firstName(rep.name)} confirme le nuisible, la cause et les points d’entrée sur place.`, `${firstName(rep.name)} confirms the pest, the cause and the entry points on site.`)}</li><li>${t('Votre entente, ajustée s’il le faut, apparaît ici dans les heures qui suivent.', 'Your agreement, adjusted if needed, shows up here within hours.')}</li><li>${t('Vous la signez en ligne. Les traitements ciblés commencent dans les 48 heures.', 'You sign it online. Targeted treatments start within 48 hours.')}</li></ol></div>
      <div class="card stack" style="gap:10px"><p class="eyebrow">${t('Ce que vous avez noté', 'What you noted')}</p><ul class="findings">${findingsHtml(p)}</ul></div>
    </div>
  </div>`;
}
function viewStep3(p) {
  return `${viewHero(p, 3)}<section class="section" id="booker-sec"><div class="wrap">${p.visit && !S.ui.rebook ? visitConfirmHtml(p) : bookerHtml(p)}</div></section>`;
}

/* ============ Step 4: agreement ============ */
function sigBlock(p, side) {
  if (side === 'client') {
    const s = p.signature;
    const mark = s ? (s.mode === 'draw' && safeImg(s.image) ? `<img src="${safeImg(s.image)}" alt="${t('Signature de', 'Signature of')} ${esc(s.name)}">` : `<span class="typed">${esc(s.text || s.name)}</span>`) : `<span class="pending">${t('En attente de signature', 'Awaiting signature')}</span>`;
    return `<div class="sig"><span class="tiny" style="color:#5A625C">${t('Pour le client', 'For the client')}</span><div class="sig__box">${mark}</div><span class="sig__who">${esc(s ? s.name : p.client.name)}</span><span class="sig__meta">${s ? `${t('Signée électroniquement le', 'Signed electronically on')} ${esc(fmtDateTime(s.signedAt))}<br>${t('Empreinte', 'Fingerprint')} ${esc(s.hash || '')}` : esc(isOrg(p) ? p.client.name : `${p.client.address}, ${p.client.city}`)}</span></div>`;
  }
  const c = p.countersigned, rep = p.rep || repFor(p.branch);
  return `<div class="sig"><span class="tiny" style="color:#5A625C">${t('Pour MBM Gestion parasitaire', 'For MBM Gestion parasitaire')}</span><div class="sig__box">${c ? `<span class="typed">${esc(c.name)}</span>` : `<span class="pending">${t('Contresignée après la signature du client', 'Countersigned after the client signs')}</span>`}</div><span class="sig__who">${esc(rep.name)}</span><span class="sig__meta">${c ? `${t('Contresignée le', 'Countersigned on')} ${esc(fmtDateTime(c.signedAt))}` : esc(repTitle(rep))}</span></div>`;
}
function signboxHtml(p) {
  const q = quote(p);
  const terms = [[t(`Plan ${SEASON}`, `${SEASON} plan`), `${fmtMoney(q.season - q.discount)} ${t('+ tx', '+ tax')}`], isCorp(p) ? [t('Facturation', 'Billing'), t(`Mensuelle, net ${(p.billing && p.billing.terms) || 30} j`, `Monthly, net ${(p.billing && p.billing.terms) || 30} d`)] : [t('Par mois', 'Per month'), `${fmtMoney(q.monthly)} ${t('+ tx', '+ tax')}`], [t('Total, taxes incluses', 'Total, tax included'), fmtMoney(q.total)], isRenewal(p) || isTerm(p) ? [t('Première visite', 'First visit'), fmtDate(FIRST_PASSAGE, { day: 'numeric', month: 'long' })] : [t('Première intervention', 'First treatment'), t('Dans les 48 h', 'Within 48 h')]];
  const termsHtml = `<dl class="kv" style="grid-template-columns:minmax(0,1fr) auto">${terms.map(([k, v]) => `<dt>${esc(k)}</dt><dd class="num" style="text-align:right;font-weight:650">${esc(v)}</dd>`).join('')}</dl>`;
  if (p.signature) {
    const s = p.signature;
    return `<aside class="card signbox sticky" id="signbox"><span class="stamp" style="justify-self:start">${icon('check')}${t('Signée', 'Signed')}</span><div><b class="h4">${t('Signée par', 'Signed by')} ${esc(s.name)}</b><p class="small" style="margin:6px 0 0">${esc(fmtDateTime(s.signedAt))}. ${p.countersigned ? `${t('Contresignée par', 'Countersigned by')} ${esc(p.countersigned.name)}.` : t('Contresignature en cours…', 'Countersignature in progress…')}</p></div>${termsHtml}
      ${window.jspdf ? `<button class="btn btn--ink btn--block" data-action="pdf">${icon('download')}${t('Télécharger le PDF signé', 'Download the signed PDF')}</button>` : ''}
      <a class="btn btn--green btn--block" href="#${p.slug}-saison">${t('Aller à ma protection', 'Go to my protection')}${icon('arrowR')}</a></aside>`;
  }
  const mode = S.ui.signMode || 'draw';
  const nm = S.ui.sigName != null ? S.ui.sigName : (isOrg(p) ? `${p.client.first} ${p.client.last}` : p.client.name);
  const ren = isRenewal(p);
  return `<aside class="card signbox sticky" id="signbox"><div><b class="h4">${ren ? t('Signer le renouvellement', 'Sign the renewal') : t('Signer l’entente', 'Sign the agreement')}</b><p class="small" style="margin:6px 0 0">${ren ? t(`Votre signature renouvelle le programme pour l’année ${SEASON}, au prix fidélité.`, `Your signature renews the program for ${SEASON}, at the loyalty price.`) : t('Votre signature s’applique à l’entente complète.', 'Your signature applies to the full agreement.')}</p></div>${termsHtml}
    <div class="field"><label class="field__label" for="sig-name">${t('Nom complet', 'Full name')}</label><input class="input" id="sig-name" value="${esc(nm)}" autocomplete="name"></div>
    <div class="seg" role="group" aria-label="${t('Méthode de signature', 'Signature method')}"><button type="button" data-action="sign-mode" data-v="draw" ${pressed(mode === 'draw')}>${t('Dessiner', 'Draw')}</button><button type="button" data-action="sign-mode" data-v="type" ${pressed(mode === 'type')}>${t('Taper', 'Type')}</button></div>
    <div class="pad" id="sig-pad">${mode === 'draw' ? `<canvas id="sig-canvas" aria-label="${t('Zone de signature : signez avec la souris ou le doigt', 'Signature pad: sign with your mouse or finger')}"></canvas><span class="pad__hint">${t('Signez ici', 'Sign here')}</span>` : `<span class="pad__typed" id="sig-typed">${esc(nm)}</span>`}</div>
    ${mode === 'draw' ? `<button class="link small" style="justify-self:start" data-action="sig-clear">${t('Effacer', 'Clear')}</button>` : ''}
    <label class="check"><input type="checkbox" id="sig-agree"><span>${t('J’ai lu l’entente et je suis autorisé à la signer.', 'I have read the agreement and I am authorized to sign it.')}</span></label>
    <p class="hanger__err" id="sig-err" role="alert"></p>
    <button class="btn btn--green btn--block" data-action="sign">${icon('pen')}${ren ? t('Signer le renouvellement', 'Sign the renewal') : t('Signer l’entente', 'Sign the agreement')}</button>
    <p class="tiny" style="margin:0">${t('On enregistre l’heure de signature et une empreinte du document.', 'We record the time of signature and a fingerprint of the document.')}</p></aside>`;
}
function viewStep4(p) {
  const q = quote(p);
  const secs = contractSections(p).map((s) => `<h3><span>${s.n}.</span>${esc(s.title)}</h3>${s.paras.map((x) => `<p>${esc(x)}</p>`).join('')}${s.table ? `<table><thead><tr><th>${t('Service', 'Service')}</th><th class="r">${t('Montant', 'Amount')}</th></tr></thead><tbody>${q.lines.map((l) => `<tr><td>${esc(l.label)}</td><td class="r">${fmtMoney(l.amount)}</td></tr>`).join('')}${q.discount ? `<tr><td>${esc(discLabel(p, q))}</td><td class="r">− ${fmtMoney(q.discount)}</td></tr>` : ''}${q.promo ? `<tr><td>${t('Intervention initiale, automne 2026 (offre)', 'First treatment, fall 2026 (offer)')}</td><td class="r">${fmtMoney(q.promo)}</td></tr>` : ''}<tr><td>${t('TPS (5 %)', 'GST (5%)')}</td><td class="r">${fmtMoney(q.tps)}</td></tr><tr><td>${t('TVQ (9,975 %)', 'QST (9.975%)')}</td><td class="r">${fmtMoney(q.tvq)}</td></tr></tbody><tfoot><tr><td>${t('Total, taxes incluses', 'Total, tax included')}</td><td class="r">${fmtMoney(q.total)}</td></tr></tfoot></table><p>${isCorp(p) ? t(`Facturé après chaque visite, par facture consolidée mensuelle payable à ${(p.billing && p.billing.terms) || 30} jours.`, `Billed after each visit, by consolidated monthly invoice payable within ${(p.billing && p.billing.terms) || 30} days.`) : t(`Soit ${fmtMoney(q.monthly)} par mois sur 12 mois, taxes en sus. Le mode de paiement se règle à la signature.`, `That is ${fmtMoney(q.monthly)} a month over 12 months, plus tax. The payment method is set when you sign.`)}</p>` : ''}`).join('');
  return `${viewHero(p, 4)}
  <section class="section" id="agreement"><div class="wrap"><div class="agree">
    <article class="paper" aria-label="${t('Entente de service', 'Service agreement')}">
      <div class="paper__head"><div class="stack" style="gap:6px">${vdBadge(true)}<h2>${isRenewal(p) ? t(`Renouvellement · ${SEASON}`, `Renewal · ${SEASON}`) : t(`Entente de service · ${SEASON}`, `Service agreement · ${SEASON}`)}</h2><p style="margin:0;color:#5A625C">${esc(householdOf(p))} · ${esc(p.client.address)}, ${esc(p.client.city)}</p></div>
        <div class="paper__meta">${t('Entente', 'Agreement')} ${esc(docId(p))}<br>${isRenewal(p) ? t(`${ordinal(seasonNo(p), true)} année · client depuis ${p.since}`, `${ordinal(seasonNo(p))} year · client since ${p.since}`) : `${t('Plan d’action', 'Action plan')} v${esc(p.proposal.version)}, ${esc(fmtDate(p.proposal.date))}`}<br>${p.signature ? `${t('Signée le', 'Signed')} ${esc(fmtDate(p.signature.signedAt))}` : t('En attente de signature', 'Awaiting signature')}</div></div>
      ${secs}
      <div class="sigs" id="sigs">${sigBlock(p, 'client')}${sigBlock(p, 'vd')}</div>
      <p class="paper__note">${t('Modèle de démonstration préparé par Winnia. Le texte final est à valider par MBM Gestion parasitaire et ses conseillers juridiques.', 'Demo template prepared by Winnia. The final text is to be validated by MBM Gestion parasitaire and its legal advisors.')}</p>
    </article>
    ${signboxHtml(p)}
  </div></div></section>`;
}

/* ============ Step 5: my protection ============ */
function tasksHtml(p) {
  const tk = (p.onboarding && p.onboarding.tasks) || {};
  const ownerTag = (o) => o === 'you' ? `<span class="owner owner--you">${t('VOUS', 'YOU')}</span>` : o === 'vd' ? '<span class="owner owner--vd">MBM</span>' : `<span class="owner owner--both">${t('ENSEMBLE', 'TOGETHER')}</span>`;
  return `<ul class="tasks" id="tasks">${obTasks(p).map((x) => {
    const done = !!tk[x.id], mine = x.owner !== 'vd';
    const ctrl = mine ? `<label class="check" style="gap:0"><input type="checkbox" data-change="task" data-k="${x.id}" ${done ? 'checked' : ''} aria-label="${esc(taskLabel(p, x))}"></label>` : `<span class="avatar" style="width:24px;height:24px;background:var(--sheet-2);color:var(--muted)">${done ? icon('check') : icon('clock')}</span>`;
    const status = !mine ? `<span class="tag ${done ? 'tag--ok' : x.id === 'first' ? '' : 'tag--info'}">${done ? t('Fait', 'Done') : x.id === 'first' ? t('Prévu', 'Planned') : t('En cours', 'In progress')}</span>` : ownerTag(x.owner);
    return `<li class="task ${done ? 'is-done' : ''}">${ctrl}<div class="task__txt"><b>${esc(taskLabel(p, x))}</b>${taskSub(p, x) ? `<span>${esc(taskSub(p, x))}</span>` : ''}</div>${status}</li>`;
  }).join('')}</ul>`;
}
function prefsHtml(p) {
  const pr = (p.onboarding && p.onboarding.prefs) || {};
  const sw = (k, on, label, sub) => `<div class="pref"><div><b>${esc(label)}</b><span>${esc(sub)}</span></div><button class="switch" role="switch" aria-checked="${!!on}" data-action="pref" data-k="${k}" aria-label="${esc(label)}"></button></div>`;
  return `<div class="prefs">${sw('sms', pr.sms, t('Texto la veille de la visite', 'Text the day before a visit'), A(p).phone || p.client.phone || t('Ajoutez votre cellulaire à l’évaluation', 'Add your mobile in the assessment'))}${sw('email', pr.email, t('Rapport avec photos par courriel', 'Photo report by email'), A(p).email || p.client.email)}${sw('tips', pr.tips, t('Conseils de prévention', 'Prevention tips'), t('Quoi surveiller, saison par saison', 'What to watch, season by season'))}</div>`;
}
/* Two "photos" for the example report: a sealed foundation crack and a checked bait station */
function reportPhotos() {
  const ph = (inner, cap) => `<figure class="report__ph"><svg viewBox="0 0 160 100" aria-hidden="true">${inner}</svg><figcaption>${esc(cap)}</figcaption></figure>`;
  const crack = '<rect width="160" height="100" fill="#B9BEC0"/><rect y="62" width="160" height="38" fill="#6B5A49"/><path d="M0 62H160" stroke="#8C9295" stroke-width="3"/><path d="M78 0l-6 18 8 12-7 16 6 16" stroke="#5E6468" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M78 0l-6 18 8 12-7 16 6 16" stroke="#E8E4DA" stroke-width="3.2" fill="none" stroke-linejoin="round"/><circle cx="132" cy="22" r="11" fill="#00AEEF"/><path d="M127 22l3.4 3.4 6.4-6.8" stroke="#04202E" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  const station = '<rect width="160" height="100" fill="#7FA36A"/><rect y="0" width="160" height="40" fill="#C9CFD2"/><path d="M0 40H160" stroke="#9AA1A4" stroke-width="2"/><rect x="48" y="48" width="64" height="34" rx="7" fill="#2E3A40"/><rect x="54" y="54" width="52" height="8" rx="3" fill="#47555C"/><circle cx="80" cy="72" r="4" fill="#E2A33A"/><text x="80" y="95" text-anchor="middle" font-size="9" fill="#F4F8F0" font-family="monospace">S-02</text>';
  return `<div class="report__phs">${ph(crack, t('Fissure colmatée, fondation côté garage', 'Crack sealed, foundation by the garage'))}${ph(station, t('Station 2 vérifiée, 1 capture', 'Station 2 checked, 1 catch'))}</div>`;
}
function reportHtml(p) {
  const probs = A(p).problems || [];
  const rodent = probs.some((k) => RODENT_SIGNS.includes(k));
  const insect = probs.find((k) => PROB[k] && PROB[k].group === 'insectes');
  const done = rodent ? [t('Stations vérifiées : 4 sur 4, 1 capture', 'Stations checked: 4 of 4, 1 catch'), t('Points d’entrée revérifiés : tous étanches', 'Entry points rechecked: all sealed')] : [t('Inspection intérieure et extérieure', 'Inside and outside inspection'), t('Barrière préventive à la fondation', 'Preventive barrier at the foundation')];
  if (insect) done.push(t(`Suivi ciblé : ${tx(PROB[insect]).toLowerCase()}`, `Targeted follow-up: ${tx(PROB[insect]).toLowerCase()}`));
  const note = rodent ? t('Aucune nouvelle crotte depuis l’exclusion de l’automne. Une capture dans la station 2, côté garage. Prochaine visite prévue en juin.', 'No new droppings since the fall exclusion. One catch in station 2, by the garage. Next visit planned for June.') : t('Aucune activité à l’intérieur. Fondation inspectée : deux fissures mineures, colmatées. Prochaine visite prévue en juin.', 'No activity inside. Foundation inspected: two minor cracks, sealed. Next visit planned for June.');
  return `<article class="report">
    <div class="report__head"><div class="stack" style="gap:4px"><p class="eyebrow">${t('Exemple · rapport de visite', 'Example · visit report')}</p><h3 class="h3" style="color:#1A1F1B">${t(`Visite 1 · printemps ${SEASON}`, `Visit 1 · spring ${SEASON}`)}</h3></div>${vdBadge()}</div>
    <div class="report__grid"><div class="report__cell"><span>${t('Date', 'Date')}</span><b>${esc(cap1(fmtDate('2027-04-20', { weekday: 'long', day: 'numeric', month: 'long' })))}</b></div><div class="report__cell"><span>${t('Technicien', 'Technician')}</span><b>Jonathan R.</b></div><div class="report__cell"><span>${t('Activité', 'Activity')}</span><b>${rodent ? t('Faible, en baisse', 'Low, dropping') : t('Aucune', 'None')}</b></div></div>
    <ul class="report__done">${done.map((d) => `<li>${icon('check')}${esc(d)}</li>`).join('')}</ul>
    ${reportPhotos()}
    <div class="report__note"><b>${t('Note du technicien', 'Technician’s note')}</b>${esc(note)}</div>
    <div class="sign-board"><b>${t('Traitement effectué', 'Treatment applied')}</b><span>${t('Attendez 4 heures avant de revenir dans les pièces traitées. Les stations restent verrouillées.', 'Wait 4 hours before going back into the treated rooms. The stations stay locked.')}</span></div>
    <p class="tiny" style="margin:0">${t('Exemple fictif. Les consignes réelles dépendent du produit utilisé et sont laissées par le technicien.', 'Fictional example. Actual instructions depend on the product used and are left by the technician.')}</p>
  </article>`;
}
function viewStep5(p) {
  const nbCode = `VOISIN-${(slugify(p.client.last || p.slug).split('-')[0] || 'mbm').toUpperCase().slice(0, 8)}`;
  return `${viewHero(p, 5)}
  ${offersSectionHtml(p)}
  ${isTerm(p) ? termNextHtml(p) : ''}
  ${isCorp(p) ? sitesSeasonHtml(p) : ''}
  <section class="section" id="preparer"><div class="wrap">
    <div class="section-head"><p class="eyebrow">${t('Avant l’intervention', 'Before the treatment')}</p><h2 class="h2">${t('Tout est prêt <em>pour la première visite</em>.', 'All set <em>for the first visit</em>.')}</h2></div>
    <div class="ob">
      <div class="card stack" style="gap:14px"><div class="row" style="justify-content:space-between"><b class="h4">${t('Liste de préparation', 'Prep checklist')}</b><span class="tag" id="ob-pct">${obProgress(p)} %</span></div>${tasksHtml(p)}</div>
      <div class="stack" style="gap:20px">
        <div class="card stack" style="gap:12px"><b class="h4">${t('Vos avis', 'Your notices')}</b>${prefsHtml(p)}</div>
        ${accountMiniHtml(p)}
      </div>
    </div>
  </div></section>
  <section class="section" id="saison-5"><div class="wrap">
    <div class="section-head"><p class="eyebrow">${t('Votre année de protection', 'Your year of protection')}</p><h2 class="h2">${t('Ce qui s’en vient, <em>visite par visite</em>.', 'What’s coming, <em>visit by visit</em>.')}</h2></div>
    <div class="card card--flat tl">${timelineHtml(p, true)}</div>
  </div></section>
  <section class="section" id="rapport"><div class="wrap split">
    <div class="section-head" style="margin:0"><p class="eyebrow">${t('Après chaque visite', 'After each visit')}</p><h2 class="h2">${t('Un rapport, <em>pas un mystère</em>.', 'A report, <em>not a mystery</em>.')}</h2><p class="lede">${t('Ce qui a été fait, ce qu’on a vu, les photos, les consignes et la note du technicien. Par courriel et ici, dans votre espace.', 'What was done, what we saw, the photos, the instructions and the technician’s note. By email and here, in your space.')}</p>
      <ol class="flow">
        <li><span class="flow__ic">${icon('chat')}</span><div><em>${t('La veille', 'The day before')}</em><b>${isCorp(p) ? t('Un avis à la réception et à la responsable qualité', 'A notice to the front desk and the quality lead') : t('Un texto d’avis', 'A text notice')}</b><span>${isCorp(p) ? t('Accès confirmés, quais libérés, site par site.', 'Access confirmed, docks cleared, site by site.') : t('Rangez la nourriture, dégagez l’accès au sous-sol.', 'Put food away, clear the way to the basement.')}</span></div></li>
        <li><span class="flow__ic">${icon('truck')}</span><div><em>${t('Le jour même', 'On the day')}</em><b>${t('La visite et le rapport avec photos', 'The visit and the photo report')}</b><span>${t('Le technicien, clairement identifié, laisse les consignes sur place.', 'The technician, clearly identified, leaves the instructions on site.')}</span></div></li>
        <li><span class="flow__ic">${icon('phone')}</span><div><em>${t('Dans la semaine', 'Within the week')}</em><b>${t('L’appel de satisfaction', 'The satisfaction call')}</b><span>${t('On s’assure que tout est réglé. Sinon, on revient, photos à l’appui.', 'We make sure everything is settled. If not, we come back, with photos.')}</span></div></li>
      </ol></div>
    ${reportHtml(p)}
  </div></section>
  <section class="section" id="voisins"><div class="wrap minis">
    ${isTerm(p) ? `<div class="card stack" style="gap:12px"><p class="eyebrow">${t(`Un ${siteNoun(p, 1)} de plus ?`, `One more ${siteNoun(p, 1)}?`)}</p><b class="h3">${t('Il s’ajoute à l’entente, au même tarif.', 'It joins the agreement, at the same rate.')}</b><p class="small" style="margin:0">${t(`${firstName((p.rep || repFor(p.branch)).name)} l’inspecte et l’ajoute par avenant, jusqu’à la fin de l’entente en ${TM(p).end}. Une seule facture consolidée, le détail par ${siteNoun(p, 1)}.`, `${firstName((p.rep || repFor(p.branch)).name)} inspects it and adds it by amendment, until the agreement ends in ${TM(p).end}. One consolidated invoice, itemized by ${siteNoun(p, 1)}.`)}</p><button class="btn btn--ghost btn--sm" style="justify-self:start" data-action="toggle-contact">${icon('building')}${t('En parler', 'Talk about it')}</button></div>` : isCorp(p) ? `<div class="card stack" style="gap:12px"><p class="eyebrow">${t('Un nouveau site ?', 'A new site?')}</p><b class="h3">${t('Même entente, même bon de commande.', 'Same agreement, same purchase order.')}</b><p class="small" style="margin:0">${t(`Un bail signé, une usine acquise ? ${firstName((p.rep || repFor(p.branch)).name)} inspecte le site et l’ajoute à votre programme, avec le détail sur la facture consolidée.`, `A new lease or plant? ${firstName((p.rep || repFor(p.branch)).name)} inspects the site and adds it to your program, itemized on the consolidated invoice.`)}</p><button class="btn btn--ghost btn--sm" style="justify-self:start" data-action="toggle-contact">${icon('building')}${t('Ajouter un site', 'Add a site')}</button></div>` : `<div class="card stack" style="gap:12px"><div class="row" style="justify-content:space-between"><p class="eyebrow">${t('Votre voisin aussi ?', 'Your neighbor too?')}</p><span class="tag">${t('Concept', 'Concept')}</span></div><b class="h3">${t('Les souris ne s’arrêtent pas à la clôture.', 'Mice don’t stop at the fence.')}</b><p class="small" style="margin:0">${isOrg(p) ? t('Partagez votre code : un immeuble voisin reçoit sa propre évaluation, et tout le secteur est mieux protégé.', 'Share your code: a neighbouring building gets its own assessment, and the whole area is better protected.') : t('Partagez votre code : votre voisin reçoit sa propre évaluation, et votre rue est protégée d’un bloc.', 'Share your code: your neighbor gets their own assessment, and your street is protected as a block.')}</p><div class="copyline"><span>${esc(nbCode)}</span><button class="btn btn--xs btn--ghost" data-action="copy" data-text="${esc(nbCode)}">${icon('copy')}${t('Copier', 'Copy')}</button></div></div>`}
    <div class="card stack" style="gap:12px"><p class="eyebrow">${t('Besoin d’un coup de main ?', 'Need a hand?')}</p><b class="h3">${t('Appels de service sans frais.', 'Free service calls.')}</b><p class="small" style="margin:0">${t(`Une souris revient entre deux visites ? Écrivez-nous ou appelez la ligne 24/7 (${MBM_LINE}) : un technicien revient, c’est inclus.`, `A mouse comes back between visits? Write to us or call the 24/7 line (${MBM_LINE}): a technician comes back, it’s included.`)}</p><button class="btn btn--ghost btn--sm" style="justify-self:start" data-action="ask-open">${icon('chat')}${t('Écrire au conseiller virtuel', 'Write to the virtual advisor')}</button></div>
  </div></section>`;
}
