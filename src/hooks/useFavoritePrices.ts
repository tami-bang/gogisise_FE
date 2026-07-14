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

  const [serverFavorites, setServerFavorites] = useState<PriceItem[]>(() => serverFavoriteCache ?? []);
  const [serverStatus, setServerStatus] = useState<AsyncStatus>(serverFavoriteCache ? 'success' : 'idle');
  const [error, setError] = useState<AsyncError | null>(null);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      setServerStatus('idle');
      setError(null);
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

  useEffect(() => {
    if (!isAuthenticated) {
      setServerStatus('idle');
      setError(null);
      return;
    }

    refetch();
  }, [isAuthenticated, refetch]);

  useEffect(() => {
    const handleChange = () => {
      refetch();
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
