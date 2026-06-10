// ============================================================================
// client/src/components/ui/Toast.tsx
// Toast notification component for transient messages.
// Auto-dismisses after a configurable duration.
// ============================================================================

import { useEffect, useState, useCallback } from 'react';

export type ToastType = 'info' | 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
}

const typeStyles: Record<ToastType, string> = {
  info: 'border-accent-500/30 bg-accent-950/80 text-accent-300',
  success: 'border-success-500/30 bg-green-950/80 text-success-400',
  error: 'border-danger-500/30 bg-red-950/80 text-danger-400',
  warning: 'border-warning-500/30 bg-yellow-950/80 text-warning-400',
};

const typeIcons: Record<ToastType, string> = {
  info: 'ℹ️',
  success: '✅',
  error: '❌',
  warning: '⚠️',
};

export function Toast({ message, type = 'info', duration = 4000, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const dismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(onDismiss, 200); // Wait for exit animation
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [dismiss, duration]);

  return (
    <div
      role="alert"
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md
        shadow-xl shadow-black/20
        transition-all duration-200
        ${typeStyles[type]}
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0 animate-slide-down'}
      `}
    >
      <span className="text-base">{typeIcons[type]}</span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={dismiss}
        className="text-gray-400 hover:text-gray-200 transition-colors p-1"
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ============================================================================
// Toast Container — renders a stack of toasts in a fixed position
// ============================================================================

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            onDismiss={() => onDismiss(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
