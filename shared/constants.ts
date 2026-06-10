// ============================================================================
// shared/constants.ts
// Tunable constants shared between client and server.
// ============================================================================

/** Room code length (6-character alphanumeric) */
export const ROOM_CODE_LENGTH = 6;

/** Maximum players allowed per room */
export const MAX_PLAYERS_PER_ROOM = 2;

/** Characters used for room code generation (ambiguous chars removed) */
export const ROOM_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Grace period (ms) before a disconnected player is considered gone */
export const DISCONNECT_GRACE_MS = 60_000;

/** Maximum room age (ms) before auto-cleanup */
export const MAX_ROOM_AGE_MS = 30 * 60 * 1000; // 30 minutes

/** Interval (ms) between stale room cleanup sweeps */
export const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/** Player name constraints */
export const PLAYER_NAME_MIN_LENGTH = 1;
export const PLAYER_NAME_MAX_LENGTH = 20;
