import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

export const setupSocketIO = (httpServer: HTTPServer) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback-secret'
      ) as JWTPayload;

      socket.data.userId = decoded.id;
      socket.data.userEmail = decoded.email;
      socket.data.userName = decoded.name;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.userName} (${socket.id})`);

    // Join board room
    socket.on('join:board', (boardId: string) => {
      socket.join(`board:${boardId}`);
      console.log(`User ${socket.data.userName} joined board ${boardId}`);
    });

    // Leave board room
    socket.on('leave:board', (boardId: string) => {
      socket.leave(`board:${boardId}`);
      console.log(`User ${socket.data.userName} left board ${boardId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.userName} (${socket.id})`);
    });
  });

  return io;
};

// Event emitters for real-time updates
export const emitBoardUpdate = (io: SocketServer, boardId: string, event: string, data: any) => {
  io.to(`board:${boardId}`).emit(event, data);
};

export const boardEvents = {
  BOARD_UPDATED: 'board:updated',
  LIST_CREATED: 'list:created',
  LIST_UPDATED: 'list:updated',
  LIST_DELETED: 'list:deleted',
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_MOVED: 'task:moved',
  TASK_ASSIGNED: 'task:assigned',
  TASK_UNASSIGNED: 'task:unassigned',
  ACTIVITY_CREATED: 'activity:created',
};
