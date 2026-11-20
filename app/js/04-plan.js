/* ============ Inspection plan: a schematic cutaway of the client's building, drawn like an architect's section ============ */
let PLAN_UID = 0;
/* Signs that mean rodents or wildlife are getting in: the entry points show up on the plan */
const RODENT_SIGNS = ['crottes', 'grattements', 'rats', 'ratons'];
function blobPath(cx, cy, r, R, pts = 11, jitter = 0.38) {
  const a = [];
  for (let i = 0; i < pts; i++) {
    const ang = (i / pts) * Math.PI * 2;
    const rr = r * (1 - jitter / 2 + R() * jitter);
    a.push([cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 0.8]);
  }
  let d = '';
  for (let i = 0; i < pts; i++) {
    const p0 = a[(i - 1 + pts) % pts], p1 = a[i], p2 = a[(i + 1) % pts];
    const m1 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], m2 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
    d += (i === 0 ? `M${m1[0].toFixed(1)} ${m1[1].toFixed(1)}` : '') + `Q${p1[0].toFixed(1)} ${p1[1].toFixed(1)} ${m2[0].toFixed(1)} ${m2[1].toFixed(1)}`;
  }
  return d + 'Z';
}
/* Rooms (zones the client can flag), label positions, anchors for each sign, entry points and the protected perimeter */
function planLayout(p) {
  const type = propTypeOf(p);
  const big = type === 'condo' || type === 'commerce';
  const trees = Math.min(treesOf(p), 3), wood = !!A(p).treeSick;
  if (!big) {
    return { type, big, trees, wood,
      zones: { grenier: 'M156 150L300 78L444 150Z', chambres: 'M150 150H450V222H150Z', cuisine: 'M150 222H300V300H150Z', 'sous-sol': 'M150 300H450V364H150Z', garage: 'M450 236H564V300H450Z', exterieur: 'M36 236H124V300H36ZM566 246H636V300H566Z' },
      labels: { grenier: [300, 137, 'middle'], chambres: [444, 162, 'end'], cuisine: [294, 235, 'end'], salon: [444, 235, 'end'], 'sous-sol': [158, 314, 'start'], garage: [558, 252, 'end'], exterieur: [42, 320, 'start'] },
      A: { kitchen: [[256, 298]], cupboard: [[170, 243]], basement: [[232, 361], [356, 361]], wall: [[156, 258], [216, 227], [330, 158]], bins: [[620, 297]], garage: [[556, 296]],
        attic: [[226, 138]], beds: [[168, 204, 60], [342, 204, 60]], pantry: [[178, 237]], drain: [[300, 356], [224, 270]], eave: [[138, 168]], smell: [[330, 360]], sill: [[409, 221]], ants: [[431, 204], [436, 189], [428, 176]], trail: [156, 214, 278.5], roach: [[254, 297, 10], [206, 278, -20], [286, 299, 160]] },
      entries: [[148, 307], [452, 322], [522, 299], [156, 148], [440, 144]],
      shield: 'M134 300V156L300 56L474 152V228L580 236V300' };
  }
  return { type, big, trees, wood,
    zones: { grenier: 'M114 70H476V98H114Z', chambres: 'M120 96H470V224H120Z', cuisine: 'M120 224H470V300H120Z', 'sous-sol': 'M120 300H470V364H120Z', garage: 'M470 238H586V300H470Z', exterieur: 'M36 236H116V300H36ZM588 250H638V300H588Z' },
    labels: { grenier: [128, 90, 'start'], chambres: [464, 114, 'end'], cuisine: [464, 238, 'end'], 'sous-sol': [128, 314, 'start'], garage: [582, 252, 'end'], exterieur: [42, 320, 'start'] },
    A: { kitchen: [[262, 298]], cupboard: [[140, 244]], basement: [[214, 361], [412, 361]], wall: [[124, 252], [300, 228], [244, 164]], bins: [[592, 297]], garage: [[484, 296]],
      attic: [[356, 86]], beds: [[172, 142, 54], [288, 142, 54], [405, 206, 54]], pantry: [[150, 238]], drain: [[300, 356], [196, 270]], eave: [[110, 112]], smell: [[440, 360]], sill: [[150, 221]], ants: [[126, 208], [130, 194], [124, 182]], trail: [126, 182, 278.5], roach: [[262, 297, 10], [210, 278, -20], [252, 299, 160]] },
    entries: [[118, 307], [472, 322], [528, 299], [162, 96], [452, 96]],
    shield: 'M110 300V66H482V232L596 238V300' };
}
const f1 = (v) => Number(v).toFixed(1);
/* Small glyphs, one per sign */
function gDroppings(x, y, R) { let s = ''; for (let i = 0; i < 8; i++) { const cx = x + (R() - .5) * 26, cy = y - R() * 2.2; s += `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="1.9" ry="1.1" fill="#3E2E26" transform="rotate(${Math.round((R() - .5) * 70)} ${f1(cx)} ${f1(cy)})"/>`; } return s; }
function gScratch(x, y) { return `<g stroke="#7B6A5D" stroke-width="1.5" stroke-linecap="round" fill="none"><path d="M${x - 7} ${y + 5}l5 -10M${x - 2} ${y + 6}l5 -10M${x + 3} ${y + 7}l5 -10"/><path d="M${x + 11} ${y - 6}q4 5 0 10M${x + 15} ${y - 9}q6 8 0 16" opacity=".7"/></g>`; }
function gRat(x, y, flip) {
  const k = flip ? -1 : 1;
  return `<g transform="translate(${x} ${y}) scale(${k} 1)"><path d="M-13 -1c-6 -1 -10 2 -13 5" stroke="#55443A" stroke-width="1.6" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="-5" rx="12" ry="6" fill="#55443A"/><ellipse cx="11" cy="-7" rx="6" ry="4.2" fill="#55443A"/><circle cx="10" cy="-11" r="2.6" fill="#6E5B4F"/><circle cx="14" cy="-8" r=".9" fill="#F4EFE8"/><path d="M-6 0v1.5M5 0v1.5" stroke="#55443A" stroke-width="1.6" stroke-linecap="round"/></g>`;
}
function gRaccoon(x, y) {
  return `<g transform="translate(${x} ${y})"><path d="M-8 -7l-3 -7 7 4M8 -7l3 -7 -7 4" fill="#6F6155"/><circle r="10" fill="#8C7B6B"/><path d="M-9 -1.5c3 -3 6 -3 9 -1 3 -2 6 -2 9 1 -2 4 -6 4 -9 2 -3 2 -7 2 -9 -2z" fill="#2A2420"/><circle cx="-4.2" cy="-1.6" r="1.4" fill="#F4EFE8"/><circle cx="4.2" cy="-1.6" r="1.4" fill="#F4EFE8"/><ellipse cy="5" rx="3.4" ry="2.4" fill="#E9E1D6"/><circle cy="4.2" r="1.2" fill="#2A2420"/></g>`;
}
function gRoach(x, y, rot) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M-3 -2.5l-3 -2M-3 2.5l-3 2M0 -3v-3M0 3v3M3 -2.5l3 -2.5M3 2.5l3 2.5M5.5 -1l5 -4M5.5 1l5 4" stroke="#5A3018" stroke-width=".9" stroke-linecap="round"/><ellipse rx="5.6" ry="3.1" fill="#8A4B2A"/><ellipse cx="4.6" rx="1.7" ry="2" fill="#5A3018"/></g>`;
}
function gAnt(x, y, rot, big) {
  const k = big ? 1.5 : 1;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${k})"><circle cx="-2.4" r="1.3" fill="#2B1B10"/><circle r=".9" fill="#2B1B10"/><circle cx="2" r="1.1" fill="#2B1B10"/><path d="M-1 -.5l-1 -2M0 -.5l0 -2.2M1 -.5l1 -2M-1 .5l-1 2M0 .5l0 2.2M1 .5l1 2" stroke="#2B1B10" stroke-width=".45"/></g>`;
}
function gMoth(x, y, r) { return `<path d="M${x} ${y}l-${4 + r} 3.4l${4 + r} -1l${4 + r} 1z" fill="#C7A35A" stroke="#8D7136" stroke-width=".6"/>`; }
function gFlies(x, y, R) { let s = ''; for (let i = 0; i < 11; i++) { const cx = x + (R() - .5) * 26, cy = y - R() * 20; s += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="1.15" fill="#4D5961"/><path d="M${f1(cx - 1.6)} ${f1(cy - 1.3)}l1.6 1.3l1.6 -1.3" stroke="#9AA6AE" stroke-width=".6" fill="none"/>`; } return s; }
function gNest(x, y) {
  return `<g transform="translate(${x} ${y})"><path d="M0 -14v4" stroke="#8D7A52" stroke-width="1.4"/><ellipse rx="8.5" ry="10.5" fill="#DCCCA4" stroke="#A8956A" stroke-width="1.1"/><path d="M-8 -4q8 3 16 0M-8.4 1q8.4 3 16.8 0M-7 6q7 3 14 0" stroke="#B9A57A" stroke-width=".9" fill="none"/><circle cy="9" r="1.6" fill="#5C4A2C"/></g>`
    + [[16, -6], [20, 6], [-15, 9]].map(([dx, dy]) => `<g transform="translate(${x + dx} ${y + dy})"><ellipse rx="3" ry="1.7" fill="#E0A526"/><path d="M-1 -1.6v3.2M1 -1.6v3.2" stroke="#2A2420" stroke-width=".8"/><ellipse cx="-.4" cy="-2" rx="1.9" ry="1.1" fill="rgba(255,255,255,.75)"/></g>`).join('');
}
function gSmell(x, y) { return `<g stroke="#7F8F5A" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".9">${[-10, 0, 10].map((dx, i) => `<path d="M${x + dx} ${y}c-5 -6 5 -10 0 -16s5 -10 0 -16" opacity="${1 - i * .2}"/>`).join('')}</g>`; }
function gSawdust(x, y) { return `<path d="M${x - 10} ${y}q10 -9 20 0z" fill="#E3CA94" stroke="#B9975A" stroke-width=".8"/><circle cx="${x - 3}" cy="${y - 3}" r=".7" fill="#B9975A"/><circle cx="${x + 3}" cy="${y - 2}" r=".7" fill="#B9975A"/>`; }
function markerSvg(p, L, k) {
  const R = rng(hashStr(p.slug + ':' + k)), A_ = L.A;
  let s = '';
  if (k === 'crottes') A_.kitchen.concat(A_.cupboard, A_.basement).forEach(([x, y]) => { s += gDroppings(x, y, R); });
  if (k === 'grattements') A_.wall.forEach(([x, y]) => { s += gScratch(x, y); });
  if (k === 'rats') { s += gRat(A_.bins[0][0], A_.bins[0][1], true) + gRat(A_.garage[0][0], A_.garage[0][1], L.big ? false : true); }
  if (k === 'ratons') s += gRaccoon(A_.attic[0][0], A_.attic[0][1]);
  if (k === 'coquerelles') A_.roach.forEach(([x, y, r]) => { s += gRoach(x, y, r); });
  if (k === 'fourmis_int') { const [x0, x1, y] = A_.trail; for (let x = x0; x <= x1; x += 6.5) s += gAnt(f1(x), f1(y + Math.sin(x / 9) * .9), 0, false); }
  if (k === 'sciure') { s += gSawdust(A_.sill[0][0], A_.sill[0][1]); A_.ants.forEach(([x, y], i) => { s += gAnt(x, y, -70 - i * 8, true); }); }
  if (k === 'piqures') A_.beds.forEach(([x, y, w]) => { for (let i = 0; i < 9; i++) s += `<circle cx="${f1(x + 16 + R() * (w - 20))}" cy="${f1(y + 3 + R() * 7)}" r="1.4" fill="#B5473A"/>`; });
  if (k === 'gardemanger') A_.pantry.forEach(([x, y]) => { [[-10, -16, 0], [6, -19, 1], [18, -10, .5], [-2, 14, 1]].forEach(([dx, dy, r]) => { s += gMoth(x + dx, y + dy, r); }); });
  if (k === 'mouches') A_.drain.forEach(([x, y]) => { s += gFlies(x, y, R); });
  if (k === 'nid_guepes') s += gNest(A_.eave[0][0], A_.eave[0][1]);
  if (k === 'odeur') A_.smell.forEach(([x, y]) => { s += gSmell(x, y); });
  return s;
}
function streetName(addr) {
  const s = String(addr || '').replace(/^\s*[\d\-–A-Za-z]{0,6}\d[\w\-–]*\s*,?\s*/, '').trim();
  return s ? s.toUpperCase() : '';
}
function civicNo(addr) { const m = /^\s*(\d+[A-Za-z]?)/.exec(String(addr || '')); return m ? m[1] : ''; }
/* The house: two floors, an attic, a basement and an attached garage */
function houseSvg(L) {
  const W = 'var(--plan-wall)';
  let s = '';
  /* Foundation, basement and garage */
  s += `<rect x="140" y="364" width="320" height="8" fill="var(--plan-concrete)"/><rect x="145" y="298" width="310" height="68" fill="var(--plan-concrete)"/><rect x="150" y="300" width="300" height="64" fill="var(--plan-room-2)"/>`;
  s += `<rect x="450" y="236" width="114" height="64" fill="var(--plan-room-2)"/><path d="M444 232L570 242" stroke="var(--plan-roof)" stroke-width="7" stroke-linecap="round"/><path d="M564 240V300" stroke="${W}" stroke-width="4"/>`;
  /* Living floors and attic */
  s += `<path d="M150 150L300 76L450 150Z" fill="var(--plan-attic)"/><rect x="150" y="150" width="300" height="150" fill="var(--plan-room)"/>`;
  s += `<path d="M154 147q6 -5 12 0t12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0 12 0" stroke="#E6CF9C" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  s += `<rect x="372" y="84" width="18" height="34" fill="var(--plan-roof)"/><path d="M128 156L300 64L472 156" stroke="var(--plan-roof)" stroke-width="9" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
  s += `<path d="M430 131h12M432 136h12M434 141h10" stroke="${W}" stroke-width="1.2" opacity=".6"/>`;
  /* Windows */
  [[176, 168, 30, 26], [394, 168, 30, 26], [210, 236, 34, 26], [366, 238, 40, 28], [332, 302, 30, 10]].forEach(([x, y, w, h]) => { s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="var(--plan-glass)" stroke="${W}" stroke-width="1.6"/><path d="M${x + w / 2} ${y}V${y + h}" stroke="${W}" stroke-width="1" opacity=".5"/>`; });
  /* Bedrooms: two beds */
  [[168, 204], [342, 204]].forEach(([x, y]) => { s += `<rect x="${x}" y="${y}" width="60" height="16" rx="3" fill="#E9EEF2" stroke="${W}" stroke-width="1.3"/><rect x="${x + 3}" y="${y + 3}" width="13" height="7" rx="2" fill="#FFFFFF" stroke="${W}" stroke-width=".9"/><path d="M${x} ${y + 16}v4M${x + 60} ${y + 16}v4" stroke="${W}" stroke-width="1.3"/>`; });
  /* Kitchen: pantry cupboard, counter and sink, fridge; living room: sofa */
  s += `<rect x="156" y="228" width="44" height="18" rx="1.5" fill="var(--plan-cab)" stroke="${W}" stroke-width="1.2"/><path d="M178 228v18" stroke="${W}" stroke-width=".9"/>`;
  s += `<rect x="152" y="280" width="92" height="20" fill="var(--plan-cab)" stroke="${W}" stroke-width="1.2"/><path d="M150 280H246" stroke="${W}" stroke-width="2.4"/><path d="M214 280v-4h20v4M228 276v-8h-6" stroke="${W}" stroke-width="1.3" fill="none"/>`;
  s += `<rect x="270" y="244" width="26" height="56" rx="2" fill="#F1F5F7" stroke="${W}" stroke-width="1.3"/><path d="M270 262H296M274 250v6M274 268v8" stroke="${W}" stroke-width="1.1"/>`;
  s += `<path d="M330 300v-14q0-5 5-5h70q5 0 5 5v14M326 300v-9h8M414 300v-9h-8" stroke="${W}" stroke-width="1.4" fill="#E9EEF2"/>`;
  /* Basement: furnace, water heater, laundry, floor drain, stairs */
  s += `<rect x="160" y="320" width="24" height="42" rx="2" fill="#E9EEF2" stroke="${W}" stroke-width="1.2"/><rect x="190" y="330" width="16" height="32" rx="7" fill="#E9EEF2" stroke="${W}" stroke-width="1.2"/>`;
  s += `<rect x="222" y="340" width="22" height="22" rx="2" fill="#FFFFFF" stroke="${W}" stroke-width="1.2"/><circle cx="233" cy="352" r="6" fill="none" stroke="${W}" stroke-width="1.1"/><rect x="246" y="340" width="22" height="22" rx="2" fill="#FFFFFF" stroke="${W}" stroke-width="1.2"/><circle cx="257" cy="352" r="6" fill="none" stroke="${W}" stroke-width="1.1"/>`;
  s += `<circle cx="300" cy="362" r="3.2" fill="#FFFFFF" stroke="${W}" stroke-width="1.2"/><path d="M298 362h4M300 360v4" stroke="${W}" stroke-width=".8"/>`;
  s += `<path d="M446 300V308H438V316H430V324H422V332H414V340H406V348H398V356H390V364" stroke="${W}" stroke-width="1.5" fill="none"/>`;
  /* Garage: a car */
  s += `<path d="M470 296v-12q2-7 9-8l10-8h30l12 8q9 1 10 8v12z" fill="#E1E8EC" stroke="${W}" stroke-width="1.3"/><circle cx="486" cy="296" r="5" fill="${W}"/><circle cx="532" cy="296" r="5" fill="${W}"/><path d="M492 276l6-6h20l6 6z" fill="var(--plan-glass)"/>`;
  /* Bins outside */
  s += `<rect x="578" y="279" width="12" height="21" rx="2" fill="#3E5562"/><rect x="592" y="281" width="12" height="19" rx="2" fill="#4F8B5F"/><path d="M576 279h16M590 281h16" stroke="${W}" stroke-width="1.6" stroke-linecap="round"/>`;
  /* Walls and floor slabs */
  s += `<path d="M150 150V300M450 150V300" stroke="${W}" stroke-width="6"/><path d="M150 150H450M150 222H450" stroke="${W}" stroke-width="4"/><path d="M140 300H460" stroke="${W}" stroke-width="5"/><path d="M146 300V368M454 300V368" stroke="${W}" stroke-width="3"/>`;
  s += `<path d="M300 150V188M300 222V262" stroke="${W}" stroke-width="3"/>`;
  return s;
}
/* A three-storey building (condo or business) with a loading dock or garage */
function buildingSvg(L) {
  const W = 'var(--plan-wall)', org = L.type === 'commerce';
  let s = '';
  s += `<rect x="112" y="364" width="366" height="8" fill="var(--plan-concrete)"/><rect x="115" y="298" width="360" height="68" fill="var(--plan-concrete)"/><rect x="120" y="300" width="350" height="64" fill="var(--plan-room-2)"/>`;
  s += `<rect x="470" y="238" width="116" height="62" fill="var(--plan-room-2)"/><path d="M466 234L592 242" stroke="var(--plan-roof)" stroke-width="7" stroke-linecap="round"/><path d="M586 242V300" stroke="${W}" stroke-width="4"/>`;
  s += `<rect x="120" y="96" width="350" height="204" fill="var(--plan-room)"/>`;
  s += `<rect x="392" y="76" width="44" height="20" rx="2" fill="#DCE4E8" stroke="${W}" stroke-width="1.3"/><circle cx="414" cy="86" r="6" fill="none" stroke="${W}" stroke-width="1.1"/><path d="M114 96H476" stroke="var(--plan-roof)" stroke-width="8" stroke-linecap="round"/>`;
  /* Units on the two upper floors */
  [96, 160].forEach((y) => [120, 237, 353].forEach((x, i) => {
    s += `<rect x="${x + 12}" y="${y + 12}" width="30" height="22" rx="1.5" fill="var(--plan-glass)" stroke="${W}" stroke-width="1.4"/>`;
    if (!org) s += `<rect x="${x + 52}" y="${y + 46}" width="54" height="14" rx="3" fill="#E9EEF2" stroke="${W}" stroke-width="1.2"/><rect x="${x + 55}" y="${y + 49}" width="11" height="6" rx="1.5" fill="#FFFFFF" stroke="${W}" stroke-width=".8"/>`;
    else s += `<rect x="${x + 56}" y="${y + 44}" width="46" height="5" fill="#E9EEF2" stroke="${W}" stroke-width="1.1"/><path d="M${x + 60} ${y + 49}v14M${x + 98} ${y + 49}v14" stroke="${W}" stroke-width="1.1"/><rect x="${x + 70}" y="${y + 31}" width="18" height="12" rx="1.5" fill="var(--plan-glass)" stroke="${W}" stroke-width="1"/>`;
  }));
  /* Ground floor: kitchen on the left, lobby on the right */
  s += `<rect x="128" y="232" width="44" height="16" rx="1.5" fill="var(--plan-cab)" stroke="${W}" stroke-width="1.2"/><rect x="124" y="280" width="102" height="20" fill="var(--plan-cab)" stroke="${W}" stroke-width="1.2"/><path d="M122 280H228" stroke="${W}" stroke-width="2.4"/><path d="M186 280v-4h20v4M200 276v-8h-6" stroke="${W}" stroke-width="1.3" fill="none"/>`;
  s += `<rect x="232" y="246" width="24" height="54" rx="2" fill="#F1F5F7" stroke="${W}" stroke-width="1.3"/>`;
  s += `<rect x="330" y="254" width="48" height="28" fill="#E9EEF2" stroke="${W}" stroke-width="1.1"/><path d="M330 263.3H378M330 272.6H378M346 254V282M362 254V282" stroke="${W}" stroke-width=".8"/><rect x="414" y="246" width="32" height="54" fill="var(--plan-glass)" stroke="${W}" stroke-width="1.6"/><path d="M430 246V300" stroke="${W}" stroke-width="1"/>`;
  /* Basement: boiler, shelves, floor drain */
  s += `<rect x="130" y="318" width="30" height="44" rx="2" fill="#E9EEF2" stroke="${W}" stroke-width="1.2"/><path d="M330 324H400M330 338H400M330 352H400M332 322V362M398 322V362" stroke="${W}" stroke-width="1.3"/><circle cx="300" cy="362" r="3.2" fill="#FFFFFF" stroke="${W}" stroke-width="1.2"/><path d="M298 362h4M300 360v4" stroke="${W}" stroke-width=".8"/>`;
  /* Loading dock or garage door, dumpster */
  s += `<rect x="492" y="256" width="68" height="44" fill="#E1E8EC" stroke="${W}" stroke-width="1.4"/><path d="M492 267H560M492 278H560M492 289H560" stroke="${W}" stroke-width=".9"/>`;
  s += `<path d="M600 300v-20h34v20z" fill="#3E5562"/><path d="M598 280h38" stroke="${W}" stroke-width="2" stroke-linecap="round"/>`;
  s += `<path d="M120 96V300M470 96V300" stroke="${W}" stroke-width="6"/><path d="M120 160H470M120 224H470" stroke="${W}" stroke-width="4"/><path d="M110 300H480" stroke="${W}" stroke-width="5"/><path d="M116 300V368M474 300V368" stroke="${W}" stroke-width="3"/>`;
  s += `<path d="M237 96V136M237 160V200M353 96V136M353 160V200M300 224V262" stroke="${W}" stroke-width="3"/>`;
  return s;
}
function treesSvg(L) {
  let s = '';
  const tree = (x, y, r, trunk) => `<rect x="${x - 3}" y="${y}" width="6" height="${300 - y}" fill="#6B5340"/><circle cx="${x + 3}" cy="${y - r * .2 + 3}" r="${r}" fill="rgba(0,0,0,.08)"/><circle cx="${x}" cy="${y - r * .2}" r="${r}" fill="var(--plan-tree)"/><circle cx="${x - r * .32}" cy="${y - r * .5}" r="${r * .45}" fill="rgba(255,255,255,.12)"/><circle cx="${x + r * .3}" cy="${y + r * .1}" r="${r * .5}" fill="var(--plan-tree-2)" opacity=".55"/>${trunk || ''}`;
  if (L.trees >= 1) s += L.big ? tree(72, 246, 30) : tree(88, 214, 40, `<path d="M104 196q20 -26 34 -44" stroke="#6B5340" stroke-width="4" stroke-linecap="round" fill="none"/><circle cx="132" cy="160" r="13" fill="var(--plan-tree)"/>`);
  if (L.trees >= 2) s += `<ellipse cx="${L.big ? 610 : 618}" cy="290" rx="17" ry="13" fill="var(--plan-tree)"/><ellipse cx="${L.big ? 614 : 622}" cy="286" rx="8" ry="6" fill="rgba(255,255,255,.12)"/>`;
  if (L.trees >= 3) s += L.big ? tree(44, 272, 16) : tree(44, 262, 18);
  if (L.wood) s += [[128, 296], [138, 296], [133, 287], [143, 287], [123, 287]].filter((w, i) => !L.big || i < 3).map(([x, y]) => `<circle cx="${L.big ? x - 22 : x}" cy="${y}" r="5" fill="#C9A46B" stroke="#8A6A3A" stroke-width="1"/><circle cx="${L.big ? x - 22 : x}" cy="${y}" r="1.6" fill="none" stroke="#8A6A3A" stroke-width=".7"/>`).join('');
  return s;
}
function zoneName(L, k) {
  if (L.big) return ({ grenier: t('TOIT', 'ROOF'), chambres: L.type === 'commerce' ? t('BUREAUX', 'OFFICES') : t('LOGEMENTS', 'UNITS'), cuisine: t('REZ-DE-CHAUSSÉE', 'GROUND FLOOR'), 'sous-sol': t('SOUS-SOL', 'BASEMENT'), garage: L.type === 'commerce' ? t('QUAI', 'DOCK') : t('GARAGE', 'GARAGE'), exterieur: t('EXTÉRIEUR', 'OUTSIDE') })[k] || '';
  return ({ grenier: t('ENTRETOIT', 'ATTIC'), chambres: t('CHAMBRES', 'BEDROOMS'), cuisine: t('CUISINE', 'KITCHEN'), salon: t('SALON', 'LIVING'), 'sous-sol': t('SOUS-SOL', 'BASEMENT'), garage: t('GARAGE', 'GARAGE'), exterieur: t('EXTÉRIEUR', 'OUTSIDE') })[k] || '';
}
const zonesOn = (p) => (A(p).zones || []);
const rodentsOn = (probs) => probs.some((k) => RODENT_SIGNS.includes(k));
function planSvg(p, o = {}) {
  const uid = `pl${++PLAN_UID}`;
  const L = planLayout(p);
  const now = o.now != null ? o.now : healthNow(p), after = o.after != null ? o.after : healthAfter(p);
  const probs = o.probs || A(p).problems || [];
  const area = areaOf(p), zs = zonesOn(p);
  const zones = Object.keys(L.zones).map((k) => `<path class="zone ${zs.includes(k) ? 'is-on' : ''}" data-z="${k}" d="${L.zones[k]}"/>`).join('');
  const labels = Object.keys(L.labels).map((k) => { const [x, y, a] = L.labels[k]; return `<text class="zl" x="${x}" y="${y}" text-anchor="${a}">${esc(zoneName(L, k))}</text>`; }).join('');
  const marks = PROBLEMS.map((pr) => `<g class="mk ${probs.includes(pr.key) ? 'is-on' : ''}" data-p="${pr.key}">${markerSvg(p, L, pr.key)}</g>`).join('');
  const entries = `<g class="entry ${rodentsOn(probs) ? 'is-on' : ''}">${L.entries.map(([x, y]) => `<circle class="ep" cx="${x}" cy="${y}" r="7.5" fill="none" stroke="#C9533C" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="4.2" fill="#C9533C" stroke="#FFFFFF" stroke-width="1.4"/>`).join('')}</g>`;
  const sealed = L.entries.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6.5" fill="var(--green)" stroke="#FFFFFF" stroke-width="1.6"/><path d="M${x - 3} ${y}l2.1 2.2l4 -4.4" stroke="var(--on-green)" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const street = streetName(p.client.address || A(p).address);
  const civic = civicNo(p.client.address || A(p).address);
  const label = `${t('Coupe schématique du bâtiment', 'Schematic cutaway of the building')}, ${p.client.city || ''}`;
  const cap = o.caption || (L.big ? t('au total, à valider', 'in total, to confirm') : t('habitables, à valider', 'living area, to confirm'));
  return `<svg class="plan ${o.mode === 'after' ? 'is-after' : ''}" data-plan="${esc(p.slug)}"${o.probs ? ' data-fixed="1"' : ''} viewBox="0 0 640 440" role="img" aria-label="${esc(label)}" style="--lawn:#${lawnColor(now).slice(1)};--lawn-after:#${lawnColor(after).slice(1)}">
    <defs>
      <pattern id="gr-${uid}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="var(--plan-grid)" stroke-width="1"/></pattern>
      <pattern id="ht-${uid}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V9" stroke="var(--plan-soil-line)" stroke-width="1.4"/></pattern>
    </defs>
    <rect x="0" y="0" width="640" height="440" fill="var(--plan-ground)"/>
    <rect x="0" y="0" width="640" height="300" fill="url(#gr-${uid})"/>
    <rect x="0" y="300" width="640" height="104" fill="var(--plan-soil)"/><rect x="0" y="300" width="640" height="104" fill="url(#ht-${uid})"/>
    <path d="M0 300H640" stroke="var(--plan-grass)" stroke-width="3.2"/>
    ${treesSvg(L)}
    ${L.big ? buildingSvg(L) : houseSvg(L)}
    ${zones}
    ${labels}
    ${marks}
    ${entries}
    <g class="mk-after"><path d="${L.shield}" fill="none" stroke="var(--green)" stroke-width="2.4" stroke-dasharray="7 6" stroke-linejoin="round"/>${sealed}<text x="${L.big ? 296 : 300}" y="${L.big ? 58 : 46}" text-anchor="middle" font-size="10.5" font-weight="600" letter-spacing="1.6" style="fill:var(--green-deep)">${esc(t('PÉRIMÈTRE PROTÉGÉ', 'PROTECTED PERIMETER'))}</text></g>
    <g transform="translate(26 22)"><rect width="168" height="44" rx="9" class="pl-label"/><text x="12" y="19" font-size="13" font-weight="600" letter-spacing=".5">${esc(t('DOSSIER', 'FILE'))} ${esc(lotNumber(p))}</text><text x="12" y="35" font-size="11" opacity=".75">${esc(`${civic ? civic + ' · ' : ''}${(p.client.city || '').toUpperCase()}`)}</text></g>
    <g transform="translate(${S.lang === 'en' ? 438 : 430} 22)"><rect width="${S.lang === 'en' ? 176 : 184}" height="48" rx="9" class="pl-label"/><text x="12" y="21" font-size="16" font-weight="700" data-area-label>≈ ${esc(fmtArea(area))}</text><text x="12" y="38" font-size="11.5" opacity=".75">${esc(cap)}</text></g>
    <rect x="0" y="404" width="640" height="36" fill="var(--plan-strip)"/>
    ${street ? `<text x="620" y="427" text-anchor="end" font-size="12" letter-spacing="1.8" style="fill:rgba(255,255,255,.7)">${esc(street)}</text>` : ''}
    <text x="20" y="427" font-size="11" letter-spacing="1.2" style="fill:rgba(255,255,255,.55)">${esc(t('COUPE SCHÉMATIQUE · MESURES À L’INSPECTION', 'SCHEMATIC CUTAWAY · MEASURED AT THE INSPECTION'))}</text>
  </svg>`;
}
/* Light update when only the signs, the rooms or the frequency change: no re-render, so markers fade in and out */
function updatePlans(p) {
  $$(`svg.plan[data-plan="${p.slug}"]:not([data-fixed])`).forEach((svg) => {
    const probs = A(p).problems || [], zs = zonesOn(p);
    $$('.mk', svg).forEach((g) => g.classList.toggle('is-on', probs.includes(g.dataset.p)));
    $$('.zone', svg).forEach((z) => z.classList.toggle('is-on', zs.includes(z.dataset.z)));
    $$('.entry', svg).forEach((g) => g.classList.toggle('is-on', rodentsOn(probs)));
    svg.style.setProperty('--lawn', lawnColor(healthNow(p)));
    svg.style.setProperty('--lawn-after', lawnColor(healthAfter(p)));
  });
}
