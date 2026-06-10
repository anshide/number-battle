// ============================================================================
// client/src/pages/LobbyPage.tsx
// Room lobby showing:
//   - Room code (copyable)
//   - Game settings (host can edit)
//   - Player cards for both slots
//   - Ready toggle button
//   - Waiting/ready state transitions
//
// Once both players are ready, the server emits 'game:start-setup'
// and this page will navigate to the game (Phase 3).
// ============================================================================

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { PageContainer } from '../components/layout/PageContainer';
import { RoomCodeDisplay } from '../components/game/RoomCodeDisplay';
import { PlayerCard } from '../components/game/PlayerCard';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { useRoom } from '../hooks/useRoom';
import type { NumberLength } from '@number-battle/shared';

const NUMBER_LENGTH_OPTIONS: NumberLength[] = [3, 4, 5];

export function LobbyPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const {
    room,
    playerId,
    playerIndex,
    isSetupStarted,
    updateSettings,
    toggleReady,
    leaveRoom,
  } = useRoom();

  // If setup has started, navigate to the game page (Phase 3 will implement this)
  useEffect(() => {
    if (isSetupStarted && roomCode) {
      navigate(`/game/${roomCode}`);
    }
  }, [isSetupStarted, roomCode, navigate]);

  // Guard: no room data yet (e.g., direct URL navigation)
  if (!room || !roomCode) {
    return (
      <>
        <Header />
        <PageContainer className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="glass-card inner-glow p-8 flex flex-col items-center gap-4 max-w-sm w-full">
            <Spinner size="lg" />
            <p className="text-gray-400 text-sm">Loading room...</p>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </PageContainer>
      </>
    );
  }

  const isHost = playerIndex === 0;
  const isFull = room.players.length === 2;
  const currentPlayer = room.players.find((p) => p.playerId === playerId);
  const isReady = currentPlayer?.isReady ?? false;

  return (
    <>
      <Header roomCode={roomCode} onLeave={leaveRoom} />

      <PageContainer className="bg-grid">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          {/* Room Code Section */}
          <section className="flex justify-center animate-slide-up">
            <RoomCodeDisplay code={roomCode} />
          </section>

          {/* Game Settings Section */}
          <section className="glass-card inner-glow p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-base font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Game Settings
              {!isHost && (
                <span className="text-xs text-gray-500 font-normal ml-auto">
                  Only the host can change settings
                </span>
              )}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Number Length */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Number Length
                </label>
                <div className="flex gap-2">
                  {NUMBER_LENGTH_OPTIONS.map((len) => (
                    <button
                      key={len}
                      disabled={!isHost}
                      onClick={() => updateSettings({ numberLength: len })}
                      className={`
                        flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                        ${room.settings.numberLength === len
                          ? 'bg-accent-600/20 text-accent-400 border border-accent-500/30 shadow-md shadow-accent-500/10'
                          : 'bg-surface-800/60 text-gray-400 border border-surface-600/30 hover:border-surface-500/40'}
                        ${!isHost ? 'cursor-default' : 'cursor-pointer'}
                      `}
                    >
                      {len} digits
                    </button>
                  ))}
                </div>
              </div>

              {/* Digit Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Digit Mode
                </label>
                <div className="flex gap-2">
                  <button
                    disabled={!isHost}
                    onClick={() => updateSettings({ allowRepeats: false })}
                    className={`
                      flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${!room.settings.allowRepeats
                        ? 'bg-accent-600/20 text-accent-400 border border-accent-500/30 shadow-md shadow-accent-500/10'
                        : 'bg-surface-800/60 text-gray-400 border border-surface-600/30 hover:border-surface-500/40'}
                      ${!isHost ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    Unique
                  </button>
                  <button
                    disabled={!isHost}
                    onClick={() => updateSettings({ allowRepeats: true })}
                    className={`
                      flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${room.settings.allowRepeats
                        ? 'bg-accent-600/20 text-accent-400 border border-accent-500/30 shadow-md shadow-accent-500/10'
                        : 'bg-surface-800/60 text-gray-400 border border-surface-600/30 hover:border-surface-500/40'}
                      ${!isHost ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    Repeating
                  </button>
                </div>
              </div>
            </div>

            {/* Settings info */}
            <div className="mt-4 px-4 py-3 rounded-xl bg-surface-900/50 border border-surface-700/30">
              <p className="text-xs text-gray-500">
                {room.settings.allowRepeats
                  ? `Each player picks a ${room.settings.numberLength}-digit number. Digits may repeat.`
                  : `Each player picks a ${room.settings.numberLength}-digit number with all unique digits.`}
              </p>
            </div>
          </section>

          {/* Players Section */}
          <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-base font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Players
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PlayerCard
                player={room.players[0] ?? null}
                isCurrentPlayer={room.players[0]?.playerId === playerId}
                slotIndex={0}
              />
              <PlayerCard
                player={room.players[1] ?? null}
                isCurrentPlayer={room.players[1]?.playerId === playerId}
                slotIndex={1}
              />
            </div>
          </section>

          {/* Ready Button */}
          <section className="flex justify-center animate-slide-up" style={{ animationDelay: '300ms' }}>
            {isFull ? (
              <Button
                size="lg"
                variant={isReady ? 'secondary' : 'primary'}
                onClick={toggleReady}
                className={`min-w-[200px] ${isReady ? '' : 'animate-glow'}`}
                icon={
                  isReady ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )
                }
              >
                {isReady ? 'Cancel Ready' : "I'm Ready!"}
              </Button>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Spinner size="sm" />
                <p className="text-sm">Waiting for opponent to join...</p>
              </div>
            )}
          </section>
        </div>
      </PageContainer>
    </>
  );
}
