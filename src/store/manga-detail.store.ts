import { create } from 'zustand';
import type { MangaDetail } from '@/types/manga';

interface MangaDetailStore {
  currentManga: MangaDetail | null;
  setCurrentManga: (manga: MangaDetail | null) => void;
  userRatings: Record<string, number>; // mangaId -> rating score
  setUserRating: (mangaId: string, score: number) => void;
  getUserRating: (mangaId: string) => number | undefined;
}

export const useMangaDetailStore = create<MangaDetailStore>((set, get) => ({
  currentManga: null,
  setCurrentManga: (manga) => set({ currentManga: manga }),
  userRatings: {},
  setUserRating: (mangaId, score) => {
    set((state) => ({
      userRatings: {
        ...state.userRatings,
        [mangaId]: score,
      },
    }));
  },
  getUserRating: (mangaId) => {
    return get().userRatings[mangaId];
  },
})); 