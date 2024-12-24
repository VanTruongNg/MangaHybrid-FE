import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface UploadMangaData {
  title: string;
  description: string;
  author: string;
  genre: string[];
  coverImg: File;
  bannerImg: File;
}

interface ApiErrorResponse {
  message: string;
  statusCode: number;
}

export function useUploadManga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadMangaData) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("author", data.author);
      
      data.genre.forEach((genreId) => {
        formData.append("genre[]", genreId);
      });

      formData.append("coverImg", data.coverImg);
      formData.append("bannerImg", data.bannerImg);

      const response = await api.post("/manga/create-manga", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Đăng truyện thành công");
      queryClient.invalidateQueries({ queryKey: ["manga"] });
      queryClient.invalidateQueries({ queryKey: ["genres"] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi đăng truyện");
    },
  });
} 