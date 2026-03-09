"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderTree, Tag, Plus, Search, TreePine, List, ChevronRight, ChevronDown,
  GripVertical, Pencil, Trash2, MoreVertical, Eye, EyeOff, Copy, FolderPlus,
  ExternalLink, X, Check, AlertTriangle, Image as ImageIcon, BarChart3,
  ShoppingBag, DollarSign, Users, ArrowLeft, Sparkles, Calendar, Clock,
  Globe, Settings2, Shield, Info, Upload, Zap
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RTooltip, XAxis } from 'recharts';
import { toast } from 'sonner';

/* ================================================================
   MOCK DATA
   ================================================================ */

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  products: number;
  salesMonth: number;
  status: 'active' | 'hidden' | 'disabled';
  hasImage: boolean;
  hasSeo: boolean;
  icon: string;
  order: number;
  description: string;
  metaTitle: string;
  metaDescription: string;
  layout: 'grid' | 'list' | 'featured';
  productsPerPage: number;
  sortDefault: string;
  filters: { wood: boolean; price: boolean; finish: boolean; size: boolean };
  banner: { text: string; bgColor: string; textColor: string; link: string; active: boolean } | null;
  showInMenu: boolean;
  showInFooter: boolean;
  showInSidebar: boolean;
  showInHomepage: boolean;
  createdAt: string;
  updatedAt: string;
}

const mockCategories: Category[] = [
  {
    id: 'cat-1', name: 'Tablas para Cortar', slug: 'tablas-para-cortar', parentId: null,
    products: 12, salesMonth: 48200, status: 'active', hasImage: true, hasSeo: true,
    icon: '🪵', order: 1,
    description: 'Descubre nuestra coleccion de tablas artesanales para cortar, picar y presentar alimentos. Cada pieza esta tallada a mano con maderas mexicanas sustentables como parota, cedro rojo y rosa morada.',
    metaTitle: 'Tablas para Cortar Artesanales | DavidSon\'s Design',
    metaDescription: 'Tablas artesanales de madera mexicana para cortar, picar y presentar. Hechas a mano con parota, cedro rojo y rosa morada.',
    layout: 'grid', productsPerPage: 12, sortDefault: 'manual',
    filters: { wood: true, price: true, finish: true, size: false },
    banner: { text: 'Envio gratis en pedidos de $2,500+', bgColor: 'var(--admin-accent)', textColor: 'var(--admin-surface)', link: '/shop?promo=envio-gratis', active: true },
    showInMenu: true, showInFooter: true, showInSidebar: true, showInHomepage: true,
    createdAt: '23 Feb 2026', updatedAt: '28 Feb 2026',
  },
  {
    id: 'cat-1-1', name: 'Charcuteria y Presentacion', slug: 'charcuteria', parentId: 'cat-1',
    products: 5, salesMonth: 22100, status: 'active', hasImage: true, hasSeo: true,
    icon: '🧀', order: 1,
    description: 'Tablas ideales para presentar quesos, embutidos y botanas con estilo artesanal.',
    metaTitle: 'Tablas de Charcuteria | DavidSon\'s Design',
    metaDescription: 'Tablas artesanales para charcuteria y presentacion. Perfectas para quesos, embutidos y botanas.',
    layout: 'grid', productsPerPage: 12, sortDefault: 'bestsellers',
    filters: { wood: true, price: true, finish: true, size: false },
    banner: null,
    showInMenu: true, showInFooter: false, showInSidebar: true, showInHomepage: false,
    createdAt: '23 Feb 2026', updatedAt: '27 Feb 2026',
  },
  {
    id: 'cat-1-2', name: 'Cocina y Preparacion', slug: 'cocina', parentId: 'cat-1',
    products: 4, salesMonth: 18400, status: 'active', hasImage: true, hasSeo: false,
    icon: '🍽️', order: 2,
    description: 'Tablas resistentes para el uso diario en la cocina, perfectas para cortar y picar.',
    metaTitle: '', metaDescription: '',
    layout: 'grid', productsPerPage: 12, sortDefault: 'manual',
    filters: { wood: true, price: true, finish: false, size: false },
    banner: null,
    showInMenu: true, showInFooter: false, showInSidebar: true, showInHomepage: false,
    createdAt: '23 Feb 2026', updatedAt: '26 Feb 2026',
  },
  {
    id: 'cat-1-3', name: 'Decorativas', slug: 'decorativas', parentId: 'cat-1',
    products: 3, salesMonth: 7700, status: 'active', hasImage: true, hasSeo: false,
    icon: '🎨', order: 3,
    description: 'Tablas decorativas para exhibir en tu cocina o comedor.',
    metaTitle: '', metaDescription: '',
    layout: 'grid', productsPerPage: 12, sortDefault: 'manual',
    filters: { wood: true, price: true, finish: false, size: false },
    banner: null,
    showInMenu: false, showInFooter: false, showInSidebar: true, showInHomepage: false,
    createdAt: '24 Feb 2026', updatedAt: '24 Feb 2026',
  },
  {
    id: 'cat-2', name: 'Sets y Colecciones', slug: 'sets', parentId: null,
    products: 3, salesMonth: 28900, status: 'active', hasImage: true, hasSeo: true,
    icon: '🎁', order: 2,
    description: 'Combinaciones curadas de nuestras mejores piezas artesanales, ideales para regalo.',
    metaTitle: 'Sets de Tablas Artesanales | DavidSon\'s Design',
    metaDescription: 'Sets y colecciones de tablas artesanales para regalo. Combinaciones curadas con las mejores maderas mexicanas.',
    layout: 'featured', productsPerPage: 8, sortDefault: 'price-desc',
    filters: { wood: false, price: true, finish: false, size: false },
    banner: null,
    showInMenu: true, showInFooter: true, showInSidebar: true, showInHomepage: true,
    createdAt: '23 Feb 2026', updatedAt: '28 Feb 2026',
  },
  {
    id: 'cat-2-1', name: 'Sets de Regalo', slug: 'sets-regalo', parentId: 'cat-2',
    products: 2, salesMonth: 18200, status: 'active', hasImage: false, hasSeo: false,
    icon: '🎀', order: 1,
    description: 'Sets perfectos para regalar en ocasiones especiales.',
    metaTitle: '', metaDescription: '',
    layout: 'grid', productsPerPage: 12, sortDefault: 'manual',
    filters: { wood: false, price: true, finish: false, size: false },
    banner: null,
    showInMenu: false, showInFooter: false, showInSidebar: true, showInHomepage: false,
    createdAt: '23 Feb 2026', updatedAt: '25 Feb 2026',
  },
  {
    id: 'cat-2-2', name: 'Sets Profesionales', slug: 'sets-profesionales', parentId: 'cat-2',
    products: 1, salesMonth: 10700, status: 'active', hasImage: false, hasSeo: false,
    icon: '👨‍🍳', order: 2,
    description: 'Sets diseñados para chefs y profesionales de la cocina.',
    metaTitle: '', metaDescription: '',
    layout: 'grid', productsPerPage: 12, sortDefault: 'manual',
    filters: { wood: false, price: true, finish: false, size: false },
    banner: null,
    showInMenu: false, showInFooter: false, showInSidebar: true, showInHomepage: false,
    createdAt: '23 Feb 2026', updatedAt: '25 Feb 2026',
  },
  {
    id: 'cat-3', name: 'Accesorios', slug: 'accesorios', parentId: null,
    products: 0, salesMonth: 0, status: 'active', hasImage: false, hasSeo: false,
    icon: '✂️', order: 3,
    description: '',
    metaTitle: '', metaDescription: '',
    layout: 'grid', productsPerPage: 12, sortDefault: 'manual',
    filters: { wood: false, price: true, finish: false, size: false },
    banner: null,
    showInMenu: true, showInFooter: false, showInSidebar: true, showInHomepage: false,
    createdAt: '25 Feb 2026', updatedAt: '25 Feb 2026',
  },
  {
    id: 'cat-4', name: 'Servicios', slug: 'servicios', parentId: null,
    products: 1, salesMonth: 2450, status: 'active', hasImage: false, hasSeo: false,
    icon: '🔧', order: 4,
    description: 'Grabado laser y servicios adicionales para personalizar tus piezas.',
    metaTitle: '', metaDescription: '',
    layout: 'list', productsPerPage: 8, sortDefault: 'manual',
    filters: { wood: false, price: false, finish: false, size: false },
    banner: null,
    showInMenu: true, showInFooter: true, showInSidebar: false, showInHomepage: false,
    createdAt: '23 Feb 2026', updatedAt: '27 Feb 2026',
  },
];

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  products: number;
  salesMonth: number;
  type: 'manual' | 'automatic';
  status: 'active' | 'expired' | 'scheduled';
  hasImage: boolean;
  startDate: string | null;
  endDate: string | null;
  rules: { field: string; op: string; value: string }[];
  sortBy: string;
  limit: number;
  showOnPage: boolean;
  showOnHomepage: boolean;
  showInMenu: boolean;
}

const mockCollections: Collection[] = [
  {
    id: 'col-1', name: 'Best Sellers', slug: 'best-sellers',
    description: 'Nuestras piezas mas vendidas y queridas por los clientes.',
    products: 8, salesMonth: 82300, type: 'automatic', status: 'active',
    hasImage: true, startDate: null, endDate: null,
    rules: [{ field: 'ventas', op: 'mayor_que', value: '5' }],
    sortBy: 'bestsellers', limit: 10,
    showOnPage: true, showOnHomepage: true, showInMenu: true,
  },
  {
    id: 'col-2', name: 'Nuevos Productos', slug: 'nuevos',
    description: 'Las ultimas incorporaciones a nuestro catalogo.',
    products: 3, salesMonth: 12400, type: 'automatic', status: 'active',
    hasImage: true, startDate: null, endDate: null,
    rules: [{ field: 'fecha_creacion', op: 'ultimos_dias', value: '30' }],
    sortBy: 'newest', limit: 10,
    showOnPage: true, showOnHomepage: true, showInMenu: false,
  },
  {
    id: 'col-3', name: 'Regalos para Mama', slug: 'regalos-mama',
    description: 'Las mejores piezas artesanales para sorprender a mama. Cada tabla incluye opcion de grabado laser personalizado.',
    products: 5, salesMonth: 8200, type: 'manual', status: 'active',
    hasImage: true, startDate: '1 Mar 2026', endDate: '10 May 2026',
    rules: [], sortBy: 'manual', limit: 0,
    showOnPage: true, showOnHomepage: true, showInMenu: true,
  },
  {
    id: 'col-4', name: 'Ofertas Navidad 2025', slug: 'navidad-2025',
    description: 'Coleccion de temporada navidena con descuentos especiales.',
    products: 6, salesMonth: 0, type: 'manual', status: 'expired',
    hasImage: true, startDate: '1 Nov 2025', endDate: '31 Dic 2025',
    rules: [], sortBy: 'manual', limit: 0,
    showOnPage: false, showOnHomepage: false, showInMenu: false,
  },
];

// Legacy detail data — CategoryDetail and CollectionDetail use these as demo content
// Sales chart shows placeholder trend (real per-category sales are in the main list via API)
const legacySalesChart = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  ventas: Math.round(800 + Math.random() * 1200 + (i > 20 ? 400 : 0)),
}));

/* ================================================================
   HELPERS
   ================================================================ */

const statusBadge = (status: string) => {
  switch (status) {
    case 'active': return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">● Activa</span>;
    case 'hidden': return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--admin-surface2)] text-[var(--admin-text-secondary)]">○ Oculta</span>;
    case 'disabled': return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">○ Desactivada</span>;
    case 'expired': return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-500">○ Expirada</span>;
    case 'scheduled': return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">◷ Programada</span>;
    default: return null;
  }
};

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export const CategoriesPage: React.FC = () => {
  const [tab, setTab] = useState<'categories' | 'collections'>('categories');
  const [catView, setCatView] = useState<'tree' | 'list'>('tree');
  const [searchQ, setSearchQ] = useState('');
  const [editing, setEditing] = useState<Category | null | 'new'>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null | 'new'>(null);
  const [contextMenu, setContextMenu] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [reorderMode, setReorderMode] = useState(false);

  // ── Live categories from Medusa ──
  const [liveCategories, setLiveCategories] = useState<Category[]>([]);
  const [liveCollections, setLiveCollections] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const fetchCategories = useCallback(async (silent = false) => {
    try {
      if (!silent) setCatLoading(true);
      const params = new URLSearchParams();
      if (searchQ) params.set('search', searchQ);
      const res = await fetch(`/api/admin/categories?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLiveCategories(data.categories || []);
        setLiveCollections(data.collections || []);
        setIsLive(true);
        // Auto-expand root categories
        if (expanded.size === 0) {
          const roots = (data.categories || []).filter((c: any) => !c.parentId).map((c: any) => c.id);
          setExpanded(new Set(roots.slice(0, 3)));
        }
      }
    } catch (err) {
      console.error('[CategoriesPage] fetch error:', err);
      if (!silent) {
        setIsLive(false);
      }
    } finally {
      setCatLoading(false);
    }
  }, [searchQ]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const allCategories = liveCategories;

  const rootCats = useMemo(() => allCategories.filter(c => c.parentId === null).sort((a, b) => a.order - b.order), [allCategories]);
  const getChildren = useCallback((parentId: string) => allCategories.filter(c => c.parentId === parentId).sort((a, b) => a.order - b.order), [allCategories]);

  const filteredCats = useMemo(() => {
    if (!searchQ) return allCategories;
    const q = searchQ.toLowerCase();
    return allCategories.filter(c => c.name.toLowerCase().includes(q) || c.slug.includes(q));
  }, [searchQ, allCategories]);

  const kpis = useMemo(() => {
    const cats = allCategories.filter(c => c.parentId === null);
    const withSub = allCategories.filter(c => c.parentId !== null);
    const empty = allCategories.filter(c => c.products === 0);
    const totalProducts = allCategories.reduce((s, c) => s + c.products, 0);
    const uncategorized = 0;
    const activeCols = liveCollections.length;
    const expiredCols = 0;
    return { totalCats: cats.length, subCats: withSub.length, totalProducts, uncategorized, empty: empty.length, activeCols, expiredCols };
  }, [allCategories]);

  const toggleExpand = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  /* --- If editing category --- */
  if (editing !== null) {
    return <CategoryForm category={editing === 'new' ? null : editing} onBack={() => { setEditing(null); fetchCategories(); }} allCategories={allCategories} />;
  }

  /* --- If editing collection --- */
  if (editingCollection !== null) {
    return <CollectionForm collection={editingCollection === 'new' ? null : editingCollection} onBack={() => setEditingCollection(null)} />;
  }

  /* --- Context menu --- */
  const CatContextMenu: React.FC<{ cat: Category }> = ({ cat }) => (
    <div className="absolute right-0 top-full mt-1 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-xl py-1 z-30 min-w-[200px]" onClick={e => e.stopPropagation()}>
      <button onClick={() => { setEditing(cat); setContextMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface2)]">
        <Pencil size={12} /> Editar categoria
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface2)]">
        <FolderPlus size={12} /> Agregar sub-categoria
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface2)]">
        <ShoppingBag size={12} /> Ver productos ({cat.products})
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface2)]">
        <Copy size={12} /> Duplicar estructura
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface2)]">
        {cat.status === 'hidden' ? <Eye size={12} /> : <EyeOff size={12} />}
        {cat.status === 'hidden' ? 'Mostrar en menu' : 'Ocultar del menu'}
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface2)]">
        <ExternalLink size={12} /> Ver en tienda
      </button>
      <div className="border-t border-[var(--admin-border)] my-1" />
      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50">
        <Trash2 size={12} /> Eliminar
      </button>
    </div>
  );

  /* --- Tree node --- */
  const TreeNode: React.FC<{ cat: Category; depth: number }> = ({ cat, depth }) => {
    const children = getChildren(cat.id);
    const hasChildren = children.length > 0;
    const isExpanded = expanded.has(cat.id);
    const isEmpty = cat.products === 0;

    return (
      <div>
        <div
          className={`group flex items-center gap-2 px-3 py-3 hover:bg-[var(--admin-surface2)]/50 transition-colors ${depth > 0 ? 'border-l-2 border-[var(--admin-border)]' : ''}`}
          style={{ paddingLeft: `${12 + depth * 24}px` }}
        >
          {reorderMode && (
            <GripVertical size={14} className="text-[var(--admin-muted)] cursor-grab flex-shrink-0" />
          )}

          {/* Expand toggle */}
          {hasChildren ? (
            <button onClick={() => toggleExpand(cat.id)} className="p-0.5 text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)] flex-shrink-0">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Icon */}
          <span className="text-sm flex-shrink-0">{cat.icon}</span>

          {/* Name + info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(cat)} className="text-sm text-[var(--admin-text)] hover:text-[var(--admin-accent)] transition-colors truncate">
                {cat.name}
              </button>
              {isEmpty && <AlertTriangle size={11} className="text-amber-400 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[var(--admin-muted)] mt-0.5">
              {cat.hasImage && <span className="flex items-center gap-0.5"><ImageIcon size={9} /> Imagen</span>}
              <span>Ventas: ${cat.salesMonth.toLocaleString()}/mes</span>
            </div>
          </div>

          {/* Product count */}
          <span className={`text-[11px] flex-shrink-0 ${isEmpty ? 'text-amber-500' : 'text-[var(--admin-text-secondary)]'}`}>
            {cat.products} producto{cat.products !== 1 ? 's' : ''}
          </span>

          {/* Status */}
          <div className="flex-shrink-0">{statusBadge(cat.status)}</div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(cat)} className="p-1 text-[var(--admin-muted)] hover:text-[var(--admin-accent)] rounded">
              <Pencil size={12} />
            </button>
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setContextMenu(contextMenu === cat.id ? null : cat.id); }}
                className="p-1 text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)] rounded"
              >
                <MoreVertical size={12} />
              </button>
              {contextMenu === cat.id && <CatContextMenu cat={cat} />}
            </div>
          </div>
        </div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {children.map(child => (
                <TreeNode key={child.id} cat={child} depth={depth + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-4" onClick={() => setContextMenu(null)}>
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FolderTree size={18} className="text-[var(--admin-accent)]" />
          <h3 className="font-serif text-lg text-[var(--admin-text)]">Categorias y Colecciones</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditing('new')} className="flex items-center gap-1.5 px-4 py-2 bg-wood-900 text-sand-100 rounded-lg text-xs hover:bg-wood-800 transition-colors">
            <Plus size={14} /> Nueva Categoria
          </button>
          <button onClick={() => setEditingCollection('new')} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] rounded-lg text-xs hover:bg-[var(--admin-surface2)] transition-colors">
            <Plus size={13} /> Nueva Coleccion
          </button>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="flex items-center gap-6 border-b border-[var(--admin-border)]">
        {[
          { key: 'categories' as const, label: 'Categorias', icon: FolderTree },
          { key: 'collections' as const, label: 'Colecciones', icon: Tag },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 pb-2.5 text-xs border-b-2 transition-colors ${
              tab === t.key ? 'border-[var(--admin-accent)] text-[var(--admin-accent)]' : 'border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)]'
            }`}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* ===== KPIs ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-[var(--admin-accent)]/10 rounded-lg"><FolderTree size={14} className="text-[var(--admin-accent)]" /></div>
            <span className="text-lg text-[var(--admin-text)]">{kpis.totalCats}</span>
          </div>
          <p className="text-[11px] text-[var(--admin-text-secondary)]">Categorias activas</p>
          <p className="text-[10px] text-[var(--admin-muted)]">{kpis.subCats} con sub-categorias</p>
        </div>
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-50 rounded-lg"><ShoppingBag size={14} className="text-green-600" /></div>
            <span className="text-lg text-[var(--admin-text)]">{kpis.totalProducts}</span>
          </div>
          <p className="text-[11px] text-[var(--admin-text-secondary)]">Productos categorizados</p>
          <p className="text-[10px] text-[var(--admin-muted)]">{kpis.uncategorized} sin categoria</p>
        </div>
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${kpis.empty > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
              <AlertTriangle size={14} className={kpis.empty > 0 ? 'text-amber-500' : 'text-green-600'} />
            </div>
            <span className="text-lg text-[var(--admin-text)]">{kpis.empty}</span>
          </div>
          <p className="text-[11px] text-[var(--admin-text-secondary)]">Categorias vacias</p>
        </div>
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-[var(--admin-accent)]/10 rounded-lg"><Tag size={14} className="text-[var(--admin-accent)]" /></div>
            <span className="text-lg text-[var(--admin-text)]">{kpis.activeCols}</span>
          </div>
          <p className="text-[11px] text-[var(--admin-text-secondary)]">Colecciones activas</p>
          <p className="text-[10px] text-[var(--admin-muted)]">{kpis.expiredCols} expirada{kpis.expiredCols !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* ===== TAB: CATEGORIES ===== */}
      {tab === 'categories' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg overflow-hidden">
              <Search size={16} className="ml-3 text-[var(--admin-muted)]" />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Buscar categoria..."
                className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-[var(--admin-text)] placeholder:text-[var(--admin-muted)]"
              />
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-0.5 text-[10px] text-[var(--admin-muted)] mr-1">Vista:</div>
              <div className="flex bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg overflow-hidden">
                <button onClick={() => setCatView('tree')} className={`p-2.5 transition-colors ${catView === 'tree' ? 'bg-wood-900 text-sand-100' : 'text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)]'}`}>
                  <TreePine size={14} />
                </button>
                <button onClick={() => setCatView('list')} className={`p-2.5 transition-colors ${catView === 'list' ? 'bg-wood-900 text-sand-100' : 'text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)]'}`}>
                  <List size={14} />
                </button>
              </div>
              <div className="w-px h-6 bg-wood-200 mx-1" />
              <button
                onClick={() => setReorderMode(!reorderMode)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs transition-colors ${reorderMode ? 'bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] border border-[var(--admin-accent)]/30' : 'bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:border-wood-300'}`}
              >
                <GripVertical size={12} /> {reorderMode ? 'Guardar orden' : 'Reordenar'}
              </button>
            </div>
          </div>

          {/* Tree view */}
          {catView === 'tree' ? (
            <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface2)]/50 flex items-center justify-between">
                <p className="text-[11px] text-[var(--admin-muted)]">
                  Arrastra las categorias para reordenar. El orden define como aparecen en el menu de la tienda.
                </p>
              </div>
              <div className="divide-y divide-wood-50">
                {(searchQ ? filteredCats.filter(c => c.parentId === null) : rootCats).map(cat => (
                  <TreeNode key={cat.id} cat={cat} depth={0} />
                ))}
              </div>
              <div className="px-4 py-3 border-t border-[var(--admin-border)] flex gap-3">
                <button onClick={() => setEditing('new')} className="text-[11px] text-[var(--admin-accent)] hover:underline flex items-center gap-1">
                  <Plus size={11} /> Nueva categoria raiz
                </button>
                <button className="text-[11px] text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)] flex items-center gap-1">
                  <FolderPlus size={11} /> Nueva sub-categoria
                </button>
              </div>
            </div>
          ) : (
            /* List view (table) */
            <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider border-b border-[var(--admin-border)] bg-[var(--admin-surface2)]/50">
                      <th className="px-4 py-3 w-12">Orden</th>
                      <th className="px-3 py-3">Categoria</th>
                      <th className="px-3 py-3 hidden md:table-cell">Padre</th>
                      <th className="px-3 py-3">Productos</th>
                      <th className="px-3 py-3 hidden lg:table-cell">Ventas/mes</th>
                      <th className="px-3 py-3">Estado</th>
                      <th className="px-3 py-3 hidden md:table-cell w-12 text-center">Imagen</th>
                      <th className="px-3 py-3 hidden lg:table-cell w-12 text-center">SEO</th>
                      <th className="px-3 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wood-50">
                    {[...allCategories].sort((a, b) => {
                      const aRoot = a.parentId === null ? a.order : (allCategories.find(c => c.id === a.parentId)?.order || 0) + a.order * 0.1;
                      const bRoot = b.parentId === null ? b.order : (allCategories.find(c => c.id === b.parentId)?.order || 0) + b.order * 0.1;
                      return aRoot - bRoot;
                    }).map(cat => {
                      const parent = cat.parentId ? allCategories.find(c => c.id === cat.parentId) : null;
                      const orderLabel = parent
                        ? `${parent.order}.${cat.order}`
                        : `${cat.order}`;
                      return (
                        <tr key={cat.id} className="hover:bg-[var(--admin-surface2)]/30 transition-colors">
                          <td className="px-4 py-3 text-xs text-[var(--admin-muted)] font-mono">{orderLabel}</td>
                          <td className="px-3 py-3">
                            <button onClick={() => setEditing(cat)} className="flex items-center gap-2 hover:text-[var(--admin-accent)] transition-colors">
                              <span>{cat.icon}</span>
                              <span className="text-xs text-[var(--admin-text)]">{parent ? '↳ ' : ''}{cat.name}</span>
                            </button>
                          </td>
                          <td className="px-3 py-3 text-xs text-[var(--admin-muted)] hidden md:table-cell">{parent?.name || '—'}</td>
                          <td className="px-3 py-3">
                            <span className={`text-xs ${cat.products === 0 ? 'text-amber-500' : 'text-[var(--admin-text)]'}`}>{cat.products}</span>
                          </td>
                          <td className="px-3 py-3 text-xs text-[var(--admin-text-secondary)] hidden lg:table-cell">${cat.salesMonth.toLocaleString()}</td>
                          <td className="px-3 py-3">{cat.products === 0 ? <span className="text-[10px] text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">⚠ Vacia</span> : statusBadge(cat.status)}</td>
                          <td className="px-3 py-3 text-center hidden md:table-cell">
                            {cat.hasImage ? <Check size={12} className="mx-auto text-green-500" /> : <X size={12} className="mx-auto text-red-400" />}
                          </td>
                          <td className="px-3 py-3 text-center hidden lg:table-cell">
                            {cat.hasSeo ? <Check size={12} className="mx-auto text-green-500" /> : <X size={12} className="mx-auto text-red-400" />}
                          </td>
                          <td className="px-3 py-3">
                            <div className="relative">
                              <button
                                onClick={e => { e.stopPropagation(); setContextMenu(contextMenu === cat.id ? null : cat.id); }}
                                className="p-1.5 hover:bg-[var(--admin-surface2)] rounded-lg text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)] transition-colors"
                              >
                                <MoreVertical size={14} />
                              </button>
                              {contextMenu === cat.id && <CatContextMenu cat={cat} />}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== TAB: COLLECTIONS ===== */}
      {tab === 'collections' && (
        <div className="space-y-4">
          <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm divide-y divide-wood-50">
            {liveCollections.length === 0 ? (
              <div className="p-12 text-center">
                <Tag size={32} className="mx-auto mb-3 text-[var(--admin-muted)]" />
                <p className="text-sm text-[var(--admin-text-secondary)] mb-1">No hay colecciones creadas</p>
                <p className="text-xs text-[var(--admin-muted)]">Las colecciones agrupan productos manualmente para promociones o temporadas.</p>
              </div>
            ) : liveCollections.map(col => (
              <div key={col.id} className="p-5 flex items-start gap-4 hover:bg-[var(--admin-surface2)]/30 transition-colors group">
                <div className="w-16 h-16 rounded-xl bg-[var(--admin-surface2)] flex-shrink-0 flex items-center justify-center">
                  <Tag size={20} className="text-[var(--admin-accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-[var(--admin-text)] truncate">{col.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600">Activa</span>
                  </div>
                  <p className="text-[11px] text-[var(--admin-text-secondary)]">{col.productCount} productos | Handle: {col.handle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ================================================================
   CATEGORY FORM (Full-page drawer)
   ================================================================ */

interface CategoryFormProps {
  category: Category | null;
  onBack: () => void;
  allCategories?: Category[];
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onBack, allCategories = [] }) => {
  const isEditing = !!category;
  const [activeSection, setActiveSection] = useState('basic');
  const [form, setForm] = useState({
    name: category?.name || '',
    parentId: category?.parentId || '',
    description: category?.description || '',
    status: category?.status || 'active',
    icon: category?.icon || '📁',
    slug: category?.slug || '',
    metaTitle: category?.metaTitle || '',
    metaDescription: category?.metaDescription || '',
    layout: category?.layout || 'grid',
    productsPerPage: category?.productsPerPage || 12,
    sortDefault: category?.sortDefault || 'manual',
    filters: category?.filters || { wood: true, price: true, finish: true, size: false },
    bannerText: category?.banner?.text || '',
    bannerBg: category?.banner?.bgColor || 'var(--admin-accent)',
    bannerTextColor: category?.banner?.textColor || 'var(--admin-surface)',
    bannerLink: category?.banner?.link || '',
    bannerActive: category?.banner?.active || false,
    showInMenu: category?.showInMenu ?? true,
    showInFooter: category?.showInFooter ?? false,
    showInSidebar: category?.showInSidebar ?? true,
    showInHomepage: category?.showInHomepage ?? false,
  });

  const sections = [
    { id: 'basic', label: 'Informacion basica', icon: Info },
    { id: 'image', label: 'Imagen de portada', icon: ImageIcon },
    { id: 'appearance', label: 'Apariencia en tienda', icon: Eye },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'products', label: 'Productos', icon: ShoppingBag },
    { id: 'stats', label: 'Estadisticas', icon: BarChart3 },
    { id: 'advanced', label: 'Configuracion', icon: Settings2 },
  ];

  const iconOptions = ['🪵', '🧀', '🍽️', '🎁', '✂️', '🔧', '📦', '⭐', '🏷️', '🎨', '🎀', '👨‍🍳'];

  const legacyDetailProducts = [
    { name: 'Tabla Parota Charcuteria Med', price: 850, stock: 15 },
    { name: 'Tabla Parota Charcuteria Gde', price: 1100, stock: 8 },
    { name: 'Tabla Rosa Morada Gourmet', price: 1650, stock: 2 },
    { name: 'Tabla Cedro Rojo Rustica', price: 1200, stock: 8 },
    { name: 'Mini Tabla Parota Appetizer', price: 450, stock: 20 },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-[var(--admin-surface2)] rounded-lg text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider">Categorias</p>
            <h3 className="font-serif text-[var(--admin-text)]">{isEditing ? `Editar: ${category.name}` : 'Nueva Categoria'}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="px-3 py-2 text-xs text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] transition-colors">Cancelar</button>
          <button onClick={async () => {
            try {
              const res = await fetch('/api/admin/categories', {
                method: isEditing ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...(isEditing ? { id: category?.id } : {}),
                  name: form.name,
                  handle: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                  description: form.description,
                  parent_category_id: form.parentId || undefined,
                  is_active: false,
                  metadata: { icon: form.icon, metaTitle: form.metaTitle, metaDescription: form.metaDescription },
                }),
              });
              if (!res.ok) throw new Error('Failed');
              toast.success('Borrador guardado');
              onBack();
            } catch { toast.error('Error al guardar'); }
          }} className="px-3 py-2 text-xs text-[var(--admin-text-secondary)] bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface2)] transition-colors">Guardar borrador</button>
          <button onClick={async () => {
            if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return; }
            try {
              const res = await fetch('/api/admin/categories', {
                method: isEditing ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...(isEditing ? { id: category?.id } : {}),
                  name: form.name,
                  handle: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                  description: form.description,
                  parent_category_id: form.parentId || undefined,
                  is_active: true,
                  metadata: { icon: form.icon, metaTitle: form.metaTitle, metaDescription: form.metaDescription },
                }),
              });
              if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed'); }
              toast.success(isEditing ? 'Categor\u00eda actualizada' : 'Categor\u00eda creada');
              onBack();
            } catch (e: any) { toast.error(e.message || 'Error al publicar'); }
          }} className="px-4 py-2 text-xs text-sand-100 bg-wood-900 rounded-lg hover:bg-wood-800 transition-colors">Publicar</button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-48 flex-shrink-0 hidden lg:block">
          <nav className="sticky top-4 space-y-0.5">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => { setActiveSection(s.id); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                  activeSection === s.id ? 'bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]' : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface2)]'
                }`}
              >
                <s.icon size={13} /> {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Form content */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* ===== BASIC INFO ===== */}
          <div id="basic" className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
            <h4 className="text-xs text-[var(--admin-muted)] uppercase tracking-wider">Informacion basica</h4>

            <div>
              <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Nombre de la categoria *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2.5 border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)]/40"
                placeholder="Ej: Tablas para Cortar"
              />
            </div>

            <div>
              <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Categoria padre</label>
              <select
                value={form.parentId}
                onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
                className="w-full px-3 py-2.5 border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] outline-none bg-[var(--admin-surface)] focus:border-[var(--admin-accent)]/40"
              >
                <option value="">— Ninguna (categoria raiz) —</option>
                {allCategories.filter(c => c.parentId === null && c.id !== category?.id).map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
              <p className="text-[10px] text-[var(--admin-muted)] mt-1">Si seleccionas un padre, esta sera una sub-categoria.</p>
            </div>

            <div>
              <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Descripcion</label>
              <div className="border border-[var(--admin-border)] rounded-lg overflow-hidden">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-[var(--admin-surface2)]/50 border-b border-[var(--admin-border)]">
                  {['B', 'I', 'U', 'Link', 'Lista'].map(b => (
                    <button key={b} className="px-2 py-1 text-[10px] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface)] rounded transition-colors">{b}</button>
                  ))}
                </div>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2.5 text-sm text-[var(--admin-text)] outline-none resize-none"
                  placeholder="Descripcion de la categoria (aparece en la pagina de la tienda)"
                />
              </div>
              <p className="text-[10px] text-[var(--admin-muted)] mt-1">Aparece en la pagina de la categoria en la tienda, arriba de los productos.</p>
            </div>

            <div>
              <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Estado</label>
              <div className="space-y-1.5">
                {[
                  { val: 'active', label: 'Activa — Visible en la tienda y menu de navegacion' },
                  { val: 'hidden', label: 'Oculta — Existe pero no aparece en el menu (accesible por URL)' },
                  { val: 'disabled', label: 'Desactivada — No accesible en la tienda' },
                ].map(opt => (
                  <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="catStatus" checked={form.status === opt.val} onChange={() => setForm(f => ({ ...f, status: opt.val as any }))} className="accent-accent-gold" />
                    <span className="text-xs text-[var(--admin-text)]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ===== IMAGE ===== */}
          <div id="image" className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
            <h4 className="text-xs text-[var(--admin-muted)] uppercase tracking-wider">Imagen de portada</h4>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-48 h-24 bg-[var(--admin-surface2)] rounded-xl flex items-center justify-center flex-shrink-0">
                {category?.hasImage ? (
                  <div className="text-center">
                    <ImageIcon size={24} className="text-[var(--admin-accent)] mx-auto mb-1" />
                    <p className="text-[10px] text-[var(--admin-muted)]">1200 x 600 px</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload size={20} className="text-[var(--admin-muted)] mx-auto mb-1" />
                    <p className="text-[10px] text-[var(--admin-muted)]">Sin imagen</p>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-[var(--admin-text-secondary)] mb-2">Esta imagen aparece como:</p>
                <ul className="text-[10px] text-[var(--admin-muted)] space-y-0.5 mb-3">
                  <li>• Banner de la categoria</li>
                  <li>• Card en el homepage</li>
                  <li>• Preview en el menu</li>
                </ul>
                <p className="text-[10px] text-[var(--admin-muted)] mb-2">Recomendado: 1200x600px | JPG, PNG, WebP</p>
                <div className="flex gap-2">
                  <button className="text-[11px] text-[var(--admin-accent)] hover:underline flex items-center gap-1"><Upload size={11} /> Cambiar imagen</button>
                  {category?.hasImage && <button className="text-[11px] text-red-400 hover:underline flex items-center gap-1"><Trash2 size={11} /> Eliminar</button>}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Icono de categoria (para menu y sidebar)</label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map(ico => (
                  <button
                    key={ico}
                    onClick={() => setForm(f => ({ ...f, icon: ico }))}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors ${
                      form.icon === ico ? 'bg-[var(--admin-accent)]/10 border-2 border-[var(--admin-accent)]' : 'bg-[var(--admin-surface2)] border border-[var(--admin-border)] hover:border-[var(--admin-border)]'
                    }`}
                  >
                    {ico}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[var(--admin-muted)] mt-1">Se muestra junto al nombre en la navegacion del sitio.</p>
            </div>
          </div>

          {/* ===== APPEARANCE ===== */}
          <div id="appearance" className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
            <h4 className="text-xs text-[var(--admin-muted)] uppercase tracking-wider">Apariencia en la tienda</h4>

            <div>
              <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Layout de productos en esta categoria</label>
              <div className="space-y-1.5">
                {[
                  { val: 'grid', label: 'Grid (3-4 columnas) — por defecto' },
                  { val: 'list', label: 'Lista (filas con descripcion ampliada)' },
                  { val: 'featured', label: 'Destacado (hero image + grid)' },
                ].map(opt => (
                  <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="layout" checked={form.layout === opt.val} onChange={() => setForm(f => ({ ...f, layout: opt.val as any }))} className="accent-accent-gold" />
                    <span className="text-xs text-[var(--admin-text)]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Productos por pagina</label>
                <select value={form.productsPerPage} onChange={e => setForm(f => ({ ...f, productsPerPage: Number(e.target.value) }))} className="w-full px-3 py-2 border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] outline-none bg-[var(--admin-surface)]">
                  {[8, 12, 16, 24].map(n => <option key={n} value={n}>{n}</option>)}
                  <option value={999}>Todos</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Orden por defecto</label>
                <select value={form.sortDefault} onChange={e => setForm(f => ({ ...f, sortDefault: e.target.value }))} className="w-full px-3 py-2 border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] outline-none bg-[var(--admin-surface)]">
                  <option value="manual">Manual (personalizado)</option>
                  <option value="newest">Mas recientes</option>
                  <option value="price-asc">Precio menor-mayor</option>
                  <option value="price-desc">Precio mayor-menor</option>
                  <option value="bestsellers">Mas vendidos</option>
                  <option value="name-asc">Nombre A-Z</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-[var(--admin-text-secondary)] block mb-2">Filtros visibles</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'wood', label: 'Filtros de madera' },
                  { key: 'price', label: 'Filtros de precio' },
                  { key: 'finish', label: 'Filtros de acabado' },
                  { key: 'size', label: 'Filtros de tamano' },
                ].map(f => (
                  <label key={f.key} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={(form.filters as any)[f.key]} onChange={() => setForm(prev => ({ ...prev, filters: { ...prev.filters, [f.key]: !(prev.filters as any)[f.key] } }))} className="accent-accent-gold rounded" />
                    <span className="text-xs text-[var(--admin-text)]">{f.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Banner */}
            <div>
              <label className="text-xs text-[var(--admin-text-secondary)] block mb-2">Banner promocional (opcional)</label>
              <div className="bg-[var(--admin-surface2)] rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[var(--admin-muted)] block mb-1">Texto</label>
                    <input value={form.bannerText} onChange={e => setForm(f => ({ ...f, bannerText: e.target.value }))} className="w-full px-3 py-2 border border-[var(--admin-border)] rounded-lg text-xs text-[var(--admin-text)] outline-none bg-[var(--admin-surface)]" placeholder="Envio gratis en pedidos de $2,500+" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--admin-muted)] block mb-1">Link</label>
                    <input value={form.bannerLink} onChange={e => setForm(f => ({ ...f, bannerLink: e.target.value }))} className="w-full px-3 py-2 border border-[var(--admin-border)] rounded-lg text-xs text-[var(--admin-text)] outline-none bg-[var(--admin-surface)]" placeholder="/shop?promo=..." />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-[var(--admin-muted)]">Fondo:</label>
                    <input type="color" value={form.bannerBg} onChange={e => setForm(f => ({ ...f, bannerBg: e.target.value }))} className="w-7 h-7 rounded cursor-pointer" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-[var(--admin-muted)]">Texto:</label>
                    <input type="color" value={form.bannerTextColor} onChange={e => setForm(f => ({ ...f, bannerTextColor: e.target.value }))} className="w-7 h-7 rounded cursor-pointer" />
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={form.bannerActive} onChange={e => setForm(f => ({ ...f, bannerActive: e.target.checked }))} className="accent-accent-gold rounded" />
                    <span className="text-xs text-[var(--admin-text)]">Activo</span>
                  </label>
                </div>
                {form.bannerText && form.bannerActive && (
                  <div className="rounded-lg py-2 px-4 text-center text-xs" style={{ backgroundColor: form.bannerBg, color: form.bannerTextColor }}>
                    {form.bannerText}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== SEO ===== */}
          <div id="seo" className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs text-[var(--admin-muted)] uppercase tracking-wider">SEO — Optimizacion para buscadores</h4>
              <button className="flex items-center gap-1 text-[11px] text-[var(--admin-accent)] hover:underline"><Sparkles size={11} /> Generar SEO con IA</button>
            </div>

            {/* Google preview */}
            <div className="bg-[var(--admin-surface2)] rounded-xl p-4 space-y-1">
              <p className="text-[10px] text-[var(--admin-muted)] mb-2">Preview de Google</p>
              <p className="text-sm text-blue-700 truncate">{form.metaTitle || form.name || 'Titulo de la categoria'} | DavidSon's Design</p>
              <p className="text-[11px] text-green-700 truncate">davidsonsdesign.com/shop/{form.slug || 'categoria'}</p>
              <p className="text-[11px] text-[var(--admin-text-secondary)] line-clamp-2">{form.metaDescription || form.description || 'Descripcion de la categoria...'}</p>
            </div>

            <div>
              <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Meta titulo</label>
              <input value={form.metaTitle} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} className="w-full px-3 py-2.5 border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)]/40" placeholder="Titulo para buscadores" />
              <p className="text-[10px] text-[var(--admin-muted)] mt-1">{form.metaTitle.length}/70 caracteres</p>
            </div>

            <div>
              <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Meta descripcion</label>
              <textarea value={form.metaDescription} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} rows={3} className="w-full px-3 py-2.5 border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] outline-none resize-none focus:border-[var(--admin-accent)]/40" placeholder="Descripcion para buscadores" />
              <p className="text-[10px] text-[var(--admin-muted)] mt-1">{form.metaDescription.length}/160 caracteres</p>
            </div>

            <div>
              <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">URL (slug)</label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[var(--admin-muted)]">davidsonsdesign.com/shop/</span>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="flex-1 px-3 py-2 border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)]/40" />
              </div>
              <p className="text-[10px] text-[var(--admin-muted)] mt-1">Se genera automaticamente del nombre. Editable.</p>
              {isEditing && <p className="text-[10px] text-amber-500 mt-0.5">⚠ Cambiar la URL puede afectar el SEO. Se creara un redirect automatico.</p>}
            </div>
          </div>

          {/* ===== PRODUCTS ===== */}
          <div id="products" className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
            <h4 className="text-xs text-[var(--admin-muted)] uppercase tracking-wider">Productos en esta categoria</h4>
            {isEditing && category.products > 0 ? (
              <>
                <p className="text-[11px] text-[var(--admin-text-secondary)]">{category.products} productos en "{category.name}"</p>
                <div className="space-y-1">
                  {legacyDetailProducts.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-[var(--admin-surface2)] rounded-lg hover:bg-[var(--admin-surface2)] transition-colors">
                      <GripVertical size={12} className="text-[var(--admin-muted)] cursor-grab" />
                      <div className="w-8 h-8 rounded-lg bg-[var(--admin-surface2)] flex items-center justify-center flex-shrink-0">
                        <ShoppingBag size={12} className="text-[var(--admin-muted)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[var(--admin-text)] truncate">{p.name}</p>
                      </div>
                      <span className="text-xs text-[var(--admin-text)]">${p.price.toLocaleString()}</span>
                      <span className={`text-[10px] ${p.stock <= 3 ? 'text-amber-500' : 'text-[var(--admin-muted)]'}`}>Stock: {p.stock} {p.stock <= 3 && '⚠'}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--admin-muted)]">Arrastra para reordenar los productos dentro de la categoria.</p>
                <div className="flex gap-3">
                  <button className="text-[11px] text-[var(--admin-accent)] hover:underline flex items-center gap-1"><Plus size={11} /> Agregar producto</button>
                  <button className="text-[11px] text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)] flex items-center gap-1"><ShoppingBag size={11} /> Ver todos en Productos</button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <ShoppingBag size={24} className="mx-auto text-[var(--admin-muted)] mb-2" />
                <p className="text-xs text-[var(--admin-muted)]">Sin productos asignados</p>
                <button className="mt-3 text-[11px] text-[var(--admin-accent)] hover:underline flex items-center gap-1 mx-auto"><Plus size={11} /> Agregar producto</button>
              </div>
            )}
          </div>

          {/* ===== STATS ===== */}
          {isEditing && (
            <div id="stats" className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs text-[var(--admin-muted)] uppercase tracking-wider">Estadisticas</h4>
                <select className="text-[11px] text-[var(--admin-text-secondary)] border border-[var(--admin-border)] rounded-lg px-2 py-1 bg-[var(--admin-surface)] outline-none">
                  <option>30 dias</option>
                  <option>7 dias</option>
                  <option>90 dias</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[var(--admin-surface2)] rounded-xl p-3 text-center">
                  <p className="text-lg text-[var(--admin-text)]">${category.salesMonth.toLocaleString()}</p>
                  <p className="text-[10px] text-[var(--admin-text-secondary)]">Ventas del periodo</p>
                  <p className="text-[10px] text-green-600">+15% vs prev</p>
                </div>
                <div className="bg-[var(--admin-surface2)] rounded-xl p-3 text-center">
                  <p className="text-lg text-[var(--admin-text)]">52</p>
                  <p className="text-[10px] text-[var(--admin-text-secondary)]">Unidades vendidas</p>
                  <p className="text-[10px] text-green-600">+8% vs prev</p>
                </div>
                <div className="bg-[var(--admin-surface2)] rounded-xl p-3 text-center">
                  <p className="text-lg text-[var(--admin-text)]">3,400</p>
                  <p className="text-[10px] text-[var(--admin-text-secondary)]">Visitas a categoria</p>
                  <p className="text-[10px] text-green-600">+22% vs prev</p>
                </div>
              </div>

              <div className="text-[11px] text-[var(--admin-text-secondary)] space-y-1">
                <p>Tasa de conversion: <span className="text-[var(--admin-text)]">1.5%</span> (visitas → compra)</p>
                <p>Ticket promedio: <span className="text-[var(--admin-text)]">$927 MXN</span></p>
                <p>Producto mas vendido: <span className="text-[var(--admin-text)]">Tabla Parota Med (28 uds)</span></p>
              </div>

              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={legacySalesChart}>
                    <defs>
                      <linearGradient id="catAreaGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--admin-accent)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--admin-accent)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" hide />
                    <RTooltip
                      contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #e5e0d8' }}
                      formatter={(v: any) => [`$${v.toLocaleString()}`, 'Ventas']}
                    />
                    <Area type="monotone" dataKey="ventas" stroke="var(--admin-accent)" fill="url(#catAreaGold)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ===== ADVANCED CONFIG ===== */}
          <div id="advanced" className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
            <h4 className="text-xs text-[var(--admin-muted)] uppercase tracking-wider">Configuracion avanzada</h4>

            <div>
              <label className="text-xs text-[var(--admin-text-secondary)] block mb-2">Navegacion</label>
              <div className="space-y-1.5">
                {[
                  { key: 'showInMenu', label: 'Mostrar en menu principal de la tienda' },
                  { key: 'showInFooter', label: 'Mostrar en footer de la tienda' },
                  { key: 'showInSidebar', label: 'Mostrar en sidebar de filtros' },
                  { key: 'showInHomepage', label: 'Mostrar en homepage como categoria destacada' },
                ].map(opt => (
                  <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={(form as any)[opt.key]} onChange={() => setForm(f => ({ ...f, [opt.key]: !(f as any)[opt.key] }))} className="accent-accent-gold rounded" />
                    <span className="text-xs text-[var(--admin-text)]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-[var(--admin-text-secondary)] block mb-2">Permisos (para SaaS multi-usuario)</label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="perms" defaultChecked className="accent-accent-gold" />
                  <span className="text-xs text-[var(--admin-text)]">Todos los admins pueden editar</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="perms" className="accent-accent-gold" />
                  <span className="text-xs text-[var(--admin-text)]">Solo el owner puede editar</span>
                </label>
              </div>
            </div>

            {isEditing && (
              <div className="text-[10px] text-[var(--admin-muted)] space-y-0.5">
                <p>Handle interno: <span className="font-mono text-[var(--admin-text-secondary)]">{category.slug}</span></p>
                <p>Creada: {category.createdAt}</p>
                <p>Ultima edicion: {category.updatedAt}</p>
              </div>
            )}

            {/* Danger zone */}
            {isEditing && (
              <div className="border border-red-100 rounded-xl p-4 mt-4">
                <h5 className="text-xs text-red-500 mb-2 flex items-center gap-1"><AlertTriangle size={12} /> Zona de peligro</h5>
                <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <Trash2 size={12} /> Eliminar categoria
                </button>
                <p className="text-[10px] text-[var(--admin-muted)] mt-2">
                  Si esta categoria tiene productos, deberas reasignarlos a otra categoria antes de eliminar. Sub-categorias se moveran a nivel raiz.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   COLLECTION FORM
   ================================================================ */

interface CollectionFormProps {
  collection: Collection | null;
  onBack: () => void;
}

const CollectionForm: React.FC<CollectionFormProps> = ({ collection, onBack }) => {
  const isEditing = !!collection;
  const [form, setForm] = useState({
    name: collection?.name || '',
    slug: collection?.slug || '',
    description: collection?.description || '',
    type: collection?.type || 'manual' as 'manual' | 'automatic',
    startDate: collection?.startDate || '',
    endDate: collection?.endDate || '',
    noEndDate: !collection?.endDate,
    sortBy: collection?.sortBy || 'manual',
    limit: collection?.limit || 10,
    showOnPage: collection?.showOnPage ?? true,
    showOnHomepage: collection?.showOnHomepage ?? false,
    showInMenu: collection?.showInMenu ?? false,
    metaTitle: '',
    metaDescription: '',
  });

  const [rules, setRules] = useState(collection?.rules || [{ field: 'categoria', op: 'es_igual', value: '' }]);

  const ruleFields = ['Categoria', 'Precio', 'Stock', 'Tag', 'Tipo de madera', 'Fecha creacion', 'Ventas'];
  const ruleOps: Record<string, string[]> = {
    Categoria: ['es igual a', 'no es igual a'],
    Precio: ['mayor que', 'menor que', 'entre'],
    Stock: ['mayor que', 'menor que', 'igual a 0'],
    Tag: ['contiene', 'no contiene'],
    'Tipo de madera': ['es igual a', 'no es igual a'],
    'Fecha creacion': ['ultimos N dias'],
    Ventas: ['mas de N en ultimo mes'],
  };

  const legacyCollectionProducts = [
    { name: 'Tabla Parota Charcuteria', price: 850 },
    { name: 'Tabla Rosa Morada Gourmet', price: 1650 },
    { name: 'Set 3 Tablas Artesanales', price: 2990 },
    { name: 'Tabla Cedro Rojo Rustica', price: 1200 },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-[var(--admin-surface2)] rounded-lg text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider">Colecciones</p>
            <h3 className="font-serif text-[var(--admin-text)]">{isEditing ? `Editar: ${collection.name}` : 'Nueva Coleccion'}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="px-3 py-2 text-xs text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]">Cancelar</button>
          <button className="px-3 py-2 text-xs text-[var(--admin-text-secondary)] bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface2)]">Guardar borrador</button>
          <button className="px-4 py-2 text-xs text-sand-100 bg-wood-900 rounded-lg hover:bg-wood-800">Publicar</button>
        </div>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Basic */}
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
          <h4 className="text-xs text-[var(--admin-muted)] uppercase tracking-wider">Informacion basica</h4>

          <div>
            <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Nombre *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)]/40" placeholder="Ej: Regalos para Mama" />
          </div>

          <div>
            <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Descripcion</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] outline-none resize-none focus:border-[var(--admin-accent)]/40" placeholder="Descripcion de la coleccion" />
          </div>

          <div>
            <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Imagen de portada</label>
            <div className="border-2 border-dashed border-[var(--admin-border)] rounded-xl p-6 text-center hover:border-[var(--admin-accent)]/40 cursor-pointer transition-colors">
              <Upload size={20} className="mx-auto text-[var(--admin-muted)] mb-1" />
              <p className="text-[11px] text-[var(--admin-text-secondary)]">Subir imagen</p>
              <p className="text-[10px] text-[var(--admin-muted)]">Recomendado: 1200x600px</p>
            </div>
          </div>
        </div>

        {/* Type */}
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
          <h4 className="text-xs text-[var(--admin-muted)] uppercase tracking-wider">Tipo de coleccion</h4>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="colType" checked={form.type === 'manual'} onChange={() => setForm(f => ({ ...f, type: 'manual' }))} className="accent-accent-gold" />
              <span className="text-xs text-[var(--admin-text)]">Manual — Tu seleccionas los productos</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="colType" checked={form.type === 'automatic'} onChange={() => setForm(f => ({ ...f, type: 'automatic' }))} className="accent-accent-gold" />
              <span className="text-xs text-[var(--admin-text)]">Automatica — Se llena segun reglas</span>
            </label>
          </div>

          {/* Manual products */}
          {form.type === 'manual' && (
            <div className="space-y-3 mt-3">
              <label className="text-xs text-[var(--admin-text-secondary)] block">Productos en esta coleccion:</label>
              <div className="flex items-center bg-[var(--admin-surface2)] border border-[var(--admin-border)] rounded-lg overflow-hidden">
                <Search size={14} className="ml-3 text-[var(--admin-muted)]" />
                <input placeholder="Buscar producto para agregar..." className="flex-1 px-3 py-2 text-xs bg-transparent outline-none text-[var(--admin-text)] placeholder:text-[var(--admin-muted)]" />
              </div>
              <div className="space-y-1">
                {legacyCollectionProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-[var(--admin-surface2)] rounded-lg">
                    <GripVertical size={12} className="text-[var(--admin-muted)] cursor-grab" />
                    <div className="w-8 h-8 rounded-lg bg-[var(--admin-surface2)] flex items-center justify-center flex-shrink-0">
                      <ShoppingBag size={12} className="text-[var(--admin-muted)]" />
                    </div>
                    <p className="flex-1 text-xs text-[var(--admin-text)] truncate">{p.name}</p>
                    <span className="text-xs text-[var(--admin-text-secondary)]">${p.price.toLocaleString()}</span>
                    <button className="p-1 text-[var(--admin-muted)] hover:text-red-500"><X size={12} /></button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[var(--admin-muted)]">Arrastra para ordenar</p>
            </div>
          )}

          {/* Automatic rules */}
          {form.type === 'automatic' && (
            <div className="space-y-3 mt-3">
              <label className="text-xs text-[var(--admin-text-secondary)] block">Reglas (todas deben cumplirse):</label>
              <div className="space-y-2">
                {rules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select value={rule.field} onChange={e => { const nr = [...rules]; nr[i] = { ...nr[i], field: e.target.value }; setRules(nr); }} className="px-2 py-2 border border-[var(--admin-border)] rounded-lg text-xs text-[var(--admin-text)] bg-[var(--admin-surface)] outline-none">
                      {ruleFields.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <select className="px-2 py-2 border border-[var(--admin-border)] rounded-lg text-xs text-[var(--admin-text)] bg-[var(--admin-surface)] outline-none">
                      {(ruleOps[rule.field] || ruleOps['Categoria']).map(op => <option key={op} value={op}>{op}</option>)}
                    </select>
                    <input value={rule.value} onChange={e => { const nr = [...rules]; nr[i] = { ...nr[i], value: e.target.value }; setRules(nr); }} className="flex-1 px-2 py-2 border border-[var(--admin-border)] rounded-lg text-xs text-[var(--admin-text)] outline-none" placeholder="Valor" />
                    <button onClick={() => setRules(rules.filter((_, idx) => idx !== i))} className="p-1 text-[var(--admin-muted)] hover:text-red-500"><X size={14} /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => setRules([...rules, { field: 'Categoria', op: 'es_igual', value: '' }])} className="text-[11px] text-[var(--admin-accent)] hover:underline flex items-center gap-1">
                <Plus size={11} /> Agregar regla
              </button>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="text-[10px] text-[var(--admin-muted)] block mb-1">Ordenar por</label>
                  <select value={form.sortBy} onChange={e => setForm(f => ({ ...f, sortBy: e.target.value }))} className="w-full px-2 py-2 border border-[var(--admin-border)] rounded-lg text-xs text-[var(--admin-text)] bg-[var(--admin-surface)] outline-none">
                    <option value="bestsellers">Mas vendidos</option>
                    <option value="newest">Mas recientes</option>
                    <option value="price-asc">Precio menor-mayor</option>
                    <option value="price-desc">Precio mayor-menor</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[var(--admin-muted)] block mb-1">Limite</label>
                  <input type="number" value={form.limit} onChange={e => setForm(f => ({ ...f, limit: Number(e.target.value) }))} className="w-full px-2 py-2 border border-[var(--admin-border)] rounded-lg text-xs text-[var(--admin-text)] outline-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scheduling */}
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
          <h4 className="text-xs text-[var(--admin-muted)] uppercase tracking-wider flex items-center gap-1.5"><Calendar size={12} /> Programacion</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Fecha de inicio</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full px-3 py-2 border border-[var(--admin-border)] rounded-lg text-xs text-[var(--admin-text)] outline-none bg-[var(--admin-surface)]" />
            </div>
            <div>
              <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Fecha de fin</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} disabled={form.noEndDate} className="w-full px-3 py-2 border border-[var(--admin-border)] rounded-lg text-xs text-[var(--admin-text)] outline-none bg-[var(--admin-surface)] disabled:opacity-40" />
              <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
                <input type="checkbox" checked={form.noEndDate} onChange={e => setForm(f => ({ ...f, noEndDate: e.target.checked }))} className="accent-accent-gold rounded" />
                <span className="text-[10px] text-[var(--admin-text-secondary)]">Sin fecha de fin</span>
              </label>
            </div>
          </div>
          <p className="text-[10px] text-[var(--admin-muted)] flex items-center gap-1">
            <Clock size={10} /> La coleccion se activara y desactivara automaticamente segun las fechas. Ideal para promociones de temporada.
          </p>
        </div>

        {/* SEO */}
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
          <h4 className="text-xs text-[var(--admin-muted)] uppercase tracking-wider">SEO</h4>
          <div className="bg-[var(--admin-surface2)] rounded-xl p-4 space-y-1">
            <p className="text-sm text-blue-700 truncate">{form.metaTitle || form.name || 'Titulo'} | DavidSon's Design</p>
            <p className="text-[11px] text-green-700 truncate">davidsonsdesign.com/shop/coleccion/{form.slug || 'slug'}</p>
            <p className="text-[11px] text-[var(--admin-text-secondary)] line-clamp-2">{form.metaDescription || form.description || 'Descripcion...'}</p>
          </div>
          <div>
            <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Meta titulo</label>
            <input value={form.metaTitle} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} className="w-full px-3 py-2.5 border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] outline-none" />
          </div>
          <div>
            <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">Meta descripcion</label>
            <textarea value={form.metaDescription} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} rows={2} className="w-full px-3 py-2.5 border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] outline-none resize-none" />
          </div>
          <div>
            <label className="text-xs text-[var(--admin-text-secondary)] block mb-1.5">URL (slug)</label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[var(--admin-muted)]">davidsonsdesign.com/shop/coleccion/</span>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="flex-1 px-3 py-2 border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] outline-none" />
            </div>
          </div>
        </div>

        {/* Display options */}
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6 space-y-4">
          <h4 className="text-xs text-[var(--admin-muted)] uppercase tracking-wider">Donde mostrar</h4>
          <div className="space-y-1.5">
            {[
              { key: 'showOnPage', label: `Pagina propia en la tienda (/shop/coleccion/${form.slug || 'slug'})` },
              { key: 'showOnHomepage', label: 'Banner en homepage' },
              { key: 'showInMenu', label: 'Menu de navegacion principal' },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={(form as any)[opt.key]} onChange={() => setForm(f => ({ ...f, [opt.key]: !(f as any)[opt.key] }))} className="accent-accent-gold rounded" />
                <span className="text-xs text-[var(--admin-text)]">{opt.label}</span>
              </label>
            ))}
            <label className="flex items-center gap-2 cursor-not-allowed opacity-50">
              <input type="checkbox" disabled className="accent-accent-gold rounded" />
              <span className="text-xs text-[var(--admin-text-secondary)]">Email marketing (proximamente)</span>
            </label>
          </div>
        </div>

        {/* Danger zone */}
        {isEditing && (
          <div className="border border-red-100 rounded-xl p-4">
            <h5 className="text-xs text-red-500 mb-2 flex items-center gap-1"><AlertTriangle size={12} /> Zona de peligro</h5>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              <Trash2 size={12} /> Eliminar coleccion
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
