"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatMessage } from "./chat-message";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft } from "lucide-react";
import { useChatStore } from "@/store/chat.store";
import { useAuth } from "@/hooks/use-auth";
import { PublicMessage, TempMessage } from "@/types/socket";
import { format, isToday, isYesterday } from "date-fns";
import { useChat } from "@/hooks/use-chat";

interface ChatBoxProps {
  onClose: () => void;
}

const privateMessages = [
  {
    id: 1,
    user: "Admin",
    avatar: "https://github.com/shadcn.png",
    message: "Xin chào, tôi có thể giúp gì cho bạn?",
    timestamp: "1 giờ trước",
  },
  {
    id: 2,
    user: "Bạn",
    avatar: "https://github.com/shadcn.png",
    message: "Chào admin, mình cần hỗ trợ về vấn đề thanh toán",
    timestamp: "59 phút trước",
  },
  {
    id: 3,
    user: "Admin",
    avatar: "https://github.com/shadcn.png",
    message: "Bạn vui lòng cho mình biết chi tiết vấn đề bạn đang gặp phải",
    timestamp: "58 phút trước",
  },
  {
    id: 4,
    user: "Bạn",
    avatar: "https://github.com/shadcn.png",
    message: "Mình đã thanh toán nhưng chưa nhận được coins",
    timestamp: "57 phút trước",
  },
  {
    id: 5,
    user: "Admin",
    avatar: "https://github.com/shadcn.png",
    message: "Bạn có thể cung cấp mã giao dịch được không?",
    timestamp: "56 phút trước",
  },
  {
    id: 6,
    user: "Bạn",
    avatar: "https://github.com/shadcn.png",
    message: "Đây ạ: TX123456789",
    timestamp: "55 phút trước",
  },
  {
    id: 7,
    user: "Admin",
    avatar: "https://github.com/shadcn.png",
    message: "Cảm ơn bạn, để mình kiểm tra giúp bạn",
    timestamp: "54 phút trước",
  },
  {
    id: 8,
    user: "Admin",
    avatar: "https://github.com/shadcn.png",
    message: "Mình đã tìm thấy giao dịch của bạn",
    timestamp: "50 phút trước",
  },
  {
    id: 9,
    user: "Admin",
    avatar: "https://github.com/shadcn.png",
    message: "Có vẻ như có chút trục trặc trong quá trình xử lý",
    timestamp: "49 phút trước",
  },
  {
    id: 10,
    user: "Admin",
    avatar: "https://github.com/shadcn.png",
    message: "Mình sẽ cập nhật coins cho bạn ngay bây giờ",
    timestamp: "48 phút trước",
  },
  {
    id: 11,
    user: "Bạn",
    avatar: "https://github.com/shadcn.png",
    message: "Cảm ơn admin nhiều ạ",
    timestamp: "47 phút trước",
  },
  {
    id: 12,
    user: "Admin",
    avatar: "https://github.com/shadcn.png",
    message: "Coins đã được cập nhật. Bạn vui lòng kiểm tra lại giúp mình nhé",
    timestamp: "46 phút trước",
  },
  {
    id: 13,
    user: "Bạn",
    avatar: "https://github.com/shadcn.png",
    message: "Mình đã nhận được rồi ạ",
    timestamp: "45 phút trước",
  },
  {
    id: 14,
    user: "Admin",
    avatar: "https://github.com/shadcn.png",
    message: "Rất vui vì đã giúp được bạn. Bạn cần hỗ trợ gì thêm không ạ?",
    timestamp: "44 phút trước",
  },
  {
    id: 15,
    user: "Bạn",
    avatar: "https://github.com/shadcn.png",
    message: "Hiện tại mình không cần gì thêm . Cảm ơn admin nhiều!",
    timestamp: "43 phút trước",
  },
  {
    id: 16,
    user: "Admin",
    avatar: "https://github.com/shadcn.png",
    message: "Không có gì ạ. Chúc bạn một ngày tốt lành!",
    timestamp: "42 phút trước",
  },
];

const chatRooms = [
  {
    id: 1,
    name: "Admin Support",
    avatar: "https://github.com/shadcn.png",
    lastMessage: "Cảm ơn bạn đã liên hệ",
    timestamp: "5 phút trước",
    unread: 2,
  },
  {
    id: 2,
    name: "Mod Team",
    avatar: "https://github.com/shadcn.png",
    lastMessage: "Ok bạn nhé",
    timestamp: "15 phút trước",
    unread: 0,
  },
  {
    id: 3,
    name: "Hỗ trợ kỹ thuật",
    avatar: "https://github.com/shadcn.png",
    lastMessage: "Bạn vui lòng thử cập nhật lại ứng dụng",
    timestamp: "1 giờ trước",
    unread: 1,
  },
  {
    id: 4,
    name: "Góp ý & Báo lỗi",
    avatar: "https://github.com/shadcn.png",
    lastMessage: "Cảm ơn bạn đã báo cáo",
    timestamp: "2 giờ trước",
    unread: 0,
  },
  {
    id: 5,
    name: "Quản lý nội dung",
    avatar: "https://github.com/shadcn.png",
    lastMessage: "Nội dung của bạn đã được duyệt",
    timestamp: "1 ngày trước",
    unread: 0,
  },
];

const shouldGroupMessages = (
  currentMsg: PublicMessage | TempMessage,
  prevMsg?: PublicMessage | TempMessage
) => {
  if (!prevMsg) return false;

  const getCurrentSenderId = (msg: PublicMessage | TempMessage) => {
    if ("_id" in msg) {
      return msg.sender._id;
    }
    return msg.sender._id;
  };

  const currentSenderId = getCurrentSenderId(currentMsg);
  const prevSenderId = getCurrentSenderId(prevMsg);

  if (currentSenderId !== prevSenderId) return false;

  const currentTime = new Date(currentMsg.createdAt);
  const prevTime = new Date(prevMsg.createdAt);

  return currentTime.getTime() - prevTime.getTime() <= 3 * 60 * 1000;
};

const getDateSection = (timestamp: string) => {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return "Hôm nay";
  } else if (isYesterday(date)) {
    return "Hôm qua";
  }
  return format(date, "dd/MM/yyyy");
};

const shouldShowDateSection = (
  currentMsg: PublicMessage | TempMessage,
  prevMsg?: PublicMessage | TempMessage
) => {
  if (!prevMsg) return true;

  const currentDate = new Date(currentMsg.createdAt);
  const prevDate = new Date(prevMsg.createdAt);

  return currentDate.toDateString() !== prevDate.toDateString();
};

export function ChatBox({ onClose }: ChatBoxProps) {
  const [message, setMessage] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const { publicMessages, resendMessage } = useChatStore();
  const { user } = useAuth();
  const { sendMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView();
  }, [publicMessages]);

  const handleSendPublicMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    const result = await sendMessage(message);
    if (result) {
      setMessage("");
    }
  };

  return (
    <div className="w-[380px] rounded-lg border bg-background shadow-lg">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Chat Box</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="public" className="w-full">
        <div className="border-b">
          <TabsList className="w-full h-12 bg-transparent gap-2 p-1">
            <TabsTrigger
              value="public"
              className="flex-1 h-full rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                  <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                  <line x1="6" x2="6" y1="2" y2="4" />
                  <line x1="10" x2="10" y1="2" y2="4" />
                  <line x1="14" x2="14" y1="2" y2="4" />
                </svg>
                Chung
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="private"
              className="flex-1 h-full rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Riêng tư
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="public" className="m-0">
          <div className="flex h-[450px] flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col justify-end">
                <div>
                  {publicMessages.map((msg, index) => {
                    const prevMsg =
                      index > 0 ? publicMessages[index - 1] : undefined;
                    const isGrouped = shouldGroupMessages(msg, prevMsg);
                    const showDateSection = shouldShowDateSection(msg, prevMsg);

                    return (
                      <div key={`msg-${index}`}>
                        {showDateSection && (
                          <div className="flex items-center justify-center my-4">
                            <div className="text-xs font-medium text-muted-foreground px-3 py-1 rounded-full bg-muted/50">
                              {getDateSection(msg.createdAt)}
                            </div>
                          </div>
                        )}
                        <ChatMessage
                          user={msg.sender.name}
                          message={msg.content}
                          timestamp={msg.createdAt}
                          avatar={
                            msg.sender.avatarUrl ||
                            "https://github.com/shadcn.png"
                          }
                          senderId={msg.sender._id}
                          isGrouped={isGrouped}
                          isSending={"tempId" in msg && msg.isSending}
                          error={"tempId" in msg ? msg.error : undefined}
                          onResend={
                            "tempId" in msg
                              ? () => {
                                  resendMessage(msg.tempId);
                                  sendMessage(msg.content);
                                }
                              : undefined
                          }
                        />
                      </div>
                    );
                  })}
                </div>
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <form className="flex gap-2" onSubmit={handleSendPublicMessage}>
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="private" className="m-0">
          <div className="flex h-[450px] flex-col">
            {!selectedRoom ? (
              <ScrollArea className="flex-1">
                <div className="divide-y">
                  {chatRooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center gap-3 p-4 hover:bg-muted cursor-pointer"
                      onClick={() => setSelectedRoom(room.id)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={room.avatar} />
                        <AvatarFallback>{room.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{room.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {room.timestamp}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {room.lastMessage}
                          </p>
                          {room.unread > 0 && (
                            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                              {room.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <>
                <div className="border-b p-4">
                  <button
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedRoom(null)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Quay lại
                  </button>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {privateMessages.map((msg) => (
                      <ChatMessage key={msg.id} {...msg} senderId={msg.user} />
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-t p-4">
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setMessage("");
                    }}
                  >
                    <Input
                      placeholder="Nhập tin nhắn riêng tư..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button type="submit" size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
