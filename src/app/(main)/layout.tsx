"use client";

import { Navbar } from "@/components/navbar";
import { FloatingChatButton } from "@/components/chat/floating-chat-button";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";
import { useReaderRoute } from "@/hooks/use-reader-route";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isReaderPage, shouldShowFooter } = useReaderRoute();

  return (
    <div className={cn(
      "flex min-h-screen flex-col",
      isReaderPage && "bg-gray-900 dark:bg-gray-900"
    )}>
      <Navbar />
      <main className="flex-1 pb-20">{children}</main>
      {shouldShowFooter && <Footer />}
      <FloatingChatButton />
    </div>
  );
}
