"use client";

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight, Home, Package } from 'lucide-react';

import { useRouter } from 'next/navigation';
const logoDSD = '/images/logo-dsd.png';

export const CheckoutSuccessPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Clear cart or any temporary state here
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-sand-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full border border-wood-900 animate-spin-slow" style={{ animationDuration: '30s' }}></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full border border-wood-900 animate-spin-slow" style={{ animationDuration: '40s', animationDirection: 'reverse' }}></div>
      </div>

      {/* Logo */}
      <motion.img 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        src={logoDSD}
        alt="DavidSon's Design"
        className="h-16 w-auto mb-8 relative z-10 drop-shadow-md"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="w-full max-w-2xl bg-white relative z-10 shadow-2xl p-8 md:p-12 text-center border-t-4 border-wood-900"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-green-800">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <Check className="w-10 h-10" strokeWidth={3} />
          </motion.div>
        </div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl md:text-5xl font-serif text-wood-900 mb-6"
        >
          ¡Gracias por tu compra!
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-wood-600 text-lg mb-8 max-w-lg mx-auto leading-relaxed"
        >
          Tu pedido ha sido confirmado y está siendo preparado con el cuidado que merece nuestra madera.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-sand-50 p-6 rounded-lg mb-10 border border-wood-100 inline-block text-left w-full max-w-md"
        >
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-wood-200">
            <span className="text-sm text-wood-500 uppercase tracking-wider font-medium">Orden #</span>
            <span className="text-lg font-bold text-wood-900">DSD-8921</span>
          </div>
          <div className="flex items-start gap-3 text-wood-700 mb-2">
            <Package className="w-5 h-5 text-wood-400 mt-0.5" />
            <p className="text-sm">Recibirás un correo con el número de rastreo cuando tu paquete esté en camino.</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col md:flex-row gap-4 justify-center"
        >
          <button 
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 bg-wood-900 text-sand-100 px-8 py-4 rounded-sm hover:bg-wood-800 transition-colors uppercase tracking-widest text-sm font-bold"
          >
            <Home className="w-4 h-4" />
            Volver al Inicio
          </button>
          
          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-white border border-wood-200 text-wood-900 px-8 py-4 rounded-sm hover:bg-sand-50 transition-colors uppercase tracking-widest text-sm font-bold"
          >
            Imprimir Recibo
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
};
