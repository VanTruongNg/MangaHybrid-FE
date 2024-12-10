import { create } from 'zustand';
import { MangaItem } from '@/types/manga';

interface MangaStore {
  dailyTop: MangaItem[];
  weeklyTop: MangaItem[];
  monthlyTop: MangaItem[];
  topAllTime: MangaItem[];
  recentUpdated: MangaItem[];
  randomManga: MangaItem[];
  setMangaData: (data: {
    dailyTop: MangaItem[];
    weeklyTop: MangaItem[];
    monthlyTop: MangaItem[];
    topAllTime: MangaItem[];
    recentUpdated: MangaItem[];
    randomManga: MangaItem[];
  }) => void;
}

export const useMangaStore = create<MangaStore>((set) => ({
  dailyTop: [],
  weeklyTop: [],
  monthlyTop: [],
  topAllTime: [],
  recentUpdated: [],
  randomManga: [],
  setMangaData: (data) => {
    // Sắp xếp dữ liệu trước khi lưu vào store
    const sortedData = {
      ...data,
      weeklyTop: [...data.weeklyTop].sort((a, b) => (b.weeklyView || 0) - (a.weeklyView || 0)),
      monthlyTop: [...data.monthlyTop].sort((a, b) => (b.monthlyView || 0) - (a.monthlyView || 0)),
      topAllTime: [...data.topAllTime].sort((a, b) => b.view - a.view),
    };
    set(sortedData);
  },
})); 