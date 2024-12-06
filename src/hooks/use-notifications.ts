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
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']);

      // Optimistically update notifications
      setNotifications((notifications) => 
        notifications.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );

      // Remove from unread notifications
      setUnreadNotifications((notifications) => 
        notifications.filter(n => n._id !== notificationId)
      );

      return { previousNotifications };
    },
    onError: (error, _, context) => {
      console.error('Mark as read error:', error);
      // Rollback on error
      if (context?.previousNotifications) {
        setNotifications(context.previousNotifications);
        setUnreadNotifications(
          context.previousNotifications.filter(n => !n.isRead)
        );
      }
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending
  };
} 