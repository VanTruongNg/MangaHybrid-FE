"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Genre,
  useGenres,
  useAddGenre,
  useUpdateGenre,
  useDeleteGenre,
} from "@/hooks/use-genres";
import { cn } from "@/lib/utils";
import Fuse from "fuse.js";
import { ScrollArea } from "@/components/ui/scroll-area";

type FuseResult = {
  item: Genre;
  refIndex: number;
};

export default function GenresPage() {
  const { data: genres, isLoading } = useGenres();
  const addGenre = useAddGenre();
  const updateGenre = useUpdateGenre();
  const deleteGenre = useDeleteGenre();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [searchResults, setSearchResults] = useState<FuseResult[]>([]);
  const { toast } = useToast();

  const handleNameChange = (value: string) => {
    setFormData({ name: value });

    if (!genres || !value) {
      setSearchResults([]);
      return;
    }

    const fuse = new Fuse(genres, {
      keys: ["name"],
      threshold: 0.4,
    });

    const results = fuse.search(value);
    setSearchResults(results);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addGenre.mutateAsync(formData);
      setIsAddDialogOpen(false);
      setFormData({ name: "" });
      toast({
        title: "Thành công",
        description: "Đã thêm thể loại mới",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm thể loại",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGenre) return;

    try {
      await updateGenre.mutateAsync({
        id: selectedGenre._id,
        data: formData,
      });
      setIsEditDialogOpen(false);
      setSelectedGenre(null);
      setFormData({ name: "" });
      toast({
        title: "Thành công",
        description: "Đã cập nhật thể loại",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật thể loại",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thể loại này?")) return;

    try {
      await deleteGenre.mutateAsync(id);
      toast({
        title: "Thành công",
        description: "Đã xóa thể loại",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa thể loại",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-65px)]">
        <ScrollArea className="h-full">
          <div className="container py-6 space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên thể loại</TableHead>
                    <TableHead>Số truyện</TableHead>
                    <TableHead className="w-[100px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (!genres) return null;

  return (
    <div className="h-[calc(100vh-65px)]">
      <ScrollArea className="h-full">
        <div className="container py-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Quản lý thể loại</h1>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>Thêm thể loại</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm thể loại mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên thể loại</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="pl-9"
                        placeholder="Nhập tên thể loại..."
                        required
                      />
                      {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-background border rounded-lg shadow-lg z-10">
                          <div className="text-sm font-medium text-muted-foreground mb-2">
                            Thể loại tương tự:
                          </div>
                          <div className="space-y-1">
                            {searchResults.map(({ item, refIndex }) => (
                              <div
                                key={refIndex}
                                className={cn(
                                  "px-2 py-1.5 rounded-md text-sm",
                                  "bg-accent/50"
                                )}
                              >
                                {item.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Thêm
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên thể loại</TableHead>
                  <TableHead>Số truyện</TableHead>
                  <TableHead className="w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {genres.map((genre) => (
                  <TableRow key={genre._id}>
                    <TableCell className="font-medium">{genre.name}</TableCell>
                    <TableCell>{genre.manga.length}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedGenre(genre);
                            setFormData({
                              name: genre.name,
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(genre._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </ScrollArea>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thể loại</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên thể loại</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Cập nhật
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
