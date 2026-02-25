"use client";

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScrollToTopProps {
  footerOffset?: number;
}

// Base bottom positions (in px)
const BASE_BOTTOM_MOBILE = 208; // bottom-52 = 13rem = 208px
const BASE_BOTTOM_DESKTOP = 112; // bottom-28 = 7rem = 112px

export function ScrollToTopButton({ footerOffset = 0 }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const baseBottom = isMobile ? BASE_BOTTOM_MOBILE : BASE_BOTTOM_DESKTOP;
  const computedBottom = baseBottom + footerOffset;

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
          style={{ bottom: `${computedBottom}px` }}
          className="fixed left-6 z-40 text-wood-900 dark:text-sand-100 hover:bg-wood-900 hover:text-sand-100 dark:hover:bg-sand-100 dark:hover:text-wood-900 p-2 rounded-full pointer-events-auto flex items-center justify-center group shadow-lg transition-[bottom] duration-300 ease-out"
          aria-label="Volver arriba"
        >
          <ArrowUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
