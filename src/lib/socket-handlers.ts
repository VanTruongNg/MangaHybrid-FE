import { socket } from './socket';
import type { 
  ServerToClientEvents, Notification, PublicMessage, MessageError, MessageAck, MessageAckResponse, PrivateMessageEvent, PrivateRoom, 
  ChatMessage
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

export const handleNewPrivateMessage: SocketEventHandler<PrivateMessageEvent> = (callback) => {
  socket.on('newPrivateMessage', callback);
  return () => socket.off('newPrivateMessage', callback);
};

export const handleRoomUpdate: SocketEventHandler<{rooms: PrivateRoom[]}> = (callback) => {
  socket.on('roomUpdate', callback);
  return () => socket.off('roomUpdate', callback);
};

export const handleOpenedPrivateRoom: SocketEventHandler<{
  roomId: string;
  messages: ChatMessage[];
}> = (callback) => {
  socket.on('openedPrivateRoom', callback);
  return () => socket.off('openedPrivateRoom', callback);
};

export function handleSendPublicMessage(message: MessageAck) {
  socket.emit('sendPublicMessage', message);
}

export function handleSendPrivateMessage(data: {
  tempId: string;
  content: string;
  receiverId: string;
}) {
  socket.emit('sendPrivateMessage', data);
}

export function handleOpenPrivateRoom(roomId: string) {
  socket.emit('openPrivateRoom', { roomId });
}

export function handleLeavePrivateRoom(roomId: string) {
  socket.emit('leavePrivateRoom', { roomId });
}

export const handleMarkMessageRead = (messageId: string) => {
  socket.emit('markMessageRead', messageId);
};