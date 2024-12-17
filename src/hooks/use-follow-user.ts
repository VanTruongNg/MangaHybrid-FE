import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { User } from "@/types/user";

export const useFollowUser = (targetUserId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, action }: { 
      userId: string; 
      action: 'follow' | 'unfollow' 
    }) => {
      const { data } = await api.post(`/user/${action}/${userId}`);
      return data;
    },
    onMutate: async ({ action }) => {
      await queryClient.cancelQueries({ queryKey: ['user', targetUserId] });

      const previousUser = queryClient.getQueryData<User>(['user', targetUserId]);
      const currentUser = queryClient.getQueryData<User>(['user', 'me']);

      if (previousUser && currentUser) {
        const newFollowers = action === 'follow'
          ? [...(previousUser.followers || []), { _id: currentUser._id, name: currentUser.name, avatarUrl: currentUser.avatarUrl }]
          : previousUser.followers?.filter(f => f._id !== currentUser._id) || [];

        queryClient.setQueryData(['user', targetUserId], {
          ...previousUser,
          followers: newFollowers
        });
      }

      return { previousUser };
    },
    onError: (_, __, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(['user', targetUserId], context.previousUser);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['user', targetUserId] });
    }
  });
}; 