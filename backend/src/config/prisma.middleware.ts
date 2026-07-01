// src/config/prisma.middleware.ts
import { AsyncLocalStorage } from 'async_hooks';
import { logger } from '../common/utils/logger.js';

export const orgIdStore = new AsyncLocalStorage<string>();

const MULTI_TENANT_MODELS = new Set([
  'User', 'Customer', 'Conversation', 'Message', 'Ticket',
  'SatisfactionSurvey', 'QuickReply', 'KnowledgeBaseEntry',
  'CustomerTag', 'CustomerNote', 'Channel',
]);

const ACTIONS_WITH_WHERE = new Set([
  'findUnique', 'findFirst', 'findMany', 'update', 'updateMany', 'delete', 'deleteMany',
]);

export function applyPrismaMiddleware(prismaClient: any): void {
  prismaClient.$use(async (params: any, next: any) => {
    const { action, model, args } = params;

    if (model && MULTI_TENANT_MODELS.has(model) && ACTIONS_WITH_WHERE.has(action)) {
      if (model === 'User' && action === 'findUnique' && args.where?.email) {
        return next(params);
      }

      if (!args.where) {
        args.where = {};
      }

      if (!args.where.orgId) {
        const orgId = orgIdStore.getStore();
        if (orgId) {
          args.where.orgId = orgId;
        } else {
          logger.warn(`PrismaMiddleware: orgId missing for ${model}.${action}`, {
            model, action, hasWhere: !!args.where,
          });
        }
      }
    }
    return next(params);
  });
}
