import { ApiError, NetworkError, NotFoundError, ValidationError } from '@/lib/errors';

const BASE_URL = '';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });
  } catch {
    throw new NetworkError();
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));

    switch (response.status) {
      case 400:
        throw new ValidationError(body.error || '請求資料格式錯誤', body.fields);
      case 404:
        throw new NotFoundError(body.resource || '資源');
      default:
        throw new ApiError(
          body.error || `請求失敗 (${response.status})`,
          response.status,
          body.code
        );
    }
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
