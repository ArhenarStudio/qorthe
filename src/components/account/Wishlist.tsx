"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, AlertCircle, Heart, Loader2, Wifi, WifiOff } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProducts } from '@/hooks/useProducts';
import { toast } from 'sonner';

const MOCK_WISHLIST_ITEMS = [
  {
    id: "mock-1",
    name: "Tabla de Nogal Premium",
    price: "$2,850",
    image: "https://images.unsplash.com/photo-1624821588759-2443c7268dff?auto=format&fit=crop&q=80&w=400",
    inStock: true,
    handle: "tabla-nogal-premium",
  },
  {
    id: "mock-2",
    name: "Cuchillo Chef Damasco",
    price: "$4,200",
    image: "https://images.unsplash.com/photo-1593618998160-e34015e672a9?auto=format&fit=crop&q=80&w=400",
    inStock: false,
    handle: "cuchillo-chef",
  },
];

const fmtMXN = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

export const Wishlist = () => {
  const { wishlist, toggle, loading: wishlistLoading, count } = useWishlist();
  const { products, loading: productsLoading } = useProducts();

  const isLive = wishlist.length > 0 || (count === 0 && !wishlistLoading);

  // Resolve wishlist product IDs to full product data
  const wishlistItems = useMemo(() => {
    if (!isLive || productsLoading) return [];
    return wishlist
      .map((w) => {
        const product = products.find((p) => p.id === w.product_id);
        if (!product) return null;
        const price = product.variants?.[0]?.price?.amount ?? 0;
        const inStock = product.variants?.[0]?.availableForSale ?? false;
        return {
          id: product.id,
          name: product.title,
          price: fmtMXN(price),
          image: product.featuredImage?.url || null,
          inStock,
          handle: product.handle,
        };
      })
      .filter(Boolean) as { id: string; name: string; price: string; image: string | null; inStock: boolean; handle: string }[];
  }, [wishlist, products, isLive, productsLoading]);

  const displayItems = isLive ? wishlistItems : MOCK_WISHLIST_ITEMS;

  const handleRemove = async (productId: string) => {
    await toggle(productId);
    toast.success("Eliminado de tu lista de deseos");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100 transition-colors">Lista de Deseos</h2>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 text-[10px] ${isLive ? 'text-green-600' : 'text-wood-400'}`}>
            {isLive ? <Wifi size={10} /> : <WifiOff size={10} />}
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-wood-500 dark:text-wood-400 bg-wood-50 dark:bg-wood-800 px-3 py-1 rounded-full transition-colors">
            {displayItems.length} artículos
          </span>
        </div>
      </div>

      {(wishlistLoading || productsLoading) && isLive ? (
        <div className="flex items-center justify-center py-16 text-wood-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando lista de deseos...
        </div>
      ) : displayItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-wood-400">
          <Heart className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium mb-1">Tu lista de deseos está vacía</p>
          <p className="text-xs">Explora nuestro catálogo y guarda tus piezas favoritas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {displayItems.map((item, index) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col bg-white dark:bg-wood-900 rounded-2xl overflow-hidden border border-wood-100 dark:border-wood-800 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:hover:shadow-none transition-all duration-500"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <ImageWithFallback 
                    src={item.image || ""} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-4 right-4 p-2.5 bg-white dark:bg-wood-800 rounded-full text-wood-400 dark:text-wood-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-[-10px] group-hover:translate-y-0 duration-300"
                  >
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
                    onClick={() => {
                      if (item.handle) {
                        window.location.href = `/shop/${item.handle}`;
                      }
                    }}
                    className={`w-full mt-6 py-3.5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${
                      item.inStock 
                        ? 'bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 hover:bg-wood-800 dark:hover:bg-sand-200 shadow-lg shadow-wood-900/10 dark:shadow-none' 
                        : 'bg-wood-50 dark:bg-wood-800 text-wood-300 dark:text-wood-600 cursor-not-allowed border border-wood-100 dark:border-wood-700'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {item.inStock ? 'Ver Producto' : 'Notificarme'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
