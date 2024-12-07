import { create } from 'zustand';

interface GradientStore {
  color: string;
  setColor: (color: string) => void;
}

const defaultGradient = "linear-gradient(132deg, rgb(183, 169, 177) 0%, rgb(35, 22, 46) 100%)";

export const useGradientStore = create<GradientStore>((set) => ({
  color: defaultGradient,
  setColor: (gradient: string) => set({ color: gradient }),
})); 