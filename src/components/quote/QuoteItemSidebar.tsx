import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ShoppingBag, ChevronRight } from 'lucide-react';
import { ProductItem } from './types';

interface QuoteItemSidebarProps {
  items: ProductItem[];
  activeItemId: string | null;
  onSelectItem: (id: string) => void;
  onAddItem: () => void;
  onOpenSummaryMobile: () => void;
}

export const QuoteItemSidebar: React.FC<QuoteItemSidebarProps> = ({
  items,
  activeItemId,
  onSelectItem,
  onAddItem,
  onOpenSummaryMobile
}) => {

  const calculateItemPrice = (item: ProductItem) => {
    const vol = item.dimensions.length * item.dimensions.width * item.dimensions.thickness;
    let basePrice = vol * 0.15; 
    if (item.woods.includes('Parota') || item.woods.includes('Nogal')) basePrice *= 1.5;
    if (item.engraving.enabled) basePrice += 300;
    return Math.round(basePrice * item.quantity);
  };

  const totalPrice = items.reduce((acc, item) => acc + calculateItemPrice(item), 0);

  return (
    <div className="flex flex-col h-full border-r border-wood-100 dark:border-wood-800 bg-white dark:bg-wood-950 md:w-80 lg:w-96 flex-shrink-0 relative z-20">
      
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-wood-100 dark:border-wood-800">
        <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100 mb-1">Tu Colección</h3>
        <p className="text-xs text-wood-500 font-medium">
            {items.length} {items.length === 1 ? 'pieza configurada' : 'piezas configuradas'}
        </p>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        <AnimatePresence mode='popLayout'>
            {items.map((item, idx) => {
                const isActive = activeItemId === item.id;
                const price = calculateItemPrice(item);

                return (
                    <motion.button
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => onSelectItem(item.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden ${
                            isActive 
                            ? 'bg-wood-900 border-wood-900 dark:bg-sand-100 dark:border-sand-100 shadow-xl shadow-wood-900/10' 
                            : 'bg-white dark:bg-wood-900/40 border-wood-200 dark:border-wood-800 hover:border-accent-gold/50'
                        }`}
                    >
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 block ${isActive ? 'text-accent-gold dark:text-wood-600' : 'text-wood-400'}`}>
                                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1} — {item.usage.split(' ')[0]}
                                </span>
                                <h4 className={`font-serif text-lg leading-tight mb-2 ${isActive ? 'text-sand-100 dark:text-wood-900' : 'text-wood-800 dark:text-sand-200'}`}>
                                    {item.type}
                                </h4>
                                <div className={`text-xs font-medium ${isActive ? 'text-sand-100/60 dark:text-wood-900/60' : 'text-wood-500'}`}>
                                    {item.quantity} x ${Math.round(price / item.quantity).toLocaleString()} c/u
                                </div>
                            </div>
                            
                            {isActive && (
                                <motion.div 
                                    layoutId="activeIndicator"
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1"
                                >
                                    <ChevronRight className="w-5 h-5 text-accent-gold" />
                                </motion.div>
                            )}
                        </div>
                    </motion.button>
                );
            })}
        </AnimatePresence>

        <button 
            onClick={onAddItem}
            className="w-full py-4 border-2 border-dashed border-wood-200 dark:border-wood-700 rounded-xl flex items-center justify-center gap-2 text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 hover:border-accent-gold transition-all group"
        >
            <div className="w-6 h-6 rounded-full bg-wood-100 dark:bg-wood-800 flex items-center justify-center group-hover:bg-accent-gold group-hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">Añadir Pieza</span>
        </button>
      </div>

      {/* Footer Summary */}
      <div className="p-6 md:p-8 border-t border-wood-100 dark:border-wood-800 bg-sand-50/50 dark:bg-wood-900/20 backdrop-blur-md">
         <div className="flex justify-between items-end mb-4">
             <span className="text-xs font-bold uppercase tracking-widest text-wood-500">Estimado Total</span>
             <div className="text-right">
                <span className="block font-serif text-2xl md:text-3xl text-wood-900 dark:text-sand-100 leading-none">
                    ${totalPrice.toLocaleString()}
                </span>
                <span className="text-[10px] text-wood-400 font-medium">MXN + Envío</span>
             </div>
         </div>
         
         <button 
            onClick={onOpenSummaryMobile}
            className="w-full py-4 bg-accent-gold text-wood-900 font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-accent-gold/20 hover:shadow-accent-gold/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
         >
            <ShoppingBag className="w-4 h-4" />
            Finalizar Pedido
         </button>
      </div>

    </div>
  );
};
