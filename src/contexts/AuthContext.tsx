// src/contexts/AuthContext.tsx

import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../api/types/auth';

interface AuthState {
  accessToken: string | null;
  user: User | null;
}

interface AuthContextValue extends AuthState {
  setAuth: (token: string | null, user: User | null) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * 전역 인증 상태 Provider.
 * accessToken은 절대 localStorage에 저장하지 않고 이 메모리 상태에만 유지합니다.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    accessToken: null,
    user: null,
  });

  const setAuth = (accessToken: string | null, user: User | null) => {
    setAuthState({ accessToken, user });
  };

  const clearAuth = () => {
    setAuthState({ accessToken: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...authState, setAuth, clearAuth }}>
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
