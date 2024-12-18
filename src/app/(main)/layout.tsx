"use client";

import { Navbar } from "@/components/navbar";
import { FloatingChatButton } from "@/components/chat/floating-chat-button";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";
import { useReaderRoute } from "@/hooks/use-reader-route";
import { useChatUIStore } from "@/store/chat-ui.store";
import { ChatBox } from "@/components/chat/chat-box";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isReaderPage, shouldShowFooter } = useReaderRoute();
  const { isOpen, setOpen } = useChatUIStore();

  return (
    <div className={cn(
      "flex min-h-screen flex-col",
      isReaderPage && "bg-gray-900 dark:bg-gray-900"
    )}>
      <Navbar />
      <main className="flex-1 pb-20">{children}</main>
      {shouldShowFooter && <Footer />}

      <div className="fixed bottom-4 right-4 z-50">
        {isOpen && (
          <div className="absolute bottom-16 right-0">
            <ChatBox onClose={() => setOpen(false)} />
          </div>
        )}
        <FloatingChatButton onClick={() => setOpen(!isOpen)} />
      </div>
    </div>
  );
}
