// ═══════════════════════════════════════════════════════════════
// /api/admin/marketing — Promotions/Coupons from Medusa
// Fase 12.Marketing: Read promotions, create, update, delete
//
// GET    — List promotions with search, filters
// POST   — Create a new promotion
// PATCH  — Update promotion (pause, activate, edit)
// DELETE — Delete promotion
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { medusaAdminFetch } from "../_helpers";

// Map Medusa promotion to our Coupon format
function mapPromotion(p: any): any {
  const rule = p.rules?.[0] || {};
  const isPercentage = p.type === "standard" && rule.attribute === "percentage";
  const isFixed = p.type === "standard" && !isPercentage;
  const isFreeShipping = p.type === "free_shipping" || rule.attribute === "shipping";
  const isBuyGet = p.type === "buyget";

  let type: string = "percentage";
  let value = 0;

  if (isFreeShipping) {
    type = "free_shipping";
    value = 100;
  } else if (isBuyGet) {
    type = "buyget";
    value = 0;
  } else if (isFixed) {
    type = "fixed";
    value = Number(rule.value || p.application_method?.value || 0) / 100; // centavos → pesos
  } else {
    type = "percentage";
    value = Number(rule.value || p.application_method?.value || 0);
  }

  // Determine status
  let status: string = "active";
  if (p.status === "draft") status = "disabled";
  else if (p.status === "inactive") status = "paused";
  else if (p.ends_at && new Date(p.ends_at) < new Date()) status = "expired";
  else if (p.starts_at && new Date(p.starts_at) > new Date()) status = "scheduled";
  else if (p.is_automatic) status = "auto";
  else status = "active";

  return {
    id: p.id,
    code: p.code || p.title?.toUpperCase().replace(/\s+/g, "") || "—",
    internalName: p.title || p.code || "Sin nombre",
    type,
    value,
    target: p.application_method?.target_type || "order",
    targetLabel: p.application_method?.target_type === "order" ? "Toda la orden" : "Productos específicos",
    usesCount: p.usage_count || 0,
    usesLimit: p.usage_limit || null,
    usesPerCustomer: p.customer_usage_limit || null,
    minPurchase: p.application_method?.min_quantity ? Number(p.application_method.min_quantity) : null,
    maxDiscount: p.application_method?.max_quantity ? Number(p.application_method.max_quantity) / 100 : null,
    isAutomatic: p.is_automatic || false,
    customerRestriction: "Todos",
    startDate: p.starts_at || null,
    endDate: p.ends_at || null,
    status,
    combinable: p.is_combinable || false,
    // Stats (Medusa doesn't track these natively, default to 0)
    revenue: 0,
    roi: 0,
    avgTicket: 0,
    // Raw for detail
    _raw: p,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const res = await medusaAdminFetch(
      `/admin/promotions?limit=${limit}&offset=${offset}&order=-created_at`
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("[Marketing GET] Medusa error:", err);
      return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 });
    }

    const data = await res.json();
    let promotions = (data.promotions || []).map(mapPromotion);

    // Apply filters
    if (search) {
      const q = search.toLowerCase();
      promotions = promotions.filter(
        (p: any) => p.code.toLowerCase().includes(q) || p.internalName.toLowerCase().includes(q)
      );
    }
    if (status && status !== "all") {
      promotions = promotions.filter((p: any) => p.status === status);
    }

    // Stats
    const activeCount = promotions.filter((p: any) => p.status === "active" || p.status === "auto").length;
    const scheduledCount = promotions.filter((p: any) => p.status === "scheduled").length;
    const expiredCount = promotions.filter((p: any) => p.status === "expired").length;

    return NextResponse.json({
      promotions,
      total: data.count || promotions.length,
      stats: {
        total: promotions.length,
        active: activeCount,
        scheduled: scheduledCount,
        expired: expiredCount,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Marketing GET]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, title, type, value, is_automatic, starts_at, ends_at, usage_limit } = body;

    if (!code && !title) {
      return NextResponse.json({ error: "code or title required" }, { status: 400 });
    }

    // Build Medusa promotion payload
    const promotionBody: any = {
      code: code?.toUpperCase(),
      type: type === "free_shipping" ? "free_shipping" : "standard",
      is_automatic: is_automatic || false,
      status: "active",
    };

    if (starts_at) promotionBody.starts_at = starts_at;
    if (ends_at) promotionBody.ends_at = ends_at;
    if (usage_limit) promotionBody.usage_limit = usage_limit;

    // Application method
    if (type === "percentage") {
      promotionBody.application_method = {
        type: "percentage",
        value: Number(value),
        target_type: "order",
      };
    } else if (type === "fixed") {
      promotionBody.application_method = {
        type: "fixed",
        value: Number(value) * 100, // pesos → centavos
        target_type: "order",
        currency_code: "mxn",
      };
    }

    const res = await medusaAdminFetch("/admin/promotions", {
      method: "POST",
      body: JSON.stringify(promotionBody),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[Marketing POST] Medusa error:", err);
      return NextResponse.json({ error: err.message || "Failed to create promotion" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, promotion: mapPromotion(data.promotion) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Marketing POST]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status: newStatus, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const patchBody: any = { ...updates };
    if (newStatus === "paused") patchBody.status = "inactive";
    else if (newStatus === "active") patchBody.status = "active";
    else if (newStatus === "disabled") patchBody.status = "draft";

    const res = await medusaAdminFetch(`/admin/promotions/${id}`, {
      method: "POST", // Medusa uses POST for updates
      body: JSON.stringify(patchBody),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message || "Failed to update" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, promotion: mapPromotion(data.promotion) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const res = await medusaAdminFetch(`/admin/promotions/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message || "Failed to delete" }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
