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

export interface ServerToClientEvents {
  initializeSocket: (data: {
    rooms: Room[];
    publicMessages: PublicMessage[];
    unreadNotifications: Notification[];
  }) => void;
  notification: (notification: Notification) => void;
  newMessage: (message: PublicMessage) => void;
}

export interface ClientToServerEvents {
  _dummy: undefined;
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
  room: ChatRoom;
  sender: ChatUser;
  content: string;
  readBy: ChatUser[];
  createdAt: string;
} 