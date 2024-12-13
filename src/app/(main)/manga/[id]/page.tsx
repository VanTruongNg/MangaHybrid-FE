"use client";

import { useParams, useRouter } from "next/navigation";
import { useMangaDetail } from "@/hooks/use-manga-detail";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, Heart, BookOpen, Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import MangaLoadingSkeleton from "./loading-skeleton";
import { useState, useRef, useEffect } from "react";
import { useReadingHistoryStore } from "@/store/reading-history.store";

export default function MangaPage() {
  // Hooks & States
  const params = useParams();
  const router = useRouter();
  const { manga, isLoading, error } = useMangaDetail(params.id as string);
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const { isRead } = useReadingHistoryStore();
  const { user } = useAuth();
  const { setReadingHistory } = useReadingHistoryStore();

  useEffect(() => {
    if (user?.readingHistory) {
      setReadingHistory(user.readingHistory);
    }
  }, [user]);

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        const hasContentOverflow =
          contentRef.current.scrollHeight > contentRef.current.offsetHeight;
        setHasOverflow(hasContentOverflow);
      }
    };

    // Kiểm tra ngay khi component mount và khi manga thay đổi
    checkOverflow();

    // Thêm một setTimeout để đảm bảo content đã render xong
    const timer = setTimeout(checkOverflow, 100);

    return () => clearTimeout(timer);
  }, [manga]);

  // Handlers
  const handleGenreClick = (genreId: string) => {
    router.push(`/browse?genre=${genreId}`);
  };

  // Utils
  const getLatestUpdate = () => {
    let latestUpdate = null;
    try {
      if (manga?.chapters?.length) {
        const dates = manga.chapters.map((chapter) => {
          try {
            return new Date(chapter.createdAt).getTime();
          } catch {
            return 0;
          }
        });

        const maxDate = Math.max(...dates);
        if (maxDate > 0) {
          latestUpdate = formatDistanceToNow(new Date(maxDate), {
            addSuffix: true,
            locale: vi,
          });
        }
      }
      return latestUpdate;
    } catch (err) {
      console.error("Error formatting date:", err);
      return null;
    }
  };

  // Components
  const FollowButton = () => {
    const { user } = useAuth();
    const mangaId = params.id as string;
    const isFollowed = user?.followingManga?.some(
      (manga) => manga._id === mangaId
    );

    return (
      <button
        className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold transition-colors rounded-md border-2 shadow-sm w-full sm:w-auto ${
          !user
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-75"
            : isFollowed
            ? "bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-200"
            : "bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
        }`}
        disabled={!user}
      >
        <Heart
          className="w-3.5 h-3.5"
          fill={isFollowed || !user ? "currentColor" : "white"}
        />
        {!user
          ? "ĐĂNG NHẬP ĐỂ THEO DÕI"
          : isFollowed
          ? "ĐÃ THEO DÕI"
          : "THEO DÕI TRUYỆN"}
      </button>
    );
  };

  // Loading & Error states
  if (isLoading) return <MangaLoadingSkeleton />;
  if (error) return <div>Có lỗi xảy ra</div>;
  if (!manga) return <div>Không tìm thấy truyện</div>;

  const latestUpdate = getLatestUpdate();

  // Main render
  return (
    <div className="relative mt-6 max-w-[1300px] mx-auto px-2">
      {/* Banner Section */}
      <div className="relative w-full h-[400px] lg:h-[600px] rounded-t-lg overflow-hidden">
        {manga.bannerImg ? (
          <Image
            src={manga.bannerImg}
            alt={`${manga.title} banner`}
            fill
            className="object-cover object-center"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-5% via-black/50 via-40% to-black" />
      </div>

      {/* Info Section */}
      <div className="relative w-full h-[350px] lg:h-[200px] bg-gray-200 border-2 border-gray-300 py-4 lg:py-0">
        {/* Desktop Content */}
        {latestUpdate && (
          <div className="absolute hidden lg:flex text-left left-[calc(18.4rem+2rem)] top-4 text-sm text-gray-500 z-10 items-center gap-1">
            <Clock className="w-5 h-5" />
            {latestUpdate}
          </div>
        )}

        {/* Genres - Desktop */}
        <div className="absolute hidden lg:flex flex-wrap gap-2 max-w-[800px] left-[calc(18.4rem+2rem)] top-12 z-10">
          {manga.genre?.map((genre) => (
            <div
              key={genre._id}
              className="px-3 py-1 bg-gray-100 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-700"
              onClick={() => handleGenreClick(genre._id)}
              role="button"
              tabIndex={0}
            >
              {genre.name}
            </div>
          ))}
        </div>

        {/* Action Buttons - Desktop */}
        <div className="absolute hidden lg:flex items-center gap-3 left-[calc(18.4rem+2rem)] top-[120px] z-10">
          <FollowButton />
          <button className="w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-xs font-bold text-gray-700 hover:bg-black hover:text-white transition-colors rounded-md shadow-sm">
            <BookOpen className="w-3.5 h-3.5" />
            ĐỌC TỪ CHƯƠNG 1
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative w-full bg-white border-2 border-gray-300 py-4 lg:py-0 rounded-b-lg h-fit min-h-[800px]">
        {/* Combined containers wrapper */}
        <div
          ref={contentRef}
          className={`w-[97%] mx-auto lg:w-[75%] lg:ml-4 lg:mx-0 relative ${
            isExpanded ? "h-auto" : "h-[180px]"
          } overflow-hidden transition-[height] duration-300 ease-in-out`}
        >
          {/* Description container */}
          <div className="bg-gray-200 mt-6 opacity-70 transition-transform duration-300 ease-in-out">
            {/* Author info */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-300">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                {manga.uploader?.avatarUrl ? (
                  <Image
                    src={manga.uploader.avatarUrl}
                    alt={manga.uploader.name}
                    fill
                    className="object-cover"
                    unoptimized={manga.uploader.avatarUrl.includes('googleusercontent.com')}
                  />
                ) : (
                  <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-sm font-extrabold">
                      {manga.uploader?.name?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>
              <span className="font-medium text-black font-extrabold text-sm">
                {manga.uploader?.name || "Unknown Uploader"}
              </span>
            </div>

            {/* Description text */}
            <div className="p-4 text-gray-700">{manga.description}</div>
          </div>

          {/* Dark gray container */}
          <div className="bg-gray-300 opacity-70 transition-transform duration-300 ease-in-out">
            <div className="p-4">
              <h3 className="font-bold text-black mb-2">THÔNG TIN THÊM</h3>
              <div className="space-y-1">
                <div className="text-sm text-gray-700">
                  <span className="font-bold text-black">
                    {manga.chapters?.length || 0}
                  </span>{" "}
                  chương đã đăng
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-bold text-black">
                    {manga.view?.toLocaleString() || 0}
                  </span>{" "}
                  lượt xem
                </div>
              </div>
            </div>
          </div>

          {/* Gradient overlay và button */}
          {hasOverflow && (
            <div className="absolute bottom-0 left-0 right-0">
              {!isExpanded && (
                <div className="h-12 bg-gradient-to-t from-gray-200 to-transparent transition-opacity duration-300" />
              )}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`absolute ${
                  isExpanded ? "relative" : "bottom-0"
                } left-1/2 -translate-x-1/2 text-xs text-gray-500 hover:text-gray-600 font-bold transition-all duration-300`}
              >
                {isExpanded ? "Thu gọn" : "Xem thêm"}
              </button>
            </div>
          )}
        </div>

        {/* Scroll area container */}
        <div className="w-[97%] mx-auto lg:w-[75%] lg:ml-4 lg:mx-0 mt-8 h-[550px] overflow-y-auto bg-white mb-8">
          {/* Chapter list */}
          <div className="space-y-2">
            {manga.chapters
              ?.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              ?.map((chapter, index) => (
                <div
                  key={chapter._id}
                  className={`${
                    index % 2 === 0 ? "bg-gray-200/50" : "bg-white"
                  } hover:bg-gray-200 py-3 px-4 shadow-sm cursor-pointer transition-colors w-full border-l-8 ${
                    isRead(chapter._id) 
                      ? "border-l-blue-500/80" 
                      : "border-l-gray-300/80"
                  } -ml-[1px]`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-base font-bold text-gray-800">
                        {chapter.chapterName}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">
                          {chapter.chapterTitle || <span className="italic text-gray-500/80">Không có tiêu đề</span>}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(chapter.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                          {" - "}
                          {chapter.views?.toLocaleString() || 0} lượt xem
                        </div>
                      </div>
                    </div>
                    <button 
                      className="p-2 text-gray-500 hover:text-gray-700 bg-gray-300 hover:bg-gray-400 rounded-full transition-all"
                      title="Tải xuống"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="absolute lg:left-24 left-1/2 -translate-x-1/2 lg:translate-x-0 top-[270px] lg:top-[290px] translate-y-1/2 z-20">
        <div className="relative w-32 lg:w-56 h-44 lg:h-80 rounded-lg overflow-hidden shadow-lg border-2 border-white">
          {manga.coverImg ? (
            <Image
              src={manga.coverImg}
              alt={`${manga.title} cover`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}
        </div>
      </div>

      {/* Title & Author - Desktop */}
      <div className="absolute hidden lg:block lg:left-[calc(19rem+2rem)] left-1/2 -translate-x-1/2 lg:translate-x-0 top-[600px] lg:top-[500px] translate-y-1/2 z-10">
        <div className="text-gray-200 text-sm mb-1 opacity-75">
          {manga.author}
        </div>
        <h1 className="text-2xl font-extrabold opacity-90">{manga.title}</h1>
      </div>

      {/* Title & Author - Mobile */}
      <div className="lg:hidden absolute left-1/2 -translate-x-1/2 top-[190px] translate-y-1/2 z-10">
        <div className="text-center w-[350px] sm:w-[450px] pt-[220px]">
          <h1 className="text-xl font-bold text-gray-800 mb-1 px-4">
            {manga.title}
          </h1>
          <div className="text-sm text-gray-500 px-4 truncate">
            {manga.author}
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden space-y-4 mt-4">
        {/* Genres - Mobile */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[600px] z-10 w-full">
          <div className="flex flex-wrap justify-center gap-2 px-4">
            {manga.genre?.map((genre) => (
              <div
                key={genre._id}
                className="px-3 py-1 bg-gray-100 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer"
                onClick={() => handleGenreClick(genre._id)}
                role="button"
                tabIndex={0}
              >
                {genre.name}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons - Mobile */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[650px] sm:top-[650px] z-10 w-full">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center gap-2 px-4">
            <div className="w-full sm:w-auto">
              <FollowButton />
            </div>
            <div className="w-full sm:w-auto">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-xs font-bold text-gray-700 hover:bg-black hover:text-white transition-colors rounded-md shadow-sm">
                <BookOpen className="w-3.5 h-3.5" />
                ĐỌC TỪ CHƯƠNG 1
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacing div */}
      <div className="h-32 lg:h-32" />
    </div>
  );
}
