// ============================================================================
// server/src/socket/index.ts
// Socket.IO server initialization.
// Creates the IO server, registers middleware, and wires up event handlers.
// ============================================================================

import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@number-battle/shared';
import { CORS_ORIGINS } from '../config/constants.js';
import { RoomManager } from '../managers/RoomManager.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import { registerRoomHandlers } from './handlers/roomHandler.js';
import { registerGameHandlers } from './handlers/gameHandler.js';
import { logger } from '../utils/logger.js';

type GameServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

/**
 * Create and configure the Socket.IO server.
 * @param httpServer - The HTTP server to attach to
 * @param roomManager - The singleton RoomManager instance
 * @returns The configured Socket.IO server
 */
export function createSocketServer(
  httpServer: HttpServer,
  roomManager: RoomManager
): GameServer {
  const io: GameServer = new Server(httpServer, {
    cors: {
      origin: CORS_ORIGINS,
      methods: ['GET', 'POST'],
    },
    // Ping every 25s, timeout after 20s of no response
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // Register middleware
  io.use(authMiddleware);

  // Handle new connections
  io.on('connection', (socket) => {
    logger.info('Player connected', { socketId: socket.id });

    // Register event handlers for this socket
    registerRoomHandlers(io, socket, roomManager);
    registerGameHandlers(io, socket, roomManager);
  });

  logger.info('Socket.IO server initialized', { corsOrigins: CORS_ORIGINS });
  return io;
}
