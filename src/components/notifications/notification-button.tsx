"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationList } from "@/components/notifications/notification-list";
import { useNotificationStore } from "@/store/notification.store";

export function NotificationButton() {
  const { unreadNotifications } = useNotificationStore();
  const hasUnread = unreadNotifications.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {unreadNotifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[380px]" align="end" sideOffset={5}>
        <div className="flex flex-col space-y-4 p-2">
          <h4 className="font-medium px-2">Thông báo</h4>
          <Tabs defaultValue="unread" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="unread" className="flex-1">
                Chưa đọc
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1">
                Tất cả
              </TabsTrigger>
            </TabsList>
            <TabsContent value="unread">
              <NotificationList filter="unread" />
            </TabsContent>
            <TabsContent value="all">
              <NotificationList filter="all" />
            </TabsContent>
          </Tabs>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
