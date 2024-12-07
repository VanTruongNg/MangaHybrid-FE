"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const banners = [
  {
    id: 1,
    title: "Cô nàng mèo ngủ gật và Chàng trai hướng nội",
    image: "/banners/banner-1.jpg",
    description: "Truyện có mèo siu cute :))",
  },
  {
    id: 2,
    title: "Chainsaw Man",
    image: "/banners/banner-2.jpg",
    description: "Chapter mới đã cập nhật!",
  },
  {
    id: 3,
    title: "Spy x Family",
    image: "/banners/banner-3.jpg",
    description: "Season 2 đã có mặt trên MangaHybrid",
  },
];

export function MangaCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleSlideClick = (index: number) => {
    if (!api || index === current) return;
    api.scrollTo(index);
  };

  return (
    <div className="absolute left-1/2 top-[60vh] -translate-x-1/2 -translate-y-[80%] w-full">
      <div className="pointer-events-none touch-none select-none overflow-hidden">
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
              stopOnMouseEnter: false,
              playOnInit: true,
            }),
          ]}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {banners.map((banner, index) => (
              <CarouselItem
                key={banner.id}
                className="pl-4 basis-[90%] md:basis-[70%] transition-opacity duration-300"
                style={{ opacity: current === index ? 1 : 0.3 }}
              >
                <div className="relative aspect-[21/9] overflow-hidden rounded-xl">
                  <div
                    className="absolute inset-0 z-30 pointer-events-auto cursor-pointer"
                    onClick={() => handleSlideClick(index)}
                  />

                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1400px) 65vw"
                    priority
                    draggable={false}
                  />
                  {/* Dark overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="flex flex-col gap-2">
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white line-clamp-2">
                        {banner.title}
                      </h2>
                      <p className="text-sm md:text-base lg:text-lg text-gray-200">
                        {banner.description}
                      </p>
                      <button
                        className="relative z-40 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 md:px-6 md:py-2 rounded-lg w-fit text-sm md:text-base pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        XEM THÔNG TIN
                      </button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="pointer-events-auto relative z-50 mt-8">
        <div className="flex justify-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                current === index
                  ? "bg-primary w-6 cursor-default"
                  : "bg-primary/30 hover:bg-primary/50 active:bg-primary/70 cursor-pointer"
              )}
              onClick={() => handleSlideClick(index)}
              disabled={current === index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
