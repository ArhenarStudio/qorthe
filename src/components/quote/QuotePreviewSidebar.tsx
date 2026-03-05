"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductItem } from './types';
import { calculateItemPrice, formatMXN } from './pricing';
import { getProductIcon } from './QuoteIcons';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface QuotePreviewSidebarProps {
  item: ProductItem;
}

export const QuotePreviewSidebar: React.FC<QuotePreviewSidebarProps> = ({ item }) => {
  const [expanded, setExpanded] = React.useState(true);
  const bp = calculateItemPrice(item);

  const materialLabel = () => {
    if (item.category === 'textil') {
      return item.textile?.color || 'Sin color';
    }
    if (item.category === 'grabado') {
      return item.materialToEngrave || 'Sin material';
    }
    return item.woods.length > 0 ? item.woods.join(' + ') : 'Sin material';
  };

  const dimensionLabel = () => {
    if (item.category !== 'madera') return null;
    const { length, width, thickness } = item.dimensions;
    return `${length} × ${width} × ${thickness} cm`;
  };

  const Icon = getProductIcon(item.type);

  return (
    <div className="bg-white dark:bg-wood-950 border border-wood-100 dark:border-wood-800 rounded-2xl overflow-hidden shadow-lg">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 md:p-5 bg-wood-50 dark:bg-wood-900/50 border-b border-wood-100 dark:border-wood-800"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-gold/10 text-accent-gold flex items-center justify-center">
            <Icon size={20} />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-wood-400 block">
              Preview
            </span>
            <span className="text-sm font-serif font-medium text-wood-900 dark:text-sand-100">
              {item.type}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg font-bold text-wood-900 dark:text-sand-100">
            {formatMXN(bp.lineTotal)}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-wood-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-wood-400" />
          )}
        </div>
      </button>

      {/* Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 md:p-5 space-y-4">
              {/* Specs */}
              <div className="space-y-2">
                <Row label="Material" value={materialLabel()} />
                {dimensionLabel() && <Row label="Medidas" value={dimensionLabel()!} />}
                <Row label="Cantidad" value={`${item.quantity} ${item.quantity === 1 ? 'pieza' : 'piezas'}`} />
                {item.engraving.enabled && (
                  <Row
                    label="Grabado"
                    value={`${item.engraving.type} — ${item.engraving.complexity}`}
                    accent
                  />
                )}
                {item.category === 'textil' && item.textile && (
                  <Row
                    label="Estampado"
                    value={`${item.textile.technique} — ${item.textile.printZone}`}
                    accent
                  />
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-dashed border-wood-200 dark:border-wood-700 pt-3 space-y-1.5">
                <PriceRow label="Base" amount={bp.base} />
                {bp.engraving > 0 && (
                  <PriceRow label="Grabado" amount={bp.engraving} />
                )}
                <PriceRow label="Precio unitario" amount={bp.subtotalUnit} bold />
                {bp.volumeDiscount > 0 && (
                  <PriceRow
                    label={`Desc. volumen (${Math.round(bp.volumeDiscountPercent * 100)}%)`}
                    amount={-bp.volumeDiscount}
                    discount
                  />
                )}
                <div className="border-t border-wood-200 dark:border-wood-700 pt-2 mt-2 flex justify-between items-end">
                  <span className="text-xs font-bold uppercase tracking-widest text-wood-500">
                    Total ({item.quantity}×)
                  </span>
                  <span className="font-serif text-2xl font-bold text-wood-900 dark:text-sand-100">
                    {formatMXN(bp.lineTotal)}
                  </span>
                </div>
                <span className="text-[9px] text-wood-400 block text-right">MXN · Estimado</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-wood-400 text-xs uppercase tracking-wide">{label}</span>
      <span
        className={`font-medium ${
          accent ? 'text-accent-gold' : 'text-wood-700 dark:text-wood-300'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function PriceRow({
  label,
  amount,
  bold,
  discount,
}: {
  label: string;
  amount: number;
  bold?: boolean;
  discount?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-xs ${bold ? 'font-bold text-wood-600' : 'text-wood-400'}`}>
        {label}
      </span>
      <span
        className={`text-sm ${
          discount
            ? 'text-green-600 dark:text-green-400'
            : bold
            ? 'font-bold text-wood-900 dark:text-sand-100'
            : 'text-wood-600 dark:text-wood-300'
        }`}
      >
        {discount ? '−' : ''}{formatMXN(Math.abs(amount))}
      </span>
    </div>
  );
}
