// src/api/mock/authMock.ts

import type { AuthResponseData, User } from '../types/auth';

// 내부 인증용 Mock 유저 인터페이스
export interface MockUser extends User {
  password?: string;
}

// In-Memory Database
export let mockDatabase: MockUser[] = [];

/**
 * 모의 로그인 응답 데이터 생성
 */
export const generateMockLoginSuccess = (user: MockUser): AuthResponseData => ({
  accessToken: `mock_access_token_${Date.now()}_for_${user.email}`, // JWE mock
  expiresIn: 3600,
  user: {
    userId: user.userId,
    email: user.email,
    nickname: user.nickname,
    phone: user.phone,
    status: user.status
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
