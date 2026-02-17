import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, X, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

const WISHLIST_ITEMS = [
  {
    id: 1,
    name: "Tabla de Nogal Premium",
    price: "$2,850",
    image: "https://images.unsplash.com/photo-1624821588759-2443c7268dff?auto=format&fit=crop&q=80&w=400",
    inStock: true
  },
  {
    id: 2,
    name: "Cuchillo Chef Damasco",
    price: "$4,200",
    image: "https://images.unsplash.com/photo-1593618998160-e34015e672a9?auto=format&fit=crop&q=80&w=400",
    inStock: false
  },
  {
    id: 3,
    name: "Set de Quesos Artesanales",
    price: "$1,200",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=400",
    inStock: true
  }
];

export const Wishlist = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100 transition-colors">Lista de Deseos</h2>
        <span className="text-xs font-bold uppercase tracking-widest text-wood-500 dark:text-wood-400 bg-wood-50 dark:bg-wood-800 px-3 py-1 rounded-full transition-colors">3 artículos</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {WISHLIST_ITEMS.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group flex flex-col bg-white dark:bg-wood-900 rounded-2xl overflow-hidden border border-wood-100 dark:border-wood-800 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:hover:shadow-none transition-all duration-500"
          >
            <div className="aspect-[4/3] overflow-hidden relative">
              <ImageWithFallback 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <button className="absolute top-4 right-4 p-2.5 bg-white dark:bg-wood-800 rounded-full text-wood-400 dark:text-wood-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-[-10px] group-hover:translate-y-0 duration-300">
                <X className="w-4 h-4" />
              </button>

              {!item.inStock && (
                <div className="absolute inset-0 bg-white/60 dark:bg-wood-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-wood-900 dark:text-sand-100 gap-2 transition-colors">
                  <AlertCircle className="w-8 h-8 opacity-50" />
                  <span className="bg-wood-900 dark:bg-wood-800 text-sand-50 dark:text-sand-100 text-[10px] px-3 py-1.5 uppercase tracking-widest font-bold rounded transition-colors">Agotado</span>
                </div>
              )}
            </div>

            <div className="p-6 flex flex-col flex-1">
              <div className="flex-1">
                <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100 line-clamp-1 mb-1 transition-colors">{item.name}</h3>
                <p className="text-wood-500 dark:text-wood-400 font-medium text-lg transition-colors">{item.price}</p>
              </div>
              
              <button 
                disabled={!item.inStock}
                className={`w-full mt-6 py-3.5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${
                  item.inStock 
                    ? 'bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 hover:bg-wood-800 dark:hover:bg-sand-200 shadow-lg shadow-wood-900/10 dark:shadow-none' 
                    : 'bg-wood-50 dark:bg-wood-800 text-wood-300 dark:text-wood-600 cursor-not-allowed border border-wood-100 dark:border-wood-700'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {item.inStock ? 'Añadir al Carrito' : 'Notificarme'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
