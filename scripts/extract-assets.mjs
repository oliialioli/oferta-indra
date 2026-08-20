#!/usr/bin/env node
/**
 * Pulls the base64-embedded fonts, video, and images out of the original
 * static HTML mockup and writes them as real files under public/, so the
 * React app can reference them by path instead of inlining megabytes of
 * base64 into the JS bundle.
 *
 * Usage:
 *   node scripts/extract-assets.mjs /path/to/original-oferta-indra.html
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const srcPath = process.argv[2];
if (!srcPath) {
  console.error('Usage: node scripts/extract-assets.mjs <path-to-original.html>');
  process.exit(1);
}
const html = fs.readFileSync(srcPath, 'utf8');

function writeBase64(outPath, base64) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
  console.log('wrote', path.relative(root, outPath), `(${(base64.length * 0.75 / 1024).toFixed(0)} KB)`);
}

// 1) Fonts: four @font-face blocks, in weight order 300/400/500/700.
const fontNames = [
  'ForFutureSans-Regular.woff2', // 300
  'ForFutureSans-Book.woff2', // 400
  'ForFutureSans-Medium.woff2', // 500
  'ForFutureSans-Bold.woff2', // 700
];
const fontMatches = [...html.matchAll(/url\(data:font\/woff2;base64,([^)]+)\)/g)];
fontMatches.forEach((m, i) => {
  if (fontNames[i]) {
    writeBase64(path.join(root, 'public/fonts', fontNames[i]), m[1]);
  }
});
if (fontMatches.length !== 4) {
  console.warn(`Expected 4 font blocks, found ${fontMatches.length} — check weight order manually.`);
}

// 2) Video: the avatar loop, base64 mp4 inside a <source> tag.
const videoMatch = html.match(/src="data:video\/mp4;base64,([^"]+)"/);
if (videoMatch) {
  writeBase64(path.join(root, 'public/media/buddy-avatar.mp4'), videoMatch[1]);
} else {
  console.warn('No embedded video found.');
}

// 3) Images: every data:image/png;base64 occurrence, in document order.
// The original has: (1) Gmail-mock hero avatar doodle, (2) Top Employer
// seal, (3) Indra logo header, (4) modal small avatar. Adjust names/order
// below if your source file differs.
const imageNames = [
  'gmail-hero-avatar.png',
  'top-employer-seal.png',
  'indra-logo.png',
  'buddy-avatar-small.png',
];
const imageMatches = [...html.matchAll(/data:image\/png;base64,([^"]+)"/g)];
imageMatches.forEach((m, i) => {
  const name = imageNames[i] || `image-${i + 1}.png`;
  writeBase64(path.join(root, 'public/images', name), m[1]);
});

console.log('\nDone. Check public/fonts, public/media, public/images — rename/reorder if needed.');
