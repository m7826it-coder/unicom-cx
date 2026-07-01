// src/config/secrets.ts
import { logger } from '../common/utils/logger.js';

let SecretManagerClient: any = null;
try {
  const mod = await import('@google-cloud/secret-manager');
  SecretManagerClient = mod.SecretManagerServiceClient;
} catch {}

export interface Secrets {
  JWT_SECRET: string;
  GEMINI_API_KEY: string;
  ENCRYPTION_KEY: string;
  DATABASE_URL?: string;
}

export async function loadSecrets(): Promise<Secrets> {
  const isProduction = process.env.NODE_ENV === 'production';
  const projectId = process.env.GCP_PROJECT_ID;

  if (!isProduction || !projectId || !SecretManagerClient) {
    return {
      JWT_SECRET: process.env.JWT_SECRET ?? 'dev-jwt-secret',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ?? Buffer.alloc(32).toString('base64'),
      DATABASE_URL: process.env.DATABASE_URL,
    };
  }

  const client = new SecretManagerClient();
  const secrets: Partial<Secrets> = {};

  const secretNames: Array<{ key: keyof Secrets; name: string }> = [
    { key: 'JWT_SECRET', name: 'jwt-secret' },
    { key: 'GEMINI_API_KEY', name: 'gemini-api-key' },
    { key: 'ENCRYPTION_KEY', name: 'encryption-key' },
    { key: 'DATABASE_URL', name: 'database-url' },
  ];

  for (const { key, name } of secretNames) {
    try {
      const [version] = await client.accessSecretVersion({
        name: `projects/${projectId}/secrets/${name}/versions/latest`,
      });
      const payload = version.payload?.data?.toString() ?? '';
      (secrets as any)[key] = payload;
      logger.info(`Secret "${name}" loaded from Secret Manager`);
    } catch (error) {
      logger.error(`Failed to load secret "${name}"`, error);
      (secrets as any)[key] = process.env[key] ?? '';
    }
  }

  return secrets as Secrets;
}