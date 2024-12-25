"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SearchType } from "@/types/search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearch } from "@/hooks/use-search";
import { MangaGrid } from "@/components/manga/manga-grid";
import { UserGrid } from "@/components/user/user-grid";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export default function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlKeyword = searchParams.get("keyword") || "";
  const urlType = (searchParams.get("type") as SearchType) || "manga";

  const [keyword, setKeyword] = useState(urlKeyword);
  const [type, setType] = useState<SearchType>(urlType);
  const debouncedKeyword = useDebounce(keyword, 800);
  const debouncedType = useDebounce(type, 800);

  useEffect(() => {
    if (debouncedKeyword.trim()) {
      router.push(
        `/browse?keyword=${encodeURIComponent(
          debouncedKeyword.trim()
        )}&type=${debouncedType}`
      );
    }
  }, [debouncedKeyword, debouncedType, router]);

  const { data: mangaData, isLoading: isMangaLoading } = useSearch({
    type: "manga",
    query: debouncedKeyword,
    enabled: Boolean(debouncedKeyword) && debouncedType === "manga",
  });

  const { data: userData, isLoading: isUserLoading } = useSearch({
    type: "user",
    query: debouncedKeyword,
    enabled: Boolean(debouncedKeyword) && debouncedType === "user",
  });

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col items-center space-y-2 mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Tìm kiếm</h1>
        <p className="text-muted-foreground">Tìm kiếm truyện hoặc người dùng</p>
      </div>

      <div className="max-w-2xl mx-auto relative -mt-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={
                type === "manga"
                  ? "Nhập tên truyện..."
                  : "Nhập tên người dùng..."
              }
              className="w-full pl-9"
            />
          </div>
          <Select
            value={type}
            onValueChange={(value: SearchType) => setType(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Loại tìm kiếm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manga">Truyện</SelectItem>
              <SelectItem value="user">Người dùng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {keyword && (
        <>
          <div className="text-lg">
            Tìm {type === "manga" ? "truyện" : "người dùng"} với từ khóa{" "}
            <span className="font-bold">{keyword}</span>{" "}
            {type === "manga"
              ? mangaData && (
                  <span className="text-muted-foreground">
                    ({mangaData.total} kết quả)
                  </span>
                )
              : userData && (
                  <span className="text-muted-foreground">
                    ({userData.total} kết quả)
                  </span>
                )}
          </div>

          {type === "manga" ? (
            <MangaGrid
              isLoading={isMangaLoading}
              mangas={mangaData?.results || []}
              className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            />
          ) : (
            <UserGrid
              isLoading={isUserLoading}
              users={userData?.results || []}
              className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            />
          )}
        </>
      )}
    </div>
  );
}
