// Draws icon.png (256×256): a navy disc with a mint "C" arc and a pink dot.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';
import { brand } from './palette.mjs';

const size = 256;
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'icon.png');

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const navy = rgb(brand.gamma);
const mint = rgb(brand.alpha);
const pink = rgb(brand.beta);

// Coverage for a signed distance (negative = inside), 1px anti-aliasing.
const cover = (d) => Math.min(1, Math.max(0, 0.5 - d));

const c = size / 2;
const pixels = Buffer.alloc(size * size * 4);

for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const px = x + 0.5 - c;
    const py = y + 0.5 - c;
    const r = Math.hypot(px, py);

    // Background disc.
    const discA = cover(r - 124);
    let color = [...navy];

    // Mint arc: ring of radius 70, thickness 26, open on the right (±40°).
    const angle = Math.abs(Math.atan2(py, px));
    const gap = (40 * Math.PI) / 180;
    const ringD = Math.abs(r - 70) - 13;
    // Round caps: distance to the arc end points.
    const capX = 70 * Math.cos(gap);
    const capY = 70 * Math.sin(gap);
    const capD = Math.hypot(px - capX, Math.abs(py) - capY) - 13;
    const arcD = angle > gap ? ringD : capD;
    const arcA = cover(arcD);
    color = color.map((v, i) => v + (mint[i] - v) * arcA);

    // Pink dot inside the opening.
    const dotA = cover(Math.hypot(px - 82, py) - 17);
    color = color.map((v, i) => v + (pink[i] - v) * dotA);

    const o = (y * size + x) * 4;
    pixels[o] = Math.round(color[0]);
    pixels[o + 1] = Math.round(color[1]);
    pixels[o + 2] = Math.round(color[2]);
    pixels[o + 3] = Math.round(discA * 255);
  }
}

// PNG encoding.
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let k = n;
  for (let i = 0; i < 8; i++) k = k & 1 ? 0xedb88320 ^ (k >>> 1) : k >>> 1;
  return k >>> 0;
});
const crc32 = (buf) => {
  let crc = 0xffffffff;
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(size, 0);
ihdr.writeUInt32BE(size, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // RGBA

const raw = Buffer.alloc(size * (size * 4 + 1));
for (let y = 0; y < size; y++) {
  raw[y * (size * 4 + 1)] = 0; // filter: none
  pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
}

writeFileSync(
  out,
  Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]),
);
console.log('→ icon.png');
