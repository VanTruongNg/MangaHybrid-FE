import { create } from 'zustand';

interface UploadMangaStore {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export const useUploadMangaStore = create<UploadMangaStore>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
})); 