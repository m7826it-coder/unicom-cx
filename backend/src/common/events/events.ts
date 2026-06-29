// src/common/events/events.ts

/**
 * ثوابت جميع أسماء الأحداث المستخدمة في نظام UniCom CX.
 * تستخدم مع BullMQ والـ EventBus لضمان عدم تضارب الأسماء.
 */
export const Events = {
  MESSAGE_RECEIVED: 'message:received',
  MESSAGE_SEND: 'message:send',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_FAILED: 'message:failed',

  AI_ANALYZE: 'ai:analyze',
  AI_REPLY: 'ai:reply',
  AI_ESCALATE: 'ai:escalate',
  AGENT_MESSAGE_SENTIMENT_CHECK: 'agent:message:sentiment:check',

  CONVERSATION_CLASSIFIED: 'conversation:classified',
  CONVERSATION_UPDATED: 'conversation:updated',
  MESSAGE_NEW: 'message:new',

  TICKET_CREATED: 'ticket:created',
  TICKET_CREATE: 'ticket:create',

  SURVEY_GENERATED: 'survey:generated',
  CSAT_SURVEY_GENERATE: 'csat:survey:generate',
} as const;