"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDownloadChapter } from "@/hooks/use-download-chapter";
import type { OfflineManga, OfflineChapter } from "@/types/offline";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function OfflineChapterPage() {
  const params = useParams();
  const router = useRouter();
  const [manga, setManga] = useState<OfflineManga | null>(null);
  const [chapter, setChapter] = useState<OfflineChapter | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getMangaOffline, getOfflineChapter } = useDownloadChapter();

  useEffect(() => {
    const loadOfflineData = async () => {
      try {
        const [mangaData, chapterData] = await Promise.all([
          getMangaOffline(params.mangaId as string),
          getOfflineChapter(params.chapterId as string),
        ]);

        if (!mangaData || !chapterData) {
          toast.error("Không tìm thấy dữ liệu offline");
          router.push(`/manga/${params.mangaId}/chapter/${params.chapterId}`);
          return;
        }

        setManga(mangaData);
        setChapter(chapterData);

        // Tạo URL cho các ảnh từ ArrayBuffer
        const urls = chapterData.pages.map((buffer) =>
          URL.createObjectURL(new Blob([buffer]))
        );
        setImageUrls(urls);
      } catch (error) {
        console.error("Error loading offline data:", error);
        toast.error("Có lỗi khi tải dữ liệu offline");
      } finally {
        setIsLoading(false);
      }
    };

    loadOfflineData();

    // Cleanup URLs khi unmount
    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [
    params.mangaId,
    params.chapterId,
    getMangaOffline,
    getOfflineChapter,
    router,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!manga || !chapter) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-muted-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="font-medium text-sm line-clamp-1">
                {manga.metadata.title}
              </h1>
              <p className="text-xs text-muted-foreground">
                {chapter.metadata.chapterTitle ||
                  `Chapter ${chapter.metadata.number}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter content */}
      <div className="container max-w-4xl mx-auto px-4 pt-24 pb-8">
        <div className="space-y-4">
          {imageUrls.map((url, index) => (
            <div
              key={index}
              className="relative w-full rounded-lg overflow-hidden bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Page ${index + 1}`}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
