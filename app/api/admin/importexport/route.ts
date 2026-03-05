// /api/admin/importexport — Export data as CSV from Medusa + Supabase
import { NextRequest, NextResponse } from "next/server";
import { medusaAdminFetch } from "../_helpers";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: NextRequest) {
  try {
    const type = new URL(req.url).searchParams.get("type") || "overview";

    if (type === "products") {
      const res = await medusaAdminFetch("/admin/products?limit=500&fields=id,title,handle,status,created_at,variants.sku,variants.inventory_quantity,variants.prices.amount,variants.prices.currency_code");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      const rows = (data.products || []).map((p: any) => {
        const v = p.variants?.[0] || {};
        const price = v.prices?.[0];
        return { title: p.title, handle: p.handle, status: p.status, sku: v.sku || "", price: price ? price.amount / 100 : 0, currency: price?.currency_code || "mxn", inventory: v.inventory_quantity ?? "N/A", created: p.created_at };
      });
      return NextResponse.json({ export: "products", count: rows.length, data: rows });
    }

    if (type === "orders") {
      const res = await medusaAdminFetch("/admin/orders?limit=500&order=-created_at&fields=id,display_id,email,total,payment_status,fulfillment_status,status,created_at,items.title,items.quantity,shipping_address.first_name,shipping_address.last_name,shipping_address.city");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      const rows = (data.orders || []).map((o: any) => ({
        order_id: o.display_id, email: o.email, customer: o.shipping_address ? `${o.shipping_address.first_name || ""} ${o.shipping_address.last_name || ""}`.trim() : "", city: o.shipping_address?.city || "",
        total: (o.total || 0) / 100, payment: o.payment_status, fulfillment: o.fulfillment_status, status: o.status,
        items: (o.items || []).map((i: any) => `${i.title} x${i.quantity}`).join("; "), created: o.created_at,
      }));
      return NextResponse.json({ export: "orders", count: rows.length, data: rows });
    }

    if (type === "customers") {
      const res = await medusaAdminFetch("/admin/customers?limit=500&fields=id,email,first_name,last_name,created_at");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      const supabase = getSupabase();
      const { data: profiles } = await supabase.from("loyalty_profiles").select("email, current_tier, points_balance, lifetime_spend");
      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.email] = p; });

      const rows = (data.customers || []).map((c: any) => {
        const lp = profileMap[c.email] || {};
        return { email: c.email, name: `${c.first_name || ""} ${c.last_name || ""}`.trim(), tier: lp.current_tier || "pino", points: lp.points_balance || 0, lifetime_spend: lp.lifetime_spend ? lp.lifetime_spend / 100 : 0, created: c.created_at };
      });
      return NextResponse.json({ export: "customers", count: rows.length, data: rows });
    }

    if (type === "reviews") {
      const supabase = getSupabase();
      const { data: reviews } = await supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(500);
      const rows = (reviews || []).map((r: any) => ({
        product: r.product_title, rating: r.rating, title: r.title, body: r.body, author: r.user_name, status: r.status, created: r.created_at,
      }));
      return NextResponse.json({ export: "reviews", count: rows.length, data: rows });
    }

    // Overview
    return NextResponse.json({
      available: [
        { type: "products", label: "Productos", description: "Todos los productos con SKU, precio, inventario" },
        { type: "orders", label: "Pedidos", description: "Historial completo de pedidos con items y status" },
        { type: "customers", label: "Clientes", description: "Clientes con tier, puntos y gasto total" },
        { type: "reviews", label: "Reviews", description: "Todas las reviews con rating y status" },
      ],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
