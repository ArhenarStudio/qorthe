"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, Users, ShoppingBag, Settings, 
  TrendingUp, DollarSign, Package, AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { label: "Ventas Totales", value: "$124,500", change: "+12%", icon: DollarSign },
    { label: "Pedidos Activos", value: "45", change: "+5%", icon: Package },
    { label: "Usuarios", value: "1,240", change: "+18%", icon: Users },
    { label: "Inventario Bajo", value: "3", change: "Alert", icon: AlertCircle, alert: true },
  ]);

  // Admin initialization placeholder — will connect to backend when ready
  useEffect(() => {
    console.log("Admin dashboard loaded");
  }, []);

  return (
    <div className="min-h-screen bg-sand-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-wood-900 text-sand-100 flex flex-col fixed h-full">
        <div className="p-6 border-b border-wood-800">
          <h1 className="font-serif text-xl tracking-wider text-accent-gold">DSD ADMIN</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={LayoutDashboard} label="Dashboard" active />
          <NavItem icon={ShoppingBag} label="Pedidos" />
          <NavItem icon={Users} label="Clientes" />
          <NavItem icon={Package} label="Inventario" />
          <NavItem icon={TrendingUp} label="Analíticas" />
          <NavItem icon={Settings} label="Configuración" />
        </nav>

        <div className="p-4 border-t border-wood-800">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-accent-gold flex items-center justify-center text-wood-900 font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-wood-400">admin@davidsons.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-serif text-wood-900">Panel de Control</h2>
            <p className="text-wood-500 text-sm">Bienvenido de nuevo, Admin.</p>
          </div>
          <button className="bg-wood-900 text-sand-100 px-4 py-2 rounded-lg text-sm hover:bg-wood-800 transition-colors">
            Descargar Reporte
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-xl border border-wood-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.alert ? 'bg-red-100 text-red-500' : 'bg-wood-50 text-wood-900'}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.alert ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-wood-900">{stat.value}</h3>
              <p className="text-xs text-wood-500 uppercase tracking-wider mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity Table Placeholder */}
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-wood-100 flex justify-between items-center">
            <h3 className="font-bold text-wood-900">Pedidos Recientes</h3>
            <button className="text-xs text-accent-gold font-bold uppercase tracking-widest hover:underline">Ver Todo</button>
          </div>
          <div className="p-6">
            <div className="text-center py-10 text-wood-400 text-sm">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p>Los datos de pedidos en tiempo real aparecerán aquí.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) => (
  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
    active ? 'bg-wood-800 text-accent-gold' : 'text-wood-400 hover:bg-wood-800/50 hover:text-sand-100'
  }`}>
    <Icon className="w-4 h-4" />
    {label}
  </button>
);
