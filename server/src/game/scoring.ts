// ============================================================================
// server/src/game/scoring.ts
// Scoring algorithm.
// Calculates Correct Digits and Position Correct using frequency counting.
// ============================================================================

import type { GameSettings } from '@number-battle/shared';

export interface ScoreResult {
  correctDigits: number;
  positionCorrect: number;
}

export function calculateScore(guess: string, secret: string, settings: GameSettings): ScoreResult {
  let positionCorrect = 0;
  
  // Frequency maps for unmatched characters
  const secretFreq = new Map<string, number>();
  const guessFreq = new Map<string, number>();

  // Step 1: Count position-correct digits and populate frequency maps
  for (let i = 0; i < settings.numberLength; i++) {
    const gChar = guess[i];
    const sChar = secret[i];

    if (gChar === sChar) {
      positionCorrect++;
    } else {
      secretFreq.set(sChar, (secretFreq.get(sChar) || 0) + 1);
      guessFreq.set(gChar, (guessFreq.get(gChar) || 0) + 1);
    }
  }

  // Step 2: Count correct-but-misplaced digits
  let misplaced = 0;
  for (const [digit, gCount] of guessFreq.entries()) {
    if (secretFreq.has(digit)) {
      const sCount = secretFreq.get(digit)!;
      misplaced += Math.min(gCount, sCount);
    }
  }

  // Total correct digits = exact position matches + misplaced matches
  const correctDigits = positionCorrect + misplaced;

  return { correctDigits, positionCorrect };
}
