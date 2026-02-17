"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Heart, Target, Globe, Compass, Anchor } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

// Images
const IMG_CREATIVE = "https://images.unsplash.com/photo-1610650394144-a778795cf585?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmFsJTIwc2tldGNoJTIwYmx1ZXByaW50cyUyMGRlc2t8ZW58MXx8fHwxNzcwOTMyODA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const IMG_HERO = "https://images.unsplash.com/photo-1650831341546-d4b74964a036?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwd29vZCUyMGdyYWluJTIwdGV4dHVyZSUyMG1hY3JvJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzA5MzMzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export const PhilosophyPage = () => {
  return (
    <div className="bg-sand-100 dark:bg-black text-wood-900 dark:text-sand-100 min-h-screen transition-colors duration-500">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback 
            src={IMG_HERO} 
            alt="DavidSon's Design Philosophy" 
            className="w-full h-full object-cover opacity-50 dark:opacity-30 grayscale"
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
              Filosofía
            </h1>
            <div className="h-1 w-24 bg-accent-gold mx-auto mb-8" />
            <p className="text-sm tracking-[0.3em] uppercase mb-2 text-wood-600 dark:text-sand-400 font-bold">
                DavidSon´s Design
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- NUESTRA ESENCIA --- */}
      <section className="py-24 px-6 md:px-12 lg:px-24 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
            >
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-accent-gold mb-2">
                    Nuestra Esencia
                </h2>
                <div className="font-serif text-3xl md:text-4xl leading-tight space-y-4">
                   <p>Creemos en el valor de lo bien hecho.</p>
                   <p>En la precisión como forma de respeto.</p>
                   <p>En el diseño como estructura, no como ornamento.</p>
                </div>
                <div className="text-wood-700 dark:text-sand-300 font-light leading-relaxed text-justify md:text-left pt-4 border-l-2 border-accent-gold pl-6">
                    <p>
                        DavidSon´s Design se fundamenta en la convicción de que los objetos que nos rodean influyen en la manera en que vivimos. Un mueble no es solo funcional; es presencia, equilibrio y carácter dentro de un espacio.
                    </p>
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="h-[500px] w-full relative"
            >
                 <ImageWithFallback 
                    src={IMG_CREATIVE}
                    alt="Esencia creativa"
                    className="w-full h-full object-cover rounded-sm grayscale shadow-xl"
                 />
                 <div className="absolute inset-0 bg-wood-900/10 mix-blend-multiply" />
            </motion.div>
        </div>
      </section>

      {/* --- PROPÓSITO --- */}
      <section className="py-24 bg-wood-50 dark:bg-wood-900/50">
          <div className="max-w-4xl mx-auto px-6 text-center">
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
             >
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-accent-gold mb-6">Propósito</h2>
                <h3 className="font-serif text-4xl md:text-5xl mb-8">
                    Nuestro propósito es crear piezas que trasciendan el tiempo.
                </h3>
                <p className="text-lg font-light leading-relaxed text-wood-700 dark:text-sand-300 mb-12">
                    Diseñamos con intención, cuidando proporciones, materiales y ejecución. Cada objeto debe cumplir su función con excelencia y, al mismo tiempo, integrarse con sobriedad al entorno.
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-xl font-serif italic text-wood-900 dark:text-sand-100">
                    <span className="border-b border-accent-gold pb-1">No buscamos seguir tendencias.</span>
                    <span className="border-b border-accent-gold pb-1">Buscamos permanencia.</span>
                </div>
             </motion.div>
          </div>
      </section>

       {/* --- VISIÓN A LARGO PLAZO --- */}
       <section className="py-24 px-6 md:px-12 lg:px-24 max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
             >
                 <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-accent-gold mb-6">Visión a largo plazo</h2>
                 <p className="font-serif text-3xl md:text-4xl mb-8 leading-tight">
                    DavidSon´s Design proyecta consolidarse como una marca internacional de diseño premium.
                 </p>
                 <p className="text-wood-700 dark:text-sand-300 font-light mb-8 text-lg">
                     La evolución hacia mobiliario de mayor escala y objetos de diseño para el hogar forma parte natural de este crecimiento.
                 </p>
             </motion.div>
             <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-wood-900 text-sand-100 p-12 rounded-sm shadow-2xl relative overflow-hidden"
             >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/10 rounded-full blur-3xl" />
                 
                 <h3 className="font-serif text-2xl mb-8 text-white/90 border-b border-white/10 pb-4">Reconocida por:</h3>
                 <ul className="space-y-6">
                    {[
                        "Precisión estructural",
                        "Elegancia rústica refinada",
                        "Identidad clara y coherente",
                        "Disciplina en cada proceso"
                    ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-4 group">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                            <span className="text-lg font-light tracking-wide">{item}</span>
                        </li>
                    ))}
                 </ul>
             </motion.div>
          </div>
       </section>

      {/* --- PRINCIPIOS QUE NOS GUÍAN --- */}
      <section className="py-24 bg-black text-sand-100 px-6">
        <div className="max-w-[1440px] mx-auto">
             <div className="text-center mb-24">
                 <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-accent-gold mb-4">Valores</h2>
                 <h3 className="font-serif text-4xl md:text-5xl">Principios que nos guían</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
                 {[
                     { 
                         title: "Permanencia sobre tendencia", 
                         desc: "Diseñamos para durar, no para responder a lo efímero.",
                         icon: Anchor
                     },
                     { 
                         title: "Estructura antes que exceso", 
                         desc: "La forma sigue a la proporción y a la función.",
                         icon: Compass
                     },
                     { 
                         title: "Precisión como estándar", 
                         desc: "Cada detalle importa.",
                         icon: Target
                     },
                     { 
                         title: "Visión estratégica", 
                         desc: "El crecimiento es deliberado, estructurado y de largo plazo.",
                         icon: Globe
                     }
                 ].map((item, idx) => (
                     <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-8 border border-white/10 hover:border-accent-gold/50 transition-colors group relative"
                     >
                        <div className="absolute top-4 right-4 text-accent-gold opacity-30 group-hover:opacity-100 transition-opacity">
                            <item.icon className="w-6 h-6" />
                        </div>
                        <span className="block text-5xl font-serif text-white/10 mb-6 font-bold group-hover:text-white/20 transition-colors">0{idx + 1}</span>
                        <h4 className="font-bold text-lg mb-4 tracking-wide text-white">{item.title}</h4>
                        <p className="text-sm font-light text-white/60 leading-relaxed">{item.desc}</p>
                     </motion.div>
                 ))}
             </div>

             <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center border-t border-white/10 pt-16"
             >
                 <p className="text-3xl font-serif mb-6 italic text-white/90">DavidSon´s Design</p>
                 <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-xs uppercase tracking-[0.3em] text-accent-gold font-bold">
                     <span>Sobriedad</span>
                     <span className="hidden md:inline w-1 h-1 bg-white/30 rounded-full" />
                     <span>Precisión</span>
                     <span className="hidden md:inline w-1 h-1 bg-white/30 rounded-full" />
                     <span>Permanencia</span>
                 </div>
             </motion.div>
        </div>
      </section>

    </div>
  );
};
