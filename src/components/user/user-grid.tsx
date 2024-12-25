"use client";

import { SearchUserResult } from "@/types/search";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { UserCircle2 } from "lucide-react";

interface UserGridProps {
  users: SearchUserResult[];
  isLoading?: boolean;
  className?: string;
}

export function UserGrid({ users, isLoading, className }: UserGridProps) {
  if (isLoading) {
    return (
      <div className={cn("grid gap-4", className)}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", className)}>
      {users.map((user) => (
        <Link
          key={user._id}
          href={`/users/${user._id}`}
          className="group flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-accent/50"
        >
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="bg-secondary">
              {user.avatarUrl ? (
                <UserCircle2 className="h-12 w-12 text-secondary-foreground" />
              ) : (
                <span className="text-2xl font-medium text-secondary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </AvatarFallback>
          </Avatar>
          <div className="font-medium text-center group-hover:text-primary">
            {user.name}
          </div>
        </Link>
      ))}
    </div>
  );
}
