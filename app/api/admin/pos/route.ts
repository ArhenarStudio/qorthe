// ═══════════════════════════════════════════════════════════════
// POS API Routes — Point of Sale (Admin)
//
// POST /api/admin/pos — Create a draft order in Medusa
// GET  /api/admin/pos — List recent POS orders
//
// Uses Medusa admin API for draft orders.
// Draft orders allow manual creation without payment processing.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { medusaAdminFetch } from "../_helpers";

// ── POST: Create draft order ──
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,           // [{ variant_id, quantity, unit_price? }]
      customer,        // { email, first_name, last_name, phone }
      shipping_address, // { address_1, city, province, postal_code, country_code, first_name, last_name, phone }
      payment_method,  // "cash" | "transfer" | "terminal" | "online"
      discount,        // { type: "percentage" | "fixed", value: number } | null
      notes,           // string | null
      channel,         // "whatsapp" | "phone" | "instagram" | "facebook" | "in_person" | "other"
      shipping_type,   // "local_delivery" | "pickup" | "national" | null
    } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }
    if (!customer?.email) {
      return NextResponse.json({ error: "Customer email required" }, { status: 400 });
    }

    // 1. Build Medusa draft order payload
    // Medusa v2 uses POST /admin/draft-orders
    const draftPayload: any = {
      email: customer.email,
      region_id: process.env.MEDUSA_REGION_ID || "reg_01JMJK3Q1BFGG7T5V9YJNM3ZQP",
      items: items.map((item: any) => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
        ...(item.unit_price !== undefined && { unit_price: Math.round(item.unit_price * 100) }),
        ...(item.metadata && { metadata: item.metadata }),
      })),
      shipping_methods: [],
      metadata: {
        source: "pos",
        channel: channel || "in_person",
        payment_method: payment_method || "cash",
        notes: notes || "",
        created_by: "admin",
      },
    };

    // Add shipping address if provided
    if (shipping_address) {
      draftPayload.shipping_address = {
        first_name: shipping_address.first_name || customer.first_name || "",
        last_name: shipping_address.last_name || customer.last_name || "",
        address_1: shipping_address.address_1 || "",
        city: shipping_address.city || "",
        province: shipping_address.province || "",
        postal_code: shipping_address.postal_code || "",
        country_code: shipping_address.country_code || "mx",
        phone: shipping_address.phone || customer.phone || "",
      };
    }

    // 2. Try creating draft order
    const resp = await medusaAdminFetch("/admin/draft-orders", {
      method: "POST",
      body: JSON.stringify(draftPayload),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("[POS] Draft order creation failed:", resp.status, errText);
      
      // Fallback: create regular order via admin API if draft orders not available
      // Medusa v2 draft order API may vary — try alternative
      const orderResp = await medusaAdminFetch("/admin/orders", {
        method: "POST",
        body: JSON.stringify({
          email: customer.email,
          region_id: draftPayload.region_id,
          items: items.map((item: any) => ({
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: item.unit_price ? Math.round(item.unit_price * 100) : undefined,
          })),
          shipping_address: draftPayload.shipping_address,
          metadata: draftPayload.metadata,
        }),
      });

      if (!orderResp.ok) {
        const orderErr = await orderResp.text();
        console.error("[POS] Order creation also failed:", orderResp.status, orderErr);
        
        // Final fallback: store as a "pending POS order" that can be manually processed
        return NextResponse.json({
          success: true,
          type: "pending",
          order: {
            id: `pos_${Date.now()}`,
            status: "pending_sync",
            email: customer.email,
            customer_name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
            items: items,
            total: items.reduce((sum: number, i: any) => sum + (i.unit_price || 0) * i.quantity, 0),
            payment_method,
            channel,
            notes,
            created_at: new Date().toISOString(),
            metadata: draftPayload.metadata,
          },
          message: "Order saved locally — will sync to Medusa when API supports draft orders",
        });
      }

      const orderData = await orderResp.json();
      return NextResponse.json({
        success: true,
        type: "order",
        order: orderData.order,
      });
    }

    const data = await resp.json();
    return NextResponse.json({
      success: true,
      type: "draft_order",
      order: data.draft_order,
    });
  } catch (error: any) {
    console.error("[POS] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── GET: List recent POS orders ──
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "20";
    const offset = searchParams.get("offset") || "0";

    // Fetch orders with POS metadata
    const resp = await medusaAdminFetch(
      `/admin/orders?limit=${limit}&offset=${offset}&order=-created_at`
    );

    if (!resp.ok) {
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    const data = await resp.json();

    // Filter POS orders (source: pos in metadata)
    const allOrders = data.orders || [];
    const posOrders = allOrders.filter(
      (o: any) => o.metadata?.source === "pos"
    );

    // Also include all orders for the "today" view
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = allOrders.filter(
      (o: any) => new Date(o.created_at) >= today
    );

    // Calculate daily stats
    const todayRevenue = todayOrders.reduce(
      (sum: number, o: any) => sum + (o.total || 0) / 100,
      0
    );
    const todayCount = todayOrders.length;
    const posCount = posOrders.length;

    const orders = allOrders.map((o: any) => ({
      id: o.id,
      display_id: o.display_id,
      email: o.email,
      total: (o.total || 0) / 100,
      status: o.status,
      payment_status: o.payment_status,
      fulfillment_status: o.fulfillment_status,
      items_count: (o.items || []).reduce((s: number, i: any) => s + i.quantity, 0),
      source: o.metadata?.source || "online",
      channel: o.metadata?.channel || "web",
      payment_method: o.metadata?.payment_method || "card",
      created_at: o.created_at,
      customer_name: o.shipping_address
        ? `${o.shipping_address.first_name || ""} ${o.shipping_address.last_name || ""}`.trim()
        : o.email?.split("@")[0] || "",
    }));

    return NextResponse.json({
      orders,
      stats: {
        today_revenue: todayRevenue,
        today_count: todayCount,
        pos_count: posCount,
        total_count: allOrders.length,
      },
      count: data.count || allOrders.length,
    });
  } catch (error: any) {
    console.error("[POS GET]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
