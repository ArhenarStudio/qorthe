"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Download, Trash2, Eye, FileText, AlertTriangle, Loader2, ExternalLink, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useLoyalty } from '@/hooks/useLoyalty';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  const { user, medusaCustomer, supabase, signOut } = useAuth();
  const { profile: loyaltyProfile, transactions: loyaltyTransactions } = useLoyalty();

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteRequested, setDeleteRequested] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // ── Real data export: collect user data and download as JSON ──
  const handleDownloadData = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para descargar tus datos');
      return;
    }

    setDownloading(true);
    try {
      // Collect data from all available sources
      const exportData: Record<string, unknown> = {
        _meta: {
          exported_at: new Date().toISOString(),
          format: 'JSON',
          source: 'DavidSon\'s Design — davidsonsdesign.com',
        },
        account: {
          email: user.email,
          created_at: user.created_at,
          last_sign_in: user.last_sign_in_at,
          email_confirmed: !!user.email_confirmed_at,
          auth_provider: user.app_metadata?.provider || 'email',
          display_name: user.user_metadata?.full_name || null,
          phone: user.user_metadata?.phone || user.phone || null,
        },
      };

      // Medusa customer data
      if (medusaCustomer) {
        exportData.customer = {
          id: medusaCustomer.id,
          first_name: medusaCustomer.first_name,
          last_name: medusaCustomer.last_name,
          email: medusaCustomer.email,
          phone: medusaCustomer.phone,
          addresses: (medusaCustomer.addresses || []).map(a => ({
            city: a.city,
            province: a.province,
            postal_code: a.postal_code,
            country_code: a.country_code,
            is_default: a.is_default_shipping,
          })),
        };
      }

      // Loyalty data
      if (loyaltyProfile) {
        exportData.loyalty = {
          tier: loyaltyProfile.current_tier,
          points_balance: loyaltyProfile.points_balance,
          lifetime_spend: loyaltyProfile.lifetime_spend,
          member_since: loyaltyProfile.created_at,
          transactions: (loyaltyTransactions || []).map(t => ({
            date: t.created_at,
            type: t.type,
            points: t.points,
            description: t.description,
          })),
        };
      }

      // Fetch orders
      try {
        const ordersRes = await fetch('/api/account/orders?limit=100');
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          exportData.orders = (ordersData.orders || []).map((o: any) => ({
            id: o.display_id || o.id,
            date: o.created_at,
            status: o.status,
            total: o.total,
            items: (o.items || []).map((i: any) => ({
              title: i.title,
              quantity: i.quantity,
              price: i.price,
            })),
          }));
        }
      } catch { /* silent — orders are optional in export */ }

      // Fetch reviews
      if (user.id) {
        try {
          const reviewsRes = await fetch(`/api/reviews?user_id=${user.id}`);
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
        } catch { /* silent */ }
      }

      // Notification preferences
      const prefs = user.user_metadata?.preferences?.notifications;
      if (prefs) {
        exportData.notification_preferences = prefs;
      }

      // Generate and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `davidsons-design-mis-datos-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Archivo descargado correctamente');
    } catch (error) {
      console.error('[Privacy] Export error:', error);
      toast.error('Error al preparar los datos. Intenta de nuevo.');
    } finally {
      setDownloading(false);
    }
  };

  // ── Real account deletion: send request via /api/contact + /api/support ──
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'ELIMINAR') {
      toast.error('Por favor escribe "ELIMINAR" para confirmar.');
      return;
    }
    if (!user?.email) {
      toast.error('No se pudo identificar tu cuenta.');
      return;
    }

    setIsDeleting(true);
    try {
      // 1. Create support ticket for account deletion
      const ticketRes = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _type: 'ticket',
          email: user.email,
          name: medusaCustomer?.first_name || user.user_metadata?.full_name || user.email.split('@')[0],
          subject: 'Solicitud de eliminación de cuenta',
          category: 'otro',
          description: `El usuario ${user.email} (ID: ${user.id}) ha solicitado la eliminación permanente de su cuenta y todos sus datos asociados. Esta solicitud fue generada desde el panel de privacidad.`,
        }),
      });

      // 2. Send notification email to admin
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Solicitud de eliminación de cuenta',
          category: 'Privacidad',
          email: user.email,
          name: medusaCustomer?.first_name || user.email.split('@')[0],
          message: `Solicitud de eliminación de cuenta:\n\nEmail: ${user.email}\nUser ID: ${user.id}\nMedusa Customer ID: ${medusaCustomer?.id || 'N/A'}\nFecha de solicitud: ${new Date().toLocaleString('es-MX')}\n\nAcción requerida: Eliminar todos los datos del usuario de Supabase, Medusa y cualquier servicio asociado.`,
        }),
      });

      setDeleteRequested(true);
      setDeleteConfirmation('');
      toast.success('Solicitud de eliminación enviada correctamente');
    } catch (error) {
      console.error('[Privacy] Delete request error:', error);
      toast.error('Error al enviar la solicitud. Intenta de nuevo o contacta soporte.');
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
                
                {/* Data Export — Real download */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-wood-900 dark:text-sand-100" />
                    <h4 className="font-medium text-wood-900 dark:text-sand-100">Descargar tus datos</h4>
                  </div>
                  <p className="text-sm text-wood-500 dark:text-wood-400">
                    Descarga una copia de todos los datos personales que almacenamos: cuenta, pedidos, direcciones, puntos de lealtad y reseñas.
                  </p>
                  <button 
                    onClick={handleDownloadData}
                    disabled={downloading}
                    className="text-sm font-medium text-wood-900 dark:text-sand-100 border border-wood-200 dark:border-wood-700 px-4 py-2.5 rounded-lg hover:bg-wood-50 dark:hover:bg-wood-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Preparando...</>
                    ) : (
                      <><FileText className="w-4 h-4" /> Descargar archivo JSON</>
                    )}
                  </button>
                </div>

                <div className="h-px bg-wood-100 dark:bg-wood-800" />

                {/* Policies — Real links */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-wood-900 dark:text-sand-100" />
                    <h4 className="font-medium text-wood-900 dark:text-sand-100">Políticas de privacidad</h4>
                  </div>
                  <p className="text-sm text-wood-500 dark:text-wood-400">
                    Consulta cómo manejamos tus datos personales y las cookies que utilizamos.
                  </p>
                  <div className="flex flex-col gap-2">
                    <a 
                      href="/privacy-policy"
                      target="_blank"
                      className="text-sm font-medium text-wood-600 dark:text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 flex items-center gap-2 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Política de privacidad
                    </a>
                    <a 
                      href="/cookies-policy"
                      target="_blank"
                      className="text-sm font-medium text-wood-600 dark:text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 flex items-center gap-2 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Política de cookies
                    </a>
                  </div>
                </div>

                <div className="h-px bg-wood-100 dark:bg-wood-800" />

                {/* Account Deletion — Real request via support ticket + email */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <h4 className="font-medium">Eliminar cuenta</h4>
                  </div>

                  {deleteRequested ? (
                    /* Success state after request submitted */
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-lg p-5 space-y-3">
                      <div className="flex gap-3 items-start">
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-emerald-800 dark:text-emerald-200 text-sm">Solicitud recibida</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-1 leading-relaxed">
                            Tu solicitud de eliminación de cuenta ha sido enviada a nuestro equipo de soporte. 
                            Procesaremos la eliminación dentro de los próximos 5 días hábiles y te confirmaremos por email a <span className="font-medium">{user?.email}</span>.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Deletion form */
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg p-4 space-y-4">
                      <div className="flex gap-3">
                        <Trash2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-700 dark:text-red-400 text-sm">Solicitar eliminación permanente</p>
                          <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1 leading-relaxed">
                            Se enviará una solicitud a nuestro equipo para eliminar tu cuenta, historial de pedidos, direcciones, puntos de lealtad y reseñas. Este proceso es irreversible.
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-red-100/50 dark:bg-red-900/20 rounded-lg flex items-start gap-2">
                        <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 dark:text-red-300">
                          Si tienes pedidos pendientes de entrega, te recomendamos esperar a recibirlos antes de solicitar la eliminación.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-red-700 dark:text-red-400 uppercase">
                          Escribe &quot;ELIMINAR&quot; para confirmar
                        </label>
                        <input 
                          type="text"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value.toUpperCase())}
                          placeholder="ELIMINAR"
                          className="w-full bg-white dark:bg-wood-900 border border-red-200 dark:border-red-900/30 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500 text-wood-900 dark:text-sand-100"
                        />
                      </div>

                      <button 
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmation !== 'ELIMINAR' || isDeleting}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isDeleting ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Enviando solicitud...</>
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
