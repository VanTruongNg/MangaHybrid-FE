"use client";

import { useParams, useRouter } from "next/navigation";
import { useMangaDetail } from "@/hooks/use-manga-detail";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, Heart, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import MangaLoadingSkeleton from './loading-skeleton';

export default function MangaPage() {
  // Hooks & States
  const params = useParams();
  const router = useRouter();
  const { manga, isLoading, error } = useMangaDetail(params.id as string);

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
      <div className="relative w-full h-[400px] lg:h-[200px] bg-gray-200 border-2 border-gray-300 py-4 lg:py-0">
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
      <div className="relative w-full h-[900px] bg-white border-2 border-gray-300 py-4 lg:py-0 rounded-b-lg">
        {/* Container xám */}
        <div className="w-[97%] mx-auto lg:w-[75%] lg:ml-4 lg:mx-0 bg-gray-200 h-[30%] rounded-lg mt-6 opacity-70">
          {/* Nội dung cho container xám */}
        </div>

        {/* Scroll area container */}
        <div className="w-[97%] mx-auto lg:w-[75%] lg:ml-4 lg:mx-0 mt-8 max-h-[60%] h-fit overflow-y-auto rounded-lg bg-gray-200">
          {/* Nội dung có thể scroll */}
          <div className="space-y-4 p-4">
            {/* Mock data */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold">Chapter {item}</h3>
                <p className="text-gray-600">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
                  voluptates, quod, voluptate, voluptas quae quidem quibusdam
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="absolute lg:left-24 left-1/2 -translate-x-1/2 lg:translate-x-0 bottom-[1400px] lg:bottom-[1220px] translate-y-1/2 z-20">
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

      {/* Mobile Content */}
      <div className="lg:hidden space-y-4 mt-4">
        {/* Genres - Mobile */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[1190px] z-10 w-full">
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
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[1100px] sm:bottom-[1120px] z-10 w-full">
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
