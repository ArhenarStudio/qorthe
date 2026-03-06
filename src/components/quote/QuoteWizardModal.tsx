"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import {
  ProductItem, ProductType, ProductCategory, WoodProductType,
  TextileProductType, WizardStep, DEFAULT_ENGRAVING, DEFAULT_TEXTILE, DEFAULT_BOARD_DESIGN,
} from './types';
import { WoodSelector } from './WoodSelector';
import { EngravingConfigurator } from './EngravingConfigurator';
import { TextileConfigurator } from './TextileConfigurator';
import { BoardDesignConfigurator } from './BoardDesignConfigurator';
import { QuoteErrorBoundary } from './QuoteErrorBoundary';
import { QuotePreviewSidebar } from './QuotePreviewSidebar';
import { getProductIcon, PRODUCT_ICON_MAP, MATERIAL_ICON_MAP } from './QuoteIcons';
import { calculateItemPrice, formatMXN } from './pricing';
import { useQuoteConfig } from '@/hooks/useQuoteConfig';

// ── Product catalog (now from config) ───────────────────────

interface ProductOption {
  type: ProductType;
  category: ProductCategory;
  label: string;
  desc: string;
}

// Hardcoded constants removed — WOOD_PRODUCTS, TEXTILE_PRODUCTS,
// SERVICE_PRODUCT, ENGRAVE_MATERIALS now come from useQuoteConfig()

// ── Wizard step definitions ─────────────────────────────────

function getSteps(category: ProductCategory): WizardStep[] {
  if (category === 'grabado') {
    return [
      { id: 'type', label: 'Tipo', title: 'Elige el Producto', subtitle: '¿Qué tipo de pieza deseas?' },
      { id: 'material-engrave', label: 'Material', title: 'Superficie a Grabar', subtitle: 'Elige el material del objeto' },
      { id: 'engraving', label: 'Diseño', title: 'Diseño del Grabado', subtitle: 'Configura tu personalización' },
      { id: 'quantity', label: 'Cantidad', title: 'Cantidad y Notas', subtitle: '¿Cuántas piezas necesitas?' },
    ];
  }
  if (category === 'textil') {
    return [
      { id: 'type', label: 'Tipo', title: 'Elige el Producto', subtitle: '¿Qué tipo de pieza deseas?' },
      { id: 'textile', label: 'Estampado', title: 'Personaliza tu Textil', subtitle: 'Técnica, color y diseño' },
      { id: 'quantity', label: 'Cantidad', title: 'Cantidad y Notas', subtitle: '¿Cuántas piezas necesitas?' },
    ];
  }
  // madera
  return [
    { id: 'type', label: 'Tipo', title: 'Elige el Producto', subtitle: '¿Qué tipo de pieza deseas?' },
    { id: 'material', label: 'Material', title: 'Elige la Madera', subtitle: 'La esencia de tu creación' },
    { id: 'dimensions', label: 'Medidas', title: 'Dimensiones', subtitle: 'Largo, ancho y espesor en cm' },
    { id: 'design', label: 'Diseño', title: 'Diseño de la Pieza', subtitle: 'Forma, acabados y extras' },
    { id: 'engraving', label: 'Grabado', title: 'Grabado Láser', subtitle: 'Personaliza con grabado' },
    { id: 'quantity', label: 'Cantidad', title: 'Cantidad y Notas', subtitle: '¿Cuántas piezas necesitas?' },
  ];
}

// ── Engraving materials for service ─────────────────────────

// ENGRAVE_MATERIALS now comes from useQuoteConfig()

// ── Component ───────────────────────────────────────────────

interface QuoteWizardModalProps {
  initialItem: ProductItem;
  onSave: (item: ProductItem) => void;
  onClose: () => void;
}

export const QuoteWizardModal: React.FC<QuoteWizardModalProps> = ({
  initialItem,
  onSave,
  onClose,
}) => {
  const [item, setItemRaw] = useState<ProductItem>(initialItem);
  const [itemHistory, setItemHistory] = useState<ProductItem[]>([]);
  const setItem = React.useCallback((newItem: ProductItem | ((prev: ProductItem) => ProductItem)) => {
    setItemRaw(prev => {
      const next = typeof newItem === 'function' ? newItem(prev) : newItem;
      setItemHistory(h => [...h.slice(-10), prev]); // Keep last 10 states
      return next;
    });
  }, []);
  const undoItem = React.useCallback(() => {
    if (itemHistory.length === 0) return;
    const prev = itemHistory[itemHistory.length - 1];
    setItemHistory(h => h.slice(0, -1));
    setItemRaw(prev);
  }, [itemHistory]);
  const [stepIdx, setStepIdx] = useState(0);
  const [dir, setDir] = useState(0);
  const [activeTab, setActiveTab] = useState<'madera' | 'textil' | 'grabado'>(
    initialItem.category || 'madera'
  );

  // ── Read product catalog from centralized config ────────
  const { config: quoteConfig } = useQuoteConfig();
  const WOOD_PRODUCTS: ProductOption[] = quoteConfig.woodProducts
    .filter(p => p.enabled)
    .map(p => ({ type: p.type as ProductType, category: p.category, label: p.label, desc: p.desc }));
  const TEXTILE_PRODUCTS: ProductOption[] = quoteConfig.textileProducts
    .filter(p => p.enabled)
    .map(p => ({ type: p.type as ProductType, category: p.category, label: p.label, desc: p.desc }));
  const SERVICE_PRODUCT: ProductOption = {
    type: quoteConfig.serviceProduct.type as ProductType,
    category: quoteConfig.serviceProduct.category,
    label: quoteConfig.serviceProduct.label,
    desc: quoteConfig.serviceProduct.desc,
  };
  const ENGRAVE_MATERIALS = quoteConfig.engraveMaterials.filter(m => m.enabled);

  const steps = getSteps(item.category);

  // Reset step if steps change (e.g. category switch)
  useEffect(() => {
    if (stepIdx >= steps.length) setStepIdx(steps.length - 1);
  }, [item.category, steps.length, stepIdx]);

  const step = steps[stepIdx] || steps[0];
  const isLast = stepIdx === steps.length - 1;

  // ── Step validation ──────────────────────────────────────
  const canProceed = useCallback((): boolean => {
    const s = steps[stepIdx];
    if (!s) return false;
    switch (s.id) {
      case 'type': return !!item.type;
      case 'material': return item.woods.length > 0;
      case 'material-engrave': return !!item.materialToEngrave;
      case 'dimensions': return item.dimensions.length >= 5 && item.dimensions.width >= 5 && item.dimensions.thickness >= 1;
      case 'design': return !!item.boardDesign?.shape;
      case 'engraving': return true; // optional step
      case 'textile': return !!(item.textile?.technique && item.textile?.color);
      case 'quantity': return item.quantity >= 1;
      default: return true;
    }
  }, [stepIdx, steps, item]);

  const [validationError, setValidationError] = useState<string | null>(null);

  const nav = useCallback(
    (d: number) => {
      // Validate before moving forward
      if (d > 0 && !canProceed()) {
        const s = steps[stepIdx];
        const msgs: Record<string, string> = {
          'type': 'Selecciona un tipo de producto',
          'material': 'Selecciona al menos una madera',
          'material-engrave': 'Selecciona el material a grabar',
          'dimensions': 'Las medidas mínimas son 5×5×1 cm',
          'design': 'Selecciona una forma para tu pieza',
          'textile': 'Selecciona técnica y color',
          'quantity': 'Mínimo 1 pieza',
        };
        setValidationError(msgs[s?.id || ''] || 'Completa este paso');
        setTimeout(() => setValidationError(null), 3000);
        return;
      }
      setValidationError(null);
      const next = stepIdx + d;
      if (next >= 0 && next < steps.length) {
        setDir(d);
        setStepIdx(next);
      }
    },
    [stepIdx, steps, canProceed]
  );

  // Keyboard navigation: ArrowLeft/Right for steps, Escape to close
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); nav(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); nav(-1); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nav, onClose]);

  // Select a product type (resets category-specific fields)
  const selectProduct = (opt: ProductOption) => {
    const base: Partial<ProductItem> = {
      type: opt.type,
      category: opt.category,
    };
    if (opt.category === 'textil') {
      base.textile = { ...DEFAULT_TEXTILE };
      base.engraving = { ...DEFAULT_ENGRAVING, enabled: false };
    } else if (opt.category === 'grabado') {
      base.engraving = { ...DEFAULT_ENGRAVING, enabled: true };
    } else {
      base.engraving = item.engraving.enabled
        ? item.engraving
        : { ...DEFAULT_ENGRAVING };
      base.boardDesign = item.boardDesign || { ...DEFAULT_BOARD_DESIGN };
    }
    setItem((prev) => ({ ...prev, ...base }));
    setActiveTab(opt.category);
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-6" role="dialog" aria-modal="true" aria-label="Cotizador de piezas personalizadas">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-wood-950/80 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        className="relative w-full max-w-6xl h-[92vh] md:h-[88vh] bg-sand-50 dark:bg-black rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-wood-100 dark:border-wood-800"
      >
        {/* ── Header: Steps ──────────────────────── */}
        <div className="flex-none px-5 py-4 border-b border-wood-100 dark:border-wood-800 flex items-center justify-between bg-white dark:bg-wood-950/50">
          <div className="flex items-center gap-2 md:gap-3 overflow-x-auto flex-1 mr-4 scrollbar-hide" role="navigation" aria-label="Pasos del cotizador">
            {steps.map((s, i) => {
              const active = i === stepIdx;
              const done = i < stepIdx;
              return (
                <div key={s.id} className="flex items-center gap-2 flex-shrink-0" role="listitem" aria-current={active ? 'step' : undefined}>
                  <button
                    onClick={() => {
                      if (i < stepIdx) {
                        setDir(-1);
                        setStepIdx(i);
                      }
                    }}
                    disabled={i > stepIdx}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      active
                        ? 'bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 shadow-md'
                        : done
                        ? 'bg-accent-gold/20 text-accent-gold cursor-pointer hover:bg-accent-gold/30'
                        : 'text-wood-400 cursor-default'
                    }`}
                  >
                    {done ? <Check className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                    <span className="hidden md:inline">{s.label}</span>
                  </button>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-4 md:w-6 h-0.5 rounded-full ${
                        done ? 'bg-accent-gold' : 'bg-wood-200 dark:bg-wood-800'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {itemHistory.length > 0 && (
            <button onClick={undoItem} aria-label="Deshacer" className="p-2 rounded-full hover:bg-wood-100 dark:hover:bg-wood-800 text-wood-400 hover:text-wood-900 transition-colors flex-shrink-0" title="Deshacer (Ctrl+Z)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Cerrar cotizador"
            className="p-2 rounded-full hover:bg-wood-100 dark:hover:bg-wood-800 text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body: Content + Sidebar ────────────── */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-5 py-6 md:py-10">
              {/* Title */}
              <div className="mb-6 md:mb-10">
                <motion.h2
                  key={step.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl md:text-3xl font-serif text-wood-900 dark:text-sand-100 mb-1"
                >
                  {step.title}
                </motion.h2>
                <motion.p
                  key={step.subtitle}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-wood-500 text-sm"
                >
                  {step.subtitle}
                </motion.p>
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={step.id === 'type' ? 'type-step' : `${item.category}-${step.id}`}
                  custom={dir}
                  variants={variants}
                  initial={step.id === 'type' ? false : 'enter'}
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {/* ═══ STEP: TYPE ═══ */}
                  {step.id === 'type' && (
                    <div className="space-y-6">
                      {/* All products in a unified visual grid — no confusing category tabs */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-wood-400 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-4 h-0.5 bg-accent-gold rounded" /> Madera
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {WOOD_PRODUCTS.map((opt) => {
                            const sel = item.type === opt.type;
                            const Icon = getProductIcon(opt.type);
                            return (
                              <button key={opt.type} onClick={() => selectProduct(opt)}
                                className={`group p-4 rounded-xl border-2 text-left transition-all duration-200 ${sel ? 'bg-wood-900 dark:bg-sand-100 border-wood-900 dark:border-sand-100 shadow-xl' : 'bg-white dark:bg-wood-900 border-transparent hover:border-wood-200 shadow-sm hover:shadow-md'}`}>
                                <div className={`mb-2 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${sel ? 'bg-accent-gold text-wood-900' : 'bg-wood-100 dark:bg-wood-800 text-wood-500'}`}>
                                  <Icon size={20} />
                                </div>
                                <span className={`block font-serif text-sm leading-tight mb-0.5 ${sel ? 'text-sand-100 dark:text-wood-900' : 'text-wood-900 dark:text-sand-100'}`}>{opt.label}</span>
                                <span className={`block text-[10px] ${sel ? 'text-sand-300' : 'text-wood-400'}`}>{opt.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {TEXTILE_PRODUCTS.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-wood-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-4 h-0.5 bg-accent-gold rounded" /> Textil
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {TEXTILE_PRODUCTS.map((opt) => {
                              const sel = item.type === opt.type;
                              const Icon = getProductIcon(opt.type);
                              return (
                                <button key={opt.type} onClick={() => selectProduct(opt)}
                                  className={`group p-4 rounded-xl border-2 text-left transition-all duration-200 ${sel ? 'bg-wood-900 dark:bg-sand-100 border-wood-900 dark:border-sand-100 shadow-xl' : 'bg-white dark:bg-wood-900 border-transparent hover:border-wood-200 shadow-sm hover:shadow-md'}`}>
                                  <div className={`mb-2 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${sel ? 'bg-accent-gold text-wood-900' : 'bg-wood-100 dark:bg-wood-800 text-wood-500'}`}>
                                    <Icon size={20} />
                                  </div>
                                  <span className={`block font-serif text-sm leading-tight mb-0.5 ${sel ? 'text-sand-100 dark:text-wood-900' : 'text-wood-900 dark:text-sand-100'}`}>{opt.label}</span>
                                  <span className={`block text-[10px] ${sel ? 'text-sand-300' : 'text-wood-400'}`}>{opt.desc}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {quoteConfig.serviceProduct.enabled && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-wood-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-4 h-0.5 bg-accent-gold rounded" /> Servicio
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[SERVICE_PRODUCT].map((opt) => {
                              const sel = item.type === opt.type;
                              const Icon = getProductIcon(opt.type);
                              return (
                                <button key={opt.type} onClick={() => selectProduct(opt)}
                                  className={`group p-4 rounded-xl border-2 text-left transition-all duration-200 ${sel ? 'bg-wood-900 dark:bg-sand-100 border-wood-900 dark:border-sand-100 shadow-xl' : 'bg-white dark:bg-wood-900 border-transparent hover:border-wood-200 shadow-sm hover:shadow-md'}`}>
                                  <div className={`mb-2 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${sel ? 'bg-accent-gold text-wood-900' : 'bg-wood-100 dark:bg-wood-800 text-wood-500'}`}>
                                    <Icon size={20} />
                                  </div>
                                  <span className={`block font-serif text-sm leading-tight mb-0.5 ${sel ? 'text-sand-100 dark:text-wood-900' : 'text-wood-900 dark:text-sand-100'}`}>{opt.label}</span>
                                  <span className={`block text-[10px] ${sel ? 'text-sand-300' : 'text-wood-400'}`}>{opt.desc}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ═══ STEP: MATERIAL (wood) ═══ */}
                  {step.id === 'material' && (
                    <WoodSelector
                      selectedWoods={item.woods}
                      primaryWood={item.primaryWood}
                      secondaryWood={item.secondaryWood}
                      onChange={(woods, prim, sec) =>
                        setItem({ ...item, woods, primaryWood: prim, secondaryWood: sec })
                      }
                    />
                  )}

                  {/* ═══ STEP: MATERIAL-ENGRAVE (service) ═══ */}
                  {step.id === 'material-engrave' && (
                    <div className="space-y-4">
                      <label className="block text-center text-xs font-bold text-wood-400 uppercase tracking-widest mb-4">
                        ¿Qué material deseas grabar?
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                        {ENGRAVE_MATERIALS.map((m) => {
                          const sel = item.materialToEngrave === m.label;
                          return (
                            <button
                              key={m.label}
                              onClick={() => setItem({ ...item, materialToEngrave: m.label })}
                              className={`h-28 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                                sel
                                  ? 'border-accent-gold bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900'
                                  : 'border-wood-100 dark:border-wood-800 bg-white dark:bg-wood-900 hover:border-wood-300 text-wood-700 dark:text-sand-200'
                              }`}
                            >
                              {(() => { const MIcon = MATERIAL_ICON_MAP[m.label]; return MIcon ? <MIcon size={28} /> : null; })()}
                              <span className="font-serif font-medium text-sm">{m.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ═══ STEP: DIMENSIONS (wood) ═══ */}
                  {step.id === 'dimensions' && (
                    <div className="space-y-10 py-4">
                      {/* Presets */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">
                          Tamaños populares
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { l: 30, w: 20, t: 2.5, label: 'Pequeña', emoji: '🍞', use: 'Tabla personal' },
                            { l: 40, w: 25, t: 3, label: 'Mediana', emoji: '🧀', use: 'Uso diario cocina' },
                            { l: 55, w: 30, t: 3, label: 'Grande', emoji: '🥩', use: 'Charcutería / regalo' },
                            { l: 70, w: 35, t: 3.5, label: 'XL', emoji: '🎉', use: 'Presentación / evento' },
                          ].map((p) => {
                            const active =
                              item.dimensions.length === p.l &&
                              item.dimensions.width === p.w &&
                              item.dimensions.thickness === p.t;
                            // Scale factor for SVG illustration
                            const scale = p.l / 70;
                            return (
                              <button
                                key={p.label}
                                onClick={() =>
                                  setItem({
                                    ...item,
                                    dimensions: { length: p.l, width: p.w, thickness: p.t },
                                  })
                                }
                                className={`p-4 rounded-xl border-2 text-center transition-all ${
                                  active
                                    ? 'border-accent-gold bg-accent-gold/5 shadow-md'
                                    : 'bg-white dark:bg-wood-900 border-wood-100 dark:border-wood-800 hover:border-wood-300'
                                }`}
                              >
                                {/* Board illustration */}
                                <div className="flex items-center justify-center mb-2 h-12">
                                  <svg viewBox="0 0 80 50" style={{ width: `${Math.max(50, scale * 80)}px`, height: `${Math.max(25, scale * 40)}px` }}>
                                    <rect x="5" y="5" width={70 * scale} height={40 * scale} rx="4" fill={active ? '#C5A065' : '#D7CCC8'} opacity={active ? 0.3 : 0.2} stroke={active ? '#C5A065' : '#8B7355'} strokeWidth="1" />
                                    <text x={5 + 35 * scale} y={5 + 22 * scale} textAnchor="middle" fill={active ? '#8B6914' : '#8B7355'} fontSize="8">{p.l}×{p.w}</text>
                                  </svg>
                                </div>
                                <span className="text-xs font-bold block">{p.emoji} {p.label}</span>
                                <span className="text-[9px] text-wood-400 block">{p.l}×{p.w}×{p.t} cm</span>
                                <span className="text-[9px] text-wood-500 block mt-0.5">{p.use}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom inputs */}
                      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-center">
                        {(['length', 'width', 'thickness'] as const).map((field) => {
                          const labels = { length: 'Largo', width: 'Ancho', thickness: 'Espesor' };
                          const val = item.dimensions[field];
                          return (
                            <div key={field} className="w-full md:w-auto text-center">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-wood-400 block mb-2">
                                {labels[field]}
                              </label>
                              <input
                                type="number"
                                value={val}
                                step={field === 'thickness' ? 0.5 : 1}
                                min={field === 'thickness' ? 1 : 10}
                                onChange={(e) =>
                                  setItem({
                                    ...item,
                                    dimensions: {
                                      ...item.dimensions,
                                      [field]: Number(e.target.value),
                                    },
                                  })
                                }
                                className="w-full md:w-32 h-14 md:h-28 bg-white dark:bg-wood-900 border-2 border-wood-100 dark:border-wood-800 rounded-xl md:rounded-2xl text-2xl md:text-4xl font-serif text-wood-900 dark:text-sand-100 outline-none focus:border-accent-gold transition-all text-center"
                              />
                              <span className="text-[10px] font-bold text-wood-300 uppercase mt-1 block">
                                cm
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ═══ STEP: BOARD DESIGN (wood only) ═══ */}
                  {step.id === 'design' && item.boardDesign && (
                    <BoardDesignConfigurator
                      design={item.boardDesign}
                      onChange={(bd) => setItem({ ...item, boardDesign: bd })}
                    />
                  )}

                  {/* ═══ STEP: ENGRAVING (auto-enabled when user reaches this step) ═══ */}
                  {step.id === 'engraving' && (
                    <EngravingConfigurator
                      config={item.category === 'grabado' ? { ...item.engraving, enabled: true } : item.engraving}
                      onChange={(cfg) => setItem({ ...item, engraving: cfg })}
                      forceEnabled={item.category === 'grabado'}
                    />
                  )}

                  {/* ═══ STEP: TEXTILE CONFIG ═══ */}
                  {step.id === 'textile' && (
                    <TextileConfigurator
                      config={item.textile || DEFAULT_TEXTILE}
                      productType={item.type as TextileProductType}
                      onChange={(cfg) => setItem({ ...item, textile: cfg })}
                    />
                  )}

                  {/* ═══ STEP: QUANTITY + NOTES ═══ */}
                  {step.id === 'quantity' && (
                    <div className="space-y-10 py-4">
                      {/* Quantity selector */}
                      <div className="max-w-md mx-auto bg-white dark:bg-wood-900/50 rounded-2xl p-6 border border-wood-100 dark:border-wood-800">
                        <span className="text-xs font-bold uppercase tracking-widest text-wood-500 block mb-4">
                          Cantidad
                        </span>
                        <div className="flex items-center justify-center gap-6">
                          <button
                            onClick={() =>
                              setItem({ ...item, quantity: Math.max(1, item.quantity - 1) })
                            }
                            className="w-12 h-12 rounded-xl bg-wood-100 dark:bg-wood-800 flex items-center justify-center text-xl font-bold hover:bg-wood-200 transition-colors"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              setItem({
                                ...item,
                                quantity: Math.max(1, parseInt(e.target.value) || 1),
                              })
                            }
                            className="w-20 h-16 text-center font-serif text-4xl bg-transparent outline-none text-wood-900 dark:text-sand-100 border-b-2 border-wood-200 dark:border-wood-700 focus:border-accent-gold"
                          />
                          <button
                            onClick={() => setItem({ ...item, quantity: item.quantity + 1 })}
                            className="w-12 h-12 rounded-xl bg-accent-gold text-wood-900 flex items-center justify-center text-xl font-bold hover:scale-105 transition-transform shadow-md"
                          >
                            +
                          </button>
                        </div>
                        {/* Volume discount — live calculation */}
                        {(() => {
                          const bp = calculateItemPrice(item);
                          if (bp.volumeDiscountPercent > 0) {
                            return (
                              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
                                <p className="text-xs text-green-700 dark:text-green-400 font-bold">
                                  🎉 {Math.round(bp.volumeDiscountPercent * 100)}% de descuento por volumen
                                </p>
                                <p className="text-[10px] text-green-600 dark:text-green-500 mt-0.5">
                                  Ahorras {formatMXN(bp.volumeDiscount)} por pieza — Total: {formatMXN(bp.lineTotal)}
                                </p>
                              </div>
                            );
                          }
                          if (item.quantity < 5) {
                            return (
                              <p className="text-center text-xs text-wood-400 mt-3">
                                💡 A partir de 5 piezas obtén descuento por volumen
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>

                      {/* Notes */}
                      <div className="max-w-md mx-auto space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-wood-400">
                          Notas adicionales (opcional)
                        </label>
                        <textarea
                          value={item.notes || ''}
                          onChange={(e) => setItem({ ...item, notes: e.target.value })}
                          placeholder="Instrucciones especiales, detalles del evento, referencia de diseño..."
                          rows={3}
                          className="w-full bg-white dark:bg-wood-900 border border-wood-200 dark:border-wood-700 rounded-xl p-4 text-sm outline-none focus:border-accent-gold resize-none transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar Preview (desktop) */}
          <div className="hidden md:block w-80 border-l border-wood-100 dark:border-wood-800 overflow-y-auto p-4 bg-wood-50/50 dark:bg-wood-950/50">
            <QuotePreviewSidebar item={item} />
          </div>
        </div>

        {/* ── Footer ─────────────────────────────── */}
        <div className="flex-none px-4 py-3 md:px-5 md:py-4 border-t border-wood-100 dark:border-wood-800 bg-white dark:bg-wood-950">
          {/* Validation error */}
          {validationError && (
            <div role="alert" aria-live="assertive" className="mb-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 text-center">
              {validationError}
            </div>
          )}
          <div className="flex justify-between items-center gap-2">
          <button
            onClick={() => nav(-1)}
            disabled={stepIdx === 0}
            aria-label="Paso anterior"
            className={`flex items-center gap-1.5 px-3 py-2.5 md:px-5 rounded-xl font-medium text-sm transition-all shrink-0 ${
              stepIdx === 0
                ? 'opacity-0 pointer-events-none'
                : 'text-wood-500 hover:text-wood-900 dark:hover:text-sand-100 hover:bg-wood-100 dark:hover:bg-wood-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {/* Mobile price */}
          <div className="md:hidden text-center min-w-0">
            <span className="text-[10px] text-wood-400 block">Estimado</span>
            <span className="font-serif text-base font-bold text-wood-900 dark:text-sand-100 truncate">
              {formatMXN(calculateItemPrice(item).lineTotal)}
            </span>
          </div>

          {isLast ? (
            <button
              onClick={() => onSave(item)}
              className="flex items-center gap-1.5 px-4 py-2.5 md:px-8 md:py-3 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-xs hover:shadow-xl transition-all shrink-0"
            >
              <Check className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          ) : (
            <button
              onClick={() => nav(1)}
              className={`flex items-center gap-1.5 px-4 py-2.5 md:px-8 md:py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all shrink-0 ${
                canProceed() ? 'bg-accent-gold text-wood-900 hover:shadow-lg' : 'bg-wood-200 text-wood-400 cursor-not-allowed'
              }`}
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
