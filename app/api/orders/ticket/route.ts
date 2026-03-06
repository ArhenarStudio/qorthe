// ═══════════════════════════════════════════════════════════════
// GET /api/orders/ticket?id=14 — Order ticket data
// Fetches order from Medusa by display_id for ticket rendering
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { medusaAdminFetch } from "../../admin/_helpers";

function jsonOk(data: Record<string, unknown>) { return NextResponse.json(data); }
function jsonErr(msg: string, status = 500) { return NextResponse.json({ error: msg }, { status }); }

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const displayId = searchParams.get("id");
    if (!displayId) return jsonErr("id requerido", 400);

    // Fetch orders and find by display_id
    const resp = await medusaAdminFetch(`/admin/orders?limit=50&order=-created_at`);
    if (!resp.ok) return jsonErr("Error obteniendo órdenes de Medusa", resp.status);

    const data = await resp.json();
    const orders = (data.orders || []) as Record<string, unknown>[];
    const order = orders.find(o => String(o.display_id) === displayId);

    if (!order) return jsonErr("Orden no encontrada", 404);

    // Extract items
    const items = ((order.items || []) as Record<string, unknown>[]).map(item => ({
      title: item.title || item.product_title || "Producto",
      variant_title: item.variant_title || "",
      quantity: item.quantity || 1,
      unit_price: ((item.unit_price as number) || 0) / 100,
      total: (((item.unit_price as number) || 0) * ((item.quantity as number) || 1)) / 100,
      thumbnail: item.thumbnail || null,
      metadata: item.metadata || {},
    }));

    // Extract shipping address
    const shipping = order.shipping_address as Record<string, unknown> | null;
    const address = shipping ? {
      name: `${shipping.first_name || ""} ${shipping.last_name || ""}`.trim(),
      address: `${shipping.address_1 || ""}${shipping.address_2 ? ", " + shipping.address_2 : ""}`,
      city: shipping.city || "",
      state: shipping.province || "",
      postal_code: shipping.postal_code || "",
      country: shipping.country_code || "MX",
      phone: shipping.phone || "",
    } : null;

    // Payment info
    const payments = (order.payments || []) as Record<string, unknown>[];
    const payment = payments[0] || {};
    const provider = (payment.provider_id as string) || "unknown";

    const ticket = {
      order_id: order.id,
      display_id: order.display_id,
      number: `DSD-${order.display_id}`,
      created_at: order.created_at,
      status: order.status || "pending",
      email: order.email || "",
      currency: "MXN",
      items,
      subtotal: ((order.item_total as number) || 0) / 100,
      shipping_total: ((order.shipping_total as number) || 0) / 100,
      discount_total: ((order.discount_total as number) || 0) / 100,
      total: ((order.total as number) || 0) / 100,
      shipping_address: address,
      payment_provider: provider.includes("stripe") ? "Tarjeta (Stripe)" :
        provider.includes("mercadopago") ? "MercadoPago" :
        provider.includes("paypal") ? "PayPal" : provider,
      fulfillment_status: order.fulfillment_status || "not_fulfilled",
    };

    return jsonOk({ ticket });
  } catch (err: unknown) {
    return jsonErr(err instanceof Error ? err.message : "Error desconocido");
  }
}
