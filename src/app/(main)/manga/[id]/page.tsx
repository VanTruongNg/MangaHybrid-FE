"use client";

import { useParams, useRouter } from "next/navigation";
import { useMangaDetail } from "@/hooks/use-manga-detail";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, Heart, BookOpen, Download, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import MangaLoadingSkeleton from "./loading-skeleton";
import { useState, useRef, useEffect } from "react";
import { useReadingHistoryStore } from "@/store/reading-history.store";
import { useRelatedManga } from "@/hooks/use-related-manga";
import { useCommentReplies } from "@/hooks/use-comment-replies";
import type { Comment, CommentMention, MangaDetail } from "@/types/manga";
import { User } from "@/types/user";
import { useCreateComment } from "@/hooks/use-create-comment";
import { useCreateReply } from "@/hooks/use-create-reply";

const renderContentWithMentions = (
  content: string,
  mentions: CommentMention[]
) => {
  if (!mentions?.length) return content;

  const sortedMentions = [...mentions].sort(
    (a, b) => a.startIndex - b.startIndex
  );

  let lastIndex = 0;
  const parts: JSX.Element[] = [];

  sortedMentions.forEach((mention, index) => {
    if (mention.startIndex > lastIndex) {
      parts.push(
        <span key={`text-${index}`}>
          {content.slice(lastIndex, mention.startIndex)}
        </span>
      );
    }

    parts.push(
      <span
        key={`mention-${mention.userId._id}`}
        className="text-blue-500 font-semibold hover:underline cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {mention.username}
      </span>
    );

    lastIndex = mention.endIndex;
  });

  if (lastIndex < content.length) {
    parts.push(<span key="text-end">{content.slice(lastIndex)}</span>);
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

  const handleViewReplies = () => {
    setIsExpanded(!isExpanded);
  };

  const handleReplyClick = (commentId: string, user: { _id: string; name: string }) => {
    if (replyingTo.commentId === commentId) {
      setReplyingTo({ commentId: null, replyToUser: null });
    } else {
      setReplyingTo({ 
        commentId,
        replyToUser: user
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
    const { mutate: createReply, isPending: isCreatingReply } = useCreateReply();

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
                  <span className="text-xs text-gray-700">Đang trả lời: {replyToUser.name}</span>
                  <button 
                    onClick={onRemoveTag}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={isReplyComment ? "Trả lời bình luận..." : "Viết bình luận..."}
              className="w-full bg-transparent focus:outline-none min-h-[80px] text-xs resize-none text-gray-700"
            />
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
      <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
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
              <span className={`font-semibold text-sm ${
                comment.user._id === manga.uploader._id
                  ? "text-blue-600" 
                  : "text-gray-700"
              }`}>
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
            {renderContentWithMentions(comment.content, comment.mentions)}
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
              onRemoveTag={() => setReplyingTo({ commentId: comment._id, replyToUser: null })}
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
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((reply) => (
                  <div key={reply._id} className="flex gap-2">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
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
                            <span className={`font-semibold text-xs ${
                              reply.user._id === manga.uploader._id 
                                ? "text-blue-600" 
                                : "text-gray-700"
                            }`}>
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
                            reply.mentions
                          )}
                        </p>
                      </div>
                      {user && (
                        <>
                          <button
                            className="text-xs font-bold text-gray-700 hover:text-blue-500 transition-colors mt-1 ml-1"
                            onClick={() => handleReplyClick(reply._id, reply.user)}
                          >
                            {replyingTo.commentId === reply._id ? "Hủy" : "Trả lời"}
                          </button>
                          {replyingTo.commentId === reply._id && (
                            <div className="mt-2 ml-6">
                              <ReplyBox
                                user={user}
                                replyToUser={replyingTo.replyToUser || undefined}
                                onRemoveTag={() => setReplyingTo({ commentId: reply._id, replyToUser: null })}
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

export default function MangaPage() {
  // Hooks & States
  const params = useParams();
  const router = useRouter();
  const { manga, isLoading, error } = useMangaDetail(params.id as string);
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
  const { mutate: createComment, isPending: isCreatingComment } = useCreateComment();

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

    // Kiểm tra ngay khi component mount và khi manga thay đổi
    checkOverflow();

    // Thêm một setTimeout để đảm bảo content đã render xong
    const timer = setTimeout(checkOverflow, 100);

    return () => clearTimeout(timer);
  }, [manga]);

  // Handlers
  const handleGenreClick = (genreId: string) => {
    router.push(`/browse?genre=${genreId}`);
  };

  // Utils
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

  // Components
  const FollowButton = () => {
    const { user } = useAuth();
    const mangaId = params.id as string;
    const isFollowed = user?.followingManga?.some(
      (manga) => manga._id === mangaId
    );

    return (
      <button
        className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold transition-colors rounded-md border-2 shadow-sm w-full sm:w-auto ${
          !user
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-75"
            : isFollowed
            ? "bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-200"
            : "bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
        }`}
        disabled={!user}
      >
        <Heart
          className="w-3.5 h-3.5"
          fill={isFollowed || !user ? "currentColor" : "white"}
        />
        {!user
          ? "ĐĂNG NHẬP ĐỂ THEO DÕI"
          : isFollowed
          ? "ĐÃ THEO DÕI"
          : "THEO DÕI TRUYỆN"}
      </button>
    );
  };

  // Loading & Error states
  if (isLoading) return <MangaLoadingSkeleton />;
  if (error) return <div>Có lỗi xảy ra</div>;
  if (!manga) return <div>Không tìm thấy truyện</div>;

  const latestUpdate = getLatestUpdate();

  // Main render
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
          <button className="w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-xs font-bold text-gray-700 hover:bg-black hover:text-white transition-colors rounded-md shadow-sm">
            <BookOpen className="w-3.5 h-3.5" />
            ĐỌC TỪ CHƯƠNG 1
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
                      chương đã đăng
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
                  {manga.comments?.length > 0 && `(${
                    manga.comments.reduce((total, comment) => total + 1 + comment.replies.length, 0)
                  })`}
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
                            unoptimized={user.avatarUrl.includes("googleusercontent.com")}
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
                        <textarea
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          placeholder="Viết bình luận..."
                          className="w-full p-3 rounded-lg bg-gray-100 focus:bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] text-sm transition-colors text-gray-700"
                        />
                        <div className="flex justify-end mt-2">
                          <button 
                            className={`px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors ${
                              isCreatingComment || !commentContent.trim() 
                                ? "opacity-50 cursor-not-allowed" 
                                : "hover:bg-blue-600"
                            }`}
                            onClick={() => {
                              if (!commentContent.trim() || isCreatingComment) return;
                              
                              createComment(
                                {
                                  content: commentContent.trim(),
                                  mangaId: params.id as string,
                                },
                                {
                                  onSuccess: () => {
                                    setCommentContent("");
                                  },
                                }
                              );
                            }}
                            disabled={isCreatingComment || !commentContent.trim()}
                          >
                            {isCreatingComment ? "Đang gửi..." : "Gửi bình luận"}
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
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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

          {/* Sidebar - Cùng Uploader */}
          <div className="hidden lg:block w-full lg:w-[25%] px-4 lg:pr-4 lg:pl-2 mt-1">
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
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-xs font-bold text-gray-700 hover:bg-black hover:text-white transition-colors rounded-md shadow-sm">
                <BookOpen className="w-3.5 h-3.5" />
                ĐỌC TỪ CHƯƠNG 1
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacing div */}
      <div className="h-32 lg:h-32" />
    </div>
  );
}
