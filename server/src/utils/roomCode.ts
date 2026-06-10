// ============================================================================
// server/src/utils/roomCode.ts
// Room code generator.
// Produces 6-character uppercase alphanumeric codes with ambiguous
// characters (0/O, 1/I/L) removed to avoid confusion when players
// type codes manually.
// ============================================================================

import crypto from 'crypto';
import { ROOM_CODE_LENGTH, ROOM_CODE_CHARS } from '../config/constants.js';

/**
 * Generate a single random room code.
 * Uses crypto.randomBytes for better randomness than Math.random.
 */
function generateCode(): string {
  const bytes = crypto.randomBytes(ROOM_CODE_LENGTH);
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    // Use modulo to map each random byte to a valid character index.
    // Slight bias is acceptable for room codes (not cryptographic use).
    code += ROOM_CODE_CHARS[bytes[i] % ROOM_CODE_CHARS.length];
  }
  return code;
}

/**
 * Generate a unique room code that doesn't collide with any existing codes.
 * @param existingCodes - Set of currently active room codes
 * @param maxAttempts - Safety limit to prevent infinite loops
 * @returns A unique room code
 * @throws Error if a unique code cannot be generated within maxAttempts
 */
export function generateRoomCode(
  existingCodes: Set<string>,
  maxAttempts: number = 100
): string {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateCode();
    if (!existingCodes.has(code)) {
      return code;
    }
  }
  throw new Error('Failed to generate a unique room code after maximum attempts');
}
