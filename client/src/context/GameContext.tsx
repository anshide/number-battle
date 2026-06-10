// ============================================================================
// client/src/context/GameContext.tsx
// React context that manages the global room/game state.
// Listens to socket events and provides state and actions to all pages.
// ============================================================================

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import type { RoomInfo, GameSettings, LobbyPlayer, SanitizedGameState } from '@number-battle/shared';

export interface GameContextValue {
  room: RoomInfo | null;
  sessionScores: Record<string, { wins: number; losses: number; draws: number }> | null;
  gameState: SanitizedGameState | null;
  playerId: string | null;
  playerIndex: number | null;
  isLoading: boolean;
  error: string | null;
  isSetupStarted: boolean;
  rematchRequested: boolean;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  toggleReady: () => void;
  leaveRoom: () => void;
  clearError: () => void;
  submitSecret: (secret: string) => void;
  submitGuess: (guess: string) => void;
  requestStateSync: () => void;
  requestRematch: () => void;
}

export const GameContext = createContext<GameContextValue | null>(null);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [sessionScores, setSessionScores] = useState<Record<string, { wins: number; losses: number; draws: number }> | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSetupStarted, setIsSetupStarted] = useState(false);
  const [gameState, setGameState] = useState<SanitizedGameState | null>(null);
  const [rematchRequested, setRematchRequested] = useState(false);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  const createRoom = useCallback((playerName: string) => {
    setIsLoading(true);
    setError(null);
    socket.emit('room:create', { playerName });
  }, [socket]);

  const joinRoom = useCallback((roomCode: string, playerName: string) => {
    setIsLoading(true);
    setError(null);
    socket.emit('room:join', { roomCode, playerName });
  }, [socket]);

  const updateSettings = useCallback((settings: Partial<GameSettings>) => {
    socket.emit('room:settings', {
      numberLength: settings.numberLength ?? 4,
      allowRepeats: settings.allowRepeats ?? false,
    });
  }, [socket]);

  const toggleReady = useCallback(() => {
    socket.emit('room:ready');
  }, [socket]);

  const leaveRoom = useCallback(() => {
    socket.emit('room:leave');
    setRoom(null);
    setPlayerId(null);
    setPlayerIndex(null);
    setIsSetupStarted(false);
    navigate('/');
  }, [socket, navigate]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const submitSecret = useCallback((secret: string) => {
    socket.emit('game:set-secret', { secret });
  }, [socket]);

  const submitGuess = useCallback((guess: string) => {
    socket.emit('game:guess', { guess });
  }, [socket]);

  const requestStateSync = useCallback(() => {
    socket.emit('game:request-sync');
  }, [socket]);

  const requestRematch = useCallback(() => {
    socket.emit('game:rematch-request');
  }, [socket]);

  // -------------------------------------------------------------------------
  // Socket Event Listeners
  // -------------------------------------------------------------------------

  useEffect(() => {
    const handleCreated = (payload: { roomCode: string; playerId: string; playerIndex: number; room: RoomInfo }) => {
      setRoom(payload.room);
      setSessionScores(payload.room.sessionScores);
      setPlayerId(payload.playerId);
      setPlayerIndex(payload.playerIndex);
      setIsLoading(false);
      sessionStorage.setItem('nb_playerId', payload.playerId);
      sessionStorage.setItem('nb_roomCode', payload.roomCode);
      navigate(`/lobby/${payload.roomCode}`);
    };

    const handleJoined = (payload: { roomCode: string; playerId: string; playerIndex: number; room: RoomInfo }) => {
      setRoom(payload.room);
      setSessionScores(payload.room.sessionScores);
      setPlayerId(payload.playerId);
      setPlayerIndex(payload.playerIndex);
      setIsLoading(false);
      sessionStorage.setItem('nb_playerId', payload.playerId);
      sessionStorage.setItem('nb_roomCode', payload.roomCode);
      navigate(`/lobby/${payload.roomCode}`);
    };

    const handlePlayerJoined = (payload: { player: LobbyPlayer; room: RoomInfo }) => {
      setRoom(payload.room);
      setSessionScores(payload.room.sessionScores);
    };

    const handleSettingsUpdated = (payload: { settings: GameSettings }) => {
      setRoom((prev) => prev ? { ...prev, settings: payload.settings } : null);
    };

    const handlePlayerReady = (payload: { playerIndex: number; isReady: boolean }) => {
      setRoom((prev) => {
        if (!prev) return null;
        const updatedPlayers = prev.players.map((p) =>
          p.playerIndex === payload.playerIndex ? { ...p, isReady: payload.isReady } : p
        );
        return { ...prev, players: updatedPlayers };
      });
    };

    const handlePlayerLeft = (payload: { playerIndex: number; playerName: string; room: RoomInfo }) => {
      setRoom(payload.room);
      setIsSetupStarted(false);
      setRematchRequested(false);
    };

    const handleError = (payload: { message: string; code: string }) => {
      setError(payload.message);
      setIsLoading(false);
    };

    const handleStartSetup = (_payload: { settings: GameSettings }) => {
      setIsSetupStarted(true);
      requestStateSync();
    };

    const handleStateSync = (payload: { state: SanitizedGameState }) => {
      setGameState(payload.state);
    };

    const handleGameStarted = (_payload: { currentTurn: string; round: number }) => {
      requestStateSync();
    };

    const handleTurnChange = (_payload: { currentTurn: string; round: number }) => {
      requestStateSync();
    };

    const handleGuessResult = (_payload: { guess: string; correctDigits: number; positionCorrect: number; round: number }) => {
      requestStateSync();
    };

    const handleOpponentGuessed = (_payload: { correctDigits: number; positionCorrect: number; round: number }) => {
      requestStateSync();
    };

    const handleGameOver = (payload: { winner: string | 'draw' | null; reason: string | null; finalState: SanitizedGameState; sessionScores: Record<string, { wins: number; losses: number; draws: number }> }) => {
      setGameState(payload.finalState);
      setSessionScores(payload.sessionScores);
    };

    const handleOpponentReady = () => {
      requestStateSync();
    };

    const handleRematchRequest = () => {
      setRematchRequested(true);
    };

    const handleRematchStart = () => {
      setRematchRequested(false);
      requestStateSync();
    };

    socket.on('room:created', handleCreated);
    socket.on('room:joined', handleJoined);
    socket.on('room:player-joined', handlePlayerJoined);
    socket.on('room:settings-updated', handleSettingsUpdated);
    socket.on('room:player-ready', handlePlayerReady);
    socket.on('room:player-left', handlePlayerLeft);
    socket.on('room:error', handleError);
    socket.on('game:start-setup', handleStartSetup);
    socket.on('game:state-sync', handleStateSync);
    socket.on('game:started', handleGameStarted);
    socket.on('game:turn-change', handleTurnChange);
    socket.on('game:guess-result', handleGuessResult);
    socket.on('game:opponent-guessed', handleOpponentGuessed);
    socket.on('game:over', handleGameOver);
    socket.on('game:opponent-ready', handleOpponentReady);
    socket.on('game:rematch-request', handleRematchRequest);
    socket.on('game:rematch-start', handleRematchStart);

    return () => {
      socket.off('room:created', handleCreated);
      socket.off('room:joined', handleJoined);
      socket.off('room:player-joined', handlePlayerJoined);
      socket.off('room:settings-updated', handleSettingsUpdated);
      socket.off('room:player-ready', handlePlayerReady);
      socket.off('room:player-left', handlePlayerLeft);
      socket.off('room:error', handleError);
      socket.off('game:start-setup', handleStartSetup);
      socket.off('game:state-sync', handleStateSync);
      socket.off('game:started', handleGameStarted);
      socket.off('game:turn-change', handleTurnChange);
      socket.off('game:guess-result', handleGuessResult);
      socket.off('game:opponent-guessed', handleOpponentGuessed);
      socket.off('game:over', handleGameOver);
      socket.off('game:opponent-ready', handleOpponentReady);
      socket.off('game:rematch-request', handleRematchRequest);
      socket.off('game:rematch-start', handleRematchStart);
    };
  }, [socket, navigate, requestStateSync]);

  return (
    <GameContext.Provider
      value={{
        room,
        sessionScores,
        gameState,
        playerId,
        playerIndex,
        isLoading,
        error,
        isSetupStarted,
        rematchRequested,
        createRoom,
        joinRoom,
        updateSettings,
        toggleReady,
        leaveRoom,
        clearError,
        submitSecret,
        submitGuess,
        requestStateSync,
        requestRematch,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
