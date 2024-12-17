import { create } from 'zustand';

interface FollowMangaStore {
  followedMangaIds: Set<string>;
  addFollowedManga: (mangaId: string) => void;
  removeFollowedManga: (mangaId: string) => void;
  isFollowed: (mangaId: string) => boolean;
  setFollowedMangaIds: (mangaIds: string[]) => void;
  clearFollowedManga: () => void;
}

export const useFollowMangaStore = create<FollowMangaStore>((set, get) => ({
  followedMangaIds: new Set<string>(),
  
  addFollowedManga: (mangaId: string) => 
    set((state) => ({
      followedMangaIds: new Set([...state.followedMangaIds, mangaId])
    })),
    
  removeFollowedManga: (mangaId: string) =>
    set((state) => {
      const newIds = new Set(state.followedMangaIds);
      newIds.delete(mangaId);
      return { followedMangaIds: newIds };
    }),
    
  isFollowed: (mangaId: string) => 
    get().followedMangaIds.has(mangaId),
    
  setFollowedMangaIds: (mangaIds: string[]) =>
    set({ followedMangaIds: new Set(mangaIds) }),

  clearFollowedManga: () => 
    set({ followedMangaIds: new Set() })
}));