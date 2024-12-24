import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationStore } from "@/store/notification.store";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Notification, NotificationType } from "@/types/socket";
import { useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/use-notifications";

interface NotificationListProps {
  filter: "all" | "unread";
}

export function NotificationList({ filter }: NotificationListProps) {
  const { notifications, unreadNotifications, setNotifications } =
    useNotificationStore();
  const { markAsRead } = useNotifications();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: async () => {
      if (filter === "unread") return null;
      const { data } = await api.get<Notification[]>("/notifications");
      return data;
    },
    enabled: filter === "all",
  });

  useEffect(() => {
    if (data) {
      setNotifications(data);
    }
  }, [data, setNotifications]);

  const displayNotifications =
    filter === "unread" ? unreadNotifications : notifications;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch {
      toast.error("Không thể đánh dấu đã đọc thông báo");
    }
  };

  if (isLoading) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        Đang tải...
      </div>
    );
  }

  if (!displayNotifications || displayNotifications.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        Không có thông báo nào
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-3 p-2">
        {displayNotifications.map((notification) => {
          const notificationId = notification._id;
          return (
            <div
              key={notificationId}
              className={`flex gap-3 rounded-lg p-3 text-sm transition-colors hover:bg-accent cursor-pointer ${
                !notification.isRead ? "bg-accent/40" : ""
              }`}
              onClick={() => handleMarkAsRead(notificationId)}
            >
              {notification.manga && (
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={notification.manga.coverImg}
                    alt={notification.manga.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              )}

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`font-medium line-clamp-1 flex items-center gap-2 ${
                      notification.type === NotificationType.NEW_MANGA_PENDING
                        ? "text-primary"
                        : ""
                    }`}
                  >
                    {notification.manga?.title}
                    {notification.type ===
                      NotificationType.NEW_MANGA_PENDING && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">
                        Chờ duyệt
                      </span>
                    )}
                  </h4>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </time>
                </div>

                <p className="text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>

                {notification.type === NotificationType.NEW_CHAPTER &&
                  notification.chapter && (
                    <div className="text-xs text-muted-foreground">
                      Chương {notification.chapter.number}
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
