"use client";

// ═══════════════════════════════════════════════════════════════
// AuthContext — Estado global de autenticación (Supabase + Medusa)
//
// Provee: user, session, medusaCustomer, loading, signOut
// Se suscribe a onAuthStateChange para reaccionar en tiempo real.
// Post-login: sincroniza automáticamente con Medusa Customer via
// POST /api/auth/sync (puente Supabase ↔ Medusa).
// ═══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session, SupabaseClient } from "@supabase/supabase-js";

// Medusa customer shape returned by auth-sync
export interface MedusaCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  metadata: Record<string, any>;
  addresses: MedusaAddress[];
}

export interface MedusaAddress {
  id: string;
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string | null;
  city: string;
  province: string;
  postal_code: string;
  country_code: string;
  phone: string | null;
  is_default_shipping: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  medusaCustomer: MedusaCustomer | null;
  loading: boolean;
  syncing: boolean;
  supabase: SupabaseClient | null;
  signOut: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  medusaCustomer: null,
  loading: true,
  syncing: false,
  supabase: null,
  signOut: async () => {},
  refreshCustomer: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [medusaCustomer, setMedusaCustomer] = useState<MedusaCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [supabase] = useState(() => createClient());
  const syncedRef = useRef<string | null>(null); // Track which user ID we've synced

  // ── Sync with Medusa backend ──
  const syncWithMedusa = useCallback(async (accessToken: string, userId: string) => {
    // Don't re-sync if already synced for this user
    if (syncedRef.current === userId) return;

    setSyncing(true);
    try {
      const resp = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: accessToken }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setMedusaCustomer(data.customer);
        syncedRef.current = userId;
      } else {
        const err = await resp.json().catch(() => ({}));
        console.warn("[AuthContext] Medusa sync failed:", err.error || resp.status);
        // Don't block auth flow if sync fails — user can still browse
      }
    } catch (error: any) {
      console.warn("[AuthContext] Medusa sync error:", error.message);
    } finally {
      setSyncing(false);
    }
  }, []);

  // ── Refresh customer data (for use after address/profile updates) ──
  const refreshCustomer = useCallback(async () => {
    if (!session?.access_token || !user?.id) return;
    syncedRef.current = null; // Force re-sync
    await syncWithMedusa(session.access_token, user.id);
  }, [session, user, syncWithMedusa]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);

      // Sync with Medusa if we have a session
      if (s?.access_token && s.user?.id) {
        syncWithMedusa(s.access_token, s.user.id);
      }
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);

        if (event === "SIGNED_IN" && s?.access_token && s.user?.id) {
          // Sync on login
          syncWithMedusa(s.access_token, s.user.id);
        } else if (event === "SIGNED_OUT") {
          // Clear Medusa customer on logout
          setMedusaCustomer(null);
          syncedRef.current = null;
        } else if (event === "TOKEN_REFRESHED" && s?.access_token && s.user?.id) {
          // Re-sync on token refresh to keep data fresh
          syncedRef.current = null;
          syncWithMedusa(s.access_token, s.user.id);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, syncWithMedusa]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setMedusaCustomer(null);
    syncedRef.current = null;
    window.location.href = '/';
  }, [supabase]);

  return (
    <AuthContext.Provider value={{
      user, session, medusaCustomer, loading, syncing, supabase, signOut, refreshCustomer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
