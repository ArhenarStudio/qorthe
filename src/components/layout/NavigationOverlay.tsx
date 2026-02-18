"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, ChevronDown, ShoppingBag, Heart,
  MessageSquare, Sun, Moon, X
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useFeatureToggle } from '@/contexts/FeatureToggleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  logo: string;
  isAuthenticated: boolean;
  onLogin: () => void;
  content: Record<string, string>;
  navLinks: { name: string; href: string }[];
}

export const NavigationOverlay: React.FC<NavigationOverlayProps> = ({
  isOpen,
  onClose,
  logo,
  isAuthenticated,
  onLogin,
  content,
  navLinks
}) => {
  const { isChatEnabled, toggleChat, isWhatsAppEnabled, toggleWhatsApp } = useFeatureToggle();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const navStructure = [
    {
      title: "PRODUCTOS",
      id: "products",
      items: [
        { label: "Tablas", href: "/shop?category=tablas" },
        { label: "Piezas Funcionales", href: "/shop?category=funcional" },
        { label: "Decoración", href: "/shop?category=decoracion" },
        { label: "Arte", href: "/shop?category=arte" },
        { label: "Ediciones Limitadas", href: "/shop?category=limitadas" },
        { label: "Ver Todo", href: "/shop", isBold: true }
      ]
    },
    {
      title: "COLECCIONES",
      id: "collections",
      items: [
        { label: "Colección Actual", href: "/collections/current" },
        { label: "Producción Limitada", href: "/collections/limited" },
        { label: "Archivo", href: "/collections/archive" }
      ]
    },
    {
      title: "PERSONALIZADOS",
      id: "custom",
      href: "/quote"
    },
    {
      title: "LA MARCA",
      id: "brand",
      items: [
        { label: "Nuestra Historia", href: "/about" },
        { label: "Filosofía", href: "/philosophy" },
        { label: "Proceso", href: "/process" },
        { label: "Materiales", href: "/materials" },
        { label: "Studio", href: "/studio" }
      ]
    },
    {
      title: "CONTACTO",
      id: "contact",
      href: "/contact"
    }
  ];

  const infoLinks = [
    { label: "Cotizador Personalizado", href: "/quote" },
    { label: "Envíos", href: "/shipping-policy" },
    { label: "Devoluciones", href: "/returns-policy" },
    { label: "Garantía", href: "/warranty-policy" },
    { label: "Ayuda & FAQ", href: "/faq" }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex justify-start"
        >
          <motion.div 
            className="absolute inset-0 bg-wood-900/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-sand-100 dark:bg-wood-900 h-full shadow-2xl overflow-y-auto flex flex-col"
          >
            <div className="px-6 py-4 flex items-center justify-between border-b border-wood-900/10 dark:border-sand-100/10">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-wood-900/5 dark:hover:bg-sand-100/5 rounded-full transition-colors -ml-2"
              >
                <X className="w-6 h-6 text-wood-900 dark:text-sand-100" />
              </button>
              <div className="flex items-baseline gap-2">
                <span className="text-lg text-wood-900 dark:text-sand-100 font-bold tracking-tight">
                  DavidSon&apos;s
                </span>
                <span className="text-sm text-wood-900/80 dark:text-sand-100/80 tracking-widest">
                  Design
                </span>
              </div>
            </div>

            <div className="p-6 bg-wood-900/5 dark:bg-sand-100/5 border-b border-wood-900/10 dark:border-sand-100/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-wood-900 dark:text-sand-100 truncate">
                    {isAuthenticated ? (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Mi Cuenta') : content.guest}
                  </p>
                  {isAuthenticated ? (
                    <div className="flex gap-3">
                      <Link href="/account" onClick={onClose} className="text-xs text-wood-600 dark:text-sand-300 hover:text-wood-900 dark:hover:text-sand-100 underline text-left block">
                        Mi cuenta
                      </Link>
                      <button onClick={() => { signOut(); onClose(); }} className="text-xs text-red-600 hover:text-red-800 underline text-left block">
                        Cerrar sesión
                      </button>
                    </div>
                  ) : (
                    <button onClick={onLogin} className="text-xs text-wood-600 dark:text-sand-300 hover:text-wood-900 dark:hover:text-sand-100 underline text-left block">
                      {content.login_cta}
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MenuButton icon={ShoppingBag} label="Carrito" />
                <MenuButton icon={Heart} label={content.favorites} />
              </div>
            </div>

            <div className="px-6 py-4 flex-1 overflow-y-auto scrollbar-hide">
              <div className="space-y-1">
                {navStructure.map((section) => (
                  <div key={section.id} className="border-b border-wood-900/5 dark:border-sand-100/5 last:border-0">
                    {section.items ? (
                      <div>
                        <button 
                          onClick={() => toggleSection(section.id)}
                          className="w-full py-4 flex items-center justify-between text-left group"
                        >
                          <span className={`text-sm font-bold tracking-widest uppercase transition-colors ${openSection === section.id ? 'text-wood-900 dark:text-sand-100' : 'text-wood-600 dark:text-sand-400 group-hover:text-wood-900 dark:group-hover:text-sand-100'}`}>
                            {section.title}
                          </span>
                          <ChevronDown 
                            className={`w-4 h-4 text-wood-400 dark:text-sand-500 transition-transform duration-300 ${openSection === section.id ? 'rotate-180' : ''}`} 
                          />
                        </button>
                        <AnimatePresence>
                          {openSection === section.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                              className="overflow-hidden"
                            >
                              <div className="pb-4 flex flex-col gap-3 pl-4 border-l border-wood-900/10 dark:border-sand-100/10 ml-2 mb-2">
                                {section.items.map((item, idx) => (
                                  <Link 
                                    key={idx} 
                                    href={item.href}
                                    onClick={onClose}
                                    className={`text-sm font-medium transition-colors ${item.isBold ? 'text-wood-900 dark:text-sand-100 font-bold' : 'text-wood-500 dark:text-sand-400 hover:text-wood-900 dark:hover:text-sand-100'}`}
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link 
                        href={section.href}
                        onClick={onClose}
                        className="block py-4 text-sm font-bold tracking-widest uppercase text-wood-600 dark:text-sand-400 hover:text-wood-900 dark:hover:text-sand-100 transition-colors"
                      >
                        {section.title}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-12 mb-6">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-wood-400 dark:text-sand-500 mb-4 px-1">
                  Información
                </h3>
                <div className="flex flex-col gap-3 px-1">
                  {infoLinks.map((link, idx) => (
                    <Link 
                      key={idx}
                      href={link.href}
                      onClick={onClose}
                      className="text-sm font-medium text-wood-600 dark:text-sand-400 hover:text-wood-900 dark:hover:text-sand-100 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-wood-900/10 dark:border-sand-100/10 bg-sand-200/50 dark:bg-wood-800/30">
              <div className="pt-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-wood-400 dark:text-sand-500 mb-4 px-1">
                  Preferencias
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-1">
                      <LanguageSwitcher 
                        variant="pill" 
                        className="w-full justify-center bg-wood-900/5 dark:bg-sand-100/5 hover:bg-wood-900/10 dark:hover:bg-sand-100/10 border-0 h-10 shadow-none rounded-lg text-wood-900 dark:text-sand-100" 
                      />
                    </div>

                    <button 
                      onClick={toggleTheme}
                      className="col-span-1 flex items-center justify-center gap-2 h-10 px-3 bg-wood-900/5 dark:bg-sand-100/5 hover:bg-wood-900/10 dark:hover:bg-sand-100/10 rounded-lg text-xs font-bold uppercase tracking-wide text-wood-900 dark:text-sand-100 transition-colors"
                    >
                      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      {theme === 'light' ? 'Oscuro' : 'Claro'}
                    </button>

                     <button 
                        onClick={toggleChat}
                        className={`col-span-1 flex items-center justify-center gap-2 h-10 px-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${isChatEnabled ? 'bg-wood-900 text-sand-100 dark:bg-sand-100 dark:text-wood-900 shadow-md' : 'bg-wood-900/5 dark:bg-sand-100/5 text-wood-900 dark:text-sand-100 hover:bg-wood-900/10 dark:hover:bg-sand-100/10'}`}
                     >
                        <MessageSquare className="w-4 h-4" />
                        Chat
                     </button>
                     
                     <button 
                        onClick={toggleWhatsApp}
                        className={`col-span-1 flex items-center justify-center gap-2 h-10 px-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${isWhatsAppEnabled ? 'bg-[#25D366] text-white shadow-md' : 'bg-wood-900/5 dark:bg-sand-100/5 text-wood-900 dark:text-sand-100 hover:bg-wood-900/10 dark:hover:bg-sand-100/10'}`}
                     >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                        >
                            <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                            <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                        </svg>
                        WhatsApp
                     </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-wood-900/5 dark:border-sand-100/5 flex flex-wrap justify-center gap-x-2 gap-y-1 text-[10px] text-wood-500 dark:text-sand-500 uppercase tracking-wider font-medium text-center">
                  <Link href="/terms" className="hover:text-wood-900 dark:hover:text-sand-100 transition-colors">Términos</Link>
                  <span className="text-wood-300 dark:text-wood-600">|</span>
                  <Link href="/privacy-policy" className="hover:text-wood-900 dark:hover:text-sand-100 transition-colors">Privacidad</Link>
                  <span className="text-wood-300 dark:text-wood-600">|</span>
                  <Link href="/cookies-policy" className="hover:text-wood-900 dark:hover:text-sand-100 transition-colors">Cookies</Link>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const MenuButton = ({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) => (
  <button className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <Icon className="w-5 h-5 text-wood-900 mb-1" />
    <span className="text-[10px] font-medium text-wood-700 text-center leading-tight">{label}</span>
  </button>
);
