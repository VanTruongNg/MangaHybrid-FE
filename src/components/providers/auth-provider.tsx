'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { User } from '@/types/user';
import { SessionExpiredDialog } from '@/components/auth/session-expired-dialog';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setAccessToken } = useAuthStore();
  const [sessionExpired, setSessionExpired] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Check session khi mount component
  useQuery({
    queryKey: ['session-check'],
    queryFn: async () => {
      try {
        const { data } = await api.get<User>('/user/me');
        setUser(data);
        return data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            const { data } = await api.post('/auth/refresh-token', { refreshToken });
            setAccessToken(data.accessToken);
            
            const { data: userData } = await api.get<User>('/user/me');
            setUser(userData);
            return userData;
          } catch {
            setSessionExpired(true);
          }
        }
        throw error;
      }
    },
    enabled: !!localStorage.getItem('accessToken'),
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000,
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
      if (pathname === '/login') {
        router.replace('/');
      }
    }
  }, [setAccessToken, pathname, router]);

  return (
    <>
      {children}
      <SessionExpiredDialog isOpen={sessionExpired} />
    </>
  );
} 