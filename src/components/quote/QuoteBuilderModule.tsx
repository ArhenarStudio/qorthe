"use client";

import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'motion/react';
import {
  Plus, Edit2, Trash2, Copy, ShoppingBag,
  ArrowRight, Package, CheckCircle2, Loader2, Send,
} from 'lucide-react';
import { ProductItem, CustomerDetails, DEFAULT_PRODUCT, QuotePiece, BundleTemplate, DEFAULT_ENGRAVING, DEFAULT_TEXTILE } from './types';
import { QuoteWizardModal } from './QuoteWizardModal';
import { getProductIcon } from './QuoteIcons';
import { calculateItemPrice, calculateTotalPrice, formatMXN } from './pricing';
import { useQuotePricing } from '@/hooks/useQuotePricing';
import { BUNDLE_TEMPLATES, BUNDLE_ICON_MAP } from './bundles';  // .tsx

// ── Component ───────────────────────────────────────────────

export const QuoteBuilderModule = () => {
  const { config: pricingConfig, tierName, tierDiscountPercent, isLoggedIn } = useQuotePricing();
  const [items, setItems] = useState<ProductItem[]>([]);
  const [activeBundle, setActiveBundle] = useState<BundleTemplate | null>(null);
  const [editingItem, setEditingItem] = useState<ProductItem | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    phone: '',
    email: '',
  });

  // ── Handlers ────────────────────────────────────────────

  const handleSaveItem = useCallback(
    (item: ProductItem) => {
      const exists = items.find((i) => i.id === item.id);
      if (exists) {
        setItems(items.map((i) => (i.id === item.id ? item : i)));
      } else {
        setItems([...items, item]);
      }
      setEditingItem(null);
    },
    [items]
  );

  const handleDeleteItem = (id: string) => setItems(items.filter((i) => i.id !== id));

  const handleDuplicateItem = (item: ProductItem) => {
    setItems([...items, { ...item, id: uuidv4() }]);
  };

  const handleAddNew = () => {
    setEditingItem({ ...DEFAULT_PRODUCT, id: uuidv4() });
  };

  // ── Bundle handler ──────────────────────────────────────

  const handleApplyBundle = (bundle: BundleTemplate) => {
    const bundleItems: ProductItem[] = bundle.items.map((bi) => ({
      id: uuidv4(),
      category: bi.category,
      type: bi.type,
      woods: bi.woods || [],
      dimensions: bi.dimensions || { length: 40, width: 25, thickness: 3 },
      textile: bi.textile ? { ...DEFAULT_TEXTILE, ...bi.textile } : undefined,
      quantity: bi.quantity,
      engraving: bi.engraving
        ? { ...DEFAULT_ENGRAVING, ...bi.engraving }
        : { ...DEFAULT_ENGRAVING },
      notes: bi.notes,
    }));
    setItems(bundleItems);
    setActiveBundle(bundle);
  };

  const handleClearBundle = () => {
    setActiveBundle(null);
  };

  // ── Submit to API ───────────────────────────────────────

  const handleSubmit = async () => {
    setError(null);

    if (!customer.name || !customer.email || !customer.phone) {
      setError('Completa nombre, email y teléfono.');
      return;
    }
    if (items.length === 0) {
      setError('Agrega al menos una pieza.');
      return;
    }

    setSubmitting(true);

    try {
      const totals = calculateTotalPrice(items, pricingConfig, tierDiscountPercent, tierName, activeBundle?.discountPercent || 0);

      const pieces: QuotePiece[] = items.map((item) => {
        const bp = calculateItemPrice(item, pricingConfig);
        return {
          type: item.type,
          category: item.category,
          material:
            item.category === 'textil'
              ? `${item.textile?.color || 'Natural'} (${item.textile?.technique || ''})`
              : item.category === 'grabado'
              ? item.materialToEngrave || 'Sin especificar'
              : item.woods.join(' + ') || 'Sin madera',
          dimensions:
            item.category === 'madera'
              ? `${item.dimensions.length}×${item.dimensions.width}×${item.dimensions.thickness}cm`
              : undefined,
          quantity: item.quantity,
          engraving: item.engraving.enabled
            ? {
                type: item.engraving.type,
                complexity: item.engraving.complexity,
                zones: item.engraving.zones,
                text: item.engraving.customText || item.engraving.qrUrl,
                hasFile: !!item.engraving.file,
              }
            : undefined,
          textile: item.textile
            ? {
                technique: item.textile.technique,
                color: item.textile.color,
                printZone: item.textile.printZone,
                hasFile: !!item.textile.file,
              }
            : undefined,
          unitPrice: bp.unitAfterDiscount,
          lineTotal: bp.lineTotal,
          notes: item.notes,
        };
      });

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
          project_name:
            customer.company ||
            `${items[0]?.type}${items.length > 1 ? ` + ${items.length - 1} más` : ''}`,
          pieces,
          subtotal: totals.subtotal,
          total: totals.total,
          timeline: '4-6 semanas',
          notes: customer.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar cotización');

      setSubmitted(data.quote.number);
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Price ───────────────────────────────────────────────

  const totals = calculateTotalPrice(items, pricingConfig, tierDiscountPercent, tierName, activeBundle?.discountPercent || 0);

  // ── Success State ───────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-sand-50 dark:bg-black text-wood-900 dark:text-sand-100 font-sans flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-wood-950 rounded-3xl p-10 md:p-16 max-w-lg text-center border border-wood-100 dark:border-wood-800 shadow-2xl"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-serif text-3xl mb-3">¡Cotización Enviada!</h2>
          <p className="text-wood-500 mb-6">
            Tu solicitud <span className="font-bold text-wood-900 dark:text-sand-100">{submitted}</span> ha sido recibida.
            Te contactaremos a <span className="font-medium">{customer.email}</span> con los detalles.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setSubmitted(null);
                setItems([]);
                setCustomer({ name: '', phone: '', email: '' });
                setShowCheckout(false);
              }}
              className="w-full py-4 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-lg transition-all"
            >
              Nueva Cotización
            </button>
            <button
              onClick={() => {
                const msg = `Hola, acabo de solicitar la cotizaci\u00f3n ${submitted} en DavidSon's Design. Me gustar\u00eda recibir m\u00e1s informaci\u00f3n.`;
                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-green-700 transition-colors"
            >
              Compartir por WhatsApp
            </button>
            <a
              href="/account"
              className="block w-full py-4 border-2 border-wood-200 dark:border-wood-700 rounded-xl font-bold uppercase tracking-widest text-xs text-wood-600 hover:border-accent-gold transition-colors text-center"
            >
              Ver Mis Cotizaciones
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-black text-wood-900 dark:text-sand-100 font-sans relative pb-20">
      <div className="h-24 md:h-32 w-full" />

      <main className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl mb-2">Cotizador</h1>
            <p className="text-wood-500 max-w-lg">
              Diseña piezas únicas. Configura material, dimensiones, grabado y recibe un presupuesto al instante.
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-6 py-3 bg-accent-gold text-wood-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Agregar Pieza
            </button>
          )}
        </div>

        {/* Tier discount banner */}
        {isLoggedIn && tierDiscountPercent > 0 && (
          <div className="mb-6 px-4 py-3 bg-accent-gold/10 border border-accent-gold/30 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold text-sm font-bold">
              %
            </div>
            <div className="text-sm">
              <span className="font-bold text-wood-900 dark:text-sand-100">Miembro {tierName}</span>
              <span className="text-wood-600 dark:text-wood-400"> — {tierDiscountPercent}% de descuento aplicado a tu cotización</span>
            </div>
          </div>
        )}
        {!isLoggedIn && items.length > 0 && (
          <div className="mb-6 px-4 py-3 bg-wood-100/50 dark:bg-wood-900/50 border border-wood-200 dark:border-wood-800 rounded-xl flex items-center gap-3">
            <div className="text-sm text-wood-500">
              <a href="/auth" className="text-accent-gold font-bold hover:underline">Inicia sesión</a>{' '}
              para obtener descuentos exclusivos de membresía en tu cotización.
            </div>
          </div>
        )}

        {/* Empty State + Bundle Selection */}
        {items.length === 0 ? (
          <div className="space-y-10">
            {/* Start from scratch */}
            <div className="py-16 text-center border-2 border-dashed border-wood-200 dark:border-wood-800 rounded-3xl bg-white/50 dark:bg-wood-900/20 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-wood-100 dark:bg-wood-800 rounded-full flex items-center justify-center mx-auto mb-5 text-wood-400">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-serif mb-2">Pieza Individual</h3>
              <p className="text-wood-500 mb-6 max-w-md mx-auto text-sm">
                Configura una pieza personalizada desde cero.
              </p>
              <button
                onClick={handleAddNew}
                className="px-8 py-4 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-xl"
              >
                Crear Pieza
              </button>
            </div>

            {/* Bundle Selection */}
            <div>
              <h2 className="font-serif text-2xl mb-1">Paquetes Populares</h2>
              <p className="text-wood-500 text-sm mb-6">
                Selecciona un paquete predise\u00f1ado con descuento. Puedes personalizar cada pieza despu\u00e9s.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {BUNDLE_TEMPLATES.map((bundle) => {
                  const BIcon = BUNDLE_ICON_MAP[bundle.id];
                  return (
                    <button
                      key={bundle.id}
                      onClick={() => handleApplyBundle(bundle)}
                      className="group bg-white dark:bg-wood-950 border border-wood-100 dark:border-wood-800 rounded-2xl p-5 text-left hover:border-accent-gold/50 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-gold/10 text-accent-gold flex items-center justify-center group-hover:bg-accent-gold group-hover:text-wood-900 transition-colors">
                          <BIcon size={20} />
                        </div>
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full">
                          -{bundle.discountPercent}%
                        </span>
                      </div>
                      <h3 className="font-serif text-lg text-wood-900 dark:text-sand-100 mb-0.5 group-hover:text-accent-gold transition-colors">
                        {bundle.name}
                      </h3>
                      <p className="text-xs text-wood-500 mb-2">{bundle.desc}</p>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-wood-400">
                        {bundle.segment}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Bundle Active Banner */}
            {activeBundle && (
              <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 text-sm font-bold">
                    %
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-wood-900 dark:text-sand-100">{activeBundle.name}</span>
                    <span className="text-wood-600 dark:text-wood-400"> &mdash; {activeBundle.discountPercent}% de descuento aplicado</span>
                  </div>
                </div>
                <button
                  onClick={handleClearBundle}
                  className="text-[10px] text-wood-400 hover:text-red-500 uppercase tracking-widest font-bold transition-colors"
                >
                  Quitar paquete
                </button>
              </div>
            )}

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => {
                  const Icon = getProductIcon(item.type);
                  const bp = calculateItemPrice(item, pricingConfig);
                  return (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group bg-white dark:bg-wood-950 border border-wood-100 dark:border-wood-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-accent-gold/30 transition-all flex flex-col"
                    >
                      {/* Card Header */}
                      <div className="p-5 pb-3 flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-wood-50 dark:bg-wood-900 flex items-center justify-center text-wood-500 group-hover:bg-accent-gold group-hover:text-wood-900 transition-colors">
                          <Icon size={20} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-wood-300 group-hover:text-accent-gold">
                          0{idx + 1}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="px-5 flex-1">
                        <h3 className="font-serif text-lg text-wood-900 dark:text-sand-100 mb-0.5 leading-tight group-hover:text-accent-gold transition-colors">
                          {item.type}
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-wood-400 mb-3">
                          {item.category === 'textil'
                            ? item.textile?.technique || 'Textil'
                            : item.category === 'grabado'
                            ? item.materialToEngrave || 'Grabado'
                            : item.woods.join(', ') || 'Sin madera'}
                        </p>

                        <div className="space-y-1.5 text-sm text-wood-500 mb-4">
                          {item.category === 'madera' && (
                            <div className="flex justify-between text-xs">
                              <span>Medidas</span>
                              <span className="font-medium text-wood-700 dark:text-wood-300">
                                {item.dimensions.length}×{item.dimensions.width}×{item.dimensions.thickness}cm
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs">
                            <span>Cantidad</span>
                            <span className="font-bold text-wood-900 dark:text-sand-100">
                              {item.quantity}
                            </span>
                          </div>
                          {item.engraving.enabled && (
                            <div className="flex items-center gap-1 text-[10px] text-accent-gold mt-1">
                              <div className="w-1 h-1 rounded-full bg-accent-gold" />
                              Grabado {item.engraving.complexity}
                            </div>
                          )}
                        </div>

                        {/* Line price */}
                        <div className="pb-3 border-t border-wood-50 dark:border-wood-900 pt-2">
                          <span className="font-serif text-xl font-bold text-wood-900 dark:text-sand-100">
                            {formatMXN(bp.lineTotal)}
                          </span>
                          {bp.volumeDiscount > 0 && (
                            <span className="text-[10px] text-green-600 ml-2">
                              −{Math.round(bp.volumeDiscountPercent * 100)}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="px-5 py-3 bg-wood-50/50 dark:bg-wood-900/30 border-t border-wood-100 dark:border-wood-800 flex items-center gap-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="flex-1 py-2 rounded-lg bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 text-[10px] font-bold uppercase tracking-wider text-wood-600 hover:border-accent-gold hover:text-accent-gold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Edit2 className="w-3 h-3" /> Editar
                        </button>
                        <button
                          onClick={() => handleDuplicateItem(item)}
                          className="p-2 rounded-lg bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 text-wood-400 hover:text-wood-900 hover:border-wood-400 transition-colors"
                          title="Duplicar"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 rounded-lg bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 text-wood-400 hover:text-red-500 hover:border-red-200 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Add card */}
                <motion.button
                  layout
                  key="add"
                  onClick={handleAddNew}
                  className="group min-h-[300px] rounded-2xl border-2 border-dashed border-wood-200 dark:border-wood-800 flex flex-col items-center justify-center gap-3 text-wood-400 hover:text-accent-gold hover:border-accent-gold hover:bg-accent-gold/5 transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-wood-100 dark:bg-wood-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-7 h-7" />
                  </div>
                  <span className="font-bold uppercase tracking-widest text-xs">Agregar Pieza</span>
                </motion.button>
              </AnimatePresence>
            </div>

            {/* ── Checkout Section ─────────────────── */}
            <div className="bg-white dark:bg-wood-950 rounded-2xl md:rounded-3xl p-6 md:p-10 border border-wood-100 dark:border-wood-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              {!showCheckout ? (
                /* Summary bar */
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h2 className="font-serif text-2xl mb-1">Resumen del Pedido</h2>
                    <p className="text-wood-500 text-sm">
                      {items.length} {items.length === 1 ? 'pieza' : 'piezas'} ·{' '}
                      {items.reduce((s, i) => s + i.quantity, 0)} unidades totales
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-wood-400 block">
                        Total Estimado
                      </span>
                      <span className="font-serif text-3xl md:text-4xl leading-none">
                        {formatMXN(totals.total)}
                      </span>
                      {(totals.volumeDiscount > 0 || totals.bundleDiscount > 0 || totals.tierDiscount.tierDiscountAmount > 0) && (
                        <div className="text-xs text-green-600 block space-x-2">
                          {totals.volumeDiscount > 0 && (
                            <span>Volumen: −{formatMXN(totals.volumeDiscount)}</span>
                          )}
                          {totals.bundleDiscount > 0 && (
                            <span>Paquete: −{formatMXN(totals.bundleDiscount)}</span>
                          )}
                          {totals.tierDiscount.tierDiscountAmount > 0 && (
                            <span>{totals.tierDiscount.tierName}: −{formatMXN(totals.tierDiscount.tierDiscountAmount)}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowCheckout(true)}
                      className="flex items-center gap-3 px-8 py-4 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:-translate-y-0.5 hover:shadow-xl transition-all"
                    >
                      <Send className="w-4 h-4" />
                      Solicitar Cotización
                    </button>
                  </div>
                </div>
              ) : (
                /* Checkout form */
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl">Tus Datos</h2>
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="text-xs text-wood-400 hover:text-wood-900 transition-colors underline"
                    >
                      Volver al resumen
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-wood-400 tracking-widest">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        className="w-full p-3 rounded-xl bg-sand-50 dark:bg-wood-900 border border-wood-200 dark:border-wood-700 focus:border-accent-gold outline-none text-sm transition-colors"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-wood-400 tracking-widest">
                        Empresa (Opcional)
                      </label>
                      <input
                        type="text"
                        value={customer.company || ''}
                        onChange={(e) => setCustomer({ ...customer, company: e.target.value })}
                        className="w-full p-3 rounded-xl bg-sand-50 dark:bg-wood-900 border border-wood-200 dark:border-wood-700 focus:border-accent-gold outline-none text-sm transition-colors"
                        placeholder="Nombre de la empresa"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-wood-400 tracking-widest">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        className="w-full p-3 rounded-xl bg-sand-50 dark:bg-wood-900 border border-wood-200 dark:border-wood-700 focus:border-accent-gold outline-none text-sm transition-colors"
                        placeholder="+52 662 ..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-wood-400 tracking-widest">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={customer.email}
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        className="w-full p-3 rounded-xl bg-sand-50 dark:bg-wood-900 border border-wood-200 dark:border-wood-700 focus:border-accent-gold outline-none text-sm transition-colors"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-wood-400 tracking-widest">
                      Notas o instrucciones especiales
                    </label>
                    <textarea
                      value={customer.notes || ''}
                      onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                      rows={2}
                      className="w-full p-3 rounded-xl bg-sand-50 dark:bg-wood-900 border border-wood-200 dark:border-wood-700 focus:border-accent-gold outline-none text-sm resize-none transition-colors"
                      placeholder="Fecha del evento, instrucciones de entrega, etc."
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                      {error}
                    </p>
                  )}

                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-4 text-xs text-wood-500">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-accent-gold" /> Envío asegurado
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-accent-gold" /> Garantía de calidad
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-wood-400 block">Total</span>
                        <span className="font-serif text-2xl font-bold">
                          {formatMXN(totals.total)}
                        </span>
                      </div>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-8 py-4 bg-accent-gold text-wood-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {submitting ? 'Enviando...' : 'Enviar Cotización'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Wizard Modal */}
      <AnimatePresence>
        {editingItem && (
          <QuoteWizardModal
            key="wizard"
            initialItem={editingItem}
            onSave={handleSaveItem}
            onClose={() => setEditingItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
