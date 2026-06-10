// ============================================================================
// server/src/game/turnManager.ts
// TurnManager class.
// Handles turn alternation, round tracking, and final-guess logic.
// ============================================================================

import type { GameState } from '@number-battle/shared';

export class TurnManager {
  private state: GameState;

  constructor(gameState: GameState) {
    this.state = gameState;
  }

  /**
   * Advances the turn. Checks if a round is complete and determines if the game should end.
   * Modifies the GameState directly.
   * @returns true if the game is over, false otherwise.
   */
  advanceTurn(): boolean {
    const p1 = this.state.players[0];
    const p2 = this.state.players[1];

    if (this.state.currentTurnIndex === 0) {
      // Player 1 just guessed. It is always Player 2's turn next in the round.
      this.state.currentTurnIndex = 1;
      
      // If Player 1 solved, Player 2 is taking their final guess for this round.
      if (p1.solvedInRound !== null) {
        this.state.pendingFinalGuess = true;
      }
      
      return false; // Game is not over yet, Player 2 must guess.
    } else {
      // Player 2 just guessed. The round is now complete.
      
      // Check win conditions
      if (this.state.pendingFinalGuess || p2.solvedInRound !== null) {
        this.resolveWin();
        return true; // Game is over
      } else {
        // Neither solved, or only one solved but it hasn't resolved (which shouldn't happen here)
        // Advance to next round
        this.state.currentRound++;
        this.state.currentTurnIndex = 0;
        this.state.pendingFinalGuess = false;
        return false;
      }
    }
  }

  private resolveWin(): void {
    const p1 = this.state.players[0];
    const p2 = this.state.players[1];

    if (p1.solvedInRound !== null && p2.solvedInRound !== null) {
      if (p1.solvedInRound === p2.solvedInRound) {
        this.state.winner = 'draw';
        this.state.winReason = 'both_solved_same_round';
      } else if (p1.solvedInRound < p2.solvedInRound) {
        this.state.winner = p1.playerId;
        this.state.winReason = 'solved_earlier_round';
      } else {
        this.state.winner = p2.playerId;
        this.state.winReason = 'solved_earlier_round';
      }
    } else if (p1.solvedInRound !== null) {
      // Player 1 solved, Player 2 did not (Player 2 already had their final guess)
      this.state.winner = p1.playerId;
      this.state.winReason = 'solved';
    } else if (p2.solvedInRound !== null) {
      // Player 2 solved, Player 1 did not. Wait, since P2 guesses last in the round,
      // P1 already missed this round. So P2 wins.
      this.state.winner = p2.playerId;
      this.state.winReason = 'solved';
    }

    this.state.status = 'finished';
    this.state.finishedAt = Date.now();
  }
}
