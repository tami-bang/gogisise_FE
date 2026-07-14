import { ApiClientError } from './types/common';
import type { ApiErrorResponse, ApiRequestOptions, ApiResponse } from './types/common';

const DEFAULT_API_BASE_URL = 'http://localhost:8000';

const getApiBaseUrl = () => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return (envBaseUrl?.trim() || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
};

const isApiResponse = <T>(value: unknown): value is ApiResponse<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    typeof (value as { success: unknown }).success === 'boolean'
  );
};

const isApiErrorResponse = (value: unknown): value is ApiErrorResponse => {
  return isApiResponse(value) && value.success === false;
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const createHeaders = (body: unknown, options?: ApiRequestOptions): Headers => {
  const headers = new Headers(options?.headers);

  if (body !== undefined && !(body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!options?.skipAuth && options?.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`);
  }

  return headers;
};

const toApiClientError = (response: Response, body: unknown): ApiClientError => {
  if (isApiErrorResponse(body)) {
    return new ApiClientError({
      message: body.error.message,
      status: response.status,
      errorCode: body.error.errorCode,
      requestId: body.meta?.requestId,
    });
  }

  return new ApiClientError({
    message: response.statusText || 'API request failed',
    status: response.status,
    errorCode: response.status === 401 ? 'AUTHENTICATION_REQUIRED' : 'HTTP_ERROR',
  });
};

const request = async <T>(
  method: string,
  path: string,
  body?: unknown,
  options?: ApiRequestOptions
): Promise<T> => {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: createHeaders(body, options),
    signal: options?.signal,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });

  if (options?.rawResponse) {
    return response as T;
  }

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    throw toApiClientError(response, parsedBody);
  }

  if (isApiResponse<T>(parsedBody)) {
    if (!parsedBody.success) {
      throw toApiClientError(response, parsedBody);
    }
    return parsedBody.data;
  }

  return parsedBody as T;
};

export const apiClient = {
  get: <T>(path: string, options?: ApiRequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) => request<T>('POST', path, body, options),
  delete: <T>(path: string, options?: ApiRequestOptions) => request<T>('DELETE', path, undefined, options),
};
