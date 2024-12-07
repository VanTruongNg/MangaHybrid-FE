import { useQuery } from "@tanstack/react-query";
import { HomeResponse } from "@/types/manga";
import api from "@/lib/axios";
import { useMangaStore } from "@/store/use-manga-store";

export const useHome = () => {
  const {
    randomManga: cachedRandomManga,
    dailyTop: cachedDailyTop,
    weeklyTop: cachedWeeklyTop,
    recentUpdated: cachedRecentUpdated,
    setRandomManga,
    setDailyTop,
    setWeeklyTop,
    setRecentUpdated,
    isValidRandomMangaCache,
    isValidMainDataCache,
  } = useMangaStore();

  const { data: fullData, isLoading, isError, error } = useQuery<HomeResponse>({
    queryKey: ["home"],
    queryFn: async () => {
      const { data } = await api.get<HomeResponse>("/manga/home");
      setRandomManga(data.randomManga);
      return data;
    },
  });

  const mainDataQuery = useQuery({
    queryKey: ["home", "main"],
    queryFn: async () => {
      if (!fullData) return null;

      const data = {
        dailyTop: fullData.dailyTop,
        weeklyTop: fullData.weeklyTop,
        recentUpdated: fullData.recentUpdated,
      };
      
      setDailyTop(data.dailyTop);
      setWeeklyTop(data.weeklyTop);
      setRecentUpdated(data.recentUpdated);
      
      return data;
    },
    enabled: !!fullData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    initialData: () => ({
      dailyTop: isValidMainDataCache(cachedDailyTop.timestamp) ? cachedDailyTop.data ?? [] : [],
      weeklyTop: isValidMainDataCache(cachedWeeklyTop.timestamp) ? cachedWeeklyTop.data ?? [] : [],
      recentUpdated: isValidMainDataCache(cachedRecentUpdated.timestamp) ? cachedRecentUpdated.data ?? [] : [],
    }),
  });

  return {
    randomManga: isValidRandomMangaCache(cachedRandomManga.timestamp) 
      ? cachedRandomManga.data ?? []
      : fullData?.randomManga ?? [],
    dailyTop: mainDataQuery.data?.dailyTop ?? [],
    weeklyTop: mainDataQuery.data?.weeklyTop ?? [],
    recentUpdated: mainDataQuery.data?.recentUpdated ?? [],
    isLoading: isLoading || mainDataQuery.isLoading,
    isError: isError || mainDataQuery.isError,
    error: error || mainDataQuery.error,
  };
}; 