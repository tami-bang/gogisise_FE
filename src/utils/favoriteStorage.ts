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

export const FAVORITES_STORAGE_KEY = 'gogisise:favorites';
export const FAVORITES_BACKUP_KEY = 'gogisise:favorites:backup';
export const FAVORITES_CHANGE_EVENT = 'gogisise:favorites_changed';

const toFavoriteItems = (value: unknown): FavoriteItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is FavoriteItem => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof (item as FavoriteItem).itemId === 'string'
      );
    })
    .map((item) => ({
      itemId: item.itemId,
      animalType: item.animalType === 'PORK' ? 'PORK' : 'BEEF',
      storageType: item.storageType === 'FROZEN' ? 'FROZEN' : 'CHILLED',
      addedAt: item.addedAt || new Date().toISOString(),
    }));
};

export const readLocalFavorites = (): FavoriteItem[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);

    if (parsed && typeof parsed === 'object' && parsed.version === 2) {
      return toFavoriteItems(parsed.items);
    }

    if (Array.isArray(parsed) && (parsed.length === 0 || typeof parsed[0] === 'string')) {
      const migrated = parsed.map((itemId: string) => ({
        itemId,
        animalType: 'BEEF' as const,
        storageType: 'CHILLED' as const,
        addedAt: new Date().toISOString(),
      }));
      writeLocalFavorites(migrated);
      return migrated;
    }
  } catch (e) {
    console.error('Failed to parse favorites from localStorage', e);
    const rawStored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (rawStored) {
      localStorage.setItem(FAVORITES_BACKUP_KEY, rawStored);
    }
  }

  return [];
};

export const writeLocalFavorites = (items: FavoriteItem[]) => {
  const storageData: FavoriteStorage = { version: 2, items };
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(storageData));
};

export const clearLocalFavorites = () => {
  writeLocalFavorites([]);
};

export const removeLocalFavoritesByIds = (itemIds: string[]) => {
  const removeSet = new Set(itemIds);
  const remaining = readLocalFavorites().filter((item) => !removeSet.has(item.itemId));
  writeLocalFavorites(remaining);
  return remaining;
};

export const dispatchFavoritesChanged = (senderId?: string) => {
  window.dispatchEvent(new CustomEvent(FAVORITES_CHANGE_EVENT, { detail: { senderId } }));
};
