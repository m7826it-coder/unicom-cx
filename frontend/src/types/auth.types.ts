export interface UserResponse {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'AGENT';
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthMeResponse {
  user: UserResponse;
  organization: OrganizationResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  organizationName: string;
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  passwordConfirmation: string;
}