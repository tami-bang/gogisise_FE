// src/contexts/AuthContext.ts

import { createContext, useContext } from 'react';
import type { User } from '../api/types/auth';

// Antigravity 수정: Fast Refresh(화면 실시간 반영) 경고 해결을 위해 Provider 컴포넌트를 AuthProvider.tsx로 분리하고 Context와 Hook만 남겼습니다.
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

// Antigravity 수정: AuthProvider에서 사용할 수 있도록 Context 객체를 export합니다.
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

