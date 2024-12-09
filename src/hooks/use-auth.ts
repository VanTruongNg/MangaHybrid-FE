import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import type { User } from '@/types/user';
import { useCallback } from 'react';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { getDeviceId, removeDeviceId } from '@/lib/device';

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
  const { user, setUser, setAccessToken, setRefreshToken } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get<User>('/user/me');
      setUser(data);
      return data;
    } catch (error) {
      throw error;
    }
  }, [setUser]);

  const handleAuthSuccess = useCallback(async (tokens: LoginResponse) => {
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    
    try {
      const userData = await fetchUser();
      queryClient.setQueryData(QUERY_KEYS.user, userData);
      connectSocket();
      router.push('/');
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }, [setAccessToken, setRefreshToken, fetchUser, queryClient, router]);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => {
      getDeviceId();
      
      return api.post<LoginResponse>('/auth/login', payload, {
        headers: {
          'device-id': getDeviceId()
        }
      }).then(res => res.data);
    },
    onSuccess: handleAuthSuccess,
    onError: () => {
      removeDeviceId();
    }
  });

  const googleLoginMutation = useMutation({
    mutationFn: (payload: GoogleLoginPayload) => {
      getDeviceId();
      
      return api.post<LoginResponse>('/auth/google', payload, {
        headers: {
          'device-id': getDeviceId()
        }
      }).then(res => res.data);
    },
    onSuccess: handleAuthSuccess,
    onError: () => {
      removeDeviceId();
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const currentDeviceId = getDeviceId();
      
      const response = await api.post('/auth/logout', {}, {
        headers: {
          'device-id': currentDeviceId
        }
      });
      
      removeDeviceId();
      
      return response;
    },
    onSuccess: () => {
      disconnectSocket();
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Error logging out:', error);
    }
  });

  return {
    login: loginMutation.mutate,
    googleLogin: googleLoginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoading: loginMutation.isPending || googleLoginMutation.isPending || logoutMutation.isPending,
    user,
  };
} 