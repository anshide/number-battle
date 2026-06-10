// ============================================================================
// server/src/models/Room.ts
// Room model representing a game room with up to 2 players.
// Manages room lifecycle: waiting → setup → playing → finished.
// The Room does NOT contain game logic — that lives in GameEngine (Phase 3).
// ============================================================================

import type { GameSettings, RoomStatus, RoomInfo, GameState } from '@number-battle/shared';
import { DEFAULT_GAME_SETTINGS, MAX_PLAYERS_PER_ROOM } from '@number-battle/shared';
import { Player } from './Player.js';
import type { GameEngine } from '../game/GameEngine.js';

export class Room {
  /** Unique room code (6-char alphanumeric) */
  public readonly code: string;

  /** Room lifecycle status */
  public status: RoomStatus;

  /** Game settings (configurable in lobby) */
  public settings: GameSettings;

  /** Players in the room (index 0 = host) */
  public players: Player[];

  /** Index of the host player (always 0) */
  public readonly hostIndex: number = 0;

  /** Game state — null until the game starts (Phase 3) */
  public gameState: GameState | null;

  /** GameEngine instance orchestrating the logic */
  public gameEngine: GameEngine | null = null;

  /** Set of player IDs who have requested a rematch */
  public rematchVotes: Set<string> = new Set();

  /** Timestamp when the room was created */
  public readonly createdAt: number;

  /** Session scores tracked across rematches */
  public sessionScores: Record<string, { wins: number; losses: number; draws: number }> = {};

  constructor(code: string) {
    this.code = code;
    this.status = 'waiting';
    this.settings = { ...DEFAULT_GAME_SETTINGS };
    this.players = [];
    this.gameState = null;
    this.createdAt = Date.now();
  }

  // ---------------------------------------------------------------------------
  // Player Management
  // ---------------------------------------------------------------------------

  /** Add a player to the room. Returns false if the room is full. */
  addPlayer(player: Player): boolean {
    if (this.players.length >= MAX_PLAYERS_PER_ROOM) {
      return false;
    }
    this.players.push(player);
    if (!this.sessionScores[player.id]) {
      this.sessionScores[player.id] = { wins: 0, losses: 0, draws: 0 };
    }
    return true;
  }

  /** Remove a player by their ID. Returns the removed player or null. */
  removePlayer(playerId: string): Player | null {
    const index = this.players.findIndex((p) => p.id === playerId);
    if (index === -1) return null;
    const [removed] = this.players.splice(index, 1);
    return removed;
  }

  /** Find a player by their ID */
  getPlayer(playerId: string): Player | null {
    return this.players.find((p) => p.id === playerId) ?? null;
  }

  /** Find a player by their Socket.IO socket ID */
  getPlayerBySocketId(socketId: string): Player | null {
    return this.players.find((p) => p.socketId === socketId) ?? null;
  }

  /** Check if the room is full (2 players) */
  isFull(): boolean {
    return this.players.length >= MAX_PLAYERS_PER_ROOM;
  }

  /** Check if the room is empty (0 players) */
  isEmpty(): boolean {
    return this.players.length === 0;
  }

  /** Check if all players in the room are ready */
  allPlayersReady(): boolean {
    return (
      this.players.length === MAX_PLAYERS_PER_ROOM &&
      this.players.every((p) => p.isReady)
    );
  }

  /** Check if a player is the host */
  isHost(playerId: string): boolean {
    return this.players.length > 0 && this.players[0].id === playerId;
  }

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  /** Update game settings. Only allowed in 'waiting' status and by the host. */
  updateSettings(settings: Partial<GameSettings>): boolean {
    if (this.status !== 'waiting') return false;

    if (settings.numberLength !== undefined) {
      if (![3, 4, 5].includes(settings.numberLength)) return false;
      this.settings.numberLength = settings.numberLength;
    }
    if (settings.allowRepeats !== undefined) {
      this.settings.allowRepeats = settings.allowRepeats;
    }

    // Reset ready states when settings change so players re-confirm
    this.players.forEach((p) => (p.isReady = false));
    return true;
  }

  // ---------------------------------------------------------------------------
  // Serialization
  // ---------------------------------------------------------------------------

  /** Convert to the RoomInfo shape sent to clients */
  toRoomInfo(): RoomInfo {
    return {
      code: this.code,
      status: this.status,
      settings: { ...this.settings },
      players: this.players.map((p) => p.toLobbyPlayer()),
      hostIndex: this.hostIndex,
      sessionScores: this.sessionScores,
    };
  }
}
