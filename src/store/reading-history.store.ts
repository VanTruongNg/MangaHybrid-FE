import { create } from "zustand";
import { ReadingHistory } from "@/types/user";

interface ReadingHistoryStore {
  readingHistory: ReadingHistory[];
  setReadingHistory: (history: ReadingHistory[]) => void;
  isRead: (chapterId: string) => boolean;
}

export const useReadingHistoryStore = create<ReadingHistoryStore>((set, get) => ({
  readingHistory: [],
  
  setReadingHistory: (history: ReadingHistory[]) => {
    set({ readingHistory: history });
  },

  isRead: (chapterId: string) => {
    return get().readingHistory.some(
      (history) => history.chapter._id === chapterId
    );
  }
})); 