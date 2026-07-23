import { useCallback, useEffect, useMemo, useState } from 'react';
import { favoriteService } from '../api/services/favoriteService';
import { ApiClientError } from '../api/types/common';
import type { PriceItem } from '../api/types/market';
import { useAuthContext } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/errorDictionary';
import { useFavorites } from './useFavorites';
import { useMarketItems } from './useMarketItems';

export const SERVER_FAVORITES_CHANGE_EVENT = 'gogisise:server_favorites_changed';

type AsyncStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

interface AsyncError {
  errorCode: string;
  message: string;
}

interface UseFavoritePricesParams {
  animalType: 'BEEF' | 'PORK' | null;
  storageType: 'CHILLED' | 'FROZEN';
  page: number;
  limit: number;
}

let serverFavoriteCache: PriceItem[] | null = null;
// 💡 [한글 주석] 즐겨찾기 메모리 캐시 시각 기록 변수 및 30초 단기 캐시 수명 설정
let serverFavoriteCacheTime = 0;
const SERVER_FAVORITE_TTL = 30 * 1000; // 30초

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

export const notifyServerFavoritesChanged = () => {
  window.dispatchEvent(new CustomEvent(SERVER_FAVORITES_CHANGE_EVENT));
};

const SERVER_FAVORITES_CACHE_KEY = 'gogisise:cache:server_favorites';

export function useFavoritePrices({
  animalType,
  storageType,
  page,
  limit,
}: UseFavoritePricesParams) {
  const { accessToken, user, openAuthSheet } = useAuthContext();
  const isAuthenticated = Boolean(user && accessToken);
  const { favorites: localFavorites } = useFavorites();
  const { items: marketItems, status: marketStatus } = useMarketItems({ enabled: !isAuthenticated });

  // 💡 [한글 주석] 마운트 대기를 줄이기 위해 로컬스토리지에 있는 백업된 즐겨찾기 리스트를 초기 상태로 즉시 세팅
  const [serverFavorites, setServerFavorites] = useState<PriceItem[]>(() => {
    if (serverFavoriteCache) return serverFavoriteCache;
    try {
      const cached = localStorage.getItem(SERVER_FAVORITES_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [serverStatus, setServerStatus] = useState<AsyncStatus>(() => {
    if (serverFavoriteCache) return 'success';
    try {
      const cached = localStorage.getItem(SERVER_FAVORITES_CACHE_KEY);
      return cached && JSON.parse(cached).length > 0 ? 'success' : 'idle';
    } catch {
      return 'idle';
    }
  });

  const [error, setError] = useState<AsyncError | null>(null);

  // 💡 [한글 주석] force가 false이고 메모리 캐시 유효 기간(30초) 이내면 API 호출을 건너뛰고 기존 캐시 사용
  const refetch = useCallback(async (force = false) => {
    if (!isAuthenticated) {
      setServerStatus('idle');
      setError(null);
      return;
    }

    if (!force && serverFavoriteCache && (Date.now() - serverFavoriteCacheTime < SERVER_FAVORITE_TTL)) {
      setServerStatus('success');
      return;
    }

    const controller = new AbortController();
    setServerStatus('loading');
    setError(null);

    try {
      const result = await favoriteService.getFavorites({
        accessToken,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      serverFavoriteCache = result;
      serverFavoriteCacheTime = Date.now(); // 캐시 시각 기록
      
      // 💡 [한글 주석] 최신 불러온 즐겨찾기를 로컬 스토리지 캐시에 동기화
      try {
        localStorage.setItem(SERVER_FAVORITES_CACHE_KEY, JSON.stringify(result));
      } catch (e) {
        console.warn('Failed to sync server favorites to localStorage', e);
      }

      setServerFavorites(result);
      setServerStatus(result.length > 0 ? 'success' : 'empty');
    } catch (err) {
      if (controller.signal.aborted) return;
      const nextError = toAsyncError(err);
      setError(nextError);
      setServerStatus('error');
      if (nextError.errorCode === 'AUTHENTICATION_REQUIRED') {
        openAuthSheet();
      }
    }
  }, [accessToken, isAuthenticated, openAuthSheet]);

  // 💡 [한글 주석] 마운트 시에는 캐시된 데이터를 우선 활용하도록 force=false로 호출
  useEffect(() => {
    if (!isAuthenticated) {
      setServerStatus('idle');
      setError(null);
      return;
    }

    refetch(false);
  }, [isAuthenticated, refetch]);

  // 💡 [한글 주석] 즐겨찾기 변경 이벤트 발생 시 메모리 및 로컬스토리지를 모두 지우고 force=true 강제 갱신
  useEffect(() => {
    const handleChange = () => {
      serverFavoriteCache = null;
      serverFavoriteCacheTime = 0; // 캐시 무효화
      try {
        localStorage.removeItem(SERVER_FAVORITES_CACHE_KEY);
      } catch (e) {
        // ignore
      }
      refetch(true); // 강제 갱신
    };
    window.addEventListener(SERVER_FAVORITES_CHANGE_EVENT, handleChange);
    return () => {
      window.removeEventListener(SERVER_FAVORITES_CHANGE_EVENT, handleChange);
    };
  }, [refetch]);

  const allFavoriteItems = useMemo(() => {
    if (isAuthenticated) {
      return serverFavorites.map((item) => ({ ...item, isFavorite: true }));
    }

    const marketById = new Map(marketItems.map((item) => [item.itemId, item]));
    return localFavorites
      .map((favorite) => {
        const marketItem = marketById.get(favorite.itemId);
        if (!marketItem) return null;
        return { ...marketItem, isFavorite: true };
      })
      .filter((item): item is PriceItem => Boolean(item));
  }, [isAuthenticated, localFavorites, marketItems, serverFavorites]);

  const filteredItems = useMemo(() => {
    if (!animalType) return [];
    return allFavoriteItems.filter((item) => (
      item.species === animalType && item.storageType === storageType
    ));
  }, [allFavoriteItems, animalType, storageType]);

  const totalCount = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const startIndex = (page - 1) * limit;
  const items = filteredItems.slice(startIndex, startIndex + limit);
  const favoriteItemIds = isAuthenticated
    ? serverFavorites.map((item) => item.itemId)
    : localFavorites.map((item) => item.itemId);

  const status: AsyncStatus = isAuthenticated
    ? serverStatus === 'success' && items.length === 0 ? 'empty' : serverStatus
    : marketStatus === 'loading' ? 'loading' : items.length > 0 ? 'success' : 'empty';

  return {
    status,
    items,
    favoriteItemIds,
    totalPages,
    totalCount,
    error,
    refetch,
  };
}
