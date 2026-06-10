// ============================================================================
// client/src/components/layout/PageContainer.tsx
// Consistent page layout wrapper with max-width, padding, and fade-in.
// ============================================================================

import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <main
      className={`
        max-w-5xl mx-auto px-4 py-8
        min-h-[calc(100vh-4rem)]
        animate-fade-in
        ${className}
      `.trim()}
    >
      {children}
    </main>
  );
}
