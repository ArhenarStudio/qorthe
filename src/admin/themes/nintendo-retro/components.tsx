"use client";
// ═══════════════════════════════════════════════════════════════
// nintendo-retro/components.tsx — UI components pixel-art
// Botones, badges, cards, tabla con estilo Nintendo
// ═══════════════════════════════════════════════════════════════

import React from 'react';

// ── Paleta compartida ────────────────────────────────────────
const C = {
  mario:   '#E52521', marioH: '#FF3B38', marioL: '#FF6B6B', marioT: '#3D0A09',
  luigi:   '#1A8F1A', luigiL: '#4CAF50',
  coin:    '#FFD700', coinL:  '#FFE55C',
  sky:     '#4FC3F7', skyL:   '#81D4FA',
  pipe:    '#1A8F1A',
  bowser:  '#FF6B00',
  star:    '#FFD700',
  bg:      '#0D0D1A', surface: '#1A1A2E', surf2: '#16213E',
  border:  '#2D2D5E', border2: '#4A4A8A',
  text:    '#F8F8F8', text2: '#A0A0C0', text3: '#4A4A7A',
};

// ── Pixel border helper ──────────────────────────────────────
// Simula borde doble estilo NES/SNES con box-shadow
const pixelBorder = (color: string, shadow = '#000') =>
  `0 0 0 2px ${color}, 0 0 0 4px ${shadow}, 4px 4px 0px ${shadow}`;

// ── NintendoCard ─────────────────────────────────────────────
export function NintendoCard({ children, className, style }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        background: C.surface,
        border: `2px solid ${C.border2}`,
        borderRadius: '4px',
        boxShadow: `4px 4px 0px #000`,
        padding: '16px',
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      {children}
    </div>
  );
}

// ── NintendoBadge ────────────────────────────────────────────
type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'mario' | 'luigi' | 'coin';

const BADGE_STYLES: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  default: { bg: 'rgba(45,45,94,0.8)',  color: C.text2,  border: C.border2 },
  success: { bg: 'rgba(26,143,26,0.15)', color: C.luigiL, border: C.luigi },
  warning: { bg: 'rgba(255,215,0,0.15)', color: C.coin,   border: C.coin },
  error:   { bg: 'rgba(229,37,33,0.15)', color: C.marioL, border: C.mario },
  info:    { bg: 'rgba(79,195,247,0.15)',color: C.sky,    border: C.sky },
  mario:   { bg: C.marioT,              color: C.marioL, border: C.mario },
  luigi:   { bg: 'rgba(26,143,26,0.2)', color: C.luigiL, border: C.luigi },
  coin:    { bg: 'rgba(255,215,0,0.15)', color: C.coin,   border: C.coin },
};

export function NintendoBadge({ text, variant = 'default', className }: {
  text: string; variant?: string; className?: string;
}) {
  const s = BADGE_STYLES[(variant as BadgeVariant)] ?? BADGE_STYLES['default'];
  return (
    <span className={className} style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px',
      background: s.bg, color: s.color,
      border: `2px solid ${s.border}`,
      borderRadius: '2px',
      fontSize: '8px', fontWeight: 400,
      fontFamily: "'Press Start 2P', monospace",
      letterSpacing: '0.04em',
      boxShadow: `2px 2px 0px #000`,
    }}>
      {text}
    </span>
  );
}

// ── NintendoButton ───────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'coin';

const BTN_STYLES: Record<ButtonVariant, { bg: string; color: string; border: string; shadow: string }> = {
  primary:   { bg: C.mario,  color: '#fff', border: '#8B0000', shadow: '#5B0000' },
  secondary: { bg: C.surf2,  color: C.text2, border: C.border2, shadow: '#000' },
  danger:    { bg: '#8B0000',color: C.marioL, border: C.mario, shadow: '#3D0000' },
  coin:      { bg: C.coin,   color: '#000', border: '#B8860B', shadow: '#7A5C00' },
};

export function NintendoButton({ children, variant = 'secondary', onClick, disabled, className }: {
  children: React.ReactNode; variant?: string; size?: string;
  onClick?: () => void; disabled?: boolean; className?: string;
}) {
  const s = BTN_STYLES[(variant as ButtonVariant)] ?? BTN_STYLES['secondary'];
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className={className}
      style={{
        background: s.bg, color: s.color,
        border: `2px solid ${s.border}`,
        borderRadius: '4px',
        padding: '6px 14px',
        fontSize: '9px', fontFamily: "'Press Start 2P', monospace",
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: pressed ? 'none' : `3px 3px 0px ${s.shadow}`,
        transform: pressed ? 'translate(3px, 3px)' : 'translate(0,0)',
        transition: 'transform 0.05s, box-shadow 0.05s',
        opacity: disabled ? 0.5 : 1,
        outline: 'none',
        letterSpacing: '0.03em',
      }}
    >
      {children}
    </button>
  );
}

// ── NintendoTable ────────────────────────────────────────────
export function NintendoTable({ children, style }: {
  children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <table style={{
      width: '100%', borderCollapse: 'collapse',
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '9px',
      ...style,
    }}>
      {children}
    </table>
  );
}

// ── NintendoStatCard ─────────────────────────────────────────
export function NintendoStatCard({ label, value, change, changeType, icon }: {
  label: string; value: string | number; change?: string; changeType?: string; icon?: React.ReactNode;
}) {
  const deltaColor = changeType === 'down' ? C.mario : C.luigiL;
  return (
    <div style={{
      background: C.surface,
      border: `2px solid ${C.coin}`,
      borderRadius: '4px',
      padding: '14px',
      boxShadow: `4px 4px 0px #000`,
      position: 'relative', overflow: 'hidden',
      fontFamily: "'Press Start 2P', monospace",
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '8px', background: C.coin, opacity: 0.6 }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: C.coin, opacity: 0.6 }} />
      <div style={{ fontSize: '8px', color: C.text2, marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
        {label}
      </div>
      <div style={{ fontSize: '20px', color: C.text, fontWeight: 400, lineHeight: 1, marginBottom: '6px', textShadow: '2px 2px 0px #000' }}>
        {value}
      </div>
      {change && (
        <div style={{ fontSize: '8px', color: deltaColor }}>{change}</div>
      )}
      {icon && (
        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.08 }}>
          {icon}
        </div>
      )}
    </div>
  );
}
