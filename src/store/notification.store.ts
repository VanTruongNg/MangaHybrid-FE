import { create } from 'zustand';
import type { Notification } from '@/types/socket';

interface NotificationStore {
  notifications: Notification[];
  unreadNotifications: Notification[];
  setNotifications: (value: Notification[] | ((prev: Notification[]) => Notification[])) => void;
  setUnreadNotifications: (value: Notification[] | ((prev: Notification[]) => Notification[])) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadNotifications: [],
  setNotifications: (value) => set((state) => ({ 
    notifications: typeof value === 'function' ? value(state.notifications) : value 
  })),
  setUnreadNotifications: (value) => set((state) => ({ 
    unreadNotifications: typeof value === 'function' ? value(state.unreadNotifications) : value 
  })),
})); 