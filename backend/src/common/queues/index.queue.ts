// src/common/queues/index.ts
import { inboundQueue } from './inbound.queue.js';
import { outboundQueue } from './outbound.queue.js';
import { aiAnalysisQueue } from './ai-analysis.queue.js';
import { notificationQueue } from './notification.queue.js';
import { csatQueue } from './csat.queue.js';
import { ticketQueue } from './ticket.queue.js';

/**
 * جميع طوابير BullMQ مجمعة في كائن واحد لسهولة الوصول.
 */
export const queues = {
  inbound: inboundQueue,
  outbound: outboundQueue,
  aiAnalysis: aiAnalysisQueue,
  notification: notificationQueue,
  csat: csatQueue,
  ticket: ticketQueue,
} as const;

export { inboundQueue } from './inbound.queue.js';
export { outboundQueue } from './outbound.queue.js';
export { aiAnalysisQueue } from './ai-analysis.queue.js';
export { notificationQueue } from './notification.queue.js';
export { csatQueue } from './csat.queue.js';
export { ticketQueue } from './ticket.queue.js';