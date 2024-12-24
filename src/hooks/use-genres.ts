import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface Genre {
  _id: string;
  name: string;
  manga: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      const { data } = await api.get<Genre[]>("/genres");
      return data;
    },
  });
} 