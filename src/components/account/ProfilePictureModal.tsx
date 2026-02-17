"use client";

import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, ZoomIn, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import getCroppedImg from '@/utils/image';

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage?: string;
  onSave: (newImage: Blob) => void;
}

export const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({ isOpen, onClose, currentImage, onSave }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || null);
        setZoom(1); // Reset zoom on new image
      });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setLoading(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        onSave(croppedImage);
        onClose();
        toast.success('Foto de perfil actualizada correctamente');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error al procesar la imagen');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Reset state when closing or opening if needed, but for now relying on unmount/mount of AnimatePresence logic if used conditionally,
  // or just manual cleanup. Here we keep state if simply hidden, but let's reset if imageSrc is null on open? 
  // Actually, keeping state is fine.

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-wood-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg bg-white dark:bg-wood-900 shadow-2xl overflow-hidden rounded-xl border border-wood-100 dark:border-wood-800 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-wood-100 dark:border-wood-800 flex items-center justify-between bg-wood-50/50 dark:bg-wood-800/50">
              <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100">Foto de Perfil</h3>
              <button 
                onClick={onClose}
                className="p-2 text-wood-500 hover:text-wood-900 dark:hover:text-sand-100 transition-colors rounded-full hover:bg-wood-200/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto min-h-[400px] flex flex-col">
              {!imageSrc ? (
                <div 
                  className="flex-1 border-2 border-dashed border-wood-200 dark:border-wood-700 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-wood-400 dark:hover:border-wood-500 transition-colors cursor-pointer bg-wood-50/30 dark:bg-wood-800/20 group"
                  onClick={triggerFileInput}
                >
                  <div className="w-16 h-16 bg-white dark:bg-wood-800 rounded-full flex items-center justify-center shadow-sm text-wood-400 dark:text-wood-500 group-hover:text-wood-900 dark:group-hover:text-sand-100 group-hover:scale-110 transition-all duration-300">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-wood-900 dark:text-sand-100 font-medium text-lg">Subir nueva foto</p>
                    <p className="text-wood-500 dark:text-wood-400 text-sm mt-1">PNG o JPG hasta 5MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-6">
                  <div className="relative w-full h-[300px] bg-wood-900 rounded-xl overflow-hidden shadow-inner">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                      cropShape="round"
                      showGrid={false}
                      style={{ containerStyle: { background: 'transparent' } }}
                    />
                  </div>
                  
                  <div className="space-y-3 px-2">
                    <div className="flex items-center justify-between text-sm text-wood-500 dark:text-wood-400 mb-1">
                      <span className="flex items-center gap-2"><ZoomIn className="w-4 h-4" /> Zoom</span>
                      <span>{Math.round(zoom * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-1.5 bg-wood-200 dark:bg-wood-700 rounded-lg appearance-none cursor-pointer accent-wood-900 dark:accent-sand-100"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      onClick={() => setImageSrc(null)}
                      className="px-4 py-2 text-sm font-medium text-wood-600 dark:text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 transition-colors"
                    >
                      Cambiar imagen
                    </button>
                  </div>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-wood-100 dark:border-wood-800 bg-wood-50/30 dark:bg-wood-800/30 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg border border-wood-200 dark:border-wood-700 text-wood-600 dark:text-wood-300 font-medium text-sm hover:bg-white dark:hover:bg-wood-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={!imageSrc || loading}
                className="px-5 py-2.5 rounded-lg bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 font-medium text-sm hover:bg-wood-800 dark:hover:bg-sand-200 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Guardar Foto
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
