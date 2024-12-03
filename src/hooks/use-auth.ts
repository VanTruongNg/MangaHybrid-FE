import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import type { User } from '@/types/user';
import { useCallback } from 'react';

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

  const { isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    enabled: !!localStorage.getItem('accessToken') && !user,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnMount: false,
  });

  const handleAuthSuccess = useCallback(async (tokens: LoginResponse) => {
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    
    try {
      const userData = await fetchUser();
      queryClient.setQueryData(['user'], userData);
      router.push('/');
    } catch (error) {
      logoutStore();
      throw error;
    }
  }, [setAccessToken, setRefreshToken, fetchUser, queryClient, router, logoutStore]);

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post<LoginResponse>('/auth/login', payload);
      return data;
    },
    onSuccess: handleAuthSuccess,
  });

  const googleLoginMutation = useMutation({
    mutationFn: async (payload: GoogleLoginPayload) => {
      const { data } = await api.post<LoginResponse>('/auth/google', payload);
      return data;
    },
    onSuccess: handleAuthSuccess,
  });

  const logout = useCallback(async () => {
    await logoutStore();
    queryClient.clear();
    router.replace('/login');
  }, [logoutStore, queryClient, router]);

  return {
    login: loginMutation.mutate,
    googleLogin: googleLoginMutation.mutate,
    isLoading: loginMutation.isPending || googleLoginMutation.isPending || isLoadingUser,
    user,
    logout,
  };
} 