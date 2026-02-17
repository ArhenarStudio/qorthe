import React from 'react';
import { motion } from 'motion/react';
import { Globe } from 'lucide-react';
import clsx from 'clsx';

interface LanguageSwitcherProps {
  currentLang?: 'es' | 'en';
  onToggle?: (lang: 'es' | 'en') => void;
  variant?: 'minimal' | 'pill' | 'toggle';
  className?: string;
}

export const LanguageSwitcher = ({ 
  currentLang = 'es', 
  onToggle = () => {}, 
  variant = 'minimal',
  className 
}: LanguageSwitcherProps) => {
  
  const isEn = currentLang === 'en';

  // --- VARIANT: TOGGLE (Footer Style - Matches other switches) ---
  if (variant === 'toggle') {
    return (
      <button 
        onClick={() => onToggle(isEn ? 'es' : 'en')}
        className={clsx(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300",
          // Dark/Wood Context Styles (Default for Footer)
          isEn 
            ? "bg-wood-800/50 border-accent-gold/50 shadow-[0_0_10px_rgba(197,160,101,0.1)]" 
            : "bg-wood-800/50 border-wood-700/50 hover:border-wood-600",
          className
        )}
      >
        <Globe size={14} className={clsx("transition-colors", isEn ? "text-accent-gold" : "text-sand-100")} />
        
        {/* Switch Track */}
        <div className={clsx(
          "w-8 h-4 rounded-full relative transition-colors duration-300",
          isEn ? "bg-accent-gold" : "bg-wood-700"
        )}>
          {/* Knob */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={clsx(
              "absolute top-0.5 w-3 h-3 rounded-full shadow-sm",
              isEn ? "bg-white left-[18px]" : "bg-wood-500 left-0.5"
            )}
          />
        </div>
        
        {/* Optional Label for clarity, hidden if strictly icon-only */}
        <span className={clsx("text-[10px] font-bold w-4 text-center", isEn ? "text-accent-gold" : "text-wood-500")}>
          {isEn ? 'EN' : 'ES'}
        </span>
      </button>
    );
  }

  // --- VARIANT: PILL (Mobile / Light Context) ---
  if (variant === 'pill') {
    const languages = [
      { code: 'es', label: 'ES' },
      { code: 'en', label: 'EN' }
    ] as const;

    return (
      <div className={clsx("flex items-center bg-wood-900/5 dark:bg-sand-100/5 rounded-full p-1 relative", className)}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onToggle(lang.code)}
            className={clsx(
              "relative z-10 px-3 py-1 text-[10px] font-bold tracking-widest transition-colors duration-300",
              currentLang === lang.code ? "text-sand-100 dark:text-wood-900" : "text-wood-900/60 dark:text-sand-100/60 hover:text-wood-900 dark:hover:text-sand-100"
            )}
          >
            {lang.label}
            {currentLang === lang.code && (
              <motion.div
                layoutId="activeLangPill"
                className="absolute inset-0 bg-wood-900 dark:bg-sand-100 rounded-full -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    );
  }

  // --- VARIANT: MINIMAL (Desktop Header) ---
  return (
    <div className={clsx("flex items-center gap-2 text-xs font-medium tracking-wide", className)}>
      <Globe className="w-4 h-4 text-current opacity-70" />
      <div className="flex items-center">
        <button 
          onClick={() => onToggle('es')}
          className={clsx(
            "hover:text-wood-900 dark:hover:text-sand-100 transition-colors",
            currentLang === 'es' ? "text-current font-bold" : "text-current/50"
          )}
        >
          ES
        </button>
        <span className="mx-2 opacity-30">/</span>
        <button 
          onClick={() => onToggle('en')}
          className={clsx(
            "hover:text-wood-900 dark:hover:text-sand-100 transition-colors",
            currentLang === 'en' ? "text-current font-bold" : "text-current/50"
          )}
        >
          EN
        </button>
      </div>
    </div>
  );
};
