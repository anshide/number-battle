// ============================================================================
// client/src/components/game/PlayerCard.tsx
// Card showing a player's name, role (host/guest), and ready status.
// Used in the lobby to display both players.
// ============================================================================

import type { LobbyPlayer } from '@number-battle/shared';

interface PlayerCardProps {
  player: LobbyPlayer | null;
  isCurrentPlayer: boolean;
  slotIndex: number; // 0 or 1
}

export function PlayerCard({ player, isCurrentPlayer, slotIndex }: PlayerCardProps) {
  if (!player) {
    // Empty slot — waiting for a player to join
    return (
      <div className="glass-card inner-glow p-6 flex flex-col items-center justify-center min-h-[160px] border-dashed border-surface-600/40">
        <div className="w-14 h-14 rounded-2xl bg-surface-700/40 border border-surface-600/30 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 font-medium">Waiting for player...</p>
        <div className="mt-2 flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-pulse" style={{ animationDelay: '200ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    );
  }

  const roleLabel = slotIndex === 0 ? 'Host' : 'Guest';
  const roleColor = slotIndex === 0 ? 'text-accent-400' : 'text-purple-400';

  return (
    <div
      className={`
        glass-card inner-glow p-6 flex flex-col items-center min-h-[160px]
        transition-all duration-300
        ${isCurrentPlayer ? 'ring-1 ring-accent-500/30 shadow-lg shadow-accent-500/5' : ''}
        ${player.isReady ? 'border-success-500/30' : ''}
      `}
    >
      {/* Avatar circle */}
      <div
        className={`
          w-14 h-14 rounded-2xl flex items-center justify-center mb-3
          font-bold text-xl transition-all duration-300
          ${player.isReady
            ? 'bg-gradient-to-br from-success-500/20 to-success-600/20 text-success-400 border border-success-500/30'
            : 'bg-gradient-to-br from-surface-600/40 to-surface-700/40 text-gray-300 border border-surface-500/30'}
        `}
      >
        {player.playerName.charAt(0).toUpperCase()}
      </div>

      {/* Player name */}
      <h3 className="text-base font-semibold text-gray-100 mb-1 truncate max-w-full">
        {player.playerName}
        {isCurrentPlayer && (
          <span className="text-xs text-gray-500 font-normal ml-1.5">(you)</span>
        )}
      </h3>

      {/* Role badge */}
      <span className={`text-xs font-medium ${roleColor} mb-3`}>
        {roleLabel}
      </span>

      {/* Ready status */}
      <div
        className={`
          px-3 py-1 rounded-full text-xs font-medium transition-all duration-300
          ${player.isReady
            ? 'bg-success-500/15 text-success-400 border border-success-500/20'
            : 'bg-surface-700/40 text-gray-500 border border-surface-600/30'}
        `}
      >
        {player.isReady ? '✓ Ready' : 'Not Ready'}
      </div>

      {/* Connection indicator */}
      {!player.isConnected && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-warning-400">
          <div className="w-1.5 h-1.5 rounded-full bg-warning-400 animate-pulse" />
          Reconnecting...
        </div>
      )}
    </div>
  );
}
