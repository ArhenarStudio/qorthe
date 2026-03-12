"use client";
// ═══════════════════════════════════════════════════════════════
// OSModuleRegistry.tsx — Mapa AdminPage → componente de ventana OS
//
// Cada entrada define:
//   component : React.ComponentType renderizado dentro de OSWindow
//   subtitle  : texto bajo el título de la ventana
//   width     : ancho de la OSWindow (default "880px")
//
// Para módulos sin ventana OS dedicada se muestra OSFallbackModule
// con un iframe del panel clásico (fallback temporal).
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import type { AdminPage } from '@/src/admin/navigation';
import { POSWindowModule } from './modules/POSWindowModule';

// ── Fallback genérico ─────────────────────────────────────────
function OSFallbackModule({ page }: { page: AdminPage }) {
  const C = {
    bg: '#08090B', surface: '#0F1114', border: '#1A2228',
    text: '#E8ECF0', text2: '#6B7A85', primary: '#0D9488', primaryL: '#2DD4BF',
  };
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '380px', gap: '14px',
    }}>
      <div style={{
        width: '56px', height: '56px', borderRadius: '16px',
        background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={C.primaryL} strokeWidth="1.5" width="26" height="26">
          <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z"/>
          <circle cx="12" cy="12" r="3" fill={C.primary} opacity="0.5"/>
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: C.text, fontFamily: "'Sora', sans-serif", marginBottom: '6px' }}>
          Módulo en construcción
        </div>
        <div style={{ fontSize: '12px', color: C.text2, maxWidth: '280px', lineHeight: 1.6 }}>
          La ventana OS para <span style={{ color: C.primaryL, fontFamily: "'JetBrains Mono', monospace" }}>{page}</span> está siendo implementada.
        </div>
      </div>
      <a
        href={`/admin/${page}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginTop: '8px', padding: '8px 20px', borderRadius: '9px',
          fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          background: 'rgba(13,148,136,0.12)', color: C.primaryL,
          border: '1px solid rgba(13,148,136,0.25)',
          textDecoration: 'none',
          transition: 'all 0.15s',
        }}
      >
        Abrir en vista completa →
      </a>
    </div>
  );
}

// ── Tipo del registry ─────────────────────────────────────────
interface OSModuleEntry {
  component: React.ComponentType;
  subtitle: string;
  width?: string;
}

// ── Registry principal ────────────────────────────────────────
// Módulos con ventana OS dedicada van aquí.
// El resto cae en el fallback dinámico (ver abajo).
const DEDICATED: Partial<Record<AdminPage, OSModuleEntry>> = {
  pos: {
    component: POSWindowModule,
    subtitle: 'Venta directa y presencial',
    width: '1100px',
  },
};

// ── Proxy que genera fallback dinámico ────────────────────────
export const OSModuleRegistry = new Proxy(DEDICATED, {
  get(target, prop: string) {
    const page = prop as AdminPage;
    if (target[page]) return target[page];
    // Fallback dinámico: componente anónimo con la page inyectada
    return {
      component: () => React.createElement(OSFallbackModule, { page }),
      subtitle: 'RockSage OS — módulo',
      width: '680px',
    } satisfies OSModuleEntry;
  },
}) as Record<AdminPage, OSModuleEntry>;
