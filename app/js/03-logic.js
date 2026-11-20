/* ============ Answers, recommendations, pricing ============ */
const filled = (v) => v != null && String(v).trim() !== '';
const arr = (v) => Array.isArray(v) && v.length > 0;
const A = (p) => p.answers || (p.answers = {});
const isOrg = (p) => !!(p.client && p.client.org) || p.segment === 'commercial';
function householdOf(p) {
  if (isOrg(p)) return p.client.name;
  const last = p.client.last || p.client.name;
  return t(`Famille ${last}`, `The ${last} family`);
}
function propTypeOf(p) { return A(p).type || (p.segment === 'commercial' ? 'commerce' : 'maison'); }
function areaOf(p) { if (isCorp(p)) return sitesOf(p).reduce((s, x) => s + (Number(x.area) || 0), 0); const v = Number(A(p).area); return v > 0 ? clamp(v, 300, 250000) : (p.segment === 'commercial' ? 8000 : 1800); }
/* Trees or hedges that touch the house (a bridge for carpenter ants and squirrels) */
function treesOf(p) { return clamp(Number(A(p).trees) || 0, 0, 40); }
const hasProb = (p, k) => (A(p).problems || []).includes(k);

const QSECTIONS = [
  { id: 'prop', fr: 'Vous et votre propriété', en: 'You and your property', done: (a) => filled(a.name) && filled(a.email) && filled(a.address) && filled(a.type) && Number(a.area) > 0 },
  { id: 'lawn', fr: 'La situation aujourd’hui', en: 'The situation today', done: (a) => Number(a.rating) > 0 && (arr(a.problems) || a.noProblem === true) },
  { id: 'life', fr: 'Occupants et bâtiment', en: 'Occupants and building', done: (a) => filled(a.kids) && arr(a.pets) && filled(a.watering) },
  { id: 'around', fr: 'Autour du bâtiment', en: 'Around the building', done: (a) => a.trees != null && arr(a.pests) },
  { id: 'goals', fr: 'Ce qui compte pour vous', en: 'What matters to you', done: (a) => arr(a.goals) },
];
function qProgress(p) {
  const a = A(p);
  const done = QSECTIONS.filter((s) => s.done(a)).length;
  return { done, total: QSECTIONS.length, pct: Math.round((done / QSECTIONS.length) * 100) };
}

/* Treatments for what the client sees are switched on by default; prevention and cross-sell suggestions wait for the client's choice */
const PRESELECT_WHEN = { exclusion: () => true, stations: () => true, faune: () => true, punaises: () => true, rampants: () => true, odeurs: () => true, guepes: () => true, charpentieres: (p) => hasProb(p, 'sciure'), drains: (p) => hasProb(p, 'mouches'), bouclier: () => false };
function recommendations(p) {
  const a = A(p), out = [];
  const add = (key, priority, fr, en) => { if (!out.some((x) => x.key === key)) out.push({ key, priority, preselect: !!(PRESELECT_WHEN[key] && PRESELECT_WHEN[key](p)), reason: { fr, en } }); };
  const drop = hasProb(p, 'crottes'), scratch = hasProb(p, 'grattements'), rat = hasProb(p, 'rats');
  if (drop && scratch) add('exclusion', 'high', 'Des crottes et des grattements la nuit : les deux signes classiques de souris installées dans les murs.', 'Droppings and scratching at night: the two classic signs of mice living in the walls.');
  else if (drop) add('exclusion', 'high', 'Des crottes le long des plinthes trahissent le passage des souris : on bloque leurs accès.', 'Droppings along the baseboards give away the mice’s path: we block their way in.');
  else if (scratch) add('exclusion', 'high', 'Des grattements la nuit viennent souvent de souris dans les murs ou l’entretoit.', 'Scratching at night often comes from mice in the walls or the attic.');
  if (rat) add('stations', 'high', 'Un gros rongeur près des poubelles ou du garage : des stations verrouillées l’arrêtent avant qu’il entre.', 'A large rodent near the bins or the garage: locked stations stop it before it gets in.');
  else if (drop) add('stations', 'normal', a.kids === 'oui' || (a.pets || []).includes('chien') ? 'Des stations à l’extérieur interceptent les souris avant qu’elles reviennent. Verrouillées : enfants et chien n’y ont pas accès.' : 'Des stations à l’extérieur interceptent les souris avant qu’elles reviennent.', 'Outdoor stations catch mice before they come back. Locked: kids and pets can’t reach them.');
  if (rat) add('exclusion', 'high', 'Un rat passe par une ouverture de 12 mm : on colmate le garage et la fondation.', 'A rat fits through a 12 mm gap: we seal the garage and the foundation.');
  if (hasProb(p, 'ratons')) add('faune', 'high', 'Un animal dans l’entretoit : on le fait sortir sans le blesser, puis on ferme l’accès.', 'An animal in the attic: we let it out unharmed, then close the way in.');
  if (hasProb(p, 'piqures')) add('punaises', 'high', 'Des piqûres en ligne au réveil pointent souvent vers des punaises de lit : mieux vaut agir vite.', 'Bites in a line on waking often point to bed bugs: it pays to act fast.');
  if (hasProb(p, 'coquerelles')) add('rampants', 'high', 'Des insectes bruns qui fuient la lumière la nuit : des blattes, à traiter avant qu’elles se multiplient.', 'Brown insects that run from the light at night: cockroaches, to treat before they multiply.');
  else if (hasProb(p, 'fourmis_int')) add('rampants', 'normal', 'Des colonnes de petites fourmis près de l’évier : les appâts les éliminent jusqu’à la colonie.', 'Trails of small ants near the sink: baits take them out all the way to the colony.');
  else if (hasProb(p, 'gardemanger')) add('rampants', 'normal', 'Des papillons dans la farine : on trouve la source au garde-manger et on pose des pièges.', 'Moths in the flour: we find the source in the pantry and set traps.');
  if (hasProb(p, 'sciure')) add('charpentieres', 'high', 'De grosses fourmis noires et de la sciure : des fourmis charpentières creusent probablement une boiserie humide.', 'Large black ants and sawdust: carpenter ants are probably tunnelling through damp woodwork.');
  else if (a.treeSick || treesOf(p) > 0) { const bf = isOrg(p) ? 'le bâtiment' : 'la maison', be = isOrg(p) ? 'the building' : 'the house'; add('charpentieres', 'normal', a.treeSick ? `Du bois, des palettes ou des souches contre ${bf} attirent les fourmis charpentières au printemps.` : `Des branches touchent ${bf} : un pont pour les fourmis charpentières au printemps.`, a.treeSick ? `Wood, pallets or stumps against ${be} draw carpenter ants in spring.` : `Branches touch ${be}: a bridge for carpenter ants in spring.`); }
  if (hasProb(p, 'mouches')) add('drains', 'normal', 'Des petites mouches près des drains pondent dans la matière accumulée : un traitement biologique règle la source.', 'Small flies near the drains breed in the build-up: a biological treatment fixes the source.');
  else if ((a.goals || []).includes('eco')) add('drains', 'normal', 'Vous visez l’approche la plus écologique : ce traitement sans pesticide garde les drains de la cuisine propres.', 'You want the greenest approach: this pesticide-free treatment keeps the kitchen drains clean.');
  if (hasProb(p, 'odeur')) add('odeurs', 'normal', 'Une odeur qui persiste vient souvent d’un animal mort ou d’urine : on trouve la source avant de neutraliser.', 'A smell that lingers often comes from a dead animal or urine: we find the source before neutralizing it.');
  if (hasProb(p, 'nid_guepes')) add('guepes', 'normal', 'Un nid près d’une porte : on le retire en soirée, et on revient sans frais si un autre se forme cet été.', 'A nest near a door: we remove it in the evening, and come back at no charge if another forms this summer.');
  const pests = (a.pests || []).filter((k) => PEST[k]);
  if (pests.length) add('bouclier', 'normal', `${cap1(listJoin(pests.map((k) => PEST[k].fr.toLowerCase())))} autour de la maison chaque été : le bouclier extérieur protège la fondation en trois passages.`, `${cap1(listJoin(pests.map((k) => PEST[k].en.toLowerCase())))} around the house every summer: the exterior shield protects the foundation in three visits.`);
  return out;
}
function isSelected(p, key) {
  const s = (p.proposal && p.proposal.addons) || {};
  if (Object.prototype.hasOwnProperty.call(s, key)) return !!s[key];
  return recommendations(p).some((r) => r.key === key && r.preselect);
}
/* Number of bait stations (stored as proposal.injectTrees) */
const stationsOf = (p) => Math.max(1, Number(p.proposal && p.proposal.injectTrees) || 1);
const siteBase = (area) => Math.round(299 + 0.09 * Math.max(0, (Number(area) || 0) - 1000));
function basePrice(p) { if (isCorp(p)) return sitesOf(p).reduce((s, x) => s + siteBase(x.area), 0); return siteBase(areaOf(p)); }
/* Corporate programs are priced site by site; bait stations are billed with the main site */
function addonForSite(p, a, site, i) {
  if (a.price.perUnit) return i === 0 ? a.price.perUnit * stationsOf(p) : 0;
  return Math.round((a.price.fixed || 0) + (a.price.perSqft || 0) * (Number(site.area) || 0));
}
function siteQuote(p) { return sitesOf(p).map((s, i) => { const base = siteBase(s.area), adds = ADDONS.filter((a) => isSelected(p, a.key)).reduce((t, a) => t + addonForSite(p, a, s, i), 0); return { ...s, base, adds, total: base + adds }; }); }
function addonAmount(p, a) {
  if (isCorp(p)) return sitesOf(p).reduce((s, x, i) => s + addonForSite(p, a, x, i), 0);
  if (a.price.perUnit) return a.price.perUnit * stationsOf(p);
  return Math.round((a.price.fixed || 0) + (a.price.perSqft || 0) * areaOf(p));
}
function quote(p) {
  const lines = [{ key: 'base', label: tx(BASE.name), amount: basePrice(p), kind: 'base' }];
  ADDONS.forEach((a) => { if (isSelected(p, a.key)) lines.push({ key: a.key, label: tx(a.name), amount: addonAmount(p, a), kind: a.division === 'vext' ? 'vext' : 'addon' }); });
  const season = lines.reduce((s, l) => s + l.amount, 0);
  const discPct = clamp(Number(p.proposal.discountPct) || 0, 0, 30);
  const discount = round2((season * discPct) / 100);
  const promo = p.proposal.promo !== false ? PROMO_PRICE : 0;
  const sub = round2(season - discount + promo);
  const tps = round2(sub * TPS), tvq = round2(sub * TVQ);
  return { lines, season, discPct, discount, promo, sub, tps, tvq, total: round2(sub + tps + tvq), monthly: round2((season - discount) / 12) };
}

/* ============ Protection index (illustrative indicator: 100 is a home with no activity) ============ */
function healthNow(p) {
  const a = A(p);
  let s = 30 + clamp(Number(a.rating) || 3, 1, 5) * 11;
  (a.problems || []).forEach((k) => { if (PROB[k]) s -= PROB[k].sev * 3; });
  return clamp(Math.round(s), 20, 90);
}
function healthAfter(p) {
  const now = healthNow(p);
  let s = now + 36;
  recommendations(p).forEach((r) => {
    if (r.key === 'bouclier') return;
    if (isSelected(p, r.key)) s += 3;
    else if (r.preselect) s -= r.priority === 'high' ? 16 : 7;
  });
  return clamp(Math.round(s), Math.min(now + 6, 96), 96);
}
function healthLabel(v) {
  if (v >= 80) return t('Bien protégée', 'Well protected');
  if (v >= 65) return t('Sous contrôle', 'Under control');
  if (v >= 50) return t('À surveiller', 'Keep an eye on it');
  if (v >= 33) return t('Activité présente', 'Activity present');
  return t('Infestation active', 'Active infestation');
}
function lerpColor(a, b, k) {
  const pa = a.match(/\w\w/g).map((x) => parseInt(x, 16)), pb = b.match(/\w\w/g).map((x) => parseInt(x, 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, '0')).join('');
}
/* Activity colour: red when pests are active, amber when it is calming down, green (MBM leaf) when protected */
function lawnColor(score) {
  const k = clamp((score - 14) / (96 - 14), 0, 1);
  return k < .5 ? lerpColor('C9533C', 'E2A33A', k * 2) : lerpColor('E2A33A', '2FA35A', (k - .5) * 2);
}
function healthColor(score) { return score >= 65 ? 'var(--leaf)' : score >= 42 ? 'var(--sun)' : 'var(--warm)'; }

/* ============ Codes & links ============ */
const CODE_WORDS = ['Vigie', 'Bouclier', 'Rempart', 'Abri', 'Phare', 'Sentinelle', 'Refuge', 'Cedre', 'Rosee', 'Quietude', 'Escale', 'Clarte'];
function makeCode(p, salt) {
  const h = hashStr(String(salt == null ? '' : salt) + p.slug);
  const n = slugify(p.client.last || p.client.name || p.slug).split('-')[0] || 'mbm';
  return `${CODE_WORDS[h % CODE_WORDS.length]}-${n.charAt(0).toUpperCase()}${n.slice(1)}-${10 + (h % 89)}`;
}
const normCode = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\s_]+/g, '-').toLowerCase().trim();
function portalLink(p) {
  /* Site en ligne : adresse courte, la page 404 la renvoie vers /#slug */
  if (window.VD_SITE && typeof window.VD_SITE.link === 'function') return window.VD_SITE.link(p.slug);
  let base = '';
  try { base = location.href.split('#')[0]; } catch (e) { /* ignore */ }
  return `${base}#${p.slug}`;
}
function lotNumber(p) { const h = hashStr(p.slug + 'lot'); const n = 1000000 + (h % 5900000); return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
function docId(p) { return `MBM-${SEASON}-${(p.branch || 'mbm').slice(0, 3).toUpperCase()}-${String(hashStr(p.slug) % 9000 + 1000)}`; }

/* ============ Steps ============ */
const OB_TASKS = [
  { id: 'prefs', owner: 'you', fr: 'Choisir vos avis de visite', en: 'Choose your visit notices', sub: { fr: 'Texto la veille, rapport avec photos par courriel', en: 'Text the day before, photo report by email' }, corp: { fr: 'Choisir qui reçoit les avis de visite', en: 'Choose who gets the visit notices' }, corpSub: { fr: 'Réception, sécurité, responsable qualité', en: 'Front desk, security, quality lead' }, termSub: { fr: 'Gestionnaire, concierges, conseil d’administration', en: 'Manager, janitors, board' } },
  { id: 'access', owner: 'you', fr: 'Indiquer l’accès à la maison', en: 'Tell us how to get in', org: { fr: 'Indiquer l’accès au bâtiment', en: 'Tell us how to get in' }, sub: { fr: 'Porte, clé, code, garage', en: 'Door, key, code, garage' }, corp: { fr: 'Confirmer l’accès à chaque site', en: 'Confirm access to each site' }, corpSub: { fr: 'Badges, quais, heures permises', en: 'Badges, docks, allowed hours' }, term: { fr: 'Confirmer l’accès à chaque immeuble', en: 'Confirm access to each building' }, termSub: { fr: 'Clés, codes de porte, logements à visiter', en: 'Keys, door codes, units to visit' } },
  { id: 'zones', owner: 'you', fr: 'Préparer les pièces à traiter', en: 'Get the rooms ready', sub: { fr: 'Dégager les plinthes et le dessous des éviers', en: 'Clear the baseboards and under the sinks' }, corp: { fr: 'Signaler les zones sensibles', en: 'Flag sensitive areas' }, corpSub: { fr: 'Lignes de production, aires alimentaires, prises d’air', en: 'Production lines, food areas, air intakes' }, termSub: { fr: 'Garderie, salle communautaire, conteneurs', en: 'Daycare, community room, dumpsters' } },
  { id: 'irrigation', owner: 'you', fr: 'Photographier les signes d’ici la visite', en: 'Photograph the signs before the visit', sub: { fr: 'Crottes, insectes, dommages : une photo suffit', en: 'Droppings, insects, damage: one photo will do' }, corp: { fr: 'Partager les plans des bâtiments', en: 'Share the building plans' }, corpSub: { fr: 'Un plan par site, pour placer les stations', en: 'One plan per site, to place the stations' }, termSub: { fr: 'Un plan par immeuble, pour placer les stations', en: 'One plan per building, to place the stations' } },
  { id: 'file', owner: 'vd', fr: 'Préparer la fiche d’intervention du technicien', en: 'Prepare the technician’s job sheet', sub: { fr: 'Plan, nuisibles notés, consignes de sécurité', en: 'Plan, noted pests, safety instructions' } },
  { id: 'route', owner: 'vd', fr: 'Ajouter votre adresse à la tournée de prévention', en: 'Add your address to the prevention route', sub: { fr: 'Les visites sont regroupées par secteur', en: 'Visits are grouped by area' }, corp: { fr: 'Inscrire les sites aux tournées', en: 'Add the sites to the routes' }, corpSub: { fr: 'Visites avant 6 h ou le dimanche', en: 'Visits before 6 AM or on Sundays' }, term: { fr: 'Inscrire les immeubles aux tournées', en: 'Add the buildings to the routes' }, termSub: { fr: 'Visites en semaine, avis aux résidents la veille', en: 'Weekday visits, residents notified the day before' } },
  { id: 'fall', owner: 'both', fr: `Intervention initiale à ${'49,99 $'}`, en: 'First treatment at $49.99', sub: { fr: 'Dans les 48 heures qui suivent la signature', en: 'Within 48 hours of signing' }, onlyIf: (p) => p.proposal.promo !== false },
  { id: 'first', owner: 'vd', fr: 'Première visite de prévention', en: 'First prevention visit', sub: { fr: 'Semaine du 19 avril 2027', en: 'Week of April 19, 2027' } },
];
const obTasks = (p) => OB_TASKS.filter((x) => !x.onlyIf || x.onlyIf(p));
const taskLabel = (p, x) => tx(isTerm(p) && x.term ? x.term : isCorp(p) && x.corp ? x.corp : isOrg(p) && x.org ? x.org : x);
const taskSub = (p, x) => (isTerm(p) && x.termSub ? tx(x.termSub) : isCorp(p) && x.corpSub ? tx(x.corpSub) : x.sub ? tx(x.sub) : '');
function obProgress(p) {
  const list = obTasks(p), tk = (p.onboarding && p.onboarding.tasks) || {};
  return Math.round((list.filter((x) => tk[x.id]).length / list.length) * 100);
}
function isStepDone(p, n) {
  if (isRenewal(p)) return renewStepDone(p, n);
  if (isTerm(p)) return termStepDone(p, n);
  if (n === 1) return !!A(p).submittedAt;
  if (n === 2) return !!p.proposal.acceptedAt || p.stage > 2;
  if (n === 3) return !!p.visit;
  if (n === 4) return !!p.signature;
  if (n === 5) return obProgress(p) >= 100;
  return false;
}
function stepDate(p, n) {
  if (isRenewal(p)) return renewStepDate(p, n);
  if (isTerm(p)) return termStepDate(p, n);
  return { 1: A(p).submittedAt, 2: p.proposal.acceptedAt, 3: p.visit && p.visit.bookedAt, 4: p.signature && p.signature.signedAt, 5: null }[n] || null;
}
function stepState(p, n) {
  if (n > p.stage) return 'locked';
  if (isStepDone(p, n)) return 'done';
  return n === p.stage ? 'current' : 'open';
}
function stepLabel(n, p) { const s = (p ? stepsOf(p) : STEPS)[n - 1]; return s ? tx(s) : ''; }

/* ============ Visits ============ */
const WINDOWS = [{ k: 'am', from: 8, to: 12, fr: 'Avant-midi', en: 'Morning' }, { k: 'pm', from: 12, to: 16, fr: 'Après-midi', en: 'Afternoon' }];
const VIDEO_SLOTS = ['09:00', '12:15', '16:30', '18:30', '19:15'];
function dayOffset(iso) { return daysUntil(iso); }
function windowsFor(iso) {
  const d = parseDay(iso), diff = dayOffset(iso);
  if (!d || diff < 1 || diff > 45 || d.getDay() === 0) return [];
  return WINDOWS.filter((w) => !(d.getDay() === 6 && w.k === 'pm')).map((w) => ({ ...w, off: hashStr(iso + w.k) % 4 === 0 }));
}
function videoFor(iso) {
  const d = parseDay(iso), diff = dayOffset(iso);
  if (!d || diff < 1 || diff > 45 || d.getDay() === 0 || d.getDay() === 6) return [];
  return VIDEO_SLOTS.map((s) => ({ t: s, off: hashStr(iso + s) % 5 === 0 }));
}
function visitStart(v) {
  if (!v) return null;
  if (v.mode === 'video') return parseDay(`${v.date}T${v.time || '18:30'}:00`);
  const w = WINDOWS.find((x) => x.k === v.window) || WINDOWS[0];
  return parseDay(`${v.date}T${pad2(w.from)}:00:00`);
}
function visitEnd(v) {
  const s = visitStart(v); if (!s) return null;
  const e = new Date(s);
  if (v.mode === 'video') e.setMinutes(e.getMinutes() + 15); else e.setHours((WINDOWS.find((x) => x.k === v.window) || WINDOWS[0]).to);
  return e;
}
function visitWhen(v) {
  if (!v) return '';
  if (v.mode === 'video') { const s = visitStart(v); return `${fmtDateLong(v.date)}, ${fmtHour(s.getHours(), s.getMinutes())}`; }
  const w = WINDOWS.find((x) => x.k === v.window) || WINDOWS[0];
  return `${fmtDateLong(v.date)}, ${tx(w).toLowerCase()} (${fmtHour(w.from)} – ${fmtHour(w.to)})`;
}
function icsStamp(d) { return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}00Z`; }
function icsFor(p) {
  const v = p.visit, s = visitStart(v), e = visitEnd(v), rep = p.rep || repFor(p.branch);
  const escI = (x) => String(x).replace(/[\\;,]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
  const title = v.mode === 'video' ? t('Appel vidéo MBM (15 min)', 'MBM video call (15 min)') : t('Inspection MBM Gestion parasitaire', 'MBM pest management inspection');
  const desc = `${t('Avec', 'With')} ${rep.name}, MBM Gestion parasitaire (${branchName(p.branch)}). ${v.mode === 'video' ? t('Le lien vous est envoyé par courriel.', 'The link is sent by email.') : t('Fenêtre d’arrivée : ', 'Arrival window: ') + visitWhen(v)}`;
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Winnia//MBM Desk//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:${p.slug}-${s.getTime()}@mbm-desk.demo`, `DTSTAMP:${icsStamp(new Date())}`, `DTSTART:${icsStamp(s)}`, `DTEND:${icsStamp(e)}`,
    `SUMMARY:${escI(title)}`, `DESCRIPTION:${escI(desc)}`, `LOCATION:${escI(v.mode === 'video' ? 'Video' : `${p.client.address}, ${p.client.city}`)}`,
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}

/* ============ Plan timeline (November 2026 to October 2027) ============ */
function seasonRows(p) {
  const P = PASSAGES;
  const rows = [];
  if (p.proposal && p.proposal.promo !== false && !isRenewal(p) && !isTerm(p)) rows.push({ label: t('Intervention initiale, cet automne', 'First treatment, this fall'), kind: 'addon', marks: [{ a: 11.55, b: 12.1 }] });
  rows.push(
    { label: t('Inspection et rapport avec photos', 'Inspection and photo report'), kind: 'base', marks: P.map((x) => ({ a: x.a, b: x.b })) },
    { label: t('Prévention extérieure : fondation et accès', 'Outside prevention: foundation and entry points'), kind: 'base', marks: P.map((x) => ({ a: x.a, b: x.b })) },
    { label: t('Suivi des rongeurs', 'Rodent monitoring'), kind: 'base', marks: [P[0], P[3]].map((x) => ({ a: x.a, b: x.b })) },
    { label: t('Insectes, au besoin', 'Insects, as needed'), kind: 'need', marks: [P[1], P[2]].map((x) => ({ a: x.a, b: x.b })) },
    { label: t('Appels de service 24/7', '24/7 service calls'), kind: 'need', marks: [{ a: 11.0, b: 10.98 }] },
  );
  ADDONS.forEach((a) => { if (isSelected(p, a.key)) rows.push({ label: tx(a.name), kind: a.division === 'vext' ? 'vext' : 'addon', marks: a.when.map(([x, y]) => ({ a: x, b: y })) }); });
  (p.offers || []).filter((o) => o.status === 'accepted' && ADD[o.key]).forEach((o) => rows.push({ label: `${offerTitle(o)} · ${t('ajout', 'add-on')}`, kind: 'offer', marks: ADD[o.key].when.slice(0, 1).map(([x, y]) => ({ a: x, b: y })) }));
  return rows;
}

/* ============ Agreement text ============ */
function contractSections(p) {
  const q = quote(p), rep = p.rep || repFor(p.branch), office = officeOf(p.branch);
  const who = isOrg(p) ? `${p.client.name}${p.client.first ? `, ${t('représenté par', 'represented by')} ${p.client.first} ${p.client.last}` : ''}` : p.client.name;
  const addons = q.lines.filter((l) => l.kind !== 'base').map((l) => l.label);
  const v = p.visit, corp = isCorp(p), bl = p.billing || {}, ren = isRenewal(p);
  const siteList = corp ? sitesOf(p).map((s) => `${tx(s.name)} (${s.address}, ${s.city}, ${fmtArea(s.area)})`) : [];
  const moved = ren && Math.abs(areaOf(p) - prevSeason(p).area) >= 50;
  const officeFr = office.charAt(0).toLowerCase() + office.slice(1);
  const parties = ren
    ? t(`La présente entente renouvelle, pour l’année ${SEASON}, le programme de gestion parasitaire conclu entre MBM Gestion parasitaire, ${officeFr} (« MBM »), et ${who} (le « client »), client depuis ${p.since}, pour la propriété située au ${p.client.address}, ${p.client.city}.`, `This agreement renews, for ${SEASON}, the pest management program between MBM Gestion parasitaire, ${office} ("MBM"), and ${who} (the "client"), a client since ${p.since}, for the property at ${p.client.address}, ${p.client.city}.`)
    : t(`La présente entente est conclue entre MBM Gestion parasitaire, ${officeFr} (« MBM »), et ${who} (le « client »), pour la propriété située au ${p.client.address}, ${p.client.city}.`, `This agreement is made between MBM Gestion parasitaire, ${office} ("MBM"), and ${who} (the "client"), for the property at ${p.client.address}, ${p.client.city}.`);
  const areaTxt = ren
    ? t(`Le prix est établi pour un bâtiment d’environ ${fmtArea(areaOf(p))}, ${moved ? 'selon les changements déclarés par le client' : `mesuré pendant l’année ${PREV}`}. Si la mesure prise à la première visite diffère de plus de 10 %, MBM écrit au client avant d’ajuster le prix.`, `The price is set for a building of about ${fmtArea(areaOf(p))}, ${moved ? 'based on the changes the client reported' : `measured during ${PREV}`}. If the measurement taken at the first visit differs by more than 10%, MBM writes to the client before adjusting the price.`)
    : t(`Le prix est établi pour un bâtiment d’environ ${fmtArea(areaOf(p))}. ${v && v.mode === 'terrain' ? 'La superficie et les points d’entrée ont été validés à l’inspection.' : 'Si la mesure prise à la première visite diffère de plus de 10 %, MBM vous écrit avant d’ajuster le prix.'}`, `The price is set for a building of about ${fmtArea(areaOf(p))}. ${v && v.mode === 'terrain' ? 'The area and entry points were confirmed at the inspection.' : 'If the measurement taken at the first visit differs by more than 10%, MBM writes to you before adjusting the price.'}`);
  const renewTxt = ren
    ? t(`Le programme couvre l’année ${SEASON}, la ${ordinal(seasonNo(p), true)} du client chez MBM. Le prix fidélité de ${q.discPct} % s’applique au renouvellement signé d’ici le ${fmtDate(renewDeadline(p), { day: 'numeric', month: 'long', year: 'numeric' })}. MBM écrit au client au moins 30 jours avant l’année suivante; le programme se poursuit seulement avec sa confirmation.`, `The program covers ${SEASON}, the client’s ${ordinal(seasonNo(p))} year with MBM. The ${q.discPct}% loyalty price applies to a renewal signed by ${fmtDate(renewDeadline(p), { month: 'long', day: 'numeric', year: 'numeric' })}. MBM writes to the client at least 30 days before the following year; the program continues only with the client’s confirmation.`)
    : t(`Le programme couvre l’année ${SEASON}. MBM écrit au client au moins 30 jours avant l’année suivante; le programme se poursuit seulement avec la confirmation du client.`, `The program covers ${SEASON}. MBM writes to the client at least 30 days before the following year; the program continues only with the client’s confirmation.`);
  const sec = [
    { title: t('Parties', 'Parties'), paras: [parties] },
    { title: t('Services', 'Services'), paras: [t(`MBM fournit le ${tx(BASE.name)} : quatre visites de prévention avec inspection intérieure et extérieure, l’identification des nuisibles et un rapport avec photos après chaque visite, des traitements ciblés au besoin selon la gestion parasitaire intégrée, un appel de satisfaction dans la semaine qui suit chaque intervention et les appels de service sans frais entre les visites.`, `MBM provides the ${tx(BASE.name)}: four prevention visits with an inside and outside inspection, pest identification and a photo report after every visit, targeted treatments as needed under integrated pest management, a satisfaction call within the week after each treatment and free service calls between visits.`)].concat(addons.length ? [t(`S’ajoutent : ${listJoin(addons)}.`, `Added: ${listJoin(addons)}.`)] : []) },
    ...(corp ? [{ title: t('Sites couverts', 'Sites covered'), paras: [t(`L’entente couvre ${siteList.length} sites, facturés ensemble : ${listJoin(siteList)}.`, `The agreement covers ${siteList.length} sites, billed together: ${listJoin(siteList)}.`)] }] : []),
    { title: t('Bâtiment et ajustement', 'Building and adjustment'), paras: [areaTxt] },
    { title: t('Calendrier', 'Schedule'), paras: [t(`Les traitements ciblés commencent dans les 48 heures qui suivent la signature. Les visites de prévention ont lieu d’avril à octobre ${SEASON}, regroupées par secteur; la première est prévue la semaine du ${fmtDate(FIRST_PASSAGE, { day: 'numeric', month: 'long' })}.`, `Targeted treatments start within 48 hours of signing. Prevention visits run from April to October ${SEASON}, grouped by area; the first one is planned for the week of ${fmtDate(FIRST_PASSAGE, { day: 'numeric', month: 'long' })}.`)] },
    { title: t('Prix', 'Price'), table: true, paras: [t('Les montants ci-dessous reprennent le plan d’action accepté.', 'The amounts below repeat the accepted action plan.')] },
    ...(corp ? [{ title: t('Facturation', 'Billing'), paras: [t(`Une facture consolidée est émise à la fin de chaque mois où une visite a lieu, avec le détail par site. Elle est payable à ${bl.terms || 30} jours et porte le bon de commande ${bl.po || '—'}. Les factures sont envoyées à ${bl.ap || p.client.email} et restent disponibles dans l’espace client.`, `A consolidated invoice is issued at the end of each month with a visit, itemized by site. It is payable within ${bl.terms || 30} days and carries purchase order ${bl.po || '—'}. Invoices are sent to ${bl.ap || p.client.email} and stay available in the client space.`)] }] : []),
    { title: t('Avis et sécurité', 'Notices and safety'), paras: [t('MBM avise le client la veille de chaque visite. Le technicien, certifié et clairement identifié, laisse après chaque traitement les consignes à suivre pour les enfants et les animaux, dont le délai avant de revenir dans une pièce traitée. Les stations d’appâts sont verrouillées.', 'MBM notifies the client the day before each visit. The technician, certified and clearly identified, leaves the instructions for children and pets after each treatment, including how long to wait before going back into a treated room. Bait stations are locked.')] },
    { title: t('Suivi et garantie', 'Follow-up and guarantee'), paras: [t('MBM appelle le client dans la semaine qui suit chaque intervention. Si les nuisibles visés reviennent entre deux visites, un technicien revient sans frais et prend les mesures correctives nécessaires, photos à l’appui.', 'MBM calls the client within the week after each treatment. If the targeted pests come back between two visits, a technician returns at no charge and takes the corrective measures needed, with photos.')] },
    { title: t('Renouvellement', 'Renewal'), paras: [renewTxt] },
    { title: t('Annulation', 'Cancellation'), paras: [t('Le client peut annuler sans frais avant la première intervention. Par la suite, seules les interventions effectuées sont payables.', 'The client may cancel at no charge before the first treatment. After that, only completed treatments are payable.')] },
    { title: t('Renseignements personnels', 'Personal information'), paras: [t('MBM utilise les renseignements du client seulement pour fournir les services et lui écrire au sujet de son dossier, conformément à la Loi 25. Les communications promotionnelles requièrent un consentement distinct.', 'MBM uses the client’s information only to provide the services and write to them about their file, in line with Québec’s Law 25. Promotional messages require separate consent.')] },
    { title: t('Signature', 'Signature'), paras: [t('L’entente peut être signée électroniquement; cette signature a la même valeur qu’une signature manuscrite. L’entente est régie par les lois du Québec.', 'The agreement may be signed electronically; this signature has the same value as a handwritten one. It is governed by the laws of Québec.')] },
  ];
  return sec.map((s, i) => ({ ...s, n: i + 1, rep }));
}
/* The discount line: a loyalty price on a renewal, a plain discount otherwise */
function discLabel(p, q) { return isRenewal(p) ? t(`Prix fidélité (${q.discPct} %)`, `Loyalty price (${q.discPct}%)`) : t(`Rabais de ${q.discPct} %`, `${q.discPct}% discount`); }
function contractPlain(p) {
  const q = quote(p);
  return contractSections(p).map((s) => `${s.n}. ${s.title}\n${s.paras.join('\n')}${s.table ? '\n' + q.lines.map((l) => `${l.label} : ${fmtMoney(l.amount)}`).join('\n') + `\n${t('TPS', 'GST')} : ${fmtMoney(q.tps)}\n${t('TVQ', 'QST')} : ${fmtMoney(q.tvq)}\nTotal : ${fmtMoney(q.total)}` : ''}`).join('\n\n');
}
