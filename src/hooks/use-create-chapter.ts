import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { ChapterType } from "@/app/(main)/manga/[id]/page";

interface CreateChapterParams {
  mangaId: string;
  chapterType: ChapterType;
  number?: number;
  chapterTitle?: string;
  files: File[];
}

export const useCreateChapter = (mangaId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: Omit<CreateChapterParams, "mangaId">) => {
      const formData = new FormData();
      formData.append("chapterType", params.chapterType);
      if (params.number) formData.append("number", params.number.toString());
      if (params.chapterTitle) formData.append("chapterTitle", params.chapterTitle);
      params.files.forEach((file) => {
        formData.append("files", file);
      });

      const { data } = await axios.post(
        `/chapters/manga/${mangaId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["manga", mangaId],
      });
      toast.success("Thêm chapter thành công");
    },
    onError: (error: unknown) => {
      console.error("Error creating chapter:", error);
      toast.error("Có lỗi xảy ra khi thêm chapter");
    },
  });
}; 