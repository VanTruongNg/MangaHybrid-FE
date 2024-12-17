import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useFollowMangaStore } from "@/store/follow-manga.store";

export const useFollowManga = (mangaId: string) => {
  const queryClient = useQueryClient();
  const { addFollowedManga, removeFollowedManga } = useFollowMangaStore();

  return useMutation({
    mutationFn: async ({ action }: { action: 'follow' | 'unfollow' }) => {
      const { data } = await api.post(`/user/manga/${mangaId}/${action}`);
      
      if (action === 'follow') {
        addFollowedManga(mangaId);
      } else {
        removeFollowedManga(mangaId);
      }
      
      return data;
    },
    onError: () => {
      // Rollback store state nếu có lỗi
      queryClient.invalidateQueries({ queryKey: ['manga', mangaId] });
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    }
  });
}; 