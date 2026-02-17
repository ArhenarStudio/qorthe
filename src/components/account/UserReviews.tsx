"use client";

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Trash2, ExternalLink, Edit2, X, Send, User, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';
import { Review } from '@/types/review';
import { API_BASE_URL } from '@/utils/api';
import { ReviewSkeleton } from '@/components/ui/ReviewSkeleton';

// Mock Data for Demo
const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-001',
    productId: 'prod-001',
    productName: 'Silla Eames Lounge',
    productImage: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=300',
    userId: 'user-123',
    userName: 'Alejandro G.',
    rating: 5,
    comment: 'La calidad de la piel es excepcional. Llegó antes de lo esperado y el armado fue muy sencillo. Definitivamente vale la inversión para mi oficina en casa.',
    createdAt: '2024-01-15T10:00:00Z',
    response: '¡Gracias por tu confianza, Alejandro! Nos alegra saber que la silla cumple con tus expectativas de calidad y diseño. Esperamos ver fotos de tu oficina pronto.'
  },
  {
    id: 'rev-002',
    productId: 'prod-002',
    productName: 'Mesa de Centro Nogal',
    userId: 'user-123',
    userName: 'Alejandro G.',
    rating: 4,
    comment: 'El acabado es hermoso, tal cual se ve en las fotos. Le doy 4 estrellas porque el empaque llegó un poco maltratado, aunque la mesa estaba intacta.',
    createdAt: '2023-11-20T14:30:00Z'
  },
  {
    id: 'rev-003',
    productId: 'prod-005',
    productName: 'Lámpara de Pie Industrial',
    userId: 'user-123',
    userName: 'Alejandro G.',
    rating: 5,
    comment: 'Minimalista y funcional. La luz es cálida, perfecta para leer por las noches.',
    createdAt: '2023-09-05T09:15:00Z'
  }
];

export const UserReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Load reviews (simulate API + LocalStorage)
  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      try {
        // Try to get from LocalStorage first to persist edits/deletes in demo
        const localData = localStorage.getItem('davidson_user_reviews');
        
        if (localData) {
          setReviews(JSON.parse(localData));
        } else {
          // Fallback to Mock Data
          setReviews(MOCK_REVIEWS);
          localStorage.setItem('davidson_user_reviews', JSON.stringify(MOCK_REVIEWS));
        }

        // In a real app, we would fetch from API here:
        // const { data: { session } } = await supabase.auth.getSession();
        // if (session) {
        //   const res = await fetch(`${API_BASE_URL}/reviews/user/me`, ...);
        //   if (res.ok) setReviews(await res.json());
        // }
      } catch (error) {
        console.error('Error loading reviews:', error);
        setReviews(MOCK_REVIEWS);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const saveReviews = (newReviews: Review[]) => {
    setReviews(newReviews);
    localStorage.setItem('davidson_user_reviews', JSON.stringify(newReviews));
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta opinión?')) return;

    // Optimistic update for demo
    const updatedReviews = reviews.filter(r => r.id !== reviewId);
    saveReviews(updatedReviews);
    toast.success('Opinión eliminada correctamente');

    // Real API call would go here
  };

  const handleUpdateReview = (updatedReview: Review) => {
    const updatedReviews = reviews.map(r => r.id === updatedReview.id ? updatedReview : r);
    saveReviews(updatedReviews);
    setEditingReview(null);
    toast.success('Opinión actualizada correctamente');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <ReviewSkeleton />;
  }

  return (
    <div className="space-y-8 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100 mb-1">Mis Opiniones</h2>
          <p className="text-sm text-wood-500 dark:text-wood-400">Gestiona tus valoraciones y lee las respuestas de la marca.</p>
        </div>
        <div className="text-xs font-bold uppercase tracking-widest bg-wood-100 dark:bg-wood-800 text-wood-600 dark:text-sand-300 px-4 py-2 rounded-full">
          {reviews.length} {reviews.length === 1 ? 'Publicada' : 'Publicadas'}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white dark:bg-wood-900/40 rounded-2xl p-16 text-center border border-dashed border-wood-200 dark:border-wood-800">
          <div className="w-20 h-20 bg-wood-50 dark:bg-wood-800 rounded-full flex items-center justify-center mx-auto mb-6 text-wood-300 dark:text-wood-600">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-xl font-serif text-wood-900 dark:text-sand-100 mb-3">Tu voz es importante</h3>
          <p className="text-wood-500 dark:text-sand-400 mb-8 max-w-md mx-auto">
            Aún no has compartido tu experiencia. Tus opiniones ayudan a otros miembros de la comunidad a elegir mejor.
          </p>
          <Link href="/shop" className="inline-flex items-center gap-2 bg-wood-900 dark:bg-sand-100 text-white dark:text-wood-900 px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
            Explorar Productos
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {reviews.map((review) => (
              <motion.div
                layout
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-wood-900 rounded-2xl border border-wood-100 dark:border-wood-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="p-6 md:p-8">
                  {/* Header: Product & Date */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <div className="flex items-start gap-4">
                      {/* Product Image Thumbnail (if available) or Icon */}
                      <div className="w-16 h-16 rounded-lg bg-wood-100 dark:bg-wood-800 overflow-hidden shrink-0 border border-wood-200 dark:border-wood-700">
                        {review.productImage ? (
                          <img src={review.productImage} alt={review.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-wood-400">
                            <ExternalLink size={20} />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Link 
                          href={`/shop/${review.productId}`} 
                          className="font-serif text-lg text-wood-900 dark:text-sand-100 hover:text-accent-gold transition-colors block mb-1"
                        >
                          {review.productName || 'Producto Desconocido'}
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-wood-500 dark:text-wood-400">
                          <span>Comprado el {formatDate(review.createdAt)}</span>
                          <span className="w-1 h-1 rounded-full bg-wood-300"></span>
                          <span className={review.response ? "text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1" : ""}>
                            {review.response ? <><CheckCircle className="w-3 h-3"/> Respondido</> : "Pendiente de respuesta"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-start">
                      <button 
                        onClick={() => setEditingReview(review)}
                        className="p-2 text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 hover:bg-wood-100 dark:hover:bg-wood-800 rounded-lg transition-colors"
                        title="Editar reseña"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(review.id)}
                        className="p-2 text-wood-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar reseña"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Rating & Comment */}
                  <div className="mb-6">
                    <div className="flex text-accent-gold mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={18} fill={star <= review.rating ? "currentColor" : "none"} className={star <= review.rating ? "text-accent-gold" : "text-wood-200 dark:text-wood-700"} />
                      ))}
                    </div>
                    <p className="text-wood-700 dark:text-sand-200 text-base leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>

                  {/* Brand Response */}
                  {review.response && (
                    <div className="mt-6 bg-wood-50 dark:bg-wood-800/50 rounded-xl p-5 border border-wood-100 dark:border-wood-700/50 relative">
                       <div className="absolute top-0 left-6 -translate-y-1/2 bg-wood-200 dark:bg-wood-700 text-wood-800 dark:text-sand-100 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                         <User size={10} /> Respuesta de DavidSon's
                       </div>
                       <p className="text-sm text-wood-600 dark:text-sand-300 italic mt-1">
                         {review.response}
                       </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingReview && (
          <EditReviewModal 
            review={editingReview} 
            onClose={() => setEditingReview(null)} 
            onSave={handleUpdateReview} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-component for editing
const EditReviewModal = ({ review, onClose, onSave }: { review: Review, onClose: () => void, onSave: (r: Review) => void }) => {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...review, rating, comment, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-wood-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-wood-950 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-wood-100 dark:border-wood-800"
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-serif text-wood-900 dark:text-sand-100">Editar Reseña</h3>
            <button onClick={onClose} className="text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Product Info */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-wood-50 dark:bg-wood-900 rounded-xl">
              <div className="w-12 h-12 bg-wood-200 dark:bg-wood-800 rounded-lg overflow-hidden">
                 {review.productImage && <img src={review.productImage} className="w-full h-full object-cover" />}
              </div>
              <div>
                <p className="text-xs text-wood-500 uppercase tracking-wider font-bold">Producto</p>
                <p className="text-sm font-medium text-wood-900 dark:text-sand-100">{review.productName}</p>
              </div>
            </div>

            {/* Rating Input */}
            <div className="mb-6 text-center">
              <label className="block text-xs font-bold uppercase tracking-widest text-wood-500 mb-3">Tu Calificación</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star 
                      size={32} 
                      fill={(hoverRating || rating) >= star ? "currentColor" : "none"} 
                      className={`${(hoverRating || rating) >= star ? "text-accent-gold" : "text-wood-200 dark:text-wood-700"} transition-colors duration-200`} 
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs text-wood-400 mt-2 h-4">
                {rating === 5 ? '¡Excelente!' : rating === 4 ? 'Muy bueno' : rating === 3 ? 'Regular' : rating === 2 ? 'Malo' : 'Terrible'}
              </p>
            </div>

            {/* Comment Input */}
            <div className="mb-8">
              <label className="block text-xs font-bold uppercase tracking-widest text-wood-500 mb-2">Tu Experiencia</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-32 p-4 bg-wood-50 dark:bg-wood-900 border border-wood-200 dark:border-wood-800 rounded-xl focus:ring-2 focus:ring-accent-gold/50 focus:border-accent-gold outline-none resize-none text-wood-900 dark:text-sand-100 placeholder-wood-400 text-sm leading-relaxed transition-all"
                placeholder="Cuéntanos qué te pareció el producto..."
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-3 border border-wood-200 dark:border-wood-700 text-wood-600 dark:text-sand-300 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-wood-50 dark:hover:bg-wood-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 py-3 bg-wood-900 dark:bg-sand-100 text-sand-50 dark:text-wood-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black dark:hover:bg-white transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <Send size={14} /> Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
