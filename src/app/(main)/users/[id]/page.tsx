"use client";

import { useParams } from "next/navigation";
import { useUserProfile } from "@/hooks/use-user-profile";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { MessageCircle, UserPlus, UserCheck, Grid } from "lucide-react";
import { useEffect } from "react";
import { useFollowUser } from "@/hooks/use-follow-user";
import { useChatUIStore } from "@/store/chat-ui.store";
import { useChatStore } from "@/store/chat.store";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: user, isLoading, error } = useUserProfile(params.id as string);
  const { user: currentUser } = useAuth();
  const { openPrivateChat, openExistingRoom } = useChatUIStore();
  const chatStore = useChatStore();

  useEffect(() => {
    if (currentUser && params.id === currentUser._id) {
      router.replace('/profile');
    }
  }, [currentUser, params.id, router]);

  const isFollowing = user?.followers?.some(
    (follower) => follower._id === currentUser?._id
  );

  const { mutate: toggleFollow, isPending: isTogglingFollow } = useFollowUser(params.id as string);

  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    toggleFollow(
      { 
        userId: user?._id || '', 
        action: isFollowing ? 'unfollow' : 'follow' 
      }
    );
  };

  const handleMessage = () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (!user) return;

    const existingRoom = chatStore.findRoomByParticipant(user._id);

    if (existingRoom) {
      openExistingRoom(existingRoom._id);
    } else {
      openPrivateChat(user._id, {
        _id: user._id,
        name: user.name,
        avatarUrl: user.avatarUrl
      });
    }
  };

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

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Không tìm thấy người dùng</p>
      </div>
    );
  }

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
          {/* Username and Actions */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <h1 className="text-xl font-medium">{user.name}</h1>
            {currentUser && currentUser._id !== user._id && (
              <div className="flex gap-2">
                <button
                  onClick={handleFollow}
                  disabled={isTogglingFollow}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isFollowing
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  } ${isTogglingFollow ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isTogglingFollow ? (
                    "Đang xử lý..."
                  ) : isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Đang theo dõi
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Theo dõi
                    </>
                  )}
                </button>
                <button
                  onClick={handleMessage}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Nhắn tin
                </button>
              </div>
            )}
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
        </Tabs>
      </div>
    </div>
  );
} 