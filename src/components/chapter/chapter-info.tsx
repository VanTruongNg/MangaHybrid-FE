import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useReadingModeStore } from "@/store/reading-mode.store";
import type { Chapter } from "@/types/chapter";

interface ChapterInfoProps {
  chapter: Chapter;
  mangaId: string;
  onNavigate: (chapterId: string) => void;
}

export function ChapterInfo({ chapter, mangaId, onNavigate }: ChapterInfoProps) {
  const router = useRouter();
  const { mode: readingMode, setMode } = useReadingModeStore();

  return (
    <div className="h-32 bg-gray-900 flex flex-col items-center">
      {/* Reading mode selector */}
      <div className="h-24 flex items-center mt-10">
        <div className="bg-gray-700/50 p-0.5 rounded-[20px]">
          <div className="relative flex">
            <div
              className={`absolute inset-y-0 transition-all duration-200 bg-blue-900 ${
                readingMode === "CLASSIC"
                  ? "left-0 right-1/2 rounded-l-[20px]"
                  : "left-1/2 right-0 rounded-r-[20px]"
              }`}
            />
            <button
              onClick={() => setMode("CLASSIC")}
              className={`relative px-4 py-1.5 text-xs font-medium rounded-l-[20px] transition-colors z-10 ${
                readingMode === "CLASSIC"
                  ? "text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              CLASSIC UI
            </button>
            <button
              onClick={() => setMode("SPECIAL")}
              className={`relative px-4 py-1.5 text-xs font-medium rounded-r-[20px] transition-colors z-10 ${
                readingMode === "SPECIAL"
                  ? "text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              SPECIAL UI
            </button>
          </div>
        </div>
      </div>

      {/* Manga title và chapter info */}
      <div className="w-full max-w-[1200px] px-4 flex justify-center relative">
        <div className="flex flex-col items-center w-full">
          {/* Title và chapter info - Responsive */}
          <div className="absolute left-4 md:left-32 lg:left-64 flex flex-col max-w-[90vw] md:max-w-[600px]">
            <button
              onClick={() => router.push(`/manga/${mangaId}`)}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium truncate">{chapter.manga.title}</span>
            </button>

            <div className="text-xl text-gray-100 mt-16 truncate">
              {chapter.chapterTitle
                ? `${chapter.chapterName}: ${chapter.chapterTitle}`
                : chapter.chapterName}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex flex-col gap-2 mt-32">
            <button
              onClick={() =>
                chapter.navigation.nextChapter &&
                onNavigate(chapter.navigation.nextChapter._id)
              }
              disabled={!chapter.navigation.nextChapter}
              className="w-[90vw] md:w-[500px] lg:w-[700px] px-4 py-1.5 bg-blue-900 text-white text-sm rounded-lg font-bold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              CHƯƠNG SAU
            </button>
            <button
              onClick={() =>
                chapter.navigation.prevChapter &&
                onNavigate(chapter.navigation.prevChapter._id)
              }
              disabled={!chapter.navigation.prevChapter}
              className="w-[90vw] md:w-[500px] lg:w-[700px] px-4 py-1.5 bg-gray-800 text-white text-sm rounded-lg font-bold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              CHƯƠNG TRƯỚC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 