import { ChatParticipant } from '@/types/socket';
import { create } from 'zustand';

interface ChatUIState {
  isOpen: boolean;
  activePrivateChat: {
    type: 'virtual' | 'room';
    id: string;  // userId hoặc roomId
    user?: ChatParticipant; // Thông tin user khi là virtual
  } | null;
  setOpen: (isOpen: boolean) => void;
  openPrivateChat: (userId: string, userInfo: ChatParticipant) => void;
  openExistingRoom: (roomId: string) => void;
  closePrivateChat: () => void;
}

export const useChatUIStore = create<ChatUIState>((set) => ({
  isOpen: false,
  activePrivateChat: null,

  setOpen: (isOpen) => set({ isOpen }),

  openPrivateChat: (userId, userInfo) => set({ 
    isOpen: true,
    activePrivateChat: {
      type: 'virtual',
      id: userId,
      user: userInfo
    }
  }),

  openExistingRoom: (roomId) => set({
    isOpen: true, 
    activePrivateChat: {
      type: 'room',
      id: roomId
    }
  }),

  closePrivateChat: () => set({ activePrivateChat: null }),
})); 