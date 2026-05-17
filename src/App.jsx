import React, { useState, useEffect, useMemo, useContext, createContext, useRef } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { LocalNotifications } from '@capacitor/local-notifications';
import './index.css';

/* ── Empty State bileşeni ───────────────────────────────── */
function EmptyState({ icon, title, sub, action, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      <div className="empty-sub">{sub}</div>
      {action && <button className="btn btn-primary" onClick={onAction} style={{ marginTop: 4, padding: '10px 20px', fontSize: 14 }}>{action}</button>}
    </div>
  );
}

/* ── Count-up animasyonu ────────────────────────────────── */
function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (target === null || isNaN(target)) { setValue(target); return; }
    const from = prev.current;
    prev.current = target;
    if (from === target) return;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * ease);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

/* ── Icons ─────────────────────────────────────────────── */
const Icon = {
  Fuel: ({ s = 22 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="10" height="18" rx="1" />
      <path d="M3 13h10" />
      <path d="M13 8h2a2 2 0 0 1 2 2v5a2 2 0 0 0 4 0V9a2 2 0 0 0-.59-1.41l-1.66-1.66" />
    </svg>,

  Home: ({ s = 22 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
    </svg>,

  History: ({ s = 22 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>,

  Calendar: ({ s = 22 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </svg>,

  Settings: ({ s = 22 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>,

  Plus: ({ s = 24 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>,

  Car: ({ s = 14 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </svg>,

  ChevronDown: ({ s = 14 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>,

  TrendDown: ({ s = 14 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>,

  TrendUp: ({ s = 14 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>,

  Coin: ({ s = 18 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9c0-1.1-1.3-2-3-2s-3 .9-3 2 1.3 2 3 2 3 .9 3 2-1.3 2-3 2-3-.9-3-2" />
      <path d="M12 7v10" />
    </svg>,

  Gauge: ({ s = 18 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 19a9 9 0 1 1 17 0" />
      <path d="M12 14l4-3" />
    </svg>,

  Receipt: ({ s = 18 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3v18l2-1.5L9 21l2-1.5L13 21l2-1.5L17 21l2-1.5V3l-2 1.5L15 3l-2 1.5L11 3 9 4.5 7 3 5 4.5" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>,

  Sparkle: ({ s = 18 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L13.5 10L20 12L13.5 14L12 21L10.5 14L4 12L10.5 10z" />
    </svg>,

  Shield: ({ s = 18 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>,

  Wrench: ({ s = 18 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>,

  Pencil: ({ s = 14 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>,

  Trash: ({ s = 14 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>,

  X: ({ s = 22 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>,

  Check: ({ s = 14 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>,

  Bell: ({ s = 18 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>,

  Sun: ({ s = 16 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>,

  Moon: ({ s = 16 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>,

  ClipboardCheck: ({ s = 18 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="m9 12 2 2 4-4" />
    </svg>,

  Tag: ({ s = 18 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </svg>

};

const SignalIcon = () =>
<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
    <rect x="0" y="7" width="3" height="5" rx="0.5" />
    <rect x="5" y="5" width="3" height="7" rx="0.5" />
    <rect x="10" y="2.5" width="3" height="9.5" rx="0.5" />
    <rect x="15" y="0" width="3" height="12" rx="0.5" />
  </svg>;

const WifiIcon = () =>
<svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
    <path d="M8.5 2C5.7 2 3.1 3 1 4.7l1.4 1.4C4.1 4.7 6.2 4 8.5 4s4.4.7 6.1 2.1L16 4.7C13.9 3 11.3 2 8.5 2zm0 4c-1.7 0-3.3.6-4.5 1.7l1.5 1.5c.8-.7 1.9-1.2 3-1.2s2.2.5 3 1.2L13 7.7C11.8 6.6 10.2 6 8.5 6zm0 4l-2 2h4l-2-2z" />
  </svg>;

const BatteryIcon = () =>
<svg width="28" height="13" viewBox="0 0 28 13" fill="none">
    <rect x="0.5" y="0.5" width="23" height="12" rx="3" stroke="currentColor" opacity="0.5" />
    <rect x="2.5" y="2.5" width="19" height="8" rx="1.5" fill="currentColor" />
    <rect x="24.5" y="4" width="2" height="5" rx="1" fill="currentColor" opacity="0.5" />
  </svg>;


/* ── Format helpers ────────────────────────────────────── */
const fmt = (n, d = 2) => {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return Number(n).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });
};
const fmtInt = (n) => {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return Number(n).toLocaleString('tr-TR');
};
const APP_VERSION = 'v16';
const uid = () => Math.random().toString(36).slice(2, 10);
const parseISO = (s) => {if (!s) return null;const [y, m, d] = s.split('-').map(Number);return new Date(y, m - 1, d);};
const fmtDate = (s) => {const d = parseISO(s);if (!d) return '';return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;};
const TR_MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const TR_MONTHS_FULL = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const dayMon = (s) => {const d = parseISO(s);if (!d) return { d: '--', m: '---' };return { d: String(d.getDate()).padStart(2, '0'), m: TR_MONTHS[d.getMonth()] };};
const monthLabel = (yyyyMM) => { const [y, m] = yyyyMM.split('-'); return `${TR_MONTHS_FULL[parseInt(m, 10) - 1]} ${y}`; };
const todayISO = () => {const d = new Date();return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;};
const yesterdayISO = () => {const d = new Date(); d.setDate(d.getDate() - 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;};
const daysUntil = (iso) => {const b = parseISO(iso);if (!b) return 0;return Math.round((b - new Date()) / 86400000);};
const parseNum = (s) => {
  if (typeof s !== 'string') return Number(s) || 0;
  return parseFloat(s.replace(',', '.')) || 0;
};

/* ── Store ─────────────────────────────────────────────── */
const STORAGE_KEY = 'vitesse-v4';
const SEED = {
  entries: [
  { id: 'e1', dateISO: '2026-02-14', liters: 25.00, pricePerL: 58.00, km: 143000, station: '', full: true },
  { id: 'e2', dateISO: '2026-03-01', liters: 30.00, pricePerL: 60.00, km: 143300, station: '', full: true },
  { id: 'e3', dateISO: '2026-03-09', liters: 45.00, pricePerL: 62.00, km: 143800, station: 'BP', full: true },
  { id: 'e4', dateISO: '2026-03-15', liters: 45.00, pricePerL: 65.00, km: 144700, station: 'BP', full: false },
  { id: 'e5', dateISO: '2026-03-25', liters: 45.00, pricePerL: 67.70, km: 145500, station: 'Shell', full: true }],

  events: [
  { id: 'ev1', type: 'Kasko', startISO: '2026-05-15', endISO: '2026-06-03', notifyDays: 15 },
  { id: 'ev2', type: 'Muayene', startISO: '2026-04-20', endISO: '2026-05-28', notifyDays: 30 }],

  prefs: { showMinMax: false, kmReminders: [] }
};

function loadStore() {
  try {const raw = localStorage.getItem(STORAGE_KEY);return raw ? JSON.parse(raw) : SEED;}
  catch (e) {return SEED;}
}
function saveStore(d) {try {localStorage.setItem(STORAGE_KEY, JSON.stringify(d));} catch (e) {}}

const StoreCtx = createContext(null);
function StoreProvider({ children }) {
  const [data, setData] = useState(loadStore);
  useEffect(() => {saveStore(data);}, [data]);
  const actions = useMemo(() => ({
    addEntry: (e) => setData((d) => ({ ...d, entries: [...d.entries, { ...e, id: uid() }] })),
    updateEntry: (id, p) => setData((d) => ({ ...d, entries: d.entries.map((e) => e.id === id ? { ...e, ...p } : e) })),
    deleteEntry: (id) => setData((d) => ({ ...d, entries: d.entries.filter((e) => e.id !== id) })),
    addEvent: (e) => setData((d) => ({ ...d, events: [...d.events, { ...e, id: uid() }] })),
    updateEvent: (id, p) => setData((d) => ({ ...d, events: d.events.map((e) => e.id === id ? { ...e, ...p } : e) })),
    deleteEvent: (id) => setData((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) })),
    setPref: (key, val) => setData((d) => ({ ...d, prefs: { ...(d.prefs || {}), [key]: val } })),
    resetToSeed: () => setData((d) => ({ entries: SEED.entries, events: SEED.events, prefs: d.prefs || SEED.prefs })),
    loadData: (d) => setData(d),
  }), []);
  const value = useMemo(() => ({ ...data, ...actions }), [data, actions]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
const useStore = () => useContext(StoreCtx);

/* ── i18n ──────────────────────────────────────────────── */
const TRANSLATIONS = {
  tr: {
    appName: 'Vitesse - Araç Defteri',
    ozet: 'Özet', gecmis: 'Geçmiş', takvim: 'Takvim', ayarlar: 'Ayarlar',
    addFuel: 'Dolum ekle', noEntries: 'Henüz dolum kaydı yok',
    noEntriesSub: 'İlk dolumunu ekleyerek yakıt tüketimini ve harcamalarını takip etmeye başla.',
  },
  en: {
    appName: 'Vitesse - Car Journal',
    ozet: 'Summary', gecmis: 'History', takvim: 'Calendar', ayarlar: 'Settings',
    addFuel: 'Add fuel', noEntries: 'No fuel entries yet',
    noEntriesSub: 'Add your first fill-up to start tracking fuel consumption and costs.',
  },
};
const LangCtx = createContext('tr');
const useLang = () => useContext(LangCtx);
const ThemeCtx = createContext('dark');
const useTheme = () => useContext(ThemeCtx);
const useT = () => { const lang = useLang(); return (key) => (TRANSLATIONS[lang] || TRANSLATIONS.tr)[key] || key; };

/* ── Confirm ───────────────────────────────────────────── */
const ConfirmCtx = createContext(null);
function ConfirmProvider({ children }) {
  const theme = useTheme();
  const dark = theme !== 'light';
  const [state, setState] = useState({ open: false, message: '', onConfirm: null, confirmLabel: 'Sil' });
  const ask = (message, onConfirm, confirmLabel = 'Sil') => setState({ open: true, message, onConfirm, confirmLabel });
  const close = () => setState((s) => ({ ...s, open: false }));
  const modalBg    = dark ? '#22222e' : '#ffffff';
  const modalBorder= dark ? '1px solid #2e2e3c' : '1px solid rgba(0,0,0,0.09)';
  const titleColor = dark ? '#f0f0f5' : '#1a1830';
  const msgColor   = dark ? '#9898ac' : '#5a5780';
  const iconBg     = dark ? 'rgba(248,113,113,0.28)' : 'rgba(220,38,38,0.16)';
  const iconColor  = dark ? '#f87171' : '#dc2626';
  const cancelStyle = dark
    ? { background: 'rgba(255,255,255,0.07)', color: '#c8c8da', border: '1px solid rgba(255,255,255,0.1)' }
    : { background: '#f0efff', color: '#3d3a6e', border: '1px solid #c4c0f0' };
  const dangerStyle = dark
    ? { background: '#b91c1c', color: '#fff' }
    : { background: '#dc2626', color: '#fff' };
  return (
    <ConfirmCtx.Provider value={ask}>
      {children}
      {state.open && (
        <div className="modal-overlay alert" onClick={close}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: modalBg, border: modalBorder, borderRadius: 22, padding: '26px 22px 22px', width: '100%', textAlign: 'center', boxShadow: dark ? '0 8px 40px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.12)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon.Trash s={24} color={iconColor} />
            </div>
            <h2 style={{ marginBottom: 8, color: titleColor }}>Emin misin?</h2>
            <p style={{ fontSize: 14, color: msgColor, lineHeight: 1.6, margin: '0 0 22px' }}>{state.message}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" style={{ flex: 1, justifyContent: 'center', borderRadius: 12, padding: '13px 12px', fontSize: 14, fontWeight: 500, ...cancelStyle }} onClick={close}>İptal</button>
              <button className="btn" style={{ flex: 1, justifyContent: 'center', borderRadius: 12, padding: '13px 12px', fontSize: 14, fontWeight: 600, border: 'none', ...dangerStyle }} onClick={() => { state.onConfirm(); close(); }}>{state.confirmLabel}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}
const useConfirm = () => useContext(ConfirmCtx);

/* ── Stats ─────────────────────────────────────────────── */
function consumptionPoints(entries) {
  const xs = [...entries].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const points = [];
  let lastFullIdx = -1;
  for (let i = 0; i < xs.length; i++) {
    if (!xs[i].full) continue;
    if (lastFullIdx === -1) {lastFullIdx = i;continue;}
    let liters = 0;
    for (let j = lastFullIdx + 1; j <= i; j++) liters += xs[j].liters;
    const km = xs[i].km - xs[lastFullIdx].km;
    if (km > 0) points.push({ dateISO: xs[i].dateISO, consumption: liters * 100 / km, km, liters });
    lastFullIdx = i;
  }
  return points;
}
function averageConsumption(pts) {
  if (!pts.length) return null;
  const totalKm = pts.reduce((s, p) => s + p.km, 0);
  const totalL = pts.reduce((s, p) => s + p.liters, 0);
  return totalKm > 0 ? totalL * 100 / totalKm : null;
}

/* ── Area Chart ────────────────────────────────────────── */
function AreaChart({ data, labels, unit = '', decimals = 2, showMinMax = false }) {
  const [active, setActive] = useState(null);
  if (!data || data.length < 2) return <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-2)', fontSize: 14 }}>Yetersiz veri</div>;
  const W = 320, H = 160;
  const pad = { t: 12, r: 14, b: 8, l: 38 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;

  const dataMin = Math.min(...data);
  const dataMax = Math.max(...data);
  const spread = dataMax - dataMin || 1;

  // Exactly 5 y-axis labels (4 equal intervals)
  const rawStep = spread / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = [1, 2, 5, 10].map((f) => f * mag).find((s) => s >= rawStep) ?? mag * 10;
  const labelDec = step < 1 ? 1 : 0;
  const gridMax = Math.ceil(dataMax / step) * step;
  const gridMin = Math.floor(dataMin / step) * step;
  const numIntervals = Math.round((gridMax - gridMin) / step);
  const gridVals = Array.from({ length: numIntervals + 1 }, (_, i) => parseFloat((gridMin + i * step).toFixed(labelDec)));

  const yMin = gridMin - step * 0.3;
  const yMax = gridMax + step * 0.3;
  const range = yMax - yMin;

  const xs = data.map((_, i) => pad.l + (i / (data.length - 1)) * cW);
  const ys = data.map((v) => pad.t + ((yMax - v) / range) * cH);

  const minVal = Math.min(...data), maxVal = Math.max(...data);
  const minIdx = data.indexOf(minVal), maxIdx = data.indexOf(maxVal);

  // Cubic Bezier smooth path (Catmull-Rom → Bezier)
  const smooth = (pts) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
    }
    return d;
  };

  const pts = xs.map((x, i) => [x, ys[i]]);
  const linePath = smooth(pts);
  const areaPath = `${linePath} L ${xs[xs.length - 1]},${pad.t + cH} L ${xs[0]},${pad.t + cH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', display: 'block' }} onClick={() => setActive(null)}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridVals.map((val, i) => {
        const y = pad.t + ((yMax - val) / range) * cH;
        if (y < pad.t - 2 || y > pad.t + cH + 2) return null;
        return (
          <g key={i}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 5" strokeOpacity="0.7" />
            <text x={pad.l - 12} y={y + 3.5} fontSize="10" textAnchor="end" fill="var(--color-chart-axis)" fontFamily="Geist Mono, monospace">
              {val.toFixed(1)}
            </text>
          </g>
        );
      })}
      <path d={areaPath} fill="url(#areaGrad)" className="chart-area" />
      <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" className="chart-line" />
      {xs.map((x, i) => {
        const isActive = active === i;
        const isMin = showMinMax && i === minIdx;
        const isMax = showMinMax && i === maxIdx;
        const dotColor = isMin ? 'var(--color-good)' : isMax ? 'var(--color-bad)' : isActive ? 'var(--accent)' : 'var(--bg)';
        const strokeColor = isMin ? 'var(--color-good)' : isMax ? 'var(--color-bad)' : 'var(--accent)';
        return (
          <g key={i} style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setActive(active === i ? null : i); }}>
            <circle cx={x} cy={ys[i]} r={isActive || isMin || isMax ? 5 : 3.5} fill={dotColor} stroke={strokeColor} strokeWidth="2" className="chart-dot" style={{ transition: 'r 0.15s', animationDelay: `${0.2 + i * 0.03}s` }} />
            {isActive && labels && (() => {
              const tooltipW = 90, tooltipH = 38;
              const tx = Math.min(Math.max(x - tooltipW / 2, pad.l), W - pad.r - tooltipW);
              const tyAbove = ys[i] - tooltipH - 10;
              const ty = tyAbove < pad.t ? ys[i] + 10 : tyAbove;
              const d = parseISO(labels[i]);
              const dateStr = d ? `${d.getDate()} ${['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][d.getMonth()]}` : labels[i];
              return (
                <g>
                  <rect x={tx} y={ty} width={tooltipW} height={tooltipH} rx="8" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.4" />
                  <text x={tx + tooltipW / 2} y={ty + 13} fontSize="12" fontWeight="500" textAnchor="middle" fill="var(--text-2)" fontFamily="Geist, sans-serif">{dateStr}</text>
                  <text x={tx + tooltipW / 2} y={ty + 28} fontSize="12" fontWeight="600" textAnchor="middle" fill="var(--accent)" fontFamily="Geist Mono, monospace">{fmt(data[i], decimals)} {unit}</text>
                </g>
              );
            })()}
          </g>
        );
      })}
    </svg>
  );
}


/* ── Gider Dağılımı ────────────────────────────────────── */
function GiderDagilimi() {
  const store = useStore();
  const currentYear = useMemo(() => new Date().getFullYear().toString(), []);
  const [year, setYear] = useState(currentYear);

  const years = useMemo(() => {
    const ys = new Set([currentYear]);
    store.entries.forEach(e => ys.add(e.dateISO.slice(0, 4)));
    (store.events || []).filter(e => e.cost).forEach(e => e.startISO && ys.add(e.startISO.slice(0, 4)));
    return [...ys].sort((a, b) => b.localeCompare(a));
  }, [store.entries, store.events, currentYear]);

  const { items, total } = useMemo(() => {
    const yakitTotal = store.entries
      .filter(e => e.dateISO.startsWith(year))
      .reduce((s, e) => s + e.liters * e.pricePerL, 0);
    const evCosts = {};
    (store.events || []).filter(e => e.cost && e.startISO?.startsWith(year))
      .forEach(e => { evCosts[e.type] = (evCosts[e.type] || 0) + e.cost; });
    const COLORS = { Yakıt: '#F4AF2D', Kasko: '#3b82f6', Sigorta: '#ec4899', Muayene: '#14b8a6', Bakım: '#22c55e', Diğer: '#f97316' };
    const raw = [];
    if (yakitTotal > 0) raw.push({ label: 'Yakıt', value: yakitTotal, color: '#F4AF2D' });
    Object.entries(evCosts).forEach(([t, v]) => raw.push({ label: t, value: v, color: COLORS[t] || '#a78bfa' }));
    raw.sort((a, b) => b.value - a.value);
    const total = raw.reduce((s, i) => s + i.value, 0);
    if (total === 0) return { items: [], total: 0 };
    const C = 2 * Math.PI * 54; const GAP = raw.length > 1 ? 3 : 0;
    let cum = 0;
    const items = raw.map(item => {
      const pct = item.value / total;
      const seg = { ...item, pct, da: Math.max(0, pct * C - GAP), doff: -(cum * C), C };
      cum += pct;
      return seg;
    });
    return { items, total };
  }, [store.entries, store.events, year]);

  if (total === 0) return null;

  return (
    <div className="chart-card" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-2)' }}>Gider Dağılımı</span>
        <select value={year} onChange={e => setYear(e.target.value)} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-sans)', cursor: 'pointer', outline: 'none' }}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <svg width={140} height={140} viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
          {items.map((seg, i) => (
            <circle key={i} cx={70} cy={70} r={54} fill="none"
              stroke={seg.color} strokeWidth={18}
              strokeDasharray={`${seg.da} ${seg.C}`}
              strokeDashoffset={seg.doff}
              transform="rotate(-90 70 70)"
            />
          ))}
          <text x={70} y={65} textAnchor="middle" fontSize="10" fill="var(--text-dim)" fontFamily="Geist, sans-serif">Toplam</text>
          <text x={70} y={82} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--text)" fontFamily="Geist Mono, monospace">{fmtInt(Math.round(total))} ₺</text>
        </svg>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((seg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: seg.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{seg.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{Math.round(seg.pct * 100)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── LPG Hesaplama ─────────────────────────────────────── */
function LpgSheet({ onClose }) {
  const store = useStore();

  const defaults = useMemo(() => {
    const entries = [...store.entries].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    if (entries.length < 2) return { monthlyL: null, benzinFiyat: null };
    const lastPrice = entries[entries.length - 1].pricePerL;
    const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - 6);
    const cutISO = cutoff.toISOString().slice(0, 10);
    const last6 = entries.filter(e => e.dateISO >= cutISO);
    const totalL = last6.reduce((s, e) => s + e.liters, 0);
    const months = Math.min(6, Math.max(1,
      (new Date(entries[entries.length-1].dateISO) - new Date(Math.max(new Date(entries[0].dateISO), cutoff))) / (1000*60*60*24*30.44)
    ));
    return { monthlyL: totalL / months, benzinFiyat: lastPrice };
  }, [store.entries]);

  const [tuketimBirim, setTuketimBirim] = useState('₺');
  const [monthlyVal, setMonthlyVal] = useState(() => defaults.monthlyL ? fmt(defaults.monthlyL, 1) : '');
  const [benzinFiyat, setBenzinFiyat] = useState(() => defaults.benzinFiyat ? fmt(defaults.benzinFiyat, 2) : '');
  const [montaj, setMontaj] = useState('');
  const [lpgFiyat, setLpgFiyat] = useState('');
  const [fark, setFark] = useState('18');

  const result = useMemo(() => {
    const mv = parseFloat(monthlyVal.replace(',','.')); const bf = parseFloat(benzinFiyat.replace(',','.'));
    const m = parseFloat(montaj); const lf = parseFloat(lpgFiyat.replace(',','.')); const f = parseFloat(fark) / 100;
    if (!mv || !bf || !m || !lf) return null;
    const ml = tuketimBirim === 'L' ? mv : mv / bf;
    const saving = ml * bf - ml * (1 + f) * lf;
    if (saving <= 0) return { saving, months: null };
    return { saving, months: Math.ceil(m / saving) };
  }, [monthlyVal, benzinFiyat, montaj, lpgFiyat, fark, tuketimBirim]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ paddingBottom: 28 }}>
        <div className="modal-handle" />
        <div className="modal-head">
          <h2>LPG Dönüşüm Hesabı</h2>
          <button className="btn-icon" onClick={onClose}><Icon.X /></button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <div className="label" style={{ margin: 0 }}>Aylık tüketim</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['L', '₺'].map(b => (
                <button key={b} onClick={() => setTuketimBirim(b)}
                  className={`chip-btn${tuketimBirim === b ? ' active' : ''}`}
                  style={{ padding: '3px 10px', fontSize: 12 }}>{b}</button>
              ))}
            </div>
          </div>
          <input className="input" type="number" inputMode="decimal" value={monthlyVal} onChange={e => setMonthlyVal(e.target.value)} placeholder={tuketimBirim === 'L' ? 'örn. 120' : 'örn. 6500'} />
        </div>

        {[
          { label: 'Benzin fiyatı (₺/L)', sub: 'Son dolum fiyatı', val: benzinFiyat, set: setBenzinFiyat, placeholder: 'örn. 65.00' },
          { label: 'Montaj maliyeti (₺)', sub: null, val: montaj, set: setMontaj, placeholder: 'örn. 30000' },
          { label: 'LPG litre fiyatı (₺)', sub: null, val: lpgFiyat, set: setLpgFiyat, placeholder: 'örn. 30.00' },
          { label: 'Tüketim farkı (%)', sub: 'LPG genelde %15–20 fazla tüketir', val: fark, set: setFark, placeholder: '17' },
        ].map(({ label, sub, val, set, placeholder }) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <div className="label" style={{ marginBottom: sub ? 2 : 6 }}>{label}</div>
            {sub && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>{sub}</div>}
            <input className="input" type="number" inputMode="decimal" value={val} onChange={e => set(e.target.value)} placeholder={placeholder} />
          </div>
        ))}

        {result && (() => {
          const isLight = React.useContext(ThemeCtx) === 'light';
          const greenBg = isLight ? 'rgba(34,197,94,0.13)' : 'rgba(34,197,94,0.08)';
          const greenBorder = isLight ? 'rgba(34,197,94,0.45)' : 'rgba(34,197,94,0.2)';
          const redBg = isLight ? 'rgba(248,113,113,0.13)' : 'rgba(248,113,113,0.08)';
          const redBorder = isLight ? 'rgba(248,113,113,0.45)' : 'rgba(248,113,113,0.2)';
          return (
          <div style={{ borderRadius: 12, padding: '14px 16px', marginTop: 4, background: result.months ? greenBg : redBg, border: `1px solid ${result.months ? greenBorder : redBorder}` }}>
            {result.months ? (() => {
              const yil = Math.floor(result.months / 12);
              const ay = result.months % 12;
              const amoriStr = yil > 0 && ay > 0 ? `${yil} yıl ${ay} ay` : yil > 0 ? `${yil} yıl` : `${ay} ay`;
              return (<>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 2 }}>Aylık tasarruf</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--positive)', fontFamily: 'var(--font-mono)' }}>{fmt(result.saving, 0)} ₺</div>
                </div>
                <div style={{ width: 1, height: 36, background: 'var(--text-dim)', alignSelf: 'center', opacity: 0.4 }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 2 }}>Yıllık tasarruf</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--positive)', fontFamily: 'var(--font-mono)' }}>{fmt(result.saving * 12, 0)} ₺</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Amorti süresi: <b style={{ color: 'var(--text)' }}>{amoriStr}</b></div>
            </>);
            })() : (
              <div style={{ fontSize: 13, color: 'var(--negative)' }}>Bu fiyatlarla LPG daha pahalıya geliyor, dönüşüm tavsiye edilmez.</div>
            )}
          </div>
          );
        })()}

        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 14, lineHeight: 1.5 }}>
          * Otomatik doldurulan değerler değiştirilebilir. Gerçek tasarruf araca ve kullanıma göre değişir.
        </div>
      </div>
    </div>
  );
}

/* ── Özet ──────────────────────────────────────────────── */
function OzetScreen() {
  const [infoOpen, setInfoOpen] = useState(false);
  const [consFilter, setConsFilter] = useState('all');
  const store = useStore();
  const myEntries = useMemo(() => [...store.entries].sort((a, b) => b.dateISO.localeCompare(a.dateISO)), [store.entries]);
  const consPts = useMemo(() => consumptionPoints(store.entries), [store.entries]);
  const avgCons = useMemo(() => averageConsumption(consPts), [consPts]);
  const visibleConsPts = useMemo(() => {
    const now = new Date();
    const d3m = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString().slice(0, 10);
    const thisYear = `${now.getFullYear()}`;
    if (consFilter === '3month') return consPts.filter(p => p.dateISO >= d3m);
    if (consFilter === 'year') return consPts.filter(p => p.dateISO.startsWith(thisYear));
    return consPts;
  }, [consPts, consFilter]);
  const lastCons = consPts.length ? consPts[consPts.length - 1].consumption : null;
  const prevCons = consPts.length >= 2 ? consPts[consPts.length - 2].consumption : null;

  const last = myEntries[0];
  const now = new Date();
  const thisMonth = store.entries.filter((e) => {
    const d = parseISO(e.dateISO);
    return d && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const thisMonthSpend = thisMonth.reduce((s, e) => s + e.liters * e.pricePerL, 0);

  const tlPerKm = useMemo(() => {
    if (consPts.length === 0) return null;
    const xs = [...store.entries].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    let lastFull = -1, totalTL = 0, totalKm = 0;
    for (let i = 0; i < xs.length; i++) {
      if (!xs[i].full) continue;
      if (lastFull === -1) { lastFull = i; continue; }
      for (let j = lastFull + 1; j <= i; j++) totalTL += xs[j].liters * xs[j].pricePerL;
      totalKm += xs[i].km - xs[lastFull].km;
      lastFull = i;
    }
    return totalKm > 0 ? totalTL / totalKm : null;
  }, [store.entries, consPts]);

  const sortedEntries = useMemo(() => [...store.entries].sort((a, b) => a.dateISO.localeCompare(b.dateISO)), [store.entries]);
  const lastPrice = sortedEntries.length ? sortedEntries[sortedEntries.length - 1].pricePerL : null;
  const prevPrice = sortedEntries.length >= 2 ? sortedEntries[sortedEntries.length - 2].pricePerL : null;
  const priceDiff = lastPrice !== null && prevPrice !== null ? lastPrice - prevPrice : null;

  const avgKmPerFill = useMemo(() => {
    if (sortedEntries.length < 2) return null;
    const diffs = [];
    for (let i = 1; i < sortedEntries.length; i++) {
      const d = sortedEntries[i].km - sortedEntries[i - 1].km;
      if (d > 0) diffs.push(d);
    }
    return diffs.length ? Math.round(diffs.reduce((s, d) => s + d, 0) / diffs.length) : null;
  }, [sortedEntries]);

  const yearEntries = store.entries.filter((e) => {
    const d = parseISO(e.dateISO);
    return d && d.getFullYear() === now.getFullYear();
  });

  const allWithDays = (store.events || []).map((e) => ({ ...e, days: daysUntil(e.endISO) }));
  const upcoming = allWithDays.filter((e) => e.days >= 0).sort((a, b) => a.days - b.days);
  const expired = allWithDays.filter((e) => e.days < 0).sort((a, b) => b.days - a.days);
  const currentKm = sortedEntries.length ? sortedEntries[sortedEntries.length - 1].km : null;
  const kmReminders = ((store.prefs || {}).kmReminders || []).map((r) => ({
    ...r,
    remaining: currentKm !== null ? (r.lastKm + r.intervalKm) - currentKm : null,
  }));
  const bakimEvents = [...upcoming.filter(e => e.type === 'Bakım'), ...expired.filter(e => e.type === 'Bakım')];
  const otherUpcoming = upcoming.filter(e => e.type !== 'Bakım');
  const otherExpired = expired.filter(e => e.type !== 'Bakım');
  const combinedRows = Array.from({ length: Math.max(kmReminders.length, bakimEvents.length) }, (_, i) => ({ km: kmReminders[i] || null, ev: bakimEvents[i] || null }));

  const yearSpend = yearEntries.reduce((s, e) => s + e.liters * e.pricePerL, 0);
  const animAvgCons = useCountUp(avgCons ?? 0);
  const animMonthSpend = useCountUp(thisMonthSpend);
  const animTlPerKm = useCountUp(tlPerKm ?? 0);
  const animLastSpend = useCountUp(last ? last.liters * last.pricePerL : 0);
  const animYearSpend = useCountUp(yearSpend);

  return (
    <div>
      <div className="app-header">
        <div className="brand-name">Vitesse</div>
      </div>

      <div className="title-row">
        <div className="title-block">
          <h1>Özet</h1>
          <div className="sub">
            {(store.prefs?.vehicleName || store.prefs?.vehicleModel)
              ? `${store.prefs.vehicleName || store.prefs.vehicleModel} · ${myEntries.length} dolum kaydı`
              : `${myEntries.length} dolum kaydı`}
          </div>
        </div>
      </div>

      {myEntries.length === 0 ? (
        <EmptyState
          icon={<Icon.Fuel s={28} />}
          title="Henüz dolum kaydı yok"
          sub="İlk dolumunu ekleyerek yakıt tüketimini ve harcamalarını takip etmeye başla."
          action={<><Icon.Plus s={14} /> Dolum ekle</>}
          onAction={() => document.querySelector('.fab')?.click()}
        />
      ) : <>

      <div className="hero">
        <div className="hero-top">
          <span className="eyebrow">Ortalama Tüketim</span>
        </div>
        <div className="hero-big-row">
          <span className="hero-big">{avgCons !== null ? fmt(animAvgCons, 1) : '—'}</span>
          <span className="hero-unit">L/100km</span>
<div style={{ position: 'relative', display: 'inline-flex', alignItems: 'flex-end', marginBottom: 3, marginLeft: 6 }}>
            <button onClick={() => setInfoOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-2)', display: 'flex', alignItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </button>
            {infoOpen && <>
              <div onClick={() => setInfoOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
              <div style={{ position: 'absolute', left: 0, top: 22, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--text-2)', whiteSpace: 'nowrap', zIndex: 10, transform: 'translateX(-30%)' }}>{consPts.length >= 2 ? `Tam depolar arası · son ${consPts.length} dolum` : 'En az 2 tam depo gerekli'}</div>
            </>}
          </div>
        </div>

        <div className="tank-row">
          <span className="label">Son dolumda ödenen</span>
          <span className="value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {lastPrice ? <><span className="num">{fmt(lastPrice, 2)}</span><span className="u">₺/L</span></> : <span className="num">—</span>}
            {priceDiff !== null && (
              <span style={{ fontSize: 12, fontWeight: 600, color: priceDiff > 0 ? 'var(--negative)' : 'var(--positive)' }}>
                {priceDiff > 0 ? '↑' : '↓'} {fmt(Math.abs(priceDiff), 2)}
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="top">
            <span className="label">Bu ay harcama</span>
            <span className="icon"><Icon.Coin /></span>
          </div>
          <div className="value">{fmt(animMonthSpend, 2)}<span className="u">₺</span></div>
          <div className="sub">{thisMonth.length} dolum · {fmt(thisMonth.reduce((s, e) => s + e.liters, 0), 1)} L</div>
        </div>
        <div className="stat-card">
          <div className="top">
            <span className="label">km başına</span>
            <span className="icon"><Icon.Gauge /></span>
          </div>
          <div className="value">{tlPerKm !== null ? fmt(animTlPerKm, 2) : '—'}<span className="u">₺/km</span></div>
          <div className="sub">{avgKmPerFill !== null ? `ort. ${fmtInt(avgKmPerFill)} km/dolum` : 'tüm zamanlar'}</div>
        </div>
        <div className="stat-card">
          <div className="top">
            <span className="label">Son dolum</span>
            <span className="icon"><Icon.Receipt /></span>
          </div>
          <div className="value">{last ? fmt(animLastSpend, 2) : '—'}<span className="u">₺</span></div>
          <div className="sub">{last ? ((() => { const d = Math.round((new Date() - parseISO(last.dateISO)) / 86400000); const lbl = d === 0 ? 'Bugün' : d === 1 ? 'Dün' : d + ' gün önce'; return lbl + ' · ' + fmt(last.liters, 1) + ' L' + (last.station ? ' · ' + last.station : ''); })()) : '—'}</div>
        </div>
        <div className="stat-card">
          <div className="top">
            <span className="label">Bu yıl harcama</span>
            <span className="icon"><Icon.Sparkle /></span>
          </div>
          <div className="value">{fmt(animYearSpend, 0)}<span className="u">₺</span></div>
          <div className="sub">bu yıl · {fmt(yearEntries.reduce((s, e) => s + e.liters, 0), 1)} L</div>
        </div>
      </div>

      {consPts.length >= 2 &&
      <>
          <div className="section-title">
            <h3>Tüketim Trendi</h3>
            <div style={{ display: 'flex', gap: 4 }}>
              {[{ key: 'all', label: 'Tümü' }, { key: '3month', label: '3 ay' }, { key: 'year', label: 'Bu yıl' }].map(p => (
                <button key={p.key} className={`filter-pill${consFilter === p.key ? ' active' : ''}`} onClick={() => setConsFilter(p.key)}>{p.label}</button>
              ))}
            </div>
          </div>
          {visibleConsPts.length >= 2
            ? <div className="chart-card"><AreaChart data={visibleConsPts.map((p) => p.consumption)} labels={visibleConsPts.map((p) => p.dateISO)} unit="L/100km" decimals={1} showMinMax={!!(store.prefs && store.prefs.showMinMax)} /></div>
            : <div style={{ margin: '0 18px', padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, textAlign: 'center', fontSize: 13, color: 'var(--text-2)' }}>Bu dönemde yeterli veri yok</div>
          }
        </>
      }

      <GiderDagilimi />

      {((store.events || []).length > 0 || kmReminders.length > 0) && <>
        <div className="section-title" style={{ marginTop: 0 }}>
          <h3>Hatırlatmalar</h3>
          {currentKm && kmReminders.length > 0 && <span className="meta">{fmtInt(currentKm)} km</span>}
        </div>
        {upcoming.length === 0 && expired.length === 0 && kmReminders.length === 0 ? (
          <div style={{ margin: '0 18px' }}>
            <EmptyState
              icon={<Icon.Calendar s={28} />}
              title="Yaklaşan hatırlatma yok"
              sub="Takvim sekmesinden muayene, sigorta gibi etkinlikler ekleyebilirsin."
            />
          </div>
        ) : (
          <div className="upcoming-list">
            {[
              ...combinedRows.map(({ km: r, ev: e }, i) => {
                const kmOverdue = r && r.remaining !== null && r.remaining < 0;
                const kmSoon = r && r.remaining !== null && r.remaining >= 0 && r.remaining <= 500;
                const evExpired = e && e.days < 0;
                const evSoon = e && e.days >= 0 && e.days <= 30;
                const isRed = kmOverdue || evExpired;
                const isYellow = !isRed && (kmSoon || evSoon);
                return { kind: 'bak', r, e, i, p: isRed ? 0 : isYellow ? 1 : 2 };
              }),
              ...otherUpcoming.map(e => ({ kind: 'other', e, expired: false, p: e.days <= 30 ? 1 : 2 })),
              ...otherExpired.map(e => ({ kind: 'other', e, expired: true, p: 0 })),
            ].sort((a, b) => a.p - b.p).map((row) => {
              if (row.kind === 'bak') {
                const { r, e, i } = row;
                const kmOverdue = r && r.remaining !== null && r.remaining < 0;
                const kmSoon = r && r.remaining !== null && r.remaining >= 0 && r.remaining <= 500;
                const kmCls = r ? (kmOverdue ? 'expired' : kmSoon ? 'warn' : 'ok') : null;
                const evExpired = e && e.days < 0;
                const evSoon = e && e.days >= 0 && e.days <= 30;
                const evCls = e ? (evExpired ? 'expired' : evSoon ? 'warn' : 'ok') : null;
                return (
                  <div className={`upcoming-row${evExpired ? ' expired' : ''}`} key={r ? r.id : `bev-${i}`}>
                    <div className="left">
                      <div className="iconbox"><Icon.Wrench s={16} /></div>
                      <div>
                        <div className="name">{r ? r.label : (e ? e.type : 'Bakım')}</div>
                        <div className="date">{r && `Her ${fmtInt(r.intervalKm)} km`}{r && e && ' · '}{e && fmtDate(e.endISO)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      {r && (r.remaining !== null
                        ? <span className={`remaining ${kmCls}`}>{kmOverdue ? `${fmtInt(Math.abs(r.remaining))} km geçti` : `${fmtInt(r.remaining)} km kaldı`}</span>
                        : <span className="remaining">—</span>
                      )}
                      {e && <span className={`remaining ${evCls}`}>{evExpired ? `${Math.abs(e.days)} gün gecikti` : `${e.days} gün`}</span>}
                    </div>
                  </div>
                );
              }
              const { e, expired } = row;
              return (
                <div className={`upcoming-row${expired ? ' expired' : ''}`} key={e.id}>
                  <div className="left">
                    <div className="iconbox">{e.type === 'Kasko' || e.type === 'Sigorta' ? <Icon.Shield /> : e.type === 'Muayene' ? <Icon.ClipboardCheck /> : <Icon.Tag />}</div>
                    <div>
                      <div className="name">{e.type}</div>
                      <div className="date">{fmtDate(e.endISO)}</div>
                    </div>
                  </div>
                  <span className={`remaining ${expired ? 'expired' : e.days <= 30 ? 'warn' : 'ok'}`}>{expired ? `${Math.abs(e.days)} gün gecikti` : `${e.days} gün`}</span>
                </div>
              );
            })}
          </div>
        )}
      </>}
      </> }
    </div>);

}

/* ── Geçmiş ────────────────────────────────────────────── */
function GecmisScreen({ onEdit, onOpenLpg }) {
  const store = useStore();
  const confirm = useConfirm();
  const [timeFilter, setTimeFilter] = useState('all');
  const [stationInfoOpen, setStationInfoOpen] = useState(false);
  const [stationFilter, setStationFilter] = useState(null);

  const allStations = useMemo(() => {
    const seen = new Set();
    const result = [];
    [...store.entries].sort((a, b) => b.dateISO.localeCompare(a.dateISO)).forEach(e => {
      if (e.station && !seen.has(e.station)) { seen.add(e.station); result.push(e.station); }
    });
    return result;
  }, [store.entries]);

  const filtered = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisYear = `${now.getFullYear()}`;
    const d3m = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString().slice(0, 10);
    let xs = [...store.entries];
    if (timeFilter === 'month') xs = xs.filter((e) => e.dateISO.startsWith(thisMonth));
    else if (timeFilter === '3month') xs = xs.filter((e) => e.dateISO >= d3m);
    else if (timeFilter === 'year') xs = xs.filter((e) => e.dateISO.startsWith(thisYear));
    if (stationFilter) xs = xs.filter((e) => e.station === stationFilter);
    return xs.sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  }, [store.entries, timeFilter, stationFilter]);

  const priceHist = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisYear = `${now.getFullYear()}`;
    const d3m = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString().slice(0, 10);
    let xs = [...store.entries];
    if (timeFilter === 'month') xs = xs.filter((e) => e.dateISO.startsWith(thisMonth));
    else if (timeFilter === '3month') xs = xs.filter((e) => e.dateISO >= d3m);
    else if (timeFilter === 'year') xs = xs.filter((e) => e.dateISO.startsWith(thisYear));
    return xs.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  }, [store.entries, timeFilter]);

  const consumptionMap = useMemo(() => {
    const xs = [...store.entries].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    const map = new Map();
    let lastFullIdx = -1;
    for (let i = 0; i < xs.length; i++) {
      if (!xs[i].full) continue;
      if (lastFullIdx === -1) { lastFullIdx = i; continue; }
      let liters = 0;
      for (let j = lastFullIdx + 1; j <= i; j++) liters += xs[j].liters;
      const km = xs[i].km - xs[lastFullIdx].km;
      if (km > 0) map.set(xs[i].id, liters * 100 / km);
      lastFullIdx = i;
    }
    return map;
  }, [store.entries]);

  const stationStats = useMemo(() => {
    const d3m = new Date();
    d3m.setMonth(d3m.getMonth() - 3);
    const cutoff = d3m.toISOString().slice(0, 10);
    const map = {};
    store.entries.filter((e) => e.dateISO >= cutoff).forEach((e) => {
      if (!e.station) return;
      if (!map[e.station]) map[e.station] = { total: 0, liters: 0, count: 0 };
      map[e.station].total += e.liters * e.pricePerL;
      map[e.station].liters += e.liters;
      map[e.station].count += 1;
    });
    return Object.entries(map)
      .map(([name, s]) => ({ name, avg: s.liters > 0 ? s.total / s.liters : 0, count: s.count }))
      .sort((a, b) => a.avg - b.avg);
  }, [store.entries]);

  const timePills = [
    { key: 'all', label: 'Tümü' },
    { key: 'month', label: 'Bu ay' },
    { key: '3month', label: 'Son 3 ay' },
    { key: 'year', label: 'Bu yıl' },
  ];

  return (
    <div>
      <div className="app-header">
        <div className="brand-name">Vitesse</div>
      </div>
      <div style={{ padding: '12px 18px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="title-block" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1>Geçmiş</h1>
            <div className="sub">{filtered.length} dolum kaydı</div>
          </div>
          {store.entries.length >= 2 && (
            <button className="btn-accent" style={{ marginTop: 4 }} onClick={onOpenLpg}>LPG Hesabı</button>
          )}
        </div>
<div className="filter-row">
          {timePills.map((p) => (
            <button key={p.key} className={`filter-pill${timeFilter === p.key ? ' active' : ''}`} onClick={() => setTimeFilter(p.key)}>{p.label}</button>
          ))}
        </div>
        {allStations.length > 0 && (
          <div className="filter-row">
            {allStations.map(s => (
              <button key={s} className={`filter-pill${stationFilter === s ? ' active' : ''}`} onClick={() => setStationFilter(stationFilter === s ? null : s)}>{s}</button>
            ))}
          </div>
        )}
      </div>

      {priceHist.length >= 2 &&
      <>
          <div className="section-title">
            <h3>Fiyat Geçmişi</h3>
            <span className="meta">{timeFilter === 'all' && priceHist.length >= 2 ? `${fmtDate(priceHist[0].dateISO)} – ${fmtDate(priceHist[priceHist.length - 1].dateISO)}` : { '3month': 'Son 3 ay', year: 'Bu yıl' }[timeFilter]}</span>
          </div>
          <div className="chart-card">
            <AreaChart data={priceHist.map((p) => p.pricePerL)} labels={priceHist.map((p) => p.dateISO)} unit="₺/L" showMinMax={!!(store.prefs && store.prefs.showMinMax)} />
          </div>
        </>
      }

      {stationStats.length >= 2 && (
        <>
          <div className="section-title">
            <h3>İstasyon Karşılaştırması</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="meta">Son 3 ay</span>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <button onClick={() => setStationInfoOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-2)', display: 'flex', alignItems: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </button>
                {stationInfoOpen && <>
                  <div onClick={() => setStationInfoOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
                  <div style={{ position: 'absolute', right: 0, top: 20, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--text-2)', whiteSpace: 'nowrap', zIndex: 10 }}>Enflasyon etkisini azaltmak için hep son 3 aya bakılır</div>
                </>}
              </div>
            </div>
          </div>
          <div style={{ margin: '0 18px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {stationStats.map((s, i) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  {i === 0 && <span style={{ fontSize: 10, background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 5, padding: '1px 5px', fontWeight: 600, letterSpacing: '0.02em' }}>UCUZ</span>}
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{s.count}×</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>{fmt(s.avg, 2)} ₺/L</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section-title">
        <h3>{{ all: 'Tüm Dolumlar', month: 'Bu Ayki Dolumlar', '3month': 'Son 3 Aylık Dolumlar', year: 'Bu Yılki Dolumlar' }[timeFilter]}</h3>
        {filtered.length > 0 && (() => {
          const totalSpend = filtered.reduce((s, e) => s + e.liters * e.pricePerL, 0);
          const totalL = filtered.reduce((s, e) => s + e.liters, 0);
          const avgPrice = totalL > 0 ? totalSpend / totalL : 0;
          return <span className="meta">{fmt(totalSpend, 0)} ₺ · {fmt(totalL, 1)} L</span>;
        })()}
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Icon.Fuel s={28} />}
          title={timeFilter === 'all' ? 'Henüz dolum kaydı yok' : 'Bu dönemde kayıt yok'}
          sub={timeFilter === 'all' ? 'İlk dolumunu ekleyerek yakıt tüketimini takip etmeye başla.' : 'Seçili zaman aralığında dolum kaydı bulunmuyor.'}
          action={timeFilter === 'all' ? <><Icon.Plus s={14} /> Dolum ekle</> : null}
          onAction={timeFilter === 'all' ? () => document.querySelector('.fab')?.click() : null}
        />
      ) : (
      <div className="entry-list">
        {Object.entries(
          filtered.reduce((acc, e) => {
            const key = e.dateISO.slice(0, 7);
            if (!acc[key]) acc[key] = [];
            acc[key].push(e);
            return acc;
          }, {})
        ).sort((a, b) => b[0].localeCompare(a[0])).map(([key, entries]) => (
          <div className="entry-group" key={key}>
            <div className="entry-group-header">
              <span className="month">{monthLabel(key)}</span>
              <span className="count">{(() => {
                const spend = entries.reduce((s, e) => s + e.liters * e.pricePerL, 0);
                const cons = entries.map(e => consumptionMap.get(e.id)).filter(v => v !== undefined);
                const avgCons = cons.length ? cons.reduce((s, v) => s + v, 0) / cons.length : null;
                return `${entries.length} dolum · ${fmt(spend, 0)} ₺${avgCons !== null ? ` · ${fmt(avgCons, 1)} L/100` : ''}`;
              })()}</span>
            </div>
            {entries.map((e) => {
              const dm = dayMon(e.dateISO);
              return (
                <SwipeableEntry key={e.id} onDelete={() => confirm('Bu dolum kaydı kalıcı olarak silinecek.', () => store.deleteEntry(e.id))}>
                  <div className="entry">
                    <div className="entry-date">
                      <div className="day">{dm.d}</div>
                      <div className="mon">{dm.m}</div>
                    </div>
                    <div className="entry-mid">
                      <div className="entry-top">
                        <span className="liters">{fmt(e.liters, 1)} L</span>
                        <span className={`entry-chip ${e.full ? 'full' : 'partial'}`}>{e.full ? 'Tam' : 'Yarım'}</span>
                      </div>
                      <div className="entry-bot">
                        <span className="price">{fmt(e.pricePerL, 2)} ₺/L</span>
                        {consumptionMap.has(e.id) && <><span className="sep">·</span><span>{fmt(consumptionMap.get(e.id), 1)} L/100km</span></>}
                      </div>
                      <div className="entry-bot" style={{ marginTop: 1 }}>
                        <span>{fmtInt(e.km)} km</span>
                        {e.station && <><span className="sep">·</span><span>{e.station}</span></>}
                      </div>
                      {e.note && <div className="entry-bot" style={{ marginTop: 1, fontStyle: 'italic', color: 'var(--text-dim)' }}>{e.note}</div>}
                    </div>
                    <div className="entry-right">
                      <div className="total">{fmt(e.liters * e.pricePerL, 2)}<span className="u">₺</span></div>
                      <div className="icons">
                        <button className="btn-icon" onClick={() => onEdit(e)}><Icon.Pencil /></button>
                        <button className="btn-icon" onClick={() => confirm('Bu dolum kaydı kalıcı olarak silinecek.', () => store.deleteEntry(e.id))}><Icon.Trash /></button>
                      </div>
                    </div>
                  </div>
                </SwipeableEntry>
              );
            })}
          </div>
        ))}
      </div>
      )}
    </div>);

}

/* ── Takvim ────────────────────────────────────────────── */
function TakvimScreen({ onAddEvent, onEditEvent }) {
  const store = useStore();
  const confirm = useConfirm();
  const allEvents = (store.events || []).map((e) => ({ ...e, days: daysUntil(e.endISO) }));
  const upcoming = allEvents.filter((e) => e.days >= 0).sort((a, b) => a.days - b.days);
  const expired = allEvents.filter((e) => e.days < 0).sort((a, b) => b.days - a.days);
  const kmReminders = ((store.prefs || {}).kmReminders || []);
  const latestKm = store.entries.length ? Math.max(...store.entries.map(e => e.km)) : 0;
  const kmAnyOverdue = kmReminders.some(r => (r.lastKm + r.intervalKm) - latestKm < 0);

  const badge = (days) => {
    if (days < 0) return { label: `${Math.abs(days)} gün gecikti`, cls: 'expired' };
    if (days === 0) return { label: 'Bugün', cls: 'warn' };
    if (days <= 30) return { label: `${days} gün`, cls: 'warn' };
    return { label: `${days} gün`, cls: 'ok' };
  };

  const typeIcon = (type) => {
    if (type === 'Kasko' || type === 'Sigorta') return <Icon.Shield />;
    if (type === 'Muayene') return <Icon.ClipboardCheck />;
    if (type === 'Bakım') return <Icon.Wrench />;
    return <Icon.Tag />;
  };

  const renderCard = (e) => {
    const b = badge(e.days);
    const isBakimKmOverdue = e.type === 'Bakım' && kmAnyOverdue;
    const isExpired = e.days < 0 || isBakimKmOverdue;
    const isWarn = !isExpired && e.days <= 30;
    const isOk = !isExpired && !isWarn;
    return (
      <div className={`upcoming-row${isExpired ? ' expired' : ''}`} key={e.id}>
        <div className="left">
          <div className="iconbox">
            {typeIcon(e.type)}
          </div>
          <div>
            <div className="name">{e.type}</div>
            <div className="date">
              {e.startISO && <span style={{ color: 'var(--text-2)' }}>{fmtDate(e.startISO)} → </span>}
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>{fmtDate(e.endISO)}</span>
            </div>
            {(e.cost || e.note || e.serviceKm) && <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {e.serviceKm && <span style={{ fontFamily: 'var(--font-mono)' }}>{fmtInt(e.serviceKm)} km</span>}
              {e.serviceKm && (e.cost || e.note) && <span style={{ color: 'var(--text-dim)' }}>·</span>}
              {e.cost && <span style={{ fontFamily: 'var(--font-mono)' }}>{fmt(e.cost, 2)} ₺</span>}
              {e.cost && e.note && <span style={{ color: 'var(--text-dim)' }}>·</span>}
              {e.note && <span style={{ fontStyle: 'italic' }}>{e.note}</span>}
            </div>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className={`remaining ${b.cls}`}>{b.label}</span>
          <button className="btn-icon" onClick={() => onEditEvent(e)}><Icon.Pencil /></button>
          <button className="btn-icon" onClick={() => confirm('Bu etkinlik kalıcı olarak silinecek.', () => store.deleteEvent(e.id))}><Icon.Trash /></button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="app-header">
        <div className="brand-name">Vitesse</div>
      </div>
      <div className="title-row">
        <div className="title-block">
          <h1>Takvim</h1>
          <div className="sub">{allEvents.length} etkinlik takip ediliyor</div>
        </div>
        <button className="btn btn-accent" onClick={onAddEvent}><Icon.Plus s={14} /> Ekle</button>
      </div>

      {allEvents.length === 0 ? (
        <div className="upcoming-list">
          <EmptyState
            icon={<Icon.Calendar s={28} />}
            title="Henüz etkinlik yok"
            sub="Muayene, sigorta, lastik gibi hatırlatmaları buradan takip edebilirsin."
            action={<><Icon.Plus s={14} /> Etkinlik ekle</>}
            onAction={onAddEvent}
          />
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <div className="section-title"><h3>Devam Eden</h3></div>
              <div className="upcoming-list">{upcoming.map(renderCard)}</div>
            </>
          )}
          {expired.length > 0 && (
            <>
              <div className="section-title" style={{ marginTop: upcoming.length > 0 ? 14 : 4 }}><h3>Süresi Dolmuş</h3></div>
              <div className="upcoming-list">{expired.map(renderCard)}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ── Km Hatırlatma Yönetimi ────────────────────────────── */
function KmReminderSection({ onAdd, onEdit }) {
  const store = useStore();
  const confirm = useConfirm();
  const reminders = (store.prefs || {}).kmReminders || [];

  const remove = (id) => {
    store.setPref('kmReminders', reminders.filter((r) => r.id !== id));
  };

  return (
    <>
      <div className="section-title">
        <h3>Km Hatırlatmaları</h3>
        <button className="btn-accent" onClick={onAdd}>Ekle</button>
      </div>
      {reminders.length > 0 && (
        <div className="row-list" style={{ marginBottom: 8 }}>
          {reminders.map((r) => (
            <div key={r.id} className="row">
              <div className="icon"><Icon.Wrench s={16} /></div>
              <div className="meta">
                <h5>{r.label}</h5>
                <p>Her {fmtInt(r.intervalKm)} km · Son: {fmtInt(r.lastKm)} km · Sonraki: {fmtInt(r.lastKm + r.intervalKm)} km</p>
              </div>
              <button className="btn-icon" onClick={() => onEdit(r)}><Icon.Pencil s={14} /></button>
              <button className="btn-icon" onClick={() => confirm(`"${r.label}" hatırlatması silinecek.`, () => remove(r.id))}><Icon.Trash s={14} /></button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ── Km Hatırlatma Form Modalı ─────────────────────────── */
function KmReminderFormModal({ open, editing, onClose }) {
  const store = useStore();
  const isEdit = !!editing;
  const reminders = (store.prefs || {}).kmReminders || [];
  const lastKmDefault = store.entries.length ? Math.max(...store.entries.map((e) => e.km)) : 0;

  const [label, setLabel] = useState('');
  const [intervalKm, setIntervalKm] = useState('10000');
  const [lastKm, setLastKm] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setFormErrors({});
    if (editing) {
      setLabel(editing.label);
      setIntervalKm(String(editing.intervalKm));
      setLastKm(String(editing.lastKm));
    } else {
      setLabel('');
      setIntervalKm('10000');
      setLastKm(String(lastKmDefault));
    }
  }, [open, editing]);

  if (!open) return null;

  const save = () => {
    const errs = {};
    if (!label.trim()) errs.label = 'Açıklama girilmeli';
    if (!intervalKm || parseInt(intervalKm) <= 0) errs.intervalKm = 'Aralık km girilmeli';
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    if (isEdit) {
      store.setPref('kmReminders', reminders.map((r) => r.id === editing.id
        ? { ...r, label: label.trim(), intervalKm: parseInt(intervalKm) || 0, lastKm: parseInt(lastKm) || 0 }
        : r
      ));
    } else {
      store.setPref('kmReminders', [...reminders, { id: uid(), label: label.trim(), intervalKm: parseInt(intervalKm) || 0, lastKm: parseInt(lastKm) || 0 }]);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ paddingBottom: 24 }}>
        <div className="modal-handle" />
        <div className="modal-head">
          <h2>{isEdit ? 'Hatırlatmayı Düzenle' : 'Yeni Km Hatırlatması'}</h2>
          <button className="btn-icon" onClick={onClose}><Icon.X /></button>
        </div>
        <div className="label">Açıklama</div>
        <input className="input" placeholder="örn. Yağ Değişimi" value={label} onChange={(e) => { setLabel(e.target.value); setFormErrors((p) => ({ ...p, label: undefined })); }} style={formErrors.label ? { borderColor: 'var(--negative)' } : {}} autoFocus />
        {formErrors.label && <div className="field-error">{formErrors.label}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          <div>
            <div className="label">Aralık (km)</div>
            <input className="input mono" inputMode="numeric" placeholder="10000" value={intervalKm} onChange={(e) => { setIntervalKm(e.target.value.replace(/[^0-9]/g, '')); setFormErrors((p) => ({ ...p, intervalKm: undefined })); }} style={formErrors.intervalKm ? { borderColor: 'var(--negative)' } : {}} />
            {formErrors.intervalKm && <div className="field-error">{formErrors.intervalKm}</div>}
          </div>
          <div>
            <div className="label">Son yapılan (km)</div>
            <input className="input mono" inputMode="numeric" placeholder={String(lastKmDefault || 0)} value={lastKm} onChange={(e) => setLastKm(e.target.value.replace(/[^0-9]/g, ''))} />
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 14 }} onClick={save}>{isEdit ? 'Güncelle' : 'Kaydet'}</button>
      </div>
    </div>
  );
}

/* ── Ayarlar ───────────────────────────────────────────── */
function AyarlarScreen({ theme, setTheme, lang, setLang, onGizlilik, onAddKmReminder, onEditKmReminder }) {
  const store = useStore();
  const confirm = useConfirm();
  const importRef = useRef(null);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const bildirim = !!(store.prefs?.bildirimler);
  const handleBildirimToggle = async () => {
    if (!bildirim) {
      const { display } = await LocalNotifications.requestPermissions();
      if (display === 'granted') store.setPref('bildirimler', true);
    } else {
      store.setPref('bildirimler', false);
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed.entries)) throw new Error();
        const prefs = parsed.prefs && typeof parsed.prefs === 'object' ? parsed.prefs : (store.prefs || {});
        store.loadData({ entries: parsed.entries, events: Array.isArray(parsed.events) ? parsed.events : [], prefs });
        setImportError('');
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch {
        setImportError('Geçersiz dosya. Lütfen dışa aktarılan bir JSON dosyası seçin.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div>
      <div className="app-header">
        <div className="brand-name">Vitesse</div>
      </div>
      <div className="title-row">
        <div className="title-block">
          <h1>Ayarlar</h1>
          <div className="sub">Tercihler</div>
        </div>
      </div>

      <div className="section-title"><h3>Araç</h3></div>
      <div style={{ padding: '0 22px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {[
            { key: 'vehicleName', label: 'Takma Ad', placeholder: 'örn. Benim Arabam' },
            { key: 'vehicleModel', label: 'Marka / Model', placeholder: 'örn. Toyota Corolla' },
            { key: 'vehiclePlate', label: 'Plaka', placeholder: 'örn. 34 ABC 123' },
          ].map(({ key, label, placeholder }, i) => (
            <div key={key} style={{ padding: '10px 16px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--text-2)', minWidth: 100, flexShrink: 0 }}>{label}</div>
              <input
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-sans)', textAlign: 'right' }}
                placeholder={placeholder}
                value={(store.prefs && store.prefs[key]) || ''}
                onChange={(e) => store.setPref(key, e.target.value)}
              />
            </div>
          ))}
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--text-2)', minWidth: 100, flexShrink: 0 }}>Yakıt Tipi</div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
              {['Benzin', 'Dizel', 'LPG'].map(ft => {
                const active = (store.prefs?.fuelType || 'Benzin') === ft;
                return (
                  <button
                    key={ft}
                    onClick={() => store.setPref('fuelType', ft)}
                    style={{
                      padding: '5px 13px',
                      borderRadius: 20,
                      border: active ? 'none' : '1px solid var(--border)',
                      background: active ? 'var(--accent)' : 'transparent',
                      color: active ? 'var(--accent-ink)' : 'var(--text-2)',
                      fontSize: 13,
                      fontFamily: 'var(--font-sans)',
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                    }}
                  >{ft}</button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="section-title"><h3>Görünüm</h3></div>
      <div style={{ padding: '0 22px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 14 }}>
          <div className="label">Tema</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <button className={`chip-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 }}>
              <Icon.Moon /> Koyu
            </button>
            <button className={`chip-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 }}>
              <Icon.Sun /> Açık
            </button>
            <button className={`chip-btn ${theme === 'system' ? 'active' : ''}`} onClick={() => setTheme('system')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 }}>
              <Icon.Settings s={16} /> Sistem
            </button>
          </div>
        </div>
      </div>

      <div className="section-title"><h3>Tercihler</h3></div>
      <div className="row-list">
        <div className="row">
          <div className="icon"><Icon.Bell s={16} /></div>
          <div className="meta">
            <h5>Bildirimler</h5>
            <p>Takvim etkinlikleri dolmadan önce hatırlatma gönderir</p>
          </div>
          <div className={`switch ${bildirim ? 'on' : ''}`} onClick={handleBildirimToggle} />
        </div>
        <div className="row">
          <div className="icon"><Icon.Gauge s={16} /></div>
          <div className="meta">
            <h5>Min/Maks İşaretleri</h5>
            <p>Grafiklerde en düşük ve yüksek noktalar</p>
          </div>
          <div className={`switch ${(store.prefs && store.prefs.showMinMax) ? 'on' : ''}`} onClick={() => store.setPref('showMinMax', !(store.prefs && store.prefs.showMinMax))} />
        </div>
      </div>

      <KmReminderSection onAdd={onAddKmReminder} onEdit={onEditKmReminder} />

      <div className="section-title"><h3>Veriler</h3></div>
      <div className="row-list">
        <div className="row" style={{ cursor: 'pointer' }} onClick={() => {
          const blob = new Blob([JSON.stringify({ entries: store.entries, events: store.events || [], prefs: store.prefs || {} }, null, 2)], { type: 'application/json' });
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `vitesse-${todayISO()}.json`; a.click(); URL.revokeObjectURL(a.href);
        }}>
          <div className="icon"><Icon.Sparkle s={16} /></div>
          <div className="meta"><h5>Dışa Aktar</h5><p>Tüm veriler ve araç bilgileri JSON olarak kaydedilir</p></div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-dim)', flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
        </div>
        <div className="row" style={{ cursor: 'pointer' }} onClick={() => importRef.current?.click()}>
          <div className="icon"><Icon.Plus s={16} /></div>
          <div className="meta"><h5>İçe Aktar</h5><p>Daha önce dışa aktarılan JSON dosyası</p></div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-dim)', flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
        </div>
        <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        {importSuccess && <div style={{ fontSize: 12, color: 'var(--positive)', padding: '6px 16px 10px' }}>Veriler başarıyla içe aktarıldı.</div>}
        {importError && <div style={{ fontSize: 12, color: 'var(--negative)', padding: '6px 16px 10px' }}>{importError}</div>}
      </div>

      <div className="section-title"><h3>Tehlikeli Bölge</h3></div>
      <div className="row-list">
        <div className="row" style={{ cursor: 'pointer' }} onClick={() => confirm('Tüm dolum ve takvim kayıtları silinecek, örnek veriler yüklenecek. Araç bilgilerin ve tercihler korunur.', () => store.resetToSeed(), 'Sıfırla')}>
          <div className="icon" style={{ background: 'rgba(248,113,113,0.12)', color: 'var(--negative)' }}><Icon.Trash s={16} /></div>
          <div className="meta"><h5 style={{ color: 'var(--negative)' }}>Verileri Sıfırla</h5><p>Tüm kayıtlar silinir, geri alınamaz</p></div>
        </div>
      </div>

      <div className="section-title"><h3>Hakkında</h3></div>
      <div className="row-list">
        <div className="row" style={{ cursor: 'pointer' }} onClick={onGizlilik}>
          <div className="icon"><Icon.Shield s={16} /></div>
          <div className="meta"><h5>Gizlilik Politikası</h5></div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-dim)', flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
        </div>
        <div className="row">
          <div className="icon"><Icon.Sparkle s={16} /></div>
          <div className="meta"><h5>Versiyon</h5></div>
          <span style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{APP_VERSION}</span>
        </div>
      </div>

      <div style={{ height: 22 }} />
    </div>);

}

/* ── Gizlilik ──────────────────────────────────────────── */
function GizlilikScreen({ onBack }) {
  return (
    <div>
      <div className="app-header">
        <button className="btn-icon" onClick={onBack} style={{ marginRight: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>
        </button>
        <div className="brand-name">Gizlilik Politikası</div>
      </div>

      <div style={{ padding: '8px 22px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 16 }}>Son güncelleme: Mayıs 2026</p>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)' }}>
            Vitesse, aracınıza ait yakıt dolumlarını ve bakım etkinliklerini takip etmenizi sağlayan kişisel bir uygulamadır.
            Gizliliğiniz bizim için önceliklidir.
          </p>
        </div>

        {[
          {
            title: 'Toplanan Veriler',
            content: 'Uygulama hiçbir kişisel veri toplamaz. Girdiğiniz dolum kayıtları, bakım etkinlikleri ve tercihler yalnızca cihazınızın yerel depolama alanında (localStorage) saklanır. Bu veriler hiçbir sunucuya gönderilmez.'
          },
          {
            title: 'Veri Paylaşımı',
            content: 'Verileriniz üçüncü taraflarla paylaşılmaz, satılmaz ve reklam amacıyla kullanılmaz.'
          },
          {
            title: 'Üçüncü Taraf Hizmetler',
            content: 'Uygulama, arayüz bileşenleri için unpkg.com CDN\'ini ve yazı tipleri için Google Fonts\'u kullanır. Bu hizmetler yalnızca uygulama yüklenirken erişilir ve kendi gizlilik politikalarına tabidir. Çevrimdışı kullanımda bu bağlantılar kurulmaz.'
          },
          {
            title: 'Veri Silme',
            content: 'Tüm verilerinizi istediğiniz zaman Ayarlar ekranından silebilirsiniz. Tarayıcı verilerini temizlemek de aynı sonucu doğurur.'
          },
          {
            title: 'Çocukların Gizliliği',
            content: 'Uygulama 13 yaş altı çocuklara yönelik değildir ve bu yaş grubundan bilerek veri toplanmaz.'
          },
          {
            title: 'İletişim',
            content: 'Gizlilik politikasıyla ilgili sorularınız için arslankaan2901@gmail.com adresine ulaşabilirsiniz.'
          },
        ].map(({ title, content }) => (
          <div key={title}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{title}</div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)', margin: 0 }}>{content}</p>
          </div>
        ))}

      </div>
    </div>
  );
}

/* ── Sheets ────────────────────────────────────────────── */
function EntrySheet({ open, onClose, editing }) {
  const store = useStore();
  const isEdit = !!editing;
  const fuelType = store.prefs?.fuelType || 'Benzin';
  const fuelLabel = fuelType === 'Dizel' ? 'Mazot' : fuelType;
  const usedStations = useMemo(() => {
    const seen = new Set();
    const result = [];
    [...store.entries].sort((a, b) => b.dateISO.localeCompare(a.dateISO)).forEach(e => {
      if (e.station && !seen.has(e.station)) { seen.add(e.station); result.push(e.station); }
    });
    return result.slice(0, 5);
  }, [store.entries]);
  const [dateISO, setDateISO] = useState(todayISO());
  const lastKm = useMemo(() => {
    const before = store.entries.filter(e => e.dateISO <= dateISO && (!editing || e.id !== editing.id));
    if (before.length === 0) return null;
    return Math.max(...before.map(e => e.km));
  }, [store.entries, dateISO, editing]);
  const [liters, setLiters] = useState('');
  const [pricePerL, setPricePerL] = useState('');
  const [km, setKm] = useState('');
  const [station, setStation] = useState('');
  const [note, setNote] = useState('');
  const [full, setFull] = useState(true);
  const [errors, setErrors] = useState({});
  const [discardOpen, setDiscardOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (editing) {
      setDateISO(editing.dateISO);
      setLiters(fmt(editing.liters, 2));
      setPricePerL(fmt(editing.pricePerL, 2));
      setKm(String(editing.km || ''));
      setStation(editing.station || '');
      setNote(editing.note || '');
      setFull(!!editing.full);
    } else {
      setDateISO(todayISO());
      setLiters(''); setPricePerL(''); setKm(''); setStation(''); setNote(''); setFull(true);
    }
  }, [open, editing]);

  const total = useMemo(() => parseNum(liters) * parseNum(pricePerL), [liters, pricePerL]);
  if (!open) return null;

  const kmNum = parseInt(String(km).replace(/[^0-9]/g, ''), 10) || 0;
  const isDirty = km.trim() || liters.trim() || pricePerL.trim();
  const handleClose = () => {
    if (!isEdit && isDirty) { setDiscardOpen(true); return; }
    onClose();
  };

  const submit = () => {
    const l = parseNum(liters), p = parseNum(pricePerL);
    const k = parseInt(String(km).replace(/[^0-9]/g, ''), 10) || 0;
    const errs = {};
    if (dateISO > todayISO()) errs.dateISO = 'Gelecek tarih girilemez';
    if (k <= 0) errs.km = 'Kilometre girilmeli';
    else if (!isEdit && lastKm !== null && k < lastKm) errs.km = `Önceki dolumdan düşük olamaz (son: ${fmtInt(lastKm)} km)`;
    if (l <= 0) errs.liters = 'Litre girilmeli';
    if (p <= 0) errs.pricePerL = 'Fiyat girilmeli';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = { dateISO, liters: l, pricePerL: p, km: k, station: station.trim(), note: note.trim(), full };
    if (isEdit) store.updateEntry(editing.id, payload); else store.addEntry(payload);
    onClose();
  };

  return (
    <>
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-head">
          <h2>{isEdit ? `${fuelLabel} dolumunu düzenle` : `Yeni ${fuelLabel} Dolumu`}</h2>
          <button className="btn-icon" onClick={handleClose}><Icon.X /></button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="label" style={{ margin: 0 }}>Tarih</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className={`filter-pill${dateISO === todayISO() ? ' active' : ''}`} onClick={() => setDateISO(todayISO())}>Bugün</button>
            <button className={`filter-pill${dateISO === yesterdayISO() ? ' active' : ''}`} onClick={() => setDateISO(yesterdayISO())}>Dün</button>
          </div>
        </div>
        <input className="input mono" type="date" value={dateISO} onChange={(e) => { setDateISO(e.target.value); setErrors((er) => ({ ...er, dateISO: undefined })); }} style={errors.dateISO ? { borderColor: 'var(--negative)' } : {}} />
        {errors.dateISO && <div style={{ fontSize: 12, color: 'var(--negative)', marginTop: 3 }}>{errors.dateISO}</div>}

        <div className="label" style={{ marginTop: 10 }}>Kilometre</div>
        <input className="input mono" inputMode="numeric" placeholder="örn. 146200" value={km} onChange={(e) => { setKm(e.target.value.replace(/[^0-9]/g, '')); setErrors((er) => ({ ...er, km: undefined })); }} style={errors.km ? { borderColor: 'var(--negative)' } : {}} />
        {errors.km
          ? <div style={{ fontSize: 12, color: 'var(--negative)', marginTop: 3, paddingLeft: 2 }}>{errors.km}</div>
          : (!isEdit && lastKm !== null && (
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3, paddingLeft: 2 }}>
                Son kayıt: {fmtInt(lastKm)} km
                {kmNum > lastKm && (() => {
                  const diff = kmNum - lastKm;
                  const warn = diff < 20 || diff > 2000;
                  return <span style={{ color: warn ? 'var(--negative)' : 'var(--accent)', marginLeft: 8, fontFamily: 'var(--font-mono)' }}>· +{fmtInt(diff)} km{diff < 20 ? ' · çok az?' : diff > 2000 ? ' · çok fazla?' : ''}</span>;
                })()}
              </div>
            ))
        }

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
          <div>
            <div className="label">Litre</div>
            <input className="input mono" inputMode="decimal" placeholder="0,00" value={liters} onChange={(e) => { setLiters(e.target.value.replace('.', ',')); setErrors((er) => ({ ...er, liters: undefined })); }} style={errors.liters ? { borderColor: 'var(--negative)' } : {}} />
            {errors.liters && <div style={{ fontSize: 12, color: 'var(--negative)', marginTop: 3 }}>{errors.liters}</div>}
          </div>
          <div>
            <div className="label">₺ / Litre</div>
            <input className="input mono" inputMode="decimal" placeholder="0,00" value={pricePerL} onChange={(e) => { setPricePerL(e.target.value.replace('.', ',')); setErrors((er) => ({ ...er, pricePerL: undefined })); }} style={errors.pricePerL ? { borderColor: 'var(--negative)' } : {}} />
            {errors.pricePerL && <div style={{ fontSize: 12, color: 'var(--negative)', marginTop: 3 }}>{errors.pricePerL}</div>}
          </div>
        </div>
        <div className={`toggle-card ${full ? 'on' : ''}`} style={{ marginTop: 10, padding: '10px 12px' }} onClick={() => setFull((v) => !v)}>
          <div className="checkbox">{full && <Icon.Check s={14} />}</div>
          <div>
            <h5>Tam depo</h5>
            <p>Tüketim hesabı bir sonraki tam depoyla yapılır.</p>
          </div>
        </div>

        <div className="label" style={{ marginTop: 10 }}>
          İstasyon <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, fontSize: 11 }}>(opsiyonel)</span>
        </div>
        {usedStations.length > 0 && (
          <div className="chip-group" style={{ marginBottom: 6 }}>
            {usedStations.map(s => (
              <button key={s} className={`chip-btn${station === s ? ' active' : ''}`} onClick={() => setStation(station === s ? '' : s)}>{s}</button>
            ))}
          </div>
        )}
        <input className="input" placeholder={fuelType === 'LPG' ? 'BRC, LPG Market…' : fuelType === 'Dizel' ? 'Shell, BP, Total…' : 'Shell, BP, Opet…'} value={station} onChange={(e) => setStation(e.target.value)} />

        <div className="label" style={{ marginTop: 10 }}>
          Not <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, fontSize: 11 }}>(opsiyonel)</span>
        </div>
        <input className="input" placeholder="Uzun yol, bakım sonrası…" value={note} onChange={(e) => setNote(e.target.value)} />

        <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)' }}>Toplam</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: 'var(--text)' }}>
            {total > 0 ? <>{fmt(total, 2)} <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500 }}>₺</span></> : '—'}
          </span>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginTop: 10 }} onClick={submit}>{isEdit ? 'Güncelle' : 'Kaydet'}</button>
      </div>
    </div>
    {discardOpen && (
      <div className="modal-overlay" style={{ zIndex: 300 }} onClick={() => setDiscardOpen(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ paddingBottom: 28 }}>
          <div className="modal-handle" />
          <div className="modal-head"><h2>Vazgeç?</h2></div>
          <div className="modal-sub">Girilen bilgiler kaydedilmeyecek.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setDiscardOpen(false); onClose(); }}>Çıkış</button>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setDiscardOpen(false)}>Düzenlemeye devam et</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function EventSheet({ open, onClose, editing, onSaved }) {
  const store = useStore();
  const isEdit = !!editing;
  const [type, setType] = useState('Kasko');
  const [startISO, setStartISO] = useState(todayISO());
  const [endISO, setEndISO] = useState('');
  const [notifyDays, setNotifyDays] = useState(15);
  const [cost, setCost] = useState('');
  const [note, setNote] = useState('');
  const [customType, setCustomType] = useState('');
  const [serviceKm, setServiceKm] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (editing) {
      setType(editing.type || 'Kasko');
      setStartISO(editing.startISO || todayISO());
      setEndISO(editing.endISO || '');
      setNotifyDays(editing.notifyDays || 15);
      setCost(editing.cost ? String(editing.cost).replace('.', ',') : '');
      setNote(editing.note || '');
      setServiceKm(editing.serviceKm ? String(editing.serviceKm) : '');
      const knownTypes = ['Kasko', 'Sigorta', 'Muayene', 'Bakım', 'Diğer'];
      if (editing.type && !knownTypes.includes(editing.type)) {
        setType('Diğer');
        setCustomType(editing.type);
      } else {
        setCustomType('');
      }
    } else {
      setType('Kasko');
      setStartISO(todayISO());
      const d = new Date(); d.setFullYear(d.getFullYear() + 1);
      setEndISO(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      setNotifyDays(15);
      setCost('');
      setNote('');
      setCustomType('');
      setServiceKm('');
    }
  }, [open, editing]);

  if (!open) return null;

  const typeOptions = [
    { label: 'Kasko', icon: <Icon.Shield s={16} /> },
    { label: 'Sigorta', icon: <Icon.Shield s={16} /> },
    { label: 'Muayene', icon: <Icon.ClipboardCheck s={16} /> },
    { label: 'Bakım', icon: <Icon.Wrench s={16} /> },
    { label: 'Diğer', icon: <Icon.Tag s={16} /> },
  ];

  const daysBetween = startISO && endISO
    ? Math.round((parseISO(endISO) - parseISO(startISO)) / 86400000)
    : null;

  const submit = () => {
    const errs = {};
    if (type === 'Diğer' && !customType.trim()) errs.customType = 'Tür adı girilmeli';
    if (!endISO) errs.endISO = 'Bitiş tarihi gerekli';
    else if (startISO && endISO < startISO) errs.endISO = 'Bitiş tarihi başlangıçtan önce olamaz';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const resolvedType = type === 'Diğer' ? customType.trim() : type;
    const payload = { type: resolvedType, startISO, endISO, notifyDays, cost: parseNum(cost) || null, note: note.trim() || null, serviceKm: type === 'Bakım' ? (parseInt(serviceKm) || null) : null };
    if (isEdit) store.updateEvent(editing.id, payload); else store.addEvent(payload);
    if (onSaved) onSaved({ type, serviceKm: payload.serviceKm });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-head"><h2>{isEdit ? 'Etkinliği düzenle' : 'Yeni etkinlik'}</h2><button className="btn-icon" onClick={onClose}><Icon.X /></button></div>
        {isEdit && <div className="modal-sub">Etkinlik bilgilerini düzenle</div>}
        <div className="type-card-group">
          {typeOptions.map(({ label, icon }) => (
            <button key={label} className={`type-card${type === label ? ' active' : ''}`} onClick={() => setType(label)}>
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
        {type === 'Diğer' && (
          <div style={{ marginTop: 8 }}>
            <input className="input" placeholder="Tür adı girin…" value={customType} onChange={(e) => { setCustomType(e.target.value); setErrors((p) => ({ ...p, customType: undefined })); }} style={errors.customType ? { borderColor: 'var(--negative)' } : {}} autoFocus />
            {errors.customType && <div className="field-error">{errors.customType}</div>}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          <div>
            <div className="label">Başlangıç</div>
            <input className="input mono" type="date" value={startISO} onChange={(e) => {
              const val = e.target.value;
              setStartISO(val);
              if ((type === 'Kasko' || type === 'Sigorta' || type === 'Muayene' || type === 'Bakım') && val) {
                const d = new Date(val);
                d.setFullYear(d.getFullYear() + (type === 'Muayene' ? 2 : 1));
                setEndISO(d.toISOString().slice(0, 10));
                setErrors((p) => ({ ...p, endISO: undefined }));
              }
            }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div className="label">Bitiş</div>
              {daysBetween !== null && <span style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 5 }}>{daysBetween} gün</span>}
            </div>
            <input className={`input mono${errors.endISO ? ' error' : ''}`} type="date" value={endISO} onChange={(e) => { setEndISO(e.target.value); setErrors((p) => ({ ...p, endISO: undefined })); }} />
            {errors.endISO && <div className="field-error">{errors.endISO}</div>}
            {!errors.endISO && endISO && endISO < todayISO() && <div style={{ fontSize: 11, color: 'var(--negative)', marginTop: 3 }}>Bitiş tarihi geçmişte</div>}
          </div>
        </div>
        <div className="label" style={{ marginTop: 12 }}>Önceden bildir (gün)</div>
        <div className="chip-group">
          {[7, 15, 30, 60].map((d) =>
          <button key={d} className={`chip-btn ${notifyDays === d ? 'active' : ''}`} onClick={() => setNotifyDays(d)}>{d}</button>
          )}
        </div>
        <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--bg-2)', borderRadius: 10, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1, marginTop: 1 }}>ℹ</span>
          <span style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>Uygulama her açıldığında kontrol edilir. Bildirimlerin çalışması için Ayarlar → Bildirimler'i aç.</span>
        </div>
        {type === 'Bakım' && <>
          <div className="label" style={{ marginTop: 12 }}>Yapıldığı km <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opsiyonel)</span></div>
          <input className="input mono" inputMode="numeric" placeholder="örn. 152000" value={serviceKm} onChange={(e) => setServiceKm(e.target.value.replace(/[^0-9]/g, ''))} />
        </>}
        <div className="label" style={{ marginTop: 12 }}>Maliyet <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opsiyonel)</span></div>
        <input className="input mono" inputMode="decimal" placeholder="0,00 ₺" value={cost} onChange={(e) => setCost(e.target.value.replace('.', ','))} />
        <div className="label" style={{ marginTop: 12 }}>Not <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opsiyonel)</span></div>
        <textarea className="input" rows={2} placeholder={type === 'Kasko' || type === 'Sigorta' ? 'Poliçe numarası, şirket adı…' : type === 'Bakım' ? 'Yapılan işlemler…' : 'Not…'} value={note} onChange={(e) => setNote(e.target.value)} style={{ resize: 'none', lineHeight: 1.5 }} />
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 18 }} onClick={submit}>{isEdit ? 'Güncelle' : 'Kaydet'}</button>
      </div>
    </div>);

}

/* ── Swipeable Entry ───────────────────────────────────── */
function SwipeableEntry({ children, onDelete }) {
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const dragRef = useRef(null);
  const startX = useRef(null);
  const startY = useRef(null);
  const isHoriz = useRef(false);
  const liveOffset = useRef(0);
  const DELETE_W = 72;

  useEffect(() => {
    const el = dragRef.current;
    if (!el) return;
    const onStart = (e) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      isHoriz.current = false;
    };
    const onMove = (e) => {
      if (startX.current === null) return;
      const dx = e.touches[0].clientX - startX.current;
      const dy = e.touches[0].clientY - startY.current;
      if (!isHoriz.current) {
        if (Math.abs(dy) > Math.abs(dx)) return;
        if (Math.abs(dx) < 6) return;
        isHoriz.current = true;
      }
      if (dx > 4) { liveOffset.current = 0; setOffset(0); setSwiping(false); return; }
      e.preventDefault();
      setSwiping(true);
      const next = Math.max(dx, -(DELETE_W + 16));
      liveOffset.current = next;
      setOffset(next);
    };
    const onEnd = () => {
      setSwiping(false);
      const snap = liveOffset.current <= -(DELETE_W * 0.4) ? -DELETE_W : 0;
      liveOffset.current = snap;
      setOffset(snap);
      startX.current = null;
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
    };
  }, []);

  const close = () => { liveOffset.current = 0; setOffset(0); };
  const t = swiping ? 'none' : 'transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)';

  return (
    <div style={{ overflow: 'hidden' }}>
      <div ref={dragRef} style={{ display: 'flex', transform: `translateX(${offset}px)`, transition: t }} onClick={() => { if (offset < 0) close(); }}>
        <div style={{ flex: '0 0 100%', minWidth: 0 }}>
          {children}
        </div>
        <div style={{ flex: `0 0 ${DELETE_W}px`, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Icon.Trash s={20} color="#fff" />
        </div>
      </div>
    </div>
  );
}

/* ── Km Prompt ─────────────────────────────────────────── */
function KmPromptModal({ km, onClose }) {
  const store = useStore();
  const existing = (store.prefs || {}).kmReminders || [];
  const defaultInterval = existing.length > 0 ? String(existing[0].intervalKm) : '10000';
  const [intervalKm, setIntervalKm] = useState(defaultInterval);

  const confirm = () => {
    const interval = parseInt(intervalKm) || 10000;
    const current = (store.prefs || {}).kmReminders || [];
    if (current.length > 0) {
      store.setPref('kmReminders', current.map(r => ({ ...r, lastKm: km })));
    } else {
      store.setPref('kmReminders', [{ id: uid(), label: 'Bakım', intervalKm: interval, lastKm: km, source: 'bakım' }]);
    }
    onClose();
  };

  const nextKm = km + (parseInt(intervalKm) || 10000);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ paddingBottom: 24 }}>
        <div className="modal-handle" />
        <div className="modal-head"><h2>Km Hatırlatması</h2></div>
        <div className="modal-sub">{fmtInt(km)} km'de bakım yapıldı. Bir sonraki hatırlatma eklensin mi?</div>
        {existing.length === 0 && <>
          <div className="label" style={{ marginTop: 14 }}>Aralık (km)</div>
          <input className="input mono" inputMode="numeric" value={intervalKm} onChange={e => setIntervalKm(e.target.value.replace(/[^0-9]/g, ''))} autoFocus />
        </>}
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 10, fontSize: 13, color: 'var(--text-2)' }}>
          Sonraki bakım: <span style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fmtInt(nextKm)} km</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={confirm}>Hatırlatma Ekle</button>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>Geç</button>
        </div>
      </div>
    </div>
  );
}

/* ── Notification Checker ──────────────────────────────── */
function NotificationChecker() {
  const store = useStore();
  useEffect(() => {
    if (!store.prefs?.bildirimler) return;
    const run = async () => {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const KEY = 'yakit-notified';
      const notified = JSON.parse(localStorage.getItem(KEY) || '{}');
      const shownToday = !!notified[todayStr];
      const futureNotifs = [];
      const immediateNotifs = [];
      (store.events || []).forEach((ev, i) => {
        if (!ev.endISO) return;
        const endDate = new Date(ev.endISO + 'T00:00:00');
        const daysLeft = Math.round((endDate - now) / 86400000);
        if (daysLeft < 0) return;
        const notifyDays = ev.notifyDays || 30;
        if (daysLeft > notifyDays) {
          const fireDate = new Date(endDate);
          fireDate.setDate(fireDate.getDate() - notifyDays);
          fireDate.setHours(9, 0, 0, 0);
          if (fireDate > now) {
            futureNotifs.push({ id: 1000 + i, title: 'Vitesse', body: `${ev.type} bitmesine ${notifyDays} gün kaldı.`, schedule: { at: fireDate } });
          }
        } else if (!shownToday) {
          const body = daysLeft === 0 ? `${ev.type} bugün sona eriyor!` : `${ev.type} bitmesine ${daysLeft} gün kaldı.`;
          immediateNotifs.push({ id: 1000 + i, title: 'Vitesse', body, schedule: { at: new Date(now.getTime() + 2000) } });
        }
      });
      if (!shownToday) {
        const latestKm = Math.max(0, ...(store.entries || []).map(e => e.km || 0));
        if (latestKm > 0) {
          const overdue = ((store.prefs || {}).kmReminders || []).filter(r => latestKm >= r.lastKm + r.intervalKm);
          if (overdue.length > 0) {
            const body = overdue.length === 1
              ? `${overdue[0].label} zamanı geldi! (${fmtInt(latestKm)} km)`
              : `${overdue.length} km hatırlatıcısı zamanı geldi.`;
            immediateNotifs.push({ id: 2000, title: 'Vitesse', body, schedule: { at: new Date(now.getTime() + 4000) } });
          }
        }
      }
      const all = [...futureNotifs, ...immediateNotifs];
      if (all.length > 0) await LocalNotifications.schedule({ notifications: all });
      if (immediateNotifs.length > 0 && !shownToday) {
        notified[todayStr] = true;
        const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
        Object.keys(notified).forEach(k => { if (k < cutoff) delete notified[k]; });
        localStorage.setItem(KEY, JSON.stringify(notified));
      }
    };
    run().catch(() => {});
  }, [store.events, store.prefs?.bildirimler, store.prefs?.kmReminders, store.entries]);
  return null;
}

/* ── Root App ──────────────────────────────────────────── */
function App() {
  const [screen, setScreen] = useState('ozet');
  const [lang, setLang] = useState(() => localStorage.getItem('yakit-lang') || 'tr');
  useEffect(() => { localStorage.setItem('yakit-lang', lang); }, [lang]);
  const [theme, setTheme] = useState(() => localStorage.getItem('yakit-theme') || 'dark');
  useEffect(() => { localStorage.setItem('yakit-theme', theme); }, [theme]);
  const [systemTheme, setSystemTheme] = useState(() => window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e) => setSystemTheme(e.matches ? 'light' : 'dark');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  useEffect(() => {
    StatusBar.setStyle({ style: effectiveTheme === 'dark' ? Style.Dark : Style.Light }).catch(() => {});
  }, [effectiveTheme]);
  const [entrySheet, setEntrySheet] = useState({ open: false, editing: null });
  const [eventSheet, setEventSheet] = useState({ open: false, editing: null });
  const [kmPrompt, setKmPrompt] = useState({ open: false, km: 0 });
  const [kmReminderForm, setKmReminderForm] = useState({ open: false, editing: null });
  const [lpgOpen, setLpgOpen] = useState(false);

  return (
    <ThemeCtx.Provider value={effectiveTheme}><LangCtx.Provider value={lang}><StoreProvider><NotificationChecker /><ConfirmProvider>
      <div className="ios-device">
        <div className="ios-screen" data-theme={effectiveTheme}>
          <div className="app">
            <div className="app-content">
              <div key={screen} className="screen-transition">
                {screen === 'ozet' && <OzetScreen />}
                {screen === 'gecmis' && <GecmisScreen onEdit={(e) => setEntrySheet({ open: true, editing: e })} onOpenLpg={() => setLpgOpen(true)} />}
                {screen === 'takvim' && <TakvimScreen onAddEvent={() => setEventSheet({ open: true, editing: null })} onEditEvent={(e) => setEventSheet({ open: true, editing: e })} />}
                {screen === 'ayarlar' && <AyarlarScreen theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} onGizlilik={() => setScreen('gizlilik')} onAddKmReminder={() => setKmReminderForm({ open: true, editing: null })} onEditKmReminder={(r) => setKmReminderForm({ open: true, editing: r })} />}
                {screen === 'gizlilik' && <GizlilikScreen onBack={() => setScreen('ayarlar')} />}
              </div>
            </div>
            <nav className="bottom-nav" style={{ display: screen === 'gizlilik' ? 'none' : '' }}>
              <button className={`nav-btn ${screen === 'ozet' ? 'active' : ''}`} onClick={() => setScreen('ozet')}><Icon.Home s={22} /><span>Özet</span></button>
              <button className={`nav-btn ${screen === 'gecmis' ? 'active' : ''}`} onClick={() => setScreen('gecmis')}><Icon.History s={22} /><span>Geçmiş</span></button>
              {screen !== 'gizlilik' && <div className="fab-wrap"><button className="fab" onClick={() => setEntrySheet({ open: true, editing: null })}><Icon.Plus s={26} /></button></div>}
              <button className={`nav-btn ${screen === 'takvim' ? 'active' : ''}`} onClick={() => setScreen('takvim')}><Icon.Calendar s={22} /><span>Takvim</span></button>
              <button className={`nav-btn ${screen === 'ayarlar' ? 'active' : ''}`} onClick={() => setScreen('ayarlar')}><Icon.Settings s={22} /><span>Ayarlar</span></button>
            </nav>
          </div>
          <EntrySheet open={entrySheet.open} editing={entrySheet.editing} onClose={() => setEntrySheet({ open: false, editing: null })} />
          <EventSheet open={eventSheet.open} editing={eventSheet.editing} onClose={() => setEventSheet({ open: false, editing: null })} onSaved={({ type, serviceKm }) => { if (type === 'Bakım' && serviceKm) setKmPrompt({ open: true, km: serviceKm }); }} />
          {kmPrompt.open && <KmPromptModal km={kmPrompt.km} onClose={() => setKmPrompt({ open: false, km: 0 })} />}
          <KmReminderFormModal open={kmReminderForm.open} editing={kmReminderForm.editing} onClose={() => setKmReminderForm({ open: false, editing: null })} />
          {lpgOpen && <LpgSheet onClose={() => setLpgOpen(false)} />}
        </div>
      </div>
    </ConfirmProvider></StoreProvider></LangCtx.Provider></ThemeCtx.Provider>);

}

export default App;
