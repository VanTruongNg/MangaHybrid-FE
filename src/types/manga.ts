export interface MangaItem {
  _id: string;
  title: string;
  description: string;
  coverImg?: string;
  bannerImg?: string;
  author: string;
  rating: number;
  view: number;
  dailyView?: number;
  weeklyView?: number;
  monthlyView?: number;
  latestUpdate?: Date;
  chapterName?: string;
}

export interface HomeResponse {
  dailyTop: MangaItem[];
  weeklyTop: MangaItem[];
  recentUpdated: MangaItem[];
  randomManga: MangaItem[];
  topAllTime: MangaItem[];
  monthlyTop: MangaItem[];
}

export interface Chapter {
  _id: string;
  chapterTitle?: string;
  chapterName: string;
  createdAt: string;
  views: number;
}

export interface Genre {
  _id: string;
  name: string;
}

export interface MangaDetail extends MangaItem {
  chapters: Chapter[];
  genre: Genre[];
  uploader: {
    _id: string;
    name: string;
    email: string;
    avatarUrl: string;
  };
  status: string;
  approvalStatus: string;
  followers: number;
  averageRating: number;
  like: number;
  disLike: number;
  comments: Comment[];
  ratingCount: number;
  totalRating: number;
}

interface CommentUser {
  _id: string;
  name: string;
  avatarUrl: string;
}

export interface CommentMention {
  userId: {
    _id: string;
    name: string;
  };
  username: string;
  startIndex: number;
  endIndex: number;
}

export interface Comment {
  _id: string;
  user: CommentUser;
  content: string;
  createdAt: string;
  manga?: string;
  chapter?: string;
  parentComment?: string;
  replyToUser?: {
    _id: string;
    name: string;
  };
  replies: string[];
  mentions: CommentMention[];
} 