"use client";

import { SearchMangaResult } from "@/types/search";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

interface MangaGridProps {
  mangas: SearchMangaResult[];
  isLoading?: boolean;
  className?: string;
}

export function MangaGrid({ mangas, isLoading, className }: MangaGridProps) {
  if (isLoading) {
    return (
      <div className={cn("grid gap-4", className)}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", className)}>
      {mangas.map((manga) => (
        <Link
          key={manga._id}
          href={`/manga/${manga._id}`}
          className="group space-y-2"
        >
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
            <Image
              src={manga.coverImg}
              alt={manga.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(min-width: 1280px) 16.67vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33.33vw, 50vw"
            />
          </div>
          <div className="space-y-1">
            <div className="font-medium line-clamp-2 group-hover:text-primary">
              {manga.title}
            </div>
            <div className="text-sm text-muted-foreground line-clamp-1">
              {manga.author}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
