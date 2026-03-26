"use client";
// =================================================================
// NintendoDesktop.tsx — RockSage OS: tema Nintendo Retro
// Canvas: estrellas parpadeantes + bloques pixelados flotantes
// Paleta: Rojo Mario, Verde Luigi, Amarillo Coin, Azul Cielo
// =================================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import type { AdminPage } from '@/src/admin/navigation';
import { NintendoWindow } from './NintendoWindow';

// ── Paleta Nintendo ─────────────────────────────────────────────
const C = {
  bg: '#0D0D1A', surface: '#1A1A2E', surf2: '#16213E',
  border: '#2D2D5E', border2: '#4A4A8A',
  mario: '#E52521', marioH: '#FF3B38', marioL: '#FF6B6B', marioT: '#3D0A09',
  luigi: '#1A8F1A', luigiL: '#4CAF50',
  coin: '#FFD700', coinL: '#FFE55C',
  sky: '#4FC3F7', skyL: '#81D4FA',
  bowser: '#FF6B00', bowserL: '#FFA040',
  purple: '#9B27AF', purpleL: '#CE93D8',
  text: '#F8F8F8', text2: '#A0A0C0', text3: '#4A4A7A',
} as const;

// ── Tipos ───────────────────────────────────────────────────────
interface AppDef {
  id: string; label: string; icon: React.ReactNode;
  iconBg: string; iconBorder: string; badge?: number; adminPage: AdminPage;
}
interface GroupDef {
  id: string; label: string;
  badgeBg: string; badgeColor: string; badgeBorder: string;
  apps: AppDef[];
}
interface KpiDef {
  label: string; value: string; delta: string;
  deltaType: 'up' | 'down' | 'warn';
  color: string; icon: React.ReactNode;
}

// ── KPI Cards ───────────────────────────────────────────────────
function PixelKpiCard({ kpi }: { kpi: KpiDef }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        flex: 1, minWidth: 0, padding: '10px 12px',
        background: hover ? C.surf2 : C.surface,
        border: `2px solid ${hover ? kpi.color : C.border}`,
        borderRadius: '4px', cursor: 'default', position: 'relative', overflow: 'hidden',
        boxShadow: hover ? `4px 4px 0px #000, 0 0 16px ${kpi.color}28` : '3px 3px 0px #000',
        transform: hover ? 'translateY(-2px)' : 'none', transition: 'all 0.15s',
      }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: kpi.color, opacity: hover ? 1 : 0.4 }} />
      <div style={{ fontSize: '7px', fontFamily: "'Press Start 2P', monospace",
        textTransform: 'uppercase', color: C.text2, marginBottom: '6px', letterSpacing: '0.06em' }}>
        {kpi.label}
      </div>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '16px',
        color: C.text, lineHeight: 1, marginBottom: '4px', textShadow: '2px 2px 0 #000' }}>
        {kpi.value}
      </div>
      <div style={{ fontSize: '7px', fontFamily: "'Press Start 2P', monospace", color: kpi.color }}>
        {kpi.deltaType === 'up' ? '▲' : kpi.deltaType === 'down' ? '▼' : '!'} {kpi.delta}
      </div>
    </div>
  );
}

// ── App Card ─────────────────────────────────────────────────────
function PixelAppCard({ app, onOpen }: { app: AppDef; onOpen: (p: AdminPage) => void }) {
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
        width: '100px', padding: '12px 6px 9px',
        background: hover ? C.surf2 : C.surface,
        border: `2px solid ${hover ? app.iconBorder : C.border}`,
        borderRadius: '4px', cursor: 'pointer', position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
        boxShadow: pressed ? 'none' : hover ? `4px 4px 0 #000, 0 0 18px ${app.iconBorder}30` : '3px 3px 0 #000',
        transform: pressed ? 'translate(3px,3px)' : hover ? 'translateY(-3px)' : 'none',
        transition: pressed ? 'all 0.05s' : 'all 0.14s',
      }}
    >
      <div style={{
        width: '46px', height: '46px', borderRadius: '4px',
        background: app.iconBg, border: `2px solid ${app.iconBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: hover ? `0 0 12px ${app.iconBorder}60, 2px 2px 0 #000` : '2px 2px 0 #000',
        position: 'relative',
      }}>
        {app.badge != null && app.badge > 0 && (
          <div style={{
            position: 'absolute', top: '-6px', right: '-6px',
            minWidth: '16px', height: '16px', background: C.mario, color: '#fff',
            fontSize: '7px', fontFamily: "'Press Start 2P', monospace",
            borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px', border: `2px solid ${C.bg}`, boxShadow: '2px 2px 0 #000',
          }}>{app.badge}</div>
        )}
        <div style={{ width: '22px', height: '22px' }}>{app.icon}</div>
      </div>
      <span style={{
        fontSize: '8px', fontFamily: "'Press Start 2P', monospace",
        color: hover ? C.text : C.text2, textAlign: 'center',
        lineHeight: 1.4, maxWidth: '88px', wordBreak: 'break-word',
      }}>{app.label}</span>
    </div>
  );
}

// ── Group Header ─────────────────────────────────────────────────
function PixelGroupHeader({ group }: { group: GroupDef }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
      <span style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: '8px',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        padding: '4px 10px', borderRadius: '2px',
        background: group.badgeBg, color: group.badgeColor,
        border: `2px solid ${group.badgeBorder}`,
        boxShadow: '2px 2px 0 #000', whiteSpace: 'nowrap',
      }}>{group.label}</span>
      <div style={{ flex: 1, height: '2px', opacity: 0.4,
        background: `repeating-linear-gradient(90deg,${group.badgeBorder} 0,${group.badgeBorder} 4px,transparent 4px,transparent 8px)` }} />
      <span style={{ fontSize: '8px', fontFamily: "'Press Start 2P', monospace", color: C.text3 }}>
        {String(group.apps.length).padStart(2, '0')}
      </span>
    </div>
  );
}

// ── Dock Item ─────────────────────────────────────────────────────
function DockItem({ label, icon, isActive, color, onClick }: {
  label: string; icon: React.ReactNode; isActive: boolean; color: string; onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onClick}>
      {hover && (
        <div style={{
          position: 'absolute', bottom: '100%', marginBottom: '6px',
          background: C.surface, color: C.text,
          fontSize: '7px', fontFamily: "'Press Start 2P', monospace",
          padding: '4px 8px', border: `2px solid ${color}`,
          borderRadius: '2px', whiteSpace: 'nowrap',
          boxShadow: '2px 2px 0 #000', pointerEvents: 'none', zIndex: 1,
        }}>{label}</div>
      )}
      <div style={{
        width: 40, height: 40, borderRadius: '4px',
        background: hover ? C.surf2 : C.surface,
        border: `2px solid ${isActive ? color : C.border2}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isActive ? color : C.text2,
        boxShadow: hover ? `3px 3px 0 #000, 0 0 12px ${color}50` : '2px 2px 0 #000',
        transform: hover ? 'translateY(-3px)' : 'none', transition: 'all 0.12s',
      }}>
        <div style={{ width: 18, height: 18 }}>{icon}</div>
      </div>
      {isActive && <div style={{ width: 4, height: 4, background: color, marginTop: '3px',
        borderRadius: '1px', boxShadow: '1px 1px 0 #000' }} />}
    </div>
  );
}

// ── Grupos de apps ────────────────────────────────────────────────
const ALL_GROUPS: GroupDef[] = [
  {
    id: 'ventas', label: '1-UP VENTAS',
    badgeBg: C.marioT, badgeColor: C.marioL, badgeBorder: C.mario,
    apps: [
      { id:'dashboard', label:'Dashboard', adminPage:'dashboard',
        iconBg:'linear-gradient(145deg,#3D0A09,#8B0000)', iconBorder:C.mario,
        icon:<svg viewBox="0 0 24 24" fill="none" stroke={C.marioL} strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg> },
      { id:'pos', label:'POS', adminPage:'pos',
        iconBg:'linear-gradient(145deg,#3D0A09,#8B0000)', iconBorder:C.mario,
        icon:<svg viewBox="0 0 24 24" fill="none" stroke={C.marioL} strokeWidth="1.7" strokeLinecap="round"><rect x="2" y="4" width="20" height="14" rx="1"/><path d="M2 9.5h20M7 14h.01M11 14h.01M15 14h.01"/></svg> },
      { id:'orders', label:'Pedidos', adminPage:'orders', badge:7,
        iconBg:'linear-gradient(145deg,#3D0A09,#8B0000)', iconBorder:C.mario,
        icon:<svg viewBox="0 0 24 24" fill="none" stroke={C.marioL} strokeWidth="1.7" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
      { id:'shipping', label:'Envios', adminPage:'shipping',
        iconBg:'linear-gradient(145deg,#3D0A09,#8B0000)', iconBorder:C.mario,
        icon:<svg viewBox="0 0 24 24" fill="none" stroke={C.marioL} strokeWidth="1.7" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8l5 3-5 3V8z"/></svg> },
      { id:'quotes', label:'Cotizac.', adminPage:'quotes',
        iconBg:'linear-gradient(145deg,#3D0A09,#8B0000)', iconBorder:C.mario,
        icon:<svg viewBox="0 0 24 24" fill="none" stroke={C.marioL} strokeWidth="1.7" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg> },
      { id:'returns', label:'Devol.', adminPage:'returns',
        iconBg:'linear-gradient(145deg,#3D0A09,#8B0000)', iconBorder:C.mario,
        icon:<svg viewBox="0 0 24 24" fill="none" stroke={C.marioL} strokeWidth="1.7" strokeLinecap="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg> },
    ],
  },
  {
    id:'catalogo', label:'CATALOGO WORLD',
    badgeBg:'rgba(26,143,26,0.2)', badgeColor:C.luigiL, badgeBorder:C.luigi,
    apps:[
      { id:'products', label:'Productos', adminPage:'products',
        iconBg:'linear-gradient(145deg,#0A2E0C,#1A5C1E)', iconBorder:C.luigi,
        icon:<svg viewBox="0 0 24 24" fill="none" stroke={C.luigiL} strokeWidth="1.7" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
      { id:'inventory', label:'Inventario', adminPage:'inventory',
        iconBg:'linear-gradient(145deg,#0A2E0C,#1A5C1E)', iconBorder:C.luigi,
        icon:<svg viewBox="0 0 24 24" fill="none" stroke={C.luigiL} strokeWidth="1.7" strokeLinecap="round"><path d="M3 3h4v4H3zM10 3h4v4h-4zM17 3h4v4h-4zM3 10h4v4H3zM10 10h4v4h-4zM17 10h4v4h-4zM3 17h4v4H3zM10 17h4v4h-4zM17 17h4v4h-4z"/></svg> },
      { id:'categories', label:'Categorias', adminPage:'categories',
        iconBg:'linear-gradient(145deg,#0A2E0C,#1A5C1E)', iconBorder:C.luigi,
        icon:<svg viewBox="0 0 24 24" fill="none" stroke={C.luigiL} strokeWidth="1.7" strokeLinecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg> },
    ],
  },
  {
    id:'clientes', label:'STAR PLAYERS',
    badgeBg:'rgba(79,195,247,0.1)', badgeColor:C.skyL, badgeBorder:C.sky,
    apps:[
      { id:'customers', label:'Clientes', adminPage:'customers',
        iconBg:'linear-gradient(145deg,#0A1F2E,#0D3B5C)', iconBorder:C.sky,
        icon:<svg viewBox="0 0 24 24" fill="none" stroke={C.skyL} strokeWidth="1.7" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
      { id:'reviews', label:'Reviews', adminPage:'reviews',
        iconBg:'linear-gradient(145deg,#0A1F2E,#0D3B5C)', iconBorder:C.sky,
        icon:<svg viewBox="0 0 24 24" fill="none" stroke={C.skyL} strokeWidth="1.7" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
      { id:'loyalty', label:'Membresias', adminPage:'loyalty',
        iconBg:'linear-gradient(145deg,#0A1F2E,#0D3B5C)', iconBorder:C.sky,
        icon:<svg viewBox="0 0 24 24" fill="none" stroke={C.skyL} strokeWidth="1.7" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
      { id:'chat', label:'Chat', adminPage:'chat', badge:3,
        iconBg:'linear-gradient(145deg,#0A1F2E,#0D3B5C)', iconBorder:C.sky,
        icon:<svg viewBox="0 0 24 24" fill="none" stroke={C.skyL} strokeWidth="1.7" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
      { id:'support', label:'Soporte', adminPage:'helpdesk',
        iconBg:'linear-gradient(145deg,#0A1F2E,#0D3B5C)', iconBorder:C.sky,
        icon:<svg viewBox="0 0 24 24" fill="none" stroke={C.skyL} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
    ],
  },
  {
    id:'crecimiento', label:'BONUS STAGE',
    badgeBg:'rgba(155,39,175,0.15)', badgeColor:'#CE93D8', badgeBorder:'#9B27AF',
    apps:[
      { id:'marketing', label:'Marketing', adminPage:'marketing',
        iconBg:'linear-gradient(145deg,#1A0828,#4A0A70)', iconBorder:'#9B27AF',
        icon:<svg viewBox="0 0 24 24" fill="none" stroke="#CE93D8" strokeWidth="1.7" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
      { id:'goals', label:'OKRs', adminPage:'goals',
        iconBg:'linear-gradient(145deg,#1A0828,#4A0A70)', iconBorder:'#9B27AF',
        icon:<svg viewBox="0 0 24 24" fill="none" stroke="#CE93D8" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
    ],
  },
  {
    id:'finanzas', label:'COIN BANK',
    badgeBg:'rgba(255,215,0,0.12)', badgeColor:'#FFE55C', badgeBorder:'#FFD700',
    apps:[
      { id:'finances', label:'Finanzas', adminPage:'finances',
        iconBg:'linear-gradient(145deg,#2E2500,#5A4400)', iconBorder:'#FFD700',
        icon:<svg viewBox="0 0 24 24" fill="none" stroke="#FFE55C" strokeWidth="1.7" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
      { id:'reports', label:'Reportes', adminPage:'reports',
        iconBg:'linear-gradient(145deg,#2E2500,#5A4400)', iconBorder:'#FFD700',
        icon:<svg viewBox="0 0 24 24" fill="none" stroke="#FFE55C" strokeWidth="1.7" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    ],
  },
  {
    id:'contenido', label:'WORLD MAP',
    badgeBg:'rgba(255,107,0,0.12)', badgeColor:'#FFA040', badgeBorder:'#FF6B00',
    apps:[
      { id:'cms', label:'CMS', adminPage:'cms',
        iconBg:'linear-gradient(145deg,#2E1200,#5A2400)', iconBorder:'#FF6B00',
        icon:<svg viewBox="0 0 24 24" fill="none" stroke="#FFA040" strokeWidth="1.7" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
      { id:'theme', label:'Temas', adminPage:'theme',
        iconBg:'linear-gradient(145deg,#2E1200,#5A2400)', iconBorder:'#FF6B00',
        icon:<svg viewBox="0 0 24 24" fill="none" stroke="#FFA040" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg> },
      { id:'appearance', label:'Apariencia', adminPage:'appearance',
        iconBg:'linear-gradient(145deg,#2E1200,#5A2400)', iconBorder:'#FF6B00',
        icon:<svg viewBox="0 0 24 24" fill="none" stroke="#FFA040" strokeWidth="1.7" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg> },
    ],
  },
  {
    id:'sistema', label:'BOWSER CASTLE',
    badgeBg:'rgba(74,74,138,0.2)', badgeColor:'#A0A0E0', badgeBorder:'#4A4A8A',
    apps:[
      { id:'automations', label:'Automatiz.', adminPage:'automations',
        iconBg:'linear-gradient(145deg,#0D0D1A,#2D2D5E)', iconBorder:'#4A4A8A',
        icon:<svg viewBox="0 0 24 24" fill="none" stroke="#A0A0E0" strokeWidth="1.7" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> },
      { id:'integrations', label:'Integrac.', adminPage:'integrations',
        iconBg:'linear-gradient(145deg,#0D0D1A,#2D2D5E)', iconBorder:'#4A4A8A',
        icon:<svg viewBox="0 0 24 24" fill="none" stroke="#A0A0E0" strokeWidth="1.7" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> },
      { id:'importexport', label:'Imp/Exp', adminPage:'importexport',
        iconBg:'linear-gradient(145deg,#0D0D1A,#2D2D5E)', iconBorder:'#4A4A8A',
        icon:<svg viewBox="0 0 24 24" fill="none" stroke="#A0A0E0" strokeWidth="1.7" strokeLinecap="round"><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg> },
      { id:'team', label:'Equipo', adminPage:'users',
        iconBg:'linear-gradient(145deg,#0D0D1A,#2D2D5E)', iconBorder:'#4A4A8A',
        icon:<svg viewBox="0 0 24 24" fill="none" stroke="#A0A0E0" strokeWidth="1.7" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
      { id:'settings', label:'Config.', adminPage:'settings',
        iconBg:'linear-gradient(145deg,#0D0D1A,#2D2D5E)', iconBorder:'#4A4A8A',
        icon:<svg viewBox="0 0 24 24" fill="none" stroke="#A0A0E0" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
    ],
  },
];

const KPIS: KpiDef[] = [
  { label:'MONEDAS HOY',    value:'$4,280', delta:'+12%',     deltaType:'up',   color:C.coin,
    icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.coin} strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 6v12M9 9h4.5a1.5 1.5 0 010 3H9m0 0h4.5a2 2 0 010 4H9"/></svg> },
  { label:'PEDIDOS ACTIVOS', value:'23',    delta:'+3 NUEVOS', deltaType:'up',   color:C.mario,
    icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.mario} strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg> },
  { label:'PLAYERS NUEVOS',  value:'8',     delta:'-2 HOY',   deltaType:'down', color:C.sky,
    icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.sky} strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { label:'TICKET PROM.',    value:'$186',  delta:'+8%',      deltaType:'up',   color:C.luigiL,
    icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.luigiL} strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { label:'CHAT EN VIVO',   value:'3',     delta:'! ESPERA', deltaType:'warn', color:C.bowserL,
    icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.bowserL} strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
];

const DOCK_APPS: { id:string; label:string; adminPage:AdminPage; color:string; icon:React.ReactNode }[] = [
  { id:'dashboard', label:'START',   adminPage:'dashboard', color:C.mario,
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg> },
  { id:'pos', label:'POS', adminPage:'pos', color:C.luigi,
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="14" rx="1"/><path d="M2 9.5h20"/></svg> },
  { id:'orders', label:'PEDIDOS', adminPage:'orders', color:C.coin,
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg> },
  { id:'chat', label:'CHAT', adminPage:'chat', color:C.sky,
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
  { id:'settings', label:'CONFIG', adminPage:'settings', color:'#A0A0E0',
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09"/></svg> },
];

const PAGE_TITLES: Partial<Record<AdminPage, string>> = {
  dashboard:'Dashboard', pos:'Punto de Venta', orders:'Pedidos',
  shipping:'Envios', quotes:'Cotizaciones', returns:'Devoluciones',
  products:'Productos', inventory:'Inventario', categories:'Categorias',
  customers:'Clientes', reviews:'Reviews', loyalty:'Membresias',
  chat:'Chat en Vivo', helpdesk:'Soporte', marketing:'Marketing',
  goals:'Metas & OKRs', finances:'Finanzas', reports:'Reportes',
  cms:'CMS', theme:'Editor de Tema', appearance:'Apariencia',
  automations:'Automatizaciones', integrations:'Integraciones',
  importexport:'Import/Export', users:'Equipo',
  settings:'Configuracion', notifications:'Notificaciones',
};

// ── Componente principal ──────────────────────────────────────────
export default function NintendoDesktop({ children }: { children: React.ReactNode }) {
  const { navigate: navigateTo, currentPage } = useAdmin();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const [openPage, setOpenPage] = useState<AdminPage | null>(null);
  const [clock,    setClock]    = useState('');
  const [activeId, setActiveId] = useState<string>('dashboard');

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    interface Star { x:number; y:number; r:number; a:number; ta:number; td:number }
    interface Block { x:number; y:number; sz:number; a:number; sp:number; color:string; spin:number; spinSp:number }

    let stars: Star[] = [];
    let blocks: Block[] = [];

    const init = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      stars  = Array.from({length:100}, () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.3, a: Math.random(),
        ta: Math.random() * 0.018 + 0.005, td: Math.random() > 0.5 ? 1 : -1,
      }));
      const cols = [C.mario, C.coin, C.luigi, C.sky, '#9B27AF', C.bowser];
      blocks = Array.from({length:14}, () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        sz: Math.random() * 9 + 5, a: Math.random() * 0.1 + 0.03,
        sp: Math.random() * 0.14 + 0.04,
        color: cols[Math.floor(Math.random() * cols.length)],
        spin: Math.random() * Math.PI * 2, spinSp: (Math.random() - 0.5) * 0.012,
      }));
    };

    init();
    window.addEventListener('resize', init);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.a += s.ta * s.td;
        if (s.a >= 1) { s.td = -1; s.a = 1; }
        if (s.a <= 0.05) { s.td = 1; s.a = 0.05; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx.fill();
      });
      blocks.forEach(b => {
        b.y -= b.sp; b.spin += b.spinSp;
        if (b.y + b.sz < 0) { b.y = canvas.height + b.sz; b.x = Math.random() * canvas.width; }
        ctx.save();
        ctx.translate(b.x + b.sz / 2, b.y + b.sz / 2);
        ctx.rotate(b.spin); ctx.globalAlpha = b.a;
        ctx.fillStyle = b.color;
        ctx.fillRect(-b.sz / 2, -b.sz / 2, b.sz, b.sz);
        if (b.sz > 10) {
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fillRect(-b.sz / 2 + 1, -b.sz / 2 + 1, 2, 2);
          ctx.fillRect(b.sz / 2 - 3, -b.sz / 2 + 1, 2, 2);
        }
        ctx.restore(); ctx.globalAlpha = 1;
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', init); };
  }, []);

  const handleOpen = useCallback((page: AdminPage) => {
    navigateTo(page); setActiveId(page); setOpenPage(page);
  }, [navigateTo]);

  const handleClose = useCallback(() => setOpenPage(null), []);

  return (
    <div style={{ position:'fixed', inset:0, background:C.bg, overflow:'hidden',
      fontFamily:"'Press Start 2P', 'DM Sans', monospace", zIndex:0 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>

      {/* Canvas */}
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, zIndex:0, pointerEvents:'none' }} />

      {/* Radial glow */}
      <div style={{ position:'absolute', inset:0, zIndex:0, pointerEvents:'none', background:`
        radial-gradient(ellipse 600px 400px at 10% 15%, rgba(229,37,33,0.08) 0%,transparent 70%),
        radial-gradient(ellipse 500px 350px at 90% 85%, rgba(255,215,0,0.07) 0%,transparent 70%),
        radial-gradient(ellipse 400px 300px at 50% 50%, rgba(79,195,247,0.04) 0%,transparent 70%)` }} />

      {/* MENUBAR */}
      <div style={{ position:'relative', zIndex:10, height:'38px', display:'flex', alignItems:'center',
        padding:'0 14px', gap:'10px', background:'rgba(26,26,46,0.97)',
        borderBottom:`3px solid ${C.mario}`, boxShadow:`0 3px 0 #5B0000` }}>
        <div style={{ width:24, height:24, borderRadius:'50%',
          background:`radial-gradient(circle at 35% 35%,${C.marioH},${C.mario})`,
          border:`2px solid #8B0000`, boxShadow:'2px 2px 0 #000',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span style={{ fontSize:'10px', color:'#fff', lineHeight:1 }}>N</span>
        </div>
        <span style={{ fontSize:'9px', color:C.text, letterSpacing:'0.1em', textShadow:'1px 1px 0 #000' }}>ROCKSAGE OS</span>
        <div style={{ width:1, height:16, background:C.border2 }} />
        <span style={{ fontSize:'8px', color:C.text2 }}>QORTHE&apos;S DESIGN</span>
        <span style={{ fontSize:'7px', color:'#000', background:C.coin, padding:'2px 7px',
          borderRadius:'2px', border:`2px solid #B8860B`, boxShadow:'2px 2px 0 #000' }}>PLAYER 1</span>
        <div style={{ flex:1 }} />
        <span style={{ fontFamily:"'Press Start 2P', monospace", fontSize:'9px', color:C.luigiL,
          textShadow:`0 0 8px ${C.luigiL}60` }}>{clock}</span>
        <div style={{ width:26, height:26, borderRadius:'50%',
          background:`linear-gradient(135deg,${C.mario},#8B0000)`,
          border:`2px solid ${C.coin}`, display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'2px 2px 0 #000', fontSize:'8px', color:'#fff', cursor:'pointer' }}>DA</div>
      </div>

      {/* KPI BAR */}
      <div style={{ position:'relative', zIndex:9, display:'flex', gap:'8px', padding:'10px 14px 0' }}>
        {KPIS.map(k => <PixelKpiCard key={k.label} kpi={k} />)}
      </div>

      {/* APP GRID */}
      <div style={{ position:'relative', zIndex:8, overflowY:'auto', overflowX:'hidden',
        height:'calc(100vh - 38px - 74px - 68px)', padding:'14px 14px 0', marginTop:'10px' }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'22px 32px', paddingBottom:'80px' }}>
          {ALL_GROUPS.map(group => (
            <div key={group.id}>
              <PixelGroupHeader group={group} />
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {group.apps.map(app => (
                  <PixelAppCard key={app.id} app={app} onOpen={handleOpen} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DOCK */}
      <div style={{ position:'fixed', bottom:'14px', left:'50%', transform:'translateX(-50%)',
        zIndex:20, display:'flex', alignItems:'center', gap:'6px',
        background:'rgba(26,26,46,0.94)', backdropFilter:'blur(12px)',
        border:`2px solid ${C.mario}`, borderRadius:'6px',
        padding:'7px 12px', boxShadow:`4px 4px 0 #000, 0 0 24px rgba(229,37,33,0.25)` }}>
        {DOCK_APPS.map((item, idx) => {
          const isActive = activeId === item.id;
          return (
            <React.Fragment key={item.id}>
              {idx === 3 && <div style={{ width:2, height:36, background:C.border2, alignSelf:'center', margin:'0 4px' }} />}
              <DockItem label={item.label} icon={item.icon} isActive={isActive}
                color={item.color} onClick={() => handleOpen(item.adminPage)} />
            </React.Fragment>
          );
        })}
      </div>

      {/* VENTANA MODAL */}
      {openPage && (
        <NintendoWindow
          title={(PAGE_TITLES[openPage] ?? openPage).toUpperCase()}
          onClose={handleClose}
        >
          {children}
        </NintendoWindow>
      )}
    </div>
  );
}
