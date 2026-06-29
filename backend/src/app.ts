// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import crypto from 'crypto';
import { idempotencyMiddleware } from './common/middleware/idempotency.middleware.js';
import { errorHandler } from './common/middleware/errorHandler.middleware.js';
import { getHealthStatus } from './common/utils/health.js';

// استيراد المسارات
import authRoutes from './modules/auth/auth.routes.js';
import teamRoutes from './modules/team/team.routes.js';
import inboxRoutes from './modules/inbox/inbox.routes.js';
import ticketRoutes from './modules/tickets/ticket.routes.js';
import csatRoutes from './modules/csat/csat.routes.js';
import customerRoutes from './modules/inbox/customer.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import channelsRoutes from './modules/channels/channels.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';

const app = express();

// توليد X-Request-ID لكل طلب
app.use((req, _res, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] ?? crypto.randomUUID();
  next();
});

// Middleware الأساسية
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https://api.unicomcx.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
}));

app.use(cors());
app.use(compression());
app.use(express.json());

// Idempotency middleware (يعمل على جميع الطلبات)
app.use(idempotencyMiddleware);

// نقطة فحص الصحة
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Liveness Probe – للتحقق من أن العملية حية
app.get('/live', (_req, res) => {
  res.status(200).json({ status: 'alive' });
});

// Readiness Probe – للتحقق من جاهزية التبعيات
app.get('/ready', async (_req, res) => {
  try {
    const status = await getHealthStatus();
    const allReady = status.database && status.redis;
    if (allReady) {
      res.status(200).json({ status: 'ready', ...status });
    } else {
      res.status(503).json({ status: 'not ready', ...status });
    }
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Health check failed' });
  }
});

// ربط المسارات
app.use('/auth', authRoutes);
app.use('/team', teamRoutes);
app.use('/inbox', inboxRoutes);
app.use('/tickets', ticketRoutes);
app.use('/csat', csatRoutes);
app.use('/customers', customerRoutes);
app.use('/ai', aiRoutes);
app.use('/channels', channelsRoutes);
app.use('/analytics', analyticsRoutes);

// معالج الأخطاء العام (يجب أن يكون آخر middleware)
app.use(errorHandler);

export default app;