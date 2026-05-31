const puppeteer = require('puppeteer');
const fs = require('fs');

const OUT = 'C:/Users/arsla/Desktop/ikonlar/screens/mockup/';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const BG   = '#0b0f11';
const CARD = '#161a1d';
const ACC  = '#f4af2d';
const NAV  = '#1a1e21';

const navbar = (active) => `
  <div class="navbar">
    <div class="nb-item ${active==='ozet'?'nb-active':''}">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span>Özet</span>
    </div>
    <div class="nb-item ${active==='gecmis'?'nb-active':''}">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span>Geçmiş</span>
    </div>
    <div class="fab">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </div>
    <div class="nb-item ${active==='takvim'?'nb-active':''}">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <span>Takvim</span>
    </div>
    <div class="nb-item ${active==='ayarlar'?'nb-active':''}">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
      <span>Ayarlar</span>
    </div>
  </div>`;

const baseCSS = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:390px; height:844px; overflow:hidden; background:${BG}; font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif; color:#fff; -webkit-font-smoothing:antialiased; }
  .screen { width:390px; height:844px; display:flex; flex-direction:column; position:relative; }
  .content { flex:1; overflow:hidden; padding:0 20px; padding-top:56px; }
  .page-title { font-size:28px; font-weight:700; margin-bottom:4px; }
  .page-sub { font-size:13px; color:rgba(255,255,255,0.4); margin-bottom:20px; }
  .card { background:${CARD}; border-radius:16px; padding:16px; margin-bottom:12px; }
  .label { font-size:11px; font-weight:600; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
  .big-num { font-size:42px; font-weight:700; color:#fff; line-height:1; }
  .big-unit { font-size:14px; color:rgba(255,255,255,0.4); margin-left:4px; }
  .acc { color:${ACC}; }
  .row { display:flex; align-items:center; justify-content:space-between; }
  .col2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px; }
  .pill { display:inline-flex; align-items:center; gap:5px; background:${ACC}; color:#000; font-size:13px; font-weight:700; padding:6px 14px; border-radius:20px; }
  .pill-outline { display:inline-flex; align-items:center; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); color:rgba(255,255,255,0.7); font-size:13px; font-weight:500; padding:6px 14px; border-radius:20px; }
  .sec-title { font-size:11px; font-weight:600; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:1.2px; margin-bottom:10px; margin-top:4px; }
  /* navbar */
  .navbar { position:absolute; bottom:0; left:0; right:0; height:82px; background:${NAV}; border-radius:24px 24px 0 0; display:flex; align-items:center; justify-content:space-around; padding:0 8px 16px; }
  .nb-item { display:flex; flex-direction:column; align-items:center; gap:4px; font-size:11px; color:rgba(255,255,255,0.4); min-width:60px; }
  .nb-active { color:${ACC}; }
  .fab { width:52px; height:52px; background:${ACC}; border-radius:16px; display:flex; align-items:center; justify-content:center; margin-top:-16px; }
  /* chart placeholders */
  .chart-area { background:rgba(255,255,255,0.03); border-radius:12px; height:140px; position:relative; overflow:hidden; }
  .bar-chart { display:flex; align-items:flex-end; gap:8px; height:100px; padding:10px 10px 0; }
  .bar { border-radius:4px 4px 0 0; flex:1; background:${ACC}; opacity:0.85; }
  .bar-dim { background:rgba(255,255,255,0.12); }
  .chart-labels { display:flex; justify-content:space-around; padding:6px 10px 0; }
  .chart-lbl { font-size:10px; color:rgba(255,255,255,0.3); }
  /* entry row */
  .entry { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
  .entry:last-child { border-bottom:none; }
  .entry-icon { width:36px; height:36px; background:rgba(255,255,255,0.06); border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .entry-info { flex:1; }
  .entry-title { font-size:14px; font-weight:600; }
  .entry-sub { font-size:12px; color:rgba(255,255,255,0.4); margin-top:2px; }
  .entry-val { text-align:right; }
  .entry-price { font-size:14px; font-weight:700; }
  .entry-detail { font-size:11px; color:rgba(255,255,255,0.4); margin-top:2px; }
  /* stat mini */
  .stat-mini { }
  .stat-mini .val { font-size:20px; font-weight:700; }
  .stat-mini .sub { font-size:11px; color:rgba(255,255,255,0.35); margin-top:2px; }
  /* progress bar */
  .progress-track { height:3px; background:rgba(255,255,255,0.08); border-radius:2px; margin-top:10px; }
  .progress-fill { height:100%; border-radius:2px; background:${ACC}; }
  /* tag */
  .tag-acc { background:rgba(244,175,45,0.15); color:${ACC}; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; }`;

// ── Ekran 1: Özet ────────────────────────────────────────────
const screen1 = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>${baseCSS}
.trend-line { position:absolute; bottom:0; left:0; right:0; }
</style></head><body><div class="screen">
<div class="content">
  <div class="page-title">Özet</div>
  <div class="page-sub">5 dolum kaydı</div>

  <div class="card">
    <div class="row">
      <div>
        <div class="label">Ortalama Tüketim</div>
        <div style="display:flex;align-items:baseline;gap:6px">
          <span class="big-num">6,6</span>
          <span class="big-unit">L/100km</span>
        </div>
        <div style="margin-top:10px;font-size:13px;color:rgba(255,255,255,0.45)">Son dolumda ödenen &nbsp;<span class="acc" style="font-weight:700">67,70 ₺/L</span></div>
      </div>
      <div class="pill" style="flex-direction:column;gap:2px;padding:10px 14px">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
        <span style="font-size:11px">İstasyonlar</span>
      </div>
    </div>
  </div>

  <div class="col2">
    <div class="card">
      <div class="label">Bu ay harcama</div>
      <div class="stat-mini"><div class="val">8.240 ₺</div><div class="sub">3 dolum · 138,2 L</div></div>
    </div>
    <div class="card">
      <div class="label">km başına</div>
      <div class="stat-mini"><div class="val">4,22 ₺</div><div class="sub" style="color:rgba(244,175,45,0.7)">ort. 625 km/dolum</div></div>
    </div>
  </div>

  <div class="col2">
    <div class="card">
      <div class="label">Son dolum</div>
      <div class="stat-mini"><div class="val">2.748 ₺</div><div class="sub">3 gün önce · 48,2 L · Shell</div></div>
    </div>
    <div class="card">
      <div class="label">Bu yıl harcama</div>
      <div class="stat-mini"><div class="val acc">24.580 ₺</div><div class="sub">ort. 4.916 ₺/ay</div></div>
    </div>
  </div>

  <div class="sec-title">Tüketim Trendi</div>
  <div class="card" style="padding:12px">
    <div class="chart-area" style="height:110px">
      <svg width="100%" height="110" viewBox="0 0 350 110" preserveAspectRatio="none">
        <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${ACC}" stop-opacity="0.3"/><stop offset="100%" stop-color="${ACC}" stop-opacity="0.02"/></linearGradient></defs>
        <path d="M0,85 C40,80 80,65 120,55 C160,45 200,40 240,35 C280,30 320,38 350,42 L350,110 L0,110 Z" fill="url(#g)"/>
        <path d="M0,85 C40,80 80,65 120,55 C160,45 200,40 240,35 C280,30 320,38 350,42" fill="none" stroke="${ACC}" stroke-width="2"/>
        <circle cx="0" cy="85" r="4" fill="${ACC}"/>
        <circle cx="120" cy="55" r="4" fill="${ACC}"/>
        <circle cx="240" cy="35" r="4" fill="${ACC}"/>
        <circle cx="350" cy="42" r="4" fill="${ACC}"/>
      </svg>
    </div>
  </div>
</div>
${navbar('ozet')}
</div></body></html>`;

// ── Ekran 2: Geçmiş ──────────────────────────────────────────
const screen2 = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>${baseCSS}</style></head><body><div class="screen">
<div class="content">
  <div class="row" style="margin-bottom:16px">
    <div><div class="page-title">Geçmiş</div></div>
    <div class="pill">LPG Hesabı</div>
  </div>

  <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
    <div class="pill" style="padding:5px 14px;font-size:12px">Tümü</div>
    <div class="pill-outline" style="padding:5px 14px;font-size:12px">Bu ay</div>
    <div class="pill-outline" style="padding:5px 14px;font-size:12px">Son 3 ay</div>
    <div class="pill-outline" style="padding:5px 14px;font-size:12px">Bu yıl</div>
  </div>

  <div class="sec-title">Aylık Tüketim</div>
  <div class="card" style="padding:14px 14px 10px">
    <div class="bar-chart" style="height:90px">
      <div class="bar bar-dim" style="height:30%"></div>
      <div class="bar bar-dim" style="height:55%"></div>
      <div class="bar" style="height:80%"></div>
      <div class="bar" style="height:95%"></div>
      <div class="bar" style="height:70%"></div>
    </div>
    <div class="chart-labels">
      <span class="chart-lbl">Oca</span>
      <span class="chart-lbl">Şub</span>
      <span class="chart-lbl">Mar</span>
      <span class="chart-lbl">Nis</span>
      <span class="chart-lbl">May</span>
    </div>
  </div>

  <div class="sec-title" style="margin-top:4px">Tüm Dolumlar &nbsp;<span style="color:rgba(255,255,255,0.25)">12.012 ₺ · 188,0 L</span></div>
  <div class="card" style="padding:12px 14px">
    <div class="entry">
      <div class="entry-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${ACC}" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="10" height="18" rx="1"/><path d="M3 13h10"/><path d="M13 8h2a2 2 0 0 1 2 2v5a2 2 0 0 0 4 0V9"/></svg></div>
      <div class="entry-info"><div class="entry-title">Shell · Kadıköy</div><div class="entry-sub">18 Mayıs · 48,2 L · Tam dolu</div></div>
      <div class="entry-val"><div class="entry-price acc">2.748 ₺</div><div class="entry-detail">67,70 ₺/L</div></div>
    </div>
    <div class="entry">
      <div class="entry-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${ACC}" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="10" height="18" rx="1"/><path d="M3 13h10"/><path d="M13 8h2a2 2 0 0 1 2 2v5a2 2 0 0 0 4 0V9"/></svg></div>
      <div class="entry-info"><div class="entry-title">BP · Üsküdar</div><div class="entry-sub">4 Mayıs · 42,0 L · Tam dolu</div></div>
      <div class="entry-val"><div class="entry-price acc">2.394 ₺</div><div class="entry-detail">57,00 ₺/L</div></div>
    </div>
    <div class="entry">
      <div class="entry-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${ACC}" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="10" height="18" rx="1"/><path d="M3 13h10"/><path d="M13 8h2a2 2 0 0 1 2 2v5a2 2 0 0 0 4 0V9"/></svg></div>
      <div class="entry-info"><div class="entry-title">Total · Beşiktaş</div><div class="entry-sub">21 Nisan · 50,0 L · Tam dolu</div></div>
      <div class="entry-val"><div class="entry-price acc">2.850 ₺</div><div class="entry-detail">57,00 ₺/L</div></div>
    </div>
  </div>
</div>
${navbar('gecmis')}
</div></body></html>`;

// ── Ekran 3: Takvim ──────────────────────────────────────────
const screen3 = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>${baseCSS}
.event-card { background:${CARD}; border-radius:16px; padding:14px 16px; margin-bottom:10px; }
.event-row { display:flex; align-items:center; gap:12px; }
.event-icon { width:40px; height:40px; background:rgba(255,255,255,0.06); border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.event-info { flex:1; }
.event-name { font-size:15px; font-weight:600; }
.event-dates { font-size:12px; color:rgba(255,255,255,0.4); margin-top:3px; }
.badge-days { background:rgba(244,175,45,0.15); color:${ACC}; font-size:13px; font-weight:700; padding:6px 10px; border-radius:10px; text-align:center; line-height:1.2; }
.badge-days.urgent { background:rgba(239,68,68,0.15); color:#f87171; }
</style></head><body><div class="screen">
<div class="content">
  <div class="row" style="margin-bottom:20px">
    <div class="page-title">Takvim</div>
    <div class="pill">+ Ekle</div>
  </div>

  <div class="sec-title">Devam Eden</div>

  <div class="event-card">
    <div class="event-row">
      <div class="event-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${ACC}" stroke-width="2" stroke-linecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
      <div class="event-info">
        <div class="event-name">Muayene</div>
        <div class="event-dates">20.04.2026 → 28.05.2026</div>
      </div>
      <div class="badge-days urgent">8<br><span style="font-size:10px">gün</span></div>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:88%;background:#f87171"></div></div>
  </div>

  <div class="event-card">
    <div class="event-row">
      <div class="event-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${ACC}" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
      <div class="event-info">
        <div class="event-name">Kasko</div>
        <div class="event-dates">15.05.2026 → 03.06.2026</div>
      </div>
      <div class="badge-days">14<br><span style="font-size:10px">gün</span></div>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:35%"></div></div>
  </div>

  <div class="sec-title" style="margin-top:8px">Yaklaşan</div>

  <div class="event-card">
    <div class="event-row">
      <div class="event-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-linecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>
      <div class="event-info">
        <div class="event-name">Yağ Değişimi</div>
        <div class="event-dates">86.200 km · 1.200 km kaldı</div>
      </div>
      <div class="badge-days">~45<br><span style="font-size:10px">gün</span></div>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:92%"></div></div>
  </div>

  <div class="event-card">
    <div class="event-row">
      <div class="event-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div>
      <div class="event-info">
        <div class="event-name">Lastik Rotasyonu</div>
        <div class="event-dates">01.07.2026</div>
      </div>
      <div class="badge-days">43<br><span style="font-size:10px">gün</span></div>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:20%"></div></div>
  </div>
</div>
${navbar('takvim')}
</div></body></html>`;

// ── Ekran 4: Gider Analizi (Özet scroll aşağı) ───────────────
const screen4 = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>${baseCSS}
.donut-wrap { display:flex; align-items:center; gap:20px; }
.legend { display:flex; flex-direction:column; gap:8px; }
.leg-item { display:flex; align-items:center; gap:8px; font-size:13px; }
.leg-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
</style></head><body><div class="screen">
<div class="content">
  <div class="page-title">Gider Analizi</div>
  <div class="page-sub">Mayıs 2026</div>

  <div class="card">
    <div class="row" style="margin-bottom:14px">
      <div class="label" style="margin:0">Toplam Harcama</div>
      <div style="font-size:20px;font-weight:700;color:${ACC}">13.140 ₺</div>
    </div>
    <div class="donut-wrap">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r="40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="16"/>
        <circle cx="55" cy="55" r="40" fill="none" stroke="${ACC}" stroke-width="16" stroke-dasharray="163 88" stroke-dashoffset="-69" stroke-linecap="round"/>
        <circle cx="55" cy="55" r="40" fill="none" stroke="#34d399" stroke-width="16" stroke-dasharray="67 184" stroke-dashoffset="-232" stroke-linecap="round"/>
        <circle cx="55" cy="55" r="40" fill="none" stroke="#94a3b8" stroke-width="16" stroke-dasharray="21 230" stroke-dashoffset="-299" stroke-linecap="round"/>
        <text x="55" y="52" text-anchor="middle" font-size="13" fill="rgba(255,255,255,0.4)" font-family="sans-serif">toplam</text>
        <text x="55" y="68" text-anchor="middle" font-size="14" fill="white" font-weight="700" font-family="sans-serif">13.140₺</text>
      </svg>
      <div class="legend">
        <div class="leg-item"><div class="leg-dot" style="background:${ACC}"></div><div><div style="font-weight:600">Yakıt</div><div style="font-size:12px;color:rgba(255,255,255,0.4)">8.240 ₺ · %63</div></div></div>
        <div class="leg-item"><div class="leg-dot" style="background:#34d399"></div><div><div style="font-weight:600">Bakım</div><div style="font-size:12px;color:rgba(255,255,255,0.4)">3.400 ₺ · %26</div></div></div>
        <div class="leg-item"><div class="leg-dot" style="background:#94a3b8"></div><div><div style="font-weight:600">Diğer</div><div style="font-size:12px;color:rgba(255,255,255,0.4)">1.500 ₺ · %11</div></div></div>
      </div>
    </div>
  </div>

  <div class="sec-title">Aylık Karşılaştırma</div>
  <div class="card" style="padding:14px">
    <div class="bar-chart" style="height:100px">
      <div class="bar bar-dim" style="height:45%"></div>
      <div class="bar bar-dim" style="height:62%"></div>
      <div class="bar bar-dim" style="height:80%"></div>
      <div class="bar bar-dim" style="height:72%"></div>
      <div class="bar" style="height:95%"></div>
    </div>
    <div class="chart-labels">
      <span class="chart-lbl">Oca</span>
      <span class="chart-lbl">Şub</span>
      <span class="chart-lbl">Mar</span>
      <span class="chart-lbl">Nis</span>
      <span class="chart-lbl" style="color:${ACC}">May</span>
    </div>
  </div>

  <div class="col2" style="margin-top:4px">
    <div class="card"><div class="label">Aylık ort.</div><div class="stat-mini"><div class="val">4.916 ₺</div><div class="sub">son 5 ay</div></div></div>
    <div class="card"><div class="label">km başına</div><div class="stat-mini"><div class="val acc">4,22 ₺</div><div class="sub">ort. maliyet</div></div></div>
  </div>
</div>
${navbar('ozet')}
</div></body></html>`;

const screens = [
  { name: '1_ozet',    html: screen1 },
  { name: '2_gecmis',  html: screen2 },
  { name: '3_takvim',  html: screen3 },
  { name: '4_analiz',  html: screen4 },
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  for (const s of screens) {
    const tmp = require('path').join(__dirname, '_tmp_mock.html');
    fs.writeFileSync(tmp, s.html, 'utf8');
    await page.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
    await page.screenshot({ path: OUT + s.name + '.png', clip: { x:0, y:0, width:390, height:844 } });
    fs.unlinkSync(tmp);
    console.log('✓', s.name);
  }

  await browser.close();
  console.log('\nKaydedildi →', OUT);
})();
