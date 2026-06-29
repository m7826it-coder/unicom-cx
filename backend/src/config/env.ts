// src/config/env.ts
import dotenv from 'dotenv';
import { loadSecrets } from './secrets.js';

dotenv.config();

const secrets = await loadSecrets();

export const env = {
  NODE_ENV: (process.env.NODE_ENV ?? 'development') as string,
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  DATABASE_URL: secrets.DATABASE_URL ?? process.env.DATABASE_URL ?? 'postgresql://unicom:unicom@localhost:5432/unicom_db?schema=public',
  REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',
  JWT_SECRET: secrets.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '24h',
  GEMINI_API_KEY: secrets.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite',
  ENCRYPTION_KEY: secrets.ENCRYPTION_KEY,
} as const;