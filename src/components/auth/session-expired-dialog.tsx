'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

interface Props {
  isOpen: boolean;
}

export function SessionExpiredDialog({ isOpen }: Props) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogin = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch {
      router.replace('/login');
    }
  };

  const handleDismiss = async () => {
    try {
      await logout();
    } catch {
      // Ignore error
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Phiên đăng nhập hết hạn</DialogTitle>
          <DialogDescription>
            Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng đầy đủ tính năng.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={handleDismiss}>
            Để sau
          </Button>
          <Button onClick={handleLogin}>
            Đăng nhập lại
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 