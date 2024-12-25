"use client";

import Link from "next/link";
import { UserNav } from "./user-nav";
import { ThemeToggle } from "./theme/theme-toggle";
import { NotificationButton } from "./notifications/notification-button";
import { SearchButton } from "./search/search-button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isReaderPage =
    pathname.includes("/manga/") && pathname.includes("/chapter/");

  useEffect(() => {
    const handleScroll = () => {
      if (!isReaderPage) {
        const scrolled = window.scrollY > 0;
        if (isScrolled !== scrolled) {
          setIsScrolled(scrolled);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled, isReaderPage]);

  const commonStyles = isReaderPage
    ? "text-zinc-100/80 hover:text-zinc-100"
    : cn(
        "transition-colors duration-150",
        isScrolled
          ? "text-foreground hover:text-primary dark:text-slate-300 dark:hover:text-white"
          : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
      );

  return (
    <header
      data-scrolled={isScrolled}
      className={cn(
        "w-full",
        !isReaderPage && "sticky top-0 z-50",
        isReaderPage
          ? "bg-zinc-900/10 hover:bg-zinc-900/40 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.25)] backdrop-blur-[1px] hover:backdrop-blur-sm hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)]"
          : isScrolled
          ? "bg-background/80 backdrop-blur-sm border-b border-border"
          : "bg-transparent"
      )}
    >
      <div
        className={cn(
          "container relative flex h-14 items-center justify-between",
          isReaderPage && "bg-transparent"
        )}
      >
        <div className="w-32" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/" className="flex items-center space-x-2">
            <span
              className={cn(
                "font-bold text-xl tracking-wider",
                isReaderPage
                  ? "text-zinc-100/90 hover:text-zinc-100"
                  : cn(
                      "transition-colors duration-150",
                      isScrolled
                        ? "text-foreground hover:text-primary dark:text-slate-300 dark:hover:text-white"
                        : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    )
              )}
            >
              MANGA HYBRID
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-2 w-32 justify-end">
          <SearchButton className={commonStyles} />
          <NotificationButton className={commonStyles} />
          {!isReaderPage && <ThemeToggle className={commonStyles} />}
          <UserNav className={commonStyles} />
        </div>
      </div>
    </header>
  );
}
