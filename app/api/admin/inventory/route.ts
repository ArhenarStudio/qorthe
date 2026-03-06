// ═══════════════════════════════════════════════════════════════
// /api/admin/inventory — Inventory Management API (Expanded)
//
// GET  — items | movements | alerts | config | transfers | counts | cost_history
// POST — Record movement | create_transfer | create_count | reserve_stock
// PATCH — config | enrichment | resolve_alert | update_transfer | update_count | complete_count | inline_reorder
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { medusaAdminFetch } from "../_helpers";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function jsonOk(data: Record<string, unknown>) { return NextResponse.json(data); }
function jsonErr(msg: string, status = 500) { return NextResponse.json({ error: msg }, { status }); }

// ── GET ──────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "items";
    const supabase = getSupabase();

    // ── Config ──
    if (action === "config") {
      const { data } = await supabase.from("inventory_config").select("*").eq("id", 1).single();
      return jsonOk({ config: data?.config || null });
    }

    // ── Movements ──
    if (action === "movements") {
      const limit = parseInt(searchParams.get("limit") || "100");
      const sku = searchParams.get("sku");
      let query = supabase.from("inventory_movements").select("*").order("created_at", { ascending: false }).limit(limit);
      if (sku) query = query.eq("sku", sku);
      const { data } = await query;
      return jsonOk({ movements: data || [] });
    }

    // ── Alerts ──
    if (action === "alerts") {
      const resolved = searchParams.get("resolved") === "true";
      let query = supabase.from("inventory_alerts").select("*").order("created_at", { ascending: false }).limit(100);
      if (!resolved) query = query.eq("is_resolved", false);
      const { data } = await query;
      return jsonOk({ alerts: data || [] });
    }

    // ── Transfers ──
    if (action === "transfers") {
      const { data } = await supabase
        .from("inventory_transfers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return jsonOk({ transfers: data || [] });
    }

    // ── Cyclic Counts ──
    if (action === "counts") {
      const { data } = await supabase
        .from("inventory_counts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return jsonOk({ counts: data || [] });
    }

    // ── Cost History ──
    if (action === "cost_history") {
      const sku = searchParams.get("sku");
      let query = supabase.from("inventory_cost_history").select("*").order("created_at", { ascending: false }).limit(100);
      if (sku) query = query.eq("sku", sku);
      const { data } = await query;
      return jsonOk({ history: data || [] });
    }

    // ── Default: items ──
    const resp = await medusaAdminFetch(`/admin/products?limit=100&offset=0&order=-created_at`);
    if (!resp.ok) return jsonErr("Failed to fetch from Medusa");

    const medusaData = await resp.json();
    const products = medusaData.products || [];

    // Enrichment + reservations
    const { data: enrichments } = await supabase.from("inventory_enrichment").select("*");
    const enrichMap = new Map((enrichments || []).map((e: Record<string, unknown>) => [e.variant_id as string, e]));

    const { data: reservations } = await supabase
      .from("inventory_reservations")
      .select("variant_id, quantity")
      .eq("status", "active");
    const reserveMap = new Map<string, number>();
    (reservations || []).forEach((r: Record<string, unknown>) => {
      const vid = r.variant_id as string;
      reserveMap.set(vid, (reserveMap.get(vid) || 0) + (r.quantity as number));
    });

    // Sales data from movements (90d) for ABC/rotation
    const cutoff90d = new Date(Date.now() - 90 * 86400000).toISOString();
    const { data: salesData } = await supabase
      .from("inventory_movements")
      .select("inventory_item_id, quantity")
      .eq("type", "sale")
      .gte("created_at", cutoff90d);
    const salesMap = new Map<string, number>();
    (salesData || []).forEach((s: Record<string, unknown>) => {
      const vid = s.inventory_item_id as string;
      salesMap.set(vid, (salesMap.get(vid) || 0) + Math.abs(s.quantity as number));
    });

    const items = products.flatMap((p: Record<string, unknown>) =>
      ((p.variants as Record<string, unknown>[]) || []).map((v: Record<string, unknown>) => {
        const enrichment = enrichMap.get(v.id as string) || {} as Record<string, unknown>;
        const prices = v.prices as Record<string, unknown>[] | undefined;
        const price = prices?.[0]?.amount ? (prices[0].amount as number) / 100 : 0;
        const cost = (enrichment.unit_cost as number) ?? price * 0.4;
        const stock = (v.inventory_quantity as number) ?? 0;
        const reorderPoint = (enrichment.reorder_point as number) ?? 5;
        const maxStock = (enrichment.max_stock as number) ?? reorderPoint * 3;
        const reserved = reserveMap.get(v.id as string) || 0;
        const sold90d = salesMap.get(v.id as string) || 0;
        const avgDaily = sold90d / 90;
        const doi = avgDaily > 0 ? Math.round(stock / avgDaily) : 999;

        let status: string;
        if (stock === 0) status = "out_of_stock";
        else if (stock <= reorderPoint) status = "low_stock";
        else if (stock > maxStock) status = "overstock";
        else status = "in_stock";

        // ABC classification based on revenue
        const revenue = sold90d * price;

        const categories = p.categories as Record<string, unknown>[] | undefined;
        return {
          id: v.id,
          product_id: p.id,
          variant_id: v.id,
          title: p.title,
          variant_title: (v.title as string) || "Default",
          sku: (v.sku as string) || `SKU-${(v.id as string).slice(-6)}`,
          thumbnail: p.thumbnail,
          category: categories?.[0]?.name || null,
          current_stock: stock,
          reserved_stock: reserved,
          available_stock: Math.max(0, stock - reserved),
          reorder_point: reorderPoint,
          reorder_qty: (enrichment.reorder_qty as number) ?? 10,
          max_stock: maxStock,
          unit_cost: cost,
          unit_price: price,
          location: (enrichment.location as string) || "Taller Hermosillo",
          status,
          manage_inventory: (v.manage_inventory as boolean) ?? true,
          last_movement_at: (enrichment.last_movement_at as string) || null,
          created_at: p.created_at,
          total_sold_90d: sold90d,
          avg_daily_sales: avgDaily,
          days_of_inventory: doi,
          revenue_90d: revenue,
        };
      })
    );

    // Stats
    const totalUnits = items.reduce((s: number, i: Record<string, unknown>) => s + (i.current_stock as number), 0);
    const costValue = items.reduce((s: number, i: Record<string, unknown>) => s + (i.unit_cost as number) * (i.current_stock as number), 0);
    const retailValue = items.reduce((s: number, i: Record<string, unknown>) => s + (i.unit_price as number) * (i.current_stock as number), 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: movementsToday } = await supabase
      .from("inventory_movements")
      .select("id", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    const { count: unresolvedAlerts } = await supabase
      .from("inventory_alerts")
      .select("id", { count: "exact", head: true })
      .eq("is_resolved", false);

    const { count: pendingTransfers } = await supabase
      .from("inventory_transfers")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "in_transit"]);

    const { count: pendingCounts } = await supabase
      .from("inventory_counts")
      .select("id", { count: "exact", head: true })
      .in("status", ["scheduled", "in_progress"]);

    return jsonOk({
      items,
      stats: {
        total_items: items.length,
        total_units: totalUnits,
        total_cost_value: costValue,
        total_retail_value: retailValue,
        low_stock_count: items.filter((i: Record<string, unknown>) => i.status === "low_stock").length,
        out_of_stock_count: items.filter((i: Record<string, unknown>) => i.status === "out_of_stock").length,
        overstock_count: items.filter((i: Record<string, unknown>) => i.status === "overstock").length,
        unresolved_alerts: unresolvedAlerts || 0,
        movements_today: movementsToday || 0,
        avg_turnover_days: 0,
        margin_percent: retailValue > 0 ? ((retailValue - costValue) / retailValue * 100) : 0,
        pending_transfers: pendingTransfers || 0,
        pending_counts: pendingCounts || 0,
      },
    });
  } catch (err: unknown) {
    return jsonErr(err instanceof Error ? err.message : "Error desconocido");
  }
}

// ── POST ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabase();

    // ── Create transfer ──
    if (body.action === "create_transfer") {
      const { from_location, to_location, items, notes } = body;
      if (!from_location || !to_location || !items?.length) return jsonErr("Datos incompletos", 400);

      // Generate transfer number
      const { data: seqData } = await supabase.rpc("generate_transfer_number");
      const transferNumber = seqData || `TRF-${new Date().getFullYear()}-${Date.now() % 1000}`;

      const { error } = await supabase.from("inventory_transfers").insert({
        transfer_number: transferNumber,
        from_location,
        to_location,
        items,
        notes: notes || "",
        status: "pending",
        created_by: "admin",
      });

      if (error) return jsonErr(error.message);
      return jsonOk({ success: true, transfer_number: transferNumber });
    }

    // ── Create cyclic count ──
    if (body.action === "create_count") {
      const { location, scheduled_date, items, notes } = body;
      if (!location || !scheduled_date) return jsonErr("Datos incompletos", 400);

      const { data: seqData } = await supabase.rpc("generate_count_number");
      const countNumber = seqData || `CNT-${new Date().getFullYear()}-${Date.now() % 1000}`;

      const { error } = await supabase.from("inventory_counts").insert({
        count_number: countNumber,
        location,
        scheduled_date,
        items: items || [],
        total_items: (items || []).length,
        notes: notes || "",
        status: "scheduled",
        created_by: "admin",
      });

      if (error) return jsonErr(error.message);
      return jsonOk({ success: true, count_number: countNumber });
    }

    // ── Reserve stock (for quotes) ──
    if (body.action === "reserve_stock") {
      const { variant_id, quantity, quote_id, product_title, sku, expires_hours } = body;
      if (!variant_id || !quantity) return jsonErr("variant_id y quantity requeridos", 400);

      const expiresAt = new Date(Date.now() + (expires_hours || 72) * 3600000).toISOString();

      await supabase.from("inventory_reservations").insert({
        variant_id,
        product_title: product_title || "",
        sku: sku || "",
        quantity,
        quote_id: quote_id || null,
        source: "quote",
        status: "active",
        expires_at: expiresAt,
        created_by: "admin",
      });

      return jsonOk({ success: true });
    }

    // ── Default: record stock movement ──
    const { variant_id, type, quantity, unit_cost, reference, notes, created_by = "admin" } = body;
    if (!variant_id || !type || quantity === undefined) return jsonErr("variant_id, type y quantity son requeridos", 400);

    // 1. Get current stock from Medusa
    const resp = await medusaAdminFetch(`/admin/products?limit=100`);
    const medusaData = resp.ok ? await resp.json() : { products: [] };
    let currentStock = 0;
    let productTitle = "";
    let sku = "";

    for (const p of medusaData.products || []) {
      const v = ((p.variants || []) as Record<string, unknown>[]).find((v: Record<string, unknown>) => v.id === variant_id);
      if (v) {
        currentStock = (v.inventory_quantity as number) ?? 0;
        productTitle = p.title as string;
        sku = (v.sku as string) || "";
        break;
      }
    }

    // 2. Calculate new stock
    const delta = ["purchase", "return", "production"].includes(type) ? Math.abs(quantity) : -Math.abs(quantity);
    const adjustedDelta = type === "adjustment" || type === "count_adjustment" ? quantity : delta;
    const newStock = Math.max(0, currentStock + adjustedDelta);

    // 3. Update Medusa inventory
    const updateResp = await medusaAdminFetch(`/admin/products/variants/${variant_id}`, {
      method: "POST",
      body: JSON.stringify({ inventory_quantity: newStock }),
    });

    if (!updateResp.ok) {
      await medusaAdminFetch(`/admin/inventory-items`, {
        method: "POST",
        body: JSON.stringify({ variant_id, quantity: newStock }),
      });
    }

    // 4. Record movement
    const movement = {
      inventory_item_id: variant_id,
      product_title: productTitle,
      sku,
      type,
      quantity: adjustedDelta,
      previous_stock: currentStock,
      new_stock: newStock,
      unit_cost: unit_cost || null,
      reference: reference || "",
      notes: notes || "",
      created_by,
      created_at: new Date().toISOString(),
    };
    await supabase.from("inventory_movements").insert(movement);

    // 5. Track cost change
    if (unit_cost !== undefined && unit_cost !== null) {
      const { data: prevEnrichment } = await supabase
        .from("inventory_enrichment")
        .select("unit_cost")
        .eq("variant_id", variant_id)
        .single();

      const prevCost = prevEnrichment?.unit_cost ?? 0;
      if (prevCost !== unit_cost && prevCost > 0) {
        await supabase.from("inventory_cost_history").insert({
          variant_id,
          sku,
          product_title: productTitle,
          previous_cost: prevCost,
          new_cost: unit_cost,
          change_percent: prevCost > 0 ? ((unit_cost - prevCost) / prevCost * 100) : 0,
          reason: `Movimiento tipo ${type}`,
          movement_id: movement.reference || null,
        });
      }
    }

    // 6. Update enrichment
    await supabase.from("inventory_enrichment").upsert({
      variant_id,
      last_movement_at: new Date().toISOString(),
      ...(unit_cost !== undefined && { unit_cost }),
    }, { onConflict: "variant_id" });

    // 7. Check alerts
    const { data: enrichment } = await supabase
      .from("inventory_enrichment")
      .select("reorder_point")
      .eq("variant_id", variant_id)
      .single();
    const reorderPoint = enrichment?.reorder_point ?? 5;

    if (newStock === 0) {
      await supabase.from("inventory_alerts").insert({
        inventory_item_id: variant_id, product_title: productTitle, sku,
        type: "out_of_stock", severity: "critical",
        message: `${productTitle} (${sku}) está agotado`,
        is_resolved: false,
      });
    } else if (newStock <= reorderPoint && currentStock > reorderPoint) {
      await supabase.from("inventory_alerts").insert({
        inventory_item_id: variant_id, product_title: productTitle, sku,
        type: "low_stock", severity: "warning",
        message: `${productTitle} (${sku}) tiene stock bajo: ${newStock} unidades (punto de reorden: ${reorderPoint})`,
        is_resolved: false,
      });
    }

    return jsonOk({ success: true, movement, previous_stock: currentStock, new_stock: newStock });
  } catch (err: unknown) {
    return jsonErr(err instanceof Error ? err.message : "Error desconocido");
  }
}

// ── PATCH ────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabase();

    if (body.action === "config") {
      await supabase.from("inventory_config").upsert({ id: 1, config: body.config, updated_at: new Date().toISOString() });
      return jsonOk({ success: true });
    }

    if (body.action === "enrichment") {
      const { variant_id, ...updates } = body;
      if (!variant_id) return jsonErr("variant_id required", 400);
      await supabase.from("inventory_enrichment").upsert({ variant_id, ...updates, updated_at: new Date().toISOString() }, { onConflict: "variant_id" });
      return jsonOk({ success: true });
    }

    if (body.action === "inline_reorder") {
      const { variant_id, reorder_point } = body;
      if (!variant_id || reorder_point === undefined) return jsonErr("variant_id y reorder_point requeridos", 400);
      await supabase.from("inventory_enrichment").upsert({ variant_id, reorder_point, updated_at: new Date().toISOString() }, { onConflict: "variant_id" });
      return jsonOk({ success: true });
    }

    if (body.action === "resolve_alert") {
      await supabase.from("inventory_alerts").update({ is_resolved: true, resolved_at: new Date().toISOString() }).eq("id", body.alert_id);
      return jsonOk({ success: true });
    }

    if (body.action === "update_transfer") {
      const { transfer_id, status } = body;
      const updates: Record<string, unknown> = { status };
      if (status === "in_transit") updates.shipped_at = new Date().toISOString();
      if (status === "completed") updates.completed_at = new Date().toISOString();

      await supabase.from("inventory_transfers").update(updates).eq("id", transfer_id);

      // If completed, record movements
      if (status === "completed") {
        const { data: transfer } = await supabase.from("inventory_transfers").select("*").eq("id", transfer_id).single();
        if (transfer?.items) {
          for (const item of transfer.items as Record<string, unknown>[]) {
            await supabase.from("inventory_movements").insert({
              inventory_item_id: item.variant_id,
              product_title: item.product_title,
              sku: item.sku,
              type: "transfer",
              quantity: item.quantity,
              previous_stock: 0,
              new_stock: 0,
              reference: transfer.transfer_number,
              notes: `Transferencia de ${transfer.from_location} a ${transfer.to_location}`,
              created_by: "admin",
              created_at: new Date().toISOString(),
            });
          }
        }
      }
      return jsonOk({ success: true });
    }

    if (body.action === "update_count") {
      const { count_id, status } = body;
      const updates: Record<string, unknown> = { status };
      if (status === "in_progress") updates.started_at = new Date().toISOString();
      await supabase.from("inventory_counts").update(updates).eq("id", count_id);
      return jsonOk({ success: true });
    }

    if (body.action === "complete_count") {
      const { count_id, items, auto_adjust } = body;
      let adjustments = 0;

      if (auto_adjust && items) {
        for (const item of items as Record<string, unknown>[]) {
          const counted = item.counted_stock as number | null;
          const system = item.system_stock as number;
          if (counted !== null && counted !== system) {
            const diff = counted - system;
            // Record adjustment movement
            await supabase.from("inventory_movements").insert({
              inventory_item_id: item.variant_id,
              product_title: item.product_title,
              sku: item.sku,
              type: "count_adjustment",
              quantity: diff,
              previous_stock: system,
              new_stock: counted,
              reference: `CNT-${count_id}`,
              notes: `Ajuste por conteo cíclico (sistema: ${system}, contado: ${counted})`,
              created_by: "admin",
              created_at: new Date().toISOString(),
            });
            adjustments++;
          }
        }
      }

      const discrepancies = (items || []).filter((i: Record<string, unknown>) => i.discrepancy !== null && i.discrepancy !== 0).length;
      const countedItems = (items || []).filter((i: Record<string, unknown>) => i.counted_stock !== null).length;

      await supabase.from("inventory_counts").update({
        status: "completed",
        completed_at: new Date().toISOString(),
        items,
        counted_items: countedItems,
        discrepancies,
      }).eq("id", count_id);

      return jsonOk({ success: true, adjustments });
    }

    return jsonErr("Unknown action", 400);
  } catch (err: unknown) {
    return jsonErr(err instanceof Error ? err.message : "Error desconocido");
  }
}
