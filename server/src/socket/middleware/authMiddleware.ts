// ============================================================================
// server/src/socket/middleware/authMiddleware.ts
// Socket.IO middleware that runs on every new connection.
// Assigns initial socket data (no auth token required for v1 — player
// identity is established via room:create / room:join events).
// ============================================================================

import type { Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@number-battle/shared';
import { logger } from '../../utils/logger.js';

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

/**
 * Middleware that initialises socket data for every new connection.
 * In v1 there is no authentication — player identity is established
 * when they create or join a room. This middleware simply sets defaults.
 */
export function authMiddleware(socket: GameSocket, next: (err?: Error) => void): void {
  // Initialize socket data with defaults
  socket.data.playerId = '';
  socket.data.playerName = '';
  socket.data.roomCode = null;

  logger.debug('New socket connection', { socketId: socket.id });
  next();
}
