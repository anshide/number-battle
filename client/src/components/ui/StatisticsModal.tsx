// ============================================================================
// client/src/components/ui/StatisticsModal.tsx
// Modal displaying lifetime statistics.
// ============================================================================

import { useStatistics } from '../../hooks/useStatistics';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StatisticsModal({ isOpen, onClose }: StatisticsModalProps) {
  const { stats } = useStatistics();

  if (!isOpen) return null;

  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.wins / stats.gamesPlayed) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="glass-card inner-glow w-full max-w-sm p-6 animate-slide-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-surface-700/50 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Your Statistics
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-800/50 border border-surface-600/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-gray-100">{stats.gamesPlayed}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Played</div>
          </div>
          <div className="bg-surface-800/50 border border-surface-600/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-accent-400">{winRate}%</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Win Rate</div>
          </div>
          
          <div className="col-span-2 grid grid-cols-3 gap-2 mt-2">
            <div className="bg-surface-800/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-400">{stats.wins}</div>
              <div className="text-[10px] text-gray-500 uppercase">Wins</div>
            </div>
            <div className="bg-surface-800/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-red-400">{stats.losses}</div>
              <div className="text-[10px] text-gray-500 uppercase">Losses</div>
            </div>
            <div className="bg-surface-800/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-gray-400">{stats.draws}</div>
              <div className="text-[10px] text-gray-500 uppercase">Draws</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
