'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      setIsRedirecting(true);
      router.replace('/login');
      return;
    }

    if (!isLoading && !isRedirecting) {
      if (!user) {
        setIsRedirecting(true);
        router.replace('/login');
      } else if (user.role !== 'admin') {
        setIsRedirecting(true);
        router.replace('/');
      }
    }
  }, [user, router, isLoading, isRedirecting]);

  if (isLoading || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
} 