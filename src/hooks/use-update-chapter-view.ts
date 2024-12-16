import { useEffect } from "react";
import api from "@/lib/axios";

const VIEWED_CHAPTERS_KEY = "viewed_chapters";
const MINUTES_LIMIT = 30;

interface ViewedChapter {
  id: string;
  timestamp: number;
}

export const useUpdateChapterView = (chapterId: string | undefined) => {
  useEffect(() => {
    if (!chapterId) return;

    const viewedChapters: ViewedChapter[] = JSON.parse(
      localStorage.getItem(VIEWED_CHAPTERS_KEY) || "[]"
    );

    const viewedChapter = viewedChapters.find(chapter => chapter.id === chapterId);
    const now = Date.now();

    if (viewedChapter && now - viewedChapter.timestamp < MINUTES_LIMIT * 60 * 1000) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        await api.post(`/chapters/${chapterId}/update-view`);
        
        const updatedChapters = viewedChapters
          .filter(chapter => 
            chapter.id !== chapterId && 
            now - chapter.timestamp < MINUTES_LIMIT * 60 * 1000
          )
          .concat({
            id: chapterId,
            timestamp: now
          });

        localStorage.setItem(VIEWED_CHAPTERS_KEY, JSON.stringify(updatedChapters));
      } catch (error) {
        console.error("Failed to update chapter view:", error);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [chapterId]);
}; 