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
import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SessionExpiredDialog({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { logout } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      logout();
    }
  }, [isOpen, logout]);

  const handleLogin = () => {
    onClose();
    router.push('/login');
  };

  const handleDismiss = () => {
    onClose();
    router.push('/');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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