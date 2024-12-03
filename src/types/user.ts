export interface User {
  _id: string;
  name: string; 
  email: string;
  role: string;
  isVerified: boolean;
  avatarUrl?: string;
  followers: UserBasic[];
  following: UserBasic[];
  uploadedManga: MangaBasic[];
  favoritesManga: MangaBasic[];
  dislikedManga: MangaBasic[];
  followingManga: MangaBasic[];
  readingHistory: ReadingHistory[];
  comments: Comment[];
  ratings: Rating[];
  createdAt: string;
  updatedAt: string;
}

export interface UserBasic {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface MangaBasic {
  _id: string;
  title: string;
  author: string;
  coverImg?: string;
}

export interface ReadingHistory {
  manga: MangaBasic;
  chapter: ChapterBasic;
  updatedAt: string;
}

export interface ChapterBasic {
  _id: string;
  number: number;
  chapterTitle?: string;
  chapterType: string;
}

export interface Comment {
  _id: string;
  content: string;
  user: string;
  manga?: string;
  parentComment?: string;
  replyToUser?: string;
  replies: string[];
  mentions: Mention[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface Mention {
  _id?: string;
  userId: string;
  username: string;
  startIndex: number;
  endIndex: number;
}

export interface Rating {
  _id: string;
  user: UserBasic;
  manga: MangaBasic;
  rating: number;
  createdAt: string;
  updatedAt: string;
} 