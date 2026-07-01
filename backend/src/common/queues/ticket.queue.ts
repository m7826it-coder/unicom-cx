// src/common/queues/ticket.queue.ts
import { createQueue } from '../../config/bullmq.js';

/**
 * طابور التذاكر. يستخدم لإنشاء التذاكر (يدويًا أو تلقائيًا)
 * عند تصعيد المحادثات أو إنشاء تذاكر مستقلة.
 */
export const ticketQueue = createQueue('ticket-queue', { delay: 3000 });