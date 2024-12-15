import { MangaItem } from "./manga";

export interface ChapterNavigation {
  prevChapter?: {
    _id: string;
    number: number;
    chapterName: string;
  } | null;
  nextChapter?: {
    _id: string;
    number: number;
    chapterName: string;
  } | null;
}

export interface Chapter {
  _id: string;
  number: number;
  pagesUrl: string[];
  chapterTitle: string;
  manga: MangaItem;
  chapterName: string;
  views: number;
  chapterType: string;
  navigation: ChapterNavigation;
}
