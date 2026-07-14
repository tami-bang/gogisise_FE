import { useCallback, useState } from 'react';
import { favoriteService } from '../api/services/favoriteService';
import { ApiClientError } from '../api/types/common';
import { useAuthContext } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/errorDictionary';
import { useFavorites } from './useFavorites';
import { notifyServerFavoritesChanged } from './useFavoritePrices';

interface AsyncError {
  errorCode: string;
  message: string;
}

export interface FavoriteMutationItem {
  itemId: string;
  animalType: 'BEEF' | 'PORK';
  storageType: 'CHILLED' | 'FROZEN';
}

interface UseFavoriteMutationParams {
  onSuccess?: () => void;
  onRollback?: () => void;
}

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

export function useFavoriteMutation(params: UseFavoriteMutationParams = {}) {
  const { onSuccess, onRollback } = params;
  const { accessToken, user, openAuthSheet } = useAuthContext();
  const { addFavorite: addLocalFavorite, removeFavorite: removeLocalFavorite, isFavorite } = useFavorites();
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<AsyncError | null>(null);

  const isAuthenticated = Boolean(user && accessToken);

  const handleError = useCallback((err: unknown) => {
    const nextError = toAsyncError(err);
    setError(nextError);
    onRollback?.();
    if (nextError.errorCode === 'AUTHENTICATION_REQUIRED') {
      openAuthSheet();
    }
  }, [onRollback, openAuthSheet]);

  const addFavorite = useCallback(async (item: FavoriteMutationItem): Promise<boolean> => {
    setIsMutating(true);
    setError(null);

    if (!isAuthenticated) {
      addLocalFavorite(item);
      setIsMutating(false);
      onSuccess?.();
      return true;
    }

    try {
      await favoriteService.addFavorite(item.itemId, { accessToken });
      notifyServerFavoritesChanged();
      onSuccess?.();
      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [accessToken, addLocalFavorite, handleError, isAuthenticated, onSuccess]);

  const removeFavorite = useCallback(async (itemId: string): Promise<boolean> => {
    setIsMutating(true);
    setError(null);

    if (!isAuthenticated) {
      removeLocalFavorite(itemId);
      setIsMutating(false);
      onSuccess?.();
      return true;
    }

    try {
      await favoriteService.removeFavorite(itemId, { accessToken });
      notifyServerFavoritesChanged();
      onSuccess?.();
      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [accessToken, handleError, isAuthenticated, onSuccess, removeLocalFavorite]);

  const toggleFavorite = useCallback(async (item: FavoriteMutationItem): Promise<boolean> => {
    if (isFavorite(item.itemId)) {
      return removeFavorite(item.itemId);
    }
    return addFavorite(item);
  }, [addFavorite, isFavorite, removeFavorite]);

  return {
    isMutating,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
}
