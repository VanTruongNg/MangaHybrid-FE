"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatMessage } from "./chat-message";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, X, ChevronLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/store/chat.store";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import { useChatUIStore } from "@/store/chat-ui.store";
import { format, isToday, isYesterday } from "date-fns";
import type { PublicMessage, TempMessage } from "@/types/socket";
import { handleOpenPrivateRoom, handleMarkMessageRead } from "@/lib/socket-handlers";

interface ChatBoxProps {
  onClose: () => void;
}

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

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();

  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return 'Hôm qua';
  } else if (now.getFullYear() === date.getFullYear()) {
    return format(date, 'dd/MM');
  } else {
    return format(date, 'dd/MM/yyyy');
  }
};

export function ChatBox({ onClose }: ChatBoxProps) {
  const [message, setMessage] = useState("");
  const { publicMessages, resendMessage, privateRooms, privateMessages } = useChatStore();
  const { user: currentUser } = useAuth();
  const { sendMessage, sendPrivateMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { 
    activePrivateChat, 
    closePrivateChat,
    openExistingRoom
  } = useChatUIStore();
  const chatStore = useChatStore();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [publicMessages, privateMessages]);

  useEffect(() => {
    if (activePrivateChat) {
      const messages = privateMessages[activePrivateChat.id];
      if (messages?.length) {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [activePrivateChat, privateMessages]);

  useEffect(() => {
    if (activePrivateChat) {
      const tabsList = document.querySelector('[role="tablist"]');
      const privateTab = tabsList?.querySelector('[value="private"]') as HTMLButtonElement;
      if (privateTab) {
        privateTab.click();
      }
    }
  }, [activePrivateChat]);

  const handleClose = () => {
    closePrivateChat();
    onClose();
  };

  const handleSendPublicMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !currentUser) return;

    const result = await sendMessage(trimmedMessage);
    if (result) {
      setMessage("");
    }
  };

  const handleSendPrivateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !currentUser || !activePrivateChat) return;

    let receiverId: string;

    if (activePrivateChat.type === 'virtual') {
      // Chat mới - gửi userId của người nhận
      receiverId = activePrivateChat.id;
    } else {
      // Chat trong room có sẵn - cần lấy userId của người nhận
      const room = chatStore.privateRooms.find(r => r._id === activePrivateChat.id);
      const otherUser = room?.participants.find(p => p._id !== currentUser._id);
      if (!otherUser) return;
      receiverId = otherUser._id;
    }

    const tempId = await sendPrivateMessage(trimmedMessage, receiverId);
    
    if (tempId) {
      setMessage("");
    }
  };

  const renderPrivateChatHeader = () => {
    if (!activePrivateChat) return null;

    if (activePrivateChat.type === 'virtual') {
      // UI ảo - hiển thị thông tin từ user được lưu trong activePrivateChat
      const user = activePrivateChat.user;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback>
              {user?.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{user?.name}</span>
        </div>
      );
    } else {
      // Room thật - lấy thông tin từ room trong store
      const room = chatStore.privateRooms.find(r => r._id === activePrivateChat.id);
      const otherUser = room?.participants.find(p => p._id !== currentUser?._id);
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={otherUser?.avatarUrl} />
            <AvatarFallback>
              {otherUser?.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{otherUser?.name}</span>
        </div>
      );
    }
  };

  const renderRoomsList = () => (
    <ScrollArea className="flex-1">
      <div className="divide-y">
        {privateRooms.map(room => {
          const otherUser = room.participants.find(p => p._id !== currentUser?._id);
          const isLastMessageFromMe = room.lastSender?._id === currentUser?._id;
          
          const roomMessages = privateMessages[room._id] || [];
          const lastMessage = roomMessages[roomMessages.length - 1];
          
          return (
            <div 
              key={room._id}
              className="p-4 hover:bg-accent cursor-pointer"
              onClick={() => {
                chatStore.markRoomAsRead(room._id);
                
                openExistingRoom(room._id);
                handleOpenPrivateRoom(room._id);
                if (lastMessage && '_id' in lastMessage) {
                  handleMarkMessageRead(lastMessage._id);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherUser?.avatarUrl} />
                  <AvatarFallback>{otherUser?.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{otherUser?.name}</p>
                  {room.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {room.lastSender ? (
                        <>
                          {isLastMessageFromMe ? 'Bạn: ' : `${room.lastSender.name}: `}
                          {room.lastMessage}
                        </>
                      ) : (
                        room.lastMessage
                      )}
                    </p>
                  )}
                </div>

                {room.lastMessageAt && (
                  <span className="text-xs text-muted-foreground">
                    {formatTime(room.lastMessageAt)}
                  </span>
                )}

                {room.unreadCount && room.unreadCount > 0 && (
                  <div className="min-w-[20px] h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs text-primary-foreground">
                      {room.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );

  const renderPrivateMessages = () => {
    if (!activePrivateChat) return null;

    const roomId = activePrivateChat.type === 'virtual' 
      ? `virtual_${activePrivateChat.id}`
      : activePrivateChat.id;

    const messages = [...(privateMessages[roomId] || [])].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return (
      <div className="space-y-4">
        {messages.map((message, index) => {
          const prevMessage = messages[index - 1];
          const isGrouped = shouldGroupMessages(message, prevMessage);
          const showDateSection = shouldShowDateSection(message, prevMessage);

          const messageKey = 'tempId' in message ? message.tempId : message._id;

          return (
            <React.Fragment key={messageKey}>
              {showDateSection && (
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-2 text-xs text-muted-foreground">
                      {getDateSection(message.createdAt)}
                    </span>
                  </div>
                </div>
              )}

              <ChatMessage
                user={message.sender.name}
                avatar={message.sender.avatarUrl || ""}
                message={message.content}
                timestamp={message.createdAt}
                senderId={message.sender._id}
                isGrouped={isGrouped}
                isSending={'isSending' in message ? message.isSending : false}
                error={'error' in message ? message.error : undefined}
              />
            </React.Fragment>
          );
        })}
        <div ref={scrollRef} />
      </div>
    );
  };

  return (
    <div className="w-[380px] rounded-lg border bg-background shadow-lg">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Chat Box</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activePrivateChat ? "private" : "public"} className="w-full">
        <div className="border-b">
          <TabsList className="w-full h-12 bg-transparent gap-2 p-1">
            <TabsTrigger value="public" className="flex-1 h-full">
              Chung
            </TabsTrigger>
            <TabsTrigger value="private" className="flex-1 h-full">
              Riêng tư
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="public" className="m-0">
          <div className="flex h-[450px] flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col justify-end">
                <div>
                  {publicMessages.map((msg, index) => {
                    const prevMsg = index > 0 ? publicMessages[index - 1] : undefined;
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
                          avatar={msg.sender.avatarUrl || "https://github.com/shadcn.png"}
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
            {activePrivateChat ? (
              <>
                <div className="border-b p-4">
                  <div className="flex items-center gap-3">
                    <button
                      className="text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => closePrivateChat()}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {renderPrivateChatHeader()}
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  {renderPrivateMessages()}
                </ScrollArea>

                <div className="border-t p-4">
                  <form className="flex gap-2" onSubmit={handleSendPrivateMessage}>
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
            ) : (
              renderRoomsList()
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
