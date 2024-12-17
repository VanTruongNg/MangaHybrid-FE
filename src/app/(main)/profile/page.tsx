"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { Grid, BookOpen, Heart, Settings } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <Skeleton className="w-32 h-32 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Avatar */}
        <div className="flex justify-center md:justify-start">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                fill
                className="object-cover"
                unoptimized={user.avatarUrl.includes("googleusercontent.com")}
              />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user.name[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1">
          {/* Username and Settings */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <h1 className="text-xl font-medium">{user.name}</h1>
            <button
              onClick={() => router.push('/settings')}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Chỉnh sửa
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-6 justify-center md:justify-start">
            <div className="flex gap-1 items-baseline">
              <span className="font-semibold">{user.uploadedManga?.length || 0}</span>
              <span className="text-sm text-gray-500">truyện đã đăng</span>
            </div>
            <div className="flex gap-1 items-baseline">
              <span className="font-semibold">{user.followers?.length || 0}</span>
              <span className="text-sm text-gray-500">người theo dõi</span>
            </div>
            <div className="flex gap-1 items-baseline">
              <span className="font-semibold">{user.following?.length || 0}</span>
              <span className="text-sm text-gray-500">đang theo dõi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t">
        <Tabs defaultValue="uploaded" className="w-full">
          <TabsList className="w-full flex items-center justify-center gap-12 h-14 bg-transparent">
            <TabsTrigger 
              value="uploaded"
              className="flex flex-col items-center gap-1.5 text-gray-400 data-[state=active]:text-blue-500 transition-colors"
            >
              <Grid className="w-5 h-5" />
              <span className="text-xs font-medium tracking-wider">TRUYỆN ĐÃ ĐĂNG</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reading"
              className="flex flex-col items-center gap-1.5 text-gray-400 data-[state=active]:text-blue-500 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-xs font-medium tracking-wider">ĐANG ĐỌC</span>
            </TabsTrigger>
            <TabsTrigger 
              value="favorites"
              className="flex flex-col items-center gap-1.5 text-gray-400 data-[state=active]:text-blue-500 transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span className="text-xs font-medium tracking-wider">YÊU THÍCH</span>
            </TabsTrigger>
          </TabsList>

          {/* Uploaded Manga Tab */}
          <TabsContent value="uploaded" className="custom-scrollbar">
            <div className="grid grid-cols-3 gap-4 p-4">
              {user.uploadedManga?.map((manga) => (
                <div 
                  key={manga._id}
                  className="relative cursor-pointer group overflow-hidden rounded-lg"
                  onClick={() => router.push(`/manga/${manga._id}`)}
                >
                  <div className="relative w-full pb-[133%]">
                    <div className="absolute inset-0">
                      {manga.coverImg ? (
                        <>
                          <Image
                            src={manga.coverImg}
                            alt={manga.title}
                            fill
                            sizes="(max-width: 768px) 33vw, 300px"
                            className="object-cover object-center transform group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <div className="text-white text-center p-2 text-sm font-medium line-clamp-2 drop-shadow-lg">
                              {manga.title}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {user.uploadedManga?.length === 0 && (
                <div className="col-span-3 py-12 text-center text-gray-500">
                  Chưa có truyện nào được đăng
                </div>
              )}
            </div>
          </TabsContent>

          {/* Reading History Tab */}
          <TabsContent value="reading" className="custom-scrollbar">
            <div className="grid grid-cols-3 gap-4 p-4">
              {user.readingHistory?.map((history) => (
                <div 
                  key={history._id}
                  className="relative cursor-pointer group overflow-hidden rounded-lg"
                  onClick={() => router.push(`/manga/${history.manga._id}`)}
                >
                  <div className="relative w-full pb-[133%]">
                    <div className="absolute inset-0">
                      {history.manga.coverImg ? (
                        <>
                          <Image
                            src={history.manga.coverImg}
                            alt={history.manga.title}
                            fill
                            sizes="(max-width: 768px) 33vw, 300px"
                            className="object-cover object-center transform group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <div className="text-white text-center p-2 text-sm font-medium space-y-1">
                              <div className="line-clamp-2">{history.manga.title}</div>
                              <div className="text-xs opacity-75">
                                Đã đọc {history.chapters.length} chapter
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {user.readingHistory?.length === 0 && (
                <div className="col-span-3 py-12 text-center text-gray-500">
                  Chưa có lịch sử đọc
                </div>
              )}
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="custom-scrollbar">
            <div className="grid grid-cols-3 gap-4 p-4">
              {user.favoritesManga?.map((manga) => (
                <div 
                  key={manga._id}
                  className="relative cursor-pointer group overflow-hidden rounded-lg"
                  onClick={() => router.push(`/manga/${manga._id}`)}
                >
                  <div className="relative w-full pb-[133%]">
                    <div className="absolute inset-0">
                      {manga.coverImg ? (
                        <>
                          <Image
                            src={manga.coverImg}
                            alt={manga.title}
                            fill
                            sizes="(max-width: 768px) 33vw, 300px"
                            className="object-cover object-center transform group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <div className="text-white text-center p-2 text-sm font-medium line-clamp-2 drop-shadow-lg">
                              {manga.title}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {user.favoritesManga?.length === 0 && (
                <div className="col-span-3 py-12 text-center text-gray-500">
                  Chưa có truyện yêu thích
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 