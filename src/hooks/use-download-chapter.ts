import { toast } from "sonner";
import { openDB, IDBPDatabase } from "idb";
import JSZip from "jszip";
import api from "@/lib/axios";
import type { ChapterOfflineMetadata, OfflineManga, OfflineChapter } from "@/types/offline";

interface UseDownloadChapterOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

interface ZipFile {
  dir: boolean;
  name: string;
  async(type: "arraybuffer" | "text"): Promise<ArrayBuffer | string>;
}

interface ZipContent {
  files: {
    [key: string]: ZipFile;
  };
}

const DB_NAME = "manga-offline";
const MANGA_STORE = "mangas";
const CHAPTER_STORE = "chapters";

const extractImagesFromZip = async (zipBuffer: ArrayBuffer): Promise<ArrayBuffer[]> => {
  const zip = new JSZip();
  const contents = await zip.loadAsync(zipBuffer) as ZipContent;
  
  const imageFiles = Object.values(contents.files)
    .filter((file: ZipFile) => !file.dir && file.name.startsWith('pages/'))
    .sort((a: ZipFile, b: ZipFile) => {
      const aNum = parseInt(a.name.match(/\d+/)?.[0] || "0");
      const bNum = parseInt(b.name.match(/\d+/)?.[0] || "0");
      return aNum - bNum;
    });

  const buffers = await Promise.all(
    imageFiles.map((file: ZipFile) => file.async("arraybuffer") as Promise<ArrayBuffer>)
  );

  return buffers;
};

export const useDownloadChapter = (options: UseDownloadChapterOptions = {}) => {
  const initDB = async (): Promise<IDBPDatabase> => {
    return openDB(DB_NAME, 1, {
      upgrade(db: IDBPDatabase) {
        if (!db.objectStoreNames.contains(MANGA_STORE)) {
          db.createObjectStore(MANGA_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(CHAPTER_STORE)) {
          db.createObjectStore(CHAPTER_STORE, { keyPath: "id" });
        }
      },
    });
  };

  const saveMangaToIndexedDB = async (manga: OfflineManga): Promise<void> => {
    const db = await initDB();
    await db.put(MANGA_STORE, manga);
  };

  const saveChapterToIndexedDB = async (chapter: OfflineChapter): Promise<void> => {
    const db = await initDB();
    await db.put(CHAPTER_STORE, chapter);
  };

  const downloadManga = async (mangaId: string): Promise<OfflineManga> => {
    try {
      const { data: zipBuffer } = await api.get(`/manga/${mangaId}/offline-info`, {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'application/zip'
        }
      });
      
      const zip = new JSZip();
      const contents = await zip.loadAsync(zipBuffer) as ZipContent;

      const metadataFile = contents.files['metadata.json'];
      if (!metadataFile) throw new Error('Không tìm thấy metadata trong file zip');
      const metadataText = await metadataFile.async("text") as string;
      const metadata = JSON.parse(metadataText);

      const coverBuffer = await contents.files['images/cover.jpg']?.async("arraybuffer") as ArrayBuffer;
      const bannerBuffer = await contents.files['images/banner.jpg']?.async("arraybuffer") as ArrayBuffer;

      const offlineManga: OfflineManga = {
        id: mangaId,
        metadata,
        cover: coverBuffer,
        banner: bannerBuffer,
        downloadedAt: new Date().toISOString()
      };

      await saveMangaToIndexedDB(offlineManga);
      return offlineManga;
    } catch (error) {
      console.error("Error downloading manga:", error);
      throw error;
    }
  };

  const downloadChapter = async (chapterId: string, mangaId: string): Promise<void> => {
    try {
      // Kiểm tra và tải manga trước nếu chưa có
      const manga = await getMangaOffline(mangaId);
      if (!manga) {
        await downloadManga(mangaId);
      }

      // Tải chapter
      const { data: zipBuffer } = await api.get(`/chapters/${chapterId}/download`, {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'application/vnd.comicbook+zip'
        }
      });

      const imageBuffers = await extractImagesFromZip(zipBuffer);
      
      const zip = new JSZip();
      const contents = await zip.loadAsync(zipBuffer) as ZipContent;
      const metadataFile = contents.files['metadata.json'];
      if (!metadataFile) throw new Error('Không tìm thấy metadata trong file CBZ');
      const metadataText = await metadataFile.async("text") as string;
      const metadata = JSON.parse(metadataText) as ChapterOfflineMetadata;
      
      const offlineChapter: OfflineChapter = {
        id: chapterId,
        metadata,
        pages: imageBuffers,
        downloadedAt: new Date().toISOString()
      };

      await saveChapterToIndexedDB(offlineChapter);

      options.onSuccess?.();
      toast.success("Đã lưu chapter để đọc offline");
    } catch (error) {
      options.onError?.(error);
      toast.error("Có lỗi xảy ra khi tải chapter");
      console.error("Download error:", error);
    }
  };

  const getMangaOffline = async (mangaId: string): Promise<OfflineManga | null> => {
    try {
      const db = await initDB();
      return await db.get(MANGA_STORE, mangaId);
    } catch (error) {
      console.error("Error getting offline manga:", error);
      return null;
    }
  };

  const getOfflineChapter = async (chapterId: string): Promise<OfflineChapter | null> => {
    try {
      const db = await initDB();
      return await db.get(CHAPTER_STORE, chapterId);
    } catch (error) {
      console.error("Error getting offline chapter:", error);
      return null;
    }
  };

  const getAllOfflineChapters = async (): Promise<OfflineChapter[]> => {
    try {
      const db = await initDB();
      return await db.getAll(CHAPTER_STORE);
    } catch (error) {
      console.error("Error getting all offline chapters:", error);
      return [];
    }
  };

  const getAllOfflineMangas = async (): Promise<OfflineManga[]> => {
    try {
      const db = await initDB();
      return await db.getAll(MANGA_STORE);
    } catch (error) {
      console.error("Error getting all offline mangas:", error);
      return [];
    }
  };

  const removeOfflineChapter = async (chapterId: string) => {
    try {
      const db = await initDB();
      await db.delete(CHAPTER_STORE, chapterId);
      toast.success("Đã xóa chapter khỏi bộ nhớ offline");
    } catch (error) {
      console.error("Error removing offline chapter:", error);
      toast.error("Có lỗi xảy ra khi xóa chapter");
    }
  };

  const removeOfflineManga = async (mangaId: string) => {
    try {
      const db = await initDB();
      await db.delete(MANGA_STORE, mangaId);
      
      const chapters = await getAllOfflineChapters();
      const mangaChapters = chapters.filter(c => c.metadata.mangaId._id === mangaId);
      await Promise.all(
        mangaChapters.map(chapter => db.delete(CHAPTER_STORE, chapter.id))
      );

      toast.success("Đã xóa manga và các chapter khỏi bộ nhớ offline");
    } catch (error) {
      console.error("Error removing offline manga:", error);
      toast.error("Có lỗi xảy ra khi xóa manga");
    }
  };

  const isChapterDownloaded = async (chapterId: string): Promise<boolean> => {
    try {
      const chapter = await getOfflineChapter(chapterId);
      return !!chapter;
    } catch {
      return false;
    }
  };

  const isMangaDownloaded = async (mangaId: string): Promise<boolean> => {
    try {
      const manga = await getMangaOffline(mangaId);
      return !!manga;
    } catch {
      return false;
    }
  };

  return {
    downloadChapter,
    downloadManga,
    getOfflineChapter,
    getMangaOffline,
    getAllOfflineChapters,
    getAllOfflineMangas,
    removeOfflineChapter,
    removeOfflineManga,
    isChapterDownloaded,
    isMangaDownloaded,
  };
}; 