import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_URL, {
      auth: {
        token,
      },
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinBoard(boardId: string) {
    this.socket?.emit('join:board', boardId);
  }

  leaveBoard(boardId: string) {
    this.socket?.emit('leave:board', boardId);
  }

  // Event listeners
  onBoardUpdated(callback: (data: any) => void) {
    this.socket?.on('board:updated', callback);
  }

  onListCreated(callback: (data: any) => void) {
    this.socket?.on('list:created', callback);
  }

  onListUpdated(callback: (data: any) => void) {
    this.socket?.on('list:updated', callback);
  }

  onListDeleted(callback: (data: any) => void) {
    this.socket?.on('list:deleted', callback);
  }

  onTaskCreated(callback: (data: any) => void) {
    this.socket?.on('task:created', callback);
  }

  onTaskUpdated(callback: (data: any) => void) {
    this.socket?.on('task:updated', callback);
  }

  onTaskDeleted(callback: (data: any) => void) {
    this.socket?.on('task:deleted', callback);
  }

  onTaskMoved(callback: (data: any) => void) {
    this.socket?.on('task:moved', callback);
  }

  onTaskAssigned(callback: (data: any) => void) {
    this.socket?.on('task:assigned', callback);
  }

  onTaskUnassigned(callback: (data: any) => void) {
    this.socket?.on('task:unassigned', callback);
  }

  onActivityCreated(callback: (data: any) => void) {
    this.socket?.on('activity:created', callback);
  }

  // Remove listeners
  off(event: string) {
    this.socket?.off(event);
  }

  offAll() {
    this.socket?.removeAllListeners();
  }
}

export const socketService = new SocketService();
