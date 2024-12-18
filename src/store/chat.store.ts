import { create } from 'zustand';
import type { ChatMessage, PrivateRoom, PublicMessage, TempPrivateMessage } from '@/types/socket';
import { useAuthStore } from '@/store/auth.store';

interface TempMessage extends Omit<PublicMessage, '_id'> {
  tempId: string;
  isSending?: boolean;
  error?: string;
}

interface ChatState {
  publicMessages: (PublicMessage | TempMessage)[];
  tempMessageMap: Map<string, number>;
  clearMessages: () => void;
  setPublicMessages: (messages: PublicMessage[] | ((prev: PublicMessage[]) => PublicMessage[])) => void;
  addTempMessage: (message: TempMessage) => void;
  updateMessageFromAck: (tempId: string, message: PublicMessage) => void;
  setMessageError: (tempId: string, error: string) => void;
  resendMessage: (tempId: string) => void;
  privateRooms: PrivateRoom[];
  privateMessages: Record<string, (ChatMessage | TempPrivateMessage)[]>;
  setPrivateRooms: (rooms: PrivateRoom[]) => void;
  upsertPrivateRoom: (room: PrivateRoom) => void;
  addPrivateMessage: (roomId: string, message: ChatMessage) => void;
  setPrivateMessages: (roomId: string, messages: ChatMessage[]) => void;
  findRoomByParticipant: (userId: string) => PrivateRoom | undefined;
  addTempPrivateMessage: (roomId: string, message: TempPrivateMessage) => void;
  migrateVirtualMessages: (virtualRoomId: string, realRoomId: string) => void;
  sortRoomsByLatestMessage: () => void;
  updateTempPrivateMessage: (roomId: string, tempId: string, updates: Partial<TempPrivateMessage>) => void;
  markRoomAsRead: (roomId: string) => void;
}

const initialState = {
  publicMessages: [],
  tempMessageMap: new Map<string, number>(),
  privateRooms: [],
  privateMessages: {}
};

export const useChatStore = create<ChatState>()((set, get) => ({
  ...initialState,

  clearMessages: () => set(initialState),

  setPublicMessages: (messages) => set((state) => ({ 
    publicMessages: typeof messages === 'function' 
      ? messages(state.publicMessages as PublicMessage[]) 
      : messages,
    tempMessageMap: new Map()
  })),

  addTempMessage: (message) => 
    set((state) => {
      const newIndex = state.publicMessages.length;
      const newMap = new Map(state.tempMessageMap);
      newMap.set(message.tempId, newIndex);

      return { 
        publicMessages: [...state.publicMessages, message],
        tempMessageMap: newMap
      };
    }),

  updateMessageFromAck: (tempId, message) =>
    set((state) => {
      const index = state.tempMessageMap.get(tempId);
      if (index === undefined) return state;

      const newMessages = [...state.publicMessages];
      newMessages[index] = { ...message, isSending: false };
      
      const newMap = new Map(state.tempMessageMap);
      newMap.delete(tempId);

      return {
        publicMessages: newMessages,
        tempMessageMap: newMap
      };
    }),

  setMessageError: (tempId, error) =>
    set((state) => {
      const index = state.tempMessageMap.get(tempId);
      if (index === undefined) return state;

      const newMessages = [...state.publicMessages];
      const msg = newMessages[index];
      if ('tempId' in msg) {
        newMessages[index] = { ...msg, error, isSending: false };
      }

      return {
        publicMessages: newMessages,
        tempMessageMap: state.tempMessageMap
      };
    }),

  resendMessage: (tempId) =>
    set((state) => {
      const index = state.tempMessageMap.get(tempId);
      if (index === undefined) return state;

      const newMessages = [...state.publicMessages];
      const msg = newMessages[index];
      if ('tempId' in msg) {
        newMessages[index] = { ...msg, error: undefined, isSending: true };
      }

      return {
        publicMessages: newMessages,
        tempMessageMap: state.tempMessageMap
      };
    }),

  setPrivateRooms: (rooms) => set(() => {
    const currentUser = useAuthStore.getState().user;
    
    const processedRooms = rooms.map(room => ({
      ...room,
      unreadCount: currentUser && room.lastSender?._id === currentUser._id ? 0 : room.unreadCount
    }));

    const sortedRooms = [...processedRooms].sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return timeB - timeA;
    });
    
    return { privateRooms: sortedRooms };
  }),

  upsertPrivateRoom: (room) => set((state) => {
    const existingRoom = state.privateRooms.find(r => r._id === room._id);
    const updatedRoom = existingRoom ? {
      ...room,
      lastMessage: room.lastMessage || existingRoom.lastMessage,
      lastMessageAt: room.lastMessageAt || existingRoom.lastMessageAt,
      lastSender: room.lastSender || existingRoom.lastSender,
      unreadCount: room.unreadCount ?? existingRoom.unreadCount
    } : room;

    return {
      privateRooms: state.privateRooms.some(r => r._id === room._id)
        ? state.privateRooms.map(r => r._id === room._id ? updatedRoom : r)
        : [...state.privateRooms, updatedRoom]
    };
  }),

  addPrivateMessage: (roomId, message) => set((state) => {
    const currentUser = useAuthStore.getState().user;
    const isFromMe = currentUser && message.sender._id === currentUser._id;

    const existingMessages = state.privateMessages[roomId] || [];
    const hasTempMessage = existingMessages.some(
      msg => 'tempId' in msg && msg.sender._id === currentUser?._id && msg.content === message.content
    );

    const updatedRooms = state.privateRooms.map(room => {
      if (room._id === roomId) {
        return {
          ...room,
          lastMessage: message.content,
          lastMessageAt: message.createdAt,
          lastSender: message.sender,
          unreadCount: isFromMe ? 0 : (room.unreadCount || 0) + 1
        };
      }
      return room;
    });

    return {
      privateRooms: updatedRooms,
      privateMessages: {
        ...state.privateMessages,
        [roomId]: hasTempMessage 
          ? existingMessages 
          : [...existingMessages, message]
      }
    };
  }),

  setPrivateMessages: (roomId, messages) => set((state) => ({
    privateMessages: {
      ...state.privateMessages,
      [roomId]: messages
    }
  })),

  findRoomByParticipant: (userId) => {
    return get().privateRooms.find(room => 
      room.participants.some(p => p._id === userId)
    );
  },

  addTempPrivateMessage: (roomId, message) => set((state) => ({
    privateMessages: {
      ...state.privateMessages,
      [roomId]: [...(state.privateMessages[roomId] || []), message]
    }
  })),

  migrateVirtualMessages: (virtualRoomId: string, realRoomId: string) => set((state) => {
    const virtualMessages = state.privateMessages[virtualRoomId] || [];
    const realMessages = state.privateMessages[realRoomId] || [];

    const newPrivateMessages = {
      ...state.privateMessages,
      [realRoomId]: [...realMessages, ...virtualMessages],
    };
    delete newPrivateMessages[virtualRoomId];

    return { privateMessages: newPrivateMessages };
  }),

  sortRoomsByLatestMessage: () => set((state) => ({
    privateRooms: [...state.privateRooms].sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return timeB - timeA;
    })
  })),

  updateTempPrivateMessage: (roomId, tempId, updates) => set((state) => {
    const messages = state.privateMessages[roomId] || [];
    return {
      privateMessages: {
        ...state.privateMessages,
        [roomId]: messages.map(msg => 
          'tempId' in msg && msg.tempId === tempId 
            ? { ...msg, ...updates }
            : msg
        )
      }
    };
  }),

  markRoomAsRead: (roomId) => set((state) => ({
    privateRooms: state.privateRooms.map(room => 
      room._id === roomId 
        ? { ...room, unreadCount: 0 }
        : room
    )
  }))
})); 