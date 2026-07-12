import { useState, useCallback } from 'react';

export interface FavoriteItem {
  id: string;
  animalType: 'BEEF' | 'PORK';
  storageType: 'CHILLED' | 'FROZEN';
  addedAt: string;
}

export interface FavoriteStorage {
  version: 2;
  items: FavoriteItem[];
}

const FAVORITES_STORAGE_KEY = 'gogisise:favorites';
const FAVORITES_BACKUP_KEY = 'gogisise:favorites:backup';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);

      // v2 포맷인지 확인
      if (parsed && typeof parsed === 'object' && parsed.version === 2 && Array.isArray(parsed.items)) {
        return parsed.items as FavoriteItem[];
      }

      // v1 (string[]) 포맷 마이그레이션
      if (Array.isArray(parsed) && (parsed.length === 0 || typeof parsed[0] === 'string')) {
        console.log('Migrating v1 favorites to v2...');
        const migrated: FavoriteItem[] = [];

        // v2 포맷으로 재저장 (일단 기본값으로 넣고 자세한건 백그라운드나 나중에 처리)
        for (const id of parsed) {
          migrated.push({
            id,
            animalType: 'BEEF', // 임시 기본값
            storageType: 'CHILLED', // 임시 기본값
            addedAt: new Date().toISOString(),
          });
        }

        // v2 포맷으로 재저장
        const newStorage: FavoriteStorage = {
          version: 2,
          items: migrated,
        };
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newStorage));
        return migrated;
      }

    } catch (e) {
      console.error('Failed to parse favorites from localStorage', e);
      // 백업 키에 보존
      const rawStored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (rawStored) {
        localStorage.setItem(FAVORITES_BACKUP_KEY, rawStored);
      }
    }
    return [];
  });

  const isFavorite = useCallback(
    (id: string) => {
      return favorites.some((fav) => fav.id === id);
    },
    [favorites]
  );

  const addFavorite = useCallback((item: Omit<FavoriteItem, 'addedAt'>) => {
    setFavorites((prev) => {
      if (prev.some(f => f.id === item.id)) return prev;
      
      const nextFavorites = [...prev, { ...item, addedAt: new Date().toISOString() }];
      const storageData: FavoriteStorage = { version: 2, items: nextFavorites };
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(storageData));
      } catch (e) {
        console.error('Failed to save favorite', e);
      }
      return nextFavorites;
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const nextFavorites = prev.filter((fav) => fav.id !== id);
      const storageData: FavoriteStorage = { version: 2, items: nextFavorites };
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(storageData));
      } catch (e) {
        console.error('Failed to save favorite', e);
      }
      return nextFavorites;
    });
  }, []);

  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ version: 2, items: [] }));
    } catch (e) {
      console.error('Failed to clear favorites', e);
    }
  }, []);

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    clearAllFavorites,
  };
};
