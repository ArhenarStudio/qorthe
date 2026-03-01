"use client";

import { DashboardHome } from "@/components/admin/DashboardHome";
import { useAdmin } from "@/contexts/AdminContext";

export default function AdminDashboardPage() {
  const { period, navigate } = useAdmin();
  return <DashboardHome period={period} onNavigate={navigate} />;
}
