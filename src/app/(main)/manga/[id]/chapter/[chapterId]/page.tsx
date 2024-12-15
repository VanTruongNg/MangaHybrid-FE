"use client";

import { useParams, useRouter } from "next/navigation";
import { useChapterDetail } from "@/hooks/use-chapter-detail";
import { useState, useRef, useEffect } from "react";
import { useReadingModeStore } from "@/store/reading-mode.store";
import { ChapterInfo } from "@/components/chapter/chapter-info";

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const { chapter, isLoading } = useChapterDetail(params.chapterId as string);
  const { mode: readingMode } = useReadingModeStore();
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (readingMode === "SPECIAL" && chapter) {
        if (e.key === "ArrowLeft") {
          handlePageChange("prev");
        } else if (e.key === "ArrowRight") {
          handlePageChange("next");
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [readingMode, currentPage, chapter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-[1000px] mx-auto px-4">
          <div className="animate-pulse space-y-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="w-full h-[600px] bg-gray-800 rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!chapter) return null;

  const handleNavigation = (chapterId: string) => {
    router.push(`/manga/${params.id}/chapter/${chapterId}`);
  };

  const handlePageChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentPage((prev) => Math.max(0, prev - 1));
    } else if (direction === "next") {
      setCurrentPage((prev) => Math.min(chapter.pagesUrl.length - 1, prev + 1));
    }
  };

  return (
    <>
      {readingMode === "CLASSIC" && (
        <div className="min-h-screen bg-gray-900">
          <ChapterInfo
            chapter={chapter}
            mangaId={params.id as string}
            onNavigate={handleNavigation}
          />

          <div ref={containerRef} className="max-w-[2400px] mx-auto px-4 pt-64">
            <div className="space-y-4 pb-32">
              {chapter.pagesUrl.map((url, index) => (
                <div
                  key={index}
                  className="relative w-full flex justify-center"
                >
                  <img
                    src={url}
                    alt={`Page ${index + 1}`}
                    className="w-[1000px] h-auto object-contain"
                    loading={index < 3 ? "eager" : "lazy"}
                  />
                </div>
              ))}

              <div className="max-w-[600px] mx-auto space-y-3 pt-16">
                <button
                  onClick={() => 
                    chapter.navigation.nextChapter && 
                    handleNavigation(chapter.navigation.nextChapter._id)
                  }
                  disabled={!chapter.navigation.nextChapter}
                  className="w-full py-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 disabled:hover:bg-blue-900 text-white rounded-lg transition-colors"
                >
                  {chapter.navigation.nextChapter ? (
                    <div className="text-xs font-bold">
                      XEM TIẾP {chapter.navigation.nextChapter.chapterName.toUpperCase()}
                    </div>
                  ) : (
                    <div className="text-base font-bold">ĐÂY LÀ CHƯƠNG MỚI NHẤT</div>
                  )}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => 
                      chapter.navigation.prevChapter && 
                      handleNavigation(chapter.navigation.prevChapter._id)
                    }
                    disabled={!chapter.navigation.prevChapter}
                    className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-gray-800 text-white rounded-lg transition-colors"
                  >
                    <div className="text-xs font-bold">
                      {chapter.navigation.prevChapter ? (
                        <>
                          CHƯƠNG TRƯỚC - {chapter.navigation.prevChapter.chapterName.toUpperCase()}
                        </>
                      ) : (
                        'CHƯƠNG CŨ NHẤT'
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                      });
                    }}
                    className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <div className="text-xs font-bold">LÊN ĐẦU</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {readingMode === "SPECIAL" && (
        <div className="fixed inset-0 bg-gray-900 overflow-hidden">
          {/* Code cho SPECIAL UI sẽ thêm vào đây */}
        </div>
      )}
    </>
  );
}
