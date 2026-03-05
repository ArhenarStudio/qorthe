"use client";

import React from 'react';
import { Package, MapPin, CreditCard, Heart, LogOut, LayoutDashboard, Settings, ChevronRight, MessageSquare, Award, FileText, ShieldCheck, RefreshCw, Palette, Briefcase, Receipt } from 'lucide-react';
import { motion } from 'motion/react';
import { AccountSection } from '@/components/pages/AccountPage';
import { useAuth } from '@/contexts/AuthContext';

interface AccountSidebarProps {
  activeSection: AccountSection;
  onNavigate: (section: AccountSection) => void;
  currentTierName?: string;
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({ activeSection, onNavigate, currentTierName }) => {
  const { signOut, user, medusaCustomer } = useAuth();

  const displayName = medusaCustomer?.first_name
    ? [medusaCustomer.first_name, medusaCustomer.last_name].filter(Boolean).join(' ')
    : user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Miembro';
  const initials = displayName.split(' ').map((w: string) => w[0]?.toUpperCase() || '').join('').slice(0, 2) || 'DS';
  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
    { id: 'loyalty', label: 'Lealtad', icon: Award },
    { id: 'orders', label: 'Mis Pedidos', icon: Package },
    { id: 'business', label: 'Espacio B2B', icon: Briefcase },
    { id: 'billing', label: 'Facturación', icon: Receipt },
    { id: 'quotations', label: 'Cotizaciones', icon: FileText },
    { id: 'designs', label: 'Mis Diseños', icon: Palette },
    { id: 'subscriptions', label: 'Suscripciones', icon: RefreshCw },
    { id: 'reviews', label: 'Mis Opiniones', icon: MessageSquare },
    { id: 'addresses', label: 'Direcciones', icon: MapPin },
    { id: 'wallet', label: 'Pagos', icon: CreditCard },
    { id: 'security', label: 'Seguridad', icon: ShieldCheck },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Cuenta', icon: Settings },
  ];

  return (
    <div className="bg-white dark:bg-wood-900 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] dark:shadow-none border border-wood-100/50 dark:border-wood-800 p-2 overflow-hidden transition-colors duration-300">
      
      {/* User Mini Profile */}
      <div className="flex items-center gap-4 p-4 mb-2 bg-wood-50/50 dark:bg-wood-800/50 rounded-xl border border-wood-100/50 dark:border-wood-700">
        <div className="w-10 h-10 bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 rounded-full flex items-center justify-center font-serif text-lg shadow-md shrink-0">
          {initials}
        </div>
        <div className="overflow-hidden">
          <p className="font-medium text-wood-900 dark:text-sand-100 truncate text-sm">{displayName}</p>
          <p className="text-[10px] uppercase tracking-widest text-wood-500 dark:text-sand-400 truncate">Socio {currentTierName || 'Pino'}</p>
        </div>
      </div>
      
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          const isAccountMode = ['settings', 'addresses', 'wallet', 'security'].includes(activeSection);
          const isAccountItem = ['settings', 'addresses', 'wallet', 'security'].includes(item.id);

          if (isAccountMode) {
            if (item.id === 'overview') {
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate('overview')}
                  className="w-full flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm font-medium text-wood-500 hover:text-wood-900 dark:text-sand-400 dark:hover:text-sand-100 transition-colors mb-2"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span>Volver al menú</span>
                </button>
              );
            }
            if (!isAccountItem) return null;
          } else {
            if (['addresses', 'wallet', 'security'].includes(item.id)) return null;
          }

          return (
            <button
              key={item.id}
                  onClick={() => onNavigate(item.id as AccountSection)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group relative ${
                    isActive 
                      ? item.id === 'overview'
                        ? 'bg-wood-100 text-wood-900 dark:bg-wood-800 dark:text-sand-100 shadow-sm'
                        : 'bg-wood-900 text-sand-50 dark:bg-sand-100 dark:text-wood-900 shadow-md' 
                      : 'text-wood-600 dark:text-sand-300 hover:bg-wood-50 dark:hover:bg-wood-800 hover:text-wood-900 dark:hover:text-sand-100'
                  }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <item.icon 
                      className={`w-4 h-4 transition-colors ${
                        isActive 
                          ? item.id === 'overview'
                            ? 'text-wood-900 dark:text-sand-100'
                            : 'text-accent-gold dark:text-wood-900' 
                          : 'text-wood-400 dark:text-sand-500 group-hover:text-wood-800 dark:group-hover:text-sand-200'
                      }`} 
                      strokeWidth={2}
                    />
                    <span className="tracking-wide">{item.label}</span>
                  </div>
                  
                  {isActive && (
                    <motion.div
                      layoutId="active-arrow"
                      initial={false}
                    >
                      <ChevronRight className={`w-4 h-4 opacity-50 ${
                        item.id === 'overview' ? 'text-wood-500 dark:text-wood-400' : 'text-wood-400 dark:text-wood-600'
                      }`} />
                    </motion.div>
                  )}
                </button>
              );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-dashed border-wood-100 dark:border-wood-800 px-2">
        <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-wood-500 dark:text-sand-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors">
          <LogOut className="w-4 h-4" />
          <span className="tracking-wide">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};
