// src/api/mock/authMock.ts

import type { AuthResponseData } from '../types/auth';

/**
 * 모의 로그인 응답 데이터 생성
 */
export const generateMockLoginSuccess = (email: string): AuthResponseData => ({
  accessToken: `mock_access_token_${Date.now()}_for_${email}`, // JWE mock
  expiresIn: 3600,
  user: {
    userId: `usr_${Date.now()}`,
    email,
    nickname: email.split('@')[0],
    status: 'ACTIVE'
  }
});

/**
 * 모의 리프레시 토큰 응답 데이터 (Silent Refresh 용)
 */
export const mockRefreshSuccess: AuthResponseData = {
  accessToken: `mock_refreshed_access_token_${Date.now()}`,
  expiresIn: 3600,
  user: {
    userId: 'usr_mock_001',
    email: 'user@example.com',
    nickname: '고기마스터',
    status: 'ACTIVE'
  }
};
