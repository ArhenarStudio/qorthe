"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ChevronRight, CheckCircle, Clock, Truck, RefreshCcw, ExternalLink, ArrowRight, ShoppingBag, DollarSign, TrendingUp, Download, FileText, Ruler, PenTool, Image as ImageIcon, Search, Receipt, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { InvoiceRequestModal } from './billing/InvoiceRequestModal';
import { useAuth } from '@/contexts/AuthContext';

// Enhanced Mock Data with Customizations and Timeline
const MOCK_ORDERS = [
  {
    id: "ORD-8921",
    date: "10 Feb 2026",
    status: "Delivered",
    total: "$4,250",
    tracking: "DHL-MX-8829102",
    invoiceUrl: "#",
    timeline: [
      { step: 'Confirmado', date: '10 Feb 10:00 AM', completed: true },
      { step: 'Producción', date: '11 Feb 09:30 AM', completed: true },
      { step: 'Enviado', date: '12 Feb 04:20 PM', completed: true },
      { step: 'Entregado', date: '14 Feb 01:15 PM', completed: true },
    ],
    items: [
      { 
        name: "Tabla de Nogal Premium", 
        quantity: 1, 
        price: "$2,850", 
        image: "https://images.unsplash.com/photo-1624821588759-2443c7268dff?auto=format&fit=crop&q=80&w=200",
        customization: {
          wood: "Nogal Americano",
          engraving: "Familia R.S.",
          dimensions: "45cm x 30cm",
          designPreview: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=300"
        }
      },
      { 
        name: "Set de Cuchillos Artesanales", 
        quantity: 1, 
        price: "$1,400", 
        image: "https://images.unsplash.com/photo-1593618998160-e34015e672a9?auto=format&fit=crop&q=80&w=200",
        customization: null
      }
    ]
  },
  {
    id: "ORD-7734",
    date: "02 Feb 2026",
    status: "Shipped",
    total: "$1,890",
    tracking: "FEDEX-MX-9921",
    invoiceUrl: "#",
    timeline: [
      { step: 'Confirmado', date: '02 Feb 08:00 AM', completed: true },
      { step: 'Producción', date: '03 Feb 11:00 AM', completed: true },
      { step: 'Enviado', date: '05 Feb 06:00 PM', completed: true },
      { step: 'Entregado', date: '-', completed: false },
    ],
    items: [
      { 
        name: "Cera de Abeja Orgánica", 
        quantity: 2, 
        price: "$945", 
        image: "https://images.unsplash.com/photo-1605265058749-78afeb665737?auto=format&fit=crop&q=80&w=200",
        customization: null
      }
    ]
  },
  {
    id: "ORD-6612",
    date: "20 Ene 2026",
    status: "Processing",
    total: "$12,400",
    tracking: null,
    invoiceUrl: "#",
    timeline: [
      { step: 'Confirmado', date: '20 Ene 02:30 PM', completed: true },
      { step: 'Producción', date: 'En proceso', completed: true, current: true },
      { step: 'Enviado', date: '-', completed: false },
      { step: 'Entregado', date: '-', completed: false },
    ],
    items: [
      { 
        name: "Mesa de Centro Roble", 
        quantity: 1, 
        price: "$12,400", 
        image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=200",
        customization: {
          wood: "Roble Blanco",
          dimensions: "120cm x 60cm x 45cm",
          finish: "Mate Natural",
          designPreview: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=300"
        }
      }
    ]
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-500/30",
    Shipped: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-500/30",
    Processing: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-500/30",
    Cancelled: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-500/30"
  };

  const icons = {
    Delivered: CheckCircle,
    Shipped: Truck,
    Processing: Clock,
    Cancelled: RefreshCcw
  };

  const Icon = icons[status as keyof typeof icons] || Package;
  const label = status === 'Delivered' ? 'Entregado' : status === 'Shipped' ? 'En Camino' : status === 'Processing' ? 'En Producción' : status;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ring-1 ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

export const OrdersList = () => {
  const { session } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Processing' | 'Shipped' | 'Delivered'>('All');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceOrderId, setInvoiceOrderId] = useState<string | undefined>(undefined);

  // ── Live orders from Medusa ──
  const [liveOrders, setLiveOrders] = useState<typeof MOCK_ORDERS | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!session?.access_token) {
      setLoadingOrders(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const resp = await fetch('/api/account/orders?limit=50', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.orders?.length > 0) {
            setLiveOrders(data.orders);
            setIsLive(true);
          }
        }
      } catch (err) {
        console.warn('[OrdersList] Failed to fetch live orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [session?.access_token]);

  const ORDERS = isLive ? liveOrders! : MOCK_ORDERS;

  // Filter Logic
  const filteredOrders = ORDERS.filter(order => {
    if (filterStatus === 'All') return true;
    return order.status === filterStatus;
  });

  // Calculate Analytics based on ALL orders, not filtered
  const totalOrders = ORDERS.length;
  const totalSpentValue = ORDERS.reduce((acc, order) => {
    return acc + parseFloat(order.total.replace(/[^0-9.-]+/g, ""));
  }, 0);
  const avgOrderValue = totalSpentValue / totalOrders;

  const totalSpentFormatted = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(totalSpentValue);
  const avgOrderFormatted = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(avgOrderValue);

  if (loadingOrders) {
    return (
      <div className="flex items-center justify-center py-20 text-wood-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Cargando pedidos...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Live data indicator */}
      <div className={`flex items-center gap-1.5 text-[10px] ${
        isLive ? 'text-green-600' : 'text-wood-400'
      }`}>
        {isLive ? <Wifi size={10} /> : <WifiOff size={10} />}
        {isLive ? `${ORDERS.length} pedidos reales` : 'Datos de demostración'}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-wood-900 p-5 rounded-2xl border border-wood-100 dark:border-wood-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-wood-50 dark:bg-wood-800 rounded-xl flex items-center justify-center text-wood-900 dark:text-sand-100">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-wood-500 dark:text-wood-400 uppercase tracking-wider">Total Pedidos</p>
            <h3 className="text-2xl font-serif text-wood-900 dark:text-sand-100">{totalOrders}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-wood-900 p-5 rounded-2xl border border-wood-100 dark:border-wood-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-wood-50 dark:bg-wood-800 rounded-xl flex items-center justify-center text-wood-900 dark:text-sand-100">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-wood-500 dark:text-wood-400 uppercase tracking-wider">Inversión Total</p>
            <h3 className="text-2xl font-serif text-wood-900 dark:text-sand-100">{totalSpentFormatted}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-wood-900 p-5 rounded-2xl border border-wood-100 dark:border-wood-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-wood-50 dark:bg-wood-800 rounded-xl flex items-center justify-center text-wood-900 dark:text-sand-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-wood-500 dark:text-wood-400 uppercase tracking-wider">Ticket Promedio</p>
            <h3 className="text-2xl font-serif text-wood-900 dark:text-sand-100">{avgOrderFormatted}</h3>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100 transition-colors">Historial de Pedidos</h2>
          
          {/* Functional Filter */}
          <div className="flex p-1 bg-wood-100/50 dark:bg-wood-800/50 rounded-xl overflow-hidden">
            {[
              { id: 'All', label: 'Todos' },
              { id: 'Processing', label: 'En Producción' },
              { id: 'Shipped', label: 'En Camino' },
              { id: 'Delivered', label: 'Entregados' }
            ].map(filter => (
              <button 
                key={filter.id}
                onClick={() => setFilterStatus(filter.id as any)}
                className={`relative px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${
                  filterStatus === filter.id 
                    ? 'bg-white dark:bg-wood-900 text-wood-900 dark:text-sand-100 shadow-sm' 
                    : 'text-wood-500 dark:text-wood-400 hover:text-wood-800 dark:hover:text-sand-200 hover:bg-white/50 dark:hover:bg-wood-700/50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-wood-900 rounded-2xl border border-wood-100 dark:border-wood-800">
            <Search className="w-12 h-12 text-wood-300 dark:text-wood-600 mx-auto mb-4" />
            <p className="text-wood-500 dark:text-wood-400 font-medium">No se encontraron pedidos con este filtro.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-wood-900 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-wood-100 dark:border-wood-800 overflow-hidden transition-colors">
            {/* Desktop Headers */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-wood-50/50 dark:bg-wood-800/50 border-b border-wood-100 dark:border-wood-800 text-[10px] uppercase tracking-widest font-bold text-wood-500 dark:text-wood-400 transition-colors">
              <div className="col-span-2">Pedido</div>
              <div className="col-span-3">Fecha</div>
              <div className="col-span-3">Estado</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-2"></div>
            </div>

            <div className="divide-y divide-wood-100 dark:divide-wood-800">
              {filteredOrders.map((order) => (
                <div 
                  key={order.id}
                  className={`group transition-colors duration-200 ${selectedOrder === order.id ? 'bg-wood-50/50 dark:bg-wood-800/30' : 'bg-white dark:bg-wood-900 hover:bg-wood-50/30 dark:hover:bg-wood-800/20'}`}
                >
                  {/* Order Row */}
                  <div 
                    className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center cursor-pointer"
                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                  >
                    <div className="col-span-12 md:col-span-2 flex justify-between md:block">
                      <span className="md:hidden text-xs font-bold text-wood-400 dark:text-wood-500 uppercase tracking-wider transition-colors">Pedido</span>
                      <span className="font-mono text-wood-900 dark:text-sand-100 font-medium transition-colors">#{order.id}</span>
                    </div>
                    
                    <div className="col-span-12 md:col-span-3 flex justify-between md:block">
                      <span className="md:hidden text-xs font-bold text-wood-400 dark:text-wood-500 uppercase tracking-wider transition-colors">Fecha</span>
                      <span className="text-wood-600 dark:text-sand-300 text-sm font-medium transition-colors">{order.date}</span>
                    </div>

                    <div className="col-span-12 md:col-span-3 flex justify-between md:block">
                      <span className="md:hidden text-xs font-bold text-wood-400 dark:text-wood-500 uppercase tracking-wider transition-colors">Estado</span>
                      <div><StatusBadge status={order.status} /></div>
                    </div>

                    <div className="col-span-12 md:col-span-2 flex justify-between md:block md:text-right">
                      <span className="md:hidden text-xs font-bold text-wood-400 dark:text-wood-500 uppercase tracking-wider transition-colors">Total</span>
                      <span className="font-serif text-wood-900 dark:text-sand-100 text-lg transition-colors">{order.total}</span>
                    </div>

                    <div className="col-span-12 md:col-span-2 flex justify-end">
                      <div className={`p-2 rounded-full transition-all duration-300 ${selectedOrder === order.id ? 'bg-wood-900 text-sand-50 dark:bg-sand-100 dark:text-wood-900 rotate-90' : 'bg-wood-50 text-wood-400 dark:bg-wood-800 dark:text-wood-400 group-hover:bg-wood-200 group-hover:text-wood-900 dark:group-hover:bg-wood-700 dark:group-hover:text-sand-100'}`}>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <AnimatePresence>
                    {selectedOrder === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-wood-50/30 dark:bg-wood-800/10"
                      >
                        <div className="p-6 md:p-8 border-t border-wood-100 dark:border-wood-800">
                          
                          {/* Order Timeline */}
                          <div className="mb-10 px-2">
                            <h4 className="text-xs font-bold text-wood-900 dark:text-sand-100 uppercase tracking-widest mb-6 transition-colors">Progreso del Pedido</h4>
                            <div className="relative flex justify-between">
                              {/* Connector Line */}
                              <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-wood-200 dark:bg-wood-700 -z-0"></div>
                              
                              {order.timeline.map((step, idx) => (
                                <div key={idx} className="relative z-10 flex flex-col items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                                    step.completed 
                                      ? 'bg-wood-900 border-wood-900 dark:bg-sand-100 dark:border-sand-100 text-sand-50 dark:text-wood-900' 
                                      : 'bg-white dark:bg-wood-800 border-wood-200 dark:border-wood-600 text-wood-300 dark:text-wood-600'
                                  }`}>
                                    {step.completed ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current opacity-50" />}
                                  </div>
                                  <p className="mt-2 text-xs font-bold text-wood-900 dark:text-sand-100 uppercase tracking-wide">{step.step}</p>
                                  <p className="text-[10px] text-wood-500 dark:text-wood-400">{step.date}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left: Items with Customization */}
                            <div className="flex-1 space-y-8">
                              <h4 className="text-xs font-bold text-wood-900 dark:text-sand-100 uppercase tracking-widest border-b border-wood-200 dark:border-wood-700 pb-2 transition-colors">Artículos del Pedido</h4>
                              <div className="space-y-6">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="bg-white dark:bg-wood-800 p-5 rounded-xl border border-wood-100/50 dark:border-wood-700 shadow-sm transition-colors">
                                      <div className="flex gap-5 items-start">
                                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-wood-100 dark:bg-wood-700 shrink-0 transition-colors group relative cursor-pointer">
                                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Search className="w-6 h-6 text-white" />
                                          </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <p className="font-serif text-lg text-wood-900 dark:text-sand-100 transition-colors">{item.name}</p>
                                              <p className="text-sm text-wood-500 dark:text-wood-400 mt-1 transition-colors">Cant: {item.quantity} × <span className="font-medium text-wood-900 dark:text-sand-200">{item.price}</span></p>
                                            </div>
                                            <button className="text-xs font-bold uppercase tracking-widest text-wood-400 hover:text-wood-900 dark:text-wood-500 dark:hover:text-sand-100 hover:underline transition-colors">
                                              Reseñar
                                            </button>
                                          </div>

                                          {/* Customization Details */}
                                          {item.customization && (
                                            <div className="mt-4 pt-4 border-t border-wood-100 dark:border-wood-700/50">
                                              <p className="text-xs font-bold text-wood-400 dark:text-wood-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                <PenTool className="w-3 h-3" /> Personalizaciones Aplicadas
                                              </p>
                                              
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                  {item.customization.wood && (
                                                    <div className="flex items-center gap-2 text-sm text-wood-600 dark:text-sand-300">
                                                      <div className="w-4 h-4 rounded-full bg-amber-800 border border-white/20 shadow-sm" title="Wood Type"></div>
                                                      <span>{item.customization.wood}</span>
                                                    </div>
                                                  )}
                                                  {item.customization.dimensions && (
                                                    <div className="flex items-center gap-2 text-sm text-wood-600 dark:text-sand-300">
                                                      <Ruler className="w-4 h-4 text-wood-400" />
                                                      <span>{item.customization.dimensions}</span>
                                                    </div>
                                                  )}
                                                  {'engraving' in item.customization && item.customization.engraving && (
                                                    <div className="flex items-center gap-2 text-sm text-wood-600 dark:text-sand-300">
                                                      <span className="font-serif italic text-wood-500">" {'engraving' in item.customization ? item.customization.engraving : ''} "</span>
                                                    </div>
                                                  )}
                                                </div>

                                                {/* Design Preview */}
                                                {item.customization.designPreview && (
                                                  <div className="relative group/preview">
                                                    <div className="text-[10px] font-bold uppercase tracking-wide text-wood-400 mb-1 flex items-center gap-1">
                                                      <ImageIcon className="w-3 h-3" /> Diseño Enviado
                                                    </div>
                                                    <div className="h-20 w-full bg-wood-50 dark:bg-wood-900 rounded-lg overflow-hidden border border-wood-100 dark:border-wood-700 relative">
                                                       <img src={item.customization.designPreview} alt="Design Preview" className="w-full h-full object-cover opacity-80 group-hover/preview:opacity-100 transition-opacity" />
                                                       <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/preview:bg-black/10 transition-colors cursor-pointer">
                                                          <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover/preview:opacity-100 transform translate-y-2 group-hover/preview:translate-y-0 transition-all" />
                                                       </div>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>

                            {/* Right: Actions & Info */}
                            <div className="w-full lg:w-80 space-y-6">
                              {order.tracking && (
                                <div className="bg-white dark:bg-wood-800 p-5 rounded-xl border border-wood-100 dark:border-wood-700 shadow-sm transition-colors">
                                  <div className="flex items-start justify-between mb-4">
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-wood-400 dark:text-wood-500 mb-1 transition-colors">Guía de Rastreo</p>
                                      <p className="font-mono text-lg text-wood-900 dark:text-sand-100 transition-colors">{order.tracking}</p>
                                    </div>
                                    <Truck className="w-5 h-5 text-wood-300 dark:text-wood-600 transition-colors" />
                                  </div>
                                  <button className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest bg-wood-50 hover:bg-wood-100 dark:bg-wood-700 dark:hover:bg-wood-600 text-wood-900 dark:text-sand-100 rounded-lg transition-colors">
                                    Rastrear Envío <ExternalLink className="w-3 h-3" />
                                  </button>
                                </div>
                              )}

                              <div className="flex flex-col gap-3">
                                <button className="w-full py-3 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-xl hover:bg-wood-800 dark:hover:bg-sand-200 transition-colors text-sm font-bold tracking-wide shadow-lg shadow-wood-900/10 dark:shadow-none flex items-center justify-center gap-2">
                                  Volver a Comprar <ArrowRight className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => {
                                    setInvoiceOrderId(order.id);
                                    setShowInvoiceModal(true);
                                  }}
                                  className="w-full py-3 bg-transparent border border-wood-200 dark:border-wood-700 text-wood-600 dark:text-sand-300 rounded-xl hover:border-wood-900 dark:hover:border-sand-100 hover:text-wood-900 dark:hover:text-sand-100 transition-all text-sm font-medium flex items-center justify-center gap-2 group/btn"
                                >
                                  <Receipt className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform" /> Solicitar Factura
                                </button>
                                <button className="w-full py-3 text-wood-500 hover:text-wood-900 dark:text-wood-400 dark:hover:text-sand-200 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                  <FileText className="w-3 h-3" /> Ver detalles completos
                                </button>
                              </div>
                            </div>
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
      </div>

      {showInvoiceModal && (
        <InvoiceRequestModal 
          orderId={invoiceOrderId} 
          onClose={() => {
            setShowInvoiceModal(false);
            setInvoiceOrderId(undefined);
          }} 
        />
      )}
    </div>
  );
};
