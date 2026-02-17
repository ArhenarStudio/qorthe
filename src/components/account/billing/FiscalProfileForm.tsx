import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, Upload, Building2, MapPin, Mail, AlertCircle, Check, Briefcase, User, Info } from 'lucide-react';

interface FiscalProfileFormProps {
  onCancel: () => void;
}

export const FiscalProfileForm: React.FC<FiscalProfileFormProps> = ({ onCancel }) => {
  const [isB2B, setIsB2B] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-5xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-wood-100 dark:border-wood-800 pb-8">
        <div>
          <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100">Configuración Fiscal</h2>
          <p className="text-wood-500 dark:text-sand-400 text-sm mt-1 flex items-center gap-2">
            <Info className="w-4 h-4 text-wood-400" />
            <span>Datos requeridos para la emisión de CFDI 4.0</span>
          </p>
        </div>
        
        {/* Type Toggle */}
        <div className="flex bg-wood-100 dark:bg-wood-800 p-1.5 rounded-xl shadow-inner self-start">
          <button 
            onClick={() => setIsB2B(false)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              !isB2B 
                ? 'bg-white dark:bg-wood-600 text-wood-900 dark:text-sand-100 shadow-sm ring-1 ring-black/5' 
                : 'text-wood-500 dark:text-sand-400 hover:text-wood-800 dark:hover:text-sand-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Persona Física
          </button>
          <button 
            onClick={() => setIsB2B(true)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              isB2B 
                ? 'bg-white dark:bg-wood-600 text-wood-900 dark:text-sand-100 shadow-sm ring-1 ring-black/5' 
                : 'text-wood-500 dark:text-sand-400 hover:text-wood-800 dark:hover:text-sand-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Empresa (Moral)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Info Section */}
          <section className="bg-white dark:bg-wood-900 p-8 rounded-2xl border border-wood-100 dark:border-wood-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-wood-50 dark:border-wood-800">
              <div className="p-2 bg-wood-50 dark:bg-wood-800 rounded-lg text-wood-500 dark:text-sand-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-wood-900 dark:text-sand-100 uppercase tracking-widest">
                Datos de Identificación
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-wood-500 dark:text-sand-400 uppercase tracking-wider">RFC <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="XAXX010101000" 
                  className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-wood-900 dark:text-sand-100 placeholder:text-wood-300 focus:ring-2 focus:ring-wood-900/10 focus:border-wood-400 outline-none transition-all uppercase font-medium"
                  required
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-wood-500 dark:text-sand-400 uppercase tracking-wider">Razón Social <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="Nombre completo o Razón Social sin régimen de capital" 
                  className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-wood-900 dark:text-sand-100 placeholder:text-wood-300 focus:ring-2 focus:ring-wood-900/10 focus:border-wood-400 outline-none transition-all uppercase font-medium"
                  required
                />
                <p className="text-[10px] text-wood-400 flex gap-1">
                  <AlertCircle className="w-3 h-3" /> Debe coincidir exactamente con tu constancia de situación fiscal.
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-wood-500 dark:text-sand-400 uppercase tracking-wider">Régimen Fiscal <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-wood-900 dark:text-sand-100 focus:ring-2 focus:ring-wood-900/10 focus:border-wood-400 outline-none transition-all appearance-none cursor-pointer">
                    <option value="">Selecciona una opción...</option>
                    <option value="601">601 - General de Ley Personas Morales</option>
                    <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                    <option value="605">605 - Sueldos y Salarios e Ingresos Asimilados a Salarios</option>
                    <option value="606">606 - Arrendamiento</option>
                    <option value="612">612 - Personas Físicas con Actividades Empresariales y Profesionales</option>
                    <option value="626">626 - Régimen Simplificado de Confianza</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-wood-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-wood-500 dark:text-sand-400 uppercase tracking-wider">Uso de CFDI (Predeterminado) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-wood-900 dark:text-sand-100 focus:ring-2 focus:ring-wood-900/10 focus:border-wood-400 outline-none transition-all appearance-none cursor-pointer">
                    <option value="G03">G03 - Gastos en general</option>
                    <option value="G01">G01 - Adquisición de mercancías</option>
                    <option value="D04">D04 - Donativos</option>
                    <option value="CP01">CP01 - Pagos</option>
                    <option value="S01">S01 - Sin efectos fiscales</option>
                  </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-wood-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Address & Contact Section */}
          <section className="bg-white dark:bg-wood-900 p-8 rounded-2xl border border-wood-100 dark:border-wood-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-wood-50 dark:border-wood-800">
              <div className="p-2 bg-wood-50 dark:bg-wood-800 rounded-lg text-wood-500 dark:text-sand-400">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-wood-900 dark:text-sand-100 uppercase tracking-widest">
                Domicilio Fiscal
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-wood-500 dark:text-sand-400 uppercase tracking-wider">Código Postal <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="00000" 
                  maxLength={5}
                  className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-wood-900 dark:text-sand-100 focus:ring-2 focus:ring-wood-900/10 focus:border-wood-400 outline-none transition-all font-medium"
                  required
                />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-wood-500 dark:text-sand-400 uppercase tracking-wider">Calle y Número (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Av. Reforma 123, Int 401" 
                  className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-wood-900 dark:text-sand-100 focus:ring-2 focus:ring-wood-900/10 focus:border-wood-400 outline-none transition-all"
                />
              </div>

               <div className="md:col-span-3 space-y-2 pt-2">
                <label className="text-xs font-bold text-wood-500 dark:text-sand-400 uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Email de Envío <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  placeholder="facturacion@empresa.com" 
                  className="w-full px-4 py-3 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-xl text-wood-900 dark:text-sand-100 focus:ring-2 focus:ring-wood-900/10 focus:border-wood-400 outline-none transition-all"
                  required
                />
                <p className="text-[10px] text-wood-400">Email donde recibirás los XML y PDF.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Upload & Actions */}
        <div className="space-y-6">
          <div className="bg-wood-50 dark:bg-wood-800/30 p-8 rounded-2xl border-2 border-dashed border-wood-200 dark:border-wood-700 flex flex-col items-center justify-center text-center transition-colors hover:border-wood-400 hover:bg-wood-100/50">
            <div className="bg-white dark:bg-wood-700 p-4 rounded-full shadow-sm mb-4">
              <Upload className="w-8 h-8 text-wood-600 dark:text-sand-200" />
            </div>
            <h4 className="font-serif text-lg text-wood-900 dark:text-sand-100 mb-2">
              Constancia Fiscal
            </h4>
            <p className="text-xs text-wood-500 dark:text-sand-400 mb-6 max-w-[200px] leading-relaxed">
              Sube tu constancia en PDF para autocompletar y validar tus datos.
            </p>
            <button type="button" className="text-xs font-bold uppercase tracking-widest bg-white dark:bg-wood-700 border border-wood-200 dark:border-wood-600 text-wood-900 dark:text-sand-100 px-6 py-3 rounded-xl hover:bg-wood-50 dark:hover:bg-wood-600 transition-all shadow-sm hover:shadow-md">
              Seleccionar Archivo
            </button>
          </div>

          <div className="bg-white dark:bg-wood-900 p-6 rounded-2xl border border-wood-100 dark:border-wood-800 shadow-sm sticky top-6">
            <h4 className="text-xs font-bold text-wood-400 dark:text-sand-500 uppercase tracking-widest mb-4">
              Resumen de Cambios
            </h4>
            <div className="flex items-center gap-3 mb-6 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-500 leading-snug">
                Al guardar, este perfil se establecerá como predeterminado para tus futuras compras.
              </p>
            </div>

            <div className="space-y-3">
              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 px-6 py-4 rounded-xl font-bold tracking-wide hover:bg-wood-800 dark:hover:bg-sand-200 transition-all shadow-lg shadow-wood-900/10 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : success ? (
                  <>
                    <Check className="w-5 h-5" />
                    ¡Guardado!
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Perfil
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={onCancel}
                className="w-full py-4 text-xs font-bold uppercase tracking-widest text-wood-500 dark:text-sand-400 hover:text-wood-900 dark:hover:text-sand-100 transition-colors"
              >
                Cancelar y Volver
              </button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};
