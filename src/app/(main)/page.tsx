"use client";

import { useHome } from "@/hooks/use-home";
import { MangaCarousel } from "@/components/manga/manga-carousel";
import { useGradientStore } from "@/store/use-gradient-store";

export default function Home() {
  const { isLoading, isError } = useHome();
  const gradientColor = useGradientStore((state) => state.color);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data</div>;

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

        {/* Thêm nội dung để test scroll */}
        <div className="pt-[80vh] space-y-8 p-8">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg border bg-card" />
          ))}
        </div>
      </main>
    </div>
  );
}
