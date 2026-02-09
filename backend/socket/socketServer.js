import { Server } from 'socket.io';
import { CollaborationLog } from '../model/CollaborationLog.js';
import mongoose from 'mongoose';

let io;

// Active rooms and users
const rooms = new Map();
const userSockets = new Map();

export const initializeSocket = (server) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://code-sense-mu.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Join room
    socket.on('join-room', async ({ roomId, userId, userName }) => {
      try {
        socket.join(roomId);

        if (!rooms.has(roomId)) {
          rooms.set(roomId, {
            code: '',
            language: 'javascript',
            users: new Map(),
            cursors: new Map(),
            createdAt: Date.now()
          });
        }

        const room = rooms.get(roomId);

        room.users.set(socket.id, {
          userId,
          userName,
          joinedAt: Date.now(),
          color: getRandomColor()
        });

        userSockets.set(userId, socket.id);

        // Emit current state
        socket.emit('room-state', {
          code: room.code,
          language: room.language,
          users: Array.from(room.users.entries()).map(([id, user]) => ({
            socketId: id,
            ...user
          }))
        });

        socket.to(roomId).emit('user-joined', {
          socketId: socket.id,
          userId,
          userName,
          color: room.users.get(socket.id).color
        });

        console.log(`👥 ${userName} joined room ${roomId}`);

        await saveRoomActivity(roomId, userId, 'joined');

      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Code change
    socket.on('code-change', ({ roomId, code, userId }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.code = code;
        socket.to(roomId).emit('code-update', { code, userId });
      }
    });

    // Language change
    socket.on('language-change', ({ roomId, language }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.language = language;
        socket.to(roomId).emit('language-update', { language });
      }
    });

    // Cursor move
    socket.on('cursor-move', ({ roomId, position, selection }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.cursors.set(socket.id, { position, selection });
        socket.to(roomId).emit('cursor-update', {
          socketId: socket.id,
          position,
          selection
        });
      }
    });

    // Analysis started
    socket.on('analysis-started', ({ roomId, analysisType }) => {
      socket.to(roomId).emit('user-analyzing', {
        socketId: socket.id,
        analysisType
      });
    });

    // Leave room
    socket.on('leave-room', async ({ roomId, userId }) => {
      await handleUserLeave(socket, roomId, userId);
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.id}`);
      for (const [roomId, room] of rooms.entries()) {
        if (room.users.has(socket.id)) {
          const user = room.users.get(socket.id);
          await handleUserLeave(socket, roomId, user.userId);
        }
      }
    });
  });

  return io;
};

// Handle user leaving
const handleUserLeave = async (socket, roomId, userId) => {
  const room = rooms.get(roomId);
  if (room && room.users.has(socket.id)) {
    const user = room.users.get(socket.id);

    room.users.delete(socket.id);
    room.cursors.delete(socket.id);
    userSockets.delete(userId);

    socket.to(roomId).emit('user-left', {
      socketId: socket.id,
      userName: user.userName
    });

    if (room.users.size === 0) {
      setTimeout(() => {
        if (rooms.get(roomId)?.users.size === 0) {
          rooms.delete(roomId);
          console.log(`🗑️ Room ${roomId} deleted (empty)`);
        }
      }, 5 * 60 * 1000);
    }

    socket.leave(roomId);
    await saveRoomActivity(roomId, userId, 'left');

    console.log(`👋 ${user.userName} left room ${roomId}`);
  }
};

// Save activity to MongoDB
const saveRoomActivity = async (roomId, userId, action) => {
  try {
    await CollaborationLog.create({
      roomId,
      userId: mongoose.Types.ObjectId(userId),
      action,
    });
  } catch (error) {
    console.error('Save activity error:', error);
  }
};

const getRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#48C9B0', '#F39C12', '#9B59B6', '#3498DB'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const getIO = () => io;
