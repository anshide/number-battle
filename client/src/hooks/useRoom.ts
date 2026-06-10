// ============================================================================
// client/src/hooks/useRoom.ts
// Custom hook encapsulating all room-related socket interactions by
// consuming the global GameContext.
// ============================================================================

import { useContext } from 'react';
import { GameContext, type GameContextValue } from '../context/GameContext';

export function useRoom(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useRoom must be used within a <GameProvider>');
  }
  return context;
}
