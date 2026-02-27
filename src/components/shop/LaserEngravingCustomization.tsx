"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UploadCloud, 
  FileImage, 
  X, 
  Ruler, 
  Grid, 
  Check, 
  AlertCircle, 
  Info,
  Loader2,
  Maximize,
  Plus,
  Gift
} from 'lucide-react';

import type { LaserCustomizationData, LaserDesign } from '@/lib/commerce/types';
import {
  LASER_EXTRA_DESIGN_PRICE_MXN,
  LASER_FREE_DESIGNS_PER_ORDER,
  LASER_MAX_DESIGNS_PER_ORDER,
  LASER_MAX_FILE_SIZE,
  LASER_ACCEPTED_TYPES,
} from '@/config/laser-engraving';

interface LaserEngravingCustomizationProps {
  maxArea?: { width: number; height: number };
  onChange?: (data: LaserCustomizationData | null) => void;
}

type EngravingPosition = 'center' | 'bottom-right' | 'bottom-left' | 'custom';

function createEmptyDesign(): LaserDesign {
  return {
    id: crypto.randomUUID(),
    fileUrl: null,
    fileName: null,
    widthCm: null,
    heightCm: null,
    position: 'center',
    uploading: false,
  };
}

export const LaserEngravingCustomization: React.FC<LaserEngravingCustomizationProps> = ({
  maxArea = { width: 20, height: 15 },
  onChange,
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [designs, setDesigns] = useState<LaserDesign[]>([createEmptyDesign()]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const extraDesignCount = Math.max(0, designs.length - LASER_FREE_DESIGNS_PER_ORDER);
  const extraCost = extraDesignCount * LASER_EXTRA_DESIGN_PRICE_MXN;

  // Emit state to parent
  useEffect(() => {
    if (!onChange) return;
    if (!isEnabled) {
      onChange(null);
      return;
    }
    onChange({
      enabled: isEnabled,
      designs,
      confirmed: isConfirmed,
      extraDesignCount,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled, designs, isConfirmed, extraDesignCount]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      Object.values(previews).forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const validateFile = (file: File): string | null => {
    if (!LASER_ACCEPTED_TYPES.includes(file.type)) {
      return 'Formato no soportado. Usa SVG, PNG o JPG.';
    }
    if (file.size > LASER_MAX_FILE_SIZE) {
      return 'El archivo excede los 10MB.';
    }
    return null;
  };

  const handleFile = useCallback(async (designId: string, file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrors(prev => ({ ...prev, [designId]: error }));
      return;
    }

    setErrors(prev => { const n = { ...prev }; delete n[designId]; return n; });
    setPreviews(prev => ({ ...prev, [designId]: URL.createObjectURL(file) }));

    // Mark uploading
    setDesigns(prev => prev.map(d =>
      d.id === designId ? { ...d, fileName: file.name, uploading: true } : d
    ));

    try {
      const { uploadLaserDesign } = await import('@/lib/supabase/upload-laser-design');
      const url = await uploadLaserDesign(file);
      setDesigns(prev => prev.map(d =>
        d.id === designId ? { ...d, fileUrl: url, uploading: false } : d
      ));
    } catch {
      setErrors(prev => ({ ...prev, [designId]: 'Error al subir. Intenta de nuevo.' }));
      setDesigns(prev => prev.map(d =>
        d.id === designId ? { ...d, uploading: false } : d
      ));
    }
  }, []);

  const removeDesign = async (designId: string) => {
    const design = designs.find(d => d.id === designId);
    if (design?.fileUrl) {
      try {
        const { deleteLaserDesign } = await import('@/lib/supabase/upload-laser-design');
        await deleteLaserDesign(design.fileUrl);
      } catch { /* silent */ }
    }
    if (previews[designId]) {
      URL.revokeObjectURL(previews[designId]);
      setPreviews(prev => { const n = { ...prev }; delete n[designId]; return n; });
    }
    // If it's the only design, reset it instead of removing
    if (designs.length === 1) {
      setDesigns([createEmptyDesign()]);
    } else {
      setDesigns(prev => prev.filter(d => d.id !== designId));
    }
  };

  const addDesign = () => {
    if (designs.length >= LASER_MAX_DESIGNS_PER_ORDER) return;
    setDesigns(prev => [...prev, createEmptyDesign()]);
  };

  const updateDesignDimension = (designId: string, field: 'widthCm' | 'heightCm', value: string) => {
    if (value !== '' && isNaN(Number(value))) return;
    const numVal = Number(value);
    const limit = field === 'widthCm' ? maxArea.width : maxArea.height;

    if (value !== '' && numVal > limit) {
      setErrors(prev => ({
        ...prev,
        [`${designId}_dim`]: `Excede el área permitida (${maxArea.width}cm × ${maxArea.height}cm).`,
      }));
    } else {
      setErrors(prev => { const n = { ...prev }; delete n[`${designId}_dim`]; return n; });
    }

    setDesigns(prev => prev.map(d =>
      d.id === designId ? { ...d, [field]: value === '' ? null : numVal } : d
    ));
  };

  const updateDesignPosition = (designId: string, position: EngravingPosition) => {
    setDesigns(prev => prev.map(d =>
      d.id === designId ? { ...d, position } : d
    ));
  };

  return (
    <div className="w-full mb-8 rounded-xl border border-wood-200 dark:border-wood-800 bg-white dark:bg-wood-900/40 overflow-hidden transition-colors">

      {/* Toggle Header */}
      <div
        className="p-5 flex items-center justify-between cursor-pointer select-none group"
        onClick={() => setIsEnabled(!isEnabled)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isEnabled ? 'bg-accent-gold border-accent-gold' : 'border-wood-400 group-hover:border-wood-600'}`}>
            {isEnabled && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
          </div>
          <span className="font-serif text-lg text-wood-900 dark:text-sand-100 font-medium">
            Personalizar con grabado láser
          </span>
        </div>
        <span className="flex items-center gap-2 font-medium text-green-700 dark:text-green-400">
          <Gift className="w-4 h-4" />
          Incluido
        </span>
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-8 pt-2 space-y-6 border-t border-wood-100 dark:border-wood-800">

              {/* Info Banner */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex gap-3 border border-green-200 dark:border-green-800">
                <Gift className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-green-800 dark:text-green-200">
                    Tu primer diseño es gratis
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 font-medium leading-relaxed">
                    Incluimos un grabado personalizado con tu compra. Si deseas diseños adicionales diferentes, cada uno tiene un costo de ${LASER_EXTRA_DESIGN_PRICE_MXN} MXN.
                  </p>
                </div>
              </div>

              {/* Designs List */}
              {designs.map((design, index) => (
                <DesignCard
                  key={design.id}
                  design={design}
                  index={index}
                  isFree={index < LASER_FREE_DESIGNS_PER_ORDER}
                  maxArea={maxArea}
                  previewUrl={previews[design.id] ?? null}
                  error={errors[design.id] ?? null}
                  dimError={errors[`${design.id}_dim`] ?? null}
                  canRemove={designs.length > 1}
                  inputRef={(el) => { inputRefs.current[design.id] = el; }}
                  onFile={(file) => handleFile(design.id, file)}
                  onRemoveFile={() => removeDesign(design.id)}
                  onDimensionChange={(field, val) => updateDesignDimension(design.id, field, val)}
                  onPositionChange={(pos) => updateDesignPosition(design.id, pos)}
                  onRemoveDesign={() => removeDesign(design.id)}
                />
              ))}

              {/* Add Design Button */}
              {designs.length < LASER_MAX_DESIGNS_PER_ORDER && (
                <button
                  onClick={addDesign}
                  className="w-full py-3 border-2 border-dashed border-wood-300 dark:border-wood-600 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold text-wood-600 dark:text-sand-300 hover:border-accent-gold hover:text-accent-gold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar otro diseño (+${LASER_EXTRA_DESIGN_PRICE_MXN} MXN)
                </button>
              )}

              {/* Auto-conversion Info */}
              <div className="bg-wood-100 dark:bg-wood-800/40 p-4 rounded-lg flex gap-3 border border-wood-200 dark:border-wood-700">
                <Info className="w-5 h-5 text-wood-700 dark:text-sand-200 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-wood-900 dark:text-sand-100">
                    Optimización automática
                  </p>
                  <p className="text-xs text-wood-700 dark:text-sand-200 font-medium leading-relaxed">
                    Convertiremos tu imagen a escala de grises y vectorizaremos los trazos para garantizar un grabado limpio y duradero.
                  </p>
                </div>
              </div>

              {/* Confirmation & Cost Summary */}
              <div className="pt-4 border-t border-wood-200 dark:border-wood-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${isConfirmed ? 'bg-wood-900 dark:bg-sand-100 border-wood-900 dark:border-sand-100' : 'border-wood-400 dark:border-wood-500 group-hover:border-wood-600'}`}>
                    {isConfirmed && <Check size={10} className="text-white dark:text-wood-900" strokeWidth={4} />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isConfirmed}
                    onChange={() => setIsConfirmed(!isConfirmed)}
                  />
                  <span className="text-xs font-medium text-wood-800 dark:text-sand-200 select-none">
                    Confirmo que mis archivos cumplen con las especificaciones.
                  </span>
                </label>

                <div className="text-right">
                  {extraDesignCount > 0 ? (
                    <>
                      <span className="block text-[10px] text-wood-600 dark:text-sand-300 font-bold uppercase tracking-widest">
                        {extraDesignCount} diseño{extraDesignCount > 1 ? 's' : ''} adicional{extraDesignCount > 1 ? 'es' : ''}
                      </span>
                      <span className="text-lg font-serif font-bold text-wood-900 dark:text-sand-100">
                        +${extraCost} MXN
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="block text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-widest">
                        Grabado incluido
                      </span>
                      <span className="text-lg font-serif font-bold text-green-700 dark:text-green-400">
                        Gratis
                      </span>
                    </>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Individual Design Card ─────────────────────────────

interface DesignCardProps {
  design: LaserDesign;
  index: number;
  isFree: boolean;
  maxArea: { width: number; height: number };
  previewUrl: string | null;
  error: string | null;
  dimError: string | null;
  canRemove: boolean;
  inputRef: (el: HTMLInputElement | null) => void;
  onFile: (file: File) => void;
  onRemoveFile: () => void;
  onDimensionChange: (field: 'widthCm' | 'heightCm', value: string) => void;
  onPositionChange: (position: EngravingPosition) => void;
  onRemoveDesign: () => void;
}

const DesignCard: React.FC<DesignCardProps> = ({
  design,
  index,
  isFree,
  maxArea,
  previewUrl,
  error,
  dimError,
  canRemove,
  inputRef,
  onFile,
  onRemoveFile,
  onDimensionChange,
  onPositionChange,
  onRemoveDesign,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) onFile(e.dataTransfer.files[0]);
  };

  return (
    <div className={`p-5 rounded-lg border ${isFree ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10' : 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-wood-900 dark:text-sand-100">
            Diseño #{index + 1}
          </span>
          {isFree ? (
            <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
              Incluido
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              +${LASER_EXTRA_DESIGN_PRICE_MXN} MXN
            </span>
          )}
        </div>
        {canRemove && (
          <button
            onClick={onRemoveDesign}
            className="p-1.5 text-wood-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* File Upload */}
      <div className="space-y-3 mb-4">
        <label className="text-xs font-bold uppercase tracking-wider text-wood-900 dark:text-sand-100">
          Sube tu diseño
        </label>

        {!design.fileName ? (
          <div
            className={`relative h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-3 transition-all ${
              dragActive
                ? 'border-accent-gold bg-accent-gold/5'
                : 'border-wood-300 dark:border-wood-600 hover:border-wood-500'
            } ${error ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={(el) => {
                fileInputRef.current = el;
                inputRef(el);
              }}
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              accept=".svg,.png,.jpg,.jpeg"
            />
            <div className="pointer-events-none space-y-1">
              <UploadCloud size={20} className="mx-auto text-wood-500" />
              <p className="text-sm text-wood-700 dark:text-sand-200 font-semibold">Arrastra o haz clic</p>
              <p className="text-[10px] text-wood-500 font-medium">SVG, PNG, JPG (Máx. 10MB)</p>
            </div>
            {error && (
              <div className="absolute bottom-1 text-[10px] text-red-600 flex items-center gap-1">
                <AlertCircle size={10} /> {error}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 border border-wood-200 dark:border-wood-700 rounded-lg bg-wood-50 dark:bg-wood-800/30">
            <div className="w-12 h-12 bg-white dark:bg-wood-900 rounded border border-wood-100 dark:border-wood-700 flex items-center justify-center overflow-hidden shrink-0">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <FileImage className="text-wood-400" size={18} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-wood-900 dark:text-sand-100 truncate">{design.fileName}</p>
              <p className="text-[10px] text-wood-600 dark:text-sand-200 font-medium">
                {design.uploading ? (
                  <span className="inline-flex items-center gap-1 text-accent-gold">
                    <Loader2 size={10} className="animate-spin" /> Subiendo...
                  </span>
                ) : design.fileUrl ? (
                  <span className="text-green-600 dark:text-green-400">✓ Subido</span>
                ) : (
                  'Procesando...'
                )}
              </p>
            </div>
            <button onClick={onRemoveFile} className="p-1.5 text-wood-400 hover:text-red-500 rounded-full transition-colors">
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Dimensions */}
      <div className="space-y-2 mb-4">
        <label className="text-xs font-bold uppercase tracking-wider text-wood-900 dark:text-sand-100 flex items-center gap-1.5">
          <Ruler size={12} /> Dimensiones (cm)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Ancho"
            value={design.widthCm ?? ''}
            onChange={(e) => onDimensionChange('widthCm', e.target.value)}
            className="flex-1 bg-transparent border-b border-wood-400 dark:border-wood-500 py-1.5 text-sm text-wood-900 dark:text-sand-100 placeholder:text-wood-400 font-medium focus:border-accent-gold focus:outline-none transition-colors"
          />
          <span className="text-wood-500 text-xs">×</span>
          <input
            type="text"
            placeholder="Alto"
            value={design.heightCm ?? ''}
            onChange={(e) => onDimensionChange('heightCm', e.target.value)}
            className="flex-1 bg-transparent border-b border-wood-400 dark:border-wood-500 py-1.5 text-sm text-wood-900 dark:text-sand-100 placeholder:text-wood-400 font-medium focus:border-accent-gold focus:outline-none transition-colors"
          />
        </div>
        {dimError ? (
          <p className="text-[10px] text-red-600 font-medium">{dimError}</p>
        ) : (
          <p className="text-[10px] text-wood-500 font-medium">Máx: {maxArea.width}cm × {maxArea.height}cm</p>
        )}
      </div>

      {/* Position */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-wood-900 dark:text-sand-100 flex items-center gap-1.5">
          <Grid size={12} /> Ubicación
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'center', label: 'Centro' },
            { id: 'bottom-left', label: 'Izq. Inf.' },
            { id: 'bottom-right', label: 'Der. Inf.' },
            { id: 'custom', label: 'Personalizado' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => onPositionChange(opt.id as EngravingPosition)}
              className={`py-2 px-1 rounded border text-[10px] font-semibold transition-all ${
                design.position === opt.id
                  ? 'border-accent-gold bg-accent-gold/10 text-wood-900 dark:text-sand-100'
                  : 'border-wood-300 dark:border-wood-600 text-wood-500 hover:border-wood-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
