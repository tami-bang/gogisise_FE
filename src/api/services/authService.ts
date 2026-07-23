import { apiClient } from '../apiClient';
import type { AuthResponseData, SendResetLinkResponse, User } from '../types/auth';
import type { ApiRequestOptions } from '../types/common';

const AUTH_PATH = '/api/v1/auth';
const USERS_PATH = '/api/v1/users';

const withUserFallback = async (
  data: AuthResponseData,
  options?: ApiRequestOptions
): Promise<AuthResponseData> => {
  if (data.user || !data.accessToken) {
    return data;
  }

  try {
    const user = await authService.getMe({
      ...options,
      accessToken: data.accessToken,
    });
    return { ...data, user };
  } catch {
    return data;
  }
};

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponseData> => {
    const data = await apiClient.post<AuthResponseData>(
      `${AUTH_PATH}/login`,
      { email, password, autoLogin: true },
      { skipAuth: true }
    );
    return withUserFallback(data);
  },

  signup: async (
    email: string,
    password: string,
    nickname: string,
    phone?: string
  ): Promise<AuthResponseData> => {
    const data = await apiClient.post<AuthResponseData>(
      `${AUTH_PATH}/signup`,
      { email, password, nickname, phone },
      { skipAuth: true }
    );
    return withUserFallback(data);
  },

  refresh: async (): Promise<AuthResponseData> => {
    const data = await apiClient.post<AuthResponseData>(
      `${AUTH_PATH}/refresh`,
      {},
      { skipAuth: true }
    );
    return withUserFallback(data);
  },

  logout: async (accessToken?: string | null): Promise<void> => {
    await apiClient.post<void>(
      `${AUTH_PATH}/logout`,
      {},
      { accessToken }
    );
  },

  getMe: async (options?: ApiRequestOptions): Promise<User> => {
    return apiClient.get<User>(`${USERS_PATH}/me`, options);
  },

  sendResetLink: async (email: string): Promise<void> => {
    await apiClient.post<SendResetLinkResponse>(
      `${AUTH_PATH}/send-reset-link`,
      { email },
      { skipAuth: true }
    );
  },
};
