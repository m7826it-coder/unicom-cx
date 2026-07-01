// src/modules/auth/auth.service.ts
import prisma from '../../config/database.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../common/utils/ApiError.js';
import { logger } from '../../common/utils/logger.js';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';

export interface RegisterRequest {
  organizationName: string;
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  acceptTerms: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

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

export class AuthService {
  async register(
    data: RegisterRequest
  ): Promise<{ user: UserResponse; organization: OrganizationResponse }> {
    this.validatePasswordStrength(data.password);

    if (data.password !== data.passwordConfirmation) {
      throw ApiError.badRequest('Passwords do not match');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: data.organizationName,
          plan: 'trial',
        },
      });

      const user = await tx.user.create({
        data: {
          orgId: organization.id,
          name: data.name,
          email: data.email,
          passwordHash,
          role: 'ADMIN',
        },
        select: {
          id: true,
          orgId: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return { user, organization };
    });

    logger.info(
      `New organization registered: ${result.organization.id} by ${result.user.email}`
    );

    return {
      user: {
        ...result.user,
        createdAt: result.user.createdAt.toISOString(),
        updatedAt: result.user.updatedAt.toISOString(),
      },
      organization: {
        ...result.organization,
        createdAt: result.organization.createdAt.toISOString(),
        updatedAt: result.organization.updatedAt.toISOString(),
      },
    };
  }

  async login(
    data: LoginRequest
  ): Promise<{ user: UserResponse; organization: OrganizationResponse; token: string }> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { organization: true },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.orgId, user.role);

    logger.info(`User logged in: ${user.email}`);

    return {
      user: {
        id: user.id,
        orgId: user.orgId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        plan: user.organization.plan,
        createdAt: user.organization.createdAt.toISOString(),
        updatedAt: user.organization.updatedAt.toISOString(),
      },
      token,
    };
  }

  async getMe(userId: string): Promise<AuthMeResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return {
      user: {
        id: user.id,
        orgId: user.orgId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        plan: user.organization.plan,
        createdAt: user.organization.createdAt.toISOString(),
        updatedAt: user.organization.updatedAt.toISOString(),
      },
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { message: 'If the email is registered, a reset link has been sent.' };
    }

    const secret = this.getJwtSecret();
    const resetToken = jwt.sign(
      { userId: user.id },
      secret,
      {
        expiresIn: '1h',
      } as SignOptions
    );

    logger.info(
      `[DEV] Password reset link for ${email}: https://app.unicomcx.com/reset-password?token=${resetToken}`
    );

    return { message: 'If the email is registered, a reset link has been sent.' };
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    let userId: string;

    try {
      const decoded = jwt.verify(token, this.getJwtSecret()) as { userId: string };
      userId = decoded.userId;
    } catch {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    this.validatePasswordStrength(password);

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    logger.info(`Password reset completed for user ${userId}`);

    return { message: 'Password has been reset successfully.' };
  }

  private generateToken(userId: string, orgId: string, role: string): string {
    return jwt.sign(
      { userId, orgId, role },
      this.getJwtSecret(),
      {
        expiresIn: (env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
      }
    );
  }

  private getJwtSecret(): string {
    if (!env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing');
    }

    return env.JWT_SECRET;
  }

  private validatePasswordStrength(password: string): void {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    if (password.length < minLength || !hasUpperCase || !hasNumber || !hasSpecialChar) {
      throw ApiError.badRequest(
        'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.'
      );
    }
  }
}

export const authService = new AuthService();