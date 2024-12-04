import { io } from 'socket.io-client';
import { env } from './env';
import type { ManagerOptions, SocketOptions, Socket } from 'socket.io-client';

// Types cơ bản
interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Message {
  _id: string;
  content: string;
  sender: User;
  createdAt: string;
  roomId: string;
  isRead?: boolean;
}

interface Notification {
  _id: string;
  type: string;
  content: string;
  recipient: string;
  isRead: boolean;
  createdAt: string;
}

interface ServerToClientEvents {
  previousMessages: (messages: Message[]) => void;
  unreadNotifications: (notifications: Notification[]) => void;
  notification: (notification: Notification) => void;
  messageAck: (data: { tempId: string; message: Message }) => void;
  messageError: (data: { tempId: string; error: string }) => void;
  newMessage: (message: Message) => void;
  newPrivateMessage: (message: Message) => void;
  openedPrivateRoom: (data: { roomId: string; messages: Message[] }) => void;
  leftPrivateRoom: (data: { roomId: string }) => void;
  error: (data: { message: string }) => void;
}

interface ClientToServerEvents {
  sendPublicMessage: (payload: { content: string; tempId: string }) => void;
  sendPrivateMessage: (data: { roomId: string; content: string; tempId: string }) => void;
  openPrivateRoom: (data: { roomId: string }) => void;
  leavePrivateRoom: (data: { roomId: string }) => void;
  markMessageRead: (messageId: string) => void;
}

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SOCKET_URL = env.socketUrl;

const SOCKET_OPTIONS: Partial<ManagerOptions & SocketOptions> = {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false
};

const getAuthToken = () => localStorage.getItem('accessToken');

export const socket: TypedSocket = io(SOCKET_URL, {
  ...SOCKET_OPTIONS,
  auth: {
    token: getAuthToken()
  }
});

socket.on('connect', () => {
  console.log('[Socket] Connected:', new Date().toISOString());
});

socket.on('disconnect', () => {
  console.log('[Socket] Disconnected:', new Date().toISOString());
});

socket.on('connect_error', (error) => {
  console.error('[Socket] Connection error:', error);
});

let isConnecting = false;

export const connectSocket = () => {
  if (isConnecting || socket.connected) return;
  
  isConnecting = true;
  socket.auth = { token: getAuthToken() };
  socket.connect();
  
  socket.once('connect', () => {
    isConnecting = false;
    setupEventListeners();
  });
  
  socket.once('connect_error', () => {
    isConnecting = false;
  });
};

const setupEventListeners = () => {
  socket.on('previousMessages', (messages) => {
    console.log('[Socket] Received previous messages:', messages);
  });

  socket.on('unreadNotifications', (notifications) => {
    console.log('[Socket] Received unread notifications:', notifications);
  });

  socket.on('newMessage', (message) => {
    console.log('[Socket] Received new message:', message);
  });

  socket.on('newPrivateMessage', (message) => {
    console.log('[Socket] Received new private message:', message);
  });

  socket.on('messageAck', (data) => {
    console.log('[Socket] Message acknowledged:', data);
  });

  socket.on('messageError', (data) => {
    console.log('[Socket] Message error:', data);
  });

  socket.on('openedPrivateRoom', (data) => {
    console.log('[Socket] Opened private room:', data);
  });

  socket.on('leftPrivateRoom', (data) => {
    console.log('[Socket] Left private room:', data);
  });

  socket.on('error', (data) => {
    console.error('[Socket] Error:', data);
  });
};

export const disconnectSocket = () => {
  isConnecting = false;
  if (socket.connected) {
    socket.removeAllListeners();
    socket.disconnect();
  }
};

//Event listeners
export const onPreviousMessages = (callback: (messages: Message[]) => void) => {
  const wrappedCallback = (messages: Message[]) => {
    console.log('[Socket] Received previous messages:', messages);
    callback(messages);
  };
  socket.on('previousMessages', wrappedCallback);
  return () => socket.off('previousMessages', wrappedCallback);
};

export const onUnreadNotifications = (callback: (notifications: Notification[]) => void) => {
  const wrappedCallback = (notifications: Notification[]) => {
    console.log('[Socket] Received unread notifications:', notifications);
    callback(notifications);
  };
  socket.on('unreadNotifications', wrappedCallback);
  return () => socket.off('unreadNotifications', wrappedCallback);
};

export const onNewMessage = (callback: (message: Message) => void) => {
  const wrappedCallback = (message: Message) => {
    console.log('[Socket] Received new message:', message);
    callback(message);
  };
  socket.on('newMessage', wrappedCallback);
  return () => socket.off('newMessage', wrappedCallback);
};

export const onNewPrivateMessage = (callback: (message: Message) => void) => {
  const wrappedCallback = (message: Message) => {
    console.log('[Socket] Received new private message:', message);
    callback(message);
  };
  socket.on('newPrivateMessage', wrappedCallback);
  return () => socket.off('newPrivateMessage', wrappedCallback);
};

// Event emitters
export const sendPublicMessage = (content: string, tempId: string) => {
  console.log('[Socket] Sending public message:', { content, tempId });
  socket.emit('sendPublicMessage', { content, tempId });
};

export const sendPrivateMessage = (roomId: string, content: string, tempId: string) => {
  console.log('[Socket] Sending private message:', { roomId, content, tempId });
  socket.emit('sendPrivateMessage', { roomId, content, tempId });
};

export const openPrivateRoom = (roomId: string) => {
  console.log('[Socket] Opening private room:', roomId);
  socket.emit('openPrivateRoom', { roomId });
};

export const leavePrivateRoom = (roomId: string) => {
  console.log('[Socket] Leaving private room:', roomId);
  socket.emit('leavePrivateRoom', { roomId });
};

export const markMessageRead = (messageId: string) => {
  console.log('[Socket] Marking message as read:', messageId);
  socket.emit('markMessageRead', messageId);
};