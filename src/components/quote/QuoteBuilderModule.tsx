"use client";

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'motion/react';

import { useRouter } from 'next/navigation';
import { ProductItem } from './types';
import { QuoteWizardModal } from './QuoteWizardModal';
import { QuoteSummaryPanel } from './QuoteSummaryPanel';
import { 
  Plus, Edit2, Trash2, Copy, ShoppingBag, 
  ArrowRight, Box, Package, Sparkles, CheckCircle2, PenTool
} from 'lucide-react';

const INITIAL_PRODUCT: ProductItem = {
  id: 'init-1',
  type: 'Tabla de decoración',
  woods: [],
  dimensions: { length: 40, width: 25, thickness: 3 },
  quantity: 1,
  usage: 'Decorativo',
  engraving: {
    enabled: false,
    type: 'Texto',
    zones: ['Esq. Inferior'],
    complexity: 'Básico'
  }
};

export const QuoteBuilderModule = () => {
  const router = useRouter();
  const [items, setItems] = useState<ProductItem[]>([{ ...INITIAL_PRODUCT, id: uuidv4() }]);
  const [editingItem, setEditingItem] = useState<ProductItem | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // -- LOGIC --
  const handleSaveItem = (item: ProductItem) => {
    const exists = items.find(i => i.id === item.id);
    if (exists) {
        setItems(items.map(i => i.id === item.id ? item : i));
    } else {
        setItems([...items, item]);
    }
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleDuplicateItem = (item: ProductItem) => {
      const newItem = { ...item, id: uuidv4() };
      setItems([...items, newItem]);
  };

  const handleAddNew = () => {
      setEditingItem({ ...INITIAL_PRODUCT, id: uuidv4() });
  };

  // -- PRICE CALCULATION --
  const calculateTotal = () => {
    return items.reduce((acc, item) => {
        if (item.type === 'Servicio de Grabado') {
            const basePrice = 250; // Base price per unit for engraving service
            return acc + (basePrice * item.quantity);
        }

        const vol = item.dimensions.length * item.dimensions.width * item.dimensions.thickness;
        let base = vol * 0.15;
        if (item.woods.includes('Parota') || item.woods.includes('Nogal')) base *= 1.5;
        if (item.engraving.enabled) base += 300;
        return acc + (Math.round(base) * item.quantity);
    }, 0);
  };

  const total = calculateTotal();

  const handleFinishQuote = () => {
      const newQuote = {
          id: `COT-2026-${Math.floor(100 + Math.random() * 900)}`,
          projectName: items[0]?.type + (items.length > 1 ? ` + ${items.length - 1} más` : ''),
          date: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
          validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: "Pending",
          total: `$${total.toLocaleString()}.00`,
          advanceRequired: `$${(total * 0.5).toLocaleString()}.00`,
          description: items.map(i => `${i.quantity}x ${i.type} (${i.woods.join(', ')})`).join('. '),
          timeline: "4-6 semanas",
          pdfUrl: "#",
          chat: []
      };

      // Save to localStorage
      const existingQuotes = JSON.parse(localStorage.getItem('davidson_user_quotes') || '[]');
      localStorage.setItem('davidson_user_quotes', JSON.stringify([newQuote, ...existingQuotes]));

      router.push('/account');
  };

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-black text-wood-900 dark:text-sand-100 font-sans relative pb-20">
      
      {/* 1. Global Header Spacer */}
      <div className="h-24 md:h-32 w-full" />

      {/* 2. Main Content Container */}
      <main className="container mx-auto px-4 md:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
                <h1 className="font-serif text-4xl md:text-5xl text-wood-900 dark:text-sand-100 mb-3">
                    Tu Colección
                </h1>
                <p className="text-wood-500 max-w-lg text-lg">
                    Diseña piezas únicas para tu espacio. Cada elemento es configurado a medida.
                </p>
            </div>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-wood-200 dark:border-wood-800 rounded-3xl bg-white/50 dark:bg-wood-900/20 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-wood-100 dark:bg-wood-800 rounded-full flex items-center justify-center mx-auto mb-6 text-wood-400">
                    <Package className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif mb-3 text-wood-800 dark:text-sand-200">Tu colección está vacía</h3>
                <p className="text-wood-500 mb-10 max-w-md mx-auto">Comienza añadiendo tu primera pieza personalizada para verla aquí.</p>
                <button 
                    onClick={handleAddNew}
                    className="px-10 py-5 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-xl shadow-wood-900/10"
                >
                    Crear Nueva Pieza
                </button>
            </div>
        ) : (
            <div className="space-y-12">
                {/* Grid of Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    <AnimatePresence mode="popLayout">
                        {items.map((item, idx) => (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group bg-white dark:bg-wood-950 border border-wood-100 dark:border-wood-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-accent-gold/30 transition-all duration-300 flex flex-col"
                            >
                                {/* Card Header */}
                                <div className="p-6 pb-4 flex items-start justify-between relative">
                                    <div className="w-12 h-12 rounded-xl bg-wood-50 dark:bg-wood-900 flex items-center justify-center text-wood-600 dark:text-wood-400 group-hover:bg-accent-gold group-hover:text-wood-900 transition-colors">
                                        {item.type === 'Servicio de Grabado' ? (
                                            <PenTool className="w-6 h-6" strokeWidth={1.5} />
                                        ) : (
                                            <Box className="w-6 h-6" strokeWidth={1.5} />
                                        )}
                                    </div>
                                    <span className="absolute top-6 right-6 text-[10px] font-bold uppercase tracking-widest text-wood-300 group-hover:text-accent-gold transition-colors">
                                        0{idx + 1}
                                    </span>
                                </div>

                                {/* Card Body */}
                                <div className="px-6 flex-1">
                                    <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100 mb-1 leading-tight group-hover:text-accent-gold transition-colors">
                                        {item.type}
                                    </h3>
                                    <p className="text-xs font-bold uppercase tracking-widest text-wood-400 mb-4">
                                        {item.type === 'Servicio de Grabado' ? 'Personalización' : item.usage}
                                    </p>
                                    
                                    <div className="space-y-2 text-sm text-wood-500 mb-6">
                                        {item.type === 'Servicio de Grabado' ? (
                                            <>
                                                <div className="flex justify-between border-b border-wood-50 dark:border-wood-900 pb-2">
                                                    <span>Material:</span>
                                                    <span className="font-medium text-wood-700 dark:text-wood-300">
                                                        {item.materialToEngrave || '—'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between border-b border-wood-50 dark:border-wood-900 pb-2">
                                                    <span>Diseño:</span>
                                                    <span className="font-medium text-wood-700 dark:text-wood-300">
                                                        {item.engraving.type}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between border-b border-wood-50 dark:border-wood-900 pb-2">
                                                    <span>Material:</span>
                                                    <span className="font-medium text-wood-700 dark:text-wood-300">
                                                        {item.woods.length > 0 ? item.woods.join(', ') : '—'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between border-b border-wood-50 dark:border-wood-900 pb-2">
                                                    <span>Medidas:</span>
                                                    <span className="font-medium text-wood-700 dark:text-wood-300">
                                                        {item.dimensions.length}x{item.dimensions.width}x{item.dimensions.thickness}cm
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex justify-between pt-1">
                                            <span>Cantidad:</span>
                                            <span className="font-bold text-wood-900 dark:text-sand-100">{item.quantity}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer Actions */}
                                <div className="px-6 py-4 bg-wood-50/50 dark:bg-wood-900/30 border-t border-wood-100 dark:border-wood-800 flex items-center gap-2">
                                    <button 
                                        onClick={() => setEditingItem(item)}
                                        className="flex-1 py-2.5 rounded-lg bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 text-xs font-bold uppercase tracking-wider text-wood-600 hover:border-accent-gold hover:text-accent-gold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit2 className="w-3 h-3" /> Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDuplicateItem(item)}
                                        className="p-2.5 rounded-lg bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 text-wood-400 hover:text-wood-900 hover:border-wood-400 transition-colors"
                                        title="Duplicar"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="p-2.5 rounded-lg bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 text-wood-400 hover:text-red-500 hover:border-red-200 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {/* Add New Button Card */}
                        <motion.button
                            layout
                            key="add-new-btn"
                            onClick={handleAddNew}
                            className="group min-h-[350px] rounded-2xl border-2 border-dashed border-wood-200 dark:border-wood-800 flex flex-col items-center justify-center gap-4 text-wood-400 hover:text-accent-gold hover:border-accent-gold hover:bg-accent-gold/5 transition-all duration-300"
                        >
                            <div className="w-16 h-16 rounded-full bg-wood-100 dark:bg-wood-900 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                <Plus className="w-8 h-8" />
                            </div>
                            <span className="font-bold uppercase tracking-widest text-xs">Agregar Nueva Pieza</span>
                        </motion.button>
                    </AnimatePresence>
                </div>

                {/* CHECKOUT SECTION (Bottom of Content) */}
                <div className="mt-8 md:mt-16 bg-white dark:bg-wood-950 rounded-2xl md:rounded-3xl p-6 md:p-12 border border-wood-100 dark:border-wood-800 shadow-xl md:shadow-2xl shadow-wood-900/5 relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                        <div className="text-center md:text-left">
                            <h2 className="font-serif text-3xl text-wood-900 dark:text-sand-100 mb-2">Resumen del Pedido</h2>
                            <p className="text-wood-500 mb-6 max-w-md">
                                Revisa que todas tus piezas estén configuradas correctamente antes de proceder al pago.
                            </p>
                            <div className="flex items-center gap-4 justify-center md:justify-start text-sm text-wood-500">
                                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent-gold" /> Envío Asegurado</span>
                                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent-gold" /> Garantía de Calidad</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-stretch md:items-end gap-6 w-full md:w-auto md:min-w-[300px]">
                            <div className="text-center md:text-right">
                                <span className="block text-xs font-bold uppercase tracking-widest text-wood-400 mb-1">Total Estimado</span>
                                <span className="font-serif text-4xl md:text-6xl text-wood-900 dark:text-sand-100 leading-none">
                                    ${total.toLocaleString()}
                                </span>
                                <span className="block text-xs font-medium text-wood-400 mt-2">MXN + Impuestos incl.</span>
                            </div>
                            
                            <button 
                                onClick={() => setIsSummaryOpen(true)}
                                className="w-full md:w-auto flex items-center justify-center gap-4 px-10 py-5 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 rounded-xl font-bold uppercase tracking-widest text-sm hover:-translate-y-1 hover:shadow-xl transition-all group"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Finalizar Pedido
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {editingItem && (
            <QuoteWizardModal 
                key="wizard-modal"
                initialItem={editingItem}
                onSave={handleSaveItem}
                onClose={() => setEditingItem(null)}
            />
        )}
        {isSummaryOpen && (
             <QuoteSummaryPanel 
                key="summary-panel"
                items={items} 
                isMobileOpen={true} 
                onCloseMobile={() => setIsSummaryOpen(false)} 
                onConfirm={handleFinishQuote}
             />
        )}
      </AnimatePresence>

    </div>
  );
};
