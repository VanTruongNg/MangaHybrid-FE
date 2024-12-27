"use client";

import { useEffect, useState } from "react";
import { useDownloadChapter } from "@/hooks/use-download-chapter";
import type { OfflineManga, OfflineChapter } from "@/types/offline";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Trash2, ChevronDown, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function OfflinePage() {
  const router = useRouter();
  const [mangas, setMangas] = useState<OfflineManga[]>([]);
  const [chapters, setChapters] = useState<OfflineChapter[]>([]);
  const [expandedMangaId, setExpandedMangaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {
    getAllOfflineMangas,
    getAllOfflineChapters,
    removeOfflineManga,
    removeOfflineChapter,
  } = useDownloadChapter();

  useEffect(() => {
    const loadOfflineData = async () => {
      try {
        const [mangaData, chapterData] = await Promise.all([
          getAllOfflineMangas(),
          getAllOfflineChapters(),
        ]);
        setMangas(mangaData);
        setChapters(chapterData);
      } catch (error) {
        console.error("Error loading offline data:", error);
        toast.error("Có lỗi khi tải dữ liệu offline");
      } finally {
        setIsLoading(false);
      }
    };

    loadOfflineData();
  }, [getAllOfflineMangas, getAllOfflineChapters]);

  const handleRemoveManga = async (mangaId: string) => {
    try {
      await removeOfflineManga(mangaId);
      setMangas((prev) => prev.filter((manga) => manga.id !== mangaId));
      setChapters((prev) =>
        prev.filter((chapter) => chapter.metadata.mangaId._id !== mangaId)
      );
      toast.success("Đã xóa manga khỏi bộ nhớ offline");
    } catch (error) {
      console.error("Error removing manga:", error);
      toast.error("Có lỗi khi xóa manga");
    }
  };

  const handleRemoveChapter = async (chapterId: string) => {
    try {
      await removeOfflineChapter(chapterId);
      setChapters((prev) => prev.filter((chapter) => chapter.id !== chapterId));
      toast.success("Đã xóa chapter khỏi bộ nhớ offline");
    } catch (error) {
      console.error("Error removing chapter:", error);
      toast.error("Có lỗi khi xóa chapter");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!mangas.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4">
        <div className="text-center space-y-2">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">
            Chưa có manga nào được tải xuống
          </h2>
          <p className="text-muted-foreground">
            Hãy tải manga yêu thích để đọc offline
          </p>
        </div>
        <Button onClick={() => router.push("/browse")} variant="default">
          Khám phá manga
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manga đã tải</h1>
          <p className="text-sm text-muted-foreground">
            Đọc manga mọi lúc, mọi nơi không cần kết nối mạng
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {mangas.map((manga) => {
          const mangaChapters = chapters.filter(
            (chapter) => chapter.metadata.mangaId._id === manga.id
          );

          return (
            <Card key={manga.id}>
              <CardContent className="p-0">
                {/* Manga header */}
                <div className="flex items-center gap-4 p-4">
                  <div
                    className="relative w-16 h-20 rounded-md overflow-hidden cursor-pointer"
                    onClick={() => router.push(`/manga/${manga.id}`)}
                  >
                    {manga.cover && (
                      <Image
                        src={URL.createObjectURL(new Blob([manga.cover]))}
                        alt={manga.metadata.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-lg mb-1 hover:text-primary transition-colors cursor-pointer truncate"
                      onClick={() => router.push(`/manga/${manga.id}`)}
                    >
                      {manga.metadata.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {mangaChapters.length} chapter đã tải
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tải xuống{" "}
                      {formatDistanceToNow(new Date(manga.downloadedAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveManga(manga.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Xóa manga"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setExpandedMangaId(
                          expandedMangaId === manga.id ? null : manga.id
                        )
                      }
                      className="text-muted-foreground"
                    >
                      <ChevronDown
                        className={cn(
                          "w-5 h-5 transition-transform",
                          expandedMangaId === manga.id && "rotate-180"
                        )}
                      />
                    </Button>
                  </div>
                </div>

                {/* Chapter list */}
                {expandedMangaId === manga.id && (
                  <div className="border-t border-border">
                    <ScrollArea className="h-[300px]">
                      {mangaChapters
                        .sort(
                          (a, b) =>
                            new Date(b.downloadedAt).getTime() -
                            new Date(a.downloadedAt).getTime()
                        )
                        .map((chapter) => (
                          <div
                            key={chapter.id}
                            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                          >
                            <div
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() =>
                                router.push(
                                  `/offline/${manga.id}/${chapter.id}`
                                )
                              }
                            >
                              <h4 className="font-medium text-foreground hover:text-primary transition-colors truncate">
                                {chapter.metadata.chapterTitle ||
                                  `Chapter ${chapter.metadata.number}`}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Tải xuống{" "}
                                {formatDistanceToNow(
                                  new Date(chapter.downloadedAt),
                                  {
                                    addSuffix: true,
                                    locale: vi,
                                  }
                                )}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveChapter(chapter.id)}
                              className="text-muted-foreground hover:text-destructive"
                              title="Xóa chapter"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
