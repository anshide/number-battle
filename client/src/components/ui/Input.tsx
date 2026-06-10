// ============================================================================
// client/src/components/ui/Input.tsx
// Styled text input with label, error state, and optional helper text.
// ============================================================================

import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 rounded-xl text-sm
            bg-surface-800/80 border border-surface-600/50
            text-gray-100 placeholder-gray-500
            transition-all duration-200
            hover:border-surface-500/60
            focus:border-accent-500/60 focus:ring-2 focus:ring-accent-500/20
            ${error ? 'border-danger-500/60 focus:border-danger-500/60 focus:ring-danger-500/20' : ''}
            ${className}
          `.trim()}
          {...props}
        />
        {error && (
          <p className="text-xs text-danger-400 mt-0.5">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-gray-500 mt-0.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
