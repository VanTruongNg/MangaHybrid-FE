import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/user';
import api from '@/lib/axios';
import { isBrowser } from '@/lib/utils';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  logout: () => Promise<void>;
}

const getStorageToken = (key: string) => {
  if (isBrowser()) {
    return localStorage.getItem(key);
  }
  return null;
};

const setStorageToken = (key: string, value: string | null) => {
  if (isBrowser()) {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setUser: (user) => set({ user }),
      setAccessToken: (token) => {
        setStorageToken('accessToken', token);
        set({ accessToken: token });
      },
      setRefreshToken: (token) => {
        setStorageToken('refreshToken', token);
        set({ refreshToken: token });
      },
      logout: async () => {
        try {
          const token = getStorageToken('accessToken');
          if (token) {
            await api.post('/auth/logout');
          }
        } catch {
          // Ignore error
        } finally {
          setStorageToken('accessToken', null);
          setStorageToken('refreshToken', null);
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
      storage: createJSONStorage(() => ({
        getItem: (key) => {
          if (isBrowser()) {
            return localStorage.getItem(key);
          }
          return null;
        },
        setItem: (key, value) => {
          if (isBrowser()) {
            localStorage.setItem(key, value);
          }
        },
        removeItem: (key) => {
          if (isBrowser()) {
            localStorage.removeItem(key);
          }
        },
      })),
      skipHydration: true,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
); 