import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';
import api from '@/lib/axios';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setUser: (user) => set({ user }),
      setAccessToken: (token) => {
        if (token) {
          localStorage.setItem('accessToken', token);
        } else {
          localStorage.removeItem('accessToken');
        }
        set({ accessToken: token });
      },
      setRefreshToken: (token) => {
        if (token) {
          localStorage.setItem('refreshToken', token);
        } else {
          localStorage.removeItem('refreshToken');
        }
        set({ refreshToken: token });
      },
      logout: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          if (token) {
            await api.post('/auth/logout');
          }
        } catch (error) {
          // Ignore error
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ 
            user: null, 
            accessToken: null, 
            refreshToken: null 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
); 