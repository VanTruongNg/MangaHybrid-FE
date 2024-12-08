"use client";

import { MangaItem } from "@/types/manga";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface RecentUpdatesSectionProps {
  items: MangaItem[];
}

function formatChapterName(chapterName: string | undefined) {
  if (!chapterName) return "C. ?";

  if (
    chapterName.toLowerCase().includes("oneshot") ||
    chapterName.toLowerCase().includes("special")
  ) {
    return chapterName.replace("Chap", "C.");
  }

  return chapterName.replace("Chap", "C.");
}

export function RecentUpdatesSection({ items }: RecentUpdatesSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const [prevBtnVisible, setPrevBtnVisible] = useState(false);
  const [nextBtnVisible, setNextBtnVisible] = useState(true);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);

  const updateButtons = useCallback(() => {
    if (!emblaApi) return;

    setPrevBtnVisible(emblaApi.canScrollPrev());
    setNextBtnVisible(emblaApi.canScrollNext());
    setShowLeftGradient(emblaApi.canScrollPrev());
    setShowRightGradient(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    updateButtons();

    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);
    emblaApi.on("resize", updateButtons);

    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
      emblaApi.off("resize", updateButtons);
    };
  }, [emblaApi, updateButtons]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const arrangeInZigzag = (items: MangaItem[]) => {
    const result = {
      top: [] as MangaItem[],
      bottom: [] as MangaItem[],
    };

    items.forEach((item, index) => {
      if (index % 2 === 0) {
        result.top.push(item);
      } else {
        result.bottom.push(item);
      }
    });

    return result;
  };

  const rows = arrangeInZigzag(items);

  return (
    <section className="container space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-muted-foreground uppercase">
          Mới cập nhật
        </h2>
        <Link
          href="/manga/recent"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Xem danh sách truyện
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative group/buttons">
        <div className="relative overflow-hidden" ref={emblaRef}>
          {/* Gradient overlays */}
          {showLeftGradient && (
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background/90 to-transparent pointer-events-none z-[1] transition-all duration-300",
                "group-hover/buttons:from-background/100"
              )}
            />
          )}
          {showRightGradient && (
            <div
              className={cn(
                "absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background/90 to-transparent pointer-events-none z-[1] transition-all duration-300",
                "group-hover/buttons:from-background/100"
              )}
            />
          )}

          <div className="flex flex-col gap-4 min-w-0">
            {/* Top row */}
            <div className="flex gap-4 min-w-max">
              {rows.top.map((manga) => (
                <Link
                  key={manga._id}
                  href={`/manga/${manga._id}`}
                  className="group space-y-2 w-[160px] flex-shrink-0"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-md">
                    <Image
                      src={manga.coverImg ?? "/placeholder.jpg"}
                      alt={manga.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="160px"
                    />
                    <div className="absolute top-1 left-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white/90">
                      {formatChapterName(manga.chapterName)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold line-clamp-1 text-sm transition-colors group-hover:text-primary">
                      {manga.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(manga.latestUpdate!)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom row */}
            <div className="flex gap-4 min-w-max">
              {rows.bottom.map((manga) => (
                <Link
                  key={manga._id}
                  href={`/manga/${manga._id}`}
                  className="group space-y-2 w-[160px] flex-shrink-0"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-md">
                    <Image
                      src={manga.coverImg ?? "/placeholder.jpg"}
                      alt={manga.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="160px"
                    />
                    <div className="absolute top-1 left-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white/90">
                      {formatChapterName(manga.chapterName)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold line-clamp-1 text-sm transition-colors group-hover:text-primary">
                      {manga.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(manga.latestUpdate!)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        {prevBtnVisible && (
          <button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-1.5 rounded-full shadow-md hover:bg-background transition-all duration-300 z-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {nextBtnVisible && (
          <button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-1.5 rounded-full shadow-md hover:bg-background transition-all duration-300 z-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </section>
  );
}

function formatTimeAgo(date: Date) {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (minutes < 60) {
    return `${minutes} PHÚT TRƯỚC`;
  }

  if (hours < 24) {
    return `${hours} GIỜ TRƯỚC`;
  }

  if (days < 30) {
    return `${days} NGÀY TRƯỚC`;
  }

  if (months < 12) {
    return `${months} THÁNG TRƯỚC`;
  }

  return `${years} NĂM TRƯỚC`;
}
