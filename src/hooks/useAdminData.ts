// ═══════════════════════════════════════════════════════════════
// useAdminData — Generic fetch hook for admin API routes
//
// Fetches data from /api/admin/* endpoints with:
// - Loading/error states
// - Auto-refetch on param changes
// - SWR-like caching within component lifecycle
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseAdminDataOptions {
  /** Skip fetch if true */
  skip?: boolean;
  /** Re-fetch interval in ms (0 = no refetch) */
  refreshInterval?: number;
}

interface UseAdminDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAdminData<T = any>(
  endpoint: string,
  options: UseAdminDataOptions = {}
): UseAdminDataResult<T> {
  const { skip = false, refreshInterval = 0 } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (skip) return;

    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(endpoint, { signal: controller.signal });

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${resp.status}`);
      }

      const json = await resp.json();
      setData(json);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(`[useAdminData] ${endpoint}:`, err.message);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, skip]);

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0 && !skip) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }

    return () => abortRef.current?.abort();
  }, [fetchData, refreshInterval, skip]);

  return { data, loading, error, refetch: fetchData };
}
