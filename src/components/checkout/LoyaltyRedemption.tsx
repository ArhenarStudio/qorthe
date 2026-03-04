// ═══════════════════════════════════════════════════════════
// LoyaltyRedemption — Checkout widget for redeeming points
// Fase 9.6: Canje de puntos en checkout
// ═══════════════════════════════════════════════════════════

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Award, Minus, Plus, Gift, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLoyalty } from "@/hooks/useLoyalty";
import { formatPrice } from "@/config/shipping";

// 1 point = $0.01 MXN (100 pts = $1 MXN)
const POINTS_TO_CURRENCY = 0.01;
// Min points to redeem
const MIN_REDEEM_POINTS = 100;
// Step increment for quick adjust
const STEP = 100;

interface LoyaltyRedemptionProps {
  /** Cart total in centavos (Medusa format) */
  cartTotal: number;
  currencyCode: string;
  /** Called when user changes redemption amount */
  onRedemptionChange: (pointsToRedeem: number, discountAmount: number) => void;
  /** Whether checkout is processing (disable interactions) */
  disabled?: boolean;
}

export const LoyaltyRedemption: React.FC<LoyaltyRedemptionProps> = ({
  cartTotal,
  currencyCode,
  onRedemptionChange,
  disabled = false,
}) => {
  const { user } = useAuth();
  const { profile, loading } = useLoyalty();
  const [expanded, setExpanded] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const availablePoints = profile?.points_balance ?? 0;
  // Max discount cannot exceed cart total (in pesos, so convert from centavos)
  const cartTotalPesos = cartTotal / 100;
  const maxRedeemableValue = Math.min(
    availablePoints * POINTS_TO_CURRENCY,
    cartTotalPesos
  );
  const maxRedeemablePoints = Math.floor(maxRedeemableValue / POINTS_TO_CURRENCY);

  // Notify parent whenever points change
  useEffect(() => {
    const discountCentavos = Math.round(pointsToRedeem * POINTS_TO_CURRENCY * 100);
    onRedemptionChange(pointsToRedeem, discountCentavos);
  }, [pointsToRedeem, onRedemptionChange]);

  // Reset if points become insufficient
  useEffect(() => {
    if (pointsToRedeem > maxRedeemablePoints) {
      setPointsToRedeem(maxRedeemablePoints);
    }
  }, [maxRedeemablePoints, pointsToRedeem]);

  const adjustPoints = useCallback(
    (delta: number) => {
      setPointsToRedeem((prev) => {
        const next = prev + delta;
        return Math.max(0, Math.min(next, maxRedeemablePoints));
      });
    },
    [maxRedeemablePoints]
  );

  const handleUseAll = useCallback(() => {
    setPointsToRedeem(maxRedeemablePoints);
  }, [maxRedeemablePoints]);

  const handleClear = useCallback(() => {
    setPointsToRedeem(0);
  }, []);

  // Don't render if not logged in or no points
  if (!user || loading) return null;
  if (availablePoints < MIN_REDEEM_POINTS) return null;

  const discountValue = pointsToRedeem * POINTS_TO_CURRENCY;
  const hasRedemption = pointsToRedeem > 0;

  return (
    <div className="pt-5 border-t border-wood-200">
      {/* Header Toggle */}
      <button
        type="button"
        onClick={() => !disabled && setExpanded(!expanded)}
        className="w-full flex items-center justify-between group"
        disabled={disabled}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
            hasRedemption ? "bg-accent-gold/20 text-accent-gold" : "bg-wood-100 text-wood-500"
          }`}>
            <Gift className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <span className="text-sm font-medium text-wood-900">
              Usar puntos de lealtad
            </span>
            <span className="text-xs text-wood-500 block">
              {availablePoints.toLocaleString()} pts disponibles (${(availablePoints * POINTS_TO_CURRENCY).toFixed(0)} MXN)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasRedemption && (
            <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
              -{formatPrice(Math.round(discountValue * 100), currencyCode)}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-wood-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-wood-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Points Slider / Controls */}
          <div className="bg-wood-50 rounded-xl p-4 space-y-3">
            {/* Quick Actions */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-wood-600 uppercase tracking-wider">
                Puntos a canjear
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUseAll}
                  disabled={disabled || pointsToRedeem === maxRedeemablePoints}
                  className="text-[10px] font-bold uppercase tracking-wider text-accent-gold hover:text-wood-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Usar máximo
                </button>
                {hasRedemption && (
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={disabled}
                    className="text-[10px] font-bold uppercase tracking-wider text-wood-400 hover:text-red-500 transition-colors"
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>

            {/* Stepper Control */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => adjustPoints(-STEP)}
                disabled={disabled || pointsToRedeem === 0}
                className="w-9 h-9 rounded-lg bg-white border border-wood-200 flex items-center justify-center text-wood-600 hover:bg-wood-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex-1 text-center">
                <div className="text-2xl font-serif font-bold text-wood-900">
                  {pointsToRedeem.toLocaleString()}
                </div>
                <div className="text-xs text-wood-500">
                  = {formatPrice(Math.round(discountValue * 100), currencyCode)} de descuento
                </div>
              </div>

              <button
                type="button"
                onClick={() => adjustPoints(STEP)}
                disabled={disabled || pointsToRedeem >= maxRedeemablePoints}
                className="w-9 h-9 rounded-lg bg-white border border-wood-200 flex items-center justify-center text-wood-600 hover:bg-wood-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="h-2 bg-wood-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-gold rounded-full transition-all duration-300"
                  style={{
                    width: `${maxRedeemablePoints > 0 ? (pointsToRedeem / maxRedeemablePoints) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-wood-400">
                <span>0 pts</span>
                <span>{maxRedeemablePoints.toLocaleString()} pts (máx.)</span>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <p className="text-[11px] text-wood-400 leading-relaxed flex items-start gap-1.5">
            <Award className="w-3 h-3 mt-0.5 shrink-0 text-wood-300" />
            Los puntos se deducirán de tu saldo al completar la compra. Cada 100 puntos = $1 MXN de descuento.
          </p>
        </div>
      )}
    </div>
  );
};
