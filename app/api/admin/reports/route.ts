// /api/admin/reports — Aggregated analytics from Medusa + Supabase
import { NextRequest, NextResponse } from "next/server";
import { medusaAdminFetch } from "../_helpers";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();

    // Orders summary
    const ordersRes = await medusaAdminFetch("/admin/orders?limit=500&order=-created_at&fields=id,total,payment_status,status,fulfillment_status,created_at,items.quantity");
    const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [] };
    const orders = ordersData.orders || [];

    // Products
    const productsRes = await medusaAdminFetch("/admin/products?limit=200&fields=id,title,status,variants.inventory_quantity,variants.manage_inventory");
    const productsData = productsRes.ok ? await productsRes.json() : { products: [] };
    const products = productsData.products || [];

    // Customers count
    const customersRes = await medusaAdminFetch("/admin/customers?limit=1&offset=0");
    const customersData = customersRes.ok ? await customersRes.json() : { count: 0 };

    // Reviews
    const { count: reviewCount } = await supabase.from("reviews").select("id", { count: "exact", head: true });
    const { count: pendingReviews } = await supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending");

    // Loyalty
    const { data: loyaltyStats } = await supabase.from("loyalty_profiles").select("current_tier");
    const tierCounts: Record<string, number> = {};
    (loyaltyStats || []).forEach((p: any) => { tierCounts[p.current_tier || "pino"] = (tierCounts[p.current_tier || "pino"] || 0) + 1; });

    // Calculate product stats
    const activeProducts = products.filter((p: any) => p.status === "published").length;
    const draftProducts = products.filter((p: any) => p.status === "draft").length;
    const lowStockProducts = products.filter((p: any) => (p.variants || []).some((v: any) => v.manage_inventory && (v.inventory_quantity ?? 999) <= 5)).length;

    // Order stats
    const completedOrders = orders.filter((o: any) => o.payment_status === "captured").length;
    const revenue = orders.filter((o: any) => o.payment_status === "captured").reduce((s: number, o: any) => s + (o.total || 0), 0) / 100;
    const avgTicket = completedOrders > 0 ? revenue / completedOrders : 0;

    // Daily orders (last 30 days)
    const dailyOrders: Record<string, number> = {};
    const last30 = orders.filter((o: any) => new Date(o.created_at) > new Date(Date.now() - 30 * 86400000));
    last30.forEach((o: any) => {
      const day = new Date(o.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
      dailyOrders[day] = (dailyOrders[day] || 0) + 1;
    });

    return NextResponse.json({
      overview: {
        totalOrders: orders.length, completedOrders, revenue, avgTicket,
        totalCustomers: customersData.count || 0,
        totalProducts: products.length, activeProducts, draftProducts, lowStockProducts,
        totalReviews: reviewCount || 0, pendingReviews: pendingReviews || 0,
        tierCounts,
      },
      dailyOrders: Object.entries(dailyOrders).map(([day, count]) => ({ day, count })).reverse(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
