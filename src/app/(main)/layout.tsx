import { Navbar } from '@/components/navbar';
import { FloatingChatButton } from '@/components/chat/floating-chat-button';
import { MangaCarousel } from '@/components/manga/manga-carousel';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Hero Section with Custom Gradient */}
      <div className="absolute top-0 left-0 right-0 w-full h-[55vh]">
        {/* Main Gradient */}
        <div 
          className="absolute inset-0 brightness-75"
          style={{
            background: 'linear-gradient(132deg, rgb(183, 169, 177) 0%, rgb(35, 22, 46) 100%)'
          }}
        />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Manga Carousel */}
      <MangaCarousel />

      {/* Main Content */}
      <main className="relative flex-1">
        {children}
      </main>
      
      <FloatingChatButton />
    </div>
  );
} 