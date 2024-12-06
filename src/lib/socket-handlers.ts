import { socket } from './socket';
import type { 
  ServerToClientEvents, Notification, PublicMessage 
} from '@/types/socket';

type InitializeSocketData = Parameters<ServerToClientEvents['initializeSocket']>[0];

export function handleInitializeSocket(callback: (data: InitializeSocketData) => void) {
  if (!socket.hasListeners('initializeSocket')) {
    socket.on('initializeSocket', callback);
  }
  return () => socket.off('initializeSocket', callback);
}

export function handleNewNotification(callback: (notification: Notification) => void) {
  if (!socket.hasListeners('notification')) {
    socket.on('notification', callback);
  }
  return () => socket.off('notification', callback);
}

export function handleNewMessage(callback: (message: PublicMessage) => void) {
  if (!socket.hasListeners('newMessage')) {
    socket.on('newMessage', callback);
  }
  return () => socket.off('newMessage', callback);
}