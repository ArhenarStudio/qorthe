"use client";

import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, ShieldCheck, Lock, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LOYALTY_TIERS } from '@/data/loyalty';

export const Wallet = () => {
  const platinumTier = LOYALTY_TIERS.find(t => t.id === 'platinum')!;
  const cardStyle = platinumTier.styles.card;
  const textStyle = platinumTier.styles.text;
  const badgeStyle = platinumTier.styles.badge;

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [deletingCard, setDeletingCard] = useState<any>(null);

  const [cardForm, setCardForm] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvv: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardForm(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setCardForm({ number: '', holder: '', expiry: '', cvv: '' });
    setIsAddingCard(true);
  };

  const openEditModal = (card: any) => {
    setCardForm({
      number: `**** **** **** ${card.last4}`,
      holder: card.holder,
      expiry: card.expiry,
      cvv: '***'
    });
    setEditingCard(card);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log(editingCard ? 'Updating card:' : 'Saving card:', cardForm);
    setIsAddingCard(false);
    setEditingCard(null);
    setCardForm({ number: '', holder: '', expiry: '', cvv: '' });
  };

  const handleDelete = () => {
    console.log('Deleting card:', deletingCard);
    setDeletingCard(null);
  };

  // Shared Modal Component for consistent aesthetics
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

  const CardForm = ({ submitLabel }: { submitLabel: string }) => (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-extrabold uppercase tracking-widest text-wood-900 dark:text-sand-100">Número de Tarjeta</label>
        <div className="relative group">
          <input 
            type="text" 
            name="number"
            value={cardForm.number}
            onChange={handleInputChange}
            placeholder="0000 0000 0000 0000"
            className="w-full pl-12 pr-4 py-3.5 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-wood-950 focus:border-wood-900 dark:focus:border-accent-gold focus:ring-1 focus:ring-wood-900 dark:focus:ring-accent-gold transition-all font-mono text-wood-900 dark:text-sand-50 font-bold placeholder:text-wood-400 dark:placeholder:text-wood-500 shadow-sm group-hover:border-wood-400 dark:group-hover:border-wood-500"
          />
          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-500" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-extrabold uppercase tracking-widest text-wood-900 dark:text-sand-100">Nombre del Titular</label>
        <input 
          type="text" 
          name="holder"
          value={cardForm.holder}
          onChange={handleInputChange}
          placeholder="Como aparece en la tarjeta"
          className="w-full px-4 py-3.5 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-wood-950 focus:border-wood-900 dark:focus:border-accent-gold focus:ring-1 focus:ring-wood-900 dark:focus:ring-accent-gold transition-all text-wood-900 dark:text-sand-50 font-bold placeholder:text-wood-400 dark:placeholder:text-wood-500 shadow-sm hover:border-wood-400 dark:hover:border-wood-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-widest text-wood-900 dark:text-sand-100">Expiración</label>
          <input 
            type="text" 
            name="expiry"
            value={cardForm.expiry}
            onChange={handleInputChange}
            placeholder="MM/AA"
            className="w-full px-4 py-3.5 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-wood-950 focus:border-wood-900 dark:focus:border-accent-gold focus:ring-1 focus:ring-wood-900 dark:focus:ring-accent-gold transition-all font-mono text-wood-900 dark:text-sand-50 font-bold placeholder:text-wood-400 dark:placeholder:text-wood-500 shadow-sm hover:border-wood-400 dark:hover:border-wood-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-widest text-wood-900 dark:text-sand-100">CVV</label>
          <div className="relative group">
            <input 
              type="text" 
              name="cvv"
              value={cardForm.cvv}
              onChange={handleInputChange}
              placeholder="123"
              className="w-full pl-10 pr-4 py-3.5 bg-wood-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-wood-950 focus:border-wood-900 dark:focus:border-accent-gold focus:ring-1 focus:ring-wood-900 dark:focus:ring-accent-gold transition-all font-mono text-wood-900 dark:text-sand-50 font-bold placeholder:text-wood-400 dark:placeholder:text-wood-500 shadow-sm group-hover:border-wood-400 dark:group-hover:border-wood-500"
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wood-500" />
          </div>
        </div>
      </div>

      <div className="pt-6 flex gap-3 border-t border-wood-200 dark:border-wood-800 mt-2">
        <button 
          type="button"
          onClick={() => { setIsAddingCard(false); setEditingCard(null); }}
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
    <div className="space-y-8 relative">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-50">Billetera Digital</h2>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-wood-900 dark:bg-accent-gold text-sand-50 dark:text-wood-900 px-5 py-2.5 rounded-xl hover:bg-wood-800 dark:hover:bg-sand-100 transition-all text-xs font-bold uppercase tracking-widest shadow-lg shadow-wood-900/10"
        >
          <Plus className="w-4 h-4" />
          Nueva Tarjeta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* DavidSon's Design Member Card (Hero) */}
        <motion.div 
           whileHover={{ y: -5 }}
           className={`relative h-56 rounded-2xl p-8 border shadow-xl overflow-hidden group/card ${cardStyle} ${textStyle}`}
        >
             {/* Card Texture */}
             <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-150%] group-hover/card:translate-x-[150%] transition-transform duration-1000 ease-in-out z-10 pointer-events-none"></div>

             {/* Inner Layout */}
             <div className="relative z-20 h-full flex flex-col justify-between">
                {/* Header */}
                <div className="flex justify-between items-start">
                   <div>
                      <h3 className="font-serif text-xl tracking-wide leading-none text-wood-900">DavidSon's</h3>
                      <p className="text-[9px] uppercase tracking-widest mt-1.5 text-wood-600 font-medium">Design Member</p>
                   </div>
                   <span className={`px-2.5 py-1 rounded border text-[9px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 backdrop-blur-sm ${badgeStyle}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div>
                      Platinum
                   </span>
                </div>

                {/* Balance Block */}
                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-3 opacity-90">
                      <div className="w-10 h-7 rounded bg-gradient-to-tr from-yellow-100 to-yellow-600 shadow-inner border border-yellow-700/30 flex items-center justify-center relative overflow-hidden">
                         <div className="absolute inset-0 bg-black/10" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.1) 50%)', backgroundSize: '4px 4px' }}></div>
                         <div className="w-5 h-3 border border-black/20 rounded-sm"></div>
                      </div>
                      <CreditCard className="w-5 h-5 text-wood-600 rotate-90" strokeWidth={1.5} />
                   </div>
                   
                   <div>
                      <div className="flex justify-between items-end text-[10px] uppercase tracking-wider mb-0.5 text-wood-600 font-medium">
                         <span>Saldo Disponible</span>
                         <span className="font-mono text-wood-800">2,540 pts</span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                         <span className="font-mono text-3xl tracking-tight drop-shadow-sm truncate text-wood-900">
                           $25.40
                         </span>
                         <span className="text-[10px] font-bold text-wood-600 mb-1">MXN</span>
                      </div>
                   </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end border-t border-wood-900/10 pt-3">
                   <div>
                       <p className="text-[7px] uppercase tracking-widest mb-0.5 text-wood-500 font-bold">Miembro Desde</p>
                       <p className="font-mono text-[10px] text-wood-800">12/23</p>
                   </div>
                   <div className="text-right">
                       <p className="text-[7px] uppercase tracking-widest mb-0.5 text-wood-500 font-bold">ID Cliente</p>
                       <p className="font-mono text-[10px] text-wood-800 tracking-wider">DS-8821</p>
                   </div>
                </div>
             </div>
        </motion.div>

        {/* Premium Card 1 */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="relative h-56 rounded-2xl p-8 bg-[#1A1A1A] text-white shadow-2xl shadow-black/20 flex flex-col justify-between overflow-hidden group border border-white/5"
        >
          {/* Abstract Background Art */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
             <div className="flex items-center gap-2">
               <div className="w-8 h-5 bg-gradient-to-r from-yellow-200 to-yellow-500 rounded sm opacity-90" />
               <span className="font-mono text-[10px] tracking-widest opacity-60">PREMIUM MEMBER</span>
             </div>
             <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-5 brightness-0 invert opacity-90" />
          </div>

          <div className="relative z-10 space-y-4 flex-1 flex flex-col justify-center">
             <div className="flex gap-4 justify-center">
                <span className="font-mono text-2xl tracking-widest text-shadow-sm">••••</span>
                <span className="font-mono text-2xl tracking-widest text-shadow-sm">••••</span>
                <span className="font-mono text-2xl tracking-widest text-shadow-sm">••••</span>
                <span className="font-mono text-2xl tracking-widest text-shadow-sm">4242</span>
             </div>
          </div>

          <div className="flex justify-between items-end relative z-10">
            <div>
              <p className="text-[9px] uppercase tracking-widest opacity-50 mb-1">Titular</p>
              <p className="font-medium text-sm tracking-widest">ALEJANDRO GARCIA</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest opacity-50 mb-1 text-right">Expira</p>
              <p className="font-mono text-sm tracking-widest">12/28</p>
            </div>
          </div>
          
          {/* Hover Actions */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-20">
             <button 
               onClick={() => openEditModal({ last4: '4242', holder: 'ALEJANDRO GARCIA', expiry: '12/28' })}
               className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
             >
               Editar
             </button>
             <button 
               onClick={() => setDeletingCard({ last4: '4242' })}
               className="p-2 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md rounded-lg text-red-400 transition-colors"
             >
               <Trash2 className="w-4 h-4" />
             </button>
          </div>
        </motion.div>

        {/* Card 2 - Lighter Theme */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="relative h-56 rounded-2xl p-8 bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 shadow-xl flex flex-col justify-between overflow-hidden group border border-white/40"
        >
          <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />
          
          <div className="flex items-center justify-between relative z-10">
             <span className="font-mono text-[10px] tracking-widest opacity-60 font-bold">DEBIT</span>
             <div className="flex -space-x-2 opacity-80">
               <div className="w-8 h-8 rounded-full bg-red-500/80 mix-blend-multiply" />
               <div className="w-8 h-8 rounded-full bg-yellow-500/80 mix-blend-multiply" />
             </div>
          </div>

          <div className="relative z-10 space-y-4 flex-1 flex flex-col justify-center">
             <div className="flex gap-4 justify-center opacity-80">
                <span className="font-mono text-2xl tracking-widest">••••</span>
                <span className="font-mono text-2xl tracking-widest">••••</span>
                <span className="font-mono text-2xl tracking-widest">••••</span>
                <span className="font-mono text-2xl tracking-widest">8821</span>
             </div>
          </div>

          <div className="flex justify-between items-end relative z-10 opacity-80">
            <div>
              <p className="text-[9px] uppercase tracking-widest opacity-50 mb-1">Titular</p>
              <p className="font-medium text-sm tracking-widest">ALEJANDRO GARCIA</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest opacity-50 mb-1 text-right">Expira</p>
              <p className="font-mono text-sm tracking-widest">09/27</p>
            </div>
          </div>

          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-20">
             <button 
               onClick={() => openEditModal({ last4: '8821', holder: 'ALEJANDRO GARCIA', expiry: '09/27' })}
               className="px-4 py-2 bg-wood-900/10 hover:bg-wood-900/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-widest transition-colors text-wood-900"
             >
               Editar
             </button>
             <button 
               onClick={() => setDeletingCard({ last4: '8821' })}
               className="p-2 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-md rounded-lg text-red-500 transition-colors"
             >
               <Trash2 className="w-4 h-4" />
             </button>
          </div>
        </motion.div>
      </div>

      <div className="bg-blue-50/50 dark:bg-wood-900/50 border border-blue-100 dark:border-wood-800 p-6 rounded-2xl flex items-start gap-4">
        <div className="p-3 bg-blue-100 dark:bg-wood-800 rounded-full text-blue-600 dark:text-blue-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-serif text-lg text-wood-900 dark:text-sand-100 mb-1">Seguridad Garantizada</h4>
          <p className="text-sm text-wood-600 dark:text-wood-400 leading-relaxed max-w-2xl">
            Tus datos de pago están encriptados con tecnología SSL de 256 bits. DavidSon's Design nunca almacena tu información completa de tarjeta de crédito.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {/* Add Card Modal */}
        {isAddingCard && (
          <Modal title="Nueva Tarjeta" onClose={() => setIsAddingCard(false)}>
            <CardForm submitLabel="Guardar Tarjeta" />
          </Modal>
        )}

        {/* Edit Card Modal */}
        {editingCard && (
          <Modal title="Editar Tarjeta" onClose={() => setEditingCard(null)}>
            <CardForm submitLabel="Guardar Cambios" />
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {deletingCard && (
          <Modal title="Eliminar Tarjeta" onClose={() => setDeletingCard(null)} maxWidth="max-w-md">
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-wood-900 dark:text-sand-100 font-medium">
                    ¿Estás seguro de que deseas eliminar esta tarjeta terminada en <span className="font-mono font-bold">{deletingCard.last4}</span>?
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-wood-500 dark:text-wood-400">
                Esta acción no se puede deshacer. Tendrás que volver a añadir la tarjeta si deseas usarla en el futuro.
              </p>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setDeletingCard(null)}
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
