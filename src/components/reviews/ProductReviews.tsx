"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, User, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ReviewSkeleton } from '@/components/ui/ReviewSkeleton';
import { createClient } from '@/lib/supabase/client';

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

interface ReviewStats {
  product_id: string;
  review_count: number;
  avg_rating: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

interface ProductReviewsProps {
  productId: string;
  productTitle?: string;
  productThumbnail?: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productTitle, productThumbnail }) => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userHasReview, setUserHasReview] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Check auth
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?product_id=${productId}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setReviews(data.reviews || []);
      setStats(data.stats || null);

      // Check if current user already reviewed
      if (user) {
        const hasReview = (data.reviews || []).some((r: ReviewData) => r.user_id === user.id);
        setUserHasReview(hasReview);
      }
    } catch (error) {
      console.error('[ProductReviews] fetch error:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId, user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Debes iniciar sesión para opinar');
      return;
    }
    if (rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }
    if (!comment.trim()) {
      toast.error('Por favor escribe un comentario');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      if (!supabase) { toast.error('Error de configuración'); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sesión expirada, inicia sesión nuevamente');
        return;
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          rating,
          title: title.trim() || null,
          body: comment.trim(),
          product_title: productTitle || null,
          product_thumbnail: productThumbnail || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar opinión');
      }

      toast.success('¡Gracias por tu opinión! Será visible tras aprobación.');
      setComment('');
      setTitle('');
      setRating(0);
      setShowForm(false);
      setUserHasReview(true);
      // Refresh reviews
      fetchReviews();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Error al enviar la opinión');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const avgRating = stats?.avg_rating ?? (
    reviews.length > 0 
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
      : 0
  );
  const totalReviews = stats?.review_count ?? reviews.length;

  // Rating distribution
  const ratingBars = stats ? [
    { stars: 5, count: stats.five_star },
    { stars: 4, count: stats.four_star },
    { stars: 3, count: stats.three_star },
    { stars: 2, count: stats.two_star },
    { stars: 1, count: stats.one_star },
  ] : null;

  return (
    <div className="py-16 border-t border-wood-200 dark:border-wood-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Summary Column */}
        <div className="lg:col-span-4 space-y-8">
          <div>
            <h3 className="font-serif text-3xl text-[rgb(0,0,0)] dark:text-sand-100 mb-2">Opiniones</h3>
            <p className="text-[rgb(0,0,0)] dark:text-sand-100 text-base font-bold tracking-wide">
              Lo que dicen nuestros clientes sobre esta pieza.
            </p>
          </div>
          
          <div className="bg-wood-100 dark:bg-wood-800/50 rounded-2xl p-8 border border-wood-300 dark:border-wood-600 text-center lg:text-left">
            <div className="flex flex-col items-center lg:items-start gap-2">
              <span className="text-6xl font-serif text-wood-900 dark:text-sand-100 leading-none">
                {avgRating > 0 ? avgRating.toFixed(1) : '—'}
              </span>
              <div className="flex flex-col items-center lg:items-start">
                <div className="flex gap-1 text-accent-gold mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={20} 
                      fill={star <= Math.round(avgRating) ? "currentColor" : "currentColor"} 
                      strokeWidth={0}
                      className={star <= Math.round(avgRating) ? "" : "text-wood-400 dark:text-wood-600"}
                    />
                  ))}
                </div>
                <p className="text-sm font-bold text-wood-700 dark:text-sand-200 uppercase tracking-wide">
                  {totalReviews === 0 ? 'Sin reseñas aún' : `Basado en ${totalReviews} reseña${totalReviews !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            {/* Rating distribution bars */}
            {ratingBars && totalReviews > 0 && (
              <div className="mt-6 space-y-2">
                {ratingBars.map(({ stars, count }) => (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <span className="w-4 text-right text-wood-600 dark:text-sand-300 font-medium">{stars}</span>
                    <Star size={12} className="text-accent-gold" fill="currentColor" strokeWidth={0} />
                    <div className="flex-1 h-2 bg-wood-200 dark:bg-wood-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-gold rounded-full transition-all duration-500"
                        style={{ width: `${totalReviews > 0 ? (count / totalReviews) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs text-wood-500 dark:text-wood-400">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA: Write review or login */}
          {!user ? (
            <div className="p-6 rounded-xl border border-wood-300 dark:border-wood-600 bg-white dark:bg-wood-900/40 shadow-sm">
              <h4 className="font-serif text-lg text-wood-900 dark:text-sand-100 mb-2">Comparte tu experiencia</h4>
              <p className="text-sm text-wood-800 dark:text-sand-200 mb-4 leading-relaxed font-medium">
                ¿Ya tienes esta pieza en tu colección? Nos encantaría conocer tu opinión.
              </p>
              <a 
                href="/auth"
                className="block w-full py-3 px-4 border border-wood-300 text-wood-600 font-bold rounded-lg text-sm text-center hover:bg-wood-50 dark:hover:bg-wood-800 transition-colors"
              >
                Inicia sesión para opinar
              </a>
            </div>
          ) : userHasReview ? (
            <div className="p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                ✓ Ya compartiste tu opinión sobre este producto.
              </p>
            </div>
          ) : (
            !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3 px-6 bg-wood-900 text-sand-100 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-accent-gold hover:text-wood-900 transition-all shadow-lg"
              >
                Escribir una opinión
              </button>
            )
          )}
        </div>

        {/* Reviews List & Form Column */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Review Form */}
          <AnimatePresence>
            {showForm && user && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <form 
                  onSubmit={handleSubmit} 
                  className="bg-white dark:bg-wood-900/20 p-6 md:p-8 rounded-2xl border border-wood-200 dark:border-wood-700 shadow-sm mb-8"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-serif text-xl text-wood-900 dark:text-sand-100">Tu opinión es importante</h4>
                    <button 
                      type="button" 
                      onClick={() => setShowForm(false)}
                      className="text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                  
                  {/* Rating */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-wood-900 dark:text-sand-100 mb-2 uppercase tracking-wide">
                      Calificación General
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none transition-transform hover:scale-110 p-1"
                        >
                          <Star 
                            size={32} 
                            className={`${(hoverRating || rating) >= star ? 'text-accent-gold' : 'text-wood-200 dark:text-wood-700'}`} 
                            fill={(hoverRating || rating) >= star ? "currentColor" : "currentColor"}
                            strokeWidth={0}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="text-xs text-wood-500 mt-1">
                        {rating === 5 ? '¡Excelente!' : rating === 4 ? 'Muy bueno' : rating === 3 ? 'Regular' : rating === 2 ? 'Podría mejorar' : 'Malo'}
                      </p>
                    )}
                  </div>

                  {/* Title (optional) */}
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-wood-900 dark:text-sand-100 mb-2 uppercase tracking-wide">
                      Título <span className="text-wood-400 font-normal normal-case">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Resumen de tu experiencia"
                      maxLength={100}
                      className="w-full bg-wood-50 dark:bg-wood-800/50 border border-wood-300 dark:border-wood-600 rounded-lg p-3 text-base text-wood-900 dark:text-sand-100 placeholder:text-wood-500 focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all"
                    />
                  </div>

                  {/* Comment */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-wood-900 dark:text-sand-100 mb-2 uppercase tracking-wide">
                      Cuéntanos más
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="¿Qué es lo que más te gusta de la pieza? ¿Cómo se siente el material?"
                      className="w-full bg-wood-50 dark:bg-wood-800/50 border border-wood-300 dark:border-wood-600 rounded-lg p-4 text-base text-wood-900 dark:text-sand-100 placeholder:text-wood-500 focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all min-h-[140px]"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting || rating === 0}
                      className="bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-accent-gold hover:text-wood-900 dark:hover:bg-accent-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {submitting ? 'Publicando...' : 'Publicar Reseña'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reviews List */}
          <div className="space-y-8">
            {loading ? (
              <ReviewSkeleton />
            ) : reviews.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-wood-300 dark:border-wood-700 rounded-2xl bg-wood-100 dark:bg-wood-900/30">
                <MessageSquare className="mx-auto h-12 w-12 text-wood-400 dark:text-wood-500 mb-4" />
                <h5 className="text-lg font-serif text-wood-900 dark:text-sand-100 mb-2">Sin opiniones todavía</h5>
                <p className="text-wood-700 dark:text-sand-200 max-w-sm mx-auto font-medium">
                  Sé la primera persona en compartir su experiencia con esta pieza exclusiva.
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <motion.div 
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-wood-900/20 p-6 md:p-8 rounded-xl border border-wood-200 dark:border-wood-700 hover:border-wood-300 dark:hover:border-wood-600 transition-colors shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-wood-100 dark:bg-wood-800 flex items-center justify-center shrink-0 border border-wood-300 dark:border-wood-600 overflow-hidden">
                        {review.user_avatar ? (
                          <img src={review.user_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-serif text-lg font-bold text-wood-800 dark:text-sand-100">
                            {(review.user_name || '?').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-base font-bold text-wood-900 dark:text-sand-100">
                          {review.user_name || 'Cliente'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex text-accent-gold">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} size={14} fill="currentColor" className={star <= review.rating ? "" : "text-wood-300 dark:text-wood-600"} strokeWidth={0} />
                            ))}
                          </div>
                          {review.order_id && (
                            <>
                              <span className="text-xs text-wood-400 dark:text-wood-600">•</span>
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Compra verificada</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-wood-500 dark:text-wood-400 uppercase tracking-wide">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  
                  <div className="pl-0 md:pl-16">
                    {review.title && (
                      <p className="font-bold text-wood-900 dark:text-sand-100 mb-2">{review.title}</p>
                    )}
                    <p className="text-wood-900 dark:text-sand-100 text-base leading-relaxed font-normal">
                      {review.body}
                    </p>

                    {/* Admin reply */}
                    {review.admin_reply && (
                      <div className="mt-4 bg-wood-50 dark:bg-wood-800/50 rounded-xl p-4 border border-wood-100 dark:border-wood-700/50">
                        <div className="flex items-center gap-1.5 mb-2">
                          <User size={12} className="text-wood-500" />
                          <span className="text-xs font-bold uppercase tracking-widest text-wood-500">
                            Respuesta de Qorthe
                          </span>
                        </div>
                        <p className="text-sm text-wood-600 dark:text-sand-300 italic">
                          {review.admin_reply}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
