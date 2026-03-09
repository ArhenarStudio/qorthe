"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Eye, Save, Globe, Plus, X, Star, Trash2, GripVertical,
  AlertTriangle, Check, ChevronDown, Sparkles, ExternalLink,
  Info, Package, Truck, Layers, Scissors, FolderTree, Search as SearchIcon,
  Settings, BarChart3, Image as ImageIcon, DollarSign, FileText
} from 'lucide-react';
import { type Product } from './products/types';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

/* ---------- Types ---------- */

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  dimensions: string;
  weight: number;
}

interface StockHistoryEntry {
  date: string;
  stock: number;
  change: number;
  reason: string;
}

interface ProductFormData {
  name: string;
  subtitle: string;
  description: string;
  shortDescription: string;
  status: 'active' | 'draft' | 'archived';
  showInCatalog: boolean;
  showInSearch: boolean;
  featured: boolean;
  images: string[];
  videoUrl: string;
  price: number;
  comparePrice: number;
  cost: number;
  taxIncluded: boolean;
  sku: string;
  barcode: string;
  stock: number;
  reorderPoint: number;
  safetyStock: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  madeToOrder: boolean;
  warehouseLocation: string;
  requiresShipping: boolean;
  productLength: string;
  productWidth: string;
  productHeight: string;
  productWeight: string;
  packageLength: string;
  packageWidth: string;
  packageHeight: string;
  packageWeight: string;
  shippingProfile: string;
  variants: Variant[];
  variantOption: string;
  laserEngraving: boolean;
  engravingMaxWidth: string;
  engravingMaxHeight: string;
  engravingPositions: string[];
  woodType: string;
  finish: string;
  artisan: string;
  productionTime: 'inStock' | 'madeToOrder' | 'unavailable';
  productionDays: number;
  warranty: string;
  careInstructions: string;
  mainCategory: string;
  subCategory: string;
  tags: string[];
  collections: string[];
  productType: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  autoSeo: boolean;
  relatedProducts: string[];
  upsellProducts: string[];
  crossSellProducts: string[];
  internalNotes: string;
}

const defaultFormData: ProductFormData = {
  name: '', subtitle: '', description: '', shortDescription: '',
  status: 'draft', showInCatalog: true, showInSearch: true, featured: false,
  images: [], videoUrl: '',
  price: 0, comparePrice: 0, cost: 0, taxIncluded: true,
  sku: '', barcode: '', stock: 0, reorderPoint: 5, safetyStock: 3,
  trackInventory: true, allowBackorder: false, madeToOrder: false,
  warehouseLocation: '',
  requiresShipping: true,
  productLength: '', productWidth: '', productHeight: '', productWeight: '',
  packageLength: '', packageWidth: '', packageHeight: '', packageWeight: '',
  shippingProfile: 'nacional',
  variants: [], variantOption: 'Tamaño',
  laserEngraving: false, engravingMaxWidth: '20', engravingMaxHeight: '15',
  engravingPositions: ['Centro'],
  woodType: 'Parota', finish: 'Aceite mineral grado alimenticio',
  artisan: 'Taller DavidSons',
  productionTime: 'inStock', productionDays: 5,
  warranty: '1 año', careInstructions: '',
  mainCategory: '', subCategory: '',
  tags: [], collections: [], productType: '',
  metaTitle: '', metaDescription: '', slug: '', autoSeo: true,
  relatedProducts: [], upsellProducts: [], crossSellProducts: [],
  internalNotes: '',
};



/* ---------- Sections config ---------- */
const sections = [
  { id: 'basic', label: 'Informacion basica', icon: FileText },
  { id: 'media', label: 'Multimedia', icon: ImageIcon },
  { id: 'pricing', label: 'Precios y costos', icon: DollarSign },
  { id: 'inventory', label: 'Inventario', icon: Package },
  { id: 'shipping', label: 'Envio y dimensiones', icon: Truck },
  { id: 'variants', label: 'Variantes', icon: Layers },
  { id: 'customization', label: 'Personalizacion', icon: Scissors },
  { id: 'categories', label: 'Categorias y tags', icon: FolderTree },
  { id: 'seo', label: 'SEO', icon: SearchIcon },
  { id: 'config', label: 'Configuracion', icon: Settings },
  { id: 'stats', label: 'Estadisticas', icon: BarChart3 },
];

/* ---------- Component ---------- */

interface ProductFormProps {
  product?: Product | null;
  onBack: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onBack }) => {
  const isEditing = !!product;

  const [form, setForm] = useState<ProductFormData>(() => {
    if (!product) return defaultFormData;
    return {
      ...defaultFormData,
      name: product.title,
      shortDescription: `Pieza artesanal de ${product.material}. Ideal para presentacion gourmet.`,
      description: `Esta pieza de ${product.material} es elaborada a mano por artesanos mexicanos. Cada tabla es unica, con vetas y tonos naturales que la hacen irrepetible. Perfecta para presentar quesos, charcuteria y aperitivos con estilo.`,
      status: product.status === 'outOfStock' ? 'active' : product.status as 'active' | 'draft',
      price: product.price,
      comparePrice: product.compare_price || 0,
      cost: product.unit_cost,
      sku: product.sku,
      stock: product.stock,
      reorderPoint: product.reorder_point,
      images: [product.thumbnail || "/placeholder.jpg"],
      slug: product.handle,
      metaTitle: `${product.title} | DavidSon's Design`,
      metaDescription: `Pieza artesanal de ${product.material}. Hecha a mano con maderas sustentables.`,
      laserEngraving: product.laser_available,
      woodType: product.material,
      productWeight: product.weight.toString(),
      mainCategory: product.category,
      tags: ['artesanal', product.material.toLowerCase().split(' ')[0]],
      collections: ['Best Sellers'],
      warranty: '1 ano',
      careInstructions: 'Lavar a mano, no sumergir. Aplicar aceite mineral mensualmente.',
      productionDays: product.production_days,
      variants: product.dimensions.includes('×')
        ? [
            { id: 'v1', name: 'Mediana', sku: `${product.sku}-MED`, price: product.price, cost: product.unit_cost, stock: Math.floor(product.stock * 0.6), dimensions: product.dimensions, weight: product.weight },
            { id: 'v2', name: 'Grande', sku: `${product.sku}-GDE`, price: Math.round(product.price * 1.3), cost: Math.round(product.unit_cost * 1.3), stock: Math.floor(product.stock * 0.3), dimensions: '40×30×2.5cm', weight: product.weight * 1.4 },
            { id: 'v3', name: 'XL', sku: `${product.sku}-XL`, price: Math.round(product.price * 1.7), cost: Math.round(product.unit_cost * 1.7), stock: Math.floor(product.stock * 0.1), dimensions: '55×35×3cm', weight: product.weight * 2 },
          ]
        : [],
    };
  });

  const [activeSection, setActiveSection] = useState('basic');
  const [hasChanges, setHasChanges] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [stockAdjust, setStockAdjust] = useState({ qty: 0, reason: 'Produccion completada', note: '' });

  // Live data from API (replaces mock data)
  const [stockHistory, setStockHistory] = useState<StockHistoryEntry[]>([]);
  const [salesChartData, setSalesChartData] = useState<{ day: string; ventas: number }[]>([]);

  useEffect(() => {
    if (!product?.id) return;
    const sku = product.sku || '';
    // Fetch stock history from inventory movements
    fetch(`/api/admin/inventory?action=movements&limit=20&sku=${sku}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.movements) {
          setStockHistory(data.movements.map((m: Record<string, unknown>) => ({
            date: new Date(m.created_at as string).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
            stock: m.new_stock as number,
            change: m.quantity as number,
            reason: (m.notes as string) || `${m.type} ${m.reference || ''}`.trim(),
          })));
        }
      })
      .catch(() => { /* silent */ });
    // Fetch sales data for chart (last 30 days)
    fetch(`/api/admin/inventory?action=movements&limit=200`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.movements) {
          const sales = (data.movements as Record<string, unknown>[]).filter(m => m.type === 'sale');
          const byDay = new Map<string, number>();
          const now = Date.now();
          for (let i = 29; i >= 0; i--) {
            const d = new Date(now - i * 86400000);
            byDay.set(d.toISOString().slice(0, 10), 0);
          }
          sales.forEach((s: Record<string, unknown>) => {
            const key = (s.created_at as string).slice(0, 10);
            if (byDay.has(key)) byDay.set(key, (byDay.get(key) || 0) + Math.abs(s.quantity as number));
          });
          setSalesChartData(Array.from(byDay.entries()).map(([date, ventas]) => ({
            day: new Date(date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
            ventas,
          })));
        }
      })
      .catch(() => { /* silent */ });
  }, [product?.id, product?.sku]);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const update = useCallback(<K extends keyof ProductFormData>(key: K, val: ProductFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setHasChanges(true);
  }, []);

  // Intersection observer for active section tracking
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { root: container, rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Profitability calculations
  const margin = form.price > 0 ? ((form.price - form.cost) / form.price * 100) : 0;
  const grossProfit = form.price - form.cost;
  const stripeCommission = form.price * 0.036;
  const avgShipping = 285;
  const netProfit = grossProfit - stripeCommission - avgShipping;
  const netMargin = form.price > 0 ? (netProfit / form.price * 100) : 0;
  const netProfitFreeShipping = grossProfit - stripeCommission;
  const netMarginFreeShipping = form.price > 0 ? (netProfitFreeShipping / form.price * 100) : 0;
  const ivaAmount = form.taxIncluded && form.price > 0 ? (form.price / 1.16 * 0.16) : 0;

  const seoTitleLen = form.metaTitle.length;
  const seoDescLen = form.metaDescription.length;

  /* === Card wrapper === */
  const Card: React.FC<{ id: string; title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ id, title, icon, children }) => (
    <div id={id} ref={el => { sectionRefs.current[id] = el; }} className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-6 scroll-mt-4">
      <h4 className="flex items-center gap-2 font-serif text-[var(--admin-text)] mb-5">
        {icon} {title}
      </h4>
      {children}
    </div>
  );

  /* ========== Input helpers ========== */
  const InputField: React.FC<{
    label: string; value: string | number; onChange: (v: string) => void;
    placeholder?: string; type?: string; hint?: string; required?: boolean;
    maxLength?: number; suffix?: string; prefix?: string; disabled?: boolean; className?: string;
  }> = ({ label, value, onChange, placeholder, type = 'text', hint, required, maxLength, suffix, prefix, disabled, className }) => (
    <div className={className}>
      <label className="text-xs text-[var(--admin-text-secondary)] mb-1.5 block">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="flex items-center bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg overflow-hidden focus-within:border-[var(--admin-accent)]/50 transition-colors">
        {prefix && <span className="pl-3 text-xs text-[var(--admin-muted)]">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] disabled:opacity-50"
        />
        {suffix && <span className="pr-3 text-xs text-[var(--admin-muted)]">{suffix}</span>}
      </div>
      {hint && <p className="text-[10px] text-[var(--admin-muted)] mt-1 flex items-center gap-1"><Info size={10} /> {hint}</p>}
      {maxLength && <p className="text-[10px] text-[var(--admin-muted)] mt-0.5 text-right">{String(value).length}/{maxLength}</p>}
    </div>
  );

  const TextArea: React.FC<{
    label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string; maxLength?: number;
  }> = ({ label, value, onChange, rows = 4, hint, maxLength }) => (
    <div>
      <label className="text-xs text-[var(--admin-text-secondary)] mb-1.5 block">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2.5 text-sm bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg outline-none text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]/50 transition-colors resize-none"
      />
      {hint && <p className="text-[10px] text-[var(--admin-muted)] mt-1 flex items-center gap-1"><Info size={10} /> {hint}</p>}
      {maxLength && <p className="text-[10px] text-[var(--admin-muted)] mt-0.5 text-right">{value.length}/{maxLength}</p>}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* ===== TOP HEADER ===== */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--admin-border)] mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-[var(--admin-surface2)] rounded-lg text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider">Productos</p>
            <h3 className="font-serif text-[var(--admin-text)]">{isEditing ? form.name || 'Editar Producto' : 'Nuevo Producto'}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-[var(--admin-surface2)] text-[var(--admin-text-secondary)] text-xs rounded-lg hover:bg-[var(--admin-surface2)] transition-colors">
            <Eye size={13} /> Vista previa
          </button>
          <button
            onClick={() => { update('status', 'draft'); setHasChanges(false); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] text-xs rounded-lg hover:bg-[var(--admin-surface2)] transition-colors"
          >
            <Save size={13} /> Guardar borrador
          </button>
          <button
            onClick={() => { update('status', 'active'); setHasChanges(false); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-wood-900 text-sand-100 text-xs rounded-lg hover:bg-wood-800 transition-colors"
          >
            <Globe size={13} /> Publicar
          </button>
        </div>
      </div>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sidebar nav */}
        <nav className="hidden lg:flex flex-col gap-0.5 w-52 flex-shrink-0 sticky top-0 self-start">
          {sections.map(s => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-colors ${isActive ? 'bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface2)] hover:text-[var(--admin-text)]'}`}
              >
                <Icon size={14} />
                {s.label}
              </button>
            );
          })}
        </nav>

        {/* Scrollable content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-5 pb-24 pr-1">

          {/* ========== SECTION 1: Basic Info ========== */}
          <Card id="basic" title="Informacion Basica" icon={<FileText size={16} className="text-[var(--admin-accent)]" />}>
            <div className="space-y-4">
              <InputField label="Nombre del producto" value={form.name} onChange={v => update('name', v)} placeholder="Tabla para Picar y Charcuteria de Parota" required maxLength={120} hint="Max 120 caracteres. Aparece como titulo en la tienda." />
              <InputField label="Subtitulo / Tagline" value={form.subtitle} onChange={v => update('subtitle', v)} placeholder="Hecha a mano con parota mexicana de bosques sustentables" />
              <TextArea label="Descripcion *" value={form.description} onChange={v => update('description', v)} rows={5} hint="Editor rich text. Soporta: bold, italic, links, listas, headings." />
              <InputField label="Descripcion corta (para cards y listados)" value={form.shortDescription} onChange={v => update('shortDescription', v)} placeholder="Tabla artesanal de parota mexicana, ideal para charcuteria" maxLength={200} hint="Max 200 caracteres. Aparece en cards del catalogo." />

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-[var(--admin-text-secondary)] mb-2 block">Estado *</label>
                  <div className="space-y-1.5">
                    {(['active', 'draft', 'archived'] as const).map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="status" checked={form.status === s} onChange={() => update('status', s)} className="accent-accent-gold" />
                        <span className="text-xs text-[var(--admin-text)]">
                          {s === 'active' ? 'Activo (visible en tienda)' : s === 'draft' ? 'Borrador (no visible)' : 'Archivado'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[var(--admin-text-secondary)] mb-2 block">Visibilidad</label>
                  <div className="space-y-1.5">
                    {([
                      { key: 'showInCatalog' as const, label: 'Mostrar en catalogo' },
                      { key: 'showInSearch' as const, label: 'Mostrar en busqueda' },
                      { key: 'featured' as const, label: 'Producto destacado' },
                    ]).map(opt => (
                      <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form[opt.key]} onChange={() => update(opt.key, !form[opt.key])} className="accent-accent-gold rounded" />
                        <span className="text-xs text-[var(--admin-text)]">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* ========== SECTION 2: Multimedia ========== */}
          <Card id="media" title="Multimedia" icon={<ImageIcon size={16} className="text-[var(--admin-accent)]" />}>
            <div className="space-y-4">
              <label className="text-xs text-[var(--admin-text-secondary)] block">Imagenes del producto</label>
              <div className="flex flex-wrap gap-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group w-24 h-24 rounded-xl overflow-hidden border border-[var(--admin-border)]">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 bg-[var(--admin-accent)] text-white text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star size={8} /> Principal
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {i !== 0 && (
                        <button className="p-1 bg-[var(--admin-surface)] rounded text-[var(--admin-accent)]" title="Hacer principal">
                          <Star size={12} />
                        </button>
                      )}
                      <button
                        className="p-1 bg-[var(--admin-surface)] rounded text-red-500"
                        onClick={() => update('images', form.images.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-[var(--admin-border)] rounded-xl cursor-pointer hover:border-[var(--admin-accent)]/40 transition-colors">
                  <Plus size={16} className="text-[var(--admin-muted)] mb-1" />
                  <span className="text-[9px] text-[var(--admin-muted)] text-center px-1">Agregar</span>
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>
              <p className="text-[10px] text-[var(--admin-muted)]">Arrastra para reordenar. Formatos: JPG, PNG, WebP. Max 5MB. Recomendado: 1200x1200px.</p>

              <InputField label="Video del producto (opcional)" value={form.videoUrl} onChange={v => update('videoUrl', v)} placeholder="https://youtube.com/watch?v=..." hint="URL de YouTube o Vimeo" />

              <div className="bg-[var(--admin-surface2)] rounded-xl p-4 flex items-center gap-3">
                <div className="p-2 bg-[var(--admin-accent)]/10 rounded-lg text-[var(--admin-accent)]">
                  <Sparkles size={16} />
                </div>
                <p className="text-[11px] text-[var(--admin-text-secondary)]">Proximamente: Sube un modelo 3D para vista AR</p>
              </div>
            </div>
          </Card>

          {/* ========== SECTION 3: Pricing ========== */}
          <Card id="pricing" title="Precios y Costos" icon={<DollarSign size={16} className="text-[var(--admin-accent)]" />}>
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <InputField label="Precio de venta" value={form.price || ''} onChange={v => update('price', Number(v) || 0)} type="number" prefix="$" suffix="MXN" required />
                <InputField label="Precio comparar (tachado)" value={form.comparePrice || ''} onChange={v => update('comparePrice', Number(v) || 0)} type="number" prefix="$" suffix="MXN" />
                <InputField label="Costo del producto" value={form.cost || ''} onChange={v => update('cost', Number(v) || 0)} type="number" prefix="$" suffix="MXN" />
              </div>

              {/* Profitability analysis */}
              {form.price > 0 && (
                <div className="bg-[var(--admin-surface2)] rounded-xl p-5 space-y-3">
                  <h5 className="text-xs text-[var(--admin-text)] flex items-center gap-1.5"><BarChart3 size={13} /> Analisis de Rentabilidad</h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-[var(--admin-text-secondary)]">
                      <span>Precio de venta:</span>
                      <span className="text-[var(--admin-text)]">${form.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[var(--admin-text-secondary)]">
                      <span>Costo del producto:</span>
                      <span className="text-red-500">-${form.cost.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-[var(--admin-border)] my-2" />
                    <div className="flex justify-between text-[var(--admin-text)]">
                      <span>Ganancia bruta:</span>
                      <span>${grossProfit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--admin-text-secondary)]">Margen bruto:</span>
                      <span className={`${margin >= 50 ? 'text-green-600' : margin >= 30 ? 'text-[var(--admin-accent)]' : 'text-red-500'}`}>
                        {margin.toFixed(1)}% {margin >= 50 ? <Check size={10} className="inline" /> : null}
                      </span>
                    </div>
                    <div className="border-t border-[var(--admin-border)] my-2" />
                    <p className="text-[10px] text-[var(--admin-muted)] mb-1">Estimado despues de fees:</p>
                    <div className="flex justify-between text-[var(--admin-text-secondary)]">
                      <span>Comision Stripe (~3.6%):</span>
                      <span>-${stripeCommission.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--admin-text-secondary)]">
                      <span>Costo envio prom.:</span>
                      <span>-${avgShipping.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-[var(--admin-border)] my-2" />
                    <div className="flex justify-between text-[var(--admin-text)]">
                      <span>Ganancia neta estimada:</span>
                      <span className={netProfit > 0 ? 'text-green-600' : 'text-red-500'}>${netProfit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--admin-text-secondary)]">
                      <span>Margen neto estimado:</span>
                      <span>{netMargin.toFixed(1)}%</span>
                    </div>
                    <div className="mt-3 bg-[var(--admin-accent)]/10 rounded-lg p-3 flex items-start gap-2">
                      <Info size={12} className="text-[var(--admin-accent)] flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-[var(--admin-text-secondary)]">
                        Si el cliente alcanza envio gratis ($2,500+): Ganancia neta: ${netProfitFreeShipping.toFixed(2)} ({netMarginFreeShipping.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] mb-2 block">Impuestos</label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="tax" checked={form.taxIncluded} onChange={() => update('taxIncluded', true)} className="accent-accent-gold" />
                    <span className="text-xs text-[var(--admin-text)]">El precio ya incluye IVA (16%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="tax" checked={!form.taxIncluded} onChange={() => update('taxIncluded', false)} className="accent-accent-gold" />
                    <span className="text-xs text-[var(--admin-text)]">Agregar IVA al precio de venta</span>
                  </label>
                </div>
                {form.taxIncluded && form.price > 0 && (
                  <p className="text-[10px] text-[var(--admin-muted)] mt-2">Precio con IVA desglosado: ${form.price.toLocaleString()} (IVA incluido: ${ivaAmount.toFixed(2)})</p>
                )}
              </div>
              <p className="text-[10px] text-[var(--admin-muted)]">Moneda: MXN (Peso Mexicano) — Configuracion global</p>
            </div>
          </Card>

          {/* ========== SECTION 4: Inventory ========== */}
          <Card id="inventory" title="Inventario" icon={<Package size={16} className="text-[var(--admin-accent)]" />}>
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <InputField label="SKU" value={form.sku} onChange={v => update('sku', v)} placeholder="DSD-PAROTA-MED-001" required hint="Formato: DSD-[MADERA]-[TAMANO]-[NUM]" />
                <InputField label="Codigo de barras (opcional)" value={form.barcode} onChange={v => update('barcode', v)} placeholder="" />
                <InputField label="Cantidad en stock" value={form.stock || ''} onChange={v => update('stock', Number(v) || 0)} type="number" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Punto de reorden (alerta)" value={form.reorderPoint || ''} onChange={v => update('reorderPoint', Number(v) || 0)} type="number" suffix="uds" />
                <InputField label="Stock de seguridad" value={form.safetyStock || ''} onChange={v => update('safetyStock', Number(v) || 0)} type="number" suffix="uds" />
              </div>
              <p className="text-[10px] text-[var(--admin-muted)] flex items-center gap-1"><Info size={10} /> Recibiras alerta cuando el stock llegue al punto de reorden.</p>

              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] mb-2 block">Opciones de inventario</label>
                <div className="space-y-1.5">
                  {([
                    { key: 'trackInventory' as const, label: 'Rastrear inventario (controlar stock automaticamente)' },
                    { key: 'allowBackorder' as const, label: 'Permitir venta sin stock (backorder)' },
                    { key: 'madeToOrder' as const, label: 'Este producto se fabrica sobre pedido' },
                  ]).map(opt => (
                    <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form[opt.key]} onChange={() => update(opt.key, !form[opt.key])} className="accent-accent-gold rounded" />
                      <span className="text-xs text-[var(--admin-text)]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <InputField label="Ubicacion en almacen (opcional)" value={form.warehouseLocation} onChange={v => update('warehouseLocation', v)} placeholder="Estante A-3, Seccion Parota" />

              {/* Stock history */}
              {isEditing && (
                <div className="bg-[var(--admin-surface2)] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs text-[var(--admin-text)] flex items-center gap-1.5"><BarChart3 size={12} /> Historial de Stock</h5>
                    <button className="text-[10px] text-[var(--admin-accent)] hover:underline">Ver todo →</button>
                  </div>
                  <div className="space-y-2">
                    {stockHistory.length === 0 ? (
                      <p className="text-[10px] text-[var(--admin-muted)]">Sin movimientos registrados</p>
                    ) : stockHistory.map((entry, i) => (
                      <div key={i} className="flex items-center gap-3 text-[11px]">
                        <span className="text-[var(--admin-muted)] w-14">{entry.date}</span>
                        <span className="text-[var(--admin-text-secondary)]">Stock: {entry.stock}</span>
                        <span className={entry.change > 0 ? 'text-green-600' : 'text-red-500'}>
                          ({entry.change > 0 ? '+' : ''}{entry.change})
                        </span>
                        <span className="text-[var(--admin-muted)]">{entry.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual adjust */}
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] mb-2 block">Ajustar stock manualmente</label>
                <div className="flex gap-3 items-end">
                  <div className="w-24">
                    <label className="text-[10px] text-[var(--admin-muted)] block mb-1">Cantidad</label>
                    <input
                      type="number"
                      value={stockAdjust.qty}
                      onChange={e => setStockAdjust(prev => ({ ...prev, qty: Number(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-lg outline-none focus:border-[var(--admin-accent)]/50"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-[var(--admin-muted)] block mb-1">Motivo</label>
                    <select
                      value={stockAdjust.reason}
                      onChange={e => setStockAdjust(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-[var(--admin-border)] rounded-lg outline-none focus:border-[var(--admin-accent)]/50 bg-[var(--admin-surface)] text-[var(--admin-text)]"
                    >
                      {['Produccion completada', 'Correccion de inventario', 'Dano / Defectuoso', 'Muestra / Regalo', 'Devolucion de cliente', 'Conteo fisico', 'Otro'].map(r => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <button className="px-4 py-2 bg-wood-900 text-sand-100 text-xs rounded-lg hover:bg-wood-800 transition-colors whitespace-nowrap">
                    Aplicar ajuste
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* ========== SECTION 5: Shipping ========== */}
          <Card id="shipping" title="Envio y Dimensiones Fisicas" icon={<Truck size={16} className="text-[var(--admin-accent)]" />}>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shipping" checked={form.requiresShipping} onChange={() => update('requiresShipping', true)} className="accent-accent-gold" />
                  <span className="text-xs text-[var(--admin-text)]">Este producto requiere envio</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="shipping" checked={!form.requiresShipping} onChange={() => update('requiresShipping', false)} className="accent-accent-gold" />
                  <span className="text-xs text-[var(--admin-text)]">Producto digital (no requiere envio)</span>
                </label>
              </div>

              {form.requiresShipping && (
                <>
                  <div>
                    <label className="text-xs text-[var(--admin-text-secondary)] mb-2 block">Dimensiones del Producto</label>
                    <div className="grid grid-cols-4 gap-3">
                      <InputField label="Largo" value={form.productLength} onChange={v => update('productLength', v)} suffix="cm" />
                      <InputField label="Ancho" value={form.productWidth} onChange={v => update('productWidth', v)} suffix="cm" />
                      <InputField label="Alto" value={form.productHeight} onChange={v => update('productHeight', v)} suffix="cm" />
                      <InputField label="Peso" value={form.productWeight} onChange={v => update('productWeight', v)} suffix="kg" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--admin-text-secondary)] mb-2 block">Dimensiones de Empaque</label>
                    <div className="grid grid-cols-4 gap-3">
                      <InputField label="Largo" value={form.packageLength} onChange={v => update('packageLength', v)} suffix="cm" />
                      <InputField label="Ancho" value={form.packageWidth} onChange={v => update('packageWidth', v)} suffix="cm" />
                      <InputField label="Alto" value={form.packageHeight} onChange={v => update('packageHeight', v)} suffix="cm" />
                      <InputField label="Peso total" value={form.packageWeight} onChange={v => update('packageWeight', v)} suffix="kg" />
                    </div>
                    <p className="text-[10px] text-[var(--admin-muted)] mt-1 flex items-center gap-1"><Info size={10} /> Peso total = peso del producto + peso del empaque (0.5 kg).</p>
                  </div>

                  <div>
                    <label className="text-xs text-[var(--admin-text-secondary)] mb-2 block">Perfil de envio</label>
                    <select
                      value={form.shippingProfile}
                      onChange={e => update('shippingProfile', e.target.value)}
                      className="w-full max-w-xs px-3 py-2.5 text-xs border border-[var(--admin-border)] rounded-lg bg-[var(--admin-surface)] text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)]/50"
                    >
                      {['Nacional Estandar', 'Local Hermosillo', 'Fragil', 'Sobre documentos', 'Personalizado'].map(p => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Shipping cost preview */}
                  <div className="bg-[var(--admin-surface2)] rounded-xl p-4">
                    <h5 className="text-xs text-[var(--admin-text)] mb-3">Preview de costos de envio</h5>
                    <div className="space-y-1.5 text-[11px]">
                      {[
                        { carrier: 'Hermosillo Local', price: '$99 MXN', time: 'Uber Flash' },
                        { carrier: 'DHL Express', price: '$350-400 MXN', time: '2-4 dias' },
                        { carrier: 'Estafeta', price: '$270-310 MXN', time: '3-5 dias' },
                        { carrier: 'FedEx', price: '$310-350 MXN', time: '2-3 dias' },
                      ].map(s => (
                        <div key={s.carrier} className="flex justify-between">
                          <span className="text-[var(--admin-text-secondary)]">{s.carrier}:</span>
                          <span className="text-[var(--admin-text)]">{s.price} <span className="text-[var(--admin-muted)]">({s.time})</span></span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-[var(--admin-muted)] mt-2 flex items-center gap-1"><Info size={10} /> Estos son estimados. El precio real depende del destino.</p>
                  </div>

                  {/* Customs */}
                  <div className="opacity-60">
                    <label className="text-xs text-[var(--admin-muted)] mb-2 block">Informacion aduanal (envios internacionales — futuro)</label>
                    <div className="grid grid-cols-3 gap-3">
                      <InputField label="Codigo HS" value="" onChange={() => {}} disabled />
                      <InputField label="Pais de origen" value="Mexico" onChange={() => {}} disabled />
                      <InputField label="Valor declarado" value="Precio de venta" onChange={() => {}} disabled />
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* ========== SECTION 6: Variants ========== */}
          <Card id="variants" title="Variantes" icon={<Layers size={16} className="text-[var(--admin-accent)]" />}>
            <div className="space-y-5">
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] mb-2 block">Opcion del producto</label>
                <div className="flex items-center gap-3">
                  <select
                    value={form.variantOption}
                    onChange={e => update('variantOption', e.target.value)}
                    className="px-3 py-2 text-xs border border-[var(--admin-border)] rounded-lg bg-[var(--admin-surface)] text-[var(--admin-text)] outline-none"
                  >
                    {['Tamano', 'Color', 'Acabado', 'Estilo'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <div className="flex flex-wrap gap-1.5">
                    {form.variants.map(v => (
                      <span key={v.id} className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--admin-surface2)] text-[var(--admin-text)] text-[11px] rounded-full">
                        {v.name}
                        <button onClick={() => update('variants', form.variants.filter(x => x.id !== v.id))} className="text-[var(--admin-muted)] hover:text-red-500">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const id = `v${Date.now()}`;
                      update('variants', [...form.variants, { id, name: `Variante ${form.variants.length + 1}`, sku: '', price: form.price, cost: form.cost, stock: 0, dimensions: '', weight: 0 }]);
                    }}
                    className="flex items-center gap-1 text-xs text-[var(--admin-accent)] hover:underline whitespace-nowrap"
                  >
                    <Plus size={12} /> Agregar
                  </button>
                </div>
              </div>

              {form.variants.length > 0 && (
                <>
                  <div className="overflow-x-auto rounded-xl border border-[var(--admin-border)]">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider border-b border-[var(--admin-border)] bg-[var(--admin-surface2)]/50">
                          <th className="px-4 py-2.5">Variante</th>
                          <th className="px-4 py-2.5">SKU</th>
                          <th className="px-4 py-2.5">Precio</th>
                          <th className="px-4 py-2.5">Costo</th>
                          <th className="px-4 py-2.5">Stock</th>
                          <th className="px-4 py-2.5"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-wood-50">
                        {form.variants.map(v => (
                          <tr key={v.id} className="hover:bg-[var(--admin-surface2)]/30">
                            <td className="px-4 py-2">
                              <input value={v.name} onChange={e => update('variants', form.variants.map(x => x.id === v.id ? { ...x, name: e.target.value } : x))} className="text-xs text-[var(--admin-text)] bg-transparent outline-none w-24" />
                            </td>
                            <td className="px-4 py-2">
                              <input value={v.sku} onChange={e => update('variants', form.variants.map(x => x.id === v.id ? { ...x, sku: e.target.value } : x))} className="text-xs text-[var(--admin-text-secondary)] font-mono bg-transparent outline-none w-36" />
                            </td>
                            <td className="px-4 py-2">
                              <input type="number" value={v.price} onChange={e => update('variants', form.variants.map(x => x.id === v.id ? { ...x, price: Number(e.target.value) } : x))} className="text-xs text-[var(--admin-text)] bg-transparent outline-none w-20" />
                            </td>
                            <td className="px-4 py-2">
                              <input type="number" value={v.cost} onChange={e => update('variants', form.variants.map(x => x.id === v.id ? { ...x, cost: Number(e.target.value) } : x))} className="text-xs text-[var(--admin-text)] bg-transparent outline-none w-20" />
                            </td>
                            <td className="px-4 py-2">
                              <input type="number" value={v.stock} onChange={e => update('variants', form.variants.map(x => x.id === v.id ? { ...x, stock: Number(e.target.value) } : x))} className="text-xs text-[var(--admin-text)] bg-transparent outline-none w-16" />
                            </td>
                            <td className="px-4 py-2">
                              <button onClick={() => update('variants', form.variants.filter(x => x.id !== v.id))} className="p-1 text-[var(--admin-muted)] hover:text-red-500"><Trash2 size={12} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Dimensions per variant */}
                  <div className="overflow-x-auto rounded-xl border border-[var(--admin-border)]">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider border-b border-[var(--admin-border)] bg-[var(--admin-surface2)]/50">
                          <th className="px-4 py-2.5">Variante</th>
                          <th className="px-4 py-2.5">Largo</th>
                          <th className="px-4 py-2.5">Ancho</th>
                          <th className="px-4 py-2.5">Alto</th>
                          <th className="px-4 py-2.5">Peso</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-wood-50">
                        {form.variants.map(v => (
                          <tr key={v.id} className="hover:bg-[var(--admin-surface2)]/30">
                            <td className="px-4 py-2 text-xs text-[var(--admin-text)]">{v.name}</td>
                            <td className="px-4 py-2">
                              <input value={v.dimensions.split('×')[0] || ''} className="text-xs text-[var(--admin-text-secondary)] bg-transparent outline-none w-16" readOnly />
                            </td>
                            <td className="px-4 py-2">
                              <input value={v.dimensions.split('×')[1] || ''} className="text-xs text-[var(--admin-text-secondary)] bg-transparent outline-none w-16" readOnly />
                            </td>
                            <td className="px-4 py-2">
                              <input value={v.dimensions.split('×')[2] || ''} className="text-xs text-[var(--admin-text-secondary)] bg-transparent outline-none w-16" readOnly />
                            </td>
                            <td className="px-4 py-2 text-xs text-[var(--admin-text-secondary)]">{v.weight} kg</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-[var(--admin-muted)] flex items-center gap-1"><Info size={10} /> Las dimensiones por variante se usan para cotizacion de envio.</p>
                </>
              )}
            </div>
          </Card>

          {/* ========== SECTION 7: Customization ========== */}
          <Card id="customization" title="Personalizacion (Grabado Laser y Artesania)" icon={<Scissors size={16} className="text-[var(--admin-accent)]" />}>
            <div className="space-y-5">
              {/* Laser */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.laserEngraving} onChange={() => update('laserEngraving', !form.laserEngraving)} className="accent-accent-gold rounded" />
                <span className="text-xs text-[var(--admin-text)]">Este producto acepta grabado laser</span>
              </label>

              {form.laserEngraving && (
                <>
                  <div>
                    <label className="text-xs text-[var(--admin-text-secondary)] mb-2 block">Area maxima de grabado</label>
                    <div className="grid grid-cols-2 gap-3 max-w-xs">
                      <InputField label="Ancho max" value={form.engravingMaxWidth} onChange={v => update('engravingMaxWidth', v)} suffix="cm" />
                      <InputField label="Alto max" value={form.engravingMaxHeight} onChange={v => update('engravingMaxHeight', v)} suffix="cm" />
                    </div>
                  </div>

                  {/* Engraving area preview */}
                  <div className="bg-[var(--admin-surface2)] rounded-xl p-4">
                    <p className="text-[10px] text-[var(--admin-text-secondary)] mb-2">Preview del area de grabado:</p>
                    <div className="relative mx-auto" style={{ width: 200, height: 120 }}>
                      <div className="absolute inset-0 bg-wood-200/40 rounded-xl border-2 border-wood-300 flex items-center justify-center">
                        <span className="text-[9px] text-[var(--admin-muted)] absolute bottom-1 right-2">
                          {form.productLength || '45'} x {form.productWidth || '27'} cm
                        </span>
                        <div className="bg-[var(--admin-accent)]/15 border-2 border-dashed border-[var(--admin-accent)]/40 rounded-lg px-4 py-3 text-center">
                          <span className="text-[10px] text-[var(--admin-accent)]">AREA GRABADO</span>
                          <br />
                          <span className="text-[9px] text-[var(--admin-accent)]/70">{form.engravingMaxWidth} x {form.engravingMaxHeight} cm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[var(--admin-text-secondary)] mb-2 block">Posiciones disponibles</label>
                    <div className="space-y-1.5">
                      {['Centro', 'Inferior derecha', 'Inferior izquierda', 'Personalizada (el cliente elige libremente)'].map(pos => (
                        <label key={pos} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.engravingPositions.includes(pos)}
                            onChange={() => {
                              const has = form.engravingPositions.includes(pos);
                              update('engravingPositions', has
                                ? form.engravingPositions.filter(p => p !== pos)
                                : [...form.engravingPositions, pos]
                              );
                            }}
                            className="accent-accent-gold rounded"
                          />
                          <span className="text-xs text-[var(--admin-text)]">{pos}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Materials */}
              <div className="border-t border-[var(--admin-border)] pt-5">
                <h5 className="text-xs text-[var(--admin-text)] mb-3">Materiales y Artesania</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[var(--admin-text-secondary)] mb-1.5 block">Tipo de madera *</label>
                    <select value={form.woodType} onChange={e => update('woodType', e.target.value)} className="w-full px-3 py-2.5 text-xs border border-[var(--admin-border)] rounded-lg bg-[var(--admin-surface)] text-[var(--admin-text)] outline-none">
                      {['Parota', 'Cedro Rojo', 'Rosa Morada', 'Tzalam', 'Nogal', 'Mezquite', 'Pino', 'Teca', 'Otro'].map(w => <option key={w}>{w}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--admin-text-secondary)] mb-1.5 block">Acabado *</label>
                    <select value={form.finish} onChange={e => update('finish', e.target.value)} className="w-full px-3 py-2.5 text-xs border border-[var(--admin-border)] rounded-lg bg-[var(--admin-surface)] text-[var(--admin-text)] outline-none">
                      {['Aceite mineral grado alimenticio', 'Aceite de tung', 'Cera de abeja', 'Natural (sin acabado)', 'Otro'].map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <InputField label="Artesano / Taller" value={form.artisan} onChange={v => update('artisan', v)} />
                  <div>
                    <label className="text-xs text-[var(--admin-text-secondary)] mb-2 block">Tiempo de produccion</label>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="prodTime" checked={form.productionTime === 'inStock'} onChange={() => update('productionTime', 'inStock')} className="accent-accent-gold" />
                        <span className="text-xs text-[var(--admin-text)]">En stock — Envio inmediato</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="prodTime" checked={form.productionTime === 'madeToOrder'} onChange={() => update('productionTime', 'madeToOrder')} className="accent-accent-gold" />
                        <span className="text-xs text-[var(--admin-text)]">Fabricacion sobre pedido: {form.productionDays} dias</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="prodTime" checked={form.productionTime === 'unavailable'} onChange={() => update('productionTime', 'unavailable')} className="accent-accent-gold" />
                        <span className="text-xs text-[var(--admin-text)]">Temporalmente no disponible</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <InputField label="Garantia" value={form.warranty} onChange={v => update('warranty', v)} />
                  <TextArea label="Instrucciones de cuidado" value={form.careInstructions} onChange={v => update('careInstructions', v)} rows={2} />
                </div>
              </div>
            </div>
          </Card>

          {/* ========== SECTION 8: Categories & Tags ========== */}
          <Card id="categories" title="Organizacion" icon={<FolderTree size={16} className="text-[var(--admin-accent)]" />}>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[var(--admin-text-secondary)] mb-1.5 block">Categoria principal *</label>
                  <select value={form.mainCategory} onChange={e => update('mainCategory', e.target.value)} className="w-full px-3 py-2.5 text-xs border border-[var(--admin-border)] rounded-lg bg-[var(--admin-surface)] text-[var(--admin-text)] outline-none">
                    <option value="">Seleccionar...</option>
                    {['Tablas para Cortar', 'Sets y Colecciones', 'Accesorios', 'Servicios'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--admin-text-secondary)] mb-1.5 block">Sub-categoria</label>
                  <select value={form.subCategory} onChange={e => update('subCategory', e.target.value)} className="w-full px-3 py-2.5 text-xs border border-[var(--admin-border)] rounded-lg bg-[var(--admin-surface)] text-[var(--admin-text)] outline-none">
                    <option value="">Seleccionar...</option>
                    {['Charcuteria', 'Cocina', 'Decorativas', 'Gourmet'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Category tree */}
              <div className="bg-[var(--admin-surface2)] rounded-xl p-4 text-xs text-[var(--admin-text-secondary)]">
                <p className="text-[10px] text-[var(--admin-muted)] mb-2">Arbol de categorias:</p>
                <div className="space-y-1 ml-2">
                  <div>📁 Tablas para Cortar</div>
                  <div className="ml-5">├── Charcuteria {form.mainCategory === 'Tablas para Cortar' && form.subCategory === 'Charcuteria' && <Check size={10} className="inline text-green-500" />}</div>
                  <div className="ml-5">├── Cocina</div>
                  <div className="ml-5">└── Decorativas</div>
                  <div>📁 Sets y Colecciones</div>
                  <div>📁 Accesorios</div>
                  <div>📁 Servicios</div>
                </div>
                <button className="flex items-center gap-1 text-[var(--admin-accent)] text-[11px] mt-3 hover:underline">
                  <Plus size={10} /> Nueva categoria
                </button>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] mb-1.5 block">Tags / Etiquetas</label>
                <div className="flex flex-wrap items-center gap-1.5 p-2.5 border border-[var(--admin-border)] rounded-lg bg-[var(--admin-surface)] min-h-[40px]">
                  {form.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--admin-surface2)] text-[var(--admin-text)] text-[11px] rounded-full">
                      {tag}
                      <button onClick={() => update('tags', form.tags.filter(t => t !== tag))} className="text-[var(--admin-muted)] hover:text-red-500"><X size={10} /></button>
                    </span>
                  ))}
                  <input
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newTag.trim()) {
                        update('tags', [...form.tags, newTag.trim()]);
                        setNewTag('');
                      }
                    }}
                    placeholder="+ agregar tag..."
                    className="text-xs bg-transparent outline-none text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] min-w-[80px] flex-1"
                  />
                </div>
                <p className="text-[10px] text-[var(--admin-muted)] mt-1">Autocomplete con tags existentes. Enter para crear nuevo.</p>
              </div>

              {/* Collections */}
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] mb-2 block">Colecciones</label>
                <div className="space-y-1.5">
                  {['Best Sellers', 'Navidad 2026', 'Nuevos Productos', 'Ofertas Especiales'].map(col => (
                    <label key={col} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.collections.includes(col)}
                        onChange={() => {
                          const has = form.collections.includes(col);
                          update('collections', has ? form.collections.filter(c => c !== col) : [...form.collections, col]);
                        }}
                        className="accent-accent-gold rounded"
                      />
                      <span className="text-xs text-[var(--admin-text)]">{col}</span>
                    </label>
                  ))}
                </div>
                <button className="flex items-center gap-1 text-[var(--admin-accent)] text-[11px] mt-2 hover:underline">
                  <Plus size={10} /> Nueva coleccion
                </button>
              </div>

              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] mb-1.5 block">Tipo de producto</label>
                <select value={form.productType} onChange={e => update('productType', e.target.value)} className="w-full max-w-xs px-3 py-2.5 text-xs border border-[var(--admin-border)] rounded-lg bg-[var(--admin-surface)] text-[var(--admin-text)] outline-none">
                  <option value="">Seleccionar...</option>
                  {['Tabla para cortar', 'Set de tablas', 'Accesorio', 'Servicio'].map(t => <option key={t}>{t}</option>)}
                </select>
                <p className="text-[10px] text-[var(--admin-muted)] mt-1">Usado para filtros y organizacion interna.</p>
              </div>
            </div>
          </Card>

          {/* ========== SECTION 9: SEO ========== */}
          <Card id="seo" title="SEO — Optimizacion para Buscadores" icon={<SearchIcon size={16} className="text-[var(--admin-accent)]" />}>
            <div className="space-y-5">
              {/* Google preview */}
              <div className="bg-[var(--admin-surface2)] rounded-xl p-4">
                <p className="text-[10px] text-[var(--admin-muted)] mb-2">Preview de Google:</p>
                <div className="space-y-0.5">
                  <p className="text-sm text-blue-700 hover:underline cursor-pointer">{form.metaTitle || `${form.name} | DavidSon's Design`}</p>
                  <p className="text-[11px] text-green-700">davidsonsdesign.com/shop/{form.slug || 'producto'}</p>
                  <p className="text-xs text-[var(--admin-text-secondary)]">{form.metaDescription || form.shortDescription || 'Descripcion del producto...'}</p>
                </div>
              </div>

              <InputField label="Meta titulo" value={form.metaTitle} onChange={v => update('metaTitle', v)} maxLength={70} hint={`${seoTitleLen}/70 caracteres`} />
              <TextArea label="Meta descripcion" value={form.metaDescription} onChange={v => update('metaDescription', v)} rows={3} maxLength={160} hint={`${seoDescLen}/160 caracteres`} />

              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] mb-1.5 block">URL amigable (slug)</label>
                <div className="flex items-center text-xs text-[var(--admin-muted)]">
                  <span>davidsonsdesign.com/shop/</span>
                  <input
                    value={form.slug}
                    onChange={e => update('slug', e.target.value)}
                    className="ml-1 px-2 py-1.5 border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)]/50 bg-[var(--admin-surface)]"
                  />
                </div>
                <p className="text-[10px] text-[var(--admin-muted)] mt-1 flex items-center gap-1"><Info size={10} /> Se genera automaticamente del nombre. Editable.</p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.autoSeo} onChange={() => update('autoSeo', !form.autoSeo)} className="accent-accent-gold rounded" />
                <span className="text-xs text-[var(--admin-text)]">Generar SEO automaticamente del nombre y descripcion</span>
              </label>

              <button className="flex items-center gap-1.5 px-4 py-2 bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] text-xs rounded-lg hover:bg-[var(--admin-accent)]/20 transition-colors">
                <Sparkles size={13} /> Generar con IA
              </button>
            </div>
          </Card>

          {/* ========== SECTION 10: Config ========== */}
          <Card id="config" title="Configuracion Avanzada" icon={<Settings size={16} className="text-[var(--admin-accent)]" />}>
            <div className="space-y-5">
              {/* Related */}
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] mb-1.5 block">Producto relacionado con</label>
                <div className="flex flex-wrap items-center gap-1.5 p-2.5 border border-[var(--admin-border)] rounded-lg bg-[var(--admin-surface)] min-h-[40px]">
                  {form.relatedProducts.map(p => (
                    <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--admin-surface2)] text-[var(--admin-text)] text-[11px] rounded-full">
                      {p}
                      <button onClick={() => update('relatedProducts', form.relatedProducts.filter(x => x !== p))} className="text-[var(--admin-muted)] hover:text-red-500"><X size={10} /></button>
                    </span>
                  ))}
                  <span className="text-[11px] text-[var(--admin-muted)] cursor-pointer">+ buscar...</span>
                </div>
                <p className="text-[10px] text-[var(--admin-muted)] mt-1">Aparecen en "Tambien te puede interesar" en la tienda.</p>
              </div>

              {/* Up-sell */}
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] mb-1.5 block">Up-sell (compra mayor)</label>
                <div className="flex flex-wrap items-center gap-1.5 p-2.5 border border-[var(--admin-border)] rounded-lg bg-[var(--admin-surface)] min-h-[40px]">
                  <span className="text-[11px] text-[var(--admin-muted)] cursor-pointer">+ buscar...</span>
                </div>
                <p className="text-[10px] text-[var(--admin-muted)] mt-1">Aparece como "Quieres el set completo?" en la tienda.</p>
              </div>

              {/* Cross-sell */}
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] mb-1.5 block">Cross-sell (complementarios)</label>
                <div className="flex flex-wrap items-center gap-1.5 p-2.5 border border-[var(--admin-border)] rounded-lg bg-[var(--admin-surface)] min-h-[40px]">
                  <span className="text-[11px] text-[var(--admin-muted)] cursor-pointer">+ buscar...</span>
                </div>
                <p className="text-[10px] text-[var(--admin-muted)] mt-1">Aparece en el carrito como "Complementa tu compra".</p>
              </div>

              {/* Internal notes */}
              <TextArea label="Notas internas (no visibles al cliente)" value={form.internalNotes} onChange={v => update('internalNotes', v)} rows={3} />

              {/* Dev flags */}
              <div className="border-t border-[var(--admin-border)] pt-4 opacity-60">
                <p className="text-[10px] text-[var(--admin-muted)] mb-2">Producto SaaS flags (solo visible para Owner/Dev)</p>
                <div className="space-y-1.5">
                  {['Ocultar del catalogo publico', 'No rastrear inventario', 'Producto de servicio (no requiere envio)'].map(f => (
                    <label key={f} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="accent-accent-gold rounded" disabled />
                      <span className="text-xs text-[var(--admin-text-secondary)]">{f}</span>
                    </label>
                  ))}
                </div>
                {isEditing && <p className="text-[10px] text-[var(--admin-muted)] mt-2">Medusa ID: prod_01KJ4E6ZFNMMVE9SQES7TJDH1J</p>}
              </div>
            </div>
          </Card>

          {/* ========== SECTION 11: Stats ========== */}
          {isEditing && product && (
            <Card id="stats" title="Estadisticas" icon={<BarChart3 size={16} className="text-[var(--admin-accent)]" />}>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs text-[var(--admin-text)]">{product.title}</h5>
                  <select className="text-[10px] border border-[var(--admin-border)] rounded-lg px-2 py-1 bg-[var(--admin-surface)] text-[var(--admin-text-secondary)] outline-none">
                    <option>30 dias</option><option>90 dias</option><option>12 meses</option>
                  </select>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Unidades vendidas', value: product.sold_units_30d, change: '+12%' },
                    { label: 'Ingresos totales', value: `$${product.revenue_30d.toLocaleString()}`, change: '+8%' },
                    { label: 'Visitas al producto', value: '1,240', change: '+22%' },
                  ].map(s => (
                    <div key={s.label} className="bg-[var(--admin-surface2)] rounded-xl p-4 text-center">
                      <p className="text-lg text-[var(--admin-text)]">{s.value}</p>
                      <p className="text-[10px] text-[var(--admin-text-secondary)] mt-0.5">{s.label}</p>
                      <p className="text-[10px] text-green-600 mt-1">{s.change} vs prev</p>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-[var(--admin-text-secondary)]">Tasa de conversion: <span className="text-[var(--admin-text)]">3.4%</span> (visitas → compra)</p>

                {/* Sales chart */}
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesChartData}>
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="var(--admin-muted)" />
                      <YAxis tick={{ fontSize: 10 }} stroke="var(--admin-muted)" />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #EFEBE9' }} />
                      <Line type="monotone" dataKey="ventas" stroke="var(--admin-accent)" strokeWidth={2} dot={{ r: 3, fill: 'var(--admin-accent)' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Reviews */}
                <div className="flex items-center gap-2 text-xs text-[var(--admin-text-secondary)]">
                  <span>Reviews:</span>
                  <span className="text-[var(--admin-accent)]">★ {product.avg_rating}</span>
                  <span>({product.review_count} reviews) — 67% de 5 estrellas</span>
                </div>

                {/* Best selling variants */}
                {form.variants.length > 0 && (
                  <div>
                    <p className="text-xs text-[var(--admin-text)] mb-2">Variantes mas vendidas:</p>
                    <div className="space-y-1.5">
                      {[
                        { name: 'Mediana', qty: 28, pct: 67 },
                        { name: 'Grande', qty: 10, pct: 24 },
                        { name: 'XL', qty: 4, pct: 9 },
                      ].map((v, i) => (
                        <div key={v.name} className="flex items-center gap-3 text-xs">
                          <span className="text-[var(--admin-muted)] w-4">{i + 1}.</span>
                          <span className="text-[var(--admin-text)] w-20">{v.name}</span>
                          <div className="flex-1 h-2 bg-[var(--admin-surface2)] rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--admin-accent)] rounded-full" style={{ width: `${v.pct}%` }} />
                          </div>
                          <span className="text-[var(--admin-text-secondary)] w-20 text-right">{v.qty} uds ({v.pct}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {product.laser_available && (
                  <p className="text-xs text-[var(--admin-text-secondary)]">Con grabado laser: <span className="text-[var(--admin-text)]">65%</span> de las ventas</p>
                )}

                {/* Frequently bought together */}
                <div>
                  <p className="text-xs text-[var(--admin-text)] mb-2">Frecuentemente comprado con:</p>
                  <div className="space-y-1 text-xs text-[var(--admin-text-secondary)]">
                    <p>• Set Cuchillos Artesanal (22%)</p>
                    <p>• Tabla Cedro Rojo (18%)</p>
                    <p>• Aceite de cuidado (15%)</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ===== STICKY FOOTER ===== */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--admin-surface)] border-t border-[var(--admin-border)] shadow-lg px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[var(--admin-accent)]">
            <AlertTriangle size={14} /> Cambios sin guardar
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHasChanges(false)}
              className="px-4 py-2 text-xs text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] transition-colors"
            >
              Descartar cambios
            </button>
            {isEditing ? (
              <button
                onClick={() => setHasChanges(false)}
                className="px-5 py-2 bg-wood-900 text-sand-100 text-xs rounded-lg hover:bg-wood-800 transition-colors"
              >
                Guardar cambios
              </button>
            ) : (
              <>
                <button
                  onClick={() => setHasChanges(false)}
                  className="px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] text-xs rounded-lg hover:bg-[var(--admin-surface2)] transition-colors"
                >
                  Guardar borrador
                </button>
                <button
                  onClick={() => setHasChanges(false)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-wood-900 text-sand-100 text-xs rounded-lg hover:bg-wood-800 transition-colors"
                >
                  <Check size={13} /> Publicar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
