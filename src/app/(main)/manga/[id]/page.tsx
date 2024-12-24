"use client";

import { useParams, useRouter } from "next/navigation";
import { useMangaDetail } from "@/hooks/use-manga-detail";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Clock,
  Heart,
  BookOpen,
  Download,
  ChevronDown,
  Smile,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import MangaLoadingSkeleton from "./loading-skeleton";
import { useState, useRef, useEffect, memo } from "react";
import { useReadingHistoryStore } from "@/store/reading-history.store";
import { useRelatedManga } from "@/hooks/use-related-manga";
import { useCommentReplies } from "@/hooks/use-comment-replies";
import type { Comment, CommentMention, MangaDetail } from "@/types/manga";
import type { User } from "@/types/user";
import { useCreateComment } from "@/hooks/use-create-comment";
import { useCreateReply } from "@/hooks/use-create-reply";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useFollowMangaStore } from "@/store/follow-manga.store";
import { useFollowManga } from "@/hooks/use-follow-manga";
import { useRateManga } from "@/hooks/use-rate-manga";
import { useMangaDetailStore } from "@/store/manga-detail.store";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateChapter } from "@/hooks/use-create-chapter";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

export enum ChapterType {
  NORMAL = "normal",
  SPECIAL = "special",
  ONESHOT = "oneshot",
}

const renderContentWithMentions = (
  content: string,
  mentions: CommentMention[],
  router: AppRouterInstance
) => {
  if (!mentions?.length) {
    // Xử lý hashtag nếu không có mentions
    return content.split(/\s+/).map((word, index) => {
      if (word.startsWith("#")) {
        return (
          <span
            key={index}
            className="text-blue-500 font-semibold hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/tags/${word.slice(1)}`);
            }}
          >
            {word}{" "}
          </span>
        );
      }
      return word + " ";
    });
  }

  const sortedMentions = [...mentions].sort(
    (a, b) => a.startIndex - b.startIndex
  );

  let lastIndex = 0;
  const parts: JSX.Element[] = [];

  sortedMentions.forEach((mention, index) => {
    if (mention.startIndex > lastIndex) {
      // Xử lý text trước mention, bao gồm cả hashtag
      const textBefore = content.slice(lastIndex, mention.startIndex);
      parts.push(
        <span key={`text-${index}`}>
          {textBefore.split(/\s+/).map((word, wordIndex) => {
            if (word.startsWith("#")) {
              return (
                <span
                  key={`hashtag-${wordIndex}`}
                  className="text-blue-500 font-semibold hover:underline cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/tags/${word.slice(1)}`);
                  }}
                >
                  {word}{" "}
                </span>
              );
            }
            return word + " ";
          })}
        </span>
      );
    }

    parts.push(
      <span
        key={`mention-${mention.userId._id}`}
        className="text-blue-500 font-semibold hover:underline cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/users/${mention.userId._id}`);
        }}
      >
        {mention.username}
      </span>
    );

    lastIndex = mention.endIndex;
  });

  if (lastIndex < content.length) {
    // Xử lý text còn lại sau mention cuối cùng
    const remainingText = content.slice(lastIndex);
    parts.push(
      <span key="text-end">
        {remainingText.split(/\s+/).map((word, index) => {
          if (word.startsWith("#")) {
            return (
              <span
                key={`hashtag-end-${index}`}
                className="text-blue-500 font-semibold hover:underline cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/tags/${word.slice(1)}`);
                }}
              >
                {word}{" "}
              </span>
            );
          }
          return word + " ";
        })}
      </span>
    );
  }

  return <>{parts}</>;
};

interface CommentItemProps {
  comment: Comment;
  manga: MangaDetail;
}

const CommentItem = ({ comment, manga }: CommentItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string | null;
    replyToUser: {
      _id: string;
      name: string;
    } | null;
  }>({ commentId: null, replyToUser: null });
  const { replies, isLoading: isLoadingReplies } = useCommentReplies(
    isExpanded ? comment._id : undefined
  );
  const { user } = useAuth();
  const router = useRouter();

  const handleViewReplies = () => {
    setIsExpanded(!isExpanded);
  };

  const handleReplyClick = (
    commentId: string,
    user: { _id: string; name: string }
  ) => {
    if (replyingTo.commentId === commentId) {
      setReplyingTo({ commentId: null, replyToUser: null });
    } else {
      setReplyingTo({
        commentId,
        replyToUser: user,
      });
    }
  };

  const ReplyBox = ({
    user,
    replyToUser,
    onRemoveTag,
    isReplyComment = false,
    commentId,
    mangaId,
  }: {
    user: User;
    replyToUser?: { _id: string; name: string };
    onRemoveTag: () => void;
    isReplyComment?: boolean;
    commentId: string;
    mangaId: string;
  }) => {
    const [replyContent, setReplyContent] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { mutate: createReply, isPending: isCreatingReply } =
      useCreateReply();

    const onEmojiClick = (emojiData: EmojiClickData) => {
      setReplyContent((prevContent) => prevContent + emojiData.emoji);
      setShowEmojiPicker(false);
    };

    return (
      <div className="flex items-start gap-3">
        <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              fill
              className="object-cover"
              unoptimized={user.avatarUrl.includes("googleusercontent.com")}
            />
          ) : (
            <div className="w-full h-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">
                {user?.name[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="bg-gray-100 p-2 rounded-lg">
            {replyToUser && (
              <div className="flex items-center gap-1 mb-2">
                <div className="bg-gray-200 px-2 py-1 rounded-lg flex items-center gap-1.5">
                  <span className="text-xs text-gray-700">
                    Đang trả lời: {replyToUser.name}
                  </span>
                  <button
                    onClick={onRemoveTag}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            <div className="relative">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={
                  isReplyComment ? "Trả lời bình luận..." : "Viết bình luận..."
                }
                className="w-full bg-transparent focus:outline-none min-h-[80px] text-xs resize-none text-gray-700 pr-8"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute bottom-2 right-2 h-6 w-6 hover:bg-gray-200 rounded-full"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-4 w-4 text-gray-500" />
              </Button>
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 z-50">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <button
              className={`px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors ${
                isCreatingReply || !replyContent.trim()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-600"
              }`}
              onClick={() => {
                if (!replyContent.trim() || isCreatingReply) return;
                createReply(
                  {
                    content: replyContent.trim(),
                    mangaId,
                    parentCommentId: commentId,
                    replyToUserId: replyToUser?._id,
                  },
                  {
                    onSuccess: () => {
                      setReplyContent("");
                      onRemoveTag();
                      setShowEmojiPicker(false);
                      setReplyingTo({ commentId: null, replyToUser: null });
                    },
                  }
                );
              }}
              disabled={isCreatingReply || !replyContent.trim()}
            >
              {isCreatingReply ? "Đang gửi..." : "Gửi"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-3">
      <div
        className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
        onClick={() => router.push(`/users/${comment.user._id}`)}
      >
        {comment.user.avatarUrl ? (
          <Image
            src={comment.user.avatarUrl}
            alt={comment.user.name}
            fill
            className="object-cover"
            unoptimized={comment.user.avatarUrl.includes(
              "googleusercontent.com"
            )}
          />
        ) : (
          <div className="w-full h-full bg-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {comment.user.name[0].toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="bg-gray-100 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`font-semibold text-sm cursor-pointer hover:text-blue-600 ${
                  comment.user._id === manga.uploader._id
                    ? "text-blue-600"
                    : "text-gray-700"
                }`}
                onClick={() => router.push(`/users/${comment.user._id}`)}
              >
                {comment.user.name}
              </span>
              {comment.user._id === manga.uploader._id && (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-semibold rounded">
                  Uploader
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {renderContentWithMentions(
              comment.content,
              comment.mentions,
              router
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1.5 ml-1">
          {comment.replies.length > 0 && (
            <button
              className="text-xs font-bold text-gray-700 hover:text-blue-500 transition-colors flex items-center gap-0.5"
              onClick={handleViewReplies}
            >
              {isExpanded
                ? "Ẩn trả lời"
                : `Xem thêm ${comment.replies.length} trả lời`}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
          {user && (
            <button
              className="text-xs font-bold text-gray-700 hover:text-blue-500 transition-colors flex items-center gap-0.5"
              onClick={() => handleReplyClick(comment._id, comment.user)}
            >
              {replyingTo.commentId === comment._id ? "Hủy" : "Trả lời"}
            </button>
          )}
        </div>
        {replyingTo.commentId === comment._id && (
          <div className="mt-2 ml-8">
            <ReplyBox
              user={user as User}
              replyToUser={replyingTo.replyToUser || undefined}
              onRemoveTag={() =>
                setReplyingTo({ commentId: comment._id, replyToUser: null })
              }
              commentId={comment._id}
              mangaId={manga._id}
            />
          </div>
        )}
        {comment.replies.length > 0 && isExpanded && (
          <div className="ml-8 mt-2 space-y-3">
            {isLoadingReplies ? (
              <div className="animate-pulse space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-6 h-6 bg-gray-300 rounded-full" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-300 rounded w-1/4 mb-2" />
                      <div className="h-2 bg-gray-300 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : replies.length > 0 ? (
              [...replies]
                .sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                )
                .map((reply) => (
                  <div key={reply._id} className="flex gap-2">
                    <div
                      className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
                      onClick={() => router.push(`/users/${reply.user._id}`)}
                    >
                      {reply.user.avatarUrl ? (
                        <Image
                          src={reply.user.avatarUrl}
                          alt={reply.user.name}
                          fill
                          className="object-cover"
                          unoptimized={reply.user.avatarUrl.includes(
                            "googleusercontent.com"
                          )}
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">
                            {reply.user.name[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold text-xs cursor-pointer hover:text-blue-600 ${
                                reply.user._id === manga.uploader._id
                                  ? "text-blue-600"
                                  : "text-gray-700"
                              }`}
                              onClick={() =>
                                router.push(`/users/${reply.user._id}`)
                              }
                            >
                              {reply.user.name}
                            </span>
                            {reply.user._id === manga.uploader._id && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-semibold rounded">
                                Uploader
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500">
                            {formatDistanceToNow(new Date(reply.createdAt), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {renderContentWithMentions(
                            reply.content,
                            reply.mentions,
                            router
                          )}
                        </p>
                      </div>
                      {user && (
                        <>
                          <button
                            className="text-xs font-bold text-gray-700 hover:text-blue-500 transition-colors mt-1 ml-1"
                            onClick={() =>
                              handleReplyClick(reply._id, reply.user)
                            }
                          >
                            {replyingTo.commentId === reply._id
                              ? "Hủy"
                              : "Trả lời"}
                          </button>
                          {replyingTo.commentId === reply._id && (
                            <div className="mt-2 ml-6">
                              <ReplyBox
                                user={user}
                                replyToUser={
                                  replyingTo.replyToUser || undefined
                                }
                                onRemoveTag={() =>
                                  setReplyingTo({
                                    commentId: reply._id,
                                    replyToUser: null,
                                  })
                                }
                                isReplyComment
                                commentId={comment._id}
                                mangaId={manga._id}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-sm text-gray-500">Không thể tải replies</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RatingStars = memo(
  ({
    rating,
    user,
    onRate,
  }: {
    rating: number;
    user: User | null;
    onRate: (rating: number) => void;
  }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const router = useRouter();

    return (
      <div
        className="flex items-center cursor-pointer"
        onMouseLeave={() => setHoverRating(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className="relative group"
            onMouseEnter={() => setHoverRating(star)}
            onClick={() => {
              if (!user) {
                router.push("/login");
                return;
              }
              onRate(star);
            }}
          >
            <svg
              className={`w-7 h-7 transition-colors duration-150 ${
                star <= (hoverRating || Math.round(rating))
                  ? "text-yellow-400"
                  : "text-gray-300"
              } ${
                user ? "hover:scale-110 transform-gpu hover:z-10" : ""
              } transform transition-transform`}
              fill="currentColor"
              viewBox="0 0 20 20"
              style={{ isolation: "isolate" }}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
              <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                {star === 1 && "Dở tệ"}
                {star === 2 && "Tạm được"}
                {star === 3 && "Bình thường"}
                {star === 4 && "Hay"}
                {star === 5 && "Tuyệt vời"}
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

RatingStars.displayName = "RatingStars";

// Validation schema
const formSchema = z.object({
  chapterType: z.enum([
    ChapterType.NORMAL,
    ChapterType.SPECIAL,
    ChapterType.ONESHOT,
  ]),
  number: z.number().min(0).optional(),
  chapterTitle: z.string().optional(),
});

// Type cho form values
type FormValues = {
  chapterType: ChapterType;
  number?: number;
  chapterTitle?: string;
};

export default function MangaPage() {
  // Hooks & States
  const params = useParams();
  const router = useRouter();
  const { manga, isLoading, error } = useMangaDetail(params.id as string) as {
    manga: MangaDetail;
    isLoading: boolean;
    error: unknown;
  };
  const {
    relatedManga,
    isLoading: isLoadingRelated,
    totalManga,
  } = useRelatedManga(manga?.uploader?._id);
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const { isRead } = useReadingHistoryStore();
  const { user } = useAuth();
  const { setReadingHistory } = useReadingHistoryStore();
  const [commentContent, setCommentContent] = useState("");
  const { mutate: createComment, isPending: isCreatingComment } =
    useCreateComment();
  const [selectedRating, setSelectedRating] = useState(0);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const { mutate: rateManga, isPending: isRating } = useRateManga(
    params.id as string
  );
  const { setUserRating, getUserRating } = useMangaDetailStore();
  const currentUserRating = getUserRating(params.id as string);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [chapterImages, setChapterImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { mutate: createChapter, isPending: isCreatingChapter } =
    useCreateChapter(params.id as string);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chapterType: ChapterType.NORMAL,
      number: undefined,
      chapterTitle: "",
    },
  });

  useEffect(() => {
    if (user?.readingHistory) {
      setReadingHistory(user.readingHistory);
    }
  }, [user]);

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        const hasContentOverflow =
          contentRef.current.scrollHeight > contentRef.current.offsetHeight;
        setHasOverflow(hasContentOverflow);
      }
    };

    checkOverflow();

    const timer = setTimeout(checkOverflow, 100);

    return () => clearTimeout(timer);
  }, [manga]);

  useEffect(() => {
    if (user?.ratings) {
      const userRating = user.ratings.find((r) => r.manga._id === params.id);
      if (userRating) {
        setUserRating(params.id as string, userRating.score);
      }
    }
  }, [user, params.id, setUserRating]);

  const handleGenreClick = (genreId: string) => {
    router.push(`/browse?genre=${genreId}`);
  };

  const getLatestUpdate = () => {
    let latestUpdate = null;
    try {
      if (manga?.chapters?.length) {
        const dates = manga.chapters.map((chapter) => {
          try {
            return new Date(chapter.createdAt).getTime();
          } catch {
            return 0;
          }
        });

        const maxDate = Math.max(...dates);
        if (maxDate > 0) {
          latestUpdate = formatDistanceToNow(new Date(maxDate), {
            addSuffix: true,
            locale: vi,
          });
        }
      }
      return latestUpdate;
    } catch (err) {
      console.error("Error formatting date:", err);
      return null;
    }
  };

  const FollowButton = () => {
    const { user } = useAuth();
    const mangaId = params.id as string;
    const { isFollowed, setFollowedMangaIds } = useFollowMangaStore();
    const { mutate: toggleFollow, isPending } = useFollowManga(mangaId);
    const [localFollowed, setLocalFollowed] = useState(false);

    // Sync store với user data và cập nhật local state
    useEffect(() => {
      if (user?.followingManga) {
        const followedIds = user.followingManga.map((manga) => manga._id);
        setFollowedMangaIds(followedIds);
        setLocalFollowed(followedIds.includes(mangaId));
      } else {
        setFollowedMangaIds([]);
        setLocalFollowed(false);
      }
    }, [user?.followingManga, mangaId, setFollowedMangaIds]);

    // Cập nhật local state khi store thay đổi
    useEffect(() => {
      setLocalFollowed(isFollowed(mangaId));
    }, [isFollowed, mangaId]);

    const handleFollowClick = () => {
      if (!user) {
        router.push("/login");
        return;
      }

      // Cập nhật UI ngay lập tức
      setLocalFollowed(!localFollowed);

      toggleFollow(
        {
          action: localFollowed ? "unfollow" : "follow",
        },
        {
          onError: () => {
            // Rollback UI nếu có lỗi
            setLocalFollowed(localFollowed);
          },
        }
      );
    };

    return (
      <button
        className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold transition-colors rounded-md border-2 shadow-sm w-full sm:w-auto relative ${
          !user
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-75"
            : localFollowed
            ? "bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-200"
            : "bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
        }`}
        onClick={handleFollowClick}
        disabled={!user || isPending}
      >
        {isPending ? (
          <div className="flex items-center justify-center gap-2 min-w-[120px]">
            <div className="absolute inset-0 bg-black/10 rounded-md" />
            <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-r-transparent animate-spin" />
            <span className="opacity-50">
              {localFollowed ? "ĐÃ THEO DÕI" : "THEO DÕI TRUYỆN"}
            </span>
          </div>
        ) : (
          <>
            <Heart
              className="w-3.5 h-3.5"
              fill={localFollowed || !user ? "currentColor" : "white"}
            />
            {!user
              ? "ĐĂNG NHẬP ĐỂ THEO DÕI"
              : localFollowed
              ? "ĐÃ THEO DÕI"
              : "THEO DÕI TRUYỆN"}
          </>
        )}
      </button>
    );
  };

  const handleReadFirstChapter = () => {
    if (!manga || !manga.chapters || manga.chapters.length === 0) return;

    const sortedChapters = [...manga.chapters].sort((a, b) => {
      const aNum = parseFloat(a.chapterName.replace(/[^0-9.]/g, ""));
      const bNum = parseFloat(b.chapterName.replace(/[^0-9.]/g, ""));
      return aNum - bNum;
    });

    const firstChapter = sortedChapters[0];
    router.push(`/manga/${manga._id}/chapter/${firstChapter._id}`);
  };

  const onSubmit = async (values: FormValues) => {
    const chapterType = form.watch("chapterType");
    if (chapterType === ChapterType.NORMAL && !values.number) {
      toast.error("Số chapter là bắt buộc đối với chapter thường");
      return;
    }

    if (chapterImages.length === 0) {
      toast.error("Bạn chưa tải file lên");
      return;
    }

    createChapter(
      {
        chapterType: values.chapterType,
        number: values.number,
        chapterTitle: values.chapterTitle,
        files: chapterImages,
      },
      {
        onSuccess: () => {
          setShowAddChapterModal(false);
          form.reset();
          setChapterImages([]);
          setPreviewUrls([]);
        },
      }
    );
  };

  // Xử lý kéo thả file
  const {
    getRootProps: dropzoneGetRootProps,
    getInputProps: dropzoneGetInputProps,
  } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    onDrop: (acceptedFiles: File[]) => {
      setChapterImages(acceptedFiles);
      // Tạo preview URLs cho các ảnh
      const urls = acceptedFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    },
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  // Cleanup preview URLs khi component unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setCommentContent((prevContent) => prevContent + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  if (isLoading) return <MangaLoadingSkeleton />;
  if (error) return <div>Có lỗi xảy ra</div>;
  if (!manga) return <div>Không tìm thấy truyện</div>;

  const latestUpdate = getLatestUpdate();

  return (
    <div className="relative mt-6 max-w-[1300px] mx-auto px-2">
      {/* Banner Section */}
      <div className="relative w-full h-[400px] lg:h-[600px] rounded-t-lg overflow-hidden">
        {manga.bannerImg ? (
          <Image
            src={manga.bannerImg}
            alt={`${manga.title} banner`}
            fill
            className="object-cover object-center"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-5% via-black/50 via-40% to-black" />
      </div>

      {/* Info Section */}
      <div className="relative w-full h-[350px] lg:h-[200px] bg-gray-200 border-2 border-gray-300 py-4 lg:py-0">
        {/* Desktop Content */}
        {latestUpdate && (
          <div className="absolute hidden lg:flex text-left left-[calc(18.4rem+2rem)] top-4 text-sm text-gray-500 z-10 items-center gap-1">
            <Clock className="w-5 h-5" />
            {latestUpdate}
          </div>
        )}

        {/* Genres - Desktop */}
        <div className="absolute hidden lg:flex flex-wrap gap-2 max-w-[800px] left-[calc(18.4rem+2rem)] top-12 z-10">
          {manga.genre?.map((genre) => (
            <div
              key={genre._id}
              className="px-3 py-1 bg-gray-100 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-700"
              onClick={() => handleGenreClick(genre._id)}
              role="button"
              tabIndex={0}
            >
              {genre.name}
            </div>
          ))}
        </div>

        {/* Action Buttons - Desktop */}
        <div className="absolute hidden lg:flex items-center gap-3 left-[calc(18.4rem+2rem)] top-[120px] z-10">
          <FollowButton />
          <button
            className={`w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold transition-colors rounded-md shadow-sm ${
              !manga?.chapters?.length
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gray-300 text-gray-700 hover:bg-black hover:text-white"
            }`}
            onClick={handleReadFirstChapter}
            disabled={!manga?.chapters?.length}
          >
            <BookOpen className="w-3.5 h-3.5" />
            {!manga?.chapters?.length ? "CHƯA CÓ CHAPTER" : "ĐỌC TỪ CHƯƠNG 1"}
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative w-full bg-white border-2 border-gray-300 py-4 lg:py-0 rounded-b-lg h-fit min-h-[800px]">
        {/* Main content và sidebar wrapper */}
        <div className="flex flex-col lg:flex-row gap-4 w-full">
          {/* Main content */}
          <div className="w-full lg:w-[75%]">
            {/* Combined containers wrapper */}
            <div
              ref={contentRef}
              className={`w-[97%] mx-auto lg:w-full lg:ml-4 relative ${
                isExpanded ? "h-auto" : "h-[180px]"
              } overflow-hidden transition-[height] duration-300 ease-in-out`}
            >
              {/* Description container */}
              <div className="bg-gray-200 mt-6 opacity-70 transition-transform duration-300 ease-in-out border-0 rounded-md">
                {/* Author info */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-300">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    {manga.uploader?.avatarUrl ? (
                      <Image
                        src={manga.uploader.avatarUrl}
                        alt={manga.uploader.name}
                        fill
                        className="object-cover"
                        unoptimized={manga.uploader.avatarUrl.includes(
                          "googleusercontent.com"
                        )}
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-sm font-extrabold">
                          {manga.uploader?.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-black font-extrabold text-sm">
                      {manga.uploader?.name || "Unknown Uploader"}
                    </span>
                    <p className="text-xs text-gray-500">{totalManga} TRUYỆN</p>
                  </div>
                </div>

                {/* Description text */}
                <div className="p-4 text-gray-700">{manga.description}</div>
              </div>

              {/* Dark gray container */}
              <div className="bg-gray-300 opacity-70 transition-transform duration-300 ease-in-out">
                <div className="p-4">
                  <h3 className="font-bold text-black mb-2 text-sm">
                    THÔNG TIN THÊM
                  </h3>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-700">
                      <span className="font-bold text-black">
                        {manga.chapters?.length || 0}
                      </span>{" "}
                      chương đã đng
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-bold text-black">
                        {manga.view?.toLocaleString() || 0}
                      </span>{" "}
                      lượt xem
                    </div>
                  </div>
                </div>
              </div>

              {/* Gradient overlay và button */}
              {hasOverflow && (
                <div className="absolute bottom-0 left-0 right-0">
                  {!isExpanded && (
                    <div className="h-12 bg-gradient-to-t from-gray-200 to-transparent transition-opacity duration-300" />
                  )}
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`absolute ${
                      isExpanded ? "relative" : "bottom-0"
                    } left-1/2 -translate-x-1/2 text-xs text-gray-500 hover:text-gray-600 font-bold transition-all duration-300`}
                  >
                    {isExpanded ? "Thu gọn" : "Xem thêm"}
                  </button>
                </div>
              )}
            </div>

            {/* Scroll area container */}
            <div className="w-[97%] mx-auto lg:w-full lg:ml-4 mt-8 h-[550px] overflow-y-auto bg-white mb-8">
              {/* Chapter list header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h3 className="font-bold text-black">Danh sách Chapter</h3>
                {user?._id === manga.uploader._id && (
                  <button
                    onClick={() => setShowAddChapterModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    Thêm Chapter
                  </button>
                )}
              </div>

              {/* Chapter list */}
              <div className="space-y-2">
                {manga.chapters
                  ?.sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  ?.map((chapter, index) => (
                    <div
                      key={chapter._id}
                      onClick={() =>
                        router.push(
                          `/manga/${params.id}/chapter/${chapter._id}`
                        )
                      }
                      className={`${
                        index % 2 === 0 ? "bg-gray-200/50" : "bg-white"
                      } hover:bg-gray-200 py-3 px-4 shadow-sm cursor-pointer transition-colors w-full border-l-8 ${
                        isRead(chapter._id)
                          ? "border-l-blue-500/80"
                          : "border-l-gray-300/80"
                      } -ml-[1px]`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-base font-bold text-gray-800">
                            {chapter.chapterName}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-600">
                              {chapter.chapterTitle || (
                                <span className="italic text-gray-500/80">
                                  Không có tiêu đề
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDistanceToNow(
                                new Date(chapter.createdAt),
                                {
                                  addSuffix: true,
                                  locale: vi,
                                }
                              )}
                              {" - "}
                              {chapter.views?.toLocaleString() || 0} lượt xem
                            </div>
                          </div>
                        </div>
                        <button
                          className="p-2 text-gray-500 hover:text-gray-700 bg-gray-300 hover:bg-gray-400 rounded-full transition-all"
                          title="Tải xuống"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Comment section */}
            <div className="w-[97%] mx-auto lg:w-full lg:ml-4 bg-white mb-8">
              <div className="p-4">
                <h3 className="font-bold text-black mb-4">
                  Bình luận{" "}
                  {manga.comments?.length > 0 &&
                    `(${manga.comments.reduce(
                      (total, comment) => total + 1 + comment.replies.length,
                      0
                    )})`}
                </h3>

                {/* Comment Input - Only show for logged in users */}
                {user ? (
                  <div className="mb-6">
                    <div className="flex items-start gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        {user.avatarUrl ? (
                          <Image
                            src={user.avatarUrl}
                            alt={user.name}
                            fill
                            className="object-cover"
                            unoptimized={user.avatarUrl.includes(
                              "googleusercontent.com"
                            )}
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {user.name[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="relative">
                          <textarea
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="Viết bình luận..."
                            className="w-full p-3 rounded-lg bg-gray-100 focus:bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] text-sm transition-colors text-gray-700"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute bottom-3 right-3 h-6 w-6 hover:bg-gray-200 rounded-full"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          >
                            <Smile className="h-4 w-4 text-gray-500" />
                          </Button>
                          {showEmojiPicker && (
                            <div className="absolute bottom-full right-0 mb-2 z-50">
                              <EmojiPicker onEmojiClick={onEmojiClick} />
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end mt-2">
                          <button
                            className={`px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors ${
                              isCreatingComment || !commentContent.trim()
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-blue-600"
                            }`}
                            onClick={() => {
                              if (!commentContent.trim() || isCreatingComment)
                                return;
                              createComment(
                                {
                                  content: commentContent.trim(),
                                  mangaId: params.id as string,
                                },
                                {
                                  onSuccess: () => {
                                    setCommentContent("");
                                    setShowEmojiPicker(false);
                                  },
                                }
                              );
                            }}
                            disabled={
                              isCreatingComment || !commentContent.trim()
                            }
                          >
                            {isCreatingComment
                              ? "Đang gửi..."
                              : "Gửi bình luận"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">
                      Đăng nhập để bình luận về truyện này
                    </p>
                    <button
                      onClick={() => router.push("/login")}
                      className="px-4 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Đăng nhập
                    </button>
                  </div>
                )}

                {/* Comments List - Always visible */}
                {manga.comments?.length > 0 ? (
                  <div className="space-y-4">
                    {[...manga.comments]
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                      .map((comment) => (
                        <CommentItem
                          key={comment._id}
                          comment={comment}
                          manga={manga}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-lg">
                    Chưa có bình luận nào
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Rating & Likes + Cùng Uploader */}
          <div className="hidden lg:block w-full lg:w-[25%] px-4 lg:pr-4 lg:pl-2 mt-1">
            {/* Rating & Likes Container */}
            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="font-bold text-black mb-4">
                Đánh giá & Tương tác
              </h3>

              <div className="space-y-4">
                {/* Rating Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RatingStars
                        rating={manga.averageRating}
                        user={user}
                        onRate={(rating) => {
                          setSelectedRating(rating);
                          setIsRatingModalOpen(true);
                        }}
                      />
                      <span className="text-lg font-bold text-gray-700">
                        {manga.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {manga.ratingCount} lượt đánh giá
                    </span>
                  </div>

                  {/* Rating message - Hiển thị rating của user */}
                  <div className="text-center">
                    {!user ? (
                      <span className="text-xs text-gray-500">
                        Đăng nhập để đánh giá
                      </span>
                    ) : currentUserRating ? (
                      <span className="text-xs font-medium text-blue-500">
                        Bạn đã đánh giá {currentUserRating} sao
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">
                        Nhấp vào sao để đánh giá
                      </span>
                    )}
                  </div>
                </div>

                {/* Likes & Dislikes */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      <span className="font-semibold text-gray-700">
                        {manga.like.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                      </svg>
                      <span className="font-semibold text-gray-700">
                        {manga.disLike.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* View Count */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Lượt xem</span>
                  <span className="font-semibold text-gray-700">
                    {manga.view.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Cùng Uploader Container - giữ nguyên code cũ */}
            <div className="p-4 rounded-lg">
              <h3 className="font-bold text-black mb-4">
                Cùng Uploader {totalManga > 5 && `(${totalManga})`}
              </h3>
              <div className="space-y-2">
                {isLoadingRelated ? (
                  <div className="animate-pulse space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-12 h-16 bg-gray-300 rounded" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded w-3/4" />
                          <div className="h-3 bg-gray-300 rounded w-1/4 mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : relatedManga.length > 0 ? (
                  relatedManga.map((manga) => (
                    <div
                      key={manga._id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
                      onClick={() => router.push(`/manga/${manga._id}`)}
                    >
                      <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0">
                        {manga.coverImg ? (
                          <Image
                            src={manga.coverImg}
                            alt={manga.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-600 text-sm mb-1 line-clamp-2">
                          {manga.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {manga.chapters?.length > 0 ? (
                            <>
                              <span className="font-semibold tracking-wide text-gray-500">
                                {manga.chapters[0].chapterName.replace(
                                  "Chap",
                                  "C."
                                )}
                              </span>
                              <span className="mx-1">-</span>
                              <span className="uppercase">
                                {formatDistanceToNow(
                                  new Date(manga.chapters[0].createdAt),
                                  {
                                    addSuffix: true,
                                    locale: vi,
                                  }
                                )}
                              </span>
                            </>
                          ) : (
                            "Chưa có chapter"
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4">
                    Không có truyện nào khác
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="absolute lg:left-24 left-1/2 -translate-x-1/2 lg:translate-x-0 top-[270px] lg:top-[290px] translate-y-1/2 z-20">
        <div className="relative w-32 lg:w-56 h-44 lg:h-80 rounded-lg overflow-hidden shadow-lg border-2 border-white">
          {manga.coverImg ? (
            <Image
              src={manga.coverImg}
              alt={`${manga.title} cover`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}
        </div>
      </div>

      {/* Title & Author - Desktop */}
      <div className="absolute hidden lg:block lg:left-[calc(19rem+2rem)] left-1/2 -translate-x-1/2 lg:translate-x-0 top-[600px] lg:top-[500px] translate-y-1/2 z-10">
        <div className="text-gray-200 text-sm mb-1 opacity-75">
          {manga.author}
        </div>
        <h1 className="text-2xl font-extrabold opacity-90">{manga.title}</h1>
      </div>

      {/* Title & Author - Mobile */}
      <div className="lg:hidden absolute left-1/2 -translate-x-1/2 top-[190px] translate-y-1/2 z-10">
        <div className="text-center w-[350px] sm:w-[450px] pt-[220px]">
          <h1 className="text-xl font-bold text-gray-800 mb-1 px-4">
            {manga.title}
          </h1>
          <div className="text-sm text-gray-500 px-4 truncate">
            {manga.author}
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden space-y-4 mt-4">
        {/* Genres - Mobile */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[600px] z-10 w-full">
          <div className="flex flex-wrap justify-center gap-2 px-4">
            {manga.genre?.map((genre) => (
              <div
                key={genre._id}
                className="px-3 py-1 bg-gray-100 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer"
                onClick={() => handleGenreClick(genre._id)}
                role="button"
                tabIndex={0}
              >
                {genre.name}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons - Mobile */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[650px] sm:top-[650px] z-10 w-full">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center gap-2 px-4">
            <div className="w-full sm:w-auto">
              <FollowButton />
            </div>
            <div className="w-full sm:w-auto">
              <button
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold transition-colors rounded-md shadow-sm ${
                  !manga?.chapters?.length
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-300 text-gray-700 hover:bg-black hover:text-white"
                }`}
                onClick={handleReadFirstChapter}
                disabled={!manga?.chapters?.length}
              >
                <BookOpen className="w-3.5 h-3.5" />
                {!manga?.chapters?.length
                  ? "CHƯA CÓ CHAPTER"
                  : "ĐỌC TỪ CHƯƠNG 1"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacing div */}
      <div className="h-32 lg:h-32" />

      {/* Rating Modal */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Đánh giá truyện
            </h3>
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-8 h-8 ${
                    star <= selectedRating ? "text-yellow-400" : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 mb-6">
              {selectedRating === 1 && "Dở tệ 😞"}
              {selectedRating === 2 && "Tạm được 😐"}
              {selectedRating === 3 && "Bình thường 🙂"}
              {selectedRating === 4 && "Hay 😊"}
              {selectedRating === 5 && "Tuyệt vời 🤩"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => {
                  setIsRatingModalOpen(false);
                  setSelectedRating(0);
                }}
                disabled={isRating}
              >
                Hủy
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2 ${
                  isRating ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => {
                  rateManga(
                    { rating: selectedRating },
                    {
                      onSuccess: () => {
                        setUserRating(params.id as string, selectedRating);
                        setIsRatingModalOpen(false);
                        setSelectedRating(0);
                      },
                    }
                  );
                }}
                disabled={isRating}
              >
                {isRating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  "Xác nhận"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Chapter Modal */}
      <Dialog open={showAddChapterModal} onOpenChange={setShowAddChapterModal}>
        <DialogContent className="sm:max-w-[1000px] flex gap-4 p-6">
          {/* Form Column */}
          <div className="flex-1">
            <DialogHeader>
              <DialogTitle>Thêm Chapter Mới</DialogTitle>
              <DialogDescription>
                Điền thông tin chapter mới cho truyện của bạn
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="chapterType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại Chapter</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại chapter" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ChapterType.NORMAL}>
                            Chapter thường
                          </SelectItem>
                          <SelectItem value={ChapterType.SPECIAL}>
                            Chapter đặc biệt
                          </SelectItem>
                          <SelectItem value={ChapterType.ONESHOT}>
                            Oneshot
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="number"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>
                        Số Chapter{" "}
                        {form.watch("chapterType") === "normal" && (
                          <span className="text-destructive">*</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ví dụ: 1"
                          {...field}
                          value={value?.toString() ?? ""}
                          onChange={(e) =>
                            onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chapterTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề Chapter (không bắt buộc)</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tiêu đề chapter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>
                    Hình ảnh Chapter <span className="text-destructive">*</span>
                  </FormLabel>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 transition-colors",
                      "hover:border-muted-foreground/25",
                      "flex flex-col items-center justify-center gap-2",
                      isDragging && "border-primary"
                    )}
                    {...dropzoneGetRootProps()}
                  >
                    <input {...dropzoneGetInputProps()} />
                    {chapterImages.length > 0 ? (
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {chapterImages.length} ảnh đã chọn
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setChapterImages([]);
                            setPreviewUrls([]);
                          }}
                          className="text-destructive hover:text-destructive/90"
                        >
                          Xóa tất cả
                        </Button>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="w-10 h-10 text-muted-foreground/50"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="text-sm text-muted-foreground">
                          Kéo thả hoặc click để chọn ảnh
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF tối đa 10MB
                        </p>
                      </>
                    )}
                  </div>
                  {chapterImages.length === 0 && (
                    <p className="text-sm text-destructive">
                      Vui lòng chọn ít nhất 1 ảnh
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddChapterModal(false)}
                    disabled={isCreatingChapter}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreatingChapter || chapterImages.length === 0}
                  >
                    {isCreatingChapter ? (
                      <>
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Thêm Chapter"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Preview Column */}
          {chapterImages.length > 0 && (
            <div className="w-[400px] border-l pl-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-sm">Xem trước ảnh</h4>
                <p className="text-sm text-muted-foreground">
                  {chapterImages.length} ảnh
                </p>
              </div>

              <ScrollArea className="h-[600px] w-full pr-4">
                <div className="space-y-4">
                  {previewUrls.map((url, index) => (
                    <div key={url} className="relative group">
                      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={() => {
                            const newChapterImages = [...chapterImages];
                            const newPreviewUrls = [...previewUrls];
                            URL.revokeObjectURL(url);
                            newChapterImages.splice(index, 1);
                            newPreviewUrls.splice(index, 1);
                            setChapterImages(newChapterImages);
                            setPreviewUrls(newPreviewUrls);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4"
                          >
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </Button>
                      </div>
                      <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden">
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="mt-2 text-center text-sm text-muted-foreground">
                        Trang {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
