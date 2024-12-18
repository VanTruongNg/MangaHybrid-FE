import { Socket } from 'socket.io-client';

export interface MangaInfo {
  _id: string;
  title: string;
  coverImg: string;
}

export interface ChapterInfo {
  _id: string;
  number: number;
}

export enum NotificationType {
  NEW_CHAPTER = 'NEW_CHAPTER'
}

export interface Notification {
  _id: string;
  type: NotificationType;
  message: string;
  manga?: MangaInfo;
  chapter?: ChapterInfo;
  isRead: boolean;
  createdAt: string;
}

export interface Room {
  _id: string;
  name: string;
}

export interface PublicMessage {
  _id: string;
  content: string;
  sender: ChatUser;
  createdAt: string;
}

export interface MessageWithTempId extends PublicMessage {
  tempId: string;
}

export interface MessageError {
  tempId: string;
  error: string;
}

export interface TempMessage extends Omit<PublicMessage, '_id'> {
  tempId: string;
  isSending?: boolean;
  error?: string;
}

export interface MessageAckResponse {
  tempId: string;
  message: PublicMessage | ChatMessage;
  room?: PrivateRoom;
}

export interface ServerToClientEvents {
  initializeSocket: (data: {
    rooms: PrivateRoom[];
    publicMessages: PublicMessage[];
    unreadNotifications: Notification[];
  }) => void;
  notification: (notification: Notification) => void;
  newMessage: (message: PublicMessage) => void;
  messageError: (error: MessageError) => void;
  messageAck: (ack: MessageAckResponse) => void;
  newPrivateMessage: (data: PrivateMessageEvent) => void;
  roomUpdate: (data: { rooms: PrivateRoom[] }) => void;
  openedPrivateRoom: (data: {
    roomId: string;
    messages: ChatMessage[];
  }) => void;
  leftPrivateRoom: (data: { roomId: string }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  _dummy: undefined;
  sendPublicMessage: (message: MessageAck) => void;
  sendPrivateMessage: (message: {
    tempId: string;
    content: string;
    receiverId: string;
  }) => void;
  openPrivateRoom: (data: { roomId: string }) => void;
  leavePrivateRoom: (data: { roomId: string }) => void;
  markMessageRead: (messageId: string) => void;
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Types for chat
export interface ChatUser {
  _id: string;
  name: string;
  avatarUrl?: string;
}

export interface ChatRoom {
  _id: string;
  type: string;
  participants: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface ChatMessage {
  _id: string;
  roomId: string;
  sender: ChatUser;
  content: string;
  readBy: ChatUser[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageAck {
  tempId: string;
  content: string;
}

export interface ChatParticipant {
  _id: string;
  name: string;
  avatarUrl?: string;
}

export interface PrivateRoom {
  _id: string;
  type: 'private';
  participants: ChatParticipant[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageAt?: string;
  lastSender?: ChatParticipant;
  unreadCount?: number;
}

export interface PrivateMessageEvent {
  message: {
    _id: string;
    roomId: string;
    sender: ChatUser;
    content: string;
    readBy: ChatUser[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  room: PrivateRoom;
}

export interface TempPrivateMessage extends Omit<ChatMessage, '_id'> {
  tempId: string;
  isSending?: boolean;
  error?: string;
} 