import React from 'react';
import { motion } from 'motion/react';
import { ProductItem } from './types';
import { ShoppingBag, X, Receipt } from 'lucide-react';

interface QuoteSummaryPanelProps {
  items: ProductItem[];
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onConfirm?: () => void;
}

export const QuoteSummaryPanel: React.FC<QuoteSummaryPanelProps> = ({ 
  items, 
  isMobileOpen = false, 
  onCloseMobile,
  onConfirm
}) => {
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const calculateEstimatedTotal = () => {
    let total = 0;
    items.forEach(item => {
        const vol = item.dimensions.length * item.dimensions.width * item.dimensions.thickness;
        let basePrice = vol * 0.15; 
        if (item.woods.includes('Parota') || item.woods.includes('Nogal')) basePrice *= 1.5;
        if (item.engraving.enabled) basePrice += 300;
        total += basePrice * item.quantity;
    });
    return Math.round(total);
  };

  const Content = () => (
    <div className="flex flex-col h-full font-sans">
       {/* Header */}
       <div className="flex items-center justify-between mb-8 pb-4 border-b border-dashed border-wood-300 dark:border-wood-600">
           <div className="flex items-center gap-3">
               <div className="bg-wood-900 text-sand-100 dark:bg-sand-100 dark:text-wood-900 p-2 rounded-lg">
                   <Receipt className="w-5 h-5" />
               </div>
               <span className="text-sm font-bold uppercase tracking-widest text-wood-900 dark:text-sand-100">Resumen de Pedido</span>
           </div>
           {onCloseMobile && (
               <button onClick={onCloseMobile} className="md:hidden p-2 text-wood-500 hover:bg-wood-100 rounded-full transition-colors">
                   <X className="w-5 h-5" />
               </button>
           )}
       </div>

       {/* Item List (Scrollable) */}
       <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
           {items.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-40 text-center opacity-50">
                   <ShoppingBag className="w-8 h-8 mb-2 text-wood-300" />
                   <p className="text-xs font-medium uppercase tracking-wider text-wood-400">Sin productos</p>
               </div>
           ) : (
               items.map((item, idx) => (
                   <motion.div 
                        layout
                        key={item.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group relative pl-4 border-l-2 border-wood-200 dark:border-wood-700 hover:border-accent-gold dark:hover:border-accent-gold transition-colors py-1"
                   >
                       <div className="flex justify-between items-start mb-1">
                           <span className="font-serif font-bold text-wood-800 dark:text-sand-200 text-sm leading-tight max-w-[70%]">
                               {item.type}
                           </span>
                           <span className="bg-wood-100 dark:bg-wood-800 text-wood-600 dark:text-sand-300 px-2 py-0.5 rounded text-[10px] font-bold">
                               x{item.quantity}
                           </span>
                       </div>
                       
                       <div className="text-[10px] text-wood-500 dark:text-wood-400 space-y-0.5 font-medium uppercase tracking-wide">
                           <p className="truncate">
                             {item.woods.length > 0 ? item.woods.join(', ') : 'Madera pendiente'}
                           </p>
                           <p className="opacity-70">
                             {item.dimensions.length} x {item.dimensions.width} x {item.dimensions.thickness} cm
                           </p>
                           {item.engraving.enabled && (
                               <div className="flex items-center gap-1.5 mt-1 text-accent-gold">
                                   <div className="w-1 h-1 rounded-full bg-accent-gold" />
                                   Grabado Personalizado
                               </div>
                           )}
                       </div>
                   </motion.div>
               ))
           )}
       </div>

       {/* Footer Totals */}
       <div className="mt-8 pt-6 border-t border-wood-900 dark:border-sand-100 space-y-4 bg-wood-50/50 dark:bg-wood-900/50 -mx-6 px-6 pb-2">
           <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-wood-600 dark:text-sand-300">
               <span>Total Piezas</span>
               <span>{totalItems}</span>
           </div>
           
           <div className="flex justify-between items-end pt-2">
               <span className="font-serif text-lg font-medium text-wood-900 dark:text-sand-100">Estimado Total</span>
               <div className="text-right">
                    <span className="block font-serif text-3xl font-bold text-wood-900 dark:text-sand-100 leading-none">
                        ${calculateEstimatedTotal().toLocaleString()} 
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-wood-400 mt-1 block">MXN (Aprox)</span>
               </div>
           </div>

           {onConfirm && (
               <button 
                   onClick={onConfirm}
                   className="w-full mt-4 py-4 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-wood-800 transition-colors shadow-lg"
               >
                   Solicitar Cotización
               </button>
           )}
       </div>
    </div>
  );

  if (isMobileOpen) {
      return (
          <div className="absolute inset-0 flex items-end md:hidden h-full w-full pointer-events-auto">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-wood-900/60 backdrop-blur-sm" 
                onClick={onCloseMobile} 
              />
              <motion.div 
                 initial={{ y: "100%" }}
                 animate={{ y: 0 }}
                 exit={{ y: "100%" }}
                 transition={{ type: "spring", damping: 25, stiffness: 200 }}
                 className="relative w-full bg-sand-50 dark:bg-wood-950 rounded-t-3xl p-8 h-[85vh] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex flex-col z-10"
              >
                  <div className="w-12 h-1 bg-wood-300 dark:bg-wood-700 rounded-full mx-auto mb-6 flex-shrink-0" />
                  <Content />
              </motion.div>
          </div>
      );
  }

  return (
    <div className="hidden lg:block sticky top-32 w-full bg-white/80 dark:bg-wood-950/80 backdrop-blur-md rounded-2xl shadow-xl shadow-wood-900/5 border border-white dark:border-wood-800 p-8 h-[calc(100vh-10rem)] transition-all hover:shadow-2xl hover:shadow-wood-900/10">
        <Content />
    </div>
  );
};
