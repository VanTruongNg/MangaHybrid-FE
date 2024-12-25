import { SearchMangaResult, SearchType, SearchUserResult } from "@/types/search";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface UseSearchOptions {
  type: SearchType;
  query: string;
  limit?: number;
  enabled?: boolean;
}

interface SearchMangaResponse {
  results: SearchMangaResult[];
  total: number;
}

interface SearchUserResponse {
  results: SearchUserResult[];
  total: number;
}

type SearchResponse<T extends SearchType> = T extends "manga"
  ? SearchMangaResponse
  : SearchUserResponse;

export function useSearch<T extends SearchType>({ 
  type, 
  query, 
  limit = 5, 
  enabled = true 
}: UseSearchOptions & { type: T }) {
  return useQuery({
    queryKey: ["search", type, query],
    queryFn: async () => {
      if (!query) return null;

      const { data } = await api.get<
        T extends "manga" ? SearchMangaResult[] : SearchUserResult[]
      >(`/search/${type === "manga" ? "manga" : "uploader"}`, {
        params: { query }
      });

      return {
        results: limit ? data.slice(0, limit) : data,
        total: data.length,
      } as SearchResponse<T>;
    },
    enabled: enabled && query.length > 0,
  });
} 