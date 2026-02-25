"use client";

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScrollToTopProps {
  footerOverlap?: number;
}

export function ScrollToTopButton({ footerOverlap = 0 }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Base: bottom-6 (24px). When footer visible, push up.
  const bottom = 24 + footerOverlap;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          style={{ bottom: `${bottom}px` }}
          className="fixed left-6 z-40 text-wood-900 dark:text-sand-100 hover:bg-wood-900 hover:text-sand-100 dark:hover:bg-sand-100 dark:hover:text-wood-900 p-2 rounded-full pointer-events-auto flex items-center justify-center group shadow-lg transition-[bottom] duration-300 ease-out"
          aria-label="Volver arriba"
        >
          <ArrowUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
