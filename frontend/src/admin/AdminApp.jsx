import React from "react";
import { AdminProvider, useAdmin } from "./AdminContext";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";

function Switch() {
  const { me, loading } = useAdmin();
  if (loading) {
    return (
      <div
        data-testid="admin-checking-auth"
        className="flex min-h-screen items-center justify-center bg-[color:var(--torres-cream)]"
      >
        <Loader2 className="h-6 w-6 animate-spin text-[color:var(--torres-indigo)]" />
      </div>
    );
  }
  if (!me) return <AdminLogin />;
  return <AdminDashboard />;
}

export default function AdminApp() {
  return (
    <AdminProvider>
      <Toaster position="top-center" richColors />
      <Switch />
    </AdminProvider>
  );
}
