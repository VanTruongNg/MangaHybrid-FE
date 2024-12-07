"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { useHome } from "@/hooks/use-home";
import { cn } from "@/lib/utils";
import { FastAverageColor } from "fast-average-color";
import { useGradientStore } from "@/store/use-gradient-store";

export function MangaCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { randomManga, isLoading } = useHome();
  const [autoplay] = useState(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
    },
    [autoplay]
  );

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        autoplay.stop();
        emblaApi.scrollTo(index);
        setTimeout(() => {
          autoplay.play();
        }, 300);
      }
    },
    [emblaApi, autoplay]
  );

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });

    return () => {
      emblaApi.destroy();
    };
  }, [emblaApi]);

  const setGradientColor = useGradientStore((state) => state.setColor);
  const fac = new FastAverageColor();

  useEffect(() => {
    if (!randomManga?.[selectedIndex]) return;

    const getImageColor = async () => {
      try {
        const imageUrl =
          randomManga[selectedIndex].bannerImg ??
          randomManga[selectedIndex].coverImg;

        if (!imageUrl) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = document.createElement("img") as HTMLImageElement;
        img.crossOrigin = "anonymous";

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;

          ctx.drawImage(img, 0, 0);

          try {
            const color = fac.getColor(canvas);
            const [r, g, b] = color.value;

            const lighterColor = `rgb(${Math.min(r + 40, 255)}, ${Math.min(
              g + 40,
              255
            )}, ${Math.min(b + 40, 255)})`;
            const darkerColor = `rgb(${Math.floor(r * 0.4)}, ${Math.floor(
              g * 0.4
            )}, ${Math.floor(b * 0.4)})`;

            const gradient = `linear-gradient(
              132deg,
              ${lighterColor} 0%,
              ${color.rgb} 50%,
              ${darkerColor} 100%
            )`;

            setGradientColor(gradient);
          } catch (e) {
            console.error("Error getting color from canvas:", e);
          }
        };

        img.onerror = ((event: string | Event) => {
          console.error("Error loading image:", event);
        }) as OnErrorEventHandler;

        img.src = imageUrl;
      } catch (error) {
        console.error("Error getting image color:", error);
      }
    };

    getImageColor();
  }, [selectedIndex, randomManga, setGradientColor, fac]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex px-4">
          {randomManga.map((manga, index) => (
            <div
              key={manga._id}
              className={cn(
                "flex-[0_0_90%] md:flex-[0_0_70%] pl-4 transition-opacity duration-300",
                "first:pl-0"
              )}
              style={{ opacity: selectedIndex === index ? 1 : 0.3 }}
            >
              <div className="relative aspect-[21/10] overflow-hidden rounded-xl">
                <Image
                  src={manga.bannerImg ?? manga.coverImg ?? "/placeholder.jpg"}
                  alt={manga.title}
                  width={1920}
                  height={912}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 1400px) 65vw"
                  priority
                  quality={100}
                  draggable={false}
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 z-[20] bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-[30]">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white line-clamp-2">
                      {manga.title}
                    </h2>
                    <p className="text-xs md:text-sm lg:text-base text-gray-200 line-clamp-2 max-w-[40%]">
                      {manga.description || "Không có mô tả"}
                    </p>
                  </div>
                  <div className="absolute bottom-6 md:bottom-8 right-6 md:right-8">
                    <button
                      className="relative z-[110] bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 md:px-6 md:py-2 rounded-lg text-sm md:text-base transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      XEM THÔNG TIN
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="relative z-[100] mt-8">
        <div className="flex justify-center gap-2">
          {randomManga.map((_, index) => (
            <button
              key={index}
              type="button"
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                selectedIndex === index
                  ? "bg-primary w-6 cursor-default"
                  : "bg-primary/30 hover:bg-primary/50 active:bg-primary/70 cursor-pointer"
              )}
              onClick={() => scrollTo(index)}
              disabled={selectedIndex === index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
