"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { MangaItem } from "@/types/manga";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

interface FeaturedSectionProps {
  items: MangaItem[];
  weeklyTop: MangaItem[];
  monthlyTop: MangaItem[];
}

interface MangaItemWithOrder extends MangaItem {
  displayOrder: number;
}

function formatChapterName(chapterName: string | undefined) {
  if (!chapterName) return "";
  const match = chapterName.match(/\d+/);
  return match ? `CHƯƠNG ${match[0]}` : chapterName;
}

function formatTimeAgo(date: Date) {
  if (!date) return "";
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  if (months > 0) return "MỘT THÁNG TRƯỚC";
  if (days > 0) return `${days} NGÀY TRƯỚC`;
  if (hours > 0) return `${hours} GIỜ TRƯỚC`;
  return `${minutes} PHÚT TRƯỚC`;
}

function formatTitle(title: string) {
  const match = title.match(/^(.+?)(?:\s*\((.*?)\))?$/);
  if (!match) return title;

  const [, mainTitle, subtitle] = match;
  if (!subtitle) return mainTitle;

  return (
    <span>
      {mainTitle} <span className="text-muted-foreground">({subtitle})</span>
    </span>
  );
}

function arrangeInRows(items: MangaItem[]) {
  const result = {
    row1: [] as MangaItemWithOrder[],
    row2: [] as MangaItemWithOrder[],
    row3: [] as MangaItemWithOrder[],
  };

  items.forEach((item, index) => {
    const rowIndex = index % 3;
    const colIndex = Math.floor(index / 3);

    const itemWithOrder = {
      ...item,
      displayOrder: colIndex * 3 + rowIndex + 1,
    } as MangaItemWithOrder;

    switch (rowIndex) {
      case 0:
        result.row1.push(itemWithOrder);
        break;
      case 1:
        result.row2.push(itemWithOrder);
        break;
      case 2:
        result.row3.push(itemWithOrder);
        break;
    }
  });

  return result;
}

export function FeaturedSection({
  items,
  weeklyTop,
  monthlyTop,
}: FeaturedSectionProps) {
  const [currentTab, setCurrentTab] = useState<"week" | "month" | "all">(
    "week"
  );

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

    const scrollProgress = emblaApi.scrollProgress();
    const canScrollPrev = emblaApi.canScrollPrev();
    const canScrollNext = emblaApi.canScrollNext();

    setPrevBtnVisible(canScrollPrev && Math.abs(scrollProgress - 1) < 0.01);
    setNextBtnVisible(canScrollNext && Math.abs(scrollProgress) < 0.01);

    const isAtStart = Math.abs(scrollProgress) < 0.01;
    const isAtEnd = Math.abs(scrollProgress - 1) < 0.01;
    const isInMiddle = !isAtStart && !isAtEnd;

    if (isInMiddle) {
      setShowLeftGradient(true);
      setShowRightGradient(true);
    } else {
      setShowLeftGradient(canScrollPrev);
      setShowRightGradient(canScrollNext);
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    updateButtons();
    emblaApi.on("scroll", updateButtons);
    emblaApi.on("settle", updateButtons);
    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);
    emblaApi.on("resize", updateButtons);

    return () => {
      emblaApi.off("scroll", updateButtons);
      emblaApi.off("settle", updateButtons);
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

  const getCurrentItems = () => {
    switch (currentTab) {
      case "week":
        return weeklyTop;
      case "month":
        return monthlyTop;
      case "all":
        return items;
      default:
        return weeklyTop;
    }
  };

  const getViewCount = (manga: MangaItem) => {
    switch (currentTab) {
      case "week":
        return manga.weeklyView || 0;
      case "month":
        return manga.monthlyView || 0;
      case "all":
        return manga.view;
      default:
        return manga.weeklyView || 0;
    }
  };

  const displayItems = getCurrentItems();
  const rows = arrangeInRows(displayItems);

  return (
    <div className="overflow-x-hidden">
      <section className="-mx-8 sm:-mx-12 md:-mx-16 lg:-mx-32 py-12 sm:py-16 md:py-20 lg:py-24 [background-color:#3B82F61A]">
        <div className="container">
          <h2 className="text-xl font-bold text-muted-foreground uppercase tracking-tight mb-6 mt-8">
            TRUYỆN NỔI BẬT
          </h2>
        </div>

        <div className="container py-6">
          <div className="rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-end">
              <Tabs
                defaultValue="week"
                className="w-[400px]"
                onValueChange={(value) =>
                  setCurrentTab(value as "week" | "month" | "all")
                }
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="week">TUẦN</TabsTrigger>
                  <TabsTrigger value="month">THÁNG</TabsTrigger>
                  <TabsTrigger value="all">MỌI LÚC</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="relative group/buttons">
              <div className="relative overflow-hidden" ref={emblaRef}>
                {showLeftGradient && (
                  <div
                    className={cn(
                      "absolute left-0 top-0 bottom-0 w-24 pointer-events-none z-[1] transition-all duration-300",
                      "bg-gradient-to-r from-blue-500/10 to-transparent",
                      "group-hover/buttons:from-blue-500/10"
                    )}
                  />
                )}
                {showRightGradient && (
                  <div
                    className={cn(
                      "absolute right-0 top-0 bottom-0 w-24 pointer-events-none z-[1] transition-all duration-300",
                      "bg-gradient-to-l from-blue-500/10 to-transparent",
                      "group-hover/buttons:from-blue-500/10"
                    )}
                  />
                )}

                <div className="flex flex-col gap-4 min-w-0">
                  {Object.entries(rows).map(([key, rowItems]) => (
                    <div key={key} className="flex gap-4 min-w-max">
                      {rowItems.map((manga) => (
                        <Card
                          key={manga._id}
                          className="group overflow-hidden bg-white/5 hover:bg-white/10 transition-colors border-none backdrop-blur-sm relative flex-none w-[450px] h-[120px]"
                        >
                          <div className="absolute right-2 top-2 z-10">
                            <span className="text-[3rem] font-bold text-blue-500/20">
                              {String(manga.displayOrder).padStart(2, "0")}
                            </span>
                          </div>
                          <Link href={`/manga/${manga._id}`}>
                            <CardContent className="h-full p-3">
                              <div className="flex gap-4 h-full items-center">
                                <div className="relative aspect-[3/4] h-[100px]">
                                  <Image
                                    src={
                                      manga.coverImg ||
                                      "/images/placeholder.jpg"
                                    }
                                    alt={manga.title}
                                    fill
                                    className="object-cover rounded"
                                    sizes="100px"
                                  />
                                </div>
                                <div className="flex-1 min-w-0 space-y-2">
                                  <h3 className="text-sm font-black line-clamp-2 -mt-3">
                                    {formatTitle(manga.title)}
                                  </h3>
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase">
                                      {formatChapterName(manga.chapterName)} -{" "}
                                      {formatTimeAgo(manga.latestUpdate!)}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                      <Eye className="h-3.5 w-3.5" />
                                      <span className="text-xs">
                                        {getViewCount(manga).toLocaleString()}{" "}
                                        LƯỢT XEM
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

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
          </div>
        </div>
      </section>
    </div>
  );
}
