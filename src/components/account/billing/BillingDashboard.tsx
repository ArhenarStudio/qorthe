"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, UserCog, Plus, Search, Filter, MoreVertical, CreditCard, AlertCircle, CheckCircle2, XCircle, FileBarChart, Building2, Receipt, X } from 'lucide-react';
import { FiscalProfileForm } from './FiscalProfileForm';
import { BillingStats } from './BillingStats';
import { InvoiceRequestModal } from './InvoiceRequestModal';

export const BillingDashboard = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'reports'>('dashboard');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | 'all'>('all');

  // Mock Summary Data
  const summary = {
    totalInvoices: 12,
    amountYear: 45250.00,
    pending: 1,
    creditNotes: 1 // Updated to match mock data having 1 cancelled invoice
  };

  // Mock Invoices Data
  const invoices = [
    { id: 'INV-2024-001', order: 'ORD-8821', date: '2024-02-10', rfc: 'XAXX010101000', company: 'Alejandro García', total: 3500.00, status: 'issued' },
    { id: 'INV-2024-002', order: 'ORD-8805', date: '2024-01-25', rfc: 'XAXX010101000', company: 'Alejandro García', total: 1250.00, status: 'issued' },
    { id: 'INV-2024-003', order: 'ORD-8792', date: '2024-01-15', rfc: 'XAXX010101000', company: 'Empresa B2B S.A.', total: 15400.00, status: 'pending' },
    { id: 'INV-2023-156', order: 'ORD-8650', date: '2023-12-20', rfc: 'XAXX010101000', company: 'Alejandro García', total: 2100.00, status: 'cancelled' },
    { id: 'INV-2023-150', order: 'ORD-8612', date: '2023-12-05', rfc: 'XAXX010101000', company: 'Alejandro García', total: 5600.00, status: 'issued' },
  ];

  const filteredInvoices = filterStatus === 'all' 
    ? invoices 
    : invoices.filter(inv => {
        if (filterStatus === 'credit_note') return inv.status === 'cancelled';
        return inv.status === filterStatus;
      });

  const handleFilterClick = (status: string) => {
    if (filterStatus === status) {
      setFilterStatus('all');
    } else {
      setFilterStatus(status);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-wood-100 dark:border-wood-800 pb-6">
        <div>
          <h2 className="text-3xl font-serif text-wood-900 dark:text-sand-100 mb-2">Facturación</h2>
          <p className="text-wood-500 dark:text-sand-400 text-sm flex items-center gap-2">
            <ShieldIcon />
            <span className="font-medium tracking-wide">Sistema de Facturación CFDI 4.0 Seguro</span>
          </p>
        </div>
        
        <div className="flex bg-wood-50 dark:bg-wood-800 p-1.5 rounded-xl self-start md:self-auto shadow-inner">
          <TabButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            label="Resumen" 
            icon={Receipt}
          />
          <TabButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
            label="Datos Fiscales" 
            icon={UserCog}
          />
          <TabButton 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')} 
            label="Reportes" 
            icon={FileBarChart}
          />
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          {/* Summary Cards */}
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Hero Stat: Monto Facturado */}
            <div className="flex-1 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-3xl p-8 flex items-center justify-between relative overflow-hidden shadow-xl shadow-wood-900/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-black/5 rounded-full -mr-16 -mt-16 pointer-events-none blur-3xl" />
              
              <div className="relative z-10 w-full">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">Monto Facturado 2024</p>
                  <CreditCard className="w-5 h-5 opacity-50" />
                </div>
                
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-5xl md:text-6xl font-serif tracking-tight font-medium">
                    ${summary.amountYear.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-2xl md:text-3xl font-serif opacity-60 font-light">
                    .{summary.amountYear.toLocaleString('es-MX', { minimumFractionDigits: 2 }).split('.')[1]}
                  </span>
                </div>
                
                <div className="mt-6 flex items-center gap-4 text-xs font-medium opacity-80">
                  <span className="flex items-center gap-2 px-3 py-1 bg-white/10 dark:bg-black/5 rounded-full backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-600 animate-pulse" />
                    Actualizado hoy
                  </span>
                  <span>+12.5% vs año anterior</span>
                </div>
              </div>
            </div>

            {/* Secondary Stats Strip */}
            <div className="flex-1 bg-white dark:bg-wood-900 rounded-3xl border border-wood-100 dark:border-wood-800 shadow-sm flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-wood-100 dark:divide-wood-800 overflow-hidden">
              
              {/* Emitidas */}
              <button 
                onClick={() => handleFilterClick('issued')}
                className={`flex-1 p-5 flex items-center justify-between group transition-colors text-left relative ${
                  filterStatus === 'issued' 
                    ? 'bg-wood-50 dark:bg-wood-800' 
                    : 'hover:bg-wood-50 dark:hover:bg-wood-800/50'
                }`}
              >
                {filterStatus === 'issued' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-wood-900 dark:bg-sand-100" />}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-wood-400 dark:text-sand-500 uppercase tracking-wider">Emitidas</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800/30">+2</span>
                  </div>
                  <span className="text-3xl font-serif text-wood-900 dark:text-sand-100 leading-none">{summary.totalInvoices}</span>
                </div>
                <div className={`p-3 rounded-2xl transition-all ring-1 shadow-sm group-hover:scale-105 ${
                  filterStatus === 'issued'
                    ? 'bg-wood-900 text-sand-100 dark:bg-sand-100 dark:text-wood-900 ring-wood-900 dark:ring-sand-100'
                    : 'bg-wood-50 dark:bg-wood-800 text-wood-400 dark:text-sand-500 group-hover:text-wood-600 dark:group-hover:text-sand-300 group-hover:bg-white dark:group-hover:bg-wood-700 ring-wood-100 dark:ring-wood-700/50'
                }`}>
                  <FileText className="w-5 h-5" strokeWidth={1.5} />
                </div>
              </button>

              {/* Pendientes */}
              <button 
                onClick={() => handleFilterClick('pending')}
                className={`flex-1 p-5 flex items-center justify-between group transition-colors text-left relative ${
                  filterStatus === 'pending'
                    ? 'bg-amber-50 dark:bg-amber-900/10'
                    : summary.pending > 0 
                      ? 'hover:bg-amber-50 dark:hover:bg-amber-900/10' 
                      : 'hover:bg-wood-50 dark:hover:bg-wood-800/50'
                }`}
              >
                {filterStatus === 'pending' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />}
                <div className="flex flex-col gap-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    summary.pending > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-wood-400 dark:text-sand-500'
                  }`}>Pendientes</span>
                  <span className={`text-3xl font-serif leading-none ${
                    summary.pending > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-wood-900 dark:text-sand-100'
                  }`}>{summary.pending}</span>
                </div>
                <div className={`p-3 rounded-2xl transition-all shadow-sm group-hover:scale-105 ${
                  filterStatus === 'pending'
                    ? 'bg-amber-500 text-white ring-1 ring-amber-500'
                    : summary.pending > 0 
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800/50 group-hover:bg-white dark:group-hover:bg-amber-900/50' 
                      : 'bg-wood-50 dark:bg-wood-800 text-wood-400 dark:text-sand-500 ring-1 ring-wood-100 dark:ring-wood-700/50 group-hover:bg-white dark:group-hover:bg-wood-700'
                }`}>
                  {summary.pending > 0 ? (
                    <AlertCircle className="w-5 h-5 animate-pulse" strokeWidth={2} />
                  ) : (
                    <AlertCircle className="w-5 h-5" strokeWidth={1.5} />
                  )}
                </div>
              </button>

              {/* Notas Crédito */}
              <button 
                onClick={() => handleFilterClick('credit_note')}
                className={`flex-1 p-5 flex items-center justify-between group transition-colors text-left relative ${
                  filterStatus === 'credit_note' 
                    ? 'bg-wood-50 dark:bg-wood-800' 
                    : 'hover:bg-wood-50 dark:hover:bg-wood-800/50'
                }`}
              >
                {filterStatus === 'credit_note' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-wood-900 dark:bg-sand-100" />}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-wood-400 dark:text-sand-500 uppercase tracking-wider">Notas Crédito</span>
                  <span className="text-3xl font-serif text-wood-900 dark:text-sand-100 leading-none">{summary.creditNotes}</span>
                </div>
                <div className={`p-3 rounded-2xl transition-all ring-1 shadow-sm group-hover:scale-105 ${
                  filterStatus === 'credit_note'
                    ? 'bg-wood-900 text-sand-100 dark:bg-sand-100 dark:text-wood-900 ring-wood-900 dark:ring-sand-100'
                    : 'bg-wood-50 dark:bg-wood-800 text-wood-400 dark:text-sand-500 group-hover:text-wood-600 dark:group-hover:text-sand-300 group-hover:bg-white dark:group-hover:bg-wood-700 ring-wood-100 dark:ring-wood-700/50'
                }`}>
                  <Receipt className="w-5 h-5" strokeWidth={1.5} />
                </div>
              </button>
            </div>
          </div>

          {/* Quick Actions & Search */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setShowRequestModal(true)}
                className="flex items-center gap-2 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 px-5 py-3 rounded-xl font-medium hover:bg-wood-800 dark:hover:bg-sand-200 transition-all shadow-lg shadow-wood-900/10 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Solicitar Factura
              </button>
              <button className="flex items-center gap-2 bg-white dark:bg-wood-800 text-wood-700 dark:text-sand-300 border border-wood-200 dark:border-wood-700 px-5 py-3 rounded-xl font-medium hover:bg-wood-50 dark:hover:bg-wood-700 hover:text-wood-900 dark:hover:text-sand-100 transition-colors active:scale-95">
                <Download className="w-4 h-4" />
                Descargar ZIP
              </button>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full lg:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-wood-400" />
                <input 
                  type="text" 
                  placeholder="Buscar factura, RFC o monto..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-wood-900 border border-wood-200 dark:border-wood-700 rounded-xl text-sm text-wood-900 dark:text-sand-100 placeholder:text-wood-400 focus:outline-none focus:ring-2 focus:ring-wood-900/10 transition-shadow"
                />
              </div>
              <button className="p-2.5 bg-white dark:bg-wood-900 border border-wood-200 dark:border-wood-700 rounded-xl text-wood-500 hover:text-wood-900 dark:hover:text-sand-100 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
              {filterStatus !== 'all' && (
                <button 
                  onClick={() => setFilterStatus('all')}
                  className="p-2.5 bg-wood-100 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-wood-900 dark:text-sand-100 hover:bg-wood-200 dark:hover:bg-wood-700 transition-colors flex items-center gap-2 text-xs font-medium"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Limpiar filtros</span>
                </button>
              )}
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white dark:bg-wood-900 rounded-3xl border border-wood-100 dark:border-wood-800 overflow-hidden shadow-sm ring-1 ring-wood-900/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-wood-100 dark:border-wood-800 bg-wood-50/30 dark:bg-wood-800/20">
                    <th className="pl-8 pr-4 py-5 text-xs font-bold text-wood-400 dark:text-sand-500 uppercase tracking-widest first:pl-8">Factura</th>
                    <th className="px-4 py-5 text-xs font-bold text-wood-400 dark:text-sand-500 uppercase tracking-widest">Receptor</th>
                    <th className="px-4 py-5 text-xs font-bold text-wood-400 dark:text-sand-500 uppercase tracking-widest text-right">Total</th>
                    <th className="px-4 py-5 text-xs font-bold text-wood-400 dark:text-sand-500 uppercase tracking-widest text-center">Estado</th>
                    <th className="pl-4 pr-8 py-5 text-xs font-bold text-wood-400 dark:text-sand-500 uppercase tracking-widest text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-100 dark:divide-wood-800">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="group hover:bg-wood-50/50 dark:hover:bg-wood-800/30 transition-colors">
                        <td className="pl-8 pr-4 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-wood-900 dark:text-sand-100 text-sm">{inv.id}</span>
                            <div className="flex items-center gap-2 text-[11px] text-wood-500 dark:text-sand-400">
                              <span>{new Date(inv.date).toLocaleDateString('es-MX', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                              <span className="w-1 h-1 rounded-full bg-wood-300 dark:bg-wood-600" />
                              <span className="font-mono">Ref: {inv.order}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-wood-700 dark:text-sand-200">{inv.company}</span>
                            <span className="text-[10px] font-mono text-wood-400 dark:text-sand-500 tracking-wide">{inv.rfc}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-serif font-bold text-wood-900 dark:text-sand-100">
                            ${inv.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="pl-4 pr-8 py-4 text-right">
                          <button className="p-2 rounded-lg text-wood-400 hover:text-wood-900 hover:bg-wood-100 dark:text-sand-400 dark:hover:text-sand-100 dark:hover:bg-wood-700 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="p-4 bg-wood-50 dark:bg-wood-800 rounded-full mb-4">
                            <Search className="w-6 h-6 text-wood-300 dark:text-sand-500" />
                          </div>
                          <h3 className="text-base font-serif text-wood-900 dark:text-sand-100 mb-1">No se encontraron facturas</h3>
                          <p className="text-xs text-wood-500 dark:text-sand-400 max-w-[200px] mx-auto">
                            Intenta ajustar los filtros de búsqueda.
                          </p>
                          <button 
                            onClick={() => setFilterStatus('all')}
                            className="mt-6 text-xs font-bold uppercase tracking-widest text-wood-600 dark:text-sand-300 hover:text-wood-900 dark:hover:text-sand-100 underline decoration-2 decoration-wood-200 dark:decoration-wood-700 underline-offset-4"
                          >
                            Limpiar Filtros
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Footer */}
            <div className="px-8 py-4 border-t border-wood-100 dark:border-wood-800 flex items-center justify-between gap-4 bg-wood-50/30 dark:bg-wood-800/30">
              <span className="text-[10px] font-bold uppercase tracking-widest text-wood-400 dark:text-sand-500">
                {filteredInvoices.length} de {invoices.length} registros
              </span>
              <div className="flex gap-2">
                <button 
                  disabled
                  className="p-2 text-wood-400 dark:text-sand-500 bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg disabled:opacity-50"
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button 
                  disabled
                  className="p-2 text-wood-400 dark:text-sand-500 bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg disabled:opacity-50"
                >
                  <span className="sr-only">Siguiente</span>
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'profile' && (
        <FiscalProfileForm onCancel={() => setActiveTab('dashboard')} />
      )}

      {activeTab === 'reports' && (
        <BillingStats />
      )}

      {/* Request Invoice Modal */}
      {showRequestModal && (
        <InvoiceRequestModal onClose={() => setShowRequestModal(false)} />
      )}
    </div>
  );
};

// Sub-components for internal use

const TabButton = ({ active, onClick, label, icon: Icon }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
      active 
        ? 'bg-white dark:bg-wood-700 text-wood-900 dark:text-sand-100 shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
        : 'text-wood-500 dark:text-sand-400 hover:text-wood-800 dark:hover:text-sand-200 hover:bg-white/50 dark:hover:bg-wood-700/50'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const SummaryCard = ({ title, value, icon: Icon, trend, alert, trendPositive }: any) => (
  <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-md ${
    alert 
      ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30' 
      : 'bg-white dark:bg-wood-900 border-wood-100 dark:border-wood-800'
  } shadow-sm group`}>
    <div className="flex items-center justify-between mb-6">
      <div className={`p-3.5 rounded-2xl transition-all duration-300 shadow-sm ${
        alert 
          ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 ring-1 ring-amber-100 dark:ring-amber-800/30' 
          : 'bg-wood-50 dark:bg-wood-800 text-wood-600 dark:text-sand-300 ring-1 ring-wood-100 dark:ring-wood-700/50 group-hover:bg-wood-100 dark:group-hover:bg-wood-700 group-hover:scale-105'
      }`}>
        <Icon className="w-6 h-6" strokeWidth={1.5} />
      </div>
      {trend && (
        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1 ${
          trendPositive 
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30' 
            : 'bg-wood-50 text-wood-500 dark:bg-wood-800 dark:text-sand-400 border border-wood-100 dark:border-wood-700/50'
        }`}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-sm font-medium text-wood-500 dark:text-sand-400 mb-1">{title}</p>
    <h3 className={`text-3xl font-serif tracking-tight ${alert ? 'text-amber-700 dark:text-amber-500' : 'text-wood-900 dark:text-sand-100'}`}>
      {value}
    </h3>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    issued: 'bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    pending: 'bg-amber-100/50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    cancelled: 'bg-red-100/50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  const labels = {
    issued: 'Emitida',
    pending: 'En Proceso',
    cancelled: 'Cancelada',
  };

  const icons = {
    issued: CheckCircle2,
    pending: AlertCircle,
    cancelled: XCircle,
  };

  const Icon = icons[status as keyof typeof icons];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles]}`}>
      <Icon className="w-3.5 h-3.5" />
      {labels[status as keyof typeof labels]}
    </span>
  );
};

const ShieldIcon = () => (
  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
