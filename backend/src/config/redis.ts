// src/config/redis.ts
import { createRequire } from 'module';
import { env } from './env.js';

const require = createRequire(import.meta.url);

type RedisConstructor = typeof import('ioredis').default;

const Redis = require('ioredis') as RedisConstructor;

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redis.on('connect', () => {
  console.log('🔌 Redis Client connected');
});

redis.on('error', (error: unknown) => {
  console.error('❌ Redis Client error:', error);
});

process.on('SIGTERM', async () => {
  await redis.quit();
  console.log('🔌 Redis Client disconnected');
  process.exit(0);
});

export default redis;