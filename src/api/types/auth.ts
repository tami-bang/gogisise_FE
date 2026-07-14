// src/api/types/auth.ts

export interface User {
  userId: string;
  email?: string;
  nickname: string;
  phone?: string;
  status?: 'ACTIVE' | 'LOCKED' | 'BANNED';
}

export interface AuthResponseData {
  accessToken: string;
  expiresIn?: number;
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
  autoLogin?: boolean;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface SendResetLinkResponse {
  message?: string;
}

// Wrapper structure matching common spec
export interface AuthResponse {
  success: boolean;
  data?: AuthResponseData;
  error?: {
    errorCode: string;
    message: string;
  };
  meta: {
    requestId: string;
    servedAt: string;
  };
}
