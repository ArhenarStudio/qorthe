// ═══════════════════════════════════════════════════════════════
// GET /api/admin/orders — Full orders list with filters
// POST /api/admin/orders — Update order (status changes, notes)
//
// Proxies to Medusa admin /admin/orders with pagination,
// filtering, and field selection.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { medusaAdminFetch } from "../_helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "20";
    const offset = searchParams.get("offset") || "0";
    const status = searchParams.get("status"); // e.g. "pending", "completed"
    const q = searchParams.get("q"); // search query

    // Build Medusa query string
    let query = `/admin/orders?limit=${limit}&offset=${offset}&order=-created_at`;
    query += `&fields=id,display_id,email,total,currency_code,status,fulfillment_status,payment_status,created_at,updated_at`;
    query += `&fields=+items.id,+items.title,+items.quantity,+items.unit_price,+items.thumbnail`;
    query += `&fields=+shipping_address.first_name,+shipping_address.last_name,+shipping_address.city,+shipping_address.province`;

    if (status && status !== "all") {
      if (status === "pending") {
        query += `&fulfillment_status=not_fulfilled`;
      } else if (status === "shipped") {
        query += `&fulfillment_status=fulfilled`;
      } else if (status === "cancelled") {
        query += `&status=canceled`;
      }
    }

    if (q) {
      query += `&q=${encodeURIComponent(q)}`;
    }

    const resp = await medusaAdminFetch(query);

    if (!resp.ok) {
      const err = await resp.text();
      return NextResponse.json(
        { error: `Medusa error: ${resp.status}`, details: err },
        { status: resp.status }
      );
    }

    const data = await resp.json();

    // Transform orders for frontend consumption
    const orders = (data.orders || []).map((o: any) => ({
      id: o.id,
      display_id: o.display_id,
      email: o.email,
      customer_name: o.shipping_address
        ? `${o.shipping_address.first_name || ""} ${o.shipping_address.last_name || ""}`.trim()
        : o.email?.split("@")[0] || "—",
      total: o.total ? o.total / 100 : 0,
      currency: o.currency_code || "mxn",
      status: o.status,
      fulfillment_status: o.fulfillment_status || "not_fulfilled",
      payment_status: o.payment_status || "not_paid",
      created_at: o.created_at,
      updated_at: o.updated_at,
      items: (o.items || []).map((i: any) => ({
        id: i.id,
        title: i.title,
        quantity: i.quantity,
        unit_price: i.unit_price ? i.unit_price / 100 : 0,
        thumbnail: i.thumbnail,
      })),
      items_count: o.items?.length || 0,
      city: o.shipping_address?.city || "",
      province: o.shipping_address?.province || "",
    }));

    return NextResponse.json({
      orders,
      count: data.count ?? orders.length,
      offset: parseInt(offset),
      limit: parseInt(limit),
    });
  } catch (error: any) {
    console.error("[Admin Orders]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
