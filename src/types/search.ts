export interface SearchMangaResult {
  _id: string;
  title: string;
  coverImg: string;
  author: string;
  uploader: {
    _id: string;
    name: string;
    avatarUrl: string;
  };
  score: number;
}

export interface SearchUserResult {
  _id: string;
  name: string;
  avatarUrl: string;
  score: number;
}

export type SearchType = "manga" | "user";

export interface SearchResponse<T> {
  results: T[];
  total: number;
}

export type SearchMangaResponse = SearchResponse<SearchMangaResult>;
export type SearchUserResponse = SearchResponse<SearchUserResult>; 