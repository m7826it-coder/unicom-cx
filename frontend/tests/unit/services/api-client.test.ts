import { fetchApi } from '@/services/api-client';
import { ApiError } from '@/types/api.types';

describe('fetchApi', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('ترجع data عند نجاح الاستجابة', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      status: 200,
      json: async () => ({ success: true, data: { id: '1', name: 'Test' } }),
    } as Response);

    const result = await fetchApi<{ id: string; name: string }>('/test');
    expect(result).toEqual({ id: '1', name: 'Test' });
  });

  it('ترجع PaginatedResponse عندما تحتوي الاستجابة على pagination', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        success: true,
        data: [{ id: '1' }],
        pagination: { page: 1, limit: 20, total: 50 },
      }),
    } as Response);

    const result = await fetchApi<{ id: string }[]>('/test');
    expect(result).toEqual({
      data: [{ id: '1' }],
      pagination: { page: 1, limit: 20, total: 50 },
    });
  });

  it('ترمي ApiError عند فشل 400', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        detail: 'Invalid input',
        instance: '/test',
      }),
    } as Response);

    await expect(fetchApi('/test')).rejects.toThrow(ApiError);
    await expect(fetchApi('/test')).rejects.toThrow('Invalid input');
  });

  it('توجه إلى /login عند 401 في المتصفح', async () => {
    const hrefSpy = jest.fn();
    Object.defineProperty(window, 'location', {
      value: {
        href: '',
        origin: 'http://localhost:3000',
        pathname: '/dashboard/inbox',
        search: '',
      },
      writable: true,
    });
    jest.spyOn(window.location, 'href', 'set').mockImplementation(hrefSpy);

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({}),
    } as Response);

    try {
      await fetchApi('/test');
    } catch {}

    expect(hrefSpy).toHaveBeenCalledWith(
      expect.stringContaining('/login')
    );
  });
});