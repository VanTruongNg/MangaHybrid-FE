import { create } from 'zustand';
import type { PublicMessage } from '@/types/socket';

interface TempMessage extends Omit<PublicMessage, '_id'> {
  tempId: string;
  isSending?: boolean;
  error?: string;
}

interface ChatStore {
  publicMessages: (PublicMessage | TempMessage)[];
  tempMessageMap: Map<string, number>;
  setPublicMessages: (messages: PublicMessage[] | ((prev: PublicMessage[]) => PublicMessage[])) => void;
  addTempMessage: (message: TempMessage) => void;
  updateMessageFromAck: (tempId: string, message: PublicMessage) => void;
  setMessageError: (tempId: string, error: string) => void;
  resendMessage: (tempId: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  publicMessages: [],
  tempMessageMap: new Map(),

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
})); 