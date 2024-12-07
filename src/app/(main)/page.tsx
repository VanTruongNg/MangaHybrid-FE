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
    <div className="relative flex min-h-screen flex-col">
      {/* Hero Section with Custom Gradient */}
      <div className="fixed top-0 inset-x-0 w-full h-[65vh]">
        {/* Main Gradient */}
        <div
          className="absolute inset-0 brightness-75 transition-[background] duration-1000"
          style={{
            background: gradientColor,
          }}
        />
      </div>

      {/* Main Content */}
      <main className="relative flex-1">
        <div className="absolute left-1/2 top-[60vh] -translate-x-1/2 -translate-y-[80%] w-full">
          <MangaCarousel />
        </div>
      </main>
    </div>
  );
}
