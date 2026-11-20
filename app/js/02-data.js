/* ============ Constants (MBM Gestion parasitaire, read on mbmextermination.com, November 2026) ============ */
const STEPS = [
  { n: 1, key: 'diagnostic', fr: 'Évaluation', en: 'Assessment' },
  { n: 2, key: 'proposition', fr: 'Plan d’action', en: 'Action plan' },
  { n: 3, key: 'visite', fr: 'Inspection', en: 'Inspection' },
  { n: 4, key: 'entente', fr: 'Entente', en: 'Agreement' },
  { n: 5, key: 'saison', fr: 'Ma protection', en: 'My protection' },
];
const DEFAULT_SLUG = 'tremblay';
const LS_KEY = 'mbm-desk-v1';
const ADMIN_PIN = 'MBM-2027';
const SEASON = 2027;
const FIRST_PASSAGE = '2027-04-19';
const PROMO_PRICE = 49.99;
const TPS = 0.05, TVQ = 0.09975;
/* MBM's 24/7 line, as published on mbmextermination.com */
const MBM_LINE = '1 844 690-3434';

/* Territories served by MBM's two offices (Longueuil for the Montréal region, Québec City) */
const BRANCHES = [
  ['montreal', 'Montréal'], ['laval', 'Laval'], ['rive-nord', 'Rive-Nord'], ['longueuil', 'Rive-Sud'], ['quebec', 'Québec'], ['levis', 'Lévis'],
].map(([key, name]) => ({ key, name }));
const BRANCH = Object.fromEntries(BRANCHES.map((b) => [b.key, b]));
const branchName = (k) => (BRANCH[k] ? BRANCH[k].name : k || '—');
/* The office each territory reports to */
const officeOf = (k) => (['quebec', 'levis'].includes(k) ? t('Bureau de Québec', 'Québec City office') : t('Bureau de Longueuil', 'Longueuil office'));

/* Fictional advisors for the demo (phone numbers use the reserved 555-01xx range) */
const REPS = {
  longueuil: { name: 'Mélanie Gauthier', g: 'f', years: 9, phone: '450 555-0142' },
  laval: { name: 'Kevin Morin', g: 'm', years: 6, phone: '450 555-0187' },
  levis: { name: 'Audrey Pelletier', g: 'f', years: 11, phone: '418 555-0123' },
  montreal: { name: 'Samuel Girouard', g: 'm', years: 4, phone: '514 555-0164' },
  quebec: { name: 'Catherine Lavoie', g: 'f', years: 8, phone: '418 555-0119' },
  'rive-nord': { name: 'Maxime Fortin', g: 'm', years: 5, phone: '450 555-0171' },
};
function repFor(branch) {
  const r = REPS[branch];
  if (r) return { name: r.name, g: r.g, years: r.years, phone: r.phone, email: `${slugify(r.name).replace(/-/g, '.')}@exemple.test` };
  return { name: `MBM ${branchName(branch)}`, g: 'x', years: 0, phone: MBM_LINE, email: 'service@exemple.test', team: true };
}
/* One word under the advisor's name in the header: "Conseillère" in French, "Advisor" in English */
function repRole(rep) {
  const w = repTitle(rep).split(' ');
  return S.lang === 'en' ? cap1(w[w.length - 1]) : w[0];
}
function repTitle(rep) {
  if (rep && rep.title) return tx(rep.title);
  if (!rep || rep.team) return t('Service à la clientèle', 'Customer service');
  return rep.g === 'f' ? t('Conseillère en gestion parasitaire', 'Pest management advisor') : t('Conseiller en gestion parasitaire', 'Pest management advisor');
}

const SOURCES = {
  'porte-a-porte': { fr: 'Accroche-porte', en: 'Door hanger', icon: 'door' },
  telephone: { fr: 'Ligne 24/7', en: '24/7 line', icon: 'phone' },
  web: { fr: 'Site web', en: 'Website', icon: 'link' },
  reference: { fr: 'Référence', en: 'Referral', icon: 'users' },
  commercial: { fr: 'Commercial', en: 'Commercial', icon: 'building' },
};

const PROP_TYPES = [
  { key: 'maison', fr: 'Maison unifamiliale', en: 'Single-family home', icon: 'home' },
  { key: 'jumele', fr: 'Jumelé ou maison de ville', en: 'Semi-detached or townhouse', icon: 'home' },
  { key: 'chalet', fr: 'Chalet', en: 'Cottage', icon: 'tree' },
  { key: 'condo', fr: 'Copropriété ou multilogement', en: 'Condo or multi-unit', icon: 'building' },
  { key: 'commerce', fr: 'Commerce, restaurant ou usine', en: 'Business, restaurant or plant', icon: 'building' },
];
/* Living area of a home */
const AREA_PRESETS = [
  { v: 1000, fr: 'Petite', en: 'Small' }, { v: 1800, fr: 'Moyenne', en: 'Medium' }, { v: 2800, fr: 'Grande', en: 'Large' }, { v: 4000, fr: 'Très grande', en: 'Very large' },
];
/* How often the client sees signs: 1 is the worst, 5 the mildest (the protection index rises with it) */
const RATINGS = [
  { v: 1, fr: 'Partout', en: 'Everywhere' }, { v: 2, fr: 'Tous les jours', en: 'Every day' }, { v: 3, fr: 'Chaque semaine', en: 'Weekly' }, { v: 4, fr: 'À l’occasion', en: 'Now and then' }, { v: 5, fr: 'Une seule fois', en: 'Just once' },
];

/* Signs of the pests listed on mbmextermination.com, phrased as what a homeowner actually sees */
const PROBLEMS = [
  { key: 'crottes', group: 'rongeurs', sev: 3, color: '#3E2E26', addon: 'exclusion', fr: 'Petites crottes noires dans les armoires ou le long des plinthes', en: 'Small black droppings in cupboards or along baseboards' },
  { key: 'grattements', group: 'rongeurs', sev: 2, color: '#7B6A5D', addon: 'exclusion', fr: 'Grattements dans les murs ou le plafond, la nuit', en: 'Scratching in the walls or ceiling at night' },
  { key: 'rats', group: 'rongeurs', sev: 3, color: '#55443A', addon: 'stations', fr: 'Gros rongeur près des poubelles, du garage ou au sous-sol', en: 'A large rodent near the bins, the garage or the basement' },
  { key: 'ratons', group: 'rongeurs', sev: 2, color: '#8C7B6B', addon: 'faune', fr: 'Raton laveur ou écureuil dans l’entretoit', en: 'A raccoon or squirrel in the attic' },
  { key: 'coquerelles', group: 'insectes', sev: 3, color: '#8A4B2A', addon: 'rampants', fr: 'Insectes bruns qui fuient la lumière, la nuit, dans la cuisine', en: 'Brown insects that run from the light at night in the kitchen' },
  { key: 'fourmis_int', group: 'insectes', sev: 1, color: '#4A2F1C', addon: 'rampants', fr: 'Colonnes de petites fourmis près de l’évier', en: 'Trails of small ants near the sink' },
  { key: 'sciure', group: 'insectes', sev: 2, color: '#C9A46B', addon: 'charpentieres', fr: 'Grosses fourmis noires et petits tas de sciure', en: 'Large black ants and little piles of sawdust' },
  { key: 'piqures', group: 'chambres', sev: 3, color: '#B5473A', addon: 'punaises', fr: 'Piqûres en ligne au réveil, petites taches sur les draps', en: 'Bites in a line on waking, small spots on the sheets' },
  { key: 'gardemanger', group: 'chambres', sev: 1, color: '#C7A35A', addon: 'rampants', fr: 'Petits papillons ou larves dans la farine ou les céréales', en: 'Small moths or larvae in the flour or cereal' },
  { key: 'mouches', group: 'autres', sev: 1, color: '#5E6B73', addon: 'drains', fr: 'Petites mouches près des drains ou des fruits', en: 'Small flies near the drains or the fruit' },
  { key: 'nid_guepes', group: 'autres', sev: 2, color: '#E0A526', addon: 'guepes', fr: 'Nid de guêpes sous la corniche ou près d’une porte', en: 'A wasp nest under the eaves or near a door' },
  { key: 'odeur', group: 'autres', sev: 2, color: '#7F8F5A', addon: 'odeurs', fr: 'Odeur qui persiste : animal mort, urine', en: 'A smell that lingers: dead animal, urine' },
];
const PROB_GROUPS = { rongeurs: { fr: 'Rongeurs et faune', en: 'Rodents and wildlife' }, insectes: { fr: 'Insectes rampants', en: 'Crawling insects' }, chambres: { fr: 'Chambres et garde-manger', en: 'Bedrooms and pantry' }, autres: { fr: 'Odeurs, mouches et guêpes', en: 'Smells, flies and wasps' } };
const PROB = Object.fromEntries(PROBLEMS.map((p) => [p.key, p]));

/* Outdoor nuisances that come back every summer (they point to the exterior shield) */
const PESTS = [
  { key: 'fourmis', fr: 'Fourmis', en: 'Ants' }, { key: 'araignees', fr: 'Araignées', en: 'Spiders' }, { key: 'guepes', fr: 'Guêpes', en: 'Wasps' }, { key: 'perce', fr: 'Perce-oreilles', en: 'Earwigs' },
];
const PEST = Object.fromEntries(PESTS.map((p) => [p.key, p]));
const GOALS = [
  { key: 'vite', fr: 'Régler le problème au plus vite', en: 'Solve it fast' },
  { key: 'prevenir', fr: 'Que ça ne revienne pas', en: 'Keep it from coming back' },
  { key: 'eco', fr: 'L’approche la plus écologique', en: 'The greenest approach' },
  { key: 'discret', fr: 'Une intervention discrète', en: 'A discreet visit' },
  { key: 'vente', fr: 'Maison prête pour une vente', en: 'Ready to sell the house' },
  { key: 'audit', fr: 'Des rapports pour mes audits', en: 'Reports for my audits' },
];
const GOAL = Object.fromEntries(GOALS.map((g) => [g.key, g]));

/* MBM's custom pest management plan, turned into a yearly program (process read on mbmextermination.com/la-difference-mbm) */
const BASE = {
  name: { fr: `Programme Protection ${SEASON}`, en: `${SEASON} Protection Program` },
  includes: [
    { fr: '4 visites de prévention : printemps, début d’été, fin d’été et automne', en: '4 prevention visits: spring, early summer, late summer and fall' },
    { fr: 'Inspection intérieure et extérieure à chaque visite', en: 'Inside and outside inspection at every visit' },
    { fr: 'Identification des nuisibles et rapport avec photos', en: 'Pest identification and a report with photos' },
    { fr: 'Lutte intégrée : produits ciblés, seulement au besoin', en: 'Integrated pest management: targeted products, only as needed' },
    { fr: 'Appel de satisfaction dans la semaine, puis suivi', en: 'Satisfaction call within the week, then a follow-up' },
    { fr: 'Appels de service sans frais, assistance 24/7', en: 'Free service calls, 24/7 assistance' },
  ],
};
/* Targeted treatments, after MBM's services and pest pages. Prices are a demo grid that each office sets in the console.
   when: months on the plan's calendar. 11 to 12.99 is November and December 2026 (right after the inspection), 1 to 10.99 is 2027. */
const ADDONS = [
  { key: 'exclusion', name: { fr: 'Exclusion des rongeurs', en: 'Rodent exclusion' }, price: { fixed: 249, perSqft: 0.04 }, when: [[11.55, 12.4]],
    desc: { fr: 'On repère et on colmate les points d’entrée (fondation, entrées de services, soffites) avec des matériaux que les rongeurs ne percent pas. Une souris passe par 6 mm.', en: 'We find and seal the entry points (foundation, utility entries, soffits) with materials rodents can’t chew through. A mouse fits through 6 mm.' } },
  { key: 'stations', name: { fr: 'Stations d’appâts verrouillées', en: 'Locked bait stations' }, price: { perUnit: 39 }, when: [[11.55, 12.4]],
    desc: { fr: 'Installées autour du bâtiment, hors de portée des enfants et des animaux, vérifiées et notées à chaque visite.', en: 'Set around the building, out of reach of kids and pets, checked and logged at every visit.' } },
  { key: 'faune', name: { fr: 'Raton laveur ou écureuil', en: 'Raccoon or squirrel' }, price: { fixed: 349 }, when: [[11.55, 12.4]],
    desc: { fr: 'Une porte à sens unique laisse sortir l’animal sans le blesser. On ferme ensuite l’accès et on nettoie l’entretoit.', en: 'A one-way door lets the animal out unharmed. We then close the access and clean the attic.' } },
  { key: 'punaises', name: { fr: 'Punaises de lit : traitement et 2 suivis', en: 'Bed bugs: treatment and 2 follow-ups' }, price: { fixed: 395, perSqft: 0.1 }, when: [[11.55, 11.85], [12.0, 12.3], [12.45, 12.75]],
    desc: { fr: 'Vapeur et produits ciblés dans les chambres, puis deux suivis à 14 jours d’intervalle. La liste de préparation vous est envoyée.', en: 'Steam and targeted products in the bedrooms, then two follow-ups 14 days apart. The prep checklist is sent to you.' } },
  { key: 'rampants', name: { fr: 'Blattes, fourmis et garde-manger', en: 'Cockroaches, ants and pantry pests' }, price: { fixed: 179, perSqft: 0.03 }, when: [[11.55, 11.95], [12.4, 12.8]],
    desc: { fr: 'Gels et appâts placés là où les insectes vivent, pièges à phéromones au garde-manger, suivi après trois semaines.', en: 'Gels and baits placed where the insects live, pheromone traps in the pantry, a follow-up after three weeks.' } },
  { key: 'charpentieres', name: { fr: 'Fourmis charpentières', en: 'Carpenter ants' }, price: { fixed: 189, perSqft: 0.02 }, when: [[5.0, 6.0]],
    desc: { fr: 'On trouve le nid dans le bois humide et on le traite au printemps, quand la colonie est active. Elles creusent le bois, elles ne le mangent pas.', en: 'We find the nest in damp wood and treat it in spring, when the colony is active. They tunnel through wood, they don’t eat it.' } },
  { key: 'drains', name: { fr: 'Traitement biologique des drains', en: 'Biological drain treatment' }, price: { fixed: 99 }, when: [[11.55, 12.4]],
    desc: { fr: 'Enzymes et bactéries qui digèrent la matière où pondent les mouches à drain et les drosophiles. Sans pesticide.', en: 'Enzymes and bacteria that digest the build-up where drain flies and fruit flies breed. No pesticide.' } },
  { key: 'odeurs', name: { fr: 'Gestion des odeurs', en: 'Odour management' }, price: { fixed: 159 }, when: [[11.55, 12.4]],
    desc: { fr: 'On trouve la source (animal mort, nid, urine), on la retire, on désinfecte et on neutralise l’odeur au lieu de la masquer.', en: 'We find the source (dead animal, nest, urine), remove it, disinfect and neutralize the smell instead of masking it.' } },
  { key: 'guepes', name: { fr: 'Retrait de nid de guêpes', en: 'Wasp nest removal' }, price: { fixed: 149 }, when: [[6.4, 8.6]],
    desc: { fr: 'Le nid est traité puis retiré en soirée, quand la colonie est rentrée. Un autre se forme pendant l’été ? On revient sans frais.', en: 'The nest is treated then removed in the evening, once the colony is in. Another one forms during the summer? We come back at no charge.' } },
  { key: 'bouclier', division: 'vext', name: { fr: 'Bouclier extérieur 3 saisons', en: '3-season exterior shield' }, price: { fixed: 189 }, when: [[5.1, 5.7], [7.0, 7.6], [9.0, 9.6]],
    desc: { fr: 'Une barrière autour de la fondation contre les araignées, les fourmis, les perce-oreilles et les guêpes, au printemps, en été et à l’automne.', en: 'A barrier around the foundation against spiders, ants, earwigs and wasps, in spring, summer and fall.' } },
];
const ADD = Object.fromEntries(ADDONS.map((a) => [a.key, a]));

/* The four prevention visits of the yearly program */
const PASSAGES = [
  { n: 1, a: 4.45, b: 5.4, fr: 'Printemps', en: 'Spring' },
  { n: 2, a: 6.0, b: 6.9, fr: 'Début d’été', en: 'Early summer' },
  { n: 3, a: 7.7, b: 8.6, fr: 'Fin d’été', en: 'Late summer' },
  { n: 4, a: 9.3, b: 10.4, fr: 'Automne', en: 'Fall' },
];

/* Facts from mbmextermination.com (home page and La différence MBM) */
const FACTS = [
  { v: '24/7', fr: 'assistance immédiate', en: 'immediate assistance' },
  { v: '100 %', fr: 'résultats garantis', en: 'results guaranteed' },
  { v: '2', fr: 'bureaux : Longueuil et Québec', en: 'offices: Longueuil and Québec City' },
  { v: 'GreenPro', fr: 'QualityPro, HACCP, NPMA, AQGP', en: 'QualityPro, HACCP, NPMA, AQGP' },
  { v: '4', fr: 'secteurs, du résidentiel à l’agroalimentaire', en: 'sectors, from homes to food plants' },
];

/* Local answers for the advisor chat when Claude is not available (general pest management guidance).
   Order matters: the proposal shows FAQ 4, 3, 9 and 10; the chat suggests 12, 3, 4, 6 and 9. */
const FAQ = [
  { k: ['souris', 'rat', 'crotte', 'rongeur', 'mouse', 'mice', 'dropping', 'rodent'], q: { fr: 'Souris ou rats : comment savoir ?', en: 'Mice or rats: how can I tell?' },
    a: { fr: 'Une crotte de souris a la taille d’un grain de riz; celle d’un rat, d’un raisin sec. La souris passe par une ouverture de 6 mm, le rat par 12 mm. Notez où vous les voyez : votre technicien le confirme à l’inspection.', en: 'A mouse dropping is the size of a grain of rice; a rat’s, the size of a raisin. A mouse fits through a 6 mm gap, a rat through 12 mm. Note where you see them: your technician confirms it at the inspection.' } },
  { k: ['punaise', 'lit', 'piqûre', 'piqure', 'matelas', 'bed bug', 'bite', 'mattress'], q: { fr: 'Punaises de lit : quels signes ?', en: 'Bed bugs: what are the signs?' },
    a: { fr: 'Des piqûres en ligne ou en grappe au réveil, de petites taches noires sur les draps et les coutures du matelas. Ne déplacez pas le matelas d’une pièce à l’autre : vous risquez de les répandre dans la maison.', en: 'Bites in a line or a cluster on waking, small black spots on the sheets and the mattress seams. Don’t move the mattress from room to room: you could spread them through the house.' } },
  { k: ['présent', 'present', 'être là', 'etre la', 'be home', 'be there', 'absent'], q: { fr: 'Dois-je être présent ?', en: 'Do I need to be home?' },
    a: { fr: 'Pour un traitement à l’intérieur, un adulte doit nous ouvrir. Vous pouvez ensuite sortir le temps indiqué. Les visites à l’extérieur se font sans vous : le rapport et les photos arrivent dans votre espace.', en: 'For an inside treatment, an adult has to let us in. You can then step out for the time given. Outside visits happen without you: the report and photos arrive in your space.' } },
  { k: ['chien', 'chat', 'enfant', 'animal', 'sécur', 'secur', 'safe', 'dog', 'kid', 'pet', 'cat', 'bébé', 'bebe', 'baby'], q: { fr: 'C’est sécuritaire pour mes enfants et mon chien ?', en: 'Is it safe for my kids and my dog?' },
    a: { fr: 'On mise sur la lutte intégrée : bloquer les accès et cibler les nids plutôt que traiter partout. Les stations d’appâts sont verrouillées et hors de portée. Votre technicien vous laisse la consigne exacte, dont le temps à attendre avant de revenir dans une pièce traitée.', en: 'We rely on integrated pest management: block the entry points and target the nests rather than treat everywhere. Bait stations are locked and out of reach. Your technician leaves the exact instructions, including how long to wait before going back into a treated room.' } },
  { k: ['combien de temps', 'résultat', 'resultat', 'délai', 'delai', 'how long', 'result', 'work'], q: { fr: 'Combien de temps avant de voir des résultats ?', en: 'How long before I see results?' },
    a: { fr: 'Pour les souris, l’activité baisse en général en une à deux semaines après l’exclusion. Pour les blattes et les punaises de lit, comptez de deux à six semaines avec les suivis. Chaque suivi est inscrit à votre plan.', en: 'For mice, activity usually drops within one to two weeks of the exclusion. For cockroaches and bed bugs, count two to six weeks with the follow-ups. Every follow-up is on your plan.' } },
  { k: ['guêpe', 'guepe', 'nid', 'frelon', 'wasp', 'nest', 'hornet'], q: { fr: 'Que faire avec un nid de guêpes ?', en: 'What should I do about a wasp nest?' },
    a: { fr: 'Ne bouchez pas l’entrée et n’arrosez pas le nid : les guêpes deviennent agressives. Gardez vos distances et signalez-le dans votre espace. Le nid est traité en soirée, quand la colonie est rentrée.', en: 'Don’t block the entrance or hose the nest: wasps get aggressive. Keep your distance and report it in your space. The nest is treated in the evening, once the colony is in.' } },
  { k: ['automne', 'froid', 'hiver', 'entrent', 'pourquoi', 'fall', 'cold', 'winter', 'why', 'come in'], q: { fr: 'Pourquoi les souris entrent-elles à l’automne ?', en: 'Why do mice come in in the fall?' },
    a: { fr: 'Avec le froid, elles cherchent chaleur et nourriture. Une fissure de fondation, une entrée de services ou une porte de garage mal ajustée leur suffit. Colmater ces accès avant l’hiver est la mesure la plus durable.', en: 'When the cold sets in, they look for warmth and food. A crack in the foundation, a utility entry or a garage door that doesn’t seal is enough. Sealing those gaps before winter is the most lasting fix.' } },
  { k: ['charpenti', 'sciure', 'bois', 'carpenter', 'sawdust', 'wood'], q: { fr: 'Les fourmis charpentières, c’est grave ?', en: 'Are carpenter ants serious?' },
    a: { fr: 'Elles creusent des galeries dans le bois humide sans le manger. Avec les années, une colonie peut affaiblir une boiserie. Le signe typique : de petits tas de sciure et de grosses fourmis noires au printemps. On traite le nid et on règle l’humidité qui les attire.', en: 'They tunnel through damp wood without eating it. Over the years, a colony can weaken woodwork. The typical sign: little piles of sawdust and large black ants in spring. We treat the nest and fix the moisture that draws them.' } },
  { k: ['écolo', 'ecolo', 'environnement', 'green', 'eco', 'bio', 'pesticide', 'naturel', 'natural'], q: { fr: 'Votre approche est-elle écologique ?', en: 'Is your approach eco-friendly?' },
    a: { fr: 'MBM mise sur la gestion parasitaire intégrée : trouver la cause, bloquer les accès et utiliser le bon produit seulement là où il le faut. L’entreprise est certifiée GreenPro.', en: 'MBM relies on integrated pest management: find the cause, block the entry points and use the right product only where it’s needed. The company is GreenPro certified.' } },
  { k: ['revien', 'garantie', 'garanti', 'guarantee', 'come back', 'again', 'encore'], q: { fr: 'Et si les nuisibles reviennent ?', en: 'What if the pests come back?' },
    a: { fr: 'Les appels de service entre les visites sont sans frais : écrivez-nous ici ou appelez la ligne 24/7, un technicien revient. On vous appelle aussi dans la semaine qui suit l’intervention pour s’assurer que tout est réglé.', en: 'Service calls between visits are free: write to us here or call the 24/7 line and a technician comes back. We also call you within the week after the treatment to make sure everything is settled.' } },
  { k: ['prix', 'coût', 'cout', 'price', 'cost', 'payer', 'paiement', 'pay', 'mois', 'month'], q: { fr: 'Comment se fait le paiement ?', en: 'How does payment work?' },
    a: { fr: 'Votre plan indique le total de l’année et l’équivalent par mois, taxes en sus. Le mode de paiement se règle au moment de l’entente. Aucune information de paiement n’est demandée dans ce portail.', en: 'Your plan shows the yearly total and the monthly equivalent, plus taxes. The payment method is set when you sign. This portal never asks for payment details.' } },
  { k: ['odeur', 'sent', 'smell', 'odor', 'odour', 'mort', 'dead'], q: { fr: 'Une odeur persiste : que faire ?', en: 'A smell lingers: what can I do?' },
    a: { fr: 'Une odeur tenace vient souvent d’un animal mort dans un mur, l’entretoit ou le vide sanitaire, ou d’urine de rongeurs. On trouve la source, on la retire, on désinfecte et on neutralise l’odeur, sans la masquer.', en: 'A stubborn smell often comes from a dead animal in a wall, the attic or the crawl space, or from rodent urine. We find the source, remove it, disinfect and neutralize the smell, without masking it.' } },
  { k: ['prépar', 'prepar', 'avant le', 'before the', 'après le', 'after the', 'ménage', 'menage', 'clean'], q: { fr: 'Comment préparer la maison ?', en: 'How do I get the house ready?' },
    a: { fr: 'Votre liste de préparation arrive avec le plan : dégager les plinthes et le dessous des éviers, ranger la nourriture, laver la literie à l’eau chaude s’il s’agit de punaises de lit. Après le traitement, attendez le délai indiqué avant de laver les zones traitées.', en: 'Your prep checklist comes with the plan: clear the baseboards and under the sinks, put food away, wash the bedding in hot water for bed bugs. After the treatment, wait the time given before washing the treated areas.' } },
];

/* ============ Demo clients (fictional people and addresses) ============ */
const PORTAL_TEMPLATE = {
  slug: '', code: '', stage: 1, segment: 'residentiel', source: 'porte-a-porte', branch: 'longueuil', createdAt: null, showcase: false,
  client: { first: '', last: '', name: '', org: false, email: '', phone: '', address: '', city: '', title: null },
  rep: null,
  answers: {},
  /* injectTrees: number of bait stations */
  proposal: { version: '1.0', date: null, validUntil: null, addons: {}, promo: true, discountPct: 0, injectTrees: 4, acceptedAt: null },
  visit: null, signature: null, countersigned: null,
  onboarding: { tasks: {}, prefs: { sms: true, email: true, tips: true }, startedAt: null },
  /* Returning clients (since), corporate sites and billing, payment method, payments made in the portal, expert offers */
  since: null, sites: null, billing: null, account: null, payments: {}, offers: [],
  activity: [],
};
/* MBM field team (fictional) who send recommendations from the console */
const EXPERTS = [
  { id: 'jroy', name: 'Jonathan Roy', role: { fr: 'Technicien certifié', en: 'Certified technician' } },
  { id: 'slev', name: 'Sarah Lévesque', role: { fr: 'Entomologiste (ACE)', en: 'Entomologist (ACE)' } },
  { id: 'mtrem', name: 'Mathieu Tremblay', role: { fr: 'Chef d’équipe', en: 'Crew lead' } },
];
const EXPERT = Object.fromEntries(EXPERTS.map((e) => [e.id, e]));
/* CRMs the console can connect to (demo: nothing leaves the browser) */
const CRMS = [
  { key: 'salesforce', name: 'Salesforce' }, { key: 'hubspot', name: 'HubSpot' }, { key: 'dynamics', name: 'Microsoft Dynamics 365' }, { key: 'zoho', name: 'Zoho CRM' },
];
/* Answers: watering = basement (fini, brut, vide), mowing = what was tried before (moi, service), trees = trees or hedges touching the house,
   treeSick = firewood or stumps against the house, zones = where the signs are seen */
function seedAnswers(o) {
  return Object.assign({ type: 'maison', area: 1800, zones: ['cuisine', 'sous-sol'], rating: 3, problems: [], kids: 'non', pets: ['aucun'], watering: 'fini', mowing: 'moi', trees: 1, treeSick: false, pests: ['none'], goals: ['vite'], notes: '' }, o);
}
function seedClients(today) {
  const d = (n, h = 10, m = 0) => { const x = addDays(today, n); x.setHours(h, m, 0, 0); return isoLocal(x); };
  const day = (n) => isoDay(addDays(today, n));
  const next = (n) => { const x = addDays(today, n); while (x.getDay() === 0 || x.getDay() === 6) x.setDate(x.getDate() + 1); return isoDay(x); };
  const prop = (n, extra) => Object.assign({ version: '1.0', date: day(-n), validUntil: day(30 - n), addons: {}, promo: true, discountPct: 0, injectTrees: 4, acceptedAt: null }, extra || {});
  const contact = (first, last, city, address, extra) => Object.assign({ first, last, name: `${first} ${last}`, email: `${slugify(first)}.${slugify(last)}@exemple.test`, phone: '', address, city, title: null }, extra || {});
  return [
    { slug: 'tremblay', stage: 1, showcase: true, source: 'porte-a-porte', branch: 'longueuil', createdAt: d(0, 9, 40),
      client: contact('Julie', 'Tremblay', 'Boucherville', '142, rue des Érables', { phone: '450 555-0161' }),
      answers: { name: 'Julie Tremblay', email: 'julie.tremblay@exemple.test', phone: '450 555-0161', address: '142, rue des Érables', city: 'Boucherville' },
      activity: [{ at: d(0, 9, 40), fr: 'Accroche-porte laissé par Mélanie pendant la tournée du secteur, code QR remis', en: 'Door hanger left by Mélanie during the area route, QR code handed over' }] },
    /* Corporate client: three food sites, purchase order, net 30, consolidated monthly invoices, client since 2022 */
    { slug: 'nordelys', stage: 5, showcase: true, segment: 'commercial', source: 'commercial', branch: 'laval', createdAt: d(-21, 9, 0), since: 2022,
      client: { first: 'Karine', last: 'Dufresne', name: 'Aliments Nordelys inc.', org: true, title: { fr: 'Directrice qualité et salubrité', en: 'Quality and food safety director' }, email: 'k.dufresne@nordelys.exemple.test', phone: '450 555-0133', address: '1200, boulevard de l’Innovation', city: 'Laval' },
      rep: { name: 'Kevin Morin', g: 'm', years: 6, phone: '450 555-0187', email: 'kevin.morin@exemple.test', title: { fr: 'Chargé de projet attitré', en: 'Dedicated project manager' } },
      sites: [
        { id: 'laval', name: { fr: 'Usine principale, Laval', en: 'Main plant, Laval' }, address: '1200, boulevard de l’Innovation', city: 'Laval', area: 64000, trees: 18, since: 2022 },
        { id: 'boisbriand', name: { fr: 'Centre de distribution', en: 'Distribution centre' }, address: '800, rue des Entrepreneurs', city: 'Boisbriand', area: 38000, trees: 6, since: 2024 },
        { id: 'terrebonne', name: { fr: 'Boulangerie de Terrebonne', en: 'Terrebonne bakery' }, address: '250, rue du Parc-Industriel', city: 'Terrebonne', area: 12500, trees: 4, since: 2027 },
      ],
      billing: { po: 'BC-NRD-2027-0412', terms: 30, ap: 'comptes.fournisseurs@nordelys.exemple.test', consolidated: true },
      account: { method: { kind: 'eft', label: 'TEF', last4: '3390' }, autopay: false },
      answers: seedAnswers({ name: 'Karine Dufresne', email: 'k.dufresne@nordelys.exemple.test', phone: '450 555-0133', address: '1200, boulevard de l’Innovation', city: 'Laval', type: 'commerce', area: 114500, zones: ['cuisine', 'garage', 'exterieur'], rating: 4, problems: ['rats', 'mouches', 'gardemanger'], kids: 'non', pets: ['aucun'], watering: 'brut', mowing: 'service', trees: 28, pests: ['guepes', 'fourmis'], goals: ['prevenir', 'audit', 'discret'], notes: 'Visites avant 6 h ou le dimanche (production). Registre des stations et rapport par site requis pour l’audit HACCP.', submittedAt: d(-20, 10, 0) }),
      proposal: prop(20, { version: '2.1', acceptedAt: d(-17, 15, 0), discountPct: 8, injectTrees: 24, promo: false, addons: { stations: true, rampants: true, drains: true, bouclier: true } }),
      visit: { mode: 'terrain', date: day(-15), window: 'am', presence: 'oui', access: 'Réception, entrée principale : badge visiteur, sarrau et filet à cheveux', petsNote: '', notes: 'Inspection des trois sites avec la responsable qualité', bookedAt: d(-17, 15, 5) },
      signature: { name: 'Karine Dufresne', mode: 'type', text: 'Karine Dufresne', signedAt: d(-10, 11, 20), hash: '9A1C-44E0-7B21' },
      countersigned: { name: 'Kevin Morin', signedAt: d(-10, 11, 34) },
      onboarding: { tasks: { prefs: true, access: true, file: true }, prefs: { sms: false, email: true, tips: false }, startedAt: d(-10, 11, 34) },
      offers: [{ id: 'of-nrd-1', key: 'drains', site: 'boisbriand', by: 'slev', at: d(-3, 14, 10), status: 'sent', evidence: 'mouches',
        note: { fr: 'Pendant l’inspection, j’ai noté des mouches à drain près des quais 3 et 4, autour du drain de plancher de la salle de lavage. Le traitement biologique règle la source sans pesticide et sans arrêter la production.', en: 'During the inspection, I noted drain flies near docks 3 and 4, around the floor drain in the wash room. The biological treatment fixes the source with no pesticide and no production stop.' },
        when: { fr: 'Visite de décembre 2026 · centre de distribution', en: 'December 2026 visit · distribution centre' } }],
      activity: [{ at: d(-3, 14, 10), fr: 'Recommandation envoyée par Sarah Lévesque : traitement biologique des drains (Boisbriand)', en: 'Recommendation sent by Sarah Lévesque: biological drain treatment (Boisbriand)' }, { at: d(-10, 11, 20), fr: 'Renouvellement 2027 signé : 3 sites, bon de commande BC-NRD-2027-0412', en: '2027 renewal signed: 3 sites, purchase order BC-NRD-2027-0412' }] },
    { slug: 'gagnon', stage: 2, source: 'web', branch: 'laval', createdAt: d(-3, 19, 12),
      client: contact('Marc', 'Gagnon', 'Laval', '1875, rue des Pins'),
      answers: seedAnswers({ name: 'Marc Gagnon', email: 'marc.gagnon@exemple.test', address: '1875, rue des Pins', city: 'Laval', area: 2200, zones: ['cuisine', 'sous-sol', 'grenier'], rating: 2, problems: ['crottes', 'grattements'], kids: 'oui', pets: ['chien'], trees: 2, pests: ['fourmis'], goals: ['vite', 'prevenir'], submittedAt: d(-2, 20, 4) }),
      proposal: prop(2), activity: [{ at: d(-2, 20, 4), fr: 'Évaluation envoyée, plan d’action généré', en: 'Assessment sent, action plan generated' }] },
    { slug: 'ouellet', stage: 3, source: 'telephone', branch: 'levis', createdAt: d(-6, 11, 5),
      client: contact('Nadia', 'Ouellet', 'Lévis', '38, rue du Fleuve'),
      answers: seedAnswers({ name: 'Nadia Ouellet', email: 'nadia.ouellet@exemple.test', address: '38, rue du Fleuve', city: 'Lévis', area: 2600, zones: ['cuisine', 'exterieur'], rating: 3, problems: ['sciure', 'fourmis_int'], kids: 'oui', pets: ['aucun'], watering: 'fini', trees: 3, treeSick: true, goals: ['prevenir'], submittedAt: d(-5, 14, 30) }),
      proposal: prop(5, { acceptedAt: d(-3, 18, 2) }),
      visit: { mode: 'terrain', date: next(4), window: 'am', presence: 'oui', access: 'Entrée par le garage', petsNote: '', notes: '', bookedAt: d(-3, 18, 5) },
      activity: [{ at: d(-3, 18, 5), fr: 'Inspection réservée', en: 'Inspection booked' }] },
    { slug: 'cote', stage: 4, source: 'reference', branch: 'montreal', createdAt: d(-11, 13, 0),
      client: contact('Sophie', 'Côté', 'Montréal', '52, rue des Hirondelles'),
      answers: seedAnswers({ name: 'Sophie Côté', email: 'sophie.cote@exemple.test', address: '52, rue des Hirondelles', city: 'Montréal', type: 'jumele', area: 1400, zones: ['chambres'], rating: 2, problems: ['piqures'], pets: ['chat'], trees: 0, goals: ['vite', 'discret'], submittedAt: d(-10, 9, 0) }),
      proposal: prop(10, { acceptedAt: d(-9, 12, 0), version: '1.1' }),
      visit: { mode: 'terrain', date: day(-5), window: 'pm', presence: 'oui', access: '', petsNote: 'Chat à l’étage', notes: '', bookedAt: d(-9, 12, 4) },
      activity: [{ at: d(-5, 15, 10), fr: 'Inspection faite, plan ajusté (v1.1)', en: 'Inspection done, plan adjusted (v1.1)' }] },
    { slug: 'desjardins', stage: 5, source: 'porte-a-porte', branch: 'quebec', createdAt: d(-24, 17, 30),
      client: contact('Luc', 'Desjardins', 'Québec', '9, avenue des Lilas'),
      answers: seedAnswers({ name: 'Luc Desjardins', email: 'luc.desjardins@exemple.test', address: '9, avenue des Lilas', city: 'Québec', area: 2400, zones: ['cuisine', 'sous-sol'], rating: 2, problems: ['crottes', 'odeur'], kids: 'oui', pets: ['chien'], watering: 'vide', trees: 2, pests: ['araignees', 'guepes'], goals: ['vite', 'prevenir'], submittedAt: d(-23, 19, 0) }),
      proposal: prop(23, { acceptedAt: d(-22, 8, 0) }),
      visit: { mode: 'terrain', date: day(-16), window: 'am', presence: 'oui', access: '', petsNote: 'Chien dans la cour arrière', notes: '', bookedAt: d(-22, 8, 3) },
      signature: { name: 'Luc Desjardins', mode: 'type', text: 'Luc Desjardins', signedAt: d(-12, 20, 15), hash: 'B7F2-91AC-3D04' },
      countersigned: { name: 'Catherine Lavoie', signedAt: d(-12, 20, 31) },
      onboarding: { tasks: { prefs: true, access: true }, prefs: { sms: true, email: true, tips: true }, startedAt: d(-12, 20, 31) },
      account: { method: { kind: 'pad', label: 'Desjardins', last4: '0127' }, autopay: true },
      offers: [{ id: 'of-dsj-1', key: 'odeurs', by: 'jroy', at: d(-2, 16, 20), status: 'sent', evidence: 'odeur',
        note: { fr: 'À l’intervention initiale, j’ai noté une odeur dans le vide sanitaire, sous la cuisine : probablement une souris morte derrière l’isolant. On retire la source et on neutralise l’odeur au suivi de décembre.', en: 'At the first treatment, I noticed a smell in the crawl space under the kitchen: most likely a dead mouse behind the insulation. We remove the source and neutralize the smell at the December follow-up.' },
        when: { fr: 'Avec le suivi de décembre 2026', en: 'With the December 2026 follow-up' } }],
      activity: [{ at: d(-2, 16, 20), fr: 'Recommandation envoyée par Jonathan Roy : gestion des odeurs', en: 'Recommendation sent by Jonathan Roy: odour management' }, { at: d(-12, 20, 15), fr: 'Entente signée', en: 'Agreement signed' }] },
    { slug: 'jardins-du-parc', stage: 2, segment: 'commercial', source: 'commercial', branch: 'rive-nord', createdAt: d(-8, 10, 0),
      client: { first: 'Claude', last: 'Bérubé', name: 'Syndicat Les Jardins du Parc', org: true, title: { fr: 'Président du conseil d’administration', en: 'Board president' }, email: 'ca.jardinsduparc@exemple.test', phone: '', address: '400, boulevard du Parc', city: 'Repentigny' },
      answers: seedAnswers({ name: 'Claude Bérubé', email: 'ca.jardinsduparc@exemple.test', address: '400, boulevard du Parc', city: 'Repentigny', type: 'condo', area: 38000, zones: ['chambres', 'cuisine', 'sous-sol'], rating: 3, problems: ['piqures', 'coquerelles'], kids: 'oui', pets: ['chien'], watering: 'brut', mowing: 'service', trees: 12, goals: ['prevenir', 'audit'], notes: '48 unités. Un plan pour tout l’immeuble, et un rapport pour l’assemblée annuelle.', submittedAt: d(-7, 16, 40) }),
      proposal: prop(7, { injectTrees: 8, discountPct: 8 }), activity: [{ at: d(-7, 16, 40), fr: 'Évaluation reçue du gestionnaire', en: 'Assessment received from the manager' }] },
    { slug: 'girard', stage: 1, source: 'web', branch: 'quebec', createdAt: d(-1, 21, 15),
      client: contact('Nathalie', 'Girard', 'Québec', '1210, avenue Maguire'),
      answers: { name: 'Nathalie Girard', email: 'nathalie.girard@exemple.test', address: '1210, avenue Maguire', city: 'Québec', type: 'maison', area: 2000, rating: 3 },
      activity: [{ at: d(-1, 21, 15), fr: 'Évaluation commencée en ligne', en: 'Assessment started online' }] },
    { slug: 'simard', stage: 5, source: 'reference', branch: 'montreal', createdAt: d(-40, 12, 0), since: 2019,
      account: { method: { kind: 'card', label: 'Visa', last4: '4821' }, autopay: true },
      history: { 2026: { addons: ['bouclier'], upsells: [{ key: 'guepes', date: '2026-08-12' }] } },
      client: contact('Éric', 'Simard', 'Montréal', '77, rue de la Colline'),
      answers: seedAnswers({ name: 'Éric Simard', email: 'eric.simard@exemple.test', address: '77, rue de la Colline', city: 'Montréal', area: 1900, rating: 4, problems: ['fourmis_int'], goals: ['prevenir'], submittedAt: d(-39, 18, 0) }),
      proposal: prop(39, { acceptedAt: d(-38, 9, 0) }),
      visit: { mode: 'video', date: day(-35), time: '18:30', presence: 'oui', access: '', petsNote: '', notes: '', bookedAt: d(-38, 9, 2) },
      signature: { name: 'Éric Simard', mode: 'type', text: 'Éric Simard', signedAt: d(-30, 19, 0), hash: '5C1E-0B7A-E992' },
      countersigned: { name: 'Samuel Girouard', signedAt: d(-30, 19, 20) },
      onboarding: { tasks: { prefs: true, access: true, zones: true, irrigation: true, route: true, file: true }, prefs: { sms: true, email: false, tips: true }, startedAt: d(-30, 19, 20) },
      activity: [{ at: d(-30, 19, 0), fr: 'Entente signée', en: 'Agreement signed' }] },
    { slug: 'boucher', stage: 3, source: 'porte-a-porte', branch: 'longueuil', createdAt: d(-5, 16, 20),
      client: contact('Annie', 'Boucher', 'Chambly', '15, rue des Cèdres'),
      answers: seedAnswers({ name: 'Annie Boucher', email: 'annie.boucher@exemple.test', address: '15, rue des Cèdres', city: 'Chambly', area: 2100, zones: ['grenier'], rating: 2, problems: ['ratons', 'grattements'], kids: 'oui', trees: 3, goals: ['vite'], submittedAt: d(-4, 20, 0) }),
      proposal: prop(4, { acceptedAt: d(-2, 12, 0) }),
      visit: { mode: 'terrain', date: next(2), window: 'pm', presence: 'oui', access: '', petsNote: '', notes: '', bookedAt: d(-2, 12, 3) },
      activity: [{ at: d(-2, 12, 3), fr: 'Inspection réservée', en: 'Inspection booked' }] },
    { slug: 'martel', stage: 5, source: 'telephone', branch: 'longueuil', createdAt: d(-14, 9, 30),
      client: contact('Isabelle', 'Martel', 'Saint-Bruno-de-Montarville', '303, rue Montarville'),
      answers: seedAnswers({ name: 'Isabelle Martel', email: 'isabelle.martel@exemple.test', address: '303, rue Montarville', city: 'Saint-Bruno-de-Montarville', area: 2300, zones: ['cuisine', 'sous-sol'], rating: 2, problems: ['crottes', 'mouches'], pets: ['chien'], trees: 2, goals: ['vite'], submittedAt: d(-13, 10, 0) }),
      proposal: prop(13, { acceptedAt: d(-12, 10, 0) }),
      visit: { mode: 'terrain', date: day(-9), window: 'am', presence: 'oui', access: '', petsNote: '', notes: '', bookedAt: d(-12, 10, 2) },
      signature: { name: 'Isabelle Martel', mode: 'type', text: 'Isabelle Martel', signedAt: d(-6, 21, 0), hash: '0F3A-77C2-1B58' },
      countersigned: { name: 'Mélanie Gauthier', signedAt: d(-6, 21, 22) },
      onboarding: { tasks: { prefs: true }, prefs: { sms: true, email: true, tips: false }, startedAt: d(-6, 21, 22) },
      account: { method: { kind: 'card', label: 'Mastercard', last4: '7710' }, autopay: true },
      offers: [{ id: 'of-mrt-1', key: 'drains', by: 'jroy', at: d(-4, 11, 45), status: 'accepted', decidedAt: d(-3, 20, 12), evidence: 'mouches',
        note: { fr: 'De petites mouches à drain au sous-sol, près de la buanderie : la matière organique dans le drain de plancher les nourrit. Le traitement biologique règle la source, sans pesticide.', en: 'Small drain flies in the basement near the laundry room: the organic build-up in the floor drain feeds them. The biological treatment fixes the source, with no pesticide.' },
        when: { fr: 'Avec le suivi de décembre 2026', en: 'With the December 2026 follow-up' } }],
      activity: [{ at: d(-3, 20, 12), fr: 'Recommandation acceptée en ligne : traitement biologique des drains', en: 'Recommendation accepted online: biological drain treatment' }, { at: d(-6, 21, 0), fr: 'Entente signée', en: 'Agreement signed' }] },
    { slug: 'clinique-rive-sud', stage: 1, segment: 'commercial', source: 'commercial', branch: 'longueuil', createdAt: d(-2, 14, 0),
      client: { first: 'Valérie', last: 'Lapointe', name: 'Clinique dentaire Rive-Sud', org: true, title: { fr: 'Copropriétaire', en: 'Co-owner' }, email: 'admin.cliniquerivesud@exemple.test', phone: '', address: '2600, chemin de Chambly', city: 'Longueuil' },
      answers: { name: 'Valérie Lapointe', email: 'admin.cliniquerivesud@exemple.test', address: '2600, chemin de Chambly', city: 'Longueuil', type: 'commerce' },
      activity: [{ at: d(-2, 14, 0), fr: 'Portail créé par Mélanie après un appel', en: 'Portal created by Mélanie after a call' }] },
    { slug: 'nguyen', stage: 2, source: 'porte-a-porte', branch: 'laval', createdAt: d(-4, 18, 45),
      client: contact('Thomas', 'Nguyen', 'Laval', '4410, rue des Mésanges'),
      answers: seedAnswers({ name: 'Thomas Nguyen', email: 'thomas.nguyen@exemple.test', address: '4410, rue des Mésanges', city: 'Laval', area: 1700, zones: ['cuisine'], rating: 3, problems: ['fourmis_int', 'mouches'], trees: 1, goals: ['eco', 'prevenir'], submittedAt: d(-3, 21, 10) }),
      proposal: prop(3), activity: [{ at: d(-3, 21, 10), fr: 'Plan consulté 3 fois', en: 'Plan viewed 3 times' }] },
    { slug: 'leblanc', stage: 4, source: 'web', branch: 'rive-nord', createdAt: d(-9, 12, 0),
      client: contact('Hugo', 'Leblanc', 'Repentigny', '88, rue Valmont'),
      answers: seedAnswers({ name: 'Hugo Leblanc', email: 'hugo.leblanc@exemple.test', address: '88, rue Valmont', city: 'Repentigny', area: 2500, zones: ['garage', 'sous-sol'], rating: 2, problems: ['rats', 'crottes'], trees: 2, pests: ['perce', 'fourmis'], goals: ['vite', 'prevenir'], submittedAt: d(-8, 19, 0) }),
      proposal: prop(8, { acceptedAt: d(-7, 9, 0) }),
      visit: { mode: 'terrain', date: day(-3), window: 'am', presence: 'oui', access: '', petsNote: '', notes: '', bookedAt: d(-7, 9, 3) },
      activity: [{ at: d(-3, 11, 30), fr: 'Inspection faite, entente envoyée', en: 'Inspection done, agreement sent' }] },
    { slug: 'fortier', stage: 1, source: 'reference', branch: 'levis', createdAt: d(-1, 10, 10),
      client: contact('Geneviève', 'Fortier', 'Lévis', '6, rue des Bouleaux'),
      answers: { name: 'Geneviève Fortier', email: 'genevieve.fortier@exemple.test', address: '6, rue des Bouleaux', city: 'Lévis' },
      activity: [{ at: d(-1, 10, 10), fr: 'Référée par la famille Ouellet', en: 'Referred by the Ouellet family' }] },
  ];
}

/* ============ CRM records (what MBM's CRM would already know about each client, demo data) ============ */
function seedCrm(today) {
  const d = (n, h = 10, m = 0) => { const x = addDays(today, n); x.setHours(h, m, 0, 0); return isoLocal(x); };
  const ev = (n, h, kind, fr, en) => ({ at: d(n, h), kind, fr, en });
  return {
    nordelys: { since: 2022, seasons: 5, ltv: 48760, score: { renew: 97, upsell: 71, churn: 4 },
      best: { fr: 'Mardi et jeudi matin, par courriel', en: 'Tuesday and Thursday mornings, by email' },
      events: [ev(-2, 9, 'email', 'Comptes fournisseurs : facture d’octobre en approbation (BC à jour)', 'Accounts payable: October invoice in approval (PO updated)'), ev(-10, 11, 'deal', 'Renouvellement 2027 gagné : 3 sites, 96 k$ sur 2 ans', '2027 renewal won: 3 sites, $96k over 2 years'), ev(-48, 14, 'note', 'Nouvelle boulangerie à Terrebonne : ouverture en janvier 2027', 'New bakery in Terrebonne: opening in January 2027'), ev(-120, 10, 'ticket', 'Appel de service réglé en 4 h : rat aperçu au quai 2 (Laval)', 'Service call solved within 4 h: rat seen at dock 2 (Laval)')],
      insight: { fr: 'L’audit HACCP annuel a lieu en mars : un registre des stations à jour et un rapport par site rendent le renouvellement presque automatique.', en: 'The yearly HACCP audit is in March: an up-to-date station log and a report per site make the renewal nearly automatic.' },
      nba: { kind: 'offer', prio: 1, key: 'exclusion', site: 'terrebonne', fr: 'Proposer l’exclusion des rongeurs à la boulangerie de Terrebonne avant l’ouverture de janvier : budget d’investissement ouvert jusqu’en décembre.', en: 'Offer rodent exclusion at the Terrebonne bakery before it opens in January: capital budget open until December.' } },
    gagnon: { since: null, seasons: 0, ltv: 0, score: { renew: 0, upsell: 0, churn: 0, win: 68 },
      best: { fr: 'Soirs de semaine, 18 h à 20 h, par texto', en: 'Weekday evenings, 6–8 PM, by text' },
      events: [ev(-1, 19, 'web', 'Plan consulté 3 fois (dernière fois hier, 19 h 05)', 'Plan viewed 3 times (last time yesterday, 7:05 PM)'), ev(-2, 20, 'web', 'Évaluation remplie en 6 min depuis un cellulaire', 'Assessment filled in 6 min from a phone'), ev(-3, 19, 'web', 'Arrivé par une recherche « souris dans les murs Laval »', 'Arrived from a “mice in the walls Laval” search')],
      insight: { fr: 'Un chien et deux enfants : la sécurité des stations d’appâts est sa question no 1.', en: 'A dog and two kids: bait station safety is his #1 question.' },
      nba: { kind: 'call', prio: 1, fr: 'Appeler ce soir entre 18 h et 20 h : 3 consultations sans réponse. Rassurer sur le chien (stations verrouillées), proposer l’inspection jeudi.', en: 'Call tonight between 6 and 8 PM: 3 views with no answer. Reassure him about the dog (locked stations), offer the inspection Thursday.' } },
    nguyen: { since: null, seasons: 0, ltv: 0, score: { win: 54 },
      best: { fr: 'Fin de semaine, par courriel', en: 'Weekends, by email' },
      events: [ev(-1, 21, 'web', 'Plan consulté 3 fois, a comparé avec et sans le traitement biologique des drains', 'Plan viewed 3 times, compared with and without the biological drain treatment'), ev(-3, 21, 'web', 'Objectif : l’approche la plus écologique', 'Goal: the greenest approach')],
      insight: { fr: 'Sensible au volet écologique : le traitement biologique, sans pesticide, et la certification GreenPro sont les arguments décisifs.', en: 'Cares about the green angle: the pesticide-free biological treatment and the GreenPro certification are the deciding arguments.' },
      nba: { kind: 'followup', prio: 2, fr: 'Relancer par courriel samedi : fiche du traitement biologique des drains et de la lutte intégrée.', en: 'Follow up by email Saturday: sheet on the biological drain treatment and integrated pest management.' } },
    simard: { since: 2019, seasons: 8, ltv: 3940, score: { renew: 88, upsell: 64, churn: 12 },
      best: { fr: 'Texto, en semaine', en: 'Text, on weekdays' },
      events: [ev(-30, 19, 'deal', 'Renouvellement 2027 signé en ligne (8e année)', '2027 renewal signed online (8th year)'), ev(-70, 13, 'ticket', 'Plainte : guêpes revenues en août malgré le bouclier (réglée)', 'Complaint: wasps back in August despite the shield (solved)'), ev(-110, 16, 'invoice', 'Retrait de nid de guêpes ajouté en août 2026', 'Wasp nest removal added in August 2026')],
      insight: { fr: 'Client fidèle depuis 2019, une plainte en août : un geste de fidélité le garde pour 2028.', en: 'Loyal since 2019, one complaint in August: a loyalty gesture keeps him for 2028.' },
      nba: { kind: 'offer', prio: 2, key: 'guepes', fr: 'Proposer le retrait de nids en préventif pour l’été 2027 (guêpes en août 2026), avec 10 % fidélité.', en: 'Offer wasp nest removal as a preventive for summer 2027 (wasps in August 2026) with a 10% loyalty discount.' } },
    desjardins: { since: null, seasons: 0, ltv: 0, score: { renew: 81, upsell: 58, churn: 9 },
      best: { fr: 'Courriel, en soirée', en: 'Email, in the evening' },
      events: [ev(-2, 16, 'note', 'Jonathan Roy : odeur dans le vide sanitaire, sous la cuisine', 'Jonathan Roy: smell in the crawl space under the kitchen'), ev(-12, 20, 'deal', 'Nouveau client : entente signée en ligne', 'New client: agreement signed online')],
      insight: { fr: 'Nouveau client arrivé par accroche-porte : la première intervention décide du renouvellement.', en: 'New client who came from a door hanger: the first treatment decides the renewal.' },
      nba: { kind: 'followup', prio: 3, fr: 'La recommandation de gestion des odeurs attend depuis 2 jours : rappel par courriel jeudi.', en: 'The odour management recommendation has been waiting 2 days: email reminder Thursday.' } },
    'jardins-du-parc': { since: null, seasons: 0, ltv: 0, score: { win: 61 },
      best: { fr: 'Courriel au conseil d’administration', en: 'Email to the board' },
      events: [ev(-6, 10, 'email', 'Le CA demande une présentation pour l’assemblée de janvier', 'The board asks for a presentation at the January meeting'), ev(-7, 16, 'web', 'Évaluation reçue du gestionnaire (48 unités)', 'Assessment received from the manager (48 units)')],
      insight: { fr: 'Décision collective : un plan pour tout l’immeuble et un rapport pour l’assemblée sont les arguments clés.', en: 'Group decision: a plan for the whole building and a report for the meeting are the key arguments.' },
      nba: { kind: 'task', prio: 2, fr: 'Préparer une page résumé pour l’assemblée de janvier (unités touchées, plan, prix par unité : 14 $ par mois).', en: 'Prepare a one-pager for the January meeting (units affected, plan, price per unit: $14 a month).' } },
    tremblay: { since: null, seasons: 0, ltv: 0, score: { win: 47 },
      best: { fr: 'Texto, après 17 h', en: 'Text, after 5 PM' },
      events: [ev(0, 9, 'visit', 'Accroche-porte laissé par Mélanie (personne à la maison)', 'Door hanger left by Mélanie (nobody home)')],
      insight: { fr: 'Trois voisins de la rue des Érables ont eu des souris cet automne : la tournée passe devant chez elle.', en: 'Three neighbours on rue des Érables had mice this fall: the route goes right past her house.' },
      nba: { kind: 'followup', prio: 2, fr: 'Si le code QR n’est pas scanné d’ici demain soir : texto avec le lien et l’intervention initiale à 49,99 $.', en: 'If the QR code is not scanned by tomorrow evening: text with the link and the $49.99 first treatment.' } },
    ouellet: { since: null, seasons: 0, ltv: 0, score: { win: 83 },
      best: { fr: 'Appel, midi', en: 'Call, at noon' },
      events: [ev(-3, 18, 'web', 'Inspection réservée en ligne', 'Inspection booked online'), ev(-5, 14, 'web', 'A référé Geneviève Fortier', 'Referred Geneviève Fortier')],
      insight: { fr: 'Référence active : a déjà amené une voisine. Bois de chauffage cordé contre la maison.', en: 'Active referrer: already brought in a neighbour. Firewood stacked against the house.' },
      nba: { kind: 'visit', prio: 3, fr: 'Inspection prévue : vérifier le cadre de la fenêtre de cuisine et le bois de chauffage; apporter le rabais de référence.', en: 'Inspection planned: check the kitchen window frame and the firewood; bring the referral discount.' } },
    leblanc: { since: null, seasons: 0, ltv: 0, score: { win: 76 },
      best: { fr: 'Courriel', en: 'Email' },
      events: [ev(-3, 11, 'visit', 'Inspection faite, entente envoyée (pas encore ouverte)', 'Inspection done, agreement sent (not opened yet)')],
      insight: { fr: 'Entente envoyée il y a 3 jours, jamais ouverte.', en: 'Agreement sent 3 days ago, never opened.' },
      nba: { kind: 'followup', prio: 1, fr: 'Entente non ouverte depuis 3 jours : texto court avec le lien de signature.', en: 'Agreement unopened for 3 days: short text with the signing link.' } },
  };
}
