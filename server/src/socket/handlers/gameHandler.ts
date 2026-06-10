// ============================================================================
// server/src/socket/handlers/gameHandler.ts
// Socket event handlers for core game flow:
//   - game:set-secret   — player submits their secret number
//   - game:guess        — player submits a guess during their turn
//   - game:request-sync — player requests a fresh copy of the game state
// ============================================================================

import type { Server, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@number-battle/shared';
import type { RoomManager } from '../../managers/RoomManager.js';
import { logger } from '../../utils/logger.js';

type GameServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerGameHandlers(
  io: GameServer,
  socket: GameSocket,
  roomManager: RoomManager
): void {
  
  // -------------------------------------------------------------------------
  // game:set-secret
  // -------------------------------------------------------------------------
  socket.on('game:set-secret', ({ secret }) => {
    const playerId = socket.data.playerId;
    const roomCode = socket.data.roomCode;
    
    if (!playerId || !roomCode) {
      socket.emit('room:error', { message: 'Not identified or not in a room.', code: 'NOT_IDENTIFIED' });
      return;
    }

    const result = roomManager.submitSecretNumber(playerId, secret);
    
    if (!result.success) {
      socket.emit('room:error', { message: result.error, code: result.code });
      return;
    }

    const { room, ready, gameStarted } = result.data;

    if (ready) {
      // Notify the opponent that this player is ready
      socket.to(room.code).emit('game:opponent-ready');
      logger.info('Secret submitted', { roomCode, playerId });
    }

    if (gameStarted && room.gameState) {
      // Both players submitted secrets, game begins
      const currentTurnId = room.gameState.players[room.gameState.currentTurnIndex].playerId;
      io.to(room.code).emit('game:started', {
        currentTurn: currentTurnId,
        round: room.gameState.currentRound,
      });
      logger.info('Game started', { roomCode, currentTurnId });
    }
  });

  // -------------------------------------------------------------------------
  // game:guess
  // -------------------------------------------------------------------------
  socket.on('game:guess', ({ guess }) => {
    const playerId = socket.data.playerId;
    const roomCode = socket.data.roomCode;
    
    if (!playerId || !roomCode) {
      socket.emit('room:error', { message: 'Not identified or not in a room.', code: 'NOT_IDENTIFIED' });
      return;
    }

    const response = roomManager.makeGuess(playerId, guess);
    
    if (!response.success) {
      socket.emit('room:error', { message: response.error, code: response.code });
      return;
    }

    const { room, result, gameOver } = response.data;
    
    // Send full result to the guesser
    socket.emit('game:guess-result', {
      guess: result.guess,
      correctDigits: result.correctDigits,
      positionCorrect: result.positionCorrect,
      round: result.round,
    });

    // Send partial info (no guess value) to the opponent
    socket.to(room.code).emit('game:opponent-guessed', {
      correctDigits: result.correctDigits,
      positionCorrect: result.positionCorrect,
      round: result.round,
    });

    logger.info('Guess made', { roomCode, playerId, guess: '***', correctDigits: result.correctDigits, positionCorrect: result.positionCorrect });

    if (gameOver) {
      const p1Id = room.players[0].id;
      const p2Id = room.players[1].id;
      
      const payloadP1 = {
        winner: room.gameState!.winner,
        reason: room.gameState!.winReason,
        finalState: room.gameEngine!.getSanitizedState(p1Id),
        sessionScores: room.sessionScores
      };
      
      const payloadP2 = {
        winner: room.gameState!.winner,
        reason: room.gameState!.winReason,
        finalState: room.gameEngine!.getSanitizedState(p2Id),
        sessionScores: room.sessionScores
      };

      io.to(room.players[0].socketId).emit('game:over', payloadP1);
      io.to(room.players[1].socketId).emit('game:over', payloadP2);
      
      logger.info('Game over', { roomCode, winner: room.gameState!.winner, reason: room.gameState!.winReason });
    } else {
      const nextTurnId = room.gameState!.players[room.gameState!.currentTurnIndex].playerId;
      io.to(room.code).emit('game:turn-change', {
        currentTurn: nextTurnId,
        round: room.gameState!.currentRound,
      });
    }
  });

  // -------------------------------------------------------------------------
  // game:request-sync
  // -------------------------------------------------------------------------
  socket.on('game:request-sync', () => {
    const playerId = socket.data.playerId;
    if (!playerId) return;

    const state = roomManager.getSanitizedGameState(playerId);
    if (state) {
      socket.emit('game:state-sync', { state });
    }
  });

  // -------------------------------------------------------------------------
  // game:rematch-request
  // -------------------------------------------------------------------------
  socket.on('game:rematch-request', () => {
    const playerId = socket.data.playerId;
    if (!playerId) return;

    const result = roomManager.requestRematch(playerId);
    if (!result.success) {
      socket.emit('room:error', { message: result.error, code: result.code });
      return;
    }

    const { room, rematchStarting } = result.data;

    if (rematchStarting) {
      io.to(room.code).emit('game:rematch-start');
      logger.info('Rematch started, notifying room', { roomCode: room.code });
    } else {
      socket.to(room.code).emit('game:rematch-request');
      logger.info('Rematch requested', { roomCode: room.code, playerId });
    }
  });
}
