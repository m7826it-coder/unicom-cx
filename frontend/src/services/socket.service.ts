import { io, Socket } from 'socket.io-client'; // ✅ استيراد موحد

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function createSocket(token: string): Socket {
  const socket = io(API_BASE_URL, {
    path: '/ws',
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('🔌 WebSocket connected:', socket.id);
  });
  socket.on('disconnect', (reason) => {
    console.log('🔌 WebSocket disconnected:', reason);
  });
  socket.on('connect_error', (error) => {
    console.error('🔌 WebSocket connection error:', error.message);
  });

  return socket;
}

export function disconnectSocket(socket: Socket): void {
  if (socket.connected) {
    socket.disconnect();
  }
}
