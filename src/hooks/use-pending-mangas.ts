import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface PendingManga {
  _id: string;
  title: string;
  description: string;
  coverImg: string;
  bannerImg: string;
  author: string;
  genre: {
    _id: string;
    name: string;
  }[];
  uploader: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface PendingMangasResponse {
  mangas: PendingManga[];
  total: number;
  page: number;
  totalPages: number;
}

interface UsePendingMangasOptions {
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function usePendingMangas({
  page = 1,
  limit = 10,
  enabled = true,
}: UsePendingMangasOptions = {}) {
  return useQuery({
    queryKey: ["pending-mangas", page, limit],
    queryFn: async () => {
      const { data } = await api.get<PendingMangasResponse>(
        `/manga/admin/pending`,
        {
          params: {
            page,
            limit,
          },
        }
      );
      return data;
    },
    enabled,
  });
} 