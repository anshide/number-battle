// ============================================================================
// client/src/pages/GamePage.tsx
// The main game container. Switches between:
//   1. Setup Phase (entering secret number)
//   2. Playing Phase (guessing, histories)
//   3. Finished Phase (winner screen, reveal)
// ============================================================================

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { PageContainer } from '../components/layout/PageContainer';
import { SecretNumberInput } from '../components/game/SecretNumberInput';
import { GuessInput } from '../components/game/GuessInput';
import { GuessHistory } from '../components/game/GuessHistory';
import { GameHeader } from '../components/game/GameHeader';
import { NotesPanel } from '../components/game/NotesPanel';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { useRoom } from '../hooks/useRoom';
import { useStatistics } from '../hooks/useStatistics';

export function GamePage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { room, gameState, playerId, leaveRoom, requestRematch, rematchRequested } = useRoom();
  const { addResult } = useStatistics();
  const [hasRequestedRematch, setHasRequestedRematch] = useState(false);
  const recordedFinishedAt = useRef<number | null>(null);

  useEffect(() => {
    // If we land here but have no game state or room, bounce back to home
    // (This prevents crashes on raw refresh if session storage wasn't perfectly hydrated)
    if (!room || !playerId) {
      navigate('/');
    }
  }, [room, playerId, navigate]);

  useEffect(() => {
    // Record statistics exactly once per finished game
    if (gameState?.status === 'finished' && gameState.finishedAt && gameState.finishedAt !== recordedFinishedAt.current) {
      recordedFinishedAt.current = gameState.finishedAt;
      
      if (gameState.winner === 'draw') {
        addResult('draw');
      } else if (gameState.winner === playerId) {
        addResult('win');
      } else {
        addResult('loss');
      }
    }

    // Reset local rematch state if the game goes back to setup
    if (gameState?.status === 'setup') {
      setHasRequestedRematch(false);
    }
  }, [gameState?.status, gameState?.finishedAt, gameState?.winner, playerId, addResult]);

  if (!room || !gameState || !playerId) {
    return (
      <>
        <Header />
        <PageContainer className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-gray-400">Loading game state...</p>
          </div>
        </PageContainer>
      </>
    );
  }

  const isSetup = gameState.status === 'setup';
  const isFinished = gameState.status === 'finished';
  
  const me = gameState.players.find(p => p.playerId === playerId)!;
  const opponent = gameState.players.find(p => p.playerId !== playerId)!;

  const getWinnerMessage = () => {
    if (!isFinished) return null;
    if (gameState.winner === 'draw') return "It's a Draw!";
    if (gameState.winner === playerId) return 'You Win! 🎉';
    return 'Opponent Wins!';
  };

  return (
    <div className="flex h-screen bg-grid overflow-hidden">
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <Header roomCode={roomCode} onLeave={leaveRoom} />

        <PageContainer className="pb-8 flex-1">
          <div className="max-w-4xl mx-auto flex flex-col h-full gap-6">
          
          {/* Header area (Round / Turn info) */}
          {!isSetup && <GameHeader />}

          {/* SETUP PHASE */}
          {isSetup && (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
              <SecretNumberInput />
            </div>
          )}

          {/* PLAYING / FINISHED PHASE */}
          {!isSetup && (
            <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[500px]">
              
              {/* Left Column: My Board */}
              <div className="flex-1 flex flex-col gap-4 animate-slide-right">
                <GuessHistory 
                  playerState={me} 
                  isOpponent={false} 
                  isWinner={isFinished && gameState.winner === playerId}
                />
                
                {/* Guess Input or Game Over Message */}
                {!isFinished ? (
                  <GuessInput />
                ) : (
                  <div className={`glass-card p-6 text-center ${gameState.winner === playerId ? 'inner-glow border-accent-500/50' : ''}`}>
                    <h2 className="text-2xl font-bold text-gray-100 mb-2">
                      {getWinnerMessage()}
                    </h2>
                    <p className="text-sm text-gray-400 mb-6">
                      {gameState.winReason === 'both_solved_same_round' ? 'Both players solved it in the same round.' : 
                       gameState.winReason === 'solved_earlier_round' ? 'Solved in an earlier round.' :
                       'Solved successfully.'}
                    </p>

                    {rematchRequested && !hasRequestedRematch && (
                      <div className="mb-6 p-4 rounded-xl bg-accent-500/20 border border-accent-500/30">
                        <p className="text-accent-400 font-semibold mb-3">Opponent wants a rematch!</p>
                        <Button 
                          onClick={() => { setHasRequestedRematch(true); requestRematch(); }} 
                          className="w-full"
                        >
                          Accept Rematch
                        </Button>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      {!rematchRequested && (
                        <Button 
                          onClick={() => { setHasRequestedRematch(true); requestRematch(); }} 
                          disabled={hasRequestedRematch}
                          className="w-full"
                        >
                          {hasRequestedRematch ? 'Waiting for opponent...' : 'Rematch'}
                        </Button>
                      )}
                      <Button onClick={leaveRoom} variant="secondary" className="w-full">
                        Leave Room
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Middle Divider (Desktop only) */}
              <div className="hidden lg:flex flex-col items-center justify-center w-8">
                <div className="w-px h-full bg-gradient-to-b from-transparent via-surface-600 to-transparent"></div>
                <div className="my-4 text-xs font-bold text-surface-500 uppercase tracking-widest bg-[#0A0A0B] py-2 px-1 rounded">
                  VS
                </div>
                <div className="w-px h-full bg-gradient-to-b from-transparent via-surface-600 to-transparent"></div>
              </div>

              {/* Right Column: Opponent Board */}
              <div className="flex-1 flex flex-col gap-4 animate-slide-left">
                <GuessHistory 
                  playerState={opponent} 
                  isOpponent={true} 
                  isWinner={isFinished && gameState.winner === opponent.playerId}
                />
              </div>

            </div>
          )}

        </div>
      </PageContainer>
      </div>

      <NotesPanel />
    </div>
  );
}
