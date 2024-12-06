import { create } from 'zustand';
import type { PublicMessage } from '@/types/socket';

interface ChatStore {
  publicMessages: PublicMessage[];
  setPublicMessages: (value: PublicMessage[] | ((prev: PublicMessage[]) => PublicMessage[])) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  publicMessages: [],
  setPublicMessages: (value) => set((state) => ({ 
    publicMessages: typeof value === 'function' ? value(state.publicMessages) : value 
  })),
})); 