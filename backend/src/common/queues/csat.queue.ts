// src/common/queues/csat.queue.ts
import { createQueue } from '@/config/bullmq.js';

/**
 * طابور استبيانات رضا العملاء (CSAT).
 * يستخدم لجدولة إنشاء وإرسال الاستبيانات عند إغلاق المحادثات.
 */
export const csatQueue = createQueue('csat-queue', { delay: 5000 });