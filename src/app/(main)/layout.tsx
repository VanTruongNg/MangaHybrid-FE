import { Navbar } from "@/components/navbar";
import { FloatingChatButton } from "@/components/chat/floating-chat-button";
import { Footer } from "@/components/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-20">{children}</main>
      <Footer />
      <FloatingChatButton />
    </div>
  );
}
