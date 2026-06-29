import { authService } from '@/services/auth.service';
import { fetchApi } from '@/services/api-client';

jest.mock('@/services/api-client', () => ({
  fetchApi: jest.fn(),
}));

const mockFetchApi = fetchApi as jest.MockedFunction<typeof fetchApi>;

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('تستدعي fetchApi بـ POST /auth/login', async () => {
      const mockData = { user: { id: '1' }, organization: { id: 'org1' } };
      mockFetchApi.mockResolvedValueOnce(mockData);

      const result = await authService.login({ email: 'test@test.com', password: 'password' });

      expect(mockFetchApi).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'password' }),
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('register', () => {
    it('تستدعي fetchApi بـ POST /auth/register', async () => {
      mockFetchApi.mockResolvedValueOnce({});

      await authService.register({
        organizationName: 'Org',
        name: 'User',
        email: 'test@test.com',
        password: 'P@ssw0rd1',
        passwordConfirmation: 'P@ssw0rd1',
        acceptTerms: true,
      });

      expect(mockFetchApi).toHaveBeenCalledWith('/auth/register', {
        method: 'POST',
        body: expect.any(String),
      });
    });
  });

  describe('getMe', () => {
    it('تستدعي fetchApi بـ GET /auth/me', async () => {
      mockFetchApi.mockResolvedValueOnce({});

      await authService.getMe();

      expect(mockFetchApi).toHaveBeenCalledWith('/auth/me');
    });
  });
});