// ============================================================================
// client/src/pages/HomePage.tsx
// Landing page with two options:
//   1. Create a new room (enter name → get room code)
//   2. Join an existing room (enter name + room code)
//
// Features a premium dark UI with gradient accents, floating particles,
// and smooth animations.
// ============================================================================

import { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatisticsModal } from '../components/ui/StatisticsModal';
import { useRoom } from '../hooks/useRoom';

type Mode = 'idle' | 'create' | 'join';

export function HomePage() {
  const { createRoom, joinRoom, isLoading, error, clearError } = useRoom();
  const [mode, setMode] = useState<Mode>('idle');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    createRoom(playerName.trim());
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !roomCode.trim()) return;
    joinRoom(roomCode.trim(), playerName.trim());
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    clearError();
  };

  return (
    <PageContainer className="flex flex-col items-center justify-center min-h-screen bg-grid">
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md">
        {/* Logo & Title */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-2xl shadow-accent-600/30 animate-glow">
            <span className="text-white font-extrabold text-2xl tracking-tight">NB</span>
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-100 tracking-tight">
              Number<span className="gradient-text">Battle</span>
            </h1>
            <p className="text-gray-400 mt-2 text-base">
              Challenge a friend to crack your secret number
            </p>
          </div>
        </div>

        {/* Action Card */}
        <div className="w-full glass-card inner-glow p-6 sm:p-8 animate-slide-up">
          {mode === 'idle' && (
            <div className="flex flex-col gap-4">
              <Button
                size="lg"
                className="w-full"
                onClick={() => switchMode('create')}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Create Room
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => switchMode('join')}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                }
              >
                Join Room
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-400 hover:text-gray-200 mt-2"
                onClick={() => setIsStatsOpen(true)}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              >
                Statistics
              </Button>
            </div>
          )}

          {mode === 'create' && (
            <form onSubmit={handleCreateRoom} className="flex flex-col gap-5">
              <div className="flex items-center gap-3 mb-1">
                <button
                  type="button"
                  onClick={() => switchMode('idle')}
                  className="p-1.5 rounded-lg hover:bg-surface-700/40 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-lg font-semibold text-gray-100">Create a Room</h2>
              </div>

              <Input
                label="Your Name"
                placeholder="Enter your display name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                autoFocus
                error={error || undefined}
              />

              <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
                Create & Get Code
              </Button>
            </form>
          )}

          {mode === 'join' && (
            <form onSubmit={handleJoinRoom} className="flex flex-col gap-5">
              <div className="flex items-center gap-3 mb-1">
                <button
                  type="button"
                  onClick={() => switchMode('idle')}
                  className="p-1.5 rounded-lg hover:bg-surface-700/40 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-lg font-semibold text-gray-100">Join a Room</h2>
              </div>

              <Input
                label="Your Name"
                placeholder="Enter your display name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                autoFocus
              />

              <Input
                label="Room Code"
                placeholder="Enter 6-character code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="font-mono tracking-[0.3em] text-center text-lg uppercase"
                error={error || undefined}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                disabled={roomCode.length < 6}
              >
                Join Room
              </Button>
            </form>
          )}
        </div>

        {/* Footer text */}
        <p className="text-xs text-gray-600 text-center mt-6">
          2 players • Turn-based • Real-time
        </p>
      </div>

      <StatisticsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
    </PageContainer>
  );
}
