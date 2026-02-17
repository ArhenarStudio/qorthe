import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Download, Trash2, Eye, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleDownloadData = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Preparando archivo de datos...',
        success: 'Tus datos han sido enviados a tu correo electrónico.',
        error: 'Error al generar el archivo.',
      }
    );
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'ELIMINAR') {
      toast.error('Por favor escribe "ELIMINAR" para confirmar.');
      return;
    }

    setIsDeleting(true);
    try {
      // In a real app, this would call a Supabase Function to handle cleanup
      // await supabase.functions.invoke('delete-user-account');
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Tu cuenta ha sido programada para eliminación.');
      onClose();
      // Optional: signOut()
    } catch (error) {
      toast.error('Error al procesar la solicitud.');
    } finally {
      setIsDeleting(false);
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
            className="relative w-full max-w-md bg-white dark:bg-wood-900 shadow-2xl overflow-hidden rounded-xl border border-wood-100 dark:border-wood-800 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-wood-100 dark:border-wood-800 flex items-center justify-between bg-wood-50/50 dark:bg-wood-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-lg">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100">Privacidad</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-wood-500 hover:text-wood-900 dark:hover:text-sand-100 transition-colors rounded-full hover:bg-wood-200/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto">
              <div className="space-y-8">
                
                {/* Data Export */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-wood-900 dark:text-sand-100" />
                    <h4 className="font-medium text-wood-900 dark:text-sand-100">Tus Datos</h4>
                  </div>
                  <p className="text-sm text-wood-500 dark:text-wood-400">
                    Puedes solicitar una copia de todos los datos personales que almacenamos sobre ti.
                  </p>
                  <button 
                    onClick={handleDownloadData}
                    className="text-sm font-medium text-wood-900 dark:text-sand-100 border border-wood-200 dark:border-wood-700 px-4 py-2 rounded-lg hover:bg-wood-50 dark:hover:bg-wood-800 transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Solicitar Archivo
                  </button>
                </div>

                <div className="h-px bg-wood-100 dark:bg-wood-800" />

                {/* Cookie Preferences (Static Placeholder) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-wood-900 dark:text-sand-100" />
                    <h4 className="font-medium text-wood-900 dark:text-sand-100">Visibilidad y Cookies</h4>
                  </div>
                  <p className="text-sm text-wood-500 dark:text-wood-400">
                    Gestiona cómo utilizamos las cookies y tecnologías similares para personalizar tu experiencia.
                  </p>
                  <button 
                    className="text-sm font-medium text-wood-600 dark:text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 underline underline-offset-4"
                  >
                    Gestionar preferencias de cookies
                  </button>
                </div>

                <div className="h-px bg-wood-100 dark:bg-wood-800" />

                {/* Danger Zone */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <h4 className="font-medium">Zona de Peligro</h4>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg p-4 space-y-4">
                    <div className="flex gap-3">
                      <Trash2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-700 dark:text-red-400 text-sm">Eliminar Cuenta</p>
                        <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                          Esta acción es irreversible. Todos tus datos, historial de pedidos y preferencias serán eliminados permanentemente.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-red-700 dark:text-red-400 uppercase">
                        Escribe "ELIMINAR" para confirmar
                      </label>
                      <input 
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="ELIMINAR"
                        className="w-full bg-white dark:bg-wood-900 border border-red-200 dark:border-red-900/30 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <button 
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmation !== 'ELIMINAR' || isDeleting}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar mi cuenta permanentemente'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
