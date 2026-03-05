"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import {
  ProductItem, ProductType, ProductCategory, WoodProductType,
  TextileProductType, WizardStep, DEFAULT_ENGRAVING, DEFAULT_TEXTILE,
} from './types';
import { WoodSelector } from './WoodSelector';
import { EngravingConfigurator } from './EngravingConfigurator';
import { TextileConfigurator } from './TextileConfigurator';
import { QuotePreviewSidebar } from './QuotePreviewSidebar';
import { getProductIcon, PRODUCT_ICON_MAP } from './QuoteIcons';
import { calculateItemPrice, formatMXN } from './pricing';

// ── Product catalog ─────────────────────────────────────────

interface ProductOption {
  type: ProductType;
  category: ProductCategory;
  label: string;
  desc: string;
}

const WOOD_PRODUCTS: ProductOption[] = [
  { type: 'Tabla de picar', category: 'madera', label: 'Tabla de Picar', desc: 'Funcional y elegante' },
  { type: 'Tabla de charcutería', category: 'madera', label: 'Tabla Charcutería', desc: 'Ideal para presentación' },
  { type: 'Tabla de decoración', category: 'madera', label: 'Tabla Decorativa', desc: 'Pieza de exhibición' },
  { type: 'Plato decorativo', category: 'madera', label: 'Plato Decorativo', desc: 'Artesanía para tu mesa' },
  { type: 'Caja personalizada', category: 'madera', label: 'Caja Personalizada', desc: 'Empaque o regalo premium' },
];

const TEXTILE_PRODUCTS: ProductOption[] = [
  { type: 'Tote bag', category: 'textil', label: 'Tote Bag', desc: 'Bolsa de tela personalizada' },
  { type: 'Mandil de cocina', category: 'textil', label: 'Mandil de Cocina', desc: 'Chef con tu marca' },
  { type: 'Servilletas', category: 'textil', label: 'Servilletas', desc: 'Tela con diseño personalizado' },
  { type: 'Funda de cojín', category: 'textil', label: 'Funda de Cojín', desc: 'Decoración sublimada' },
];

const SERVICE_PRODUCT: ProductOption = {
  type: 'Servicio de Grabado', category: 'grabado', label: 'Solo Grabado', desc: 'Láser en tu material',
};

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
    { id: 'engraving', label: 'Grabado', title: 'Grabado Láser', subtitle: 'Personaliza con grabado' },
    { id: 'quantity', label: 'Cantidad', title: 'Cantidad y Notas', subtitle: '¿Cuántas piezas necesitas?' },
  ];
}

// ── Engraving materials for service ─────────────────────────

const ENGRAVE_MATERIALS = [
  { label: 'Madera', emoji: '🪵' },
  { label: 'Cuero', emoji: '🟤' },
  { label: 'Metal / Termo', emoji: '⚙️' },
  { label: 'Acrílico', emoji: '💠' },
  { label: 'Vidrio', emoji: '🔮' },
  { label: 'Otro', emoji: '📦' },
];

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
  const [item, setItem] = useState<ProductItem>(initialItem);
  const [stepIdx, setStepIdx] = useState(0);
  const [dir, setDir] = useState(0);
  const [activeTab, setActiveTab] = useState<'madera' | 'textil' | 'grabado'>(
    initialItem.category || 'madera'
  );

  const steps = getSteps(item.category);

  // Reset step if steps change (e.g. category switch)
  useEffect(() => {
    if (stepIdx >= steps.length) setStepIdx(steps.length - 1);
  }, [item.category, steps.length, stepIdx]);

  const step = steps[stepIdx] || steps[0];
  const isLast = stepIdx === steps.length - 1;

  const nav = useCallback(
    (d: number) => {
      const next = stepIdx + d;
      if (next >= 0 && next < steps.length) {
        setDir(d);
        setStepIdx(next);
      }
    },
    [stepIdx, steps.length]
  );

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-6">
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
          <div className="flex items-center gap-2 md:gap-3 overflow-x-auto flex-1 mr-4 scrollbar-hide">
            {steps.map((s, i) => {
              const active = i === stepIdx;
              const done = i < stepIdx;
              return (
                <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
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
          <button
            onClick={onClose}
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
                  key={`${item.category}-${step.id}`}
                  custom={dir}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {/* ═══ STEP: TYPE ═══ */}
                  {step.id === 'type' && (
                    <div className="space-y-8">
                      {/* Category Tabs */}
                      <div className="flex gap-2 p-1 bg-wood-100 dark:bg-wood-900 rounded-xl w-fit mx-auto">
                        {(['madera', 'textil', 'grabado'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                              activeTab === tab
                                ? 'bg-white dark:bg-wood-800 text-wood-900 dark:text-sand-100 shadow-sm'
                                : 'text-wood-500 hover:text-wood-700'
                            }`}
                          >
                            {tab === 'madera'
                              ? '🪵 Madera'
                              : tab === 'textil'
                              ? '🧵 Textil'
                              : '✂️ Grabado'}
                          </button>
                        ))}
                      </div>

                      {/* Product Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {(activeTab === 'madera'
                          ? WOOD_PRODUCTS
                          : activeTab === 'textil'
                          ? TEXTILE_PRODUCTS
                          : [SERVICE_PRODUCT]
                        ).map((opt) => {
                          const sel = item.type === opt.type;
                          const Icon = getProductIcon(opt.type);
                          return (
                            <button
                              key={opt.type}
                              onClick={() => selectProduct(opt)}
                              className={`group p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                                sel
                                  ? 'bg-wood-900 dark:bg-sand-100 border-wood-900 dark:border-sand-100 shadow-xl'
                                  : 'bg-white dark:bg-wood-900 border-transparent hover:border-wood-200 dark:hover:border-wood-700 shadow-sm hover:shadow-md'
                              }`}
                            >
                              <div
                                className={`mb-3 w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                                  sel
                                    ? 'bg-accent-gold text-wood-900'
                                    : 'bg-wood-100 dark:bg-wood-800 text-wood-500 group-hover:text-wood-700'
                                }`}
                              >
                                <Icon size={22} />
                              </div>
                              <span
                                className={`block font-serif text-base leading-tight mb-0.5 ${
                                  sel
                                    ? 'text-sand-100 dark:text-wood-900'
                                    : 'text-wood-900 dark:text-sand-100'
                                }`}
                              >
                                {opt.label}
                              </span>
                              <span
                                className={`block text-[11px] ${
                                  sel
                                    ? 'text-sand-300 dark:text-wood-500'
                                    : 'text-wood-400'
                                }`}
                              >
                                {opt.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
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
                              <span className="text-2xl">{m.emoji}</span>
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
                        <div className="flex flex-wrap gap-2">
                          {[
                            { l: 30, w: 20, t: 2.5, label: 'Pequeña' },
                            { l: 40, w: 25, t: 3, label: 'Mediana' },
                            { l: 55, w: 30, t: 3, label: 'Grande' },
                            { l: 70, w: 35, t: 3.5, label: 'XL' },
                          ].map((p) => {
                            const active =
                              item.dimensions.length === p.l &&
                              item.dimensions.width === p.w &&
                              item.dimensions.thickness === p.t;
                            return (
                              <button
                                key={p.label}
                                onClick={() =>
                                  setItem({
                                    ...item,
                                    dimensions: { length: p.l, width: p.w, thickness: p.t },
                                  })
                                }
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                                  active
                                    ? 'bg-accent-gold border-accent-gold text-wood-900'
                                    : 'bg-white dark:bg-wood-900 border-wood-200 dark:border-wood-700 text-wood-600 hover:border-wood-400'
                                }`}
                              >
                                {p.label} ({p.l}×{p.w})
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

                  {/* ═══ STEP: ENGRAVING ═══ */}
                  {step.id === 'engraving' && (
                    <EngravingConfigurator
                      config={item.engraving}
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
                        {/* Volume discount hint */}
                        {item.quantity < 5 && (
                          <p className="text-center text-xs text-wood-400 mt-3">
                            A partir de 5 piezas obtén descuento por volumen
                          </p>
                        )}
                        {item.quantity >= 5 && (
                          <p className="text-center text-xs text-accent-gold font-bold mt-3">
                            {item.quantity >= 50
                              ? '🎉 20% de descuento por volumen'
                              : item.quantity >= 20
                              ? '🎉 15% de descuento por volumen'
                              : item.quantity >= 10
                              ? '✨ 10% de descuento por volumen'
                              : '✨ 5% de descuento por volumen'}
                          </p>
                        )}
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
        <div className="flex-none px-5 py-4 border-t border-wood-100 dark:border-wood-800 bg-white dark:bg-wood-950 flex justify-between items-center">
          <button
            onClick={() => nav(-1)}
            disabled={stepIdx === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              stepIdx === 0
                ? 'opacity-0 pointer-events-none'
                : 'text-wood-500 hover:text-wood-900 dark:hover:text-sand-100 hover:bg-wood-100 dark:hover:bg-wood-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          {/* Mobile price */}
          <div className="md:hidden text-center">
            <span className="text-[10px] text-wood-400 block">Estimado</span>
            <span className="font-serif text-lg font-bold text-wood-900 dark:text-sand-100">
              {formatMXN(calculateItemPrice(item).lineTotal)}
            </span>
          </div>

          {isLast ? (
            <button
              onClick={() => onSave(item)}
              className="flex items-center gap-2 px-8 py-3 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <Check className="w-4 h-4" />
              Guardar Pieza
            </button>
          ) : (
            <button
              onClick={() => nav(1)}
              className="flex items-center gap-2 px-8 py-3 bg-accent-gold text-wood-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
