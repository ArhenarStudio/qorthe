"use client";

import React, { useState, useEffect } from 'react';
import { Star, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Review } from '@/types/review';
import { ReviewSkeleton } from '@/components/ui/ReviewSkeleton';

// Mock reviews until backend is connected
const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    productId: '',
    userId: 'user1',
    userName: 'María García',
    rating: 5,
    comment: 'Hermosa tabla de parota. La calidad de la madera es increíble y el acabado es perfecto. Llegó muy bien empacada.',
    createdAt: '2025-12-15T10:00:00Z',
    helpful: 12,
  },
  {
    id: '2',
    productId: '',
    userId: 'user2',
    userName: 'Roberto Sánchez',
    rating: 4,
    comment: 'Excelente producto, la madera tiene una veta preciosa. Solo tardó un poco más de lo esperado en llegar.',
    createdAt: '2025-11-20T14:30:00Z',
    helpful: 8,
  },
  {
    id: '3',
    productId: '',
    userId: 'user3',
    userName: 'Ana López',
    rating: 5,
    comment: 'La compré como regalo y quedaron encantados. Se nota que es trabajo artesanal de verdad.',
    createdAt: '2025-10-05T09:15:00Z',
    helpful: 15,
  },
];

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Load mock reviews (replace with real API when backend is ready)
    const timer = setTimeout(() => {
      setReviews(MOCK_REVIEWS.map(r => ({ ...r, productId })));
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [productId]);

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

    setSubmitting(true);
    try {
      // Mock submit — replace with real API when backend is ready
      const newReview: Review = {
        id: Date.now().toString(),
        productId,
        userId: 'current-user',
        userName: 'Usuario',
        rating,
        comment,
        createdAt: new Date().toISOString(),
        helpful: 0,
      };
      setReviews([newReview, ...reviews]);
      setComment('');
      setRating(0);
      setShowForm(false);
      toast.success('¡Gracias por tu opinión!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error al enviar la opinión');
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

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="py-16 border-t border-wood-200 dark:border-wood-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Summary Column (Left - 4 cols) */}
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
                {averageRating}
              </span>
              <div className="flex flex-col items-center lg:items-start">
                <div className="flex gap-1 text-accent-gold mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={20} 
                      fill={star <= Number(averageRating) ? "currentColor" : "currentColor"} 
                      strokeWidth={0}
                      className={star <= Number(averageRating) ? "" : "text-wood-400 dark:text-wood-600"}
                    />
                  ))}
                </div>
                <p className="text-sm font-bold text-wood-700 dark:text-sand-200 uppercase tracking-wide">
                  Basado en {reviews.length} reseñas
                </p>
              </div>
            </div>
          </div>

          {!user ? (
            <div className="p-6 rounded-xl border border-wood-300 dark:border-wood-600 bg-white dark:bg-wood-900/40 shadow-sm">
              <h4 className="font-serif text-lg text-wood-900 dark:text-sand-100 mb-2">Comparte tu experiencia</h4>
              <p className="text-sm text-wood-800 dark:text-sand-200 mb-4 leading-relaxed font-medium">
                ¿Ya tienes esta pieza en tu colección? Nos encantaría conocer tu opinión.
              </p>
              <button 
                disabled 
                className="w-full py-3 px-4 border border-wood-300 text-wood-600 font-bold rounded-lg text-sm cursor-not-allowed bg-wood-100"
              >
                Inicia sesión para opinar
              </button>
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

        {/* Reviews List & Form Column (Right - 8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Review Form (Expandable) */}
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
                  </div>

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
                      disabled={submitting}
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
                      <div className="w-12 h-12 rounded-full bg-wood-100 dark:bg-wood-800 flex items-center justify-center shrink-0 border border-wood-300 dark:border-wood-600">
                        <span className="font-serif text-lg font-bold text-wood-800 dark:text-sand-100">
                          {review.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-base font-bold text-wood-900 dark:text-sand-100">
                          {review.userName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex text-accent-gold">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} size={14} fill={star <= review.rating ? "currentColor" : "currentColor"} className={star <= review.rating ? "" : "text-wood-300 dark:text-wood-600"} strokeWidth={0} />
                            ))}
                          </div>
                          <span className="text-xs text-wood-400 dark:text-wood-600">•</span>
                          <span className="text-xs font-bold text-wood-600 dark:text-sand-300">Verificado</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-wood-500 dark:text-wood-400 uppercase tracking-wide">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  
                  <div className="pl-0 md:pl-16">
                    <p className="text-wood-900 dark:text-sand-100 text-base leading-relaxed font-normal">
                      {review.comment}
                    </p>
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
