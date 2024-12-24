import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminGuard } from "@/components/auth/admin-guard";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </AdminGuard>
  );
}
