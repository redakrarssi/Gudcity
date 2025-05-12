import { useState, useEffect, useRef, useCallback } from 'react';

interface CacheOptions {
  /** Cache expiration time in milliseconds */
  expirationTime?: number;
  /** Whether to refetch when window comes back into focus */
  refetchOnFocus?: boolean;
  /** Whether to refetch when network reconnects */
  refetchOnReconnect?: boolean;
  /** Stale-while-revalidate: use cached data while fetching fresh data */
  staleWhileRevalidate?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  error: Error | null;
}

// Global cache store
const cacheStore: Record<string, CacheEntry<any>> = {};

/**
 * Hook for data fetching with caching to improve performance and reduce API calls
 * 
 * @param key Unique cache key for this data
 * @param fetchFn Function that returns a promise with the data
 * @param options Caching configuration options
 */
export function useDataCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  {
    expirationTime = 5 * 60 * 1000, // 5 minutes default
    refetchOnFocus = false,
    refetchOnReconnect = false,
    staleWhileRevalidate = true
  }: CacheOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Keep function reference stable between renders
  const stableFetchFn = useRef(fetchFn);
  useEffect(() => {
    stableFetchFn.current = fetchFn;
  }, [fetchFn]);

  // Check if cache is stale
  const isCacheStale = useCallback((cacheKey: string): boolean => {
    const cacheEntry = cacheStore[cacheKey];
    if (!cacheEntry) return true;
    
    const now = Date.now();
    return now - cacheEntry.timestamp > expirationTime;
  }, [expirationTime]);

  // Main fetch function
  const fetchData = useCallback(async (ignoreCache = false): Promise<void> => {
    // Check cache first
    if (!ignoreCache && cacheStore[key] && !isCacheStale(key)) {
      const { data: cachedData, error: cachedError } = cacheStore[key];
      setData(cachedData);
      setError(cachedError);
      return;
    }

    // If staleWhileRevalidate is true, use stale data while fetching
    if (staleWhileRevalidate && cacheStore[key]) {
      setData(cacheStore[key].data);
    }

    setIsLoading(true);
    try {
      const freshData = await stableFetchFn.current();
      
      // Update cache
      cacheStore[key] = {
        data: freshData,
        timestamp: Date.now(),
        error: null
      };
      
      setData(freshData);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      // Update cache with error
      if (cacheStore[key]) {
        cacheStore[key].error = error;
      } else {
        cacheStore[key] = {
          data: null as unknown as T,
          timestamp: Date.now(),
          error
        };
      }
      
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [key, isCacheStale, staleWhileRevalidate]);

  // Initial fetch and event listeners
  useEffect(() => {
    fetchData();

    // Setup refetch on window focus
    const handleFocus = () => {
      if (refetchOnFocus && isCacheStale(key)) {
        fetchData();
      }
    };

    // Setup refetch on network reconnect
    const handleOnline = () => {
      if (refetchOnReconnect && isCacheStale(key)) {
        fetchData();
      }
    };

    if (refetchOnFocus) {
      window.addEventListener('focus', handleFocus);
    }

    if (refetchOnReconnect) {
      window.addEventListener('online', handleOnline);
    }

    return () => {
      if (refetchOnFocus) {
        window.removeEventListener('focus', handleFocus);
      }
      if (refetchOnReconnect) {
        window.removeEventListener('online', handleOnline);
      }
    };
  }, [fetchData, refetchOnFocus, refetchOnReconnect, key, isCacheStale]);

  // Force refetch
  const refetch = useCallback(() => fetchData(true), [fetchData]);

  // Invalidate cache for this key
  const invalidateCache = useCallback(() => {
    delete cacheStore[key];
    refetch();
  }, [key, refetch]);

  return { data, isLoading, error, refetch, invalidateCache };
}

// Utility to manually clear all cache or specific keys
export const clearCache = (keys?: string | string[]): void => {
  if (!keys) {
    // Clear all cache
    Object.keys(cacheStore).forEach(key => {
      delete cacheStore[key];
    });
  } else if (typeof keys === 'string') {
    // Clear single key
    delete cacheStore[keys];
  } else {
    // Clear multiple keys
    keys.forEach(key => {
      delete cacheStore[key];
    });
  }
};

export default useDataCache; 