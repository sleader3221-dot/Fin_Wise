import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

type EventHandler = (...args: any[]) => void;

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

interface QueuedMessage {
  event: string;
  data: any;
  timestamp: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
    autoConnect = true,
    reconnectAttempts = 10,
    reconnectDelay = 2000,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const eventHandlersRef = useRef<Map<string, Set<EventHandler>>>(new Map());
  const messageQueueRef = useRef<QueuedMessage[]>([]);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setStatus('connecting');
    setError(null);

    try {
      const socket = io(url, {
        transports: ['websocket', 'polling'],
        reconnection: false,
        timeout: 10000,
        forceNew: true,
      });

      socket.on('connect', () => {
        setStatus('connected');
        reconnectCountRef.current = 0;
        flushMessageQueue();
        setError(null);
      });

      socket.on('disconnect', (reason) => {
        setStatus('disconnected');
        if (reason === 'io server disconnect') {
          return;
        }
        attemptReconnect();
      });

      socket.on('connect_error', (err) => {
        setError(err);
        setStatus('error');
        attemptReconnect();
      });

      socket.on('message', (data) => {
        setLastMessage(data);
      });

      const defaultHandler = (event: string, ...args: any[]) => {
        const handlers = eventHandlersRef.current.get(event);
        if (handlers) {
          handlers.forEach((handler) => handler(...args));
        }
      };

      socket.onAny(defaultHandler);

      socketRef.current = socket;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create socket'));
      setStatus('error');
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  const attemptReconnect = useCallback(() => {
    if (reconnectCountRef.current >= reconnectAttempts) {
      setStatus('error');
      setError(new Error(`Max reconnection attempts (${reconnectAttempts}) reached`));
      return;
    }

    reconnectCountRef.current += 1;
    const delay = reconnectDelay * Math.min(reconnectCountRef.current, 5);

    reconnectTimerRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect, reconnectAttempts, reconnectDelay]);

  const flushMessageQueue = useCallback(() => {
    const queue = messageQueueRef.current;
    messageQueueRef.current = [];

    queue.forEach((msg) => {
      emit(msg.event, msg.data);
    });
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      messageQueueRef.current.push({
        event,
        data,
        timestamp: Date.now(),
      });
    }
  }, []);

  const on = useCallback((event: string, handler: EventHandler) => {
    if (!eventHandlersRef.current.has(event)) {
      eventHandlersRef.current.set(event, new Set());
    }
    eventHandlersRef.current.get(event)!.add(handler);

    return () => {
      const handlers = eventHandlersRef.current.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          eventHandlersRef.current.delete(event);
        }
      }
    };
  }, []);

  const off = useCallback((event: string, handler?: EventHandler) => {
    if (handler) {
      const handlers = eventHandlersRef.current.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          eventHandlersRef.current.delete(event);
        }
      }
    } else {
      eventHandlersRef.current.delete(event);
    }
  }, []);

  const send = useCallback((event: string, data?: any) => {
    emit(event, data);
  }, [emit]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket: socketRef.current,
    status,
    lastMessage,
    error,
    isConnected: status === 'connected',
    connect,
    disconnect,
    emit,
    on,
    off,
    send,
  };
}
