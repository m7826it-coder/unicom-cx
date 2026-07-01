// src/modules/channels/channels.service.ts
import crypto from 'crypto';
import { env } from '../../config/env.js';
import { ApiError } from '../../common/utils/ApiError.js';
import { logger } from '../../common/utils/logger.js';

export interface ChannelCredentials {
  phoneNumberId?: string;
  accessToken?: string;
  appId?: string;
  instagramAccountId?: string;
  facebookPageId?: string;
  botToken?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  apiKey?: string;
}

export class ChannelService {
  /**
   * تشفير بيانات اعتماد القناة باستخدام AES-256-GCM.
   */
  encryptCredentials(credentials: ChannelCredentials): string {
    const key = this.getEncryptionKey();
    const plaintext = JSON.stringify(credentials);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const combined = Buffer.concat([iv, encrypted, authTag]);
    return combined.toString('base64');
  }

  /**
   * فك تشفير بيانات اعتماد القناة.
   */
  decryptCredentials(encrypted: string): ChannelCredentials {
    const key = this.getEncryptionKey();
    try {
      const combined = Buffer.from(encrypted, 'base64');
      const iv = combined.subarray(0, 12);
      const authTag = combined.subarray(combined.length - 16);
      const encryptedData = combined.subarray(12, combined.length - 16);
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
      return JSON.parse(decrypted.toString('utf8')) as ChannelCredentials;
    } catch (error) {
      logger.error('Failed to decrypt channel credentials', error);
      throw ApiError.internal('Decryption failed – data may be corrupted or tampered with');
    }
  }

  /**
   * الحصول على مفتاح التشفير من متغيرات البيئة.
   */
  private getEncryptionKey(): Buffer {
    const keyStr = env.ENCRYPTION_KEY;
    if (!keyStr) throw ApiError.internal('Encryption key not configured');
    const key = Buffer.from(keyStr, 'base64');
    if (key.length !== 32) throw ApiError.internal('Encryption key must be 32 bytes (256-bit) when base64 decoded');
    return key;
  }
}

export const channelService = new ChannelService();