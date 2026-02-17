"use client";

import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

interface SectionLink {
  id: string;
  label: string;
}

interface LegalLayoutProps {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
  sections?: SectionLink[];
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ 
  title, 
  lastUpdated = "12 de Febrero, 2026", 
  children,
  sections = []
}) => {
  const router = useRouter();

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  const [activeSection, setActiveSection] = React.useState<string>('');

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { top, bottom } = element.getBoundingClientRect();
          const absoluteTop = top + window.scrollY;
          const absoluteBottom = bottom + window.scrollY;
          
          if (scrollPosition >= absoluteTop && scrollPosition < absoluteBottom) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-wood-900 text-wood-900 dark:text-sand-100 selection:bg-wood-900 selection:text-sand-100 dark:selection:bg-sand-100 dark:selection:text-wood-900 pt-28 pb-24 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-wood-600 hover:text-wood-900 dark:text-sand-100/60 dark:hover:text-sand-100 transition-colors mb-12 text-sm tracking-widest uppercase"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Volver</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          <aside className="lg:col-span-4 relative">
            <div className="lg:sticky lg:top-32 space-y-6 max-h-[calc(100vh-10rem)] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="font-serif text-wood-900 dark:text-sand-100 leading-tight mb-4 break-words text-[32px]">
                  {title}
                </h1>
                <div className="h-1 w-20 bg-wood-900/10 dark:bg-sand-100/20 mb-4"></div>
                <p className="text-wood-500 dark:text-sand-100/50 text-xs font-mono uppercase tracking-widest">
                  Última actualización: <br/>
                  <span className="text-wood-900 dark:text-sand-100 opacity-90">{lastUpdated}</span>
                </p>
              </motion.div>

              {sections.length > 0 && (
                <nav className="hidden lg:block space-y-1 border-l border-wood-900/10 dark:border-sand-100/10 pl-6 mt-8">
                  <span className="text-xs uppercase tracking-widest text-wood-400 dark:text-sand-100/40 mb-4 block">Contenido</span>
                  {sections.map((section, idx) => (
                    <a 
                      key={idx}
                      href={`#${section.id}`}
                      onClick={(e) => handleSectionClick(e, section.id)}
                      className={clsx(
                        "block py-1.5 text-sm transition-all duration-300 border-l-2 -ml-[25px] pl-6",
                        activeSection === section.id 
                          ? "border-wood-900 text-wood-900 font-medium translate-x-1 dark:border-sand-100 dark:text-sand-100" 
                          : "border-transparent text-wood-500 hover:text-wood-900 hover:border-wood-900/30 dark:text-sand-100/50 dark:hover:text-sand-100 dark:hover:border-sand-100/30"
                      )}
                    >
                      {section.label}
                    </a>
                  ))}
                </nav>
              )}
            </div>
          </aside>

          <main className="lg:col-span-8 lg:col-start-6 pb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose dark:prose-invert prose-lg max-w-none prose-headings:font-serif prose-headings:text-wood-900 dark:prose-headings:text-sand-100 prose-p:text-wood-700 dark:prose-p:text-sand-100/80 prose-p:font-light prose-p:leading-relaxed prose-strong:text-wood-900 dark:prose-strong:text-sand-100 prose-strong:font-medium prose-li:text-wood-700 dark:prose-li:text-sand-100/80"
            >
              {children}
            </motion.div>
          </main>

        </div>
      </div>
    </div>
  );
};
