import { create } from "zustand";
import { persist } from "zustand/middleware";

type ReadingMode = "CLASSIC" | "SPECIAL";

interface ReadingModeStore {
  mode: ReadingMode;
  setMode: (mode: ReadingMode) => void;
}

export const useReadingModeStore = create<ReadingModeStore>()(
  persist(
    (set) => ({
      mode: "CLASSIC",
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "reading-mode", // unique name for localStorage key
    }
  )
); 