export interface ApiMeta {
  requestId?: string;
  servedAt?: string;
}

export interface ApiErrorBody {
  errorCode: string;
  message: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
  meta?: ApiMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ApiRequestOptions {
  accessToken?: string | null;
  signal?: AbortSignal;
  skipAuth?: boolean;
  rawResponse?: boolean;
  headers?: HeadersInit;
}

export class ApiClientError extends Error {
  status: number;
  errorCode: string;
  requestId?: string;

  constructor(params: {
    message: string;
    status: number;
    errorCode: string;
    requestId?: string;
  }) {
    super(params.message);
    this.name = 'ApiClientError';
    this.status = params.status;
    this.errorCode = params.errorCode;
    this.requestId = params.requestId;
  }
}
