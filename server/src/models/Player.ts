// ============================================================================
// server/src/models/Player.ts
// Player model representing a connected player in the game.
// Each player gets a UUID on first connection, which persists across
// reconnections within the same session.
// ============================================================================

import type { LobbyPlayer } from '@number-battle/shared';

export interface PlayerData {
  /** Unique player identifier (UUID v4) */
  id: string;
  /** Display name chosen by the player */
  name: string;
  /** Index within the room (0 = host, 1 = guest) */
  index: number;
  /** Current Socket.IO socket ID (changes on reconnect) */
  socketId: string;
  /** Whether the player is currently connected */
  isConnected: boolean;
  /** Whether the player has marked themselves as ready in the lobby */
  isReady: boolean;
  /** Timestamp of last disconnection (for grace period tracking) */
  disconnectedAt: number | null;
}

export class Player {
  public readonly id: string;
  public name: string;
  public index: number;
  public socketId: string;
  public isConnected: boolean;
  public isReady: boolean;
  public disconnectedAt: number | null;

  constructor(data: PlayerData) {
    this.id = data.id;
    this.name = data.name;
    this.index = data.index;
    this.socketId = data.socketId;
    this.isConnected = data.isConnected;
    this.isReady = data.isReady;
    this.disconnectedAt = data.disconnectedAt;
  }

  /**
   * Convert to the LobbyPlayer shape sent to clients.
   * This is the public-facing representation — no socket IDs or internal state.
   */
  toLobbyPlayer(): LobbyPlayer {
    return {
      playerId: this.id,
      playerName: this.name,
      playerIndex: this.index,
      isReady: this.isReady,
      isConnected: this.isConnected,
    };
  }

  /** Mark the player as disconnected and record the timestamp */
  markDisconnected(): void {
    this.isConnected = false;
    this.disconnectedAt = Date.now();
  }

  /** Mark the player as reconnected with a new socket ID */
  markReconnected(newSocketId: string): void {
    this.isConnected = true;
    this.socketId = newSocketId;
    this.disconnectedAt = null;
  }
}
