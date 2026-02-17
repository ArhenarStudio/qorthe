import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Phone, Loader2, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface CommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunicationModal: React.FC<CommunicationModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    phone: ''
  });
  const [originalEmail, setOriginalEmail] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen]);

  const fetchUserData = async () => {
    try {
      setInitialLoading(true);
      const supabase = createClient();
      if (!supabase) throw new Error('Auth no disponible');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData({
          email: user.email || '',
          phone: user.user_metadata?.phone || ''
        });
        setOriginalEmail(user.email || '');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('No se pudo cargar la información del usuario');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error('Auth no disponible');
      const updates: any = {
        data: { phone: formData.phone }
      };

      let emailChanged = false;
      if (formData.email !== originalEmail) {
        updates.email = formData.email;
        emailChanged = true;
      }

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      if (emailChanged) {
        toast.info('Se ha enviado un correo de confirmación a tu nueva dirección. Por favor verifica ambos correos para completar el cambio.', {
          duration: 6000,
        });
      } else {
        toast.success('Información de contacto actualizada');
      }
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Error al actualizar el perfil');
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
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100">Comunicación</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-wood-500 hover:text-wood-900 dark:hover:text-sand-100 transition-colors rounded-full hover:bg-wood-200/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {initialLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-wood-300" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-200/80 leading-relaxed">
                      Si cambias tu dirección de correo electrónico, deberás confirmar el cambio tanto en tu correo actual como en el nuevo para mantener tu cuenta segura.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-wood-500 ml-1">Correo Electrónico</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400 group-focus-within:text-wood-900 dark:group-focus-within:text-sand-100 transition-colors" />
                      <input 
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg py-3 pl-10 pr-4 text-wood-900 dark:text-sand-100 outline-none focus:border-wood-900 dark:focus:border-sand-100 focus:ring-1 focus:ring-wood-900 dark:focus:ring-sand-100 transition-all placeholder:text-wood-300 dark:placeholder:text-wood-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-wood-500 ml-1">Teléfono de Contacto</label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400 group-focus-within:text-wood-900 dark:group-focus-within:text-sand-100 transition-colors" />
                      <input 
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg py-3 pl-10 pr-4 text-wood-900 dark:text-sand-100 outline-none focus:border-wood-900 dark:focus:border-sand-100 focus:ring-1 focus:ring-wood-900 dark:focus:ring-sand-100 transition-all placeholder:text-wood-300 dark:placeholder:text-wood-600"
                        placeholder="+34 600 000 000"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 py-3 rounded-lg font-medium hover:bg-wood-800 dark:hover:bg-sand-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-wood-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Guardar Cambios
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
