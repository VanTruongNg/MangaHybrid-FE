import { create } from 'zustand';
import type { Notification, PublicMessage } from '@/types/socket';

interface NotificationStore {
  notifications: Notification[];
  unreadNotifications: Notification[];
  publicMessages: PublicMessage[];
  setNotifications: (value: Notification[] | ((prev: Notification[]) => Notification[])) => void;
  setUnreadNotifications: (value: Notification[] | ((prev: Notification[]) => Notification[])) => void;
  setPublicMessages: (value: PublicMessage[] | ((prev: PublicMessage[]) => PublicMessage[])) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadNotifications: [],
  publicMessages: [],
  setNotifications: (value) => set((state) => ({ 
    notifications: typeof value === 'function' ? value(state.notifications) : value 
  })),
  setUnreadNotifications: (value) => set((state) => ({ 
    unreadNotifications: typeof value === 'function' ? value(state.unreadNotifications) : value 
  })),
  setPublicMessages: (value) => set((state) => ({ 
    publicMessages: typeof value === 'function' ? value(state.publicMessages) : value 
  }))
})); 