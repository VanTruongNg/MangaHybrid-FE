import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface CommentReplyDetail {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatarUrl: string;
  };
  replyToUser?: {
    _id: string;
    name: string;
  };
  content: string;
  createdAt: string;
  mentions: {
    userId: {
      _id: string;
      name: string;
    };
    username: string;
    startIndex: number;
    endIndex: number;
  }[];
  manga?: string;
  chapter?: string;
  parentComment?: string;
}

export const useCommentReplies = (commentId: string | undefined) => {
  const { data, isLoading, refetch } = useQuery<CommentReplyDetail[]>({
    queryKey: ["commentReplies", commentId],
    queryFn: async () => {
      if (!commentId) return [];
      const { data } = await api.get<CommentReplyDetail[]>(
        `/comment/replies/${commentId}`
      );
      return data;
    },
    enabled: !!commentId, // Chỉ fetch khi có commentId
  });

  return {
    replies: data || [],
    isLoading,
    fetchReplies: refetch,
  };
}; 