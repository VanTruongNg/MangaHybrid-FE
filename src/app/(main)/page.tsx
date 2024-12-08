"use client";

import { useHome } from "@/hooks/use-home";
import { MangaCarousel } from "@/components/manga/manga-carousel";
import { useGradientStore } from "@/store/use-gradient-store";
import { Suspense } from "react";
import MainLoading from "./loading";
import { RecentUpdatesSection } from "@/components/manga/recent-updates-section";

function MainContent() {
  const { isLoading, isError, error, recentUpdated } = useHome();
  const gradientColor = useGradientStore((state) => state.color);

  if (isLoading) return <MainLoading />;
  
  if (isError) {
    console.error('Error loading home data:', error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">
          Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Hero Section with Custom Gradient */}
      <div className="relative w-full h-[65vh] -mt-[64px]">
        {/* Main Gradient */}
        <div
          className="absolute inset-0 brightness-75 transition-[background] duration-1000"
          style={{
            background: gradientColor,
          }}
        />
      </div>

      {/* Main Content */}
      <main>
        <div className="absolute left-1/2 top-[65vh] -translate-x-1/2 -translate-y-[80%] w-full">
          <MangaCarousel />
        </div>

        <div className="pt-[25vh]">
          <RecentUpdatesSection items={recentUpdated} />
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<MainLoading />}>
      <MainContent />
    </Suspense>
  );
}
