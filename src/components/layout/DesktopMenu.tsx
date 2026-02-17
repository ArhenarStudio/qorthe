"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Gift, ShoppingBag, BookOpen, X } from 'lucide-react';
import Link from 'next/link';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

const FEATURED_IMAGE = "/images/logo-dsd.png";

interface DesktopMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopMenu: React.FC<DesktopMenuProps> = ({ isOpen, onClose }) => {
  
  const columns = [
    {
      title: "PRODUCTOS",
      items: [
        { label: "Tablas", href: "/shop?category=tablas" },
        { label: "Arte", href: "/shop?category=arte" },
        { label: "Ediciones Limitadas", href: "/shop?category=limitadas" },
        { label: "Ver Todo", href: "/shop" }
      ]
    },
    {
      title: "COLECCIONES",
      items: [
        { label: "Colección Actual", href: "/collections/current" }
      ]
    },
    {
      title: "LA MARCA",
      items: [
        { label: "Nuestra Historia", href: "/about" },
        { label: "Filosofía", href: "/philosophy" },
        { label: "Contacto", href: "/contact" }
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 top-[104px] z-40 bg-black/20 backdrop-blur-sm"
          />

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[104px] left-0 w-full z-50 bg-sand-100 border-b border-wood-900/10 overflow-hidden shadow-2xl shadow-wood-900/5"
          >
            <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-12">
              
              <div className="flex justify-end mb-8">
                <button 
                  onClick={onClose}
                  className="group flex items-center gap-2 text-xs font-bold tracking-widest text-wood-400 hover:text-wood-900 transition-colors uppercase"
                >
                  Cerrar
                  <div className="p-1 rounded-full border border-wood-200 group-hover:border-wood-900 transition-colors">
                    <X className="w-3 h-3" />
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-12 gap-12">
                
                <div className="col-span-8 grid grid-cols-3 gap-8 border-r border-wood-900/5 pr-12">
                  {columns.map((col, idx) => (
                    <div key={idx} className="space-y-6">
                      <div className="flex items-center gap-2 text-wood-900 text-xs font-bold uppercase tracking-widest border-b border-wood-900/10 pb-2 mb-4">
                        {col.title}
                      </div>
                      <ul className="space-y-3">
                        {col.items.map((item: { label: string; href: string }, itemIdx: number) => (
                          <li key={itemIdx}>
                            <Link 
                              href={item.href} 
                              onClick={onClose}
                              className="group flex items-center gap-2 text-sm text-wood-600 hover:text-wood-900 transition-all duration-300"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="col-span-4 pl-4 relative">
                  <Link 
                    href="/shop" 
                    onClick={onClose}
                    className="relative block h-full w-full rounded-sm overflow-hidden group cursor-pointer aspect-square"
                  >
                    <ImageWithFallback
                      src={FEATURED_IMAGE}
                      alt="Featured Collection"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm px-6 py-3 text-wood-900 text-xs font-bold uppercase tracking-widest flex items-center gap-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-xl">
                        VER COLECCIÓN
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </div>

              </div>
              
              <div className="mt-12 pt-8 border-t border-wood-900/5 flex items-center justify-between text-xs text-wood-500">
                 <div className="flex gap-6 uppercase tracking-wider font-medium">
                   <Link href="/quote" onClick={onClose} className="hover:text-wood-900 transition-colors">Cotizador</Link>
                   <span className="text-wood-300">|</span>
                   <Link href="/shipping-policy" onClick={onClose} className="hover:text-wood-900 transition-colors">Envíos</Link>
                   <span className="text-wood-300">|</span>
                   <Link href="/returns-policy" onClick={onClose} className="hover:text-wood-900 transition-colors">Devoluciones</Link>
                   <span className="text-wood-300">|</span>
                   <Link href="/warranty-policy" onClick={onClose} className="hover:text-wood-900 transition-colors">Garantía</Link>
                   <span className="text-wood-300">|</span>
                   <Link href="/faq" onClick={onClose} className="hover:text-wood-900 transition-colors">Ayuda & FAQ</Link>
                   <span className="text-wood-300">|</span>
                   <Link href="/terms" onClick={onClose} className="hover:text-wood-900 transition-colors">Términos</Link>
                   <span className="text-wood-300">|</span>
                   <Link href="/privacy-policy" onClick={onClose} className="hover:text-wood-900 transition-colors">Privacidad</Link>
                 </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
