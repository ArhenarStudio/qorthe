// /api/admin/finances — Revenue, payments, financial stats from Medusa orders
import { NextRequest, NextResponse } from "next/server";
import { medusaAdminFetch } from "../_helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30d";

    const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "365d": 365, all: 9999 };
    const days = daysMap[period] || 30;
    const since = new Date(Date.now() - days * 86400000).toISOString();

    const res = await medusaAdminFetch(`/admin/orders?limit=500&offset=0&created_at[gte]=${since}&order=-created_at&fields=id,display_id,total,item_total,shipping_total,discount_total,payment_status,status,currency_code,created_at`);
    if (!res.ok) return NextResponse.json({ error: "Failed" }, { status: 500 });

    const data = await res.json();
    const orders = data.orders || [];

    const completed = orders.filter((o: any) => o.payment_status === "captured" && o.status !== "canceled");
    const canceled = orders.filter((o: any) => o.status === "canceled");
    const pending = orders.filter((o: any) => o.payment_status !== "captured" && o.status !== "canceled");

    const totalRevenue = completed.reduce((s: number, o: any) => s + (o.total || 0), 0) / 100;
    const totalItems = completed.reduce((s: number, o: any) => s + (o.item_total || 0), 0) / 100;
    const totalShipping = completed.reduce((s: number, o: any) => s + (o.shipping_total || 0), 0) / 100;
    const totalDiscounts = completed.reduce((s: number, o: any) => s + (o.discount_total || 0), 0) / 100;
    const avgTicket = completed.length > 0 ? totalRevenue / completed.length : 0;

    // Monthly breakdown
    const monthly: Record<string, { revenue: number; orders: number }> = {};
    completed.forEach((o: any) => {
      const month = new Date(o.created_at).toLocaleDateString("es-MX", { month: "short", year: "2-digit" });
      if (!monthly[month]) monthly[month] = { revenue: 0, orders: 0 };
      monthly[month].revenue += (o.total || 0) / 100;
      monthly[month].orders += 1;
    });

    const monthlyData = Object.entries(monthly).map(([month, data]) => ({ month, ...data })).reverse();

    // Payment methods (from last 50 with details)
    let paymentBreakdown: Record<string, number> = {};
    try {
      const detailRes = await medusaAdminFetch(`/admin/orders?limit=50&offset=0&created_at[gte]=${since}&fields=+payment_collections.payment_sessions.provider_id,total,payment_status`);
      if (detailRes.ok) {
        const dd = await detailRes.json();
        (dd.orders || []).forEach((o: any) => {
          if (o.payment_status !== "captured") return;
          const provider = o.payment_collections?.[0]?.payment_sessions?.[0]?.provider_id || "unknown";
          const label = provider.includes("stripe") ? "Stripe" : provider.includes("mercadopago") ? "MercadoPago" : provider.includes("paypal") ? "PayPal" : provider;
          paymentBreakdown[label] = (paymentBreakdown[label] || 0) + (o.total || 0) / 100;
        });
      }
    } catch {}

    return NextResponse.json({
      stats: {
        totalRevenue, totalItems, totalShipping, totalDiscounts, avgTicket,
        completedOrders: completed.length, canceledOrders: canceled.length, pendingOrders: pending.length,
        totalOrders: orders.length,
      },
      monthlyData,
      paymentBreakdown: Object.entries(paymentBreakdown).map(([method, amount]) => ({ method, amount })),
      period,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
