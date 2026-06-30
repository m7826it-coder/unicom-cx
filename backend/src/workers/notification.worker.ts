import { Worker } from 'bullmq';
import { connection } from '@/config/bullmq.js';
import { getIO } from '@/modules/inbox/inbox.gateway.js';
import { logger } from '@/common/utils/logger.js';
import type { Job } from 'bullmq';

/**
 * Notification Worker (BullMQ correct implementation)
 */
export function startNotificationWorker(): void {
  const worker = new Worker(
    'notification', // اسم الـ queue
    async (job: Job) => {
      try {
        const { orgId, event, ...payload } = job.data;

        if (!orgId) {
          logger.warn('Notification job missing orgId', job.data);
          return;
        }

        const io = getIO();
        const room = `org:${orgId}`;

        const eventName = event || job.name;

        io.to(room).emit(eventName, payload);

        logger.info(`Notification sent to room ${room}: event=${eventName}`, {
          jobId: job.id,
        });
      } catch (error) {
        logger.error(`Failed to process notification job ${job.id}`, error);
        throw error;
      }
    },
    {
      connection,
    }
  );

  worker.on('failed', (job, err) => {
    logger.error(`Job failed: ${job?.id}`, err);
  });

  worker.on('completed', (job) => {
    logger.info(`Job completed: ${job.id}`);
  });

  logger.info('🔔 Notification worker started');
}

// start automatically
startNotificationWorker();