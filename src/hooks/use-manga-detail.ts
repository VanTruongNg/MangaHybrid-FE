import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { MangaDetail } from "@/types/manga";
import { useMangaDetailStore } from "@/store/manga-detail.store";

export const useMangaDetail = (mangaId: string) => {
  const { currentManga, setCurrentManga } = useMangaDetailStore();

  const { data, isLoading, error } = useQuery<MangaDetail>({
    queryKey: ["manga", mangaId],
    queryFn: async () => {
      const { data } = await api.get<MangaDetail>(`/manga/${mangaId}`);
      setCurrentManga(data);
      return data;
    },
    enabled: !!mangaId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    manga: data || currentManga,
    isLoading,
    error,
  };
}; 