#!/usr/bin/env node
// Publie le portail : assemble app/, chiffre la page et les images, écrit public/index.html et public/bundle/.
//
//   MBM_PASSWORD='…' node tools/publish.mjs                     mise à jour (même mot de passe)
//   MBM_PASSWORD='nouveau' node tools/publish.mjs --new-password  change le mot de passe du site
//   node tools/publish.mjs --gate                                     refait seulement la page d'entrée (tools/gate.html),
//                                                                       sans toucher au portail chiffré ni au mot de passe
//
// Le mot de passe n'est jamais écrit dans ce dépôt : il vient de la variable d'environnement MBM_PASSWORD.
// site.json garde le sel et un témoin chiffré, pour refuser un mot de passe mal tapé lors d'une mise à jour.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { ITERATIONS, b64, unb64, random, sha256hex, passwordKey, makeCheck, verifyCheck, encryptBytes, pack } from './lib.mjs';
import { ROOT, buildApp, collectAssets, wordmarkDataUri, RUNTIME_MARK } from './build.mjs';
import { runChecks } from './check.mjs';

const PUB = join(ROOT, 'public');
const SITE = join(ROOT, 'site.json');
const DOMAIN = 'mbmdesk.winnia.win';
const newPassword = process.argv.includes('--new-password');
const password = process.env.MBM_PASSWORD || '';
const renderGate = (payload) => readFileSync(join(ROOT, 'tools', 'gate.html'), 'utf8')
  .replace('__VDLOGO__', () => wordmarkDataUri())
  .replace('__LOGO__', () => readFileSync(join(ROOT, 'tools', 'logo.svg'), 'utf8').trim())
  .replace('__PAYLOAD__', () => JSON.stringify(payload).replace(/</g, '\\u003c'));

if (process.argv.includes('--gate')) {
  const cur = existsSync(join(PUB, 'index.html')) ? readFileSync(join(PUB, 'index.html'), 'utf8') : '';
  const m = /<script type="application\/json" id="vd-payload">([\s\S]*?)<\/script>/.exec(cur);
  if (!m) { console.error('public/index.html ne contient pas de paquet : lancez d’abord une publication complète.'); process.exit(1); }
  writeFileSync(join(PUB, 'index.html'), renderGate(JSON.parse(m[1])));
  const errors = await runChecks({});
  if (errors.length) { console.error('ÉCHEC — ne pas envoyer :\n- ' + errors.join('\n- ')); process.exit(1); }
  console.log('OK  page d’entrée refaite, portail chiffré inchangé. Envoyer : git add -A && git commit -m "Page d’entrée" && git push');
  process.exit(0);
}
if (!password.trim()) {
  console.error('Mot de passe manquant. Exemple :\n  MBM_PASSWORD=\'…\' node tools/publish.mjs');
  process.exit(1);
}

let site = existsSync(SITE) ? JSON.parse(readFileSync(SITE, 'utf8')) : null;
let key;
if (!site || newPassword) {
  const s = random(16);
  key = await passwordKey(password, s, ITERATIONS);
  site = { ...(site || {}), domain: DOMAIN, kdf: 'PBKDF2-SHA256', it: ITERATIONS, s: b64(s), check: await makeCheck(key) };
  console.log(newPassword ? 'Nouveau mot de passe : nouveau sel, les appareils mémorisés devront le saisir.' : 'Premier mot de passe du site.');
} else {
  key = await passwordKey(password, unb64(site.s), site.it);
  if (!(await verifyCheck(key, site.check))) {
    console.error('Ce n’est pas le mot de passe actuel du site. Pour le changer volontairement : ajoutez --new-password.');
    process.exit(1);
  }
}

const html = buildApp();
if (!html.includes(RUNTIME_MARK)) throw new Error('Marqueur d’exécution absent de la page');
const assets = collectAssets();
const plain = pack(html, assets);
const { iv, ct } = await encryptBytes(key, plain);
const file = 'app.' + (await sha256hex(ct)).slice(0, 16) + '.bin';

mkdirSync(join(PUB, 'bundle'), { recursive: true });
for (const f of readdirSync(join(PUB, 'bundle'))) rmSync(join(PUB, 'bundle', f));
writeFileSync(join(PUB, 'bundle', file), ct);

const payload = { v: 1, kdf: site.kdf, it: site.it, s: site.s, iv: b64(iv), f: '/bundle/' + file, n: ct.length };
writeFileSync(join(PUB, 'index.html'), renderGate(payload));
site.published = new Date().toISOString();
writeFileSync(SITE, JSON.stringify(site, null, 2) + '\n');

const kb = (n) => Math.round(n / 1024) + ' Ko';
console.log(`Page ${kb(Buffer.byteLength(html))} + ${assets.length} image(s) ${kb(assets.reduce((t, a) => t + a.bytes.length, 0))} → paquet chiffré ${kb(ct.length)} (public/bundle/${file})`);
const errors = await runChecks({ password });
if (errors.length) { console.error('ÉCHEC — ne pas envoyer :\n- ' + errors.join('\n- ')); process.exit(1); }
console.log('OK  prêt à envoyer : git add -A && git commit -m "Mise à jour du portail" && git push');
