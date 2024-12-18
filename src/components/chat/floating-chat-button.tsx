"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useChatStore } from "@/store/chat.store";

interface FloatingChatButtonProps {
  onClick: () => void;
}

export function FloatingChatButton({ onClick }: FloatingChatButtonProps) {
  const privateRooms = useChatStore((state) => state.privateRooms);
  
  // Tính tổng số tin nhắn chưa đọc từ tất cả room
  const totalUnread = privateRooms.reduce((total, room) => total + (room.unreadCount || 0), 0);

  return (
    <div className="fixed bottom-4 right-4">
      <Button
        size="icon"
        className="h-12 w-12 rounded-full relative"
        onClick={onClick}
      >
        <MessageCircle className="h-6 w-6" />
        
        {/* Hiển thị badge khi có tin nhắn chưa đọc */}
        {totalUnread > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-destructive flex items-center justify-center">
            <span className="text-xs font-medium text-destructive-foreground">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          </div>
        )}
      </Button>
    </div>
  );
} 