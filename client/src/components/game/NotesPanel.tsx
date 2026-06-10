// ============================================================================
// client/src/components/game/NotesPanel.tsx
// A resizable/collapsible sidebar for private notes.
// ============================================================================

import { useRoom } from '../../hooks/useRoom';
import { useNotes } from '../../hooks/useNotes';
import { useState } from 'react';

export function NotesPanel() {
  const { room, playerId } = useRoom();
  const { notes, updateNotes } = useNotes(room?.code ?? null, playerId);
  const [isOpen, setIsOpen] = useState(false);

  if (!room || !playerId) return null;

  return (
    <>
      {/* Mobile Toggle Button (Visible only when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 lg:hidden z-40 bg-accent-600 text-white p-4 rounded-full shadow-lg shadow-accent-600/30"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}

      {/* The Panel */}
      <div
        className={`
          fixed lg:static inset-y-0 right-0 z-50 w-80 lg:w-64 flex flex-col bg-surface-900 border-l border-surface-600/50 shadow-2xl transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-surface-700/50 bg-surface-800">
          <h3 className="font-semibold text-gray-200 flex items-center gap-2">
            <svg className="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Private Notes
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-surface-700 text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-4 bg-surface-800/30">
          <textarea
            value={notes}
            onChange={(e) => updateNotes(e.target.value)}
            placeholder="Jot down deductions here...&#10;- 7 is present&#10;- Starts with 3"
            className="w-full h-full resize-none bg-transparent text-sm text-gray-300 placeholder-gray-600 focus:outline-none custom-scrollbar"
            spellCheck="false"
          />
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
