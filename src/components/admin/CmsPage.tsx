"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Menu, Home, PenLine, MessageSquare, Image, Type, Search,
  Plus, Save, Eye, Trash2, Copy, ExternalLink, GripVertical, ChevronRight,
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

// ===== MOCK DATA =====
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
function PagesTab() {
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');

  const editPage = mockPages.find((p) => p.id === editingPage);

  if (editPage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setEditingPage(null)} className="text-xs text-wood-500 hover:text-wood-700 transition-colors">
              Paginas
            </button>
            <ChevronRight size={12} className="text-wood-300" />
            <span className="text-xs font-medium text-wood-900">{editPage.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => toast.success('Borrador guardado')} className="px-3 py-1.5 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors">
              Guardar borrador
            </button>
            <button onClick={() => toast.success('Pagina publicada')} className="px-3 py-1.5 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors">
              Publicar
            </button>
          </div>
        </div>

        {/* Info */}
        <Card className="p-5">
          <STitle>Informacion</STitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Titulo</label>
              <input defaultValue={editPage.title} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
            </div>
            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">URL</label>
              <div className="flex items-center">
                <span className="text-[10px] text-wood-400 mr-1">davidsonsdesign.com</span>
                <input defaultValue={editPage.url} className="flex-1 border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Template</label>
              <select defaultValue={editPage.template} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white">
                <option>Completa</option>
                <option>Con sidebar</option>
                <option>Landing</option>
                <option>Vacia</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Editor */}
        <Card className="p-5">
          <STitle>Editor de Contenido</STitle>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-2 bg-sand-50 rounded-lg border border-wood-100 mb-3">
            {[
              { icon: Bold, label: 'Bold' },
              { icon: Italic, label: 'Italic' },
              { icon: Underline, label: 'Underline' },
            ].map((t) => (
              <button key={t.label} className="p-1.5 rounded hover:bg-wood-100 transition-colors text-wood-600" title={t.label}>
                <t.icon size={14} />
              </button>
            ))}
            <div className="w-px h-5 bg-wood-200 mx-1" />
            {[
              { icon: Heading1, label: 'H1' },
              { icon: Heading2, label: 'H2' },
              { icon: Heading3, label: 'H3' },
            ].map((t) => (
              <button key={t.label} className="p-1.5 rounded hover:bg-wood-100 transition-colors text-wood-600" title={t.label}>
                <t.icon size={14} />
              </button>
            ))}
            <div className="w-px h-5 bg-wood-200 mx-1" />
            {[
              { icon: Link2, label: 'Link' },
              { icon: ImageIcon, label: 'Imagen' },
              { icon: Video, label: 'Video' },
              { icon: Quote, label: 'Cita' },
              { icon: List, label: 'Lista' },
              { icon: Table, label: 'Tabla' },
              { icon: Minus, label: 'Separador' },
              { icon: MousePointer, label: 'Boton CTA' },
            ].map((t) => (
              <button key={t.label} className="p-1.5 rounded hover:bg-wood-100 transition-colors text-wood-600" title={t.label}>
                <t.icon size={14} />
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setEditorMode('visual')}
                className={'px-2 py-1 text-[10px] rounded ' + (editorMode === 'visual' ? 'bg-accent-gold text-white' : 'text-wood-500 hover:bg-wood-50')}
              >
                Visual
              </button>
              <button
                onClick={() => setEditorMode('html')}
                className={'px-2 py-1 text-[10px] rounded ' + (editorMode === 'html' ? 'bg-accent-gold text-white' : 'text-wood-500 hover:bg-wood-50')}
              >
                HTML
              </button>
            </div>
          </div>
          {/* Content area */}
          <div className="border border-wood-200 rounded-lg p-6 min-h-[300px] bg-white">
            {editorMode === 'visual' ? (
              <div className="prose prose-sm max-w-none">
                <div className="bg-sand-50 rounded-lg p-4 mb-4 text-center text-xs text-wood-400 border-2 border-dashed border-wood-200">
                  [IMAGEN HERO: Taller artesanal con maderas]
                </div>
                <h1 className="text-lg text-wood-900 font-serif">Sobre DavidSon's Design</h1>
                <p className="text-xs text-wood-600">
                  Somos un taller artesanal en Hermosillo, Sonora, dedicado a crear piezas unicas en madera mexicana...
                </p>
                <h2 className="text-sm text-wood-900 font-serif mt-4">Nuestra Historia</h2>
                <p className="text-xs text-wood-600">
                  Desde 2020, David y su equipo han transformado las maderas mas nobles de Mexico en piezas funcionales y bellas para la cocina moderna...
                </p>
                <h2 className="text-sm text-wood-900 font-serif mt-4">Nuestras Maderas</h2>
                <div className="grid grid-cols-4 gap-2 my-3">
                  {['Parota', 'Rosa Morada', 'Nogal', 'Cedro Rojo'].map((m) => (
                    <div key={m} className="bg-sand-50 rounded p-3 text-center text-[10px] text-wood-500 border border-wood-100">
                      [Foto {m}]
                    </div>
                  ))}
                </div>
                <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-lg p-3 text-center">
                  <span className="text-xs text-accent-gold font-medium">Conoce Nuestros Productos &rarr;</span>
                </div>
              </div>
            ) : (
              <textarea
                className="w-full h-64 text-xs font-mono text-wood-700 resize-none outline-none"
                defaultValue={'<h1>Sobre DavidSon\'s Design</h1>\n<p>Somos un taller artesanal...</p>'}
              />
            )}
          </div>
        </Card>

        {/* SEO */}
        <Card className="p-5">
          <STitle>SEO</STitle>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Meta titulo</label>
              <input defaultValue={editPage.title + ' - DavidSon\'s Design'} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
            </div>
            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Meta descripcion</label>
              <textarea className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white h-16 resize-none" defaultValue="Taller artesanal en Hermosillo, Sonora. Creamos piezas unicas en madera mexicana..." />
            </div>
            <div className="flex items-center gap-3">
              <button className="text-[10px] text-wood-500 border border-wood-200 rounded-lg px-3 py-1.5 hover:bg-wood-50 transition-colors flex items-center gap-1">
                <Upload size={10} /> Imagen OG
              </button>
              <button onClick={() => toast.success('SEO generado con IA')} className="text-[10px] text-accent-gold border border-accent-gold/30 rounded-lg px-3 py-1.5 hover:bg-accent-gold/5 transition-colors flex items-center gap-1">
                <Star size={10} /> Generar SEO con IA
              </button>
            </div>
          </div>
        </Card>

        {/* Config */}
        <Card className="p-5">
          <STitle>Configuracion</STitle>
          <div className="space-y-2">
            {[
              { label: 'Mostrar en mapa del sitio (sitemap.xml)', checked: true },
              { label: 'Indexar en Google (noindex si desactivado)', checked: false },
              { label: 'Mostrar breadcrumbs', checked: true },
              { label: 'Proteger con contrasena', checked: false },
            ].map((opt) => (
              <label key={opt.label} className="flex items-center gap-2 text-xs text-wood-700">
                <input type="checkbox" defaultChecked={opt.checked} className="rounded border-wood-300 text-accent-gold" />
                {opt.label}
              </label>
            ))}
          </div>
        </Card>

        {/* Version history */}
        <Card className="p-5">
          <STitle>Historial de versiones</STitle>
          <div className="space-y-2">
            {[
              { version: 'v3', date: '15 Feb 2026, 10:30', author: 'David', current: true },
              { version: 'v2', date: '10 Ene 2026, 14:00', author: 'David', current: false },
              { version: 'v1', date: '01 Dic 2025, 09:00', author: 'David', current: false },
            ].map((v) => (
              <div key={v.version} className="flex items-center justify-between p-2.5 bg-sand-50 rounded-lg text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-wood-900">{v.version}</span>
                  <span className="text-wood-500">{v.date} ({v.author})</span>
                  {v.current && <Badge text="actual" variant="green" />}
                </div>
                {!v.current && (
                  <button onClick={() => toast.success('Version restaurada')} className="text-[10px] text-accent-gold hover:underline">
                    Restaurar
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Footer actions */}
        <div className="flex items-center gap-3">
          <button onClick={() => toast.success('Preview abierto')} className="px-3 py-1.5 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors flex items-center gap-1.5">
            <Eye size={12} /> Preview
          </button>
          <button onClick={() => toast.success('Pagina duplicada')} className="px-3 py-1.5 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors flex items-center gap-1.5">
            <Copy size={12} /> Duplicar pagina
          </button>
          <button onClick={() => toast.error('Pagina eliminada')} className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5">
            <Trash2 size={12} /> Eliminar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-wood-100 flex items-center justify-between">
          <h4 className="text-sm font-medium text-wood-900">Paginas del Sitio</h4>
          <button onClick={() => toast.success('Creando nueva pagina...')} className="px-3 py-1.5 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors flex items-center gap-1.5">
            <Plus size={12} /> Nueva Pagina
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-50">
                <th className="px-5 py-2">Pagina</th>
                <th className="px-5 py-2">URL</th>
                <th className="px-5 py-2">Template</th>
                <th className="px-5 py-2">Ultima edicion</th>
                <th className="px-5 py-2">Estado</th>
                <th className="px-5 py-2 text-right">Acc.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {mockPages.map((p) => (
                <tr key={p.id} className="hover:bg-sand-50/50 transition-colors">
                  <td className="px-5 py-2.5">
                    <button onClick={() => setEditingPage(p.id)} className="text-xs font-medium text-wood-900 hover:text-accent-gold transition-colors">
                      {p.title}
                    </button>
                  </td>
                  <td className="px-5 py-2.5 text-xs text-wood-500 font-mono">{p.url}</td>
                  <td className="px-5 py-2.5 text-xs text-wood-500">{p.template}</td>
                  <td className="px-5 py-2.5 text-xs text-wood-500">{p.lastEdit || '-'}</td>
                  <td className="px-5 py-2.5">
                    <Badge text={p.status === 'published' ? 'Publicada' : 'Borrador'} variant={p.status === 'published' ? 'green' : 'gray'} />
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <button className="p-1 rounded hover:bg-wood-50 text-wood-400">
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ===== TAB 2: MENUS =====
function MenusTab() {
  const [addingTo, setAddingTo] = useState<string | null>(null);

  function renderMenuItem(item: { id: string; label: string; url: string; children?: any[] }, depth: number = 0) {
    return (
      <div key={item.id}>
        <div className={'flex items-center gap-2 p-2.5 bg-sand-50 rounded-lg mb-1.5 ' + (depth > 0 ? 'ml-8' : '')}>
          <GripVertical size={14} className="text-wood-300 shrink-0 cursor-grab" />
          <span className="text-xs font-medium text-wood-900 flex-1">{item.label}</span>
          <span className="text-[10px] text-wood-400 font-mono">{item.url}</span>
          <button className="p-1 rounded hover:bg-wood-100 text-wood-400"><Edit3 size={12} /></button>
          <button className="p-1 rounded hover:bg-red-50 text-red-400"><X size={12} /></button>
        </div>
        {item.children && item.children.map((child: any) => renderMenuItem(child, depth + 1))}
      </div>
    );
  }

  function MenuSection({ title, menuKey, items }: { title: string; menuKey: string; items: any[] }) {
    return (
      <Card className="p-5">
        <STitle>{title}</STitle>
        <div className="space-y-0">
          {items.map((item) => renderMenuItem(item))}
        </div>
        <button
          onClick={() => setAddingTo(addingTo === menuKey ? null : menuKey)}
          className="mt-3 text-xs text-accent-gold hover:underline flex items-center gap-1"
        >
          <Plus size={12} /> Agregar item
        </button>
        <AnimatePresence>
          {addingTo === menuKey && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-4 bg-sand-50 rounded-lg border border-wood-100 space-y-3">
                <div>
                  <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Texto</label>
                  <input className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" placeholder="Nombre del item" />
                </div>
                <div>
                  <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Link</label>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Pagina interna', value: 'page' },
                      { label: 'Categoria', value: 'category' },
                      { label: 'Coleccion', value: 'collection' },
                      { label: 'URL externa', value: 'external' },
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 text-xs text-wood-600">
                        <input type="radio" name={'link-type-' + menuKey} className="text-accent-gold" />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  <select className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white mt-2">
                    <option>Seleccionar pagina...</option>
                    {mockPages.map((p) => <option key={p.id} value={p.url}>{p.title}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-xs text-wood-600">
                  <input type="checkbox" className="rounded border-wood-300 text-accent-gold" />
                  Destacar (negrita en el menu)
                </label>
                <button
                  onClick={() => { toast.success('Item agregado'); setAddingTo(null); }}
                  className="px-3 py-1.5 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors"
                >
                  Agregar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <MenuSection title='Menu Principal (Header)' menuKey="header" items={mockMenus.header} />
      <MenuSection title='Menu Footer - Columna 1: "Tienda"' menuKey="footerShop" items={mockMenus.footerShop} />
      <MenuSection title='Menu Footer - Columna 2: "Informacion"' menuKey="footerInfo" items={mockMenus.footerInfo} />
      <MenuSection title='Menu Footer - Columna 3: "Legal"' menuKey="footerLegal" items={mockMenus.footerLegal} />
      <button
        onClick={() => toast.success('Todos los menus guardados')}
        className="px-4 py-2 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors flex items-center gap-1.5"
      >
        <Save size={12} /> Guardar todos los menus
      </button>
    </div>
  );
}

// ===== TAB 3: HOMEPAGE =====
function HomepageTab() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-wood-900">Secciones del Homepage</h4>
        <button onClick={() => toast.success('Preview abierto')} className="px-3 py-1.5 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors flex items-center gap-1.5">
          <Eye size={12} /> Preview
        </button>
      </div>

      <div className="space-y-2">
        {mockHomeSections.map((section, idx) => (
          <Card key={section.id} className="overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <GripVertical size={16} className="text-wood-300 shrink-0 cursor-grab" />
              <span className="text-[10px] text-wood-400 w-5 font-mono">{idx + 1}.</span>
              <span className="text-xs font-medium text-wood-900 flex-1">{section.name}</span>
              <Badge text={section.active ? 'Activa' : 'Inactiva'} variant={section.active ? 'green' : 'gray'} />
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="p-1.5 rounded hover:bg-wood-50 text-wood-400 transition-colors"
              >
                <Settings2 size={14} />
              </button>
            </div>
            <AnimatePresence>
              {expandedSection === section.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-0 border-t border-wood-50 space-y-3">
                    {section.note && (
                      <p className="text-[10px] text-wood-400 italic mt-3">{section.note}</p>
                    )}
                    {section.config && (
                      <div className="mt-3 space-y-3">
                        {section.config.title && (
                          <div>
                            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Titulo seccion</label>
                            <input defaultValue={section.config.title} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
                          </div>
                        )}
                        {section.config.subtitle && (
                          <div>
                            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Subtitulo</label>
                            <input defaultValue={section.config.subtitle} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
                          </div>
                        )}
                        {section.config.type && (
                          <div>
                            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Tipo</label>
                            <input defaultValue={section.config.type} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" readOnly />
                          </div>
                        )}
                        {section.config.source && (
                          <div>
                            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Fuente</label>
                            <select defaultValue={section.config.source} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white">
                              <option>Best Sellers</option>
                              <option>Novedades</option>
                              <option>Reviews destacadas</option>
                              <option>Seleccion manual</option>
                            </select>
                          </div>
                        )}
                        {section.config.count !== undefined && (
                          <div>
                            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Mostrar</label>
                            <input type="number" defaultValue={section.config.count} className="w-24 border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
                          </div>
                        )}
                        {section.config.view && (
                          <div>
                            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Ver como</label>
                            <select defaultValue={section.config.view} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white">
                              <option>Carrusel</option>
                              <option>Grid</option>
                              <option>Lista</option>
                            </select>
                          </div>
                        )}
                        {section.config.layout && (
                          <div>
                            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Layout</label>
                            <select defaultValue={section.config.layout} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white">
                              <option>Carrusel</option>
                              <option>Grid</option>
                            </select>
                          </div>
                        )}
                        {section.config.cta && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">CTA</label>
                              <input defaultValue={section.config.cta} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
                            </div>
                            <div>
                              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Link</label>
                              <input defaultValue={section.config.link} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
                            </div>
                          </div>
                        )}
                        {section.config.categories && (
                          <div>
                            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Categorias</label>
                            <div className="flex flex-wrap gap-1.5">
                              {section.config.categories.map((c: string) => (
                                <span key={c} className="text-[10px] bg-accent-gold/10 text-accent-gold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  {c} <X size={8} className="cursor-pointer" />
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {section.config.steps && (
                          <div>
                            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Pasos</label>
                            <div className="space-y-1.5">
                              {section.config.steps.map((step: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 p-2 bg-sand-50 rounded-lg">
                                  <GripVertical size={10} className="text-wood-300" />
                                  <span className="text-[10px] text-wood-400 w-5">P{i + 1}</span>
                                  <input defaultValue={step} className="flex-1 border border-wood-200 rounded px-2 py-1 text-xs bg-white" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {section.config.incentive && (
                          <div>
                            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Incentivo</label>
                            <input defaultValue={section.config.incentive} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
                          </div>
                        )}
                        {section.config.text && (
                          <div>
                            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Texto</label>
                            <input defaultValue={section.config.text} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>

      {/* Add section */}
      <Card className="p-5">
        <STitle>Agregar seccion</STitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            'Grid de productos', 'Banner imagen + texto', 'Video embed', 'Texto libre',
            'Contador estadisticas', 'Grid de logos', 'Mapa ubicacion', 'Coleccion destacada',
          ].map((s) => (
            <button
              key={s}
              onClick={() => toast.success('Seccion "' + s + '" agregada')}
              className="p-3 bg-sand-50 rounded-lg text-xs text-wood-600 hover:bg-sand-100 hover:text-wood-900 transition-colors text-left"
            >
              <Plus size={10} className="inline mr-1 text-wood-400" />{s}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-2">
        <button onClick={() => toast.success('Homepage guardada')} className="px-4 py-2 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors flex items-center gap-1.5">
          <Save size={12} /> Guardar
        </button>
        <button onClick={() => toast.success('Preview abierto')} className="px-4 py-2 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors flex items-center gap-1.5">
          <Eye size={12} /> Preview en nueva pestana
        </button>
      </div>
    </div>
  );
}

// ===== TAB 4: BLOG =====
function BlogTab() {
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const editPost = mockBlogPosts.find((p) => p.id === editingPost);

  if (editPost) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setEditingPost(null)} className="text-xs text-wood-500 hover:text-wood-700 transition-colors">Blog</button>
            <ChevronRight size={12} className="text-wood-300" />
            <span className="text-xs font-medium text-wood-900">{editPost.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => toast.success('Borrador guardado')} className="px-3 py-1.5 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors">Guardar borrador</button>
            <button onClick={() => toast.success('Preview abierto')} className="px-3 py-1.5 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors flex items-center gap-1"><Eye size={12} /> Preview</button>
            <button onClick={() => toast.success('Articulo publicado')} className="px-3 py-1.5 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors">Publicar</button>
            <button onClick={() => toast.success('Publicacion programada')} className="px-3 py-1.5 text-xs border border-accent-gold text-accent-gold rounded-lg hover:bg-accent-gold/5 transition-colors flex items-center gap-1">
              <Clock size={12} /> Programar
            </button>
          </div>
        </div>

        <Card className="p-5 space-y-4">
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Titulo</label>
            <input defaultValue={editPost.title} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-sm bg-white" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Slug</label>
              <div className="flex items-center text-xs text-wood-400">
                /blog/
                <input defaultValue={editPost.title.toLowerCase().replace(/\s+/g, '-')} className="flex-1 border border-wood-200 rounded-lg px-2 py-1.5 text-xs bg-white ml-1" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Categoria</label>
              <select defaultValue={editPost.category} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white">
                {blogCategories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Autor</label>
              <select defaultValue={editPost.author} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white">
                <option>David</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Imagen de portada</label>
            <div className="border-2 border-dashed border-wood-200 rounded-lg p-6 text-center">
              <Upload size={20} className="mx-auto text-wood-300 mb-2" />
              <p className="text-xs text-wood-400">1200x630px recomendado</p>
              <button className="mt-2 px-3 py-1.5 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors">
                Subir imagen
              </button>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Extracto</label>
            <textarea className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white h-16 resize-none" defaultValue="Guia completa para elegir la tabla perfecta segun tu uso..." />
          </div>
        </Card>

        {/* Editor placeholder */}
        <Card className="p-5">
          <STitle>Contenido</STitle>
          <div className="flex flex-wrap items-center gap-1 p-2 bg-sand-50 rounded-lg border border-wood-100 mb-3">
            {[Bold, Italic, Underline, Heading1, Heading2, Link2, ImageIcon, Video, Quote, List].map((Icon, i) => (
              <button key={i} className="p-1.5 rounded hover:bg-wood-100 transition-colors text-wood-600">
                <Icon size={14} />
              </button>
            ))}
            <div className="w-px h-5 bg-wood-200 mx-1" />
            <button className="px-2 py-1 text-[10px] text-wood-500 hover:bg-wood-100 rounded">Producto relacionado</button>
            <button className="px-2 py-1 text-[10px] text-wood-500 hover:bg-wood-100 rounded">CTA cotizacion</button>
            <button className="px-2 py-1 text-[10px] text-wood-500 hover:bg-wood-100 rounded">Tabla comparativa</button>
          </div>
          <div className="border border-wood-200 rounded-lg p-6 min-h-[200px] text-xs text-wood-600">
            <p>Contenido del articulo aqui...</p>
          </div>
        </Card>

        {/* Tags */}
        <Card className="p-5">
          <STitle>Tags</STitle>
          <div className="flex flex-wrap items-center gap-1.5">
            {editPost.tags.map((tag) => (
              <span key={tag} className="text-[10px] bg-wood-50 text-wood-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                {tag} <X size={8} className="cursor-pointer text-wood-400" />
              </span>
            ))}
            <input className="text-xs border-none outline-none bg-transparent w-24" placeholder="+ agregar tag" />
          </div>
        </Card>

        {/* SEO */}
        <Card className="p-5">
          <STitle>SEO</STitle>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Meta titulo</label>
              <input defaultValue={editPost.title + ' - DavidSon\'s Design Blog'} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
            </div>
            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Meta descripcion</label>
              <textarea className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white h-12 resize-none" />
            </div>
            <button onClick={() => toast.success('SEO generado con IA')} className="text-[10px] text-accent-gold border border-accent-gold/30 rounded-lg px-3 py-1.5 hover:bg-accent-gold/5 transition-colors flex items-center gap-1">
              <Star size={10} /> Generar SEO con IA
            </button>
          </div>
        </Card>

        {/* Related products */}
        <Card className="p-5">
          <STitle>Productos relacionados</STitle>
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="text-[10px] bg-accent-gold/10 text-accent-gold px-2 py-0.5 rounded-full flex items-center gap-1">
              Tabla Parota Med <X size={8} className="cursor-pointer" />
            </span>
            <span className="text-[10px] bg-accent-gold/10 text-accent-gold px-2 py-0.5 rounded-full flex items-center gap-1">
              Set 3 Tablas <X size={8} className="cursor-pointer" />
            </span>
          </div>
          <input className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" placeholder="Buscar y seleccionar productos..." />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-wood-100 flex items-center justify-between">
          <h4 className="text-sm font-medium text-wood-900">Blog / Articulos</h4>
          <button onClick={() => toast.success('Creando nuevo articulo...')} className="px-3 py-1.5 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors flex items-center gap-1.5">
            <Plus size={12} /> Nuevo Articulo
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-50">
                <th className="px-5 py-2">Articulo</th>
                <th className="px-5 py-2">Categoria</th>
                <th className="px-5 py-2">Autor</th>
                <th className="px-5 py-2">Fecha</th>
                <th className="px-5 py-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {mockBlogPosts.map((p) => (
                <tr key={p.id} className="hover:bg-sand-50/50 transition-colors">
                  <td className="px-5 py-2.5">
                    <button onClick={() => setEditingPost(p.id)} className="text-xs font-medium text-wood-900 hover:text-accent-gold transition-colors">
                      {p.title}
                    </button>
                  </td>
                  <td className="px-5 py-2.5"><Badge text={p.category} variant="blue" /></td>
                  <td className="px-5 py-2.5 text-xs text-wood-500">{p.author}</td>
                  <td className="px-5 py-2.5 text-xs text-wood-500">{p.date || '-'}</td>
                  <td className="px-5 py-2.5">
                    <Badge text={p.status === 'published' ? 'Publicado' : 'Borrador'} variant={p.status === 'published' ? 'green' : 'gray'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Blog categories */}
      <Card className="p-5">
        <STitle>Categorias del blog</STitle>
        <div className="flex flex-wrap items-center gap-1.5">
          {blogCategories.map((c) => (
            <span key={c} className="text-[10px] bg-sand-50 text-wood-600 px-2.5 py-1 rounded-full border border-wood-100">
              {c}
            </span>
          ))}
          <button className="text-[10px] text-accent-gold hover:underline flex items-center gap-0.5">
            <Plus size={10} /> Nueva categoria
          </button>
        </div>
      </Card>
    </div>
  );
}

// ===== TAB 5: POPUPS =====
function PopupsTab() {
  const [editingPopup, setEditingPopup] = useState<string | null>(null);

  if (editingPopup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button onClick={() => setEditingPopup(null)} className="text-xs text-wood-500 hover:text-wood-700 transition-colors">Pop-ups</button>
          <ChevronRight size={12} className="text-wood-300" />
          <span className="text-xs font-medium text-wood-900">Editar pop-up</span>
        </div>

        <Card className="p-5 space-y-4">
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Nombre</label>
            <input defaultValue="Bienvenida + 10% descuento" className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
          </div>

          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-2">Tipo</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Modal centrado', 'Banner inferior', 'Slide-in lateral', 'Barra top'].map((t, i) => (
                <label key={t} className={'flex items-center gap-2 p-3 rounded-lg border text-xs cursor-pointer transition-colors ' + (i === 0 ? 'border-accent-gold bg-accent-gold/5 text-accent-gold' : 'border-wood-100 text-wood-600 hover:border-wood-200')}>
                  <input type="radio" name="popup-type" defaultChecked={i === 0} className="text-accent-gold" />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <STitle>Contenido</STitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Titulo</label>
              <input defaultValue="Bienvenido a DavidSon's Design!" className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
            </div>
            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Texto</label>
              <input defaultValue="Obten 10% de descuento en tu primera compra" className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Codigo cupon</label>
              <input defaultValue="BIENVENIDO10" className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white font-mono" />
            </div>
            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Boton CTA</label>
              <input defaultValue="Obtener descuento" className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
            </div>
          </div>
          <div className="space-y-1.5">
            {['Incluir campo de email', 'Mostrar codigo', 'Boton copiar', 'Mostrar "No gracias"'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-xs text-wood-600">
                <input type="checkbox" defaultChecked className="rounded border-wood-300 text-accent-gold" />
                {opt}
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <STitle>Trigger (cuando aparece)</STitle>
          <div className="space-y-1.5">
            {[
              'Primera visita al sitio',
              'Despues de X segundos',
              'Al hacer scroll 50%',
              'Intento de salir (exit intent)',
              'Al agregar al carrito',
              'Cuando el carrito supera $X',
            ].map((t, i) => (
              <label key={t} className="flex items-center gap-2 text-xs text-wood-600">
                <input type="radio" name="popup-trigger" defaultChecked={i === 0} className="text-accent-gold" />
                {t}
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <STitle>Frecuencia</STitle>
          <div className="space-y-1.5">
            {['1 vez por visitante', 'Cada X dias', 'Siempre'].map((f, i) => (
              <label key={f} className="flex items-center gap-2 text-xs text-wood-600">
                <input type="radio" name="popup-freq" defaultChecked={i === 0} className="text-accent-gold" />
                {f}
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <STitle>Mostrar en</STitle>
          <div className="space-y-1.5">
            {['Todas las paginas', 'Solo homepage', 'Solo producto', 'Solo checkout', 'Paginas especificas'].map((p, i) => (
              <label key={p} className="flex items-center gap-2 text-xs text-wood-600">
                <input type="radio" name="popup-pages" defaultChecked={i === 0} className="text-accent-gold" />
                {p}
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <STitle>Segmentacion</STitle>
          <div className="space-y-1.5">
            {['Todos los visitantes', 'Solo visitantes nuevos (sin cuenta)', 'Solo clientes registrados', 'Solo tier especifico'].map((s, i) => (
              <label key={s} className="flex items-center gap-2 text-xs text-wood-600">
                <input type="radio" name="popup-segment" defaultChecked={i === 0} className="text-accent-gold" />
                {s}
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <STitle>Programacion</STitle>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs text-wood-600">
              <input type="radio" name="popup-schedule" defaultChecked className="text-accent-gold" />
              Activo inmediatamente
            </label>
            <label className="flex items-center gap-2 text-xs text-wood-600">
              <input type="radio" name="popup-schedule" className="text-accent-gold" />
              Desde / hasta fecha
            </label>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] text-wood-400">
            Preview:
            <button className="p-1 rounded hover:bg-wood-50"><Monitor size={14} /></button>
            <button className="p-1 rounded hover:bg-wood-50"><Smartphone size={14} /></button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => { toast.success('Pop-up guardado'); setEditingPopup(null); }} className="px-3 py-1.5 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors">
              Guardar
            </button>
            <button onClick={() => { toast.success('Pop-up activado'); setEditingPopup(null); }} className="px-3 py-1.5 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors">
              Activar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-wood-100 flex items-center justify-between">
          <h4 className="text-sm font-medium text-wood-900">Pop-ups y Avisos</h4>
          <button onClick={() => toast.success('Creando nuevo pop-up...')} className="px-3 py-1.5 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors flex items-center gap-1.5">
            <Plus size={12} /> Nuevo Pop-up
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-50">
                <th className="px-5 py-2">Pop-up</th>
                <th className="px-5 py-2">Trigger</th>
                <th className="px-5 py-2 text-right">Vistas</th>
                <th className="px-5 py-2 text-right">Conv.</th>
                <th className="px-5 py-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {mockPopups.map((p) => (
                <tr key={p.id} className="hover:bg-sand-50/50 transition-colors">
                  <td className="px-5 py-2.5">
                    <button onClick={() => setEditingPopup(p.id)} className="text-xs font-medium text-wood-900 hover:text-accent-gold transition-colors">
                      {p.name}
                    </button>
                  </td>
                  <td className="px-5 py-2.5 text-xs text-wood-500">{p.trigger}</td>
                  <td className="px-5 py-2.5 text-xs text-wood-600 font-mono text-right">{p.views > 0 ? p.views.toLocaleString() : '-'}</td>
                  <td className="px-5 py-2.5 text-xs text-right">
                    {p.conv > 0 ? (
                      <span className={'px-1.5 py-0.5 rounded-full ' + (p.conv >= 8 ? 'bg-green-50 text-green-600' : p.conv >= 4 ? 'bg-amber-50 text-amber-600' : 'bg-wood-50 text-wood-500')}>
                        {p.conv}%
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-5 py-2.5">
                    <Badge
                      text={p.status === 'active' ? 'Activo' : p.status === 'paused' ? 'Pausado' : 'Programado'}
                      variant={p.status === 'active' ? 'green' : p.status === 'paused' ? 'gray' : 'amber'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ===== TAB 6: MEDIA =====
function MediaTab() {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState('all');
  const selected = mockMedia.find((m) => m.id === selectedMedia);

  const folders = ['Productos', 'Blog', 'Banners', 'Paginas', 'Branding', 'Documentos'];
  const filteredMedia = filterType === 'all' ? mockMedia : mockMedia.filter((m) => m.type === filterType);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border border-wood-200 rounded-lg px-2 py-1.5 text-xs bg-white">
            <option value="all">Todos</option>
            <option value="image">Imagenes</option>
            <option value="video">Videos</option>
            <option value="document">Documentos</option>
          </select>
          <div className="flex items-center border border-wood-200 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={'px-2 py-1.5 text-xs ' + (viewMode === 'grid' ? 'bg-accent-gold text-white' : 'text-wood-500 hover:bg-wood-50')}>Grid</button>
            <button onClick={() => setViewMode('list')} className={'px-2 py-1.5 text-xs ' + (viewMode === 'list' ? 'bg-accent-gold text-white' : 'text-wood-500 hover:bg-wood-50')}>Lista</button>
          </div>
        </div>
        <button onClick={() => toast.success('Subiendo archivos...')} className="px-3 py-1.5 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors flex items-center gap-1.5">
          <Upload size={12} /> Subir archivos
        </button>
      </div>

      {/* Folders */}
      <div className="flex flex-wrap gap-2">
        {folders.map((f) => (
          <button key={f} className="flex items-center gap-1.5 px-3 py-1.5 bg-sand-50 rounded-lg text-xs text-wood-600 hover:bg-sand-100 transition-colors border border-wood-100">
            <FolderOpen size={12} className="text-accent-gold" /> {f}
          </button>
        ))}
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs text-accent-gold hover:underline">
          <Plus size={12} /> Carpeta
        </button>
      </div>

      <div className="flex gap-6">
        {/* Grid/List */}
        <div className="flex-1">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredMedia.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMedia(m.id)}
                  className={'p-3 rounded-xl border text-left transition-colors ' + (selectedMedia === m.id ? 'border-accent-gold bg-accent-gold/5' : 'border-wood-100 bg-white hover:border-wood-200')}
                >
                  <div className="aspect-square bg-sand-50 rounded-lg mb-2 flex items-center justify-center">
                    {m.type === 'image' ? (
                      <ImageIcon size={24} className="text-wood-300" />
                    ) : m.type === 'video' ? (
                      <Video size={24} className="text-wood-300" />
                    ) : (
                      <FileText size={24} className="text-wood-300" />
                    )}
                  </div>
                  <p className="text-[10px] font-medium text-wood-900 truncate">{m.name}</p>
                  <p className="text-[10px] text-wood-400">{m.size}</p>
                  <p className="text-[10px] text-wood-300">{m.dims}</p>
                </button>
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-50">
                    <th className="px-4 py-2">Archivo</th>
                    <th className="px-4 py-2">Carpeta</th>
                    <th className="px-4 py-2 text-right">Tamano</th>
                    <th className="px-4 py-2">Dims</th>
                    <th className="px-4 py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-50">
                  {filteredMedia.map((m) => (
                    <tr key={m.id} onClick={() => setSelectedMedia(m.id)} className={'hover:bg-sand-50/50 transition-colors cursor-pointer ' + (selectedMedia === m.id ? 'bg-accent-gold/5' : '')}>
                      <td className="px-4 py-2.5 text-xs font-medium text-wood-900">{m.name}</td>
                      <td className="px-4 py-2.5 text-xs text-wood-500">{m.folder}</td>
                      <td className="px-4 py-2.5 text-xs text-wood-500 text-right">{m.size}</td>
                      <td className="px-4 py-2.5 text-xs text-wood-500">{m.dims}</td>
                      <td className="px-4 py-2.5 text-xs text-wood-500">{m.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-72 shrink-0 hidden lg:block"
          >
            <Card className="p-4 space-y-3 sticky top-4">
              <div className="aspect-square bg-sand-50 rounded-lg flex items-center justify-center">
                {selected.type === 'image' ? <ImageIcon size={40} className="text-wood-300" /> : selected.type === 'video' ? <Video size={40} className="text-wood-300" /> : <FileText size={40} className="text-wood-300" />}
              </div>
              <div>
                <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-0.5">Nombre</label>
                <input defaultValue={selected.name} className="w-full border border-wood-200 rounded px-2 py-1 text-xs bg-white" />
              </div>
              <div>
                <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-0.5">Alt text</label>
                <input className="w-full border border-wood-200 rounded px-2 py-1 text-xs bg-white" placeholder="Descripcion para accesibilidad" />
              </div>
              <div className="text-[10px] text-wood-500 space-y-0.5">
                <p>Dimensiones: {selected.dims}</p>
                <p>Tamano: {selected.size}</p>
                <p>Subido: {selected.date}</p>
                <p>Carpeta: {selected.folder}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => toast.success('URL copiada')} className="px-2 py-1 text-[10px] border border-wood-200 rounded hover:bg-wood-50 transition-colors flex items-center gap-1">
                  <Copy size={10} /> Copiar URL
                </button>
                <button className="px-2 py-1 text-[10px] border border-wood-200 rounded hover:bg-wood-50 transition-colors flex items-center gap-1">
                  <Download size={10} /> Descargar
                </button>
                <button className="px-2 py-1 text-[10px] border border-red-200 text-red-500 rounded hover:bg-red-50 transition-colors flex items-center gap-1">
                  <Trash2 size={10} /> Eliminar
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Storage bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-xs text-wood-600 mb-2">
          <span>Almacenamiento</span>
          <span>142 MB / 1 GB usado</span>
        </div>
        <div className="w-full bg-wood-50 rounded-full h-2.5">
          <div className="bg-accent-gold h-2.5 rounded-full" style={{ width: '14.2%' }} />
        </div>
        <p className="text-[10px] text-wood-400 mt-1">14.2% utilizado</p>
      </Card>
    </div>
  );
}

// ===== TAB 7: TEXTS =====
function TextsTab() {
  const [searchText, setSearchText] = useState('');
  const filtered = mockTexts.filter((t) =>
    t.key.toLowerCase().includes(searchText.toLowerCase()) ||
    t.value.toLowerCase().includes(searchText.toLowerCase()) ||
    t.section.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-wood-600">Idioma:</label>
          <select className="border border-wood-200 rounded-lg px-2 py-1.5 text-xs bg-white">
            <option>Espanol (MX)</option>
            <option>English (US)</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => toast.success('Exportando JSON...')} className="px-3 py-1.5 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors flex items-center gap-1">
            <Download size={12} /> Exportar JSON
          </button>
          <button onClick={() => toast.success('Importar JSON...')} className="px-3 py-1.5 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors flex items-center gap-1">
            <Upload size={12} /> Importar JSON
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-wood-400" />
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full border border-wood-200 rounded-lg pl-9 pr-3 py-2 text-xs bg-white"
          placeholder="Buscar texto..."
        />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-50">
              <th className="px-5 py-2 w-24">Seccion</th>
              <th className="px-5 py-2 w-56">Clave</th>
              <th className="px-5 py-2">Texto actual</th>
              <th className="px-5 py-2 w-16 text-right">Acc.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wood-50">
            {filtered.map((t) => (
              <tr key={t.key} className="hover:bg-sand-50/50 transition-colors group">
                <td className="px-5 py-2.5"><Badge text={t.section} variant="blue" /></td>
                <td className="px-5 py-2.5 text-xs text-wood-500 font-mono">{t.key}</td>
                <td className="px-5 py-2.5">
                  <input
                    defaultValue={t.value}
                    className="w-full bg-transparent text-xs text-wood-900 border border-transparent hover:border-wood-200 focus:border-accent-gold rounded px-2 py-1 transition-colors outline-none"
                  />
                </td>
                <td className="px-5 py-2.5 text-right">
                  <button className="p-1 rounded hover:bg-wood-50 text-wood-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="flex items-center gap-2">
        <button onClick={() => toast.success('Texto nuevo agregado')} className="px-3 py-1.5 text-xs text-accent-gold border border-accent-gold/30 rounded-lg hover:bg-accent-gold/5 transition-colors flex items-center gap-1">
          <Plus size={12} /> Agregar texto nuevo
        </button>
        <p className="text-[10px] text-wood-400 ml-2">Cada tenant podra personalizar estos textos para su marca.</p>
      </div>
    </div>
  );
}

// ===== TAB 8: SEO GLOBAL =====
function SeoTab() {
  return (
    <div className="space-y-6">
      {/* Meta defaults */}
      <Card className="p-5">
        <STitle>Meta por defecto</STitle>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Titulo del sitio</label>
            <input defaultValue="DavidSon's Design - Muebles Artesanales de Madera" className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Separador de titulo</label>
              <select className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white">
                <option>|</option>
                <option>-</option>
                <option>&mdash;</option>
                <option>&bull;</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Meta descripcion por defecto</label>
            <textarea className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white h-16 resize-none" defaultValue="Taller artesanal en Hermosillo, Sonora. Creamos tablas de cortar, tablas para charcuteria y piezas decorativas en maderas mexicanas premium." />
          </div>
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Imagen OG por defecto</label>
            <button className="px-3 py-1.5 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors flex items-center gap-1">
              <Upload size={12} /> Subir imagen
            </button>
          </div>
        </div>
      </Card>

      {/* Social */}
      <Card className="p-5">
        <STitle>Redes sociales</STitle>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Facebook URL</label>
            <input defaultValue="https://facebook.com/davidsonsdesign" className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
          </div>
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Instagram URL</label>
            <input defaultValue="https://instagram.com/davidsonsdesign" className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
          </div>
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Twitter/X handle</label>
            <input defaultValue="@davidsonsdesign" className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
          </div>
        </div>
      </Card>

      {/* Verification */}
      <Card className="p-5">
        <STitle>Verificacion</STitle>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Google Search Console</label>
            <input placeholder="Meta tag o archivo de verificacion" className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
          </div>
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Bing Webmaster</label>
            <input placeholder="Codigo de verificacion" className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
          </div>
        </div>
      </Card>

      {/* Schema */}
      <Card className="p-5">
        <STitle>Schema / Datos Estructurados</STitle>
        <div className="space-y-2 mb-4">
          {[
            'Generar Schema de Organizacion (LocalBusiness)',
            'Generar Schema de Producto en paginas de producto',
            'Generar Schema de Review (aggregate rating)',
            'Generar Schema de Breadcrumbs',
            'Generar Schema de FAQ en pagina FAQ',
          ].map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-xs text-wood-700">
              <input type="checkbox" defaultChecked className="rounded border-wood-300 text-accent-gold" />
              {opt}
            </label>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Nombre negocio</label>
            <input defaultValue="DavidSon's Design" className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
          </div>
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Direccion</label>
            <input defaultValue="Hermosillo, Sonora, Mexico" className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
          </div>
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Telefono</label>
            <input defaultValue="662-361-0742" className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
          </div>
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Email</label>
            <input defaultValue="contacto@davidsonsdesign.com" className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
          </div>
        </div>
      </Card>

      {/* Sitemap & Robots */}
      <Card className="p-5">
        <STitle>Sitemap y Robots</STitle>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs text-wood-700">
            <input type="checkbox" defaultChecked className="rounded border-wood-300 text-accent-gold" />
            Generar sitemap.xml automaticamente
          </label>
          <div>
            <p className="text-[10px] text-wood-400 uppercase tracking-wider mb-1">Sitemap incluye:</p>
            <div className="flex flex-wrap gap-3">
              {['Paginas', 'Productos', 'Categorias', 'Blog', 'Media'].map((s, i) => (
                <label key={s} className="flex items-center gap-1.5 text-xs text-wood-600">
                  <input type="checkbox" defaultChecked={i < 4} className="rounded border-wood-300 text-accent-gold" />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">robots.txt personalizado</label>
            <textarea
              className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white h-20 font-mono resize-none"
              defaultValue={'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\nSitemap: https://davidsonsdesign.com/sitemap.xml'}
            />
          </div>
        </div>
      </Card>

      {/* Redirects */}
      <Card className="p-5">
        <STitle>Redirecciones</STitle>
        <div className="space-y-2 mb-3">
          {mockRedirects.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 bg-sand-50 rounded-lg text-xs">
              <span className="font-mono text-wood-600 flex-1">{r.from}</span>
              <ChevronRight size={12} className="text-wood-300" />
              <span className="font-mono text-wood-900 flex-1">{r.to}</span>
              <Badge text={r.type} variant="blue" />
              <button className="p-1 rounded hover:bg-red-50 text-red-400"><X size={12} /></button>
            </div>
          ))}
        </div>
        <button onClick={() => toast.success('Redireccion agregada')} className="text-xs text-accent-gold hover:underline flex items-center gap-1">
          <Plus size={12} /> Agregar redireccion
        </button>
      </Card>

      <button
        onClick={() => toast.success('Configuracion SEO guardada')}
        className="px-4 py-2 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors flex items-center gap-1.5"
      >
        <Save size={12} /> Guardar configuracion SEO
      </button>
    </div>
  );
}

// ===== MAIN COMPONENT =====
export const CmsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CmsTab>('pages');

  const tabContent: Record<CmsTab, React.ReactNode> = {
    pages: <PagesTab />,
    menus: <MenusTab />,
    homepage: <HomepageTab />,
    blog: <BlogTab />,
    popups: <PopupsTab />,
    media: <MediaTab />,
    texts: <TextsTab />,
    seo: <SeoTab />,
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
