"use client";

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserCircle2 } from "lucide-react";
import { useReaderRoute } from "@/hooks/use-reader-route";

interface UserNavProps {
  className?: string;
}

export function UserNav({ className }: UserNavProps) {
  const { user, isLoading, logout } = useAuth();
  const { shouldHideUI } = useReaderRoute();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore error
    }
  };

  if (shouldHideUI) return null;

  return (
    <div className="relative">
      {isLoading ? (
        <div
          className={`w-8 h-8 rounded-full bg-muted animate-pulse ${className}`}
        />
      ) : !user ? (
        <Button variant="ghost" className={className} asChild>
          <Link href="/login">Đăng nhập</Link>
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`relative h-8 w-8 rounded-full ${className}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-secondary">
                  {user.avatarUrl ? (
                    <UserCircle2 className="h-6 w-6 text-secondary-foreground" />
                  ) : (
                    <span className="font-medium text-sm text-secondary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.role === "admin" && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="text-primary">
                    Admin Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="text-foreground hover:text-primary"
              >
                Hồ sơ
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/settings"
                className="text-foreground hover:text-primary"
              >
                Cài đặt
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive hover:text-destructive/90 focus:text-destructive"
            >
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
