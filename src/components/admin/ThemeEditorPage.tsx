"use client";

import React, { useState, useEffect, useCallback } from 'react';
// motion/react removed — using CSS transitions (zero framer-motion rule)
import {
  Palette, ChevronDown, Monitor, Tablet, Smartphone,
  Type, Layout, Square, Save, RotateCcw, Eye, Check,
  Star, ShoppingCart, Heart, Search, Menu, Upload, GripVertical,
  Sparkles, Sun, Gem, Briefcase, Leaf, Plus, Trash2, ArrowUp,
  ArrowDown, CreditCard, Lock, Truck as TruckIcon, Home,
  Store, Download, Paintbrush, Crown
} from 'lucide-react';
import { toast } from 'sonner';

// ===== TYPES =====
interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  success: string;
  error: string;
  warning: string;
}

interface ThemeFonts {
  heading: string;
  body: string;
  sizeBase: number;
  sizeHeading: number;
  sizeButton: number;
}

interface ThemeLayout {
  headerType: 'fixed' | 'scroll' | 'transparent';
  headerLayout: 'left' | 'center' | 'right';
  megaMenu: boolean;
  footerColumns: 2 | 3 | 4;
  footerNewsletter: boolean;
  footerSocial: boolean;
  cardLayout: 'vertical' | 'horizontal';
  cardShowRating: boolean;
  cardShowBadge: boolean;
  productGallery: 'slider' | 'grid' | 'zoom';
  productDescStyle: 'tabs' | 'accordion';
  checkoutType: 'single' | 'multi';
}

interface ThemeComponents {
  buttonShape: 'rectangular' | 'rounded' | 'pill';
  buttonSize: 'sm' | 'md' | 'lg';
  hoverStyle: 'darken' | 'lighten' | 'scale' | 'shadow';
  cardShadow: 'none' | 'sm' | 'md' | 'lg';
  cardRadius: number;
  badgeStyle: 'solid' | 'outline' | 'soft';
  iconSet: 'lucide' | 'heroicons' | 'custom';
}

interface HomepageSection {
  id: string;
  type: 'hero' | 'featured' | 'categories' | 'banner' | 'testimonials' | 'newsletter' | 'gallery' | 'custom';
  label: string;
  enabled: boolean;
  spacing: 'sm' | 'md' | 'lg';
  bgStyle: 'default' | 'primary' | 'accent' | 'surface';
  width: 'full' | 'contained';
}

interface ThemeConfig {
  id: string;
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  layout: ThemeLayout;
  components: ThemeComponents;
  homepageSections: HomepageSection[];
}

type EditorSection = 'branding' | 'typography' | 'layout' | 'components' | 'homepage';
type PreviewPage = 'home' | 'product' | 'category' | 'checkout' | 'cart';
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

// ===== DEFAULT HOMEPAGE SECTIONS =====
const defaultHomepageSections: HomepageSection[] = [
  { id: 'hero-1', type: 'hero', label: 'Hero / Banner principal', enabled: true, spacing: 'lg', bgStyle: 'primary', width: 'full' },
  { id: 'featured-1', type: 'featured', label: 'Productos destacados', enabled: true, spacing: 'md', bgStyle: 'default', width: 'contained' },
  { id: 'categories-1', type: 'categories', label: 'Categorias', enabled: true, spacing: 'md', bgStyle: 'surface', width: 'contained' },
  { id: 'banner-1', type: 'banner', label: 'Banner grabado laser', enabled: true, spacing: 'md', bgStyle: 'accent', width: 'full' },
  { id: 'testimonials-1', type: 'testimonials', label: 'Testimonios', enabled: true, spacing: 'md', bgStyle: 'default', width: 'contained' },
  { id: 'newsletter-1', type: 'newsletter', label: 'Newsletter', enabled: false, spacing: 'sm', bgStyle: 'primary', width: 'full' },
];

// ===== PRESETS =====
const baseLayout: ThemeLayout = {
  headerType: 'fixed', headerLayout: 'center', megaMenu: false,
  footerColumns: 4, footerNewsletter: true, footerSocial: true,
  cardLayout: 'vertical', cardShowRating: true, cardShowBadge: true,
  productGallery: 'slider', productDescStyle: 'tabs', checkoutType: 'multi',
};

const baseComponents: ThemeComponents = {
  buttonShape: 'rounded', buttonSize: 'md', hoverStyle: 'darken',
  cardShadow: 'sm', cardRadius: 12, badgeStyle: 'soft', iconSet: 'lucide',
};

const themePresets: Array<{ id: string; name: string; icon: React.ElementType; desc: string; config: ThemeConfig }> = [
  {
    id: 'artesanal', name: 'Artesanal', icon: Leaf, desc: 'Calido, madera, serif — DSD default',
    config: {
      id: 'artesanal', name: 'Artesanal',
      colors: { primary: '#2d2419', secondary: '#C5A065', accent: '#C5A065', background: '#F5F3F0', surface: '#FFFFFF', text: '#2d2419', textMuted: '#8B7E74', success: '#16A34A', error: '#DC2626', warning: '#F59E0B' },
      fonts: { heading: 'Playfair Display', body: 'Inter', sizeBase: 14, sizeHeading: 28, sizeButton: 13 },
      layout: { ...baseLayout },
      components: { ...baseComponents },
      homepageSections: [...defaultHomepageSections],
    },
  },
  {
    id: 'moderno', name: 'Moderno', icon: Sun, desc: 'Minimalista, sans-serif, blanco+negro',
    config: {
      id: 'moderno', name: 'Moderno',
      colors: { primary: '#111111', secondary: '#555555', accent: '#111111', background: '#FFFFFF', surface: '#FAFAFA', text: '#111111', textMuted: '#888888', success: '#22C55E', error: '#EF4444', warning: '#EAB308' },
      fonts: { heading: 'DM Sans', body: 'DM Sans', sizeBase: 15, sizeHeading: 32, sizeButton: 14 },
      layout: { ...baseLayout, headerType: 'scroll', headerLayout: 'left', footerColumns: 3, productGallery: 'grid', checkoutType: 'single', productDescStyle: 'accordion' },
      components: { ...baseComponents, buttonShape: 'rectangular', buttonSize: 'lg', cardShadow: 'none', cardRadius: 4, badgeStyle: 'solid', hoverStyle: 'scale' },
      homepageSections: [...defaultHomepageSections],
    },
  },
  {
    id: 'lujo', name: 'Lujo', icon: Gem, desc: 'Oscuro, dorado, elegante',
    config: {
      id: 'lujo', name: 'Lujo',
      colors: { primary: '#0A0A0A', secondary: '#D4AF37', accent: '#D4AF37', background: '#0F0F0F', surface: '#1A1A1A', text: '#F0E6D3', textMuted: '#8A8070', success: '#4ADE80', error: '#F87171', warning: '#FBBF24' },
      fonts: { heading: 'Cormorant Garamond', body: 'Lato', sizeBase: 14, sizeHeading: 30, sizeButton: 12 },
      layout: { ...baseLayout, headerType: 'transparent', productGallery: 'zoom', productDescStyle: 'tabs' },
      components: { ...baseComponents, buttonShape: 'rectangular', cardShadow: 'md', cardRadius: 2, badgeStyle: 'outline', hoverStyle: 'shadow' },
      homepageSections: [...defaultHomepageSections],
    },
  },
  {
    id: 'fresco', name: 'Fresco', icon: Sparkles, desc: 'Colores vivos, juvenil, rounded',
    config: {
      id: 'fresco', name: 'Fresco',
      colors: { primary: '#6366F1', secondary: '#EC4899', accent: '#F97316', background: '#FEFCE8', surface: '#FFFFFF', text: '#1E1B4B', textMuted: '#6B7280', success: '#10B981', error: '#EF4444', warning: '#F59E0B' },
      fonts: { heading: 'Poppins', body: 'Nunito', sizeBase: 15, sizeHeading: 26, sizeButton: 14 },
      layout: { ...baseLayout, headerLayout: 'left', footerColumns: 3, checkoutType: 'single', productDescStyle: 'accordion' },
      components: { ...baseComponents, buttonShape: 'pill', cardShadow: 'md', cardRadius: 20, badgeStyle: 'solid', hoverStyle: 'scale' },
      homepageSections: [...defaultHomepageSections],
    },
  },
  {
    id: 'corporativo', name: 'Corporativo', icon: Briefcase, desc: 'Sobrio, profesional, azul/gris',
    config: {
      id: 'corporativo', name: 'Corporativo',
      colors: { primary: '#1E3A5F', secondary: '#3B82F6', accent: '#2563EB', background: '#F1F5F9', surface: '#FFFFFF', text: '#0F172A', textMuted: '#64748B', success: '#059669', error: '#DC2626', warning: '#D97706' },
      fonts: { heading: 'Source Sans 3', body: 'Source Sans 3', sizeBase: 14, sizeHeading: 28, sizeButton: 13 },
      layout: { ...baseLayout, headerLayout: 'left', cardLayout: 'horizontal', productGallery: 'grid', megaMenu: true },
      components: { ...baseComponents, cardRadius: 8, badgeStyle: 'soft', hoverStyle: 'darken' },
      homepageSections: [...defaultHomepageSections],
    },
  },
];

const fontOptions = [
  'Playfair Display', 'Cormorant Garamond', 'Libre Baskerville', 'Merriweather', 'Lora',
  'Inter', 'DM Sans', 'Poppins', 'Nunito', 'Lato', 'Source Sans 3', 'Roboto', 'Open Sans',
];

const colorFields: Array<{ key: keyof ThemeColors; label: string }> = [
  { key: 'primary', label: 'Primario' },
  { key: 'secondary', label: 'Secundario' },
  { key: 'accent', label: 'Acento' },
  { key: 'background', label: 'Fondo' },
  { key: 'surface', label: 'Superficie' },
  { key: 'text', label: 'Texto' },
  { key: 'textMuted', label: 'Texto secundario' },
  { key: 'success', label: 'Exito' },
  { key: 'error', label: 'Error' },
  { key: 'warning', label: 'Warning' },
];

const sectionTypes: Array<{ type: HomepageSection['type']; label: string }> = [
  { type: 'hero', label: 'Hero / Banner' },
  { type: 'featured', label: 'Productos destacados' },
  { type: 'categories', label: 'Categorias' },
  { type: 'banner', label: 'Banner CTA' },
  { type: 'testimonials', label: 'Testimonios' },
  { type: 'newsletter', label: 'Newsletter' },
  { type: 'gallery', label: 'Galeria de imagenes' },
  { type: 'custom', label: 'HTML personalizado' },
];

// ===== HELPERS =====
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={'bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] shadow-sm ' + className}>{children}</div>;
}

function SectionAccordion({ title, icon: Icon, open, onToggle, children }: {
  title: string; icon: React.ElementType; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[var(--border)] last:border-0">
      <button onClick={onToggle} className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-[var(--surface2)]/50 transition-colors text-left">
        <Icon size={14} className="text-[var(--accent)] shrink-0" />
        <span className="text-xs font-medium text-[var(--text)] flex-1">{title}</span>
        <ChevronDown size={12} className={'text-[var(--text-muted)] transition-transform ' + (open ? 'rotate-180' : '')} />
      </button>
      <div
        style={{
          maxHeight: open ? '2000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.25s ease, opacity 0.2s ease',
          opacity: open ? 1 : 0,
        }}
      >
        <div className="px-4 pb-4 space-y-3">{children}</div>
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-7 h-7 rounded-[var(--radius-card)] border border-[var(--border)] cursor-pointer p-0 appearance-none overflow-hidden"
          style={{ backgroundColor: value }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[var(--text-muted)] truncate">{label}</p>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="text-[11px] font-mono text-[var(--text)] bg-transparent border-none outline-none p-0 w-full uppercase"
        />
      </div>
    </div>
  );
}

function SliderInput({ label, value, min, max, unit, onChange }: {
  label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
        <span className="text-[10px] text-[var(--text)] font-mono">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-[var(--surface2)] rounded-[var(--radius-badge)] appearance-none cursor-pointer" style={{ accentColor: 'var(--accent)' }}
      />
    </div>
  );
}

function OptionGroup<T extends string>({ label, options, value, onChange }: {
  label: string; options: Array<{ value: T; label: string }>; value: T; onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-[10px] text-[var(--text-muted)] mb-1.5">{label}</p>
      <div className="flex gap-1 flex-wrap">
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={
              'px-2 py-1 text-[10px] rounded-[var(--radius-card)] border transition-colors ' +
              (value === o.value ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] font-medium' : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface2)]')
            }
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-[10px] text-[var(--text-secondary)]">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={'relative w-8 h-4 rounded-[var(--radius-badge)] transition-colors ' + (checked ? 'bg-[var(--accent)]' : 'bg-[var(--surface3)]')}
      >
        <span className={'absolute top-0.5 w-3.5 h-3.5 rounded-[var(--radius-badge)] bg-[var(--surface)] shadow transition-transform ' + (checked ? 'left-4' : 'left-0.5')} />
      </button>
    </label>
  );
}

// ===== LIVE PREVIEW =====
function LivePreview({ theme, page, device }: { theme: ThemeConfig; page: PreviewPage; device: PreviewDevice }) {
  const c = theme.colors;
  const f = theme.fonts;
  const comp = theme.components;
  const lay = theme.layout;

  const btnRadius = comp.buttonShape === 'pill' ? '9999px' : comp.buttonShape === 'rounded' ? '8px' : '2px';
  const btnPad = comp.buttonSize === 'sm' ? '6px 12px' : comp.buttonSize === 'lg' ? '12px 24px' : '8px 16px';
  const cardRad = comp.cardRadius + 'px';
  const cardShadow = comp.cardShadow === 'none' ? 'none' : comp.cardShadow === 'sm' ? '0 1px 3px rgba(0,0,0,0.08)' : comp.cardShadow === 'md' ? '0 4px 12px rgba(0,0,0,0.1)' : '0 8px 24px rgba(0,0,0,0.15)';

  const width = device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '375px';
  const isMobile = device === 'mobile';

  const products = [
    { name: 'Tabla Parota Rustica', price: '$2,450', oldPrice: null, rating: 4.8, badge: 'Nuevo' },
    { name: 'Set Cubiertos Nogal', price: '$1,890', oldPrice: null, rating: 4.9, badge: 'Popular' },
    { name: 'Caja Joyero Cerezo', price: '$1,350', oldPrice: '$1,680', rating: 4.7, badge: null },
    { name: 'Bowl Artesanal Maple', price: '$780', oldPrice: '$980', rating: 4.6, badge: 'Oferta' },
  ];

  // Determine light text color for dark backgrounds
  const lightText = (bgColor: string) => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
  };
  const heroTextColor = lightText(c.primary) ? '#FFFFFF' : c.text;

  const renderProductCard = (p: { name: string; price: string; oldPrice: string | null; rating: number; badge: string | null }, i: number) => (
    <div
      key={i}
      style={{ backgroundColor: c.surface, borderRadius: cardRad, boxShadow: cardShadow }}
      className="overflow-hidden"
    >
      <div style={{ backgroundColor: c.textMuted + '15' }} className="aspect-square relative">
        {lay.cardShowBadge && p.badge && (
          <span
            style={{
              backgroundColor: comp.badgeStyle === 'solid' ? c.accent : comp.badgeStyle === 'outline' ? 'transparent' : c.accent + '20',
              color: comp.badgeStyle === 'solid' ? '#FFFFFF' : c.accent,
              border: comp.badgeStyle === 'outline' ? '1px solid ' + c.accent : 'none',
              borderRadius: comp.buttonShape === 'pill' ? '9999px' : '4px',
            }}
            className="absolute top-2 left-2 text-[8px] px-1.5 py-0.5 font-medium"
          >
            {p.badge}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <p style={{ fontSize: f.sizeBase - 2 + 'px' }} className="font-medium truncate">{p.name}</p>
        {lay.cardShowRating && (
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={8} style={{ color: c.warning }} fill={c.warning} />
            <span style={{ color: c.textMuted, fontSize: '9px' }}>{p.rating}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-1">
          <p style={{ color: c.secondary, fontSize: f.sizeBase - 1 + 'px' }} className="font-bold">{p.price}</p>
          {p.oldPrice && <p style={{ color: c.textMuted, fontSize: f.sizeBase - 3 + 'px', textDecoration: 'line-through' }}>{p.oldPrice}</p>}
        </div>
      </div>
    </div>
  );

  // Build homepage sections from config
  const renderHomeSection = (section: HomepageSection) => {
    if (!section.enabled) return null;
    const spacing = section.spacing === 'sm' ? 'py-3' : section.spacing === 'lg' ? 'py-8' : 'py-5';
    const bgMap: Record<string, string> = {
      default: c.background,
      primary: c.primary,
      accent: c.secondary + '15',
      surface: c.surface,
    };
    const bg = bgMap[section.bgStyle] || c.background;
    const textColor = section.bgStyle === 'primary' ? heroTextColor : c.text;
    const padX = section.width === 'full' ? 'px-4' : 'px-6';

    switch (section.type) {
      case 'hero':
        return (
          <div key={section.id} style={{ backgroundColor: bg, color: textColor }} className={`${padX} ${spacing} text-center`}>
            <p style={{ fontFamily: f.heading + ', serif', fontSize: f.sizeHeading + 'px' }} className="mb-2">
              Carpinteria Premium
            </p>
            <p style={{ fontSize: f.sizeBase - 1 + 'px', opacity: 0.7 }} className="mb-4">
              Piezas unicas talladas a mano con maderas finas mexicanas
            </p>
            <button
              style={{ backgroundColor: c.accent, color: '#FFFFFF', borderRadius: btnRadius, padding: btnPad, fontSize: f.sizeButton + 'px' }}
              className="font-medium"
            >
              Ver Coleccion
            </button>
          </div>
        );
      case 'featured':
        return (
          <div key={section.id} style={{ backgroundColor: bg }} className={`${padX} ${spacing}`}>
            <p style={{ fontFamily: f.heading + ', serif', fontSize: f.sizeHeading - 8 + 'px', color: c.text }} className="mb-3 text-center">
              Destacados
            </p>
            <div className={'grid gap-3 ' + (isMobile ? 'grid-cols-2' : 'grid-cols-4')}>
              {products.map((p, i) => renderProductCard(p, i))}
            </div>
          </div>
        );
      case 'categories':
        return (
          <div key={section.id} style={{ backgroundColor: bg }} className={`${padX} ${spacing}`}>
            <p style={{ fontFamily: f.heading + ', serif', fontSize: f.sizeHeading - 8 + 'px', color: c.text }} className="mb-3 text-center">
              Categorias
            </p>
            <div className={'grid gap-2 ' + (isMobile ? 'grid-cols-2' : 'grid-cols-3')}>
              {['Tablas de cortar', 'Cubiertos', 'Joyeros', 'Bowls', 'Decoracion', 'Sets regalo'].map(cat => (
                <div key={cat} style={{ backgroundColor: c.textMuted + '10', borderRadius: cardRad }} className="p-3 text-center">
                  <div style={{ backgroundColor: c.textMuted + '12' }} className="w-full aspect-video rounded-[var(--radius-card)] mb-2" />
                  <p style={{ fontSize: f.sizeBase - 2 + 'px', color: c.text }} className="font-medium">{cat}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'banner':
        return (
          <div key={section.id} style={{ backgroundColor: bg }} className={`${padX} ${spacing} text-center`}>
            <p style={{ fontFamily: f.heading + ', serif', fontSize: f.sizeBase + 2 + 'px', color: c.text }}>
              Grabado laser personalizado
            </p>
            <p style={{ color: c.textMuted, fontSize: f.sizeBase - 2 + 'px' }} className="mt-1">
              Agrega un toque unico a cualquier pieza
            </p>
            <button
              style={{ backgroundColor: 'transparent', color: c.secondary, border: '1px solid ' + c.secondary, borderRadius: btnRadius, padding: btnPad, fontSize: f.sizeButton + 'px' }}
              className="mt-3 font-medium"
            >
              Personalizar ahora
            </button>
          </div>
        );
      case 'testimonials':
        return (
          <div key={section.id} style={{ backgroundColor: bg }} className={`${padX} ${spacing}`}>
            <p style={{ fontFamily: f.heading + ', serif', fontSize: f.sizeHeading - 10 + 'px', color: c.text }} className="mb-3 text-center">
              Lo que dicen nuestros clientes
            </p>
            <div className={'grid gap-3 ' + (isMobile ? 'grid-cols-1' : 'grid-cols-3')}>
              {['Calidad excepcional, cada pieza es unica', 'El grabado quedo perfecto, regalo ideal', 'Entrega rapida y empaque impecable'].map((t, i) => (
                <div key={i} style={{ backgroundColor: c.surface, borderRadius: cardRad, boxShadow: cardShadow }} className="p-3">
                  <div className="flex gap-0.5 mb-2">{[1,2,3,4,5].map(s => <Star key={s} size={8} style={{ color: c.warning }} fill={c.warning} />)}</div>
                  <p style={{ fontSize: f.sizeBase - 2 + 'px', color: c.textMuted }} className="italic">"{t}"</p>
                  <p style={{ fontSize: '9px', color: c.text }} className="mt-2 font-medium">— Cliente {i + 1}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'newsletter':
        return (
          <div key={section.id} style={{ backgroundColor: bg, color: section.bgStyle === 'primary' ? heroTextColor : c.text }} className={`${padX} ${spacing} text-center`}>
            <p style={{ fontFamily: f.heading + ', serif', fontSize: f.sizeBase + 2 + 'px' }}>Suscribete a nuestro newsletter</p>
            <p style={{ fontSize: f.sizeBase - 2 + 'px', opacity: 0.7 }} className="mt-1">Recibe novedades y descuentos exclusivos</p>
            <div className="flex gap-2 max-w-xs mx-auto mt-3">
              <input
                placeholder="tu@email.com"
                style={{ borderRadius: btnRadius, fontSize: f.sizeBase - 2 + 'px', border: '1px solid ' + c.textMuted + '30', padding: '4px 10px' }}
                className="flex-1 bg-[var(--surface)]/10 outline-none"
              />
              <button style={{ backgroundColor: c.accent, color: '#FFF', borderRadius: btnRadius, padding: '4px 12px', fontSize: f.sizeButton - 1 + 'px' }}>
                Suscribir
              </button>
            </div>
          </div>
        );
      case 'gallery':
        return (
          <div key={section.id} style={{ backgroundColor: bg }} className={`${padX} ${spacing}`}>
            <p style={{ fontFamily: f.heading + ', serif', fontSize: f.sizeHeading - 10 + 'px', color: c.text }} className="mb-3 text-center">Galeria</p>
            <div className={'grid gap-2 ' + (isMobile ? 'grid-cols-2' : 'grid-cols-4')}>
              {[1,2,3,4].map(i => <div key={i} style={{ backgroundColor: c.textMuted + '12', borderRadius: cardRad }} className="aspect-square" />)}
            </div>
          </div>
        );
      case 'custom':
        return (
          <div key={section.id} style={{ backgroundColor: bg, border: '2px dashed ' + c.textMuted + '20' }} className={`${padX} ${spacing} text-center`}>
            <p style={{ fontSize: '10px', color: c.textMuted }}>[ Seccion personalizada — editar en CMS ]</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center overflow-auto h-full">
      <div
        style={{
          width,
          maxWidth: '100%',
          fontFamily: f.body + ', sans-serif',
          fontSize: f.sizeBase + 'px',
          color: c.text,
          backgroundColor: c.background,
        }}
        className="rounded-[var(--radius-card)] border border-[var(--border)] overflow-hidden shadow-inner"
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: lay.headerType === 'transparent' ? 'transparent' : c.surface,
            borderBottom: '1px solid ' + c.textMuted + '20',
          }}
          className="px-4 py-3"
        >
          <div className={'flex items-center gap-3 ' + (lay.headerLayout === 'center' ? 'justify-center' : lay.headerLayout === 'right' ? 'flex-row-reverse' : '')}>
            {lay.headerLayout !== 'center' && <Menu size={16} style={{ color: c.text }} />}
            <span
              style={{ fontFamily: f.heading + ', serif', color: c.secondary, fontSize: f.sizeBase + 2 + 'px' }}
              className="font-medium tracking-wide"
            >
              DavidSon's Design
            </span>
            {lay.megaMenu && lay.headerLayout !== 'center' && (
              <div className="hidden sm:flex items-center gap-3 ml-2">
                {['Tienda', 'Colecciones', 'Proceso'].map(m => (
                  <span key={m} style={{ fontSize: f.sizeBase - 2 + 'px', color: c.textMuted }} className="cursor-pointer hover:opacity-70">{m}</span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Search size={14} style={{ color: c.textMuted }} />
              <Heart size={14} style={{ color: c.textMuted }} />
              <div className="relative">
                <ShoppingCart size={14} style={{ color: c.textMuted }} />
                <span
                  style={{ backgroundColor: c.accent, color: '#FFF', fontSize: '8px' }}
                  className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-[var(--radius-badge)] flex items-center justify-center font-bold"
                >
                  2
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        {page === 'home' && (
          <div>
            {theme.homepageSections.map(s => renderHomeSection(s))}
          </div>
        )}

        {page === 'product' && (
          <div className="p-4">
            <div className={'gap-4 ' + (isMobile ? 'space-y-4' : 'grid grid-cols-2')}>
              {/* Gallery */}
              {lay.productGallery === 'grid' ? (
                <div className="grid grid-cols-2 gap-1">
                  {[1,2,3,4].map(i => <div key={i} style={{ backgroundColor: c.textMuted + '10', borderRadius: cardRad }} className="aspect-square" />)}
                </div>
              ) : (
                <div style={{ backgroundColor: c.textMuted + '10', borderRadius: cardRad }} className="aspect-square relative">
                  {lay.productGallery === 'zoom' && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 rounded-[var(--radius-badge)] flex items-center justify-center" style={{ backgroundColor: c.surface, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                      <Search size={10} style={{ color: c.textMuted }} />
                    </div>
                  )}
                  {lay.productGallery === 'slider' && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {[0,1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-[var(--radius-badge)]" style={{ backgroundColor: i === 0 ? c.accent : c.textMuted + '40' }} />)}
                    </div>
                  )}
                </div>
              )}
              {/* Info */}
              <div>
                <p style={{ color: c.textMuted, fontSize: '10px' }} className="uppercase tracking-wider">Tabla de cortar</p>
                <p style={{ fontFamily: f.heading + ', serif', fontSize: f.sizeHeading - 4 + 'px' }} className="mt-1">
                  Tabla Parota Rustica
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map(i => <Star key={i} size={10} style={{ color: i <= 4 ? c.warning : c.textMuted + '40' }} fill={i <= 4 ? c.warning : 'none'} />)}
                  <span style={{ color: c.textMuted, fontSize: '10px' }} className="ml-1">4.8 (24 reviews)</span>
                </div>
                <p style={{ color: c.secondary, fontSize: f.sizeHeading - 8 + 'px' }} className="font-bold mt-3">$2,450 MXN</p>
                <p style={{ color: c.textMuted, fontSize: f.sizeBase - 2 + 'px' }} className="mt-3 leading-relaxed">
                  Tabla de cortar artesanal elaborada con madera de Parota mexicana. Borde natural vivo con acabado en aceite de linaza.
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    style={{ backgroundColor: c.accent, color: '#FFFFFF', borderRadius: btnRadius, padding: btnPad, fontSize: f.sizeButton + 'px', flex: 1 }}
                    className="font-medium"
                  >
                    Agregar al carrito
                  </button>
                  <button style={{ border: '1px solid ' + c.textMuted + '30', borderRadius: btnRadius, padding: btnPad }}>
                    <Heart size={14} style={{ color: c.textMuted }} />
                  </button>
                </div>
                {/* Desc: tabs or accordion */}
                <div style={{ borderTop: '1px solid ' + c.textMuted + '20' }} className="mt-4 pt-4">
                  {lay.productDescStyle === 'tabs' ? (
                    <>
                      <div className="flex gap-3 mb-3" style={{ borderBottom: '1px solid ' + c.textMuted + '15' }}>
                        {['Detalles', 'Especificaciones', 'Reviews'].map((tab, i) => (
                          <span key={tab} style={{ fontSize: '10px', color: i === 0 ? c.accent : c.textMuted, borderBottom: i === 0 ? '2px solid ' + c.accent : '2px solid transparent', paddingBottom: '6px' }}>{tab}</span>
                        ))}
                      </div>
                      <div className="space-y-1.5">
                        {['Madera: Parota mexicana', 'Dimensiones: 40×25×3 cm', 'Acabado: Aceite de linaza', 'Grabado laser disponible'].map(spec => (
                          <p key={spec} style={{ fontSize: f.sizeBase - 2 + 'px', color: c.textMuted }}>{spec}</p>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1">
                      {['Detalles', 'Especificaciones', 'Reviews (24)'].map((title, i) => (
                        <div key={title} style={{ border: '1px solid ' + c.textMuted + '15', borderRadius: '6px' }}>
                          <div className="flex items-center justify-between px-3 py-2 cursor-pointer">
                            <span style={{ fontSize: '10px', color: i === 0 ? c.text : c.textMuted }} className="font-medium">{title}</span>
                            <ChevronDown size={10} style={{ color: c.textMuted, transform: i === 0 ? 'rotate(180deg)' : 'none' }} />
                          </div>
                          {i === 0 && (
                            <div className="px-3 pb-2 space-y-1">
                              {['Madera: Parota mexicana', 'Dimensiones: 40×25×3 cm'].map(spec => (
                                <p key={spec} style={{ fontSize: f.sizeBase - 2 + 'px', color: c.textMuted }}>{spec}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {page === 'category' && (
          <div className="p-4">
            <p style={{ fontFamily: f.heading + ', serif', fontSize: f.sizeHeading - 6 + 'px' }} className="mb-1">Tablas de cortar</p>
            <p style={{ color: c.textMuted, fontSize: f.sizeBase - 2 + 'px' }} className="mb-4">12 productos</p>
            <div className={'grid gap-3 ' + (isMobile ? 'grid-cols-2' : 'grid-cols-3')}>
              {[...products, { name: 'Tabla Nogal Premium', price: '$3,200', oldPrice: null, rating: 5.0, badge: null }, { name: 'Tabla Mini Cerezo', price: '$680', oldPrice: '$850', rating: 4.5, badge: 'Oferta' }].map((p, i) => renderProductCard(p, i))}
            </div>
          </div>
        )}

        {page === 'checkout' && (
          <div className="p-4">
            <p style={{ fontFamily: f.heading + ', serif', fontSize: f.sizeHeading - 6 + 'px' }} className="mb-4">Checkout</p>
            {lay.checkoutType === 'multi' ? (
              <>
                {/* Steps indicator */}
                <div className="flex items-center gap-2 mb-5">
                  {[
                    { n: 1, label: 'Envio', icon: TruckIcon, active: true },
                    { n: 2, label: 'Pago', icon: CreditCard, active: false },
                    { n: 3, label: 'Confirmar', icon: Check, active: false },
                  ].map((step, i) => (
                    <React.Fragment key={step.n}>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded-[var(--radius-badge)] flex items-center justify-center"
                          style={{ backgroundColor: step.active ? c.accent : c.textMuted + '20', color: step.active ? '#FFF' : c.textMuted }}
                        >
                          <step.icon size={9} />
                        </div>
                        <span style={{ fontSize: '10px', color: step.active ? c.text : c.textMuted, fontWeight: step.active ? 600 : 400 }}>{step.label}</span>
                      </div>
                      {i < 2 && <div style={{ backgroundColor: c.textMuted + '20', height: '1px', flex: 1 }} />}
                    </React.Fragment>
                  ))}
                </div>
                {/* Shipping form */}
                <div style={{ backgroundColor: c.surface, borderRadius: cardRad, boxShadow: cardShadow }} className="p-4 space-y-2.5">
                  <p style={{ fontSize: f.sizeBase + 'px' }} className="font-medium mb-2">Direccion de envio</p>
                  {['Nombre completo', 'Direccion', 'Ciudad, Estado', 'Codigo postal'].map(field => (
                    <div key={field}>
                      <p style={{ fontSize: '9px', color: c.textMuted }} className="mb-0.5">{field}</p>
                      <div style={{ border: '1px solid ' + c.textMuted + '25', borderRadius: comp.buttonShape === 'pill' ? '9999px' : '6px', padding: '6px 10px', fontSize: f.sizeBase - 2 + 'px', color: c.textMuted + '60' }}>
                        {field === 'Nombre completo' ? 'David Perez' : ''}
                      </div>
                    </div>
                  ))}
                  <button
                    style={{ backgroundColor: c.accent, color: '#FFF', borderRadius: btnRadius, padding: btnPad, fontSize: f.sizeButton + 'px', width: '100%', marginTop: '8px' }}
                    className="font-medium text-center"
                  >
                    Continuar al pago
                  </button>
                </div>
              </>
            ) : (
              <div className={'gap-4 ' + (isMobile ? 'space-y-4' : 'grid grid-cols-5')}>
                <div className={isMobile ? '' : 'col-span-3'}>
                  <div style={{ backgroundColor: c.surface, borderRadius: cardRad, boxShadow: cardShadow }} className="p-4 space-y-3">
                    <p style={{ fontSize: f.sizeBase + 'px' }} className="font-medium">Informacion</p>
                    {['Email', 'Nombre', 'Direccion', 'Ciudad, Estado, CP', 'Telefono'].map(field => (
                      <div key={field}>
                        <p style={{ fontSize: '9px', color: c.textMuted }} className="mb-0.5">{field}</p>
                        <div style={{ border: '1px solid ' + c.textMuted + '25', borderRadius: '6px', padding: '5px 8px', fontSize: f.sizeBase - 2 + 'px' }} />
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid ' + c.textMuted + '15' }} className="pt-3">
                      <p style={{ fontSize: f.sizeBase + 'px' }} className="font-medium mb-2">Pago</p>
                      <div style={{ border: '1px solid ' + c.textMuted + '25', borderRadius: '6px', padding: '8px' }} className="flex items-center gap-2">
                        <CreditCard size={12} style={{ color: c.textMuted }} />
                        <span style={{ fontSize: '10px', color: c.textMuted }}>**** **** **** 4242</span>
                      </div>
                    </div>
                    <button
                      style={{ backgroundColor: c.accent, color: '#FFF', borderRadius: btnRadius, padding: btnPad, fontSize: f.sizeButton + 'px', width: '100%' }}
                      className="font-medium text-center mt-2"
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <Lock size={10} /> Pagar $4,340 MXN
                      </span>
                    </button>
                  </div>
                </div>
                <div className={isMobile ? '' : 'col-span-2'}>
                  <div style={{ backgroundColor: c.surface, borderRadius: cardRad, boxShadow: cardShadow }} className="p-4">
                    <p style={{ fontSize: f.sizeBase + 'px' }} className="font-medium mb-3">Resumen</p>
                    {[{ n: 'Tabla Parota Rustica', p: '$2,450' }, { n: 'Set Cubiertos Nogal', p: '$1,890' }].map(item => (
                      <div key={item.n} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid ' + c.textMuted + '10' }}>
                        <span style={{ fontSize: f.sizeBase - 2 + 'px', color: c.text }}>{item.n}</span>
                        <span style={{ fontSize: f.sizeBase - 2 + 'px', color: c.textMuted }}>{item.p}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2 mt-1" style={{ borderTop: '2px solid ' + c.textMuted + '15' }}>
                      <span style={{ fontSize: f.sizeBase + 'px' }} className="font-medium">Total</span>
                      <span style={{ fontSize: f.sizeBase + 2 + 'px', color: c.secondary }} className="font-bold">$4,340</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {page === 'cart' && (
          <div className="p-4">
            <p style={{ fontFamily: f.heading + ', serif', fontSize: f.sizeHeading - 6 + 'px' }} className="mb-4">Tu carrito (2)</p>
            {[
              { name: 'Tabla Parota Rustica', price: '$2,450', qty: 1 },
              { name: 'Set Cubiertos Nogal', price: '$1,890', qty: 1 },
            ].map((item, i) => (
              <div key={i} style={{ borderBottom: '1px solid ' + c.textMuted + '15' }} className="flex items-center gap-3 py-3">
                <div style={{ backgroundColor: c.textMuted + '12', borderRadius: cardRad }} className="w-14 h-14 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: f.sizeBase - 1 + 'px' }} className="font-medium truncate">{item.name}</p>
                  <p style={{ color: c.textMuted, fontSize: '10px' }}>Cant: {item.qty}</p>
                </div>
                <p style={{ color: c.secondary, fontSize: f.sizeBase + 'px' }} className="font-bold shrink-0">{item.price}</p>
              </div>
            ))}
            <div style={{ borderTop: '2px solid ' + c.text + '10' }} className="mt-3 pt-3 flex items-center justify-between">
              <p style={{ fontSize: f.sizeBase + 'px' }} className="font-medium">Total</p>
              <p style={{ color: c.secondary, fontSize: f.sizeHeading - 10 + 'px' }} className="font-bold">$4,340 MXN</p>
            </div>
            <button
              style={{ backgroundColor: c.accent, color: '#FFFFFF', borderRadius: btnRadius, padding: btnPad, fontSize: f.sizeButton + 'px' }}
              className="w-full mt-4 font-medium text-center"
            >
              Proceder al pago
            </button>
            <button
              style={{ color: c.textMuted, fontSize: f.sizeBase - 2 + 'px' }}
              className="w-full mt-2 text-center underline"
            >
              Seguir comprando
            </button>
          </div>
        )}

        {/* Footer */}
        <div
          style={{ backgroundColor: c.primary, color: lightText(c.primary) ? '#FFFFFF' : c.textMuted }}
          className="px-4 py-4 mt-4"
        >
          <div className={'grid gap-4 ' + (isMobile ? 'grid-cols-2' : `grid-cols-${lay.footerColumns}`)}>
            <div>
              <span style={{ fontFamily: f.heading + ', serif', color: c.secondary, fontSize: '11px' }}>DavidSon's Design</span>
              <p style={{ fontSize: '9px', opacity: 0.6 }} className="mt-1">Carpinteria premium hecha a mano</p>
              {lay.footerSocial && (
                <div className="flex gap-2 mt-2">
                  {['IG', 'FB', 'TT'].map(s => (
                    <span key={s} style={{ fontSize: '7px', opacity: 0.5, border: '1px solid currentColor', borderRadius: '4px', padding: '2px 4px' }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p style={{ fontSize: '9px', opacity: 0.8 }} className="font-medium mb-1">Tienda</p>
              <p style={{ fontSize: '8px', opacity: 0.5 }}>Productos</p>
              <p style={{ fontSize: '8px', opacity: 0.5 }}>Categorias</p>
              <p style={{ fontSize: '8px', opacity: 0.5 }}>Proceso</p>
            </div>
            {lay.footerColumns >= 3 && (
              <div>
                <p style={{ fontSize: '9px', opacity: 0.8 }} className="font-medium mb-1">Soporte</p>
                <p style={{ fontSize: '8px', opacity: 0.5 }}>FAQ</p>
                <p style={{ fontSize: '8px', opacity: 0.5 }}>Contacto</p>
                <p style={{ fontSize: '8px', opacity: 0.5 }}>Envios</p>
              </div>
            )}
            {lay.footerColumns >= 4 && (
              <div>
                <p style={{ fontSize: '9px', opacity: 0.8 }} className="font-medium mb-1">Legal</p>
                <p style={{ fontSize: '8px', opacity: 0.5 }}>Privacidad</p>
                <p style={{ fontSize: '8px', opacity: 0.5 }}>Terminos</p>
              </div>
            )}
          </div>
          {lay.footerNewsletter && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} className="mt-3 pt-3 flex items-center gap-2">
              <input placeholder="Email para newsletter" style={{ fontSize: '8px', padding: '3px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'transparent', color: 'inherit', flex: 1, outline: 'none' }} />
              <button style={{ fontSize: '7px', backgroundColor: c.secondary, color: '#FFF', padding: '3px 8px', borderRadius: '4px' }}>Suscribir</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ===== THEME CATALOG =====
// Los temas se agregan aquí cuando llegan de Figma → conversión → registro.
// Flujo: Figma export → /Plantillas Admin RockSage Commerce/{n}/ → yo convierto → CatalogTheme aquí.

type ThemeView = 'editor' | 'catalog';

interface CatalogTheme {
  id: string;
  name: string;
  desc: string;
  author: string;
  tags: string[];
  mode: 'light' | 'dark';
  colors: { bg: string; surface: string; accent: string; text: string };
  config: ThemeConfig;
}

// ── Registro de temas — vacío hasta primer diseño de Figma ──────────────
const CATALOG_THEMES: CatalogTheme[] = [];

// Mini-thumbnail de un tema
function ThemeThumbnail({ colors }: { colors: CatalogTheme['colors'] }) {
  return (
    <div
      className="w-full aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden"
      style={{ backgroundColor: colors.bg, border: '1px solid rgba(0,0,0,0.08)' }}
    >
      <div
        className="flex items-center justify-between px-2 py-1.5"
        style={{ backgroundColor: colors.surface, borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div className="w-10 h-1.5 rounded-sm" style={{ backgroundColor: colors.text + '60' }} />
        <div className="w-5 h-1.5 rounded-sm" style={{ backgroundColor: colors.accent }} />
      </div>
      <div className="px-2 py-2 space-y-1.5">
        <div className="w-3/4 h-1.5 rounded-sm" style={{ backgroundColor: colors.text + '30' }} />
        <div className="w-1/2 h-1 rounded-sm" style={{ backgroundColor: colors.text + '18' }} />
        <div className="w-10 h-3 rounded-sm mt-1" style={{ backgroundColor: colors.accent }} />
      </div>
      <div className="grid grid-cols-3 gap-1 px-2 pt-1">
        {[0,1,2].map(i => (
          <div key={i} className="aspect-square rounded-sm" style={{ backgroundColor: colors.surface, border: '1px solid rgba(0,0,0,0.06)' }} />
        ))}
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====
export const ThemeEditorPage: React.FC = () => {

  // ── Theme state — loaded from API ──
  const [theme, setTheme] = useState<ThemeConfig>(themePresets[0].config);
  const [themeLoading, setThemeLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<EditorSection | null>('branding');
  const [previewPage, setPreviewPage] = useState<PreviewPage>('home');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [showPresets, setShowPresets] = useState(false);
  const [view, setView] = useState<ThemeView>('editor');
  const [installingId, setInstallingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/theme')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.theme) {
          const saved = d.theme as Partial<ThemeConfig>;
          setTheme(prev => ({
            ...prev,
            ...saved,
            colors: { ...prev.colors, ...(saved.colors || {}) },
            fonts: { ...prev.fonts, ...(saved.fonts || {}) },
            layout: { ...prev.layout, ...(saved.layout || {}) },
            components: { ...prev.components, ...(saved.components || {}) },
            homepageSections: saved.homepageSections?.length ? saved.homepageSections : prev.homepageSections,
          }));
          if (d.updated_at) setSavedAt(d.updated_at);
        }
      })
      .catch(() => {})
      .finally(() => setThemeLoading(false));
  }, []);

  const updateColors = (key: keyof ThemeColors, value: string) => {
    setTheme(prev => ({ ...prev, colors: { ...prev.colors, [key]: value } }));
  };
  const updateFonts = (key: keyof ThemeFonts, value: string | number) => {
    setTheme(prev => ({ ...prev, fonts: { ...prev.fonts, [key]: value } }));
  };
  const updateLayout = <K extends keyof ThemeLayout>(key: K, value: ThemeLayout[K]) => {
    setTheme(prev => ({ ...prev, layout: { ...prev.layout, [key]: value } }));
  };
  const updateComponents = <K extends keyof ThemeComponents>(key: K, value: ThemeComponents[K]) => {
    setTheme(prev => ({ ...prev, components: { ...prev.components, [key]: value } }));
  };

  const moveSection = useCallback((idx: number, dir: -1 | 1) => {
    setTheme(prev => {
      const sections = [...prev.homepageSections];
      const target = idx + dir;
      if (target < 0 || target >= sections.length) return prev;
      [sections[idx], sections[target]] = [sections[target], sections[idx]];
      return { ...prev, homepageSections: sections };
    });
  }, []);

  const toggleSectionEnabled = useCallback((id: string) => {
    setTheme(prev => ({
      ...prev,
      homepageSections: prev.homepageSections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s),
    }));
  }, []);

  const removeSectionById = useCallback((id: string) => {
    setTheme(prev => ({
      ...prev,
      homepageSections: prev.homepageSections.filter(s => s.id !== id),
    }));
  }, []);

  const updateSectionProp = useCallback((id: string, key: keyof HomepageSection, value: string) => {
    setTheme(prev => ({
      ...prev,
      homepageSections: prev.homepageSections.map(s => s.id === id ? { ...s, [key]: value } : s),
    }));
  }, []);

  const addSection = useCallback((type: HomepageSection['type']) => {
    const found = sectionTypes.find(s => s.type === type);
    const newSection: HomepageSection = {
      id: type + '-' + Date.now(),
      type,
      label: found?.label || 'Seccion',
      enabled: true,
      spacing: 'md',
      bgStyle: 'default',
      width: 'contained',
    };
    setTheme(prev => ({
      ...prev,
      homepageSections: [...prev.homepageSections, newSection],
    }));
    toast.success('Seccion agregada');
  }, []);

  const applyPreset = (preset: ThemeConfig) => {
    setTheme(preset);
    setShowPresets(false);
    toast.success(`Tema "${preset.name}" aplicado`);
  };

  const toggleSection = (s: EditorSection) => {
    setOpenSection(prev => prev === s ? null : s);
  };

  const installTheme = async (catalogTheme: CatalogTheme) => {
    setInstallingId(catalogTheme.id);
    try {
      const res = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: catalogTheme.config }),
      });
      if (res.ok) {
        const data = await res.json();
        setTheme(catalogTheme.config);
        if (data.updated_at) setSavedAt(data.updated_at);
        toast.success(`Tema "${catalogTheme.name}" instalado correctamente`);
        setView('editor');
      } else {
        toast.error('Error al instalar el tema');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setInstallingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-heading)' }}>Temas</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
            {view === 'editor' ? 'Personaliza la apariencia de tu tienda sin código' : 'Explora y aplica temas desde el catálogo de RockSage Commerce'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setTheme(themePresets[0].config); setSavedAt(null); toast.success('Tema restaurado a valores predeterminados'); }}
            className="px-3 py-2 text-xs border border-[var(--border)] text-[var(--text-secondary)] rounded-[var(--radius-card)] hover:bg-[var(--surface2)] transition-colors flex items-center gap-1.5"
          >
            <RotateCcw size={12} /> Restaurar
          </button>
          <button
            onClick={async () => {
              setSaving(true);
              try {
                const res = await fetch('/api/admin/theme', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ theme }),
                });
                if (res.ok) {
                  const data = await res.json();
                  if (data.updated_at) setSavedAt(data.updated_at);
                  toast.success('Tema publicado correctamente');
                } else {
                  toast.error('Error al publicar el tema');
                }
              } catch {
                toast.error('Error de conexión');
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            className="px-3 py-2 text-xs bg-[var(--accent)] text-white rounded-[var(--radius-card)] hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-[var(--radius-badge)] animate-spin inline-block" /> Guardando...</> : <><Save size={12} /> Publicar tema</>}
          </button>
          {savedAt && !saving && (
            <span className="text-[9px] text-[var(--text-muted)]">
              Guardado {new Date(savedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-1 border-b border-[var(--border)]">
        {([
          { id: 'editor' as ThemeView, label: 'Editor', icon: Paintbrush },
          { id: 'catalog' as ThemeView, label: 'Catálogo de temas', icon: Store },
        ]).map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={
                'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ' +
                (view === tab.id
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]')
              }
            >
              <TabIcon size={13} />
              {tab.label}
              {tab.id === 'catalog' && <span className="ml-1 text-[9px] bg-[var(--accent)]/10 text-[var(--accent)] px-1.5 py-0.5 rounded-full font-semibold">{CATALOG_THEMES.length}</span>}
            </button>
          );
        })}
      </div>

      {/* ══ CATÁLOGO VIEW ══════════════════════════════════════════════════ */}
      {view === 'catalog' && (
        <div className="space-y-4">
          {/* Grid de temas */}
          {CATALOG_THEMES.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {CATALOG_THEMES.map(catalogTheme => {
                const isActive = theme.id === catalogTheme.id;
                const isInstalling = installingId === catalogTheme.id;
                return (
                  <div
                    key={catalogTheme.id}
                    className={
                      'rounded-[var(--radius-card)] border overflow-hidden transition-all hover:shadow-md ' +
                      (isActive ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/20' : 'border-[var(--border)] hover:border-[var(--accent)]/40')
                    }
                    style={{ backgroundColor: 'var(--surface)' }}
                  >
                    <div className="p-2">
                      <ThemeThumbnail colors={catalogTheme.colors} />
                    </div>
                    <div className="px-3 pb-3 space-y-2">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-[12px] font-semibold text-[var(--text)] truncate">{catalogTheme.name}</p>
                          {isActive && (
                            <span className="text-[8px] bg-[var(--success)]/10 text-[var(--success)] px-1.5 py-0.5 rounded-[var(--radius-badge)] font-semibold flex items-center gap-0.5 shrink-0">
                              <Check size={7} /> Activo
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-tight">{catalogTheme.desc}</p>
                      </div>
                      <div className="flex gap-0.5 items-center">
                        {[catalogTheme.colors.bg, catalogTheme.colors.surface, catalogTheme.colors.accent, catalogTheme.colors.text].map((color, i) => (
                          <div key={i} className="w-3.5 h-3.5 rounded-full border border-[var(--border)] shadow-sm" style={{ backgroundColor: color }} />
                        ))}
                        <span className="ml-1 text-[9px] text-[var(--text-muted)]">{catalogTheme.mode}</span>
                      </div>
                      {isActive ? (
                        <button
                          onClick={() => setView('editor')}
                          className="w-full py-1.5 text-[10px] font-semibold rounded-[var(--radius-button)] border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors flex items-center justify-center gap-1"
                        >
                          <Paintbrush size={10} /> Personalizar
                        </button>
                      ) : (
                        <button
                          onClick={() => installTheme(catalogTheme)}
                          disabled={isInstalling}
                          className="w-full py-1.5 text-[10px] font-semibold rounded-[var(--radius-button)] transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
                          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                        >
                          {isInstalling
                            ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Instalando...</>
                            : <><Download size={10} /> Instalar</>
                          }
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Store size={40} className="text-[var(--text-muted)] mb-4 opacity-30" />
              <p className="text-sm font-medium text-[var(--text-secondary)]">No hay temas disponibles aún</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
                Los temas aparecerán aquí cuando sean diseñados en Figma y convertidos al ecosistema.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══ EDITOR VIEW ════════════════════════════════════════════════════ */}
      {view === 'editor' && (<>

      {/* Theme presets */}
      <Card className="p-3">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="w-full flex items-center justify-between text-xs text-[var(--text)]"
        >
          <span className="flex items-center gap-2">
            <Sparkles size={12} className="text-[var(--accent)]" />
            <span className="font-medium">Temas predefinidos</span>
            <span className="text-[10px] text-[var(--text-muted)]">— Elige un punto de partida y personaliza</span>
          </span>
          <ChevronDown size={12} className={'text-[var(--text-muted)] transition-transform ' + (showPresets ? 'rotate-180' : '')} />
        </button>

        <div
          style={{
            maxHeight: showPresets ? '600px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.25s ease, opacity 0.2s ease',
            opacity: showPresets ? 1 : 0,
          }}
        >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-3">
                {themePresets.map(preset => {
                  const PresetIcon = preset.icon;
                  const isActive = theme.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset.config)}
                      className={
                        'p-3 rounded-[var(--radius-card)] border text-left transition-all ' +
                        (isActive ? 'border-[var(--accent)] bg-[var(--accent)]/5 ring-1 ring-[var(--accent)]/20' : 'border-[var(--border)] hover:border-[var(--border)] hover:bg-[var(--surface2)]')
                      }
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-7 h-7 rounded-[var(--radius-card)] flex items-center justify-center"
                          style={{ backgroundColor: preset.config.colors.secondary + '20' }}
                        >
                          <PresetIcon size={12} style={{ color: preset.config.colors.secondary }} />
                        </div>
                        {isActive && <Check size={10} className="text-[var(--accent)] ml-auto" />}
                      </div>
                      <p className="text-[11px] font-medium text-[var(--text)]">{preset.name}</p>
                      <p className="text-[9px] text-[var(--text-muted)] mt-0.5">{preset.desc}</p>
                      <div className="flex gap-0.5 mt-2">
                        {[preset.config.colors.primary, preset.config.colors.secondary, preset.config.colors.accent, preset.config.colors.background, preset.config.colors.surface].map((color, i) => (
                          <div key={i} className="w-4 h-4 rounded-[var(--radius-badge)] border border-white shadow-sm" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
        </div>
      </Card>

      {/* Split screen: Editor + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4" style={{ minHeight: '600px' }}>
        {/* Editor Panel */}
        <Card className="overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-[var(--surface2)]/50 border-b border-[var(--border)]">
            <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Editor</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Branding */}
            <SectionAccordion title="Branding / Colores" icon={Palette} open={openSection === 'branding'} onToggle={() => toggleSection('branding')}>
              <div>
                <p className="text-[10px] text-[var(--text-muted)] mb-1.5">Logo</p>
                <div className="flex gap-2">
                  {['Principal', 'Alternativo', 'Favicon'].map(l => (
                    <button key={l} className="flex-1 flex flex-col items-center gap-1 p-3 border border-dashed border-[var(--border)] rounded-[var(--radius-card)] hover:bg-[var(--surface2)] transition-colors">
                      <Upload size={12} className="text-[var(--text-muted)]" />
                      <span className="text-[9px] text-[var(--text-muted)]">{l}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-muted)] mb-2">Paleta de colores</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {colorFields.map(cf => (
                    <ColorInput key={cf.key} label={cf.label} value={theme.colors[cf.key]} onChange={v => updateColors(cf.key, v)} />
                  ))}
                </div>
              </div>
              {/* Color presets row */}
              <div>
                <p className="text-[10px] text-[var(--text-muted)] mb-1.5">Presets de color rapidos</p>
                <div className="flex gap-1.5">
                  {[
                    { label: 'DSD', colors: ['#2d2419', '#C5A065', '#F5F3F0'] },
                    { label: 'Ocean', colors: ['#0F172A', '#3B82F6', '#F0F9FF'] },
                    { label: 'Forest', colors: ['#14532D', '#22C55E', '#F0FDF4'] },
                    { label: 'Rose', colors: ['#4C0519', '#F43F5E', '#FFF1F2'] },
                    { label: 'Slate', colors: ['#1E293B', '#64748B', '#F8FAFC'] },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        updateColors('primary', preset.colors[0]);
                        updateColors('secondary', preset.colors[1]);
                        updateColors('background', preset.colors[2]);
                      }}
                      className="flex flex-col items-center gap-1 group"
                      title={preset.label}
                    >
                      <div className="flex -space-x-1">
                        {preset.colors.map((c, i) => (
                          <div key={i} className="w-4 h-4 rounded-[var(--radius-badge)] border-2 border-white shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <span className="text-[8px] text-[var(--text-muted)]">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </SectionAccordion>

            {/* Typography */}
            <SectionAccordion title="Tipografia" icon={Type} open={openSection === 'typography'} onToggle={() => toggleSection('typography')}>
              <div>
                <p className="text-[10px] text-[var(--text-muted)] mb-1">Fuente de titulos</p>
                <select
                  value={theme.fonts.heading}
                  onChange={e => updateFonts('heading', e.target.value)}
                  className="w-full border border-[var(--border)] rounded-[var(--radius-card)] px-3 py-2 text-xs bg-[var(--surface)] outline-none"
                  style={{ fontFamily: theme.fonts.heading }}
                >
                  {fontOptions.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                </select>
                <p style={{ fontFamily: theme.fonts.heading, fontSize: '16px', color: theme.colors.text }} className="mt-1.5 px-1">
                  DavidSon's Design
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-muted)] mb-1">Fuente de cuerpo</p>
                <select
                  value={theme.fonts.body}
                  onChange={e => updateFonts('body', e.target.value)}
                  className="w-full border border-[var(--border)] rounded-[var(--radius-card)] px-3 py-2 text-xs bg-[var(--surface)] outline-none"
                  style={{ fontFamily: theme.fonts.body }}
                >
                  {fontOptions.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                </select>
                <p style={{ fontFamily: theme.fonts.body, fontSize: '12px', color: theme.colors.textMuted }} className="mt-1.5 px-1">
                  Piezas unicas talladas a mano con maderas finas mexicanas
                </p>
              </div>
              <SliderInput label="Tamano base" value={theme.fonts.sizeBase} min={12} max={18} unit="px" onChange={v => updateFonts('sizeBase', v)} />
              <SliderInput label="Tamano titulos" value={theme.fonts.sizeHeading} min={20} max={40} unit="px" onChange={v => updateFonts('sizeHeading', v)} />
              <SliderInput label="Tamano botones" value={theme.fonts.sizeButton} min={11} max={16} unit="px" onChange={v => updateFonts('sizeButton', v)} />
            </SectionAccordion>

            {/* Layout */}
            <SectionAccordion title="Layout" icon={Layout} open={openSection === 'layout'} onToggle={() => toggleSection('layout')}>
              <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Header</p>
              <OptionGroup
                label="Tipo de header"
                options={[{ value: 'fixed' as const, label: 'Fijo' }, { value: 'scroll' as const, label: 'Scroll' }, { value: 'transparent' as const, label: 'Transparente' }]}
                value={theme.layout.headerType}
                onChange={v => updateLayout('headerType', v)}
              />
              <OptionGroup
                label="Posicion del logo"
                options={[{ value: 'left' as const, label: 'Izquierda' }, { value: 'center' as const, label: 'Centro' }, { value: 'right' as const, label: 'Derecha' }]}
                value={theme.layout.headerLayout}
                onChange={v => updateLayout('headerLayout', v)}
              />
              <ToggleSwitch label="Mega menu" checked={theme.layout.megaMenu} onChange={v => updateLayout('megaMenu', v)} />

              <div className="border-t border-[var(--border)] pt-2">
                <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-medium mb-2">Footer</p>
              </div>
              <OptionGroup
                label="Columnas"
                options={[{ value: '2' as any, label: '2' }, { value: '3' as any, label: '3' }, { value: '4' as any, label: '4' }]}
                value={String(theme.layout.footerColumns) as any}
                onChange={v => updateLayout('footerColumns', Number(v) as 2 | 3 | 4)}
              />
              <ToggleSwitch label="Newsletter en footer" checked={theme.layout.footerNewsletter} onChange={v => updateLayout('footerNewsletter', v)} />
              <ToggleSwitch label="Redes sociales en footer" checked={theme.layout.footerSocial} onChange={v => updateLayout('footerSocial', v)} />

              <div className="border-t border-[var(--border)] pt-2">
                <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-medium mb-2">Producto</p>
              </div>
              <OptionGroup
                label="Product cards"
                options={[{ value: 'vertical' as const, label: 'Vertical' }, { value: 'horizontal' as const, label: 'Horizontal' }]}
                value={theme.layout.cardLayout}
                onChange={v => updateLayout('cardLayout', v)}
              />
              <ToggleSwitch label="Mostrar rating en cards" checked={theme.layout.cardShowRating} onChange={v => updateLayout('cardShowRating', v)} />
              <ToggleSwitch label="Mostrar badges en cards" checked={theme.layout.cardShowBadge} onChange={v => updateLayout('cardShowBadge', v)} />
              <OptionGroup
                label="Galeria de producto"
                options={[{ value: 'slider' as const, label: 'Slider' }, { value: 'grid' as const, label: 'Grid' }, { value: 'zoom' as const, label: 'Zoom' }]}
                value={theme.layout.productGallery}
                onChange={v => updateLayout('productGallery', v)}
              />
              <OptionGroup
                label="Descripcion de producto"
                options={[{ value: 'tabs' as const, label: 'Tabs' }, { value: 'accordion' as const, label: 'Acordeon' }]}
                value={theme.layout.productDescStyle}
                onChange={v => updateLayout('productDescStyle', v)}
              />

              <div className="border-t border-[var(--border)] pt-2">
                <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-medium mb-2">Checkout</p>
              </div>
              <OptionGroup
                label="Tipo de checkout"
                options={[{ value: 'single' as const, label: '1 pagina' }, { value: 'multi' as const, label: 'Multi-step' }]}
                value={theme.layout.checkoutType}
                onChange={v => updateLayout('checkoutType', v)}
              />
            </SectionAccordion>

            {/* Components */}
            <SectionAccordion title="Componentes" icon={Square} open={openSection === 'components'} onToggle={() => toggleSection('components')}>
              <OptionGroup
                label="Forma de botones"
                options={[{ value: 'rectangular' as const, label: 'Rectangular' }, { value: 'rounded' as const, label: 'Redondeado' }, { value: 'pill' as const, label: 'Pill' }]}
                value={theme.components.buttonShape}
                onChange={v => updateComponents('buttonShape', v)}
              />
              <div className="flex gap-2">
                <button
                  style={{
                    backgroundColor: theme.colors.accent,
                    color: '#FFF',
                    borderRadius: theme.components.buttonShape === 'pill' ? '9999px' : theme.components.buttonShape === 'rounded' ? '8px' : '2px',
                    padding: theme.components.buttonSize === 'sm' ? '4px 10px' : theme.components.buttonSize === 'lg' ? '10px 20px' : '6px 14px',
                    fontSize: theme.fonts.sizeButton + 'px',
                  }}
                >
                  Primario
                </button>
                <button
                  style={{
                    backgroundColor: 'transparent',
                    color: theme.colors.accent,
                    border: '1px solid ' + theme.colors.accent,
                    borderRadius: theme.components.buttonShape === 'pill' ? '9999px' : theme.components.buttonShape === 'rounded' ? '8px' : '2px',
                    padding: theme.components.buttonSize === 'sm' ? '4px 10px' : theme.components.buttonSize === 'lg' ? '10px 20px' : '6px 14px',
                    fontSize: theme.fonts.sizeButton + 'px',
                  }}
                >
                  Secundario
                </button>
              </div>
              <OptionGroup
                label="Tamano de botones"
                options={[{ value: 'sm' as const, label: 'Pequeno' }, { value: 'md' as const, label: 'Mediano' }, { value: 'lg' as const, label: 'Grande' }]}
                value={theme.components.buttonSize}
                onChange={v => updateComponents('buttonSize', v)}
              />
              <OptionGroup
                label="Efecto hover"
                options={[
                  { value: 'darken' as const, label: 'Oscurecer' },
                  { value: 'lighten' as const, label: 'Aclarar' },
                  { value: 'scale' as const, label: 'Escalar' },
                  { value: 'shadow' as const, label: 'Sombra' },
                ]}
                value={theme.components.hoverStyle}
                onChange={v => updateComponents('hoverStyle', v)}
              />
              <OptionGroup
                label="Sombra de cards"
                options={[{ value: 'none' as const, label: 'Ninguna' }, { value: 'sm' as const, label: 'Suave' }, { value: 'md' as const, label: 'Media' }, { value: 'lg' as const, label: 'Fuerte' }]}
                value={theme.components.cardShadow}
                onChange={v => updateComponents('cardShadow', v)}
              />
              <SliderInput label="Border radius cards" value={theme.components.cardRadius} min={0} max={24} unit="px" onChange={v => updateComponents('cardRadius', v)} />
              <OptionGroup
                label="Estilo de badges"
                options={[{ value: 'solid' as const, label: 'Solido' }, { value: 'outline' as const, label: 'Outline' }, { value: 'soft' as const, label: 'Suave' }]}
                value={theme.components.badgeStyle}
                onChange={v => updateComponents('badgeStyle', v)}
              />
              <OptionGroup
                label="Set de iconos"
                options={[
                  { value: 'lucide' as const, label: 'Lucide' },
                  { value: 'heroicons' as const, label: 'Heroicons' },
                  { value: 'custom' as const, label: 'Custom' },
                ]}
                value={theme.components.iconSet}
                onChange={v => updateComponents('iconSet', v)}
              />
            </SectionAccordion>

            {/* Homepage Builder */}
            <SectionAccordion title="Homepage Builder" icon={Home} open={openSection === 'homepage'} onToggle={() => toggleSection('homepage')}>
              <p className="text-[10px] text-[var(--text-muted)] mb-1">Arrastra para reordenar las secciones del homepage. El preview refleja estos cambios.</p>
              <div className="space-y-1.5">
                {theme.homepageSections.map((section, idx) => (
                  <div
                    key={section.id}
                    className={'flex items-center gap-2 p-2 rounded-[var(--radius-card)] border transition-colors ' + (section.enabled ? 'border-[var(--border)] bg-[var(--surface)]' : 'border-dashed border-[var(--border)] bg-[var(--surface2)]/50 opacity-60')}
                  >
                    <GripVertical size={12} className="text-[var(--text-muted)] cursor-grab shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-[var(--text)] truncate">{section.label}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <select
                          value={section.spacing}
                          onChange={e => updateSectionProp(section.id, 'spacing', e.target.value)}
                          className="text-[8px] border border-[var(--border)] rounded px-1 py-0.5 bg-[var(--surface)] outline-none"
                        >
                          <option value="sm">Compact</option>
                          <option value="md">Normal</option>
                          <option value="lg">Amplio</option>
                        </select>
                        <select
                          value={section.bgStyle}
                          onChange={e => updateSectionProp(section.id, 'bgStyle', e.target.value)}
                          className="text-[8px] border border-[var(--border)] rounded px-1 py-0.5 bg-[var(--surface)] outline-none"
                        >
                          <option value="default">Fondo</option>
                          <option value="primary">Primario</option>
                          <option value="accent">Acento</option>
                          <option value="surface">Superficie</option>
                        </select>
                        <select
                          value={section.width}
                          onChange={e => updateSectionProp(section.id, 'width', e.target.value)}
                          className="text-[8px] border border-[var(--border)] rounded px-1 py-0.5 bg-[var(--surface)] outline-none"
                        >
                          <option value="full">Full</option>
                          <option value="contained">Contenido</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed">
                        <ArrowUp size={10} />
                      </button>
                      <button onClick={() => moveSection(idx, 1)} disabled={idx === theme.homepageSections.length - 1} className="p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed">
                        <ArrowDown size={10} />
                      </button>
                      <button
                        onClick={() => toggleSectionEnabled(section.id)}
                        className={'p-0.5 rounded transition-colors ' + (section.enabled ? 'text-[var(--success)]' : 'text-[var(--text-muted)]')}
                        title={section.enabled ? 'Desactivar' : 'Activar'}
                      >
                        <Eye size={10} />
                      </button>
                      <button onClick={() => removeSectionById(section.id)} className="p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--error)] transition-colors">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Add section */}
              <div>
                <p className="text-[10px] text-[var(--text-muted)] mb-1.5">Agregar seccion</p>
                <div className="grid grid-cols-2 gap-1">
                  {sectionTypes.map(st => (
                    <button
                      key={st.type}
                      onClick={() => addSection(st.type)}
                      className="text-[9px] text-[var(--text-secondary)] border border-dashed border-[var(--border)] rounded-[var(--radius-card)] px-2 py-1.5 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors flex items-center gap-1"
                    >
                      <Plus size={8} /> {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </SectionAccordion>
          </div>
        </Card>

        {/* Preview Panel */}
        <Card className="overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-[var(--surface2)]/50 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Eye size={12} className="text-[var(--accent)]" />
              <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Preview en vivo</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Page selector */}
              <div className="flex gap-1">
                {([
                  { id: 'home' as PreviewPage, label: 'Home' },
                  { id: 'product' as PreviewPage, label: 'Producto' },
                  { id: 'category' as PreviewPage, label: 'Categoria' },
                  { id: 'checkout' as PreviewPage, label: 'Checkout' },
                  { id: 'cart' as PreviewPage, label: 'Carrito' },
                ]).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPreviewPage(p.id)}
                    className={
                      'px-2 py-1 text-[9px] rounded transition-colors ' +
                      (previewPage === p.id ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-medium' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')
                    }
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="w-px h-4 bg-wood-200" />

              {/* Device selector */}
              <div className="flex gap-0.5">
                {([
                  { id: 'desktop' as PreviewDevice, icon: Monitor },
                  { id: 'tablet' as PreviewDevice, icon: Tablet },
                  { id: 'mobile' as PreviewDevice, icon: Smartphone },
                ]).map(d => {
                  const DIcon = d.icon;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setPreviewDevice(d.id)}
                      className={
                        'p-1.5 rounded transition-colors ' +
                        (previewDevice === d.id ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')
                      }
                    >
                      <DIcon size={13} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-[var(--surface2)]">
            <LivePreview theme={theme} page={previewPage} device={previewDevice} />
          </div>
        </Card>
      </div>
      </>)} {/* end editor view */}
    </div>
  );
};
