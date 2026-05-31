const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUT = 'C:/Users/arsla/Desktop/ikonlar/';
const TMP = path.join(__dirname, '_tmp_feature.html');

const LEFT_SIDE = `
  <div class="glow-left"></div>
  <div class="glow-right"></div>
  <div class="grid-overlay"></div>
  <div class="ring ring-1"></div>
  <div class="ring ring-2"></div>
  <div class="ring ring-3"></div>
  <div class="left">
    <div class="badge">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
      Ücretsiz · Reklamsız
    </div>
    <div class="brand">Vitesse</div>
    <div class="tagline">Aracınızın yakıt, bakım ve tüm giderlerini akıllıca yönetin.</div>
    <div class="pills">
      <div class="pill">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="3" width="10" height="18" rx="1"/><path d="M3 13h10"/><path d="M13 8h2a2 2 0 0 1 2 2v5a2 2 0 0 0 4 0V9a2 2 0 0 0-.59-1.41l-1.66-1.66"/></svg>
        Yakıt Takibi
      </div>
      <div class="pill">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        Bakım
      </div>
      <div class="pill">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M15 9c0-1.1-1.3-2-3-2s-3 .9-3 2 1.3 2 3 2 3 .9 3 2-1.3 2-3 2-3-.9-3-2"/><path d="M12 7v10"/></svg>
        Gider Analizi
      </div>
    </div>
  </div>
  <div class="bottom-bar"></div>`;

const DARK_CSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width:1024px; height:500px; overflow:hidden; background:#0a0a14; font-family:'Inter',sans-serif; }
    .canvas { width:1024px; height:500px; position:relative; overflow:hidden; background:linear-gradient(135deg,#0a0a14 0%,#0f0f20 50%,#0a0a14 100%); }
    .ring { position:absolute; border-radius:50%; border:1px solid rgba(124,107,255,0.12); }
    .ring-1 { width:600px; height:600px; top:-150px; right:-80px; }
    .ring-2 { width:420px; height:420px; top:-60px; right:10px; }
    .ring-3 { width:240px; height:240px; top:30px; right:100px; }
    .glow-left { position:absolute; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(124,107,255,0.18) 0%,transparent 70%); top:-100px; left:-80px; }
    .glow-right { position:absolute; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(91,79,255,0.14) 0%,transparent 70%); top:0; right:-100px; }
    .grid-overlay { position:absolute; inset:0; background-image:linear-gradient(rgba(124,107,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,107,255,0.04) 1px,transparent 1px); background-size:60px 60px; }
    .left { position:absolute; left:72px; top:50%; transform:translateY(-50%); z-index:10; }
    .badge { display:inline-flex; align-items:center; gap:6px; background:rgba(124,107,255,0.15); border:1px solid rgba(124,107,255,0.35); color:#a89eff; font-size:12px; font-weight:600; padding:5px 14px; border-radius:20px; margin-bottom:20px; letter-spacing:0.5px; text-transform:uppercase; }
    .brand { font-size:88px; font-weight:900; letter-spacing:-4px; line-height:0.95; margin-bottom:18px; background:linear-gradient(135deg,#fff 0%,#c8c0ff 50%,#7c6bff 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    .tagline { font-size:18px; font-weight:500; color:rgba(200,200,220,0.7); letter-spacing:-0.2px; line-height:1.5; max-width:360px; }
    .pills { display:flex; gap:10px; margin-top:28px; }
    .pill { display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:6px 14px; font-size:12px; font-weight:600; color:rgba(200,200,220,0.8); }
    .cards { position:absolute; right:52px; top:50%; transform:translateY(-50%); z-index:10; width:280px; display:flex; flex-direction:column; gap:10px; }
    .card { background:rgba(16,12,32,0.96); border:1px solid rgba(255,255,255,0.09); border-radius:16px; padding:14px 16px; }
    .bottom-bar { position:absolute; bottom:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#7c6bff,#a89eff,transparent); opacity:0.6; }
    /* gider kartı */
    .card-expense { transform:rotate(-1deg); box-shadow:0 8px 32px rgba(0,0,0,0.4),0 0 0 1px rgba(52,211,153,0.12); }
    .exp-title { font-size:11px; font-weight:600; color:#6b6b9a; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:10px; }
    .bar-row { display:flex; flex-direction:column; gap:7px; }
    .bar-item { display:flex; align-items:center; gap:8px; }
    .bar-label { font-size:11px; color:#8888b8; width:44px; flex-shrink:0; }
    .bar-track { flex:1; height:5px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden; }
    .bar-fill { height:100%; border-radius:3px; }
    .bar-val { font-size:11px; font-weight:700; color:#c0c0e0; width:38px; text-align:right; flex-shrink:0; }
    /* bakım kartı */
    .card-maint { transform:rotate(0.8deg); box-shadow:0 8px 32px rgba(0,0,0,0.4),0 0 0 1px rgba(251,191,36,0.1); }
    .maint-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
    .maint-title { font-size:11px; font-weight:600; color:#6b6b9a; text-transform:uppercase; letter-spacing:0.6px; }
    .maint-badge { display:inline-flex; align-items:center; gap:4px; background:rgba(251,191,36,0.12); border:1px solid rgba(251,191,36,0.25); color:#fbbf24; font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; }
    .maint-item { display:flex; align-items:center; justify-content:space-between; }
    .maint-name { font-size:13px; font-weight:600; color:#d0d0f0; }
    .maint-km { font-size:12px; font-weight:700; color:#fbbf24; }`;

const CARDS_BOTTOM = `
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
      </div>`;

// ── Versiyonlar ──────────────────────────────────────────────

const versions = [

  // V1: Son Dolum kartı
  {
    name: 'feature_v1_son_dolum',
    html: `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"/>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
    <style>${DARK_CSS}
    .card-fuel { transform:rotate(1.5deg); box-shadow:0 8px 32px rgba(0,0,0,0.4),0 0 0 1px rgba(124,107,255,0.12); }
    .card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
    .card-label { font-size:11px; font-weight:600; color:#6b6b9a; text-transform:uppercase; letter-spacing:0.6px; }
    .card-date { font-size:11px; color:#4a4a70; }
    .station { font-size:14px; font-weight:700; color:#e0e0f8; margin-bottom:8px; }
    .row { display:flex; gap:16px; }
    .stat { display:flex; flex-direction:column; gap:2px; }
    .stat-val { font-size:15px; font-weight:700; color:#c8c0ff; }
    .stat-key { font-size:10px; color:#5a5a88; font-weight:600; }
    .badge-fuel { display:inline-flex; align-items:center; gap:4px; background:rgba(124,107,255,0.15); border:1px solid rgba(124,107,255,0.3); color:#a89eff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:20px; }
    </style></head><body><div class="canvas">
    ${LEFT_SIDE}
    <div class="cards">
      <div class="card card-fuel">
        <div class="card-header"><span class="card-label">Son Dolum</span><span class="card-date">18 May 2026</span></div>
        <div class="station">Shell · Kadıköy</div>
        <div class="row">
          <div class="stat"><span class="stat-val">48.2 L</span><span class="stat-key">Miktar</span></div>
          <div class="stat"><span class="stat-val">₺2.748</span><span class="stat-key">Tutar</span></div>
          <div class="stat"><span class="stat-val">6.4 L</span><span class="stat-key">Tüketim</span></div>
          <div style="margin-left:auto;align-self:flex-end"><span class="badge-fuel">Tam dolu</span></div>
        </div>
      </div>
      ${CARDS_BOTTOM}
    </div>
    </div></body></html>`
  },

  // V2: Araç Özeti kartı (mevcut)
  {
    name: 'feature_v2_arac_ozeti',
    html: fs.readFileSync(path.join(__dirname, 'feature-graphic.html'), 'utf8')
  },

  // V3: Yakıt listesi
  {
    name: 'feature_v3_yakit_listesi',
    html: `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"/>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
    <style>${DARK_CSS}
    .log { background:rgba(14,14,24,0.85); border:1px solid rgba(255,255,255,0.07); border-radius:18px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.5); }
    .log-head { padding:12px 16px 10px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:baseline; justify-content:space-between; }
    .log-head-title { font-size:12px; font-weight:600; color:#5a5a88; text-transform:uppercase; letter-spacing:0.6px; }
    .log-head-total { font-size:12px; font-weight:700; color:#7c6bff; }
    .log-entry { display:flex; align-items:center; padding:10px 16px; gap:12px; border-bottom:1px solid rgba(255,255,255,0.04); }
    .log-entry:last-child { border-bottom:none; }
    .log-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
    .log-info { flex:1; min-width:0; }
    .log-station { font-size:13px; font-weight:600; color:#d8d8f0; }
    .log-date { font-size:11px; color:#4a4a6a; margin-top:1px; }
    .log-right { text-align:right; flex-shrink:0; }
    .log-amount { font-size:13px; font-weight:700; color:#c0b8f8; }
    .log-litre { font-size:11px; color:#4a4a6a; margin-top:1px; }
    .log-footer { padding:9px 16px; background:rgba(124,107,255,0.06); display:flex; justify-content:space-between; align-items:center; }
    .log-footer-label { font-size:11px; color:#5a5a88; }
    .log-footer-val { font-size:12px; font-weight:700; color:#a89eff; }
    .cards { width:290px; right:48px; }
    </style></head><body><div class="canvas">
    ${LEFT_SIDE}
    <div class="cards">
      <div class="log">
        <div class="log-head"><span class="log-head-title">Yakıt Geçmişi</span><span class="log-head-total">Mayıs · ₺10.840</span></div>
        <div class="log-entry"><div class="log-dot" style="background:#7c6bff"></div><div class="log-info"><div class="log-station">Shell · Kadıköy</div><div class="log-date">18 Mayıs</div></div><div class="log-right"><div class="log-amount">₺2.748</div><div class="log-litre">48.2 L</div></div></div>
        <div class="log-entry"><div class="log-dot" style="background:#6b6bff"></div><div class="log-info"><div class="log-station">BP · Üsküdar</div><div class="log-date">4 Mayıs</div></div><div class="log-right"><div class="log-amount">₺2.394</div><div class="log-litre">42.0 L</div></div></div>
        <div class="log-entry"><div class="log-dot" style="background:#5b5bdf"></div><div class="log-info"><div class="log-station">Total · Beşiktaş</div><div class="log-date">21 Nisan</div></div><div class="log-right"><div class="log-amount">₺2.850</div><div class="log-litre">50.0 L</div></div></div>
        <div class="log-entry"><div class="log-dot" style="background:#4e4ecc"></div><div class="log-info"><div class="log-station">Opet · Maltepe</div><div class="log-date">7 Nisan</div></div><div class="log-right"><div class="log-amount">₺2.848</div><div class="log-litre">44.5 L</div></div></div>
        <div class="log-footer"><span class="log-footer-label">Ort. tüketim</span><span class="log-footer-val">6.4 L/100 km</span></div>
      </div>
      ${CARDS_BOTTOM}
    </div>
    </div></body></html>`
  },

  // V4: İkiye bölünmüş (karanlık/açık)
  {
    name: 'feature_v4_bolunmus',
    html: `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"/>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
    <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { width:1024px; height:500px; overflow:hidden; font-family:'Inter',sans-serif; }
    .canvas { width:1024px; height:500px; display:flex; }
    .left { width:520px; background:#111; display:flex; flex-direction:column; justify-content:center; padding:0 64px; }
    .app-name { font-size:80px; font-weight:900; letter-spacing:-4px; color:#fff; line-height:1; margin-bottom:16px; }
    .app-name span { color:#7c6bff; }
    .tagline { font-size:16px; font-weight:400; color:rgba(255,255,255,0.5); line-height:1.6; max-width:320px; margin-bottom:36px; }
    .features { display:flex; flex-direction:column; gap:10px; }
    .feature-row { display:flex; align-items:center; gap:10px; font-size:14px; font-weight:500; color:rgba(255,255,255,0.7); }
    .feature-dot { width:5px; height:5px; border-radius:50%; background:#7c6bff; flex-shrink:0; }
    .right { flex:1; background:#f5f4f0; display:flex; flex-direction:column; justify-content:center; padding:0 56px; }
    .stat-block { padding:22px 0; border-bottom:1px solid rgba(0,0,0,0.08); }
    .stat-block:last-child { border-bottom:none; }
    .stat-num { font-size:42px; font-weight:800; letter-spacing:-2px; color:#111; line-height:1; margin-bottom:4px; }
    .stat-label { font-size:13px; font-weight:500; color:#999; }
    .divider { position:absolute; left:520px; top:40px; bottom:40px; width:1px; background:rgba(0,0,0,0.1); }
    </style></head><body><div class="canvas">
    <div class="left">
      <div class="app-name">Vite<span>sse</span></div>
      <div class="tagline">Aracınızın yakıt, bakım ve tüm giderlerini takip edin.</div>
      <div class="features">
        <div class="feature-row"><div class="feature-dot"></div>Yakıt dolumlarını kaydet</div>
        <div class="feature-row"><div class="feature-dot"></div>Bakım takvimini takip et</div>
        <div class="feature-row"><div class="feature-dot"></div>Giderleri analiz et</div>
        <div class="feature-row"><div class="feature-dot"></div>Ücretsiz, reklamsız</div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="right">
      <div class="stat-block"><div class="stat-num">6.4 L</div><div class="stat-label">100 km'de ortalama tüketim</div></div>
      <div class="stat-block"><div class="stat-num">₺24.580</div><div class="stat-label">Bu yıl toplam yakıt harcaması</div></div>
      <div class="stat-block"><div class="stat-num">42 dolum</div><div class="stat-label">Kayıtlı dolum, 85.240 km</div></div>
    </div>
    </div></body></html>`
  },

  // V5: Editorial (mor + krem)
  {
    name: 'feature_v5_editorial',
    html: `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"/>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
    <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { width:1024px; height:500px; overflow:hidden; font-family:'Inter',sans-serif; }
    .canvas { width:1024px; height:500px; display:flex; }
    .panel-left { width:420px; background:#6958E8; display:flex; flex-direction:column; justify-content:space-between; padding:48px 52px; position:relative; flex-shrink:0; }
    .top-label { font-size:11px; font-weight:600; letter-spacing:2.5px; text-transform:uppercase; color:rgba(255,255,255,0.55); }
    .brand-block { flex:1; display:flex; flex-direction:column; justify-content:center; }
    .brand-name { font-size:92px; font-weight:900; letter-spacing:-6px; color:#fff; line-height:0.88; margin-bottom:28px; }
    .brand-rule { width:36px; height:3px; background:rgba(255,255,255,0.35); margin-bottom:20px; }
    .brand-desc { font-size:15px; font-weight:400; color:rgba(255,255,255,0.6); line-height:1.65; max-width:268px; }
    .bottom-tag { display:inline-flex; align-items:center; gap:8px; font-size:12px; font-weight:500; color:rgba(255,255,255,0.4); }
    .bottom-tag::before { content:''; display:block; width:20px; height:1px; background:rgba(255,255,255,0.3); }
    .panel-right { flex:1; background:#F8F5EF; display:flex; flex-direction:column; justify-content:center; padding:0 64px; position:relative; }
    .stat { padding:22px 0; border-bottom:1px solid rgba(0,0,0,0.08); }
    .stat:first-child { border-top:1px solid rgba(0,0,0,0.08); }
    .stat-row { display:flex; align-items:baseline; justify-content:space-between; }
    .stat-number { font-size:44px; font-weight:800; letter-spacing:-2.5px; color:#1a1a1a; line-height:1; }
    .stat-unit { font-size:14px; font-weight:500; color:#999; margin-left:2px; }
    .stat-label { font-size:11px; font-weight:600; color:#aaa; text-transform:uppercase; letter-spacing:1px; text-align:right; max-width:140px; line-height:1.4; }
    </style></head><body><div class="canvas">
    <div class="panel-left">
      <div class="top-label">Araç Defteri</div>
      <div class="brand-block">
        <div class="brand-name">Vitesse</div>
        <div class="brand-rule"></div>
        <div class="brand-desc">Yakıt, bakım ve tüm araç giderlerinizi tek yerde takip edin.</div>
      </div>
      <div class="bottom-tag">Ücretsiz · Reklamsız</div>
    </div>
    <div class="panel-right">
      <div class="stat"><div class="stat-row"><div><span class="stat-number">6.4</span><span class="stat-unit">L / 100km</span></div><div class="stat-label">Ortalama tüketim</div></div></div>
      <div class="stat"><div class="stat-row"><div><span class="stat-number">₺24.580</span></div><div class="stat-label">Bu yıl toplam harcama</div></div></div>
      <div class="stat"><div class="stat-row"><div><span class="stat-number">85.240</span><span class="stat-unit">km</span></div><div class="stat-label">42 dolumda takip edilen</div></div></div>
    </div>
    </div></body></html>`
  }
];

// ── Screenshot al ────────────────────────────────────────────

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });

  for (const v of versions) {
    fs.writeFileSync(TMP, v.html, 'utf8');
    const file = 'file:///' + TMP.replace(/\\/g, '/');
    await page.goto(file, { waitUntil: 'networkidle0' });
    const out = OUT + v.name + '.png';
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1024, height: 500 } });
    console.log('✓', v.name);
  }

  await browser.close();
  fs.unlinkSync(TMP);
  console.log('\nTamamlandı →', OUT);
})();
