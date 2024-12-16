"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Chapter } from "@/types/chapter";

interface SpecialReaderProps {
  chapter: Chapter;
  onNavigate: (chapterId: string) => void;
  onModeChange: (mode: "CLASSIC" | "SPECIAL") => void;
  readingMode: "CLASSIC" | "SPECIAL";
  mangaId: string;
}

export function SpecialReader({
  chapter,
  onNavigate,
  onModeChange,
  readingMode,
  mangaId,
}: SpecialReaderProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const lastScrollTime = useRef(0);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  const scrollToPage = (pageIndex: number) => {
    const container = containerRef.current;
    if (!container || isScrolling.current) return;

    const now = Date.now();
    if (now - lastScrollTime.current < 200) return;
    lastScrollTime.current = now;

    isScrolling.current = true;
    const containerWidth = container.clientWidth;

    container.scrollBy({
      left: (containerWidth / 2) * (pageIndex - currentPage),
      behavior: "smooth",
    });

    setTimeout(() => {
      isScrolling.current = false;
    }, 200);
  };

  const handlePageChange = (direction: "next" | "prev") => {
    if (direction === "next") {
      if (currentPage === chapter.pagesUrl.length - 1) {
        scrollToPage(currentPage + 1);
        return;
      }
      scrollToPage(currentPage + 1);
    } else {
      if (currentPage === -1) {
        if (chapter.navigation.prevChapter) {
          onNavigate(chapter.navigation.prevChapter._id);
        }
        return;
      }
      scrollToPage(currentPage - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling.current) return;

      if (e.key === "ArrowRight") {
        handlePageChange("next");
      } else if (e.key === "ArrowLeft") {
        handlePageChange("prev");
      } else if (e.key === "ArrowUp") {
        if (chapter.navigation.nextChapter) {
          onNavigate(chapter.navigation.nextChapter._id);
        }
      } else if (e.key === "ArrowDown") {
        if (chapter.navigation.prevChapter) {
          onNavigate(chapter.navigation.prevChapter._id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, chapter.navigation, onNavigate, isScrolling]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const children = Array.from(container.children[1].children);
      const containerLeft = container.getBoundingClientRect().left;
      const containerCenter = containerLeft + container.offsetWidth / 2;

      let closestPage = currentPage;
      let minDistance = Infinity;

      children.forEach((child, index) => {
        const rect = child.getBoundingClientRect();
        const childCenter = rect.left + rect.width / 2;
        const distance = Math.abs(childCenter - containerCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestPage =
            index >= chapter.pagesUrl.length
              ? chapter.pagesUrl.length - 1
              : index;
        }
      });

      if (closestPage !== currentPage) {
        setCurrentPage(closestPage);
      }
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [chapter.pagesUrl.length, currentPage]);

  return (
    <div className="fixed inset-0 bg-gray-900 overflow-hidden">
      {/* Main container - giảm z-index xuống */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth outline-none relative z-0"
        tabIndex={0}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.focus();
          }
        }}
      >
        {/* Info page */}
        <div className="flex-shrink-0 w-full h-full snap-center">
          <div className="w-[40%] h-full mx-auto bg-gray-900">
            <div className="w-full h-full flex flex-col">
              <div className="w-full backdrop-blur-sm flex flex-col items-center">
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
                        onClick={() => onModeChange("CLASSIC")}
                        className={`relative px-4 py-1.5 text-xs font-medium rounded-l-[20px] transition-colors z-10 ${
                          readingMode === "CLASSIC"
                            ? "text-white"
                            : "text-gray-300 hover:text-white"
                        }`}
                      >
                        CLASSIC UI
                      </button>
                      <button
                        onClick={() => onModeChange("SPECIAL")}
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

                <div className="w-full px-4 flex justify-center relative">
                  <div className="flex flex-col items-center w-full">
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => router.push(`/manga/${mangaId}`)}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
                      >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-sm font-medium">
                          {chapter.manga.title}
                        </span>
                      </button>

                      <div className="text-xl text-gray-100 mt-4">
                        {chapter.chapterTitle
                          ? `${chapter.chapterName}: ${chapter.chapterTitle}`
                          : chapter.chapterName}
                      </div>
                    </div>

                    {/* Buttons trước */}
                    <div className="flex gap-2 mt-8">
                      <button
                        onClick={() =>
                          chapter.navigation.prevChapter &&
                          onNavigate(chapter.navigation.prevChapter._id)
                        }
                        disabled={!chapter.navigation.prevChapter}
                        className="px-4 py-1.5 bg-gray-800 text-white text-sm rounded-lg font-bold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        CHƯNG TRƯỚC
                      </button>
                      <button
                        onClick={() =>
                          chapter.navigation.nextChapter &&
                          onNavigate(chapter.navigation.nextChapter._id)
                        }
                        disabled={!chapter.navigation.nextChapter}
                        className="px-4 py-1.5 bg-blue-900 text-white text-sm rounded-lg font-bold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        CHƯƠNG SAU
                      </button>
                    </div>

                    {/* Hướng dẫn sau */}
                    <div className="w-full px-4 mt-4 mb-6">
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-gray-300 text-sm">
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-8">
                              <div className="flex items-center gap-2 w-32 justify-end">
                                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">
                                  ←
                                </kbd>
                                <span>Trang trước</span>
                              </div>
                              <div className="flex items-center gap-2 w-32">
                                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">
                                  →
                                </kbd>
                                <span>Trang sau</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-8">
                              <div className="flex items-center gap-2 w-32 justify-end">
                                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">
                                  ↑
                                </kbd>
                                <span>Chương sau</span>
                              </div>
                              <div className="flex items-center gap-2 w-32">
                                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">
                                  ↓
                                </kbd>
                                <span>Chương trước</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pages */}
        <div className="flex-shrink-0 flex gap-4 px-4">
          {chapter.pagesUrl.map((url, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[40vw] h-full snap-center flex items-center justify-center"
            >
              <img
                src={url}
                alt={`Page ${index + 1}`}
                className={`
                  max-w-full h-auto max-h-screen object-contain transition-opacity duration-200
                  ${
                    currentPage === index
                      ? "opacity-100"
                      : "dark:opacity-10 opacity-40"
                  }
                `}
                loading={index < 3 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* Container cuối cùng - giống như info page */}
        <div className="flex-shrink-0 w-full h-full snap-center">
          <div className="w-[40%] h-full mx-auto bg-gray-900">
            <div className="w-full h-full flex flex-col items-center justify-center gap-6">
              <div className="text-gray-600 text-lg">
                Đây là trang cuối cùng
              </div>
              <button
                onClick={() => scrollToPage(-1)}
                className="px-6 py-2 bg-gray-800 text-white text-sm rounded-lg font-bold hover:bg-gray-700 transition-colors"
              >
                LÊN ĐẦU
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient edges - tăng z-index lên */}
      <div
        className="fixed left-0 top-0 bottom-0 w-32 flex items-center group z-10"
        onClick={() => {
          if (!isScrolling.current) {
            handlePageChange("prev");
          }
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <span className="text-white/80 font-medium text-sm pl-4 rotate-[270deg] origin-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          TRANG TRƯỚC
        </span>
      </div>
      <div
        className="fixed right-0 top-0 bottom-0 w-32 flex items-center justify-end group z-10"
        onClick={() => {
          if (!isScrolling.current) {
            handlePageChange("next");
          }
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-l from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <span className="text-white/80 font-medium text-sm pr-4 rotate-90 origin-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          TRANG SAU
        </span>
      </div>
    </div>
  );
}
