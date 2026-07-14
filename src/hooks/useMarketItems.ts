import { useCallback, useEffect, useState } from 'react';
import { marketService } from '../api/services/marketService';
import { ApiClientError } from '../api/types/common';
import type { DataStatus, PriceItem } from '../api/types/market';
import { getErrorMessage } from '../utils/errorDictionary';

type AsyncStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

interface AsyncError {
  errorCode: string;
  message: string;
}

interface MarketItemsCache {
  items: PriceItem[];
  marketDate: string | null;
  dataStatus: DataStatus | null;
  fetchedAt: number;
}

interface UseMarketItemsParams {
  enabled?: boolean;
  accessToken?: string | null;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

let marketItemsCache: MarketItemsCache | null = null;
let inFlightPromise: Promise<MarketItemsCache> | null = null;

const isCacheFresh = (cache: MarketItemsCache | null) => {
  return Boolean(cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS);
};

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

const fetchMarketItems = async (
  accessToken?: string | null,
  signal?: AbortSignal
): Promise<MarketItemsCache> => {
  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = marketService
    .getMarketItemsResponse({ accessToken, signal })
    .then((response) => {
      const nextCache: MarketItemsCache = {
        items: response.items,
        marketDate: response.marketDate,
        dataStatus: response.dataStatus,
        fetchedAt: Date.now(),
      };
      marketItemsCache = nextCache;
      return nextCache;
    })
    .finally(() => {
      inFlightPromise = null;
    });

  return inFlightPromise;
};

export function useMarketItems(params: UseMarketItemsParams = {}) {
  const { enabled = true, accessToken = null } = params;
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [items, setItems] = useState<PriceItem[]>([]);
  const [marketDate, setMarketDate] = useState<string | null>(null);
  const [dataStatus, setDataStatus] = useState<DataStatus | null>(null);
  const [error, setError] = useState<AsyncError | null>(null);

  const applyCache = useCallback((cache: MarketItemsCache) => {
    setItems(cache.items);
    setMarketDate(cache.marketDate);
    setDataStatus(cache.dataStatus);
    setStatus(cache.items.length > 0 ? 'success' : 'empty');
    setError(null);
  }, []);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setStatus('idle');
      return;
    }

    const controller = new AbortController();
    setStatus('loading');
    setError(null);

    try {
      const nextCache = await fetchMarketItems(accessToken, controller.signal);
      applyCache(nextCache);
    } catch (err) {
      if (controller.signal.aborted) return;
      setItems([]);
      setMarketDate(null);
      setDataStatus(null);
      setError(toAsyncError(err));
      setStatus('error');
    }
  }, [accessToken, applyCache, enabled]);

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }

    if (isCacheFresh(marketItemsCache)) {
      applyCache(marketItemsCache as MarketItemsCache);
      return;
    }

    const controller = new AbortController();

    setStatus('loading');
    setError(null);

    fetchMarketItems(accessToken, controller.signal)
      .then((nextCache) => {
        if (!controller.signal.aborted) {
          applyCache(nextCache);
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setItems([]);
        setMarketDate(null);
        setDataStatus(null);
        setError(toAsyncError(err));
        setStatus('error');
      });

    return () => {
      controller.abort();
    };
  }, [accessToken, applyCache, enabled]);

  return {
    status,
    items,
    marketDate,
    dataStatus,
    error,
    refetch,
  };
}
