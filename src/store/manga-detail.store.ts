import { create } from 'zustand';
import type { MangaDetail } from '@/types/manga';

interface MangaDetailStore {
  currentManga: MangaDetail | null;
  setCurrentManga: (manga: MangaDetail | null) => void;
}

export const useMangaDetailStore = create<MangaDetailStore>((set) => ({
  currentManga: null,
  setCurrentManga: (manga) => set({ currentManga: manga }),
})); 