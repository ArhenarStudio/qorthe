// ═══════════════════════════════════════════════════════════════
// GET /api/admin/customers — Merged customer data
// Fase 12.Customers: Medusa customers + Supabase loyalty + auth
//
// Merges:
//   1. Medusa admin /admin/customers → orders, addresses, email
//   2. Supabase loyalty_profiles → tier, points, lifetime_spend
//   3. Supabase auth.users → phone, metadata, created_at
//   4. Supabase loyalty_transactions → points history
//
// GET  — List customers with search, filters, pagination, export
// PATCH — Adjust points or tier for a customer
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { medusaAdminFetch } from "../_helpers";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabaseAdmin;
}

// ── GET: List merged customers ─────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const tier = searchParams.get("tier");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sort") || "created_at";
    const sortDir = searchParams.get("dir") || "desc";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const exportCsv = searchParams.get("export") === "csv";
    const customerId = searchParams.get("id");

    // ── Single customer detail mode ────────────────────────
    if (customerId) {
      return await getCustomerDetail(customerId);
    }

    // ── Fetch from Medusa + Supabase in parallel ───────────
    const [medusaRes, loyaltyRes, authRes] = await Promise.allSettled([
      medusaAdminFetch(`/admin/customers?limit=500&offset=0&order=-created_at`),
      getSupabaseAdmin().from("loyalty_profiles").select("*"),
      getSupabaseAdmin().auth.admin.listUsers({ perPage: 1000 }),
    ]);

    // Parse Medusa customers
    let medusaCustomers: any[] = [];
    if (medusaRes.status === "fulfilled" && medusaRes.value.ok) {
      const data = await medusaRes.value.json();
      medusaCustomers = data.customers || [];
    }

    // Parse loyalty profiles (keyed by user_id)
    const loyaltyMap = new Map<string, any>();
    if (loyaltyRes.status === "fulfilled" && !loyaltyRes.value.error) {
      for (const lp of loyaltyRes.value.data || []) {
        loyaltyMap.set(lp.user_id, lp);
      }
    }

    // Parse auth users (keyed by email for matching with Medusa)
    const authByEmail = new Map<string, any>();
    if (authRes.status === "fulfilled") {
      for (const u of authRes.value.data?.users || []) {
        if (u.email) authByEmail.set(u.email.toLowerCase(), u);
      }
    }

    // ── Merge data ─────────────────────────────────────────
    let customers = medusaCustomers.map((mc: any) => {
      const email = (mc.email || "").toLowerCase();
      const authUser = authByEmail.get(email);
      const supabaseUserId = authUser?.id || mc.metadata?.supabase_user_id;
      const loyalty = supabaseUserId ? loyaltyMap.get(supabaseUserId) : null;

      const orderCount = mc.orders?.length || 0;
      const totalSpent = (mc.orders || []).reduce((s: number, o: any) => {
        const t = o.total || o.summary?.raw_current_order_total?.value || 0;
        return s + (typeof t === "number" ? t : 0);
      }, 0);
      const sortedOrders = [...(mc.orders || [])].sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const lastOrderDate = sortedOrders[0]?.created_at || null;
      const daysSinceOrder = lastOrderDate
        ? Math.floor((Date.now() - new Date(lastOrderDate).getTime()) / 86400000)
        : Infinity;

      return {
        id: mc.id,
        supabase_user_id: supabaseUserId || null,
        name: [mc.first_name, mc.last_name].filter(Boolean).join(" ") || authUser?.user_metadata?.full_name || email.split("@")[0],
        email: mc.email,
        phone: authUser?.phone || mc.phone || null,
        avatar_url: authUser?.user_metadata?.avatar_url || null,
        tier: loyalty?.tier || "pino",
        points: loyalty?.points || 0,
        lifetime_points: loyalty?.lifetime_points || 0,
        lifetime_spend: loyalty?.lifetime_spend || 0,
        points_multiplier: loyalty?.points_multiplier || 1,
        order_count: orderCount,
        total_spent: totalSpent,
        total_spent_display: Math.round(totalSpent / 100),
        avg_ticket: orderCount > 0 ? Math.round(totalSpent / orderCount / 100) : 0,
        last_order_at: lastOrderDate,
        days_since_order: daysSinceOrder,
        status: daysSinceOrder > 90 && orderCount > 0 ? "inactive" as const : orderCount === 0 ? "lead" as const : "active" as const,
        location: mc.addresses?.[0] ? `${mc.addresses[0].city || ""}, ${mc.addresses[0].province || ""}`.replace(/^, |, $/g, "") : null,
        registered_at: mc.created_at || authUser?.created_at,
        tags: [
          ...(loyalty?.tier && ["parota", "ebano"].includes(loyalty.tier) ? ["VIP"] : []),
          ...(daysSinceOrder > 90 && orderCount > 0 ? ["Inactivo +90d"] : []),
          ...(orderCount === 0 ? ["Lead"] : []),
        ],
        has_loyalty: !!loyalty,
      };
    });

    // ── Apply filters ──────────────────────────────────────
    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(
        (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
      );
    }
    if (tier && tier !== "all") {
      customers = customers.filter((c) => c.tier === tier);
    }
    if (status && status !== "all") {
      customers = customers.filter((c) => c.status === status);
    }

    // ── Sort ───────────────────────────────────────────────
    const sortFns: Record<string, (a: any, b: any) => number> = {
      created_at: (a, b) => new Date(b.registered_at || 0).getTime() - new Date(a.registered_at || 0).getTime(),
      name: (a, b) => a.name.localeCompare(b.name),
      total_spent: (a, b) => b.total_spent - a.total_spent,
      order_count: (a, b) => b.order_count - a.order_count,
      points: (a, b) => b.points - a.points,
      last_order: (a, b) => new Date(b.last_order_at || 0).getTime() - new Date(a.last_order_at || 0).getTime(),
    };
    customers.sort(sortFns[sortBy] || sortFns.created_at);
    if (sortDir === "asc") customers.reverse();

    // ── CSV Export ──────────────────────────────────────────
    if (exportCsv) {
      const csvRows = [
        ["Nombre", "Email", "Teléfono", "Tier", "Puntos", "Gasto Total (MXN)", "Pedidos", "Último Pedido", "Estado", "Ubicación", "Registro"].join(","),
        ...customers.map((c) =>
          [
            `"${c.name.replace(/"/g, '""')}"`,
            c.email,
            c.phone || "",
            c.tier,
            c.points,
            c.total_spent_display,
            c.order_count,
            c.last_order_at ? new Date(c.last_order_at).toISOString().split("T")[0] : "",
            c.status,
            `"${(c.location || "").replace(/"/g, '""')}"`,
            c.registered_at ? new Date(c.registered_at).toISOString().split("T")[0] : "",
          ].join(",")
        ),
      ].join("\n");

      return new NextResponse(csvRows, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="customers-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // ── Stats ──────────────────────────────────────────────
    const tierCounts: Record<string, number> = {};
    for (const c of customers) { tierCounts[c.tier] = (tierCounts[c.tier] || 0) + 1; }

    const withOrders = customers.filter((c) => c.order_count > 0);
    const avgLtv = withOrders.length > 0
      ? Math.round(withOrders.reduce((s, c) => s + c.total_spent_display, 0) / withOrders.length)
      : 0;
    const repurchaseRate = withOrders.length > 0
      ? Math.round((withOrders.filter((c) => c.order_count > 1).length / withOrders.length) * 100)
      : 0;

    const paged = customers.slice(offset, offset + limit);

    return NextResponse.json({
      customers: paged,
      total: customers.length,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(customers.length / limit),
      stats: {
        total: customers.length,
        active: customers.filter((c) => c.status === "active").length,
        inactive: customers.filter((c) => c.status === "inactive").length,
        leads: customers.filter((c) => c.status === "lead").length,
        tierCounts,
        avgLtv,
        repurchaseRate,
        vipCount: (tierCounts["parota"] || 0) + (tierCounts["ebano"] || 0),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Admin Customers GET]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── Single customer detail ─────────────────────────────────────

async function getCustomerDetail(customerId: string) {
  try {
    const medusaRes = await medusaAdminFetch(`/admin/customers/${customerId}?fields=*orders`);
    if (!medusaRes.ok) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    const { customer } = await medusaRes.json();

    const supabase = getSupabaseAdmin();
    const email = (customer.email || "").toLowerCase();
    const { data: authData } = await supabase.auth.admin.listUsers();
    const authUser = authData?.users?.find((u) => u.email?.toLowerCase() === email);

    let loyalty = null;
    let transactions: any[] = [];

    if (authUser) {
      const { data: lp } = await supabase
        .from("loyalty_profiles").select("*").eq("user_id", authUser.id).single();
      loyalty = lp;
      const { data: tx } = await supabase
        .from("loyalty_transactions").select("*").eq("user_id", authUser.id)
        .order("created_at", { ascending: false }).limit(50);
      transactions = tx || [];
    }

    const orders = (customer.orders || []).map((o: any) => ({
      id: o.id,
      display_id: o.display_id,
      total: o.total ? Math.round(o.total / 100) : 0,
      currency: o.currency_code || "mxn",
      status: o.status,
      fulfillment_status: o.fulfillment_status,
      payment_status: o.payment_status,
      created_at: o.created_at,
      items: (o.items || []).map((item: any) => ({
        title: item.title, quantity: item.quantity,
        unit_price: item.unit_price ? Math.round(item.unit_price / 100) : 0,
      })),
    }));

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: [customer.first_name, customer.last_name].filter(Boolean).join(" ") || email.split("@")[0],
        email, phone: authUser?.phone || customer.phone || null,
        avatar_url: authUser?.user_metadata?.avatar_url || null,
        tier: loyalty?.tier || "pino", points: loyalty?.points || 0,
        lifetime_points: loyalty?.lifetime_points || 0,
        lifetime_spend: loyalty?.lifetime_spend || 0,
        points_multiplier: loyalty?.points_multiplier || 1,
        registered_at: customer.created_at,
        addresses: customer.addresses || [],
      },
      orders,
      transactions,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Admin Customer Detail]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── PATCH: Adjust points or tier ───────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, action, points, reason, new_tier } = body;

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: authData } = await supabase.auth.admin.listUsers();
    const authUser = authData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!authUser) {
      return NextResponse.json({ error: "User not found in Supabase" }, { status: 404 });
    }

    await supabase.from("loyalty_profiles").upsert({ user_id: authUser.id }, { onConflict: "user_id" });

    if (action === "adjust_points" && typeof points === "number") {
      const { data: profile } = await supabase
        .from("loyalty_profiles").select("points, lifetime_points").eq("user_id", authUser.id).single();

      const currentPoints = profile?.points || 0;
      const newPoints = Math.max(0, currentPoints + points);

      const updates: Record<string, any> = { points: newPoints };
      if (points > 0) updates.lifetime_points = (profile?.lifetime_points || 0) + points;

      await supabase.from("loyalty_profiles").update(updates).eq("user_id", authUser.id);

      await supabase.from("loyalty_transactions").insert({
        user_id: authUser.id,
        type: points > 0 ? "earn" : "redeem",
        points: Math.abs(points),
        balance_after: newPoints,
        description: reason || `Admin: ${points > 0 ? "+" : ""}${points} puntos`,
      });

      return NextResponse.json({ success: true, action: "adjust_points", points_added: points, new_balance: newPoints });
    }

    if (action === "change_tier" && new_tier) {
      const { data: profile } = await supabase
        .from("loyalty_profiles").select("points").eq("user_id", authUser.id).single();

      await supabase.from("loyalty_profiles").update({ tier: new_tier }).eq("user_id", authUser.id);

      await supabase.from("loyalty_transactions").insert({
        user_id: authUser.id, type: "earn", points: 0,
        balance_after: profile?.points || 0,
        description: reason || `Admin cambio tier a ${new_tier}`,
      });

      return NextResponse.json({ success: true, action: "change_tier", new_tier });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Admin Customers PATCH]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
