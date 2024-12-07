import { Navbar } from '@/components/navbar';
import { FloatingChatButton } from '@/components/chat/floating-chat-button';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Navbar />
      {children}
      <FloatingChatButton />
    </div>
  );
} 