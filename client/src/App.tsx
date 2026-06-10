// ============================================================================
// client/src/App.tsx
// Root component with routing and the SocketProvider + GameProvider.
// ============================================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { GameProvider } from './context/GameContext';
import { HomePage } from './pages/HomePage';
import { LobbyPage } from './pages/LobbyPage';
import { GamePage } from './pages/GamePage';

export default function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <GameProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lobby/:roomCode" element={<LobbyPage />} />
            <Route path="/game/:roomCode" element={<GamePage />} />
          </Routes>
        </GameProvider>
      </SocketProvider>
    </BrowserRouter>
  );
}
