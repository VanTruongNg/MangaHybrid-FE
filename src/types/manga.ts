export interface HomeResponse {
  dailyTop: MangaItem[];
  weeklyTop: MangaItem[];
  recentUpdated: MangaItem[];
  randomManga: MangaItem[];
}

export interface MangaItem {
  _id: string;
  title: string;
  description?: string;
  coverImg?: string;
  bannerImg?: string;
  author: string;
  rating: number;
  view: number;
  viewToday?: number;
  viewThisWeek?: number;
  latestUpdate?: Date;
} 