import { create } from 'zustand';
import type { Notification } from '@/types/socket';

interface NotificationStore {
  notifications: Notification[];
  unreadNotifications: Notification[];
  setNotifications: (value: Notification[] | ((prev: Notification[]) => Notification[])) => void;
  setUnreadNotifications: (value: Notification[] | ((prev: Notification[]) => Notification[])) => void;
  clearAll: () => void;
}

const initialState = {
  notifications: [],
  unreadNotifications: []
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  ...initialState,

  setNotifications: (value) => set((state) => ({ 
    notifications: typeof value === 'function' ? value(state.notifications) : value 
  })),

  setUnreadNotifications: (value) => set((state) => ({ 
    unreadNotifications: typeof value === 'function' ? value(state.unreadNotifications) : value 
  })),

  clearAll: () => set(initialState)
})); 