// ============================================================================
// client/src/main.tsx
// Application entry point — renders the App into the DOM root.
// ============================================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
