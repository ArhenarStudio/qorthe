"use client";

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Grid3X3, List, Plus, Filter, MoreVertical,
  Package, AlertTriangle, ChevronDown, ChevronUp, Pencil, Trash2, Eye,
  Download, Upload, Star, Copy, Archive, ExternalLink,
  X, ArrowUpDown, TrendingUp, DollarSign, ShoppingBag, Check,
  Zap
} from 'lucide-react';
import { adminProducts as mockProducts, type AdminProduct } from '@/data/adminMockData';
import { useAdminData } from '@/hooks/useAdminData';
import { ProductForm } from './ProductForm';
import { ImportWizard, ExportModal } from './ProductImportExport';

/* ---------- Helper: map Medusa product to AdminProduct ---------- */
function mapLiveProduct(p: any): AdminProduct {
  const minPrice = p.price_range?.min || 0;
  const maxPrice = p.price_range?.max || minPrice;
  const status: AdminProduct['status'] = p.out_of_stock
    ? 'outOfStock'
    : p.status === 'draft'
      ? 'draft'
      : 'active';

  return {
    id: p.id,
    name: p.title || 'Sin nombre',
    sku: p.variants?.[0]?.sku || '',
    slug: p.handle || '',
    category: p.categories?.[0]?.name || p.collection?.title || 'General',
    price: minPrice,
    comparePrice: maxPrice > minPrice ? maxPrice : undefined,
    cost: 0, // No disponible vía API admin estándar
    stock: p.total_stock ?? 0,
    reorderPoint: 5,
    status,
    material: '',
    dimensions: '',
    weight: 0,
    image: p.thumbnail || '/placeholder.jpg',
    soldUnits: 0, // Requiere analytics custom
    revenue: 0,
    rating: 0,
    reviewCount: 0,
    laserAvailable: true,
    productionDays: 5,
  };
}

/* ---------- Config ---------- */

const statusConfig: Record<string, { label: string; class: string; dot: string }> = {
  active: { label: 'Activo', class: 'bg-green-50 text-green-600', dot: '●' },
  draft: { label: 'Borrador', class: 'bg-gray-100 text-gray-500', dot: '○' },
  outOfStock: { label: 'Agotado', class: 'bg-red-50 text-red-500', dot: '○' },
  archived: { label: 'Archivado', class: 'bg-wood-100 text-wood-400', dot: '○' },
};

type SortKey = 'price' | 'stock' | 'soldUnits' | 'margin' | 'name';
type SortDir = 'asc' | 'desc';

/* ---------- Component ---------- */

export const ProductsPage: React.FC = () => {
  /* === State === */
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    wood: 'all',
    stock: 'all',
    laser: 'all',
    sold: 'all',
  });
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null | 'new'>(null);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  /* === Live data from Medusa === */
  const { data: liveData } = useAdminData<{
    products: any[];
    count: number;
  }>('/api/admin/products?limit=100', { refreshInterval: 60_000 });

  const isLive = !!liveData?.products;
  const adminProducts: AdminProduct[] = isLive
    ? liveData!.products.map(mapLiveProduct)
    : mockProducts;

  /* === Derived data === */
  const categories = useMemo(() => [...new Set(adminProducts.map(p => p.category))], [adminProducts]);
  const woods = useMemo(() => [...new Set(adminProducts.map(p => p.material).filter(Boolean))], [adminProducts]);

  const filtered = useMemo(() => {
    let result = adminProducts.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchesStatus = filters.status === 'all' || p.status === filters.status;
      const matchesCat = filters.category === 'all' || p.category === filters.category;
      const matchesWood = filters.wood === 'all' || p.material === filters.wood;
      const matchesStock = filters.stock === 'all'
        || (filters.stock === 'inStock' && p.stock > p.reorderPoint)
        || (filters.stock === 'low' && p.stock > 0 && p.stock <= p.reorderPoint)
        || (filters.stock === 'out' && p.stock === 0);
      const matchesLaser = filters.laser === 'all'
        || (filters.laser === 'yes' && p.laserAvailable)
        || (filters.laser === 'no' && !p.laserAvailable);
      const matchesSold = filters.sold === 'all'
        || (filters.sold === 'best' && p.soldUnits > 20)
        || (filters.sold === 'normal' && p.soldUnits > 0 && p.soldUnits <= 20)
        || (filters.sold === 'none' && p.soldUnits === 0);
      return matchesSearch && matchesStatus && matchesCat && matchesWood && matchesStock && matchesLaser && matchesSold;
    });

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'price') cmp = a.price - b.price;
      else if (sortKey === 'stock') cmp = a.stock - b.stock;
      else if (sortKey === 'soldUnits') cmp = a.soldUnits - b.soldUnits;
      else if (sortKey === 'margin') cmp = ((a.price - a.cost) / a.price) - ((b.price - b.cost) / b.price);
      else cmp = a.name.localeCompare(b.name);
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [adminProducts, searchQuery, filters, sortKey, sortDir]);

  const activeFilters = Object.entries(filters).filter(([_, v]) => v !== 'all');

  /* === KPIs === */
  const kpis = useMemo(() => {
    const total = adminProducts.length;
    const totalVariants = adminProducts.reduce((s, p) => s + (p.dimensions.includes('×') ? 3 : 1), 0);
    const active = adminProducts.filter(p => p.status === 'active').length;
    const drafts = adminProducts.filter(p => p.status === 'draft').length;
    const lowStock = adminProducts.filter(p => p.stock > 0 && p.stock <= p.reorderPoint).length;
    const outOfStock = adminProducts.filter(p => p.stock === 0).length;
    const invCost = adminProducts.reduce((s, p) => s + p.cost * p.stock, 0);
    const invSale = adminProducts.reduce((s, p) => s + p.price * p.stock, 0);
    return { total, totalVariants, active, drafts, lowStock, outOfStock, invCost, invSale };
  }, [adminProducts]);

  /* === Helpers === */
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(p => p.id)));
  };

  const getMargin = (p: AdminProduct) => p.price > 0 ? Math.round((p.price - p.cost) / p.price * 100) : 0;

  const stockColor = (p: AdminProduct) =>
    p.stock === 0 ? 'text-red-500' : p.stock <= p.reorderPoint ? 'text-amber-500' : 'text-green-600';

  const clearFilters = () => setFilters({ status: 'all', category: 'all', wood: 'all', stock: 'all', laser: 'all', sold: 'all' });

  const filterLabels: Record<string, Record<string, string>> = {
    status: { active: 'Activo', draft: 'Borrador', outOfStock: 'Agotado' },
    category: Object.fromEntries(categories.map(c => [c, c])),
    wood: Object.fromEntries(woods.map(w => [w, w])),
    stock: { inStock: 'En stock', low: 'Bajo', out: 'Agotado' },
    laser: { yes: 'Con grabado', no: 'Sin grabado' },
    sold: { best: 'Best sellers', normal: 'Normal', none: 'Sin ventas' },
  };

  /* === If editing / creating === */
  if (editingProduct !== null) {
    return (
      <ProductForm
        product={editingProduct === 'new' ? null : editingProduct}
        onBack={() => setEditingProduct(null)}
      />
    );
  }

  /* === If importing === */
  if (showImport) {
    return <ImportWizard onClose={() => setShowImport(false)} />;
  }

  /* === Context menu handler === */
  const ContextMenuDropdown: React.FC<{ product: AdminProduct }> = ({ product }) => {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <div ref={ref} className="absolute right-0 top-full mt-1 bg-white border border-wood-200 rounded-xl shadow-xl py-1 z-30 min-w-[180px]">
        <button onClick={() => { setEditingProduct(product); setContextMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-wood-600 hover:bg-sand-50">
          <Pencil size={12} /> Editar
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-wood-600 hover:bg-sand-50">
          <Copy size={12} /> Duplicar producto
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-wood-600 hover:bg-sand-50">
          <ExternalLink size={12} /> Ver en tienda
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-wood-600 hover:bg-sand-50">
          <Eye size={12} /> Cambiar estado
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-wood-600 hover:bg-sand-50">
          <Archive size={12} /> Archivar
        </button>
        <div className="border-t border-wood-100 my-1" />
        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50">
          <Trash2 size={12} /> Eliminar
        </button>
      </div>
    );
  };

  /* ===================================== RENDER ===================================== */
  return (
    <div className="space-y-4" onClick={() => setContextMenu(null)}>
      {/* === HEADER === */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-accent-gold" />
          <h3 className="font-serif text-lg text-wood-900">Productos</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditingProduct('new')} className="flex items-center gap-1.5 px-4 py-2 bg-wood-900 text-sand-100 rounded-lg text-xs hover:bg-wood-800 transition-colors">
            <Plus size={14} /> Nuevo Producto
          </button>
          <button onClick={() => setShowImport(true)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-wood-200 text-wood-600 rounded-lg text-xs hover:bg-sand-50 transition-colors">
            <Download size={13} /> Importar
          </button>
          <button onClick={() => setShowExport(true)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-wood-200 text-wood-600 rounded-lg text-xs hover:bg-sand-50 transition-colors">
            <Upload size={13} /> Exportar
          </button>
        </div>
      </div>

      {/* === KPIs === */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-wood-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-accent-gold/10 rounded-lg"><ShoppingBag size={14} className="text-accent-gold" /></div>
            <span className="text-lg text-wood-900">{kpis.total}</span>
          </div>
          <p className="text-[11px] text-wood-500">Total productos</p>
          <p className="text-[10px] text-wood-400">{kpis.totalVariants} variantes</p>
        </div>
        <div className="bg-white rounded-xl border border-wood-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-50 rounded-lg"><Check size={14} className="text-green-600" /></div>
            <span className="text-lg text-wood-900">{kpis.active}</span>
          </div>
          <p className="text-[11px] text-wood-500">Activos</p>
          <p className="text-[10px] text-wood-400">{kpis.drafts} borradores</p>
        </div>
        <div className="bg-white rounded-xl border border-wood-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${kpis.outOfStock > 0 ? 'bg-red-50' : 'bg-amber-50'}`}>
              <AlertTriangle size={14} className={kpis.outOfStock > 0 ? 'text-red-500' : 'text-amber-500'} />
            </div>
            <span className="text-lg text-wood-900">{kpis.lowStock}</span>
          </div>
          <p className="text-[11px] text-wood-500">Stock bajo</p>
          <p className={`text-[10px] ${kpis.outOfStock > 0 ? 'text-red-500' : 'text-wood-400'}`}>{kpis.outOfStock} agotado{kpis.outOfStock !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white rounded-xl border border-wood-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-accent-gold/10 rounded-lg"><DollarSign size={14} className="text-accent-gold" /></div>
            <span className="text-lg text-wood-900">${kpis.invCost.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-wood-500">Valor del inventario (costo)</p>
          <p className="text-[10px] text-wood-400">${kpis.invSale.toLocaleString()} venta</p>
        </div>
      </div>

      {/* === TOOLBAR === */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center bg-white border border-wood-200 rounded-lg overflow-hidden">
            <Search size={16} className="ml-3 text-wood-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o SKU..."
              className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-wood-900 placeholder:text-wood-400"
            />
          </div>
          <div className="flex gap-2 items-center">
            {/* View toggle */}
            <div className="flex items-center gap-0.5 text-[10px] text-wood-400 mr-1">Vista:</div>
            <div className="flex bg-white border border-wood-200 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-wood-900 text-sand-100' : 'text-wood-400 hover:text-wood-600'}`}>
                <Grid3X3 size={14} />
              </button>
              <button onClick={() => setViewMode('table')} className={`p-2.5 transition-colors ${viewMode === 'table' ? 'bg-wood-900 text-sand-100' : 'text-wood-400 hover:text-wood-600'}`}>
                <List size={14} />
              </button>
            </div>
            <div className="w-px h-6 bg-wood-200 mx-1" />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs transition-colors ${showFilters || activeFilters.length > 0 ? 'bg-accent-gold/10 text-accent-gold border border-accent-gold/30' : 'bg-white border border-wood-200 text-wood-600 hover:border-wood-300'}`}
            >
              <Filter size={13} />
              Filtros
              {activeFilters.length > 0 && (
                <span className="bg-accent-gold text-white text-[9px] px-1.5 py-0.5 rounded-full ml-0.5">{activeFilters.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* Active filter pills */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-wood-400">Filtros activos:</span>
            {activeFilters.map(([key, val]) => (
              <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-gold/10 text-accent-gold text-[11px] rounded-full">
                {filterLabels[key]?.[val] || val}
                <button onClick={() => setFilters(f => ({ ...f, [key]: 'all' }))} className="hover:text-red-500"><X size={10} /></button>
              </span>
            ))}
            <button onClick={clearFilters} className="text-[10px] text-wood-400 hover:text-red-500 underline">Limpiar</button>
          </div>
        )}

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-xl border border-wood-100 p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Status */}
                <div>
                  <label className="text-[10px] text-wood-400 uppercase tracking-wider mb-1.5 block">Estado</label>
                  <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 text-xs border border-wood-200 rounded-lg bg-white text-wood-700 outline-none">
                    <option value="all">Todos</option>
                    <option value="active">Activo</option>
                    <option value="draft">Borrador</option>
                    <option value="outOfStock">Agotado</option>
                  </select>
                </div>
                {/* Category */}
                <div>
                  <label className="text-[10px] text-wood-400 uppercase tracking-wider mb-1.5 block">Categoria</label>
                  <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 text-xs border border-wood-200 rounded-lg bg-white text-wood-700 outline-none">
                    <option value="all">Todas</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {/* Wood */}
                <div>
                  <label className="text-[10px] text-wood-400 uppercase tracking-wider mb-1.5 block">Madera</label>
                  <select value={filters.wood} onChange={e => setFilters(f => ({ ...f, wood: e.target.value }))} className="w-full px-3 py-2 text-xs border border-wood-200 rounded-lg bg-white text-wood-700 outline-none">
                    <option value="all">Todas</option>
                    {woods.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                {/* Stock */}
                <div>
                  <label className="text-[10px] text-wood-400 uppercase tracking-wider mb-1.5 block">Stock</label>
                  <select value={filters.stock} onChange={e => setFilters(f => ({ ...f, stock: e.target.value }))} className="w-full px-3 py-2 text-xs border border-wood-200 rounded-lg bg-white text-wood-700 outline-none">
                    <option value="all">Todos</option>
                    <option value="inStock">En stock</option>
                    <option value="low">Bajo (≤ reorden)</option>
                    <option value="out">Agotado (0)</option>
                  </select>
                </div>
                {/* Laser */}
                <div>
                  <label className="text-[10px] text-wood-400 uppercase tracking-wider mb-1.5 block">Grabado</label>
                  <select value={filters.laser} onChange={e => setFilters(f => ({ ...f, laser: e.target.value }))} className="w-full px-3 py-2 text-xs border border-wood-200 rounded-lg bg-white text-wood-700 outline-none">
                    <option value="all">Todos</option>
                    <option value="yes">Con grabado</option>
                    <option value="no">Sin grabado</option>
                  </select>
                </div>
                {/* Sold */}
                <div>
                  <label className="text-[10px] text-wood-400 uppercase tracking-wider mb-1.5 block">Vendidos</label>
                  <select value={filters.sold} onChange={e => setFilters(f => ({ ...f, sold: e.target.value }))} className="w-full px-3 py-2 text-xs border border-wood-200 rounded-lg bg-white text-wood-700 outline-none">
                    <option value="all">Todos</option>
                    <option value="best">Best sellers (&gt;20)</option>
                    <option value="normal">Normal</option>
                    <option value="none">Sin ventas</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* === BULK ACTIONS BAR === */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-accent-gold/5 border border-accent-gold/20 rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
              <span className="text-xs text-accent-gold">{selectedIds.size} seleccionado{selectedIds.size > 1 ? 's' : ''}</span>
              <div className="flex items-center gap-2 flex-wrap">
                <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="px-2 py-1.5 text-[11px] border border-accent-gold/30 rounded-lg bg-white text-wood-700 outline-none">
                  <option value="">Acciones bulk...</option>
                  <option value="activate">Cambiar a Activo</option>
                  <option value="draft">Cambiar a Borrador</option>
                  <option value="category">Cambiar categoria</option>
                  <option value="priceUp">Subir precio +10%</option>
                  <option value="priceDown">Bajar precio -10%</option>
                  <option value="export">Exportar seleccionados</option>
                  <option value="delete">Eliminar seleccionados</option>
                </select>
                {bulkAction && (
                  <button className="px-3 py-1.5 bg-accent-gold text-white text-[11px] rounded-lg hover:bg-accent-gold/90 transition-colors">
                    Aplicar
                  </button>
                )}
              </div>
              <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-[10px] text-wood-400 hover:text-red-500">
                Deseleccionar todo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === GRID VIEW === */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative aspect-square bg-sand-50">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                {/* Status badge */}
                <div className="absolute top-2 left-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig[product.status]?.class}`}>
                    {statusConfig[product.status]?.dot} {statusConfig[product.status]?.label}
                  </span>
                </div>
                {/* Stock warning */}
                {product.stock > 0 && product.stock <= product.reorderPoint && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-amber-50 text-amber-600 text-[9px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <AlertTriangle size={9} /> Stock bajo
                    </span>
                  </div>
                )}
                {/* Out of stock overlay */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs font-medium tracking-wider uppercase bg-red-500/80 px-3 py-1 rounded-full">Agotado</span>
                  </div>
                )}
                {/* Hover actions */}
                <div className="absolute inset-0 bg-wood-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button className="p-2 bg-white rounded-lg text-wood-900 hover:bg-sand-50 transition-colors"><Eye size={16} /></button>
                  <button onClick={() => setEditingProduct(product)} className="p-2 bg-white rounded-lg text-wood-900 hover:bg-sand-50 transition-colors"><Pencil size={16} /></button>
                  <button className="p-2 bg-white rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-[10px] text-wood-400 mb-0.5">{product.sku}</p>
                <h4 className="text-sm text-wood-900 truncate">{product.name}</h4>

                {/* Price + margin */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-wood-900">${product.price.toLocaleString()} MXN</span>
                  {product.comparePrice && (
                    <span className="text-[10px] text-wood-400 line-through">${product.comparePrice.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-wood-400 mt-0.5">
                  <span>Costo: ${product.cost.toLocaleString()}</span>
                  <span>Margen: <span className={`${getMargin(product) >= 50 ? 'text-green-600' : 'text-amber-500'}`}>{getMargin(product)}%</span></span>
                </div>

                {/* Stock + laser */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-wood-50">
                  <div className="flex items-center gap-1.5">
                    <Package size={11} className={stockColor(product)} />
                    <span className={`text-[11px] ${stockColor(product)}`}>
                      Stock: {product.stock === 999 ? '∞' : product.stock}
                    </span>
                  </div>
                  {product.laserAvailable && (
                    <span className="flex items-center gap-1 text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                      <Zap size={9} /> Grabado
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="text-[11px] text-accent-gold hover:underline"
                  >
                    Editar
                  </button>
                  <div className="relative">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setContextMenu(contextMenu?.id === product.id ? null : { id: product.id, x: 0, y: 0 });
                      }}
                      className="p-1.5 hover:bg-sand-50 rounded-lg text-wood-400 hover:text-wood-600 transition-colors"
                    >
                      <MoreVertical size={14} />
                    </button>
                    {contextMenu?.id === product.id && <ContextMenuDropdown product={product} />}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* === TABLE VIEW === */
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
                  <th className="pl-4 py-3 w-8">
                    <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="accent-accent-gold rounded" />
                  </th>
                  <th className="px-3 py-3 w-12"></th>
                  <th className="px-3 py-3 cursor-pointer select-none" onClick={() => toggleSort('name')}>
                    <span className="flex items-center gap-1">Producto <ArrowUpDown size={10} className={sortKey === 'name' ? 'text-accent-gold' : ''} /></span>
                  </th>
                  <th className="px-3 py-3">SKU</th>
                  <th className="px-3 py-3 hidden lg:table-cell">Madera</th>
                  <th className="px-3 py-3 hidden md:table-cell">Categoria</th>
                  <th className="px-3 py-3 cursor-pointer select-none" onClick={() => toggleSort('price')}>
                    <span className="flex items-center gap-1">Precio <ArrowUpDown size={10} className={sortKey === 'price' ? 'text-accent-gold' : ''} /></span>
                  </th>
                  <th className="px-3 py-3 hidden lg:table-cell">Costo</th>
                  <th className="px-3 py-3 cursor-pointer select-none hidden md:table-cell" onClick={() => toggleSort('margin')}>
                    <span className="flex items-center gap-1">Margen <ArrowUpDown size={10} className={sortKey === 'margin' ? 'text-accent-gold' : ''} /></span>
                  </th>
                  <th className="px-3 py-3 cursor-pointer select-none" onClick={() => toggleSort('stock')}>
                    <span className="flex items-center gap-1">Stock <ArrowUpDown size={10} className={sortKey === 'stock' ? 'text-accent-gold' : ''} /></span>
                  </th>
                  <th className="px-3 py-3 cursor-pointer select-none hidden lg:table-cell" onClick={() => toggleSort('soldUnits')}>
                    <span className="flex items-center gap-1">Vendidos <ArrowUpDown size={10} className={sortKey === 'soldUnits' ? 'text-accent-gold' : ''} /></span>
                  </th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-3 py-3 hidden lg:table-cell w-8" title="Grabado laser">
                    <Zap size={11} />
                  </th>
                  <th className="px-3 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wood-50">
                {filtered.map((p, idx) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className={`hover:bg-sand-50/50 transition-colors ${selectedIds.has(p.id) ? 'bg-accent-gold/5' : ''}`}
                  >
                    <td className="pl-4 py-3">
                      <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} className="accent-accent-gold rounded" />
                    </td>
                    <td className="px-3 py-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => setEditingProduct(p)} className="text-left hover:text-accent-gold transition-colors">
                        <p className="text-xs text-wood-900 truncate max-w-[180px]">{p.name}</p>
                      </button>
                      <p className="text-[10px] text-wood-400">{p.material}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-wood-500 font-mono">{p.sku}</td>
                    <td className="px-3 py-3 text-xs text-wood-500 hidden lg:table-cell">{p.material}</td>
                    <td className="px-3 py-3 text-xs text-wood-500 hidden md:table-cell">{p.category}</td>
                    <td className="px-3 py-3">
                      <span className="text-xs text-wood-900">${p.price.toLocaleString()}</span>
                      {p.comparePrice && <span className="text-[10px] text-wood-400 line-through ml-1">${p.comparePrice.toLocaleString()}</span>}
                    </td>
                    <td className="px-3 py-3 text-xs text-wood-500 hidden lg:table-cell">${p.cost.toLocaleString()}</td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className={`text-xs ${getMargin(p) >= 50 ? 'text-green-600' : getMargin(p) >= 30 ? 'text-amber-500' : 'text-red-500'}`}>
                        {getMargin(p)}%
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs ${stockColor(p)}`}>
                        {p.stock === 999 ? '∞' : p.stock}
                      </span>
                      {p.stock > 0 && p.stock <= p.reorderPoint && <AlertTriangle size={10} className="inline ml-1 text-amber-400" />}
                      {p.stock === 0 && <span className="inline-block w-2 h-2 rounded-full bg-red-500 ml-1" />}
                    </td>
                    <td className="px-3 py-3 text-xs text-wood-500 hidden lg:table-cell">{p.soldUnits}</td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig[p.status]?.class}`}>
                        {statusConfig[p.status]?.dot} {statusConfig[p.status]?.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      {p.laserAvailable && <Zap size={12} className="text-red-500" />}
                    </td>
                    <td className="px-3 py-3">
                      <div className="relative">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setContextMenu(contextMenu?.id === p.id ? null : { id: p.id, x: 0, y: 0 });
                          }}
                          className="p-1.5 hover:bg-sand-50 rounded-lg text-wood-400 hover:text-wood-600 transition-colors"
                        >
                          <MoreVertical size={14} />
                        </button>
                        {contextMenu?.id === p.id && <ContextMenuDropdown product={p} />}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-wood-400 text-sm">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p>No se encontraron productos</p>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between text-[10px] text-wood-400 pt-1">
        <span>Mostrando {filtered.length} de {adminProducts.length} productos</span>
      </div>

      {/* === MODALS === */}
      <ExportModal
        open={showExport}
        onClose={() => setShowExport(false)}
        totalProducts={adminProducts.length}
        selectedCount={selectedIds.size}
        filteredCount={filtered.length}
        searchQuery={searchQuery}
      />
    </div>
  );
};