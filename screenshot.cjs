const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUT_DIR = 'C:/Users/arsla/Desktop/ikonlar/';

// Mevcut en yüksek versiyonu bul
const existing = fs.readdirSync(OUT_DIR)
  .map(f => f.match(/^feature-graphic-v(\d+)\.png$/))
  .filter(Boolean)
  .map(m => parseInt(m[1]));
const nextV = existing.length > 0 ? Math.max(...existing) + 1 : 1;
const outFile = OUT_DIR + `feature-graphic-v${nextV}.png`;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });

  const file = 'file:///' + path.resolve(__dirname, 'feature-graphic.html').replace(/\\/g, '/');
  await page.goto(file, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: outFile, clip: { x: 0, y: 0, width: 1024, height: 500 } });

  await browser.close();
  console.log(`Kaydedildi → feature-graphic-v${nextV}.png`);
})();
