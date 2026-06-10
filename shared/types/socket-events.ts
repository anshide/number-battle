// ============================================================================
// shared/types/socket-events.ts
// Strongly-typed Socket.IO event names and payloads.
// Used by both client and server to ensure type-safe event handling.
// ============================================================================

import type { GameSettings, LobbyPlayer, RoomInfo } from './game';

// ---------------------------------------------------------------------------
// Client → Server event payloads
// ---------------------------------------------------------------------------

export interface ClientToServerEvents {
  /** Host creates a new room */
  'room:create': (payload: { playerName: string }) => void;

  /** Guest joins an existing room */
  'room:join': (payload: { roomCode: string; playerName: string }) => void;

  /** Host updates game settings (lobby only) */
  'room:settings': (payload: { numberLength: 3 | 4 | 5; allowRepeats: boolean }) => void;

  /** Player toggles ready state in the lobby */
  'room:ready': () => void;

  /** Player voluntarily leaves the room */
  'room:leave': () => void;

  /** Player submits their secret number */
  'game:set-secret': (payload: { secret: string }) => void;

  /** Player submits a guess */
  'game:guess': (payload: { guess: string }) => void;

  /** Request full state sync */
  'game:request-sync': () => void;

  /** Player votes to rematch */
  'game:rematch-request': () => void;
}

// ---------------------------------------------------------------------------
// Server → Client event payloads
// ---------------------------------------------------------------------------

export interface ServerToClientEvents {
  /** Confirms room was created; includes the assigned playerId and room info */
  'room:created': (payload: {
    roomCode: string;
    playerId: string;
    playerIndex: number;
    room: RoomInfo;
  }) => void;

  /** Confirms the joining player was accepted into the room */
  'room:joined': (payload: {
    roomCode: string;
    playerId: string;
    playerIndex: number;
    room: RoomInfo;
  }) => void;

  /** Sent to existing player(s) when a new player joins their room */
  'room:player-joined': (payload: {
    player: LobbyPlayer;
    room: RoomInfo;
  }) => void;

  /** Broadcast when settings are changed by the host */
  'room:settings-updated': (payload: {
    settings: GameSettings;
  }) => void;

  /** Broadcast when a player toggles their ready state */
  'room:player-ready': (payload: {
    playerIndex: number;
    isReady: boolean;
  }) => void;

  /** A player left the room */
  'room:player-left': (payload: {
    playerIndex: number;
    playerName: string;
    room: RoomInfo;
  }) => void;

  /** Room-level error (invalid code, room full, etc.) */
  'room:error': (payload: {
    message: string;
    code: string;
  }) => void;

  /** Both players are ready — transition to secret number setup */
  'game:start-setup': (payload: {
    settings: GameSettings;
  }) => void;

  /** Opponent has submitted their secret number */
  'game:opponent-ready': () => void;

  /** Both secrets submitted — game begins */
  'game:started': (payload: {
    currentTurn: string;
    round: number;
  }) => void;

  /** Result of a guess (sent to the guesser) */
  'game:guess-result': (payload: {
    guess: string;
    correctDigits: number;
    positionCorrect: number;
    round: number;
  }) => void;

  /** Opponent made a guess (sent to the non-guesser) */
  'game:opponent-guessed': (payload: {
    correctDigits: number;
    positionCorrect: number;
    round: number;
  }) => void;

  /** Turn has changed to the next player */
  'game:turn-change': (payload: {
    currentTurn: string;
    round: number;
  }) => void;

  /** The game has finished */
  'game:over': (payload: {
    winner: string | 'draw' | null;
    reason: string | null;
    finalState: any; // Using any here to prevent deep nesting issues, parsed as SanitizedGameState
    sessionScores: Record<string, { wins: number; losses: number; draws: number }>;
  }) => void;

  /** Full state sync sent to a specific player */
  'game:state-sync': (payload: {
    state: any; // SanitizedGameState
  }) => void;

  /** Opponent requested a rematch */
  'game:rematch-request': () => void;

  /** Both players accepted rematch, resetting game */
  'game:rematch-start': () => void;
}

// ---------------------------------------------------------------------------
// Inter-server events (for Socket.IO adapter, unused in single-server mode)
// ---------------------------------------------------------------------------

export interface InterServerEvents {
  ping: () => void;
}

// ---------------------------------------------------------------------------
// Socket data attached to each connection
// ---------------------------------------------------------------------------

export interface SocketData {
  playerId: string;
  playerName: string;
  roomCode: string | null;
}
