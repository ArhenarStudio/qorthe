"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Menu, Home, PenLine, MessageSquare, Image, Type, Search,
  Plus, Save, Eye, EyeOff, Trash2, ExternalLink, GripVertical,
  ChevronRight, ArrowLeft, ChevronDown, Edit3, X, Check,
  Globe, Settings2, Clock, Tag, Upload, FolderOpen,
  Star, Layout, ImageIcon, AlertTriangle, BarChart3,
  Package, Users, Zap, Heart, MousePointer, Bell, ChevronUp,
  Monitor, Smartphone, Copy, RefreshCw, BookOpen, Layers,
  AlignLeft, Hash, Link2, Bold, Italic, List, Quote,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminTheme } from '@/src/contexts/AdminThemeContext';
import { Card as TCard, Badge as TBadge, Button as TButton, StatCard as TStatCard, Table as TTable } from '@/src/theme/primitives';

// ===== TYPES =====
type CmsTab = 'pages' | 'menus' | 'homepage' | 'blog' | 'popups' | 'media' | 'texts' | 'seo';
type BlogStep = 1 | 2 | 3 | 4 | 5 | 6;
type SeoStep = 1 | 2 | 3 | 4 | 5 | 6;
type BlockType = 'hero' | 'products_gallery' | 'best_sellers' | 'featured_products' | 'categories' | 'collections' | 'testimonials' | 'newsletter' | 'promo_banner' | 'how_it_works' | 'brand_story' | 'custom_cta';

const tabItems: Array<{ id: CmsTab; label: string; icon: React.ElementType }> = [
  { id: 'pages',    label: 'Páginas',    icon: FileText },
  { id: 'menus',    label: 'Menús',      icon: Menu },
  { id: 'homepage', label: 'Homepage',   icon: Home },
  { id: 'blog',     label: 'Blog',       icon: PenLine },
  { id: 'popups',   label: 'Pop-ups',    icon: MessageSquare },
  { id: 'media',    label: 'Media',      icon: Image },
  { id: 'texts',    label: 'Textos',     icon: Type },
  { id: 'seo',      label: 'SEO Global', icon: Search },
];

// ===== SHARED UI =====
function CmsCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={'bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] shadow-sm ' + className}>
      {children}
    </div>
  );
}

function CmsBadge({ text, variant = 'green' }: { text: string; variant?: 'green' | 'gray' | 'amber' | 'blue' | 'red' }) {
  const cls: Record<string, string> = {
    green: 'bg-[var(--success-subtle)] text-[var(--success)] border border-green-200',
    gray:  'bg-[var(--surface2)] text-[var(--text-secondary)] border border-[var(--border)]',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
    blue:  'bg-[var(--info-subtle)] text-[var(--info)] border border-blue-200',
    red:   'bg-[var(--error-subtle)] text-[var(--error)] border border-red-200',
  };
  return <span className={'text-[10px] font-medium px-2 py-0.5 rounded-[var(--radius-badge)] ' + cls[variant]}>{text}</span>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 block">{children}</label>;
}

function CmsInput({ value, onChange, placeholder = '', className = '', type = 'text', mono = false }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  className?: string; type?: string; mono?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2.5 border border-[var(--border)] rounded-[var(--radius-card)] text-sm bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] outline-none ${mono ? 'font-mono' : ''} ${className}`}
    />
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-9 h-5 rounded-[var(--radius-badge)] transition-colors shrink-0 ${value ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-[var(--surface)] rounded-[var(--radius-badge)] shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  );
}

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-[201] p-4 pointer-events-none">
        <div className="pointer-events-auto w-full">{children}</div>
      </div>
    </>
  );
}

function StepBar({ steps, current }: { steps: { n: number; label: string }[]; current: number }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className={`flex flex-col items-center gap-1 px-3 py-2 ${s.n === current ? 'text-[var(--accent)]' : s.n < current ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
            <div className={`w-7 h-7 rounded-[var(--radius-badge)] flex items-center justify-center text-xs font-bold border-2 transition-colors ${s.n === current ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : s.n < current ? 'border-green-500 bg-green-500 text-white' : 'border-[var(--border)] bg-[var(--surface2)]'}`}>
              {s.n < current ? <Check size={11} /> : s.n}
            </div>
            <span className="text-[9px] font-medium">{s.label}</span>
          </div>
          {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${current > s.n ? 'bg-green-400' : 'bg-[var(--border)]'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ===== TAB 1: PÁGINAS =====
function PagesTabLive() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [sectionModal, setSectionModal] = useState<{ idx: number; isNew: boolean } | null>(null);
  const [sectionForm, setSectionForm] = useState({ id: '', label: '', content: '' });
  const [deleteModal, setDeleteModal] = useState<number | null>(null);
  const [exitModal, setExitModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);

  const TEMPLATES = [
    { id: 'legal_sidebar', label: 'Legal (sidebar)', icon: '§' },
    { id: 'simple',        label: 'Simple',           icon: '¶' },
    { id: 'homepage',      label: 'Homepage',          icon: '⌂' },
    { id: 'catalog',       label: 'Catálogo',          icon: '▦' },
    { id: 'system',        label: 'Sistema',           icon: '⚙' },
  ];

  const fetchPages = () => {
    fetch('/api/admin/cms?type=pages')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.pages) setPages(d.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchPages(); }, []);

  const handleSavePage = async () => {
    if (!editingPage) return;
    const res = await fetch('/api/admin/cms', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'page', id: editingPage.id, title: editingPage.title, slug: editingPage.slug, template: editingPage.template, last_updated: editingPage.last_updated, status: editingPage.status, sections: editingPage.sections }),
    });
    if (res.ok) { toast.success('Página guardada'); setDirty(false); fetchPages(); }
    else toast.error('Error al guardar');
  };

  const updatePage = (updates: Record<string, unknown>) => {
    setEditingPage((p: any) => ({ ...p, ...updates }));
    setDirty(true);
  };

  const openSectionEditor = (idx: number, isNew: boolean) => {
    if (isNew) setSectionForm({ id: '', label: '', content: '' });
    else {
      const sec = editingPage?.sections?.[idx];
      if (sec) setSectionForm({ id: sec.id || '', label: sec.label || '', content: sec.content || '' });
    }
    setSectionModal({ idx, isNew });
  };

  const saveSectionModal = () => {
    if (!editingPage || !sectionModal) return;
    const sections = [...(editingPage.sections || [])];
    const entry = {
      id: sectionForm.id || sectionForm.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      label: sectionForm.label,
      content: sectionForm.content,
    };
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

  const renderContent = (text: string) => {
    if (!text) return null;
    return text.split('\n\n').map((block, bi) => {
      const trimmed = block.trim();
      if (!trimmed) return null;
      const allLines = trimmed.split('\n').filter(l => l.trim());
      const isAllList = allLines.length > 0 && allLines.every(l => l.trim().startsWith('- '));
      if (isAllList) return <ul key={bi} className="list-disc pl-5 space-y-1 mb-3">{allLines.map((l, li) => <li key={li} className="text-[11px]">{l.trim().substring(2)}</li>)}</ul>;
      return <p key={bi} className="text-[11px] leading-relaxed mb-3">{trimmed}</p>;
    });
  };

  // ── EDITOR MODE ──
  if (editingPage) {
    const isLegal = editingPage.template === 'legal_sidebar';
    const sections = editingPage.sections || [];
    return (
      <div className="space-y-4">
        {sectionModal && (
          <ModalOverlay onClose={() => setSectionModal(null)}>
            <div className="max-w-2xl mx-auto bg-[var(--surface)] rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
              <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <h4 className="font-serif text-lg text-[var(--text)]">{sectionModal.isNew ? 'Nueva Sección' : 'Editar Sección'}</h4>
                <button onClick={() => setSectionModal(null)} className="p-1.5 hover:bg-[var(--surface2)] rounded-[var(--radius-card)]"><X size={16} /></button>
              </div>
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Título en sidebar</FieldLabel>
                    <CmsInput value={sectionForm.label} onChange={v => setSectionForm(f => ({ ...f, label: v, ...(sectionModal.isNew ? { id: v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') } : {}) }))} placeholder="Ej: 1. Objeto" />
                  </div>
                  <div>
                    <FieldLabel>ID anchor</FieldLabel>
                    <CmsInput value={sectionForm.id} onChange={v => setSectionForm(f => ({ ...f, id: v }))} placeholder="objeto" mono />
                  </div>
                </div>
                <div>
                  <FieldLabel>Contenido</FieldLabel>
                  <textarea value={sectionForm.content} onChange={e => setSectionForm(f => ({ ...f, content: e.target.value }))} rows={10} className="w-full px-4 py-3 border border-[var(--border)] rounded-[var(--radius-card)] text-sm bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/30 outline-none resize-y" placeholder={"Escribe el contenido.\n\nUsa línea vacía para separar párrafos.\n- Usa guiones para listas"} />
                </div>
                {sectionForm.content && (
                  <div>
                    <FieldLabel>Vista previa</FieldLabel>
                    <div className="p-4 bg-[var(--surface2)] rounded-[var(--radius-card)] border border-[var(--border)] max-h-48 overflow-y-auto text-[var(--text)]">
                      <h4 className="font-serif text-base mb-3">{sectionForm.label || 'Sin título'}</h4>
                      {renderContent(sectionForm.content)}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end gap-2 shrink-0">
                <button onClick={() => setSectionModal(null)} className="px-4 py-2.5 border border-[var(--border)] rounded-[var(--radius-card)] text-xs font-medium hover:bg-[var(--surface2)]">Cancelar</button>
                <button onClick={saveSectionModal} disabled={!sectionForm.label} className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-[var(--radius-card)] text-xs font-medium disabled:opacity-40 flex items-center gap-1.5"><Save size={12} /> {sectionModal.isNew ? 'Agregar' : 'Guardar'}</button>
              </div>
            </div>
          </ModalOverlay>
        )}
        {deleteModal !== null && (
          <ModalOverlay onClose={() => setDeleteModal(null)}>
            <div className="max-w-sm mx-auto bg-[var(--surface)] rounded-2xl shadow-2xl p-6">
              <div className="w-10 h-10 bg-[var(--error-subtle)] rounded-[var(--radius-card)] flex items-center justify-center mb-4"><AlertTriangle size={18} className="text-[var(--error)]" /></div>
              <h4 className="font-serif text-lg text-[var(--text)] mb-2">Eliminar sección</h4>
              <p className="text-sm text-[var(--text-secondary)] mb-6">¿Eliminar &ldquo;{editingPage?.sections?.[deleteModal]?.label}&rdquo;?</p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 border border-[var(--border)] rounded-[var(--radius-card)] text-xs font-medium hover:bg-[var(--surface2)]">Cancelar</button>
                <button onClick={confirmDeleteSection} className="flex-1 py-2.5 bg-red-600 text-white rounded-[var(--radius-card)] text-xs font-medium hover:bg-red-700">Eliminar</button>
              </div>
            </div>
          </ModalOverlay>
        )}
        {exitModal && (
          <ModalOverlay onClose={() => setExitModal(false)}>
            <div className="max-w-sm mx-auto bg-[var(--surface)] rounded-2xl shadow-2xl p-6">
              <h4 className="font-serif text-lg text-[var(--text)] mb-2">Cambios sin guardar</h4>
              <p className="text-sm text-[var(--text-secondary)] mb-6">¿Salir sin guardar los cambios?</p>
              <div className="flex gap-2">
                <button onClick={() => setExitModal(false)} className="flex-1 py-2.5 border border-[var(--border)] rounded-[var(--radius-card)] text-xs font-medium">Seguir editando</button>
                <button onClick={() => { setEditingPage(null); setDirty(false); setExitModal(false); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-[var(--radius-card)] text-xs font-medium">Salir</button>
              </div>
            </div>
          </ModalOverlay>
        )}

        {/* Top bar */}
        <div className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-card)] p-3">
          <button onClick={() => { if (dirty) setExitModal(true); else { setEditingPage(null); setDirty(false); } }} className="p-1.5 hover:bg-[var(--surface2)] rounded-[var(--radius-card)]"><ArrowLeft size={16} className="text-[var(--text-secondary)]" /></button>
          <div className="flex-1 min-w-0">
            <input value={editingPage.title} onChange={e => updatePage({ title: e.target.value })} className="text-sm font-medium text-[var(--text)] bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none w-full" />
            <p className="text-[10px] text-[var(--text-muted)] font-mono">{editingPage.slug} · {TEMPLATES.find(t => t.id === editingPage.template)?.label}</p>
          </div>
          <select value={editingPage.template} onChange={e => updatePage({ template: e.target.value })} className="text-[10px] border border-[var(--border)] rounded-[var(--radius-card)] px-2 py-1 bg-[var(--surface)]">
            {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
          </select>
          <a href={editingPage.slug} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-[var(--surface2)] rounded-[var(--radius-card)] text-[var(--text-muted)]"><ExternalLink size={14} /></a>
          <button onClick={handleSavePage} disabled={!dirty} className={`px-4 py-1.5 rounded-[var(--radius-card)] text-xs font-medium flex items-center gap-1.5 ${dirty ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90' : 'bg-[var(--surface2)] text-[var(--text-muted)] cursor-default'}`}><Save size={12} /> Guardar</button>
        </div>

        {/* Split screen editor (legal template) */}
        {isLegal && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: '70vh' }}>
            <div className="border border-[var(--border)] rounded-[var(--radius-card)] bg-[var(--surface)] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface2)]/50 flex items-center justify-between shrink-0">
                <div><p className="text-xs font-medium text-[var(--text)]">Secciones</p><p className="text-[9px] text-[var(--text-muted)]">{sections.length} secciones</p></div>
                <button onClick={() => openSectionEditor(sections.length, true)} className="px-2.5 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-[var(--radius-card)] text-[10px] font-medium hover:bg-[var(--accent)]/20 flex items-center gap-1"><Plus size={10} /> Agregar</button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sections.map((sec: any, idx: number) => (
                  <div key={sec.id || idx} onClick={() => setSelectedSection(idx)} className={`flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] cursor-pointer group ${selectedSection === idx ? 'bg-[var(--accent)]/5 border-l-2 border-l-[var(--accent)]' : 'hover:bg-[var(--surface2)]/50 border-l-2 border-l-transparent'}`}>
                    <div className="flex flex-col gap-0.5 shrink-0 opacity-0 group-hover:opacity-100">
                      <button onClick={e => { e.stopPropagation(); moveSection(idx, -1); }} disabled={idx === 0} className="p-0.5 text-[var(--text-muted)] disabled:opacity-20"><ChevronUp size={9} /></button>
                      <button onClick={e => { e.stopPropagation(); moveSection(idx, 1); }} disabled={idx === sections.length - 1} className="p-0.5 text-[var(--text-muted)] disabled:opacity-20"><ChevronDown size={9} /></button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${selectedSection === idx ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>{sec.label}</p>
                      <p className="text-[9px] text-[var(--text-muted)] truncate">{(sec.content || '').substring(0, 60)}...</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100">
                      <button onClick={e => { e.stopPropagation(); openSectionEditor(idx, false); }} className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] rounded"><Edit3 size={12} /></button>
                      <button onClick={e => { e.stopPropagation(); setDeleteModal(idx); }} className="p-1 text-[var(--text-muted)] hover:text-[var(--error)] rounded"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview — light mode isolated from admin theme */}
            <div className="border border-[var(--border)] rounded-[var(--radius-card)] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)] shrink-0">
                <p className="text-xs font-medium text-[var(--text)]">Vista previa — sitio público</p>
                <p className="text-[9px] text-[var(--text-muted)]">Aislada del tema admin</p>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-[var(--surface)]" style={{ colorScheme: 'light', color: '#1a1a1a' }}>
                <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)] overflow-hidden" style={{ minHeight: '400px' }}>
                  <div className="grid grid-cols-12">
                    <div className="col-span-4 bg-[var(--surface2)] border-r border-[var(--border)] p-5">
                      <h2 className="text-base font-semibold text-[var(--text)] mb-4">{editingPage.title}</h2>
                      <nav className="space-y-0.5 border-l border-[var(--border)] pl-3">
                        {sections.map((sec: any, i: number) => (
                          <button key={i} onClick={() => setSelectedSection(i)} className={`block w-full text-left py-0.5 text-[11px] border-l -ml-[13px] pl-3 ${selectedSection === i ? 'border-[var(--border)] text-[var(--text)] font-semibold' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>{sec.label}</button>
                        ))}
                      </nav>
                    </div>
                    <div className="col-span-8 p-5">
                      {selectedSection !== null && sections[selectedSection] ? (
                        <div><h3 className="text-base font-semibold text-[var(--text)] mb-3">{sections[selectedSection].label}</h3><div style={{ color: '#374151' }}>{renderContent(sections[selectedSection].content)}</div></div>
                      ) : sections.length > 0 ? (
                        <div className="space-y-6">{sections.map((sec: any, i: number) => <div key={i}><h3 className="text-base font-semibold text-[var(--text)] mb-2">{sec.label}</h3><div style={{ color: '#374151' }}>{renderContent(sec.content)}</div></div>)}</div>
                      ) : (
                        <div className="text-center py-16 text-[var(--text-muted)]"><FileText className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-xs">Sin secciones</p></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {!isLegal && (
          <CmsCard className="p-8 text-center"><Layout size={28} className="mx-auto mb-3 text-[var(--text-muted)]" /><p className="text-sm text-[var(--text-secondary)]">Editor split-screen disponible para plantilla &quot;Legal (sidebar)&quot;.</p></CmsCard>
        )}
      </div>
    );
  }

  // ── PAGE LIST ──
  const editablePages = pages.filter(p => p.is_editable);
  const systemPages = pages.filter(p => !p.is_editable);
  if (loading) return <CmsCard className="p-12 text-center text-[var(--text-muted)] text-sm">Cargando páginas...</CmsCard>;
  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--text-secondary)]">{pages.length} páginas — {editablePages.length} editables</p>
      <CmsCard className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--surface2)]/50"><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Páginas Editables</p></div>
        {editablePages.map(p => (
          <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border)] hover:bg-[var(--surface2)]/30 cursor-pointer group" onClick={() => { setEditingPage({ ...p }); setSelectedSection(null); setDirty(false); }}>
            <div className="w-8 h-8 bg-[var(--surface2)] rounded-[var(--radius-card)] flex items-center justify-center text-xs text-[var(--text-secondary)] shrink-0">{TEMPLATES.find(t => t.id === p.template)?.icon || '?'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{p.title}</p>
              <p className="text-[10px] text-[var(--text-muted)] font-mono">{p.slug} · {(p.sections || []).length} secciones</p>
            </div>
            <CmsBadge text={TEMPLATES.find(t => t.id === p.template)?.label || p.template} variant="blue" />
            <CmsBadge text={p.status === 'published' ? 'Publicada' : 'Borrador'} variant={p.status === 'published' ? 'green' : 'amber'} />
            <ChevronRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
          </div>
        ))}
      </CmsCard>
      <CmsCard className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--surface2)]/50"><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Páginas del Sistema</p></div>
        {systemPages.map(p => (
          <div key={p.id} className="flex items-center gap-3 px-5 py-2.5 border-b border-[var(--border)] opacity-50">
            <Settings2 size={14} className="text-[var(--text-muted)] shrink-0" />
            <p className="text-xs text-[var(--text-secondary)] flex-1">{p.title}</p>
            <p className="text-[10px] text-[var(--text-muted)] font-mono">{p.slug}</p>
          </div>
        ))}
      </CmsCard>
    </div>
  );
}

// ===== TAB 2: MENÚS — Editor visual con preview header/footer =====
function MenusTabLive() {
  const [menus, setMenus] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{ group: string; idx: number; item: any } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ group: string; idx: number; item: any } | null>(null);
  const [activeZone, setActiveZone] = useState<'header' | 'footer'>('header');

  useEffect(() => {
    fetch('/api/admin/cms?type=menus').then(r => r.ok ? r.json() : null).then(d => { if (d?.menus) setMenus(d.menus); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const menuGroups = [
    { key: 'header',        label: 'Menú Principal (Header)',      zone: 'header' as const },
    { key: 'footerBrand',   label: 'Footer — Marca',               zone: 'footer' as const },
    { key: 'footerService', label: 'Footer — Servicio al Cliente',  zone: 'footer' as const },
    { key: 'footerLegal',   label: 'Footer — Legal',               zone: 'footer' as const },
    { key: 'footerShop',    label: 'Footer — Tienda',              zone: 'footer' as const },
  ];

  const handleSave = async (group: string) => {
    setSaving(group);
    try {
      const res = await fetch('/api/admin/cms', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'menus', group, items: menus[group] || [] }) });
      if (res.ok) toast.success('Menú guardado'); else toast.error('Error al guardar');
    } catch { toast.error('Error de conexión'); } finally { setSaving(null); }
  };

  const addItem = (group: string) => {
    const newItem = { id: crypto.randomUUID(), label: 'Nuevo enlace', url: '/', is_visible: true, open_new_tab: false };
    const newIdx = (menus[group] || []).length;
    setMenus(prev => ({ ...prev, [group]: [...(prev[group] || []), newItem] }));
    setEditModal({ group, idx: newIdx, item: newItem });
  };

  const removeItem = () => {
    if (!deleteModal) return;
    setMenus(prev => ({ ...prev, [deleteModal.group]: (prev[deleteModal.group] || []).filter((_, i) => i !== deleteModal.idx) }));
    setDeleteModal(null);
  };

  const updateItemLocal = (group: string, idx: number, updates: Record<string, unknown>) => {
    setMenus(prev => ({ ...prev, [group]: (prev[group] || []).map((item, i) => i === idx ? { ...item, ...updates } : item) }));
  };

  const moveItem = (group: string, idx: number, dir: -1 | 1) => {
    const items = [...(menus[group] || [])];
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    [items[idx], items[target]] = [items[target], items[idx]];
    setMenus(prev => ({ ...prev, [group]: items }));
  };

  if (loading) return <CmsCard className="p-12 text-center text-[var(--text-muted)] text-sm">Cargando menús...</CmsCard>;
  const headerItems = menus['header'] || [];
  const footerGroups = [
    { key: 'footerBrand',   label: 'Marca',    items: menus['footerBrand']   || [] },
    { key: 'footerService', label: 'Servicio', items: menus['footerService'] || [] },
    { key: 'footerLegal',   label: 'Legal',    items: menus['footerLegal']   || [] },
    { key: 'footerShop',    label: 'Tienda',   items: menus['footerShop']    || [] },
  ];

  return (
    <div className="space-y-6">
      {editModal && (
        <ModalOverlay onClose={() => setEditModal(null)}>
          <div className="max-w-md mx-auto bg-[var(--surface)] rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h4 className="font-serif text-lg text-[var(--text)]">Editar enlace</h4>
              <button onClick={() => setEditModal(null)} className="p-1.5 hover:bg-[var(--surface2)] rounded-[var(--radius-card)]"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><FieldLabel>Texto del enlace</FieldLabel><CmsInput value={editModal.item.label} onChange={v => setEditModal(m => m ? { ...m, item: { ...m.item, label: v } } : null)} placeholder="Ej: Sobre Nosotros" /></div>
              <div><FieldLabel>URL destino</FieldLabel><CmsInput value={editModal.item.url} onChange={v => setEditModal(m => m ? { ...m, item: { ...m.item, url: v } } : null)} placeholder="/about" mono /></div>
              <div className="flex items-center justify-between p-3 bg-[var(--surface2)] rounded-[var(--radius-card)]"><p className="text-xs font-medium text-[var(--text)]">Visible</p><Toggle value={editModal.item.is_visible} onChange={v => setEditModal(m => m ? { ...m, item: { ...m.item, is_visible: v } } : null)} /></div>
              <div className="flex items-center justify-between p-3 bg-[var(--surface2)] rounded-[var(--radius-card)]"><p className="text-xs font-medium text-[var(--text)]">Nueva pestaña</p><Toggle value={editModal.item.open_new_tab} onChange={v => setEditModal(m => m ? { ...m, item: { ...m.item, open_new_tab: v } } : null)} /></div>
            </div>
            <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end gap-2">
              <button onClick={() => setEditModal(null)} className="px-4 py-2 border border-[var(--border)] rounded-[var(--radius-card)] text-xs font-medium hover:bg-[var(--surface2)]">Cancelar</button>
              <button onClick={() => { if (editModal) updateItemLocal(editModal.group, editModal.idx, editModal.item); setEditModal(null); }} className="px-4 py-2 bg-[var(--accent)] text-white rounded-[var(--radius-card)] text-xs font-medium flex items-center gap-1"><Check size={12} /> Aplicar</button>
            </div>
          </div>
        </ModalOverlay>
      )}
      {deleteModal && (
        <ModalOverlay onClose={() => setDeleteModal(null)}>
          <div className="max-w-sm mx-auto bg-[var(--surface)] rounded-2xl shadow-2xl p-6">
            <div className="w-10 h-10 bg-[var(--error-subtle)] rounded-[var(--radius-card)] flex items-center justify-center mb-4"><AlertTriangle size={18} className="text-[var(--error)]" /></div>
            <h4 className="font-serif text-lg text-[var(--text)] mb-2">Eliminar enlace</h4>
            <p className="text-sm text-[var(--text-secondary)] mb-6">¿Eliminar <strong>&ldquo;{deleteModal.item.label}&rdquo;</strong>? Guarda el menú para aplicar.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 border border-[var(--border)] rounded-[var(--radius-card)] text-xs font-medium">Cancelar</button>
              <button onClick={removeItem} className="flex-1 py-2.5 bg-red-600 text-white rounded-[var(--radius-card)] text-xs font-medium">Eliminar</button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Zone tabs */}
      <div className="flex gap-1 border-b border-[var(--border)]">
        {(['header', 'footer'] as const).map(zone => (
          <button key={zone} onClick={() => setActiveZone(zone)} className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${activeZone === zone ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]'}`}>
            {zone === 'header' ? 'Header' : 'Footer'}
          </button>
        ))}
      </div>

      {/* Visual preview — isolated light mode */}
      {activeZone === 'header' && (
        <div className="rounded-[var(--radius-card)] border border-[var(--border)] overflow-hidden">
          <div className="px-4 py-2 bg-[var(--surface2)]/50 border-b border-[var(--border)]"><p className="text-[10px] text-[var(--text-muted)]">Preview del header</p></div>
          <div style={{ background: 'white', colorScheme: 'light', color: '#1a1a1a' }} className="px-6 py-4">
            <div className="flex items-center justify-between border border-[var(--border)] rounded-[var(--radius-card)] px-5 py-3 bg-[var(--surface)] shadow-sm">
              <div className="text-sm font-bold text-[var(--text)]">DavidSon&apos;s Design</div>
              <div className="flex items-center gap-5">
                {headerItems.filter(i => i.is_visible).map((item, idx) => (
                  <div key={idx} className="text-xs text-[var(--text-secondary)]">{item.label}</div>
                ))}
                {headerItems.filter(i => i.is_visible).length === 0 && <span className="text-[10px] text-[var(--text-muted)] italic">Sin ítems visibles</span>}
              </div>
            </div>
          </div>
        </div>
      )}
      {activeZone === 'footer' && (
        <div className="rounded-[var(--radius-card)] border border-[var(--border)] overflow-hidden">
          <div className="px-4 py-2 bg-[var(--surface2)]/50 border-b border-[var(--border)]"><p className="text-[10px] text-[var(--text-muted)]">Preview del footer</p></div>
          <div style={{ background: '#111', colorScheme: 'dark' }} className="p-5">
            <div className="grid grid-cols-4 gap-6">
              {footerGroups.map(g => (
                <div key={g.key}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">{g.label}</p>
                  {g.items.filter(i => i.is_visible).map((item, idx) => <p key={idx} className="text-[11px] text-[var(--text-muted)] mb-1.5">{item.label}</p>)}
                  {g.items.filter(i => i.is_visible).length === 0 && <p className="text-[10px] text-[var(--text-secondary)] italic">Sin ítems</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editor groups */}
      {menuGroups.filter(g => activeZone === 'header' ? g.zone === 'header' : g.zone === 'footer').map(g => (
        <CmsCard key={g.key} className="overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--surface2)]/50 flex items-center justify-between">
            <p className="text-xs font-bold text-[var(--text)]">{g.label}</p>
            <span className="text-[10px] text-[var(--text-muted)]">{(menus[g.key] || []).length} ítems</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {(menus[g.key] || []).map((item, idx) => (
              <div key={item.id || idx} className={`flex items-center gap-2 px-4 py-3 group hover:bg-[var(--surface2)]/30 ${!item.is_visible ? 'opacity-50' : ''}`}>
                <div className="flex flex-col gap-0.5 shrink-0 opacity-0 group-hover:opacity-100">
                  <button onClick={() => moveItem(g.key, idx, -1)} disabled={idx === 0} className="p-0.5 text-[var(--text-muted)] disabled:opacity-20"><ChevronUp size={9} /></button>
                  <button onClick={() => moveItem(g.key, idx, 1)} disabled={idx === (menus[g.key]||[]).length-1} className="p-0.5 text-[var(--text-muted)] disabled:opacity-20"><ChevronDown size={9} /></button>
                </div>
                <GripVertical size={12} className="text-[var(--text-muted)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium ${!item.is_visible ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text)]'}`}>{item.label}</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">{item.url}</p>
                </div>
                {!item.is_visible && <CmsBadge text="Oculto" variant="gray" />}
                {item.open_new_tab && <CmsBadge text="Nueva pestaña" variant="blue" />}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100">
                  <button onClick={() => updateItemLocal(g.key, idx, { is_visible: !item.is_visible })} className="p-1.5 hover:bg-[var(--surface2)] rounded-[var(--radius-card)] text-[var(--text-muted)]">{item.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}</button>
                  <button onClick={() => setEditModal({ group: g.key, idx, item: { ...item } })} className="p-1.5 hover:bg-[var(--surface2)] rounded-[var(--radius-card)] text-[var(--text-muted)] hover:text-[var(--accent)]"><Edit3 size={13} /></button>
                  <button onClick={() => setDeleteModal({ group: g.key, idx, item })} className="p-1.5 hover:bg-[var(--error-subtle)] rounded-[var(--radius-card)] text-[var(--text-muted)] hover:text-[var(--error)]"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
            {(menus[g.key]||[]).length === 0 && <div className="px-4 py-6 text-center text-xs text-[var(--text-muted)]">Sin ítems. Agrega el primero.</div>}
          </div>
          <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--surface2)]/30 flex items-center gap-3">
            <button onClick={() => addItem(g.key)} className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"><Plus size={12} /> Agregar enlace</button>
            <div className="flex-1" />
            <button onClick={() => handleSave(g.key)} disabled={saving === g.key} className="text-xs bg-[var(--accent)] text-white px-3 py-1.5 rounded-[var(--radius-card)] hover:bg-[var(--accent)]/90 disabled:opacity-50 flex items-center gap-1">
              {saving === g.key ? <RefreshCw size={11} className="animate-spin" /> : <Save size={11} />} Guardar menú
            </button>
          </div>
        </CmsCard>
      ))}
    </div>
  );
}

// ===== TAB 3: HOMEPAGE — Bloques configurables =====
const BLOCK_DEFINITIONS: Array<{ type: BlockType; label: string; icon: React.ElementType; description: string }> = [
  { type: 'hero',              label: 'Hero Banner',           icon: Monitor,      description: 'Imagen + título + CTA' },
  { type: 'products_gallery',  label: 'Galería de Productos',  icon: Layers,       description: 'Grid o carousel por categoría' },
  { type: 'best_sellers',      label: 'Más Vendidos',          icon: Star,         description: 'Productos con más ventas' },
  { type: 'featured_products', label: 'Productos Destacados',  icon: Tag,          description: 'Selección manual con badge' },
  { type: 'categories',        label: 'Categorías',            icon: FolderOpen,   description: 'Grid de categorías con imagen' },
  { type: 'collections',       label: 'Colecciones',           icon: Package,      description: 'Productos agrupados temáticamente' },
  { type: 'testimonials',      label: 'Testimonios',           icon: Users,        description: 'Carousel o grid de reseñas' },
  { type: 'newsletter',        label: 'Newsletter',            icon: Bell,         description: 'Formulario de suscripción' },
  { type: 'promo_banner',      label: 'Banner Promocional',    icon: Zap,          description: 'Imagen, texto, link, countdown' },
  { type: 'how_it_works',      label: 'Cómo Funciona',         icon: Settings2,    description: 'Pasos con icono y texto' },
  { type: 'brand_story',       label: 'Nuestra Marca',         icon: Heart,        description: 'Historia e imagen' },
  { type: 'custom_cta',        label: 'CTA Personalización',   icon: MousePointer, description: 'Enlace al cotizador' },
];

function HomepageTabLive() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addBlockModal, setAddBlockModal] = useState(false);
  const [configModal, setConfigModal] = useState<any | null>(null);
  const [deleteModal, setDeleteModal] = useState<any | null>(null);
  const [configForm, setConfigForm] = useState<Record<string, string>>({});
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    fetch('/api/admin/cms?type=sections').then(r => r.ok ? r.json() : null).then(d => { if (d?.sections) setBlocks(d.sections); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/cms', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'sections', items: blocks }) });
      if (res.ok) toast.success('Homepage guardada'); else toast.error('Error al guardar');
    } catch { toast.error('Error de conexión'); } finally { setSaving(false); }
  };

  const addBlock = (type: BlockType) => {
    const def = BLOCK_DEFINITIONS.find(d => d.type === type);
    setBlocks(prev => [...prev, { id: crypto.randomUUID(), section_type: type, title: def?.label || type, content: {}, position: prev.length, is_visible: true }]);
    setAddBlockModal(false);
    toast.success(`Bloque "${def?.label}" agregado`);
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const copy = [...blocks];
    [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
    setBlocks(copy);
  };

  const openConfig = (block: any) => {
    setConfigForm({ title: block.title || '', subtitle: block.content?.subtitle || '', image_url: block.content?.image_url || '', cta_text: block.content?.cta_text || '', cta_url: block.content?.cta_url || '', category: block.content?.category || '', layout: block.content?.layout || 'grid', count: String(block.content?.count || 6), badge_text: block.content?.badge_text || '' });
    setConfigModal(block);
  };

  const saveConfig = () => {
    if (!configModal) return;
    setBlocks(prev => prev.map(b => b.id === configModal.id ? { ...b, title: configForm.title || b.title, content: { ...b.content, subtitle: configForm.subtitle, image_url: configForm.image_url, cta_text: configForm.cta_text, cta_url: configForm.cta_url, category: configForm.category, layout: configForm.layout, count: parseInt(configForm.count)||6, badge_text: configForm.badge_text } } : b));
    setConfigModal(null);
  };

  if (loading) return <CmsCard className="p-12 text-center text-[var(--text-muted)] text-sm">Cargando...</CmsCard>;

  return (
    <div className="space-y-4">
      {/* Add Block Modal */}
      {addBlockModal && (
        <ModalOverlay onClose={() => setAddBlockModal(false)}>
          <div className="max-w-2xl mx-auto bg-[var(--surface)] rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <div><h4 className="font-serif text-lg text-[var(--text)]">Agregar bloque</h4><p className="text-[10px] text-[var(--text-muted)] mt-0.5">Selecciona el tipo de sección</p></div>
              <button onClick={() => setAddBlockModal(false)} className="p-1.5 hover:bg-[var(--surface2)] rounded-[var(--radius-card)]"><X size={16} /></button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-2 gap-3">
              {BLOCK_DEFINITIONS.map(def => {
                const Icon = def.icon;
                const already = blocks.some(b => b.section_type === def.type);
                return (
                  <button key={def.type} onClick={() => !already && addBlock(def.type)} disabled={already} className={`flex items-start gap-3 p-4 rounded-[var(--radius-card)] border text-left transition-all ${already ? 'opacity-40 cursor-not-allowed border-[var(--border)] bg-[var(--surface2)]' : 'border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 cursor-pointer'}`}>
                    <div className="w-8 h-8 bg-[var(--accent)]/10 rounded-[var(--radius-card)] flex items-center justify-center shrink-0"><Icon size={16} className="text-[var(--accent)]" /></div>
                    <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-[var(--text)]">{def.label}</p><p className="text-[10px] text-[var(--text-muted)] mt-0.5">{def.description}</p>{already && <span className="text-[9px] text-[var(--success)] font-medium">Ya agregado</span>}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </ModalOverlay>
      )}
      {/* Config Modal */}
      {configModal && (
        <ModalOverlay onClose={() => setConfigModal(null)}>
          <div className="max-w-lg mx-auto bg-[var(--surface)] rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h4 className="font-serif text-lg text-[var(--text)]">Configurar — {configModal.title}</h4>
              <button onClick={() => setConfigModal(null)} className="p-1.5 hover:bg-[var(--surface2)] rounded-[var(--radius-card)]"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div><FieldLabel>Título del bloque</FieldLabel><CmsInput value={configForm.title} onChange={v => setConfigForm(f => ({ ...f, title: v }))} placeholder="Título visible al visitante" /></div>
              {['hero','promo_banner','brand_story','newsletter'].includes(configModal.section_type) && (
                <>
                  <div><FieldLabel>Subtítulo / descripción</FieldLabel><CmsInput value={configForm.subtitle} onChange={v => setConfigForm(f => ({ ...f, subtitle: v }))} placeholder="Texto secundario" /></div>
                  <div><FieldLabel>URL imagen de fondo</FieldLabel><CmsInput value={configForm.image_url} onChange={v => setConfigForm(f => ({ ...f, image_url: v }))} placeholder="https://..." mono /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><FieldLabel>Texto botón CTA</FieldLabel><CmsInput value={configForm.cta_text} onChange={v => setConfigForm(f => ({ ...f, cta_text: v }))} placeholder="Ver colección" /></div>
                    <div><FieldLabel>URL botón</FieldLabel><CmsInput value={configForm.cta_url} onChange={v => setConfigForm(f => ({ ...f, cta_url: v }))} placeholder="/shop" mono /></div>
                  </div>
                </>
              )}
              {['products_gallery','best_sellers','featured_products','categories','collections'].includes(configModal.section_type) && (
                <>
                  <div><FieldLabel>Categoría (opcional)</FieldLabel><CmsInput value={configForm.category} onChange={v => setConfigForm(f => ({ ...f, category: v }))} placeholder="tablas-de-cortar" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><FieldLabel>Layout</FieldLabel><select value={configForm.layout} onChange={e => setConfigForm(f => ({ ...f, layout: e.target.value }))} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-[var(--radius-card)] text-sm bg-[var(--surface)]"><option value="grid">Grid</option><option value="carousel">Carousel</option><option value="masonry">Masonry</option><option value="list">Lista</option></select></div>
                    <div><FieldLabel>Cantidad</FieldLabel><select value={configForm.count} onChange={e => setConfigForm(f => ({ ...f, count: e.target.value }))} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-[var(--radius-card)] text-sm bg-[var(--surface)]">{[4,6,8,12,16].map(n=><option key={n} value={String(n)}>{n} productos</option>)}</select></div>
                  </div>
                </>
              )}
              {configModal.section_type === 'featured_products' && <div><FieldLabel>Texto del badge</FieldLabel><CmsInput value={configForm.badge_text} onChange={v => setConfigForm(f => ({ ...f, badge_text: v }))} placeholder="Destacado" /></div>}
            </div>
            <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end gap-2 shrink-0">
              <button onClick={() => setConfigModal(null)} className="px-4 py-2.5 border border-[var(--border)] rounded-[var(--radius-card)] text-xs font-medium hover:bg-[var(--surface2)]">Cancelar</button>
              <button onClick={saveConfig} className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-[var(--radius-card)] text-xs font-medium flex items-center gap-1.5"><Check size={12} /> Aplicar</button>
            </div>
          </div>
        </ModalOverlay>
      )}
      {deleteModal && (
        <ModalOverlay onClose={() => setDeleteModal(null)}>
          <div className="max-w-sm mx-auto bg-[var(--surface)] rounded-2xl shadow-2xl p-6">
            <div className="w-10 h-10 bg-[var(--error-subtle)] rounded-[var(--radius-card)] flex items-center justify-center mb-4"><AlertTriangle size={18} className="text-[var(--error)]" /></div>
            <h4 className="font-serif text-lg text-[var(--text)] mb-2">Eliminar bloque</h4>
            <p className="text-sm text-[var(--text-secondary)] mb-6">¿Eliminar <strong>&ldquo;{deleteModal.title}&rdquo;</strong>?</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 border border-[var(--border)] rounded-[var(--radius-card)] text-xs font-medium">Cancelar</button>
              <button onClick={() => { setBlocks(prev=>prev.filter(b=>b.id!==deleteModal.id)); setDeleteModal(null); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-[var(--radius-card)] text-xs font-medium">Eliminar</button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text)]">Bloques del Homepage</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{blocks.filter(b=>b.is_visible).length} visibles · {blocks.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-[var(--border)] rounded-[var(--radius-card)] p-0.5">
            <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded-[var(--radius-button)] ${previewDevice==='desktop'?'bg-[var(--accent)] text-white':'text-[var(--text-muted)]'}`}><Monitor size={13}/></button>
            <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded-[var(--radius-button)] ${previewDevice==='mobile'?'bg-[var(--accent)] text-white':'text-[var(--text-muted)]'}`}><Smartphone size={13}/></button>
          </div>
          <button onClick={() => setAddBlockModal(true)} className="px-3 py-1.5 bg-[var(--surface2)] border border-[var(--border)] text-[var(--text)] rounded-[var(--radius-card)] text-xs font-medium hover:bg-[var(--surface)] flex items-center gap-1.5"><Plus size={13}/> Agregar bloque</button>
          <button onClick={handleSaveAll} disabled={saving} className="px-4 py-1.5 bg-[var(--accent)] text-white rounded-[var(--radius-card)] text-xs font-medium disabled:opacity-50 flex items-center gap-1.5">{saving?<RefreshCw size={12} className="animate-spin"/>:<Save size={12}/>} Guardar</button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className={`grid gap-4 ${previewDevice==='desktop'?'grid-cols-1 lg:grid-cols-5':''}`}>
        <div className={`space-y-2 ${previewDevice==='desktop'?'lg:col-span-2':''}`}>
          {blocks.length === 0 ? (
            <CmsCard className="p-12 text-center"><Home size={32} className="mx-auto mb-3 text-[var(--text-muted)]"/><p className="text-sm text-[var(--text-secondary)] mb-2">Sin bloques.</p><button onClick={()=>setAddBlockModal(true)} className="text-[var(--accent)] text-sm font-medium hover:underline">+ Agregar primer bloque</button></CmsCard>
          ) : blocks.map((block, idx) => {
            const def = BLOCK_DEFINITIONS.find(d => d.type === block.section_type);
            const Icon = def?.icon || Layout;
            return (
              <div key={block.id||idx} className={`flex items-center gap-3 p-3.5 rounded-[var(--radius-card)] border transition-all ${block.is_visible?'bg-[var(--surface)] border-[var(--border)]':'bg-[var(--surface2)]/50 border-[var(--border)] opacity-50'}`}>
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={()=>moveBlock(idx,-1)} disabled={idx===0} className="p-0.5 text-[var(--text-muted)] disabled:opacity-20"><ChevronUp size={12}/></button>
                  <button onClick={()=>moveBlock(idx,1)} disabled={idx===blocks.length-1} className="p-0.5 text-[var(--text-muted)] disabled:opacity-20"><ChevronDown size={12}/></button>
                </div>
                <div className="w-8 h-8 bg-[var(--accent)]/10 rounded-[var(--radius-card)] flex items-center justify-center shrink-0"><Icon size={15} className="text-[var(--accent)]"/></div>
                <div className="flex-1 min-w-0"><p className="text-xs font-medium text-[var(--text)] truncate">{block.title||def?.label}</p><p className="text-[10px] text-[var(--text-muted)] truncate">{def?.description}</p></div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={()=>setBlocks(prev=>prev.map(b=>b.id===block.id?{...b,is_visible:!b.is_visible}:b))} className="p-1.5 hover:bg-[var(--surface2)] rounded-[var(--radius-card)] text-[var(--text-muted)]">{block.is_visible?<Eye size={13}/>:<EyeOff size={13}/>}</button>
                  <button onClick={()=>openConfig(block)} className="p-1.5 hover:bg-[var(--surface2)] rounded-[var(--radius-card)] text-[var(--text-muted)] hover:text-[var(--accent)]"><Settings2 size={13}/></button>
                  <button onClick={()=>setDeleteModal(block)} className="p-1.5 hover:bg-[var(--error-subtle)] rounded-[var(--radius-card)] text-[var(--text-muted)] hover:text-[var(--error)]"><Trash2 size={13}/></button>
                </div>
              </div>
            );
          })}
        </div>
        {previewDevice === 'desktop' && (
          <div className="lg:col-span-3">
            <div className="rounded-[var(--radius-card)] border border-[var(--border)] overflow-hidden sticky top-4">
              <div className="px-4 py-2.5 bg-[var(--surface2)]/50 border-b border-[var(--border)] flex items-center gap-2">
                <div className="flex gap-1"><div className="w-2.5 h-2.5 rounded-[var(--radius-badge)] bg-red-400"/><div className="w-2.5 h-2.5 rounded-[var(--radius-badge)] bg-amber-400"/><div className="w-2.5 h-2.5 rounded-[var(--radius-badge)] bg-green-400"/></div>
                <span className="text-[10px] text-[var(--text-muted)] flex-1 text-center">davidsonsdesign.com</span>
              </div>
              <div style={{background:'white',colorScheme:'light',color:'#1a1a1a',minHeight:'400px'}} className="overflow-y-auto max-h-[600px]">
                {blocks.filter(b=>b.is_visible).length===0 ? <div className="flex items-center justify-center h-64 text-[var(--text-muted)] text-sm">Sin bloques visibles</div>
                : blocks.filter(b=>b.is_visible).map((block,idx) => {
                  const def = BLOCK_DEFINITIONS.find(d=>d.type===block.section_type);
                  const Icon = def?.icon||Layout;
                  return (
                    <div key={block.id||idx} className="border-b border-[var(--border)]">
                      {block.section_type==='hero' ? (
                        <div className="relative h-40 bg-gradient-to-r from-amber-800 to-amber-600 flex items-center justify-center">
                          {block.content?.image_url && <img src={block.content.image_url} alt="hero" className="absolute inset-0 w-full h-full object-cover opacity-60"/>}
                          <div className="relative text-center text-white">
                            <p className="text-xl font-bold">{block.title}</p>
                            {block.content?.subtitle && <p className="text-sm mt-1 opacity-80">{block.content.subtitle}</p>}
                            {block.content?.cta_text && <div className="mt-3 bg-[var(--surface)] text-amber-800 text-xs font-bold px-4 py-1.5 rounded-[var(--radius-badge)] inline-block">{block.content.cta_text}</div>}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 bg-amber-100 rounded flex items-center justify-center"><Icon size={10} className="text-amber-700"/></div>
                            <p className="text-xs font-semibold text-[var(--text)]">{block.title||def?.label}</p>
                          </div>
                          <div className={`grid gap-2 ${block.content?.layout==='grid'||!block.content?.layout?'grid-cols-3':'grid-cols-1'}`}>
                            {Array.from({length:Math.min(parseInt(String(block.content?.count||3)),6)}).map((_,i)=>(
                              <div key={i} className="bg-[var(--surface2)] rounded-[var(--radius-card)] h-16 flex items-center justify-center"><div className="text-[var(--text-muted)] text-[9px]">ítem {i+1}</div></div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== TAB 4: BLOG — Wizard 6 pasos =====
const BLOG_CATEGORIES = ['Guías', 'Maderas', 'Cuidado', 'Corporate', 'Lifestyle'];

function BlogTabLive() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardPost, setWizardPost] = useState<any|null>(null);
  const [step, setStep] = useState<BlogStep>(1);
  const [deleteModal, setDeleteModal] = useState<string|null>(null);
  const [form, setForm] = useState({ title:'', slug:'', excerpt:'', body:'', status:'draft', category:'', tags:'', featured_image:'', seo_title:'', seo_description:'' });

  const fetchPosts = () => { fetch('/api/admin/cms?type=posts').then(r=>r.ok?r.json():null).then(d=>{if(d)setPosts(d.posts||[]);}).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(()=>{ fetchPosts(); },[]);

  const handleSave = async (publish=false) => {
    const payload: Record<string,unknown> = { ...form, tags: form.tags.split(',').map((t:string)=>t.trim()).filter(Boolean), status: publish?'published':form.status, type:'post', ...(wizardPost?.id&&{id:wizardPost.id}) };
    const method = wizardPost?.id ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/cms', { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if (res.ok) { toast.success(publish?'Post publicado':'Guardado como borrador'); setWizardPost(null); fetchPosts(); }
    else toast.error('Error al guardar');
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    const res = await fetch(`/api/admin/cms?type=post&id=${deleteModal}`, { method:'DELETE' });
    if (res.ok) { toast.success('Post eliminado'); setDeleteModal(null); fetchPosts(); }
  };

  const openEdit = (post: any) => {
    setForm({ title:post.title||'', slug:post.slug||'', excerpt:post.excerpt||'', body:post.body||'', status:post.status||'draft', category:post.category||'', tags:(post.tags||[]).join(', '), featured_image:post.featured_image||'', seo_title:post.seo_title||'', seo_description:post.seo_description||'' });
    setWizardPost(post); setStep(1);
  };

  const STEPS = [{n:1,label:'Título'},{n:2,label:'Contenido'},{n:3,label:'Imagen'},{n:4,label:'Tags'},{n:5,label:'SEO'},{n:6,label:'Publicar'}];

  if (wizardPost !== null) {
    return (
      <div className="space-y-6 max-w-3xl">
        <StepBar steps={STEPS} current={step} />
        <CmsCard className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-serif text-lg text-[var(--text)]">Título y URL</h4>
              <div><FieldLabel>Título del post</FieldLabel><CmsInput value={form.title} onChange={v=>setForm(f=>({...f,title:v,slug:v.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/g,'-').replace(/(^-|-$)/g,'')}))} placeholder="Cómo elegir la mejor madera..."/></div>
              <div><FieldLabel>Slug (URL)</FieldLabel><CmsInput value={form.slug} onChange={v=>setForm(f=>({...f,slug:v}))} placeholder="como-elegir-la-mejor-madera" mono/><p className="text-[10px] text-[var(--text-muted)] mt-1">davidsonsdesign.com/blog/<strong className="text-[var(--text-secondary)]">{form.slug||'slug-del-post'}</strong></p></div>
              <div><FieldLabel>Extracto</FieldLabel><textarea value={form.excerpt} onChange={e=>setForm(f=>({...f,excerpt:e.target.value}))} rows={3} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-[var(--radius-card)] text-sm bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/30 outline-none resize-none" placeholder="Descripción breve del post..."/></div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-serif text-lg text-[var(--text)]">Contenido</h4>
              <div className="flex items-center gap-1 p-2 bg-[var(--surface2)] rounded-[var(--radius-card)] border border-[var(--border)] flex-wrap">
                {[{icon:Bold,ins:'**texto**'},{icon:Italic,ins:'_texto_'},{icon:Hash,ins:'\n## Título\n'},{icon:List,ins:'\n- ítem\n- ítem\n'},{icon:Link2,ins:'[texto](url)'},{icon:Quote,ins:'\n> cita\n'},{icon:ImageIcon,ins:'![alt](url)'}].map(({icon:Icon,ins},i)=>(
                  <button key={i} onClick={()=>setForm(f=>({...f,body:f.body+ins}))} className="p-1.5 hover:bg-[var(--surface)] rounded-[var(--radius-card)] text-[var(--text-muted)] hover:text-[var(--text)]"><Icon size={14}/></button>
                ))}
              </div>
              <textarea value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} rows={18} className="w-full px-4 py-3 border border-[var(--border)] rounded-[var(--radius-card)] text-sm bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/30 outline-none resize-y font-mono" placeholder="Escribe en Markdown..."/>
              <p className="text-[10px] text-[var(--text-muted)]">{form.body.length} caracteres · {form.body.split(/\s+/).filter(Boolean).length} palabras</p>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-serif text-lg text-[var(--text)]">Imagen de portada</h4>
              <div><FieldLabel>URL de la imagen</FieldLabel><CmsInput value={form.featured_image} onChange={v=>setForm(f=>({...f,featured_image:v}))} placeholder="https://..." mono/></div>
              {form.featured_image ? <div className="rounded-[var(--radius-card)] overflow-hidden border border-[var(--border)]"><img src={form.featured_image} alt="portada" className="w-full h-48 object-cover"/></div>
              : <div className="rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border)] h-48 flex flex-col items-center justify-center text-[var(--text-muted)] gap-2"><Upload size={24}/><p className="text-xs">Pega URL o sube desde Media</p></div>}
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <h4 className="font-serif text-lg text-[var(--text)]">Categoría y Tags</h4>
              <div>
                <FieldLabel>Categoría</FieldLabel>
                <div className="flex flex-wrap gap-2 mt-1">{BLOG_CATEGORIES.map(cat=><button key={cat} onClick={()=>setForm(f=>({...f,category:cat}))} className={`px-3 py-1.5 rounded-[var(--radius-badge)] text-xs font-medium border transition-colors ${form.category===cat?'bg-[var(--accent)] text-white border-[var(--accent)]':'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'}`}>{cat}</button>)}</div>
                <CmsInput className="mt-3" value={form.category} onChange={v=>setForm(f=>({...f,category:v}))} placeholder="O escribe categoría..."/>
              </div>
              <div>
                <FieldLabel>Tags (separados por coma)</FieldLabel>
                <CmsInput value={form.tags} onChange={v=>setForm(f=>({...f,tags:v}))} placeholder="madera, cuidado, hermosillo"/>
                <div className="flex flex-wrap gap-1.5 mt-2">{form.tags.split(',').map(t=>t.trim()).filter(Boolean).map(tag=><span key={tag} className="px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-medium rounded-[var(--radius-badge)]">{tag}</span>)}</div>
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-4">
              <h4 className="font-serif text-lg text-[var(--text)]">SEO</h4>
              <div>
                <FieldLabel>Meta título (60 chars)</FieldLabel>
                <CmsInput value={form.seo_title} onChange={v=>setForm(f=>({...f,seo_title:v}))} placeholder={form.title||'Título para Google'}/>
                <div className="flex items-center gap-2 mt-1"><div className="flex-1 h-1 bg-[var(--border)] rounded-[var(--radius-badge)] overflow-hidden"><div className={`h-full rounded-[var(--radius-badge)] ${(form.seo_title||form.title).length>60?'bg-red-500':'bg-green-500'}`} style={{width:`${Math.min(100,(form.seo_title||form.title).length/60*100)}%`}}/></div><span className="text-[9px] text-[var(--text-muted)]">{(form.seo_title||form.title).length}/60</span></div>
              </div>
              <div>
                <FieldLabel>Meta descripción (160 chars)</FieldLabel>
                <textarea value={form.seo_description} onChange={e=>setForm(f=>({...f,seo_description:e.target.value}))} rows={3} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-[var(--radius-card)] text-sm bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/30 outline-none resize-none" placeholder={form.excerpt||'Descripción para buscadores...'}/>
                <div className="flex items-center gap-2 mt-1"><div className="flex-1 h-1 bg-[var(--border)] rounded-[var(--radius-badge)] overflow-hidden"><div className={`h-full rounded-[var(--radius-badge)] ${(form.seo_description||form.excerpt).length>160?'bg-red-500':'bg-green-500'}`} style={{width:`${Math.min(100,(form.seo_description||form.excerpt).length/160*100)}%`}}/></div><span className="text-[9px] text-[var(--text-muted)]">{(form.seo_description||form.excerpt).length}/160</span></div>
              </div>
              <div>
                <FieldLabel>Preview en Google</FieldLabel>
                <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-card)]" style={{colorScheme:'light'}}>
                  <p className="text-[10px] text-[var(--text-muted)] mb-1">davidsonsdesign.com › blog › {form.slug||'slug'}</p>
                  <p className="text-base text-[var(--info)] font-medium">{(form.seo_title||form.title||'Título').substring(0,60)}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{(form.seo_description||form.excerpt||'Descripción...').substring(0,160)}</p>
                </div>
              </div>
            </div>
          )}
          {step === 6 && (
            <div className="space-y-4">
              <h4 className="font-serif text-lg text-[var(--text)]">Publicar</h4>
              <div className="p-5 bg-[var(--surface2)] rounded-[var(--radius-card)] border border-[var(--border)] space-y-3">
                <div className="flex items-center gap-3">
                  {form.featured_image && <img src={form.featured_image} alt="" className="w-16 h-12 object-cover rounded-[var(--radius-card)]"/>}
                  <div><p className="text-sm font-semibold text-[var(--text)]">{form.title||'Sin título'}</p><p className="text-[10px] text-[var(--text-muted)] font-mono">/blog/{form.slug||'sin-slug'}</p></div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[var(--border)]">
                  <div><p className="text-[9px] uppercase text-[var(--text-muted)]">Categoría</p><p className="text-xs text-[var(--text)]">{form.category||'—'}</p></div>
                  <div><p className="text-[9px] uppercase text-[var(--text-muted)]">Tags</p><p className="text-xs text-[var(--text)] truncate">{form.tags||'—'}</p></div>
                  <div><p className="text-[9px] uppercase text-[var(--text-muted)]">Palabras</p><p className="text-xs text-[var(--text)]">{form.body.split(/\s+/).filter(Boolean).length}</p></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={()=>handleSave(false)} className="py-3 border border-[var(--border)] rounded-[var(--radius-card)] text-sm font-medium text-[var(--text)] hover:bg-[var(--surface2)] flex items-center justify-center gap-2"><BookOpen size={15}/> Guardar borrador</button>
                <button onClick={()=>handleSave(true)} className="py-3 bg-[var(--accent)] text-white rounded-[var(--radius-card)] text-sm font-medium flex items-center justify-center gap-2"><Globe size={15}/> Publicar ahora</button>
              </div>
            </div>
          )}
        </CmsCard>
        <div className="flex items-center justify-between">
          <button onClick={()=>{ if(step>1)setStep((step-1) as BlogStep); else setWizardPost(null); }} className="px-4 py-2 border border-[var(--border)] rounded-[var(--radius-card)] text-xs font-medium hover:bg-[var(--surface2)] flex items-center gap-1.5"><ArrowLeft size={13}/>{step===1?'Cancelar':'Anterior'}</button>
          {step<6 && <button onClick={()=>setStep((step+1) as BlogStep)} className="px-4 py-2 bg-[var(--accent)] text-white rounded-[var(--radius-card)] text-xs font-medium flex items-center gap-1.5">Siguiente <ChevronRight size={13}/></button>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deleteModal && <ModalOverlay onClose={()=>setDeleteModal(null)}><div className="max-w-sm mx-auto bg-[var(--surface)] rounded-2xl shadow-2xl p-6"><div className="w-10 h-10 bg-[var(--error-subtle)] rounded-[var(--radius-card)] flex items-center justify-center mb-4"><AlertTriangle size={18} className="text-[var(--error)]"/></div><h4 className="font-serif text-lg text-[var(--text)] mb-2">Eliminar post</h4><p className="text-sm text-[var(--text-secondary)] mb-6">Esta acción no se puede deshacer.</p><div className="flex gap-2"><button onClick={()=>setDeleteModal(null)} className="flex-1 py-2.5 border border-[var(--border)] rounded-[var(--radius-card)] text-xs font-medium">Cancelar</button><button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-[var(--radius-card)] text-xs font-medium">Eliminar</button></div></div></ModalOverlay>}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">{posts.length} publicaciones</p>
        <button onClick={()=>{ setForm({title:'',slug:'',excerpt:'',body:'',status:'draft',category:'',tags:'',featured_image:'',seo_title:'',seo_description:''}); setWizardPost({}); setStep(1); }} className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-[var(--radius-card)] text-xs font-medium flex items-center gap-1.5"><Plus size={12}/> Nuevo post</button>
      </div>
      {loading ? <CmsCard className="p-8 text-center text-[var(--text-muted)] text-sm">Cargando...</CmsCard>
      : posts.length===0 ? <CmsCard className="p-12 text-center"><PenLine className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3"/><p className="text-sm text-[var(--text-secondary)] mb-2">Sin publicaciones</p><button onClick={()=>{ setForm({title:'',slug:'',excerpt:'',body:'',status:'draft',category:'',tags:'',featured_image:'',seo_title:'',seo_description:''}); setWizardPost({}); setStep(1); }} className="text-[var(--accent)] text-sm font-medium hover:underline">Crear primera publicación</button></CmsCard>
      : <CmsCard className="divide-y divide-[var(--border)]">
          {posts.map(p=>(
            <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-[var(--surface2)]/30">
              {p.featured_image && <img src={p.featured_image} alt={p.title} className="w-12 h-9 object-cover rounded-[var(--radius-card)] shrink-0"/>}
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-[var(--text)] truncate">{p.title}</p><p className="text-[10px] text-[var(--text-muted)] mt-0.5">{p.category||'Sin categoría'} · {new Date(p.created_at).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'})}</p></div>
              <CmsBadge text={p.status==='published'?'Publicado':p.status==='archived'?'Archivado':'Borrador'} variant={p.status==='published'?'green':p.status==='archived'?'gray':'amber'}/>
              <button onClick={()=>openEdit(p)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface2)] rounded-[var(--radius-card)]"><Edit3 size={14}/></button>
              <button onClick={()=>setDeleteModal(p.id)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-subtle)] rounded-[var(--radius-card)]"><Trash2 size={14}/></button>
            </div>
          ))}
        </CmsCard>}
    </div>
  );
}

// ===== TAB 5: POP-UPS — Builder visual =====
const TRIGGER_OPTIONS = [
  { value: 'delay',       label: 'Después de X segundos' },
  { value: 'scroll',      label: 'Al hacer scroll X%' },
  { value: 'exit_intent', label: 'Al intentar salir' },
  { value: 'page_load',   label: 'Al cargar la página' },
];
const POSITION_OPTIONS = [
  { value: 'center',        label: 'Centro' },
  { value: 'bottom_right',  label: 'Esquina inferior derecha' },
  { value: 'bottom_left',   label: 'Esquina inferior izquierda' },
  { value: 'bottom_center', label: 'Barra inferior' },
  { value: 'top_banner',    label: 'Banner superior' },
];

function PopupsTabLive() {
  const [popups, setPopups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [builderPopup, setBuilderPopup] = useState<any|null>(null);
  const [deleteModal, setDeleteModal] = useState<string|null>(null);
  const [builderTab, setBuilderTab] = useState<'content'|'trigger'|'design'|'rules'|'preview'>('content');
  const [form, setForm] = useState<Record<string,unknown>>({
    name:'Nuevo pop-up', type:'modal', trigger_type:'delay', trigger_value:'3',
    title:'', message:'', cta_text:'Ver oferta', cta_url:'/shop',
    position:'center', show_on:'/', frequency:'once_per_session', device:'all', is_active:false,
  });

  const fetchPopups = () => { fetch('/api/admin/cms?type=popups').then(r=>r.ok?r.json():null).then(d=>{if(d)setPopups(d.popups||[]);}).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(()=>{ fetchPopups(); },[]);

  const openBuilder = (popup?: any) => {
    if (popup) {
      setForm({ name:popup.name||'', type:popup.type||'modal', trigger_type:popup.trigger_type||'delay', trigger_value:String(popup.trigger_value||'3'), title:popup.content?.title||'', message:popup.content?.message||'', cta_text:popup.content?.cta_text||'', cta_url:popup.content?.cta_url||'', position:popup.content?.position||'center', show_on:(popup.show_on||['/']).join(', '), frequency:popup.display_frequency||'once_per_session', device:popup.content?.device||'all', is_active:popup.is_active||false });
    } else {
      setForm({ name:'Nuevo pop-up', type:'modal', trigger_type:'delay', trigger_value:'3', title:'', message:'', cta_text:'Ver oferta', cta_url:'/shop', position:'center', show_on:'/', frequency:'once_per_session', device:'all', is_active:false });
    }
    setBuilderPopup(popup||{}); setBuilderTab('content');
  };

  const handleSave = async () => {
    const payload: Record<string,unknown> = { type:'popup', name:form.name, popup_type:form.type, trigger_type:form.trigger_type, trigger_value:String(form.trigger_value), content:{title:form.title,message:form.message,cta_text:form.cta_text,cta_url:form.cta_url,position:form.position,device:form.device}, is_active:form.is_active, show_on:String(form.show_on).split(',').map((s:string)=>s.trim()).filter(Boolean), display_frequency:form.frequency, ...(builderPopup?.id&&{id:builderPopup.id}) };
    const method = builderPopup?.id ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/cms', { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    if (res.ok) { toast.success(builderPopup?.id?'Pop-up actualizado':'Pop-up creado'); setBuilderPopup(null); fetchPopups(); }
    else toast.error('Error al guardar');
  };

  const handleToggle = async (popup: any) => {
    const res = await fetch('/api/admin/cms', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ type:'popup', id:popup.id, is_active:!popup.is_active }) });
    if (res.ok) { toast.success(popup.is_active?'Desactivado':'Activado'); fetchPopups(); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    const res = await fetch(`/api/admin/cms?type=popup&id=${deleteModal}`, { method:'DELETE' });
    if (res.ok) { toast.success('Pop-up eliminado'); setDeleteModal(null); fetchPopups(); }
  };

  if (builderPopup !== null) {
    const BTABS = [
      {id:'content' as const,label:'Contenido'},
      {id:'trigger' as const,label:'Trigger'},
      {id:'design' as const,label:'Diseño'},
      {id:'rules' as const,label:'Reglas'},
      {id:'preview' as const,label:'Preview'},
    ];
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={()=>setBuilderPopup(null)} className="p-1.5 hover:bg-[var(--surface2)] rounded-[var(--radius-card)]"><ArrowLeft size={16}/></button>
            <div>
              <input value={String(form.name)} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="text-sm font-semibold text-[var(--text)] bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none"/>
              <p className="text-[10px] text-[var(--text-muted)]">Builder de pop-up</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Toggle value={Boolean(form.is_active)} onChange={v=>setForm(f=>({...f,is_active:v}))}/>
            <span className="text-xs text-[var(--text-secondary)]">{form.is_active?'Activo':'Inactivo'}</span>
            <button onClick={handleSave} className="px-4 py-1.5 bg-[var(--accent)] text-white rounded-[var(--radius-card)] text-xs font-medium flex items-center gap-1.5"><Save size={12}/> Guardar</button>
          </div>
        </div>
        <div className="flex gap-1 border-b border-[var(--border)]">
          {BTABS.map(t=><button key={t.id} onClick={()=>setBuilderTab(t.id)} className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${builderTab===t.id?'border-[var(--accent)] text-[var(--accent)]':'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]'}`}>{t.label}</button>)}
        </div>
        <CmsCard className="p-6">
          {builderTab === 'content' && (
            <div className="space-y-4">
              <div><FieldLabel>Título</FieldLabel><CmsInput value={String(form.title)} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="¡Oferta especial!"/></div>
              <div><FieldLabel>Mensaje</FieldLabel><textarea value={String(form.message)} onChange={e=>setForm(f=>({...f,message:e.target.value}))} rows={4} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-[var(--radius-card)] text-sm bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/30 outline-none resize-none" placeholder="Obtén 10% de descuento en tu primera compra."/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><FieldLabel>Texto botón</FieldLabel><CmsInput value={String(form.cta_text)} onChange={v=>setForm(f=>({...f,cta_text:v}))} placeholder="Ver oferta"/></div>
                <div><FieldLabel>URL botón</FieldLabel><CmsInput value={String(form.cta_url)} onChange={v=>setForm(f=>({...f,cta_url:v}))} placeholder="/shop" mono/></div>
              </div>
            </div>
          )}
          {builderTab === 'trigger' && (
            <div className="space-y-4">
              <FieldLabel>Tipo de activador</FieldLabel>
              <div className="grid grid-cols-1 gap-2">
                {TRIGGER_OPTIONS.map(opt=>(
                  <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-[var(--radius-card)] border cursor-pointer transition-colors ${form.trigger_type===opt.value?'border-[var(--accent)] bg-[var(--accent)]/5':'border-[var(--border)] hover:border-[var(--accent)]/50'}`}>
                    <input type="radio" name="trigger" value={opt.value} checked={form.trigger_type===opt.value} onChange={()=>setForm(f=>({...f,trigger_type:opt.value}))} className="accent-[var(--accent)]"/>
                    <span className="text-sm text-[var(--text)]">{opt.label}</span>
                  </label>
                ))}
              </div>
              {['delay','scroll'].includes(String(form.trigger_type)) && <div><FieldLabel>{form.trigger_type==='delay'?'Segundos':'Porcentaje scroll'}</FieldLabel><CmsInput value={String(form.trigger_value)} onChange={v=>setForm(f=>({...f,trigger_value:v}))} type="number" placeholder={form.trigger_type==='delay'?'3':'50'}/></div>}
            </div>
          )}
          {builderTab === 'design' && (
            <div className="space-y-4">
              <div>
                <FieldLabel>Posición</FieldLabel>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {POSITION_OPTIONS.map(opt=>(
                    <label key={opt.value} className={`flex items-center gap-2 p-3 rounded-[var(--radius-card)] border cursor-pointer text-sm transition-colors ${form.position===opt.value?'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]':'border-[var(--border)] text-[var(--text-secondary)]'}`}>
                      <input type="radio" name="position" value={opt.value} checked={form.position===opt.value} onChange={()=>setForm(f=>({...f,position:opt.value}))} className="accent-[var(--accent)]"/>
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>Dispositivo</FieldLabel>
                <div className="flex gap-2 mt-1">
                  {[{v:'all',l:'Todos'},{v:'desktop',l:'Solo escritorio'},{v:'mobile',l:'Solo móvil'}].map(opt=>(
                    <button key={opt.v} onClick={()=>setForm(f=>({...f,device:opt.v}))} className={`px-3 py-2 rounded-[var(--radius-card)] border text-xs font-medium transition-colors ${form.device===opt.v?'border-[var(--accent)] bg-[var(--accent)] text-white':'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'}`}>{opt.l}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {builderTab === 'rules' && (
            <div className="space-y-4">
              <div><FieldLabel>Mostrar en páginas (comas)</FieldLabel><CmsInput value={String(form.show_on)} onChange={v=>setForm(f=>({...f,show_on:v}))} placeholder="/, /shop, /about" mono/></div>
              <div>
                <FieldLabel>Frecuencia</FieldLabel>
                <select value={String(form.frequency)} onChange={e=>setForm(f=>({...f,frequency:e.target.value}))} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-[var(--radius-card)] text-sm bg-[var(--surface)]">
                  <option value="always">Siempre</option>
                  <option value="once_per_session">Una vez por sesión</option>
                  <option value="once_per_day">Una vez por día</option>
                  <option value="once_per_week">Una vez por semana</option>
                  <option value="once_ever">Solo una vez</option>
                </select>
              </div>
            </div>
          )}
          {builderTab === 'preview' && (
            <div>
              <FieldLabel>Preview del pop-up</FieldLabel>
              <div className="relative mt-2 rounded-[var(--radius-card)] bg-gray-800 h-64 flex items-center justify-center overflow-hidden" style={{colorScheme:'dark'}}>
                <div className="absolute inset-0 bg-black/50"/>
                <div className="relative bg-[var(--surface)] rounded-2xl p-6 shadow-2xl w-72" style={{color:'#1a1a1a',colorScheme:'light'}}>
                  {Boolean(form.title) && <h3 className="text-base font-bold text-[var(--text)] mb-2">{String(form.title)}</h3>}
                  {Boolean(form.message) && <p className="text-sm text-[var(--text-secondary)] mb-4">{String(form.message)}</p>}
                  {Boolean(form.cta_text) && <button className="w-full py-2 bg-amber-700 text-white rounded-[var(--radius-card)] text-sm font-medium">{String(form.cta_text)}</button>}
                  <button className="absolute top-3 right-3 w-6 h-6 bg-[var(--surface2)] rounded-[var(--radius-badge)] flex items-center justify-center text-[var(--text-muted)]"><X size={12}/></button>
                </div>
              </div>
            </div>
          )}
        </CmsCard>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deleteModal && <ModalOverlay onClose={()=>setDeleteModal(null)}><div className="max-w-sm mx-auto bg-[var(--surface)] rounded-2xl shadow-2xl p-6"><div className="w-10 h-10 bg-[var(--error-subtle)] rounded-[var(--radius-card)] flex items-center justify-center mb-4"><AlertTriangle size={18} className="text-[var(--error)]"/></div><h4 className="font-serif text-lg text-[var(--text)] mb-2">Eliminar pop-up</h4><p className="text-sm text-[var(--text-secondary)] mb-6">Esta acción no se puede deshacer.</p><div className="flex gap-2"><button onClick={()=>setDeleteModal(null)} className="flex-1 py-2.5 border border-[var(--border)] rounded-[var(--radius-card)] text-xs font-medium">Cancelar</button><button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-[var(--radius-card)] text-xs font-medium">Eliminar</button></div></div></ModalOverlay>}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">{popups.length} pop-ups</p>
        <button onClick={()=>openBuilder()} className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-[var(--radius-card)] text-xs font-medium flex items-center gap-1.5"><Plus size={12}/> Nuevo pop-up</button>
      </div>
      {loading ? <CmsCard className="p-8 text-center text-[var(--text-muted)] text-sm">Cargando...</CmsCard>
      : popups.length===0 ? <CmsCard className="p-12 text-center"><MessageSquare className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3"/><p className="text-sm text-[var(--text-secondary)] mb-2">Sin pop-ups</p><button onClick={()=>openBuilder()} className="text-[var(--accent)] text-sm font-medium hover:underline">Crear primer pop-up</button></CmsCard>
      : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popups.map(p=>(
            <CmsCard key={p.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div><p className="text-sm font-semibold text-[var(--text)]">{p.name}</p><p className="text-[10px] text-[var(--text-muted)] mt-0.5">Trigger: {TRIGGER_OPTIONS.find(t=>t.value===p.trigger_type)?.label||p.trigger_type}</p></div>
                <Toggle value={p.is_active} onChange={()=>handleToggle(p)}/>
              </div>
              <div className="flex items-center gap-2">
                <CmsBadge text={p.is_active?'Activo':'Inactivo'} variant={p.is_active?'green':'gray'}/>
                <CmsBadge text={p.type||'modal'} variant="blue"/>
                <div className="flex-1"/>
                <button onClick={()=>openBuilder(p)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface2)] rounded-[var(--radius-card)]"><Edit3 size={14}/></button>
                <button onClick={()=>setDeleteModal(p.id)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-subtle)] rounded-[var(--radius-card)]"><Trash2 size={14}/></button>
              </div>
            </CmsCard>
          ))}
        </div>}
    </div>
  );
}

// ===== TAB 6: MEDIA — Galería con upload y búsqueda =====
function MediaTabLive() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = () => {
    fetch('/api/admin/cms?type=media').then(r=>r.ok?r.json():null).then(d=>{if(d)setFiles(d.files||[]);}).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(()=>{fetchFiles();},[]);

  const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
  const fmtSize = (b: number) => b>1_000_000?`${(b/1_000_000).toFixed(1)} MB`:b>1000?`${Math.round(b/1000)} KB`:`${b} B`;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/cms', { method: 'POST', body: formData });
      if (res.ok) { toast.success('Archivo subido'); fetchFiles(); }
      else toast.error('Error al subir');
    } catch { toast.error('Error de conexión'); }
    finally { setUploading(false); }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('URL copiada');
    setTimeout(()=>setCopiedUrl(null), 2000);
  };

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      {selectedFile && (
        <ModalOverlay onClose={()=>setSelectedFile(null)}>
          <div className="max-w-md mx-auto bg-[var(--surface)] rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h4 className="font-serif text-lg text-[var(--text)]">Detalles</h4>
              <button onClick={()=>setSelectedFile(null)} className="p-1.5 hover:bg-[var(--surface2)] rounded-[var(--radius-card)]"><X size={16}/></button>
            </div>
            <div className="p-6 space-y-4">
              {isImage(selectedFile.name) && <div className="rounded-[var(--radius-card)] overflow-hidden bg-[var(--surface2)]"><img src={selectedFile.url} alt={selectedFile.name} className="w-full h-40 object-contain"/></div>}
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-[10px] text-[var(--text-muted)] uppercase">Nombre</span><span className="text-xs text-[var(--text)] font-mono">{selectedFile.name}</span></div>
                <div className="flex justify-between"><span className="text-[10px] text-[var(--text-muted)] uppercase">Tamaño</span><span className="text-xs text-[var(--text)]">{fmtSize(selectedFile.size)}</span></div>
              </div>
              <div>
                <FieldLabel>URL pública</FieldLabel>
                <div className="flex gap-2">
                  <input readOnly value={selectedFile.url} className="flex-1 px-3 py-2 border border-[var(--border)] rounded-[var(--radius-card)] text-[10px] font-mono bg-[var(--surface2)] text-[var(--text-muted)]"/>
                  <button onClick={()=>copyUrl(selectedFile.url)} className="px-3 py-2 border border-[var(--border)] rounded-[var(--radius-card)] text-xs hover:bg-[var(--surface2)] flex items-center gap-1">
                    {copiedUrl===selectedFile.url?<Check size={13} className="text-[var(--success)]"/>:<Copy size={13}/>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar archivo..." className="w-full pl-8 pr-3 py-2 border border-[var(--border)] rounded-[var(--radius-card)] text-sm bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/30 outline-none"/>
        </div>
        <p className="text-xs text-[var(--text-muted)] shrink-0">{filtered.length} archivos</p>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*,.pdf,.svg"/>
        <button onClick={()=>fileInputRef.current?.click()} disabled={uploading} className="px-3 py-2 bg-[var(--accent)] text-white rounded-[var(--radius-card)] text-xs font-medium disabled:opacity-50 flex items-center gap-1.5">
          {uploading?<RefreshCw size={13} className="animate-spin"/>:<Upload size={13}/>} Subir
        </button>
      </div>
      {loading ? <CmsCard className="p-8 text-center text-[var(--text-muted)] text-sm">Cargando...</CmsCard>
      : filtered.length === 0 ? (
        <CmsCard className="p-12 text-center">
          <ImageIcon className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3"/>
          <p className="text-sm text-[var(--text-secondary)] mb-2">{search?`Sin resultados para "${search}"`:'Sin archivos'}</p>
          {!search && <button onClick={()=>fileInputRef.current?.click()} className="text-[var(--accent)] text-sm font-medium hover:underline">Subir primer archivo</button>}
        </CmsCard>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map(f=>(
            <div key={f.id} onClick={()=>setSelectedFile(f)} className="group rounded-[var(--radius-card)] border border-[var(--border)] overflow-hidden cursor-pointer hover:border-[var(--accent)] hover:shadow-sm transition-all bg-[var(--surface)]">
              <div className="aspect-square bg-[var(--surface2)] flex items-center justify-center relative overflow-hidden">
                {isImage(f.name)?<img src={f.url} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"/>:<FileText className="w-8 h-8 text-[var(--text-muted)]"/>}
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e=>{e.stopPropagation();copyUrl(f.url);}} className="w-6 h-6 bg-[var(--surface)]/90 rounded-[var(--radius-badge)] flex items-center justify-center shadow-sm">
                    {copiedUrl===f.url?<Check size={10} className="text-[var(--success)]"/>:<Copy size={10} className="text-[var(--text-secondary)]"/>}
                  </button>
                </div>
              </div>
              <div className="p-2"><p className="text-[10px] text-[var(--text)] truncate font-medium">{f.name}</p><p className="text-[9px] text-[var(--text-muted)]">{fmtSize(f.size)}</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== TAB 7: TEXTOS — Por sección con búsqueda =====
const TEXT_SECTIONS_ORDER = ['Header','Footer','Home','Checkout','Emails','General'];

function TextsTabLive() {
  const [texts, setTexts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string|null>(null);
  const [editValues, setEditValues] = useState({value_es:'',value_en:''});
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<string|null>(null);

  const fetchTexts = () => {
    fetch('/api/admin/cms?type=texts').then(r=>r.ok?r.json():null).then(d=>{if(d)setTexts(d.texts||[]);}).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(()=>{fetchTexts();},[]);

  const handleSave = async (id: string) => {
    const res = await fetch('/api/admin/cms',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'text',id,...editValues})});
    if(res.ok){toast.success('Texto actualizado');setEditId(null);fetchTexts();}
    else toast.error('Error al guardar');
  };

  const filtered = texts.filter(t=>
    t.key.toLowerCase().includes(search.toLowerCase())||
    (t.value_es||'').toLowerCase().includes(search.toLowerCase())||
    (t.value_en||'').toLowerCase().includes(search.toLowerCase())
  );

  const allSections = [...new Set(filtered.map((t:any)=>t.section))];
  const sections = [
    ...TEXT_SECTIONS_ORDER.filter(s=>allSections.includes(s)),
    ...allSections.filter(s=>!TEXT_SECTIONS_ORDER.includes(s)),
  ];
  const displaySection = activeSection || sections[0] || null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setActiveSection(null);}} placeholder="Buscar clave o texto..." className="w-full pl-8 pr-3 py-2 border border-[var(--border)] rounded-[var(--radius-card)] text-sm bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/30 outline-none"/>
        </div>
        <p className="text-xs text-[var(--text-muted)] shrink-0">{filtered.length} textos</p>
      </div>
      {loading ? <CmsCard className="p-8 text-center text-[var(--text-muted)] text-sm">Cargando...</CmsCard> : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <CmsCard className="overflow-hidden">
              {sections.map(section=>(
                <button key={section} onClick={()=>setActiveSection(section)} className={`w-full text-left px-4 py-3 border-b border-[var(--border)] text-xs font-medium flex items-center justify-between transition-colors ${displaySection===section?'bg-[var(--accent)]/5 text-[var(--accent)] border-l-2 border-l-[var(--accent)]':'text-[var(--text-secondary)] hover:bg-[var(--surface2)]/50 border-l-2 border-l-transparent'}`}>
                  {section}
                  <span className="text-[9px] bg-[var(--surface2)] px-1.5 py-0.5 rounded-[var(--radius-badge)] text-[var(--text-muted)]">{filtered.filter((t:any)=>t.section===section).length}</span>
                </button>
              ))}
              {sections.length===0 && <div className="px-4 py-6 text-center text-xs text-[var(--text-muted)]">Sin resultados</div>}
            </CmsCard>
          </div>
          <div className="lg:col-span-3">
            {displaySection ? (
              <CmsCard className="overflow-hidden">
                <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--surface2)]/50">
                  <p className="text-xs font-bold text-[var(--text)]">{displaySection}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{filtered.filter((t:any)=>t.section===displaySection).length} textos</p>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {filtered.filter((t:any)=>t.section===displaySection).map((t:any)=>(
                    <div key={t.id} className="p-4 hover:bg-[var(--surface2)]/20">
                      <div className="flex items-start gap-3">
                        <code className="text-[10px] text-[var(--text-muted)] font-mono mt-1 shrink-0 w-36 truncate">{t.key}</code>
                        {editId===t.id ? (
                          <div className="flex-1 space-y-2">
                            <div><FieldLabel>Español</FieldLabel><CmsInput value={editValues.value_es} onChange={v=>setEditValues(ev=>({...ev,value_es:v}))} placeholder="Texto en español"/></div>
                            <div><FieldLabel>English</FieldLabel><CmsInput value={editValues.value_en} onChange={v=>setEditValues(ev=>({...ev,value_en:v}))} placeholder="English text"/></div>
                            <div className="flex gap-2">
                              <button onClick={()=>handleSave(t.id)} className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-[var(--radius-card)] text-xs font-medium flex items-center gap-1"><Check size={11}/> Guardar</button>
                              <button onClick={()=>setEditId(null)} className="px-3 py-1.5 border border-[var(--border)] rounded-[var(--radius-card)] text-xs">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[var(--text)] truncate">{t.value_es||<span className="text-[var(--text-muted)] italic text-xs">sin texto</span>}</p>
                              {t.value_en && <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">{t.value_en}</p>}
                            </div>
                            <button onClick={()=>{setEditId(t.id);setEditValues({value_es:t.value_es||'',value_en:t.value_en||''});}} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface2)] rounded-[var(--radius-card)] shrink-0"><Edit3 size={13}/></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CmsCard>
            ) : <CmsCard className="p-12 text-center"><Type className="w-8 h-8 mx-auto mb-3 text-[var(--text-muted)]"/><p className="text-sm text-[var(--text-secondary)]">Selecciona una sección</p></CmsCard>}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== TAB 8: SEO GLOBAL — Wizard 6 pasos =====
function SeoTabLive() {
  const [seo, setSeo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<SeoStep>(1);
  const [form, setForm] = useState({ meta_title:'', meta_description:'', og_title:'', og_description:'', og_image:'', favicon_url:'', ga_id:'', meta_pixel_id:'', gtm_id:'' });
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    fetch('/api/admin/cms?type=seo').then(r=>r.ok?r.json():null).then(d=>{
      if(d?.seo){
        setSeo(d.seo);
        setForm(f=>({...f,meta_title:d.seo.metaTitle||'',meta_description:d.seo.metaDescription||'',og_title:d.seo.ogTitle||'',og_description:d.seo.ogDescription||'',og_image:d.seo.ogImage||'',favicon_url:d.seo.favicon||'',ga_id:d.seo.gaId||'',meta_pixel_id:d.seo.metaPixelId||'',gtm_id:d.seo.gtmId||''}));
      }
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/theme',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'seo',...form})});
      if(res.ok) toast.success('SEO global guardado'); else toast.error('Error al guardar');
    } catch { toast.error('Error de conexión'); } finally { setSaving(false); }
  };

  const SEO_STEPS = [{n:1 as SeoStep,label:'Meta título'},{n:2 as SeoStep,label:'Meta desc.'},{n:3 as SeoStep,label:'Open Graph'},{n:4 as SeoStep,label:'Favicon'},{n:5 as SeoStep,label:'Analytics'},{n:6 as SeoStep,label:'Archivos'}];

  if(loading) return <CmsCard className="p-8 text-center text-[var(--text-muted)] text-sm">Cargando...</CmsCard>;

  return (
    <div className="space-y-6 max-w-3xl">
      <StepBar steps={SEO_STEPS} current={step} />
      <CmsCard className="p-6">
        {step===1 && (
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-[var(--text)]">Meta título global</h4>
            <div>
              <FieldLabel>Título (60 caracteres máx.)</FieldLabel>
              <CmsInput value={form.meta_title} onChange={v=>setForm(f=>({...f,meta_title:v}))} placeholder="DavidSon's Design — Tablas artesanales de madera"/>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-[var(--border)] rounded-[var(--radius-badge)] overflow-hidden"><div className={`h-full rounded-[var(--radius-badge)] transition-all ${form.meta_title.length>60?'bg-red-500':form.meta_title.length>50?'bg-amber-500':'bg-green-500'}`} style={{width:`${Math.min(100,form.meta_title.length/60*100)}%`}}/></div>
                <span className={`text-[10px] font-medium ${form.meta_title.length>60?'text-[var(--error)]':'text-[var(--text-muted)]'}`}>{form.meta_title.length}/60</span>
              </div>
            </div>
            <div>
              <FieldLabel>Preview en Google</FieldLabel>
              <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-card)]" style={{colorScheme:'light'}}>
                <p className="text-[11px] text-[var(--text-muted)] mb-0.5">davidsonsdesign.com</p>
                <p className="text-base text-[var(--info)] font-medium">{form.meta_title||'Título de tu tienda'}</p>
                <p className="text-[11px] text-[var(--text-muted)]">davidsonsdesign.com · México</p>
              </div>
            </div>
          </div>
        )}
        {step===2 && (
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-[var(--text)]">Meta descripción global</h4>
            <div>
              <FieldLabel>Descripción (160 caracteres máx.)</FieldLabel>
              <textarea value={form.meta_description} onChange={e=>setForm(f=>({...f,meta_description:e.target.value}))} rows={4} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-[var(--radius-card)] text-sm bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/30 outline-none resize-none" placeholder="Tablas artesanales de madera hechas a mano en México. Personalización láser incluida."/>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-[var(--border)] rounded-[var(--radius-badge)] overflow-hidden"><div className={`h-full rounded-[var(--radius-badge)] transition-all ${form.meta_description.length>160?'bg-red-500':form.meta_description.length>140?'bg-amber-500':'bg-green-500'}`} style={{width:`${Math.min(100,form.meta_description.length/160*100)}%`}}/></div>
                <span className={`text-[10px] font-medium ${form.meta_description.length>160?'text-[var(--error)]':'text-[var(--text-muted)]'}`}>{form.meta_description.length}/160</span>
              </div>
            </div>
            <div>
              <FieldLabel>Preview en Google</FieldLabel>
              <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-card)]" style={{colorScheme:'light'}}>
                <p className="text-[11px] text-[var(--text-muted)] mb-0.5">davidsonsdesign.com</p>
                <p className="text-base text-[var(--info)] font-medium">{form.meta_title||"DavidSon's Design"}</p>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{form.meta_description||'Descripción de tu tienda...'}</p>
              </div>
            </div>
          </div>
        )}
        {step===3 && (
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-[var(--text)]">Open Graph — Redes Sociales</h4>
            <div><FieldLabel>OG Título</FieldLabel><CmsInput value={form.og_title} onChange={v=>setForm(f=>({...f,og_title:v}))} placeholder={form.meta_title||'Título para redes'}/></div>
            <div><FieldLabel>OG Descripción</FieldLabel><textarea value={form.og_description} onChange={e=>setForm(f=>({...f,og_description:e.target.value}))} rows={3} className="w-full px-3 py-2.5 border border-[var(--border)] rounded-[var(--radius-card)] text-sm bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/30 outline-none resize-none" placeholder={form.meta_description||'Descripción para redes'}/></div>
            <div><FieldLabel>OG Image URL (1200×630 px)</FieldLabel><CmsInput value={form.og_image} onChange={v=>setForm(f=>({...f,og_image:v}))} placeholder="/images/og-image.jpg" mono/></div>
            {form.og_image && (
              <div>
                <FieldLabel>Preview Facebook / WhatsApp</FieldLabel>
                <div className="rounded-[var(--radius-card)] overflow-hidden border border-[var(--border)] bg-[var(--surface2)] max-w-sm" style={{colorScheme:'light'}}>
                  <img src={form.og_image} alt="OG" className="w-full h-32 object-cover"/>
                  <div className="p-3"><p className="text-[9px] text-[var(--text-muted)] uppercase mb-0.5">DAVIDSONSDESIGN.COM</p><p className="text-sm font-bold text-[var(--text)]">{form.og_title||form.meta_title}</p><p className="text-[11px] text-[var(--text-muted)]">{form.og_description||form.meta_description}</p></div>
                </div>
              </div>
            )}
          </div>
        )}
        {step===4 && (
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-[var(--text)]">Favicon</h4>
            <div><FieldLabel>URL del favicon</FieldLabel><CmsInput value={form.favicon_url} onChange={v=>setForm(f=>({...f,favicon_url:v}))} placeholder="/favicon.ico" mono/></div>
            {form.favicon_url && <div className="flex items-center gap-4 p-4 bg-[var(--surface2)] rounded-[var(--radius-card)]">{[16,32,64].map(sz=><div key={sz} className="flex flex-col items-center gap-1"><img src={form.favicon_url} alt={`${sz}px`} style={{width:sz,height:sz}} className="rounded"/><span className="text-[9px] text-[var(--text-muted)]">{sz}px</span></div>)}</div>}
            <div className="p-4 bg-[var(--surface2)] rounded-[var(--radius-card)]">
              <p className="text-xs font-medium text-[var(--text)] mb-2">Favicons en el proyecto</p>
              {['/favicon.ico','/favicon-32x32.png','/apple-touch-icon.png','/android-chrome-192x192.png','/android-chrome-512x512.png'].map(f=><div key={f} className="flex items-center gap-2 mb-1"><Check size={10} className="text-[var(--success)]"/><code className="text-[10px] text-[var(--text-muted)] font-mono">{f}</code></div>)}
            </div>
          </div>
        )}
        {step===5 && (
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-[var(--text)]">IDs de Analytics</h4>
            <div><FieldLabel>Google Analytics 4 (G-XXXXXXXXXX)</FieldLabel><CmsInput value={form.ga_id} onChange={v=>setForm(f=>({...f,ga_id:v}))} placeholder="G-XXXXXXXXXX" mono/></div>
            <div><FieldLabel>Meta Pixel ID</FieldLabel><CmsInput value={form.meta_pixel_id} onChange={v=>setForm(f=>({...f,meta_pixel_id:v}))} placeholder="3059984754209902" mono/><p className="text-[10px] text-[var(--text-muted)] mt-1">Configurado como NEXT_PUBLIC_META_PIXEL_ID</p></div>
            <div><FieldLabel>Google Tag Manager (GTM-XXXXXXX)</FieldLabel><CmsInput value={form.gtm_id} onChange={v=>setForm(f=>({...f,gtm_id:v}))} placeholder="GTM-XXXXXXX" mono/></div>
          </div>
        )}
        {step===6 && (
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-[var(--text)]">Archivos SEO y resumen</h4>
            <div className="grid grid-cols-2 gap-3">
              {[{label:'Sitemap',url:seo?.sitemap||'https://www.davidsonsdesign.com/sitemap.xml',desc:'Generado automáticamente'},{label:'Robots.txt',url:seo?.robots||'https://www.davidsonsdesign.com/robots.txt',desc:'next-sitemap config'}].map(f=>(
                <a key={f.label} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-4 bg-[var(--surface2)] rounded-[var(--radius-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group">
                  <Globe size={16} className="text-[var(--accent)] mt-0.5 shrink-0"/><div><p className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">{f.label}</p><p className="text-[10px] text-[var(--text-muted)]">{f.desc}</p></div><ExternalLink size={12} className="text-[var(--text-muted)] ml-auto"/>
                </a>
              ))}
            </div>
            <div className="p-4 bg-[var(--surface2)] rounded-[var(--radius-card)]">
              <p className="text-xs font-medium text-[var(--text)] mb-3">Resumen actual</p>
              <div className="grid grid-cols-2 gap-3">
                {[{label:'Dominio',value:seo?.domain||'davidsonsdesign.com'},{label:'Páginas indexadas',value:`${seo?.indexedPages||20}`},{label:'JSON-LD',value:seo?.jsonLd?'Activo':'Inactivo'},{label:'OG Image',value:seo?.ogImage?'Configurada':'No configurada'}].map(item=>(
                  <div key={item.label}><p className="text-[9px] uppercase font-bold text-[var(--text-muted)]">{item.label}</p><p className="text-xs text-[var(--text)]">{item.value}</p></div>
                ))}
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-[var(--accent)] text-white rounded-[var(--radius-card)] text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {saving?<RefreshCw size={15} className="animate-spin"/>:<Save size={15}/>} Guardar configuración SEO
            </button>
          </div>
        )}
      </CmsCard>
      <div className="flex items-center justify-between">
        <button onClick={()=>{if(step>1)setStep((step-1)as SeoStep);}} disabled={step===1} className="px-4 py-2 border border-[var(--border)] rounded-[var(--radius-card)] text-xs font-medium hover:bg-[var(--surface2)] disabled:opacity-40 flex items-center gap-1.5"><ArrowLeft size={13}/> Anterior</button>
        {step<6 && <button onClick={()=>setStep((step+1)as SeoStep)} className="px-4 py-2 bg-[var(--accent)] text-white rounded-[var(--radius-card)] text-xs font-medium flex items-center gap-1.5">Siguiente <ChevronRight size={13}/></button>}
      </div>
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====
export const CmsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CmsTab>('pages');

  const tabContent: Record<CmsTab, React.ReactNode> = {
    pages:    <PagesTabLive />,
    menus:    <MenusTabLive />,
    homepage: <HomepageTabLive />,
    blog:     <BlogTabLive />,
    popups:   <PopupsTabLive />,
    media:    <MediaTabLive />,
    texts:    <TextsTabLive />,
    seo:      <SeoTabLive />,
  };

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-lg text-[var(--text)] flex items-center gap-2">
        <FileText size={20} className="text-[var(--accent)]" />
        CMS — Contenido del Sitio
      </h3>
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1 min-w-max border-b border-[var(--border)]">
          {tabItems.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs transition-colors border-b-2 whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-[var(--accent)] text-[var(--accent)] font-medium'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {tabContent[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
