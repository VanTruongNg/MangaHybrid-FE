import { Navbar } from '@/components/navbar';
import { FloatingChatButton } from '@/components/chat/floating-chat-button';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <FloatingChatButton />
    </div>
  );
} 