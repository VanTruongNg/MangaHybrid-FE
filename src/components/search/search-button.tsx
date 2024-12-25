"use client";

import { Search } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SearchResults } from "./search-results";
import { SearchType } from "@/types/search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useSearch } from "@/hooks/use-search";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "../ui/skeleton";

interface SearchButtonProps {
  className?: string;
}

export function SearchButton({ className }: SearchButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("manga");
  const router = useRouter();
  const debouncedQuery = useDebounce(searchQuery, 800);

  const { data, isLoading } = useSearch({
    type: searchType,
    query: debouncedQuery,
    limit: 5,
    enabled: isOpen,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/browse?keyword=${encodeURIComponent(
          searchQuery.trim()
        )}&type=${searchType}`
      );
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="space-y-0">
          <VisuallyHidden asChild>
            <DialogTitle>Tìm kiếm</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchType === "manga"
                  ? "Nhập tên truyện..."
                  : "Nhập tên người dùng..."
              }
              className="w-full pl-9"
              autoFocus
            />
          </div>
          <Select
            value={searchType}
            onValueChange={(value: SearchType) => setSearchType(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Loại tìm kiếm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manga">Truyện</SelectItem>
              <SelectItem value="user">Người dùng</SelectItem>
            </SelectContent>
          </Select>
        </form>

        {searchQuery && (
          <div className="mt-2 space-y-1">
            {isLoading ? (
              <>
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
              </>
            ) : (
              data && (
                <SearchResults
                  type={searchType}
                  keyword={searchQuery}
                  results={data.results}
                  total={data.total}
                  onClose={() => {
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                />
              )
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
