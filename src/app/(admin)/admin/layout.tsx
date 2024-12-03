import { AdminGuard } from '@/components/auth/admin-guard';
import { Navbar } from '@/components/navbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="relative flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          </div>
          <main>{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
} 