import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Chapter } from "@/types/chapter";

export const useChapterDetail = (chapterId: string | undefined) => {
  const { data, isLoading, error } = useQuery<Chapter>({
    queryKey: ["chapterDetail", chapterId],
    queryFn: async () => {
      if (!chapterId) throw new Error("Chapter ID is required");
      const { data } = await api.get<Chapter>(`/chapters/${chapterId}`);
      return data;
    },
    enabled: !!chapterId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    chapter: data,
    isLoading,
    error,
  };
};
