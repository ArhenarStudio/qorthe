"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, CheckCircle, XCircle, MessageSquare, Filter, ChevronDown, RefreshCw, Wifi, WifiOff, X, Send } from 'lucide-react';
import { toast } from 'sonner';

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

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pendiente', class: 'bg-amber-50 text-amber-600' },
  approved: { label: 'Aprobado', class: 'bg-green-50 text-green-600' },
  rejected: { label: 'Rechazado', class: 'bg-red-50 text-red-500' },
};

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const res = await fetch(`/api/admin/reviews?limit=100${statusParam}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setReviews(data.reviews || []);
      setCounts(data.counts || { pending: 0, approved: 0, rejected: 0 });
      setIsLive(true);
    } catch (error) {
      console.error('[ReviewsPage] fetch error:', error);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReviews();
    const interval = setInterval(fetchReviews, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchReviews]);

  const handleAction = async (reviewId: string, action: 'approve' | 'reject') => {
    // Optimistic update
    const prev = [...reviews];
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, status: newStatus as ReviewData['status'] } : r));

    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: reviewId, action }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(action === 'approve' ? 'Review aprobado ✓' : 'Review rechazado');
      fetchReviews(); // refresh counts
    } catch {
      setReviews(prev);
      toast.error('Error al moderar el review');
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;

    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: reviewId, admin_reply: replyText.trim() }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Respuesta publicada ✓');
      setReplyingTo(null);
      setReplyText('');
      fetchReviews();
    } catch {
      toast.error('Error al responder');
    }
  };

  const totalReviews = counts.pending + counts.approved + counts.rejected;
  const avgRating = reviews.length > 0
    ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
    : 0;

  const distribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    return {
      star,
      count,
      pct: reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-wood-900">Reviews</h3>
        <div className="flex items-center gap-3">
          {isLive ? (
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium">
              <Wifi size={12} /> En vivo
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] text-wood-400 font-medium">
              <WifiOff size={12} /> Sin conexión
            </span>
          )}
          <button onClick={fetchReviews} className="p-1.5 hover:bg-wood-50 rounded-lg transition-colors" title="Actualizar">
            <RefreshCw size={14} className={`text-wood-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className={i < Math.round(avgRating) ? 'fill-accent-gold text-accent-gold' : 'text-wood-200'} />
            ))}
          </div>
          <p className="text-2xl font-bold text-wood-900 font-sans">{avgRating > 0 ? avgRating : '—'}</p>
          <p className="text-[10px] text-wood-400 uppercase tracking-wider">Rating promedio</p>
        </div>
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-5">
          <p className="text-[10px] text-wood-400 uppercase tracking-wider mb-2">Distribución</p>
          {distribution.map(d => (
            <div key={d.star} className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-wood-500 w-3">{d.star}</span>
              <Star size={10} className="text-accent-gold fill-accent-gold" />
              <div className="flex-1 h-2 bg-wood-100 rounded-full overflow-hidden">
                <div className="h-full bg-accent-gold rounded-full transition-all" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="text-[10px] text-wood-400 w-8 text-right">{d.pct}%</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-5 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-amber-600 font-sans">{counts.pending}</p>
          <p className="text-[10px] text-wood-400 uppercase tracking-wider">Pendientes de moderación</p>
          <p className="text-[10px] text-wood-300 mt-1">{totalReviews} total</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex justify-end">
        <div className="relative">
          <button onClick={() => setFilterOpen(!filterOpen)} className="flex items-center gap-2 px-4 py-2 bg-white border border-wood-200 rounded-lg text-xs text-wood-600">
            <Filter size={14} /> {statusFilter === 'all' ? 'Todos' : statusConfig[statusFilter]?.label}
            {statusFilter === 'all' && counts.pending > 0 && (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{counts.pending}</span>
            )}
            <ChevronDown size={12} />
          </button>
          {filterOpen && (
            <div className="absolute right-0 mt-1 bg-white border border-wood-200 rounded-lg shadow-lg py-1 z-20 min-w-[160px]">
              {[
                { key: 'all', label: 'Todos', count: totalReviews },
                { key: 'pending', label: 'Pendientes', count: counts.pending },
                { key: 'approved', label: 'Aprobados', count: counts.approved },
                { key: 'rejected', label: 'Rechazados', count: counts.rejected },
              ].map(s => (
                <button key={s.key} onClick={() => { setStatusFilter(s.key); setFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-xs hover:bg-sand-50 flex justify-between ${s.key === statusFilter ? 'text-accent-gold font-medium' : 'text-wood-600'}`}>
                  <span>{s.label}</span>
                  <span className="text-wood-300">{s.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-wood-400 text-sm">Cargando reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-wood-400 text-sm">
            {statusFilter === 'all' ? 'Aún no hay reviews' : `No hay reviews con estado "${statusConfig[statusFilter]?.label}"`}
          </div>
        ) : (
          reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-white rounded-xl border border-wood-100 shadow-sm p-5"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {review.product_thumbnail ? (
                  <img src={review.product_thumbnail} alt={review.product_title || ''} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-wood-100 flex-shrink-0 flex items-center justify-center text-wood-300">
                    <Star size={20} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-medium text-wood-900">{review.product_title || 'Producto'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={i < review.rating ? 'fill-accent-gold text-accent-gold' : 'text-wood-200'} />
                          ))}
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig[review.status]?.class}`}>
                          {statusConfig[review.status]?.label}
                        </span>
                        {review.order_id && (
                          <span className="text-[10px] font-medium text-emerald-600">Compra verificada</span>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-wood-400 flex-shrink-0">
                      {new Date(review.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {review.title && (
                    <p className="text-xs font-semibold text-wood-800 mb-1">{review.title}</p>
                  )}
                  <p className="text-xs text-wood-600 leading-relaxed mb-3">
                    &ldquo;{review.body}&rdquo;
                  </p>

                  {/* Admin Reply */}
                  {review.admin_reply && (
                    <div className="mb-3 bg-wood-50 rounded-lg p-3 border border-wood-100">
                      <p className="text-[10px] text-wood-400 uppercase tracking-wider mb-1">Tu respuesta:</p>
                      <p className="text-xs text-wood-600 italic">{review.admin_reply}</p>
                    </div>
                  )}

                  {/* Reply Form */}
                  <AnimatePresence>
                    {replyingTo === review.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3 overflow-hidden"
                      >
                        <div className="bg-sand-50 rounded-lg p-3 border border-wood-100">
                          <textarea
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder="Escribe tu respuesta al cliente..."
                            className="w-full text-xs text-wood-700 bg-white border border-wood-200 rounded-lg p-2 min-h-[60px] resize-none focus:outline-none focus:border-accent-gold"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="px-3 py-1.5 text-[11px] text-wood-500 hover:text-wood-700">
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleReply(review.id)}
                              disabled={!replyText.trim()}
                              className="flex items-center gap-1 px-3 py-1.5 bg-wood-900 text-white rounded-lg text-[11px] font-medium hover:bg-wood-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send size={10} /> Publicar
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-wood-100 flex items-center justify-center text-[9px] font-bold text-wood-600 overflow-hidden">
                        {review.user_avatar ? (
                          <img src={review.user_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (review.user_name || '?').charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-[11px] text-wood-500">{review.user_name || 'Cliente'}</span>
                    </div>
                    <div className="flex gap-2">
                      {review.status === 'pending' && (
                        <>
                          <button onClick={() => handleAction(review.id, 'approve')} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-[11px] font-medium hover:bg-green-100 transition-colors">
                            <CheckCircle size={12} /> Aprobar
                          </button>
                          <button onClick={() => handleAction(review.id, 'reject')} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-[11px] font-medium hover:bg-red-100 transition-colors">
                            <XCircle size={12} /> Rechazar
                          </button>
                        </>
                      )}
                      {!review.admin_reply && replyingTo !== review.id && (
                        <button
                          onClick={() => { setReplyingTo(review.id); setReplyText(''); }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-sand-50 text-wood-600 rounded-lg text-[11px] font-medium hover:bg-sand-100 transition-colors"
                        >
                          <MessageSquare size={12} /> Responder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
