// ═══════════════════════════════════════════════════════════════
// GET /api/admin/dashboard — Aggregated dashboard stats
//
// Fetches orders, products, and customers from Medusa admin API
// and returns consolidated KPIs for the admin dashboard.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { medusaAdminFetch } from "../_helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "7days";

    // Calculate date range
    const now = new Date();
    const daysMap: Record<string, number> = {
      today: 1,
      "7days": 7,
      "30days": 30,
      "90days": 90,
      year: 365,
    };
    const days = daysMap[period] || 7;
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const fromISO = from.toISOString();

    // Fetch all data in parallel
    const [ordersRes, productsRes, customersRes] = await Promise.allSettled([
      medusaAdminFetch(
        `/admin/orders?limit=100&offset=0&created_at[gte]=${fromISO}&order=-created_at`
      ),
      medusaAdminFetch(`/admin/products?limit=100&offset=0`),
      medusaAdminFetch(`/admin/customers?limit=100&offset=0`),
    ]);

    // Parse orders
    let orders: any[] = [];
    let orderCount = 0;
    if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
      const data = await ordersRes.value.json();
      orders = data.orders || [];
      orderCount = data.count ?? orders.length;
    }

    // Parse products
    let products: any[] = [];
    let productCount = 0;
    if (productsRes.status === "fulfilled" && productsRes.value.ok) {
      const data = await productsRes.value.json();
      products = data.products || [];
      productCount = data.count ?? products.length;
    }

    // Parse customers
    let customers: any[] = [];
    let customerCount = 0;
    if (customersRes.status === "fulfilled" && customersRes.value.ok) {
      const data = await customersRes.value.json();
      customers = data.customers || [];
      customerCount = data.count ?? customers.length;
    }

    // Calculate KPIs from orders
    const totalRevenue = orders.reduce((sum: number, o: any) => {
      const total = o.total || o.summary?.raw_current_order_total?.value || 0;
      return sum + (typeof total === "number" ? total / 100 : 0);
    }, 0);

    const pendingOrders = orders.filter(
      (o: any) =>
        o.fulfillment_status === "not_fulfilled" ||
        o.fulfillment_status === "partially_fulfilled"
    ).length;

    const shippedOrders = orders.filter(
      (o: any) => o.fulfillment_status === "fulfilled"
    ).length;

    // Recent orders (last 10)
    const recentOrders = orders.slice(0, 10).map((o: any) => ({
      id: o.id,
      display_id: o.display_id,
      email: o.email,
      total: o.total ? o.total / 100 : 0,
      currency: o.currency_code || "mxn",
      status: o.status,
      fulfillment_status: o.fulfillment_status,
      payment_status: o.payment_status,
      created_at: o.created_at,
      items_count: o.items?.length || 0,
    }));

    // Low stock products (variants with inventory_quantity <= 5)
    const lowStockProducts = products
      .flatMap((p: any) =>
        (p.variants || [])
          .filter((v: any) => v.manage_inventory && (v.inventory_quantity ?? 0) <= 5)
          .map((v: any) => ({
            product_id: p.id,
            product_title: p.title,
            variant_title: v.title,
            sku: v.sku,
            inventory_quantity: v.inventory_quantity ?? 0,
          }))
      )
      .slice(0, 10);

    return NextResponse.json({
      period,
      kpis: {
        total_revenue: Math.round(totalRevenue * 100) / 100,
        order_count: orderCount,
        pending_orders: pendingOrders,
        shipped_orders: shippedOrders,
        canceled_count: orders.filter((o: any) => o.status === "canceled").length,
        product_count: productCount,
        customer_count: customerCount,
        avg_order_value:
          orderCount > 0
            ? Math.round((totalRevenue / orderCount) * 100) / 100
            : 0,
      },
      recent_orders: recentOrders,
      low_stock: lowStockProducts,
    });
  } catch (error: any) {
    console.error("[Admin Dashboard]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
