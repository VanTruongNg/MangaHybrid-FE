import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MangaItem } from '@/types/manga';

interface MangaStore {
  randomManga: {
    data: MangaItem[] | null;
    timestamp: number | null;
  };
  dailyTop: {
    data: MangaItem[] | null;
    timestamp: number | null;
  };
  weeklyTop: {
    data: MangaItem[] | null;
    timestamp: number | null;
  };
  recentUpdated: {
    data: MangaItem[] | null;
    timestamp: number | null;
  };
  setRandomManga: (data: MangaItem[]) => void;
  setDailyTop: (data: MangaItem[]) => void;
  setWeeklyTop: (data: MangaItem[]) => void;
  setRecentUpdated: (data: MangaItem[]) => void;
  isValidRandomMangaCache: (timestamp: number | null) => boolean;
  isValidMainDataCache: (timestamp: number | null) => boolean;
}

export const useMangaStore = create<MangaStore>()(
  persist(
    (set) => ({
      randomManga: { data: null, timestamp: null },
      dailyTop: { data: null, timestamp: null },
      weeklyTop: { data: null, timestamp: null },
      recentUpdated: { data: null, timestamp: null },

      setRandomManga: (data) => 
        set({ randomManga: { data, timestamp: Date.now() } }),
      setDailyTop: (data) => 
        set({ dailyTop: { data, timestamp: Date.now() } }),
      setWeeklyTop: (data) => 
        set({ weeklyTop: { data, timestamp: Date.now() } }),
      setRecentUpdated: (data) => 
        set({ recentUpdated: { data, timestamp: Date.now() } }),

      isValidRandomMangaCache: (timestamp) => {
        if (!timestamp) return false;
        const now = Date.now();
        return now - timestamp < 60 * 60 * 1000;
      },
      isValidMainDataCache: (timestamp) => {
        if (!timestamp) return false;
        const now = Date.now();
        return now - timestamp < 5 * 60 * 1000;
      },
    }),
    {
      name: 'manga-storage',
    }
  )
); 