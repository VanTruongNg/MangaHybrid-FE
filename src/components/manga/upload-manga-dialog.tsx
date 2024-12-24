"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUploadMangaStore } from "@/store/upload-manga.store";
import { useGenres } from "@/hooks/use-genres";
import { useUploadManga } from "@/hooks/use-upload-manga";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import Image from "next/image";

interface FormData {
  title: string;
  description: string;
  author: string;
  coverImg: File | null;
  bannerImg: File | null;
}

interface ImagePreview {
  coverImg: string | null;
  bannerImg: string | null;
}

export function UploadMangaDialog() {
  const { isOpen, setOpen } = useUploadMangaStore();
  const { data: genres, isLoading: isLoadingGenres } = useGenres();
  const uploadManga = useUploadManga();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    author: "",
    coverImg: null,
    bannerImg: null,
  });
  const [preview, setPreview] = useState<ImagePreview>({
    coverImg: null,
    bannerImg: null,
  });

  useEffect(() => {
    return () => {
      if (preview.coverImg) URL.revokeObjectURL(preview.coverImg);
      if (preview.bannerImg) URL.revokeObjectURL(preview.bannerImg);
    };
  }, [preview]);

  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.coverImg || !formData.bannerImg) {
      toast.error("Hãy thêm đầy đủ ảnh bìa và ảnh banner!");
      return;
    }

    uploadManga.mutate(
      {
        title: formData.title,
        description: formData.description,
        author: formData.author,
        genre: selectedGenres,
        coverImg: formData.coverImg,
        bannerImg: formData.bannerImg,
      },
      {
        onSuccess: () => {
          setOpen(false);
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      author: "",
      coverImg: null,
      bannerImg: null,
    });
    setSelectedGenres([]);
    if (preview.coverImg) URL.revokeObjectURL(preview.coverImg);
    if (preview.bannerImg) URL.revokeObjectURL(preview.bannerImg);
    setPreview({ coverImg: null, bannerImg: null });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "coverImg" | "bannerImg"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File không được vượt quá 5MB");
        return;
      }
      if (!file.type.match(/^image\/(jpeg|png)$/)) {
        toast.error("Chỉ chấp nhận file ảnh định dạng JPG hoặc PNG");
        return;
      }

      if (preview[type]) URL.revokeObjectURL(preview[type]!);

      const previewUrl = URL.createObjectURL(file);
      setPreview((prev) => ({ ...prev, [type]: previewUrl }));
      setFormData((prev) => ({ ...prev, [type]: file }));
    }
  };

  const removeImage = (type: "coverImg" | "bannerImg") => {
    if (preview[type]) URL.revokeObjectURL(preview[type]!);
    setPreview((prev) => ({ ...prev, [type]: null }));
    setFormData((prev) => ({ ...prev, [type]: null }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Đăng truyện mới</DialogTitle>
          <DialogDescription>
            Điền thông tin truyện bạn muốn đăng tải
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Tên truyện</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="author">Tác giả</Label>
              <Input
                id="author"
                required
                value={formData.author}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, author: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Ảnh bìa</Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileChange(e, "coverImg")}
                />
                {preview.coverImg && (
                  <div className="relative w-32 h-48 group">
                    <Image
                      src={preview.coverImg}
                      alt="Cover preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage("coverImg")}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Ảnh banner</Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileChange(e, "bannerImg")}
                />
                {preview.bannerImg && (
                  <div className="relative w-full h-32 group">
                    <Image
                      src={preview.bannerImg}
                      alt="Banner preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage("bannerImg")}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isLoadingGenres ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-20" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Thể loại</Label>
                <div className="flex flex-wrap gap-2">
                  {genres?.map((genre) => {
                    const isSelected = selectedGenres.includes(genre._id);
                    return (
                      <button
                        key={genre._id}
                        type="button"
                        onClick={() => toggleGenre(genre._id)}
                        className={cn(
                          "rounded-lg border px-3 py-1 text-sm transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {genre.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={uploadManga.isPending}
              className="w-full"
            >
              {uploadManga.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Đăng truyện
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
