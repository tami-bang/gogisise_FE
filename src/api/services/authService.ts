// src/api/services/authService.ts

import type { AuthResponseData } from '../types/auth';
import { generateMockLoginSuccess, mockRefreshSuccess } from '../mock/authMock';
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
    // E2EE 적용: 전송 전 페이로드 암호화 (실제로는 fetch body에 담아 보냅니다)
    const encryptedPassword = cryptoService.encryptPayload(password);
    console.debug('[AuthService] Login with encrypted payload:', encryptedPassword);

    await delay(800); // 통신 모의 지연

    // 시뮬레이션: 고의 에러 발생 로직
    if (email === 'error@test.com') {
      throw { errorCode: 'USER_NOT_FOUND', message: 'Not found' };
    }
    if (password === 'wrong') {
      throw { errorCode: 'LOGIN_FAILED', message: 'Wrong password' };
    }
    if (email === 'lock@test.com') {
      throw { errorCode: 'TOO_MANY_REQUESTS', message: 'Account locked' };
    }

    return generateMockLoginSuccess(email);
  },

  /**
   * 회원가입
   */
  signup: async (email: string, password: string): Promise<AuthResponseData> => {
    const encryptedPassword = cryptoService.encryptPayload(password);
    console.debug('[AuthService] Signup with encrypted payload:', encryptedPassword);

    await delay(1000);

    if (email === 'dup@test.com') {
      throw { errorCode: 'DUPLICATE_EMAIL', message: 'Email already exists' };
    }

    return generateMockLoginSuccess(email);
  },

  /**
   * 앱 진입 시 Silent Refresh (HttpOnly 쿠키 기반 토큰 재발급)
   */
  refresh: async (): Promise<AuthResponseData> => {
    await delay(500);

    // 모의: localStorage 등에 특정 플래그를 두어 리프레시 에러를 낼 수 있음
    // const shouldFail = localStorage.getItem('mockRefreshFail') === 'true';
    // if (shouldFail) {
    //   throw { errorCode: 'AUTHENTICATION_REQUIRED', message: 'Refresh failed' };
    // }

    return mockRefreshSuccess;
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<void> => {
    await delay(300);
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
