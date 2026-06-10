// ============================================================================
// client/src/context/SocketContext.tsx
// React context that manages the Socket.IO connection lifecycle.
// Provides socket instance + connection state to the entire app.
// ============================================================================

import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { socket, type GameSocket } from '../services/socketClient';

export interface SocketContextValue {
  /** The Socket.IO client instance */
  socket: GameSocket;
  /** Whether the socket is currently connected */
  isConnected: boolean;
  /** Whether the socket is attempting to reconnect */
  isReconnecting: boolean;
}

export const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setIsReconnecting(false);
    console.log('[Socket] Connected:', socket.id);
  }, []);

  const handleDisconnect = useCallback((reason: string) => {
    setIsConnected(false);
    console.log('[Socket] Disconnected:', reason);
  }, []);

  const handleReconnectAttempt = useCallback((attempt: number) => {
    setIsReconnecting(true);
    console.log('[Socket] Reconnecting... attempt', attempt);
  }, []);

  const handleReconnect = useCallback(() => {
    setIsReconnecting(false);
    console.log('[Socket] Reconnected');
  }, []);

  useEffect(() => {
    // Connect on mount
    socket.connect();

    // Register lifecycle listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.io.on('reconnect_attempt', handleReconnectAttempt);
    socket.io.on('reconnect', handleReconnect);

    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.io.off('reconnect_attempt', handleReconnectAttempt);
      socket.io.off('reconnect', handleReconnect);
      socket.disconnect();
    };
  }, [handleConnect, handleDisconnect, handleReconnectAttempt, handleReconnect]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, isReconnecting }}>
      {children}
    </SocketContext.Provider>
  );
}
