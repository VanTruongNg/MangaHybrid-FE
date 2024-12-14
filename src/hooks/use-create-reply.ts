import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

interface CreateReplyDto {
  content: string;
  mangaId: string;
  parentCommentId: string;
  replyToUserId?: string;
}

export const useCreateReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReplyDto) => {
      const response = await api.post(`/comment/manga/${data.mangaId}`, {
        content: data.content,
        parentCommentId: data.parentCommentId,
        replyToUserId: data.replyToUserId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manga"] });
      queryClient.invalidateQueries({ queryKey: ["commentReplies"] });
    },
  });
}; 