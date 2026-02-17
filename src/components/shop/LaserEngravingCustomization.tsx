import React, { useState, useRef, useEffect } from 'react';
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
  Maximize
} from 'lucide-react';

interface LaserEngravingCustomizationProps {
  maxArea?: { width: number; height: number }; // In cm
  basePrice?: number;
}

type EngravingPosition = 'center' | 'bottom-right' | 'bottom-left' | 'custom';

export const LaserEngravingCustomization: React.FC<LaserEngravingCustomizationProps> = ({
  maxArea = { width: 20, height: 15 }, // Default max engraving area
  basePrice = 70
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [dimensions, setDimensions] = useState({ width: '', height: '' });
  const [position, setPosition] = useState<EngravingPosition>('center');
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const inputRef = useRef<HTMLInputElement>(null);

  // Price Calculation
  const currentPrice = basePrice; // Could add logic for larger sizes

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, file: 'Formato no soportado. Usa SVG, PNG o JPG.' }));
      return false;
    }
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, file: 'El archivo excede los 10MB.' }));
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.file;
      return newErrors;
    });

    if (validateFile(file)) {
      setFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDimensionChange = (field: 'width' | 'height', value: string) => {
    // Allow empty or numeric
    if (value !== '' && isNaN(Number(value))) return;

    setDimensions(prev => ({ ...prev, [field]: value }));
    
    // Validate
    const numVal = Number(value);
    const limit = field === 'width' ? maxArea.width : maxArea.height;
    
    if (numVal > limit) {
      setErrors(prev => ({ 
        ...prev, 
        dimensions: `El tamaño excede el área permitida (${maxArea.width}cm x ${maxArea.height}cm).` 
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.dimensions;
        return newErrors;
      });
    }
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
            Agregar grabado láser personalizado
          </span>
        </div>
        <span className="font-medium text-wood-900 dark:text-sand-100">
          +${basePrice} MXN
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
            <div className="px-6 pb-8 pt-2 space-y-8 border-t border-wood-100 dark:border-wood-800">
              
              {/* A. File Upload */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <label className="text-sm font-bold uppercase tracking-wider text-wood-900 dark:text-sand-100">
                    Sube tu diseño
                  </label>
                  <button className="text-xs font-medium text-wood-600 dark:text-sand-200 hover:text-wood-900 dark:hover:text-sand-100 hover:underline">
                    Ver guía de preparación
                  </button>
                </div>

                {!file ? (
                  <div 
                    className={`relative h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-4 transition-all ${
                      dragActive 
                        ? 'border-accent-gold bg-accent-gold/5' 
                        : 'border-wood-300 dark:border-wood-600 hover:border-wood-500 dark:hover:border-wood-400'
                    } ${errors.file ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input 
                      ref={inputRef}
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      accept=".svg,.png,.jpg,.jpeg"
                    />
                    <div className="pointer-events-none space-y-2">
                      <div className="w-10 h-10 bg-wood-200 dark:bg-wood-700 rounded-full flex items-center justify-center mx-auto text-wood-700 dark:text-sand-100">
                        <UploadCloud size={20} />
                      </div>
                      <div>
                        <p className="text-wood-900 dark:text-sand-100 font-semibold">
                          Arrastra tu imagen aquí o haz clic
                        </p>
                        <p className="text-xs text-wood-600 dark:text-sand-200 font-medium mt-1">
                          SVG, PNG, JPG (Máx. 10MB)
                        </p>
                      </div>
                    </div>
                    {errors.file && (
                      <div className="absolute bottom-2 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.file}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 border border-wood-200 dark:border-wood-700 rounded-lg bg-wood-50 dark:bg-wood-800/30">
                    <div className="w-16 h-16 bg-white dark:bg-wood-900 rounded border border-wood-100 dark:border-wood-700 flex items-center justify-center overflow-hidden shrink-0">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                      ) : (
                        <FileImage className="text-wood-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-wood-900 dark:text-sand-100 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-wood-600 dark:text-sand-200 font-medium">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Listo para procesar
                      </p>
                    </div>
                    <button 
                      onClick={removeFile}
                      className="p-2 text-wood-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* B. Dimensions */}
              <div className="space-y-3">
                 <label className="text-sm font-bold uppercase tracking-wider text-wood-900 dark:text-sand-100 flex items-center gap-2">
                    <Ruler size={14} /> Dimensiones (cm)
                  </label>
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-1">
                       <input 
                          type="text" 
                          placeholder="Ancho"
                          value={dimensions.width}
                          onChange={(e) => handleDimensionChange('width', e.target.value)}
                          className="w-full bg-transparent border-b border-wood-400 dark:border-wood-500 py-2 text-wood-900 dark:text-sand-100 placeholder:text-wood-500 dark:placeholder:text-wood-400 font-medium focus:border-accent-gold focus:outline-none transition-colors"
                       />
                    </div>
                    <span className="pt-2 text-wood-600 dark:text-sand-200">x</span>
                    <div className="flex-1 space-y-1">
                       <input 
                          type="text" 
                          placeholder="Alto"
                          value={dimensions.height}
                          onChange={(e) => handleDimensionChange('height', e.target.value)}
                          className="w-full bg-transparent border-b border-wood-400 dark:border-wood-500 py-2 text-wood-900 dark:text-sand-100 placeholder:text-wood-500 dark:placeholder:text-wood-400 font-medium focus:border-accent-gold focus:outline-none transition-colors"
                       />
                    </div>
                  </div>
                  {errors.dimensions ? (
                    <p className="text-xs text-red-600 font-medium mt-1">{errors.dimensions}</p>
                  ) : (
                    <p className="text-xs text-wood-600 dark:text-sand-200 font-medium">
                      Área máxima disponible: {maxArea.width}cm x {maxArea.height}cm
                    </p>
                  )}
              </div>

              {/* C. Location */}
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-wood-900 dark:text-sand-100 flex items-center gap-2">
                  <Grid size={14} /> Ubicación
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { id: 'center', label: 'Centro' },
                    { id: 'bottom-left', label: 'Izq. Inf.' },
                    { id: 'bottom-right', label: 'Der. Inf.' },
                    { id: 'custom', label: 'Personalizado' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setPosition(opt.id as EngravingPosition)}
                      className={`py-3 px-2 rounded border text-xs font-semibold transition-all ${
                        position === opt.id
                          ? 'border-accent-gold bg-accent-gold/10 text-wood-900 dark:text-sand-100 shadow-sm'
                          : 'border-wood-300 dark:border-wood-600 text-wood-600 dark:text-sand-200 hover:border-wood-500 dark:hover:border-wood-400 hover:text-wood-900 dark:hover:text-sand-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                
                {/* Custom Position Preview */}
                <AnimatePresence>
                  {position === 'custom' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4"
                    >
                      <div className="relative aspect-[3/2] bg-wood-100 dark:bg-wood-800 rounded border border-dashed border-wood-300 dark:border-wood-600 flex items-center justify-center overflow-hidden">
                        <span className="absolute text-[10px] text-wood-400 uppercase tracking-widest top-2 left-2">Vista Previa (Arrastrar)</span>
                        <div className="w-full h-full relative cursor-crosshair">
                           {/* Mock Draggable Box - Just visual for now */}
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-12 border-2 border-accent-gold bg-accent-gold/20 flex items-center justify-center">
                              <Maximize size={10} className="text-accent-gold opacity-70" />
                           </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-center text-wood-600 dark:text-sand-200 font-medium mt-2">
                        Arrastra el recuadro para definir la posición exacta
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* D. Auto-conversion Info */}
              <div className="bg-wood-100 dark:bg-wood-800/40 p-4 rounded-lg flex gap-3 border border-wood-200 dark:border-wood-700">
                <Info className="w-5 h-5 text-wood-700 dark:text-sand-200 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-wood-900 dark:text-sand-100">
                    Optimización automática
                  </p>
                  <p className="text-xs text-wood-700 dark:text-sand-200 font-medium leading-relaxed">
                    Convertiremos tu imagen a escala de grises y vectorizaremos los trazos para garantizar un grabado limpio y duradero.
                  </p>
                  <button className="text-[10px] font-bold uppercase tracking-wider text-wood-800 dark:text-sand-100 hover:text-wood-900 hover:underline mt-2 transition-colors">
                    Ver simulación
                  </button>
                </div>
              </div>

              {/* E. Confirmation & Price */}
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
                    Confirmo que mi archivo cumple con las especificaciones.
                  </span>
                </label>

                <div className="text-right">
                  <span className="block text-[10px] text-wood-600 dark:text-sand-300 font-bold uppercase tracking-widest">Costo adicional</span>
                  <span className="text-lg font-serif font-bold text-wood-900 dark:text-sand-100">
                    +${currentPrice} MXN
                  </span>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
