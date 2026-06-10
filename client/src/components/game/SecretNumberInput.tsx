// ============================================================================
// client/src/components/game/SecretNumberInput.tsx
// Setup phase component where players enter their secret number.
// ============================================================================

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useRoom } from '../../hooks/useRoom';

export function SecretNumberInput() {
  const { room, gameState, playerId, submitSecret, error } = useRoom();
  const [secret, setSecret] = useState('');

  if (!room || !gameState || !playerId) return null;

  const currentPlayer = gameState.players.find(p => p.playerId === playerId);
  if (!currentPlayer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (secret.length === room.settings.numberLength) {
      submitSecret(secret);
    }
  };

  const isSubmitted = currentPlayer.secretSubmitted;

  return (
    <div className="glass-card inner-glow p-8 max-w-sm w-full mx-auto text-center animate-slide-up">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-500/20 to-accent-600/20 flex items-center justify-center border border-accent-500/20 shadow-lg shadow-accent-500/10">
        <svg className="w-8 h-8 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-gray-100 mb-2">Set Your Secret</h2>
      <p className="text-gray-400 text-sm mb-6">
        Choose a {room.settings.numberLength}-digit number.
        {!room.settings.allowRepeats && ' Digits must be unique.'}
      </p>

      {isSubmitted ? (
        <div className="bg-surface-800/80 rounded-xl p-4 border border-surface-600/50">
          <p className="text-accent-400 font-medium flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Secret Locked
          </p>
          <p className="text-xs text-gray-500 mt-2">Waiting for opponent...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            placeholder={'0'.repeat(room.settings.numberLength)}
            value={secret}
            onChange={(e) => setSecret(e.target.value.replace(/\D/g, ''))}
            maxLength={room.settings.numberLength}
            className="font-mono tracking-[1em] text-center text-2xl py-4 bg-surface-900/50"
            error={error || undefined}
            autoFocus
          />
          <Button 
            type="submit" 
            disabled={secret.length !== room.settings.numberLength}
            className="w-full"
            size="lg"
          >
            Lock Secret
          </Button>
        </form>
      )}
    </div>
  );
}
