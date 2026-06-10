// ============================================================================
// client/src/components/layout/Header.tsx
// Top navigation bar with the game logo, connection status indicator,
// and optional room info.
// ============================================================================

import { useSocket } from '../../hooks/useSocket';

interface HeaderProps {
  /** Room code to display (optional) */
  roomCode?: string;
  /** Callback when user clicks the leave button */
  onLeave?: () => void;
}

export function Header({ roomCode, onLeave }: HeaderProps) {
  const { isConnected, isReconnecting } = useSocket();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-800/60 bg-surface-950/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-lg shadow-accent-600/20">
            <span className="text-white font-extrabold text-sm tracking-tight">NB</span>
          </div>
          <h1 className="text-lg font-bold text-gray-100 tracking-tight">
            Number<span className="gradient-text">Battle</span>
          </h1>
        </div>

        {/* Right side: room info + connection status */}
        <div className="flex items-center gap-4">
          {roomCode && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
              <span>Room:</span>
              <code className="font-mono font-semibold text-accent-400 tracking-wider">
                {roomCode}
              </code>
            </div>
          )}

          {/* Connection status dot */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                isReconnecting
                  ? 'bg-warning-400 animate-pulse'
                  : isConnected
                  ? 'bg-success-400'
                  : 'bg-danger-400'
              }`}
              title={
                isReconnecting
                  ? 'Reconnecting...'
                  : isConnected
                  ? 'Connected'
                  : 'Disconnected'
              }
            />
            <span className="text-xs text-gray-500 hidden sm:block">
              {isReconnecting ? 'Reconnecting...' : isConnected ? 'Live' : 'Offline'}
            </span>
          </div>

          {/* Leave button */}
          {onLeave && (
            <button
              onClick={onLeave}
              className="text-sm text-gray-400 hover:text-danger-400 transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-surface-800/60"
            >
              Leave
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
