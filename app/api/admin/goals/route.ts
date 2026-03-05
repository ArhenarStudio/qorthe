// /api/admin/goals — Goals/OKRs with real progress from Medusa
import { NextRequest, NextResponse } from "next/server";
import { medusaAdminFetch } from "../_helpers";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET() {
  try {
    // Get real metrics from Medusa
    const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const ordersRes = await medusaAdminFetch(`/admin/orders?limit=500&created_at[gte]=${thisMonth}&fields=id,total,payment_status,status`);
    const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [], count: 0 };

    const completed = (ordersData.orders || []).filter((o: any) => o.payment_status === "captured" && o.status !== "canceled");
    const monthlyRevenue = completed.reduce((s: number, o: any) => s + (o.total || 0), 0) / 100;
    const monthlyOrders = completed.length;

    const customersRes = await medusaAdminFetch("/admin/customers?limit=1");
    const totalCustomers = customersRes.ok ? (await customersRes.json()).count || 0 : 0;

    const supabase = getSupabase();
    const { count: reviewCount } = await supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "approved");

    // Goals with real actuals
    const goals = [
      { id: "rev-month", name: "Ingresos del mes", target: 50000, actual: monthlyRevenue, unit: "MXN", category: "Ventas" },
      { id: "orders-month", name: "Pedidos del mes", target: 20, actual: monthlyOrders, unit: "pedidos", category: "Ventas" },
      { id: "avg-ticket", name: "Ticket promedio", target: 2500, actual: monthlyOrders > 0 ? monthlyRevenue / monthlyOrders : 0, unit: "MXN", category: "Ventas" },
      { id: "customers", name: "Clientes registrados", target: 100, actual: totalCustomers, unit: "clientes", category: "Crecimiento" },
      { id: "reviews", name: "Reviews aprobadas", target: 50, actual: reviewCount || 0, unit: "reviews", category: "Reputación" },
    ];

    // Load custom goals from Supabase if table exists
    try {
      const { data: customGoals } = await supabase.from("goals").select("*").order("created_at", { ascending: false });
      if (customGoals) goals.push(...customGoals.map((g: any) => ({ ...g, category: g.category || "Custom" })));
    } catch {}

    return NextResponse.json({
      goals: goals.map(g => ({ ...g, progress: g.target > 0 ? Math.min(100, Math.round((g.actual / g.target) * 100)) : 0 })),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
