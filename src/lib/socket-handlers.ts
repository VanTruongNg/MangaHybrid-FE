import { socket } from './socket';
import type { 
  ServerToClientEvents, Notification, PublicMessage, MessageError, MessageAck, MessageAckResponse 
} from '@/types/socket';

type InitializeSocketData = Parameters<ServerToClientEvents['initializeSocket']>[0];
type SocketEventHandler<T> = (callback: (data: T) => void) => () => void;

export const handleInitializeSocket: SocketEventHandler<InitializeSocketData> = (callback) => {
  if (!socket.hasListeners('initializeSocket')) {
    socket.on('initializeSocket', callback);
  }
  return () => socket.off('initializeSocket', callback);
};

export const handleNewNotification: SocketEventHandler<Notification> = (callback) => {
  if (!socket.hasListeners('notification')) {
    socket.on('notification', callback);
  }
  return () => socket.off('notification', callback);
};

export const handleNewMessage: SocketEventHandler<PublicMessage> = (callback) => {
  if (!socket.hasListeners('newMessage')) {
    socket.on('newMessage', callback);
  }
  return () => socket.off('newMessage', callback);
};

export const handleMessageError: SocketEventHandler<MessageError> = (callback) => {
  if (!socket.hasListeners('messageError')) {
    socket.on('messageError', callback);
  }
  return () => socket.off('messageError', callback);
};

export const handleMessageAck: SocketEventHandler<MessageAckResponse> = (callback) => {
  socket.on('messageAck', callback);
  return () => socket.off('messageAck', callback);
};

export function handleSendPublicMessage(message: MessageAck) {
  socket.emit('sendPublicMessage', message);
}