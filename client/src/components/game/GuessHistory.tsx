// ============================================================================
// client/src/components/game/GuessHistory.tsx
// Table displaying all previous guesses and their scores for a specific player.
// ============================================================================

import type { PlayerGameState } from '@number-battle/shared';

interface GuessHistoryProps {
  playerState: PlayerGameState;
  isOpponent: boolean;
  isWinner?: boolean;
}

export function GuessHistory({ playerState, isOpponent, isWinner }: GuessHistoryProps) {
  // Sort guesses by round, newest first
  const sortedGuesses = [...playerState.guesses].sort((a, b) => b.round - a.round);

  return (
    <div className="flex flex-col h-full bg-surface-800/40 rounded-2xl border border-surface-600/30 overflow-hidden">
      {/* Header */}
      <div className={`p-4 border-b border-surface-600/50 flex items-center justify-between ${isWinner ? 'bg-accent-600/20' : 'bg-surface-800/80'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${isOpponent ? 'bg-purple-600' : 'bg-accent-600'}`}>
            {playerState.playerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-100">
              {playerState.playerName}
            </h3>
            {isWinner && <span className="text-xs text-accent-400 font-semibold uppercase tracking-wider">Winner</span>}
          </div>
        </div>

        {/* Revealed secret number at game over */}
        {playerState.secretNumber ? (
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 uppercase">Secret</span>
            <span className="font-mono text-sm tracking-widest text-gray-200">
              {playerState.secretNumber}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 uppercase">Secret</span>
            <span className="font-mono text-sm tracking-widest text-gray-600">
              {isOpponent ? '????' : 'HIDDEN'}
            </span>
          </div>
        )}
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {sortedGuesses.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            No guesses yet
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedGuesses.map((g) => {
              const isWinGuess = g.positionCorrect === g.guess.length; // Approximate, but good for UI
              
              return (
                <div 
                  key={g.round} 
                  className={`flex items-center justify-between p-3 rounded-xl border ${isWinGuess ? 'bg-accent-500/10 border-accent-500/30' : 'bg-surface-900/50 border-surface-700/50'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-600 w-6">R{g.round}</span>
                    <span className={`font-mono text-lg tracking-widest ${isWinGuess ? 'text-accent-400' : 'text-gray-200'}`}>
                      {g.guess}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-gray-500 uppercase">Digit</span>
                      <span className="font-semibold text-gray-300">{g.correctDigits}</span>
                    </div>
                    <div className="w-px h-6 bg-surface-600/50"></div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-gray-500 uppercase">Pos</span>
                      <span className={`font-bold ${g.positionCorrect > 0 ? 'text-accent-400' : 'text-gray-300'}`}>
                        {g.positionCorrect}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
