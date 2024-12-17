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
    set({ readingHistory: Array.isArray(history) ? history : [] });
  },

  isRead: (chapterId: string) => {
    const { readingHistory } = get();
    return Array.isArray(readingHistory) && readingHistory.some(history => 
      Array.isArray(history.chapters) && history.chapters.some(chapter => 
        chapter.chapter._id === chapterId
      )
    );
  }
})); 