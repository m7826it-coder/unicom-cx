'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Socket } from 'socket.io-client'; // ✅ استيراد عادي (بدون type)
import { createSocket, disconnectSocket } from '@/services/socket.service';

export function useWebSocket(): { socket: Socket | null; isConnected: boolean } {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const getCookie = (name: string): string | null => {
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const token = getCookie('token');
    if (!token) return;

    const socket = createSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('conversation:new', () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });
    socket.on('conversation:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });
    socket.on('message:new', (data: { conversationId?: string }) => {
      if (data?.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });
    socket.on('message:updated', (data: { conversationId?: string }) => {
      if (data?.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] });
      }
    });
    socket.on('ticket:created', () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    });

    return () => {
      disconnectSocket(socket);
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [queryClient]);

  return {
    socket: socketRef.current,
    isConnected,
  };
}
