import { io, ManagerOptions, SocketOptions } from 'socket.io-client';
import { env } from '@/lib/env';
import type { TypedSocket } from '@/types/socket';
import { isBrowser } from '@/lib/utils';

const SOCKET_URL = env.socketUrl;

const SOCKET_OPTIONS: Partial<ManagerOptions & SocketOptions> = {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false
};

const getAuthToken = () => {
  if (isBrowser()) {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const socket: TypedSocket = io(SOCKET_URL, {
  ...SOCKET_OPTIONS,
  auth: {
    token: getAuthToken()
  }
});

let isConnecting = false;

export const connectSocket = () => {
  if (isConnecting || socket.connected) return;
  
  isConnecting = true;
  socket.auth = { token: getAuthToken() };
  socket.connect();
  
  socket.once('connect', () => {
    isConnecting = false;
  });
  
  socket.once('connect_error', () => {
    isConnecting = false;
  });
};

export const disconnectSocket = () => {
  isConnecting = false;
  if (socket.connected) {
    socket.removeAllListeners();
    socket.disconnect();
  }
};

socket.on('connect', () => {
  console.log('[Socket] Connected:', new Date().toISOString());
});

socket.on('disconnect', () => {
  console.log('[Socket] Disconnected:', new Date().toISOString());
});

socket.on('connect_error', (error) => {
  console.error('[Socket] Connection error:', error);
});