// src/common/queues/outbound.queue.ts
import { createQueue } from '@/config/bullmq.js';

/**
 * طابور الرسائل الصادرة. يستخدمها Core API لإرسال
 * رسائل إلى القنوات الخارجية عبر الموصلات.
 */
export const outboundQueue = createQueue('outbound-queue');