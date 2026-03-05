// /api/admin/returns — Returns and refunds from Medusa
import { NextRequest, NextResponse } from "next/server";
import { medusaAdminFetch } from "../_helpers";

export async function GET(req: NextRequest) {
  try {
    // Fetch canceled/refunded orders as "returns"
    const canceledRes = await medusaAdminFetch("/admin/orders?limit=50&status=canceled&order=-created_at&fields=id,display_id,email,total,status,canceled_at,created_at,items.title,items.quantity,shipping_address.first_name,shipping_address.last_name,metadata");
    const canceledData = canceledRes.ok ? await canceledRes.json() : { orders: [] };

    const returns = (canceledData.orders || []).map((o: any) => ({
      id: o.id,
      orderId: `#${o.display_id}`,
      customer: o.shipping_address ? `${o.shipping_address.first_name || ''} ${o.shipping_address.last_name || ''}`.trim() : o.email?.split("@")[0] || "Cliente",
      email: o.email,
      total: (o.total || 0) / 100,
      items: (o.items || []).map((i: any) => ({ title: i.title, quantity: i.quantity })),
      reason: (o.metadata as any)?.cancel_reason || "No especificada",
      status: "canceled",
      createdAt: o.created_at,
      canceledAt: o.canceled_at,
    }));

    return NextResponse.json({
      returns,
      stats: {
        total: returns.length,
        totalRefunded: returns.reduce((s: number, r: any) => s + r.total, 0),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
