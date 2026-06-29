import { fetchApi } from '@/services/api-client';
import type {
  AuthMeResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types/auth.types';

export class AuthService {
  async login(data: LoginRequest): Promise<AuthMeResponse> {
    return fetchApi<AuthMeResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest): Promise<AuthMeResponse> {
    return fetchApi<AuthMeResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<AuthMeResponse> {
    return fetchApi<AuthMeResponse>('/auth/me');
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return fetchApi<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return fetchApi<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    await fetchApi<void>('/auth/logout', { method: 'POST' });
  }
}

export const authService = new AuthService();