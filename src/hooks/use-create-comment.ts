import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

interface CreateCommentDto {
  content: string;
  mangaId: string;
}

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCommentDto) => {
      const response = await api.post(`/comment/manga/${data.mangaId}`, {
        content: data.content,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate manga detail để fetch lại comments mới
      queryClient.invalidateQueries({ queryKey: ["manga"] });
    },
  });
}; 