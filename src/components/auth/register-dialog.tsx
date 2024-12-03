'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { VerifyEmailDialog } from "./verify-email-dialog";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  password: string;
  verificationCode?: string;
}

export function RegisterDialog({ isOpen, onClose, email, password, verificationCode }: Props) {
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const { login } = useAuth();

  const handleVerify = () => {
    setShowVerifyDialog(true);
    onClose();
  };

  const handleLogin = () => {
    login({ email, password });
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đăng ký thành công!</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Chúng tôi đã gửi mã xác thực đến email{' '}
                  <span className="font-medium">{email}</span>
                </p>
                {verificationCode && (
                  <div className="mt-4 rounded-lg bg-muted p-4">
                    <p className="text-center font-mono text-2xl font-bold tracking-wider">
                      {verificationCode}
                    </p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Bạn có thể đăng nhập ngay hoặc xác thực email để sử dụng đầy đủ tính năng.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={handleVerify}>
              Xác thực email
            </Button>
            <Button onClick={handleLogin}>
              Đăng nhập ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VerifyEmailDialog
        isOpen={showVerifyDialog}
        onClose={() => setShowVerifyDialog(false)}
        email={email}
        password={password}
      />
    </>
  );
} 