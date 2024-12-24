"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, BookOpen, Tag, LayoutDashboard } from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Truyện",
    href: "/admin/manga",
    icon: BookOpen,
  },
  {
    title: "Thể loại",
    href: "/admin/genres",
    icon: Tag,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 min-h-screen bg-card border-r border-border">
      <div className="p-6">
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
      </div>
      <nav className="space-y-1 px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
