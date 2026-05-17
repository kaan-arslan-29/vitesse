import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Jimp } = require('jimp');
import { mkdirSync } from 'fs';
import { join } from 'path';

const SOURCE   = 'C:/Users/arsla/Desktop/ikon.png';
const RES_DIR  = './android/app/src/main/res';
const BG_COLOR = 0x1B2E4Bff;
const BLACK_THRESHOLD = 40;

// Adaptive icon canvas boyutları (density → px)
const ADAPTIVE = { mdpi:108, hdpi:162, xhdpi:216, xxhdpi:324, xxxhdpi:432 };

// Normal launcher icon boyutları
const LAUNCHER  = { ldpi:36, mdpi:48, hdpi:72, xhdpi:96, xxhdpi:144, xxxhdpi:192 };

const original = await Jimp.read(SOURCE);

function makeTransparent(img) {
  img.scan(0, 0, img.width, img.height, function(x, y, idx) {
    const r = this.bitmap.data[idx];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    if (r < BLACK_THRESHOLD && g < BLACK_THRESHOLD && b < BLACK_THRESHOLD) {
      this.bitmap.data[idx + 3] = 0;
    }
  });
  return img;
}

// ── ic_launcher_foreground.png (adaptive icon foreground) ─
console.log('Foreground ikonlar...');
for (const [density, size] of Object.entries(ADAPTIVE)) {
  const dir = join(RES_DIR, `mipmap-${density}`);
  mkdirSync(dir, { recursive: true });

  const fg = original.clone().resize({ w: size, h: size });
  makeTransparent(fg);
  await fg.write(join(dir, 'ic_launcher_foreground.png'));
  console.log(`  ✓ mipmap-${density}/ic_launcher_foreground.png (${size}x${size})`);
}

// ── ic_launcher.png + ic_launcher_round.png ───────────────
console.log('Launcher ikonlar...');
for (const [density, size] of Object.entries(LAUNCHER)) {
  const dir = join(RES_DIR, `mipmap-${density}`);
  mkdirSync(dir, { recursive: true });

  const fg = original.clone().resize({ w: size, h: size });
  makeTransparent(fg);

  const bg = new Jimp({ width: size, height: size, color: BG_COLOR });
  bg.composite(fg, 0, 0);

  await bg.write(join(dir, 'ic_launcher.png'));
  await bg.write(join(dir, 'ic_launcher_round.png'));
  console.log(`  ✓ mipmap-${density}/ic_launcher.png (${size}x${size})`);
}

console.log('\nTamamlandı!');
