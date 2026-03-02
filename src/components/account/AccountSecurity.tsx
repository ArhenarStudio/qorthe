"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, Key, Smartphone, Globe, Clock, LogOut, 
  CheckCircle, AlertTriangle, ChevronRight, Eye, EyeOff, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Mock Data
const ACTIVE_SESSIONS = [
  {
    id: 'sess-01',
    device: 'Chrome en MacBook Pro',
    location: 'Ciudad de México, MX',
    ip: '189.203.45.12',
    lastActive: 'Ahora',
    current: true,
    icon: Globe
  },
  {
    id: 'sess-02',
    device: 'Safari en iPhone 13',
    location: 'Ciudad de México, MX',
    ip: '187.190.22.89',
    lastActive: 'Hace 2 horas',
    current: false,
    icon: Smartphone
  }
];

const ACCESS_HISTORY = [
  { id: 1, action: 'Inicio de sesión exitoso', device: 'Chrome / MacOS', date: 'Hoy, 10:23 AM', status: 'success' },
  { id: 2, action: 'Cambio de contraseña', device: 'Chrome / MacOS', date: 'Ayer, 15:45 PM', status: 'warning' },
  { id: 3, action: 'Intento fallido', device: 'Firefox / Windows', date: '12 Feb, 09:12 AM', status: 'danger' },
  { id: 4, action: 'Inicio de sesión exitoso', device: 'Safari / iOS', date: '10 Feb, 18:30 PM', status: 'success' },
];

export const AccountSecurity = () => {
  const { supabase } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState(ACTIVE_SESSIONS);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleRevokeSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    toast.success('Sesión cerrada correctamente');
  };

  const toggleTwoFactor = () => {
    // In a real app, this would open a modal with QR code
    const newState = !twoFactorEnabled;
    setTwoFactorEnabled(newState);
    if (newState) {
      toast.success('Autenticación de dos pasos activada');
    } else {
      toast.info('Autenticación de dos pasos desactivada');
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
        
        {/* Left Column: Password & 2FA */}
        <div className="space-y-8">
          
          {/* Change Password */}
          <section className="bg-white dark:bg-wood-900 rounded-2xl p-6 md:p-8 border border-wood-100 dark:border-wood-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-wood-50 dark:bg-wood-800 rounded-bl-[100px] -mr-4 -mt-4 opacity-50" />
            
            <h3 className="text-lg font-medium text-wood-900 dark:text-sand-100 mb-6 flex items-center gap-2 relative z-10">
              <Key className="w-4 h-4 text-wood-400" /> Cambiar Contraseña
            </h3>
            
            <form onSubmit={handleUpdatePassword} className="space-y-4 relative z-10">
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

              <div className="pt-2 flex justify-end">
                <button 
                  type="submit"
                  disabled={!currentPassword || !newPassword || updatingPassword}
                  className="px-6 py-3 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updatingPassword && <Loader2 className="w-3 h-3 animate-spin" />}
                  {updatingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          </section>

          {/* 2FA Section */}
          <section className="bg-white dark:bg-wood-900 rounded-2xl p-6 md:p-8 border border-wood-100 dark:border-wood-800 shadow-sm">
             <div className="flex items-start justify-between">
               <div>
                 <h3 className="text-lg font-medium text-wood-900 dark:text-sand-100 mb-2 flex items-center gap-2">
                   <Smartphone className="w-4 h-4 text-wood-400" /> Autenticación en dos pasos (2FA)
                 </h3>
                 <p className="text-sm text-wood-500 dark:text-wood-400 max-w-sm leading-relaxed">
                   Añade una capa extra de seguridad. Requeriremos un código de tu aplicación autenticadora al iniciar sesión.
                 </p>
               </div>
               
               <button 
                 onClick={toggleTwoFactor}
                 className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-offset-2 ${twoFactorEnabled ? 'bg-emerald-500' : 'bg-wood-200 dark:bg-wood-700'}`}
               >
                 <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
               </button>
             </div>

             {twoFactorEnabled && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex items-center gap-3"
               >
                 <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full text-emerald-600 dark:text-emerald-400">
                   <CheckCircle size={20} />
                 </div>
                 <div>
                   <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">2FA Activado</p>
                   <p className="text-xs text-emerald-700 dark:text-emerald-300">Tu cuenta está protegida.</p>
                 </div>
               </motion.div>
             )}
          </section>

        </div>

        {/* Right Column: Sessions & History */}
        <div className="space-y-8">
          
          {/* Active Sessions */}
          <section className="bg-white dark:bg-wood-900 rounded-2xl p-6 md:p-8 border border-wood-100 dark:border-wood-800 shadow-sm">
            <h3 className="text-lg font-medium text-wood-900 dark:text-sand-100 mb-6 flex items-center gap-2">
              <Globe className="w-4 h-4 text-wood-400" /> Sesiones Activas
            </h3>

            <div className="space-y-4">
              {sessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-wood-50 dark:bg-wood-800/50 rounded-xl border border-wood-100 dark:border-wood-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-wood-700 rounded-lg flex items-center justify-center text-wood-500 dark:text-sand-300 shadow-sm">
                      <session.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-wood-900 dark:text-sand-100 flex items-center gap-2">
                        {session.device}
                        {session.current && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-[9px] uppercase font-bold rounded">Actual</span>
                        )}
                      </p>
                      <p className="text-xs text-wood-500 dark:text-wood-400">
                        {session.location} • {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <button 
                      onClick={() => handleRevokeSession(session.id)}
                      className="p-2 text-wood-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Cerrar sesión"
                    >
                      <LogOut size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest hover:underline text-center py-2">
              Cerrar todas las demás sesiones
            </button>
          </section>

          {/* Access History */}
          <section className="bg-white dark:bg-wood-900 rounded-2xl p-6 md:p-8 border border-wood-100 dark:border-wood-800 shadow-sm">
            <h3 className="text-lg font-medium text-wood-900 dark:text-sand-100 mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-wood-400" /> Historial de Accesos
            </h3>

            <div className="relative border-l border-wood-200 dark:border-wood-800 ml-3 space-y-6 pb-2">
              {ACCESS_HISTORY.map((event) => (
                <div key={event.id} className="relative pl-6">
                  <span className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-wood-900 ${
                    event.status === 'success' ? 'bg-emerald-500' :
                    event.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <p className="text-sm font-medium text-wood-900 dark:text-sand-100">
                    {event.action}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-wood-500 dark:text-wood-400 mt-1">
                    <span>{event.device}</span>
                    <span>•</span>
                    <span>{event.date}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-2 text-xs font-bold text-wood-500 hover:text-wood-900 dark:text-wood-400 dark:hover:text-sand-100 uppercase tracking-widest flex items-center justify-center gap-1 transition-colors">
              Ver historial completo <ChevronRight size={12} />
            </button>
          </section>

        </div>
      </div>
    </div>
  );
};
