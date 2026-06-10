// ============================================================================
// client/src/services/socketClient.ts
// Singleton Socket.IO client instance.
// Connects to the backend and provides a strongly-typed socket.
// Lazy-connects on first import — the socket is NOT connected until
// the SocketProvider mounts.
// ============================================================================

import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@number-battle/shared';

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * The server URL. In development, Vite proxies /socket.io to localhost:3001,
 * so we connect to the same origin. In production, set VITE_SERVER_URL.
 */
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

/**
 * Create a Socket.IO client instance.
 * autoConnect is false — we connect explicitly in the SocketProvider.
 */
export const socket: GameSocket = io(SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
});
