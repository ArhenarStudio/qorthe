"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Phone, MapPin, Send, CheckCircle2, Clock, 
  MessageSquare, ChevronRight, AlertTriangle, X 
} from 'lucide-react';
import { toast } from 'sonner';

export const ContactPage = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setShowSuccessModal(true);
    setFormState({ name: '', email: '', subject: '', message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-wood-950 pt-32 pb-20 px-4 md:px-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-wood-900 dark:text-sand-100"
          >
            Contáctanos
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-wood-600 dark:text-wood-400 max-w-2xl mx-auto text-lg"
          >
            Estamos aquí para ayudarte. Si tienes alguna pregunta sobre nuestros productos, envíos o pedidos especiales, no dudes en escribirnos.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Contact Info & Map */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-12"
          >
            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 bg-wood-100 dark:bg-wood-900 rounded-full flex items-center justify-center shrink-0 group-hover:bg-wood-900 dark:group-hover:bg-accent-gold transition-colors duration-300">
                  <MapPin className="w-5 h-5 text-wood-900 dark:text-sand-100 group-hover:text-sand-50 dark:group-hover:text-wood-900 transition-colors" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100 mb-2">Showroom Principal</h3>
                  <p className="text-wood-600 dark:text-wood-400 leading-relaxed">
                    Av. Presidente Masaryk 450<br />
                    Polanco, Miguel Hidalgo<br />
                    11560 Ciudad de México, CDMX
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 bg-wood-100 dark:bg-wood-900 rounded-full flex items-center justify-center shrink-0 group-hover:bg-wood-900 dark:group-hover:bg-accent-gold transition-colors duration-300">
                  <Phone className="w-5 h-5 text-wood-900 dark:text-sand-100 group-hover:text-sand-50 dark:group-hover:text-wood-900 transition-colors" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100 mb-2">Atención Telefónica</h3>
                  <p className="text-wood-600 dark:text-wood-400 leading-relaxed mb-1">+52 (55) 1234 5678</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-wood-400">Lunes a Viernes: 9am - 8pm</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 bg-wood-100 dark:bg-wood-900 rounded-full flex items-center justify-center shrink-0 group-hover:bg-wood-900 dark:group-hover:bg-accent-gold transition-colors duration-300">
                  <Mail className="w-5 h-5 text-wood-900 dark:text-sand-100 group-hover:text-sand-50 dark:group-hover:text-wood-900 transition-colors" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100 mb-2">Correo Electrónico</h3>
                  <p className="text-wood-600 dark:text-wood-400 leading-relaxed">qorthedesign@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-wood-200 dark:bg-wood-800 border border-wood-300 dark:border-wood-700 group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.661642283965!2d-99.19379892416828!3d19.42702448185196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d201ff6c84c17b%3A0x868b2092f6938925!2sAv.%20Pdte.%20Masaryk%20450%2C%20Polanco%2C%20Polanco%20III%20Secc%2C%20Miguel%20Hidalgo%2C%2011560%20Ciudad%20de%20M%C3%A9xico%2C%20CDMX!5e0!3m2!1sen!2smx!4v1709923456789!5m2!1sen!2smx" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'grayscale(100%) contrast(1.2) opacity(0.8)' }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="group-hover:filter-none transition-all duration-700"
              />
              <div className="absolute inset-0 pointer-events-none border-4 border-wood-100/50 dark:border-wood-900/50 rounded-2xl"></div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-wood-900 p-8 md:p-10 rounded-3xl shadow-xl shadow-wood-900/5 dark:shadow-none border border-wood-100 dark:border-wood-800"
          >
            <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100 mb-8">Envíanos un mensaje</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-widest text-wood-900 dark:text-sand-100 ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formState.name}
                  onChange={handleInputChange}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3.5 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-wood-950 focus:border-wood-900 dark:focus:border-accent-gold focus:ring-1 focus:ring-wood-900 dark:focus:ring-accent-gold transition-all text-wood-900 dark:text-sand-50 font-medium placeholder:text-wood-400 dark:placeholder:text-wood-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-widest text-wood-900 dark:text-sand-100 ml-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formState.email}
                  onChange={handleInputChange}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full px-4 py-3.5 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-wood-950 focus:border-wood-900 dark:focus:border-accent-gold focus:ring-1 focus:ring-wood-900 dark:focus:ring-accent-gold transition-all text-wood-900 dark:text-sand-50 font-medium placeholder:text-wood-400 dark:placeholder:text-wood-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-widest text-wood-900 dark:text-sand-100 ml-1">Asunto</label>
                <select 
                  name="subject"
                  required
                  value={formState.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-wood-950 focus:border-wood-900 dark:focus:border-accent-gold focus:ring-1 focus:ring-wood-900 dark:focus:ring-accent-gold transition-all text-wood-900 dark:text-sand-50 font-medium cursor-pointer appearance-none"
                >
                  <option value="" disabled>Selecciona un tema</option>
                  <option value="orders">Estado de mi pedido</option>
                  <option value="products">Información de producto</option>
                  <option value="returns">Devoluciones y garantías</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-widest text-wood-900 dark:text-sand-100 ml-1">Mensaje</label>
                <textarea 
                  name="message"
                  required
                  rows={4}
                  value={formState.message}
                  onChange={handleInputChange}
                  placeholder="¿En qué podemos ayudarte?"
                  className="w-full px-4 py-3.5 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-wood-950 focus:border-wood-900 dark:focus:border-accent-gold focus:ring-1 focus:ring-wood-900 dark:focus:ring-accent-gold transition-all text-wood-900 dark:text-sand-50 font-medium placeholder:text-wood-400 dark:placeholder:text-wood-500 resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-wood-900 dark:bg-accent-gold text-sand-50 dark:text-wood-900 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-wood-800 dark:hover:bg-sand-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>Enviando...</>
                ) : (
                  <>Enviar Mensaje <Send className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-wood-900/60 backdrop-blur-sm z-[100]"
              onClick={() => setShowSuccessModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-md h-fit max-h-[90vh] overflow-y-auto bg-sand-50 dark:bg-wood-900 rounded-2xl shadow-2xl z-[101]"
            >
              <div className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-50">¡Mensaje Enviado!</h3>
                  <p className="text-wood-600 dark:text-wood-400 leading-relaxed">
                    Hemos recibido tu mensaje correctamente. Nuestro equipo de concierge te contactará en un plazo máximo de 24 horas.
                  </p>
                </div>

                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-3 px-6 bg-wood-900 dark:bg-accent-gold text-sand-50 dark:text-wood-900 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-wood-800 dark:hover:bg-sand-100 transition-all"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
