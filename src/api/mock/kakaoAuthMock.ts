// src/api/mock/kakaoAuthMock.ts

import type { AuthResponseData } from '../types/auth';

/**
 * 카카오 간편 로그인 성공 시 발급될 가짜 토큰과 유저 정보를 반환하는 함수 (뼈대)
 */
export const mockKakaoLoginSuccess = (kakaoId: string): AuthResponseData => {
  return {
    accessToken: `mock_kakao_token_${Date.now()}_for_${kakaoId}`,
    expiresIn: 3600,
    user: {
      userId: `kakao_${kakaoId}`,
      email: `kakao_${kakaoId}@example.com`,
      nickname: '카카오유저',
      phone: '010-0000-0000',
      status: 'ACTIVE'
    }
  };
};
