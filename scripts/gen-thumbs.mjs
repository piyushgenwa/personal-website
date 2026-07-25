/**
 * Generates placeholder project thumbnails as real PNGs.
 *
 * The FlutedGlass shader samples an HTMLImageElement, so the cards need raster
 * textures — an SVG data URI is not reliably usable as a WebGL texture. These
 * are soft metaball-ish blobs so the glass has something to refract. Swap them
 * for real screenshots by dropping files at the same paths.
 *
 *   node scripts/gen-thumbs.mjs
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 900;
const H = 675;
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/projects');

// Palette drawn from the site tokens: cold base, warm life inside.
const SHEETS = [
  { name: 'ledger', bg: [10, 22, 21], blobs: [[255, 160, 46], [53, 214, 196]] },
  { name: 'freight', bg: [8, 17, 15], blobs: [[255, 77, 94], [255, 160, 46]] },
  { name: 'atlas', bg: [13, 26, 28], blobs: [[53, 214, 196], [211, 222, 217]] },
  { name: 'spec-diff', bg: [9, 20, 18], blobs: [[255, 160, 46], [255, 77, 94]] },
  { name: 'quota', bg: [11, 24, 26], blobs: [[53, 214, 196], [255, 160, 46]] },
  { name: 'moodboard', bg: [10, 18, 20], blobs: [[255, 77, 94], [53, 214, 196]] },
  { name: 'trend-pulse', bg: [12, 24, 22], blobs: [[255, 160, 46], [255, 77, 94]] },
  { name: 'sprite-mart', bg: [10, 19, 20], blobs: [[255, 77, 94], [211, 222, 217]] },
  { name: 'growth-secretary', bg: [11, 23, 25], blobs: [[53, 214, 196], [255, 160, 46]] },
];

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/** Encodes RGB pixels (height * width * 3) using the Paeth scanline filter,
 *  which is what makes smooth gradients compress instead of bloating. */
function png(width, height, pixels) {
  const stride = width * 3;
  const raw = Buffer.alloc(height * (1 + stride));
  for (let y = 0; y < height; y++) {
    const out = y * (1 + stride);
    raw[out] = 4; // filter: Paeth
    for (let i = 0; i < stride; i++) {
      const cur = pixels[y * stride + i];
      const left = i >= 3 ? pixels[y * stride + i - 3] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + i] : 0;
      const upLeft = y > 0 && i >= 3 ? pixels[(y - 1) * stride + i - 3] : 0;
      raw[out + 1 + i] = (cur - paeth(left, up, upLeft)) & 0xff;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolor
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Deterministic per-sheet pseudo-random so regenerating is stable.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function render({ bg, blobs }, seed) {
  const rand = rng(seed);
  // Two or three soft radial falloffs — reads as metaball light through glass.
  const lights = blobs.flatMap((color) =>
    Array.from({ length: 2 }, () => ({
      color,
      cx: 0.15 + rand() * 0.7,
      cy: 0.15 + rand() * 0.7,
      r: 0.28 + rand() * 0.3,
    })),
  );

  const pixels = Buffer.alloc(H * W * 3);
  let p = 0;
  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const u = x / W;
      // Base vertical gradient, slightly lifted at the bottom.
      let r = bg[0] + v * 10;
      let g = bg[1] + v * 12;
      let b = bg[2] + v * 14;

      for (const l of lights) {
        const dx = (u - l.cx) * 1.0;
        const dy = (v - l.cy) * (H / W);
        const d = Math.sqrt(dx * dx + dy * dy) / l.r;
        if (d < 1) {
          // smootherstep falloff
          const t = 1 - d;
          const f = t * t * t * (t * (t * 6 - 15) + 10);
          r += l.color[0] * f * 0.62;
          g += l.color[1] * f * 0.62;
          b += l.color[2] * f * 0.62;
        }
      }

      // No baked grain: the shader's own grainOverlay/grainMixer supply it, and
      // noise here would balloon the PNG by ~30x.
      pixels[p++] = Math.max(0, Math.min(255, r));
      pixels[p++] = Math.max(0, Math.min(255, g));
      pixels[p++] = Math.max(0, Math.min(255, b));
    }
  }
  return png(W, H, pixels);
}

mkdirSync(OUT, { recursive: true });
SHEETS.forEach((sheet, i) => {
  const file = resolve(OUT, `${sheet.name}.png`);
  writeFileSync(file, render(sheet, 0x9e3779b9 + i * 2654435761));
  console.log(`wrote public/projects/${sheet.name}.png`);
});
