// src/workers/notification.worker.ts
import { notificationQueue } from '@/common/queues/index.js';
import { getIO } from '@/modules/inbox/inbox.gateway.js';
import { logger } from '@/common/utils/logger.js';
import type { Job } from 'bullmq';

/**
 * عامل معالجة طابور الإشعارات.
 * يستمع للمهام من notificationQueue ويبثها إلى غرفة WebSocket المناسبة.
 */
export function startNotificationWorker(): void {
  notificationQueue.process(async (job: Job) => {
    try {
      const { orgId, event, ...payload } = job.data;

      if (!orgId) {
        logger.warn('Notification job missing orgId', job.data);
        return;
      }

      const io = getIO();
      const room = `org:${orgId}`;

      // تحديد اسم الحدث: إذا كان هناك حقل "event" في البيانات نستخدمه، وإلا نستخدم اسم المهمة
      const eventName = job.data.event || job.name;

      // إرسال الحدث إلى غرفة المنظمة
      io.to(room).emit(eventName, payload);

      logger.info(`Notification sent to room ${room}: event=${eventName}`, { jobId: job.id });
    } catch (error) {
      logger.error(`Failed to process notification job ${job.id}`, error);
      throw error; // BullMQ سيتولى إعادة المحاولة
    }
  });

  logger.info('🔔 Notification worker started');
}

// بدء العامل تلقائياً عند استيراد الملف
startNotificationWorker();