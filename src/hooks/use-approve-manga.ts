import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

interface ApproveResponse {
  message: string;
}

export function useApproveManga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put<ApproveResponse>(`/manga/${id}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-mangas"] });
    },
  });
} 