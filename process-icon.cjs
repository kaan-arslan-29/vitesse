const sharp = require('sharp');

const input  = 'C:/Users/arsla/Desktop/ikonlar/ikon_final3.PNG';
const outPng = 'C:/Users/arsla/Desktop/ikonlar/ikon_playstore_512.png';
const outJpg = 'C:/Users/arsla/Desktop/ikonlar/ikon_playstore_512.jpg';

async function process() {
  const { data: orig, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = info.width;   // 1024
  const H = info.height;  // 1024
  const ch = 4;

  // Step 1: create the blurred background via sharp (flatten → blur)
  // Output is RGB (3ch), 1024×1024
  const { data: bgRaw, info: bgInfo } = await sharp(input)
    .flatten({ background: { r: 19, g: 53, b: 99 } })
    .blur(40)
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Step 2: manually composite: where original is opaque, use original;
  // where original is transparent, use the blurred background.
  const out = Buffer.alloc(W * H * ch);

  for (let i = 0; i < W * H; i++) {
    const oa = orig[i * ch + 3];          // original alpha
    const bgR = bgRaw[i * bgInfo.channels];
    const bgG = bgRaw[i * bgInfo.channels + 1];
    const bgB = bgRaw[i * bgInfo.channels + 2];

    if (oa >= 128) {
      // Opaque: keep original pixel
      out[i * ch]     = orig[i * ch];
      out[i * ch + 1] = orig[i * ch + 1];
      out[i * ch + 2] = orig[i * ch + 2];
      out[i * ch + 3] = 255;
    } else {
      // Transparent: use blurred background
      out[i * ch]     = bgR;
      out[i * ch + 1] = bgG;
      out[i * ch + 2] = bgB;
      out[i * ch + 3] = 255;
    }
  }

  // Step 3: resize to 512×512
  const result = await sharp(out, { raw: { width: W, height: H, channels: ch } })
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toBuffer();

  await sharp(result).toFile(outPng);
  await sharp(result).jpeg({ quality: 95 }).toFile(outJpg);
  console.log('Tamamlandı →', outPng);
}

process().catch(console.error);
