import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ADDRESSES = [
  {
    id: 1,
    label: "Casa Principal",
    type: "home",
    name: "Alejandro García",
    street: "Av. Reforma 222, Piso 18",
    city: "Cuauhtémoc, CDMX",
    zip: "06600",
    phone: "+52 55 1234 5678",
    default: true
  },
  {
    id: 2,
    label: "Oficina",
    type: "work",
    name: "Alejandro García",
    street: "Blvd. Kukulcán Km 12",
    city: "Cancún, Quintana Roo",
    zip: "77500",
    phone: "+52 998 888 9999",
    default: false
  }
];

export const AddressBook = () => {
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [deletingAddress, setDeletingAddress] = useState<any>(null);

  const [addressForm, setAddressForm] = useState({
    label: '',
    type: 'home',
    name: '',
    street: '',
    city: '',
    zip: '',
    phone: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setAddressForm({ label: '', type: 'home', name: '', street: '', city: '', zip: '', phone: '' });
    setIsAddingAddress(true);
  };

  const openEditModal = (addr: any) => {
    setAddressForm({ ...addr });
    setEditingAddress(addr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(editingAddress ? 'Updating address:' : 'Saving address:', addressForm);
    setIsAddingAddress(false);
    setEditingAddress(null);
  };

  const handleDelete = () => {
    console.log('Deleting address:', deletingAddress);
    setDeletingAddress(null);
  };

  // Shared Modal Component
  const Modal = ({ title, onClose, children, maxWidth = "max-w-lg" }: any) => (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-wood-900/60 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`fixed inset-0 m-auto w-full ${maxWidth} h-fit max-h-[90vh] overflow-y-auto bg-sand-50 dark:bg-wood-900 rounded-2xl shadow-2xl z-[101]`}
      >
        <div className="p-8 border-b border-wood-100 dark:border-wood-800 flex justify-between items-center bg-white dark:bg-wood-900 sticky top-0 z-10">
          <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-50">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-wood-50 dark:hover:bg-wood-800 rounded-full text-wood-400 dark:text-wood-500 hover:text-wood-900 dark:hover:text-sand-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-white dark:bg-wood-900">
          {children}
        </div>
      </motion.div>
    </>
  );

  const AddressForm = ({ submitLabel }: { submitLabel: string }) => (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-widest text-wood-900 dark:text-sand-100">Etiqueta</label>
          <input 
            type="text" 
            name="label"
            value={addressForm.label}
            onChange={handleInputChange}
            placeholder="Ej. Casa, Oficina"
            className="w-full px-4 py-3.5 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-wood-950 focus:border-wood-900 dark:focus:border-accent-gold focus:ring-1 focus:ring-wood-900 dark:focus:ring-accent-gold transition-all text-wood-900 dark:text-sand-50 font-bold placeholder:text-wood-400 dark:placeholder:text-wood-500 shadow-sm hover:border-wood-400 dark:hover:border-wood-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-widest text-wood-900 dark:text-sand-100">Tipo</label>
          <div className="relative">
            <select 
              name="type"
              value={addressForm.type}
              onChange={handleInputChange}
              className="w-full px-4 py-3.5 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-wood-950 focus:border-wood-900 dark:focus:border-accent-gold focus:ring-1 focus:ring-wood-900 dark:focus:ring-accent-gold transition-all text-wood-900 dark:text-sand-50 font-bold shadow-sm hover:border-wood-400 dark:hover:border-wood-500 appearance-none"
            >
              <option value="home">Casa</option>
              <option value="work">Trabajo</option>
              <option value="other">Otro</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              {addressForm.type === 'work' ? <Briefcase className="w-4 h-4 text-wood-500" /> : <Home className="w-4 h-4 text-wood-500" />}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-extrabold uppercase tracking-widest text-wood-900 dark:text-sand-100">Nombre Completo</label>
        <input 
          type="text" 
          name="name"
          value={addressForm.name}
          onChange={handleInputChange}
          placeholder="Nombre de quien recibe"
          className="w-full px-4 py-3.5 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-wood-950 focus:border-wood-900 dark:focus:border-accent-gold focus:ring-1 focus:ring-wood-900 dark:focus:ring-accent-gold transition-all text-wood-900 dark:text-sand-50 font-bold placeholder:text-wood-400 dark:placeholder:text-wood-500 shadow-sm hover:border-wood-400 dark:hover:border-wood-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-extrabold uppercase tracking-widest text-wood-900 dark:text-sand-100">Dirección y Número</label>
        <div className="relative group">
          <input 
            type="text" 
            name="street"
            value={addressForm.street}
            onChange={handleInputChange}
            placeholder="Calle, Número, Colonia..."
            className="w-full pl-12 pr-4 py-3.5 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-wood-950 focus:border-wood-900 dark:focus:border-accent-gold focus:ring-1 focus:ring-wood-900 dark:focus:ring-accent-gold transition-all text-wood-900 dark:text-sand-50 font-bold placeholder:text-wood-400 dark:placeholder:text-wood-500 shadow-sm group-hover:border-wood-400 dark:group-hover:border-wood-500"
          />
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-widest text-wood-900 dark:text-sand-100">Ciudad</label>
          <input 
            type="text" 
            name="city"
            value={addressForm.city}
            onChange={handleInputChange}
            placeholder="Ciudad, Estado"
            className="w-full px-4 py-3.5 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-wood-950 focus:border-wood-900 dark:focus:border-accent-gold focus:ring-1 focus:ring-wood-900 dark:focus:ring-accent-gold transition-all text-wood-900 dark:text-sand-50 font-bold placeholder:text-wood-400 dark:placeholder:text-wood-500 shadow-sm hover:border-wood-400 dark:hover:border-wood-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-widest text-wood-900 dark:text-sand-100">Código Postal</label>
          <input 
            type="text" 
            name="zip"
            value={addressForm.zip}
            onChange={handleInputChange}
            placeholder="00000"
            className="w-full px-4 py-3.5 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-wood-950 focus:border-wood-900 dark:focus:border-accent-gold focus:ring-1 focus:ring-wood-900 dark:focus:ring-accent-gold transition-all text-wood-900 dark:text-sand-50 font-bold placeholder:text-wood-400 dark:placeholder:text-wood-500 shadow-sm hover:border-wood-400 dark:hover:border-wood-500"
          />
        </div>
      </div>

       <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-widest text-wood-900 dark:text-sand-100">Teléfono</label>
          <input 
            type="tel" 
            name="phone"
            value={addressForm.phone}
            onChange={handleInputChange}
            placeholder="+52 00 0000 0000"
            className="w-full px-4 py-3.5 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-wood-950 focus:border-wood-900 dark:focus:border-accent-gold focus:ring-1 focus:ring-wood-900 dark:focus:ring-accent-gold transition-all text-wood-900 dark:text-sand-50 font-bold placeholder:text-wood-400 dark:placeholder:text-wood-500 shadow-sm hover:border-wood-400 dark:hover:border-wood-500"
          />
        </div>

      <div className="pt-6 flex gap-3 border-t border-wood-200 dark:border-wood-800 mt-2">
        <button 
          type="button"
          onClick={() => { setIsAddingAddress(false); setEditingAddress(null); }}
          className="flex-1 py-3 px-6 bg-white dark:bg-wood-800 border-2 border-wood-200 dark:border-wood-700 text-wood-900 dark:text-sand-100 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-wood-50 dark:hover:bg-wood-700 hover:border-wood-300 transition-all"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="flex-[2] py-3 px-6 bg-wood-900 dark:bg-accent-gold text-sand-50 dark:text-wood-900 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-accent-gold dark:hover:bg-sand-100 hover:text-wood-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100 transition-colors">Mis Direcciones</h2>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 px-5 py-2.5 rounded-xl hover:bg-wood-800 dark:hover:bg-sand-200 transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-wood-900/10 dark:shadow-none hover:shadow-wood-900/20"
        >
          <Plus className="w-4 h-4" />
          Nueva Dirección
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ADDRESSES.map((addr) => (
          <motion.div 
            key={addr.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
              relative rounded-2xl p-6 border transition-all duration-300 group
              ${addr.default 
                ? 'bg-white dark:bg-wood-900 border-accent-gold shadow-[0_4px_20px_rgba(212,175,55,0.15)] dark:shadow-none' 
                : 'bg-white dark:bg-wood-900 border-wood-100 dark:border-wood-800 hover:border-wood-300 dark:hover:border-wood-600 hover:shadow-lg dark:hover:shadow-none'
              }
            `}
          >
            {addr.default && (
              <div className="absolute top-0 right-0">
                <div className="bg-accent-gold text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl rounded-tr-xl uppercase tracking-widest shadow-sm">
                  Principal
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${addr.default ? 'bg-accent-gold/10 text-accent-gold' : 'bg-wood-50 dark:bg-wood-800 text-wood-400 dark:text-wood-500'}`}>
                {addr.type === 'home' ? <Home className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-serif text-xl text-wood-900 dark:text-sand-100 leading-none mb-1.5 transition-colors">{addr.label}</h3>
                <p className="text-xs text-wood-400 dark:text-wood-500 uppercase tracking-wider font-medium transition-colors">{addr.name}</p>
              </div>
            </div>

            <div className="space-y-1.5 mb-8">
              <p className="text-wood-800 dark:text-sand-200 font-medium text-lg leading-snug transition-colors">{addr.street}</p>
              <p className="text-wood-600 dark:text-sand-300 transition-colors">{addr.city}, CP {addr.zip}</p>
              <p className="pt-2 text-wood-400 dark:text-wood-500 text-sm font-mono transition-colors">{addr.phone}</p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => openEditModal(addr)}
                className="flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-wood-900 dark:text-sand-100 bg-wood-50 dark:bg-wood-800 hover:bg-wood-100 dark:hover:bg-wood-700 py-2.5 rounded-lg transition-colors"
              >
                <Edit2 className="w-3 h-3" /> Editar
              </button>
              <button 
                onClick={() => setDeletingAddress(addr)}
                className="w-10 flex items-center justify-center text-wood-400 dark:text-wood-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 py-2.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
        
        {/* Modern "Add New" Placeholder */}
        <button 
          onClick={openAddModal}
          className="border border-dashed border-wood-300 dark:border-wood-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-wood-400 dark:text-wood-500 hover:text-wood-900 dark:hover:text-sand-100 hover:border-wood-900 dark:hover:border-sand-100 hover:bg-wood-50/50 dark:hover:bg-wood-800/50 transition-all duration-300 min-h-[280px] group"
        >
          <div className="w-16 h-16 rounded-full bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-bold uppercase tracking-widest text-xs">Añadir Nueva Dirección</span>
        </button>
      </div>

      <AnimatePresence>
        {/* Add Address Modal */}
        {isAddingAddress && (
          <Modal title="Nueva Dirección" onClose={() => setIsAddingAddress(false)}>
            <AddressForm submitLabel="Guardar Dirección" />
          </Modal>
        )}

        {/* Edit Address Modal */}
        {editingAddress && (
          <Modal title="Editar Dirección" onClose={() => setEditingAddress(null)}>
            <AddressForm submitLabel="Guardar Cambios" />
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {deletingAddress && (
          <Modal title="Eliminar Dirección" onClose={() => setDeletingAddress(null)} maxWidth="max-w-md">
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-wood-900 dark:text-sand-100 font-medium">
                    ¿Estás seguro de que deseas eliminar la dirección <span className="font-bold">"{deletingAddress.label}"</span>?
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-wood-500 dark:text-wood-400">
                Esta acción no se puede deshacer. La dirección se eliminará permanentemente de tu libreta.
              </p>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setDeletingAddress(null)}
                  className="flex-1 py-3 px-6 bg-white dark:bg-wood-800 border-2 border-wood-200 dark:border-wood-700 text-wood-900 dark:text-sand-100 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-wood-50 dark:hover:bg-wood-700 hover:border-wood-300 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-[2] py-3 px-6 bg-red-600 dark:bg-red-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};
