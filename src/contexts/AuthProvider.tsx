// src/contexts/AuthProvider.tsx

import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
// Antigravity 수정: TypeScript 컴파일 에러 해결을 위해 User 타입을 임포트합니다.
import type { User } from '../api/types/auth';

/**
 * Antigravity 수정: Fast Refresh 경고 해결을 위해 분리된 AuthProvider 컴포넌트입니다.
 * 전역 인증 상태를 공급(Provider)해주는 역할을 합니다.
 * accessToken은 메모리 상태에만 유지합니다.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<{ accessToken: string | null; user: User | null }>({
    accessToken: null,
    user: null,
  });
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);

  const setAuth = useCallback((accessToken: string | null, user: User | null) => {
    setAuthState({ accessToken, user });
  }, []);

  const clearAuth = useCallback(() => {
    setAuthState({ accessToken: null, user: null });
  }, []);

  const openAuthSheet = useCallback(() => setIsAuthSheetOpen(true), []);
  const closeAuthSheet = useCallback(() => setIsAuthSheetOpen(false), []);

  return (
    <AuthContext.Provider value={{ ...authState, isAuthSheetOpen, setAuth, clearAuth, openAuthSheet, closeAuthSheet }}>
      {children}
    </AuthContext.Provider>
  );
}
