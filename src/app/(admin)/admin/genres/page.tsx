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
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Genre, useGenres } from "@/hooks/use-genres";
import { useQueryClient } from "@tanstack/react-query";

export default function GenresPage() {
  const { data: genres, isLoading } = useGenres();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [formData, setFormData] = useState({
    name: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/genres", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Có lỗi xảy ra");

      await queryClient.invalidateQueries({ queryKey: ["genres"] });
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
      const response = await fetch(`/api/genres/${selectedGenre._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Có lỗi xảy ra");

      await queryClient.invalidateQueries({ queryKey: ["genres"] });
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
      const response = await fetch(`/api/genres/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Có lỗi xảy ra");

      await queryClient.invalidateQueries({ queryKey: ["genres"] });
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
    );
  }

  if (!genres) return null;

  return (
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
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
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
