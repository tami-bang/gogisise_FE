import { useCallback } from 'react';
import { favoriteService } from '../api/services/favoriteService';
import {
  dispatchFavoritesChanged,
  readLocalFavorites,
  removeLocalFavoritesByIds,
} from '../utils/favoriteStorage';

export const useFavoriteMigration = () => {
  const migrateLocalFavorites = useCallback(async (accessToken: string | null | undefined) => {
    if (!accessToken || migratedTokens.has(accessToken)) {
      return;
    }

    const localFavorites = readLocalFavorites();
    if (localFavorites.length === 0) {
      migratedTokens.add(accessToken);
      return;
    }

    const itemIds = [...new Set(localFavorites.map((item) => item.itemId))];
    let result;
    try {
      result = await favoriteService.syncFavorites(itemIds, { accessToken });
    } catch (e) {
      console.warn('[FavoriteMigration] Migration stopped. Local favorites were kept.', e);
      return;
    }
    const failedSet = new Set(result.failedItemIds);
    const succeededItemIds = itemIds.filter((itemId) => !failedSet.has(itemId));

    if (succeededItemIds.length > 0) {
      removeLocalFavoritesByIds(succeededItemIds);
      dispatchFavoritesChanged('migration');
    }

    if (result.failedItemIds.length > 0) {
      console.warn('[FavoriteMigration] Some favorites were not migrated:', result.failedItemIds);
    }

    if (result.failedItemIds.length === 0) {
      migratedTokens.add(accessToken);
    }
  }, []);

  return { migrateLocalFavorites };
};

const migratedTokens = new Set<string>();
