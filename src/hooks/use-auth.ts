import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import type { User } from '@/types/user';
import { useCallback } from 'react';
import { connectSocket, disconnectSocket } from '@/lib/socket';

interface LoginPayload {
  email: string;
  password: string;
}

interface GoogleLoginPayload {
  accessToken: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

const QUERY_KEYS = {
  user: ['user']
} as const;

export function useAuth() {
  const { user, setUser, setAccessToken, setRefreshToken, logout: logoutStore } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get<User>('/user/me');
      setUser(data);
      return data;
    } catch (error) {
      logoutStore();
      throw error;
    }
  }, [setUser, logoutStore]);

  const handleAuthSuccess = useCallback(async (tokens: LoginResponse) => {
    console.log('Setting tokens:', tokens);
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    
    try {
      const userData = await fetchUser();
      queryClient.setQueryData(QUERY_KEYS.user, userData);
      connectSocket();
      router.push('/');
    } catch (error) {
      console.error('Error fetching user:', error);
      logoutStore();
      throw error;
    }
  }, [setAccessToken, setRefreshToken, fetchUser, queryClient, router, logoutStore]);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => 
      api.post<LoginResponse>('/auth/login', payload).then(res => res.data),
    onSuccess: handleAuthSuccess,
  });

  const googleLoginMutation = useMutation({
    mutationFn: (payload: GoogleLoginPayload) => 
      api.post<LoginResponse>('/auth/google', payload).then(res => res.data),
    onSuccess: handleAuthSuccess,
  });

  const logout = useCallback(async () => {
    disconnectSocket();
    await logoutStore();
    queryClient.clear();
    router.replace('/login');
  }, [logoutStore, queryClient, router]);

  return {
    login: loginMutation.mutate,
    googleLogin: googleLoginMutation.mutate,
    isLoading: loginMutation.isPending || googleLoginMutation.isPending,
    user,
    logout,
  };
} 