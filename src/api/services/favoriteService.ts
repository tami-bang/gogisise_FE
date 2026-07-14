import { apiClient } from '../apiClient';
import { ApiClientError } from '../types/common';
import type { ApiRequestOptions } from '../types/common';
import type { PriceItem } from '../types/market';

const FAVORITES_PATH = '/api/v1/users/me/favorites';

export interface FavoriteServiceOptions {
  accessToken?: string | null;
  signal?: AbortSignal;
}

export interface FavoriteMigrationResult {
  attempted: number;
  succeeded: number;
  failedItemIds: string[];
}

type FavoriteListPayload = PriceItem[] | { items?: PriceItem[] };

const toApiOptions = (options?: FavoriteServiceOptions): ApiRequestOptions => ({
  accessToken: options?.accessToken,
  signal: options?.signal,
});

const normalizeFavoriteItem = (item: PriceItem): PriceItem => ({
  ...item,
  searchKeywords: item.searchKeywords ?? '',
  price: item.price ?? null,
  previousPrice: item.previousPrice ?? null,
  changeAmount: item.changeAmount ?? null,
  trendStatus: item.trendStatus ?? null,
  currency: item.currency ?? 'KRW',
  priceUnit: item.priceUnit ?? 'KRW_PER_KG',
  isFavorite: true,
});

const normalizeFavoriteList = (payload: FavoriteListPayload): PriceItem[] => {
  const items = Array.isArray(payload) ? payload : payload.items;
  return Array.isArray(items) ? items.map(normalizeFavoriteItem) : [];
};

export const favoriteService = {
  getFavorites: async (options?: FavoriteServiceOptions): Promise<PriceItem[]> => {
    const payload = await apiClient.get<FavoriteListPayload>(
      FAVORITES_PATH,
      toApiOptions(options)
    );
    return normalizeFavoriteList(payload);
  },

  addFavorite: async (
    itemId: string,
    options?: FavoriteServiceOptions
  ): Promise<void> => {
    await apiClient.post<void>(
      `${FAVORITES_PATH}/${encodeURIComponent(itemId)}`,
      undefined,
      toApiOptions(options)
    );
  },

  removeFavorite: async (
    itemId: string,
    options?: FavoriteServiceOptions
  ): Promise<void> => {
    await apiClient.delete<void>(
      `${FAVORITES_PATH}/${encodeURIComponent(itemId)}`,
      toApiOptions(options)
    );
  },

  syncFavorites: async (
    itemIds: string[],
    options?: FavoriteServiceOptions
  ): Promise<FavoriteMigrationResult> => {
    const uniqueItemIds = [...new Set(itemIds)];
    const failedItemIds: string[] = [];

    for (const itemId of uniqueItemIds) {
      try {
        await favoriteService.addFavorite(itemId, options);
      } catch (e) {
        if (e instanceof ApiClientError && e.errorCode === 'AUTHENTICATION_REQUIRED') {
          throw e;
        }
        console.warn('[FavoriteMigration] Failed to sync favorite:', itemId, e);
        failedItemIds.push(itemId);
      }
    }

    return {
      attempted: uniqueItemIds.length,
      succeeded: uniqueItemIds.length - failedItemIds.length,
      failedItemIds,
    };
  },
};
