"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Download, Upload, FileSpreadsheet, FileJson, Check,
  AlertTriangle, File, ArrowLeft, ArrowRight, ChevronDown,
  Info, Loader2, CircleAlert, Lightbulb, RefreshCw,
  FileText, Eye, Image as ImageIcon, BarChart3, Package, Zap
} from 'lucide-react';

/* ================================================================
   MOCK DATA for Import Simulation
   ================================================================ */

interface MockImportRow {
  row: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
  status: 'new' | 'update' | 'error';
  category?: string;
}

const mockImportRows: MockImportRow[] = [
  { row: 1, sku: 'DSD-PAROTA-MED', name: 'Tabla Parota Mediana', price: 850, stock: 15, status: 'update', category: 'Tablas para Cortar' },
  { row: 2, sku: 'DSD-CEDRO-GDE', name: 'Tabla Cedro Grande', price: 1200, stock: 8, status: 'update', category: 'Tablas para Cortar' },
  { row: 3, sku: 'DSD-ROSA-MED', name: 'Tabla Rosa Morada', price: 1650, stock: 2, status: 'update', category: 'Tablas para Cortar' },
  { row: 4, sku: 'DSD-NOGAL-MED', name: 'Tabla Nogal Mediana', price: 950, stock: 20, status: 'new', category: 'Tablas para Cortar' },
  { row: 5, sku: 'DSD-MEZQ-GDE', name: 'Tabla Mezquite Grande', price: 1300, stock: 12, status: 'new', category: 'Tablas para Cortar' },
  { row: 6, sku: 'DSD-TZLM-MED', name: 'Tabla Tzalam Mediana', price: 780, stock: 18, status: 'new', category: 'Tablas para Cortar' },
  { row: 7, sku: 'DSD-SET-5TAB', name: 'Set 5 Tablas Premium', price: 4200, stock: 5, status: 'new', category: 'Sets y Colecciones' },
  { row: 8, sku: 'DSD-PAROTA-XL', name: 'Tabla Parota XL', price: 1800, stock: 6, status: 'new', category: 'Tablas para Cortar' },
];

interface MockColumnMapping {
  fileColumn: string;
  systemField: string;
  status: 'mapped' | 'verify' | 'unmapped';
}

const mockMappings: MockColumnMapping[] = [
  { fileColumn: 'SKU', systemField: 'sku', status: 'mapped' },
  { fileColumn: 'Nombre del producto', systemField: 'nombre', status: 'mapped' },
  { fileColumn: 'Descripcion', systemField: 'descripcion', status: 'mapped' },
  { fileColumn: 'Categoria', systemField: 'categoria', status: 'mapped' },
  { fileColumn: 'Price', systemField: 'precio_venta', status: 'verify' },
  { fileColumn: 'Cost', systemField: 'costo', status: 'verify' },
  { fileColumn: 'Qty', systemField: 'stock', status: 'verify' },
  { fileColumn: 'Peso', systemField: 'peso_kg', status: 'mapped' },
  { fileColumn: 'Tipo Madera', systemField: 'tipo_madera', status: 'mapped' },
  { fileColumn: 'Acabado', systemField: 'acabado', status: 'mapped' },
  { fileColumn: 'Grabado', systemField: 'grabado_laser', status: 'mapped' },
  { fileColumn: 'Imagen URL', systemField: 'imagen_principal_url', status: 'mapped' },
  { fileColumn: 'Tags', systemField: 'tags', status: 'mapped' },
  { fileColumn: 'Columna_Extra_1', systemField: '', status: 'unmapped' },
  { fileColumn: 'Notas', systemField: 'notas_internas', status: 'mapped' },
];

const allSystemFields = [
  '— Ignorar —', 'sku', 'nombre', 'subtitulo', 'descripcion', 'descripcion_corta',
  'estado', 'categoria', 'subcategoria', 'tags', 'coleccion', 'tipo_producto',
  'precio_venta', 'precio_comparar', 'costo', 'moneda', 'iva_incluido',
  'stock', 'codigo_barras', 'punto_reorden', 'rastrear_inventario',
  'permitir_backorder', 'ubicacion_almacen',
  'peso_kg', 'largo_cm', 'ancho_cm', 'alto_cm',
  'peso_empaque_kg', 'largo_empaque_cm', 'ancho_empaque_cm', 'alto_empaque_cm',
  'perfil_envio', 'requiere_envio',
  'tipo_madera', 'acabado', 'grabado_laser', 'area_grabado_ancho_cm',
  'area_grabado_alto_cm', 'artesano', 'tiempo_produccion', 'garantia',
  'instrucciones_cuidado',
  'imagen_principal_url', 'imagen_2_url', 'imagen_3_url', 'imagen_4_url',
  'imagen_5_url', 'video_url',
  'meta_titulo', 'meta_descripcion', 'slug',
  'productos_relacionados', 'upsell', 'crosssell', 'notas_internas',
];

interface MockError { row: number; message: string; type: 'error' | 'warning' }

const mockErrors: MockError[] = [
  { row: 12, message: 'SKU vacio — Cada producto necesita un SKU unico', type: 'error' },
  { row: 23, message: 'Precio "ochocientos" — Debe ser numero (ej: 800.00)', type: 'error' },
  { row: 31, message: 'Categoria "tablas" no existe', type: 'error' },
];

const mockWarnings: MockError[] = [
  { row: 5, message: 'Sin imagen — Se usara placeholder', type: 'warning' },
  { row: 8, message: 'Sin costo — No se calculara margen de ganancia', type: 'warning' },
  { row: 15, message: 'Peso vacio — Se usara 1 kg por defecto', type: 'warning' },
  { row: 22, message: 'URL imagen no accesible — Verificar enlace', type: 'warning' },
  { row: 40, message: 'SKU duplicado con fila 39 — Son variantes?', type: 'warning' },
];

/* ================================================================
   IMPORT WIZARD (Full-page, 5 steps)
   ================================================================ */

interface ImportWizardProps {
  onClose: () => void;
}

export const ImportWizard: React.FC<ImportWizardProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [existingAction, setExistingAction] = useState<'update' | 'skip' | 'ask'>('update');
  const [defaultStatus, setDefaultStatus] = useState<'draft' | 'active'>('draft');
  const [mappings, setMappings] = useState(mockMappings);
  const [progress, setProgress] = useState(0);
  const [progressItems, setProgressItems] = useState<{ sku: string; status: 'done' | 'loading' | 'pending'; label: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const mappedCount = mappings.filter(m => m.status === 'mapped').length;
  const verifyCount = mappings.filter(m => m.status === 'verify').length;
  const unmappedCount = mappings.filter(m => m.status === 'unmapped').length;

  // Simulate progress
  useEffect(() => {
    if (step !== 4) return;
    const items = mockImportRows.map(r => ({
      sku: r.sku,
      status: 'pending' as const,
      label: r.status === 'update' ? `Actualizado (precio, stock)` : 'Creado como borrador',
    }));
    setProgressItems(items);
    setProgress(0);

    let i = 0;
    const interval = setInterval(() => {
      if (i >= items.length) {
        clearInterval(interval);
        setTimeout(() => setStep(5), 600);
        return;
      }
      setProgressItems(prev => prev.map((item, idx) => ({
        ...item,
        status: idx < i ? 'done' : idx === i ? 'loading' : 'pending',
      })));
      setProgress(Math.round(((i + 1) / items.length) * 100));
      i++;
    }, 450);

    return () => clearInterval(interval);
  }, [step]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx'))) {
      setFile(f);
    }
  }, []);

  const updateMapping = (idx: number, field: string) => {
    setMappings(prev => prev.map((m, i) =>
      i === idx ? { ...m, systemField: field, status: field === '' || field === '— Ignorar —' ? 'unmapped' : 'mapped' } : m
    ));
  };

  /* --- Step indicator --- */
  const steps = [
    { num: 1, label: 'Subir archivo' },
    { num: 2, label: 'Mapeo' },
    { num: 3, label: 'Preview' },
    { num: 4, label: 'Importando' },
    { num: 5, label: 'Resultados' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-sand-50 rounded-lg text-wood-400 hover:text-wood-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[10px] text-wood-400 uppercase tracking-wider">Productos</p>
            <h3 className="font-serif text-wood-900">Importacion Masiva de Productos</h3>
          </div>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors ${
                step > s.num ? 'bg-green-100 text-green-600' :
                step === s.num ? 'bg-accent-gold text-white' :
                'bg-wood-100 text-wood-400'
              }`}>
                {step > s.num ? <Check size={12} /> : s.num}
              </div>
              <span className={`text-[11px] hidden sm:inline ${step === s.num ? 'text-wood-900' : 'text-wood-400'}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-px ${step > s.num ? 'bg-green-200' : 'bg-wood-100'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* ========== STEP 1: Upload ========== */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <p className="text-xs text-wood-500">
            Sube un archivo Excel (.xlsx) o CSV (.csv) con tus productos. Puedes crear productos nuevos o actualizar existentes.
          </p>

          {/* Download template */}
          <div className="bg-white rounded-xl border border-wood-100 p-5">
            <h4 className="text-xs text-wood-700 mb-1">Paso 1: Descarga la plantilla</h4>
            <p className="text-[11px] text-wood-400 mb-3">
              Plantilla DavidSon's Design — Incluye todos los campos con ejemplos y una hoja de instrucciones.
            </p>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 bg-sand-50 text-wood-700 text-xs rounded-lg hover:bg-sand-100 transition-colors">
                <Download size={13} /> Descargar Excel (.xlsx)
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-sand-50 text-wood-700 text-xs rounded-lg hover:bg-sand-100 transition-colors">
                <Download size={13} /> Descargar CSV (.csv)
              </button>
            </div>
          </div>

          {/* Drop zone */}
          <div className="bg-white rounded-xl border border-wood-100 p-5">
            <h4 className="text-xs text-wood-700 mb-3">Paso 2: Sube tu archivo</h4>
            <label
              className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                isDragging ? 'border-accent-gold bg-accent-gold/5' :
                file ? 'border-green-300 bg-green-50/50' :
                'border-wood-200 hover:border-accent-gold/40'
              }`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg"><File size={18} className="text-green-600" /></div>
                  <div>
                    <p className="text-xs text-wood-900">{file.name}</p>
                    <p className="text-[10px] text-wood-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={e => { e.preventDefault(); setFile(null); }}
                    className="p-1 text-wood-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={24} className="text-wood-300 mb-2" />
                  <p className="text-xs text-wood-600 mb-1">Arrastra tu archivo aqui</p>
                  <p className="text-[10px] text-wood-400">o haz clic para seleccionar</p>
                  <p className="text-[10px] text-wood-300 mt-2">Formatos: .xlsx, .csv — Max 10MB</p>
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept=".csv,.xlsx"
                onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
              />
            </label>
          </div>

          {/* Import options */}
          <div className="bg-white rounded-xl border border-wood-100 p-5 space-y-4">
            <h4 className="text-xs text-wood-700">Opciones de importacion</h4>

            <div>
              <p className="text-[11px] text-wood-500 mb-2">Que hacer con productos existentes? (mismo SKU)</p>
              <div className="space-y-1.5">
                {[
                  { val: 'update' as const, label: 'Actualizar con los datos del archivo' },
                  { val: 'skip' as const, label: 'Omitir (no modificar existentes)' },
                  { val: 'ask' as const, label: 'Preguntar por cada uno' },
                ].map(opt => (
                  <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="existing" checked={existingAction === opt.val} onChange={() => setExistingAction(opt.val)} className="accent-accent-gold" />
                    <span className="text-xs text-wood-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] text-wood-500 mb-2">Estado por defecto para productos nuevos:</p>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="defStatus" checked={defaultStatus === 'draft'} onChange={() => setDefaultStatus('draft')} className="accent-accent-gold" />
                  <span className="text-xs text-wood-700">Borrador (requiere revision antes de publicar)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="defStatus" checked={defaultStatus === 'active'} onChange={() => setDefaultStatus('active')} className="accent-accent-gold" />
                  <span className="text-xs text-wood-700">Activo (publicar inmediatamente)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Next */}
          <div className="flex justify-end">
            <button
              disabled={!file}
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-wood-900 text-sand-100 text-xs rounded-lg hover:bg-wood-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente <ArrowRight size={13} />
            </button>
          </div>
        </motion.div>
      )}

      {/* ========== STEP 2: Column Mapping ========== */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div className="bg-white rounded-xl border border-wood-100 p-5">
            <h4 className="text-xs text-wood-700 mb-1">Verificar Mapeo de Columnas</h4>
            <p className="text-[11px] text-wood-400 mb-4">
              Detectamos {mappings.length} columnas en tu archivo. Verifica que el mapeo sea correcto.
            </p>

            <div className="overflow-x-auto rounded-xl border border-wood-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
                    <th className="px-4 py-2.5">Tu columna (archivo)</th>
                    <th className="px-4 py-2.5 w-20 text-center">Estado</th>
                    <th className="px-4 py-2.5">Campo en sistema</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-50">
                  {mappings.map((m, i) => (
                    <tr key={i} className="hover:bg-sand-50/30">
                      <td className="px-4 py-2.5 text-xs text-wood-900">{m.fileColumn}</td>
                      <td className="px-4 py-2.5 text-center">
                        {m.status === 'mapped' && <span className="text-green-600 text-[10px]"><Check size={12} className="inline" /> Mapeado</span>}
                        {m.status === 'verify' && <span className="text-amber-500 text-[10px]"><AlertTriangle size={11} className="inline" /> Verificar</span>}
                        {m.status === 'unmapped' && <span className="text-red-400 text-[10px]"><X size={11} className="inline" /> Sin mapear</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <select
                          value={m.systemField || '— Ignorar —'}
                          onChange={e => updateMapping(i, e.target.value)}
                          className={`w-full px-2 py-1.5 text-[11px] border rounded-lg bg-white outline-none ${
                            m.status === 'verify' ? 'border-amber-300 text-amber-700' :
                            m.status === 'unmapped' ? 'border-wood-200 text-wood-400' :
                            'border-wood-200 text-wood-700'
                          }`}
                        >
                          {allSystemFields.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex items-center gap-4 mt-4 text-[11px]">
              <span className="text-green-600"><Check size={11} className="inline" /> Mapeados: {mappedCount}/{mappings.length}</span>
              <span className="text-amber-500"><AlertTriangle size={11} className="inline" /> Verificar: {verifyCount}</span>
              <span className="text-wood-400"><X size={11} className="inline" /> Sin mapear: {unmappedCount} (se ignoraran)</span>
            </div>
          </div>

          {/* Nav */}
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="flex items-center gap-1.5 px-4 py-2 text-xs text-wood-600 hover:text-wood-800 transition-colors">
              <ArrowLeft size={13} /> Volver
            </button>
            <button onClick={() => setStep(3)} className="flex items-center gap-1.5 px-5 py-2.5 bg-wood-900 text-sand-100 text-xs rounded-lg hover:bg-wood-800 transition-colors">
              Siguiente: Preview <ArrowRight size={13} />
            </button>
          </div>
        </motion.div>
      )}

      {/* ========== STEP 3: Preview & Validation ========== */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          {/* Summary card */}
          <div className="bg-white rounded-xl border border-wood-100 p-5">
            <h4 className="text-xs text-wood-700 mb-3 flex items-center gap-1.5">
              <BarChart3 size={13} /> Resumen del archivo
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { label: 'Total de filas', value: '48', color: 'text-wood-900' },
                { label: 'Productos nuevos', value: '35', sub: 'Se crearan como borrador', color: 'text-green-600' },
                { label: 'Productos a actualizar', value: '10', sub: 'SKU existente', color: 'text-blue-600' },
                { label: 'Variantes nuevas', value: '24', color: 'text-wood-600' },
                { label: 'Errores', value: '3', sub: 'Requieren correccion', color: 'text-red-500' },
              ].map(s => (
                <div key={s.label} className="bg-sand-50 rounded-xl p-3 text-center">
                  <p className={`text-lg ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-wood-500">{s.label}</p>
                  {s.sub && <p className="text-[9px] text-wood-400 mt-0.5">{s.sub}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Errors */}
          <div className="bg-white rounded-xl border border-red-100 p-5">
            <h4 className="text-xs text-red-600 mb-3 flex items-center gap-1.5">
              <CircleAlert size={13} /> Errores (deben corregirse) — {mockErrors.length}
            </h4>
            <div className="space-y-2">
              {mockErrors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-[10px]">!</span>
                  <div>
                    <span className="text-wood-400">Fila {err.row}:</span>{' '}
                    <span className="text-wood-700">{err.message}</span>
                    {err.row === 31 && (
                      <button className="ml-2 text-[10px] text-accent-gold hover:underline">Crear nueva?  [Si]</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          <div className="bg-white rounded-xl border border-amber-100 p-5">
            <h4 className="text-xs text-amber-600 mb-3 flex items-center gap-1.5">
              <Lightbulb size={13} /> Advertencias (opcionales) — {mockWarnings.length}
            </h4>
            <div className="space-y-2">
              {mockWarnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center text-[10px]">!</span>
                  <div>
                    <span className="text-wood-400">Fila {w.row}:</span>{' '}
                    <span className="text-wood-600">{w.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data preview */}
          <div className="bg-white rounded-xl border border-wood-100 p-5">
            <h4 className="text-xs text-wood-700 mb-3">Preview de datos (primeras {mockImportRows.length} filas)</h4>
            <div className="overflow-x-auto rounded-xl border border-wood-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
                    <th className="px-3 py-2.5">#</th>
                    <th className="px-3 py-2.5">SKU</th>
                    <th className="px-3 py-2.5">Nombre</th>
                    <th className="px-3 py-2.5">Precio</th>
                    <th className="px-3 py-2.5">Stock</th>
                    <th className="px-3 py-2.5">Est.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-50">
                  {mockImportRows.map(r => (
                    <tr key={r.row} className="hover:bg-sand-50/30">
                      <td className="px-3 py-2 text-xs text-wood-400">{r.row}</td>
                      <td className="px-3 py-2 text-xs text-wood-700 font-mono">{r.sku}</td>
                      <td className="px-3 py-2 text-xs text-wood-900">{r.name}</td>
                      <td className="px-3 py-2 text-xs text-wood-700">${r.price.toLocaleString()}</td>
                      <td className="px-3 py-2 text-xs text-wood-700">{r.stock}</td>
                      <td className="px-3 py-2">
                        {r.status === 'update' && <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">🔄 Actualizar</span>}
                        {r.status === 'new' && <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">🆕 Nuevo</span>}
                        {r.status === 'error' && <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">🔴 Error</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-3 mt-3 text-[10px] text-wood-400">
              <span>🔄 = Actualizar existente</span>
              <span>🆕 = Crear nuevo</span>
              <span>🔴 = Error</span>
            </div>
          </div>

          {/* Nav */}
          <div className="flex justify-between items-center">
            <button onClick={() => setStep(2)} className="flex items-center gap-1.5 px-4 py-2 text-xs text-wood-600 hover:text-wood-800 transition-colors">
              <ArrowLeft size={13} /> Volver
            </button>
            <div className="flex items-center gap-3">
              <p className="text-[10px] text-wood-400">{mockErrors.length} con error se omitiran</p>
              <button onClick={() => setStep(4)} className="flex items-center gap-1.5 px-5 py-2.5 bg-wood-900 text-sand-100 text-xs rounded-lg hover:bg-wood-800 transition-colors">
                <Download size={13} /> Importar 45 productos
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========== STEP 4: Progress ========== */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div className="bg-white rounded-xl border border-wood-100 p-6">
            <h4 className="text-xs text-wood-700 mb-4 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-accent-gold" />
              Importando Productos...
            </h4>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-[11px] text-wood-500 mb-1.5">
                <span>{Math.round(progress * progressItems.length / 100)}/{progressItems.length} productos</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 bg-wood-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent-gold rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Log */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {progressItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {item.status === 'done' && <Check size={12} className="text-green-500 flex-shrink-0" />}
                  {item.status === 'loading' && <Loader2 size={12} className="text-accent-gold animate-spin flex-shrink-0" />}
                  {item.status === 'pending' && <div className="w-3 h-3 rounded-full border border-wood-200 flex-shrink-0" />}
                  <span className={`font-mono ${item.status === 'pending' ? 'text-wood-300' : 'text-wood-700'}`}>{item.sku}</span>
                  <span className="text-wood-400">—</span>
                  <span className={item.status === 'done' ? 'text-green-600' : item.status === 'loading' ? 'text-accent-gold' : 'text-wood-300'}>
                    {item.status === 'loading' ? 'Creando...' : item.status === 'done' ? item.label : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-lg flex items-center gap-2 text-[11px] text-amber-700">
              <AlertTriangle size={12} /> No cierres esta ventana durante la importacion.
            </div>
          </div>
        </motion.div>
      )}

      {/* ========== STEP 5: Results ========== */}
      {step === 5 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          {/* Summary */}
          <div className="bg-white rounded-xl border border-green-200 p-6">
            <h4 className="text-sm text-green-700 mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-full"><Check size={16} className="text-green-600" /></div>
              Importacion Completada
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { icon: <Check size={14} className="text-green-600" />, label: 'Productos creados', value: '35', bg: 'bg-green-50' },
                { icon: <RefreshCw size={14} className="text-blue-600" />, label: 'Productos actualizados', value: '10', bg: 'bg-blue-50' },
                { icon: <X size={14} className="text-red-500" />, label: 'Errores (omitidos)', value: '3', bg: 'bg-red-50' },
                { icon: <ImageIcon size={14} className="text-accent-gold" />, label: 'Imagenes descargadas', value: '42/48', bg: 'bg-accent-gold/10' },
                { icon: <Package size={14} className="text-wood-600" />, label: 'Variantes creadas', value: '24', bg: 'bg-sand-100' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                  <div className="flex justify-center mb-1">{s.icon}</div>
                  <p className="text-lg text-wood-900">{s.value}</p>
                  <p className="text-[10px] text-wood-500">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-wood-400 mt-3 text-center">Tiempo total: 3 min 42 seg</p>
          </div>

          {/* Errors detail */}
          <div className="bg-white rounded-xl border border-wood-100 p-5">
            <h4 className="text-xs text-red-500 mb-3 flex items-center gap-1.5"><CircleAlert size={12} /> Errores</h4>
            <div className="space-y-1.5">
              {mockErrors.map((e, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <span className="text-red-400">🔴</span>
                  <span className="text-wood-400">Fila {e.row}:</span>
                  <span className="text-wood-600">{e.message} — Producto omitido</span>
                </div>
              ))}
            </div>
            <button className="flex items-center gap-1.5 mt-3 text-[11px] text-accent-gold hover:underline">
              <Download size={11} /> Descargar reporte detallado (CSV)
            </button>
          </div>

          {/* Next steps */}
          <div className="bg-white rounded-xl border border-wood-100 p-5">
            <h4 className="text-xs text-wood-700 mb-3">Que sigue?</h4>
            <p className="text-[11px] text-wood-400 mb-4">
              Los 35 productos nuevos se crearon como BORRADOR. Necesitas revisarlos y publicarlos:
            </p>
            <div className="space-y-2">
              <button onClick={onClose} className="w-full flex items-center gap-3 p-3 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors text-left">
                <FileText size={16} className="text-accent-gold flex-shrink-0" />
                <div>
                  <p className="text-xs text-wood-900">Ver productos importados</p>
                  <p className="text-[10px] text-wood-400">Filtra automaticamente borradores</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors text-left">
                <Check size={16} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-wood-900">Publicar todos los borradores</p>
                  <p className="text-[10px] text-wood-400">Hace visibles todos de golpe</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-sand-50 rounded-xl hover:bg-sand-100 transition-colors text-left">
                <ImageIcon size={16} className="text-wood-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-wood-900">Subir imagenes faltantes</p>
                  <p className="text-[10px] text-wood-400">Para los 6 productos sin imagen</p>
                </div>
              </button>
            </div>
          </div>

          {/* Bottom buttons */}
          <div className="flex justify-between">
            <button onClick={onClose} className="px-4 py-2 text-xs text-wood-600 hover:text-wood-800 transition-colors">
              Volver a Productos
            </button>
            <button
              onClick={() => { setStep(1); setFile(null); setProgress(0); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-wood-200 text-wood-600 text-xs rounded-lg hover:bg-sand-50 transition-colors"
            >
              <RefreshCw size={12} /> Nueva importacion
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

/* ================================================================
   EXPORT MODAL (Enhanced with granular column selection)
   ================================================================ */

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  totalProducts: number;
  selectedCount: number;
  filteredCount: number;
  searchQuery?: string;
}

interface ColumnGroup {
  label: string;
  columns: { key: string; label: string; defaultOn: boolean }[];
}

const exportColumnGroups: ColumnGroup[] = [
  {
    label: 'Informacion basica',
    columns: [
      { key: 'sku', label: 'SKU', defaultOn: true },
      { key: 'nombre', label: 'Nombre', defaultOn: true },
      { key: 'descripcion', label: 'Descripcion', defaultOn: true },
      { key: 'descripcion_corta', label: 'Descripcion corta', defaultOn: true },
      { key: 'estado', label: 'Estado', defaultOn: true },
      { key: 'categoria', label: 'Categoria', defaultOn: true },
      { key: 'tags', label: 'Tags', defaultOn: true },
    ],
  },
  {
    label: 'Precios',
    columns: [
      { key: 'precio_venta', label: 'Precio venta', defaultOn: true },
      { key: 'precio_comparar', label: 'Precio comparar', defaultOn: true },
      { key: 'costo', label: 'Costo', defaultOn: true },
      { key: 'margen', label: 'Margen (%)', defaultOn: true },
      { key: 'iva_incluido', label: 'IVA incluido', defaultOn: true },
    ],
  },
  {
    label: 'Inventario',
    columns: [
      { key: 'stock', label: 'Stock', defaultOn: true },
      { key: 'codigo_barras', label: 'Codigo barras', defaultOn: true },
      { key: 'punto_reorden', label: 'Punto reorden', defaultOn: true },
      { key: 'ubicacion', label: 'Ubicacion', defaultOn: true },
    ],
  },
  {
    label: 'Envio',
    columns: [
      { key: 'peso', label: 'Peso', defaultOn: true },
      { key: 'dimensiones', label: 'Dimensiones', defaultOn: true },
      { key: 'perfil_envio', label: 'Perfil envio', defaultOn: true },
    ],
  },
  {
    label: 'Personalizacion',
    columns: [
      { key: 'tipo_madera', label: 'Tipo madera', defaultOn: true },
      { key: 'acabado', label: 'Acabado', defaultOn: true },
      { key: 'grabado_laser', label: 'Grabado laser', defaultOn: true },
      { key: 'artesano', label: 'Artesano', defaultOn: true },
      { key: 'tiempo_produccion', label: 'Tiempo produccion', defaultOn: true },
    ],
  },
  {
    label: 'Multimedia',
    columns: [
      { key: 'imagen_principal', label: 'URL imagen principal', defaultOn: true },
      { key: 'imagenes_extra', label: 'URLs imagenes extra', defaultOn: false },
    ],
  },
  {
    label: 'Estadisticas',
    columns: [
      { key: 'unidades_vendidas', label: 'Unidades vendidas', defaultOn: false },
      { key: 'ingresos_totales', label: 'Ingresos totales', defaultOn: false },
      { key: 'visitas', label: 'Visitas', defaultOn: false },
      { key: 'tasa_conversion', label: 'Tasa conversion', defaultOn: false },
    ],
  },
  {
    label: 'SEO',
    columns: [
      { key: 'meta_titulo', label: 'Meta titulo', defaultOn: false },
      { key: 'meta_descripcion', label: 'Meta descripcion', defaultOn: false },
      { key: 'slug', label: 'Slug', defaultOn: false },
    ],
  },
  {
    label: 'Relaciones',
    columns: [
      { key: 'relacionados', label: 'Relacionados', defaultOn: false },
      { key: 'upsell', label: 'Up-sell', defaultOn: false },
      { key: 'crosssell', label: 'Cross-sell', defaultOn: false },
    ],
  },
];

export const ExportModal: React.FC<ExportModalProps> = ({
  open, onClose, totalProducts, selectedCount, filteredCount, searchQuery,
}) => {
  const [format, setFormat] = useState<'xlsx' | 'csv' | 'json'>('xlsx');
  const [scope, setScope] = useState<'all' | 'selected' | 'filtered' | 'search'>('all');
  const [columns, setColumns] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    exportColumnGroups.forEach(g => g.columns.forEach(c => { init[c.key] = c.defaultOn; }));
    return init;
  });
  const [includeVariants, setIncludeVariants] = useState<'separate' | 'inline'>('separate');

  if (!open) return null;

  const toggle = (key: string) => setColumns(prev => ({ ...prev, [key]: !prev[key] }));
  const selectedColCount = Object.values(columns).filter(Boolean).length;

  const scopeCount = scope === 'all' ? totalProducts :
    scope === 'selected' ? selectedCount :
    scope === 'filtered' ? filteredCount : totalProducts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-wood-100 flex-shrink-0">
          <h3 className="font-serif text-wood-900">Exportar Catalogo de Productos</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-sand-50 rounded-lg text-wood-400">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Format */}
          <div>
            <label className="text-xs text-wood-500 mb-2 block">Formato</label>
            <div className="flex gap-2">
              {(['xlsx', 'csv', 'json'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors ${format === f ? 'bg-wood-900 text-sand-100' : 'bg-sand-50 text-wood-600 hover:bg-sand-100'}`}
                >
                  {f === 'json' ? <FileJson size={13} /> : <FileSpreadsheet size={13} />}
                  {f === 'xlsx' ? 'Excel (.xlsx)' : f === 'csv' ? 'CSV (.csv)' : 'JSON (.json)'}
                </button>
              ))}
            </div>
          </div>

          {/* Scope */}
          <div>
            <label className="text-xs text-wood-500 mb-2 block">Productos a exportar</label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="scope" checked={scope === 'all'} onChange={() => setScope('all')} className="accent-accent-gold" />
                <span className="text-xs text-wood-700">Todos los productos ({totalProducts})</span>
              </label>
              {selectedCount > 0 && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="scope" checked={scope === 'selected'} onChange={() => setScope('selected')} className="accent-accent-gold" />
                  <span className="text-xs text-wood-700">Solo seleccionados ({selectedCount})</span>
                </label>
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="scope" checked={scope === 'filtered'} onChange={() => setScope('filtered')} className="accent-accent-gold" />
                <span className="text-xs text-wood-700">Filtro actual ({filteredCount})</span>
              </label>
              {searchQuery && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="scope" checked={scope === 'search'} onChange={() => setScope('search')} className="accent-accent-gold" />
                  <span className="text-xs text-wood-700">Busqueda actual: "{searchQuery}"</span>
                </label>
              )}
            </div>
          </div>

          {/* Column groups */}
          <div>
            <label className="text-xs text-wood-500 mb-2 block">Columnas a incluir ({selectedColCount} seleccionadas)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {exportColumnGroups.map(group => (
                <div key={group.label}>
                  <p className="text-[10px] text-wood-400 uppercase tracking-wider mb-1.5">{group.label}</p>
                  <div className="space-y-1">
                    {group.columns.map(col => (
                      <label key={col.key} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={columns[col.key] ?? false}
                          onChange={() => toggle(col.key)}
                          className="accent-accent-gold rounded"
                        />
                        <span className="text-[11px] text-wood-700">{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Variants */}
          <div>
            <label className="text-xs text-wood-500 mb-2 block">Variantes</label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="variants" checked={includeVariants === 'separate'} onChange={() => setIncludeVariants('separate')} className="accent-accent-gold" />
                <span className="text-xs text-wood-700">Incluir variantes en hoja separada</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="variants" checked={includeVariants === 'inline'} onChange={() => setIncludeVariants('inline')} className="accent-accent-gold" />
                <span className="text-xs text-wood-700">Incluir variantes como filas del producto padre</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-wood-100 bg-sand-50/50 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-xs text-wood-600 hover:text-wood-800 transition-colors">
            Cancelar
          </button>
          <button
            className="flex items-center gap-1.5 px-5 py-2 bg-wood-900 text-sand-100 text-xs rounded-lg hover:bg-wood-800 transition-colors"
            onClick={onClose}
          >
            <Upload size={12} /> Exportar {scopeCount} productos
          </button>
        </div>
      </div>
    </div>
  );
};
