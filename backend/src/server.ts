// src/server.ts
import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js';
import { createGateway } from './modules/inbox/inbox.gateway.js';
import { env } from './config/env.js';
import { logger } from './common/utils/logger.js';

// استيراد العامل (يبدأ تلقائياً عند الاستيراد)
import './workers/notification.worker.js';

const server = http.createServer(app);

createGateway(server);

server.listen(env.PORT, () => {
  logger.info(`🚀 UniCom CX Core API + WebSocket running on port ${env.PORT}`);
});