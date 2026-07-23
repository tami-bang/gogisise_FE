// src/api/services/userService.ts

import { apiClient } from '../apiClient';
import type { User } from '../types/auth';

const USERS_PATH = '/api/v1/users';

export const userService = {
  // 💡 [한글 주석] 프로필 정보(이메일, 닉네임, 연락처) 수정 API 호출 함수
  updateProfile: async (
    payload: { nickname?: string; email?: string; phone?: string },
    accessToken: string
  ): Promise<User> => {
    return apiClient.patch<User>(`${USERS_PATH}/me/profile`, payload, {
      accessToken,
    });
  },

  // 💡 [한글 주석] 비밀번호 변경 API 호출 함수
  updatePassword: async (
    payload: { currentPassword: string; newPassword: string; newPasswordConfirm: string },
    accessToken: string
  ): Promise<void> => {
    return apiClient.patch<void>(`${USERS_PATH}/me/password`, payload, {
      accessToken,
    });
  },

  // 💡 [한글 주석] 회원 탈퇴 API 호출 함수
  deleteAccount: async (accessToken: string): Promise<void> => {
    return apiClient.delete<void>(`${USERS_PATH}/me`, {
      accessToken,
    });
  },
};
