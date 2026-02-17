"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Loader2, Save, ShoppingBag, Tag, Shield, Mail } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationPreferences {
  orders: boolean;
  promotions: boolean;
  security: boolean;
  newsletter: boolean;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    orders: true,
    promotions: false,
    security: true,
    newsletter: false
  });

  useEffect(() => {
    if (isOpen) {
      fetchPreferences();
    }
  }, [isOpen]);

  const fetchPreferences = async () => {
    try {
      setInitialLoading(true);
      const supabase = createClient();
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.preferences?.notifications) {
        setPreferences(user.user_metadata.preferences.notifications);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      // Don't show error toast on load to avoid spamming if just no prefs exist
    } finally {
      setInitialLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error('Auth no disponible');
      const { data: { user } } = await supabase.auth.getUser();
      
      const currentMetadata = user?.user_metadata || {};
      const currentPreferences = currentMetadata.preferences || {};

      const { error } = await supabase.auth.updateUser({
        data: {
          preferences: {
            ...currentPreferences,
            notifications: preferences
          }
        }
      });

      if (error) throw error;

      toast.success('Preferencias de notificaciones actualizadas');
      onClose();
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast.error(error.message || 'Error al guardar cambios');
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
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100">Notificaciones</h3>
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    
                    {/* Orders */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-wood-100 dark:border-wood-800 hover:bg-wood-50 dark:hover:bg-wood-800/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <ShoppingBag className="w-5 h-5 text-wood-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-wood-900 dark:text-sand-100 text-sm">Mis Pedidos</p>
                          <p className="text-xs text-wood-500 dark:text-wood-400">Actualizaciones sobre estado de envíos</p>
                        </div>
                      </div>
                      <Switch.Root 
                        checked={preferences.orders}
                        onCheckedChange={() => handleToggle('orders')}
                        className="w-[42px] h-[25px] bg-wood-200 dark:bg-wood-700 rounded-full relative shadow-inner data-[state=checked]:bg-wood-900 dark:data-[state=checked]:bg-sand-100 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-wood-900 dark:focus:ring-sand-200"
                      >
                        <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-sm transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                      </Switch.Root>
                    </div>

                    {/* Promotions */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-wood-100 dark:border-wood-800 hover:bg-wood-50 dark:hover:bg-wood-800/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <Tag className="w-5 h-5 text-wood-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-wood-900 dark:text-sand-100 text-sm">Promociones</p>
                          <p className="text-xs text-wood-500 dark:text-wood-400">Descuentos exclusivos y ofertas</p>
                        </div>
                      </div>
                      <Switch.Root 
                        checked={preferences.promotions}
                        onCheckedChange={() => handleToggle('promotions')}
                        className="w-[42px] h-[25px] bg-wood-200 dark:bg-wood-700 rounded-full relative shadow-inner data-[state=checked]:bg-wood-900 dark:data-[state=checked]:bg-sand-100 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-wood-900 dark:focus:ring-sand-200"
                      >
                        <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-sm transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                      </Switch.Root>
                    </div>

                    {/* Newsletter */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-wood-100 dark:border-wood-800 hover:bg-wood-50 dark:hover:bg-wood-800/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-wood-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-wood-900 dark:text-sand-100 text-sm">Newsletter</p>
                          <p className="text-xs text-wood-500 dark:text-wood-400">Novedades de la colección y blog</p>
                        </div>
                      </div>
                      <Switch.Root 
                        checked={preferences.newsletter}
                        onCheckedChange={() => handleToggle('newsletter')}
                        className="w-[42px] h-[25px] bg-wood-200 dark:bg-wood-700 rounded-full relative shadow-inner data-[state=checked]:bg-wood-900 dark:data-[state=checked]:bg-sand-100 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-wood-900 dark:focus:ring-sand-200"
                      >
                        <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-sm transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                      </Switch.Root>
                    </div>

                    {/* Security */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-wood-100 dark:border-wood-800 hover:bg-wood-50 dark:hover:bg-wood-800/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-wood-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-wood-900 dark:text-sand-100 text-sm">Seguridad</p>
                          <p className="text-xs text-wood-500 dark:text-wood-400">Alertas de inicio de sesión sospechoso</p>
                        </div>
                      </div>
                      <Switch.Root 
                        checked={preferences.security}
                        disabled={true} // Usually enforced
                        className="w-[42px] h-[25px] bg-wood-200/50 dark:bg-wood-700/50 rounded-full relative shadow-inner data-[state=checked]:bg-wood-900/50 dark:data-[state=checked]:bg-sand-100/50 transition-colors cursor-not-allowed opacity-70"
                      >
                        <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-sm transition-transform duration-100 translate-x-[19px]" />
                      </Switch.Root>
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
                          Guardar Preferencias
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
