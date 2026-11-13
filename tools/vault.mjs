#!/usr/bin/env node
// Seal or open the encrypted content file for the CLEAR hub.
//
//   node tools/vault.mjs seal content.json "the passcode"   -> writes vault.json
//   node tools/vault.mjs open "the passcode"                -> prints the content
//
// content.json is the readable version and must never be committed
// (it is in .gitignore). vault.json is the encrypted version the site loads.

import { readFile, writeFile } from 'node:fs/promises';
import { webcrypto as crypto } from 'node:crypto';

const ITERATIONS = 600000;
const VAULT = new URL('../vault.json', import.meta.url);
const b64 = (buf) => Buffer.from(buf).toString('base64');
const unb64 = (str) => new Uint8Array(Buffer.from(str, 'base64'));

async function deriveKey(passcode, salt, iterations) {
  const base = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(passcode.trim()), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

const [cmd, a, b] = process.argv.slice(2);

if (cmd === 'seal' && a && b) {
  const text = await readFile(a, 'utf8');
  JSON.parse(text); // refuse to seal something the site cannot read
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(b, salt, ITERATIONS);
  const data = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, new TextEncoder().encode(text));
  await writeFile(VAULT, JSON.stringify(
    { v: 1, iterations: ITERATIONS, salt: b64(salt), iv: b64(iv), data: b64(data) }, null, 1) + '\n');
  console.log('vault.json written');
} else if (cmd === 'open' && a) {
  const vault = JSON.parse(await readFile(VAULT, 'utf8'));
  const key = await deriveKey(a, unb64(vault.salt), vault.iterations);
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: unb64(vault.iv) }, key, unb64(vault.data));
    console.log(new TextDecoder().decode(plain));
  } catch {
    console.error('Wrong passcode.');
    process.exit(1);
  }
} else {
  console.error('Usage:\n  node tools/vault.mjs seal content.json "passcode"\n  node tools/vault.mjs open "passcode"');
  process.exit(1);
}
