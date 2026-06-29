// src/common/queues/inbound.queue.ts
import { createQueue } from '@/config/bullmq.js';

/**
 * طابور الرسائل الواردة. تستخدمه وظائف الموصلات السحابية
 * لإضافة رسائل واردة بعد تطبيعها.
 */
export const inboundQueue = createQueue('inbound-queue');