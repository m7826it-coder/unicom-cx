// src/modules/inbox/inbox.gateway.ts
import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { logger } from '../../common/utils/logger.js';

let io: Server | null = null;

export function createGateway(httpServer: HTTPServer): Server {
  io = new Server(httpServer, { path: '/ws', cors: { origin: '*', methods: ['GET', 'POST'] } });

  io.use((socket: Socket, next) => {
    try {
      const token = (socket.handshake.auth.token as string) ?? socket.handshake.headers.cookie?.match(/token=([^;]+)/)?.[1];
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; orgId: string; role: string };
      socket.data.user = { id: decoded.userId, orgId: decoded.orgId, role: decoded.role };
      next();
    } catch (err) { next(new Error('Invalid or expired token')); }
  });

  io.on('connection', (socket: Socket) => {
    const { orgId, id: userId } = socket.data.user;
    const room = `org:${orgId}`;
    try { socket.join(room); logger.info(`Agent ${userId} connected → room ${room}`); } catch (error) { logger.error(`Failed to join room for agent ${userId}`, error); }
    socket.on('error', (error) => { logger.error(`Socket error for agent ${userId}:`, error); });
    socket.on('disconnect', () => { logger.info(`Agent ${userId} disconnected`); });
  });

  return io;
}

export function getIO(): Server { if (!io) throw new Error('Socket.io not initialized. Call createGateway first.'); return io; }