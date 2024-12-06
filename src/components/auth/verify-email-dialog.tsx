"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  password: string;
}

export function VerifyEmailDialog({ isOpen, onClose, email, password }: Props) {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get(
        `/auth/email/verify/${email}/${verificationCode}`
      );
      return response.data;
    },
    onSuccess: async () => {
      await login({ email, password });
      onClose();
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      setError(error.response?.data?.message || "Có lỗi xảy ra");
    },
  });

  const handleVerify = () => {
    if (!verificationCode) {
      setError("Vui lòng nhập mã xác thực");
      return;
    }
    setError("");
    verifyMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác thực email</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              <p>
                Vui lòng nhập mã xác thực đã được gửi đến email{" "}
                <span className="font-medium">{email}</span>
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Nhập mã xác thực"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            disabled={verifyMutation.isPending}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={verifyMutation.isPending}
          >
            Để sau
          </Button>
          <Button onClick={handleVerify} disabled={verifyMutation.isPending}>
            {verifyMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xác thực...
              </>
            ) : (
              "Xác thực"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
