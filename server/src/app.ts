// ============================================================================
// server/src/app.ts
// Express application setup.
// Configures CORS and a health-check endpoint.
// All game communication happens through Socket.IO — no REST game routes.
// ============================================================================

import express from 'express';
import cors from 'cors';
import { CORS_ORIGINS } from './config/constants.js';

export function createApp(): express.Application {
  const app = express();

  // CORS configuration — allow requests from the client dev server
  app.use(
    cors({
      origin: CORS_ORIGINS,
      methods: ['GET', 'POST'],
    })
  );

  // JSON body parsing (for potential future REST endpoints)
  app.use(express.json());

  // Health check endpoint (useful for deployment monitoring)
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  return app;
}
