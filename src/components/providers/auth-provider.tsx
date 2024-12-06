"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { User } from "@/types/user";
import { AxiosError } from "axios";
import { SessionExpiredDialog } from "@/components/auth/session-expired-dialog";
import { connectSocket } from "@/lib/socket";
import { useSocket } from "@/hooks/use-socket";

const SESSION_CHECK_CONFIG = {
  retry: false,
  refetchOnWindowFocus: false,
  refetchInterval: 5 * 60 * 1000,
} as const;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setAccessToken } = useAuthStore();
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
        if (error instanceof AxiosError && error.response?.status === 401) {
          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
              handleSessionExpired();
              throw new Error("No refresh token");
            }

            const { data } = await api.post("/auth/refresh-token", {
              refreshToken,
            });
            setAccessToken(data.accessToken);

            const { data: userData } = await api.get<User>("/user/me");
            setUser(userData);
            connectSocket();
            return userData;
          } catch {
            handleSessionExpired();
          }
        }
        throw error;
      }
    },
    enabled: !!localStorage.getItem("accessToken"),
    ...SESSION_CHECK_CONFIG,
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setAccessToken(token);
      if (pathname === "/login") {
        router.replace("/");
      }
    }
  }, [setAccessToken, pathname, router]);

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
