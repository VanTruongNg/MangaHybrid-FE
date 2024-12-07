import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MangaItem } from '@/types/manga';

interface RandomMangaStore {
  data: MangaItem[] | null;
  timestamp: number | null;
  setRandomManga: (data: MangaItem[]) => void;
  isValidCache: () => boolean;
}

export const useRandomMangaStore = create<RandomMangaStore>()(
  persist(
    (set, get) => ({
      data: null,
      timestamp: null,
      setRandomManga: (data) => set({ data, timestamp: Date.now() }),
      isValidCache: () => {
        const { timestamp } = get();
        if (!timestamp) return false;
        return Date.now() - timestamp < 60 * 60 * 1000;
      },
    }),
    {
      name: 'random-manga-storage',
    }
  )
); 