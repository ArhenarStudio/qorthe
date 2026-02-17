"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { API_BASE_URL } from '@/utils/api';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        // Register logic via Server Function
        const response = await fetch(`${API_BASE_URL}/signup`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok || data.error) {
          throw new Error(data.error || 'Error al registrar usuario');
        }
        
        toast.success('Cuenta creada exitosamente. Por favor inicia sesión.');
        setIsRegister(false);
      } else {
        // Login logic via Supabase Client
        // Special logic for "Admin" username alias
        let loginEmail = formData.email;
        if (loginEmail.trim().toLowerCase() === 'admin') {
           loginEmail = 'admin@davidsonsdesign.com';
        }

        const supabase = createClient();
        if (!supabase) throw new Error('Auth no disponible');
        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: formData.password
        });

        if (error) throw error;
        
        toast.success('Bienvenido de nuevo');
        onClose();
        
        // Optional: Reload to refresh state if using context extensively
        // window.location.reload(); 
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-wood-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md bg-sand-100 shadow-2xl overflow-hidden rounded-sm border border-wood-900/10"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-wood-500 hover:text-wood-900 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col">
              {/* Header */}
              <div className="px-8 pt-10 pb-6 text-center">
                <h2 className="text-3xl font-serif text-wood-900 mb-2 font-['Playfair_Display']">
                  {isRegister ? 'Crear Cuenta' : 'Bienvenido'}
                </h2>
                <p className="text-wood-600 text-sm">
                  {isRegister 
                    ? 'Únete a DavidSon\'s Design para una experiencia personalizada.' 
                    : 'Ingresa a tu cuenta para gestionar tus pedidos.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-5">
                
                {isRegister && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-wood-500 ml-1">Nombre Completo</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400 group-focus-within:text-wood-900 transition-colors" />
                      <input 
                        type="text"
                        name="name"
                        required={isRegister}
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-white border border-wood-200 rounded-lg py-3 pl-10 pr-4 text-wood-900 outline-none focus:border-wood-900 focus:ring-1 focus:ring-wood-900 transition-all placeholder:text-wood-300"
                        placeholder="Ej. Juan Pérez"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-wood-500 ml-1">
                    {isRegister ? "Correo Electrónico" : "Correo o Usuario"}
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400 group-focus-within:text-wood-900 transition-colors" />
                    <input 
                      type={isRegister ? "email" : "text"}
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white border border-wood-200 rounded-lg py-3 pl-10 pr-4 text-wood-900 outline-none focus:border-wood-900 focus:ring-1 focus:ring-wood-900 transition-all placeholder:text-wood-300"
                      placeholder={isRegister ? "nombre@ejemplo.com" : "nombre@ejemplo.com o 'Admin'"}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between ml-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-wood-500">Contraseña</label>
                    {!isRegister && (
                      <button type="button" className="text-xs text-wood-600 hover:text-wood-900 underline">
                        ¿Olvidaste tu contraseña?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400 group-focus-within:text-wood-900 transition-colors" />
                    <input 
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-white border border-wood-200 rounded-lg py-3 pl-10 pr-4 text-wood-900 outline-none focus:border-wood-900 focus:ring-1 focus:ring-wood-900 transition-all placeholder:text-wood-300"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-wood-900 text-sand-100 py-3 rounded-lg font-medium hover:bg-wood-800 transition-all duration-300 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-wood-900/10"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-wood-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-sand-100 px-2 text-wood-500 uppercase tracking-widest">O continúa con</span>
                  </div>
                </div>

                {/* Social Login Placeholder */}
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" className="flex items-center justify-center py-2.5 border border-wood-200 rounded-lg hover:bg-white hover:border-wood-300 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  </button>
                  <button type="button" className="flex items-center justify-center py-2.5 border border-wood-200 rounded-lg hover:bg-white hover:border-wood-300 transition-colors">
                     <svg className="w-5 h-5 text-wood-900" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                     </svg>
                  </button>
                </div>

                {/* Footer Toggle */}
                <div className="text-center pt-2">
                  <p className="text-sm text-wood-600">
                    {isRegister ? '¿Ya tienes una cuenta?' : '¿Aún no eres miembro?'}
                    <button 
                      type="button"
                      onClick={() => setIsRegister(!isRegister)}
                      className="ml-2 font-bold text-wood-900 hover:text-accent-gold transition-colors underline decoration-wood-900/30 underline-offset-4"
                    >
                      {isRegister ? 'Inicia Sesión' : 'Regístrate'}
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
