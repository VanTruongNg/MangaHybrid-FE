import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface RelatedMangaResponse {
  mangas: {
    _id: string;
    title: string;
    coverImg: string;
    chapters: {
      _id: string;
      chapterName: string;
      createdAt: string;
    }[];
  }[];
  totalManga: number;
}

export const useRelatedManga = (uploaderId: string | undefined) => {
  const { data, isLoading } = useQuery<RelatedMangaResponse>({
    queryKey: ["relatedManga", uploaderId],
    queryFn: async () => {
      const { data } = await api.get<RelatedMangaResponse>(
        `/manga/uploader/${uploaderId}`
      );
      return data;
    },
    enabled: !!uploaderId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    relatedManga: data?.mangas || [],
    totalManga: data?.totalManga || 0,
    isLoading,
  };
}; 