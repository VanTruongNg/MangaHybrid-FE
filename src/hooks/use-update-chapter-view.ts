import { useEffect } from "react";
import api from "@/lib/axios";
import { useReadingHistoryStore } from "@/store/reading-history.store";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

const VIEWED_CHAPTERS_KEY = "viewed_chapters";
const MINUTES_LIMIT = 30;

interface ViewedChapter {
  id: string;
  timestamp: number;
}

export const useUpdateChapterView = (chapterId: string | undefined) => {
  const params = useParams();
  const { readingHistory, setReadingHistory } = useReadingHistoryStore();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!chapterId || !params.id) return;

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

        if (user) {
          const isChapterInHistory = Array.isArray(readingHistory) && readingHistory.some(history => 
            Array.isArray(history.chapters) && history.chapters.some(chapter => 
              chapter.chapter._id === chapterId
            )
          );

          if (!isChapterInHistory) {
            try {
              await api.patch('/user/reading-history', {
                chapterId: chapterId
              });
              
              queryClient.invalidateQueries({ queryKey: ['user'] });
            } catch (error) {
              console.error("Failed to update reading history:", error);
            }
          }
        }
      } catch (error) {
        console.error("Failed to update chapter view:", error);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [chapterId, params.id, readingHistory, setReadingHistory, queryClient, user]);
}; 