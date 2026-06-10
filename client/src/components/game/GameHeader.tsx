// ============================================================================
// client/src/components/game/GameHeader.tsx
// Top bar during gameplay showing round, status, and turn indicator.
// ============================================================================

import { useRoom } from '../../hooks/useRoom';

export function GameHeader() {
  const { gameState, playerId, sessionScores } = useRoom();

  if (!gameState || !playerId) return null;

  const currentTurnPlayer = gameState.players[gameState.currentTurnIndex];
  const opponentPlayer = gameState.players.find(p => p.playerId !== playerId);
  const isMyTurn = currentTurnPlayer.playerId === playerId;
  const isGameOver = gameState.status === 'finished';

  const myScore = sessionScores?.[playerId!]?.wins || 0;
  const oppScore = sessionScores?.[opponentPlayer!.playerId]?.wins || 0;
  const showScore = (myScore + oppScore + (sessionScores?.[playerId!]?.draws || 0)) > 0;

  return (
    <div className="glass-card flex items-center justify-between p-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center border border-surface-600/50">
          <div className="text-center">
            <div className="text-[10px] uppercase text-gray-500 font-bold leading-none mb-1">Round</div>
            <div className="text-xl font-bold text-gray-100 leading-none">{gameState.currentRound}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center flex-1">
        {isGameOver ? (
          <div className="px-4 py-2 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30 font-semibold tracking-wide">
            Game Over
          </div>
        ) : (
          <div className={`px-4 py-2 rounded-full font-medium transition-colors ${isMyTurn ? 'bg-accent-600 text-white shadow-lg shadow-accent-600/30' : 'bg-surface-800 text-gray-400 border border-surface-600/50'}`}>
            {isMyTurn ? "Your Turn" : "Opponent's Turn"}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {showScore ? (
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Session Score</div>
            <div className="text-sm font-bold flex gap-2 items-center justify-end">
              <span className="text-accent-400">{myScore}</span>
              <span className="text-gray-600">-</span>
              <span className="text-purple-400">{oppScore}</span>
            </div>
          </div>
        ) : (
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Target</div>
            <div className="text-sm font-bold text-gray-300">
              {gameState.settings.numberLength} Digits
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
