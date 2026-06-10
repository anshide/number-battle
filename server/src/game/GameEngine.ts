// ============================================================================
// server/src/game/GameEngine.ts
// Core orchestrator class for game logic.
// Manages the GameState, handles secret submissions, and processes guesses.
// ============================================================================

import type { GameSettings, GameState, GuessEntry, SanitizedGameState } from '@number-battle/shared';
import { Player } from '../models/Player.js';
import { TurnManager } from './turnManager.js';
import { validateNumber } from './validation.js';
import { calculateScore } from './scoring.js';

export class GameEngine {
  public state: GameState;
  private turnManager: TurnManager;

  constructor(settings: GameSettings, player1: Player, player2: Player) {
    this.state = {
      status: 'setup',
      settings: { ...settings },
      players: [
        {
          playerId: player1.id,
          playerName: player1.name,
          secretNumber: null,
          secretSubmitted: false,
          guesses: [],
          solvedInRound: null,
          isConnected: player1.isConnected,
        },
        {
          playerId: player2.id,
          playerName: player2.name,
          secretNumber: null,
          secretSubmitted: false,
          guesses: [],
          solvedInRound: null,
          isConnected: player2.isConnected,
        }
      ],
      currentTurnIndex: 0,
      currentRound: 1,
      pendingFinalGuess: false,
      winner: null,
      winReason: null,
      startedAt: Date.now(),
      finishedAt: null,
    };

    this.turnManager = new TurnManager(this.state);
  }

  /**
   * Submit a player's secret number during the setup phase.
   */
  setSecretNumber(playerId: string, secret: string): { success: boolean; error?: string; ready: boolean; gameStarted: boolean } {
    if (this.state.status !== 'setup') {
      return { success: false, error: 'Not in setup phase.', ready: false, gameStarted: false };
    }

    const player = this.state.players.find(p => p.playerId === playerId);
    if (!player) {
      return { success: false, error: 'Player not found.', ready: false, gameStarted: false };
    }

    if (player.secretSubmitted) {
      return { success: false, error: 'Secret number already submitted.', ready: false, gameStarted: false };
    }

    const validationError = validateNumber(secret, this.state.settings);
    if (validationError) {
      return { success: false, error: validationError, ready: false, gameStarted: false };
    }

    player.secretNumber = secret;
    player.secretSubmitted = true;

    const gameStarted = this.state.players.every(p => p.secretSubmitted);
    if (gameStarted) {
      this.state.status = 'playing';
    }

    return { success: true, ready: true, gameStarted };
  }

  /**
   * Process a guess from the current player.
   */
  makeGuess(playerId: string, guess: string): { success: boolean; error?: string; result?: GuessEntry; gameOver?: boolean } {
    if (this.state.status !== 'playing') {
      return { success: false, error: 'Game is not in progress.' };
    }

    const playerIndex = this.state.players.findIndex(p => p.playerId === playerId);
    if (playerIndex === -1) {
      return { success: false, error: 'Player not found.' };
    }

    if (this.state.currentTurnIndex !== playerIndex) {
      return { success: false, error: 'It is not your turn.' };
    }

    const validationError = validateNumber(guess, this.state.settings);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const player = this.state.players[playerIndex];
    const opponent = this.state.players[1 - playerIndex];

    if (!opponent.secretNumber) {
      return { success: false, error: 'Opponent secret number missing.' };
    }

    const score = calculateScore(guess, opponent.secretNumber, this.state.settings);

    const guessEntry: GuessEntry = {
      guess,
      correctDigits: score.correctDigits,
      positionCorrect: score.positionCorrect,
      round: this.state.currentRound,
      timestamp: Date.now(),
    };

    player.guesses.push(guessEntry);

    if (score.positionCorrect === this.state.settings.numberLength) {
      player.solvedInRound = this.state.currentRound;
    }

    const gameOver = this.turnManager.advanceTurn();

    return { success: true, result: guessEntry, gameOver };
  }

  /**
   * Returns a sanitized version of the game state for a specific player,
   * hiding the opponent's secret number.
   */
  getSanitizedState(forPlayerId: string): SanitizedGameState {
    return {
      ...this.state,
      players: [
        {
          ...this.state.players[0],
          secretNumber: this.state.players[0].playerId === forPlayerId || this.state.status === 'finished' 
            ? this.state.players[0].secretNumber 
            : null,
        },
        {
          ...this.state.players[1],
          secretNumber: this.state.players[1].playerId === forPlayerId || this.state.status === 'finished' 
            ? this.state.players[1].secretNumber 
            : null,
        }
      ]
    };
  }
}
