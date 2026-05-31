const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TMP = path.join(__dirname, '_tmp_v2.html');

const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { width:1024px; height:500px; overflow:hidden; background:#0a0a14; font-family:'Inter',sans-serif;
  -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; text-rendering:optimizeLegibility; }
.canvas { width:1024px; height:500px; position:relative; overflow:hidden; background:linear-gradient(135deg,#0a0a14 0%,#0f0f20 50%,#0a0a14 100%); }
.ring { position:absolute; border-radius:50%; border:1px solid rgba(124,107,255,0.12); }
.ring-1 { width:600px; height:600px; top:-150px; right:-80px; }
.ring-2 { width:420px; height:420px; top:-60px; right:10px; }
.ring-3 { width:240px; height:240px; top:30px; right:100px; }
.glow-left { position:absolute; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(124,107,255,0.18) 0%,transparent 70%); top:-100px; left:-80px; }
.glow-right { position:absolute; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(91,79,255,0.14) 0%,transparent 70%); top:0; right:-100px; }
.glow-cards { position:absolute; width:380px; height:460px; border-radius:50%; background:radial-gradient(circle,rgba(124,107,255,0.13) 0%,transparent 65%); top:50%; right:40px; transform:translateY(-50%); }
.grid-overlay { position:absolute; inset:0; background-image:linear-gradient(rgba(124,107,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,107,255,0.04) 1px,transparent 1px); background-size:60px 60px; }
.left { position:absolute; left:72px; top:50%; transform:translateY(-50%); z-index:10; }
.badge { display:inline-flex; align-items:center; gap:6px; background:rgba(124,107,255,0.15); border:1px solid rgba(124,107,255,0.35); color:#a89eff; font-size:12px; font-weight:600; padding:5px 14px; border-radius:20px; margin-bottom:20px; letter-spacing:0.5px; text-transform:uppercase; }
.brand { font-size:88px; font-weight:900; letter-spacing:-4px; line-height:0.95; margin-bottom:18px; background:linear-gradient(135deg,#fff 0%,#c8c0ff 50%,#7c6bff 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.tagline { font-size:18px; font-weight:500; color:rgba(200,200,220,0.7); letter-spacing:-0.2px; line-height:1.5; max-width:340px; }
.pills { display:flex; gap:10px; margin-top:24px; margin-bottom:24px; }
.pill { display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:6px 14px; font-size:12px; font-weight:600; color:rgba(200,200,220,0.8); }
.rating { display:flex; align-items:center; gap:8px; }
.stars { display:flex; gap:2px; color:#fbbf24; }
.rating-text { font-size:12px; font-weight:500; color:rgba(200,200,220,0.35); }
.cards { position:absolute; right:52px; top:50%; transform:translateY(-50%); z-index:10; width:280px; display:flex; flex-direction:column; gap:10px; }
.card { background:rgba(16,12,32,0.96); border:1px solid rgba(255,255,255,0.09); border-radius:16px; padding:14px 16px; }
.card-vehicle { transform:rotate(1.5deg); box-shadow:0 8px 32px rgba(0,0,0,0.4),0 0 0 1px rgba(124,107,255,0.12); }
.veh-label { font-size:11px; font-weight:600; color:#6b6b9a; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:10px; }
.veh-stats { display:grid; grid-template-columns:1fr 1fr; gap:8px 12px; }
.vs { display:flex; flex-direction:column; gap:2px; }
.vs-val { font-size:14px; font-weight:700; color:#c8c0ff; }
.vs-key { font-size:10px; color:#5a5a88; font-weight:600; }
.card-expense { transform:rotate(-1deg); box-shadow:0 8px 32px rgba(0,0,0,0.4),0 0 0 1px rgba(52,211,153,0.12); }
.exp-title { font-size:11px; font-weight:600; color:#6b6b9a; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:10px; }
.bar-row { display:flex; flex-direction:column; gap:7px; }
.bar-item { display:flex; align-items:center; gap:8px; }
.bar-label { font-size:11px; color:#8888b8; width:44px; flex-shrink:0; }
.bar-track { flex:1; height:5px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden; }
.bar-fill { height:100%; border-radius:3px; }
.bar-val { font-size:11px; font-weight:700; color:#c0c0e0; width:38px; text-align:right; flex-shrink:0; }
.card-maint { transform:rotate(0.8deg); box-shadow:0 8px 32px rgba(0,0,0,0.4),0 0 0 1px rgba(251,191,36,0.1); }
.maint-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.maint-title { font-size:11px; font-weight:600; color:#6b6b9a; text-transform:uppercase; letter-spacing:0.6px; }
.maint-badge { display:inline-flex; align-items:center; gap:4px; background:rgba(251,191,36,0.12); border:1px solid rgba(251,191,36,0.25); color:#fbbf24; font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; }
.maint-item { display:flex; align-items:center; justify-content:space-between; }
.maint-name { font-size:13px; font-weight:600; color:#d0d0f0; }
.maint-km { font-size:12px; font-weight:700; color:#fbbf24; }
.bottom-bar { position:absolute; bottom:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#7c6bff,#a89eff,transparent); opacity:0.6; }
</style></head><body><div class="canvas">
<div class="glow-left"></div><div class="glow-right"></div><div class="glow-cards"></div><div class="grid-overlay"></div>
<div class="ring ring-1"></div><div class="ring ring-2"></div><div class="ring ring-3"></div>
<div class="left">
  <div class="badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>Ücretsiz · Reklamsız</div>
  <div class="brand">Vitesse</div>
  <div class="tagline">Her dolum. Her bakım.<br>Hepsi burada.</div>
  <div class="pills">
    <div class="pill"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="3" width="10" height="18" rx="1"/><path d="M3 13h10"/><path d="M13 8h2a2 2 0 0 1 2 2v5a2 2 0 0 0 4 0V9a2 2 0 0 0-.59-1.41l-1.66-1.66"/></svg>Yakıt Takibi</div>
    <div class="pill"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>Bakım</div>
    <div class="pill"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M15 9c0-1.1-1.3-2-3-2s-3 .9-3 2 1.3 2 3 2 3 .9 3 2-1.3 2-3 2-3-.9-3-2"/><path d="M12 7v10"/></svg>Gider Analizi</div>
  </div>
  <div class="rating">
    <div class="stars">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
    </div>
    <span class="rating-text">Google Play</span>
  </div>
</div>
<div class="cards">
  <div class="card card-vehicle">
    <div class="veh-label">Araç İstatistikleri</div>
    <div class="veh-stats">
      <div class="vs"><span class="vs-val">85.240 km</span><span class="vs-key">Toplam km</span></div>
      <div class="vs"><span class="vs-val">6.4 L/100km</span><span class="vs-key">Ort. tüketim</span></div>
      <div class="vs"><span class="vs-val">₺24.580</span><span class="vs-key">Bu yıl harcama</span></div>
      <div class="vs"><span class="vs-val">42 dolum</span><span class="vs-key">Toplam kayıt</span></div>
    </div>
  </div>
  <div class="card card-expense">
    <div class="exp-title">Mayıs Giderleri</div>
    <div class="bar-row">
      <div class="bar-item"><span class="bar-label">Yakıt</span><div class="bar-track"><div class="bar-fill" style="width:78%;background:linear-gradient(90deg,#7c6bff,#a89eff)"></div></div><span class="bar-val">₺8.240</span></div>
      <div class="bar-item"><span class="bar-label">Bakım</span><div class="bar-track"><div class="bar-fill" style="width:32%;background:linear-gradient(90deg,#34d399,#6ee7b7)"></div></div><span class="bar-val">₺3.400</span></div>
      <div class="bar-item"><span class="bar-label">Diğer</span><div class="bar-track"><div class="bar-fill" style="width:14%;background:linear-gradient(90deg,#94a3b8,#cbd5e1)"></div></div><span class="bar-val">₺1.500</span></div>
    </div>
  </div>
  <div class="card card-maint">
    <div class="maint-header">
      <span class="maint-title">Yaklaşan Bakım</span>
      <span class="maint-badge"><svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>1.200 km</span>
    </div>
    <div class="maint-item"><span class="maint-name">Yağ Değişimi</span><span class="maint-km">86.200 km</span></div>
  </div>
</div>
<div class="bottom-bar"></div></div></body></html>`;

(async () => {
  fs.writeFileSync(TMP, html, 'utf8');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });
  await page.goto('file:///' + TMP.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'C:/Users/arsla/Desktop/ikonlar/feature_v2_arac_ozeti.png', clip: { x:0, y:0, width:1024, height:500 } });
  await browser.close();
  fs.unlinkSync(TMP);
  console.log('Kaydedildi → feature_v2_arac_ozeti.png');
})();
