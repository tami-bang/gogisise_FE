// src/contexts/AuthContext.tsx

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../api/types/auth';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthSheetOpen: boolean;
}

interface AuthContextValue extends AuthState {
  setAuth: (token: string | null, user: User | null) => void;
  clearAuth: () => void;
  openAuthSheet: () => void;
  closeAuthSheet: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * 전역 인증 상태 Provider.
 * accessToken은 절대 localStorage에 저장하지 않고 이 메모리 상태에만 유지합니다.
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

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
