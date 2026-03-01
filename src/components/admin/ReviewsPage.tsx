"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, CheckCircle, XCircle, MessageSquare, Filter, ChevronDown } from 'lucide-react';
import { reviews as mockReviews, type Review } from '@/data/adminMockData';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pendiente', class: 'bg-amber-50 text-amber-600' },
  approved: { label: 'Aprobado', class: 'bg-green-50 text-green-600' },
  rejected: { label: 'Rechazado', class: 'bg-red-50 text-red-500' },
};

export const ReviewsPage: React.FC = () => {
  const [reviewsData, setReviewsData] = useState<Review[]>(mockReviews);
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = reviewsData.filter(r => statusFilter === 'all' || r.status === statusFilter);

  const avgRating = reviewsData.reduce((s, r) => s + r.rating, 0) / reviewsData.length;
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviewsData.filter(r => r.rating === star).length,
    pct: Math.round((reviewsData.filter(r => r.rating === star).length / reviewsData.length) * 100),
  }));
  const pendingCount = reviewsData.filter(r => r.status === 'pending').length;

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setReviewsData(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    toast.success(action === 'approved' ? 'Review aprobado' : 'Review rechazado');
  };

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-lg text-wood-900">Reviews</h3>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className={i < Math.round(avgRating) ? 'fill-accent-gold text-accent-gold' : 'text-wood-200'} />
            ))}
          </div>
          <p className="text-2xl font-bold text-wood-900 font-sans">{avgRating.toFixed(1)}</p>
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
          <p className="text-3xl font-bold text-amber-600 font-sans">{pendingCount}</p>
          <p className="text-[10px] text-wood-400 uppercase tracking-wider">Pendientes de moderación</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex justify-end">
        <div className="relative">
          <button onClick={() => setFilterOpen(!filterOpen)} className="flex items-center gap-2 px-4 py-2 bg-white border border-wood-200 rounded-lg text-xs text-wood-600">
            <Filter size={14} /> {statusFilter === 'all' ? 'Todos' : statusConfig[statusFilter]?.label} <ChevronDown size={12} />
          </button>
          {filterOpen && (
            <div className="absolute right-0 mt-1 bg-white border border-wood-200 rounded-lg shadow-lg py-1 z-20 min-w-[140px]">
              {['all', 'pending', 'approved', 'rejected'].map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-xs hover:bg-sand-50 ${s === statusFilter ? 'text-accent-gold font-medium' : 'text-wood-600'}`}>
                  {s === 'all' ? 'Todos' : statusConfig[s]?.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Cards */}
      <div className="space-y-4">
        {filtered.map((review, idx) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl border border-wood-100 shadow-sm p-5"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <img src={review.productImage} alt={review.productName} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-medium text-wood-900">{review.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < review.rating ? 'fill-accent-gold text-accent-gold' : 'text-wood-200'} />
                        ))}
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig[review.status]?.class}`}>
                        {statusConfig[review.status]?.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-wood-400 flex-shrink-0">{new Date(review.date).toLocaleDateString('es-MX')}</p>
                </div>
                <p className="text-xs text-wood-600 leading-relaxed mb-3">"{review.text}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-wood-100 flex items-center justify-center text-[9px] font-bold text-wood-600">
                      {review.customerName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-[11px] text-wood-500">{review.customerName}</span>
                    <span className="text-[10px] text-wood-400">({review.customerOrders} compras)</span>
                  </div>
                  {review.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(review.id, 'approved')} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-[11px] font-medium hover:bg-green-100 transition-colors">
                        <CheckCircle size={12} /> Aprobar
                      </button>
                      <button onClick={() => handleAction(review.id, 'rejected')} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-[11px] font-medium hover:bg-red-100 transition-colors">
                        <XCircle size={12} /> Rechazar
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-sand-50 text-wood-600 rounded-lg text-[11px] font-medium hover:bg-sand-100 transition-colors">
                        <MessageSquare size={12} /> Responder
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
