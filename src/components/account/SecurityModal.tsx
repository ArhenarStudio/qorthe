"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error('Auth no disponible');
      const { error } = await supabase.auth.updateUser({ 
        password: formData.password 
      });

      if (error) throw error;

      toast.success('Contraseña actualizada correctamente');
      setFormData({ password: '', confirmPassword: '' });
      onClose();
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-wood-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md bg-white dark:bg-wood-900 shadow-2xl overflow-hidden rounded-xl border border-wood-100 dark:border-wood-800 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-wood-100 dark:border-wood-800 flex items-center justify-between bg-wood-50/50 dark:bg-wood-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100">Seguridad</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-wood-500 hover:text-wood-900 dark:hover:text-sand-100 transition-colors rounded-full hover:bg-wood-200/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              
              {/* Password Change Section */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-wood-400" />
                  <h4 className="font-medium text-wood-900 dark:text-sand-100">Cambiar Contraseña</h4>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-wood-500 ml-1">Nueva Contraseña</label>
                    <div className="relative group">
                      <input 
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg py-3 pl-4 pr-10 text-wood-900 dark:text-sand-100 outline-none focus:border-wood-900 dark:focus:border-sand-100 focus:ring-1 focus:ring-wood-900 dark:focus:ring-sand-100 transition-all placeholder:text-wood-300 dark:placeholder:text-wood-600"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-wood-400 hover:text-wood-600 dark:hover:text-sand-200 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-wood-500 ml-1">Confirmar Contraseña</label>
                    <div className="relative group">
                      <input 
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg py-3 pl-4 pr-10 text-wood-900 dark:text-sand-100 outline-none focus:border-wood-900 dark:focus:border-sand-100 focus:ring-1 focus:ring-wood-900 dark:focus:ring-sand-100 transition-all placeholder:text-wood-300 dark:placeholder:text-wood-600"
                        placeholder="Repite la nueva contraseña"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={loading || !formData.password || !formData.confirmPassword}
                    className="w-full bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 py-3 rounded-lg font-medium hover:bg-wood-800 dark:hover:bg-sand-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-wood-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Actualizar Contraseña
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="h-px bg-wood-100 dark:bg-wood-800 w-full" />

              {/* 2FA Placeholder / Info */}
              <div className="space-y-3 opacity-70 hover:opacity-100 transition-opacity">
                 <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-medium text-wood-900 dark:text-sand-100">Autenticación de Dos Factores</h4>
                    </div>
                    <span className="text-xs bg-wood-100 dark:bg-wood-800 text-wood-500 px-2 py-1 rounded">Próximamente</span>
                 </div>
                 <p className="text-sm text-wood-500 dark:text-wood-400 leading-relaxed">
                   Protege tu cuenta añadiendo una capa extra de seguridad. Te avisaremos cuando esta función esté disponible.
                 </p>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
