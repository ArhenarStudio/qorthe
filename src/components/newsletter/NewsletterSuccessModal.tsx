"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';

interface NewsletterSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export const NewsletterSuccessModal: React.FC<NewsletterSuccessModalProps> = ({ isOpen, onClose, email }) => {
  
  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-wood-900/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-sand-100 dark:bg-wood-900 w-full max-w-md p-8 md:p-12 relative shadow-2xl border border-wood-200 dark:border-wood-800 pointer-events-auto">
              
              {/* Decorative Corner */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-wood-900/10 dark:border-sand-100/10" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-wood-900/10 dark:border-sand-100/10" />

              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-wood-500 hover:text-wood-900 dark:text-sand-400 dark:hover:text-sand-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-6 h-6 md:w-8 md:h-8 text-accent-gold" />
                </div>
                
                <h3 className="font-serif text-2xl md:text-3xl text-wood-900 dark:text-sand-100 mb-4">
                  Bienvenido a la mesa
                </h3>
                
                <p className="text-wood-600 dark:text-sand-300 font-light text-sm md:text-base leading-relaxed mb-6">
                  Gracias por suscribirte. Hemos añadido <span className="font-medium text-wood-900 dark:text-sand-100">{email}</span> a nuestra lista exclusiva. Pronto recibirás noticias sobre nuestras nuevas colecciones y eventos privados.
                </p>

                <button
                  onClick={onClose}
                  className="w-full py-3 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 text-xs font-bold tracking-[0.2em] uppercase hover:bg-wood-800 dark:hover:bg-sand-200 transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
