// ============================================================================
// client/src/components/game/GuessInput.tsx
// Input form for submitting guesses during the playing phase.
// ============================================================================

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useRoom } from '../../hooks/useRoom';

export function GuessInput() {
  const { room, gameState, playerId, submitGuess, error } = useRoom();
  const [guess, setGuess] = useState('');

  if (!room || !gameState || !playerId) return null;

  const currentPlayer = gameState.players.find(p => p.playerId === playerId);
  const currentTurnPlayer = gameState.players[gameState.currentTurnIndex];
  
  const isMyTurn = currentTurnPlayer.playerId === playerId;
  const isGameOver = gameState.status === 'finished';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.length === room.settings.numberLength && isMyTurn) {
      submitGuess(guess);
      setGuess('');
    }
  };

  if (isGameOver) return null;

  return (
    <div className={`glass-card p-6 transition-all duration-300 ${isMyTurn ? 'inner-glow border-accent-500/30 shadow-lg shadow-accent-500/10' : 'opacity-70'}`}>
      <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
        {isMyTurn ? 'Your Turn to Guess' : "Waiting for opponent..."}
      </h3>
      
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          placeholder={'0'.repeat(room.settings.numberLength)}
          value={guess}
          onChange={(e) => setGuess(e.target.value.replace(/\D/g, ''))}
          maxLength={room.settings.numberLength}
          className="font-mono tracking-[0.5em] text-center text-xl flex-1 bg-surface-900/50"
          disabled={!isMyTurn}
          autoFocus={isMyTurn}
          error={error || undefined}
        />
        <Button 
          type="submit" 
          disabled={!isMyTurn || guess.length !== room.settings.numberLength}
          className={isMyTurn ? 'animate-glow' : ''}
        >
          Guess
        </Button>
      </form>
      
      {currentPlayer?.solvedInRound && gameState.pendingFinalGuess && (
        <p className="text-xs text-accent-400 mt-3 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          You solved it! Opponent has one final guess to tie.
        </p>
      )}
    </div>
  );
}
