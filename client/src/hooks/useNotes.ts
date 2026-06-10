// ============================================================================
// client/src/hooks/useNotes.ts
// Custom hook to manage private notes for a specific room and player.
// Uses localStorage to persist notes across page refreshes.
// ============================================================================

import { useState, useEffect } from 'react';

export function useNotes(roomCode: string | null, playerId: string | null) {
  const key = `nb_notes_${roomCode}_${playerId}`;

  const [notes, setNotes] = useState<string>('');

  // Load from local storage when room/player changes
  useEffect(() => {
    if (roomCode && playerId) {
      const saved = localStorage.getItem(key);
      if (saved) {
        setNotes(saved);
      } else {
        setNotes('');
      }
    }
  }, [key, roomCode, playerId]);

  // Save to local storage on change
  const updateNotes = (newNotes: string) => {
    setNotes(newNotes);
    if (roomCode && playerId) {
      localStorage.setItem(key, newNotes);
    }
  };

  return { notes, updateNotes };
}
