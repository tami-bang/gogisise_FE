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

const MARKET_ITEMS_CACHE_KEY = 'gogisise:cache:market_items';
const MARKET_ITEMS_CACHE_DATE_KEY = 'gogisise:cache:market_items_date';
const MARKET_ITEMS_CACHE_DATASTATUS_KEY = 'gogisise:cache:market_items_datastatus';

export function useMarketItems(params: UseMarketItemsParams = {}) {
  const { enabled = true, accessToken = null } = params;

  // 💡 [한글 주석] 첫 마운트 시 로딩 대기를 피하기 위해 로컬스토리지에 캐시된 마켓 아이템 목록을 초기 상태로 즉시 세팅
  const [items, setItems] = useState<PriceItem[]>(() => {
    try {
      const cached = localStorage.getItem(MARKET_ITEMS_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [marketDate, setMarketDate] = useState<string | null>(() => {
    try {
      return localStorage.getItem(MARKET_ITEMS_CACHE_DATE_KEY);
    } catch {
      return null;
    }
  });

  const [dataStatus, setDataStatus] = useState<DataStatus | null>(() => {
    try {
      return localStorage.getItem(MARKET_ITEMS_CACHE_DATASTATUS_KEY) as DataStatus | null;
    } catch {
      return null;
    }
  });

  const [status, setStatus] = useState<AsyncStatus>(() => {
    try {
      const cached = localStorage.getItem(MARKET_ITEMS_CACHE_KEY);
      return cached && JSON.parse(cached).length > 0 ? 'success' : 'idle';
    } catch {
      return 'idle';
    }
  });

  const [error, setError] = useState<AsyncError | null>(null);

  // 💡 [한글 주석] API 데이터 갱신 완료 시 로컬스토리지 캐시 저장소를 함께 동기화
  const applyCache = useCallback((cache: MarketItemsCache) => {
    setItems(cache.items);
    setMarketDate(cache.marketDate);
    setDataStatus(cache.dataStatus);
    setStatus(cache.items.length > 0 ? 'success' : 'empty');
    setError(null);

    try {
      localStorage.setItem(MARKET_ITEMS_CACHE_KEY, JSON.stringify(cache.items));
      if (cache.marketDate) localStorage.setItem(MARKET_ITEMS_CACHE_DATE_KEY, cache.marketDate);
      if (cache.dataStatus) localStorage.setItem(MARKET_ITEMS_CACHE_DATASTATUS_KEY, cache.dataStatus);
    } catch (e) {
      console.warn('Failed to sync market items cache to localStorage', e);
    }
  }, []);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setStatus('idle');
      return;
    }

    const controller = new AbortController();
    
    // 💡 [한글 주석] 이미 로컬 캐시에 데이터가 존재한다면 'loading' 상태로 변환하지 않고 백그라운드 갱신 (SWR)
    if (items.length === 0) {
      setStatus('loading');
    }
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

    // 💡 [한글 주석] 이미 로컬 캐시에 데이터가 존재한다면 'loading' 상태로 변환하지 않고 백그라운드 갱신 (SWR)
    if (items.length === 0) {
      setStatus('loading');
    }
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
