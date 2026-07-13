import { useState, useCallback, useEffect, useMemo } from 'react';

export interface FavoriteItem {
  itemId: string;
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
// 즐겨찾기 상태 동기화를 위한 커스텀 이벤트 이름 정의 (단건 삭제 시 다른 컴포넌트에도 알림)
const FAVORITES_CHANGE_EVENT = 'gogisise:favorites_changed';

export const useFavorites = () => {
  // 현재 훅 인스턴스의 고유 ID 생성 (무한 루프/중복 업데이트 방지 표식)
  const hookId = useMemo(() => Math.random().toString(36).substring(2, 9), []);

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
        for (const itemId of parsed) {
          migrated.push({
            itemId,
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

  // 다른 컴포넌트(예: 모달)에서 즐겨찾기가 변경되었을 때 현재 컴포넌트의 상태도 동기화하는 역할
  useEffect(() => {
    const syncFavorites = (e: Event) => {
      // 내가 발생시킨 이벤트라면 로컬 스토리지 중복 읽기 패스!
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.senderId === hookId) return;

      try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (!stored) {
          setFavorites([]);
          return;
        }
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && parsed.version === 2 && Array.isArray(parsed.items)) {
          setFavorites(parsed.items as FavoriteItem[]);
        }
      } catch (e) {
        console.error('Failed to sync favorites', e);
      }
    };

    window.addEventListener(FAVORITES_CHANGE_EVENT, syncFavorites);
    return () => {
      window.removeEventListener(FAVORITES_CHANGE_EVENT, syncFavorites);
    };
  }, []);

  const isFavorite = useCallback(
    (itemId: string) => {
      return favorites.some((fav) => fav.itemId === itemId);
    },
    [favorites]
  );

  const addFavorite = useCallback((item: Omit<FavoriteItem, 'addedAt'>) => {
    setFavorites((prev) => {
      if (prev.some(f => f.itemId === item.itemId)) return prev;
      
      const nextFavorites = [...prev, { ...item, addedAt: new Date().toISOString() }];
      const storageData: FavoriteStorage = { version: 2, items: nextFavorites };
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(storageData));
        window.dispatchEvent(new CustomEvent(FAVORITES_CHANGE_EVENT, { detail: { senderId: hookId } }));
      } catch (e) {
        console.error('Failed to save favorite', e);
      }
      return nextFavorites;
    });
  }, []);

  const removeFavorite = useCallback((itemId: string) => {
    setFavorites((prev) => {
      const nextFavorites = prev.filter((fav) => fav.itemId !== itemId);
      const storageData: FavoriteStorage = { version: 2, items: nextFavorites };
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(storageData));
        window.dispatchEvent(new CustomEvent(FAVORITES_CHANGE_EVENT, { detail: { senderId: hookId } }));
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
      window.dispatchEvent(new CustomEvent(FAVORITES_CHANGE_EVENT, { detail: { senderId: hookId } }));
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
