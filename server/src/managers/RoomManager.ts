// ============================================================================
// server/src/managers/RoomManager.ts
// Singleton manager responsible for all room lifecycle operations:
//   - Creating rooms with unique codes
//   - Joining/leaving rooms
//   - Periodic cleanup of stale rooms
//   - Reverse lookup from player ID → room
//
// This is the ONLY entry point for room mutations. Socket handlers
// should never modify Room objects directly.
// ============================================================================

import { v4 as uuidv4 } from 'uuid';
import type { GameSettings } from '@number-battle/shared';
import { MAX_ROOM_AGE_MS, CLEANUP_INTERVAL_MS, PLAYER_NAME_MIN_LENGTH, PLAYER_NAME_MAX_LENGTH } from '../config/constants.js';
import { Room } from '../models/Room.js';
import { Player } from '../models/Player.js';
import { generateRoomCode } from '../utils/roomCode.js';
import { logger } from '../utils/logger.js';
import { GameEngine } from '../game/GameEngine.js';
import type { GuessEntry, SanitizedGameState } from '@number-battle/shared';

/** Result type for operations that can fail with a user-facing message */
export type RoomResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string };

export class RoomManager {
  /** All active rooms keyed by room code */
  private rooms: Map<string, Room> = new Map();

  /** Reverse lookup: playerId → roomCode for fast room resolution */
  private playerToRoom: Map<string, string> = new Map();

  /** Handle for the periodic cleanup interval */
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startCleanupTimer();
  }

  // ---------------------------------------------------------------------------
  // Room Creation
  // ---------------------------------------------------------------------------

  /**
   * Create a new room with the given player as host.
   * @param playerName - Display name for the host
   * @param socketId - Current Socket.IO socket ID
   * @returns The created room and player info
   */
  createRoom(
    playerName: string,
    socketId: string
  ): RoomResult<{ room: Room; player: Player }> {
    // Validate player name
    const nameError = this.validatePlayerName(playerName);
    if (nameError) {
      return { success: false, error: nameError, code: 'INVALID_NAME' };
    }

    // Generate a unique room code
    const existingCodes = new Set(this.rooms.keys());
    const code = generateRoomCode(existingCodes);

    // Create the room
    const room = new Room(code);

    // Create the host player (index 0)
    const player = new Player({
      id: uuidv4(),
      name: playerName.trim(),
      index: 0,
      socketId,
      isConnected: true,
      isReady: false,
      disconnectedAt: null,
    });

    room.addPlayer(player);
    this.rooms.set(code, room);
    this.playerToRoom.set(player.id, code);

    logger.info('Room created', { roomCode: code, playerId: player.id, playerName: player.name });
    return { success: true, data: { room, player } };
  }

  // ---------------------------------------------------------------------------
  // Room Joining
  // ---------------------------------------------------------------------------

  /**
   * Join an existing room.
   * @param roomCode - The 6-character room code
   * @param playerName - Display name for the joining player
   * @param socketId - Current Socket.IO socket ID
   * @returns The joined room and player info
   */
  joinRoom(
    roomCode: string,
    playerName: string,
    socketId: string
  ): RoomResult<{ room: Room; player: Player }> {
    // Validate player name
    const nameError = this.validatePlayerName(playerName);
    if (nameError) {
      return { success: false, error: nameError, code: 'INVALID_NAME' };
    }

    // Normalize room code to uppercase
    const normalizedCode = roomCode.toUpperCase().trim();

    // Find the room
    const room = this.rooms.get(normalizedCode);
    if (!room) {
      return { success: false, error: 'Room not found. Check the code and try again.', code: 'ROOM_NOT_FOUND' };
    }

    // Check if room is full
    if (room.isFull()) {
      return { success: false, error: 'This room is already full.', code: 'ROOM_FULL' };
    }

    // Check if room is still in waiting status
    if (room.status !== 'waiting') {
      return { success: false, error: 'This game has already started.', code: 'GAME_IN_PROGRESS' };
    }

    // Create the guest player (index 1)
    const player = new Player({
      id: uuidv4(),
      name: playerName.trim(),
      index: 1,
      socketId,
      isConnected: true,
      isReady: false,
      disconnectedAt: null,
    });

    room.addPlayer(player);
    this.playerToRoom.set(player.id, normalizedCode);

    logger.info('Player joined room', { roomCode: normalizedCode, playerId: player.id, playerName: player.name });
    return { success: true, data: { room, player } };
  }

  // ---------------------------------------------------------------------------
  // Room Leaving
  // ---------------------------------------------------------------------------

  /**
   * Remove a player from their room.
   * If the room becomes empty, it is destroyed.
   * If the host leaves during waiting, the room is destroyed.
   */
  leaveRoom(playerId: string): RoomResult<{ room: Room; removedPlayer: Player }> {
    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) {
      return { success: false, error: 'You are not in a room.', code: 'NOT_IN_ROOM' };
    }

    const room = this.rooms.get(roomCode);
    if (!room) {
      // Stale mapping — clean up
      this.playerToRoom.delete(playerId);
      return { success: false, error: 'Room no longer exists.', code: 'ROOM_NOT_FOUND' };
    }

    const removedPlayer = room.removePlayer(playerId);
    if (!removedPlayer) {
      return { success: false, error: 'Player not found in room.', code: 'PLAYER_NOT_FOUND' };
    }

    this.playerToRoom.delete(playerId);

    // If room is now empty, or host left while waiting → destroy room
    if (room.isEmpty() || (room.status === 'waiting' && removedPlayer.index === 0)) {
      this.destroyRoom(roomCode);
      logger.info('Room destroyed (player left)', { roomCode });
    } else {
      // Re-index remaining players and reset ready states
      room.players.forEach((p, i) => {
        p.index = i;
        p.isReady = false;
      });
      logger.info('Player left room', { roomCode, playerId });
    }

    return { success: true, data: { room, removedPlayer } };
  }

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  /**
   * Update room settings. Only the host can change settings.
   */
  updateSettings(
    playerId: string,
    settings: Partial<GameSettings>
  ): RoomResult<{ room: Room }> {
    const room = this.getRoomByPlayer(playerId);
    if (!room) {
      return { success: false, error: 'You are not in a room.', code: 'NOT_IN_ROOM' };
    }

    if (!room.isHost(playerId)) {
      return { success: false, error: 'Only the host can change settings.', code: 'NOT_HOST' };
    }

    const updated = room.updateSettings(settings);
    if (!updated) {
      return { success: false, error: 'Invalid settings or wrong room status.', code: 'INVALID_SETTINGS' };
    }

    logger.info('Room settings updated', { roomCode: room.code, settings: room.settings });
    return { success: true, data: { room } };
  }

  // ---------------------------------------------------------------------------
  // Ready State
  // ---------------------------------------------------------------------------

  /**
   * Toggle a player's ready state.
   * @returns The room and whether all players are now ready
   */
  toggleReady(playerId: string): RoomResult<{ room: Room; allReady: boolean }> {
    const room = this.getRoomByPlayer(playerId);
    if (!room) {
      return { success: false, error: 'You are not in a room.', code: 'NOT_IN_ROOM' };
    }

    if (room.status !== 'waiting') {
      return { success: false, error: 'Cannot change ready state now.', code: 'INVALID_STATE' };
    }

    const player = room.getPlayer(playerId);
    if (!player) {
      return { success: false, error: 'Player not found.', code: 'PLAYER_NOT_FOUND' };
    }

    // Need both players present to ready up
    if (!room.isFull()) {
      return { success: false, error: 'Waiting for another player to join.', code: 'ROOM_NOT_FULL' };
    }

    player.isReady = !player.isReady;

    const allReady = room.allPlayersReady();
    if (allReady) {
      // Transition to setup phase (Phase 3 will handle secret number entry)
      room.status = 'setup';
      room.gameEngine = new GameEngine(room.settings, room.players[0], room.players[1]);
      room.gameState = room.gameEngine.state;
      logger.info('All players ready, transitioning to setup', { roomCode: room.code });
    }

    return { success: true, data: { room, allReady } };
  }

  // ---------------------------------------------------------------------------
  // Game Logic Proxy (Phase 3)
  // ---------------------------------------------------------------------------

  submitSecretNumber(playerId: string, secret: string): RoomResult<{ room: Room; ready: boolean; gameStarted: boolean }> {
    const room = this.getRoomByPlayer(playerId);
    if (!room || !room.gameEngine) {
      return { success: false, error: 'Game not found or not in progress.', code: 'GAME_NOT_FOUND' };
    }

    const result = room.gameEngine.setSecretNumber(playerId, secret);
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to submit secret.', code: 'INVALID_SECRET' };
    }

    return { success: true, data: { room, ready: result.ready, gameStarted: result.gameStarted } };
  }

  makeGuess(playerId: string, guess: string): RoomResult<{ room: Room; result: GuessEntry; gameOver: boolean }> {
    const room = this.getRoomByPlayer(playerId);
    if (!room || !room.gameEngine) {
      return { success: false, error: 'Game not found or not in progress.', code: 'GAME_NOT_FOUND' };
    }

    const result = room.gameEngine.makeGuess(playerId, guess);
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to make guess.', code: 'INVALID_GUESS' };
    }

    if (result.gameOver) {
      const winner = room.gameEngine.state.winner;
      const p1 = room.players[0].id;
      const p2 = room.players[1].id;

      if (winner === 'draw') {
        room.sessionScores[p1].draws++;
        room.sessionScores[p2].draws++;
      } else if (winner === p1) {
        room.sessionScores[p1].wins++;
        room.sessionScores[p2].losses++;
      } else if (winner === p2) {
        room.sessionScores[p2].wins++;
        room.sessionScores[p1].losses++;
      }
    }

    return { success: true, data: { room, result: result.result!, gameOver: !!result.gameOver } };
  }

  requestRematch(playerId: string): RoomResult<{ room: Room; rematchStarting: boolean }> {
    const room = this.getRoomByPlayer(playerId);
    if (!room || !room.gameEngine || room.gameState?.status !== 'finished') {
      return { success: false, error: 'Cannot rematch right now.', code: 'INVALID_STATE' };
    }

    room.rematchVotes.add(playerId);

    const allReady = room.players.length === 2 && room.players.every((p) => room.rematchVotes.has(p.id));
    if (allReady) {
      // Both players want a rematch. Reset the game state.
      room.rematchVotes.clear();
      room.status = 'setup';
      
      // Keep existing players but clear their ready states (though GameEngine doesn't use Room's isReady for playing)
      room.players.forEach(p => p.isReady = false);
      
      // Re-instantiate the engine with the same players and settings
      room.gameEngine = new GameEngine(room.settings, room.players[0], room.players[1]);
      room.gameState = room.gameEngine.state;

      logger.info('Rematch starting', { roomCode: room.code });
      return { success: true, data: { room, rematchStarting: true } };
    }

    return { success: true, data: { room, rematchStarting: false } };
  }

  getSanitizedGameState(playerId: string): SanitizedGameState | null {
    const room = this.getRoomByPlayer(playerId);
    if (!room || !room.gameEngine) return null;
    return room.gameEngine.getSanitizedState(playerId);
  }

  // ---------------------------------------------------------------------------
  // Lookups
  // ---------------------------------------------------------------------------

  /** Get a room by its code */
  getRoom(code: string): Room | null {
    return this.rooms.get(code) ?? null;
  }

  /** Get a room by a player's ID (reverse lookup) */
  getRoomByPlayer(playerId: string): Room | null {
    const code = this.playerToRoom.get(playerId);
    if (!code) return null;
    return this.rooms.get(code) ?? null;
  }

  /** Get the room code for a player */
  getRoomCode(playerId: string): string | null {
    return this.playerToRoom.get(playerId) ?? null;
  }

  /** Get the total number of active rooms (useful for monitoring) */
  getActiveRoomCount(): number {
    return this.rooms.size;
  }

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  /** Destroy a room and clean up all player → room mappings */
  private destroyRoom(code: string): void {
    const room = this.rooms.get(code);
    if (!room) return;

    // Remove all player → room mappings for this room
    for (const player of room.players) {
      this.playerToRoom.delete(player.id);
    }
    this.rooms.delete(code);
  }

  /** Periodic sweep to remove stale rooms */
  cleanupStaleRooms(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [code, room] of this.rooms) {
      const age = now - room.createdAt;

      // Remove rooms that have exceeded the maximum age
      if (age > MAX_ROOM_AGE_MS) {
        this.destroyRoom(code);
        cleaned++;
        continue;
      }

      // Remove empty rooms (edge case from disconnections)
      if (room.isEmpty()) {
        this.destroyRoom(code);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info('Cleaned up stale rooms', { count: cleaned, remaining: this.rooms.size });
    }
  }

  /** Start the periodic cleanup timer */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupStaleRooms();
    }, CLEANUP_INTERVAL_MS);
  }

  /** Stop the cleanup timer (for graceful shutdown) */
  stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Validation Helpers
  // ---------------------------------------------------------------------------

  /** Validate a player name. Returns error message or null if valid. */
  private validatePlayerName(name: string): string | null {
    const trimmed = name.trim();
    if (trimmed.length < PLAYER_NAME_MIN_LENGTH) {
      return `Name must be at least ${PLAYER_NAME_MIN_LENGTH} character(s).`;
    }
    if (trimmed.length > PLAYER_NAME_MAX_LENGTH) {
      return `Name must be at most ${PLAYER_NAME_MAX_LENGTH} characters.`;
    }
    return null;
  }
}
