// src/config/bullmq.ts
import { Queue } from 'bullmq';
import { env } from './env.js';
import { logger } from '@/common/utils/logger.js';

const redisUrl = new URL(env.REDIS_URL);

export const connection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port || '6379', 10),
  maxRetriesPerRequest: null,
};

export interface QueueOptions {
  attempts?: number;
  delay?: number;
}

export function createQueue(name: string, opts?: QueueOptions): Queue {
  const attempts = opts?.attempts ?? 3;
  const delay = opts?.delay ?? 2000;

  const queue = new Queue(name, {
    connection,
    defaultJobOptions: {
      attempts,
      backoff: { type: 'exponential', delay },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });

  queue.on('error', (error) => {
    logger.error(`${name} error:`, error);
  });

  queue.on('completed', (job) => {
    logger.info(`${name} job ${job.id} completed`);
  });

  queue.on('failed', (job, error) => {
    logger.error(`${name} job ${job?.id} failed. Attempts made: ${job?.attemptsMade}`, error);
  });

  return queue;
}