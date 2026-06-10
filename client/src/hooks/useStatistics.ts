// ============================================================================
// client/src/hooks/useStatistics.ts
// Hook for managing local lifetime statistics.
// ============================================================================

import { useState, useEffect } from 'react';

export interface LocalStatistics {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

const STATS_KEY = 'nb_stats';

const DEFAULT_STATS: LocalStatistics = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
};

export function useStatistics() {
  const [stats, setStats] = useState<LocalStatistics>(DEFAULT_STATS);

  useEffect(() => {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch (e) {
        setStats(DEFAULT_STATS);
      }
    }
  }, []);

  const addResult = (result: 'win' | 'loss' | 'draw') => {
    setStats((prev) => {
      const next = { ...prev, gamesPlayed: prev.gamesPlayed + 1 };
      if (result === 'win') next.wins++;
      if (result === 'loss') next.losses++;
      if (result === 'draw') next.draws++;

      localStorage.setItem(STATS_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { stats, addResult };
}
