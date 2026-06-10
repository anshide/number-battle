// ============================================================================
// server/src/socket/handlers/roomHandler.ts
// Socket event handlers for room lifecycle:
//   - room:create  — host creates a new room
//   - room:join    — guest joins by room code
//   - room:settings — host updates game settings
//   - room:ready   — player toggles ready state
//   - room:leave   — player leaves the room
//   - disconnect   — handle unexpected disconnections
//
// All mutations go through RoomManager — handlers only translate
// between socket events and RoomManager method calls.
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

/**
 * Register room-related socket event handlers on a connected socket.
 */
export function registerRoomHandlers(
  io: GameServer,
  socket: GameSocket,
  roomManager: RoomManager
): void {
  // -------------------------------------------------------------------------
  // room:create — Host creates a new room
  // -------------------------------------------------------------------------
  socket.on('room:create', ({ playerName }) => {
    // Prevent creating a room if already in one
    if (socket.data.roomCode) {
      socket.emit('room:error', {
        message: 'You are already in a room. Leave first.',
        code: 'ALREADY_IN_ROOM',
      });
      return;
    }

    const result = roomManager.createRoom(playerName, socket.id);

    if (!result.success) {
      socket.emit('room:error', { message: result.error, code: result.code });
      return;
    }

    const { room, player } = result.data;

    // Store identity on the socket for future event handling
    socket.data.playerId = player.id;
    socket.data.playerName = player.name;
    socket.data.roomCode = room.code;

    // Join the Socket.IO room (for broadcasting)
    socket.join(room.code);

    // Confirm room creation to the host
    socket.emit('room:created', {
      roomCode: room.code,
      playerId: player.id,
      playerIndex: player.index,
      room: room.toRoomInfo(),
    });

    logger.info('room:create handled', { roomCode: room.code, playerId: player.id });
  });

  // -------------------------------------------------------------------------
  // room:join — Guest joins an existing room by code
  // -------------------------------------------------------------------------
  socket.on('room:join', ({ roomCode, playerName }) => {
    // Prevent joining if already in a room
    if (socket.data.roomCode) {
      socket.emit('room:error', {
        message: 'You are already in a room. Leave first.',
        code: 'ALREADY_IN_ROOM',
      });
      return;
    }

    const result = roomManager.joinRoom(roomCode, playerName, socket.id);

    if (!result.success) {
      socket.emit('room:error', { message: result.error, code: result.code });
      return;
    }

    const { room, player } = result.data;

    // Store identity on the socket
    socket.data.playerId = player.id;
    socket.data.playerName = player.name;
    socket.data.roomCode = room.code;

    // Join the Socket.IO room
    socket.join(room.code);

    // Confirm join to the guest
    socket.emit('room:joined', {
      roomCode: room.code,
      playerId: player.id,
      playerIndex: player.index,
      room: room.toRoomInfo(),
    });

    // Notify the host that someone joined
    socket.to(room.code).emit('room:player-joined', {
      player: player.toLobbyPlayer(),
      room: room.toRoomInfo(),
    });

    logger.info('room:join handled', { roomCode: room.code, playerId: player.id });
  });

  // -------------------------------------------------------------------------
  // room:settings — Host updates game settings
  // -------------------------------------------------------------------------
  socket.on('room:settings', ({ numberLength, allowRepeats }) => {
    const playerId = socket.data.playerId;
    if (!playerId) {
      socket.emit('room:error', { message: 'Not identified.', code: 'NOT_IDENTIFIED' });
      return;
    }

    const result = roomManager.updateSettings(playerId, { numberLength, allowRepeats });

    if (!result.success) {
      socket.emit('room:error', { message: result.error, code: result.code });
      return;
    }

    const { room } = result.data;

    // Broadcast updated settings to all players in the room
    io.to(room.code).emit('room:settings-updated', {
      settings: room.settings,
    });

    // Also broadcast reset ready states
    room.players.forEach((p) => {
      io.to(room.code).emit('room:player-ready', {
        playerIndex: p.index,
        isReady: p.isReady,
      });
    });

    logger.info('room:settings handled', { roomCode: room.code, settings: room.settings });
  });

  // -------------------------------------------------------------------------
  // room:ready — Player toggles their ready state
  // -------------------------------------------------------------------------
  socket.on('room:ready', () => {
    const playerId = socket.data.playerId;
    if (!playerId) {
      socket.emit('room:error', { message: 'Not identified.', code: 'NOT_IDENTIFIED' });
      return;
    }

    const result = roomManager.toggleReady(playerId);

    if (!result.success) {
      socket.emit('room:error', { message: result.error, code: result.code });
      return;
    }

    const { room, allReady } = result.data;
    const player = room.getPlayer(playerId)!;

    // Broadcast the player's ready state to the room
    io.to(room.code).emit('room:player-ready', {
      playerIndex: player.index,
      isReady: player.isReady,
    });

    // If all players are ready, transition to setup phase
    if (allReady) {
      io.to(room.code).emit('game:start-setup', {
        settings: room.settings,
      });
      logger.info('Both players ready — starting setup', { roomCode: room.code });
    }
  });

  // -------------------------------------------------------------------------
  // room:leave — Player voluntarily leaves
  // -------------------------------------------------------------------------
  socket.on('room:leave', () => {
    handlePlayerLeave(io, socket, roomManager);
  });

  // -------------------------------------------------------------------------
  // disconnect — Player's connection was lost
  // -------------------------------------------------------------------------
  socket.on('disconnect', (reason) => {
    logger.info('Socket disconnected', { socketId: socket.id, reason });
    handlePlayerLeave(io, socket, roomManager);
  });
}

/**
 * Handle a player leaving (either voluntarily or due to disconnection).
 * Notifies remaining players and cleans up room if needed.
 */
function handlePlayerLeave(
  io: GameServer,
  socket: GameSocket,
  roomManager: RoomManager
): void {
  const playerId = socket.data.playerId;
  if (!playerId) return;

  const roomCode = socket.data.roomCode;
  const result = roomManager.leaveRoom(playerId);

  if (!result.success) return;

  const { room, removedPlayer } = result.data;

  // Leave the Socket.IO room
  socket.leave(roomCode || '');

  // Clear socket data
  socket.data.playerId = '';
  socket.data.playerName = '';
  socket.data.roomCode = null;

  // Notify remaining players (if any)
  if (roomCode && !room.isEmpty()) {
    io.to(roomCode).emit('room:player-left', {
      playerIndex: removedPlayer.index,
      playerName: removedPlayer.name,
      room: room.toRoomInfo(),
    });
  }
}
