/* ============ Three journeys on one structure: new client, annual renewal, multi-year agreement ============ */
const PREV = SEASON - 1;
/* The 2027 price grid vs 2026 (demo figure: products, labour and fuel) */
const GRID_UP = 0.035;
const RENEW_STEPS = [
  { n: 1, key: 'bilan', fr: `Bilan ${PREV}`, en: `${PREV} review` },
  { n: 2, key: 'programme', fr: `Programme ${SEASON}`, en: `${SEASON} program` },
  { n: 3, key: 'ajustements', fr: 'Ajustements', en: 'Changes' },
  { n: 4, key: 'renouvellement', fr: 'Renouvellement', en: 'Renewal' },
  { n: 5, key: 'saison', fr: 'Ma protection', en: 'My protection' },
];
const TERM_STEPS = [
  { n: 1, key: 'entente', fr: 'Mon entente', en: 'My agreement' },
  { n: 2, key: 'bilan', fr: `Bilan ${PREV}`, en: `${PREV} review` },
  { n: 3, key: 'budget', fr: `Budget ${SEASON}`, en: `${SEASON} budget` },
  { n: 4, key: 'approbation', fr: 'Approbation', en: 'Approval' },
  { n: 5, key: 'saison', fr: `Année ${SEASON}`, en: `${SEASON} year` },
];
const FLOWS = {
  onboarding: { key: 'onboarding', steps: STEPS, fr: 'Nouveaux clients', en: 'New clients', icon: 'user' },
  renewal: { key: 'renewal', steps: RENEW_STEPS, fr: 'Renouvellements', en: 'Renewals', icon: 'refresh' },
  term: { key: 'term', steps: TERM_STEPS, fr: 'Ententes pluriannuelles', en: 'Multi-year agreements', icon: 'calendar' },
};
const flowOf = (p) => (p && FLOWS[p.flow]) || FLOWS.onboarding;
const stepsOf = (p) => flowOf(p).steps;
const isRenewal = (p) => !!p && p.flow === 'renewal';
const isTerm = (p) => !!p && p.flow === 'term';
/* Every step key, all journeys together (routes are #slug-key; the portal's own journey decides the step) */
const STEP_KEYS = Array.from(new Set(Object.values(FLOWS).flatMap((f) => f.steps.map((s) => s.key))));

const NUM_FR = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];
const NUM_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
function numWord(n, fem) { if (S.lang === 'en') return NUM_EN[n] || String(n); return n === 1 && fem ? 'une' : NUM_FR[n] || String(n); }
function ordinal(n, fem) {
  if (S.lang === 'en') { const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'); return `${n}${s}`; }
  return n === 1 ? (fem ? '1re' : '1er') : `${n}e`;
}
function fmtPct(v, dec = 1) {
  const n = new Intl.NumberFormat(loc(), { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v);
  return S.lang === 'en' ? `${n}%` : `${n} %`;
}
/* "immeubles", "cliniques" or "sites", as the client says it */
function siteNoun(p, n) {
  const w = p && p.sitesWord;
  if (!w) return n > 1 ? t('sites', 'sites') : t('site', 'site');
  return tx(n > 1 ? w.many : w.one);
}

/* What can change in a home from one year to the next (renewal, step 3) */
const RENEW_CHANGES = [
  { key: 'none', icon: 'check', fr: 'Rien n’a changé', en: 'Nothing changed' },
  { key: 'reno', icon: 'home', area: true, fr: 'Agrandissement ou rénovation', en: 'Extension or renovation' },
  { key: 'basement', icon: 'layout', area: true, fr: 'Sous-sol aménagé', en: 'Basement finished' },
  { key: 'shed', icon: 'building', area: true, fr: 'Garage ou cabanon ajouté', en: 'New garage or shed' },
  { key: 'pet', icon: 'users', fr: 'Nouvel animal', en: 'New pet' },
  { key: 'baby', icon: 'user', fr: 'Un bébé à la maison', en: 'A baby at home' },
  { key: 'wood', icon: 'tree', fr: 'Bois de chauffage ou terrasse en bois', en: 'Firewood or a wooden deck' },
  { key: 'sale', icon: 'home', fr: 'La maison est à vendre', en: 'The house is for sale' },
];
const RENEW_RATES = [
  { v: 1, fr: 'Décevante', en: 'Disappointing' }, { v: 2, fr: 'Moyenne', en: 'So-so' }, { v: 3, fr: 'Correcte', en: 'Fine' }, { v: 4, fr: 'Très bonne', en: 'Very good' }, { v: 5, fr: 'Excellente', en: 'Excellent' },
];

/* ============ Demo files: renewals and multi-year agreements (fictional people, buildings and prices) ============ */
function seedFlowClients(today) {
  const d = (n, h = 10, m = 0) => { const x = addDays(today, n); x.setHours(h, m, 0, 0); return isoLocal(x); };
  const day = (n) => isoDay(addDays(today, n));
  const next = (n) => { const x = addDays(today, n); while (x.getDay() === 0 || x.getDay() === 6) x.setDate(x.getDate() + 1); return isoDay(x); };
  const contact = (first, last, city, address, extra) => Object.assign({ first, last, name: `${first} ${last}`, email: `${slugify(first)}.${slugify(last)}@exemple.test`, phone: '', address, city, title: null }, extra || {});
  const L = (fr, en) => ({ fr, en });
  const addons = (keys) => Object.assign(Object.fromEntries(ADDONS.map((a) => [a.key, false])), Object.fromEntries(keys.map((k) => [k, true])));
  /* Loyalty price: guaranteed until December 15, or three weeks from today once that date is close */
  const dec15 = new Date(today.getFullYear(), 11, 15);
  const deadline = (dec15 - today) / 864e5 > 10 ? isoDay(dec15) : day(21);

  /* ---------- Renewal: what a year of protection looks like, visit by visit (w = activity seen) ---------- */
  const W = { p1: L('Faible', 'Low'), p2: L('Fourmis dehors', 'Ants outside'), p3: L('Faible', 'Low'), p4: L('Aucune dedans', 'None inside') };
  const D = {
    insp: L('Inspection intérieure et extérieure', 'Inside and outside inspection'), stations: L('Stations vérifiées et notées', 'Stations checked and logged'),
    barrier: L('Barrière préventive à la fondation', 'Preventive barrier at the foundation'), entries: L('Points d’entrée revérifiés', 'Entry points rechecked'),
    ants: L('Fourmis traitées à la fondation', 'Ants treated at the foundation'), wasps: L('Nid de guêpes retiré', 'Wasp nest removed'),
    seal: L('Colmatage d’automne avant le froid', 'Fall sealing before the cold'),
  };
  const stdVisits = (o = {}) => [
    { n: 1, date: '2026-04-27', by: 'jroy', w: W.p1, done: [D.insp, D.stations, ...(o.v1 || [])], note: o.n1 || L('Rien à l’intérieur après l’hiver. Les stations n’ont pas bougé.', 'Nothing inside after the winter. The stations were untouched.') },
    { n: 2, date: '2026-06-15', by: 'jroy', w: W.p2, done: [D.insp, D.barrier, ...(o.v2 || [])], note: o.n2 || L('Barrière appliquée autour de la fondation. Aucune fourmi à l’intérieur.', 'Barrier applied around the foundation. No ants inside.') },
    { n: 3, date: '2026-08-10', by: 'jroy', w: W.p3, done: [D.insp, D.stations, ...(o.v3 || [])], note: o.n3 || L('Rien d’inquiétant. Gardez les poubelles fermées pendant les chaleurs.', 'Nothing worrying. Keep the bins closed during the heat.') },
    { n: 4, date: '2026-10-01', by: 'jroy', w: W.p4, done: [D.insp, D.entries, D.seal, ...(o.v4 || [])], note: o.n4 || L('Maison prête pour l’hiver : tous les accès sont étanches. On se revoit au printemps.', 'House ready for the winter: every entry point is sealed. See you in the spring.') },
  ];
  /* What the technician saw, and the treatment it leads to (kept from 2026, or new for 2027) */
  const OBS = {
    exclusion: { key: 'crottes', good: true, by: 'jroy', title: L('Aucune trace de souris', 'No sign of mice'), note: L('Aucune nouvelle trace de souris cette année : les accès tiennent. On garde le colmatage d’automne.', 'No new sign of mice this year: the seals are holding. We keep the fall sealing.') },
    stations: { key: 'rats', by: 'jroy', title: L('Activité aux stations côté ruelle', 'Activity at the stations by the lane'), note: L('Deux captures en septembre aux stations côté ruelle : on les garde pour l’hiver.', 'Two catches in September at the stations by the lane: we keep them for the winter.') },
    rampants: { key: 'fourmis_int', by: 'jroy', title: L('Fourmis près de l’évier en mai', 'Ants near the sink in May'), note: L('Des fourmis près de l’évier en mai : un traitement ciblé au printemps, avant qu’elles s’installent.', 'Ants near the sink in May: a targeted treatment in spring, before they settle in.') },
    charpentieres: { key: 'sciure', by: 'slev', title: L('Sciure sous la galerie', 'Sawdust under the porch'), note: L('De la sciure et de grosses fourmis noires sous la galerie : on traite le nid au printemps, quand la colonie est active.', 'Sawdust and large black ants under the porch: we treat the nest in spring, when the colony is active.') },
    drains: { key: 'mouches', by: 'slev', title: L('Mouches à drain au sous-sol', 'Drain flies in the basement'), note: L('Des mouches à drain près de la buanderie : un traitement biologique, sans pesticide.', 'Drain flies near the laundry room: a biological treatment, no pesticide.') },
    guepes: { key: 'nid_guepes', by: 'mtrem', title: L('Guêpes sous la galerie', 'Wasps under the porch'), note: L('Un nid sous la galerie en août : le retrait est prévu en préventif dès le début de l’été.', 'A nest under the porch in August: removal is planned as a preventive at the start of summer.') },
    bouclier: { key: null, good: true, by: 'mtrem', title: L('Fondation sans araignées ni fourmis', 'Foundation free of spiders and ants'), note: L('Le bouclier a tenu les araignées et les fourmis loin de la fondation tout l’été : on le garde.', 'The shield kept spiders and ants away from the foundation all summer: we keep it.') },
    faune: { key: 'ratons', by: 'mtrem', title: L('Traces d’écureuil près du soffite', 'Squirrel signs near the soffit'), note: L('Des traces d’écureuil près du soffite : on ferme l’accès avant l’hiver.', 'Squirrel signs near the soffit: we close the way in before winter.') },
    odeurs: { key: 'odeur', by: 'jroy', title: L('Odeur au vide sanitaire', 'Smell in the crawl space'), note: L('Une odeur au vide sanitaire en octobre : on trouve la source et on la neutralise.', 'A smell in the crawl space in October: we find the source and neutralize it.') },
  };
  const obsFor = (key, kind) => Object.assign({ addon: key, kind }, OBS[key] || OBS.exclusion);
  const STATS = (h0, h1) => [
    { k: L('Activité à l’intérieur', 'Activity inside'), v: L(`−${Math.min(95, Math.round((h1 - h0) * 3.2))} %`, `−${Math.min(95, Math.round((h1 - h0) * 3.2))}%`), s: L('d’avril à octobre', 'from April to October') },
    { k: L('Captures aux stations', 'Station catches'), v: L('5 → 0', '5 → 0'), s: L('du printemps à l’automne', 'from spring to fall') },
    { k: L('Visites faites', 'Visits done'), v: L('4 sur 4', '4 of 4'), s: L('toutes à la date prévue', 'all on the planned date') },
  ];
  const renewFile = (c) => {
    const keep = c.keep || [], add = c.add || [], st = c.stage;
    const r = { deadline, health: c.health, visits: stdVisits(c.v), extras: (c.upsells || []).map((u) => ({ key: u.key, date: u.date, by: 'jroy' })), calls: c.calls || [],
      stats: STATS(c.health[0], c.health[1]), obs: keep.map((k) => obsFor(k, 'keep')).concat(add.map((k) => obsFor(k, 'new'))),
      rating: null, comment: '', reviewedAt: null, acceptedAt: null, changes: [], changeNote: '', access: c.access || '', pets: c.pets || '', changesAt: null, callbackAt: null };
    if (st >= 2) { r.reviewedAt = d(c.dr || -4, 19, 10); r.rating = c.rating || 5; }
    if (st >= 3) r.acceptedAt = d(c.da || -3, 20, 5);
    if (st >= 4) { r.changesAt = d(c.dc || -2, 18, 30); r.changes = ['none']; }
    const name = `${c.first} ${c.last}`;
    const o = {
      slug: c.slug, flow: 'renewal', stage: st, source: c.source || 'reference', branch: c.branch, createdAt: d(c.dh || -6, 16, 0), since: c.since,
      client: contact(c.first, c.last, c.city, c.address),
      account: { method: c.method, autopay: true },
      history: { [PREV]: { area: c.area, addons: c.h || [], upsells: c.upsells || [] } },
      answers: seedAnswers({ name, email: `${slugify(c.first)}.${slugify(c.last)}@exemple.test`, address: c.address, city: c.city, area: c.area, rating: 4, problems: c.problems || [], trees: c.trees || 2, goals: ['prevenir'], submittedAt: `${c.since}-04-12T19:00:00` }),
      proposal: { version: '1.0', date: day(c.dh || -6), validUntil: deadline, addons: addons(keep.concat(add)), promo: false, discountPct: 5, injectTrees: 4, acceptedAt: r.acceptedAt },
      renewal: r,
      onboarding: { tasks: {}, prefs: { sms: true, email: true, tips: true }, startedAt: null },
      activity: [{ at: d(c.dh || -6, 16, 0), fr: `Avis de fin d’année laissé : bilan ${PREV} et programme ${SEASON}`, en: `Year-end notice left: ${PREV} review and ${SEASON} program` }],
    };
    if (st >= 2) o.activity.unshift({ at: r.reviewedAt, fr: `Bilan ${PREV} consulté, année notée ${r.rating}/5`, en: `${PREV} review viewed, year rated ${r.rating}/5` });
    if (st >= 3) o.activity.unshift({ at: r.acceptedAt, fr: `Programme ${SEASON} accepté au prix fidélité`, en: `${SEASON} program accepted at the loyalty price` });
    if (st >= 4) o.activity.unshift({ at: r.changesAt, fr: 'Ajustements confirmés : rien n’a changé', en: 'Changes confirmed: nothing changed' });
    if (st >= 5) {
      const sd = d(c.ds || -1, 20, 40);
      o.signature = { name, mode: 'type', text: name, signedAt: sd, hash: c.hash || 'A3C9-11F0-6B2E' };
      o.countersigned = { name: repFor(c.branch).name, signedAt: d(c.ds || -1, 20, 58) };
      o.onboarding = { tasks: { prefs: true, access: true, zones: true, file: true, route: true }, prefs: { sms: true, email: true, tips: true }, startedAt: o.countersigned.signedAt };
      o.activity.unshift({ at: sd, fr: `Renouvellement ${SEASON} signé en ligne`, en: `${SEASON} renewal signed online` });
    }
    return o;
  };

  /* ---------- Multi-year agreement: one file per building portfolio ---------- */
  const termFile = (c) => {
    const { start, end, term, ...rest } = c;
    const tm = Object.assign({ start, end, indexPct: 3, target: 80, targetYear: Math.min(3, end - start + 1), overviewAt: null, reviewAt: null, budgetAt: null, meeting: null,
      slots: [{ at: `${next(3)}T10:00:00`, mode: 'video' }, { at: `${next(5)}T14:00:00`, mode: 'site' }, { at: `${next(8)}T09:00:00`, mode: 'video' }],
      amendment: { no: `AV-${SEASON}-01`, po: '', signature: null, countersigned: null } }, term);
    const st = c.stage;
    if (st >= 2) tm.overviewAt = d(-3, 9, 40);
    if (st >= 3) tm.reviewAt = d(-2, 10, 15);
    if (st >= 4) tm.budgetAt = d(-1, 11, 5);
    if (st >= 5) {
      tm.amendment.signature = { name: `${c.client.first} ${c.client.last}`, mode: 'type', text: `${c.client.first} ${c.client.last}`, signedAt: d(-1, 15, 20), hash: 'C72B-0E15-9D44' };
      tm.amendment.countersigned = { name: c.rep ? c.rep.name : repFor(c.branch).name, signedAt: d(-1, 15, 41) };
    }
    return Object.assign({ flow: 'term', segment: 'commercial', source: 'commercial', since: start }, rest, { term: tm });
  };

  return [
    /* Annual renewal, the showcase: sixth year, loyalty price until December 15 */
    { slug: 'bergeron', flow: 'renewal', stage: 1, showcase: true, source: 'reference', branch: 'levis', createdAt: d(-3, 16, 10), since: 2021,
      client: contact('Caroline', 'Bergeron', 'Lévis', '27, rue des Merisiers', { phone: '418 555-0177' }),
      account: { method: { kind: 'pad', label: 'Desjardins', last4: '2290' }, autopay: true },
      history: { [PREV]: { area: 2400, addons: ['exclusion', 'bouclier'], upsells: [{ key: 'guepes', date: '2026-08-12' }] } },
      answers: seedAnswers({ name: 'Caroline Bergeron', email: 'caroline.bergeron@exemple.test', phone: '418 555-0177', address: '27, rue des Merisiers', city: 'Lévis', area: 2400, zones: ['cuisine', 'exterieur'], rating: 4, problems: ['sciure', 'fourmis_int'], kids: 'oui', pets: ['chien'], trees: 3, goals: ['prevenir', 'eco'], notes: 'Chienne (Moka) dans la cour arrière. Porte de côté.', submittedAt: '2021-04-02T19:20:00' }),
      proposal: { version: '1.0', date: day(-3), validUntil: deadline, addons: addons(['exclusion', 'bouclier', 'charpentieres']), promo: false, discountPct: 5, injectTrees: 4, acceptedAt: null },
      renewal: {
        deadline, health: [58, 86],
        visits: [
          { n: 1, date: '2026-04-28', by: 'jroy', w: L('Faible', 'Low'), done: [D.insp, D.stations, L('Fourmis traitées à la fondation, côté cour', 'Ants treated at the foundation, backyard side')],
            note: L('Deux captures aux stations côté garage pendant l’hiver, rien dans la maison. Fourmis traitées le long de la fondation.', 'Two catches at the garage-side stations over the winter, nothing in the house. Ants treated along the foundation.') },
          { n: 2, date: '2026-06-16', by: 'jroy', w: L('Fourmis dehors', 'Ants outside'), done: [D.insp, D.barrier, D.stations],
            note: L('Barrière préventive appliquée autour de la fondation. Aucune fourmi dans la maison.', 'Preventive barrier applied around the foundation. No ants in the house.') },
          { n: 3, date: '2026-08-12', by: 'jroy', w: L('Nid de guêpes', 'Wasp nest'), done: [D.insp, D.stations, L('Nid de guêpes retiré sous la galerie', 'Wasp nest removed under the porch')],
            note: L('Un nid sous la galerie, retiré en soirée. Les enfants peuvent rejouer dans la cour.', 'A nest under the porch, removed in the evening. The kids can play in the yard again.') },
          { n: 4, date: '2026-10-02', by: 'jroy', w: L('Aucune dedans', 'None inside'), done: [D.insp, D.entries, L('Colmatage : sortie de la sécheuse', 'Sealing: dryer vent')],
            note: L('Une ouverture autour de la sortie de la sécheuse, colmatée avant le froid. De la sciure sous la galerie : à surveiller.', 'A gap around the dryer vent, sealed before the cold. Sawdust under the porch: one to watch.') },
        ],
        extras: [{ key: 'guepes', date: '2026-08-12', by: 'jroy' }],
        calls: [{ date: '2026-06-24', hours: 20, fr: 'Fourmis revenues près de la porte-patio : retour sans frais', en: 'Ants back by the patio door: free return visit' }],
        stats: [
          { k: L('Activité à l’intérieur', 'Activity inside'), v: L('−90 %', '−90%'), s: L('d’avril à octobre', 'from April to October') },
          { k: L('Captures aux stations', 'Station catches'), v: L('6 → 0', '6 → 0'), s: L('de l’hiver à l’automne', 'from winter to fall') },
          { k: L('Souris dans la maison', 'Mice in the house'), v: L('0', '0'), s: L(`deux en 2025, aucune en ${PREV}`, `two in 2025, none in ${PREV}`) },
        ],
        obs: [
          Object.assign(obsFor('exclusion', 'keep'), { note: L(`Aucune souris dans la maison en ${PREV}, contre deux en 2025 : les accès tiennent. On garde le colmatage d’automne.`, `No mice in the house in ${PREV}, against two in 2025: the seals hold. We keep the fall sealing.`) }),
          Object.assign(obsFor('bouclier', 'keep'), { note: L('Le bouclier a gardé les araignées et les fourmis dehors tout l’été, sauf un retour en juin près de la porte-patio, réglé sans frais. On le reconduit.', 'The shield kept spiders and ants outside all summer, except one return in June by the patio door, fixed at no charge. We keep it.') }),
          Object.assign(obsFor('charpentieres', 'new'), { note: L('De la sciure et quelques grosses fourmis noires sous la galerie le 2 octobre : un nid de fourmis charpentières probable dans le bois humide. On le traite au printemps, quand la colonie est active.', 'Sawdust and a few large black ants under the porch on October 2: likely a carpenter ant nest in the damp wood. We treat it in spring, when the colony is active.') }),
        ],
        rating: null, comment: '', reviewedAt: null, acceptedAt: null, changes: [], changeNote: '', access: 'Porte de côté, sans cadenas', pets: 'Chienne (Moka) dans la cour arrière', changesAt: null, callbackAt: null,
      },
      onboarding: { tasks: {}, prefs: { sms: true, email: true, tips: true }, startedAt: null },
      activity: [
        { at: d(-3, 16, 10), fr: `Avis de fin d’année laissé par Audrey : bilan ${PREV} et programme ${SEASON}`, en: `Year-end notice left by Audrey: ${PREV} review and ${SEASON} program` },
        { at: '2026-10-02T11:40:00', fr: 'Visite 4 faite (automne), rapport envoyé', en: 'Visit 4 done (fall), report sent' },
        { at: '2026-08-12T19:05:00', fr: 'Nid de guêpes retiré (ajouté en saison)', en: 'Wasp nest removed (added in season)' },
      ] },
    renewFile({ slug: 'gingras', stage: 2, first: 'Mathieu', last: 'Gingras', city: 'Repentigny', address: '311, rue Notre-Dame', branch: 'rive-nord', since: 2023, area: 1900, h: ['rampants'], keep: ['rampants'], add: ['drains'], problems: ['fourmis_int', 'mouches'], health: [58, 82], dh: -5, dr: -2, method: { kind: 'card', label: 'Visa', last4: '5512' } }),
    renewFile({ slug: 'cloutier', stage: 3, first: 'Marie-Hélène', last: 'Cloutier', city: 'Laval', address: '2045, rue des Ormes', branch: 'laval', since: 2020, area: 2600, h: ['exclusion'], upsells: [{ key: 'guepes', date: '2026-08-18' }], keep: ['exclusion', 'stations'], add: [], problems: ['crottes'], health: [64, 88], dh: -7, dr: -4, da: -2, method: { kind: 'pad', label: 'Banque Nationale', last4: '8841' } }),
    renewFile({ slug: 'poirier', stage: 4, first: 'Benoît', last: 'Poirier', city: 'Chambly', address: '48, rue Bourgogne', branch: 'longueuil', since: 2024, area: 1700, h: [], keep: [], add: ['charpentieres'], problems: ['sciure'], health: [52, 76], dh: -8, dr: -6, da: -4, dc: -1, method: { kind: 'card', label: 'Mastercard', last4: '3307' } }),
    renewFile({ slug: 'thibault', stage: 5, first: 'Josée', last: 'Thibault', city: 'Québec', address: '1180, avenue de la Pommeraie', branch: 'quebec', since: 2018, area: 3100, h: ['exclusion', 'bouclier'], keep: ['exclusion', 'bouclier'], add: ['guepes'], problems: ['crottes', 'nid_guepes'], health: [66, 90], dh: -12, dr: -10, da: -9, dc: -8, ds: -6, hash: '7E04-C2A8-51DB', method: { kind: 'pad', label: 'Desjardins', last4: '6620' } }),

    /* Multi-year agreement, the showcase: four buildings, 2025 to 2028, end of year 2 */
    termFile({ slug: 'riverain', stage: 1, showcase: true, branch: 'longueuil', createdAt: d(-2, 15, 30), start: 2025, end: 2028,
      client: { first: 'Philippe', last: 'Gendron', name: 'Gestion Riverain inc.', org: true, title: { fr: 'Directeur des opérations', en: 'Director of operations' }, email: 'p.gendron@riverain.exemple.test', phone: '450 555-0148', address: '1450, boulevard Marie-Victorin', city: 'Longueuil' },
      rep: { name: 'Julien Paquette', g: 'm', years: 8, phone: '450 555-0129', email: 'julien.paquette@exemple.test', title: { fr: 'Chargé de projet attitré', en: 'Dedicated project manager' } },
      sitesWord: { one: L('immeuble', 'building'), many: L('immeubles', 'buildings') },
      sites: [
        { id: 'riv1', name: L('Le Riverain I', 'Le Riverain I'), address: '1450, boulevard Marie-Victorin', city: 'Longueuil', area: 18500, trees: 9, since: 2025, units: 96 },
        { id: 'riv2', name: L('Le Riverain II', 'Le Riverain II'), address: '1500, boulevard Marie-Victorin', city: 'Longueuil', area: 16000, trees: 7, since: 2025, units: 84 },
        { id: 'cours', name: L('Les Cours Taschereau', 'Les Cours Taschereau'), address: '3200, boulevard Taschereau', city: 'Greenfield Park', area: 11500, trees: 5, since: 2025, units: 60 },
        { id: 'stl', name: L('Habitations Saint-Lambert', 'Habitations Saint-Lambert'), address: '640, avenue Victoria', city: 'Saint-Lambert', area: 9800, trees: 6, since: 2025, units: 48 },
      ],
      billing: { po: 'BC-RIV-2027-0088', terms: 30, ap: 'comptes.payables@riverain.exemple.test', consolidated: true },
      account: { method: { kind: 'eft', label: 'TEF', last4: '6614' }, autopay: false },
      answers: seedAnswers({ name: 'Philippe Gendron', email: 'p.gendron@riverain.exemple.test', phone: '450 555-0148', address: '1450, boulevard Marie-Victorin', city: 'Longueuil', type: 'condo', area: 55800, zones: ['chambres', 'cuisine', 'sous-sol', 'exterieur'], rating: 2, problems: ['piqures', 'coquerelles', 'crottes'], kids: 'oui', pets: ['chien'], watering: 'brut', mowing: 'service', trees: 27, pests: ['araignees', 'guepes'], goals: ['prevenir', 'audit'], notes: '288 logements. Un bilan annuel par immeuble pour le conseil d’administration.', submittedAt: '2024-10-08T10:00:00' }),
      proposal: { version: '1.0', date: '2024-11-20', validUntil: '2024-12-20', addons: addons(['exclusion', 'rampants', 'bouclier']), promo: false, discountPct: 6, injectTrees: 4, acceptedAt: '2024-12-02T11:00:00' },
      visit: { mode: 'terrain', date: '2024-10-15', window: 'am', presence: 'oui', access: '', petsNote: '', notes: 'Inspection des quatre immeubles avec le gestionnaire', bookedAt: '2024-10-09T09:00:00' },
      signature: { name: 'Philippe Gendron', mode: 'type', text: 'Philippe Gendron', signedAt: '2024-12-09T14:30:00', hash: 'E41D-7C08-2A9F' },
      countersigned: { name: 'Julien Paquette', signedAt: '2024-12-09T15:02:00' },
      onboarding: { tasks: { prefs: true, access: true, zones: true, irrigation: true, file: true, route: true }, prefs: { sms: false, email: true, tips: false }, startedAt: '2024-12-09T15:02:00' },
      term: {
        no: 'MBM-ENT-2024-118',
        baseline: { riv1: 54, riv2: 58, cours: 47, stl: 60 },
        health: { 2025: { riv1: 70, riv2: 74, cours: 62, stl: 75 }, 2026: { riv1: 84, riv2: 86, cours: 74, stl: 82 } },
        calls: { 2025: [11, 27], 2026: [6, 9] }, callsBy: { 2026: { riv1: 2, riv2: 1, cours: 2, stl: 1 } },
        notes: {
          riv1: L('Aucune punaise de lit depuis mars. Les stations côté conteneurs restent actives (deux captures en octobre).', 'No bed bugs since March. The stations by the dumpsters are still active (two catches in October).'),
          riv2: L('Meilleur indice du portefeuille. Des travaux d’égout commencent en avril sur le boulevard.', 'Best score in the portfolio. Sewer work starts on the boulevard in April.'),
          cours: L('Des blattes dans trois logements du 2e étage en septembre : l’indice plafonne à 74.', 'Cockroaches in three second-floor units in September: the score is stuck at 74.'),
          stl: L('Belle reprise. Des souris au sous-sol en octobre, côté stationnement : fissure colmatée.', 'Good recovery. Mice in the basement in October, by the parking: crack sealed.'),
        },
        options: [
          { id: 'op-blt', key: 'rampants', site: 'cours', by: 'slev', ev: 'coquerelles', on: true, goal: 'health',
            note: L('L’indice des Cours Taschereau plafonne à 74 : des blattes dans trois logements du 2e étage en septembre. Un traitement de tout l’étage, avec suivi à trois semaines, vise 80 d’ici octobre, l’engagement de l’an 3.', 'Les Cours Taschereau is stuck at 74: cockroaches in three second-floor units in September. Treating the whole floor, with a follow-up after three weeks, aims for 80 by October, the year-3 commitment.') },
          { id: 'op-sta', key: 'stations', site: 'riv2', trees: 6, by: 'slev', ev: null, on: true,
            note: L('Des travaux d’égout commencent en avril sur le boulevard Marie-Victorin (avis de la Ville) : les rats se déplacent pendant les chantiers. Six stations de plus autour du Riverain II, le temps des travaux.', 'Sewer work starts on boulevard Marie-Victorin in April (city notice): rats move around during construction. Six more stations around Le Riverain II, for the length of the work.') },
          { id: 'op-drn', key: 'drains', site: 'stl', by: 'jroy', ev: 'mouches', on: false,
            note: L('Des mouches à drain dans la salle de lavage commune : un traitement biologique des drains, sans pesticide.', 'Drain flies in the shared laundry room: a biological drain treatment, no pesticide.') },
        ],
      },
      activity: [
        { at: d(-2, 15, 30), fr: `Bilan de l’an 2 et budget ${SEASON} déposés par Julien au bureau de gestion`, en: `Year 2 review and ${SEASON} budget left by Julien at the management office` },
        { at: '2026-10-30T10:00:00', fr: 'Bilan annuel des quatre immeubles terminé (indice moyen 82)', en: 'Annual review of the four buildings done (average score 82)' },
        { at: '2026-10-08T09:15:00', fr: 'Dernière visite de prévention de l’année, rapport envoyé', en: 'Last prevention visit of the year, report sent' },
      ] }),
    termFile({ slug: 'domaines-du-lac', stage: 2, branch: 'laval', createdAt: d(-5, 11, 0), start: 2026, end: 2028,
      client: { first: 'Sylvie', last: 'Arsenault', name: 'Syndicat Les Domaines du Lac', org: true, title: { fr: 'Présidente du conseil d’administration', en: 'Board president' }, email: 'ca.domainesdulac@exemple.test', phone: '', address: '5100, boulevard Sainte-Rose', city: 'Laval' },
      sitesWord: { one: L('phase', 'phase'), many: L('phases', 'phases') },
      sites: [
        { id: 'ph1', name: L('Phase 1 · bord du lac', 'Phase 1 · lakeside'), address: '5100, boulevard Sainte-Rose', city: 'Laval', area: 21000, trees: 10, since: 2026, units: 72 },
        { id: 'ph2', name: L('Phase 2 · les terrasses', 'Phase 2 · the terraces'), address: '5150, boulevard Sainte-Rose', city: 'Laval', area: 14500, trees: 6, since: 2026, units: 54 },
      ],
      billing: { po: 'BC-DDL-2027-014', terms: 30, ap: 'gestion.domainesdulac@exemple.test', consolidated: true },
      account: { method: { kind: 'eft', label: 'TEF', last4: '1185' }, autopay: false },
      answers: seedAnswers({ name: 'Sylvie Arsenault', email: 'ca.domainesdulac@exemple.test', address: '5100, boulevard Sainte-Rose', city: 'Laval', type: 'condo', area: 35500, rating: 3, problems: ['crottes', 'nid_guepes'], kids: 'oui', pets: ['chien'], watering: 'brut', mowing: 'service', trees: 16, goals: ['prevenir', 'eco'], submittedAt: '2025-10-02T10:00:00' }),
      proposal: { version: '1.0', date: '2025-11-10', validUntil: '2025-12-10', addons: addons(['exclusion', 'bouclier']), promo: false, discountPct: 5, injectTrees: 4, acceptedAt: '2025-11-24T10:00:00' },
      signature: { name: 'Sylvie Arsenault', mode: 'type', text: 'Sylvie Arsenault', signedAt: '2025-12-01T19:30:00', hash: '5B21-9A0C-7E63' },
      countersigned: { name: 'Kevin Morin', signedAt: '2025-12-02T09:10:00' },
      onboarding: { tasks: { prefs: true, access: true, zones: true, file: true, route: true }, prefs: { sms: false, email: true, tips: true }, startedAt: '2025-12-02T09:10:00' },
      term: { no: 'MBM-ENT-2025-207', baseline: { ph1: 57, ph2: 52 }, health: { 2026: { ph1: 73, ph2: 69 } }, calls: { 2026: [3, 11] },
        notes: { ph1: L('Bord du lac : des mulots en octobre, côté talus. Deux stations ajoutées.', 'Lakeside: field mice in October, by the slope. Two stations added.'), ph2: L('Les terrasses : guêpes sous les balcons en août.', 'The terraces: wasps under the balconies in August.') },
        options: [{ id: 'op-ddl', key: 'guepes', site: 'ph2', by: 'jroy', ev: 'nid_guepes', on: true, note: L('Trois nids sous les balcons des terrasses en août : un retrait préventif dès le début de l’été.', 'Three nests under the terrace balconies in August: a preventive removal at the start of summer.') }] },
      activity: [{ at: d(-3, 9, 40), fr: 'Entente consultée par la présidente du CA', en: 'Agreement viewed by the board president' }, { at: d(-5, 11, 0), fr: 'Bilan de l’an 1 envoyé au conseil', en: 'Year 1 review sent to the board' }] }),
    termFile({ slug: 'parc-riviere', stage: 3, branch: 'quebec', createdAt: d(-6, 10, 30), start: 2026, end: 2029,
      client: { first: 'Robert', last: 'Lachance', name: 'Habitations du Parc de la Rivière', org: true, title: { fr: 'Gestionnaire immobilier', en: 'Property manager' }, email: 'r.lachance@parcriviere.exemple.test', phone: '418 555-0144', address: '2200, boulevard Louis-XIV', city: 'Québec' },
      sitesWord: { one: L('immeuble', 'building'), many: L('immeubles', 'buildings') },
      sites: [
        { id: 'pr1', name: L('Pavillon des Forges', 'Pavillon des Forges'), address: '2200, boulevard Louis-XIV', city: 'Québec', area: 13500, trees: 6, since: 2026, units: 64 },
        { id: 'pr2', name: L('Pavillon du Moulin', 'Pavillon du Moulin'), address: '2240, boulevard Louis-XIV', city: 'Québec', area: 11000, trees: 4, since: 2026, units: 52 },
        { id: 'pr3', name: L('Pavillon de la Berge', 'Pavillon de la Berge'), address: '80, rue de la Berge', city: 'Québec', area: 9000, trees: 8, since: 2026, units: 40 },
      ],
      billing: { po: 'BC-PDR-2027-022', terms: 30, ap: 'factures@parcriviere.exemple.test', consolidated: true },
      account: { method: { kind: 'eft', label: 'TEF', last4: '3051' }, autopay: false },
      answers: seedAnswers({ name: 'Robert Lachance', email: 'r.lachance@parcriviere.exemple.test', address: '2200, boulevard Louis-XIV', city: 'Québec', type: 'condo', area: 33500, rating: 3, problems: ['piqures', 'crottes'], kids: 'oui', pets: ['chien'], watering: 'brut', mowing: 'service', trees: 18, goals: ['prevenir', 'audit'], submittedAt: '2025-09-30T10:00:00' }),
      proposal: { version: '1.0', date: '2025-10-20', validUntil: '2025-11-20', addons: addons(['exclusion', 'punaises']), promo: false, discountPct: 6, injectTrees: 4, acceptedAt: '2025-11-03T10:00:00' },
      signature: { name: 'Robert Lachance', mode: 'type', text: 'Robert Lachance', signedAt: '2025-11-10T16:00:00', hash: '1D8E-6A2F-B490' },
      countersigned: { name: 'Catherine Lavoie', signedAt: '2025-11-10T16:20:00' },
      onboarding: { tasks: { prefs: true, access: true, zones: true, file: true, route: true }, prefs: { sms: false, email: true, tips: true }, startedAt: '2025-11-10T16:20:00' },
      term: { no: 'MBM-ENT-2025-164', baseline: { pr1: 55, pr2: 59, pr3: 50 }, health: { 2026: { pr1: 71, pr2: 74, pr3: 66 } }, calls: { 2026: [4, 12] }, meeting: { at: `${next(4)}T13:30:00`, mode: 'site', bookedAt: d(-1, 9, 0) },
        notes: { pr1: L('Plus aucune punaise de lit depuis le suivi de juin.', 'No more bed bugs since the June follow-up.'), pr2: L('Indice en avance sur la cible.', 'Score ahead of target.'), pr3: L('Près de la rivière : souris dans le vide sanitaire en octobre.', 'By the river: mice in the crawl space in October.') },
        options: [{ id: 'op-pdr', key: 'exclusion', site: 'pr3', by: 'slev', ev: 'crottes', on: true, note: L('Des souris dans le vide sanitaire du Pavillon de la Berge, près de la rivière : une exclusion complète au printemps.', 'Mice in the crawl space of Pavillon de la Berge, by the river: a full exclusion in spring.') }] },
      activity: [{ at: d(-1, 9, 0), fr: 'Rencontre budgétaire réservée par le gestionnaire', en: 'Budget meeting booked by the manager' }, { at: d(-2, 10, 15), fr: 'Bilan de l’an 1 consulté', en: 'Year 1 review viewed' }] }),
    termFile({ slug: 'carrefour-des-pins', stage: 4, branch: 'quebec', createdAt: d(-7, 14, 0), start: 2025, end: 2027,
      client: { first: 'Chantal', last: 'Michaud', name: 'Syndicat Le Carrefour des Pins', org: true, title: { fr: 'Trésorière du conseil d’administration', en: 'Board treasurer' }, email: 'ca.carrefourdespins@exemple.test', phone: '', address: '3400, boulevard Henri-Bourassa', city: 'Québec' },
      sitesWord: { one: L('immeuble', 'building'), many: L('immeubles', 'buildings') },
      sites: [
        { id: 'cp1', name: L('Tour des Pins', 'Tour des Pins'), address: '3400, boulevard Henri-Bourassa', city: 'Québec', area: 12500, trees: 7, since: 2025, units: 70 },
        { id: 'cp2', name: L('Tour des Cèdres', 'Tour des Cèdres'), address: '3450, boulevard Henri-Bourassa', city: 'Québec', area: 10500, trees: 5, since: 2025, units: 58 },
      ],
      billing: { po: 'BC-CDP-2027-007', terms: 30, ap: 'tresorerie.carrefourdespins@exemple.test', consolidated: true },
      account: { method: { kind: 'eft', label: 'TEF', last4: '9927' }, autopay: false },
      answers: seedAnswers({ name: 'Chantal Michaud', email: 'ca.carrefourdespins@exemple.test', address: '3400, boulevard Henri-Bourassa', city: 'Québec', type: 'condo', area: 23000, rating: 3, problems: ['crottes', 'ratons'], kids: 'non', pets: ['chien'], watering: 'brut', mowing: 'service', trees: 12, goals: ['prevenir', 'audit'], submittedAt: '2024-09-25T10:00:00' }),
      proposal: { version: '1.0', date: '2024-10-15', validUntil: '2024-11-15', addons: addons(['exclusion', 'bouclier']), promo: false, discountPct: 5, injectTrees: 4, acceptedAt: '2024-10-29T10:00:00' },
      signature: { name: 'Chantal Michaud', mode: 'type', text: 'Chantal Michaud', signedAt: '2024-11-05T19:00:00', hash: 'F2C0-3B19-77AE' },
      countersigned: { name: 'Catherine Lavoie', signedAt: '2024-11-06T08:45:00' },
      onboarding: { tasks: { prefs: true, access: true, zones: true, irrigation: true, file: true, route: true }, prefs: { sms: false, email: true, tips: false }, startedAt: '2024-11-06T08:45:00' },
      term: { no: 'MBM-ENT-2024-071', baseline: { cp1: 58, cp2: 61 }, health: { 2025: { cp1: 72, cp2: 75 }, 2026: { cp1: 81, cp2: 84 } }, calls: { 2025: [5, 21], 2026: [3, 8] },
        notes: { cp1: L('Plus aucune souris au garage depuis l’exclusion du printemps.', 'No more mice in the garage since the spring exclusion.'), cp2: L('Meilleur indice du syndicat.', 'Best score in the condo.') },
        options: [{ id: 'op-cdp', key: 'faune', site: 'cp1', by: 'jroy', ev: 'ratons', on: true, note: L('Un raton laveur sur le toit de la Tour des Pins en septembre : on ferme les accès du toit avant le printemps.', 'A raccoon on the roof of Tour des Pins in September: we close the roof access before spring.') }] },
      activity: [{ at: d(-1, 11, 5), fr: 'Budget 2027 accepté par la trésorière, avenant à signer', en: '2027 budget accepted by the treasurer, amendment to sign' }] }),
    termFile({ slug: 'cliniques-medicus', stage: 5, branch: 'rive-nord', createdAt: d(-9, 14, 0), start: 2025, end: 2027,
      client: { first: 'Nadine', last: 'Perron', name: 'Cliniques Médicus inc.', org: true, title: { fr: 'Directrice administrative', en: 'Administrative director' }, email: 'n.perron@medicus.exemple.test', phone: '450 555-0152', address: '600, boulevard Iberville', city: 'Repentigny' },
      sitesWord: { one: L('clinique', 'clinic'), many: L('cliniques', 'clinics'), fem: true },
      sites: [
        { id: 'rep', name: L('Clinique de Repentigny', 'Repentigny clinic'), address: '600, boulevard Iberville', city: 'Repentigny', area: 9200, trees: 4, since: 2025 },
        { id: 'ter', name: L('Clinique de Terrebonne', 'Terrebonne clinic'), address: '1250, boulevard Moody', city: 'Terrebonne', area: 7600, trees: 3, since: 2025 },
        { id: 'mas', name: L('Clinique de Mascouche', 'Mascouche clinic'), address: '2900, chemin Sainte-Marie', city: 'Mascouche', area: 6100, trees: 2, since: 2025 },
      ],
      billing: { po: 'BC-MED-2027-031', terms: 45, ap: 'comptabilite@medicus.exemple.test', consolidated: true },
      account: { method: { kind: 'eft', label: 'TEF', last4: '4472' }, autopay: false },
      answers: seedAnswers({ name: 'Nadine Perron', email: 'n.perron@medicus.exemple.test', address: '600, boulevard Iberville', city: 'Repentigny', type: 'commerce', area: 22900, rating: 3, problems: ['crottes'], kids: 'non', pets: ['aucun'], watering: 'brut', mowing: 'service', trees: 9, pests: ['guepes'], goals: ['prevenir', 'discret', 'audit'], submittedAt: '2024-09-20T10:00:00' }),
      proposal: { version: '1.0', date: '2024-10-28', validUntil: '2024-11-28', addons: addons(['bouclier', 'rampants']), promo: false, discountPct: 4, injectTrees: 4, acceptedAt: '2024-11-12T10:00:00' },
      signature: { name: 'Nadine Perron', mode: 'type', text: 'Nadine Perron', signedAt: '2024-11-19T13:00:00', hash: '93AF-2D61-08C7' },
      countersigned: { name: 'Maxime Fortin', signedAt: '2024-11-19T13:25:00' },
      onboarding: { tasks: { prefs: true, access: true, zones: true, irrigation: true, file: true, route: true }, prefs: { sms: false, email: true, tips: false }, startedAt: '2024-11-19T13:25:00' },
      term: { no: 'MBM-ENT-2024-093', baseline: { rep: 56, ter: 60, mas: 58 }, health: { 2025: { rep: 69, ter: 72, mas: 70 }, 2026: { rep: 81, ter: 83, mas: 79 } }, calls: { 2025: [4, 18], 2026: [2, 7] },
        notes: { rep: L('Aucune activité dans les salles de soins de toute l’année.', 'No activity in the treatment rooms all year.'), ter: L('Meilleur indice des trois cliniques.', 'Best score of the three clinics.'), mas: L('Un rat aperçu près du conteneur en septembre.', 'A rat seen near the dumpster in September.') },
        options: [{ id: 'op-med', key: 'stations', site: 'mas', trees: 2, by: 'jroy', ev: 'rats', on: true, note: L('Un rat aperçu près du conteneur de Mascouche en septembre : deux stations de plus, côté stationnement.', 'A rat seen near the Mascouche dumpster in September: two more stations, by the parking lot.') }] },
      activity: [{ at: d(-1, 15, 20), fr: `Budget ${SEASON} approuvé en ligne (dernière année de l’entente)`, en: `${SEASON} budget approved online (last year of the agreement)` }] }),
  ];
}

/* CRM records for the new journeys (what MBM's CRM would already know) */
function seedFlowCrm(today) {
  const d = (n, h = 10, m = 0) => { const x = addDays(today, n); x.setHours(h, m, 0, 0); return isoLocal(x); };
  const ev = (n, h, kind, fr, en) => ({ at: d(n, h), kind, fr, en });
  return {
    bergeron: { since: 2021, seasons: 6, ltv: 4180, score: { renew: 86, upsell: 62, churn: 11 },
      best: { fr: 'Courriel, en soirée', en: 'Email, in the evening' },
      events: [ev(-3, 16, 'visit', 'Avis de fin d’année laissé à la porte par Audrey', 'Year-end notice left at the door by Audrey'), ev(-48, 11, 'visit', 'Visite 4 faite : sortie de sécheuse colmatée, sciure sous la galerie', 'Visit 4 done: dryer vent sealed, sawdust under the porch'), ev(-148, 15, 'ticket', 'Appel de service réglé en 20 h : fourmis près de la porte-patio', 'Service call solved within 20 h: ants by the patio door')],
      insight: { fr: 'Cliente depuis 2021, aucune souris depuis l’exclusion. Sensible au prix : le prix fidélité avant le 15 décembre est l’argument.', en: 'Client since 2021, no mice since the exclusion. Price-sensitive: the loyalty price before December 15 is the argument.' },
      nba: { kind: 'followup', prio: 2, fr: 'Bilan pas encore ouvert : texto jeudi soir avec le lien, rappeler la date limite du prix fidélité.', en: 'Review not opened yet: text Thursday evening with the link, recall the loyalty price deadline.' } },
    riverain: { since: 2025, seasons: 2, ltv: 41600, score: { renew: 91, upsell: 74, churn: 6 },
      best: { fr: 'Courriel, mardi matin', en: 'Email, Tuesday morning' },
      events: [ev(-4, 9, 'email', 'Le conseil se réunit le 2 décembre : budget 2027 à l’ordre du jour', 'The board meets on December 2: 2027 budget on the agenda'), ev(-21, 14, 'note', 'Travaux d’égout sur Marie-Victorin à partir d’avril (avis de la Ville)', 'Sewer work on Marie-Victorin from April (city notice)'), ev(-60, 10, 'ticket', 'Appel de service réglé en 6 h : punaises de lit, logement 412 du Riverain I', 'Service call solved within 6 h: bed bugs, unit 412 at Le Riverain I')],
      insight: { fr: 'Le conseil vote le budget le 2 décembre : une approbation en ligne avant cette date évite d’attendre la séance de mars.', en: 'The board votes on the budget on December 2: an online approval before then avoids waiting for the March meeting.' },
      nba: { kind: 'task', prio: 1, fr: 'Envoyer le rapport annuel PDF avant le conseil du 2 décembre et proposer la rencontre budgétaire.', en: 'Send the annual report PDF before the December 2 board meeting and offer the budget meeting.' } },
  };
}
