export interface MangaOfflineMetadata {
    id: string;
    title: string;
    description: string;
    author: string;
    status: string;
    genres: string[];
    downloadedAt: string;
    coverImg?: string;
    bannerImg?: string;
}

interface MangaRef {
    _id: string;
    title: string;
}

export interface ChapterOfflineMetadata {
    id: string;
    mangaId: MangaRef;
    number: number;
    chapterTitle: string | null;
    chapterType: 'normal' | 'special' | 'oneshot';
    totalPages: number;
    pagesUrl: string[];
}

export interface OfflineChapter {
    id: string;
    metadata: ChapterOfflineMetadata;
    pages: ArrayBuffer[];
    downloadedAt: string;
}

export interface OfflineManga {
    id: string;
    metadata: MangaOfflineMetadata;
    cover?: ArrayBuffer;
    banner?: ArrayBuffer;
    downloadedAt: string;
}

export interface OfflineData {
    manga?: OfflineManga;
    chapter?: OfflineChapter;
} 