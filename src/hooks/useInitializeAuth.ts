// src/hooks/useInitializeAuth.ts

import { useEffect, useState } from 'react';
import { authService } from '../api/services/authService';
import { useAuthContext } from '../contexts/AuthContext';
import { useFavoriteMigration } from './useFavoriteMigration';

/**
 * 앱 진입 시 최우선으로 실행되어 Silent Refresh를 수행하는 훅.
 * HttpOnly 쿠키를 기반으로 /refresh API를 호출하여 메모리에 accessToken을 복구합니다.
 */
export function useInitializeAuth() {
  const { setAuth, clearAuth } = useAuthContext();
  const { migrateLocalFavorites } = useFavoriteMigration();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const performSilentRefresh = async () => {
      try {
        // 실제로는 브라우저가 알아서 쿠키를 담아 전송
        const data = await authService.refresh();
        if (isMounted) {
          setAuth(data.accessToken, data.user || null);
          await migrateLocalFavorites(data.accessToken);
        }
      } catch (error) {
        // 리프레시 실패 (쿠키 만료 등) -> 로그아웃 상태 유지
        console.warn('Silent refresh failed:', error);
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    performSilentRefresh();

    return () => {
      isMounted = false;
    };
  }, [setAuth, clearAuth, migrateLocalFavorites]);

  return { isInitializing };
}
