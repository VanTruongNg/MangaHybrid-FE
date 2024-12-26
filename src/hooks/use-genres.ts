import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface Genre {
  _id: string;
  name: string;
  manga: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface AddGenreData {
  name: string;
}

interface UpdateGenreData {
  name: string;
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

export function useAddGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddGenreData) => {
      const response = await api.post<Genre>("/genres", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
    },
  });
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateGenreData }) => {
      const response = await api.put<Genre>(`/genres/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
    },
  });
}

export function useDeleteGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/genres/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
    },
  });
} 