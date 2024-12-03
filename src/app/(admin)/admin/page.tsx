export default function AdminPage() {
  return (
    <div className="grid gap-4">
      <div className="rounded-lg border bg-card p-8">
        <h3 className="text-lg font-medium">Chào mừng đến trang Admin</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Đây là trang dành cho admin, chỉ những user có role admin mới có thể truy cập.
        </p>
      </div>
    </div>
  );
} 