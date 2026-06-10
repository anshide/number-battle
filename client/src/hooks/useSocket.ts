// ============================================================================
// client/src/hooks/useSocket.ts
// Hook to access the SocketContext safely.
// Throws a descriptive error if used outside of SocketProvider.
// ============================================================================

import { useContext } from 'react';
import { SocketContext, type SocketContextValue } from '../context/SocketContext';

/**
 * Access the Socket.IO socket instance and connection state.
 * Must be used within a <SocketProvider>.
 */
export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a <SocketProvider>');
  }
  return context;
}
