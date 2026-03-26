"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Download, Trash2, Eye, FileText, AlertTriangle, Loader2, CheckCircle, ExternalLink, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  const { user, session, medusaCustomer, supabase, signOut } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // ── Export real user data as JSON file ──
  const handleDownloadData = async () => {
    if (!user || !session) {
      toast.error('Debes iniciar sesión para exportar tus datos');
      return;
    }

    setIsExporting(true);
    setExportComplete(false);

    try {
      const exportData: Record<string, unknown> = {
        _meta: {
          exported_at: new Date().toISOString(),
          platform: "Qorthe",
          user_id: user.id,
        },
        profile: {
          email: user.email,
          name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          phone: user.phone || null,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_confirmed_at: user.email_confirmed_at,
          auth_provider: user.app_metadata?.provider || 'email',
        },
      };

      // Medusa customer data (if linked)
      if (medusaCustomer) {
        exportData.commerce_profile = {
          id: medusaCustomer.id,
          first_name: medusaCustomer.first_name,
          last_name: medusaCustomer.last_name,
          email: medusaCustomer.email,
          phone: medusaCustomer.phone,
        };
        exportData.addresses = medusaCustomer.addresses?.map(a => ({
          id: a.id,
          name: `${a.first_name} ${a.last_name}`.trim(),
          address: a.address_1,
          address_2: a.address_2,
          city: a.city,
          province: a.province,
          postal_code: a.postal_code,
          country_code: a.country_code,
          phone: a.phone,
        })) || [];
      }

      // Fetch orders
      try {
        const ordersRes = await fetch('/api/account/orders?limit=100', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          exportData.orders = (ordersData.orders || []).map((o: any) => ({
            id: o.id,
            display_id: o.display_id,
            date: o.created_at,
            status: o.status,
            total: o.total,
            items: o.items?.map((i: any) => ({ title: i.title, quantity: i.quantity, price: i.price })) || [],
          }));
        }
      } catch { /* non-blocking */ }

      // Fetch loyalty
      try {
        const loyaltyRes = await fetch(`/api/loyalty?user_id=${user.id}`);
        if (loyaltyRes.ok) {
          const loyaltyData = await loyaltyRes.json();
          exportData.loyalty = {
            tier: loyaltyData.profile?.tier || 'pino',
            points_balance: loyaltyData.profile?.points || 0,
            lifetime_spend: loyaltyData.profile?.lifetime_spend || 0,
            transactions: (loyaltyData.transactions || []).map((t: any) => ({
              date: t.created_at,
              type: t.type,
              points: t.points,
              description: t.description,
            })),
          };
        }
      } catch { /* non-blocking */ }

      // Fetch reviews
      try {
        const reviewsRes = await fetch(`/api/reviews?user_id=${user.id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          exportData.reviews = (reviewsData.reviews || []).map((r: any) => ({
            product: r.product_title,
            rating: r.rating,
            title: r.title,
            body: r.body,
            date: r.created_at,
            status: r.status,
          }));
        }
      } catch { /* non-blocking */ }

      // Fetch wishlist
      try {
        const wishlistRes = await fetch('/api/account/wishlist', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (wishlistRes.ok) {
          const wishlistData = await wishlistRes.json();
          exportData.wishlist = (wishlistData.items || []).map((w: any) => ({
            product_id: w.product_id,
            product_title: w.product_title,
            added_at: w.created_at,
          }));
        }
      } catch { /* non-blocking */ }

      // Notification preferences
      exportData.preferences = {
        notifications: user.user_metadata?.preferences?.notifications || {},
        theme: user.user_metadata?.preferences?.theme || 'system',
      };

      // Generate and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qorthe-mis-datos-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportComplete(true);
      toast.success('Archivo descargado correctamente');
    } catch (error: any) {
      console.error('[Privacy] Export error:', error);
      toast.error('Error al generar el archivo de datos');
    } finally {
      setIsExporting(false);
    }
  };

  // ── Request account deletion via support contact ──
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'ELIMINAR') {
      toast.error('Por favor escribe "ELIMINAR" para confirmar.');
      return;
    }

    if (!user?.email) {
      toast.error('No se pudo identificar tu cuenta');
      return;
    }

    setIsRequestingDeletion(true);

    try {
      // Send deletion request via existing contact API
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: medusaCustomer?.first_name || user.user_metadata?.full_name || user.email.split('@')[0],
          email: user.email,
          subject: `Solicitud de eliminación de cuenta — ${user.email}`,
          message: `El usuario ${user.email} (ID: ${user.id}) ha solicitado la eliminación permanente de su cuenta y todos sus datos asociados desde el panel de privacidad. Por favor procesar esta solicitud dentro de los próximos 30 días conforme a la política de privacidad.`,
          category: 'account_deletion',
        }),
      });

      if (res.ok) {
        setDeletionRequested(true);
        toast.success('Solicitud de eliminación enviada');
      } else {
        // Fallback: even if API fails, notify user of alternative
        toast.error('No se pudo enviar la solicitud. Contacta a qorthedesign@gmail.com');
      }
    } catch (error) {
      console.error('[Privacy] Deletion request error:', error);
      toast.error('Error de conexión. Contacta a qorthedesign@gmail.com');
    } finally {
      setIsRequestingDeletion(false);
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
                
                {/* ── Data Export — Real download ── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-wood-900 dark:text-sand-100" />
                    <h4 className="font-medium text-wood-900 dark:text-sand-100">Tus Datos</h4>
                  </div>
                  <p className="text-sm text-wood-500 dark:text-wood-400">
                    Descarga una copia de todos tus datos personales: perfil, pedidos, direcciones, puntos de lealtad, reseñas y lista de deseos.
                  </p>

                  {exportComplete ? (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        Archivo descargado. Revisa tu carpeta de descargas.
                      </p>
                    </div>
                  ) : (
                    <button 
                      onClick={handleDownloadData}
                      disabled={isExporting || !user}
                      className="text-sm font-medium text-wood-900 dark:text-sand-100 border border-wood-200 dark:border-wood-700 px-4 py-2.5 rounded-lg hover:bg-wood-50 dark:hover:bg-wood-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Recopilando datos...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Descargar mis datos (JSON)
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="h-px bg-wood-100 dark:bg-wood-800" />

                {/* ── Cookies & Privacy — Link to real policy ── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-wood-900 dark:text-sand-100" />
                    <h4 className="font-medium text-wood-900 dark:text-sand-100">Privacidad y Cookies</h4>
                  </div>
                  <p className="text-sm text-wood-500 dark:text-wood-400">
                    Consulta cómo recopilamos y utilizamos tu información. Puedes ejercer tus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) contactándonos directamente.
                  </p>
                  <div className="flex flex-col gap-2">
                    <a 
                      href="/privacy-policy" 
                      target="_blank"
                      className="text-sm font-medium text-wood-600 dark:text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Aviso de Privacidad
                    </a>
                    <a 
                      href="/cookies-policy" 
                      target="_blank"
                      className="text-sm font-medium text-wood-600 dark:text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Política de Cookies
                    </a>
                  </div>
                </div>

                <div className="h-px bg-wood-100 dark:bg-wood-800" />

                {/* ── Danger Zone — Real deletion request ── */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <h4 className="font-medium">Zona de Peligro</h4>
                  </div>
                  
                  {deletionRequested ? (
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg p-5 space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800 dark:text-amber-300 text-sm">Solicitud enviada</p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1.5 leading-relaxed">
                            Tu solicitud de eliminación ha sido enviada a nuestro equipo. Procesaremos tu petición dentro de los próximos 30 días y te notificaremos por email a <span className="font-medium">{user?.email}</span>.
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
                            Si necesitas asistencia adicional, contacta a <span className="font-medium">qorthedesign@gmail.com</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg p-4 space-y-4">
                      <div className="flex gap-3">
                        <Trash2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-700 dark:text-red-400 text-sm">Solicitar Eliminación de Cuenta</p>
                          <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1 leading-relaxed">
                            Al solicitar la eliminación, nuestro equipo revisará y procesará la petición. Todos tus datos personales, historial de pedidos, puntos de lealtad y preferencias serán eliminados permanentemente.
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
                          className="w-full bg-white dark:bg-wood-900 border border-red-200 dark:border-red-900/30 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500 text-wood-900 dark:text-sand-100"
                        />
                      </div>

                      <button 
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmation !== 'ELIMINAR' || isRequestingDeletion}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isRequestingDeletion ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Enviando solicitud...
                          </>
                        ) : (
                          'Solicitar eliminación de cuenta'
                        )}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
