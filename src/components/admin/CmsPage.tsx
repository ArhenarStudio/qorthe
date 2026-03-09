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
import { useThemeComponents } from '@/src/admin/hooks/useThemeComponents';

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
  return <div className={'bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm ' + className}>{children}</div>;
}

function STitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-medium text-[var(--admin-text)] uppercase tracking-wider border-b border-[var(--admin-border)] pb-2 mb-4">{children}</h4>;
}

function Badge({ text, variant = 'green' }: { text: string; variant?: 'green' | 'gray' | 'amber' | 'blue' }) {
  const cls: Record<string, string> = {
    green: 'bg-green-50 text-green-600',
    gray: 'bg-[var(--admin-surface2)] text-[var(--admin-text-secondary)]',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
  };
  return <span className={'text-[10px] font-medium px-2 py-0.5 rounded-full ' + cls[variant]}>{text}</span>;
}

// ===== LEGACY DATA (unused — tabs replaced with ComingSoonTab, cleanup pending) =====




const blogCategories = ['Guias', 'Maderas', 'Cuidado', 'Corporate', 'Lifestyle'];





// ===== TAB 1: PAGES =====
function PagesTabLive() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [sectionModal, setSectionModal] = useState<{ idx: number; isNew: boolean } | null>(null);
  const [sectionForm, setSectionForm] = useState({ id: '', label: '', content: '' });
  const [deleteModal, setDeleteModal] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);

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
    const res = await fetch('/api/admin/cms', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'page', id: editingPage.id, title: editingPage.title, slug: editingPage.slug, template: editingPage.template, last_updated: editingPage.last_updated, status: editingPage.status, sections: editingPage.sections }) });
    if (res.ok) { toast.success('Página guardada'); setDirty(false); fetchPages(); }
    else toast.error('Error al guardar');
  };

  const updatePage = (updates: Record<string, any>) => { setEditingPage((p: any) => ({ ...p, ...updates })); setDirty(true); };
  const updateSection = (idx: number, updates: Record<string, any>) => {
    const sections = [...(editingPage?.sections || [])];
    sections[idx] = { ...sections[idx], ...updates };
    updatePage({ sections });
  };

  const openSectionEditor = (idx: number, isNew: boolean) => {
    if (isNew) setSectionForm({ id: '', label: '', content: '' });
    else { const sec = editingPage?.sections?.[idx]; if (sec) setSectionForm({ id: sec.id || '', label: sec.label || '', content: sec.content || '' }); }
    setSectionModal({ idx, isNew });
  };

  const saveSectionModal = () => {
    if (!editingPage || !sectionModal) return;
    const sections = [...(editingPage.sections || [])];
    const entry = { id: sectionForm.id || sectionForm.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), label: sectionForm.label, content: sectionForm.content };
    if (sectionModal.isNew) { sections.push(entry); setSelectedSection(sections.length - 1); }
    else { sections[sectionModal.idx] = entry; setSelectedSection(sectionModal.idx); }
    updatePage({ sections });
    setSectionModal(null);
  };

  const confirmDeleteSection = () => {
    if (deleteModal === null || !editingPage) return;
    const sections = [...(editingPage.sections || [])].filter((_, i) => i !== deleteModal);
    updatePage({ sections });
    setDeleteModal(null);
    setSelectedSection(null);
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    const s = [...(editingPage?.sections || [])];
    const target = idx + dir;
    if (target < 0 || target >= s.length) return;
    [s[idx], s[target]] = [s[target], s[idx]];
    updatePage({ sections: s });
    setSelectedSection(target);
  };

  // Render formatted content for preview
  const renderContent = (text: string) => {
    if (!text) return null;
    return text.split('\n\n').map((block, bi) => {
      const trimmed = block.trim();
      if (!trimmed) return null;
      const allLines = trimmed.split('\n').filter(l => l.trim());
      const isAllList = allLines.length > 0 && allLines.every(l => l.trim().startsWith('- '));
      if (isAllList) return <ul key={bi} className="list-disc pl-5 space-y-1 mb-3">{allLines.map((l, li) => <li key={li} className="text-[var(--admin-text)] text-[11px] font-light">{l.trim().substring(2)}</li>)}</ul>;
      return <p key={bi} className="text-[var(--admin-text)] text-[11px] font-light leading-relaxed mb-3">{trimmed}</p>;
    });
  };

  // ═══ EDITOR MODE — Split screen: sections list LEFT + live preview RIGHT ═══
  if (editingPage) {
    const isLegal = editingPage.template === 'legal_sidebar';
    const sections = editingPage.sections || [];

    return (
      <div className="space-y-4">
        {/* Section Editor Modal */}
        {sectionModal && (
          <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" onClick={() => setSectionModal(null)} />
            <div className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[85vh] overflow-y-auto bg-[var(--admin-surface)] rounded-2xl shadow-2xl z-[201]">
              <div className="sticky top-0 bg-[var(--admin-surface)] border-b border-[var(--admin-border)] px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                <div><h4 className="font-serif text-lg text-[var(--admin-text)]">{sectionModal.isNew ? 'Nueva Sección' : 'Editar Sección'}</h4></div>
                <button onClick={() => setSectionModal(null)} className="p-1.5 hover:bg-[var(--admin-surface2)] rounded-lg"><X size={16} /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-bold uppercase text-[var(--admin-text-secondary)] mb-1.5 block">Título en sidebar</label>
                    <input value={sectionForm.label} onChange={e => setSectionForm(f => ({ ...f, label: e.target.value, ...(sectionModal.isNew ? { id: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') } : {}) }))} className="w-full px-3 py-2.5 border border-[var(--admin-border)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none" placeholder="Ej: 1. Objeto" /></div>
                  <div><label className="text-[10px] font-bold uppercase text-[var(--admin-text-secondary)] mb-1.5 block">ID anchor</label>
                    <input value={sectionForm.id} onChange={e => setSectionForm(f => ({ ...f, id: e.target.value }))} className="w-full px-3 py-2.5 border border-[var(--admin-border)] rounded-xl text-sm font-mono focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none" placeholder="objeto" /></div>
                </div>
                <div><label className="text-[10px] font-bold uppercase text-[var(--admin-text-secondary)] mb-1.5 block">Contenido</label>
                  <textarea value={sectionForm.content} onChange={e => setSectionForm(f => ({ ...f, content: e.target.value }))} rows={12} className="w-full px-4 py-3 border border-[var(--admin-border)] rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] outline-none resize-y" placeholder={"Escribe el contenido.\n\nUsa línea vacía para separar párrafos.\n\n- Usa guiones para listas"} /></div>
                {sectionForm.content && (
                  <div><label className="text-[10px] font-bold uppercase text-[var(--admin-text-secondary)] mb-1.5 block">Vista previa</label>
                    <div className="p-4 bg-[var(--admin-surface2)] rounded-xl border border-[var(--admin-border)] max-h-48 overflow-y-auto">
                      <h4 className="font-serif text-base text-[var(--admin-text)] mb-3">{sectionForm.label || 'Sin título'}</h4>
                      {renderContent(sectionForm.content)}
                    </div></div>
                )}
              </div>
              <div className="sticky bottom-0 bg-[var(--admin-surface)] border-t border-[var(--admin-border)] px-6 py-4 flex justify-end gap-2 rounded-b-2xl">
                <button onClick={() => setSectionModal(null)} className="px-4 py-2.5 border border-[var(--admin-border)] rounded-xl text-xs font-medium hover:bg-[var(--admin-surface2)]">Cancelar</button>
                <button onClick={saveSectionModal} disabled={!sectionForm.label} className="px-5 py-2.5 bg-[var(--admin-accent)] text-white rounded-xl text-xs font-medium hover:bg-[var(--admin-accent)]/90 disabled:opacity-40 flex items-center gap-1.5"><Save size={12} /> {sectionModal.isNew ? 'Agregar' : 'Guardar'}</button>
              </div>
            </div>
          </>
        )}

        {/* Delete Modal */}
        {deleteModal !== null && (
          <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" onClick={() => setDeleteModal(null)} />
            <div className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-[var(--admin-surface)] rounded-2xl shadow-2xl z-[201] p-6">
              <h4 className="font-serif text-lg text-[var(--admin-text)] mb-2">Eliminar sección</h4>
              <p className="text-sm text-[var(--admin-text-secondary)] mb-6">¿Eliminar &ldquo;{editingPage?.sections?.[deleteModal]?.label}&rdquo;?</p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 border border-[var(--admin-border)] rounded-xl text-xs font-medium hover:bg-[var(--admin-surface2)]">Cancelar</button>
                <button onClick={confirmDeleteSection} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-medium hover:bg-red-700">Eliminar</button>
              </div>
            </div>
          </>
        )}

        {/* Top bar */}
        <div className="flex items-center gap-3 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-3">
          <button onClick={() => { if (dirty && !confirm('¿Salir sin guardar?')) return; setEditingPage(null); setDirty(false); }} className="p-1.5 hover:bg-[var(--admin-surface2)] rounded-lg"><ArrowLeft size={16} className="text-[var(--admin-text-secondary)]" /></button>
          <div className="flex-1 min-w-0">
            <input value={editingPage.title} onChange={e => updatePage({ title: e.target.value })} className="text-sm font-medium text-[var(--admin-text)] bg-transparent border-b border-transparent hover:border-[var(--admin-border)] focus:border-[var(--admin-accent)] outline-none w-full" />
            <p className="text-[10px] text-[var(--admin-muted)] font-mono">{editingPage.slug} · {TEMPLATES.find(t => t.id === editingPage.template)?.label}</p>
          </div>
          <select value={editingPage.template} onChange={e => updatePage({ template: e.target.value })} className="text-[10px] border border-[var(--admin-border)] rounded-lg px-2 py-1 bg-[var(--admin-surface)]">
            {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
          </select>
          <a href={editingPage.slug} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-[var(--admin-surface2)] rounded-lg text-[var(--admin-muted)]"><ExternalLink size={14} /></a>
          <button onClick={handleSavePage} disabled={!dirty} className={"px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 " + (dirty ? "bg-[var(--admin-accent)] text-white hover:bg-[var(--admin-accent)]/90" : "bg-[var(--admin-surface2)] text-[var(--admin-muted)] cursor-default")}><Save size={12} /> Guardar</button>
        </div>

        {/* Split screen: sections editor + live preview */}
        {isLegal && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: '70vh' }}>
            {/* LEFT — Sections list */}
            <div className="border border-[var(--admin-border)] rounded-xl bg-[var(--admin-surface)] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface2)]/50 flex items-center justify-between shrink-0">
                <div><p className="text-xs font-medium text-[var(--admin-text)]">Secciones</p><p className="text-[9px] text-[var(--admin-muted)]">{sections.length} secciones · Clic para previsualizar</p></div>
                <button onClick={() => openSectionEditor(sections.length, true)} className="px-2.5 py-1 bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] rounded-lg text-[10px] font-medium hover:bg-[var(--admin-accent)]/20 flex items-center gap-1"><Plus size={10} /> Agregar</button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sections.map((sec: any, idx: number) => (
                  <div key={sec.id || idx} onClick={() => setSelectedSection(idx)} className={"flex items-center gap-2 px-4 py-3 border-b border-[var(--admin-border)] cursor-pointer transition-colors group " + (selectedSection === idx ? "bg-[var(--admin-accent)]/5 border-l-2 border-l-accent-gold" : "hover:bg-[var(--admin-surface2)]/50 border-l-2 border-l-transparent")}>
                    <div className="flex flex-col gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); moveSection(idx, -1); }} disabled={idx === 0} className="p-0.5 text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)] disabled:opacity-20"><ChevronDown size={9} className="rotate-180" /></button>
                      <button onClick={e => { e.stopPropagation(); moveSection(idx, 1); }} disabled={idx === sections.length - 1} className="p-0.5 text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)] disabled:opacity-20"><ChevronDown size={9} /></button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={"text-xs font-medium truncate " + (selectedSection === idx ? "text-[var(--admin-accent)]" : "text-[var(--admin-text)]")}>{sec.label}</p>
                      <p className="text-[9px] text-[var(--admin-muted)] truncate">{(sec.content || '').substring(0, 60)}...</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); openSectionEditor(idx, false); }} className="p-1 text-[var(--admin-muted)] hover:text-[var(--admin-accent)] rounded" title="Editar"><Edit3 size={12} /></button>
                      <button onClick={e => { e.stopPropagation(); setDeleteModal(idx); }} className="p-1 text-[var(--admin-muted)] hover:text-red-600 rounded" title="Eliminar"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Live preview */}
            <div className="border border-[var(--admin-border)] rounded-xl bg-[var(--admin-surface2)] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] shrink-0">
                <p className="text-xs font-medium text-[var(--admin-text)]">Vista previa en vivo</p>
                <p className="text-[9px] text-[var(--admin-muted)]">Los cambios se reflejan al instante</p>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {/* Simulate LegalLayout preview */}
                <div className="bg-[var(--admin-surface)] rounded-xl shadow-sm border border-[var(--admin-border)] overflow-hidden" style={{ minHeight: '400px' }}>
                  <div className="grid grid-cols-12 gap-0">
                    {/* Sidebar preview */}
                    <div className="col-span-4 bg-[var(--admin-surface2)]/50 border-r border-[var(--admin-border)] p-5">
                      <h2 className="font-serif text-sm text-[var(--admin-text)] mb-2 leading-tight">{editingPage.title}</h2>
                      <div className="h-0.5 w-10 bg-wood-200 mb-2" />
                      <p className="text-[8px] text-[var(--admin-muted)] font-mono uppercase mb-4">{editingPage.last_updated}</p>
                      <nav className="space-y-0.5 border-l border-[var(--admin-border)] pl-3">
                        <span className="text-[7px] uppercase tracking-widest text-[var(--admin-muted)] mb-2 block">Contenido</span>
                        {sections.map((sec: any, i: number) => (
                          <button key={i} onClick={() => setSelectedSection(i)} className={"block w-full text-left py-0.5 text-[9px] transition-colors border-l -ml-[13px] pl-3 " + (selectedSection === i ? "border-wood-900 text-[var(--admin-text)] font-medium" : "border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)]")}>{sec.label}</button>
                        ))}
                      </nav>
                    </div>
                    {/* Content preview */}
                    <div className="col-span-8 p-5">
                      {selectedSection !== null && sections[selectedSection] ? (
                        <div>
                          <h3 className="font-serif text-base text-[var(--admin-text)] mb-3">{sections[selectedSection].label}</h3>
                          {renderContent(sections[selectedSection].content)}
                        </div>
                      ) : sections.length > 0 ? (
                        <div className="space-y-8">
                          {sections.map((sec: any, i: number) => (
                            <div key={i} className={"scroll-mt-4 " + (selectedSection === i ? "ring-2 ring-[var(--admin-accent)]/20 rounded-lg p-3 -m-3" : "")}>
                              <h3 className="font-serif text-base text-[var(--admin-text)] mb-3">{sec.label}</h3>
                              {renderContent(sec.content)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 text-[var(--admin-muted)]">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Sin secciones</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Non-legal pages: simple info */}
        {!isLegal && (
          <Card className="p-8 text-center">
            <p className="text-sm text-[var(--admin-text-secondary)]">Editor visual disponible para plantilla "Legal (sidebar)".</p>
            <p className="text-xs text-[var(--admin-muted)] mt-1">Otras plantillas próximamente.</p>
          </Card>
        )}
      </div>
    );
  }

  // ═══ PAGE LIST ═══
  const editablePages = pages.filter(p => p.is_editable);
  const systemPages = pages.filter(p => !p.is_editable);
  if (loading) return <Card className="p-12 text-center text-[var(--admin-muted)]">Cargando páginas...</Card>;

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--admin-text-secondary)]">{pages.length} páginas ({editablePages.length} editables)</p>
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface2)]/50"><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-secondary)]">Páginas Editables</p></div>
        {editablePages.map(p => (
          <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--admin-border)] hover:bg-[var(--admin-surface2)]/30 transition-colors cursor-pointer group" onClick={() => { setEditingPage({ ...p }); setSelectedSection(null); setDirty(false); }}>
            <div className="w-8 h-8 bg-[var(--admin-surface2)] rounded-lg flex items-center justify-center text-xs text-[var(--admin-text-secondary)] shrink-0">{TEMPLATES.find(t => t.id === p.template)?.icon || '?'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--admin-text)] group-hover:text-[var(--admin-accent)] transition-colors">{p.title}</p>
              <p className="text-[10px] text-[var(--admin-muted)] font-mono">{p.slug} · {(p.sections || []).length} secciones</p>
            </div>
            <Badge text={TEMPLATES.find(t => t.id === p.template)?.label || p.template} variant="blue" />
            <Badge text={p.status === 'published' ? 'Publicada' : 'Borrador'} variant={p.status === 'published' ? 'green' : 'amber'} />
            <ChevronRight size={14} className="text-[var(--admin-muted)] group-hover:text-[var(--admin-accent)] transition-colors" />
          </div>
        ))}
      </Card>
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface2)]/50"><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-secondary)]">Páginas del Sistema</p></div>
        {systemPages.map(p => (
          <div key={p.id} className="flex items-center gap-3 px-5 py-2.5 border-b border-[var(--admin-border)] opacity-60">
            <Settings2 size={14} className="text-[var(--admin-muted)] shrink-0" />
            <p className="text-xs text-[var(--admin-text-secondary)] flex-1">{p.title}</p>
            <p className="text-[10px] text-[var(--admin-muted)] font-mono">{p.slug}</p>
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

  if (loading) return <Card className="p-12 text-center text-[var(--admin-muted)]">Cargando menús...</Card>;

  return (
    <div className="space-y-6">
      {/* Edit Modal */}
      {editModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" onClick={() => setEditModal(null)} />
          <div className="fixed inset-0 m-auto w-full max-w-md h-fit bg-[var(--admin-surface)] rounded-2xl shadow-2xl z-[201] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--admin-border)] flex items-center justify-between">
              <h4 className="font-serif text-lg text-[var(--admin-text)]">Editar Enlace</h4>
              <button onClick={() => setEditModal(null)} className="p-1.5 hover:bg-[var(--admin-surface2)] rounded-lg"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-[10px] font-bold uppercase text-[var(--admin-text-secondary)] mb-1 block">Texto del enlace</label>
                <input value={editModal.item.label} onChange={e => setEditModal(m => m ? { ...m, item: { ...m.item, label: e.target.value } } : null)} className="w-full px-3 py-2.5 border border-[var(--admin-border)] rounded-lg text-sm" placeholder="Ej: Sobre Nosotros" /></div>
              <div><label className="text-[10px] font-bold uppercase text-[var(--admin-text-secondary)] mb-1 block">URL destino</label>
                <input value={editModal.item.url} onChange={e => setEditModal(m => m ? { ...m, item: { ...m.item, url: e.target.value } } : null)} className="w-full px-3 py-2.5 border border-[var(--admin-border)] rounded-lg text-sm font-mono" placeholder="/about" /></div>
              <div className="flex items-center justify-between p-3 bg-[var(--admin-surface2)] rounded-lg">
                <div><p className="text-xs font-medium text-[var(--admin-text)]">Visible</p><p className="text-[10px] text-[var(--admin-muted)]">Mostrar en el menú</p></div>
                <button onClick={() => setEditModal(m => m ? { ...m, item: { ...m.item, is_visible: !m.item.is_visible } } : null)} className={"w-9 h-5 rounded-full transition-colors" + (editModal.item.is_visible ? "bg-green-500" : "bg-wood-200")}>
                  <div className={"w-4 h-4 bg-[var(--admin-surface)] rounded-full shadow transition-transform" + (editModal.item.is_visible ? "translate-x-4" : "translate-x-0.5")} /></button>
              </div>
              <div className="flex items-center justify-between p-3 bg-[var(--admin-surface2)] rounded-lg">
                <div><p className="text-xs font-medium text-[var(--admin-text)]">Abrir en nueva pestaña</p></div>
                <button onClick={() => setEditModal(m => m ? { ...m, item: { ...m.item, open_new_tab: !m.item.open_new_tab } } : null)} className={"w-9 h-5 rounded-full transition-colors" + (editModal.item.open_new_tab ? "bg-green-500" : "bg-wood-200")}>
                  <div className={"w-4 h-4 bg-[var(--admin-surface)] rounded-full shadow transition-transform" + (editModal.item.open_new_tab ? "translate-x-4" : "translate-x-0.5")} /></button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[var(--admin-border)] flex justify-end gap-2">
              <button onClick={() => setEditModal(null)} className="px-4 py-2 border border-[var(--admin-border)] rounded-lg text-xs font-medium hover:bg-[var(--admin-surface2)]">Cancelar</button>
              <button onClick={saveEditModal} className="px-4 py-2 bg-[var(--admin-accent)] text-white rounded-lg text-xs font-medium hover:bg-[var(--admin-accent)]/90 flex items-center gap-1"><Save size={12} /> Guardar</button>
            </div>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" onClick={() => setDeleteModal(null)} />
          <div className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-[var(--admin-surface)] rounded-2xl shadow-2xl z-[201] p-6">
            <h4 className="font-serif text-lg text-[var(--admin-text)] mb-3">Eliminar Enlace</h4>
            <p className="text-sm text-[var(--admin-text-secondary)] mb-1">¿Eliminar <strong>"{deleteModal.item.label}"</strong> del menú?</p>
            <p className="text-xs text-[var(--admin-muted)] mb-6">Recuerda guardar el menú para aplicar el cambio.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-2 border border-[var(--admin-border)] rounded-lg text-xs font-medium hover:bg-[var(--admin-surface2)]">Cancelar</button>
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
              <div key={item.id || idx} className={"flex items-center gap-2 p-2.5 rounded-lg transition-colors group" + (item.is_visible ? "bg-[var(--admin-surface2)] hover:bg-[var(--admin-surface2)]" : "bg-[var(--admin-surface2)] opacity-60")}>
                <GripVertical size={14} className="text-[var(--admin-muted)] shrink-0 cursor-grab" />
                <div className="flex-1 min-w-0">
                  <p className={"text-xs font-medium" + (item.is_visible ? "text-[var(--admin-text)]" : "text-[var(--admin-muted)] line-through")}>{item.label}</p>
                  <p className="text-[10px] text-[var(--admin-muted)] font-mono">{item.url}</p>
                </div>
                {!item.is_visible && <Badge text="Oculto" variant="gray" />}
                <button onClick={() => toggleVisibility(g.key, idx)} className="p-1.5 rounded-lg hover:bg-[var(--admin-surface2)] text-[var(--admin-muted)] transition-colors" title={item.is_visible ? 'Ocultar' : 'Mostrar'}>
                  {item.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
                <button onClick={() => setEditModal({ group: g.key, idx, item: { ...item } })} className="p-1.5 rounded-lg hover:bg-[var(--admin-surface2)] text-[var(--admin-muted)] hover:text-[var(--admin-accent)] transition-colors" title="Editar">
                  <Edit3 size={13} />
                </button>
                <button onClick={() => setDeleteModal({ group: g.key, idx, item })} className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--admin-muted)] hover:text-red-600 transition-colors" title="Eliminar">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <button onClick={() => addItem(g.key)} className="text-xs text-[var(--admin-accent)] hover:underline flex items-center gap-1"><Plus size={12} /> Agregar enlace</button>
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

  if (loading) return <Card className="p-12 text-center text-[var(--admin-muted)]">Cargando secciones...</Card>;

  return (
    <div className="space-y-4">
      {sections.length === 0 ? (
        <Card className="p-12 text-center">
          <Home size={32} className="mx-auto mb-3 text-[var(--admin-muted)]" />
          <p className="text-sm text-[var(--admin-text-secondary)]">No hay secciones configuradas.</p>
          <p className="text-xs text-[var(--admin-muted)] mt-1">Ejecuta el SQL seed para crear las secciones iniciales del homepage.</p>
        </Card>
      ) : (
        <>
          {sections.map((s, idx) => {
            const Icon = sectionIcons[s.section_type] || Layout;
            return (
              <Card key={s.id || idx} className={`p-5 flex items-center gap-4 ${!s.is_visible ? 'opacity-50' : ''}`}>
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="p-0.5 text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)] disabled:opacity-30"><ChevronRight size={14} className="rotate-[-90deg]" /></button>
                  <button onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1} className="p-0.5 text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)] disabled:opacity-30"><ChevronRight size={14} className="rotate-90" /></button>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[var(--admin-surface2)] flex items-center justify-center">
                  <Icon size={18} className="text-[var(--admin-muted)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--admin-text)]">{s.title || s.section_type}</p>
                  <p className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider">{s.section_type}</p>
                </div>
                <button onClick={() => toggleVisibility(idx)} className={`text-xs px-2 py-1 rounded-full ${s.is_visible ? 'bg-green-50 text-green-600' : 'bg-[var(--admin-surface2)] text-[var(--admin-muted)]'}`}>
                  {s.is_visible ? 'Visible' : 'Oculta'}
                </button>
              </Card>
            );
          })}
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-xs bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent)]/90 disabled:opacity-50 flex items-center gap-1.5">
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
          <h4 className="font-serif text-lg text-[var(--admin-text)]">{editing?.id ? 'Editar Post' : 'Nuevo Post'}</h4>
          <button onClick={() => setEditing(null)} className="text-[var(--admin-muted)] hover:text-[var(--admin-text)]"><X size={18} /></button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><label className="text-[10px] font-bold uppercase text-[var(--admin-text-secondary)] mb-1 block">Título</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))} className="w-full px-3 py-2 border border-[var(--admin-border)] rounded-lg text-sm" /></div>
          <div><label className="text-[10px] font-bold uppercase text-[var(--admin-text-secondary)] mb-1 block">Slug</label><input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full px-3 py-2 border border-[var(--admin-border)] rounded-lg text-sm" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><label className="text-[10px] font-bold uppercase text-[var(--admin-text-secondary)] mb-1 block">Categoría</label><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border border-[var(--admin-border)] rounded-lg text-sm" /></div>
          <div><label className="text-[10px] font-bold uppercase text-[var(--admin-text-secondary)] mb-1 block">Tags (separados por coma)</label><input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="w-full px-3 py-2 border border-[var(--admin-border)] rounded-lg text-sm" /></div>
        </div>
        <div className="mb-4"><label className="text-[10px] font-bold uppercase text-[var(--admin-text-secondary)] mb-1 block">Extracto</label><input value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} className="w-full px-3 py-2 border border-[var(--admin-border)] rounded-lg text-sm" /></div>
        <div className="mb-4"><label className="text-[10px] font-bold uppercase text-[var(--admin-text-secondary)] mb-1 block">Contenido</label><textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={10} className="w-full px-3 py-2 border border-[var(--admin-border)] rounded-lg text-sm font-mono" /></div>
        <div className="flex items-center gap-3">
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="px-3 py-2 border border-[var(--admin-border)] rounded-lg text-sm">
            <option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option>
          </select>
          <button onClick={handleSave} className="px-4 py-2 bg-[var(--admin-accent)] text-white rounded-lg text-sm font-medium hover:bg-[var(--admin-accent)]/90 flex items-center gap-1.5"><Save size={14} /> Guardar</button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-[var(--admin-text-secondary)]">{posts.length} publicaciones</p>
        <button onClick={() => { setForm({ title: '', slug: '', excerpt: '', body: '', status: 'draft', category: '', tags: '' }); setEditing({}); }} className="px-3 py-1.5 bg-[var(--admin-accent)] text-white rounded-lg text-xs font-medium hover:bg-[var(--admin-accent)]/90 flex items-center gap-1.5"><Plus size={12} /> Nuevo Post</button>
      </div>
      {loading ? <Card className="p-8 text-center text-[var(--admin-muted)]">Cargando...</Card> : posts.length === 0 ? (
        <Card className="p-12 text-center"><PenLine className="w-10 h-10 text-[var(--admin-muted)] mx-auto mb-3" /><p className="text-sm text-[var(--admin-text-secondary)] mb-2">Sin publicaciones aún</p><button onClick={() => { setForm({ title: '', slug: '', excerpt: '', body: '', status: 'draft', category: '', tags: '' }); setEditing({}); }} className="text-[var(--admin-accent)] text-sm font-medium hover:underline">Crear primera publicación</button></Card>
      ) : (
        <Card className="divide-y divide-[var(--admin-border)]">
          {posts.map(p => (
            <div key={p.id} className="p-4 flex items-center justify-between hover:bg-[var(--admin-surface2)]/50 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--admin-text)] truncate">{p.title}</p>
                <p className="text-[10px] text-[var(--admin-muted)] mt-0.5">{p.slug} · {p.category || 'Sin categoría'} · {new Date(p.created_at).toLocaleDateString('es-MX')}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Badge text={p.status === 'published' ? 'Publicado' : p.status === 'archived' ? 'Archivado' : 'Borrador'} variant={p.status === 'published' ? 'green' : p.status === 'archived' ? 'gray' : 'amber'} />
                <button onClick={() => { setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt || '', body: p.body || '', status: p.status, category: p.category || '', tags: (p.tags || []).join(', ') }); setEditing(p); }} className="p-1.5 text-[var(--admin-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface2)] rounded-lg"><Edit3 size={14} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 text-[var(--admin-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
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
        <p className="text-sm text-[var(--admin-text-secondary)]">{popups.length} pop-ups configurados</p>
        <button onClick={handleCreate} className="px-3 py-1.5 bg-[var(--admin-accent)] text-white rounded-lg text-xs font-medium hover:bg-[var(--admin-accent)]/90 flex items-center gap-1.5"><Plus size={12} /> Nuevo Pop-up</button>
      </div>
      {loading ? <Card className="p-8 text-center text-[var(--admin-muted)]">Cargando...</Card> : popups.length === 0 ? (
        <Card className="p-12 text-center"><MessageSquare className="w-10 h-10 text-[var(--admin-muted)] mx-auto mb-3" /><p className="text-sm text-[var(--admin-text-secondary)]">Sin pop-ups configurados</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popups.map(p => (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div><p className="text-sm font-medium text-[var(--admin-text)]">{p.name}</p><p className="text-[10px] text-[var(--admin-muted)] mt-0.5">{p.type} · trigger: {p.trigger_type} ({p.trigger_value})</p></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggle(p)} className={`w-9 h-5 rounded-full transition-colors ${p.is_active ? 'bg-green-500' : 'bg-wood-200'}`}><div className={`w-4 h-4 bg-[var(--admin-surface)] rounded-full transition-transform ${p.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1 text-[var(--admin-muted)] hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[var(--admin-muted)]">
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
        <p className="text-sm text-[var(--admin-text-secondary)]">{files.length} archivos</p>
        <p className="text-[10px] text-[var(--admin-muted)]">Subir archivos desde Supabase Storage Dashboard</p>
      </div>
      {loading ? <Card className="p-8 text-center text-[var(--admin-muted)]">Cargando...</Card> : files.length === 0 ? (
        <Card className="p-12 text-center"><ImageIcon className="w-10 h-10 text-[var(--admin-muted)] mx-auto mb-3" /><p className="text-sm text-[var(--admin-text-secondary)] mb-2">Sin archivos en media</p><p className="text-[10px] text-[var(--admin-muted)]">Sube archivos desde el dashboard de Supabase Storage (bucket: media)</p></Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {files.map(f => (
            <Card key={f.id} className="overflow-hidden group">
              <div className="aspect-square bg-[var(--admin-surface2)] flex items-center justify-center relative">
                {isImage(f.name) ? <img src={f.url} alt={f.name} className="w-full h-full object-cover" /> : <FileText className="w-8 h-8 text-[var(--admin-muted)]" />}
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors"><ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" /></a>
              </div>
              <div className="p-2"><p className="text-[10px] text-[var(--admin-text)] truncate font-medium">{f.name}</p><p className="text-[9px] text-[var(--admin-muted)]">{fmtSize(f.size)}</p></div>
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
        <p className="text-sm text-[var(--admin-text-secondary)]">{texts.length} textos en {sections.length} secciones</p>
        <button onClick={handleCreate} className="px-3 py-1.5 bg-[var(--admin-accent)] text-white rounded-lg text-xs font-medium hover:bg-[var(--admin-accent)]/90 flex items-center gap-1.5"><Plus size={12} /> Nuevo Texto</button>
      </div>
      {loading ? <Card className="p-8 text-center text-[var(--admin-muted)]">Cargando...</Card> : texts.length === 0 ? (
        <Card className="p-12 text-center"><Type className="w-10 h-10 text-[var(--admin-muted)] mx-auto mb-3" /><p className="text-sm text-[var(--admin-text-secondary)]">Sin textos configurados</p></Card>
      ) : sections.map(section => (
        <Card key={section} className="overflow-hidden">
          <div className="bg-[var(--admin-surface2)] px-4 py-2 border-b border-[var(--admin-border)]"><STitle>{section}</STitle></div>
          <div className="divide-y divide-wood-50">
            {texts.filter(t => t.section === section).map(t => (
              <div key={t.id} className="p-3 flex items-center gap-4 hover:bg-[var(--admin-surface2)]/30 transition-colors">
                <code className="text-[10px] text-[var(--admin-muted)] font-mono w-40 truncate shrink-0">{t.key}</code>
                {editId === t.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input value={editValues.value_es} onChange={e => setEditValues(v => ({ ...v, value_es: e.target.value }))} className="flex-1 px-2 py-1 border border-[var(--admin-border)] rounded text-sm" placeholder="Español" />
                    <input value={editValues.value_en} onChange={e => setEditValues(v => ({ ...v, value_en: e.target.value }))} className="flex-1 px-2 py-1 border border-[var(--admin-border)] rounded text-sm" placeholder="English" />
                    <button onClick={() => handleSave(t.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={16} /></button>
                    <button onClick={() => setEditId(null)} className="p-1 text-[var(--admin-muted)] hover:bg-[var(--admin-surface2)] rounded"><X size={16} /></button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-4 min-w-0">
                    <span className="text-sm text-[var(--admin-text)] truncate flex-1">{t.value_es || '—'}</span>
                    <span className="text-sm text-[var(--admin-muted)] truncate flex-1">{t.value_en || '—'}</span>
                    <button onClick={() => { setEditId(t.id); setEditValues({ value_es: t.value_es || '', value_en: t.value_en || '' }); }} className="p-1 text-[var(--admin-muted)] hover:text-[var(--admin-text)]"><Edit3 size={14} /></button>
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

  if (loading) return <Card className="p-8 text-center text-[var(--admin-muted)]">Cargando...</Card>;

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
        <h4 className="font-serif text-lg text-[var(--admin-text)] mb-4 flex items-center gap-2"><Search size={18} className="text-[var(--admin-accent)]" /> SEO Global</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.label} className="flex items-start gap-3 p-3 bg-[var(--admin-surface2)] rounded-lg">
              <item.icon size={16} className="text-[var(--admin-muted)] mt-0.5 shrink-0" />
              <div><p className="text-[10px] font-bold uppercase text-[var(--admin-text-secondary)]">{item.label}</p><p className="text-sm text-[var(--admin-text)]">{item.value}</p></div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <h4 className="text-sm font-medium text-[var(--admin-text)] mb-3">Archivos SEO</h4>
        <div className="space-y-2">
          {seo && [
            { label: 'Sitemap', url: seo.sitemap },
            { label: 'Robots.txt', url: seo.robots },
          ].map(f => (
            <a key={f.label} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-[var(--admin-surface2)] rounded-lg hover:bg-[var(--admin-surface2)] transition-colors group">
              <span className="text-sm text-[var(--admin-text)]">{f.label}</span>
              <ExternalLink size={14} className="text-[var(--admin-muted)] group-hover:text-[var(--admin-accent)]" />
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
      <div className="w-16 h-16 mx-auto mb-4 bg-[var(--admin-surface2)] rounded-2xl flex items-center justify-center">
        <Settings2 className="w-8 h-8 text-[var(--admin-muted)]" />
      </div>
      <h4 className="text-lg font-serif text-[var(--admin-text)] mb-2">{title}</h4>
      <p className="text-sm text-[var(--admin-text-secondary)] max-w-md mx-auto mb-4">{description}</p>
      <Badge text="Próximamente" variant="amber" />
    </Card>
  );
}

export const CmsPage: React.FC = () => {

  const { Card: TCard, Badge: TBadge, Button: TButton, Table: TTable, StatCard: TStatCard } = useThemeComponents();
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
        <h3 className="font-serif text-lg text-[var(--admin-text)] flex items-center gap-2">
          <FileText size={20} className="text-[var(--admin-accent)]" /> CMS - Contenido del Sitio
        </h3>
        {activeTab === 'pages' && (
          <button onClick={() => toast.success('Creando nueva pagina...')} className="px-3 py-1.5 text-xs bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent)]/90 transition-colors flex items-center gap-1.5">
            <Plus size={12} /> Nueva Pagina
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1 min-w-max border-b border-[var(--admin-border)]">
          {tabItems.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={
                'flex items-center gap-1.5 px-3 py-2.5 text-xs transition-colors border-b-2 whitespace-nowrap ' +
                (activeTab === t.id
                  ? 'border-[var(--admin-accent)] text-[var(--admin-accent)] font-medium'
                  : 'border-transparent text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]')
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
