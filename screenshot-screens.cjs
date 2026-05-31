const puppeteer = require('puppeteer');

const OUT = 'C:/Users/arsla/Desktop/ikonlar/screens/real/';
const fs = require('fs');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const screens = [
  { name: '1_ozet',    click: null },
  { name: '2_gecmis',  click: 'Geçmiş' },
  { name: '3_takvim',  click: 'Takvim' },
  { name: '4_ayarlar', click: 'Ayarlar' },
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));

  for (const s of screens) {
    if (s.click) {
      await page.evaluate((txt) => {
        const btns = Array.from(document.querySelectorAll('.nav-btn'));
        const btn = btns.find(b => b.textContent.trim() === txt);
        if (btn) btn.click();
      }, s.click);
      await new Promise(r => setTimeout(r, 600));
    }
    await page.screenshot({ path: OUT + s.name + '.png' });
    console.log('✓', s.name);
  }

  await browser.close();
  console.log('\nKaydedildi →', OUT);
})();
