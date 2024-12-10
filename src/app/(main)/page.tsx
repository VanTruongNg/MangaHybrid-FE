"use client";

import { useHome } from "@/hooks/use-home";
import { MangaCarousel } from "@/components/manga/manga-carousel";
import { useGradientStore } from "@/store/use-gradient-store";
import { Suspense } from "react";
import MainLoading from "./loading";
import { RecentUpdatesSection } from "@/components/manga/recent-updates-section";
import { FeaturedSection } from "@/components/manga/featured-section";

function MainContent() {
  const { isLoading, recentUpdated, topAllTime, weeklyTop, monthlyTop } =
    useHome();

  const gradientColor = useGradientStore((state) => state.color);

  if (isLoading) {
    return <MainLoading />;
  }

  return (
    <div className="relative min-h-screen">
      {/* Hero Section with Custom Gradient */}
      <div className="relative w-full h-[65vh] -mt-[64px]">
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

        <div className="pt-[25vh] space-y-24">
          <FeaturedSection
            items={topAllTime}
            weeklyTop={weeklyTop}
            monthlyTop={monthlyTop}
          />
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
