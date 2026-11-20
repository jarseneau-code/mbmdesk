// Outils cryptographiques de MBM Desk (Node 20+ : Web Crypto et zlib intégrés, mêmes algorithmes que la page).
//
// Le portail entier (page, scripts, styles et images) est chiffré en AES-256-GCM avec une clé dérivée du mot de
// passe du site (PBKDF2-SHA256, 600 000 itérations, sel aléatoire). Le sel et un témoin chiffré sont dans site.json :
// la clé reste la même d'une publication à l'autre (les appareils mémorisés restent ouverts) jusqu'au changement
// de mot de passe. Chaque publication utilise un nouveau vecteur d'initialisation.
//
// Paquet chiffré (public/bundle/app.<empreinte>.bin), une fois déchiffré :
//   [4 octets : taille de l'en-tête][en-tête JSON][page HTML compressée gzip][images...]
//   en-tête = { v: 1, html: { o, n }, assets: [{ p: 'assets/x.jpg', t: 'image/jpeg', o, n }] }
import { gzipSync, gunzipSync } from 'node:zlib';

const { subtle } = globalThis.crypto;
export const ITERATIONS = 600000;
export const CHECK_TEXT = 'mbmdesk/v1';
const enc = new TextEncoder(), dec = new TextDecoder();

export const b64 = (bytes) => Buffer.from(bytes).toString('base64');
export const unb64 = (s) => new Uint8Array(Buffer.from(String(s), 'base64'));
export const random = (n) => globalThis.crypto.getRandomValues(new Uint8Array(n));
export const sha256hex = async (bytes) => Buffer.from(await subtle.digest('SHA-256', bytes)).toString('hex');

export async function passwordKey(password, salt, iterations = ITERATIONS) {
  const base = await subtle.importKey('raw', enc.encode(String(password).normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
  return subtle.deriveKey({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

/* Témoin : permet à l'outil de publication de refuser un mot de passe mal tapé (sinon le site deviendrait illisible). */
export async function makeCheck(key) {
  const iv = random(12);
  const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(CHECK_TEXT)));
  return { iv: b64(iv), ct: b64(ct) };
}
export async function verifyCheck(key, check) {
  try { return dec.decode(await subtle.decrypt({ name: 'AES-GCM', iv: unb64(check.iv) }, key, unb64(check.ct))) === CHECK_TEXT; }
  catch (e) { return false; }
}

export async function encryptBytes(key, bytes) {
  const iv = random(12);
  const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes));
  return { iv, ct };
}
export async function decryptBytes(key, iv, ct) {
  return new Uint8Array(await subtle.decrypt({ name: 'AES-GCM', iv }, key, ct));
}

/* Paquet : page + images dans un seul fichier binaire, avant chiffrement */
export function pack(html, assets) {
  const blobs = [], head = { v: 1, html: null, assets: [] };
  let o = 0;
  const add = (bytes) => { const at = o; blobs.push(bytes); o += bytes.length; return { o: at, n: bytes.length }; };
  head.html = add(new Uint8Array(gzipSync(Buffer.from(html, 'utf8'), { level: 9 })));
  for (const a of assets) head.assets.push({ p: a.path, t: a.type, ...add(a.bytes) });
  const hj = enc.encode(JSON.stringify(head));
  const out = new Uint8Array(4 + hj.length + o);
  new DataView(out.buffer).setUint32(0, hj.length);
  out.set(hj, 4);
  let p = 4 + hj.length;
  for (const b of blobs) { out.set(b, p); p += b.length; }
  return out;
}
export function unpack(bytes) {
  const hl = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0);
  const head = JSON.parse(dec.decode(bytes.subarray(4, 4 + hl)));
  const base = 4 + hl, part = (r) => bytes.subarray(base + r.o, base + r.o + r.n);
  return { html: gunzipSync(part(head.html)).toString('utf8'), assets: head.assets.map((a) => ({ path: a.p, type: a.t, bytes: part(a) })) };
}
