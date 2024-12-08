"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { User } from "@/types/user";
import { SessionExpiredDialog } from "@/components/auth/session-expired-dialog";
import { connectSocket } from "@/lib/socket";
import { useSocket } from "@/hooks/use-socket";
import { isBrowser } from "@/lib/utils";

const SESSION_CHECK_CONFIG = {
  retry: false,
  refetchOnWindowFocus: false,
  refetchInterval: 5 * 60 * 1000,
} as const;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setAccessToken, setRefreshToken } = useAuthStore();
  const [sessionExpired, setSessionExpired] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useSocket();

  const handleSessionExpired = useCallback(() => {
    setSessionExpired(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSessionExpired(false);
  }, []);

  useQuery({
    queryKey: ["session-check"],
    queryFn: async () => {
      try {
        const { data } = await api.get<User>("/user/me");
        setUser(data);
        connectSocket();
        return data;
      } catch (error) {
        handleSessionExpired();
        throw error;
      }
    },
    enabled: isBrowser() ? !!localStorage.getItem("accessToken") : false,
    ...SESSION_CHECK_CONFIG,
  });

  useEffect(() => {
    if (!isBrowser()) return;
    
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken) {
      setAccessToken(accessToken);
    }
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }

    if (accessToken && pathname === "/login") {
      router.replace("/");
    }
  }, [setAccessToken, setRefreshToken, pathname, router]);

  return (
    <>
      {children}
      <SessionExpiredDialog
        isOpen={sessionExpired}
        onClose={handleCloseDialog}
      />
    </>
  );
}
