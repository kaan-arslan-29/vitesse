import React, { useState, useEffect, useMemo, useContext, createContext, useRef, useCallback } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import * as XLSX from 'xlsx';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
function useCountUp(target) {
  return target ?? 0;
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
    </svg>,

  MapPin: ({ s = 20 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>,

  Star: ({ s = 20 }) =>
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>,

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
// These are module-level defaults; language-aware versions are created inside components via useFmt()
const fmt = (n, d = 2, locale = 'tr-TR') => {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return Number(n).toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d });
};
const fmtInt = (n, locale = 'tr-TR') => {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return Number(n).toLocaleString(locale);
};
const APP_VERSION = 'v16';
const uid = () => Math.random().toString(36).slice(2, 10);
const parseISO = (s) => {if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;const [y, m, d] = s.split('-').map(Number);return new Date(y, m - 1, d);};
const fmtDate = (s) => {const d = parseISO(s);if (!d) return '';return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;};
const TR_MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const TR_MONTHS_FULL = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EN_MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_BY_LANG = { tr: TR_MONTHS, en: EN_MONTHS };
const MONTHS_FULL_BY_LANG = { tr: TR_MONTHS_FULL, en: EN_MONTHS_FULL };
const dayMon = (s, lang = 'tr') => {const d = parseISO(s);if (!d) return { d: '--', m: '---' };return { d: String(d.getDate()).padStart(2, '0'), m: (MONTHS_BY_LANG[lang] || TR_MONTHS)[d.getMonth()] };};
const monthLabel = (yyyyMM, lang = 'tr') => { const [y, m] = yyyyMM.split('-'); return `${(MONTHS_FULL_BY_LANG[lang] || TR_MONTHS_FULL)[parseInt(m, 10) - 1]} ${y}`; };
const todayISO = () => {const d = new Date();return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;};
const yesterdayISO = () => {const d = new Date(); d.setDate(d.getDate() - 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;};
const daysUntil = (iso) => {const b = parseISO(iso);if (!b) return 0;return Math.round((b - new Date()) / 86400000);};
const haversineKm = (lat1, lon1, lat2, lon2) => { const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lon2 - lon1) * Math.PI / 180; const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2; return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); };
const parseNum = (s) => {
  if (typeof s !== 'string') return Number(s) || 0;
  return parseFloat(s.replace(',', '.')) || 0;
};

/* ── Store ─────────────────────────────────────────────── */
const STORAGE_KEY = 'vitesse-v6';
const SEED = {
  entries: [
  { id: 'e1',  dateISO: '2025-01-07', liters: 35, pricePerL: 30.0, km: 120000, station: 'BP',    full: true },
  { id: 'e2',  dateISO: '2025-01-23', liters: 38, pricePerL: 32.0, km: 120665, station: 'Shell', full: true },
  { id: 'e3',  dateISO: '2025-02-17', liters: 40, pricePerL: 31.5, km: 121465, station: 'Total', full: true },
  { id: 'e4',  dateISO: '2025-03-06', liters: 35, pricePerL: 33.0, km: 122100, station: 'Opet',  full: true },
  { id: 'e5',  dateISO: '2025-03-18', liters: 38, pricePerL: 35.0, km: 122845, station: 'BP',    full: true },
  { id: 'e6',  dateISO: '2025-03-28', liters: 36, pricePerL: 33.5, km: 123490, station: 'Shell', full: true },
  { id: 'e7',  dateISO: '2025-04-13', liters: 40, pricePerL: 37.0, km: 124260, station: 'Total', full: true },
  { id: 'e8',  dateISO: '2025-04-27', liters: 38, pricePerL: 44.0, km: 124925, station: 'Opet',  full: true },
  { id: 'e9',  dateISO: '2025-05-08', liters: 35, pricePerL: 45.5, km: 125625, station: 'BP',    full: true },
  { id: 'e10', dateISO: '2025-05-19', liters: 40, pricePerL: 47.0, km: 126350, station: 'Shell', full: true },
  { id: 'e11', dateISO: '2025-05-30', liters: 38, pricePerL: 46.0, km: 127095, station: 'Total', full: true },
  { id: 'e12', dateISO: '2025-06-20', liters: 45, pricePerL: 47.5, km: 127900, station: 'Opet',  full: true },
  { id: 'e13', dateISO: '2025-07-11', liters: 38, pricePerL: 46.5, km: 128582, station: 'BP',    full: true },
  { id: 'e14', dateISO: '2025-07-26', liters: 42, pricePerL: 47.5, km: 129269, station: 'Shell', full: true },
  { id: 'e15', dateISO: '2025-08-09', liters: 38, pricePerL: 46.0, km: 129979, station: 'Total', full: true },
  { id: 'e16', dateISO: '2025-08-21', liters: 40, pricePerL: 47.5, km: 130656, station: 'Opet',  full: true },
  { id: 'e17', dateISO: '2025-08-31', liters: 35, pricePerL: 46.0, km: 131296, station: 'BP',    full: true },
  { id: 'e18', dateISO: '2025-09-16', liters: 42, pricePerL: 47.0, km: 131997, station: 'Shell', full: true },
  { id: 'e19', dateISO: '2025-09-30', liters: 38, pricePerL: 46.5, km: 132679, station: 'Total', full: true },
  { id: 'e20', dateISO: '2025-10-11', liters: 40, pricePerL: 47.5, km: 133333, station: 'Opet',  full: true },
  { id: 'e21', dateISO: '2025-10-23', liters: 38, pricePerL: 46.0, km: 134043, station: 'BP',    full: true },
  { id: 'e22', dateISO: '2025-10-31', liters: 35, pricePerL: 47.0, km: 134636, station: 'Shell', full: true },
  { id: 'e23', dateISO: '2025-11-21', liters: 45, pricePerL: 46.5, km: 135458, station: 'Total', full: true },
  { id: 'e24', dateISO: '2025-12-09', liters: 40, pricePerL: 56.5, km: 136126, station: 'Opet',  full: true },
  { id: 'e25', dateISO: '2025-12-20', liters: 38, pricePerL: 58.5, km: 136808, station: 'BP',    full: true },
  { id: 'e26', dateISO: '2025-12-30', liters: 35, pricePerL: 57.5, km: 137383, station: 'Shell', full: true },
  { id: 'e27', dateISO: '2026-01-14', liters: 40, pricePerL: 60.0, km: 138131, station: 'Total', full: true },
  { id: 'e28', dateISO: '2026-01-29', liters: 38, pricePerL: 61.5, km: 138776, station: 'Opet',  full: true },
  { id: 'e29', dateISO: '2026-02-21', liters: 45, pricePerL: 63.0, km: 139598, station: 'BP',    full: true },
  { id: 'e30', dateISO: '2026-03-10', liters: 38, pricePerL: 64.0, km: 140233, station: 'Shell', full: true },
  { id: 'e31', dateISO: '2026-03-22', liters: 40, pricePerL: 65.5, km: 140953, station: 'Total', full: true },
  { id: 'e32', dateISO: '2026-03-31', liters: 35, pricePerL: 63.5, km: 141528, station: 'Opet',  full: true },
  { id: 'e33', dateISO: '2026-04-15', liters: 42, pricePerL: 66.0, km: 142313, station: 'BP',    full: true },
  { id: 'e34', dateISO: '2026-04-28', liters: 40, pricePerL: 67.5, km: 142990, station: 'Shell', full: true },
  { id: 'e35', dateISO: '2026-05-10', liters: 38, pricePerL: 68.0, km: 143686, station: 'Total', full: true },
  { id: 'e36', dateISO: '2026-05-21', liters: 35, pricePerL: 69.5, km: 144270, station: 'Opet',  full: true },
  { id: 'e37', dateISO: '2026-05-31', liters: 36, pricePerL: 67.5, km: 144915, station: 'BP',    full: true }],

  events: [
  { id: 'ev1', type: 'Kasko', startISO: '2026-05-15', endISO: '2026-06-03', notifyDays: 15 },
  { id: 'ev2', type: 'Muayene', startISO: '2026-04-20', endISO: '2026-05-28', notifyDays: 30 }],

  prefs: { showMinMax: false, kmReminders: [] }
};

const SEED_ENTRIES_VERSION = 6;

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const data = JSON.parse(raw);
    // Sadece entries versiyon değiştiğinde entries güncelle; events/prefs her zaman koru
    if (!data._ev || data._ev < SEED_ENTRIES_VERSION) {
      return { ...data, entries: SEED.entries, _ev: SEED_ENTRIES_VERSION };
    }
    return data;
  } catch (e) { return SEED; }
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
    clearAll: () => setData({ entries: [], events: [], prefs: {} }),
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
    // confirm dialog
    areYouSure: 'Emin misin?',
    cancel: 'İptal',
    delete: 'Sil',
    // nav
    navOzet: 'Özet',
    navGecmis: 'Geçmiş',
    navTakvim: 'Takvim',
    navAyarlar: 'Ayarlar',
    // event type buttons (short labels for buttons)
    eventBtnKasko: 'Kasko',
    eventBtnSigorta: 'Sigorta',
    eventBtnMuayene: 'Muayene',
    eventBtnBakim: 'Bakım',
    eventBtnDiger: 'Diğer',
    // currency names
    currNameLira: 'Lira',
    currNameDollar: 'Dolar',
    currNameEuro: 'Euro',
    // GiderDagilimi
    giderDagilimi: 'Gider Dağılımı',
    toplam: 'Toplam',
    // event types
    eventKasko: 'Kasko',
    eventSigorta: 'Sigorta',
    eventMuayene: 'Muayene',
    eventBakim: 'Bakım',
    eventDiger: 'Diğer',
    // fuel types
    fuelBenzin: 'Benzin',
    fuelDizel: 'Dizel',
    fuelLPG: 'LPG',
    // ExportSheet
    exportTitle: 'Dışa Aktar',
    exportFormat: 'Hangi formatta dışa aktarmak istiyorsun?',
    exportExcelSub: 'Dolumlar ve takvim ayrı sekmelerde',
    exportJsonSub: 'İçe aktarma için uygun, tam yedek',
    // ImportSheet
    importTitle: 'İçe Aktar',
    importDesc: 'Dışa aktarılan JSON dosyasını seç.',
    importJsonSub: 'Vitesse uygulamasından dışa aktarılan yedek',
    importSuccess: 'Veriler başarıyla içe aktarıldı.',
    importError: 'Geçersiz dosya. Lütfen dışa aktarılan bir JSON dosyası seçin.',
    // Excel headers
    xlsxDate: 'Tarih',
    xlsxKm: 'Km',
    xlsxLiters: 'Litre',
    xlsxPricePerL: 'Fiyat/L ({c})',
    xlsxTotal: 'Toplam ({c})',
    xlsxFullTank: 'Tam Depo',
    xlsxStation: 'İstasyon',
    xlsxNote: 'Not',
    xlsxType: 'Tür',
    xlsxStart: 'Başlangıç',
    xlsxEnd: 'Bitiş',
    xlsxCost: 'Maliyet ({c})',
    xlsxSheetFuel: 'Dolumlar',
    xlsxSheetCalendar: 'Takvim',
    xlsxYes: 'Evet',
    xlsxNo: 'Hayır',
    // LPG sheet
    lpgTitle: 'LPG Dönüşüm Hesabı',
    lpgMonthlySpend: 'Aylık tüketim ({c})',
    lpgMonthlyPlaceholder: 'örn. 6500',
    lpgGasolinePrice: 'Benzin fiyatı ({c}/L)',
    lpgGasolineSub: 'Son dolum fiyatı',
    lpgInstallCost: 'Montaj maliyeti ({c})',
    lpgLpgPrice: 'LPG litre fiyatı ({c})',
    lpgConsumptionDiff: 'Tüketim farkı (%)',
    lpgConsumptionDiffSub: 'LPG genelde %15–20 fazla tüketir',
    lpgMonthlySaving: 'Aylık tasarruf',
    lpgYearlySaving: 'Yıllık tasarruf',
    lpgBreakEven: 'Amorti süresi',
    lpgNotWorthIt: 'Bu fiyatlarla LPG daha pahalıya geliyor, dönüşüm tavsiye edilmez.',
    lpgDisclaimer: '* Otomatik doldurulan değerler değiştirilebilir. Gerçek tasarruf araca ve kullanıma göre değişir.',
    lpgYear: 'yıl',
    lpgMonth: 'ay',
    // OzetScreen
    ozetTitle: 'Özet',
    ozetSubFills: 'dolum kaydı',
    ozetNoEntries: 'Henüz dolum kaydı yok',
    ozetNoEntriesSub: 'İlk dolumunu ekleyerek yakıt tüketimini ve harcamalarını takip etmeye başla.',
    ozetAddFuel: 'Dolum ekle',
    ozetAvgConsumption: 'Ortalama Tüketim',
    ozetInfoFull: 'Tam depolar arası · son',
    ozetInfoFull2: 'dolum',
    ozetInfoMin: 'En az 2 tam depo gerekli',
    ozetStations: 'İstasyonlar',
    ozetLastPaid: 'Son dolumda ödenen',
    ozetThisMonthSpend: 'Bu ay harcama',
    ozetPerKm: 'km başına',
    ozetLastFillup: 'Son dolum',
    ozetThisYearSpend: 'Bu yıl harcama',
    ozetAvgPerMonth: 'ort.',
    ozetPerMonth: '{c}/ay',
    ozetPerFillAvg: 'ort.',
    ozetKmPerFill: 'km/dolum',
    ozetAllTime: 'tüm zamanlar',
    ozetToday: 'Bugün',
    ozetYesterday: 'Dün',
    ozetDaysAgo: 'gün önce',
    ozetConsumptionTrend: 'Tüketim Trendi',
    ozetFilterAll: 'Tümü',
    ozetFilter3m: '3 ay',
    ozetFilterYear: 'Bu yıl',
    ozetInsufficientData: 'Bu dönemde yeterli veri yok',
    ozetReminders: 'Hatırlatmalar',
    ozetNoReminders: 'Yaklaşan hatırlatma yok',
    ozetNoRemindersSub: 'Takvim sekmesinden muayene, sigorta gibi etkinlikler ekleyebilirsin.',
    ozetKmOverdue: 'km geçti',
    ozetKmLeft: 'km kaldı',
    ozetDaysOverdue: 'gün gecikti',
    ozetDays: 'gün',
    ozetEvery: 'Her',
    ozetKm: 'km',
    // GecmisScreen
    gecmisTitle: 'Geçmiş',
    gecmisLpgBtn: 'LPG Hesabı',
    gecmisPriceHistory: 'Fiyat Geçmişi',
    gecmisMonthlyConsumption: 'Aylık Tüketim',
    gecmisStationComparison: 'İstasyon Karşılaştırması',
    gecmisStationInfoTooltip: 'Enflasyon etkisini azaltmak için hep son 3 aya bakılır',
    gecmisStationCheap: 'UCUZ',
    gecmisAllFills: 'Tüm Dolumlar',
    gecmisMonthFills: 'Bu Ayki Dolumlar',
    gecmis3mFills: 'Son 3 Aylık Dolumlar',
    gecmisYearFills: 'Bu Yılki Dolumlar',
    gecmisNoEntries: 'Henüz dolum kaydı yok',
    gecmisNoPeriod: 'Bu dönemde kayıt yok',
    gecmisNoEntriesSub: 'İlk dolumunu ekleyerek yakıt tüketimini takip etmeye başla.',
    gecmisNoPeriodSub: 'Seçili zaman aralığında dolum kaydı bulunmuyor.',
    gecmisDeleteMsg: 'Bu dolum kaydı kalıcı olarak silinecek.',
    gecmisFillFull: 'Tam',
    gecmisFillPartial: 'Yarım',
    gecmisFillsCount: 'dolum',
    gecmisFilterAll: 'Tümü',
    gecmisFilterMonth: 'Bu ay',
    gecmisFilter3m: 'Son 3 ay',
    gecmisFilterYear: 'Bu yıl',
    gecmisDateRange3m: 'Son 3 ay',
    gecmisDateRangeYear: 'Bu yıl',
    gecmisSon3Ay: 'Son 3 ay',
    // TakvimScreen
    takvimTitle: 'Takvim',
    takvimAdd: 'Ekle',
    takvimNoEvents: 'Henüz etkinlik yok',
    takvimNoEventsSub: 'Muayene, sigorta, lastik gibi hatırlatmaları buradan takip edebilirsin.',
    takvimAddEvent: 'Etkinlik ekle',
    takvimOngoing: 'Devam Eden',
    takvimExpired: 'Süresi Dolmuş',
    takvimDeleteMsg: 'Bu etkinlik kalıcı olarak silinecek.',
    takvimToday: 'Bugün',
    // NearbyStations
    nearbyTitle: 'Yakındaki İstasyonlar',
    nearbyCount: 'istasyon · 5 km içinde',
    nearbyLoading: 'Konum alınıyor…',
    nearbyLoadingStations: 'İstasyonlar yükleniyor…',
    nearbyError: 'İstasyonlar yüklenemedi. İnternet bağlantısını kontrol edin.',
    nearbyLocationError: 'Konum erişimi bu cihazda desteklenmiyor.',
    nearbyLocationDenied: 'Konum alınamadı. Lütfen konum iznini kontrol edin.',
    nearbyRetry: 'Tekrar Dene',
    nearbyDirectionsHint: 'Yol tarifi almak için butona bas',
    nearbyDistance: 'Mesafe',
    nearbyDuration: 'Tahmini Süre',
    nearbyCalculating: 'Hesaplanıyor…',
    nearbyCloseRoute: 'Rotayı Kapat',
    nearbyGetDirections: 'Yol Tarifi',
    nearbyFuelStation: 'Yakıt İstasyonu',
    // KmReminderSection
    kmRemindersTitle: 'Km Hatırlatmaları',
    kmReminderAdd: 'Ekle',
    kmReminderEvery: 'Her',
    kmReminderLast: 'Son:',
    kmReminderNext: 'Sonraki:',
    // KmReminderFormModal
    kmFormEditTitle: 'Hatırlatmayı Düzenle',
    kmFormNewTitle: 'Yeni Km Hatırlatması',
    kmFormLabel: 'Açıklama',
    kmFormLabelPlaceholder: 'örn. Yağ Değişimi',
    kmFormInterval: 'Aralık (km)',
    kmFormLastDone: 'Son yapılan (km)',
    kmFormLabelRequired: 'Açıklama girilmeli',
    kmFormIntervalRequired: 'Aralık km girilmeli',
    kmFormUpdate: 'Güncelle',
    kmFormSave: 'Kaydet',
    // AyarlarScreen
    ayarlarTitle: 'Ayarlar',
    ayarlarVehicle: 'Araç',
    ayarlarModel: 'Marka / Model',
    ayarlarModelPlaceholder: 'örn. Toyota Corolla',
    ayarlarTank: 'Depo (L)',
    ayarlarTankPlaceholder: 'örn. 55',
    ayarlarFuelType: 'Yakıt Tipi',
    ayarlarLanguage: 'Dil',
    ayarlarCurrency: 'Para Birimi',
    ayarlarTheme: 'Görünüm',
    ayarlarThemeDark: 'Koyu',
    ayarlarThemeLight: 'Açık',
    ayarlarThemeSystem: 'Sistem',
    ayarlarPrefs: 'Tercihler',
    ayarlarNotifications: 'Bildirimler',
    ayarlarNotificationsSub: 'Takvim etkinlikleri dolmadan önce hatırlatma gönderir',
    ayarlarMinMax: 'Min/Maks İşaretleri',
    ayarlarMinMaxSub: 'Grafiklerde en düşük ve yüksek noktalar',
    ayarlarFeedback: 'Geri Bildirim',
    ayarlarSuggest: 'Öneride Bulun',
    ayarlarSuggestSub: 'Görüş ve önerilerini ilet',
    ayarlarManualBackup: 'Manuel Yedekleme',
    ayarlarExport: 'Dışa Aktar',
    ayarlarExportSub: 'Excel veya JSON olarak kaydet',
    ayarlarImport: 'İçe Aktar',
    ayarlarImportSub: 'Daha önce dışa aktarılan JSON dosyası',
    ayarlarDanger: 'Tehlikeli Bölge',
    ayarlarReset: 'Verileri Sıfırla',
    ayarlarResetSub: 'Kayıtlar silinir, örnek veriler yüklenir',
    ayarlarResetMsg: 'Tüm dolum ve takvim kayıtları silinecek, örnek veriler yüklenecek. Araç bilgilerin ve tercihler korunur.',
    ayarlarResetConfirm: 'Sıfırla',
    ayarlarDeleteAll: 'Tüm Verileri Sil',
    ayarlarDeleteAllSub: 'Yerel veriler ve Drive yedeği tamamen silinir',
    ayarlarDeleteAllMsg: 'Tüm yerel veriler ve Google Drive yedeği kalıcı olarak silinecek. Bu işlem geri alınamaz.',
    ayarlarAbout: 'Hakkında',
    ayarlarPrivacy: 'Gizlilik Politikası',
    ayarlarVersion: 'Versiyon',
    // Google Drive
    driveTitle: 'Google Drive Yedekleme',
    driveSaving: 'Yedekleniyor…',
    driveError: 'Yedekleme başarısız',
    driveLastBackup: 'Son yedek:',
    driveNoBackup: 'Henüz yedek alınmadı',
    driveRestore: "Drive'dan Geri Yükle",
    driveRestoreSub: 'Mevcut veriler yedekle değiştirilir',
    driveRestoreConfirmTitle: 'Emin misin?',
    driveRestoreConfirmSub: 'Mevcut tüm veriler silinir',
    driveRestoreBtn: 'Geri Yükle',
    driveDisconnect: 'Hesabı Bağla',
    driveDisconnectSub: "Google Drive bağlantısını kes",
    driveConnect: 'Google ile Bağlan',
    driveConnectSub: 'Veriler otomatik yedeklenir',
    // EntrySheet
    entryEditTitle: 'dolumunu düzenle',
    entryNewTitle: 'Yeni',
    entryFillupSuffix: 'Dolumu',
    entryDate: 'Tarih',
    entryToday: 'Bugün',
    entryYesterday: 'Dün',
    entryKm: 'Kilometre',
    entryLastRecord: 'Son kayıt:',
    entryTooFew: 'çok az?',
    entryTooMany: 'çok fazla?',
    entryLiters: 'Litre',
    entryPricePerL: '{c} / Litre',
    entryFullTank: 'Tam depo',
    entryFullTankSub: 'Tüketim hesabı bir sonraki tam depoyla yapılır.',
    entryStation: 'İstasyon',
    entryOptional: '(opsiyonel)',
    entryNote: 'Not',
    entryNotePlaceholder: 'Uzun yol, bakım sonrası…',
    entryTotal: 'Toplam',
    entrySave: 'Kaydet',
    entryUpdate: 'Güncelle',
    entryDiscardTitle: 'Vazgeç?',
    entryDiscardSub: 'Girilen bilgiler kaydedilmeyecek.',
    entryDiscardExit: 'Çıkış',
    entryDiscardContinue: 'Düzenlemeye devam et',
    entryCapacityExceeded: 'Depo kapasitesini aşıyor',
    entryDateFuture: 'Gelecek tarih girilemez',
    entryKmRequired: 'Kilometre girilmeli',
    entryKmTooLow: 'Önceki dolumdan düşük olamaz (son:',
    entryLitersRequired: 'Litre girilmeli',
    entryPriceRequired: 'Fiyat girilmeli',
    // EventSheet
    eventEditTitle: 'Etkinliği düzenle',
    eventNewTitle: 'Yeni etkinlik',
    eventEditSub: 'Etkinlik bilgilerini düzenle',
    eventStart: 'Başlangıç',
    eventEnd: 'Bitiş',
    eventDays: 'gün',
    eventEndPast: 'Bitiş tarihi geçmişte',
    eventNotifyDays: 'Önceden bildir (gün)',
    eventNotifyInfo: "Uygulama her açıldığında kontrol edilir. Bildirimlerin çalışması için Ayarlar → Bildirimler'i aç.",
    eventServiceKm: 'Yapıldığı km',
    eventCost: 'Maliyet',
    eventNote: 'Not',
    eventSave: 'Kaydet',
    eventUpdate: 'Güncelle',
    eventCustomTypePlaceholder: 'Tür adı girin…',
    eventCustomTypeRequired: 'Tür adı girilmeli',
    eventEndRequired: 'Bitiş tarihi gerekli',
    eventEndBeforeStart: 'Bitiş tarihi başlangıçtan önce olamaz',
    eventNotePlaceholderInsurance: 'Poliçe numarası, şirket adı…',
    eventNotePlaceholderService: 'Yapılan işlemler…',
    eventNotePlaceholderDefault: 'Not…',
    // KmPromptModal
    kmPromptTitle: 'Km Hatırlatması',
    kmPromptSub: "km'de bakım yapıldı. Bir sonraki hatırlatma eklensin mi?",
    kmPromptInterval: 'Aralık (km)',
    kmPromptNextService: 'Sonraki bakım:',
    kmPromptAdd: 'Hatırlatma Ekle',
    kmPromptSkip: 'Geç',
    // FeedbackSheet
    feedbackTitle: 'Öneride Bulun',
    feedbackPlaceholder: 'Görüş ve önerilerini yaz…',
    feedbackSend: 'Gönder',
    // AreaChart
    chartInsufficient: 'Yetersiz veri',
    // GizlilikScreen
    privacyTitle: 'Gizlilik Politikası',
    privacyLastUpdate: 'Son güncelleme: Mayıs 2026',
    privacyIntro: 'Vitesse, aracınıza ait yakıt dolumlarını ve bakım etkinliklerini takip etmenizi sağlayan kişisel bir uygulamadır. Gizliliğiniz bizim için önceliklidir.',
    // station labels
    last3Months: 'Son 3 ay',
    // Privacy sections
    privacyDataCollected: 'Toplanan Veriler',
    privacyDataCollectedContent: 'Girdiğiniz dolum kayıtları, bakım etkinlikleri ve tercihler öncelikle cihazınızın yerel depolama alanında (localStorage) saklanır. Google Drive yedekleme özelliğini etkinleştirirseniz bu veriler Google hesabınızın Drive uygulama klasörüne yüklenir; yalnızca sizin erişiminize açıktır. Google OAuth ile giriş yaptığınızda e-posta adresiniz yerel olarak kaydedilir ve hesap bağlantısını kestiğinizde silinir.',
    privacyDataSharing: 'Veri Paylaşımı',
    privacyDataSharingContent: "Verileriniz reklam amacıyla kullanılmaz veya üçüncü taraflara satılmaz. Google Drive yedekleme tercihini etkinleştirmeniz durumunda yedek dosyanız Google'ın altyapısında saklanır ve Google'ın gizlilik politikasına tabidir.",
    privacyThirdParty: 'Üçüncü Taraf Hizmetler',
    privacyThirdPartyContent: 'OpenStreetMap/Overpass API: "Yakındaki İstasyonlar" özelliği kullanıldığında konum koordinatlarınız Overpass API sunucusuna gönderilir; istasyon listesi alındıktan sonra herhangi bir veri saklanmaz. Leaflet harita görüntüleme için unpkg.com CDN\'inden yüklenir. Google Fonts yazı tipleri için kullanılır. Bu hizmetler kendi gizlilik politikalarına tabidir.',
    privacyNotifications: 'Bildirimler',
    privacyNotificationsContent: 'Uygulama, takvim etkinlikleri ve bakım hatırlatmaları için bildirim iznini talep eder. Bildirimler yalnızca cihazınızda yerel olarak oluşturulur; hiçbir sunucuya bağlanmaz. İzni cihaz ayarlarından istediğiniz zaman kapatabilirsiniz.',
    privacyLocation: 'Konum Verisi',
    privacyLocationContent: 'Uygulama, "Yakındaki İstasyonlar" özelliği için konum iznini talep eder. Konum koordinatları yalnızca yakın çevredeki yakıt istasyonlarını sorgulamak amacıyla Overpass API\'ye anlık olarak iletilir; cihazda kaydedilmez ve başka herhangi bir amaçla kullanılmaz.',
    privacyDataDeletion: 'Veri Silme',
    privacyDataDeletionContent: 'Ayarlar > Tehlikeli Bölge ekranındaki "Tüm Verileri Sil" seçeneği yerel kayıtlarınızı ve Google Drive yedek dosyanızı kalıcı olarak siler. Yalnızca yerel verileri temizlemek için uygulamayı kaldırabilir veya tarayıcı verilerini silebilirsiniz.',
    privacyChildren: 'Çocukların Gizliliği',
    privacyChildrenContent: 'Uygulama 13 yaş altı çocuklara yönelik değildir ve bu yaş grubundan bilerek veri toplanmaz.',
    privacyContact: 'İletişim',
    privacyContactContent: 'Gizlilik politikasıyla ilgili sorularınız için aria.software.dev@gmail.com adresine ulaşabilirsiniz.',
  },
  en: {
    appName: 'Vitesse - Car Journal',
    ozet: 'Overview', gecmis: 'History', takvim: 'Calendar', ayarlar: 'Settings',
    addFuel: 'Add fill-up', noEntries: 'No fuel entries yet',
    noEntriesSub: 'Add your first fill-up to start tracking fuel consumption and costs.',
    // confirm dialog
    areYouSure: 'Are you sure?',
    cancel: 'Cancel',
    delete: 'Delete',
    // nav
    navOzet: 'Overview',
    navGecmis: 'History',
    navTakvim: 'Calendar',
    navAyarlar: 'Settings',
    // event type buttons (short labels for buttons)
    eventBtnKasko: 'Kasko',
    eventBtnSigorta: 'Insurance',
    eventBtnMuayene: 'Inspection',
    eventBtnBakim: 'Service',
    eventBtnDiger: 'Other',
    // currency names
    currNameLira: 'Lira',
    currNameDollar: 'Dollar',
    currNameEuro: 'Euro',
    // GiderDagilimi
    giderDagilimi: 'Expense Breakdown',
    toplam: 'Total',
    // event types
    eventKasko: 'Comprehensive Insurance',
    eventSigorta: 'Third-Party Insurance',
    eventMuayene: 'Vehicle Inspection',
    eventBakim: 'Service / Maintenance',
    eventDiger: 'Other',
    // fuel types
    fuelBenzin: 'Gasoline',
    fuelDizel: 'Diesel',
    fuelLPG: 'LPG',
    // ExportSheet
    exportTitle: 'Export',
    exportFormat: 'Which format would you like to export?',
    exportExcelSub: 'Fill-ups and calendar in separate sheets',
    exportJsonSub: 'Suitable for import, full backup',
    // ImportSheet
    importTitle: 'Import',
    importDesc: 'Select an exported JSON file.',
    importJsonSub: 'Backup exported from Vitesse',
    importSuccess: 'Data imported successfully.',
    importError: 'Invalid file. Please select a JSON file exported from Vitesse.',
    // Excel headers
    xlsxDate: 'Date',
    xlsxKm: 'Odometer',
    xlsxLiters: 'Liters',
    xlsxPricePerL: 'Price/L ({c})',
    xlsxTotal: 'Total ({c})',
    xlsxFullTank: 'Full Tank',
    xlsxStation: 'Station',
    xlsxNote: 'Note',
    xlsxType: 'Type',
    xlsxStart: 'Start',
    xlsxEnd: 'End',
    xlsxCost: 'Cost ({c})',
    xlsxSheetFuel: 'Fill-ups',
    xlsxSheetCalendar: 'Calendar',
    xlsxYes: 'Yes',
    xlsxNo: 'No',
    // LPG sheet
    lpgTitle: 'LPG Conversion Calculator',
    lpgMonthlySpend: 'Monthly spend ({c})',
    lpgMonthlyPlaceholder: 'e.g. 6500',
    lpgGasolinePrice: 'Gasoline price ({c}/L)',
    lpgGasolineSub: 'Price from last fill-up',
    lpgInstallCost: 'Installation cost ({c})',
    lpgLpgPrice: 'LPG price per liter ({c})',
    lpgConsumptionDiff: 'Consumption difference (%)',
    lpgConsumptionDiffSub: 'LPG typically uses 15–20% more',
    lpgMonthlySaving: 'Monthly saving',
    lpgYearlySaving: 'Yearly saving',
    lpgBreakEven: 'Break-even period',
    lpgNotWorthIt: 'At these prices LPG is more expensive — conversion is not recommended.',
    lpgDisclaimer: '* Pre-filled values can be changed. Actual savings vary by vehicle and usage.',
    lpgYear: 'yr',
    lpgMonth: 'mo',
    // OzetScreen
    ozetTitle: 'Overview',
    ozetSubFills: 'fill-ups',
    ozetNoEntries: 'No fuel entries yet',
    ozetNoEntriesSub: 'Add your first fill-up to start tracking fuel consumption and costs.',
    ozetAddFuel: 'Add fill-up',
    ozetAvgConsumption: 'Average Consumption',
    ozetInfoFull: 'Between full tanks · last',
    ozetInfoFull2: 'fill-ups',
    ozetInfoMin: 'At least 2 full tanks required',
    ozetStations: 'Stations',
    ozetLastPaid: 'Price per liter (last fill-up)',
    ozetThisMonthSpend: 'This month',
    ozetPerKm: 'Per km',
    ozetLastFillup: 'Last fill-up',
    ozetThisYearSpend: 'This year',
    ozetAvgPerMonth: 'avg.',
    ozetPerMonth: '{c}/mo',
    ozetPerFillAvg: 'avg.',
    ozetKmPerFill: 'km/fill-up',
    ozetAllTime: 'all time',
    ozetToday: 'Today',
    ozetYesterday: 'Yesterday',
    ozetDaysAgo: 'days ago',
    ozetConsumptionTrend: 'Consumption Trend',
    ozetFilterAll: 'All',
    ozetFilter3m: '3 mo',
    ozetFilterYear: 'This year',
    ozetInsufficientData: 'Not enough data for this period',
    ozetReminders: 'Reminders',
    ozetNoReminders: 'No upcoming reminders',
    ozetNoRemindersSub: 'Add inspection, insurance and other events from the Calendar tab.',
    ozetKmOverdue: 'km overdue',
    ozetKmLeft: 'km left',
    ozetDaysOverdue: 'days overdue',
    ozetDays: 'days',
    ozetEvery: 'Every',
    ozetKm: 'km',
    // GecmisScreen
    gecmisTitle: 'History',
    gecmisLpgBtn: 'LPG Calc',
    gecmisPriceHistory: 'Price History',
    gecmisMonthlyConsumption: 'Monthly Consumption',
    gecmisStationComparison: 'Station Comparison',
    gecmisStationInfoTooltip: 'Always looks at the last 3 months to reduce inflation bias',
    gecmisStationCheap: 'CHEAPEST',
    gecmisAllFills: 'All Fill-ups',
    gecmisMonthFills: 'This Month\'s Fill-ups',
    gecmis3mFills: 'Last 3 Months\' Fill-ups',
    gecmisYearFills: 'This Year\'s Fill-ups',
    gecmisNoEntries: 'No fuel entries yet',
    gecmisNoPeriod: 'No entries for this period',
    gecmisNoEntriesSub: 'Add your first fill-up to start tracking fuel consumption.',
    gecmisNoPeriodSub: 'No fill-up records in the selected time range.',
    gecmisDeleteMsg: 'This fill-up record will be permanently deleted.',
    gecmisFillFull: 'Full',
    gecmisFillPartial: 'Partial',
    gecmisFillsCount: 'fill-ups',
    gecmisFilterAll: 'All',
    gecmisFilterMonth: 'This month',
    gecmisFilter3m: 'Last 3 mo',
    gecmisFilterYear: 'This year',
    gecmisDateRange3m: 'Last 3 months',
    gecmisDateRangeYear: 'This year',
    gecmisSon3Ay: 'Last 3 months',
    // TakvimScreen
    takvimTitle: 'Calendar',
    takvimAdd: 'Add',
    takvimNoEvents: 'No events yet',
    takvimNoEventsSub: 'Track inspection, insurance, tires and other reminders here.',
    takvimAddEvent: 'Add event',
    takvimOngoing: 'Ongoing',
    takvimExpired: 'Expired',
    takvimDeleteMsg: 'This event will be permanently deleted.',
    takvimToday: 'Today',
    // NearbyStations
    nearbyTitle: 'Nearby Stations',
    nearbyCount: 'stations within 5 km',
    nearbyLoading: 'Getting location…',
    nearbyLoadingStations: 'Loading stations…',
    nearbyError: 'Could not load stations. Check your internet connection.',
    nearbyLocationError: 'Location access is not supported on this device.',
    nearbyLocationDenied: 'Could not get location. Please check location permissions.',
    nearbyRetry: 'Retry',
    nearbyDirectionsHint: 'Tap the button for directions',
    nearbyDistance: 'Distance',
    nearbyDuration: 'Est. Time',
    nearbyCalculating: 'Calculating…',
    nearbyCloseRoute: 'Close Route',
    nearbyGetDirections: 'Get Directions',
    nearbyFuelStation: 'Fuel Station',
    // KmReminderSection
    kmRemindersTitle: 'Odometer Reminders',
    kmReminderAdd: 'Add',
    kmReminderEvery: 'Every',
    kmReminderLast: 'Last:',
    kmReminderNext: 'Next:',
    // KmReminderFormModal
    kmFormEditTitle: 'Edit Reminder',
    kmFormNewTitle: 'New Odometer Reminder',
    kmFormLabel: 'Description',
    kmFormLabelPlaceholder: 'e.g. Oil Change',
    kmFormInterval: 'Interval (km)',
    kmFormLastDone: 'Last done (km)',
    kmFormLabelRequired: 'Description is required',
    kmFormIntervalRequired: 'Interval km is required',
    kmFormUpdate: 'Update',
    kmFormSave: 'Save',
    // AyarlarScreen
    ayarlarTitle: 'Settings',
    ayarlarVehicle: 'Vehicle',
    ayarlarModel: 'Brand / Model',
    ayarlarModelPlaceholder: 'e.g. Toyota Corolla',
    ayarlarTank: 'Tank (L)',
    ayarlarTankPlaceholder: 'e.g. 55',
    ayarlarFuelType: 'Fuel Type',
    ayarlarLanguage: 'Language',
    ayarlarCurrency: 'Currency',
    ayarlarTheme: 'Appearance',
    ayarlarThemeDark: 'Dark',
    ayarlarThemeLight: 'Light',
    ayarlarThemeSystem: 'System',
    ayarlarPrefs: 'Preferences',
    ayarlarNotifications: 'Notifications',
    ayarlarNotificationsSub: 'Sends reminders before calendar events expire',
    ayarlarMinMax: 'Min/Max Markers',
    ayarlarMinMaxSub: 'Highlight lowest and highest points on charts',
    ayarlarFeedback: 'Feedback',
    ayarlarSuggest: 'Share Feedback',
    ayarlarSuggestSub: 'Send your thoughts and suggestions',
    ayarlarManualBackup: 'Manual Backup',
    ayarlarExport: 'Export',
    ayarlarExportSub: 'Save as Excel or JSON',
    ayarlarImport: 'Import',
    ayarlarImportSub: 'Previously exported JSON file',
    ayarlarDanger: 'Danger Zone',
    ayarlarReset: 'Reset Data',
    ayarlarResetSub: 'Records are deleted, sample data is loaded',
    ayarlarResetMsg: 'All fill-up and calendar records will be deleted and sample data will be loaded. Your vehicle info and preferences are kept.',
    ayarlarResetConfirm: 'Reset',
    ayarlarDeleteAll: 'Delete All Data',
    ayarlarDeleteAllSub: 'Local data and Drive backup are permanently removed',
    ayarlarDeleteAllMsg: 'All local data and Google Drive backup will be permanently deleted. This cannot be undone.',
    ayarlarAbout: 'About',
    ayarlarPrivacy: 'Privacy Policy',
    ayarlarVersion: 'Version',
    // Google Drive
    driveTitle: 'Google Drive Backup',
    driveSaving: 'Backing up…',
    driveError: 'Backup failed',
    driveLastBackup: 'Last backup:',
    driveNoBackup: 'No backup yet',
    driveRestore: 'Restore from Drive',
    driveRestoreSub: 'Current data will be replaced with backup',
    driveRestoreConfirmTitle: 'Are you sure?',
    driveRestoreConfirmSub: 'All current data will be deleted',
    driveRestoreBtn: 'Restore',
    driveDisconnect: 'Disconnect Account',
    driveDisconnectSub: 'Disconnect from Google Drive',
    driveConnect: 'Connect with Google',
    driveConnectSub: 'Data is backed up automatically',
    // EntrySheet
    entryEditTitle: 'Edit fill-up',
    entryNewTitle: 'New',
    entryFillupSuffix: 'Fill-up',
    entryDate: 'Date',
    entryToday: 'Today',
    entryYesterday: 'Yesterday',
    entryKm: 'Odometer',
    entryLastRecord: 'Last record:',
    entryTooFew: 'too low?',
    entryTooMany: 'too high?',
    entryLiters: 'Liters',
    entryPricePerL: '{c} / Liter',
    entryFullTank: 'Full tank',
    entryFullTankSub: 'Consumption is calculated up to the next full tank.',
    entryStation: 'Station',
    entryOptional: '(optional)',
    entryNote: 'Note',
    entryNotePlaceholder: 'Long trip, after service…',
    entryTotal: 'Total',
    entrySave: 'Save',
    entryUpdate: 'Update',
    entryDiscardTitle: 'Discard changes?',
    entryDiscardSub: 'Entered information will not be saved.',
    entryDiscardExit: 'Discard',
    entryDiscardContinue: 'Keep editing',
    entryCapacityExceeded: 'Exceeds tank capacity',
    entryDateFuture: 'Future date not allowed',
    entryKmRequired: 'Odometer reading is required',
    entryKmTooLow: 'Cannot be lower than previous fill-up (last:',
    entryLitersRequired: 'Liters are required',
    entryPriceRequired: 'Price is required',
    // EventSheet
    eventEditTitle: 'Edit event',
    eventNewTitle: 'New event',
    eventEditSub: 'Edit event details',
    eventStart: 'Start',
    eventEnd: 'End',
    eventDays: 'days',
    eventEndPast: 'End date is in the past',
    eventNotifyDays: 'Notify before (days)',
    eventNotifyInfo: 'Checked every time the app opens. Enable Notifications in Settings to receive alerts.',
    eventServiceKm: 'Service at km',
    eventCost: 'Cost',
    eventNote: 'Note',
    eventSave: 'Save',
    eventUpdate: 'Update',
    eventCustomTypePlaceholder: 'Enter type name…',
    eventCustomTypeRequired: 'Type name is required',
    eventEndRequired: 'End date is required',
    eventEndBeforeStart: 'End date cannot be before start date',
    eventNotePlaceholderInsurance: 'Policy number, company name…',
    eventNotePlaceholderService: 'Work performed…',
    eventNotePlaceholderDefault: 'Note…',
    // KmPromptModal
    kmPromptTitle: 'Odometer Reminder',
    kmPromptSub: 'km service logged. Add a reminder for the next one?',
    kmPromptInterval: 'Interval (km)',
    kmPromptNextService: 'Next service:',
    kmPromptAdd: 'Add Reminder',
    kmPromptSkip: 'Skip',
    // FeedbackSheet
    feedbackTitle: 'Share Feedback',
    feedbackPlaceholder: 'Write your thoughts and suggestions…',
    feedbackSend: 'Send',
    // AreaChart
    chartInsufficient: 'Insufficient data',
    // GizlilikScreen
    privacyTitle: 'Privacy Policy',
    privacyLastUpdate: 'Last updated: May 2026',
    privacyIntro: 'Vitesse is a personal app for tracking your vehicle\'s fuel fill-ups and maintenance events. Your privacy is our priority.',
    // station labels
    last3Months: 'Last 3 months',
    // Privacy sections
    privacyDataCollected: 'Data Collected',
    privacyDataCollectedContent: 'Your fill-up records, maintenance events, and preferences are stored locally on your device (localStorage). If you enable Google Drive backup, this data is uploaded to your Google account\'s Drive app folder and is only accessible by you. When you sign in with Google OAuth, your email address is saved locally and deleted when you disconnect your account.',
    privacyDataSharing: 'Data Sharing',
    privacyDataSharingContent: 'Your data is not used for advertising or sold to third parties. If you enable Google Drive backup, your backup file is stored on Google\'s infrastructure and is subject to Google\'s privacy policy.',
    privacyThirdParty: 'Third-Party Services',
    privacyThirdPartyContent: 'OpenStreetMap/Overpass API: When you use the "Nearby Stations" feature, your location coordinates are sent to the Overpass API server; no data is retained after the station list is returned. Leaflet is loaded from unpkg.com CDN for map rendering. Google Fonts is used for typography. These services are subject to their own privacy policies.',
    privacyNotifications: 'Notifications',
    privacyNotificationsContent: 'The app requests notification permission for calendar events and maintenance reminders. Notifications are generated locally on your device only; no server connection is made. You can disable this permission in your device settings at any time.',
    privacyLocation: 'Location Data',
    privacyLocationContent: 'The app requests location permission for the "Nearby Stations" feature. Your location coordinates are sent instantly to the Overpass API solely to query nearby fuel stations; they are not stored on the device and are not used for any other purpose.',
    privacyDataDeletion: 'Data Deletion',
    privacyDataDeletionContent: 'The "Delete All Data" option under Settings > Danger Zone permanently deletes your local records and Google Drive backup file. To clear only local data, you can uninstall the app or clear browser data.',
    privacyChildren: 'Children\'s Privacy',
    privacyChildrenContent: 'The app is not intended for children under 13 and does not knowingly collect data from that age group.',
    privacyContact: 'Contact',
    privacyContactContent: 'For questions about this privacy policy, you can reach us at aria.software.dev@gmail.com.',
  },
};
const LangCtx = createContext('tr');
const useLang = () => useContext(LangCtx);
const CurrencyCtx = createContext('₺');
const useCurrency = () => useContext(CurrencyCtx);
const ThemeCtx = createContext('dark');
const useTheme = () => useContext(ThemeCtx);
const useT = () => {
  const lang = useLang();
  const currency = useCurrency();
  return (key) => ((TRANSLATIONS[lang] || TRANSLATIONS.tr)[key] ?? key).replace(/\{c\}/g, currency);
};
const useFmt = () => {
  const lang = useLang();
  const locale = lang === 'en' ? 'en-US' : 'tr-TR';
  return {
    fmt: (n, d = 2) => fmt(n, d, locale),
    fmtInt: (n) => fmtInt(n, locale),
    months: MONTHS_BY_LANG[lang] || TR_MONTHS,
    monthsFull: MONTHS_FULL_BY_LANG[lang] || TR_MONTHS_FULL,
    dayMon: (s) => dayMon(s, lang),
    monthLabel: (yyyyMM) => monthLabel(yyyyMM, lang),
  };
};

/* ── Confirm ───────────────────────────────────────────── */
const ConfirmCtx = createContext(null);
function ConfirmProvider({ children }) {
  const theme = useTheme();
  const t = useT();
  const dark = theme !== 'light';
  const [state, setState] = useState({ open: false, message: '', onConfirm: null, confirmLabel: null });
  const ask = (message, onConfirm, confirmLabel = null) => setState({ open: true, message, onConfirm, confirmLabel });
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
              <Icon.Trash s={24} />
            </div>
            <h2 style={{ marginBottom: 8, color: titleColor }}>{t('areYouSure')}</h2>
            <p style={{ fontSize: 14, color: msgColor, lineHeight: 1.6, margin: '0 0 22px' }}>{state.message}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" style={{ flex: 1, justifyContent: 'center', borderRadius: 12, padding: '13px 12px', fontSize: 14, fontWeight: 500, ...cancelStyle }} onClick={close}>{t('cancel')}</button>
              <button className="btn" style={{ flex: 1, justifyContent: 'center', borderRadius: 12, padding: '13px 12px', fontSize: 14, fontWeight: 600, border: 'none', ...dangerStyle }} onClick={() => { state.onConfirm(); close(); }}>{state.confirmLabel ?? t('delete')}</button>
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
function AreaChart({ data, labels, unit = '', decimals = 2, showMinMax = false, labelOffset = 12, padLeft = 23, curveOffset = 0 }) {
  const [active, setActive] = useState(null);
  const t = useT();
  const { months: MONTHS } = useFmt();
  if (!data || data.length < 2) return <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-2)', fontSize: 14 }}>{t('chartInsufficient')}</div>;
  const W = 320, H = 160;
  const pad = { t: 12, r: 14, b: 8, l: padLeft };
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

  const curveL = pad.l + curveOffset;
  const xs = data.map((_, i) => curveL + (i / (data.length - 1)) * (cW - curveOffset));
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
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', display: 'block', overflow: 'visible' }} onClick={() => setActive(null)}>
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
            <text x={pad.l - labelOffset} y={y + 3.5} fontSize="10" textAnchor="end" fill="var(--color-chart-axis)" fontFamily="Geist Mono, monospace">
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
              const dateStr = d ? `${d.getDate()} ${MONTHS[d.getMonth()]}` : labels[i];
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
  const t = useT();
  const currency = useCurrency();
  const { fmtInt } = useFmt();
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
    if (yakitTotal > 0) raw.push({ label: 'fuel', value: yakitTotal, color: '#F4AF2D' });
    Object.entries(evCosts).forEach(([tp, v]) => raw.push({ label: tp, value: v, color: COLORS[tp] || '#a78bfa' }));
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
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-2)' }}>{t('giderDagilimi')}</span>
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
          <text x={70} y={65} textAnchor="middle" fontSize="10" fill="var(--text-dim)" fontFamily="Geist, sans-serif">{t('toplam')}</text>
          <text x={70} y={82} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--text)" fontFamily="Geist Mono, monospace">{fmtInt(Math.round(total))} {currency}</text>
        </svg>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((seg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: seg.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{seg.label === 'fuel' ? t('fuelBenzin') : seg.label === 'Kasko' ? t('eventKasko') : seg.label === 'Sigorta' ? t('eventSigorta') : seg.label === 'Muayene' ? t('eventMuayene') : seg.label === 'Bakım' ? t('eventBakim') : seg.label === 'Diğer' ? t('eventDiger') : seg.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{Math.round(seg.pct * 100)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Aylık Bar Grafik ──────────────────────────────────── */
function AylikBarChart() {
  const store = useStore();
  const currency = useCurrency();
  const { fmt: fmtL, fmtInt: fmtIntL, months: MONTHS_LOC, monthsFull: MONTHS_FULL_LOC } = useFmt();
  const [mode, setMode] = useState('cost');
  const [active, setActive] = useState(null);
  const currentYear = useMemo(() => new Date().getFullYear().toString(), []);
  const [year, setYear] = useState(currentYear);

  const years = useMemo(() => {
    const ys = new Set([currentYear]);
    store.entries.forEach(e => ys.add(e.dateISO.slice(0, 4)));
    return [...ys].sort((a, b) => b.localeCompare(a));
  }, [store.entries, currentYear]);

  const currentMonth = useMemo(() => new Date().getMonth(), []);
  const lastMonthIdx = year === currentYear ? currentMonth : 11;

  const monthData = useMemo(() => (
    Array.from({ length: lastMonthIdx + 1 }, (_, i) => {
      const key = `${year}-${String(i + 1).padStart(2, '0')}`;
      const es = store.entries.filter(e => e.dateISO.startsWith(key));
      return {
        liters: es.reduce((s, e) => s + e.liters, 0),
        spend: es.reduce((s, e) => s + e.liters * e.pricePerL, 0),
      };
    })
  ), [store.entries, year, lastMonthIdx]);

  const values = monthData.map(d => mode === 'L' ? d.liters : d.spend);

  const hasAny = values.some(v => v > 0);
  if (!hasAny) return null;

  const numBars = monthData.length;
  const W = 320, H = 148;
  const pad = { t: 12, r: 10, b: 26, l: 19 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const slot = cW / numBars;
  const barW = Math.max(6, Math.floor(slot * 0.68));

  const maxVal = Math.max(...values);
  const rawStep = maxVal / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
  const step = [1, 2, 2.5, 5, 10].map(f => f * mag).find(s => s >= rawStep) ?? mag * 10;
  const gridMax = Math.ceil(maxVal / step) * step;
  const gridLines = [1, 0.75, 0.5, 0.25].map(frac => ({
    val: gridMax * frac,
    y: pad.t + (1 - frac) * cH,
  }));

  return (
    <div className="chart-card" style={{ marginBottom: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[['cost', currency], ['L', 'L']].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setActive(null); }}
              className={`chip-btn${mode === m ? ' active' : ''}`}
              style={{ padding: '3px 10px', fontSize: 12 }}>{label}</button>
          ))}
        </div>
        <select value={year} onChange={e => { setYear(e.target.value); setActive(null); }}
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-sans)', cursor: 'pointer', outline: 'none' }}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', display: 'block', overflow: 'visible' }} onClick={() => setActive(null)}>
        <line x1={pad.l} y1={pad.t + cH} x2={W - pad.r} y2={pad.t + cH} stroke="var(--border)" strokeWidth="1" />
        {gridLines.map(({ val, y }, i) => (
          <g key={i}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 5" strokeOpacity="0.7" />
            <text x={pad.l - 4} y={y + 3.5} fontSize="9" textAnchor="end" fill="var(--color-chart-axis)" fontFamily="Geist Mono, monospace">
              {mode === 'cost' && val >= 1000 ? `${Math.round(val / 1000)}k` : Math.round(val)}
            </text>
          </g>
        ))}
        {monthData.map((d, i) => {
          const val = mode === 'L' ? d.liters : d.spend;
          const barH = gridMax > 0 ? Math.max(0, (val / gridMax) * cH) : 0;
          const x = pad.l + i * slot + (slot - barW) / 2;
          const y = pad.t + cH - barH;
          const isActive = active === i;
          const hasVal = val > 0;
          return (
            <g key={i} style={{ cursor: hasVal ? 'pointer' : 'default' }}
              onClick={ev => { if (!hasVal) return; ev.stopPropagation(); setActive(active === i ? null : i); }}>
              {hasVal ? (
                <rect x={x} y={y} width={barW} height={barH}
                  rx={Math.min(3, barW / 3)}
                  fill="var(--accent)" opacity={isActive ? 1 : 0.55}
                  style={{ transition: 'opacity 0.15s' }}
                />
              ) : (
                <rect x={x} y={pad.t + cH - 2} width={barW} height={2} rx="1" fill="var(--border)" opacity="0.4" />
              )}
              <text x={x + barW / 2} y={H - 5} fontSize="9" textAnchor="middle"
                fill={isActive ? 'var(--accent)' : 'var(--color-chart-axis)'}
                fontFamily="Geist, sans-serif" fontWeight={isActive ? '600' : '400'}>
                {MONTHS_LOC[i]}
              </text>
              {isActive && hasVal && (() => {
                const ttW = mode === 'cost' ? 88 : 68;
                const ttH = 34;
                const tx = Math.min(Math.max(x + barW / 2 - ttW / 2, pad.l), W - pad.r - ttW);
                const ty = Math.max(y - ttH - 6, pad.t);
                return (
                  <g>
                    <rect x={tx} y={ty} width={ttW} height={ttH} rx="7"
                      fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.4" />
                    <text x={tx + ttW / 2} y={ty + 13} fontSize="11" textAnchor="middle"
                      fill="var(--text-2)" fontFamily="Geist, sans-serif">{MONTHS_FULL_LOC[i]}</text>
                    <text x={tx + ttW / 2} y={ty + 27} fontSize="12" fontWeight="600" textAnchor="middle"
                      fill="var(--accent)" fontFamily="Geist Mono, monospace">
                      {mode === 'L' ? `${fmtL(val, 1)} L` : `${fmtIntL(Math.round(val))} ${currency}`}
                    </text>
                  </g>
                );
              })()}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Dışa Aktarma Seçimi ───────────────────────────────── */
function ExportSheet({ onClose }) {
  const store = useStore();
  const t = useT();

  const exportJSON = () => {
    const blob = new Blob(
      [JSON.stringify({ entries: store.entries, events: store.events || [], prefs: store.prefs || {} }, null, 2)],
      { type: 'application/json' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vitesse-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    onClose();
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    const dolumlar = [...store.entries]
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
      .map(e => ({
        [t('xlsxDate')]: e.dateISO,
        [t('xlsxKm')]: e.km,
        [t('xlsxLiters')]: e.liters,
        [t('xlsxPricePerL')]: e.pricePerL,
        [t('xlsxTotal')]: parseFloat((e.liters * e.pricePerL).toFixed(2)),
        [t('xlsxFullTank')]: e.full ? t('xlsxYes') : t('xlsxNo'),
        [t('xlsxStation')]: e.station || '',
        [t('xlsxNote')]: e.note || '',
      }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dolumlar), t('xlsxSheetFuel'));

    const takvim = (store.events || []).map(e => ({
      [t('xlsxType')]: e.type,
      [t('xlsxStart')]: e.startISO || '',
      [t('xlsxEnd')]: e.endISO || '',
      [t('xlsxCost')]: e.cost ?? '',
      [t('xlsxNote')]: e.note || '',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(takvim.length ? takvim : [{}]), t('xlsxSheetCalendar'));

    XLSX.writeFile(wb, `vitesse-${todayISO()}.xlsx`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal compact" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-head">
          <h2>{t('exportTitle')}</h2>
          <button className="btn-icon" onClick={onClose}><Icon.X /></button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 16px' }}>
          {t('exportFormat')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, cursor: 'pointer', textAlign: 'left' }}
            onClick={exportExcel}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,197,94,0.12)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="8" y1="9" x2="10" y2="9"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>Excel (.xlsx)</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{t('exportExcelSub')}</div>
            </div>
          </button>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, cursor: 'pointer', textAlign: 'left' }}
            onClick={exportJSON}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,0.12)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2l2 4 2-8 2 4h2"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>JSON (.json)</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{t('exportJsonSub')}</div>
            </div>
          </button>
        </div>
        <div style={{ height: 4 }} />
      </div>
    </div>
  );
}

function ImportSheet({ onClose }) {
  const store = useStore();
  const t = useT();
  const importRef = useRef(null);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

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
        setTimeout(() => { setImportSuccess(false); onClose(); }, 2000);
      } catch {
        setImportError(t('importError'));
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal compact" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-head">
          <h2>{t('importTitle')}</h2>
          <button className="btn-icon" onClick={onClose}><Icon.X /></button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 16px' }}>
          {t('importDesc')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, cursor: 'pointer', textAlign: 'left' }}
            onClick={() => importRef.current?.click()}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,0.12)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2l2 4 2-8 2 4h2"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>JSON (.json)</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{t('importJsonSub')}</div>
            </div>
          </button>
        </div>
        <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        {importSuccess && <div style={{ fontSize: 12, color: 'var(--positive)', marginTop: 12 }}>{t('importSuccess')}</div>}
        {importError && <div style={{ fontSize: 12, color: 'var(--negative)', marginTop: 12 }}>{importError}</div>}
        <div style={{ height: 4 }} />
      </div>
    </div>
  );
}

/* ── LPG Hesaplama ─────────────────────────────────────── */
function LpgSheet({ onClose }) {
  const store = useStore();
  const t = useT();
  const currency = useCurrency();
  const { fmt: fmtL } = useFmt();

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

  const [monthlyVal, setMonthlyVal] = useState(() => defaults.monthlyL && defaults.benzinFiyat ? fmt(defaults.monthlyL * defaults.benzinFiyat, 0) : '');
  const [benzinFiyat, setBenzinFiyat] = useState(() => defaults.benzinFiyat ? fmt(defaults.benzinFiyat, 2) : '');
  const [montaj, setMontaj] = useState('');
  const [lpgFiyat, setLpgFiyat] = useState('');
  const [fark, setFark] = useState('18');

  const result = useMemo(() => {
    const mv = parseFloat(monthlyVal.replace(',','.')); const bf = parseFloat(benzinFiyat.replace(',','.'));
    const m = parseFloat(montaj); const lf = parseFloat(lpgFiyat.replace(',','.')); const f = parseFloat(fark) / 100;
    if (!mv || !bf || !m || !lf) return null;
    const ml = mv / bf;
    const saving = ml * bf - ml * (1 + f) * lf;
    if (saving <= 0) return { saving, months: null };
    return { saving, months: Math.ceil(m / saving) };
  }, [monthlyVal, benzinFiyat, montaj, lpgFiyat, fark]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ paddingBottom: 28 }}>
        <div className="modal-handle" />
        <div className="modal-head">
          <h2>{t('lpgTitle')}</h2>
          <button className="btn-icon" onClick={onClose}><Icon.X /></button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div className="label">{t('lpgMonthlySpend')}</div>
          <input className="input" type="number" inputMode="decimal" value={monthlyVal} onChange={e => setMonthlyVal(e.target.value)} placeholder={t('lpgMonthlyPlaceholder')} />
        </div>

        {[
          { label: t('lpgGasolinePrice'), sub: t('lpgGasolineSub'), val: benzinFiyat, set: setBenzinFiyat, placeholder: 'e.g. 65.00' },
          { label: t('lpgInstallCost'), sub: null, val: montaj, set: setMontaj, placeholder: 'e.g. 30000' },
          { label: t('lpgLpgPrice'), sub: null, val: lpgFiyat, set: setLpgFiyat, placeholder: 'e.g. 30.00' },
          { label: t('lpgConsumptionDiff'), sub: t('lpgConsumptionDiffSub'), val: fark, set: setFark, placeholder: '17' },
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
              const amoriStr = yil > 0 && ay > 0 ? `${yil} ${t('lpgYear')} ${ay} ${t('lpgMonth')}` : yil > 0 ? `${yil} ${t('lpgYear')}` : `${ay} ${t('lpgMonth')}`;
              return (<>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 2 }}>{t('lpgMonthlySaving')}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--positive)', fontFamily: 'var(--font-mono)' }}>{fmtL(result.saving, 0)} {currency}</div>
                </div>
                <div style={{ width: 1, height: 36, background: 'var(--text-dim)', alignSelf: 'center', opacity: 0.4 }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 2 }}>{t('lpgYearlySaving')}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--positive)', fontFamily: 'var(--font-mono)' }}>{fmtL(result.saving * 12, 0)} {currency}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{t('lpgBreakEven')}: <b style={{ color: 'var(--text)' }}>{amoriStr}</b></div>
            </>);
            })() : (
              <div style={{ fontSize: 13, color: 'var(--negative)' }}>{t('lpgNotWorthIt')}</div>
            )}
          </div>
          );
        })()}

        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 14, lineHeight: 1.5 }}>
          {t('lpgDisclaimer')}
        </div>
      </div>
    </div>
  );
}

/* ── Özet ──────────────────────────────────────────────── */
/* ── Yakındaki İstasyonlar ─────────────────────────────── */
const makeStationIcon = (isSelected) => L.divIcon({
  html: `<div style="width:${isSelected ? 32 : 26}px;height:${isSelected ? 32 : 26}px;background:${isSelected ? '#3b82f6' : '#6366f1'};border:${isSelected ? '3' : '2'}px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 ${isSelected ? '2px 8px rgba(59,130,246,0.5)' : '1px 4px rgba(0,0,0,0.3)'};font-size:${isSelected ? 14 : 12}px">⛽</div>`,
  iconSize: [isSelected ? 32 : 26, isSelected ? 32 : 26],
  iconAnchor: [isSelected ? 16 : 13, isSelected ? 16 : 13],
  className: '',
});

const makeUserIcon = (heading) => {
  const h = (heading !== null && heading !== undefined && !isNaN(heading)) ? heading : null;
  return L.divIcon({
    html: h !== null
      ? `<svg width="36" height="36" viewBox="0 0 36 36" style="overflow:visible;transform:rotate(${h}deg)">
          <path d="M18 3 L24 20 L18 17 L12 20 Z" fill="rgba(59,130,246,0.75)" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
          <circle cx="18" cy="18" r="8" fill="#3b82f6" stroke="white" stroke-width="2.5"/>
        </svg>`
      : `<div style="position:relative;width:22px;height:22px">
          <div style="position:absolute;inset:0;background:rgba(59,130,246,0.3);border-radius:50%;animation:locatePulse 2s ease-out infinite"></div>
          <div style="position:absolute;inset:5px;background:#3b82f6;border:2.5px solid #fff;border-radius:50%;box-shadow:0 1px 5px rgba(0,0,0,0.4)"></div>
        </div>`,
    iconSize: h !== null ? [36, 36] : [22, 22],
    iconAnchor: h !== null ? [18, 18] : [11, 11],
    className: '',
  });
};

function NearbyStationsSheet({ onClose }) {
  const theme = useContext(ThemeCtx);
  const t = useT();
  const [status, setStatus] = useState('loading');
  const [stations, setStations] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [errMsg, setErrMsg] = useState('');
  const [selected, setSelected] = useState(null);
  const [route, setRoute] = useState(null);
  const [mapTrigger, setMapTrigger] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerMapRef = useRef({});
  const userMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const watchIdRef = useRef(null);
  const headingRef = useRef(null);
  const stationsFetchedRef = useRef(false);
  const retryCountRef = useRef(0);

  const addStationMarkers = (list, lat, lon) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    list.forEach(s => {
      if (markerMapRef.current[s.id]) return;
      const marker = L.marker([s.lat, s.lon], { icon: makeStationIcon(false) }).addTo(map);
      marker.on('click', () => doSelect(s));
      markerMapRef.current[s.id] = marker;
    });
    if (list.length > 0) {
      const pts = [[lat, lon], ...list.slice(0, 8).map(s => [s.lat, s.lon])];
      map.fitBounds(L.latLngBounds(pts), { padding: [48, 48], maxZoom: 15 });
    }
  };

  const doFetch = (lat, lon) => {
    if (stationsFetchedRef.current) return;
    stationsFetchedRef.current = true;
    const query = `[out:json][timeout:10];node[amenity=fuel](around:5000,${lat},${lon});out;`;
    const endpoints = [
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      `https://overpass.kumi.systems/api/interpreter?data=${encodeURIComponent(query)}`,
    ];
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    (async () => {
      for (const url of endpoints) {
        try {
          const r = await fetch(url, { signal: controller.signal });
          const data = await r.json();
          clearTimeout(timer);
          const list = (data.elements || [])
            .map(n => ({ id: n.id, lat: n.lat, lon: n.lon, name: n.tags?.name || n.tags?.brand || n.tags?.operator || t('nearbyFuelStation'), dist: haversineKm(lat, lon, n.lat, n.lon) }))
            .sort((a, b) => a.dist - b.dist).slice(0, 20);
          retryCountRef.current = 0;
          setStations(list);
          setStatus('ok');
          addStationMarkers(list, lat, lon);
          return;
        } catch (e) {
          if (e.name === 'AbortError') break;
        }
      }
      clearTimeout(timer);
      if (retryCountRef.current < 2) {
        retryCountRef.current++;
        setTimeout(() => { stationsFetchedRef.current = false; }, 2000);
      } else {
        setStatus('error');
        setErrMsg(t('nearbyError'));
      }
    })();
  };

  useEffect(() => {
    if (!navigator.geolocation) { setStatus('error'); setErrMsg(t('nearbyLocationError')); return; }

    // 1. Cache → anında harita + istasyon isteği
    try {
      const c = JSON.parse(localStorage.getItem('vitesse_lastPos') || 'null');
      if (c?.lat && c?.lon) {
        setUserPos(c);
        setMapTrigger(c);
        doFetch(c.lat, c.lon);
      }
    } catch {}

    // 2. Hızlı düşük hassasiyetli konum (~500ms, WiFi/GSM)
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lon } }) => {
        const pos = { lat, lon };
        localStorage.setItem('vitesse_lastPos', JSON.stringify(pos));
        setUserPos(pos);
        setMapTrigger(t => t || pos);
        userMarkerRef.current?.setLatLng([lat, lon]);
        doFetch(lat, lon);
      },
      null,
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );

    // 3. Yüksek hassasiyetli GPS (yön oku + hassas konum)
    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords: { latitude: lat, longitude: lon, heading } }) => {
        const pos = { lat, lon };
        localStorage.setItem('vitesse_lastPos', JSON.stringify(pos));
        if (heading !== null && !isNaN(heading)) {
          headingRef.current = heading;
          userMarkerRef.current?.setIcon(makeUserIcon(heading));
        }
        setUserPos(pos);
        setMapTrigger(t => t || pos);
        userMarkerRef.current?.setLatLng([lat, lon]);
        doFetch(lat, lon);
      },
      () => { if (!stationsFetchedRef.current) { setStatus('error'); setErrMsg(t('nearbyLocationDenied')); } },
      { enableHighAccuracy: true }
    );

    const handleOrientation = (e) => {
      const hdg = e.webkitCompassHeading ?? (e.alpha !== null ? (360 - e.alpha) % 360 : null);
      if (hdg !== null) {
        headingRef.current = hdg;
        userMarkerRef.current?.setIcon(makeUserIcon(hdg));
      }
    };
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  // Harita: mapTrigger set olduğu anda (cache veya GPS) bir kez başlatılır
  useEffect(() => {
    if (!mapRef.current || !mapTrigger || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false })
      .setView([mapTrigger.lat, mapTrigger.lon], 14);
    L.tileLayer(
      theme === 'dark'
        ? 'https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=u6PrguMf5GX90KpQ2zCR'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 19 }
    ).addTo(map);

    const userMarker = L.marker([mapTrigger.lat, mapTrigger.lon], { icon: makeUserIcon(headingRef.current), zIndexOffset: 500 }).addTo(map);
    userMarkerRef.current = userMarker;
    mapInstanceRef.current = map;
    setTimeout(() => map.invalidateSize(), 150);

    return () => { map.remove(); mapInstanceRef.current = null; markerMapRef.current = {}; userMarkerRef.current = null; };
  }, [mapTrigger, theme]);

  const clearRouteLayer = () => {
    if (routeLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
  };

  const doSelect = (s) => {
    Object.values(markerMapRef.current).forEach(m => m.setIcon(makeStationIcon(false)));
    markerMapRef.current[s.id]?.setIcon(makeStationIcon(true));
    clearRouteLayer();
    setRoute(null);
    setSelected(s);
    mapInstanceRef.current?.panTo([s.lat, s.lon]);
  };

  const drawRoute = (s) => {
    if (!userPos || !mapInstanceRef.current) return;
    setRoute('loading');
    fetch(`https://router.project-osrm.org/route/v1/driving/${userPos.lon},${userPos.lat};${s.lon},${s.lat}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then(data => {
        const leg = data.routes?.[0];
        if (!leg) { setRoute('error'); return; }
        clearRouteLayer();
        const outline = L.geoJSON(leg.geometry, { style: { color: '#fff', weight: 9, opacity: 0.55, lineJoin: 'round', lineCap: 'round' } });
        const line   = L.geoJSON(leg.geometry, { style: { color: '#3b82f6', weight: 5, opacity: 1, lineJoin: 'round', lineCap: 'round' } });
        const group = L.layerGroup([outline, line]).addTo(mapInstanceRef.current);
        routeLayerRef.current = group;
        mapInstanceRef.current.fitBounds(line.getBounds(), { padding: [48, 48] });
        setRoute({ distKm: leg.distance / 1000, durationMin: Math.round(leg.duration / 60) });
      })
      .catch(() => setRoute('error'));
  };

  const clearRoute = () => { clearRouteLayer(); setRoute(null); };
  const distLabel = (s) => s.dist < 1 ? `${Math.round(s.dist * 1000)} m` : `${s.dist.toFixed(1)} km`;

  const mapBtnStyle = { position: 'absolute', zIndex: 999, width: 40, height: 40, borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', height: '92%', background: 'var(--bg-2)', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderBottomLeftRadius: 46, borderBottomRightRadius: 46, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <div style={{ padding: '14px 20px 10px', flexShrink: 0 }}>
          <div style={{ width: 38, height: 4, background: 'var(--text-dim)', borderRadius: 2, margin: '0 auto 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text)' }}>{t('nearbyTitle')}</h2>
              {status === 'ok' && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1 }}>{stations.length} {t('nearbyCount')}</div>}
            </div>
            <button className="btn-icon" onClick={onClose}><Icon.X /></button>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {status === 'loading' && !mapTrigger && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', fontSize: 14, background: 'var(--bg)' }}>
              {t('nearbyLoading')}
            </div>
          )}
          {status === 'loading' && mapTrigger && (
            <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 999, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 14px', fontSize: 12, color: 'var(--text-2)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', whiteSpace: 'nowrap' }}>
              {t('nearbyLoadingStations')}
            </div>
          )}
          {status === 'error' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 32px', textAlign: 'center', background: 'var(--bg)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--negative)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize: 14, color: 'var(--negative)' }}>{errMsg}</span>
              <button className="btn btn-accent" style={{ fontSize: 13, padding: '9px 20px' }} onClick={() => { retryCountRef.current = 0; stationsFetchedRef.current = false; setStatus('loading'); setErrMsg(''); }}>{t('nearbyRetry')}</button>
            </div>
          )}
          <div ref={mapRef} className={theme === 'dark' ? 'map-dark' : ''} style={{ width: '100%', height: '100%' }} />

          {mapTrigger && (
            <>
              {/* Zoom butonları */}
              <div style={{ position: 'absolute', right: 12, bottom: 12, zIndex: 999, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button style={mapBtnStyle} onClick={() => mapInstanceRef.current?.zoomIn()}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <button style={mapBtnStyle} onClick={() => mapInstanceRef.current?.zoomOut()}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
              {/* Konumuma Dön */}
              <button style={{ ...mapBtnStyle, bottom: 12, left: 12 }} onClick={() => mapInstanceRef.current?.setView([userPos.lat, userPos.lon], 15)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
              </button>
            </>
          )}
        </div>

        {status === 'ok' && stations.length > 0 && (
          <div style={{ flexShrink: 0, display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 16px', scrollbarWidth: 'none' }}>
            {stations.map(s => {
              const sel = selected?.id === s.id;
              return (
                <button key={s.id} onClick={() => doSelect(s)}
                  style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '8px 13px', background: sel ? '#3b82f6' : 'var(--surface)', border: `1.5px solid ${sel ? '#3b82f6' : 'var(--border)'}`, borderRadius: 12, color: sel ? '#fff' : 'var(--text)', cursor: 'pointer', transition: 'all 0.15s', boxShadow: sel ? '0 2px 8px rgba(59,130,246,0.35)' : 'none' }}>
                  <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>⛽ {s.name}</span>
                  <span style={{ fontSize: 11, opacity: 0.72, whiteSpace: 'nowrap' }}>{distLabel(s)}</span>
                </button>
              );
            })}
          </div>
        )}

        {selected && (
          <div style={{ flexShrink: 0, padding: '12px 18px 18px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: route && route !== 'loading' && route !== 'error' ? 10 : 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon.Fuel s={17} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1 }}>
                  {route && route !== 'loading' && route !== 'error'
                    ? `${route.distKm.toFixed(1)} km · ~${route.durationMin} min`
                    : t('nearbyDirectionsHint')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  style={{ padding: '7px 10px', fontSize: 12, background: 'none', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lon}&travelmode=driving`, '_blank', 'noopener')}
                >
                  <Icon.MapPin s={13} /> Maps
                </button>
                {route === 'loading'
                  ? <span style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center' }}>{t('nearbyCalculating')}</span>
                  : route === 'error'
                  ? <button className="btn btn-accent" style={{ padding: '8px 13px', fontSize: 13 }} onClick={() => drawRoute(selected)}>{t('nearbyRetry')}</button>
                  : route
                  ? <button style={{ padding: '7px 12px', fontSize: 12, background: 'none', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-2)', cursor: 'pointer' }} onClick={clearRoute}>{t('nearbyCloseRoute')}</button>
                  : <button className="btn btn-accent" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => drawRoute(selected)}>{t('nearbyGetDirections')}</button>
                }
              </div>
            </div>
            {route && route !== 'loading' && route !== 'error' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, padding: '9px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 2 }}>{t('nearbyDistance')}</div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{route.distKm.toFixed(1)} km</div>
                </div>
                <div style={{ flex: 1, padding: '9px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 2 }}>{t('nearbyDuration')}</div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{route.durationMin} min</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OzetScreen({ onOpenNearby }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [consFilter, setConsFilter] = useState('all');
  const store = useStore();
  const currency = useCurrency();
  const theme = useTheme();
  const t = useT();
  const { fmt: fmtL, fmtInt: fmtIntL } = useFmt();
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
  const monthlyAvg = useMemo(() => {
    if (!store.entries.length) return null;
    const byMonth = {};
    store.entries.forEach(e => {
      const m = e.dateISO.slice(0, 7);
      byMonth[m] = (byMonth[m] || 0) + e.liters * e.pricePerL;
    });
    const vals = Object.values(byMonth);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  }, [store.entries]);
  const animAvgCons = useCountUp(avgCons ?? 0);
  const animMonthSpend = useCountUp(thisMonthSpend);
  const animTlPerKm = useCountUp(tlPerKm ?? 0);
  const animLastSpend = useCountUp(last ? last.liters * last.pricePerL : 0);
  const animYearSpend = useCountUp(yearSpend);

  return (
    <div>
      <div className="title-row">
        <div className="title-block">
          <h1>{t('ozetTitle')}</h1>
          <div className="sub">
            {store.prefs?.vehicleModel
              ? `${store.prefs.vehicleModel} · ${myEntries.length} ${t('ozetSubFills')}`
              : `${myEntries.length} ${t('ozetSubFills')}`}
          </div>
        </div>
      </div>

      {myEntries.length === 0 ? (
        <EmptyState
          icon={<Icon.Fuel s={28} />}
          title={t('ozetNoEntries')}
          sub={t('ozetNoEntriesSub')}
          action={<><Icon.Plus s={14} /> {t('ozetAddFuel')}</>}
          onAction={() => document.querySelector('.fab')?.click()}
        />
      ) : <>

      <div className="hero">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <span className="eyebrow">{t('ozetAvgConsumption')}</span>
            <div className="hero-big-row">
              <span className="hero-big">{avgCons !== null ? fmtL(animAvgCons, 1) : '—'}</span>
              <span className="hero-unit">L/100km</span>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'flex-end', marginBottom: 3, marginLeft: 6 }}>
                <button onClick={() => setInfoOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-2)', display: 'flex', alignItems: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </button>
                {infoOpen && <>
                  <div onClick={() => setInfoOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
                  <div style={{ position: 'absolute', left: 0, top: 22, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--text-2)', whiteSpace: 'nowrap', zIndex: 10, transform: 'translateX(-30%)' }}>{consPts.length >= 2 ? `${t('ozetInfoFull')} ${consPts.length} ${t('ozetInfoFull2')}` : t('ozetInfoMin')}</div>
                </>}
              </div>
            </div>
          </div>
          <button onClick={onOpenNearby} style={{ flexShrink: 0, background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'var(--surface-2)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1.5px solid var(--border)', cursor: 'pointer', padding: '10px 12px', color: 'var(--text)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, fontSize: 11, borderRadius: 16, fontWeight: 500, marginTop: 2 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(0,0,0,0.25)', color: 'var(--accent-ink)' }}>
              <Icon.MapPin s={19} />
            </div>
            {t('ozetStations')}
          </button>
        </div>

        <div className="tank-row">
          <span className="label">{t('ozetLastPaid')}</span>
          <span className="value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {lastPrice ? <><span className="num">{fmtL(lastPrice, 2)}</span><span className="u">{currency}/L</span></> : <span className="num">—</span>}
            {priceDiff !== null && (
              <span style={{ fontSize: 12, fontWeight: 600, color: priceDiff > 0 ? 'var(--negative)' : 'var(--positive)' }}>
                {priceDiff > 0 ? '↑' : '↓'} {fmtL(Math.abs(priceDiff), 2)}
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="top">
            <span className="label">{t('ozetThisMonthSpend')}</span>
            <span className="icon"><Icon.Coin /></span>
          </div>
          <div className="value">{fmtL(animMonthSpend, 2)}<span className="u">{currency}</span></div>
          <div className="sub">{thisMonth.length} {t('gecmisFillsCount')} · {fmtL(thisMonth.reduce((s, e) => s + e.liters, 0), 1)} L</div>
        </div>
        <div className="stat-card">
          <div className="top">
            <span className="label">{t('ozetPerKm')}</span>
            <span className="icon"><Icon.Gauge /></span>
          </div>
          <div className="value">{tlPerKm !== null ? fmtL(animTlPerKm, 2) : '—'}<span className="u">{currency}/km</span></div>
          <div className="sub">{avgKmPerFill !== null ? `${t('ozetPerFillAvg')} ${fmtIntL(avgKmPerFill)} ${t('ozetKmPerFill')}` : t('ozetAllTime')}</div>
        </div>
        <div className="stat-card">
          <div className="top">
            <span className="label">{t('ozetLastFillup')}</span>
            <span className="icon"><Icon.Receipt /></span>
          </div>
          <div className="value">{last ? fmtL(animLastSpend, 2) : '—'}<span className="u">{currency}</span></div>
          <div className="sub">{last ? ((() => { const d = Math.round((new Date() - parseISO(last.dateISO)) / 86400000); const lbl = d === 0 ? t('ozetToday') : d === 1 ? t('ozetYesterday') : d + ' ' + t('ozetDaysAgo'); return lbl + ' · ' + fmtL(last.liters, 1) + ' L' + (last.station ? ' · ' + last.station : ''); })()) : '—'}</div>
        </div>
        <div className="stat-card">
          <div className="top">
            <span className="label">{t('ozetThisYearSpend')}</span>
            <span className="icon"><Icon.Sparkle /></span>
          </div>
          <div className="value">{fmtL(animYearSpend, 0)}<span className="u">{currency}</span></div>
          <div className="sub">{monthlyAvg !== null ? `${t('ozetAvgPerMonth')} ${fmtL(monthlyAvg, 0)} ${t('ozetPerMonth')}` : `${fmtL(yearEntries.reduce((s, e) => s + e.liters, 0), 1)} L`}</div>
        </div>
      </div>

      {consPts.length >= 2 &&
      <>
          <div className="section-title">
            <h3>{t('ozetConsumptionTrend')}</h3>
            <div style={{ display: 'flex', gap: 4 }}>
              {[{ key: 'all', label: t('ozetFilterAll') }, { key: '3month', label: t('ozetFilter3m') }, { key: 'year', label: t('ozetFilterYear') }].map(p => (
                <button key={p.key} className={`filter-pill${consFilter === p.key ? ' active' : ''}`} onClick={() => setConsFilter(p.key)}>{p.label}</button>
              ))}
            </div>
          </div>
          {visibleConsPts.length >= 2
            ? <div className="chart-card"><AreaChart data={visibleConsPts.map((p) => p.consumption)} labels={visibleConsPts.map((p) => p.dateISO)} unit="L/100km" decimals={1} showMinMax={!!(store.prefs && store.prefs.showMinMax)} /></div>
            : <div style={{ margin: '0 18px', padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, textAlign: 'center', fontSize: 13, color: 'var(--text-2)' }}>{t('ozetInsufficientData')}</div>
          }
        </>
      }

      <GiderDagilimi />

      {((store.events || []).length > 0 || kmReminders.length > 0) && <>
        <div className="section-title" style={{ marginTop: 0 }}>
          <h3>{t('ozetReminders')}</h3>
          {currentKm && kmReminders.length > 0 && <span className="meta">{fmtIntL(currentKm)} km</span>}
        </div>
        {upcoming.length === 0 && expired.length === 0 && kmReminders.length === 0 ? (
          <div style={{ margin: '0 18px' }}>
            <EmptyState
              icon={<Icon.Calendar s={28} />}
              title={t('ozetNoReminders')}
              sub={t('ozetNoRemindersSub')}
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
                        <div className="name">{r ? r.label : (e ? e.type : t('eventBakim'))}</div>
                        <div className="date">{r && `${t('ozetEvery')} ${fmtIntL(r.intervalKm)} ${t('ozetKm')}`}{r && e && ' · '}{e && fmtDate(e.endISO)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      {r && (r.remaining !== null
                        ? <span className={`remaining ${kmCls}`}>{kmOverdue ? `${fmtIntL(Math.abs(r.remaining))} ${t('ozetKmOverdue')}` : `${fmtIntL(r.remaining)} ${t('ozetKmLeft')}`}</span>
                        : <span className="remaining">—</span>
                      )}
                      {e && <span className={`remaining ${evCls}`}>{evExpired ? `${Math.abs(e.days)} ${t('ozetDaysOverdue')}` : `${e.days} ${t('ozetDays')}`}</span>}
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
                      <div className="name">{e.type === 'Kasko' ? t('eventKasko') : e.type === 'Sigorta' ? t('eventSigorta') : e.type === 'Muayene' ? t('eventMuayene') : e.type === 'Bakım' ? t('eventBakim') : e.type === 'Diğer' ? t('eventDiger') : e.type}</div>
                      <div className="date">{fmtDate(e.endISO)}</div>
                    </div>
                  </div>
                  <span className={`remaining ${expired ? 'expired' : e.days <= 30 ? 'warn' : 'ok'}`}>{expired ? `${Math.abs(e.days)} ${t('ozetDaysOverdue')}` : `${e.days} ${t('ozetDays')}`}</span>
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
  const t = useT();
  const currency = useCurrency();
  const { fmt: fmtL, fmtInt: fmtIntL, dayMon: dayMonL, monthLabel: monthLabelL } = useFmt();
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
    const now = new Date();
    const d3 = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const cutoff = `${d3.getFullYear()}-${String(d3.getMonth() + 1).padStart(2, '0')}-${String(d3.getDate()).padStart(2, '0')}`;
    const buildStats = (entries) => {
      const map = {};
      entries.forEach((e) => {
        if (!e.station) return;
        if (!map[e.station]) map[e.station] = { total: 0, liters: 0, count: 0 };
        map[e.station].total += e.liters * e.pricePerL;
        map[e.station].liters += e.liters;
        map[e.station].count += 1;
      });
      return Object.entries(map)
        .map(([name, s]) => ({ name, avg: s.liters > 0 ? s.total / s.liters : 0, count: s.count }))
        .sort((a, b) => a.avg - b.avg);
    };
    const recent = buildStats(store.entries.filter(e => e.dateISO >= cutoff));
    if (recent.length >= 1) return { stats: recent, label: t('last3Months') };
    return null;
  }, [store.entries, t]);

  const timePills = [
    { key: 'all', label: t('gecmisFilterAll') },
    { key: 'month', label: t('gecmisFilterMonth') },
    { key: '3month', label: t('gecmisFilter3m') },
    { key: 'year', label: t('gecmisFilterYear') },
  ];

  return (
    <div>
      <div style={{ padding: '20px 18px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="title-block" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1>{t('gecmisTitle')}</h1>
          </div>
          {store.entries.length >= 2 && (store.prefs?.fuelType || 'Benzin') === 'Benzin' && (
            <button className="btn-accent" style={{ marginTop: 4 }} onClick={onOpenLpg}>{t('gecmisLpgBtn')}</button>
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
            <h3>{t('gecmisPriceHistory')}</h3>
            <span className="meta">{timeFilter === 'all' && priceHist.length >= 2 ? `${fmtDate(priceHist[0].dateISO)} – ${fmtDate(priceHist[priceHist.length - 1].dateISO)}` : { '3month': t('gecmisDateRange3m'), year: t('gecmisFilterYear') }[timeFilter]}</span>
          </div>
          <div className="chart-card">
            <AreaChart data={priceHist.map((p) => p.pricePerL)} labels={priceHist.map((p) => p.dateISO)} unit={`${currency}/L`} showMinMax={!!(store.prefs && store.prefs.showMinMax)} labelOffset={-2} padLeft={19} curveOffset={10} />
          </div>
        </>
      }

      {store.entries.length > 0 && (
        <>
          <div className="section-title">
            <h3>{t('gecmisMonthlyConsumption')}</h3>
          </div>
          <AylikBarChart />
        </>
      )}

      {stationStats !== null && (
        <>
          <div className="section-title">
            <h3>{t('gecmisStationComparison')}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="meta">{stationStats.label}</span>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <button onClick={() => setStationInfoOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-2)', display: 'flex', alignItems: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </button>
                {stationInfoOpen && <>
                  <div onClick={() => setStationInfoOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
                  <div style={{ position: 'absolute', right: 0, top: 20, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'var(--text-2)', whiteSpace: 'nowrap', zIndex: 10 }}>{t('gecmisStationInfoTooltip')}</div>
                </>}
              </div>
            </div>
          </div>
          <div style={{ margin: '0 18px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {stationStats.stats.map((s, i) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  {i === 0 && <span style={{ fontSize: 10, background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 5, padding: '1px 5px', fontWeight: 600, letterSpacing: '0.02em' }}>{t('gecmisStationCheap')}</span>}
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{s.count}×</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>{fmtL(s.avg, 2)} {currency}/L</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section-title">
        <h3>{{ all: t('gecmisAllFills'), month: t('gecmisMonthFills'), '3month': t('gecmis3mFills'), year: t('gecmisYearFills') }[timeFilter]}</h3>
        {filtered.length > 0 && (() => {
          const totalSpend = filtered.reduce((s, e) => s + e.liters * e.pricePerL, 0);
          const totalL = filtered.reduce((s, e) => s + e.liters, 0);
          return <span className="meta">{fmtL(totalSpend, 0)} {currency} · {fmtL(totalL, 1)} L</span>;
        })()}
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Icon.Fuel s={28} />}
          title={timeFilter === 'all' ? t('gecmisNoEntries') : t('gecmisNoPeriod')}
          sub={timeFilter === 'all' ? t('gecmisNoEntriesSub') : t('gecmisNoPeriodSub')}
          action={timeFilter === 'all' ? <><Icon.Plus s={14} /> {t('ozetAddFuel')}</> : null}
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
              <span className="month">{monthLabelL(key)}</span>
              <span className="count">{(() => {
                const spend = entries.reduce((s, e) => s + e.liters * e.pricePerL, 0);
                const cons = entries.map(e => consumptionMap.get(e.id)).filter(v => v !== undefined);
                const avgCons = cons.length ? cons.reduce((s, v) => s + v, 0) / cons.length : null;
                return `${entries.length} ${t('gecmisFillsCount')} · ${fmtL(spend, 0)} ${currency}${avgCons !== null ? ` · ${fmtL(avgCons, 1)} L/100` : ''}`;
              })()}</span>
            </div>
            {entries.map((e) => {
              const dm = dayMonL(e.dateISO);
              return (
                <SwipeableEntry key={e.id} onDelete={() => confirm(t('gecmisDeleteMsg'), () => store.deleteEntry(e.id))}>
                  <div className="entry">
                    <div className="entry-date">
                      <div className="day">{dm.d}</div>
                      <div className="mon">{dm.m}</div>
                    </div>
                    <div className="entry-mid">
                      <div className="entry-top">
                        <span className="liters">{fmtL(e.liters, 1)} L</span>
                        <span className={`entry-chip ${e.full ? 'full' : 'partial'}`}>{e.full ? t('gecmisFillFull') : t('gecmisFillPartial')}</span>
                      </div>
                      <div className="entry-bot">
                        <span className="price">{fmtL(e.pricePerL, 2)} {currency}/L</span>
                        {consumptionMap.has(e.id) && <><span className="sep">·</span><span>{fmtL(consumptionMap.get(e.id), 1)} L/100km</span></>}
                      </div>
                      <div className="entry-bot" style={{ marginTop: 1 }}>
                        <span>{fmtIntL(e.km)} km</span>
                        {e.station && <><span className="sep">·</span><span>{e.station}</span></>}
                      </div>
                      {e.note && <div className="entry-bot" style={{ marginTop: 1, fontStyle: 'italic', color: 'var(--text-dim)' }}>{e.note}</div>}
                    </div>
                    <div className="entry-right">
                      <div className="total">{fmtL(e.liters * e.pricePerL, 2)}<span className="u">{currency}</span></div>
                      <div className="icons">
                        <button className="btn-icon" onClick={() => onEdit(e)}><Icon.Pencil /></button>
                        <button className="btn-icon" onClick={() => confirm(t('gecmisDeleteMsg'), () => store.deleteEntry(e.id))}><Icon.Trash /></button>
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
  const t = useT();
  const currency = useCurrency();
  const { fmt: fmtL, fmtInt: fmtIntL } = useFmt();
  const allEvents = (store.events || []).map((e) => ({ ...e, days: daysUntil(e.endISO) }));
  const upcoming = allEvents.filter((e) => e.days >= 0).sort((a, b) => a.days - b.days);
  const expired = allEvents.filter((e) => e.days < 0).sort((a, b) => b.days - a.days);
  const kmReminders = ((store.prefs || {}).kmReminders || []);
  const latestKm = store.entries.length ? Math.max(...store.entries.map(e => e.km)) : 0;
  const kmAnyOverdue = kmReminders.some(r => (r.lastKm + r.intervalKm) - latestKm < 0);

  const badge = (days) => {
    if (days < 0) return { label: `${Math.abs(days)} ${t('ozetDaysOverdue')}`, cls: 'expired' };
    if (days === 0) return { label: t('takvimToday'), cls: 'warn' };
    if (days <= 30) return { label: `${days} ${t('ozetDays')}`, cls: 'warn' };
    return { label: `${days} ${t('ozetDays')}`, cls: 'ok' };
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
    const progressPct = (() => {
      if (!e.startISO || !e.endISO) return null;
      const startD = parseISO(e.startISO);
      const endD = parseISO(e.endISO);
      if (!startD || !endD) return null;
      const total = endD.getTime() - startD.getTime();
      if (total <= 0) return null;
      const elapsed = Date.now() - startD.getTime();
      return Math.min(100, Math.max(0, (elapsed / total) * 100));
    })();
    const barColor = isExpired ? 'var(--negative)' : isWarn ? '#eab308' : 'var(--accent)';
    return (
      <SwipeableEntry key={e.id} onDelete={() => confirm(t('takvimDeleteMsg'), () => store.deleteEvent(e.id))}>
        <div className={`upcoming-row${isExpired ? ' expired' : ''}`} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="left">
              <div className="iconbox">
                {typeIcon(e.type)}
              </div>
              <div>
                <div className="name">{e.type === 'Kasko' ? t('eventKasko') : e.type === 'Sigorta' ? t('eventSigorta') : e.type === 'Muayene' ? t('eventMuayene') : e.type === 'Bakım' ? t('eventBakim') : e.type === 'Diğer' ? t('eventDiger') : e.type}</div>
                <div className="date">
                  {e.startISO && <span style={{ color: 'var(--text-2)' }}>{fmtDate(e.startISO)} → </span>}
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{fmtDate(e.endISO)}</span>
                </div>
                {(e.cost || e.note || e.serviceKm) && <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {e.serviceKm && <span style={{ fontFamily: 'var(--font-mono)' }}>{fmtIntL(e.serviceKm)} km</span>}
                  {e.serviceKm && (e.cost || e.note) && <span style={{ color: 'var(--text-dim)' }}>·</span>}
                  {e.cost && <span style={{ fontFamily: 'var(--font-mono)' }}>{fmtL(e.cost, 2)} {currency}</span>}
                  {e.cost && e.note && <span style={{ color: 'var(--text-dim)' }}>·</span>}
                  {e.note && <span style={{ fontStyle: 'italic' }}>{e.note}</span>}
                </div>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className={`remaining ${b.cls}`}>{b.label}</span>
              <button className="btn-icon" onClick={() => onEditEvent(e)}><Icon.Pencil /></button>
              <button className="btn-icon" onClick={() => confirm(t('takvimDeleteMsg'), () => store.deleteEvent(e.id))}><Icon.Trash /></button>
            </div>
          </div>
          {progressPct !== null && (
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: barColor, borderRadius: 99, transition: 'width 0.4s ease' }} />
            </div>
          )}
        </div>
      </SwipeableEntry>
    );
  };

  return (
    <div>
      <div className="title-row">
        <div className="title-block">
          <h1>{t('takvimTitle')}</h1>
        </div>
        <button className="btn btn-accent" onClick={onAddEvent}><Icon.Plus s={14} /> {t('takvimAdd')}</button>
      </div>

      {allEvents.length === 0 ? (
        <div className="upcoming-list">
          <EmptyState
            icon={<Icon.Calendar s={28} />}
            title={t('takvimNoEvents')}
            sub={t('takvimNoEventsSub')}
            action={<><Icon.Plus s={14} /> {t('takvimAddEvent')}</>}
            onAction={onAddEvent}
          />
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <div className="section-title"><h3>{t('takvimOngoing')}</h3></div>
              <div className="upcoming-list">{upcoming.map(renderCard)}</div>
            </>
          )}
          {expired.length > 0 && (
            <>
              <div className="section-title" style={{ marginTop: upcoming.length > 0 ? 14 : 4 }}><h3>{t('takvimExpired')}</h3></div>
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
  const t = useT();
  const { fmtInt: fmtIntL } = useFmt();
  const reminders = (store.prefs || {}).kmReminders || [];

  const remove = (id) => {
    store.setPref('kmReminders', reminders.filter((r) => r.id !== id));
  };

  return (
    <>
      <div className="section-title">
        <h3>{t('kmRemindersTitle')}</h3>
        <button className="btn-accent" onClick={onAdd}>{t('kmReminderAdd')}</button>
      </div>
      {reminders.length > 0 && (
        <div className="row-list" style={{ marginBottom: 8 }}>
          {reminders.map((r) => (
            <div key={r.id} className="row">
              <div className="icon"><Icon.Wrench s={16} /></div>
              <div className="meta">
                <h5>{r.label}</h5>
                <p>{t('kmReminderEvery')} {fmtIntL(r.intervalKm)} km · {t('kmReminderLast')} {fmtIntL(r.lastKm)} km · {t('kmReminderNext')} {fmtIntL(r.lastKm + r.intervalKm)} km</p>
              </div>
              <button className="btn-icon" onClick={() => onEdit(r)}><Icon.Pencil s={14} /></button>
              <button className="btn-icon" onClick={() => confirm(`"${r.label}" ${t('kmRemindersTitle').toLowerCase()} silinecek.`, () => remove(r.id))}><Icon.Trash s={14} /></button>
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
  const t = useT();
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
    if (!label.trim()) errs.label = t('kmFormLabelRequired');
    if (!intervalKm || parseInt(intervalKm) <= 0) errs.intervalKm = t('kmFormIntervalRequired');
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
          <h2>{isEdit ? t('kmFormEditTitle') : t('kmFormNewTitle')}</h2>
          <button className="btn-icon" onClick={onClose}><Icon.X /></button>
        </div>
        <div className="label">{t('kmFormLabel')}</div>
        <input className="input" placeholder={t('kmFormLabelPlaceholder')} value={label} onChange={(e) => { setLabel(e.target.value); setFormErrors((p) => ({ ...p, label: undefined })); }} style={formErrors.label ? { borderColor: 'var(--negative)' } : {}} autoFocus />
        {formErrors.label && <div className="field-error">{formErrors.label}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          <div>
            <div className="label">{t('kmFormInterval')}</div>
            <input className="input mono" inputMode="numeric" placeholder="10000" value={intervalKm} onChange={(e) => { setIntervalKm(e.target.value.replace(/[^0-9]/g, '')); setFormErrors((p) => ({ ...p, intervalKm: undefined })); }} style={formErrors.intervalKm ? { borderColor: 'var(--negative)' } : {}} />
            {formErrors.intervalKm && <div className="field-error">{formErrors.intervalKm}</div>}
          </div>
          <div>
            <div className="label">{t('kmFormLastDone')}</div>
            <input className="input mono" inputMode="numeric" placeholder={String(lastKmDefault || 0)} value={lastKm} onChange={(e) => setLastKm(e.target.value.replace(/[^0-9]/g, ''))} />
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 14 }} onClick={save}>{isEdit ? t('kmFormUpdate') : t('kmFormSave')}</button>
      </div>
    </div>
  );
}

/* ── Ayarlar ───────────────────────────────────────────── */
function GoogleDriveSection() {
  const drive = useDrive();
  const store = useStore();
  const t = useT();
  const [restoreConfirm, setRestoreConfirm] = useState(false);

  const handleRestore = async () => {
    const data = await drive.restore();
    if (data) { store.loadData(data); setRestoreConfirm(false); }
  };

  const fmtBackupTime = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  return (
    <>
      <div className="section-title"><h3>{t('driveTitle')}</h3></div>
      <div className="row-list">
        {drive.isSignedIn ? (
          <>
            <div className="row">
              <div className="icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div className="meta">
                <h5>{drive.email}</h5>
                <p>{drive.backupStatus === 'saving' ? t('driveSaving') : drive.backupStatus === 'error' ? t('driveError') : drive.lastBackup ? `${t('driveLastBackup')} ${fmtBackupTime(drive.lastBackup)}` : t('driveNoBackup')}</p>
              </div>
              {drive.backupStatus === 'saving' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
            </div>
            {!restoreConfirm ? (
              <div className="row" style={{ cursor: 'pointer' }} onClick={() => setRestoreConfirm(true)}>
                <div className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></div>
                <div className="meta"><h5>{t('driveRestore')}</h5><p>{t('driveRestoreSub')}</p></div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-dim)', flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
              </div>
            ) : (
              <div className="row">
                <div className="meta"><h5>{t('driveRestoreConfirmTitle')}</h5><p>{t('driveRestoreConfirmSub')}</p></div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setRestoreConfirm(false)}>{t('cancel')}</button>
                  <button className="btn btn-accent" style={{ padding: '6px 12px', fontSize: 12 }} onClick={handleRestore}>{t('driveRestoreBtn')}</button>
                </div>
              </div>
            )}
            <div className="row" style={{ cursor: 'pointer' }} onClick={drive.signOut}>
              <div className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div>
              <div className="meta"><h5>{t('driveDisconnect')}</h5><p>{t('driveDisconnectSub')}</p></div>
            </div>
          </>
        ) : (
          <div className="row" style={{ cursor: 'pointer' }} onClick={drive.signIn}>
            <div className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg></div>
            <div className="meta"><h5>{t('driveConnect')}</h5><p>{t('driveConnectSub')}</p></div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-dim)', flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
          </div>
        )}
      </div>
    </>
  );
}

function AyarlarScreen({ theme, setTheme, lang, setLang, currency, setCurrency, onGizlilik, onAddKmReminder, onEditKmReminder, onOpenExport, onOpenFeedback }) {
  const store = useStore();
  const drive = useDrive();
  const confirm = useConfirm();
  const t = useT();
  const [importOpen, setImportOpen] = useState(false);
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

  return (
    <div>
      <div className="title-row">
        <div className="title-block">
          <h1>{t('ayarlarTitle')}</h1>
        </div>
      </div>

      <div className="section-title"><h3>{t('ayarlarVehicle')}</h3></div>
      <div style={{ padding: '0 22px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {[
            { key: 'vehicleModel', label: t('ayarlarModel'), placeholder: t('ayarlarModelPlaceholder') },
            { key: 'tankCapacity', label: t('ayarlarTank'), placeholder: t('ayarlarTankPlaceholder'), inputMode: 'numeric' },
          ].map(({ key, label, placeholder, inputMode }, i) => (
            <div key={key} style={{ padding: '10px 16px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--text-2)', minWidth: 100, flexShrink: 0 }}>{label}</div>
              <input
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-sans)', textAlign: 'right' }}
                placeholder={placeholder}
                inputMode={inputMode}
                value={(store.prefs && store.prefs[key]) || ''}
                onChange={(e) => store.setPref(key, inputMode === 'numeric' ? e.target.value.replace(/[^0-9]/g, '') : e.target.value)}
              />
            </div>
          ))}
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--text-2)', minWidth: 100, flexShrink: 0 }}>{t('ayarlarFuelType')}</div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
              {[['Benzin', t('fuelBenzin')], ['Dizel', t('fuelDizel')], ['LPG', t('fuelLPG')]].map(([ft, ftLabel]) => {
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
                  >{ftLabel}</button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="section-title"><h3>{t('ayarlarLanguage')}</h3></div>
      <div style={{ padding: '0 22px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '8px 10px', display: 'flex', gap: 6 }}>
          {[['tr', '🇹🇷', 'Türkçe'], ['en', '🇬🇧', 'English']].map(([val, flag, label]) => (
            <button key={val} className={`chip-btn ${lang === val ? 'active' : ''}`} onClick={() => setLang(val)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {flag} {label}
            </button>
          ))}
        </div>
      </div>

      <div className="section-title"><h3>{t('ayarlarCurrency')}</h3></div>
      <div style={{ padding: '0 22px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '8px 10px', display: 'flex', gap: 6 }}>
          {[['₺', t('currNameLira')], ['$', t('currNameDollar')], ['€', t('currNameEuro')]].map(([val, label]) => (
            <button key={val} className={`chip-btn ${currency === val ? 'active' : ''}`} onClick={() => setCurrency(val)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15 }}>{val}</span>
              <span style={{ fontSize: 11, color: 'inherit' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="section-title"><h3>{t('ayarlarTheme')}</h3></div>
      <div style={{ padding: '0 22px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '8px 10px', display: 'flex', gap: 6 }}>
          {[['dark', <Icon.Moon />, t('ayarlarThemeDark')], ['light', <Icon.Sun />, t('ayarlarThemeLight')], ['system', <Icon.Settings s={14} />, t('ayarlarThemeSystem')]].map(([val, icon, label]) => (
            <button key={val} className={`chip-btn ${theme === val ? 'active' : ''}`} onClick={() => setTheme(val)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      <div className="section-title"><h3>{t('ayarlarPrefs')}</h3></div>
      <div className="row-list">
        <div className="row">
          <div className="icon"><Icon.Bell s={16} /></div>
          <div className="meta">
            <h5>{t('ayarlarNotifications')}</h5>
            <p>{t('ayarlarNotificationsSub')}</p>
          </div>
          <div className={`switch ${bildirim ? 'on' : ''}`} onClick={handleBildirimToggle} />
        </div>
        <div className="row">
          <div className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
          <div className="meta">
            <h5>{t('ayarlarMinMax')}</h5>
            <p>{t('ayarlarMinMaxSub')}</p>
          </div>
          <div className={`switch ${(store.prefs && store.prefs.showMinMax) ? 'on' : ''}`} onClick={() => store.setPref('showMinMax', !(store.prefs && store.prefs.showMinMax))} />
        </div>
      </div>

      <KmReminderSection onAdd={onAddKmReminder} onEdit={onEditKmReminder} />

      <div className="section-title"><h3>{t('ayarlarFeedback')}</h3></div>
      <div className="row-list">
        <div className="row" style={{ cursor: 'pointer' }} onClick={onOpenFeedback}>
          <div className="icon"><Icon.Star s={16} /></div>
          <div className="meta"><h5>{t('ayarlarSuggest')}</h5><p>{t('ayarlarSuggestSub')}</p></div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-dim)', flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </div>

      <GoogleDriveSection />

      <div className="section-title"><h3>{t('ayarlarManualBackup')}</h3></div>
      <div className="row-list">
        <div className="row" style={{ cursor: 'pointer' }} onClick={onOpenExport}>
          <div className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></div>
          <div className="meta"><h5>{t('ayarlarExport')}</h5><p>{t('ayarlarExportSub')}</p></div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-dim)', flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
        </div>
        <div className="row" style={{ cursor: 'pointer' }} onClick={() => setImportOpen(true)}>
          <div className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="8 18 12 22 16 18"/><line x1="12" y1="22" x2="12" y2="9"/></svg></div>
          <div className="meta"><h5>{t('ayarlarImport')}</h5><p>{t('ayarlarImportSub')}</p></div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-dim)', flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
        </div>
        {importOpen && <ImportSheet onClose={() => setImportOpen(false)} />}
      </div>

      <div className="section-title"><h3>{t('ayarlarDanger')}</h3></div>
      <div className="row-list">
        <div className="row" style={{ cursor: 'pointer' }} onClick={() => confirm(t('ayarlarResetMsg'), () => store.resetToSeed(), t('ayarlarResetConfirm'))}>
          <div className="icon" style={{ background: 'rgba(248,113,113,0.12)', color: 'var(--negative)' }}><Icon.Trash s={16} /></div>
          <div className="meta"><h5 style={{ color: 'var(--negative)' }}>{t('ayarlarReset')}</h5><p>{t('ayarlarResetSub')}</p></div>
        </div>
        <div className="row" style={{ cursor: 'pointer' }} onClick={() => confirm(t('ayarlarDeleteAllMsg'), async () => { await drive.deleteAccount(); store.clearAll(); }, t('delete'))}>
          <div className="icon" style={{ background: 'rgba(248,113,113,0.12)', color: 'var(--negative)' }}><Icon.Trash s={16} /></div>
          <div className="meta"><h5 style={{ color: 'var(--negative)' }}>{t('ayarlarDeleteAll')}</h5><p>{t('ayarlarDeleteAllSub')}</p></div>
        </div>
      </div>

      <div className="section-title"><h3>{t('ayarlarAbout')}</h3></div>
      <div className="row-list">
        <div className="row" style={{ cursor: 'pointer' }} onClick={onGizlilik}>
          <div className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
          <div className="meta"><h5>{t('ayarlarPrivacy')}</h5></div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-dim)', flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
        </div>
        <div className="row">
          <div className="icon"><Icon.Sparkle s={16} /></div>
          <div className="meta"><h5>{t('ayarlarVersion')}</h5></div>
          <span style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{APP_VERSION}</span>
        </div>
      </div>

      <div style={{ height: 22 }} />
    </div>);

}

/* ── Gizlilik ──────────────────────────────────────────── */
function GizlilikScreen({ onBack }) {
  const t = useT();
  const sections = [
    { titleKey: 'privacyDataCollected', contentKey: 'privacyDataCollectedContent' },
    { titleKey: 'privacyDataSharing', contentKey: 'privacyDataSharingContent' },
    { titleKey: 'privacyThirdParty', contentKey: 'privacyThirdPartyContent' },
    { titleKey: 'privacyNotifications', contentKey: 'privacyNotificationsContent' },
    { titleKey: 'privacyLocation', contentKey: 'privacyLocationContent' },
    { titleKey: 'privacyDataDeletion', contentKey: 'privacyDataDeletionContent' },
    { titleKey: 'privacyChildren', contentKey: 'privacyChildrenContent' },
    { titleKey: 'privacyContact', contentKey: 'privacyContactContent' },
  ];
  return (
    <div>
      <div className="app-header">
        <button className="btn-icon" onClick={onBack} style={{ marginRight: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>
        </button>
        <div className="brand-name">{t('privacyTitle')}</div>
      </div>

      <div style={{ padding: '8px 22px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 16 }}>{t('privacyLastUpdate')}</p>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)' }}>{t('privacyIntro')}</p>
        </div>

        {sections.map(({ titleKey, contentKey }) => (
          <div key={titleKey}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{t(titleKey)}</div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)', margin: 0 }}>{t(contentKey)}</p>
          </div>
        ))}

      </div>
    </div>
  );
}

/* ── Sheets ────────────────────────────────────────────── */
function EntrySheet({ open, onClose, editing }) {
  const store = useStore();
  const t = useT();
  const lang = useLang();
  const currency = useCurrency();
  const { fmt: fmtL, fmtInt: fmtIL } = useFmt();
  const isEdit = !!editing;
  const fuelType = store.prefs?.fuelType || 'Benzin';
  const fuelLabelT = t('fuel' + fuelType);
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
      setLiters(fmtL(editing.liters, 2));
      setPricePerL(fmtL(editing.pricePerL, 2));
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
    if (dateISO > todayISO()) errs.dateISO = t('entryDateFuture');
    if (k <= 0) errs.km = t('entryKmRequired');
    else if (!isEdit && lastKm !== null && k < lastKm) errs.km = `${t('entryKmTooLow')} ${fmtIL(lastKm)} km)`;
    if (l <= 0) errs.liters = t('entryLitersRequired');
    if (p <= 0) errs.pricePerL = t('entryPriceRequired');
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
          <h2>{isEdit ? (lang === 'tr' ? `${fuelLabelT} ${t('entryEditTitle')}` : t('entryEditTitle')) : `${t('entryNewTitle')} ${fuelLabelT} ${t('entryFillupSuffix')}`}</h2>
          <button className="btn-icon" onClick={handleClose}><Icon.X /></button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="label" style={{ margin: 0 }}>{t('entryDate')}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className={`filter-pill${dateISO === todayISO() ? ' active' : ''}`} onClick={() => setDateISO(todayISO())}>{t('entryToday')}</button>
            <button className={`filter-pill${dateISO === yesterdayISO() ? ' active' : ''}`} onClick={() => setDateISO(yesterdayISO())}>{t('entryYesterday')}</button>
          </div>
        </div>
        <input className="input mono" type="date" value={dateISO} onChange={(e) => { setDateISO(e.target.value); setErrors((er) => ({ ...er, dateISO: undefined })); }} style={errors.dateISO ? { borderColor: 'var(--negative)' } : {}} />
        {errors.dateISO && <div style={{ fontSize: 12, color: 'var(--negative)', marginTop: 3 }}>{errors.dateISO}</div>}

        <div className="label" style={{ marginTop: 10 }}>{t('entryKm')}</div>
        <input className="input mono" inputMode="numeric" placeholder="örn. 146200" value={km} onChange={(e) => { setKm(e.target.value.replace(/[^0-9]/g, '')); setErrors((er) => ({ ...er, km: undefined })); }} style={errors.km ? { borderColor: 'var(--negative)' } : {}} />
        {errors.km
          ? <div style={{ fontSize: 12, color: 'var(--negative)', marginTop: 3, paddingLeft: 2 }}>{errors.km}</div>
          : (!isEdit && lastKm !== null && (
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3, paddingLeft: 2 }}>
                {t('entryLastRecord')} {fmtIL(lastKm)} km
                {kmNum > lastKm && (() => {
                  const diff = kmNum - lastKm;
                  const warn = diff < 20 || diff > 2000;
                  return <span style={{ color: warn ? 'var(--negative)' : 'var(--accent)', marginLeft: 8, fontFamily: 'var(--font-mono)' }}>· +{fmtIL(diff)} km{diff < 20 ? ` · ${t('entryTooFew')}` : diff > 2000 ? ` · ${t('entryTooMany')}` : ''}</span>;
                })()}
              </div>
            ))
        }

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
          <div>
            <div className="label">{t('entryLiters')}</div>
            <input className="input mono" inputMode="decimal" placeholder="0,00" value={liters} onChange={(e) => { setLiters(e.target.value.replace('.', ',')); setErrors((er) => ({ ...er, liters: undefined })); }} style={errors.liters ? { borderColor: 'var(--negative)' } : {}} />
            {errors.liters && <div style={{ fontSize: 12, color: 'var(--negative)', marginTop: 3 }}>{errors.liters}</div>}
            {!errors.liters && (() => {
              const cap = parseFloat(store.prefs?.tankCapacity) || 0;
              const l = parseNum(liters);
              if (cap > 0 && l > cap) return <div style={{ fontSize: 12, color: 'var(--negative)', marginTop: 3 }}>{t('entryCapacityExceeded')} ({cap} L)</div>;
              return null;
            })()}
          </div>
          <div>
            <div className="label">{t('entryPricePerL')}</div>
            <input className="input mono" inputMode="decimal" placeholder="0,00" value={pricePerL} onChange={(e) => { setPricePerL(e.target.value.replace('.', ',')); setErrors((er) => ({ ...er, pricePerL: undefined })); }} style={errors.pricePerL ? { borderColor: 'var(--negative)' } : {}} />
            {errors.pricePerL && <div style={{ fontSize: 12, color: 'var(--negative)', marginTop: 3 }}>{errors.pricePerL}</div>}
          </div>
        </div>
        <div className={`toggle-card ${full ? 'on' : ''}`} style={{ marginTop: 10, padding: '10px 12px' }} onClick={() => setFull((v) => !v)}>
          <div className="checkbox">{full && <Icon.Check s={14} />}</div>
          <div>
            <h5>{t('entryFullTank')}</h5>
            <p>{t('entryFullTankSub')}</p>
          </div>
        </div>

        <div className="label" style={{ marginTop: 10 }}>
          {t('entryStation')} <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, fontSize: 11 }}>{t('entryOptional')}</span>
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
          {t('entryNote')} <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, fontSize: 11 }}>{t('entryOptional')}</span>
        </div>
        <input className="input" placeholder={t('entryNotePlaceholder')} value={note} onChange={(e) => setNote(e.target.value)} />

        <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)' }}>{t('entryTotal')}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: 'var(--text)' }}>
            {total > 0 ? <>{fmt(total, 2)} <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500 }}>{currency}</span></> : '—'}
          </span>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginTop: 10 }} onClick={submit}>{isEdit ? t('entryUpdate') : t('entrySave')}</button>
      </div>
    </div>
    {discardOpen && (
      <div className="modal-overlay" style={{ zIndex: 300 }} onClick={() => setDiscardOpen(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ paddingBottom: 28 }}>
          <div className="modal-handle" />
          <div className="modal-head"><h2>{t('entryDiscardTitle')}</h2></div>
          <div className="modal-sub">{t('entryDiscardSub')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setDiscardOpen(false); onClose(); }}>{t('entryDiscardExit')}</button>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setDiscardOpen(false)}>{t('entryDiscardContinue')}</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function EventSheet({ open, onClose, editing, onSaved }) {
  const store = useStore();
  const t = useT();
  const currency = useCurrency();
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
    { value: 'Kasko', tKey: 'eventBtnKasko', icon: <Icon.Shield s={16} /> },
    { value: 'Sigorta', tKey: 'eventBtnSigorta', icon: <Icon.Shield s={16} /> },
    { value: 'Muayene', tKey: 'eventBtnMuayene', icon: <Icon.ClipboardCheck s={16} /> },
    { value: 'Bakım', tKey: 'eventBtnBakim', icon: <Icon.Wrench s={16} /> },
    { value: 'Diğer', tKey: 'eventBtnDiger', icon: <Icon.Tag s={16} /> },
  ];

  const daysBetween = startISO && endISO
    ? Math.round((parseISO(endISO) - parseISO(startISO)) / 86400000)
    : null;

  const submit = () => {
    const errs = {};
    if (type === 'Diğer' && !customType.trim()) errs.customType = t('eventCustomTypeRequired');
    if (!endISO) errs.endISO = t('eventEndRequired');
    else if (startISO && endISO < startISO) errs.endISO = t('eventEndBeforeStart');
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
        <div className="modal-head"><h2>{isEdit ? t('eventEditTitle') : t('eventNewTitle')}</h2><button className="btn-icon" onClick={onClose}><Icon.X /></button></div>
        {isEdit && <div className="modal-sub">{t('eventEditSub')}</div>}
        <div className="type-card-group">
          {typeOptions.map(({ value, tKey, icon }) => (
            <button key={value} className={`type-card${type === value ? ' active' : ''}`} onClick={() => setType(value)}>
              {icon}
              <span>{t(tKey)}</span>
            </button>
          ))}
        </div>
        {type === 'Diğer' && (
          <div style={{ marginTop: 8 }}>
            <input className="input" placeholder={t('eventCustomTypePlaceholder')} value={customType} onChange={(e) => { setCustomType(e.target.value); setErrors((p) => ({ ...p, customType: undefined })); }} style={errors.customType ? { borderColor: 'var(--negative)' } : {}} autoFocus />
            {errors.customType && <div className="field-error">{errors.customType}</div>}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          <div>
            <div className="label">{t('eventStart')}</div>
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
              <div className="label">{t('eventEnd')}</div>
              {daysBetween !== null && <span style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 5 }}>{daysBetween} {t('eventDays')}</span>}
            </div>
            <input className={`input mono${errors.endISO ? ' error' : ''}`} type="date" value={endISO} onChange={(e) => { setEndISO(e.target.value); setErrors((p) => ({ ...p, endISO: undefined })); }} />
            {errors.endISO && <div className="field-error">{errors.endISO}</div>}
            {!errors.endISO && endISO && endISO < todayISO() && <div style={{ fontSize: 11, color: 'var(--negative)', marginTop: 3 }}>{t('eventEndPast')}</div>}
          </div>
        </div>
        <div className="label" style={{ marginTop: 12 }}>{t('eventNotifyDays')}</div>
        <div className="chip-group">
          {[7, 15, 30, 60].map((d) =>
          <button key={d} className={`chip-btn ${notifyDays === d ? 'active' : ''}`} onClick={() => setNotifyDays(d)}>{d}</button>
          )}
        </div>
        <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--bg-2)', borderRadius: 10, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1, marginTop: 1 }}>ℹ</span>
          <span style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{t('eventNotifyInfo')}</span>
        </div>
        {type === 'Bakım' && <>
          <div className="label" style={{ marginTop: 12 }}>{t('eventServiceKm')} <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{t('entryOptional')}</span></div>
          <input className="input mono" inputMode="numeric" placeholder="örn. 152000" value={serviceKm} onChange={(e) => setServiceKm(e.target.value.replace(/[^0-9]/g, ''))} />
        </>}
        <div className="label" style={{ marginTop: 12 }}>{t('eventCost')} <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{t('entryOptional')}</span></div>
        <input className="input mono" inputMode="decimal" placeholder={`0,00 ${currency}`} value={cost} onChange={(e) => setCost(e.target.value.replace('.', ','))} />
        <div className="label" style={{ marginTop: 12 }}>{t('eventNote')} <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{t('entryOptional')}</span></div>
        <textarea className="input" rows={2} placeholder={type === 'Kasko' || type === 'Sigorta' ? t('eventNotePlaceholderInsurance') : type === 'Bakım' ? t('eventNotePlaceholderService') : t('eventNotePlaceholderDefault')} value={note} onChange={(e) => setNote(e.target.value)} style={{ resize: 'none', lineHeight: 1.5 }} />
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 18 }} onClick={submit}>{isEdit ? t('eventUpdate') : t('eventSave')}</button>
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
        <div style={{ flex: `0 0 ${DELETE_W}px`, background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Icon.Trash s={20} />
        </div>
      </div>
    </div>
  );
}

/* ── Km Prompt ─────────────────────────────────────────── */
function KmPromptModal({ km, onClose }) {
  const store = useStore();
  const t = useT();
  const { fmtInt: fmtIL } = useFmt();
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
        <div className="modal-head"><h2>{t('kmPromptTitle')}</h2></div>
        <div className="modal-sub">{fmtIL(km)} {t('kmPromptSub')}</div>
        {existing.length === 0 && <>
          <div className="label" style={{ marginTop: 14 }}>{t('kmPromptInterval')}</div>
          <input className="input mono" inputMode="numeric" value={intervalKm} onChange={e => setIntervalKm(e.target.value.replace(/[^0-9]/g, ''))} autoFocus />
        </>}
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 10, fontSize: 13, color: 'var(--text-2)' }}>
          {t('kmPromptNextService')} <span style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fmtIL(nextKm)} km</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={confirm}>{t('kmPromptAdd')}</button>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>{t('kmPromptSkip')}</button>
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
      const KEY = 'vitesse-notified';
      const notified = (() => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } })();
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
  }, [store.events, store.entries, store.prefs]);
  return null;
}

/* ── Google Drive Backup ──────────────────────────────── */
const GOOGLE_CLIENT_ID = '629616234780-1u3fm53ioaslfjtbh4a4ud8637udhb0v.apps.googleusercontent.com';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata email profile';
const REDIRECT_URI = 'com.googleusercontent.apps.629616234780-1u3fm53ioaslfjtbh4a4ud8637udhb0v:/oauth2redirect';
const BACKUP_FILENAME = 'vitesse-backup.json';
const TOKEN_KEY = 'vitesse-gdrive-token';
const LAST_BACKUP_KEY = 'vitesse-last-backup';

function rndStr(n) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  return Array.from(crypto.getRandomValues(new Uint8Array(n)), b => chars[b % chars.length]).join('');
}
async function pkceChallenge(verifier) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
const loadToken = () => { try { return JSON.parse(localStorage.getItem(TOKEN_KEY)); } catch { return null; } };
const saveToken = t => localStorage.setItem(TOKEN_KEY, JSON.stringify(t));
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function driveGetFile(accessToken) {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${BACKUP_FILENAME}'&fields=files(id,modifiedTime)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const d = await res.json();
  return d.files?.[0] || null;
}
async function driveUpload(accessToken, data, fileId) {
  const content = JSON.stringify(data);
  const boundary = 'vitesse_bnd';
  const meta = fileId ? '{}' : JSON.stringify({ name: BACKUP_FILENAME, parents: ['appDataFolder'] });
  const body = `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${content}\r\n--${boundary}--`;
  const url = fileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;
  const res = await fetch(url, {
    method: fileId ? 'PATCH' : 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': `multipart/related; boundary="${boundary}"` },
    body,
  });
  if (!res.ok) throw new Error('upload_failed');
  return res.json();
}
async function driveDownload(accessToken, fileId) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error('download_failed');
  return res.json();
}
async function driveDeleteFile(accessToken, fileId) {
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
async function refreshToken(refreshTok) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, refresh_token: refreshTok, grant_type: 'refresh_token' }),
  });
  if (!res.ok) throw new Error('refresh_failed');
  return res.json();
}

const DriveCtx = createContext(null);
function useDrive() { return useContext(DriveCtx); }

function DriveProvider({ children }) {
  const [token, setToken] = useState(loadToken);
  const [backupStatus, setBackupStatus] = useState('idle'); // idle | saving | restoring | error

  const lastBackup = token?.lastBackup || null;

  const getAccessToken = useCallback(async () => {
    let t = token;
    if (!t) return null;
    if (t.expiry && Date.now() > t.expiry - 300000) {
      try {
        const r = await refreshToken(t.refreshToken);
        t = { ...t, accessToken: r.access_token, expiry: Date.now() + r.expires_in * 1000 };
        saveToken(t); setToken(t);
      } catch { clearToken(); setToken(null); return null; }
    }
    return t.accessToken;
  }, [token]);

  const backup = useCallback(async (data) => {
    const at = await getAccessToken();
    if (!at) return;
    setBackupStatus('saving');
    try {
      const existing = await driveGetFile(at);
      await driveUpload(at, data, existing?.id);
      const now = new Date().toISOString();
      setToken(t => { const nt = { ...t, lastBackup: now }; saveToken(nt); return nt; });
      setBackupStatus('idle');
    } catch { setBackupStatus('error'); setTimeout(() => setBackupStatus('idle'), 3000); }
  }, [getAccessToken]);

  const restore = useCallback(async () => {
    const at = await getAccessToken();
    if (!at) return null;
    setBackupStatus('restoring');
    try {
      const file = await driveGetFile(at);
      if (!file) { setBackupStatus('idle'); return null; }
      const data = await driveDownload(at, file.id);
      setBackupStatus('idle');
      return data;
    } catch { setBackupStatus('error'); setTimeout(() => setBackupStatus('idle'), 3000); return null; }
  }, [getAccessToken]);

  const signIn = useCallback(async () => {
    const verifier = rndStr(64);
    const challenge = await pkceChallenge(verifier);
    localStorage.setItem('vitesse-pkce', verifier);
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID, redirect_uri: REDIRECT_URI,
      response_type: 'code', scope: DRIVE_SCOPE,
      code_challenge: challenge, code_challenge_method: 'S256',
      access_type: 'offline', prompt: 'consent',
    });
    await Browser.open({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  }, []);

  const handleOAuthCallback = useCallback(async (url) => {
    const code = new URL(url).searchParams.get('code');
    if (!code) return;
    const verifier = localStorage.getItem('vitesse-pkce');
    localStorage.removeItem('vitesse-pkce');
    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, code, code_verifier: verifier, grant_type: 'authorization_code', redirect_uri: REDIRECT_URI }),
      });
      const td = await res.json();
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${td.access_token}` } });
      const user = await userRes.json();
      const t = { accessToken: td.access_token, refreshToken: td.refresh_token, expiry: Date.now() + td.expires_in * 1000, email: user.email };
      saveToken(t); setToken(t);
    } catch { /* silent */ }
    await Browser.close().catch(() => {});
  }, []);

  const signOut = useCallback(() => { clearToken(); setToken(null); }, []);

  const deleteAccount = useCallback(async () => {
    const at = await getAccessToken();
    if (at) {
      try {
        const file = await driveGetFile(at);
        if (file) await driveDeleteFile(at, file.id);
      } catch { /* silent */ }
    }
    clearToken();
    setToken(null);
  }, [getAccessToken]);

  const value = useMemo(() => ({
    isSignedIn: !!token,
    email: token?.email,
    lastBackup,
    backupStatus,
    signIn, signOut, backup, restore, handleOAuthCallback, deleteAccount,
  }), [token, backupStatus, lastBackup, signIn, signOut, backup, restore, handleOAuthCallback, deleteAccount]);

  return <DriveCtx.Provider value={value}>{children}</DriveCtx.Provider>;
}

function OAuthListener() {
  const drive = useDrive();
  useEffect(() => {
    const sub = CapApp.addListener('appUrlOpen', ({ url }) => {
      if (url.includes('oauth2redirect') || url.includes('com.googleusercontent.apps')) drive.handleOAuthCallback(url);
    });
    return () => sub.then(s => s.remove()).catch(() => {});
  }, [drive.handleOAuthCallback]);
  return null;
}

function AutoBackup() {
  const store = useStore();
  const drive = useDrive();
  const timer = useRef(null);

  useEffect(() => {
    if (!drive.isSignedIn) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      drive.backup({ entries: store.entries, events: store.events || [], prefs: store.prefs || {} });
    }, 3000);
    return () => clearTimeout(timer.current);
  }, [store.entries, store.events, store.prefs, drive.isSignedIn]);

  return null;
}

/* ── Feedback Sheet ────────────────────────────────────── */
function FeedbackSheet({ onClose }) {
  const [text, setText] = useState('');
  const t = useT();
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{t('feedbackTitle')}</h2>
          <button className="btn-icon" onClick={onClose}><Icon.X /></button>
        </div>
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <textarea
            autoFocus
            className="input"
            style={{ width: '100%', minHeight: 120, resize: 'none', fontFamily: 'var(--font-sans)', fontSize: 14, boxSizing: 'border-box' }}
            placeholder={t('feedbackPlaceholder')}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="btn btn-accent"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={!text.trim()}
            onClick={() => {
              window.open(`mailto:aria.software.dev@gmail.com?subject=Vitesse%20%C3%96neri&body=${encodeURIComponent(text)}`, '_blank');
              onClose();
            }}
          >
            {t('feedbackSend')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Root App ──────────────────────────────────────────── */
function App() {
  const [screen, setScreen] = useState('ozet');
  const [lang, setLang] = useState(() => localStorage.getItem('vitesse-lang') || 'tr');
  useEffect(() => { localStorage.setItem('vitesse-lang', lang); document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { document.documentElement.lang = lang; }, []); // set on mount too
  const [currency, setCurrency] = useState(() => localStorage.getItem('vitesse-currency') || '₺');
  useEffect(() => { localStorage.setItem('vitesse-currency', currency); }, [currency]);
  const [theme, setTheme] = useState(() => localStorage.getItem('vitesse-theme') || 'dark');
  useEffect(() => { localStorage.setItem('vitesse-theme', theme); }, [theme]);
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
  const [nearbyOpen, setNearbyOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <CurrencyCtx.Provider value={currency}><ThemeCtx.Provider value={effectiveTheme}><LangCtx.Provider value={lang}><StoreProvider><DriveProvider><OAuthListener /><AutoBackup /><NotificationChecker /><ConfirmProvider>
      <div className="ios-device">
        <div className="ios-screen" data-theme={effectiveTheme}>
          <div className="app">
            <div className="app-content">
              <div key={screen} className="screen-transition">
                {screen === 'ozet' && <OzetScreen onOpenNearby={() => setNearbyOpen(true)} />}
                {screen === 'gecmis' && <GecmisScreen onEdit={(e) => setEntrySheet({ open: true, editing: e })} onOpenLpg={() => setLpgOpen(true)} />}
                {screen === 'takvim' && <TakvimScreen onAddEvent={() => setEventSheet({ open: true, editing: null })} onEditEvent={(e) => setEventSheet({ open: true, editing: e })} />}
                {screen === 'ayarlar' && <AyarlarScreen theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} currency={currency} setCurrency={setCurrency} onGizlilik={() => setScreen('gizlilik')} onAddKmReminder={() => setKmReminderForm({ open: true, editing: null })} onEditKmReminder={(r) => setKmReminderForm({ open: true, editing: r })} onOpenExport={() => setExportOpen(true)} onOpenFeedback={() => setFeedbackOpen(true)} />}
                {screen === 'gizlilik' && <GizlilikScreen onBack={() => setScreen('ayarlar')} />}
              </div>
            </div>
            <nav className="bottom-nav" style={{ display: screen === 'gizlilik' ? 'none' : '' }}>
              {(() => { const tr = (TRANSLATIONS[lang] || TRANSLATIONS.tr); return (<>
              <button className={`nav-btn ${screen === 'ozet' ? 'active' : ''}`} onClick={() => setScreen('ozet')}><Icon.Home s={22} /><span>{tr.navOzet}</span></button>
              <button className={`nav-btn ${screen === 'gecmis' ? 'active' : ''}`} onClick={() => setScreen('gecmis')}><Icon.History s={22} /><span>{tr.navGecmis}</span></button>
              {screen !== 'gizlilik' && <div className="fab-wrap"><button className="fab" onClick={() => setEntrySheet({ open: true, editing: null })}><Icon.Plus s={26} /></button></div>}
              <button className={`nav-btn ${screen === 'takvim' ? 'active' : ''}`} onClick={() => setScreen('takvim')}><Icon.Calendar s={22} /><span>{tr.navTakvim}</span></button>
              <button className={`nav-btn ${screen === 'ayarlar' ? 'active' : ''}`} onClick={() => setScreen('ayarlar')}><Icon.Settings s={22} /><span>{tr.navAyarlar}</span></button>
              </>); })()}
            </nav>
          </div>
          <EntrySheet open={entrySheet.open} editing={entrySheet.editing} onClose={() => setEntrySheet({ open: false, editing: null })} />
          <EventSheet open={eventSheet.open} editing={eventSheet.editing} onClose={() => setEventSheet({ open: false, editing: null })} onSaved={({ type, serviceKm }) => { if (type === 'Bakım' && serviceKm) setKmPrompt({ open: true, km: serviceKm }); }} />
          {kmPrompt.open && <KmPromptModal km={kmPrompt.km} onClose={() => setKmPrompt({ open: false, km: 0 })} />}
          <KmReminderFormModal open={kmReminderForm.open} editing={kmReminderForm.editing} onClose={() => setKmReminderForm({ open: false, editing: null })} />
          {lpgOpen && <LpgSheet onClose={() => setLpgOpen(false)} />}
          {nearbyOpen && <NearbyStationsSheet onClose={() => setNearbyOpen(false)} />}
          {exportOpen && <ExportSheet onClose={() => setExportOpen(false)} />}
          {feedbackOpen && <FeedbackSheet onClose={() => setFeedbackOpen(false)} />}
        </div>
      </div>
    </ConfirmProvider></DriveProvider></StoreProvider></LangCtx.Provider></ThemeCtx.Provider></CurrencyCtx.Provider>);

}

export default App;
