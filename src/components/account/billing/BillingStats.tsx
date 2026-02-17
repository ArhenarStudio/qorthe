import React from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, FileText, Table, TrendingUp } from 'lucide-react';

export const BillingStats = () => {
  const data = [
    { month: 'Ene', amount: 4500 },
    { month: 'Feb', amount: 3200 },
    { month: 'Mar', amount: 6800 },
    { month: 'Abr', amount: 5100 },
    { month: 'May', amount: 4200 },
    { month: 'Jun', amount: 7500 },
    { month: 'Jul', amount: 6100 },
    { month: 'Ago', amount: 5900 },
    { month: 'Sep', amount: 8200 },
    { month: 'Oct', amount: 7100 },
    { month: 'Nov', amount: 9500 },
    { month: 'Dic', amount: 11000 },
  ];

  const totalAnnual = data.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-wood-900 p-8 rounded-2xl border border-wood-100 dark:border-wood-800 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-xl font-serif text-wood-900 dark:text-sand-100">Facturación Anual</h3>
              <p className="text-sm text-wood-500 dark:text-sand-400 mt-1">Enero - Diciembre 2024</p>
            </div>
            <div className="text-right">
              <span className="block text-3xl font-serif text-wood-900 dark:text-sand-100 tracking-tight">
                ${totalAnnual.toLocaleString('es-MX')}
              </span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full inline-flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +12.5% vs año anterior
              </span>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-wood-200)" opacity={0.2} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-wood-500)', fontSize: 12, fontWeight: 500 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-wood-400)', fontSize: 11 }} 
                  tickFormatter={(value) => `$${value/1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ color: '#5B4B49', fontWeight: 600, fontSize: '14px' }}
                  labelStyle={{ color: '#8D7F7D', fontSize: '12px', marginBottom: '4px' }}
                  formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString()}`, 'Facturado'] as [string, string]}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} animationDuration={1500}>
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === data.length - 1 ? '#5B4B49' : '#D7CCC8'} 
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actions Side */}
        <div className="space-y-6">
           <div className="bg-wood-50 dark:bg-wood-800/50 p-6 rounded-2xl border border-wood-100 dark:border-wood-800 h-full">
            <h3 className="text-sm font-bold text-wood-400 dark:text-sand-500 uppercase tracking-widest mb-6 border-b border-wood-200 dark:border-wood-700 pb-4">
              Exportar Reportes
            </h3>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-wood-900 border border-wood-200 dark:border-wood-700 hover:border-wood-400 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-wood-900 dark:text-sand-100 text-sm">Reporte Anual PDF</p>
                    <p className="text-xs text-wood-500 mt-0.5">Resumen fiscal completo</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-wood-400 group-hover:text-wood-900 transition-colors" />
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-wood-900 border border-wood-200 dark:border-wood-700 hover:border-wood-400 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl group-hover:scale-110 transition-transform">
                    <Table className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-wood-900 dark:text-sand-100 text-sm">Exportar CSV</p>
                    <p className="text-xs text-wood-500 mt-0.5">Formato contable (Excel)</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-wood-400 group-hover:text-wood-900 transition-colors" />
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-wood-200 dark:border-wood-700">
               <p className="text-xs text-wood-400 dark:text-sand-500 text-center leading-relaxed">
                 * Los reportes generados incluyen desglose de IVA y retenciones aplicables según el régimen fiscal seleccionado.
               </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
