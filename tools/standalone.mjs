#!/usr/bin/env node
// Version autonome du portail, pour une démo sur un ordinateur, même sans Internet :
// un seul fichier HTML, sans mot de passe, avec les images, les polices et les bibliothèques en ligne.
//
//   node tools/standalone.mjs                  écrit dist/mbm-desk.html
//   node tools/standalone.mjs autre/chemin.html
//
// Ce fichier est en clair : ne jamais le mettre dans public/ ni l'envoyer sur le site (dist/ est ignoré par git).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ROOT, buildApp, collectAssets, RUNTIME_MARK } from './build.mjs';

const VENDOR = join(ROOT, 'tools', 'vendor');
const out = process.argv[2] || join(ROOT, 'dist', 'mbm-desk.html');
const b64 = (f) => readFileSync(join(VENDOR, f)).toString('base64');
const inlineJs = (f) => readFileSync(join(VENDOR, f), 'utf8').replace(/<\/script/gi, '<\\/script');

/* Polices (sous-ensemble latin : couvre le français et l'anglais) */
const face = (family, file, style, weight) => `@font-face{font-family:"${family}";font-style:${style};font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${b64(file)}) format("woff2")}`;
const fonts = [
  face('Geist', 'geist-latin-wght-normal.woff2', 'normal', '100 900'),
  face('Geist Mono', 'geist-mono-latin-wght-normal.woff2', 'normal', '100 900'),
  face('Instrument Serif', 'instrument-serif-latin-400-normal.woff2', 'normal', '400'),
  face('Instrument Serif', 'instrument-serif-latin-400-italic.woff2', 'italic', '400'),
].join('\n');

/* Téléchargements (PDF, invitation de calendrier) hors de claude.ai : même aide que la page d'entrée en ligne */
function shim() {
  if (window.claude) return;
  function save(o) {
    var d = o && o.data, name = (o && o.filename) || 'download';
    var blob = d instanceof Blob ? d : new Blob([d], { type: /\.ics$/i.test(name) ? 'text/calendar' : 'application/octet-stream' });
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
    return Promise.resolve({ status: 'saved' });
  }
  window.claude = { use: function (n) { return Promise.resolve(n === 'downloads' ? { save: save } : null); } };
}

const map = Object.fromEntries(collectAssets().map((a) => [a.path, `data:${a.type};base64,${Buffer.from(a.bytes).toString('base64')}`]));
let html = buildApp();
const swaps = [
  [/<link rel="preconnect"[^>]*>\n/g, ''],
  [/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^"]*">/, () => `<style>\n${fonts}\n</style>`],
  [/<link rel="icon" href="\/favicon\.svg" type="image\/svg\+xml">/, () => `<link rel="icon" href="data:image/svg+xml;base64,${readFileSync(join(ROOT, 'public', 'favicon.svg')).toString('base64')}" type="image/svg+xml">`],
  [/<script defer src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/qrcode-generator\/[^"]*"><\/script>/, () => `<script>\n${inlineJs('qrcode.js')}\n</script>`],
  [/<script defer src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jspdf\/[^"]*"><\/script>/, () => `<script>\n${inlineJs('jspdf.umd.min.js')}\n</script>`],
];
for (const [re, by] of swaps) {
  if (!re.test(html)) throw new Error('Gabarit inattendu dans build.mjs : ' + re);
  html = html.replace(re, by);
}
if (/(?:src|href)="https:\/\/(?:fonts\.g|cdnjs)/.test(html)) throw new Error('Une ressource externe reste dans la page');
html = html.replace(RUNTIME_MARK, () => `<script>window.VD_ASSETS=${JSON.stringify(map)};(${shim.toString()})();</script>`);

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`OK  ${out} (${Math.round(Buffer.byteLength(html) / 1024)} Ko, autonome et hors ligne)`);
