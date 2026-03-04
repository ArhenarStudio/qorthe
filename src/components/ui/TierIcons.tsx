// ═══════════════════════════════════════════════════════════
// TierIcons — Custom SVG icons for each membership tier.
// Inspired by the wood grain and character of each species.
// Use <TierIcon tierId="pino" /> or getTierIcon("nogal")
// ═══════════════════════════════════════════════════════════

import React from 'react';
import { DEFAULT_LOYALTY_CONFIG, normalizeTierId } from '@/data/loyalty';

interface TierIconProps {
  size?: number;
  className?: string;
}

// ── Pino: Young tree rings — simple, clean, welcoming ───
export const PinoIcon: React.FC<TierIconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Tree rings — simple concentric arcs suggesting pine cross-section */}
    <circle cx="12" cy="12" r="10" stroke="#D4B896" strokeWidth="1.5" fill="#F2E6D0" />
    <circle cx="12" cy="12" r="7" stroke="#D4B896" strokeWidth="1" fill="none" opacity="0.6" />
    <circle cx="12" cy="12" r="4" stroke="#A08060" strokeWidth="1" fill="none" opacity="0.5" />
    <circle cx="12" cy="12" r="1.5" fill="#A08060" opacity="0.7" />
    {/* Small pine needle accent */}
    <path d="M12 2.5 L13 5 L12 4.5 L11 5 Z" fill="#A08060" opacity="0.6" />
  </svg>
);

// ── Nogal: Walnut cross-section — rich, layered, substantial ─
export const NogalIcon: React.FC<TierIconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Walnut shape with wood grain */}
    <circle cx="12" cy="12" r="10" stroke="#5C4033" strokeWidth="1.5" fill="#8B7355" />
    <ellipse cx="12" cy="12" rx="7" ry="8" stroke="#5C4033" strokeWidth="0.8" fill="none" opacity="0.5" />
    <ellipse cx="12" cy="12" rx="4" ry="5.5" stroke="#3B2716" strokeWidth="0.8" fill="none" opacity="0.5" />
    <ellipse cx="12" cy="12" rx="1.5" ry="2.5" fill="#3B2716" opacity="0.6" />
    {/* Walnut shell ridge line */}
    <path d="M5 12 C8 8, 16 8, 19 12" stroke="#3B2716" strokeWidth="0.7" fill="none" opacity="0.4" />
    <path d="M5 12 C8 16, 16 16, 19 12" stroke="#3B2716" strokeWidth="0.7" fill="none" opacity="0.4" />
  </svg>
);

// ── Parota: Golden sun/flower — radiant, premium, Mexican ─
export const ParotaIcon: React.FC<TierIconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Golden radial — like a parota slab's golden rays */}
    <circle cx="12" cy="12" r="10" stroke="#C49A3C" strokeWidth="1.5" fill="#E8C87A" />
    <circle cx="12" cy="12" r="4" fill="#C49A3C" opacity="0.7" />
    {/* Radiating grain lines */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
      <line
        key={angle}
        x1="12" y1="12"
        x2={12 + 8 * Math.cos((angle * Math.PI) / 180)}
        y2={12 + 8 * Math.sin((angle * Math.PI) / 180)}
        stroke="#8B6F1E"
        strokeWidth="0.6"
        opacity="0.35"
      />
    ))}
    {/* Inner golden ring */}
    <circle cx="12" cy="12" r="6.5" stroke="#8B6F1E" strokeWidth="0.8" fill="none" opacity="0.4" />
    {/* Center jewel */}
    <circle cx="12" cy="12" r="1.8" fill="#8B6F1E" opacity="0.8" />
  </svg>
);

// ── Ébano: Diamond/obsidian — ultra-premium, dark, elite ─
export const EbanoIcon: React.FC<TierIconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* Dark gem shape */}
    <circle cx="12" cy="12" r="10" stroke="#1A1A28" strokeWidth="1.5" fill="#2D2D3D" />
    {/* Diamond facets */}
    <polygon points="12,3 19,12 12,21 5,12" stroke="#C5A065" strokeWidth="0.8" fill="none" opacity="0.5" />
    <polygon points="12,6 16.5,12 12,18 7.5,12" stroke="#C5A065" strokeWidth="0.6" fill="none" opacity="0.35" />
    {/* Central shine */}
    <polygon points="12,9 14,12 12,15 10,12" fill="#C5A065" opacity="0.25" />
    {/* Top sparkle */}
    <line x1="12" y1="4.5" x2="12" y2="6.5" stroke="#C5A065" strokeWidth="0.8" opacity="0.6" />
    <line x1="11" y1="5.5" x2="13" y2="5.5" stroke="#C5A065" strokeWidth="0.8" opacity="0.6" />
  </svg>
);

// ── Universal dispatcher ────────────────────────────────

const TIER_ICON_MAP: Record<string, React.FC<TierIconProps>> = {
  pino: PinoIcon,
  nogal: NogalIcon,
  parota: ParotaIcon,
  ebano: EbanoIcon,
};

/** Render the correct tier icon by ID */
export const TierIcon: React.FC<TierIconProps & { tierId: string }> = ({
  tierId,
  size = 20,
  className,
}) => {
  const normalized = normalizeTierId(tierId);
  const Icon = TIER_ICON_MAP[normalized] || PinoIcon;
  return <Icon size={size} className={className} />;
};

/**
 * Get a tier icon as a React element (for use in places that expect ReactNode).
 * E.g. inside <option> tags where components can't render,
 * falls back to a single-char text symbol.
 */
export function getTierSymbol(tierId: string): string {
  const normalized = normalizeTierId(tierId);
  const symbols: Record<string, string> = {
    pino: '○',
    nogal: '◉',
    parota: '✦',
    ebano: '◆',
  };
  return symbols[normalized] || '○';
}
