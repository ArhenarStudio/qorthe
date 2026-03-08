"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Menu, Home, PenLine, MessageSquare, Image, Type, Search,
  Plus, Save, Eye, EyeOff, Trash2, Copy, ExternalLink, GripVertical, ChevronRight, ArrowLeft,
  ChevronDown, Edit3, MoreHorizontal, Upload, Download, FolderOpen,
  Globe, Settings2, Clock, Tag, X, Check, AlertTriangle,
  Bold, Italic, Underline, Heading1, Heading2, Heading3, Link2,
  ImageIcon, Video, Quote, List, Table, Minus, MousePointer,
  BarChart3, Star, Layout, Smartphone, Monitor
} from 'lucide-react';
import { toast } from 'sonner';

// ===== TYPES =====
type CmsTab = 'pages' | 'menus' | 'homepage' | 'blog' | 'popups' | 'media' | 'texts' | 'seo';

const tabItems: Array<{ id: CmsTab; label: string; icon: React.ElementType }> = [
  { id: 'pages', label: 'Paginas', icon: FileText },
  { id: 'menus', label: 'Menus', icon: Menu },
  { id: 'homepage', label: 'Homepage', icon: Home },
  { id: 'blog', label: 'Blog', icon: PenLine },
  { id: 'popups', label: 'Pop-ups', icon: MessageSquare },
  { id: 'media', label: 'Media', icon: Image },
  { id: 'texts', label: 'Textos', icon: Type },
  { id: 'seo', label: 'SEO Global', icon: Search },
];

// ===== SHARED =====
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={'bg-white rounded-xl border border-wood-100 shadow-sm ' + className}>{children}</div>;
}

function STitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-medium text-wood-900 uppercase tracking-wider border-b border-wood-100 pb-2 mb-4">{children}</h4>;
}

function Badge({ text, variant = 'green' }: { text: string; variant?: 'green' | 'gray' | 'amber' | 'blue' }) {
  const cls: Record<string, string> = {
    green: 'bg-green-50 text-green-600',
    gray: 'bg-wood-50 text-wood-500',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
  };
  return <span className={'text-[10px] font-medium px-2 py-0.5 rounded-full ' + cls[variant]}>{text}</span>;
}

// ===== LEGACY DATA (unused — tabs replaced with ComingSoonTab, cleanup pending) =====
const mockPages = [
  { id: 'p1', title: 'Sobre Nosotros', url: '/about', lastEdit: '15 Feb 2026', status: 'published' as const, template: 'Completa' },
  { id: 'p2', title: 'Preguntas Frecuentes', url: '/faq', lastEdit: '10 Feb 2026', status: 'published' as const, template: 'Con sidebar' },
  { id: 'p3', title: 'Contacto', url: '/contact', lastEdit: '20 Ene 2026', status: 'published' as const, template: 'Completa' },
  { id: 'p4', title: 'Politica de Envio', url: '/shipping-policy', lastEdit: '25 Feb 2026', status: 'published' as const, template: 'Completa' },
  { id: 'p5', title: 'Politica de Devolucion', url: '/return-policy', lastEdit: '25 Feb 2026', status: 'published' as const, template: 'Completa' },
  { id: 'p6', title: 'Terminos y Condiciones', url: '/terms', lastEdit: '01 Ene 2026', status: 'published' as const, template: 'Completa' },
  { id: 'p7', title: 'Aviso de Privacidad', url: '/privacy', lastEdit: '01 Ene 2026', status: 'published' as const, template: 'Completa' },
  { id: 'p8', title: 'Cuidado de la Madera', url: '/wood-care', lastEdit: '28 Feb 2026', status: 'published' as const, template: 'Con sidebar' },
  { id: 'p9', title: 'Nuestro Proceso', url: '/our-process', lastEdit: '', status: 'draft' as const, template: 'Landing' },
  { id: 'p10', title: 'Programa de Lealtad', url: '/loyalty', lastEdit: '26 Feb 2026', status: 'published' as const, template: 'Completa' },
];

const mockMenus = {
  header: [
    { id: 'm1', label: 'Inicio', url: '/', children: [] },
    { id: 'm2', label: 'Tienda', url: '/shop', children: [
      { id: 'm2a', label: 'Tablas para Cortar', url: '/shop/tablas' },
      { id: 'm2b', label: 'Sets y Colecciones', url: '/shop/sets' },
      { id: 'm2c', label: 'Accesorios', url: '/shop/accesorios' },
    ]},
    { id: 'm3', label: 'Cotizador', url: '/quote', children: [] },
    { id: 'm4', label: 'Sobre Nosotros', url: '/about', children: [] },
    { id: 'm5', label: 'Contacto', url: '/contact', children: [] },
  ],
  footerShop: [
    { id: 'f1', label: 'Todos los productos', url: '/shop' },
    { id: 'f2', label: 'Best Sellers', url: '/shop/collection/best-sellers' },
    { id: 'f3', label: 'Novedades', url: '/shop/collection/new' },
    { id: 'f4', label: 'Grabado Laser', url: '/shop?grabado=true' },
  ],
  footerInfo: [
    { id: 'fi1', label: 'Sobre Nosotros', url: '/about' },
    { id: 'fi2', label: 'Cuidado de la Madera', url: '/wood-care' },
    { id: 'fi3', label: 'Preguntas Frecuentes', url: '/faq' },
    { id: 'fi4', label: 'Programa de Lealtad', url: '/loyalty' },
  ],
  footerLegal: [
    { id: 'fl1', label: 'Politica de Envio', url: '/shipping-policy' },
    { id: 'fl2', label: 'Devoluciones', url: '/return-policy' },
    { id: 'fl3', label: 'Terminos y Condiciones', url: '/terms' },
    { id: 'fl4', label: 'Aviso de Privacidad', url: '/privacy' },
  ],
};

const mockHomeSections = [
  { id: 'h1', name: 'Hero Banner (carrusel)', active: true, note: 'Se configura en Marketing > Banners' },
  { id: 'h2', name: 'Categorias Destacadas', active: true, config: { type: 'Grid de 3 columnas', categories: ['Tablas para Cortar', 'Sets', 'Accesorios'], title: 'Explora Nuestra Coleccion', subtitle: 'Piezas unicas en madera mexicana' } },
  { id: 'h3', name: 'Productos Destacados', active: true, config: { source: 'Best Sellers', count: 4, title: 'Los Mas Populares', view: 'Carrusel' } },
  { id: 'h4', name: 'Banner Intermedio', active: true, config: { title: 'Personaliza con Grabado Laser', subtitle: 'Haz cada pieza unica con nuestro servicio de grabado', cta: 'Cotizar ahora', link: '/quote' } },
  { id: 'h5', name: 'Testimonios / Reviews', active: true, config: { source: 'Reviews destacadas', count: 3, layout: 'Carrusel', title: 'Lo Que Dicen Nuestros Clientes' } },
  { id: 'h6', name: 'Proceso Artesanal (storytelling)', active: true, config: { type: 'Timeline horizontal', steps: ['Seleccion de Madera', 'Diseno y Corte', 'Acabado y Grabado', 'Empaque y Envio'] } },
  { id: 'h7', name: 'Instagram Feed', active: false, note: 'Conectar cuenta o subir manualmente' },
  { id: 'h8', name: 'Newsletter Signup', active: true, config: { title: 'Se el primero en enterarte', text: 'Nuevos productos, ofertas exclusivas y tips de cuidado', incentive: 'Y recibe 10% de descuento en tu primera compra' } },
];

const mockBlogPosts = [
  { id: 'b1', title: 'Como elegir tu tabla ideal', category: 'Guias', author: 'David', date: '25 Feb 2026', status: 'published' as const, tags: ['parota', 'guia'] },
  { id: 'b2', title: '5 maderas mexicanas premium', category: 'Maderas', author: 'David', date: '18 Feb 2026', status: 'published' as const, tags: ['maderas', 'premium'] },
  { id: 'b3', title: 'Cuidado de tablas de parota', category: 'Cuidado', author: 'David', date: '10 Feb 2026', status: 'published' as const, tags: ['parota', 'cuidado'] },
  { id: 'b4', title: 'Regalos artesanales empresa', category: 'Corporate', author: 'David', date: '', status: 'draft' as const, tags: ['corporativo', 'regalos'] },
  { id: 'b5', title: 'Recetas para tu charcuteria', category: 'Lifestyle', author: 'David', date: '', status: 'draft' as const, tags: ['recetas', 'charcuteria'] },
];

const blogCategories = ['Guias', 'Maderas', 'Cuidado', 'Corporate', 'Lifestyle'];

const mockPopups = [
  { id: 'pp1', name: 'Bienvenida + 10% desc', trigger: 'Primera visita', views: 2400, conv: 8.2, status: 'active' as const },
  { id: 'pp2', name: 'Suscripcion newsletter', trigger: 'Scroll 50%', views: 1800, conv: 5.4, status: 'active' as const },
  { id: 'pp3', name: 'Cupon exit intent', trigger: 'Intento de salir', views: 890, conv: 3.8, status: 'paused' as const },
  { id: 'pp4', name: 'Aviso envio gratis', trigger: 'Carrito >$2,000', views: 420, conv: 12.0, status: 'active' as const },
  { id: 'pp5', name: 'Anuncio Dia de las Madres', trigger: 'Todas las paginas', views: 0, conv: 0, status: 'scheduled' as const },
];

const mockMedia = [
  { id: 'md1', name: 'hero-spring.jpg', type: 'image', size: '2.4 MB', dims: '1440x500', folder: 'Banners', date: '25 Feb 2026' },
  { id: 'md2', name: 'parota-detail.jpg', type: 'image', size: '1.1 MB', dims: '1200x800', folder: 'Productos', date: '20 Feb 2026' },
  { id: 'md3', name: 'logo-dsd.svg', type: 'image', size: '24 KB', dims: 'Vector', folder: 'Branding', date: '01 Dic 2025' },
  { id: 'md4', name: 'taller-01.jpg', type: 'image', size: '3.2 MB', dims: '1920x1080', folder: 'Paginas', date: '15 Feb 2026' },
  { id: 'md5', name: 'catalogo.pdf', type: 'document', size: '5.1 MB', dims: '12 pgs', folder: 'Documentos', date: '10 Ene 2026' },
  { id: 'md6', name: 'banner-flash.jpg', type: 'image', size: '1.8 MB', dims: '1440x500', folder: 'Banners', date: '28 Feb 2026' },
  { id: 'md7', name: 'rosa-morada-hero.jpg', type: 'image', size: '2.1 MB', dims: '1600x900', folder: 'Productos', date: '22 Feb 2026' },
  { id: 'md8', name: 'video-proceso.mp4', type: 'video', size: '48 MB', dims: '1920x1080', folder: 'Paginas', date: '05 Feb 2026' },
];

const mockTexts = [
  { section: 'Header', key: 'header.cart_empty', value: 'Tu carrito esta vacio' },
  { section: 'Header', key: 'header.cart_items', value: '{count} articulos' },
  { section: 'Producto', key: 'product.add_to_cart', value: 'Agregar al carrito' },
  { section: 'Producto', key: 'product.out_of_stock', value: 'Agotado' },
  { section: 'Producto', key: 'product.engraving_add', value: 'Agregar grabado laser' },
  { section: 'Checkout', key: 'checkout.shipping_title', value: 'Informacion de envio' },
  { section: 'Checkout', key: 'checkout.promo_placeholder', value: 'Codigo de descuento' },
  { section: 'Checkout', key: 'checkout.free_shipping', value: 'Envio gratis!' },
  { section: 'Footer', key: 'footer.copyright', value: '2026 DavidSon\'s Design' },
  { section: 'Lealtad', key: 'loyalty.points_label', value: 'Puntos disponibles' },
  { section: 'Lealtad', key: 'loyalty.tier_next', value: 'Faltan {amount} para {tier}' },
  { section: 'Reviews', key: 'reviews.write_button', value: 'Escribir una opinion' },
  { section: 'Reviews', key: 'reviews.helpful_button', value: 'Fue util?' },
  { section: '404', key: 'error.not_found', value: 'Pagina no encontrada' },
  { section: 'General', key: 'general.loading', value: 'Cargando...' },
];

const mockRedirects = [
  { from: '/old-about', to: '/about', type: '301' },
  { from: '/productos', to: '/shop', type: '301' },
];

// ===== TAB 1: PAGES =====
function PagesTabLive() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [sectionModal, setSectionModal] = useState<{ idx: number; isNew: boolean } | null>(null);
  const [sectionForm, setSectionForm] = useState({ id: '', label: '', content: '' });
  const [deleteModal, setDeleteModal] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const TEMPLATES = [
    { id: 'legal_sidebar', label: 'Legal (sidebar)', icon: '§' },
    { id: 'simple', label: 'Simple', icon: '¶' },
    { id: 'homepage', label: 'Homepage', icon: '⌂' },
    { id: 'catalog', label: 'Catálogo', icon: '▦' },
    { id: 'system', label: 'Sistema', icon: '⚙' },
  ];

  const fetchPages = () => {
    fetch('/api/admin/cms?type=pages').then(r => r.ok ? r.json() : null).then(d => { if (d?.pages) setPages(d.pages); }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchPages(); }, []);

  const handleSavePage = async () => {
    if (!editingPage) return;
    const res = await fetch('/api/admin/cms', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'page', id: editingPage.id, title: editingPage.title, slug: editingPage.slug, template: editingPage.template, last_updated: editingPage.last_updated, status: editingPage.status, sections: editingPage.sections, seo_title: editingPage.seo_title, seo_description: editingPage.seo_description }) });
    if (res.ok) { toast.success('Página guardada'); fetchPages(); setEditingPage(null); }
    else toast.error('Error al guardar');
  };

  const openSectionEditor = (idx: number, isNew: boolean) => {
    if (isNew) {
      setSectionForm({ id: '', label: '', content: '' });
    } else {
      const sec = editingPage?.sections?.[idx];
      if (sec) setSectionForm({ id: sec.id || '', label: sec.label || '', content: sec.content || '' });
    }
    setSectionModal({ idx, isNew });
  };

  const saveSectionModal = () => {
    if (!editingPage || !sectionModal) return;
    const sections = [...(editingPage.sections || [])];
    const entry = { id: sectionForm.id || sectionForm.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), label: sectionForm.label, content: sectionForm.content };
    if (sectionModal.isNew) sections.push(entry);
    else sections[sectionModal.idx] = entry;
    setEditingPage({ ...editingPage, sections });
    setSectionModal(null);
  };

  const confirmDeleteSection = () => {
    if (deleteModal === null || !editingPage) return;
    const sections = [...(editingPage.sections || [])].filter((_, i) => i !== deleteModal);
    setEditingPage({ ...editingPage, sections });
    setDeleteModal(null);
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    if (!editingPage) return;
    const s = [...(editingPage.sections || [])];
    const target = idx + dir;
    if (target < 0 || target >= s.length) return;
    [s[idx], s[target]] = [s[target], s[idx]];
    setEditingPage({ ...editingPage, sections: s });
  };

  // Helper: render content with basic formatting (paragraphs, lists)
  const renderContent = (text: string) => {
    if (!text) return null;
    return text.split('\n\n').map((block, bi) => {
      const trimmed = block.trim();
      if (!trimmed) return null;
      // Check if block is a list
      const listLines = trimmed.split('\n').filter(l => l.trim().startsWith('- '));
      if (listLines.length > 0 && listLines.length === trimmed.split('\n').filter(l => l.trim()).length) {
        return <ul key={bi} className="list-disc pl-5 space-y-1 mb-4">{listLines.map((l, li) => <li key={li} className="text-wood-700 dark:text-sand-100/80 font-light">{l.trim().substring(2)}</li>)}</ul>;
      }
      return <p key={bi} className="text-wood-700 dark:text-sand-100/80 font-light leading-relaxed mb-4">{trimmed}</p>;
    });
  };

  // ═══ PREVIEW MODE (real page visualization) ═══
  if (editingPage && previewMode) {
    const isLegal = editingPage.template === 'legal_sidebar';
    const sections = editingPage.sections || [];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-wood-900 text-white p-3 rounded-xl">
          <div className="flex items-center gap-3">
            <button onClick={() => setPreviewMode(false)} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs hover:bg-white/20 flex items-center gap-1"><ArrowLeft size={12} /> Volver al editor</button>
            <span className="text-xs opacity-60">Vista previa: {editingPage.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <a href={editingPage.slug} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white/10 rounded-lg text-xs hover:bg-white/20 flex items-center gap-1"><ExternalLink size={12} /> Abrir en sitio</a>
          </div>
        </div>
        {/* Real page preview */}
        <div className="border border-wood-200 rounded-2xl overflow-hidden bg-sand-50">
          {isLegal ? (
            <div className="p-8">
              <div className="grid grid-cols-12 gap-8 max-w-5xl mx-auto">
                {/* Sidebar preview */}
                <div className="col-span-4">
                  <h2 className="font-serif text-2xl text-wood-900 mb-3">{editingPage.title}</h2>
                  <div className="h-0.5 w-16 bg-wood-900/10 mb-3" />
                  <p className="text-[10px] text-wood-400 font-mono uppercase mb-6">Última actualización: {editingPage.last_updated}</p>
                  <nav className="space-y-1 border-l border-wood-200 pl-4">
                    <span className="text-[9px] uppercase tracking-widest text-wood-400 mb-2 block">Contenido</span>
                    {sections.map((sec: any, i: number) => (
                      <a key={i} className="block py-1 text-xs text-wood-500 hover:text-wood-900 border-l-2 border-transparent -ml-[17px] pl-4 transition-colors">{sec.label}</a>
                    ))}
                  </nav>
                </div>
                {/* Content preview */}
                <div className="col-span-8">
                  <div className="space-y-12">
                    {sections.map((sec: any, i: number) => (
                      <section key={i}>
                        <h3 className="font-serif text-xl text-wood-900 mb-4">{sec.label}</h3>
                        {renderContent(sec.content)}
                      </section>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <h2 className="font-serif text-3xl text-wood-900 mb-4">{editingPage.title}</h2>
              <p className="text-wood-400 text-sm">Vista previa no disponible para esta plantilla</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══ EDIT MODE (modal-based editor) ═══
  if (editingPage) {
    const isLegal = editingPage.template === 'legal_sidebar';
    const sections = editingPage.sections || [];

    return (
      <div className="space-y-5">
        {/* Section Editor Modal */}
        {sectionModal && (
          <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" onClick={() => setSectionModal(null)} />
            <div className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-[201]">
              <div className="sticky top-0 bg-white border-b border-wood-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                <div>
                  <h4 className="font-serif text-lg text-wood-900">{sectionModal.isNew ? 'Nueva Sección' : 'Editar Sección'}</h4>
                  <p className="text-[10px] text-wood-400 mt-0.5">Paso 1 de 1 — Editar contenido de la sección</p>
                </div>
                <button onClick={() => setSectionModal(null)} className="p-1.5 hover:bg-wood-100 rounded-lg"><X size={16} /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-wood-500 mb-1.5 block">Título en sidebar</label>
                    <input value={sectionForm.label} onChange={e => setSectionForm(f => ({ ...f, label: e.target.value, ...(sectionModal.isNew ? { id: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') } : {}) }))} className="w-full px-3 py-2.5 border border-wood-200 rounded-xl text-sm focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold outline-none" placeholder="Ej: 1. Objeto" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-wood-500 mb-1.5 block">ID (anchor link)</label>
                    <input value={sectionForm.id} onChange={e => setSectionForm(f => ({ ...f, id: e.target.value }))} className="w-full px-3 py-2.5 border border-wood-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold outline-none" placeholder="objeto" />
                    <p className="text-[9px] text-wood-400 mt-1">Se usa para navegar: #objeto</p>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-wood-500 mb-1.5 block">Contenido</label>
                  <textarea value={sectionForm.content} onChange={e => setSectionForm(f => ({ ...f, content: e.target.value }))} rows={12} className="w-full px-4 py-3 border border-wood-200 rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold outline-none resize-y" placeholder="Escribe el contenido de esta sección.&#10;&#10;Usa una línea vacía para separar párrafos.&#10;&#10;- Usa guiones para crear listas&#10;- Cada línea con guión es un item" />
                  <p className="text-[9px] text-wood-400 mt-1.5">Párrafos: línea vacía entre ellos. Listas: empezar línea con -</p>
                </div>
                {/* Mini preview */}
                {sectionForm.content && (
                  <div>
                    <label className="text-[10px] font-bold uppercase text-wood-500 mb-1.5 block">Vista previa</label>
                    <div className="p-4 bg-sand-50 rounded-xl border border-wood-100 max-h-48 overflow-y-auto">
                      <h4 className="font-serif text-lg text-wood-900 mb-3">{sectionForm.label || 'Sin título'}</h4>
                      {renderContent(sectionForm.content)}
                    </div>
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 bg-white border-t border-wood-100 px-6 py-4 flex justify-end gap-2 rounded-b-2xl">
                <button onClick={() => setSectionModal(null)} className="px-4 py-2.5 border border-wood-200 rounded-xl text-xs font-medium hover:bg-wood-50">Cancelar</button>
                <button onClick={saveSectionModal} disabled={!sectionForm.label} className="px-5 py-2.5 bg-accent-gold text-white rounded-xl text-xs font-medium hover:bg-accent-gold/90 disabled:opacity-40 flex items-center gap-1.5"><Save size={12} /> {sectionModal.isNew ? 'Agregar sección' : 'Guardar cambios'}</button>
              </div>
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal !== null && (
          <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" onClick={() => setDeleteModal(null)} />
            <div className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-white rounded-2xl shadow-2xl z-[201] p-6">
              <h4 className="font-serif text-lg text-wood-900 mb-2">Eliminar sección</h4>
              <p className="text-sm text-wood-600 mb-1">¿Eliminar <strong>&ldquo;{editingPage?.sections?.[deleteModal]?.label}&rdquo;</strong>?</p>
              <p className="text-xs text-wood-400 mb-6">Se aplica al guardar la página.</p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 border border-wood-200 rounded-xl text-xs font-medium hover:bg-wood-50">Cancelar</button>
                <button onClick={confirmDeleteSection} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-medium hover:bg-red-700">Eliminar</button>
              </div>
            </div>
          </>
        )}

        {/* Header bar */}
        <div className="flex items-center gap-3 bg-white border border-wood-100 rounded-xl p-3">
          <button onClick={() => setEditingPage(null)} className="p-1.5 hover:bg-wood-100 rounded-lg"><ArrowLeft size={16} className="text-wood-500" /></button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-wood-900 truncate">{editingPage.title}</p>
            <p className="text-[10px] text-wood-400 font-mono">{editingPage.slug} · {TEMPLATES.find(t => t.id === editingPage.template)?.label}</p>
          </div>
          <button onClick={() => setPreviewMode(true)} className="px-3 py-1.5 border border-wood-200 rounded-lg text-xs font-medium hover:bg-wood-50 flex items-center gap-1"><Eye size={12} /> Vista previa</button>
          <button onClick={handleSavePage} className="px-4 py-1.5 bg-accent-gold text-white rounded-lg text-xs font-medium hover:bg-accent-gold/90 flex items-center gap-1"><Save size={12} /> Guardar</button>
        </div>

        {/* Page settings */}
        <Card className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div><label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Título</label>
              <input value={editingPage.title} onChange={e => setEditingPage((p: any) => ({ ...p, title: e.target.value }))} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">URL</label>
              <input value={editingPage.slug} onChange={e => setEditingPage((p: any) => ({ ...p, slug: e.target.value }))} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-sm font-mono" /></div>
            <div><label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Plantilla</label>
              <select value={editingPage.template} onChange={e => setEditingPage((p: any) => ({ ...p, template: e.target.value }))} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-sm">
                {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
              </select></div>
            <div><label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Última actualización</label>
              <input value={editingPage.last_updated || ''} onChange={e => setEditingPage((p: any) => ({ ...p, last_updated: e.target.value }))} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-sm" /></div>
          </div>
        </Card>

        {/* Sections editor (for legal_sidebar template) */}
        {isLegal && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-medium text-wood-900">Secciones del documento</h4>
                <p className="text-[10px] text-wood-400">{sections.length} secciones · Cada sección aparece en el sidebar de navegación</p>
              </div>
              <button onClick={() => openSectionEditor(sections.length, true)} className="px-3 py-1.5 bg-accent-gold/10 text-accent-gold rounded-lg text-xs font-medium hover:bg-accent-gold/20 flex items-center gap-1"><Plus size={12} /> Agregar</button>
            </div>
            {sections.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-wood-200 rounded-xl">
                <FileText className="w-10 h-10 text-wood-200 mx-auto mb-3" />
                <p className="text-sm text-wood-400 mb-3">Esta página no tiene secciones</p>
                <button onClick={() => openSectionEditor(0, true)} className="text-xs text-accent-gold font-medium hover:underline">Crear primera sección</button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {sections.map((sec: any, idx: number) => (
                  <div key={sec.id || idx} className="flex items-start gap-3 p-3 bg-sand-50 rounded-xl group hover:bg-sand-100 transition-colors cursor-pointer" onClick={() => openSectionEditor(idx, false)}>
                    <div className="flex flex-col gap-0.5 pt-1 shrink-0">
                      <button onClick={e => { e.stopPropagation(); moveSection(idx, -1); }} disabled={idx === 0} className="p-0.5 text-wood-300 hover:text-wood-600 disabled:opacity-20"><ChevronDown size={10} className="rotate-180" /></button>
                      <button onClick={e => { e.stopPropagation(); moveSection(idx, 1); }} disabled={idx === sections.length - 1} className="p-0.5 text-wood-300 hover:text-wood-600 disabled:opacity-20"><ChevronDown size={10} /></button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-wood-900">{sec.label}</span>
                        <code className="text-[9px] text-wood-300 font-mono">#{sec.id}</code>
                      </div>
                      <p className="text-[11px] text-wood-500 line-clamp-2 leading-relaxed">{(sec.content || '').substring(0, 150)}{(sec.content || '').length > 150 ? '...' : ''}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); openSectionEditor(idx, false); }} className="p-1.5 text-wood-400 hover:text-accent-gold hover:bg-white rounded-lg" title="Editar"><Edit3 size={13} /></button>
                      <button onClick={e => { e.stopPropagation(); setDeleteModal(idx); }} className="p-1.5 text-wood-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar"><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    );
  }

  // ═══ PAGE LIST ═══
  const editablePages = pages.filter(p => p.is_editable);
  const systemPages = pages.filter(p => !p.is_editable);

  if (loading) return <Card className="p-12 text-center text-wood-400">Cargando páginas...</Card>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-wood-500">{pages.length} páginas ({editablePages.length} editables)</p>
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-wood-100 bg-sand-50/50"><p className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Páginas Editables</p></div>
        {editablePages.map(p => (
          <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-wood-50 hover:bg-sand-50/30 transition-colors cursor-pointer group" onClick={() => setEditingPage({ ...p })}>
            <div className="w-8 h-8 bg-wood-100 rounded-lg flex items-center justify-center text-xs text-wood-500 shrink-0">{TEMPLATES.find(t => t.id === p.template)?.icon || '?'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-wood-900 group-hover:text-accent-gold transition-colors">{p.title}</p>
              <p className="text-[10px] text-wood-400 font-mono">{p.slug} · {(p.sections || []).length} secciones</p>
            </div>
            <Badge text={TEMPLATES.find(t => t.id === p.template)?.label || p.template} variant="blue" />
            <Badge text={p.status === 'published' ? 'Publicada' : 'Borrador'} variant={p.status === 'published' ? 'green' : 'amber'} />
            <ChevronRight size={14} className="text-wood-300 group-hover:text-accent-gold transition-colors" />
          </div>
        ))}
      </Card>

      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-wood-100 bg-sand-50/50"><p className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Páginas del Sistema</p></div>
        {systemPages.map(p => (
          <div key={p.id} className="flex items-center gap-3 px-5 py-2.5 border-b border-wood-50 opacity-60">
            <Settings2 size={14} className="text-wood-300 shrink-0" />
            <p className="text-xs text-wood-500 flex-1">{p.title}</p>
            <p className="text-[10px] text-wood-300 font-mono">{p.slug}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}

function MenusTabLive() {
  const [menus, setMenus] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editModal, setEditModal] = useState<{ group: string; idx: number; item: any } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ group: string; idx: number; item: any } | null>(null);

  useEffect(() => {
    fetch('/api/admin/cms?type=menus').then(r => r.ok ? r.json() : null).then(d => { if (d?.menus) setMenus(d.menus); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const groups = [
    { key: 'header', label: 'Menú Principal (Header)' },
    { key: 'footerBrand', label: 'Footer — Marca' },
    { key: 'footerService', label: 'Footer — Servicio al Cliente' },
    { key: 'footerLegal', label: 'Footer — Legal' },
    { key: 'footerPrivacy', label: 'Footer — Privacidad' },
  ];

  const handleSave = async (group: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/cms', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'menus', group, items: menus[group] || [] }) });
      if (res.ok) toast.success('Menú guardado'); else toast.error('Error al guardar');
    } catch { toast.error('Error de conexión'); }
    finally { setSaving(false); }
  };

  const addItem = (group: string) => {
    const newItem = { id: crypto.randomUUID(), label: 'Nuevo enlace', url: '/', is_visible: true, open_new_tab: false };
    setMenus(prev => ({ ...prev, [group]: [...(prev[group] || []), newItem] }));
    setEditModal({ group, idx: (menus[group] || []).length, item: newItem });
  };

  const removeItem = () => {
    if (!deleteModal) return;
    setMenus(prev => ({ ...prev, [deleteModal.group]: (prev[deleteModal.group] || []).filter((_, i) => i !== deleteModal.idx) }));
    setDeleteModal(null);
  };

  const updateItem = (group: string, idx: number, updates: Record<string, any>) => {
    setMenus(prev => ({ ...prev, [group]: (prev[group] || []).map((item, i) => i === idx ? { ...item, ...updates } : item) }));
  };

  const toggleVisibility = (group: string, idx: number) => {
    setMenus(prev => ({ ...prev, [group]: (prev[group] || []).map((item, i) => i === idx ? { ...item, is_visible: !item.is_visible } : item) }));
  };

  const saveEditModal = () => {
    if (!editModal) return;
    updateItem(editModal.group, editModal.idx, editModal.item);
    setEditModal(null);
  };

  if (loading) return <Card className="p-12 text-center text-wood-400">Cargando menús...</Card>;

  return (
    <div className="space-y-6">
      {/* Edit Modal */}
      {editModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" onClick={() => setEditModal(null)} />
          <div className="fixed inset-0 m-auto w-full max-w-md h-fit bg-white rounded-2xl shadow-2xl z-[201] overflow-hidden">
            <div className="px-6 py-4 border-b border-wood-100 flex items-center justify-between">
              <h4 className="font-serif text-lg text-wood-900">Editar Enlace</h4>
              <button onClick={() => setEditModal(null)} className="p-1.5 hover:bg-wood-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-[10px] font-bold uppercase text-wood-500 mb-1 block">Texto del enlace</label>
                <input value={editModal.item.label} onChange={e => setEditModal(m => m ? { ...m, item: { ...m.item, label: e.target.value } } : null)} className="w-full px-3 py-2.5 border border-wood-200 rounded-lg text-sm" placeholder="Ej: Sobre Nosotros" /></div>
              <div><label className="text-[10px] font-bold uppercase text-wood-500 mb-1 block">URL destino</label>
                <input value={editModal.item.url} onChange={e => setEditModal(m => m ? { ...m, item: { ...m.item, url: e.target.value } } : null)} className="w-full px-3 py-2.5 border border-wood-200 rounded-lg text-sm font-mono" placeholder="/about" /></div>
              <div className="flex items-center justify-between p-3 bg-sand-50 rounded-lg">
                <div><p className="text-xs font-medium text-wood-900">Visible</p><p className="text-[10px] text-wood-400">Mostrar en el menú</p></div>
                <button onClick={() => setEditModal(m => m ? { ...m, item: { ...m.item, is_visible: !m.item.is_visible } } : null)} className={"w-9 h-5 rounded-full transition-colors" + (editModal.item.is_visible ? "bg-green-500" : "bg-wood-200")}>
                  <div className={"w-4 h-4 bg-white rounded-full shadow transition-transform" + (editModal.item.is_visible ? "translate-x-4" : "translate-x-0.5")} /></button>
              </div>
              <div className="flex items-center justify-between p-3 bg-sand-50 rounded-lg">
                <div><p className="text-xs font-medium text-wood-900">Abrir en nueva pestaña</p></div>
                <button onClick={() => setEditModal(m => m ? { ...m, item: { ...m.item, open_new_tab: !m.item.open_new_tab } } : null)} className={"w-9 h-5 rounded-full transition-colors" + (editModal.item.open_new_tab ? "bg-green-500" : "bg-wood-200")}>
                  <div className={"w-4 h-4 bg-white rounded-full shadow transition-transform" + (editModal.item.open_new_tab ? "translate-x-4" : "translate-x-0.5")} /></button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-wood-100 flex justify-end gap-2">
              <button onClick={() => setEditModal(null)} className="px-4 py-2 border border-wood-200 rounded-lg text-xs font-medium hover:bg-wood-50">Cancelar</button>
              <button onClick={saveEditModal} className="px-4 py-2 bg-accent-gold text-white rounded-lg text-xs font-medium hover:bg-accent-gold/90 flex items-center gap-1"><Save size={12} /> Guardar</button>
            </div>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" onClick={() => setDeleteModal(null)} />
          <div className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-white rounded-2xl shadow-2xl z-[201] p-6">
            <h4 className="font-serif text-lg text-wood-900 mb-3">Eliminar Enlace</h4>
            <p className="text-sm text-wood-600 mb-1">¿Eliminar <strong>"{deleteModal.item.label}"</strong> del menú?</p>
            <p className="text-xs text-wood-400 mb-6">Recuerda guardar el menú para aplicar el cambio.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-2 border border-wood-200 rounded-lg text-xs font-medium hover:bg-wood-50">Cancelar</button>
              <button onClick={removeItem} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </>
      )}

      {groups.map(g => (
        <Card key={g.key} className="p-5">
          <STitle>{g.label}</STitle>
          <div className="space-y-2">
            {(menus[g.key] || []).map((item, idx) => (
              <div key={item.id || idx} className={"flex items-center gap-2 p-2.5 rounded-lg transition-colors group" + (item.is_visible ? "bg-sand-50 hover:bg-sand-100" : "bg-wood-50 opacity-60")}>
                <GripVertical size={14} className="text-wood-300 shrink-0 cursor-grab" />
                <div className="flex-1 min-w-0">
                  <p className={"text-xs font-medium" + (item.is_visible ? "text-wood-900" : "text-wood-400 line-through")}>{item.label}</p>
                  <p className="text-[10px] text-wood-400 font-mono">{item.url}</p>
                </div>
                {!item.is_visible && <Badge text="Oculto" variant="gray" />}
                <button onClick={() => toggleVisibility(g.key, idx)} className="p-1.5 rounded-lg hover:bg-wood-100 text-wood-400 transition-colors" title={item.is_visible ? 'Ocultar' : 'Mostrar'}>
                  {item.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button onClick={() => setEditModal({ group: g.key, idx, item: { ...item } })} className="p-1.5 rounded-lg hover:bg-wood-100 text-wood-400 hover:text-accent-gold transition-colors" title="Editar">
                  <Edit3 size={13} />
                </button>
                <button onClick={() => setDeleteModal({ group: g.key, idx, item })} className="p-1.5 rounded-lg hover:bg-red-50 text-wood-400 hover:text-red-600 transition-colors" title="Eliminar">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <button onClick={() => addItem(g.key)} className="text-xs text-accent-gold hover:underline flex items-center gap-1"><Plus size={12} /> Agregar enlace</button>
            <div className="flex-1" />
            <button onClick={() => handleSave(g.key)} disabled={saving} className="text-xs bg-wood-900 text-white px-3 py-1.5 rounded-lg hover:bg-wood-800 disabled:opacity-50 flex items-center gap-1"><Save size={12} /> Guardar menú</button>
          </div>
        </Card>
      ))}
    </div>
  );
}
function HomepageTabLive() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/cms?type=sections')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.sections) setSections(d.sections); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sections', items: sections }),
      });
      if (res.ok) toast.success('Secciones guardadas');
      else toast.error('Error al guardar');
    } catch { toast.error('Error de conexión'); }
    finally { setSaving(false); }
  };

  const toggleVisibility = (idx: number) => {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, is_visible: !s.is_visible } : s));
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sections.length) return;
    const copy = [...sections];
    [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
    setSections(copy);
  };

  const sectionIcons: Record<string, React.ElementType> = {
    hero: Home, collections: FolderOpen, process: Settings2, testimonials: Star,
    newsletter: Type, custom: Layout,
  };

  if (loading) return <Card className="p-12 text-center text-wood-400">Cargando secciones...</Card>;

  return (
    <div className="space-y-4">
      {sections.length === 0 ? (
        <Card className="p-12 text-center">
          <Home size={32} className="mx-auto mb-3 text-wood-200" />
          <p className="text-sm text-wood-500">No hay secciones configuradas.</p>
          <p className="text-xs text-wood-400 mt-1">Ejecuta el SQL seed para crear las secciones iniciales del homepage.</p>
        </Card>
      ) : (
        <>
          {sections.map((s, idx) => {
            const Icon = sectionIcons[s.section_type] || Layout;
            return (
              <Card key={s.id || idx} className={`p-5 flex items-center gap-4 ${!s.is_visible ? 'opacity-50' : ''}`}>
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="p-0.5 text-wood-300 hover:text-wood-600 disabled:opacity-30"><ChevronRight size={14} className="rotate-[-90deg]" /></button>
                  <button onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1} className="p-0.5 text-wood-300 hover:text-wood-600 disabled:opacity-30"><ChevronRight size={14} className="rotate-90" /></button>
                </div>
                <div className="w-10 h-10 rounded-lg bg-sand-100 flex items-center justify-center">
                  <Icon size={18} className="text-wood-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-wood-900">{s.title || s.section_type}</p>
                  <p className="text-[10px] text-wood-400 uppercase tracking-wider">{s.section_type}</p>
                </div>
                <button onClick={() => toggleVisibility(idx)} className={`text-xs px-2 py-1 rounded-full ${s.is_visible ? 'bg-green-50 text-green-600' : 'bg-wood-50 text-wood-400'}`}>
                  {s.is_visible ? 'Visible' : 'Oculta'}
                </button>
              </Card>
            );
          })}
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 disabled:opacity-50 flex items-center gap-1.5">
            <Save size={12} /> Guardar orden y visibilidad
          </button>
        </>
      )}
    </div>
  );
}

// ── LIVE TABS: Blog, Popups, Media, Texts, SEO ──

function BlogTabLive() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', body: '', status: 'draft', category: '', tags: '' });

  const fetchPosts = () => {
    fetch('/api/admin/cms?type=posts').then(r => r.ok ? r.json() : null).then(d => { if (d) setPosts(d.posts || []); }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchPosts(); }, []);

  const handleSave = async () => {
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), type: 'post', ...(editing?.id && { id: editing.id }) };
    const method = editing?.id ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/cms', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) { toast.success(editing?.id ? 'Post actualizado' : 'Post creado'); setEditing(null); fetchPosts(); }
    else toast.error('Error al guardar');
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/cms?type=post&id=${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Post eliminado'); fetchPosts(); }
  };

  if (editing !== null) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-serif text-lg text-wood-900">{editing?.id ? 'Editar Post' : 'Nuevo Post'}</h4>
          <button onClick={() => setEditing(null)} className="text-wood-400 hover:text-wood-900"><X size={18} /></button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><label className="text-[10px] font-bold uppercase text-wood-500 mb-1 block">Título</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))} className="w-full px-3 py-2 border border-wood-200 rounded-lg text-sm" /></div>
          <div><label className="text-[10px] font-bold uppercase text-wood-500 mb-1 block">Slug</label><input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full px-3 py-2 border border-wood-200 rounded-lg text-sm" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><label className="text-[10px] font-bold uppercase text-wood-500 mb-1 block">Categoría</label><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border border-wood-200 rounded-lg text-sm" /></div>
          <div><label className="text-[10px] font-bold uppercase text-wood-500 mb-1 block">Tags (separados por coma)</label><input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="w-full px-3 py-2 border border-wood-200 rounded-lg text-sm" /></div>
        </div>
        <div className="mb-4"><label className="text-[10px] font-bold uppercase text-wood-500 mb-1 block">Extracto</label><input value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} className="w-full px-3 py-2 border border-wood-200 rounded-lg text-sm" /></div>
        <div className="mb-4"><label className="text-[10px] font-bold uppercase text-wood-500 mb-1 block">Contenido</label><textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={10} className="w-full px-3 py-2 border border-wood-200 rounded-lg text-sm font-mono" /></div>
        <div className="flex items-center gap-3">
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="px-3 py-2 border border-wood-200 rounded-lg text-sm">
            <option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option>
          </select>
          <button onClick={handleSave} className="px-4 py-2 bg-accent-gold text-white rounded-lg text-sm font-medium hover:bg-accent-gold/90 flex items-center gap-1.5"><Save size={14} /> Guardar</button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-wood-500">{posts.length} publicaciones</p>
        <button onClick={() => { setForm({ title: '', slug: '', excerpt: '', body: '', status: 'draft', category: '', tags: '' }); setEditing({}); }} className="px-3 py-1.5 bg-accent-gold text-white rounded-lg text-xs font-medium hover:bg-accent-gold/90 flex items-center gap-1.5"><Plus size={12} /> Nuevo Post</button>
      </div>
      {loading ? <Card className="p-8 text-center text-wood-400">Cargando...</Card> : posts.length === 0 ? (
        <Card className="p-12 text-center"><PenLine className="w-10 h-10 text-wood-200 mx-auto mb-3" /><p className="text-sm text-wood-500 mb-2">Sin publicaciones aún</p><button onClick={() => { setForm({ title: '', slug: '', excerpt: '', body: '', status: 'draft', category: '', tags: '' }); setEditing({}); }} className="text-accent-gold text-sm font-medium hover:underline">Crear primera publicación</button></Card>
      ) : (
        <Card className="divide-y divide-wood-100">
          {posts.map(p => (
            <div key={p.id} className="p-4 flex items-center justify-between hover:bg-wood-50/50 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-wood-900 truncate">{p.title}</p>
                <p className="text-[10px] text-wood-400 mt-0.5">{p.slug} · {p.category || 'Sin categoría'} · {new Date(p.created_at).toLocaleDateString('es-MX')}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Badge text={p.status === 'published' ? 'Publicado' : p.status === 'archived' ? 'Archivado' : 'Borrador'} variant={p.status === 'published' ? 'green' : p.status === 'archived' ? 'gray' : 'amber'} />
                <button onClick={() => { setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt || '', body: p.body || '', status: p.status, category: p.category || '', tags: (p.tags || []).join(', ') }); setEditing(p); }} className="p-1.5 text-wood-400 hover:text-wood-900 hover:bg-wood-100 rounded-lg"><Edit3 size={14} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 text-wood-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function PopupsTabLive() {
  const [popups, setPopups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPopups = () => { fetch('/api/admin/cms?type=popups').then(r => r.ok ? r.json() : null).then(d => { if (d) setPopups(d.popups || []); }).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { fetchPopups(); }, []);

  const handleCreate = async () => {
    const res = await fetch('/api/admin/cms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'popup', name: 'Nuevo pop-up', popup_type: 'modal' }) });
    if (res.ok) { toast.success('Pop-up creado'); fetchPopups(); }
  };

  const handleToggle = async (popup: any) => {
    const res = await fetch('/api/admin/cms', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'popup', id: popup.id, is_active: !popup.is_active }) });
    if (res.ok) { toast.success(popup.is_active ? 'Desactivado' : 'Activado'); fetchPopups(); }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/cms?type=popup&id=${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Pop-up eliminado'); fetchPopups(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-wood-500">{popups.length} pop-ups configurados</p>
        <button onClick={handleCreate} className="px-3 py-1.5 bg-accent-gold text-white rounded-lg text-xs font-medium hover:bg-accent-gold/90 flex items-center gap-1.5"><Plus size={12} /> Nuevo Pop-up</button>
      </div>
      {loading ? <Card className="p-8 text-center text-wood-400">Cargando...</Card> : popups.length === 0 ? (
        <Card className="p-12 text-center"><MessageSquare className="w-10 h-10 text-wood-200 mx-auto mb-3" /><p className="text-sm text-wood-500">Sin pop-ups configurados</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popups.map(p => (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div><p className="text-sm font-medium text-wood-900">{p.name}</p><p className="text-[10px] text-wood-400 mt-0.5">{p.type} · trigger: {p.trigger_type} ({p.trigger_value})</p></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggle(p)} className={`w-9 h-5 rounded-full transition-colors ${p.is_active ? 'bg-green-500' : 'bg-wood-200'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform ${p.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1 text-wood-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-wood-400">
                <Badge text={p.is_active ? 'Activo' : 'Inactivo'} variant={p.is_active ? 'green' : 'gray'} />
                <span>Mostrar en: {(p.show_on || ['/']).join(', ')}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MediaTabLive() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch('/api/admin/cms?type=media').then(r => r.ok ? r.json() : null).then(d => { if (d) setFiles(d.files || []); }).catch(() => {}).finally(() => setLoading(false)); }, []);

  const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
  const fmtSize = (b: number) => b > 1_000_000 ? `${(b / 1_000_000).toFixed(1)} MB` : b > 1000 ? `${(b / 1000).toFixed(0)} KB` : `${b} B`;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-wood-500">{files.length} archivos</p>
        <p className="text-[10px] text-wood-400">Subir archivos desde Supabase Storage Dashboard</p>
      </div>
      {loading ? <Card className="p-8 text-center text-wood-400">Cargando...</Card> : files.length === 0 ? (
        <Card className="p-12 text-center"><ImageIcon className="w-10 h-10 text-wood-200 mx-auto mb-3" /><p className="text-sm text-wood-500 mb-2">Sin archivos en media</p><p className="text-[10px] text-wood-400">Sube archivos desde el dashboard de Supabase Storage (bucket: media)</p></Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {files.map(f => (
            <Card key={f.id} className="overflow-hidden group">
              <div className="aspect-square bg-wood-50 flex items-center justify-center relative">
                {isImage(f.name) ? <img src={f.url} alt={f.name} className="w-full h-full object-cover" /> : <FileText className="w-8 h-8 text-wood-300" />}
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors"><ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" /></a>
              </div>
              <div className="p-2"><p className="text-[10px] text-wood-700 truncate font-medium">{f.name}</p><p className="text-[9px] text-wood-400">{fmtSize(f.size)}</p></div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TextsTabLive() {
  const [texts, setTexts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ value_es: '', value_en: '' });

  const fetchTexts = () => { fetch('/api/admin/cms?type=texts').then(r => r.ok ? r.json() : null).then(d => { if (d) setTexts(d.texts || []); }).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { fetchTexts(); }, []);

  const handleSave = async (id: string) => {
    const res = await fetch('/api/admin/cms', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'text', id, ...editValues }) });
    if (res.ok) { toast.success('Texto actualizado'); setEditId(null); fetchTexts(); }
  };

  const handleCreate = async () => {
    const key = prompt('Clave del texto (ej: hero.title):');
    if (!key) return;
    const res = await fetch('/api/admin/cms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'text', key, section: key.split('.')[0] || 'General' }) });
    if (res.ok) { toast.success('Texto creado'); fetchTexts(); }
  };

  const sections = [...new Set(texts.map(t => t.section))];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-wood-500">{texts.length} textos en {sections.length} secciones</p>
        <button onClick={handleCreate} className="px-3 py-1.5 bg-accent-gold text-white rounded-lg text-xs font-medium hover:bg-accent-gold/90 flex items-center gap-1.5"><Plus size={12} /> Nuevo Texto</button>
      </div>
      {loading ? <Card className="p-8 text-center text-wood-400">Cargando...</Card> : texts.length === 0 ? (
        <Card className="p-12 text-center"><Type className="w-10 h-10 text-wood-200 mx-auto mb-3" /><p className="text-sm text-wood-500">Sin textos configurados</p></Card>
      ) : sections.map(section => (
        <Card key={section} className="overflow-hidden">
          <div className="bg-wood-50 px-4 py-2 border-b border-wood-100"><STitle>{section}</STitle></div>
          <div className="divide-y divide-wood-50">
            {texts.filter(t => t.section === section).map(t => (
              <div key={t.id} className="p-3 flex items-center gap-4 hover:bg-wood-50/30 transition-colors">
                <code className="text-[10px] text-wood-400 font-mono w-40 truncate shrink-0">{t.key}</code>
                {editId === t.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input value={editValues.value_es} onChange={e => setEditValues(v => ({ ...v, value_es: e.target.value }))} className="flex-1 px-2 py-1 border border-wood-200 rounded text-sm" placeholder="Español" />
                    <input value={editValues.value_en} onChange={e => setEditValues(v => ({ ...v, value_en: e.target.value }))} className="flex-1 px-2 py-1 border border-wood-200 rounded text-sm" placeholder="English" />
                    <button onClick={() => handleSave(t.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={16} /></button>
                    <button onClick={() => setEditId(null)} className="p-1 text-wood-400 hover:bg-wood-100 rounded"><X size={16} /></button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-4 min-w-0">
                    <span className="text-sm text-wood-700 truncate flex-1">{t.value_es || '—'}</span>
                    <span className="text-sm text-wood-400 truncate flex-1">{t.value_en || '—'}</span>
                    <button onClick={() => { setEditId(t.id); setEditValues({ value_es: t.value_es || '', value_en: t.value_en || '' }); }} className="p-1 text-wood-400 hover:text-wood-900"><Edit3 size={14} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function SeoTabLive() {
  const [seo, setSeo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch('/api/admin/cms?type=seo').then(r => r.ok ? r.json() : null).then(d => { if (d) setSeo(d.seo); }).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <Card className="p-8 text-center text-wood-400">Cargando...</Card>;

  const items = seo ? [
    { label: 'Dominio', value: seo.domain, icon: Globe },
    { label: 'Páginas indexadas', value: `${seo.indexedPages} páginas en sitemap`, icon: Search },
    { label: 'Meta descripción', value: seo.metaDescription, icon: FileText },
    { label: 'OG Image', value: seo.ogImage ? 'Configurada' : 'No configurada', icon: ImageIcon },
    { label: 'JSON-LD', value: seo.jsonLd ? 'Activo (Organization + Product)' : 'Inactivo', icon: Tag },
    { label: 'Favicon', value: seo.favicon ? '4 tamaños (32/180/192/512)' : 'No configurado', icon: Star },
  ] : [];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h4 className="font-serif text-lg text-wood-900 mb-4 flex items-center gap-2"><Search size={18} className="text-accent-gold" /> SEO Global</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.label} className="flex items-start gap-3 p-3 bg-wood-50 rounded-lg">
              <item.icon size={16} className="text-wood-400 mt-0.5 shrink-0" />
              <div><p className="text-[10px] font-bold uppercase text-wood-500">{item.label}</p><p className="text-sm text-wood-900">{item.value}</p></div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <h4 className="text-sm font-medium text-wood-900 mb-3">Archivos SEO</h4>
        <div className="space-y-2">
          {seo && [
            { label: 'Sitemap', url: seo.sitemap },
            { label: 'Robots.txt', url: seo.robots },
          ].map(f => (
            <a key={f.label} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-wood-50 rounded-lg hover:bg-wood-100 transition-colors group">
              <span className="text-sm text-wood-700">{f.label}</span>
              <ExternalLink size={14} className="text-wood-400 group-hover:text-accent-gold" />
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Coming Soon placeholder (kept for any future tabs)
function CmsComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <Card className="p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-wood-50 rounded-2xl flex items-center justify-center">
        <Settings2 className="w-8 h-8 text-wood-300" />
      </div>
      <h4 className="text-lg font-serif text-wood-900 mb-2">{title}</h4>
      <p className="text-sm text-wood-500 max-w-md mx-auto mb-4">{description}</p>
      <Badge text="Próximamente" variant="amber" />
    </Card>
  );
}

export const CmsPage: React.FC = () => {

  // ── Live data from API ──
  const [liveCms, setLiveCms] = useState<any>(null);
  const [cmsLoading, setCmsLoading] = useState(true);
  useEffect(() => {
    fetch('/api/admin/cms').then(r => r.ok ? r.json() : null).then(d => { if (d) setLiveCms(d); }).catch(() => {}).finally(() => setCmsLoading(false));
  }, []);

  const [activeTab, setActiveTab] = useState<CmsTab>('pages');

  const tabContent: Record<CmsTab, React.ReactNode> = {
    pages: <PagesTabLive />,
    menus: <MenusTabLive />,
    homepage: <HomepageTabLive />,
    blog: <BlogTabLive />,
    popups: <PopupsTabLive />,
    media: <MediaTabLive />,
    texts: <TextsTabLive />,
    seo: <SeoTabLive />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-serif text-lg text-wood-900 flex items-center gap-2">
          <FileText size={20} className="text-accent-gold" /> CMS - Contenido del Sitio
        </h3>
        {activeTab === 'pages' && (
          <button onClick={() => toast.success('Creando nueva pagina...')} className="px-3 py-1.5 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors flex items-center gap-1.5">
            <Plus size={12} /> Nueva Pagina
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1 min-w-max border-b border-wood-100">
          {tabItems.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={
                'flex items-center gap-1.5 px-3 py-2.5 text-xs transition-colors border-b-2 whitespace-nowrap ' +
                (activeTab === t.id
                  ? 'border-accent-gold text-accent-gold font-medium'
                  : 'border-transparent text-wood-500 hover:text-wood-700')
              }
            >
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tabContent[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
