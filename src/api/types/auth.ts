// src/api/types/auth.ts

export interface User {
  userId: string;
  email: string;
  nickname: string;
  phone?: string;
  status: 'ACTIVE' | 'LOCKED' | 'BANNED';
}

export interface AuthResponseData {
  accessToken: string; // JWE Encrypted string in real scenario
  expiresIn: number;
  user?: User;
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
