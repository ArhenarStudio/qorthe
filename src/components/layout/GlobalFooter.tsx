"use client";

import React, { useState } from 'react';
import { 
  Instagram, Facebook, Mail, MapPin, Phone, Sun, 
  MessageSquare, ChevronDown, Moon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useFeatureToggle } from '@/contexts/FeatureToggleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NewsletterSuccessModal } from '@/components/newsletter/NewsletterSuccessModal';
import { useCms, CmsMenuItem } from '@/contexts/CmsContext';

const CONTENT = {
  newsletter: {
    title_start: "Únete a la mesa de",
    brand: "Qorthe",
    description: "Recibe acceso anticipado a nuevas colecciones de charcutería, invitaciones a eventos exclusivos y consejos de cuidado para tus piezas.",
    placeholder: "Tu correo electrónico",
    cta: "Suscribirse",
    privacy: "Al suscribirte aceptas nuestra política de privacidad."
  },
  columns: {
    brand: {
      title: "Marca",
      items: [
        { label: "Sobre Qorthe", href: "/about" },
        { label: "Filosofía", href: "/philosophy" },
        { label: "Programa de Lealtad", href: "/loyalty" },
        { label: "Contacto", href: "/contact" }
      ]
    },
    customerService: {
      title: "Servicio al Cliente",
      items: [
        { label: "Cotizador Personalizado", href: "/quote" },
        { label: "Preguntas Frecuentes", href: "/faq" },
        { label: "Política de Envíos", href: "/shipping-policy" },
        { label: "Política de Devoluciones", href: "/returns-policy" },
        { label: "Política de Garantía", href: "/warranty-policy" }
      ]
    },
    legal: {
      title: "Legal",
      items: [
        { label: "Aviso Legal", href: "/legal-notice" },
        { label: "Términos y Condiciones", href: "/terms" },
        { label: "Condiciones de Venta", href: "/sales-conditions" },
        { label: "Resolución de Disputas", href: "/dispute-resolution" },
        { label: "Propiedad Intelectual", href: "/intellectual-property" }
      ]
    },
    privacy: {
      title: "Privacidad",
      items: [
        { label: "Política de Privacidad", href: "/privacy-policy" },
        { label: "Política de Cookies", href: "/cookies-policy" }
      ]
    }
  },
  legal_bottom: {
    copyright: "© 2026 Qorthe. Todos los derechos reservados."
  },
  credits: {
    text: "Desarrollado por",
    developer: "Rockstage"
  }
};

const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const PinterestIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.017 0C5.396 0 0.029 5.367 0.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.399.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.173 0 7.41 2.967 7.41 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z"/>
  </svg>
);

const SocialIcon = ({ Icon }: { Icon: React.ComponentType<{ size?: number }> }) => (
  <a href="#" className="w-9 h-9 rounded-full bg-wood-200 dark:bg-wood-800/40 border border-wood-300 dark:border-wood-700 flex items-center justify-center text-wood-700 dark:text-sand-300 hover:border-wood-900 dark:hover:border-sand-100 hover:text-wood-900 dark:hover:text-wood-900 hover:bg-white dark:hover:bg-sand-100 transition-all duration-300">
    <Icon size={16} />
  </a>
);

export const GlobalFooter = () => {
  const { isChatEnabled, toggleChat, isWhatsAppEnabled, toggleWhatsApp } = useFeatureToggle();
  const { theme, toggleTheme } = useTheme();
  const { menus } = useCms();
  
  // CMS-driven footer columns with hardcoded fallback
  const cmsToColumn = (group: string, fallback: { title: string; items: { label: string; href: string }[] }) => {
    const cmsItems = menus[group];
    if (cmsItems?.length) {
      return { ...fallback, items: cmsItems.map((m: CmsMenuItem) => ({ label: m.label, href: m.url })) };
    }
    return fallback;
  };
  const footerColumns = [
    cmsToColumn('footerBrand', CONTENT.columns.brand),
    cmsToColumn('footerService', CONTENT.columns.customerService),
    cmsToColumn('footerLegal', CONTENT.columns.legal),
    cmsToColumn('footerPrivacy', CONTENT.columns.privacy),
  ];

  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    const email = emailInput?.value || '';

    if (email && email.includes('@')) {
      setNewsletterEmail(email);
      setIsNewsletterOpen(true);
      form.reset();

      // Send to API (fire and forget — modal already shown)
      try {
        await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch (err) {
        console.warn('[Newsletter] API error:', err);
      }
    }
  };
  
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="bg-sand-100 dark:bg-black text-wood-900 dark:text-sand-100 border-t border-wood-200 dark:border-wood-900 relative overflow-hidden transition-colors duration-300">
      
      <NewsletterSuccessModal 
        isOpen={isNewsletterOpen} 
        onClose={() => setIsNewsletterOpen(false)} 
        email={newsletterEmail} 
      />

      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent-gold/40 to-transparent"></div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-16 md:pt-20 pb-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 md:mb-24 items-end">
          <div className="lg:col-span-5 text-center md:text-left">
             <h3 className="font-serif text-3xl md:text-5xl mb-4 md:mb-6 leading-[1.1]">
               <span className="italic text-accent-gold font-light">{CONTENT.newsletter.brand}</span>
             </h3>
             <p className="text-wood-600 dark:text-sand-400 max-w-md mx-auto md:mx-0 font-light leading-relaxed text-sm md:text-base">
               {CONTENT.newsletter.description}
             </p>
          </div>
          <div className="lg:col-span-7 flex flex-col items-center md:items-start lg:items-end w-full">
             <div className="w-full max-w-xl">
                <form className="relative group" onSubmit={handleNewsletterSubmit}>
                  <input 
                    type="email" 
                    placeholder={CONTENT.newsletter.placeholder}
                    required
                    className="w-full bg-transparent border-b border-wood-300 dark:border-wood-600 text-wood-900 dark:text-sand-100 px-0 py-4 outline-none focus:border-wood-900 dark:focus:border-sand-100 transition-all duration-500 placeholder:text-wood-400 dark:placeholder:text-wood-600 font-light text-lg text-center md:text-left"
                  />
                  <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold tracking-widest uppercase text-wood-900 dark:text-sand-100 hover:text-accent-gold dark:hover:text-white transition-colors duration-300 hidden md:block">
                    {CONTENT.newsletter.cta}
                  </button>
                  <button type="submit" className="md:hidden w-full mt-4 py-3 bg-wood-100 dark:bg-wood-800/50 hover:bg-wood-200 dark:hover:bg-accent-gold/10 border border-wood-200 dark:border-wood-700 hover:border-wood-300 dark:hover:border-accent-gold text-xs font-bold tracking-widest uppercase text-wood-900 dark:text-accent-gold transition-all rounded-sm">
                    {CONTENT.newsletter.cta}
                  </button>
                  <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent-gold transition-all duration-500 group-hover:w-full group-focus-within:w-full hidden md:block"></div>
                </form>
                <p className="text-wood-500 dark:text-wood-600 text-[10px] mt-4 font-medium tracking-wide text-center md:text-left">
                  {CONTENT.newsletter.privacy}
                </p>
             </div>
          </div>
        </div>

        <div className="border-t border-wood-200 dark:border-wood-800/50 pt-8 md:pt-16 mb-16 md:mb-24">
          
          <div className="md:hidden space-y-2">
            {footerColumns.map((section, si) => (
              <div key={section.title + si} className="border-b border-wood-200 dark:border-wood-800/30">
                <button 
                  onClick={() => toggleSection(section.title)}
                  className="w-full py-4 flex items-center justify-between text-left group"
                >
                  <span className={`font-serif text-lg transition-colors ${openSection === section.title ? 'text-accent-gold' : 'text-wood-900 dark:text-sand-100'}`}>
                    {section.title}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 text-wood-400 dark:text-wood-500 transition-transform duration-300 ${openSection === section.title ? 'rotate-180 text-accent-gold' : ''}`} 
                  />
                </button>
                <AnimatePresence>
                  {openSection === section.title && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                      className="overflow-hidden"
                    >
                      <ul className="pb-6 space-y-3 pl-2">
                        {section.items.map((item, idx) => (
                          <li key={idx}>
                            <Link 
                              href={item.href} 
                              className="block text-wood-600 dark:text-sand-400 hover:text-wood-900 dark:hover:text-sand-100 text-sm font-light py-1"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            
            <div className="pt-8 flex flex-col items-center justify-center gap-4">
               <p className="text-xs text-wood-500 dark:text-wood-600 uppercase tracking-widest font-bold">Síguenos</p>
               <div className="flex gap-4">
                <SocialIcon Icon={Instagram} />
                <SocialIcon Icon={Facebook} />
                <SocialIcon Icon={TikTokIcon} />
                <SocialIcon Icon={PinterestIcon} />
               </div>
            </div>
          </div>

          <div className="hidden md:grid grid-cols-4 gap-10 lg:gap-16">
            <div className="flex flex-col justify-between h-full space-y-8">
              <div className="space-y-6">
                <h4 className="font-serif text-lg text-wood-900 dark:text-sand-100">
                  {footerColumns[0].title}
                </h4>
                <ul className="space-y-3">
                  {footerColumns[0].items.map((item, idx) => (
                    <li key={idx}>
                      <Link href={item.href} className="text-wood-600 dark:text-sand-400 hover:text-wood-900 dark:hover:text-sand-100 transition-all duration-300 text-sm font-light hover:translate-x-1 inline-block">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs text-wood-500 dark:text-wood-600 uppercase tracking-widest mb-4 font-bold">Síguenos</p>
                <div className="flex gap-2">
                  <SocialIcon Icon={Instagram} />
                  <SocialIcon Icon={Facebook} />
                  <SocialIcon Icon={TikTokIcon} />
                  <SocialIcon Icon={PinterestIcon} />
                </div>
              </div>
            </div>

            {footerColumns.slice(1).map((col, idx) => (
              <div key={idx} className="space-y-6">
                <h4 className="font-serif text-lg text-wood-900 dark:text-sand-100">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.items.map((item, i) => (
                    <li key={i}>
                      <Link href={item.href} className="text-wood-600 dark:text-sand-400 hover:text-wood-900 dark:hover:text-sand-100 transition-all duration-300 text-sm font-light hover:translate-x-1 inline-block">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-wood-200 dark:border-wood-800/50 px-8 md:px-[10%]">
          
          <div className="text-xs text-wood-500 font-medium tracking-wide flex flex-col sm:flex-row gap-2 md:gap-4 items-center text-center sm:text-left">
            <p>{CONTENT.legal_bottom.copyright}</p>
            <span className="hidden sm:block text-wood-300 dark:text-wood-700">•</span>
            <p className="text-wood-600">{CONTENT.credits.text} <span className="text-wood-500 hover:text-accent-gold transition-colors cursor-pointer">{CONTENT.credits.developer}</span></p>
          </div>

          <div className="flex items-center gap-5">
               <LanguageSwitcher variant="toggle" />

               <div className="h-4 w-[1px] bg-wood-300 dark:bg-wood-700"></div>

               <button 
                  onClick={toggleTheme}
                  className="text-wood-500 hover:text-accent-gold transition-colors focus:outline-none"
                  title={theme === 'light' ? "Activar modo noche" : "Activar modo día"}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={theme}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="block"
                    >
                      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </motion.span>
                  </AnimatePresence>
                </button>

                <button 
                  onClick={toggleChat}
                  className={`transition-colors ${isChatEnabled ? 'text-accent-gold' : 'text-wood-500 hover:text-wood-900 dark:hover:text-sand-100'}`}
                  title="Activar Chat"
                >
                  <MessageSquare size={18} />
                </button>
                
                 <button 
                  onClick={toggleWhatsApp}
                  className={`transition-colors ${isWhatsAppEnabled ? 'text-accent-gold' : 'text-wood-500 hover:text-wood-900 dark:hover:text-sand-100'}`}
                  title="Activar WhatsApp"
                 >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
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
                </button>

          </div>

        </div>

      </div>
    </footer>
  );
};
