// ============================================================================
// server/src/game/validation.ts
// Number validation logic.
// Validates both secret numbers and guesses based on game settings.
// ============================================================================

import type { GameSettings } from '@number-battle/shared';

export function validateNumber(num: string, settings: GameSettings): string | null {
  if (!num) {
    return 'Number cannot be empty.';
  }

  // 1. Validate length
  if (num.length !== settings.numberLength) {
    return `Number must be exactly ${settings.numberLength} digits.`;
  }

  // 2. Validate digits only
  if (!/^[0-9]+$/.test(num)) {
    return 'Number must contain only digits.';
  }

  // 3. No leading zero
  if (num[0] === '0') {
    return 'Number cannot start with zero.';
  }

  // 4. Unique digits (if repeats are not allowed)
  if (!settings.allowRepeats) {
    const uniqueDigits = new Set(num.split(''));
    if (uniqueDigits.size !== num.length) {
      return 'Number must contain all unique digits.';
    }
  }

  return null; // Null means validation passed
}
