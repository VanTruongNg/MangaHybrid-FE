"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { usePendingMangas } from "@/hooks/use-pending-mangas";
import { useApproveManga } from "@/hooks/use-approve-manga";
import Image from "next/image";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/components/ui/use-toast";

export default function AdminMangaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);
  const { toast } = useToast();

  const { data } = usePendingMangas({
    page: 1,
    limit: 10,
  });

  const approveManga = useApproveManga();

  const filteredData = data?.mangas.filter((manga) =>
    manga.title.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  const handleApprove = async (id: string) => {
    try {
      await approveManga.mutateAsync(id);
      toast({
        title: "Thành công",
        description: "Đã duyệt truyện",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể duyệt truyện",
      });
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Duyệt truyện</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm truyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Truyện</TableHead>
              <TableHead>Người đăng</TableHead>
              <TableHead>Thể loại</TableHead>
              <TableHead>Ngày đăng</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData?.map((manga) => (
              <TableRow key={manga._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-14 rounded overflow-hidden">
                      <Image
                        src={manga.coverImg}
                        alt={manga.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">{manga.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {manga.author}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{manga.uploader.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {manga.uploader.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {manga.genre.map((genre) => (
                      <Badge key={genre._id} variant="secondary">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(manga.createdAt).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-green-500 hover:bg-green-500/10"
                      onClick={() => handleApprove(manga._id)}
                      disabled={approveManga.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-red-500 hover:bg-red-500/10"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
