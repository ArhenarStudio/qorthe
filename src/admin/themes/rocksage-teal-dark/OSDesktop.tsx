"use client";
// ═══════════════════════════════════════════════════════════════
// OSDesktop.tsx — Escritorio principal RockSage OS
// Replica fiel de rocksage-os-v3.html
// Pantalla completa: menubar + KPI bar + app grid + dock
// Módulos abren como ventanas modales (OSWindow)
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  LayoutDashboard, CreditCard, ShoppingBag, Truck, FileText, RotateCcw,
  Package, Grid3x3, FolderOpen, Users, Star, Shield, MessageCircle, HelpCircle,
  TrendingUp, CheckCircle, DollarSign, BarChart3, PenLine, Sun, UserCircle,
  Zap, ExternalLink, Import, Bell, UserCog, MapPin,
} from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import type { AdminPage } from '@/src/admin/navigation';
import { OSWindow } from './OSWindow';
import { OSModuleRegistry } from './OSModuleRegistry';

// ── Paleta OS (CSS vars inline) ──────────────────────────────
const C = {
  bg:        '#08090B',
  surface:   '#0F1114',
  surf2:     '#161A1F',
  border:    '#1A2228',
  border2:   '#243038',
  primary:   '#0D9488',
  primaryH:  '#14B8A6',
  primaryL:  '#2DD4BF',
  primaryT:  '#0C2420',
  accent:    '#F59E0B',
  text:      '#E8ECF0',
  text2:     '#6B7A85',
  text3:     '#3A4A52',
  success:   '#22C55E',
  error:     '#EF4444',
  warning:   '#F59E0B',
  info:      '#3B82F6',
};

// ── Tipos ────────────────────────────────────────────────────
interface AppDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  badge?: number;
  adminPage: AdminPage;
}

interface GroupDef {
  id: string;
  label: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  apps: AppDef[];
}

interface KpiDef {
  label: string;
  value: string;
  delta: string;
  deltaType: 'up' | 'down' | 'warn';
  icon: React.ReactNode;
}

// ── KPIs ─────────────────────────────────────────────────────
const KPIS: KpiDef[] = [
  { label: 'Ingresos hoy',    value: '$4,280',  delta: '+12% vs ayer', deltaType: 'up',
    icon: <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth=".8"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
  { label: 'Pedidos activos', value: '23',      delta: '+3 nuevos',    deltaType: 'up',
    icon: <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth=".8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
  { label: 'Clientes nuevos', value: '8',       delta: '−2 vs ayer',   deltaType: 'down',
    icon: <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth=".8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { label: 'Ticket promedio', value: '$186',    delta: '+8%',          deltaType: 'up',
    icon: <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth=".8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { label: 'Chat en vivo',    value: '3',       delta: '● Esperando',  deltaType: 'warn',
    icon: <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth=".8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
];

// ── Grupos de apps ───────────────────────────────────────────
const GROUPS: GroupDef[] = [
  {
    id: 'ventas', label: 'Ventas',
    badgeBg: 'rgba(13,148,136,0.12)', badgeColor: '#2DD4BF', badgeBorder: 'rgba(13,148,136,0.2)',
    apps: [
      { id: 'dashboard',    label: 'Dashboard',      adminPage: 'dashboard',
        iconBg: 'linear-gradient(145deg,#061614 0%,#0d4f48 100%)', iconBorder: 'rgba(13,148,136,0.5)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg> },
      { id: 'pos',          label: 'Punto de Venta', adminPage: 'pos',
        iconBg: 'linear-gradient(145deg,#091d1a 0%,#0f4038 100%)', iconBorder: 'rgba(13,148,136,0.35)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.7" strokeLinecap="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M2 9.5h20"/><path d="M7 14h.01M11 14h.01M15 14h.01"/></svg> },
      { id: 'orders',       label: 'Pedidos',        adminPage: 'orders', badge: 7,
        iconBg: 'linear-gradient(145deg,#091d1a 0%,#0f4038 100%)', iconBorder: 'rgba(13,148,136,0.35)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.7" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
      { id: 'shipping',     label: 'Envíos',         adminPage: 'shipping',
        iconBg: 'linear-gradient(145deg,#091d1a 0%,#0f4038 100%)', iconBorder: 'rgba(13,148,136,0.35)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.7" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l5 3-5 3V8z"/><path d="M1 19h18"/></svg> },
      { id: 'quotes',       label: 'Cotizaciones',   adminPage: 'quotes',
        iconBg: 'linear-gradient(145deg,#091d1a 0%,#0f4038 100%)', iconBorder: 'rgba(13,148,136,0.35)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.7" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg> },
      { id: 'returns',      label: 'Devoluciones',   adminPage: 'returns',
        iconBg: 'linear-gradient(145deg,#091d1a 0%,#0f4038 100%)', iconBorder: 'rgba(13,148,136,0.35)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.7" strokeLinecap="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
    ],
  },
  {
    id: 'catalogo', label: 'Catálogo',
    badgeBg: 'rgba(34,197,94,0.1)', badgeColor: '#4ADE80', badgeBorder: 'rgba(34,197,94,0.2)',
    apps: [
      { id: 'products',     label: 'Productos',   adminPage: 'products',
        iconBg: 'linear-gradient(145deg,#0d1f0a 0%,#14421a 100%)', iconBorder: 'rgba(34,197,94,0.3)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="1.7" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
      { id: 'inventory',    label: 'Inventario',  adminPage: 'inventory',
        iconBg: 'linear-gradient(145deg,#0d1f0a 0%,#14421a 100%)', iconBorder: 'rgba(34,197,94,0.3)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="1.7" strokeLinecap="round"><path d="M3 3h4v4H3zM10 3h4v4h-4zM17 3h4v4h-4zM3 10h4v4H3zM10 10h4v4h-4zM17 10h4v4h-4zM3 17h4v4H3zM10 17h4v4h-4zM17 17h4v4h-4z"/></svg> },
      { id: 'categories',   label: 'Categorías',  adminPage: 'categories',
        iconBg: 'linear-gradient(145deg,#0d1f0a 0%,#14421a 100%)', iconBorder: 'rgba(34,197,94,0.3)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="1.7" strokeLinecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg> },
    ],
  },
  {
    id: 'clientes', label: 'Clientes',
    badgeBg: 'rgba(59,130,246,0.1)', badgeColor: '#60A5FA', badgeBorder: 'rgba(59,130,246,0.2)',
    apps: [
      { id: 'customers',    label: 'Clientes',    adminPage: 'customers',
        iconBg: 'linear-gradient(145deg,#0a1224 0%,#0e2a6e 100%)', iconBorder: 'rgba(59,130,246,0.3)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.7" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
      { id: 'reviews',      label: 'Reviews',     adminPage: 'reviews',
        iconBg: 'linear-gradient(145deg,#0a1224 0%,#0e2a6e 100%)', iconBorder: 'rgba(59,130,246,0.3)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.7" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
      { id: 'loyalty',      label: 'Membresías',  adminPage: 'loyalty',
        iconBg: 'linear-gradient(145deg,#0a1224 0%,#0e2a6e 100%)', iconBorder: 'rgba(59,130,246,0.3)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.7" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
      { id: 'chat',         label: 'Chat en Vivo',adminPage: 'chat', badge: 3,
        iconBg: 'linear-gradient(145deg,#0a1224 0%,#0e2a6e 100%)', iconBorder: 'rgba(59,130,246,0.3)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.7" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
      { id: 'support',      label: 'Soporte',     adminPage: 'helpdesk',
        iconBg: 'linear-gradient(145deg,#0a1224 0%,#0e2a6e 100%)', iconBorder: 'rgba(59,130,246,0.3)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
    ],
  },
];

const GROUPS_ROW2: GroupDef[] = [
  {
    id: 'crecimiento', label: 'Crecimiento',
    badgeBg: 'rgba(236,72,153,0.1)', badgeColor: '#F472B6', badgeBorder: 'rgba(236,72,153,0.2)',
    apps: [
      { id: 'marketing',    label: 'Marketing',   adminPage: 'marketing',
        iconBg: 'linear-gradient(145deg,#1e0a1a 0%,#6d0f42 100%)', iconBorder: 'rgba(236,72,153,0.3)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="1.7" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
      { id: 'goals',        label: 'Metas y OKRs',adminPage: 'marketing',
        iconBg: 'linear-gradient(145deg,#1e0a1a 0%,#6d0f42 100%)', iconBorder: 'rgba(236,72,153,0.3)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="1.7" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
    ],
  },
  {
    id: 'finanzas', label: 'Finanzas',
    badgeBg: 'rgba(245,158,11,0.1)', badgeColor: '#FCD34D', badgeBorder: 'rgba(245,158,11,0.2)',
    apps: [
      { id: 'finances',     label: 'Finanzas',    adminPage: 'finances',
        iconBg: 'linear-gradient(145deg,#1a1000 0%,#7a3600 100%)', iconBorder: 'rgba(245,158,11,0.3)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth="1.7" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
      { id: 'reports',      label: 'Reportes',    adminPage: 'reports',
        iconBg: 'linear-gradient(145deg,#1a1000 0%,#7a3600 100%)', iconBorder: 'rgba(245,158,11,0.3)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth="1.7" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><rect x="4" y="20" width="16" height="1"/></svg> },
    ],
  },
  {
    id: 'contenido', label: 'Contenido',
    badgeBg: 'rgba(167,139,250,0.1)', badgeColor: '#C4B5FD', badgeBorder: 'rgba(167,139,250,0.2)',
    apps: [
      { id: 'cms',          label: 'CMS',         adminPage: 'cms',
        iconBg: 'linear-gradient(145deg,#12082a 0%,#4c1d95 100%)', iconBorder: 'rgba(167,139,250,0.3)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#C4B5FD" strokeWidth="1.7" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
      { id: 'theme-editor', label: 'Editor Tema', adminPage: 'theme',
        iconBg: 'linear-gradient(145deg,#12082a 0%,#4c1d95 100%)', iconBorder: 'rgba(167,139,250,0.3)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#C4B5FD" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M20 12h-2M6 12H4M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 20v2M12 2v2"/></svg> },
      { id: 'appearance',   label: 'Apariencia',  adminPage: 'appearance',
        iconBg: 'linear-gradient(145deg,#12082a 0%,#4c1d95 100%)', iconBorder: 'rgba(167,139,250,0.3)',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="#C4B5FD" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 10-16 0"/><path d="M12 12v9"/><path d="M9 18l3 3 3-3"/></svg> },
    ],
  },
];

const GROUP_SISTEMA: GroupDef = {
  id: 'sistema', label: 'Sistema',
  badgeBg: 'rgba(100,116,139,0.1)', badgeColor: '#94A3B8', badgeBorder: 'rgba(100,116,139,0.2)',
  apps: [
    { id: 'automations',  label: 'Automatiz.',    adminPage: 'automations',
      iconBg: 'linear-gradient(145deg,#080d12 0%,#1e2d3a 100%)', iconBorder: 'rgba(100,116,139,0.25)',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.7" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> },
    { id: 'integrations', label: 'Integraciones', adminPage: 'integrations',
      iconBg: 'linear-gradient(145deg,#080d12 0%,#1e2d3a 100%)', iconBorder: 'rgba(100,116,139,0.25)',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.7" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> },
    { id: 'import-export',label: 'Import/Export', adminPage: 'importexport',
      iconBg: 'linear-gradient(145deg,#080d12 0%,#1e2d3a 100%)', iconBorder: 'rgba(100,116,139,0.25)',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.7" strokeLinecap="round"><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg> },
    { id: 'notifications', label: 'Notificaciones',adminPage: 'notifications',
      iconBg: 'linear-gradient(145deg,#080d12 0%,#1e2d3a 100%)', iconBorder: 'rgba(100,116,139,0.25)',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.7" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> },
    { id: 'team',         label: 'Equipo',        adminPage: 'users',
      iconBg: 'linear-gradient(145deg,#080d12 0%,#1e2d3a 100%)', iconBorder: 'rgba(100,116,139,0.25)',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.7" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
    { id: 'settings',     label: 'Configuración', adminPage: 'settings',
      iconBg: 'linear-gradient(145deg,#080d12 0%,#1e2d3a 100%)', iconBorder: 'rgba(100,116,139,0.25)',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.7" strokeLinecap="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg> },
  ],
};

// Dock shortcuts
const DOCK_ITEMS: { id: string; label: string; adminPage: AdminPage; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', adminPage: 'dashboard',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg> },
  { id: 'pos', label: 'POS', adminPage: 'pos',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M2 9.5h20"/></svg> },
  { id: 'orders', label: 'Pedidos', adminPage: 'orders',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
  { id: 'chat', label: 'Chat', adminPage: 'chat',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
  { id: 'support', label: 'Soporte', adminPage: 'helpdesk',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  { id: 'settings', label: 'Configuración', adminPage: 'settings',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg> },
];

// ── Sub-componentes ──────────────────────────────────────────

function KpiCard({ kpi }: { kpi: KpiDef }) {
  const [hover, setHover] = useState(false);
  const deltaColor = kpi.deltaType === 'up' ? C.success : kpi.deltaType === 'down' ? C.error : C.warning;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: 1,
        background: hover ? 'rgba(15,17,20,0.95)' : 'rgba(15,17,20,0.85)',
        border: `1px solid ${hover ? 'rgba(45,212,191,0.22)' : C.border}`,
        borderRadius: '14px',
        padding: '13px 16px 11px',
        position: 'relative', overflow: 'hidden',
        cursor: 'default',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hover ? '0 8px 28px rgba(0,0,0,0.4), 0 0 0 1px rgba(45,212,191,0.08)' : 'none',
        transition: 'all 0.25s',
      }}
    >
      {/* Top shimmer on hover */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg,transparent,rgba(45,212,191,0.25),transparent)',
        opacity: hover ? 1 : 0, transition: 'opacity 0.25s',
      }} />
      <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.text2, marginBottom: '5px' }}>
        {kpi.label}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: 600, color: C.text, lineHeight: 1, marginBottom: '4px' }}>
        {kpi.value}
      </div>
      <div style={{ fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px', color: deltaColor }}>
        {kpi.delta}
      </div>
      {/* BG icon */}
      <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.05, pointerEvents: 'none' }}>
        {kpi.icon}
      </div>
    </div>
  );
}

function AppCard({ app, onOpen, delay }: { app: AppDef; onOpen: (page: AdminPage) => void; delay: number }) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={() => onOpen(app.adminPage)}
      style={{
        width: '106px',
        background: hover ? 'rgba(15,17,20,0.95)' : 'rgba(15,17,20,0.8)',
        border: `1px solid ${hover ? 'rgba(45,212,191,0.28)' : C.border}`,
        borderRadius: '14px',
        padding: '14px 8px 11px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        transform: pressed ? 'scale(0.96)' : hover ? 'translateY(-4px) scale(1.015)' : 'translateY(0) scale(1)',
        boxShadow: hover ? '0 14px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(45,212,191,0.12), 0 0 24px rgba(13,148,136,0.06)' : 'none',
        transition: pressed ? 'transform 0.08s' : 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        animationDelay: `${delay}s`,
      }}
    >
      {/* Glossy top */}
      <div style={{
        position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
        background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)',
        borderRadius: '50%',
      }} />
      {/* Hover glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(45,212,191,0.04), transparent)',
        opacity: hover ? 1 : 0, transition: 'opacity 0.25s', borderRadius: 'inherit',
      }} />

      {/* Icon box */}
      <div style={{
        width: '50px', height: '50px', borderRadius: '13px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', flexShrink: 0,
        background: app.iconBg,
        border: `1px solid ${app.iconBorder}`,
        transform: hover ? 'scale(1.1) rotate(-2deg)' : 'scale(1) rotate(0deg)',
        transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Badge */}
        {app.badge != null && app.badge > 0 && (
          <div style={{
            position: 'absolute', top: '-5px', right: '-5px',
            minWidth: '17px', height: '17px',
            background: C.error, color: '#fff',
            fontSize: '8px', fontWeight: 800,
            borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', border: `2px solid ${C.bg}`,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {app.badge}
          </div>
        )}
        <div style={{ width: '22px', height: '22px', position: 'relative', zIndex: 1 }}>
          {app.icon}
        </div>
      </div>

      {/* Label */}
      <span style={{
        fontSize: '10.5px', fontWeight: 500,
        color: hover ? C.text : C.text2,
        textAlign: 'center', lineHeight: 1.25,
        maxWidth: '94px', transition: 'color 0.2s',
      }}>
        {app.label}
      </span>
    </div>
  );
}

function GroupBadge({ group }: { group: GroupDef }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
      <span style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: '9px', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.12em',
        padding: '3px 10px', borderRadius: '20px',
        background: group.badgeBg, color: group.badgeColor, border: `1px solid ${group.badgeBorder}`,
        whiteSpace: 'nowrap',
      }}>
        {group.label}
      </span>
      <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg,${C.border2},transparent)` }} />
      <span style={{ fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", color: C.text3 }}>
        {group.apps.length}
      </span>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export function OSDesktop({ children: _children }: { children?: React.ReactNode }) {
  const { navigate, currentPage } = useAdmin();
  const [clock, setClock] = useState('');
  const [openWindow, setOpenWindow] = useState<AdminPage | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reloj
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClock(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  // Partículas canvas
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    let W = 0, H = 0;
    interface Particle { x:number;y:number;vx:number;vy:number;r:number;a:number;maxA:number;life:number;maxLife:number }
    let particles: Particle[] = [];
    let raf: number;

    const resize = () => { W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const mkP = (): Particle => ({
      x: Math.random() * W, y: H + 10,
      vx: (Math.random() - 0.5) * 0.4, vy: -(Math.random() * 0.5 + 0.3),
      r: Math.random() * 1.5 + 0.5, a: 0,
      maxA: Math.random() * 0.5 + 0.2,
      life: 0, maxLife: Math.random() * 300 + 200,
    });
    for (let i = 0; i < 30; i++) particles.push(mkP());

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p, i) => {
        p.life++; p.x += p.vx; p.y += p.vy;
        const t = p.life / p.maxLife;
        p.a = t < 0.1 ? t * 10 * p.maxA : t > 0.9 ? (1 - t) * 10 * p.maxA : p.maxA;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45,212,191,${p.a})`;
        ctx.fill();
        if (p.life > p.maxLife) particles[i] = mkP();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  const handleOpenApp = useCallback((page: AdminPage) => {
    navigate(page);
    setOpenWindow(page);
  }, [navigate]);

  const handleCloseWindow = useCallback(() => {
    setOpenWindow(null);
  }, []);

  // Título de la ventana activa
  const allApps = [...GROUPS, ...GROUPS_ROW2, GROUP_SISTEMA].flatMap(g => g.apps);
  const activeApp = allApps.find(a => a.adminPage === openWindow);
  const windowTitle = activeApp?.label ?? 'Módulo';

  let delayCounter = 0;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      background: `
        radial-gradient(ellipse 55% 45% at 12% 18%, rgba(13,148,136,0.09) 0%, transparent 65%),
        radial-gradient(ellipse 45% 35% at 88% 80%, rgba(245,158,11,0.06) 0%, transparent 65%),
        radial-gradient(ellipse 70% 55% at 50% 50%, rgba(45,212,191,0.03) 0%, transparent 75%),
        #08090B
      `,
      overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '13px',
      color: C.text,
      zIndex: 10,
    }}>
      {/* Grid de fondo */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(20,184,166,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(20,184,166,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '56px 56px',
        maskImage: 'radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 50% 0%, black 30%, transparent 100%)',
      }} />

      {/* Canvas partículas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.4 }} />

      {/* ── MENUBAR ── */}
      <div style={{
        height: '34px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 22px',
        background: 'rgba(8,9,11,0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(45,212,191,0.1)',
        zIndex: 200, position: 'relative',
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Hexmark */}
          <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20" style={{ filter: 'drop-shadow(0 0 6px rgba(45,212,191,0.5))' }}>
              <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" stroke="#2DD4BF" strokeWidth="1.5"/>
              <path d="M12 7L16.5 9.5V14.5L12 17L7.5 14.5V9.5L12 7Z" fill="#14B8A6" opacity=".4"/>
              <circle cx="12" cy="12" r="2" fill="#2DD4BF"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '12px', fontWeight: 700, color: C.text, letterSpacing: '0.3px' }}>
            Rock<span style={{ color: C.primaryL }}>Sage</span>&nbsp;OS
          </span>
          <div style={{ width: '1px', height: '14px', background: C.border2 }} />
          <span style={{ fontSize: '11px', color: C.text2, fontWeight: 400 }}>Qorthe</span>
        </div>
        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '10px', color: C.text2,
            padding: '3px 9px',
            background: 'rgba(22,26,31,0.8)',
            border: `1px solid ${C.border}`,
            borderRadius: '20px',
          }}>
            <div style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: C.success, boxShadow: `0 0 6px ${C.success}`,
            }} />
            Sistema operativo
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: C.text2, minWidth: '38px', textAlign: 'right' }}>
            {clock}
          </span>
          <div style={{
            width: '22px', height: '22px', borderRadius: '50%',
            background: `linear-gradient(135deg,${C.primaryT},${C.primary})`,
            border: `1.5px solid ${C.primary}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '8px', fontWeight: 800, color: C.primaryL,
            cursor: 'pointer',
            fontFamily: "'Sora', sans-serif",
            boxShadow: '0 0 10px rgba(13,148,136,0.2)',
          }}>
            DA
          </div>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '18px 28px 76px', gap: '16px', position: 'relative', zIndex: 1, overflow: 'hidden' }}>

        {/* KPI bar */}
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          {KPIS.map(kpi => <KpiCard key={kpi.label} kpi={kpi} />)}
        </div>

        {/* App grid — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none' }}>

          {/* Grupos fila 1 */}
          {GROUPS.map(group => (
            <div key={group.id} style={{ marginBottom: '22px' }}>
              <GroupBadge group={group} />
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {group.apps.map(app => {
                  const d = delayCounter * 0.03;
                  delayCounter++;
                  return <AppCard key={app.id} app={app} onOpen={handleOpenApp} delay={d} />;
                })}
              </div>
            </div>
          ))}

          {/* Fila Crecimiento + Finanzas + Contenido */}
          <div style={{ display: 'flex', gap: '28px', marginBottom: '22px' }}>
            {GROUPS_ROW2.map((group, gi) => (
              <div key={group.id} style={{ flex: gi === 2 ? 1.6 : 1 }}>
                <GroupBadge group={group} />
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {group.apps.map(app => {
                    const d = delayCounter * 0.03;
                    delayCounter++;
                    return <AppCard key={app.id} app={app} onOpen={handleOpenApp} delay={d} />;
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sistema */}
          <div style={{ marginBottom: '22px' }}>
            <GroupBadge group={GROUP_SISTEMA} />
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {GROUP_SISTEMA.apps.map(app => {
                const d = delayCounter * 0.03;
                delayCounter++;
                return <AppCard key={app.id} app={app} onOpen={handleOpenApp} delay={d} />;
              })}
            </div>
          </div>

        </div>{/* /scroll */}
      </div>{/* /main */}

      {/* ── DOCK ── */}
      <div style={{
        position: 'fixed', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '8px 14px',
        background: 'rgba(6,8,10,0.88)',
        backdropFilter: 'blur(28px) saturate(200%)',
        borderRadius: '24px',
        border: '1px solid rgba(45,212,191,0.14)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.04) inset, 0 -1px 0 rgba(0,0,0,0.3) inset',
      }}>
        {DOCK_ITEMS.map((item, i) => {
          const isActive = currentPage === item.adminPage;
          return (
            <React.Fragment key={item.id}>
              {i === 4 && (
                <div style={{ width: '1px', height: '26px', background: C.border2, margin: '0 4px' }} />
              )}
              <DockItem item={item} isActive={isActive} onOpen={handleOpenApp} />
            </React.Fragment>
          );
        })}
      </div>

      {/* ── VENTANA MODAL ── */}
      <OSWindow
        isOpen={openWindow !== null}
        onClose={handleCloseWindow}
        title={windowTitle}
        subtitle={OSModuleRegistry[openWindow ?? 'dashboard']?.subtitle ?? 'RockSage OS — módulo'}
        width={OSModuleRegistry[openWindow ?? 'dashboard']?.width ?? '880px'}
        maxHeight="84vh"
        actions={
          <button
            onClick={handleCloseWindow}
            style={{
              height: '28px', padding: '0 12px', borderRadius: '7px',
              fontSize: '11px', fontWeight: 600,
              cursor: 'pointer',
              border: `1px solid ${C.border2}`,
              background: 'transparent', color: C.text2,
              display: 'flex', alignItems: 'center', gap: '5px',
              transition: 'all 0.15s',
            }}
          >
            ← Volver al escritorio
          </button>
        }
      >
        {openWindow && OSModuleRegistry[openWindow]
          ? React.createElement(OSModuleRegistry[openWindow].component)
          : null}
      </OSWindow>

    </div>
  );
}

// ── Dock item con tooltip ─────────────────────────────────────
function DockItem({ item, isActive, onOpen }: {
  item: typeof DOCK_ITEMS[0];
  isActive: boolean;
  onOpen: (page: AdminPage) => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(item.adminPage)}
      style={{
        width: '42px', height: '42px', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', position: 'relative',
        background: isActive ? 'rgba(13,148,136,0.14)' : hover ? 'rgba(45,212,191,0.1)' : 'transparent',
        color: (isActive || hover) ? C.primaryL : C.text2,
        transform: hover ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <div style={{ width: '19px', height: '19px', transform: hover ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.18s' }}>
        {item.icon}
      </div>
      {/* Active dot */}
      {isActive && (
        <div style={{
          position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)',
          width: '3px', height: '3px', borderRadius: '50%',
          background: C.primaryL, boxShadow: `0 0 4px ${C.primaryL}`,
        }} />
      )}
      {/* Tooltip */}
      <div style={{
        position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
        transform: hover ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(4px)',
        background: 'rgba(6,8,10,0.96)', color: C.primaryL,
        fontSize: '10px', fontWeight: 600, fontFamily: "'Sora', sans-serif",
        padding: '4px 10px', borderRadius: '8px',
        whiteSpace: 'nowrap',
        opacity: hover ? 1 : 0, pointerEvents: 'none',
        transition: 'opacity 0.15s, transform 0.15s',
        border: '1px solid rgba(45,212,191,0.18)',
        letterSpacing: '0.02em',
        zIndex: 300,
      }}>
        {item.label}
      </div>
    </div>
  );
}

export default OSDesktop;
