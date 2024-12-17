import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { PublicProfile } from "@/types/user";

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data } = await api.get<PublicProfile>(`/user/profile/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
}; 