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