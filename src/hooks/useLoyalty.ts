// ═══════════════════════════════════════════════════════════
// Hook: useLoyalty — fetch loyalty profile from /api/loyalty
// Used in AccountOverview + LoyaltyDashboard + Checkout
// ═══════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface LoyaltyProfile {
  id: string;
  user_id: string;
  points_balance: number;
  lifetime_points: number;
  lifetime_spend: number;
  current_tier: string;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  type: "earn" | "redeem" | "expire" | "adjust";
  points: number;
  description: string;
  order_id?: string;
  order_display_id?: string;
  created_at: string;
}

interface UseLoyaltyReturn {
  profile: LoyaltyProfile | null;
  transactions: LoyaltyTransaction[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useLoyalty(): UseLoyaltyReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoyalty = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/loyalty?user_id=${user.id}`);
      if (!res.ok) {
        throw new Error(`Loyalty API error: ${res.status}`);
      }

      const data = await res.json();
      setProfile(data.profile || null);
      setTransactions(data.transactions || []);
    } catch (err: any) {
      console.error("[useLoyalty] Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchLoyalty();
  }, [fetchLoyalty]);

  return { profile, transactions, loading, error, refresh: fetchLoyalty };
}
