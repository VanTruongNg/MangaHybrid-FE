import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { toast } from "sonner";

interface RateMangaParams {
  mangaId: string;
  rating: number;
}

export const useRateManga = (mangaId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rating }: Omit<RateMangaParams, "mangaId">) => {
      await axios.post(`/rating/manga/${mangaId}`, {
        score: rating,
      });
    },
    onSuccess: () => {
      toast.success("Đánh giá thành công");
      queryClient.invalidateQueries({
        queryKey: ["manga", mangaId],
      });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Có lỗi xảy ra";
      toast.error(errorMessage);
    },
  });
}; 