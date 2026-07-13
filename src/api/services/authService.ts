// src/api/services/authService.ts

import type { AuthResponseData } from '../types/auth';
import { generateMockLoginSuccess, mockRefreshSuccess, mockDatabase, type MockUser } from '../mock/authMock';
import { cryptoService } from '../../utils/crypto';

/**
 * 모의 지연을 위한 유틸
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 인증 관련 API 호출 레이어
 * 모든 외부 통신(fetch, axios)은 이 서비스로 격리됩니다.
 */
export const authService = {
  /**
   * 로그인
   */
  login: async (email: string, password: string): Promise<AuthResponseData> => {
    const encryptedPassword = cryptoService.encryptPayload(password);
    console.debug('[AuthService] Login with encrypted payload:', encryptedPassword);

    await delay(800); // 통신 모의 지연

    const matchedUser = mockDatabase.find(u => u.email === email && u.password === encryptedPassword);
    
    if (!matchedUser) {
      throw { errorCode: 'LOGIN_FAILED', message: '이메일 또는 비밀번호가 일치하지 않습니다.' };
    }

    if (matchedUser.status === 'LOCKED') {
      throw { errorCode: 'TOO_MANY_REQUESTS', message: '계정이 잠겼습니다.' };
    }

    const response = generateMockLoginSuccess(matchedUser);
    localStorage.setItem('MOCK_COOKIE_FLAG', 'true');
    return response;
  },

  /**
   * 회원가입
   */
  signup: async (email: string, password: string, nickname: string, phone: string): Promise<AuthResponseData> => {
    const encryptedPassword = cryptoService.encryptPayload(password);
    console.debug('[AuthService] Signup with encrypted payload:', encryptedPassword);

    await delay(1000);

    const isDuplicate = mockDatabase.some(u => u.email === email);
    if (isDuplicate) {
      throw { errorCode: 'DUPLICATE_EMAIL', message: '이미 가입된 이메일입니다.' };
    }

    const newUser: MockUser = {
      userId: `usr_${Date.now()}`,
      email,
      nickname,
      phone,
      password: encryptedPassword,
      status: 'ACTIVE'
    };
    
    mockDatabase.push(newUser);

    const response = generateMockLoginSuccess(newUser);
    localStorage.setItem('MOCK_COOKIE_FLAG', 'true');
    return response;
  },

  /**
   * 앱 진입 시 Silent Refresh (HttpOnly 쿠키 기반 토큰 재발급)
   */
  refresh: async (): Promise<AuthResponseData> => {
    await delay(500);

    const hasCookie = localStorage.getItem('MOCK_COOKIE_FLAG') === 'true';
    if (!hasCookie) {
      throw { errorCode: 'AUTHENTICATION_REQUIRED', message: 'Refresh failed' };
    }

    return mockRefreshSuccess;
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<void> => {
    await delay(300);
    localStorage.removeItem('MOCK_COOKIE_FLAG');
    console.debug('[AuthService] Logout success');
  },

  /**
   * 비밀번호 재설정 매직 링크 전송
   */
  sendResetLink: async (email: string): Promise<void> => {
    await delay(800);
    if (!email) {
      throw { errorCode: 'INVALID_REQUEST_BODY', message: 'Email is required' };
    }
    console.debug('[AuthService] Magic link sent to', email);
  }
};
