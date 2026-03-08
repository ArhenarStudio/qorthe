"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, Trash2, ExternalLink, Edit2, X, Send, User, CheckCircle, Clock, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';
import { ReviewSkeleton } from '@/components/ui/ReviewSkeleton';

// ── Types matching Supabase reviews table ──
interface ReviewData {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  photos: string[];
  status: 'pending' | 'approved' | 'rejected';
  admin_reply: string | null;
  admin_reply_at: string | null;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_avatar: string | null;
  product_title: string | null;
  product_thumbnail: string | null;
}

export const UserReviews = () => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<ReviewData | null>(null);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  // Get auth
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user || null);
    });
  }, []);

  // Fetch user's reviews
  const fetchReviews = useCallback(async () => {
    if (!user || !session) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?user_id=${user.id}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('[UserReviews] fetch error:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    if (user && session) fetchReviews();
  }, [user, session, fetchReviews]);

  const handleDelete = async (reviewId: string) => {
    // Direct delete
    if (!session) return;

    // Optimistic update
    const prev = [...reviews];
    setReviews(reviews.filter(r => r.id !== reviewId));

    try {
      const res = await fetch(`/api/reviews?id=${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Opinión eliminada');
    } catch (error) {
      console.error('[UserReviews] delete error:', error);
      setReviews(prev); // rollback
      toast.error('Error al eliminar la opinión');
    }
  };

  const handleUpdateReview = async (updatedReview: ReviewData) => {
    if (!session) return;

    // Optimistic update
    const prev = [...reviews];
    setReviews(reviews.map(r => r.id === updatedReview.id ? updatedReview : r));
    setEditingReview(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST', // upsert — same user+product overwrites
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          product_id: updatedReview.product_id,
          rating: updatedReview.rating,
          title: updatedReview.title,
          body: updatedReview.body,
          product_title: updatedReview.product_title,
          product_thumbnail: updatedReview.product_thumbnail,
        }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Opinión actualizada');
      fetchReviews(); // refresh to get server state
    } catch (error) {
      console.error('[UserReviews] update error:', error);
      setReviews(prev); // rollback
      toast.error('Error al actualizar la opinión');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle size={12} /> Publicada
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Clock size={12} /> En revisión
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 dark:text-red-400">
            <XCircle size={12} /> No aprobada
          </span>
        );
      default:
        return null;
    }
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
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg bg-wood-100 dark:bg-wood-800 overflow-hidden shrink-0 border border-wood-200 dark:border-wood-700">
                        {review.product_thumbnail ? (
                          <img src={review.product_thumbnail} alt={review.product_title || ''} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-wood-400">
                            <ExternalLink size={20} />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Link 
                          href={`/shop/${review.product_id}`} 
                          className="font-serif text-lg text-wood-900 dark:text-sand-100 hover:text-accent-gold transition-colors block mb-1"
                        >
                          {review.product_title || 'Producto'}
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-wood-500 dark:text-wood-400">
                          <span>{formatDate(review.created_at)}</span>
                          <span className="w-1 h-1 rounded-full bg-wood-300"></span>
                          {statusBadge(review.status)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-start">
                      {review.status === 'pending' && (
                        <button 
                          onClick={() => setEditingReview(review)}
                          className="p-2 text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 hover:bg-wood-100 dark:hover:bg-wood-800 rounded-lg transition-colors"
                          title="Editar reseña"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
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
                  <div className="mb-4">
                    <div className="flex text-accent-gold mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={18} fill="currentColor" className={star <= review.rating ? "text-accent-gold" : "text-wood-200 dark:text-wood-700"} strokeWidth={0} />
                      ))}
                    </div>
                    {review.title && (
                      <p className="font-bold text-wood-900 dark:text-sand-100 mb-2">{review.title}</p>
                    )}
                    <p className="text-wood-700 dark:text-sand-200 text-base leading-relaxed">
                      {review.body}
                    </p>
                  </div>

                  {/* Admin Response */}
                  {review.admin_reply && (
                    <div className="mt-6 bg-wood-50 dark:bg-wood-800/50 rounded-xl p-5 border border-wood-100 dark:border-wood-700/50 relative">
                       <div className="absolute top-0 left-6 -translate-y-1/2 bg-wood-200 dark:bg-wood-700 text-wood-800 dark:text-sand-100 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                         <User size={10} /> Respuesta de DavidSon&apos;s
                       </div>
                       <p className="text-sm text-wood-600 dark:text-sand-300 italic mt-1">
                         {review.admin_reply}
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

// ── Edit Modal ──
const EditReviewModal = ({ review, onClose, onSave }: { review: ReviewData, onClose: () => void, onSave: (r: ReviewData) => void }) => {
  const [rating, setRating] = useState(review.rating);
  const [title, setTitle] = useState(review.title || '');
  const [body, setBody] = useState(review.body || '');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...review, rating, title: title.trim() || null, body: body.trim() || null });
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
                 {review.product_thumbnail && <img src={review.product_thumbnail} className="w-full h-full object-cover" alt="" />}
              </div>
              <div>
                <p className="text-xs text-wood-500 uppercase tracking-wider font-bold">Producto</p>
                <p className="text-sm font-medium text-wood-900 dark:text-sand-100">{review.product_title || 'Producto'}</p>
              </div>
            </div>

            {/* Rating */}
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
                      fill={(hoverRating || rating) >= star ? "currentColor" : "currentColor"} 
                      className={`${(hoverRating || rating) >= star ? "text-accent-gold" : "text-wood-200 dark:text-wood-700"} transition-colors duration-200`} 
                      strokeWidth={0}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-wood-500 mb-2">Título (opcional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-wood-50 dark:bg-wood-900 border border-wood-200 dark:border-wood-800 rounded-xl focus:ring-2 focus:ring-accent-gold/50 focus:border-accent-gold outline-none text-wood-900 dark:text-sand-100 text-sm transition-all"
                placeholder="Resumen de tu experiencia"
                maxLength={100}
              />
            </div>

            {/* Body */}
            <div className="mb-8">
              <label className="block text-xs font-bold uppercase tracking-widest text-wood-500 mb-2">Tu Experiencia</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
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
