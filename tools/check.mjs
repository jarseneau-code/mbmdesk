#!/usr/bin/env node
// Vérification avant chaque envoi (git push) : rien de lisible ne doit être publié sans mot de passe.
//
//   node tools/check.mjs                           vérifie la structure et le chiffrement
//   MBM_PASSWORD='…' node tools/check.mjs     vérifie aussi que le paquet s'ouvre avec ce mot de passe
//
// Échoue (code 1) si : un fichier inattendu est dans public/, une image ou du code du portail y est en clair,
// le paquet n'est pas chiffré ou n'est pas celui que cite la page, une page n'a pas noindex/nofollow,
// les en-têtes ou robots.txt manquent.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { ROOT, RUNTIME_MARK } from './build.mjs';
import { unb64, passwordKey, decryptBytes, unpack } from './lib.mjs';

const PUB = join(ROOT, 'public');
const STATIC_FILES = new Set(['index.html', '404.html', 'robots.txt', '_headers', 'favicon.svg']);
// Marqueurs du portail en clair : ils ne doivent jamais apparaître dans public/ hors du paquet chiffré.
const PLAINTEXT_MARKERS = ['PORTAL_TEMPLATE', 'seedClients', 'ADMIN_PIN', 'contractSections', 'MBM-2027', 'LOGO_WM', 'planSvg', 'dh__coupon', 'RENEW_STEPS', 'termCommits'];
const FILE_SIGNATURES = [['JPEG', [0xFF, 0xD8, 0xFF]], ['WebP', [0x52, 0x49, 0x46, 0x46]], ['PNG', [0x89, 0x50, 0x4E, 0x47]], ['gzip', [0x1F, 0x8B]]];
const MIN_BUNDLE = 40 * 1024; // le portail compressé fait ~90 Ko : un paquet plus petit est incomplet

function walk(dir) { return readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p]; }); }
const has = (buf, sig) => { for (let i = 0; i + sig.length <= buf.length; i++) { let ok = true; for (let j = 0; j < sig.length; j++) if (buf[i + j] !== sig[j]) { ok = false; break; } if (ok) return true; } return false; };

export async function runChecks({ password } = {}) {
  const errors = [], fail = (m) => errors.push(m);
  const read = (p) => readFileSync(p, 'utf8');

  const headers = existsSync(join(PUB, '_headers')) ? read(join(PUB, '_headers')) : '';
  if (!/X-Robots-Tag:\s*noindex,\s*nofollow/i.test(headers)) fail('public/_headers : X-Robots-Tag noindex, nofollow manquant');
  const robots = existsSync(join(PUB, 'robots.txt')) ? read(join(PUB, 'robots.txt')) : '';
  if (!/User-agent:\s*\*\s*[\r\n]+Disallow:\s*\/\s*$/im.test(robots)) fail('public/robots.txt : « Disallow: / » manquant');

  const bundles = [];
  for (const file of walk(PUB)) {
    const rel = relative(PUB, file).split('\\').join('/');
    if (/^bundle\/app\.[0-9a-f]{16}\.bin$/.test(rel)) { bundles.push(rel); continue; }
    if (!STATIC_FILES.has(rel)) { fail('fichier inattendu dans public/ : ' + rel + ' (les images restent dans app/assets/, elles sont publiées chiffrées)'); continue; }
    if (rel.endsWith('.html') && !/<meta name="robots" content="noindex, nofollow/.test(read(file))) fail(rel + ' : balise robots noindex, nofollow manquante');
  }
  if (bundles.length !== 1) fail('public/bundle/ doit contenir exactement un paquet chiffré (trouvé : ' + bundles.length + ')');

  const site = existsSync(join(ROOT, 'site.json')) ? JSON.parse(read(join(ROOT, 'site.json'))) : null;
  if (!site || !site.s || !site.check || !(site.it >= 100000)) fail('site.json : sel, itérations ou témoin manquant');

  const index = existsSync(join(PUB, 'index.html')) ? read(join(PUB, 'index.html')) : '';
  const pm = /<script type="application\/json" id="vd-payload">([\s\S]*?)<\/script>/.exec(index);
  let p = null;
  try { p = pm && JSON.parse(pm[1]); } catch (e) { p = null; }
  if (!p || p.v !== 1 || p.kdf !== 'PBKDF2-SHA256' || !(p.it >= 100000) || !p.s || !p.iv || !p.f) fail('public/index.html : ce n’est pas une page d’entrée chiffrée valide');
  else {
    if (site && p.s !== site.s) fail('public/index.html : le sel ne correspond pas à site.json (relancer tools/publish.mjs)');
    if (!bundles.includes(String(p.f).replace(/^\//, ''))) fail('public/index.html cite ' + p.f + ', absent de public/bundle/');
  }
  if (/__(?:LOGO|VDLOGO|PAYLOAD)__/.test(index)) fail('public/index.html : un gabarit __…__ n’a pas été remplacé');
  for (const rel of ['index.html', '404.html']) {
    if (!existsSync(join(PUB, rel))) { fail('public/' + rel + ' manquant'); continue; }
    const txt = read(join(PUB, rel));
    for (const mk of PLAINTEXT_MARKERS) if (txt.includes(mk)) fail(rel + ' : contenu du portail en clair détecté (« ' + mk + ' »)');
  }

  for (const rel of bundles) {
    const buf = new Uint8Array(readFileSync(join(PUB, rel)));
    if (buf.length < MIN_BUNDLE) fail(rel + ' : paquet trop petit pour contenir le portail');
    const text = Buffer.from(buf).toString('latin1');
    for (const mk of PLAINTEXT_MARKERS.concat(['<!doctype', '<script'])) if (text.includes(mk)) fail(rel + ' : texte en clair détecté (« ' + mk + ' »)');
    for (const [name, sig] of FILE_SIGNATURES) if (sig.length >= 3 && has(buf.subarray(0, 64), sig)) fail(rel + ' : commence comme un fichier ' + name + ' en clair');
    const ratio = gzipSync(buf).length / buf.length;
    if (ratio < 0.98) fail(rel + ' : le paquet se compresse (' + Math.round(ratio * 100) + ' %) : il n’est pas chiffré');
    if (password && p && site) {
      try {
        const key = await passwordKey(password, unb64(site.s), site.it);
        const out = unpack(await decryptBytes(key, unb64(p.iv), buf));
        if (!out.html.includes(RUNTIME_MARK) || !out.html.includes('id="app"')) fail(rel + ' : le portail déchiffré est incomplet');
        if (!/const LOGO_WM = "data:image\/png;base64,/.test(out.html) || !/const LOGO_COLOR = "data:image\/png;base64,/.test(out.html)) fail(rel + ' : un logo MBM (LOGO_WM, LOGO_COLOR) manque dans le portail');
        const missing = [...out.html.matchAll(/assets\/[a-z0-9-]+\.(?:jpe?g|png|webp|svg)/gi)].map((m) => m[0]).filter((a, i, all) => all.indexOf(a) === i && !out.assets.some((x) => x.path === a));
        if (missing.length) fail('images citées par le portail mais absentes du paquet : ' + missing.join(', '));
      } catch (e) { fail(rel + ' : ne s’ouvre pas avec ce mot de passe'); }
    }
  }
  return errors;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const errors = await runChecks({ password: process.env.MBM_PASSWORD });
  if (errors.length) { console.error('ÉCHEC — rien ne doit être envoyé :\n- ' + errors.join('\n- ')); process.exit(1); }
  console.log('OK  vérification : portail chiffré, aucune image ni code en clair, noindex partout' + (process.env.MBM_PASSWORD ? ', le paquet s’ouvre avec le mot de passe' : ''));
}
