import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { toast } from "sonner";

interface UpdateChapterPagesParams {
  chapterId: string;
  files: File[];
}

export const useUpdateChapterPages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chapterId, files }: UpdateChapterPagesParams) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const { data } = await axios.patch(
        `/chapters/update-page/${chapterId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data;
    },
    onSuccess: (_, { chapterId }) => {
      // Invalidate chapter detail query
      queryClient.invalidateQueries({
        queryKey: ["chapter", chapterId],
      });
      toast.success("Cập nhật trang thành công");
    },
    onError: (error: unknown) => {
      console.error("Error updating chapter pages:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trang");
    },
  });
}; 