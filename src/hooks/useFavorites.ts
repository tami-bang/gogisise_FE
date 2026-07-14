import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  dispatchFavoritesChanged,
  FAVORITES_CHANGE_EVENT,
  readLocalFavorites,
  writeLocalFavorites,
  type FavoriteItem,
  type FavoriteStorage,
} from '../utils/favoriteStorage';

export type { FavoriteItem, FavoriteStorage };

export const useFavorites = () => {
  const hookId = useMemo(() => Math.random().toString(36).substring(2, 9), []);
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => readLocalFavorites());

  useEffect(() => {
    const syncFavorites = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.senderId === hookId) return;
      setFavorites(readLocalFavorites());
    };

    window.addEventListener(FAVORITES_CHANGE_EVENT, syncFavorites);
    return () => {
      window.removeEventListener(FAVORITES_CHANGE_EVENT, syncFavorites);
    };
  }, [hookId]);

  const isFavorite = useCallback(
    (itemId: string) => {
      return favorites.some((fav) => fav.itemId === itemId);
    },
    [favorites]
  );

  const addFavorite = useCallback((item: Omit<FavoriteItem, 'addedAt'>) => {
    setFavorites((prev) => {
      if (prev.some((fav) => fav.itemId === item.itemId)) return prev;

      const nextFavorites = [...prev, { ...item, addedAt: new Date().toISOString() }];
      try {
        writeLocalFavorites(nextFavorites);
        dispatchFavoritesChanged(hookId);
      } catch (e) {
        console.error('Failed to save favorite', e);
      }
      return nextFavorites;
    });
  }, [hookId]);

  const removeFavorite = useCallback((itemId: string) => {
    setFavorites((prev) => {
      const nextFavorites = prev.filter((fav) => fav.itemId !== itemId);
      try {
        writeLocalFavorites(nextFavorites);
        dispatchFavoritesChanged(hookId);
      } catch (e) {
        console.error('Failed to save favorite', e);
      }
      return nextFavorites;
    });
  }, [hookId]);

  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
    try {
      writeLocalFavorites([]);
      dispatchFavoritesChanged(hookId);
    } catch (e) {
      console.error('Failed to clear favorite', e);
    }
  }, [hookId]);

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    clearAllFavorites,
  };
};
