// src/common/queues/notification.queue.ts
import { createQueue } from '../../config/bullmq.js';

/**
 * طابور الإشعارات. ينقل أحداث النظام إلى خدمة WebSocket
 * لبثها مباشرة إلى الوكلاء المتصلين.
 */
export const notificationQueue = createQueue('notification-queue', { delay: 1000 });