// ============================================================================
// client/src/components/game/RoomCodeDisplay.tsx
// Stylised room code display with a copy-to-clipboard button.
// Used in the lobby so the host can share the code with a friend.
// ============================================================================

import { useState, useCallback } from 'react';

interface RoomCodeDisplayProps {
  code: string;
  className?: string;
}

export function RoomCodeDisplay({ code, className = '' }: RoomCodeDisplayProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, [code]);

  const handleShareInvite = async () => {
    const inviteText = `Join my Number Battle room!\n\nRoom Code: ${code}\n\nOpen the game and enter this room code.`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Number Battle Invite',
          text: inviteText,
        });
      } else {
        await navigator.clipboard.writeText(inviteText);
        setCopiedInvite(true);
        setTimeout(() => setCopiedInvite(false), 2000);
      }
    } catch (err) {
      console.error('Failed to share/copy invite: ', err);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <p className="text-sm text-gray-400 font-medium">Room Code</p>
      <div className="relative group">
        {/* Glow effect behind the code */}
        <div className="absolute inset-0 bg-accent-500/10 rounded-2xl blur-xl group-hover:bg-accent-500/20 transition-colors duration-500" />

        <div className="relative glass-card inner-glow p-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="font-mono text-3xl font-bold tracking-[0.3em] text-gray-100 ml-2">
              {code}
            </div>
            <button
              onClick={handleCopyCode}
              className={`p-2 rounded-xl transition-all duration-200 ${
                copiedCode 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-surface-700/50 text-gray-400 hover:bg-surface-600 hover:text-gray-200'
              }`}
              title="Copy code"
            >
              {copiedCode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
          
          <button
            onClick={handleShareInvite}
            className={`flex items-center justify-center gap-2 py-2 px-3 mt-1 rounded-lg text-sm font-medium transition-colors ${
              copiedInvite 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-accent-600/20 text-accent-400 hover:bg-accent-600/30'
            }`}
          >
            {copiedInvite ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Invite Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Invite
              </>
            )}
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500">Share this code with your opponent</p>
    </div>
  );
}
