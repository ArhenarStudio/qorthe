import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit3, ShoppingBag, Trash2, Copy, Search, Filter, 
  Image as ImageIcon, Type, FileDigit, Briefcase, Upload, X,
  MoreVertical, Check, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// --- Types ---

type DesignType = 'logo' | 'phrase' | 'image' | 'corporate';
type FileFormat = 'SVG' | 'PNG' | 'JPG' | 'PDF';
type EngravingType = 'superficial' | 'deep' | 'filled' | 'vector';

interface DesignItem {
  id: string;
  name: string;
  type: DesignType;
  format: FileFormat;
  dimensions: { width: number; height: number; unit: 'mm' };
  engravingType: EngravingType;
  createdAt: string;
  thumbnail: string;
  isCorporate: boolean;
  description?: string;
}

// --- Mock Data ---

const MOCK_DESIGNS: DesignItem[] = [
  {
    id: 'des-001',
    name: 'Logo DavidSon Corp',
    type: 'corporate',
    format: 'SVG',
    dimensions: { width: 150, height: 50, unit: 'mm' },
    engravingType: 'vector',
    createdAt: '12 Feb 2026',
    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b7993125486?auto=format&fit=crop&q=80&w=300',
    isCorporate: true,
    description: 'Logo principal para grabado en mesas de juntas.'
  },
  {
    id: 'des-002',
    name: 'Frase Aniversario',
    type: 'phrase',
    format: 'PDF',
    dimensions: { width: 80, height: 20, unit: 'mm' },
    engravingType: 'deep',
    createdAt: '10 Feb 2026',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=300',
    isCorporate: false,
    description: 'Para regalo de aniversario padres.'
  },
  {
    id: 'des-003',
    name: 'Isotipo Minimalista',
    type: 'logo',
    format: 'PNG',
    dimensions: { width: 40, height: 40, unit: 'mm' },
    engravingType: 'filled',
    createdAt: '01 Feb 2026',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=300',
    isCorporate: true,
    description: 'Versión pequeña para posavasos.'
  }
];

// --- Components ---

const EmptyState = ({ onCreate }: { onCreate: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-wood-50/50 dark:bg-wood-900/20 rounded-2xl border-2 border-dashed border-wood-200 dark:border-wood-800">
    <div className="w-20 h-20 bg-wood-100 dark:bg-wood-800 rounded-full flex items-center justify-center mb-6">
      <ImageIcon className="w-8 h-8 text-wood-400 dark:text-wood-500 opacity-60" />
    </div>
    <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100 mb-2">Aún no tienes diseños guardados</h3>
    <p className="text-sm text-wood-500 dark:text-wood-400 max-w-sm mb-8">
      Sube tus logos, frases o gráficos favoritos para reutilizarlos en tus próximos pedidos personalizados.
    </p>
    <button 
      onClick={onCreate}
      className="px-6 py-3 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
    >
      Crear primer diseño
    </button>
  </div>
);

const DesignCardSkeleton = () => (
  <div className="bg-white dark:bg-wood-900 rounded-2xl p-4 border border-wood-100 dark:border-wood-800 space-y-4">
    <div className="h-40 bg-wood-100 dark:bg-wood-800 rounded-xl animate-pulse" />
    <div className="h-4 w-3/4 bg-wood-100 dark:bg-wood-800 rounded animate-pulse" />
    <div className="flex gap-2">
      <div className="h-3 w-1/3 bg-wood-100 dark:bg-wood-800 rounded animate-pulse" />
      <div className="h-3 w-1/3 bg-wood-100 dark:bg-wood-800 rounded animate-pulse" />
    </div>
  </div>
);

// --- Main Component ---

export const SavedDesigns = () => {
  // State
  const [designs, setDesigns] = useState<DesignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'personal' | 'corporate'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<DesignItem | null>(null);

  // Mock B2B Status (This would come from user context)
  const isB2BUser = true;

  // Load Data Simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDesigns(MOCK_DESIGNS);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter Logic
  const filteredDesigns = designs.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filter === 'all' 
      ? true 
      : filter === 'corporate' ? d.isCorporate 
      : !d.isCorporate;
    return matchesSearch && matchesType;
  });

  // Handlers
  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este diseño?')) {
      setDesigns(prev => prev.filter(d => d.id !== id));
      toast.success('Diseño eliminado correctamente');
    }
  };

  const handleDuplicate = (design: DesignItem) => {
    const newDesign = {
      ...design,
      id: `des-${Date.now()}`,
      name: `${design.name} (Copia)`,
      createdAt: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    setDesigns([newDesign, ...designs]);
    toast.success('Diseño duplicado');
  };

  const handleUseInOrder = (design: DesignItem) => {
    toast.loading(`Cargando configurador con "${design.name}"...`);
    // Simulate redirection
    setTimeout(() => {
      toast.dismiss();
      toast.success('Diseño aplicado a la configuración');
      // Logic to redirect would go here
    }, 1500);
  };

  const handleSaveDesign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newDesign: DesignItem = {
      id: editingDesign ? editingDesign.id : `des-${Date.now()}`,
      name: formData.get('name') as string,
      type: formData.get('type') as DesignType,
      format: 'SVG', // Mocked
      dimensions: {
        width: Number(formData.get('width')),
        height: Number(formData.get('height')),
        unit: 'mm'
      },
      engravingType: formData.get('engravingType') as EngravingType,
      createdAt: editingDesign ? editingDesign.createdAt : new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
      thumbnail: editingDesign?.thumbnail || 'https://images.unsplash.com/photo-1589330694653-4a8b243ea722?auto=format&fit=crop&q=80&w=300', // Mock placeholder
      isCorporate: formData.get('context') === 'corporate',
      description: formData.get('description') as string
    };

    if (editingDesign) {
      setDesigns(designs.map(d => d.id === newDesign.id ? newDesign : d));
      toast.success('Diseño actualizado');
    } else {
      setDesigns([newDesign, ...designs]);
      toast.success('Nuevo diseño guardado');
    }
    
    setIsModalOpen(false);
    setEditingDesign(null);
  };

  return (
    <div className="space-y-8 relative">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100 mb-1 flex items-center gap-2">
            Mis Diseños
            {isB2BUser && <span className="text-[10px] bg-accent-gold text-wood-900 px-2 py-0.5 rounded font-bold uppercase tracking-wide">Pro</span>}
          </h2>
          <p className="text-sm text-wood-500 dark:text-wood-400">Guarda y reutiliza tus diseños personalizados.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wood-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-wood-900"
            />
          </div>
          <button 
            onClick={() => { setEditingDesign(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nuevo Diseño</span>
          </button>
        </div>
      </div>

      {/* --- B2B Filters --- */}
      {isB2BUser && (
        <div className="flex items-center gap-6 border-b border-wood-100 dark:border-wood-800">
          <button 
            onClick={() => setFilter('all')}
            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all ${filter === 'all' ? 'border-b-2 border-wood-900 dark:border-sand-100 text-wood-900 dark:text-sand-100' : 'text-wood-400 hover:text-wood-600'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter('corporate')}
            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'corporate' ? 'border-b-2 border-wood-900 dark:border-sand-100 text-wood-900 dark:text-sand-100' : 'text-wood-400 hover:text-wood-600'}`}
          >
            <Briefcase className="w-3 h-3" /> Corporativos
          </button>
          <button 
            onClick={() => setFilter('personal')}
            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all ${filter === 'personal' ? 'border-b-2 border-wood-900 dark:border-sand-100 text-wood-900 dark:text-sand-100' : 'text-wood-400 hover:text-wood-600'}`}
          >
            Personales
          </button>
        </div>
      )}

      {/* --- Content Grid --- */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <DesignCardSkeleton key={i} />)}
        </div>
      ) : filteredDesigns.length === 0 ? (
        <EmptyState onCreate={() => setIsModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredDesigns.map((design) => (
              <motion.div
                key={design.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group bg-white dark:bg-wood-900 rounded-2xl border border-wood-100 dark:border-wood-800 overflow-hidden hover:shadow-xl hover:border-wood-300 dark:hover:border-wood-600 transition-all duration-300 flex flex-col relative"
              >
                {/* Corporate Badge */}
                {design.isCorporate && (
                  <div className="absolute top-3 left-3 z-10 bg-wood-900/90 dark:bg-sand-100/90 backdrop-blur text-sand-50 dark:text-wood-900 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                    <Briefcase className="w-3 h-3" /> Corp
                  </div>
                )}

                {/* Preview Image */}
                <div className="relative h-48 bg-wood-50 dark:bg-wood-800 overflow-hidden">
                  <img 
                    src={design.thumbnail} 
                    alt={design.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button 
                      onClick={() => { setEditingDesign(design); setIsModalOpen(true); }}
                      className="p-2 bg-white/20 backdrop-blur hover:bg-white text-white hover:text-wood-900 rounded-full transition-all transform hover:scale-110"
                      title="Editar"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDuplicate(design)}
                      className="p-2 bg-white/20 backdrop-blur hover:bg-white text-white hover:text-wood-900 rounded-full transition-all transform hover:scale-110"
                      title="Duplicar"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(design.id)}
                      className="p-2 bg-red-500/20 backdrop-blur hover:bg-red-500 text-white rounded-full transition-all transform hover:scale-110"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-serif text-lg text-wood-900 dark:text-sand-100 leading-tight">{design.name}</h3>
                      <span className="text-[10px] font-mono text-wood-400">{design.format}</span>
                    </div>
                    <p className="text-xs text-wood-500 dark:text-wood-400 mb-2">{design.description || 'Sin descripción'}</p>
                    
                    <div className="flex flex-wrap gap-2">
                       <span className="px-2 py-1 bg-wood-50 dark:bg-wood-800 rounded text-[10px] font-medium text-wood-600 dark:text-sand-300 border border-wood-100 dark:border-wood-700">
                         {design.dimensions.width}x{design.dimensions.height}{design.dimensions.unit}
                       </span>
                       <span className="px-2 py-1 bg-wood-50 dark:bg-wood-800 rounded text-[10px] font-medium text-wood-600 dark:text-sand-300 border border-wood-100 dark:border-wood-700">
                         Grabado {design.engravingType}
                       </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-wood-100 dark:border-wood-800 flex items-center justify-between">
                    <span className="text-[10px] text-wood-400">Creado: {design.createdAt}</span>
                    <button 
                      onClick={() => handleUseInOrder(design)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                    >
                      <ShoppingBag className="w-3 h-3" /> Usar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* --- Create/Edit Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-wood-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-wood-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-wood-100 dark:border-wood-800 flex items-center justify-between bg-wood-50/50 dark:bg-wood-800/50">
                <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100">
                  {editingDesign ? 'Editar Diseño' : 'Crear Nuevo Diseño'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-wood-500 hover:bg-wood-200/50 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveDesign} className="overflow-y-auto custom-scrollbar p-6 space-y-6">
                
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-wood-200 dark:border-wood-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-wood-50 dark:hover:bg-wood-800/30 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-wood-100 dark:bg-wood-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-wood-500 dark:text-wood-400" />
                  </div>
                  <p className="text-sm font-medium text-wood-900 dark:text-sand-100 mb-1">Haz clic para subir o arrastra tu archivo</p>
                  <p className="text-xs text-wood-500 dark:text-wood-400">Soporta SVG, PNG, JPG (Max 5MB)</p>
                  <p className="text-[10px] text-accent-gold mt-2 font-bold uppercase tracking-widest">Recomendado: Archivos Vectoriales</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-wood-500 mb-2">Nombre del Diseño</label>
                      <input 
                        name="name"
                        defaultValue={editingDesign?.name}
                        required
                        className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-sm focus:ring-2 focus:ring-wood-900 outline-none dark:text-sand-100"
                        placeholder="Ej: Logo Corporativo 2024"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-wood-500 mb-2">Tipo</label>
                      <select 
                        name="type"
                        defaultValue={editingDesign?.type || 'logo'}
                        className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-sm focus:ring-2 focus:ring-wood-900 outline-none dark:text-sand-100"
                      >
                        <option value="logo">Logotipo</option>
                        <option value="phrase">Frase / Texto</option>
                        <option value="image">Imagen / Fotografía</option>
                        <option value="corporate">Identidad Corporativa</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                       <label className="block text-xs font-bold uppercase tracking-widest text-wood-500 mb-2">Dimensiones (mm)</label>
                       <div className="flex gap-4">
                         <div className="relative flex-1">
                           <input name="width" type="number" defaultValue={editingDesign?.dimensions.width || 100} className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-sm outline-none dark:text-sand-100" placeholder="Ancho" />
                           <span className="absolute right-3 top-3.5 text-xs text-wood-400">W</span>
                         </div>
                         <div className="relative flex-1">
                           <input name="height" type="number" defaultValue={editingDesign?.dimensions.height || 100} className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-sm outline-none dark:text-sand-100" placeholder="Alto" />
                           <span className="absolute right-3 top-3.5 text-xs text-wood-400">H</span>
                         </div>
                       </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-wood-500 mb-2">Tipo de Grabado</label>
                      <select 
                        name="engravingType"
                        defaultValue={editingDesign?.engravingType || 'superficial'}
                        className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-sm focus:ring-2 focus:ring-wood-900 outline-none dark:text-sand-100"
                      >
                        <option value="superficial">Superficial (Ligero)</option>
                        <option value="deep">Profundo (Con textura)</option>
                        <option value="filled">Relleno (Contraste alto)</option>
                        <option value="vector">Vectorial (Solo líneas)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold uppercase tracking-widest text-wood-500 mb-2">Descripción (Opcional)</label>
                   <textarea 
                     name="description"
                     defaultValue={editingDesign?.description}
                     rows={3}
                     className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-sm focus:ring-2 focus:ring-wood-900 outline-none resize-none dark:text-sand-100"
                     placeholder="Notas sobre dónde aplicar este diseño..."
                   />
                </div>

                {isB2BUser && (
                  <div className="flex items-center gap-3 p-4 bg-wood-50 dark:bg-wood-800 rounded-xl border border-wood-200 dark:border-wood-700">
                    <input 
                      type="checkbox" 
                      name="context" 
                      value="corporate"
                      defaultChecked={editingDesign?.isCorporate}
                      className="w-5 h-5 rounded border-wood-300 text-wood-900 focus:ring-wood-900"
                    />
                    <div>
                      <p className="text-sm font-bold text-wood-900 dark:text-sand-100">Guardar como Diseño Corporativo</p>
                      <p className="text-xs text-wood-500 dark:text-wood-400">Estará disponible para todo tu equipo en el Espacio B2B.</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border border-wood-200 dark:border-wood-700 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-wood-50 dark:hover:bg-wood-800 dark:text-sand-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-3 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-xl text-sm font-bold uppercase tracking-widest hover:shadow-lg transition-shadow"
                  >
                    {editingDesign ? 'Guardar Cambios' : 'Crear Diseño'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
