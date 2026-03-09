"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useCms, CmsPopup } from "@/contexts/CmsContext";

export const PopupRenderer: React.FC = () => {
  const { popups } = useCms();
  const pathname = usePathname();
  const [activePopup, setActivePopup] = useState<CmsPopup | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (popups.length === 0) return;
    const match = popups.find((p) => {
      if (dismissed.has(p.id)) return false;
      const matchesPath = p.show_on.some((path) => path === "/" ? pathname === "/" : pathname.startsWith(path));
      if (!matchesPath) return false;
      if (p.display_frequency === "once_per_session") {
        try { if (sessionStorage.getItem(`popup_seen_${p.id}`)) return false; } catch (_err) { void _err; }
      }
      return true;
    });
    if (!match) return;
    if (match.trigger_type === "delay") {
      const delay = parseInt(match.trigger_value || "3", 10) * 1000;
      const timer = setTimeout(() => setActivePopup(match), delay);
      return () => clearTimeout(timer);
    } else if (match.trigger_type === "page_load") {
      setActivePopup(match);
    }
  }, [popups, pathname, dismissed]);

  const handleDismiss = () => {
    if (activePopup) {
      setDismissed((prev) => new Set(prev).add(activePopup.id));
      try { sessionStorage.setItem(`popup_seen_${activePopup.id}`, "1"); } catch (_err) { void _err; }
      setActivePopup(null);
    }
  };

  const content = activePopup?.content || {};

  return (
    <AnimatePresence>
      {activePopup && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleDismiss} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed inset-0 m-auto w-full max-w-md h-fit max-h-[80vh] bg-white dark:bg-wood-900 rounded-2xl shadow-2xl z-[10000] overflow-hidden">
            <button onClick={handleDismiss} className="absolute top-3 right-3 z-10 p-1.5 bg-wood-100 dark:bg-wood-800 rounded-full text-wood-500 hover:text-wood-900 dark:hover:text-sand-100 transition-colors">
              <X size={16} />
            </button>
            <div className="p-8 text-center">
              {content.image && <img src={content.image} alt="" className="w-full h-40 object-cover rounded-lg mb-6" />}
              {content.title && <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-3">{content.title}</h3>}
              {content.body && <p className="text-sm text-wood-600 dark:text-sand-300 mb-6 leading-relaxed">{content.body}</p>}
              {content.cta_text && content.cta_url && (
                <a href={content.cta_url} onClick={handleDismiss} className="inline-block px-6 py-3 bg-accent-gold text-wood-900 font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-accent-gold/90 transition-colors">{content.cta_text}</a>
              )}
              {!content.title && !content.body && (
                <div><h3 className="font-serif text-xl text-wood-900 dark:text-sand-100 mb-2">{activePopup.name}</h3></div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
