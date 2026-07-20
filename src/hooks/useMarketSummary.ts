import { useCallback, useEffect, useState } from 'react';
import { marketService } from '../api/services/marketService';
import { ApiClientError } from '../api/types/common';
import type { MarketSummary } from '../api/types/market';
import { getErrorMessage } from '../utils/errorDictionary';

type AsyncStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

interface AsyncError {
  errorCode: string;
  message: string;
}

interface UseMarketSummaryParams {
  enabled?: boolean;
  accessToken?: string | null;
}

const toAsyncError = (error: unknown): AsyncError => {
  if (error instanceof ApiClientError) {
    return {
      errorCode: error.errorCode,
      message: error.message || getErrorMessage(error.errorCode),
    };
  }

  return {
    errorCode: 'UNKNOWN_ERROR',
    message: getErrorMessage('UNKNOWN_ERROR'),
  };
};

const CACHE_KEY = 'gogisise:cache:market_summary';

export function useMarketSummary(params: UseMarketSummaryParams = {}) {
  const { enabled = true, accessToken = null } = params;
  
  const [summary, setSummary] = useState<MarketSummary | null>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [status, setStatus] = useState<AsyncStatus>(() => {
    try {
      return localStorage.getItem(CACHE_KEY) ? 'success' : 'idle';
    } catch {
      return 'idle';
    }
  });

  const [error, setError] = useState<AsyncError | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setStatus('idle');
      setSummary(null);
      return;
    }

    const controller = new AbortController();
    setStatus((prev) => (prev === 'success' ? 'success' : 'loading'));
    setError(null);

    try {
      const result = await marketService.getMarketSummary({
        accessToken,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setSummary(result);
      setStatus('success');
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(result));
      } catch (e) {
        console.warn('Failed to cache market summary', e);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(toAsyncError(err));
      setStatus('error');
    }
  }, [accessToken, enabled]);

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      setSummary(null);
      return;
    }

    const controller = new AbortController();
    setStatus((prev) => (prev === 'success' ? 'success' : 'loading'));
    setError(null);

    marketService
      .getMarketSummary({ accessToken, signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) {
          setSummary(result);
          setStatus('success');
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(result));
          } catch (e) {
            console.warn('Failed to cache market summary', e);
          }
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(toAsyncError(err));
        setStatus('error');
      });

    return () => {
      controller.abort();
    };
  }, [accessToken, enabled]);

  return {
    status,
    summary,
    error,
    refetch,
  };
}
