"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, FileText, PieChart, TrendingUp, Download, 
  ExternalLink, Plus, Briefcase, Users, Calendar, Trash2,
  Edit3, CheckCircle, ChevronDown, ChevronUp, FileCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { QuotationsList } from './QuotationsList';

// Mock Data for Charts
const SPEND_DATA = [
  { month: 'Ene', amount: 12500 },
  { month: 'Feb', amount: 8400 },
  { month: 'Mar', amount: 15600 },
  { month: 'Abr', amount: 4200 },
  { month: 'May', amount: 9800 },
  { month: 'Jun', amount: 22000 },
  { month: 'Jul', amount: 5600 },
  { month: 'Ago', amount: 11200 },
  { month: 'Sep', amount: 18500 },
  { month: 'Oct', amount: 7400 },
  { month: 'Nov', amount: 28000 },
  { month: 'Dic', amount: 14500 },
];

const BILLING_PROFILES = [
  {
    id: 'bp-01',
    name: 'Qorthe Corp',
    rfc: 'DSC123456789',
    address: 'Av. Reforma 222, CDMX',
    default: true
  },
  {
    id: 'bp-02',
    name: 'Alejandro Personal',
    rfc: 'GARA901224H52',
    address: 'Calle Bosques 45, CDMX',
    default: false
  }
];

export const BusinessDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'billing'>('overview');
  const [expandedProfile, setExpandedProfile] = useState<string | null>(null);
  const [b2bProfile, setB2bProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('dsd_user_id') || 'anonymous';
    fetch(`/api/account/b2b?user_id=${userId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.profile) setB2bProfile(d.profile); })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  const handleDownloadInvoice = (id: string, type: 'PDF' | 'XML') => {
    toast.loading(`Generando ${type} para factura ${id}...`);
    setTimeout(() => {
      toast.dismiss();
      toast.success(`Archivo ${type} descargado correctamente`);
    }, 1500);
  };

  const handleSetDefaultProfile = (id: string) => {
    toast.success("Perfil de facturación actualizado como predeterminado");
  };

  const handleDeleteProfile = (id: string) => {
    toast.success("Perfil eliminado correctamente");
  };

  const TotalSpend = SPEND_DATA.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100 mb-1 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-accent-gold" /> Espacio B2B
          </h2>
          <p className="text-sm text-wood-500 dark:text-wood-400">Gestión empresarial, proyectos y finanzas.</p>
        </div>
        
        {/* Simple Tab Nav */}
        <div className="hidden md:flex bg-wood-100 dark:bg-wood-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-wood-900 shadow text-wood-900 dark:text-sand-100' : 'text-wood-500 hover:text-wood-900'}`}
          >
            Resumen & Reportes
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'projects' ? 'bg-white dark:bg-wood-900 shadow text-wood-900 dark:text-sand-100' : 'text-wood-500 hover:text-wood-900'}`}
          >
            Proyectos
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'billing' ? 'bg-white dark:bg-wood-900 shadow text-wood-900 dark:text-sand-100' : 'text-wood-500 hover:text-wood-900'}`}
          >
            Facturación
          </button>
        </div>
      </div>

      {/* Mobile Tab Nav */}
      <div className="md:hidden flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
         <button 
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${activeTab === 'overview' ? 'bg-wood-900 text-sand-100 border-wood-900' : 'border-wood-200 text-wood-500'}`}
          >
            Resumen
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${activeTab === 'projects' ? 'bg-wood-900 text-sand-100 border-wood-900' : 'border-wood-200 text-wood-500'}`}
          >
            Proyectos
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${activeTab === 'billing' ? 'bg-wood-900 text-sand-100 border-wood-900' : 'border-wood-200 text-wood-500'}`}
          >
            Facturación
          </button>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-wood-900 dark:bg-sand-100 rounded-2xl p-6 text-sand-50 dark:text-wood-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/20 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Gasto Anual Total</p>
                  <h3 className="font-serif text-3xl text-sand-100 dark:text-wood-900">${TotalSpend.toLocaleString()} MXN</h3>
                  <div className="flex items-center gap-1 mt-2 text-emerald-400 dark:text-emerald-600 text-xs font-medium">
                    <TrendingUp className="w-3 h-3" /> +12% vs año anterior
                  </div>
                </div>
              </div>
              
              <div 
                onClick={() => setActiveTab('projects')}
                className="bg-white dark:bg-wood-900 rounded-2xl p-6 border border-wood-100 dark:border-wood-800 shadow-sm cursor-pointer hover:shadow-md hover:border-wood-300 dark:hover:border-wood-600 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-wood-50 dark:bg-wood-800 rounded-lg text-wood-900 dark:text-sand-100 group-hover:bg-wood-200 dark:group-hover:bg-wood-700 transition-colors">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-wood-500 dark:text-wood-400 mb-1">Proyectos Activos</p>
                <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100">3</h3>
              </div>

              <div 
                onClick={() => setActiveTab('billing')}
                className="bg-white dark:bg-wood-900 rounded-2xl p-6 border border-wood-100 dark:border-wood-800 shadow-sm cursor-pointer hover:shadow-md hover:border-wood-300 dark:hover:border-wood-600 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-wood-50 dark:bg-wood-800 rounded-lg text-wood-900 dark:text-sand-100 group-hover:bg-wood-200 dark:group-hover:bg-wood-700 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-wood-500 dark:text-wood-400 mb-1">Facturas Pendientes</p>
                <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100">0</h3>
              </div>
            </div>

            {/* Consumption Chart */}
            <div className="bg-white dark:bg-wood-900 rounded-2xl p-6 md:p-8 border border-wood-100 dark:border-wood-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-serif text-lg text-wood-900 dark:text-sand-100 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-wood-400" /> Historial de Consumo
                </h3>
                <button className="text-xs font-bold uppercase tracking-widest text-wood-500 hover:text-wood-900 flex items-center gap-2 transition-colors">
                  <Download className="w-4 h-4" /> Descargar Reporte
                </button>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SPEND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" opacity={0.5} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9CA3AF', fontSize: 10 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9CA3AF', fontSize: 10 }} 
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {SPEND_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === SPEND_DATA.length - 1 ? '#D4AF37' : '#1A1A1A'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div>
            <QuotationsList />
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
             <div className="bg-wood-50 dark:bg-wood-800/30 rounded-xl p-6 border border-wood-100 dark:border-wood-800">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                   <h3 className="font-serif text-lg text-wood-900 dark:text-sand-100 mb-1">Perfiles de Facturación</h3>
                   <p className="text-sm text-wood-500">Gestiona tus datos fiscales para la generación automática de facturas.</p>
                 </div>
                 <button className="px-4 py-2 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2">
                   <Plus className="w-3 h-3" /> Nuevo Perfil
                 </button>
               </div>
             </div>

             <div className="grid gap-4">
               {BILLING_PROFILES.map(profile => (
                                 <div key={profile.id} className={`bg-white dark:bg-wood-900 rounded-xl border transition-all overflow-hidden ${expandedProfile === profile.id ? 'border-wood-900 ring-1 ring-wood-900 dark:border-sand-100 dark:ring-sand-100 shadow-md' : 'border-wood-100 dark:border-wood-800 hover:border-wood-300 dark:hover:border-wood-600'}`}>
                   <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div className="flex items-start gap-4 flex-1">
                       <div className={`mt-1 p-2 rounded-lg transition-colors ${profile.default ? 'bg-wood-900 text-sand-100 dark:bg-sand-100 dark:text-wood-900' : 'bg-wood-100 text-wood-500 dark:bg-wood-800 dark:text-wood-400'}`}>
                         <Building2 className="w-5 h-5" />
                       </div>
                       <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                           <h4 className="font-bold text-wood-900 dark:text-sand-100">{profile.name}</h4>
                           {profile.default ? (
                             <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px] uppercase font-bold rounded flex items-center gap-1">
                               <CheckCircle className="w-3 h-3" /> Predeterminado
                             </span>
                           ) : (
                             <button 
                               onClick={() => handleSetDefaultProfile(profile.id)}
                               className="text-[9px] font-bold uppercase tracking-widest text-wood-400 hover:text-wood-600 dark:hover:text-sand-300 underline decoration-dotted"
                             >
                               Hacer Predeterminado
                             </button>
                           )}
                         </div>
                         <p className="text-sm text-wood-600 dark:text-wood-300 font-mono mb-1">{profile.rfc}</p>
                         <p className="text-xs text-wood-400">{profile.address}</p>
                       </div>
                     </div>
                     
                     <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                       <button 
                         onClick={() => toast.success("Abriendo editor de perfil fiscal")}
                         className="p-2 text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 hover:bg-wood-50 dark:hover:bg-wood-800 rounded-lg transition-colors"
                         title="Editar datos"
                       >
                         <Edit3 className="w-4 h-4" />
                       </button>
                       {!profile.default && (
                         <button 
                           onClick={() => handleDeleteProfile(profile.id)}
                           className="p-2 text-wood-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                           title="Eliminar perfil"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       )}
                       <div className="h-4 w-px bg-wood-200 dark:bg-wood-700 mx-1" />
                       <button 
                         onClick={() => setExpandedProfile(expandedProfile === profile.id ? null : profile.id)}
                         className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${expandedProfile === profile.id ? 'bg-wood-900 text-sand-50 dark:bg-sand-100 dark:text-wood-900' : 'bg-wood-50 text-wood-600 hover:bg-wood-100 dark:bg-wood-800 dark:text-sand-300 dark:hover:bg-wood-700'}`}
                       >
                         {expandedProfile === profile.id ? 'Ocultar' : 'Ver Facturas'}
                         {expandedProfile === profile.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                       </button>
                     </div>
                   </div>

                   {/* Expandable Invoice History */}
                   <AnimatePresence>
                     {expandedProfile === profile.id && (
                       <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="border-t border-wood-100 dark:border-wood-800 bg-wood-50/30 dark:bg-wood-800/20 overflow-hidden"
                       >
                         <div className="p-6">
                           <div className="flex justify-between items-center mb-4">
                             <h5 className="text-xs font-bold text-wood-900 dark:text-sand-100 uppercase tracking-widest flex items-center gap-2">
                               <FileCheck className="w-4 h-4" /> Historial de Facturas
                             </h5>
                             <button className="text-[10px] text-wood-500 hover:text-wood-900 dark:hover:text-sand-100 underline">
                               Ver todas
                             </button>
                           </div>

                           <div className="space-y-3">
                             {[
                               { id: 'F-2024-008', date: '14 Feb 2026', amount: '$12,450.00', status: 'Pagada' },
                               { id: 'F-2024-003', date: '01 Feb 2026', amount: '$8,200.00', status: 'Pagada' },
                               { id: 'F-2023-156', date: '15 Dic 2025', amount: '$24,600.00', status: 'Pagada' }
                             ].map((invoice) => (
                               <div key={invoice.id} className="bg-white dark:bg-wood-900 p-3 rounded-lg border border-wood-100 dark:border-wood-800 flex items-center justify-between hover:border-wood-300 dark:hover:border-wood-600 transition-colors group/invoice">
                                 <div className="flex items-center gap-3">
                                   <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md">
                                     <FileText className="w-4 h-4" />
                                   </div>
                                   <div>
                                     <p className="text-sm font-bold text-wood-900 dark:text-sand-100">{invoice.id}</p>
                                     <p className="text-[10px] text-wood-500">{invoice.date}</p>
                                   </div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                   <span className="text-sm font-serif text-wood-900 dark:text-sand-100">{invoice.amount}</span>
                                   <div className="flex gap-1 opacity-0 group-hover/invoice:opacity-100 transition-opacity">
                                     <button 
                                       onClick={() => handleDownloadInvoice(invoice.id, 'PDF')}
                                       className="p-1.5 hover:bg-wood-100 dark:hover:bg-wood-800 rounded text-[10px] font-bold text-wood-600 dark:text-sand-300 uppercase tracking-wider"
                                     >
                                       PDF
                                     </button>
                                     <div className="w-px bg-wood-200 dark:bg-wood-700 my-1" />
                                     <button 
                                       onClick={() => handleDownloadInvoice(invoice.id, 'XML')}
                                       className="p-1.5 hover:bg-wood-100 dark:hover:bg-wood-800 rounded text-[10px] font-bold text-wood-600 dark:text-sand-300 uppercase tracking-wider"
                                     >
                                       XML
                                     </button>
                                   </div>
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
               ))}
             </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
