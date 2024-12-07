import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useNotificationStore } from '@/store/notification.store';
import type { Notification } from '@/types/socket';

export function useNotifications() {
  const queryClient = useQueryClient();
  const { setNotifications, setUnreadNotifications } = useNotificationStore();

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response.data;
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']);

      setNotifications((notifications) => 
        notifications.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );

      setUnreadNotifications((notifications) => 
        notifications.filter(n => n._id !== notificationId)
      );

      return { previousNotifications };
    },
    onError: (error, _, context) => {
      console.error('Mark as read error:', error);
      if (context?.previousNotifications) {
        setNotifications(context.previousNotifications);
        setUnreadNotifications(
          context.previousNotifications.filter(n => !n.isRead)
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending
  };
} 