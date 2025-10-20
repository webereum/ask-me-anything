'use client';

import io from 'socket.io-client';

interface ServerToClientEvents {
  message: (data: any) => void;
  userJoined: (data: { userId: string; username: string }) => void;
  userLeft: (data: { userId: string; username: string }) => void;
  typing: (data: { userId: string; username: string; roomId: string }) => void;
  stopTyping: (data: { userId: string; username: string; roomId: string }) => void;
  messageDeleted: (data: { messageId: string; roomId: string }) => void;
  messageExpired: (data: { messageId: string; roomId: string }) => void;
  userStatusUpdate: (data: { userId: string; isOnline: boolean }) => void;
  roomUpdate: (data: any) => void;
  error: (data: { message: string; code?: string }) => void;
}

interface ClientToServerEvents {
  joinRoom: (data: { roomId: string; userId: string }) => void;
  leaveRoom: (data: { roomId: string; userId: string }) => void;
  sendMessage: (data: any) => void;
  startTyping: (data: { roomId: string; userId: string }) => void;
  stopTyping: (data: { roomId: string; userId: string }) => void;
  deleteMessage: (data: { messageId: string; roomId: string; userId: string }) => void;
  updateUserStatus: (data: { userId: string; isOnline: boolean }) => void;
}

class SocketClient {
  private socket: ReturnType<typeof io> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(userId?: string): ReturnType<typeof io> {
    if (this.socket?.connected) {
      return this.socket;
    }

    const socketUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : `http://localhost:${process.env.SOCKET_IO_PORT || 3001}`;

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      auth: {
        userId: userId,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 20000,
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Disconnected from chat server:', reason);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('error', (data: any) => {
      console.error('Socket error:', data);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.socket?.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  joinRoom(roomId: string, userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('joinRoom', { roomId, userId });
    }
  }

  leaveRoom(roomId: string, userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leaveRoom', { roomId, userId });
    }
  }

  sendMessage(messageData: any) {
    if (this.socket?.connected) {
      this.socket.emit('sendMessage', messageData);
    }
  }

  startTyping(roomId: string, userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('startTyping', { roomId, userId });
    }
  }

  stopTyping(roomId: string, userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('stopTyping', { roomId, userId });
    }
  }

  deleteMessage(messageId: string, roomId: string, userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('deleteMessage', { messageId, roomId, userId });
    }
  }

  updateUserStatus(userId: string, isOnline: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('updateUserStatus', { userId, isOnline });
    }
  }

  onMessage(callback: (data: any) => void) {
    this.socket?.on('message', callback);
  }

  onUserJoined(callback: (data: { userId: string; username: string }) => void) {
    this.socket?.on('userJoined', callback);
  }

  onUserLeft(callback: (data: { userId: string; username: string }) => void) {
    this.socket?.on('userLeft', callback);
  }

  onTyping(callback: (data: { userId: string; username: string; roomId: string }) => void) {
    this.socket?.on('typing', callback);
  }

  onStopTyping(callback: (data: { userId: string; username: string; roomId: string }) => void) {
    this.socket?.on('stopTyping', callback);
  }

  onMessageDeleted(callback: (data: { messageId: string; roomId: string }) => void) {
    this.socket?.on('messageDeleted', callback);
  }

  onMessageExpired(callback: (data: { messageId: string; roomId: string }) => void) {
    this.socket?.on('messageExpired', callback);
  }

  onUserStatusUpdate(callback: (data: { userId: string; isOnline: boolean }) => void) {
    this.socket?.on('userStatusUpdate', callback);
  }

  onRoomUpdate(callback: (data: any) => void) {
    this.socket?.on('roomUpdate', callback);
  }

  onError(callback: (data: { message: string; code?: string }) => void) {
    this.socket?.on('error', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): ReturnType<typeof io> | null {
    return this.socket;
  }
}

// Export singleton instance
export const socketClient = new SocketClient();
export default socketClient;