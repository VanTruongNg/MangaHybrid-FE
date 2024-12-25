"use client";

import {
  SearchMangaResult,
  SearchType,
  SearchUserResult,
} from "@/types/search";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { UserCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SearchResultsProps {
  type: SearchType;
  keyword: string;
  results: (SearchMangaResult | SearchUserResult)[];
  total: number;
  onClose?: () => void;
}

export function SearchResults({
  type,
  keyword,
  results,
  total,
  onClose,
}: SearchResultsProps) {
  const hasMore = total > 5;

  return (
    <div className="mt-2">
      <div className="space-y-1">
        {results.map((result) => {
          if (type === "manga") {
            const manga = result as SearchMangaResult;
            return (
              <Link
                key={manga._id}
                href={`/manga/${manga._id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                onClick={onClose}
              >
                <div className="relative w-10 h-14 rounded overflow-hidden">
                  <Image
                    src={manga.coverImg}
                    alt={manga.title}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{manga.title}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {manga.author}
                  </div>
                </div>
              </Link>
            );
          } else {
            const user = result as SearchUserResult;
            return (
              <Link
                key={user._id}
                href={`/users/${user._id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                onClick={onClose}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="bg-secondary">
                    {user.avatarUrl ? (
                      <UserCircle2 className="h-6 w-6 text-secondary-foreground" />
                    ) : (
                      <span className="font-medium text-sm text-secondary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{user.name}</div>
                </div>
              </Link>
            );
          }
        })}
      </div>

      {hasMore && (
        <Link
          href={`/browse?keyword=${encodeURIComponent(keyword)}&type=${type}`}
          className={cn(
            "block w-full p-2 text-center rounded-lg",
            "bg-accent/50 hover:bg-accent transition-colors",
            "text-sm text-muted-foreground hover:text-foreground"
          )}
          onClick={onClose}
        >
          Xem tất cả kết quả ({total})
        </Link>
      )}
    </div>
  );
}
