import { ApiError, type PaginationMeta } from '@/types/api.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface PaginatedResponse<T> {
  data: T;
  pagination: PaginationMeta;
}

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T | PaginatedResponse<T>> {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (response.status >= 200 && response.status < 300) {
    const json = await response.json();
    if (json.pagination) {
      return {
        data: json.data as T,
        pagination: json.pagination as PaginationMeta,
      } as PaginatedResponse<T>;
    }
    return json.data as T;
  }

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set('returnUrl', window.location.pathname + window.location.search);
      window.location.href = loginUrl.toString();
      throw new ApiError(401, '', 'Unauthorized', 'Session expired', '');
    }
    throw new ApiError(401, '', 'Unauthorized', 'Authentication required', '');
  }

  const errorBody = await response.json().catch(() => ({}));
  throw new ApiError(
    errorBody.status ?? response.status,
    errorBody.type ?? 'about:blank',
    errorBody.title ?? 'Unknown Error',
    errorBody.detail ?? response.statusText,
    errorBody.instance ?? path,
    errorBody.errors
  );
}
/** إصدار من fetchApi يُرجع T فقط – للاستخدام مع useQuery */
export async function fetchData<T>(path: string, options?: RequestInit): Promise<T> {
  return fetchApi<T>(path, options) as Promise<T>;
  }
