// ═══════════════════════════════════════════════════════════════
// /api/admin/notifications — Real-time admin notifications + email history
// Fase 12.Notifications: Aggregates from Medusa + Supabase + Resend
//
// GET — Returns notifications (recent orders, low stock, pending reviews)
//       + email history from Resend API
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

interface AdminNotification {
  id: string;
  time: string;
  category: string;
  title: string;
  detail: string;
  action: string;
  read: boolean;
  priority?: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all"; // notifications, emails, templates, all

    // ── Email Templates CRUD ──
    if (type === "templates") {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.from("email_templates").select("*").order("category", { ascending: true });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ templates: data || [], total: (data || []).length });
    }

    const notifications: AdminNotification[] = [];
    let emailHistory: any[] = [];

    // ── 1. Recent orders (last 24h) ────────────────────────
    if (type === "all" || type === "notifications") {
      try {
        const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        const ordersRes = await medusaAdminFetch(
          `/admin/orders?limit=10&offset=0&created_at[gte]=${since}&order=-created_at`
        );
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          for (const o of data.orders || []) {
            const total = o.total ? (o.total / 100).toLocaleString() : "0";
            const items = (o.items || []).map((i: any) => i.title).join(", ") || "Productos";
            const timeStr = new Date(o.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
            const dateStr = new Date(o.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });

            notifications.push({
              id: `order-${o.id}`,
              time: `${dateStr} ${timeStr}`,
              category: "order",
              title: `Pedido #${o.display_id} — ${o.email || "Cliente"} — $${total} MXN`,
              detail: items.slice(0, 80),
              action: "Ver pedido",
              read: o.fulfillment_status === "fulfilled",
              priority: false,
            });
          }
        }
      } catch (err) {
        console.warn("[Notifications] Orders fetch error:", err);
      }

      // ── 2. Low stock products ──────────────────────────────
      try {
        const productsRes = await medusaAdminFetch("/admin/products?limit=100&offset=0");
        if (productsRes.ok) {
          const data = await productsRes.json();
          for (const p of data.products || []) {
            for (const v of p.variants || []) {
              if (v.manage_inventory && (v.inventory_quantity ?? 999) <= 5) {
                notifications.push({
                  id: `stock-${v.id}`,
                  time: "Inventario",
                  category: "stock",
                  title: `Stock bajo — ${p.title}${v.title !== "Default" ? ` (${v.title})` : ""}: ${v.inventory_quantity ?? 0} unidades`,
                  detail: v.sku ? `SKU: ${v.sku}` : "",
                  action: "Ver inventario",
                  read: false,
                  priority: (v.inventory_quantity ?? 0) <= 2,
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn("[Notifications] Products fetch error:", err);
      }

      // ── 3. Pending reviews ─────────────────────────────────
      try {
        const supabase = getSupabaseAdmin();
        const { count } = await supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending");

        if (count && count > 0) {
          notifications.push({
            id: "reviews-pending",
            time: "Reviews",
            category: "review",
            title: `${count} review${count > 1 ? "s" : ""} pendiente${count > 1 ? "s" : ""} de moderación`,
            detail: "Requieren aprobación o rechazo",
            action: "Moderar reviews",
            read: false,
            priority: true,
          });
        }

        // Negative reviews (1-2 stars) in last 7 days
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const { data: negativeReviews } = await supabase
          .from("reviews")
          .select("id, rating, user_name, product_title")
          .lte("rating", 2)
          .gte("created_at", weekAgo)
          .eq("status", "approved")
          .limit(5);

        for (const r of negativeReviews || []) {
          notifications.push({
            id: `review-neg-${r.id}`,
            time: "Reviews",
            category: "review",
            title: `Review negativa (${r.rating}★) — ${r.user_name || "Cliente"} en ${r.product_title || "Producto"}`,
            detail: "Requiere atención",
            action: "Ver review",
            read: false,
            priority: true,
          });
        }
      } catch (err) {
        console.warn("[Notifications] Reviews fetch error:", err);
      }

      // ── 4. New customers (last 48h) ────────────────────────
      try {
        const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        const customersRes = await medusaAdminFetch(
          `/admin/customers?limit=5&offset=0&created_at[gte]=${since}&order=-created_at`
        );
        if (customersRes.ok) {
          const data = await customersRes.json();
          const newCount = data.count || (data.customers || []).length;
          if (newCount > 0) {
            notifications.push({
              id: "customers-new",
              time: "Clientes",
              category: "customer",
              title: `${newCount} cliente${newCount > 1 ? "s" : ""} nuevo${newCount > 1 ? "s" : ""} en las últimas 48h`,
              detail: (data.customers || []).slice(0, 3).map((c: any) => c.email).join(", "),
              action: "Ver clientes",
              read: true,
            });
          }
        }
      } catch (err) {
        console.warn("[Notifications] Customers fetch error:", err);
      }
    }

    // ── 5. Email history from Resend ─────────────────────────
    if (type === "all" || type === "emails") {
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (RESEND_API_KEY) {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
          });
          if (res.ok) {
            const data = await res.json();
            emailHistory = (data.data || []).slice(0, 50).map((e: any) => ({
              id: e.id,
              date: new Date(e.created_at).toLocaleString("es-MX", {
                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
              }),
              type: e.subject?.includes("pedido") ? "Pedido" : e.subject?.includes("review") ? "Review" : "Email",
              recipient: Array.isArray(e.to) ? e.to[0] : e.to || "—",
              subject: e.subject || "Sin asunto",
              status: e.last_event || "sent",
            }));
          }
        } catch (err) {
          console.warn("[Notifications] Resend fetch error:", err);
        }
      }
    }

    // Sort notifications: priority first, then by time
    notifications.sort((a, b) => {
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      if (!a.read && b.read) return -1;
      if (a.read && !b.read) return 1;
      return 0;
    });

    return NextResponse.json({
      notifications,
      emailHistory,
      stats: {
        total: notifications.length,
        unread: notifications.filter((n) => !n.read).length,
        priority: notifications.filter((n) => n.priority).length,
        emailsSent: emailHistory.length,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Notifications GET]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { id, is_active, subject_override } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (typeof is_active === "boolean") updates.is_active = is_active;
    if (subject_override !== undefined) updates.subject_override = subject_override;

    const { data, error } = await supabase.from("email_templates").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, template: data });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}
