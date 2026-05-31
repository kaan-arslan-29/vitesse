const sharp = require('sharp');

const input  = 'C:/Users/arsla/Desktop/ikonlar/1.png';
const output = 'C:/Users/arsla/Desktop/ikonlar/1_nobg.png';

async function process() {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = info.width;
  const H = info.height;
  const ch = 4;
  const out = Buffer.from(data);

  // Arka plan tespiti: koyu mavi tonları (dark navy gradient dahil)
  function isBg(r, g, b, a) {
    if (a < 128) return true;                          // zaten şeffaf
    const brightness = (r + g + b) / 3;
    const blueDom = b > r * 1.5 && b > g * 1.2;      // mavi baskın
    const dark = brightness < 100;                     // karanlık piksel
    // Ana arka plan rengi etrafında geniş tolerans
    const nearBase =
      Math.abs(r - 19) < 60 && Math.abs(g - 53) < 60 && Math.abs(b - 99) < 65;
    return nearBase || (dark && blueDom);
  }

  // BFS: 4 köşe + 4 kenar orta noktalarından başla
  const visited = new Uint8Array(W * H);
  const queue = [];
  let head = 0;

  const seeds = [
    [0,0],[W-1,0],[0,H-1],[W-1,H-1],
    [Math.floor(W/2),0],[Math.floor(W/2),H-1],
    [0,Math.floor(H/2)],[W-1,Math.floor(H/2)],
  ];
  for (const [x, y] of seeds) {
    const i = y * W + x;
    if (!visited[i]) {
      const r = data[i*ch], g = data[i*ch+1], b = data[i*ch+2], a = data[i*ch+3];
      if (isBg(r, g, b, a)) { visited[i] = 1; queue.push(i); }
    }
  }

  while (head < queue.length) {
    const i = queue[head++];
    out[i * ch + 3] = 0;   // şeffaf yap

    const y = Math.floor(i / W);
    const x = i % W;
    for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
      const ni = ny * W + nx;
      if (visited[ni]) continue;
      const r = data[ni*ch], g = data[ni*ch+1], b = data[ni*ch+2], a = data[ni*ch+3];
      if (isBg(r, g, b, a)) { visited[ni] = 1; queue.push(ni); }
    }
  }

  await sharp(out, { raw: { width: W, height: H, channels: ch } })
    .png({ compressionLevel: 9 })
    .toFile(output);

  console.log('Tamamlandı →', output);
}

process().catch(console.error);
