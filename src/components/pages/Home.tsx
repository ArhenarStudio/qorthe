"use client";

import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Leaf, Hexagon, Zap, Tag, Star, ArrowRight } from 'lucide-react';
import { addToCart } from '@/utils/cartActions';
import { CuratedSelection } from '@/components/features/CuratedSelection';
import { BrandValues } from '@/components/features/BrandValues';
import { TestimonialsSection } from '@/components/features/TestimonialsSection';
import { NewsletterAndCTA } from '@/components/features/NewsletterAndCTA';

// --- DICTIONARY STUB ---
const CONTENT = {
  hero: {
    title_start: "Madera con",
    title_end: "Alma",
    subtitle: "Piezas únicas en Parota, Cedro y Rosa Morada. Diseñadas para celebrar la vida.",
    cta: "Ver Colección",
    scroll: "Descubre la esencia"
  },
  materials: {
    title: "Nuestras Maderas",
    desc: "Selección premium para cada estilo y necesidad.",
    items: [
      {
        name: "Parota",
        desc: "Veta imponente y resistencia natural. La joya de la corona para piezas de gran formato.",
        color: "bg-[#4A3728]"
      },
      {
        name: "Rosa Morada",
        desc: "Tonos cálidos y elegancia sutil. Perfecta para presentaciones delicadas.",
        color: "bg-[#8B5E3C]"
      },
      {
        name: "Cedro",
        desc: "Aroma inconfundible y ligereza. Un clásico que nunca pasa de moda.",
        color: "bg-[#9E5B40]"
      },
      {
        name: "Pino",
        desc: "Versatilidad y belleza rústica. Ideal para el uso diario y mobiliario casual.",
        color: "bg-[#D4B996]"
      }
    ]
  },
  uses: {
    title: "Un Lienzo, Múltiples Escenarios",
    items: [
      {
        title: "Charcutería & Servicio",
        desc: "Eleva tus reuniones con tablas diseñadas para compartir.",
        img: "https://images.unsplash.com/photo-1745970800051-c98b55ffe260?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFyY3V0ZXJpZSUyMHBsYXR0ZXIlMjBldmVudHxlbnwxfHx8fDE3NzA4NDc0NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        price: 2450
      },
      {
        title: "Eventos & Decoración",
        desc: "Centros de mesa y bases que transforman espacios.",
        img: "https://images.unsplash.com/photo-1516629959642-127e1f5796a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3ZWRkaW5nJTIwdGFibGUlMjBzZXR0aW5nJTIwd29vZHxlbnwxfHx8fDE3NzA4NDc0NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        price: 1800
      },
      {
        title: "Mobiliario Auxiliar",
        desc: "Piezas funcionales que añaden calidez a tu hogar.",
        img: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwd29vZGVuJTIwZnVybml0dXJlfGVufDF8fHx8MTc3MDg0NzQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080",
        price: 3500
      }
    ]
  },
  customization: {
    title: "Tu Sello Personal",
    subtitle: "Personalización Láser de Alta Precisión",
    desc: "Grabamos nombres, logotipos o fechas especiales. Convierte una pieza de madera en un regalo inolvidable o un distintivo de marca.",
    cta: "Personalizar mi tabla"
  }
};

// Animations
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: "easeOut" }
};

export const Home = () => {
  const handleAddToCart = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      name: item.title,
      price: item.price,
      image: item.img
    });
  };

  return (
    <div className="bg-sand-100 dark:bg-wood-950 text-wood-900 dark:text-sand-100 font-sans overflow-x-hidden transition-colors duration-300">
      
      {/* HERO SECTION - Immersive Video/Image */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0 z-0"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 15, ease: "linear" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-wood-950/80 via-wood-900/50 to-wood-950/90 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1573987434762-76cb0f5bcf7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kJTIwZ3JhaW4lMjB0ZXh0dXJlJTIwZGFya3xlbnwxfHx8fDE3NzA4NDc0NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080" 
            alt="Dark Wood Grain" 
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto mt-12">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-6xl md:text-8xl lg:text-9xl font-serif text-sand-100 mb-6 font-['Playfair_Display'] tracking-tight"
          >
            {CONTENT.hero.title_start} <span className="italic text-accent-gold">{CONTENT.hero.title_end}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-sand-100/80 text-xl md:text-2xl font-light max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            {CONTENT.hero.subtitle}
          </motion.p>
          
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-transparent border border-sand-100 text-sand-100 text-sm tracking-[0.2em] uppercase hover:bg-sand-100 hover:text-wood-900 transition-all duration-500"
          >
            {CONTENT.hero.cta}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-sand-100/40 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-widest">{CONTENT.hero.scroll}</span>
          <div className="w-px h-12 bg-gradient-to-b from-sand-100/40 to-transparent" />
        </motion.div>
      </section>

      {/* NEW: Curated Selection */}
      <CuratedSelection />

      {/* MATERIALS SECTION - Horizontal Scroll Cards */}
      <section className="py-32 bg-sand-100 dark:bg-wood-950 relative transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between gap-8 mb-12 border-b border-wood-900/10 dark:border-sand-100/10 pb-8"
          >
            <div>
              <span className="text-wood-900/50 dark:text-sand-100/50 text-xs tracking-[0.2em] uppercase block mb-3">Colección Natural</span>
              <h2 className="text-4xl md:text-5xl font-serif text-wood-900 dark:text-sand-100">{CONTENT.materials.title}</h2>
            </div>
            <p className="hidden md:block text-wood-900/60 dark:text-sand-100/60 max-w-xs text-right font-light">
              {CONTENT.materials.desc}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONTENT.materials.items.map((wood, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="group relative h-[400px] overflow-hidden bg-wood-200 dark:bg-wood-800 cursor-pointer"
              >
                {/* Color Overlay Mocking Wood Texture */}
                <div className={`absolute inset-0 ${wood.color} opacity-90 transition-transform duration-700 group-hover:scale-105`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <h3 className="text-2xl font-serif text-white mb-2 italic group-hover:translate-x-2 transition-transform duration-500">{wood.name}</h3>
                  <div className="h-px w-12 bg-white/50 mb-4 group-hover:w-full transition-all duration-700" />
                  <p className="text-white/80 text-sm font-light leading-relaxed opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    {wood.desc}
                  </p>
                </div>
                
                {/* Icon */}
                <div className="absolute top-6 right-6 text-white/30 group-hover:text-white/80 transition-colors duration-500">
                  <Leaf className="w-6 h-6" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOMIZATION FEATURE - Dark Section (Kept Dark for Contrast) */}
      <section className="py-32 bg-wood-900 dark:bg-black text-sand-100 relative overflow-hidden transition-colors duration-300">
        {/* Background Texture Pattern */}
        <div className="absolute inset-0 opacity-5" 
             style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/wood-pattern.png")` }} />

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          
          <motion.div variants={fadeInUp} className="order-2 lg:order-1">
            <div className="flex items-center gap-4 mb-6 text-accent-gold">
              <Zap className="w-6 h-6" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase">Tecnología & Artesanía</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">
              {CONTENT.customization.title} <br/>
              <span className="text-sand-100/30 text-3xl md:text-4xl italic">{CONTENT.customization.subtitle}</span>
            </h2>
            <p className="text-sand-100/70 text-lg leading-relaxed mb-10 font-light border-l border-accent-gold pl-6">
              {CONTENT.customization.desc}
            </p>
            <button className="bg-accent-gold text-wood-900 px-8 py-4 font-bold tracking-widest uppercase hover:bg-white transition-colors duration-300 shadow-[0_0_20px_rgba(197,160,101,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              {CONTENT.customization.cta}
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative h-[600px] w-full rounded-sm overflow-hidden shadow-2xl border border-sand-100/10">
              <img 
                src="https://images.unsplash.com/photo-1632199495802-18f7d21f323b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjB3b29kJTIwZW5ncmF2aW5nJTIwY2xvc2UlMjB1cHxlbnwxfHx8fDE3NzA4NDc0NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Laser Engraving Close Up" 
                className="w-full h-full object-cover opacity-80"
              />
              {/* Laser Effect Animation Overlay */}
              <motion.div 
                animate={{ 
                  top: ["10%", "90%", "10%"],
                  opacity: [0.5, 1, 0.5] 
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-0.5 bg-accent-gold shadow-[0_0_15px_rgba(197,160,101,1)] blur-[1px] z-20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-wood-900 via-transparent to-wood-900/50 dark:from-black dark:to-black/50 z-10" />
            </div>
            {/* Decorative Floating Element */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 border border-sand-100/20 rounded-full animate-spin-slow pointer-events-none" style={{ animationDuration: '20s' }} />
          </motion.div>

        </div>
      </section>

      {/* NEW: Brand Values */}
      <BrandValues />

      {/* NEW: Testimonials */}
      <TestimonialsSection />

      {/* NEW: Newsletter + CTA */}
      <NewsletterAndCTA />

    </div>
  );
}
