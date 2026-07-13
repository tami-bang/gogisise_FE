// src/hooks/useAuth.ts

import { useState } from 'react';
import { authService } from '../api/services/authService';
import { useAuthContext } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/errorDictionary';

interface AuthError {
  errorCode: string;
  message: string;
}

/**
 * UI 컴포넌트와 API 서비스를 중개하는 훅.
 * 에러 매핑(UX First)과 상태 관리를 담당합니다.
 */
export function useAuth() {
  const { setAuth, clearAuth } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const handleApiCall = async <T,>(apiCall: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await apiCall();
    } catch (err: any) {
      console.error('[useAuth] API Error:', err);
      const errorCode = err?.errorCode || 'UNKNOWN_ERROR';
      setError({
        errorCode,
        message: getErrorMessage(errorCode),
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const data = await handleApiCall(() => authService.login(email, password));
    if (data) {
      setAuth(data.accessToken, data.user || null);
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    const data = await handleApiCall(() => authService.signup(email, password));
    if (data) {
      setAuth(data.accessToken, data.user || null);
      return true;
    }
    return false;
  };

  const logout = async (): Promise<boolean> => {
    const data = await handleApiCall(() => authService.logout());
    if (data !== null) { // success
      clearAuth();
      return true;
    }
    return false;
  };

  const sendResetLink = async (email: string): Promise<boolean> => {
    const result = await handleApiCall(() => authService.sendResetLink(email));
    return result !== null;
  };

  return {
    login,
    signup,
    logout,
    sendResetLink,
    isLoading,
    error,
    setError, // 폼 전환 등 수동 클리어용
  };
}
