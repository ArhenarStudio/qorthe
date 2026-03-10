"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowUpDown, Upload, Download, FileSpreadsheet, Database, Check,
  AlertTriangle, ChevronRight, ArrowRight, X, RefreshCw,
  Package, Users, ShoppingBag, Star, FolderTree, Clock, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminTheme } from '@/src/contexts/AdminThemeContext';
import { Card as TCard, Badge as TBadge, Button as TButton, StatCard as TStatCard, Table as TTable } from '@/src/theme/primitives';

// ===== TYPES =====
type IETab = 'import' | 'export' | 'migrate' | 'history';

interface ImportJob {
  id: string;
  type: 'products' | 'customers' | 'orders' | 'categories' | 'reviews';
  source: string;
  date: string;
  status: 'completed' | 'failed' | 'partial';
  imported: number;
  errors: number;
  skipped: number;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={'bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] shadow-sm ' + className}>{children}</div>;
}

// ===== IMPORT TAB =====
function ImportTab() {
  const [step, setStep] = useState(0); // 0: select type, 1: upload, 2: mapping, 3: preview, 4: importing, 5: done
  const [importType, setImportType] = useState<string | null>(null);

  const dataTypes = [
    { id: 'products', label: 'Productos', icon: Package, desc: 'Nombre, precio, imagenes, variantes, SKU, stock', count: '54 columnas' },
    { id: 'customers', label: 'Clientes', icon: Users, desc: 'Nombre, email, direccion, historial', count: '18 columnas' },
    { id: 'orders', label: 'Pedidos (historico)', icon: ShoppingBag, desc: 'Historial de pedidos para reportes', count: '32 columnas' },
    { id: 'categories', label: 'Categorias', icon: FolderTree, desc: 'Arbol de categorias y subcategorias', count: '8 columnas' },
    { id: 'reviews', label: 'Reviews', icon: Star, desc: 'Calificaciones y comentarios de clientes', count: '10 columnas' },
  ];

  const formats = [
    { id: 'csv', label: 'CSV', desc: 'Archivo separado por comas (.csv)' },
    { id: 'excel', label: 'Excel', desc: 'Hoja de calculo (.xlsx)', recommended: true },
    { id: 'json', label: 'JSON', desc: 'Formato JSON (.json)' },
  ];

  const sampleMapping = [
    { source: 'product_name', target: 'Nombre', mapped: true },
    { source: 'price', target: 'Precio', mapped: true },
    { source: 'sku_code', target: 'SKU', mapped: true },
    { source: 'stock_qty', target: 'Stock', mapped: true },
    { source: 'description_html', target: 'Descripcion', mapped: true },
    { source: 'img_url', target: 'Imagen principal', mapped: true },
    { source: 'weight_kg', target: 'Peso', mapped: true },
    { source: 'custom_field_1', target: '—', mapped: false },
  ];

  if (step === 0) {
    return (
      <div className="space-y-4">
        <p className="text-xs text-[var(--text-muted)]">Selecciona que datos quieres importar:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dataTypes.map(dt => (
            <button key={dt.id} onClick={() => { setImportType(dt.id); setStep(1); }}
              className="p-4 border border-[var(--border)] rounded-[var(--radius-card)] text-left hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all group">
              <dt.icon size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] mb-2" />
              <p className="text-xs font-medium text-[var(--text)]">{dt.label}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{dt.desc}</p>
              <p className="text-[9px] text-[var(--text-muted)] mt-1">{dt.count}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="space-y-4">
        <StepIndicator current={1} />
        <Card className="p-6 text-center">
          <Upload size={32} className="text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-sm font-serif text-[var(--text)] mb-1">Sube tu archivo de {dataTypes.find(d => d.id === importType)?.label}</p>
          <p className="text-xs text-[var(--text-muted)] mb-4">Formatos aceptados: CSV, Excel (.xlsx), JSON</p>
          <div className="flex flex-col items-center gap-3">
            <div className="border-2 border-dashed border-[var(--border)] rounded-[var(--radius-card)] p-8 w-full max-w-md hover:border-[var(--accent)]/50 transition-colors cursor-pointer">
              <input type="file" className="hidden" id="import-file" />
              <label htmlFor="import-file" className="cursor-pointer text-center">
                <FileSpreadsheet size={24} className="text-[var(--text-muted)] mx-auto mb-2" />
                <p className="text-xs text-[var(--text-secondary)]">Arrastra un archivo aqui o haz clic para seleccionar</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">Tamano maximo: 50MB</p>
              </label>
            </div>
            <button onClick={() => setStep(2)} className="px-4 py-2 text-xs bg-[var(--accent)] text-white rounded-[var(--radius-card)] hover:bg-[var(--accent)]/90 transition-colors">
              Subir y continuar
            </button>
            <button onClick={() => toast.success('Template descargado')} className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1">
              <Download size={10} /> Descargar template de Excel
            </button>
          </div>
        </Card>
        <button onClick={() => setStep(0)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] flex items-center gap-1"><X size={10} /> Cancelar</button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-4">
        <StepIndicator current={2} />
        <Card className="p-5">
          <h4 className="text-xs font-medium text-[var(--text)] mb-1">Mapeo de columnas</h4>
          <p className="text-[10px] text-[var(--text-muted)] mb-4">Verifica que las columnas de tu archivo coincidan con los campos del sistema.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                  <th className="px-3 py-2">Columna del archivo</th>
                  <th className="px-3 py-2 text-center"><ArrowRight size={10} className="inline" /></th>
                  <th className="px-3 py-2">Campo del sistema</th>
                  <th className="px-3 py-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wood-50">
                {sampleMapping.map((m, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-xs font-mono text-[var(--text)]">{m.source}</td>
                    <td className="px-3 py-2 text-center"><ArrowRight size={10} className="text-[var(--text-muted)]" /></td>
                    <td className="px-3 py-2">
                      <select defaultValue={m.target} className="border border-[var(--border)] rounded px-2 py-1 text-xs bg-[var(--surface)] w-40">
                        <option value="—">— No mapear —</option>
                        {['Nombre', 'Precio', 'SKU', 'Stock', 'Descripcion', 'Imagen principal', 'Peso', 'Categoria', 'Madera', 'Variantes'].map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      {m.mapped ? <span className="text-[10px] text-[var(--success)] flex items-center gap-1"><Check size={10} /> Mapeado</span>
                        : <span className="text-[10px] text-amber-500 flex items-center gap-1"><AlertTriangle size={10} /> Sin mapear</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="flex gap-2">
          <button onClick={() => setStep(1)} className="px-3 py-2 text-xs border border-[var(--border)] text-[var(--text-secondary)] rounded-[var(--radius-card)]">Atras</button>
          <button onClick={() => setStep(3)} className="px-4 py-2 text-xs bg-[var(--accent)] text-white rounded-[var(--radius-card)]">Continuar</button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="space-y-4">
        <StepIndicator current={3} />
        <Card className="p-5">
          <h4 className="text-xs font-medium text-[var(--text)] mb-1">Preview de datos</h4>
          <p className="text-[10px] text-[var(--text-muted)] mb-4">Revisa los datos antes de importar.</p>
          <div className="bg-[var(--surface2)] rounded-[var(--radius-card)] p-4 space-y-2">
            <div className="flex items-center gap-3">
              <CheckCircle size={14} className="text-[var(--success)]" />
              <span className="text-xs text-[var(--text)]">48 registros listos para importar</span>
            </div>
            <div className="flex items-center gap-3">
              <AlertTriangle size={14} className="text-amber-500" />
              <span className="text-xs text-[var(--text)]">3 registros con advertencias (campos opcionales vacios)</span>
            </div>
            <div className="flex items-center gap-3">
              <X size={14} className="text-[var(--error)]" />
              <span className="text-xs text-[var(--text)]">1 registro con errores (precio invalido)</span>
            </div>
          </div>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2">Precio</th>
                  <th className="px-3 py-2">SKU</th>
                  <th className="px-3 py-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wood-50 text-xs">
                {[
                  { n: 'Tabla Parota XL', p: '$3,200', sku: 'TP-XL-001', ok: true },
                  { n: 'Bowl Maple Mini', p: '$450', sku: 'BM-001', ok: true },
                  { n: 'Set Cubiertos Pack', p: 'N/A', sku: 'SC-PK-001', ok: false },
                ].map((r, i) => (
                  <tr key={i} className={!r.ok ? 'bg-[var(--error-subtle)]/50' : ''}>
                    <td className="px-3 py-2 text-[var(--text-muted)]">{i + 1}</td>
                    <td className="px-3 py-2 text-[var(--text)]">{r.n}</td>
                    <td className="px-3 py-2 text-[var(--text)]">{r.p}</td>
                    <td className="px-3 py-2 font-mono text-[var(--text-secondary)]">{r.sku}</td>
                    <td className="px-3 py-2">{r.ok ? <span className="text-[var(--success)] text-[10px]">✓ OK</span> : <span className="text-[var(--error)] text-[10px]">✗ Error</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-[var(--text-muted)] mt-2 px-3">Mostrando 3 de 52 registros</p>
          </div>
        </Card>
        <div className="flex gap-2">
          <button onClick={() => setStep(2)} className="px-3 py-2 text-xs border border-[var(--border)] text-[var(--text-secondary)] rounded-[var(--radius-card)]">Atras</button>
          <button onClick={() => setStep(4)} className="px-4 py-2 text-xs bg-[var(--accent)] text-white rounded-[var(--radius-card)] flex items-center gap-1.5">
            <Upload size={12} /> Importar 48 registros
          </button>
        </div>
      </div>
    );
  }

  if (step === 4) {
    // Simular importacion
    setTimeout(() => setStep(5), 2000);
    return (
      <div className="space-y-4">
        <StepIndicator current={4} />
        <Card className="p-8 text-center">
          <RefreshCw size={24} className="text-[var(--accent)] mx-auto mb-3 animate-spin" />
          <p className="text-sm font-serif text-[var(--text)]">Importando datos...</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Procesando 48 registros</p>
          <div className="w-full max-w-xs mx-auto mt-4 h-2 bg-[var(--surface2)] rounded-[var(--radius-badge)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
              className="h-full bg-[var(--accent)] rounded-[var(--radius-badge)]"
            />
          </div>
        </Card>
      </div>
    );
  }

  // step === 5: done
  return (
    <div className="space-y-4">
      <StepIndicator current={5} />
      <Card className="p-8 text-center">
        <div className="w-12 h-12 rounded-[var(--radius-badge)] bg-[var(--success-subtle)] flex items-center justify-center mx-auto mb-3">
          <CheckCircle size={24} className="text-[var(--success)]" />
        </div>
        <p className="text-sm font-serif text-[var(--text)]">Importacion completada</p>
        <div className="flex justify-center gap-6 mt-4 text-center">
          <div>
            <p className="text-lg font-serif text-[var(--success)]">48</p>
            <p className="text-[10px] text-[var(--text-muted)]">Importados</p>
          </div>
          <div>
            <p className="text-lg font-serif text-amber-500">3</p>
            <p className="text-[10px] text-[var(--text-muted)]">Advertencias</p>
          </div>
          <div>
            <p className="text-lg font-serif text-[var(--error)]">1</p>
            <p className="text-[10px] text-[var(--text-muted)]">Errores</p>
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => { setStep(0); setImportType(null); }} className="px-4 py-2 text-xs bg-[var(--accent)] text-white rounded-[var(--radius-card)]">Nueva importacion</button>
          <button onClick={() => toast.success('Reporte descargado')} className="px-4 py-2 text-xs border border-[var(--border)] text-[var(--text-secondary)] rounded-[var(--radius-card)] flex items-center gap-1"><Download size={10} /> Descargar reporte</button>
        </div>
      </Card>
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  const steps = ['Archivo', 'Mapeo', 'Preview', 'Importar', 'Listo'];
  return (
    <div className="flex items-center gap-1 mb-2">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={'flex items-center gap-1 text-[10px] ' + (i + 1 <= current ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-muted)]')}>
            <span className={'w-4 h-4 rounded-[var(--radius-badge)] flex items-center justify-center text-[8px] font-bold ' + (i + 1 < current ? 'bg-[var(--accent)] text-white' : i + 1 === current ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--surface2)] text-[var(--text-muted)]')}>{i + 1 < current ? '✓' : i + 1}</span>
            <span className="hidden sm:inline">{s}</span>
          </div>
          {i < steps.length - 1 && <div className={'flex-1 h-px max-w-8 ' + (i + 1 < current ? 'bg-[var(--accent)]' : 'bg-wood-200')} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ===== EXPORT TAB =====
function ExportTab() {
  const sections = [
    { id: 'products', label: 'Productos', icon: Package, count: 127, desc: 'Todos los productos con variantes, precios, stock' },
    { id: 'customers', label: 'Clientes', icon: Users, count: 248, desc: 'Clientes registrados con datos de contacto' },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag, count: 165, desc: 'Historial completo de pedidos' },
    { id: 'categories', label: 'Categorias', icon: FolderTree, count: 12, desc: 'Arbol de categorias' },
    { id: 'reviews', label: 'Reviews', icon: Star, count: 89, desc: 'Todas las resenas de clientes' },
    { id: 'full', label: 'Backup completo', icon: Database, count: null, desc: 'Exportar TODOS los datos del negocio' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--text-muted)]">Selecciona que datos quieres exportar:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map(s => (
          <Card key={s.id} className="p-4 hover:border-[var(--accent)]/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-[var(--radius-card)] bg-[var(--accent)]/10 flex items-center justify-center">
                <s.icon size={16} className="text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--text)]">{s.label}</p>
                {s.count && <p className="text-[10px] text-[var(--text-muted)]">{s.count} registros</p>}
              </div>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mb-3">{s.desc}</p>
            <div className="flex gap-1.5">
              {['CSV', 'Excel', 'JSON'].map(f => (
                <button key={f} onClick={() => toast.success(`${s.label} exportados como ${f}`)}
                  className="flex-1 px-2 py-1.5 text-[10px] border border-[var(--border)] rounded-[var(--radius-card)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors flex items-center justify-center gap-1">
                  <Download size={8} /> {f}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ===== MIGRATE TAB =====
function MigrateTab() {
  const platforms = [
    { id: 'shopify', name: 'Shopify', desc: 'CSV export estandar', format: 'CSV', supported: ['Productos', 'Clientes', 'Pedidos', 'Categorias'] },
    { id: 'woocommerce', name: 'WooCommerce', desc: 'CSV + XML export', format: 'CSV/XML', supported: ['Productos', 'Clientes', 'Pedidos', 'Reviews'] },
    { id: 'etsy', name: 'Etsy', desc: 'CSV export', format: 'CSV', supported: ['Productos', 'Pedidos'] },
    { id: 'generic', name: 'CSV generico', desc: 'Con mapeo manual de columnas', format: 'CSV', supported: ['Productos', 'Clientes', 'Pedidos', 'Categorias', 'Reviews'] },
    { id: 'excel', name: 'Excel DSD', desc: 'Template oficial de 54 columnas', format: 'XLSX', supported: ['Productos'] },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h4 className="text-xs font-medium text-[var(--text)] mb-1">Migrar desde otra plataforma</h4>
        <p className="text-[10px] text-[var(--text-muted)] mb-4">Importa los datos de tu tienda anterior con un wizard paso a paso.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {platforms.map(p => (
            <button key={p.id} onClick={() => toast.success(`Wizard de migracion desde ${p.name} iniciado`)}
              className="p-4 border border-[var(--border)] rounded-[var(--radius-card)] text-left hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all group">
              <div className="w-10 h-10 rounded-[var(--radius-card)] bg-[var(--surface2)] flex items-center justify-center mb-2">
                <span className="text-sm font-bold text-[var(--text-secondary)]">{p.name[0]}</span>
              </div>
              <p className="text-xs font-medium text-[var(--text)]">{p.name}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{p.desc}</p>
              <p className="text-[9px] text-[var(--text-muted)] mt-1">Formato: {p.format}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {p.supported.map(s => (
                  <span key={s} className="text-[8px] bg-[var(--surface2)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded-[var(--radius-badge)]">{s}</span>
                ))}
              </div>
              <span className="text-[10px] text-[var(--accent)] mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Iniciar migracion <ChevronRight size={10} />
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ===== HISTORY TAB =====
function HistoryTab() {
  const jobs: ImportJob[] = [
    { id: 'IMP-012', type: 'products', source: 'productos_dsd_v3.xlsx', date: '28 Feb 2026, 14:30', status: 'completed', imported: 48, errors: 1, skipped: 3 },
    { id: 'IMP-011', type: 'customers', source: 'clientes_shopify.csv', date: '25 Feb 2026, 10:00', status: 'completed', imported: 124, errors: 0, skipped: 5 },
    { id: 'IMP-010', type: 'products', source: 'catalogo_v2.xlsx', date: '20 Feb 2026, 16:45', status: 'partial', imported: 35, errors: 12, skipped: 0 },
    { id: 'IMP-009', type: 'orders', source: 'pedidos_historico.csv', date: '15 Feb 2026, 09:20', status: 'completed', imported: 165, errors: 0, skipped: 0 },
    { id: 'IMP-008', type: 'categories', source: 'categorias.json', date: '10 Feb 2026, 11:00', status: 'failed', imported: 0, errors: 8, skipped: 0 },
  ];

  const typeLabel: Record<string, string> = { products: 'Productos', customers: 'Clientes', orders: 'Pedidos', categories: 'Categorias', reviews: 'Reviews' };
  const statusCfg: Record<string, { label: string; color: string; bg: string }> = {
    completed: { label: 'Completado', color: 'text-[var(--success)]', bg: 'bg-[var(--success-subtle)]' },
    partial: { label: 'Parcial', color: 'text-amber-600', bg: 'bg-amber-50' },
    failed: { label: 'Fallido', color: 'text-[var(--error)]', bg: 'bg-[var(--error-subtle)]' },
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Archivo</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Importados</th>
              <th className="px-4 py-3">Errores</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wood-50">
            {jobs.map(j => {
              const st = statusCfg[j.status];
              return (
                <tr key={j.id} className="hover:bg-[var(--surface2)]/50">
                  <td className="px-4 py-3 text-xs font-mono text-[var(--text)]">{j.id}</td>
                  <td className="px-4 py-3 text-xs text-[var(--text)]">{typeLabel[j.type]}</td>
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)] font-mono">{j.source}</td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{j.date}</td>
                  <td className="px-4 py-3 text-xs text-[var(--success)] font-medium">{j.imported}</td>
                  <td className="px-4 py-3 text-xs text-[var(--error)]">{j.errors}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-[var(--radius-badge)] ${st.bg} ${st.color}`}>{st.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ===== MAIN =====
export const ImportExportPage: React.FC = () => {

  // ── Live data from API ──
  const [liveExport, setLiveExport] = useState<any>(null);
  const [exportLoading, setExportLoading] = useState(true);
  useEffect(() => {
    fetch('/api/admin/importexport').then(r => r.ok ? r.json() : null).then(d => { if (d) setLiveExport(d); }).catch(() => {}).finally(() => setExportLoading(false));
  }, []);

  const [tab, setTab] = useState<IETab>('import');

  const tabs: Array<{ id: IETab; label: string; icon: React.ElementType }> = [
    { id: 'import', label: 'Importar', icon: Upload },
    { id: 'export', label: 'Exportar', icon: Download },
    { id: 'migrate', label: 'Migrar', icon: RefreshCw },
    { id: 'history', label: 'Historial', icon: Clock },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-serif text-[var(--text)] flex items-center gap-2">
          <ArrowUpDown size={20} className="text-[var(--accent)]" /> Importar / Exportar
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Importa datos, exporta backups o migra desde otra plataforma</p>
      </div>

      <div className="flex gap-1 border-b border-[var(--border)]">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'flex items-center gap-1.5 px-3 py-2.5 text-xs transition-colors border-b-2 ' + (tab === t.id ? 'border-[var(--accent)] text-[var(--accent)] font-medium' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]')}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'import' && <ImportTab />}
      {tab === 'export' && <ExportTab />}
      {tab === 'migrate' && <MigrateTab />}
      {tab === 'history' && <HistoryTab />}
    </div>
  );
};