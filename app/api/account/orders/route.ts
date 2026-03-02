// ═══════════════════════════════════════════════════════════════
// GET /api/account/orders — Customer's orders from Medusa
//
// Uses customer email to fetch their orders via Medusa admin API.
// Requires Supabase access_token in Authorization header for auth.
// Returns orders with items, totals, fulfillment info.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { medusaAdminFetch } from "../../admin/_helpers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Supabase token → get user email
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const supaResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
    });

    if (!supaResp.ok) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const supaUser = await supaResp.json();
    const email = supaUser.email;
    if (!email) {
      return NextResponse.json({ error: "No email in session" }, { status: 400 });
    }

    // 2. Fetch orders from Medusa admin by email
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "20";
    const offset = searchParams.get("offset") || "0";

    const resp = await medusaAdminFetch(
      `/admin/orders?q=${encodeURIComponent(email)}&limit=${limit}&offset=${offset}&order=-created_at`
    );

    if (!resp.ok) {
      const err = await resp.text();
      console.error("[Account Orders] Medusa error:", resp.status, err);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    const data = await resp.json();

    // 3. Transform for frontend
    const orders = (data.orders || [])
      .filter((o: any) => o.email === email) // extra safety: only this user's orders
      .map((o: any) => {
        const created = new Date(o.created_at);

        // Map fulfillment status
        const statusMap: Record<string, string> = {
          not_fulfilled: "Processing",
          partially_fulfilled: "Processing",
          fulfilled: "Shipped",
          shipped: "Shipped",
          delivered: "Delivered",
          canceled: "Cancelled",
        };
        const displayStatus =
          o.status === "canceled"
            ? "Cancelled"
            : statusMap[o.fulfillment_status] || "Processing";

        // Build timeline
        const timeline = [
          {
            step: "Confirmado",
            date: created.toLocaleDateString("es-MX", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
            completed: true,
          },
          {
            step: "Producción",
            date:
              o.fulfillment_status !== "not_fulfilled"
                ? "Completado"
                : "En proceso",
            completed: o.fulfillment_status !== "not_fulfilled",
            current: o.fulfillment_status === "not_fulfilled",
          },
          {
            step: "Enviado",
            date:
              o.fulfillment_status === "fulfilled" ||
              o.fulfillment_status === "shipped"
                ? "Enviado"
                : "-",
            completed:
              o.fulfillment_status === "fulfilled" ||
              o.fulfillment_status === "shipped",
          },
          {
            step: "Entregado",
            date: o.fulfillment_status === "delivered" ? "Entregado" : "-",
            completed: o.fulfillment_status === "delivered",
          },
        ];

        // Extract tracking from fulfillments
        const fulfillments = o.fulfillments || [];
        const tracking = fulfillments.length
          ? fulfillments[0]?.data?.tracking_number ||
            fulfillments[0]?.tracking_numbers?.[0] ||
            null
          : null;

        // Items
        const items = (o.items || []).map((i: any) => ({
          name: i.title || "Producto",
          quantity: i.quantity || 1,
          price: `$${((i.unit_price || 0) / 100).toLocaleString("es-MX")}`,
          image: i.thumbnail || null,
          customization: i.metadata?.custom_design
            ? {
                engraving: "Grabado láser",
                dimensions: i.metadata.custom_design.dimensions || "",
                designPreview: i.metadata.custom_design.file_url || null,
              }
            : null,
        }));

        return {
          id: `DSD-${o.display_id}`,
          date: created.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          status: displayStatus,
          total: `$${((o.total || 0) / 100).toLocaleString("es-MX")}`,
          tracking,
          invoiceUrl: null,
          timeline,
          items,
          // Raw data for detail views
          _raw: {
            medusa_id: o.id,
            display_id: o.display_id,
            currency: o.currency_code || "mxn",
            subtotal: (o.item_total || 0) / 100,
            shipping: (o.shipping_total || 0) / 100,
            discount: (o.discount_total || 0) / 100,
            tax: (o.tax_total || 0) / 100,
            total: (o.total || 0) / 100,
            payment_status: o.payment_status,
            fulfillment_status: o.fulfillment_status,
            created_at: o.created_at,
          },
        };
      });

    return NextResponse.json({
      orders,
      count: orders.length,
    });
  } catch (error: any) {
    console.error("[Account Orders]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
