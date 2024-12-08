import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { HomeResponse } from "@/types/manga";

export function useHome() {
  const { data, isLoading, isError, error } = useQuery<HomeResponse>({
    queryKey: ["home"],
    queryFn: async () => {
      const { data } = await api.get<HomeResponse>("/manga/home/web");
      return data;
    },
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  return {
    dailyTop: data?.dailyTop ?? [],
    weeklyTop: data?.weeklyTop ?? [],
    recentUpdated: data?.recentUpdated ?? [],
    randomManga: data?.randomManga ?? [],
    topAllTime: data?.topAllTime ?? [],
    isLoading,
    isError,
    error,
  };
} 