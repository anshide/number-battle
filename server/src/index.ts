// ============================================================================
// server/src/index.ts
// Server entry point.
// Bootstraps Express, Socket.IO, and the RoomManager, then starts listening.
// ============================================================================

import { createServer } from 'http';
import { createApp } from './app.js';
import { createSocketServer } from './socket/index.js';
import { RoomManager } from './managers/RoomManager.js';
import { PORT } from './config/constants.js';
import { logger } from './utils/logger.js';

// 1. Create Express app
const app = createApp();

// 2. Create HTTP server (shared between Express and Socket.IO)
const httpServer = createServer(app);

// 3. Create the singleton RoomManager
const roomManager = new RoomManager();

// 4. Create and attach Socket.IO server
createSocketServer(httpServer, roomManager);

// 5. Start listening
httpServer.listen(PORT, () => {
  logger.info(`🎮 Number Battle server running on http://localhost:${PORT}`);
  logger.info(`   Health check: http://localhost:${PORT}/health`);
});

// 6. Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down...');
  roomManager.stopCleanupTimer();
  httpServer.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('Shutting down...');
  roomManager.stopCleanupTimer();
  httpServer.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});
