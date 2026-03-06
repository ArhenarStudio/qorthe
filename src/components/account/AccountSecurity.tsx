"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, Key, Smartphone, Globe, Clock, 
  CheckCircle, Eye, EyeOff, Loader2, Info, Monitor, Mail, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// ── Helpers ──

function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getAuthProvider(user: any): string {
  if (!user) return 'Desconocido';
  const provider = user.app_metadata?.provider;
  if (provider === 'google') return 'Google';
  if (provider === 'github') return 'GitHub';
  if (provider === 'apple') return 'Apple';
  return 'Email y contraseña';
}

function getPasswordStrength(password: string): { label: string; color: string; percent: number } {
  if (password.length === 0) return { label: '', color: '', percent: 0 };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: 'Débil', color: 'bg-red-500', percent: 20 };
  if (score <= 2) return { label: 'Regular', color: 'bg-amber-500', percent: 40 };
  if (score <= 3) return { label: 'Buena', color: 'bg-yellow-500', percent: 60 };
  if (score <= 4) return { label: 'Fuerte', color: 'bg-emerald-500', percent: 80 };
  return { label: 'Excelente', color: 'bg-emerald-600', percent: 100 };
}

// ── Component ──

export const AccountSecurity = () => {
  const { user, supabase } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  // ── Real session data derived from Supabase user ──
  const authProvider = getAuthProvider(user);
  const lastSignIn = formatDateTime(user?.last_sign_in_at);
  const accountCreated = formatDateTime(user?.created_at);
  const userEmail = user?.email || '—';
  const emailConfirmed = !!user?.email_confirmed_at;
  const isOAuthUser = authProvider !== 'Email y contraseña';

  // ── Password update handler (already production-ready) ──
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!supabase) {
      toast.error('Servicio de autenticación no disponible');
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message || 'Error al actualizar contraseña');
      } else {
        toast.success('Contraseña actualizada correctamente');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error inesperado');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100 mb-1 flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent-gold" /> Seguridad de la Cuenta
          </h2>
          <p className="text-sm text-wood-500 dark:text-wood-400">Gestiona tu contraseña y protege tu acceso.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ── Left Column: Password & 2FA ── */}
        <div className="space-y-8">
          
          {/* Change Password */}
          <section className="bg-white dark:bg-wood-900 rounded-2xl p-6 md:p-8 border border-wood-100 dark:border-wood-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-wood-50 dark:bg-wood-800 rounded-bl-[100px] -mr-4 -mt-4 opacity-50" />
            
            <h3 className="text-lg font-medium text-wood-900 dark:text-sand-100 mb-6 flex items-center gap-2 relative z-10">
              <Key className="w-4 h-4 text-wood-400" /> Cambiar Contraseña
            </h3>

            {isOAuthUser && (
              <div className="relative z-10 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Cuenta vinculada con {authProvider}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    Tu acceso se gestiona a través de {authProvider}. Puedes agregar una contraseña adicional como método de respaldo.
                  </p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleUpdatePassword} className="space-y-4 relative z-10">
              {!isOAuthUser && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-wood-500 mb-2">Contraseña Actual</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-wood-900 dark:text-sand-100 text-sm focus:ring-2 focus:ring-accent-gold/50 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-wood-500 mb-2">Nueva Contraseña</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-wood-900 dark:text-sand-100 text-sm focus:ring-2 focus:ring-accent-gold/50 outline-none pr-10"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-wood-400 hover:text-wood-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-wood-500 mb-2">Confirmar</label>
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-wood-900 dark:text-sand-100 text-sm focus:ring-2 focus:ring-accent-gold/50 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Password strength indicator */}
              {newPassword.length > 0 && (
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full bg-wood-100 dark:bg-wood-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength.percent}%` }}
                      className={`h-full rounded-full ${passwordStrength.color} transition-all`}
                    />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-wood-400">
                    Fortaleza: <span className={passwordStrength.percent >= 60 ? 'text-emerald-600' : passwordStrength.percent >= 40 ? 'text-amber-600' : 'text-red-600'}>{passwordStrength.label}</span>
                  </p>
                </div>
              )}

              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <p className={`text-xs flex items-center gap-1 ${newPassword === confirmPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                  {newPassword === confirmPassword 
                    ? <><CheckCircle className="w-3 h-3" /> Las contraseñas coinciden</>
                    : 'Las contraseñas no coinciden'
                  }
                </p>
              )}

              <div className="pt-2 flex justify-end">
                <button 
                  type="submit"
                  disabled={(!isOAuthUser && !currentPassword) || !newPassword || newPassword !== confirmPassword || newPassword.length < 8 || updatingPassword}
                  className="px-6 py-3 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updatingPassword && <Loader2 className="w-3 h-3 animate-spin" />}
                  {updatingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          </section>

          {/* 2FA Section — Honest "Coming Soon" */}
          <section className="bg-white dark:bg-wood-900 rounded-2xl p-6 md:p-8 border border-wood-100 dark:border-wood-800 shadow-sm">
             <div className="flex items-start justify-between">
               <div>
                 <h3 className="text-lg font-medium text-wood-900 dark:text-sand-100 mb-2 flex items-center gap-2">
                   <Smartphone className="w-4 h-4 text-wood-400" /> Autenticación en dos pasos (2FA)
                 </h3>
                 <p className="text-sm text-wood-500 dark:text-wood-400 max-w-sm leading-relaxed">
                   Añade una capa extra de seguridad requiriendo un código de tu aplicación autenticadora al iniciar sesión.
                 </p>
               </div>
               
               {/* Disabled toggle with "Próximamente" badge */}
               <div className="flex flex-col items-end gap-1.5">
                 <button 
                   disabled
                   className="relative inline-flex h-7 w-12 items-center rounded-full bg-wood-200 dark:bg-wood-700 cursor-not-allowed opacity-60"
                 >
                   <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-1" />
                 </button>
                 <span className="text-[9px] font-bold uppercase tracking-widest text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded-full">
                   Próximamente
                 </span>
               </div>
             </div>

             <div className="mt-6 p-4 bg-wood-50 dark:bg-wood-800/50 border border-wood-100 dark:border-wood-700 rounded-xl flex items-start gap-3">
               <Info className="w-5 h-5 text-wood-400 shrink-0 mt-0.5" />
               <div>
                 <p className="text-sm text-wood-600 dark:text-sand-300">
                   Estamos implementando la autenticación de dos factores con aplicaciones como Google Authenticator y Authy. Te notificaremos cuando esté disponible.
                 </p>
               </div>
             </div>
          </section>

        </div>

        {/* ── Right Column: Account Info & Session ── */}
        <div className="space-y-8">
          
          {/* Current Session — Real data from Supabase */}
          <section className="bg-white dark:bg-wood-900 rounded-2xl p-6 md:p-8 border border-wood-100 dark:border-wood-800 shadow-sm">
            <h3 className="text-lg font-medium text-wood-900 dark:text-sand-100 mb-6 flex items-center gap-2">
              <Globe className="w-4 h-4 text-wood-400" /> Sesión Actual
            </h3>

            <div className="p-4 bg-wood-50 dark:bg-wood-800/50 rounded-xl border border-wood-100 dark:border-wood-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white dark:bg-wood-700 rounded-lg flex items-center justify-center text-emerald-500 shadow-sm">
                  <Monitor size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-wood-900 dark:text-sand-100 flex items-center gap-2">
                    Sesión activa
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-[9px] uppercase font-bold rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Conectada
                    </span>
                  </p>
                  <p className="text-xs text-wood-500 dark:text-wood-400">
                    Método de acceso: {authProvider}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-wood-200 dark:border-wood-700">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-wood-400 shrink-0" />
                  <span className="text-wood-500 dark:text-wood-400 text-xs font-medium w-28">Último acceso</span>
                  <span className="text-wood-900 dark:text-sand-100 text-xs">{lastSignIn}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-wood-400 shrink-0" />
                  <span className="text-wood-500 dark:text-wood-400 text-xs font-medium w-28">Email</span>
                  <span className="text-wood-900 dark:text-sand-100 text-xs flex items-center gap-1.5">
                    {userEmail}
                    {emailConfirmed && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Account Activity — Real data from Supabase */}
          <section className="bg-white dark:bg-wood-900 rounded-2xl p-6 md:p-8 border border-wood-100 dark:border-wood-800 shadow-sm">
            <h3 className="text-lg font-medium text-wood-900 dark:text-sand-100 mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-wood-400" /> Actividad de la Cuenta
            </h3>

            <div className="space-y-4">
              {/* Account creation */}
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-wood-50 dark:hover:bg-wood-800/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-wood-900 dark:text-sand-100">Cuenta creada</p>
                  <p className="text-xs text-wood-500 dark:text-wood-400">{accountCreated}</p>
                </div>
              </div>

              {/* Email verified */}
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-wood-50 dark:hover:bg-wood-800/30 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${emailConfirmed ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                  <Mail className={`w-4 h-4 ${emailConfirmed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-wood-900 dark:text-sand-100">
                    Email {emailConfirmed ? 'verificado' : 'sin verificar'}
                  </p>
                  <p className="text-xs text-wood-500 dark:text-wood-400">
                    {emailConfirmed 
                      ? formatDateTime(user?.email_confirmed_at)
                      : 'Verifica tu email para mayor seguridad'
                    }
                  </p>
                </div>
              </div>

              {/* Auth provider */}
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-wood-50 dark:hover:bg-wood-800/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-wood-900 dark:text-sand-100">Método de autenticación</p>
                  <p className="text-xs text-wood-500 dark:text-wood-400">{authProvider}</p>
                </div>
              </div>

              {/* Last sign in */}
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-wood-50 dark:hover:bg-wood-800/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-wood-100 dark:bg-wood-800 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-wood-500 dark:text-wood-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-wood-900 dark:text-sand-100">Último inicio de sesión</p>
                  <p className="text-xs text-wood-500 dark:text-wood-400">{lastSignIn}</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
