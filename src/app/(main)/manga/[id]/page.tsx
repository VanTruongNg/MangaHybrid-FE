"use client";

import { useParams, useRouter } from "next/navigation";
import { useMangaDetail } from "@/hooks/use-manga-detail";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, Heart, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function MangaPage() {
  const params = useParams();
  const router = useRouter();
  const { manga, isLoading, error } = useMangaDetail(params.id as string);

  // Hàm xử lý click vào genre
  const handleGenreClick = (genreId: string) => {
    router.push(`/browse?genre=${genreId}`);
  };

  // Component Button Theo dõi
  const FollowButton = () => {
    const { user } = useAuth();

    return (
      <button
        className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold transition-colors rounded-md border-2 shadow-sm w-full sm:w-auto ${
          user
            ? "bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-75"
        }`}
        disabled={!user}
      >
        <Heart className="w-3.5 h-3.5" fill={user ? "white" : "currentColor"} />
        {user ? "THEO DÕI TRUYỆN" : "ĐĂNG NHẬP ĐỂ THEO DÕI"}
      </button>
    );
  };

  if (isLoading) return <div>Đang tải...</div>;
  if (error) return <div>Có lỗi xảy ra</div>;
  if (!manga) return <div>Không tìm thấy truyện</div>;

  // Lấy thời gian gần nhất từ tất cả các chapter
  let latestUpdate = null;
  try {
    if (manga.chapters?.length) {
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
  } catch (err) {
    console.error("Error formatting date:", err);
  }

  return (
    <div className="relative mt-6 max-w-[1300px] mx-auto px-2">
      {/* Banner Image */}
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

      {/* Container xám bên dưới banner */}
      <div className="relative w-full h-[400px] lg:h-[200px] bg-gray-200 rounded-b-lg py-4 lg:py-0">
        {/* Thời gian cập nhật - Desktop */}
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

      {/* Cover Image - Mobile */}
      <div className="absolute lg:left-24 left-1/2 -translate-x-1/2 lg:translate-x-0 bottom-[500px] lg:bottom-[320px] translate-y-1/2 z-20">
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

      {/* Title & Author - Mobile */}
      <div className="lg:hidden absolute left-1/2 -translate-x-1/2 bottom-[480px] translate-y-1/2 z-10">
        <div className="text-center w-[250px] pt-[220px]">
          <div className="max-h-[150px] overflow-y-auto">
            <h1 className="text-lg font-extrabold text-black/90 break-words">
              {manga.title}
            </h1>
            <div className="text-sm text-gray-800 mt-1 font-head">
              {manga.author}
            </div>
            {latestUpdate && (
              <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-2">
                <Clock className="w-4 h-4" />
                {latestUpdate}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thông tin manga */}
      <div className="absolute lg:left-[calc(19rem+2rem)] left-1/2 -translate-x-1/2 lg:translate-x-0 bottom-[570px] lg:bottom-[380px] translate-y-1/2 z-10">
        <div className="hidden lg:flex text-center lg:text-left w-full lg:w-auto flex-col">
          <div className="text-xs lg:text-base text-black/75 lg:text-gray-200 lg:opacity-75 -mb-1 lg:mb-1 translate-y-3 lg:translate-y-0 order-2 lg:order-1">
            {manga.author}
          </div>
          <h1 className="text-base lg:text-2xl font-extrabold text-black lg:text-white translate-y-3 lg:translate-y-0 order-1 lg:order-2">
            {manga.title}
          </h1>
        </div>
      </div>

      {/* Mobile & Tablet Content */}
      <div className="lg:hidden space-y-4 mt-4">
        {/* Genres - Mobile */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[295px] z-10 w-full">
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
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[180px] sm:bottom-[250px] z-10 w-full">
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
