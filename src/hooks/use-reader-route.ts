import { usePathname } from "next/navigation";
import { useReadingModeStore } from "@/store/reading-mode.store";
import { useEffect, useState } from "react";

export function useReaderRoute() {
  const pathname = usePathname();
  const { mode } = useReadingModeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isReaderPage = pathname.includes("/manga/") && pathname.includes("/chapter/");
  const isClassicMode = mode === "CLASSIC";

  return {
    isReaderPage,
    isClassicMode,
    mounted,
    shouldShowFooter: mounted && (!isReaderPage || (isReaderPage && isClassicMode))
  };
} 