// src/common/queues/ai-analysis.queue.ts
import { createQueue } from '../../config/bullmq.js';

/**
 * طابور تحليل الذكاء الاصطناعي. يستخدم لمهام:
 * - تصنيف المحادثات
 * - الرد التلقائي
 * - فحص المشاعر
 * - اقتراح الردود
 */
export const aiAnalysisQueue = createQueue('ai-analysis-queue', { attempts: 2, delay: 1500 });