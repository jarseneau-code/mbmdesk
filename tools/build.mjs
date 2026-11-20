// Assemble la page complète du portail à partir de app/ (styles, scripts et logo en ligne, comme l'artefact claude.ai).
// Utilisé par tools/publish.mjs : la page produite n'est jamais écrite en clair dans public/.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const APP = join(ROOT, 'app');
export const RUNTIME_MARK = '<!--VD-RUNTIME-->';
/* Logos MBM en ligne dans le portail : LOGO_WM (lettrage blanc, fonds foncés et page d'entrée) et LOGO_COLOR (fonds clairs) */
export const WORDMARK = 'mbm-logo-blanc.png';
export const COLORMARK = 'mbm-logo.png';

const FONTS = 'https://fonts.googleapis.com/css2?family=Geist:wght@300..800'
  + '&family=Geist+Mono:wght@400..600&family=Instrument+Serif:ital@0;1&display=swap';
const LIBS = [
  'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
];
const TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', svg: 'image/svg+xml', gif: 'image/gif' };

export const wordmarkDataUri = () => 'data:image/png;base64,' + readFileSync(join(APP, 'assets', WORDMARK)).toString('base64');
export const colormarkDataUri = () => 'data:image/png;base64,' + readFileSync(join(APP, 'assets', COLORMARK)).toString('base64');

export function buildApp() {
  const css = readFileSync(join(APP, 'styles.css'), 'utf8');
  const js = readdirSync(join(APP, 'js')).filter((f) => f.endsWith('.js')).sort()
    .map((f) => readFileSync(join(APP, 'js', f), 'utf8')).join('\n');
  /* La page est écrite par la page d'entrée (document.write) : les bibliothèques externes y sont en « defer », sinon
     Chrome peut les bloquer sur une connexion lente. Le portail démarre donc à DOMContentLoaded, une fois chargées.
     LOGO_WM et LOGO_COLOR restent hors de la fonction : 'use strict' (début de 01-core.js) doit rester sa première instruction. */
  return `<!doctype html>
<html lang="fr-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">
<meta name="referrer" content="no-referrer">
<title>MBM Desk</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
${RUNTIME_MARK}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>
:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}
${css}
</style>
</head>
<body>
<div id="app" aria-live="off"></div>
<noscript><p style="padding:40px;font-family:system-ui,sans-serif">Ce portail a besoin de JavaScript.</p></noscript>
${LIBS.map((u) => `<script defer src="${u}"></script>`).join('\n')}
<script>
const LOGO_WM = "${wordmarkDataUri()}";
const LOGO_COLOR = "${colormarkDataUri()}";
(function (start) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})(function () {
${js}
});
</script>
</body>
</html>
`;
}

/* Les autres images de app/assets (les logos sont déjà en ligne), avec leur chemin « assets/… ».
   Dans le portail ouvert, window.VD_ASSETS['assets/nom.jpg'] donne leur adresse. */
export function collectAssets() {
  return readdirSync(join(APP, 'assets')).filter((f) => f !== WORDMARK && f !== COLORMARK && TYPES[f.split('.').pop().toLowerCase()]).sort()
    .map((f) => ({ path: 'assets/' + f, type: TYPES[f.split('.').pop().toLowerCase()], bytes: new Uint8Array(readFileSync(join(APP, 'assets', f))) }));
}
