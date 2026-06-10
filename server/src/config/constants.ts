// ============================================================================
// server/src/config/constants.ts
// Server-specific configuration constants.
// Imports shared constants and adds server-only tunables.
// ============================================================================

export {
  ROOM_CODE_LENGTH,
  ROOM_CODE_CHARS,
  MAX_PLAYERS_PER_ROOM,
  DISCONNECT_GRACE_MS,
  MAX_ROOM_AGE_MS,
  CLEANUP_INTERVAL_MS,
  PLAYER_NAME_MIN_LENGTH,
  PLAYER_NAME_MAX_LENGTH,
} from '@number-battle/shared';

/** Port the server listens on */
export const PORT = parseInt(process.env.PORT || '3001', 10);

/** Allowed CORS origins for the client */
export const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:5173', // Vite dev server default
  'http://localhost:3000',
  'https://number-battle.vercel.app',
];

/** Maximum rooms a single IP can create (DoS mitigation) */
export const MAX_ROOMS_PER_IP = 5;
