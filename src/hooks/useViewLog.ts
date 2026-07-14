import { useEffect } from 'react';
import { analyticsService } from '../api/services/analyticsService';
import { useAuthContext } from '../contexts/AuthContext';

interface UseViewLogParams {
  itemId: string | null;
  isOpen: boolean;
  delayMs?: number;
}

export function useViewLog({
  itemId,
  isOpen,
  delayMs = 3000,
}: UseViewLogParams) {
  const { accessToken } = useAuthContext();

  useEffect(() => {
    if (!isOpen || !itemId) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      analyticsService
        .recordView(itemId, {
          accessToken,
          signal: controller.signal,
        })
        .catch((error) => {
          if (!controller.signal.aborted) {
            console.error('[ViewLog] Failed to record view:', error);
          }
        });
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [accessToken, delayMs, isOpen, itemId]);
}
