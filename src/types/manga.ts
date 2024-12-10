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