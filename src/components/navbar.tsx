"use client";

import Link from "next/link";
import { UserNav } from "./user-nav";
import { ThemeToggle } from "./theme/theme-toggle";
import { NotificationButton } from "./notifications/notification-button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 0;
      if (isScrolled !== scrolled) {
        setIsScrolled(scrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  const commonStyles = cn(
    "transition-colors duration-150",
    isScrolled
      ? "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
      : "text-slate-200 hover:text-white dark:text-slate-300 dark:hover:text-white"
  );

  return (
    <header
      data-scrolled={isScrolled}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-150",
        isScrolled ? "bg-background/80 backdrop-blur-sm" : "bg-transparent"
      )}
    >
      <div className="container relative flex h-14 items-center justify-between">
        {/* Left section - Empty */}
        <div className="w-32" />

        {/* Center section - Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/" className="flex items-center space-x-2">
            <span
              className={cn(
                "font-bold text-xl tracking-wider transition-colors duration-150",
                commonStyles
              )}
            >
              MANGA HYBRID
            </span>
          </Link>
        </div>

        {/* Right section - Grouped controls */}
        <div className="flex items-center space-x-2">
          <NotificationButton className={commonStyles} />
          <ThemeToggle className={commonStyles} />
          <UserNav className={commonStyles} />
        </div>
      </div>
    </header>
  );
}
