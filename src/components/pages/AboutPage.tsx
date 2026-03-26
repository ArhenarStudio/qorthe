"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Hammer, Ruler, PenTool, Award, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import Link from 'next/link';

// Images from Unsplash
const IMG_ORIGIN = "https://images.unsplash.com/photo-1706048111522-e4865f909940?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kd29ya2luZyUyMGNhcnBlbnRlciUyMGhhbmRzJTIwY2VkYXJ8ZW58MXx8fHwxNzcwOTMyODA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const IMG_HERITAGE = "https://images.unsplash.com/photo-1738229740116-657bccb0de32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydXN0aWMlMjBkYXJrJTIwd29vZCUyMGZ1cm5pdHVyZSUyMGRldGFpbHxlbnwxfHx8fDE3NzA5MzI4MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const IMG_HERO = "https://images.unsplash.com/photo-1732544504373-01e2f4a6493f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwd29vZCUyMHRleHR1cmUlMjBjYXJwZW50cnklMjBlbGVnYW50JTIwZGV0YWlsfGVufDF8fHx8MTc3MDkzMzQ0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export const AboutPage = () => {
  return (
    <div className="bg-sand-100 dark:bg-black text-wood-900 dark:text-sand-100 min-h-screen transition-colors duration-500">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback 
            src={IMG_HERO} 
            alt="Qorthe Interior" 
            className="w-full h-full object-cover opacity-60 dark:opacity-40 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sand-100 dark:from-black via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 tracking-tight">
              Sobre Qorthe
            </h1>
            <div className="h-1 w-24 bg-accent-gold mx-auto mb-8" />
            <p className="text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
              Qorthe´s Design no nace como un negocio.<br />
              <span className="italic font-serif text-wood-600 dark:text-sand-400">Nace como una herencia.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- ORIGEN SECTION --- */}
      <section className="py-24 px-6 md:px-12 lg:px-24 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-accent-gold mb-2">
              El Origen
            </h2>
            <h3 className="font-serif text-3xl md:text-4xl leading-tight">
              Experiencia convertida en materia.
            </h3>
            <div className="space-y-6 text-wood-700 dark:text-sand-300 font-light leading-relaxed text-justify md:text-left">
              <p>
                Durante décadas, el taller fue un espacio de creación silenciosa. Un lugar donde la madera no era materia prima, sino experiencia.
              </p>
              <p>
                El fundador original de esa práctica fue un médico ginecólogo retirado, apasionado por la arquitectura y la carpintería desde siempre. Lo que para otros era un hobby, para él era un ritual: trabajar el cedro, percibir su aroma, entender su veta, transformar materia en estructura con precisión casi quirúrgica.
              </p>
              <p className="border-l-2 border-accent-gold pl-6 italic text-wood-900 dark:text-sand-100">
                "Construyó bares, mesas de centro, bancas, puertas, cajones y piezas de altísima calidad. Nunca para vender. Nunca para negocio. Solo por pasión."
              </p>
              <p>
                El contacto con la madera —especialmente el cedro— representaba un estado casi meditativo. Una conexión profunda con el material.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[600px] w-full"
          >
             <ImageWithFallback 
                src={IMG_ORIGIN}
                alt="Manos trabajando madera"
                className="w-full h-full object-cover rounded-sm shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
             />
             <div className="absolute -bottom-6 -left-6 w-24 h-24 border-b border-l border-wood-900 dark:border-sand-100 hidden md:block" />
             <div className="absolute -top-6 -right-6 w-24 h-24 border-t border-r border-wood-900 dark:border-sand-100 hidden md:block" />
          </motion.div>
        </div>
      </section>

      {/* --- HERENCIA FAMILIAR SECTION --- */}
      <section className="py-24 bg-wood-50 dark:bg-wood-900/50">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
             {/* Order Change on Mobile: Text first, then Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[600px] w-full order-2 md:order-1"
            >
               <ImageWithFallback 
                  src={IMG_HERITAGE}
                  alt="Muebles rústicos y texturas"
                  className="w-full h-full object-cover rounded-sm shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
               />
               <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8 order-1 md:order-2"
            >
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-accent-gold mb-2">
                Herencia Familiar
              </h2>
              <h3 className="font-serif text-3xl md:text-4xl leading-tight">
                Oficio sin etiqueta.
              </h3>
              <div className="space-y-6 text-wood-700 dark:text-sand-300 font-light leading-relaxed text-justify md:text-left">
                <p>
                  La tradición no comenzó ahí. Por el lado materno, el abuelo fue gerente regional de una empresa de muebles en el sur de Sonora. Tras su cierre, junto con sus hijos, comenzó a fabricar y vender muebles rústicos en la frontera.
                </p>
                <ul className="space-y-2 pl-4">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                    <span>Era diseño antes de que se llamara diseño.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                    <span>Era reutilización antes de que se llamara sustentabilidad.</span>
                  </li>
                </ul>
                <p>
                  En el hogar, la sensibilidad estética también estuvo siempre presente. La mirada cuidadosa hacia los espacios, la armonía entre objetos, luz y proporciones, formaba parte natural del entorno.
                </p>
                <div className="pt-4">
                  <p className="font-serif text-xl italic text-wood-900 dark:text-sand-100">
                    "Una herencia que nunca tuvo nombre. Hasta ahora."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- EVOLUCIÓN (Transition to Philosophy) --- */}
      <section className="py-32 px-6 md:px-12 lg:px-24 max-w-[1440px] mx-auto">
        
        {/* Evolution Header */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
             <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-accent-gold mb-6">
                Evolución
              </h2>
              <p className="text-lg md:text-xl font-light leading-relaxed text-wood-800 dark:text-sand-200">
                A los 33 años, con formación financiera y experiencia en desarrollo tecnológico, la siguiente generación decide estructurar lo que antes era pasión dispersa.
              </p>
          </motion.div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Hammer, title: "Tradición Manual", desc: "El respeto por el oficio clásico." },
            { icon: Ruler, title: "Visión Empresarial", desc: "Estructura y proyección a largo plazo." },
            { icon: Award, title: "Precisión Estructural", desc: "Cada unión y ángulo tiene un propósito." },
            { icon: PenTool, title: "Tecnología Contemporánea", desc: "Innovación aplicada a la artesanía." }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-wood-900 p-8 border border-wood-100 dark:border-wood-800 text-center hover:border-accent-gold/50 transition-colors group"
            >
              <div className="inline-flex p-4 rounded-full bg-wood-50 dark:bg-wood-800 text-wood-900 dark:text-sand-100 mb-6 group-hover:bg-accent-gold group-hover:text-white transition-colors">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg mb-3">{item.title}</h3>
              <p className="text-sm text-wood-500 dark:text-sand-400 font-light">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 text-center">
            <Link href="/philosophy" className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-wood-900 dark:text-sand-100 border-b border-wood-900 dark:border-sand-100 pb-1 hover:text-accent-gold hover:border-accent-gold transition-colors">
                Descubre nuestra Filosofía
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>

      </section>

    </div>
  );
};
