"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import type { AuthUser, SignUpData, SignInData } from "../types";
import { commerce } from "@/lib/commerce";

function mapUser(user: User | null): AuthUser | null {
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? "",
    firstName: meta.firstName ?? meta.first_name,
    lastName: meta.lastName ?? meta.last_name,
    phone: meta.phone,
    createdAt: user.created_at,
  };
}

const NOT_CONFIGURED = "Supabase is not configured (missing env vars).";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const init = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();
      setSession(initialSession ?? null);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, newSession: Session | null) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signUp = useCallback(
    async (email: string, password: string, metadata?: SignUpData["metadata"]) => {
      if (!supabase) throw new Error(NOT_CONFIGURED);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: metadata?.firstName,
            lastName: metadata?.lastName,
            phone: metadata?.phone,
          },
        },
      });
      if (error) throw error;

      // Sync customer to commerce backend (non-blocking; user stays in Supabase on failure)
      commerce.createCustomer(
        email,
        password,
        metadata?.firstName,
        metadata?.lastName
      ).then((result) => {
        if (!result.success) {
          console.warn("[auth] Commerce customer sync failed:", result.errors);
        }
      });

      return data;
    },
    [supabase]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) throw new Error(NOT_CONFIGURED);
      return supabase.auth.signInWithPassword({
        email,
        password,
      });
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, [supabase]);

  const resetPassword = useCallback(
    async (email: string) => {
      if (!supabase) throw new Error(NOT_CONFIGURED);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/update-password`,
      });
      if (error) throw error;
      return data;
    },
    [supabase]
  );

  return {
    user: mapUser(user),
    session,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
}
