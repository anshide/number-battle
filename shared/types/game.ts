// ============================================================================
// shared/types/game.ts
// Core game types shared between client and server.
// These are the single source of truth — never duplicate these definitions.
// ============================================================================

/** Allowed secret number lengths */
export type NumberLength = 3 | 4 | 5;

/** Game settings chosen in the lobby before play begins */
export interface GameSettings {
  /** How many digits the secret number has (3, 4, or 5) */
  numberLength: NumberLength;
  /** If true, digits may repeat; if false, all digits must be unique */
  allowRepeats: boolean;
}

/** Default settings used when a room is first created */
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  numberLength: 4,
  allowRepeats: false,
};

/** Lifecycle phases of a room */
export type RoomStatus = 'waiting' | 'setup' | 'playing' | 'finished';

/** A single guess and its result, stored in guess history */
export interface GuessEntry {
  guess: string;
  correctDigits: number;
  positionCorrect: number;
  round: number;
  timestamp: number;
}

/** Per-player state within a game */
export interface PlayerGameState {
  playerId: string;
  playerName: string;
  secretNumber: string | null;
  secretSubmitted: boolean;
  guesses: GuessEntry[];
  solvedInRound: number | null;
  isConnected: boolean;
}

/** Full game state (server-side, contains secrets) */
export interface GameState {
  status: 'setup' | 'playing' | 'finished';
  settings: GameSettings;
  players: [PlayerGameState, PlayerGameState];
  currentTurnIndex: 0 | 1;
  currentRound: number;
  pendingFinalGuess: boolean;
  winner: string | null;
  winReason: string | null;
  startedAt: number;
  finishedAt: number | null;
}

/** Sanitized game state sent to a specific player (no opponent secrets) */
export interface SanitizedGameState {
  status: 'setup' | 'playing' | 'finished';
  settings: GameSettings;
  players: [SanitizedPlayerState, SanitizedPlayerState];
  currentTurnIndex: 0 | 1;
  currentRound: number;
  pendingFinalGuess: boolean;
  winner: string | null;
  winReason: string | null;
  startedAt: number;
  finishedAt: number | null;
}

/** Player state with the secret conditionally hidden */
export interface SanitizedPlayerState {
  playerId: string;
  playerName: string;
  secretNumber: string | null; // null for opponent
  secretSubmitted: boolean;
  guesses: GuessEntry[];
  solvedInRound: number | null;
  isConnected: boolean;
}

/** Player info as seen in the lobby (before game starts) */
export interface LobbyPlayer {
  playerId: string;
  playerName: string;
  playerIndex: number;
  isReady: boolean;
  isConnected: boolean;
}

/** Room info sent to clients */
export interface RoomInfo {
  code: string;
  status: RoomStatus;
  settings: GameSettings;
  players: LobbyPlayer[];
  hostIndex: number;
  sessionScores: Record<string, { wins: number; losses: number; draws: number }>;
}
