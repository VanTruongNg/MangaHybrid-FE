import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { HomeResponse } from "@/types/manga";
import { useMangaStore } from "@/store/manga.store";

export function useHome() {
  const setMangaData = useMangaStore((state) => state.setMangaData);
  const {
    dailyTop,
    weeklyTop,
    monthlyTop,
    topAllTime,
    recentUpdated,
    randomManga,
  } = useMangaStore();

  useQuery<HomeResponse>({
    queryKey: ["home"],
    queryFn: async () => {
      const { data } = await api.get<HomeResponse>("/manga/home/web");
      
      // Cập nhật store ngay sau khi có dữ liệu
      setMangaData({
        dailyTop: data.dailyTop,
        weeklyTop: data.weeklyTop,
        monthlyTop: data.monthlyTop,
        topAllTime: data.topAllTime,
        recentUpdated: data.recentUpdated,
        randomManga: data.randomManga,
      });

      return data;
    },
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  return {
    dailyTop,
    weeklyTop,
    monthlyTop,
    topAllTime,
    recentUpdated,
    randomManga,
    isLoading: !dailyTop.length, // Sử dụng length của data để check loading
    isError: false,
    error: null,
  };
} 