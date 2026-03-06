// ═══════════════════════════════════════════════════════════════
// GET /api/admin/products — Products with enriched data
//
// Merges: Medusa products + Supabase (inventory enrichment,
// reviews stats, sales movements, reservations, quotes)
//
// Production-ready: typed responses, error handling, no console.log
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

function jsonOk(data: Record<string, unknown>) {
  return NextResponse.json(data);
}
function jsonErr(msg: string, status = 500) {
  return NextResponse.json({ error: msg }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "100";
    const offset = searchParams.get("offset") || "0";
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    // 1. Fetch products from Medusa
    let query = `/admin/products?limit=${limit}&offset=${offset}&order=-created_at`;
    if (status && status !== "all") query += `&status=${status}`;
    if (q) query += `&q=${encodeURIComponent(q)}`;

    const resp = await medusaAdminFetch(query);
    if (!resp.ok) return jsonErr(`Medusa error: ${resp.status}`, resp.status);

    const medusaData = await resp.json();
    const rawProducts = (medusaData.products || []) as Record<string, unknown>[];

    // 2. Fetch enrichment data from Supabase (parallel)
    const supabase = getSupabase();

    const cutoff30d = new Date(Date.now() - 30 * 86400000).toISOString();
    const cutoff90d = new Date(Date.now() - 90 * 86400000).toISOString();

    const [
      enrichResult,
      reserveResult,
      sales30dResult,
      sales90dResult,
      reviewsResult,
      quotesResult,
    ] = await Promise.all([
      supabase.from("inventory_enrichment").select("*"),
      supabase.from("inventory_reservations").select("variant_id, quantity").eq("status", "active"),
      supabase.from("inventory_movements").select("inventory_item_id, quantity").eq("type", "sale").gte("created_at", cutoff30d),
      supabase.from("inventory_movements").select("inventory_item_id, quantity").eq("type", "sale").gte("created_at", cutoff90d),
      supabase.from("reviews").select("product_id, rating").eq("status", "approved"),
      supabase.from("quotes").select("pieces"),
    ]);

    // Build lookup maps
    const enrichMap = new Map<string, Record<string, unknown>>();
    for (const e of enrichResult.data || []) enrichMap.set(e.variant_id, e);

    const reserveMap = new Map<string, number>();
    for (const r of reserveResult.data || []) {
      const vid = r.variant_id as string;
      reserveMap.set(vid, (reserveMap.get(vid) || 0) + (r.quantity as number));
    }

    const sales30dMap = new Map<string, number>();
    for (const s of sales30dResult.data || []) {
      const vid = s.inventory_item_id as string;
      sales30dMap.set(vid, (sales30dMap.get(vid) || 0) + Math.abs(s.quantity as number));
    }

    const sales90dMap = new Map<string, number>();
    for (const s of sales90dResult.data || []) {
      const vid = s.inventory_item_id as string;
      sales90dMap.set(vid, (sales90dMap.get(vid) || 0) + Math.abs(s.quantity as number));
    }

    // Reviews: group by product_id
    const reviewMap = new Map<string, { sum: number; count: number }>();
    for (const r of reviewsResult.data || []) {
      const pid = r.product_id as string;
      const prev = reviewMap.get(pid) || { sum: 0, count: 0 };
      reviewMap.set(pid, { sum: prev.sum + (r.rating as number), count: prev.count + 1 });
    }

    // Quotes: count product mentions in pieces JSONB
    const quoteCountMap = new Map<string, number>();
    for (const q of quotesResult.data || []) {
      const pieces = q.pieces as Array<Record<string, unknown>> | null;
      if (!pieces) continue;
      for (const piece of pieces) {
        const prodType = (piece.productType as string) || '';
        // Count by product type as proxy (quotes don't have product_id directly)
        quoteCountMap.set(prodType, (quoteCountMap.get(prodType) || 0) + 1);
      }
    }

    // 3. Transform products
    const products = rawProducts
      .filter(p => {
        const meta = p.metadata as Record<string, unknown> | null;
        return !(meta?.hide_from_catalog === true || meta?.hide_from_catalog === 'true');
      })
      .map(p => {
        const variants = (p.variants || []) as Record<string, unknown>[];
        const firstVariant = variants[0] || {};
        const categories = (p.categories || []) as Record<string, unknown>[];
        const meta = (p.metadata || {}) as Record<string, unknown>;

        // Stock aggregation across variants
        let totalStock = 0;
        let totalReserved = 0;
        let totalSold30d = 0;
        let totalSold90d = 0;
        let bestCost = 0;

        const mappedVariants = variants.map((v: Record<string, unknown>) => {
          const vid = v.id as string;
          const invQty = (v.inventory_quantity as number) ?? 0;
          const enrichment = enrichMap.get(vid) || {};
          const reserved = reserveMap.get(vid) || 0;
          const sold30d = sales30dMap.get(vid) || 0;
          const sold90d = sales90dMap.get(vid) || 0;
          const cost = (enrichment.unit_cost as number) || 0;

          totalStock += invQty;
          totalReserved += reserved;
          totalSold30d += sold30d;
          totalSold90d += sold90d;
          if (cost > bestCost) bestCost = cost;

          const prices = (v.prices || []) as Record<string, unknown>[];
          return {
            id: vid,
            title: (v.title as string) || 'Default',
            sku: (v.sku as string) || '',
            inventory_quantity: invQty,
            manage_inventory: (v.manage_inventory as boolean) ?? true,
            prices: prices.map(pr => ({
              amount: pr.amount ? (pr.amount as number) / 100 : 0,
              currency: (pr.currency_code as string) || 'mxn',
            })),
          };
        });

        // Price
        const allPrices = mappedVariants.flatMap(v => v.prices.map(pr => pr.amount));
        const price = allPrices.length > 0 ? Math.min(...allPrices) : 0;
        const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

        // Reviews
        const reviewData = reviewMap.get(p.id as string);
        const avgRating = reviewData ? Math.round((reviewData.sum / reviewData.count) * 10) / 10 : 0;
        const reviewCount = reviewData?.count || 0;

        // Enrichment defaults
        const firstEnrichment = enrichMap.get((firstVariant.id as string) || '') || {};
        const reorderPoint = (firstEnrichment.reorder_point as number) ?? 5;

        // Status
        let productStatus: string;
        if (totalStock === 0 && (p.status as string) !== 'draft') productStatus = 'outOfStock';
        else if ((p.status as string) === 'draft') productStatus = 'draft';
        else productStatus = 'active';

        // Stock level
        let stockLevel: string;
        if (totalStock === 0) stockLevel = 'out_of_stock';
        else if (totalStock <= reorderPoint) stockLevel = 'low_stock';
        else stockLevel = 'in_stock';

        return {
          id: p.id,
          title: p.title,
          handle: p.handle,
          sku: (firstVariant.sku as string) || '',
          status: productStatus,
          thumbnail: p.thumbnail,
          category: (categories[0]?.name as string) || 'General',
          price,
          compare_price: maxPrice > price ? maxPrice : null,
          unit_cost: bestCost,
          stock: totalStock,
          reserved_stock: totalReserved,
          available_stock: Math.max(0, totalStock - totalReserved),
          reorder_point: reorderPoint,
          stock_level: stockLevel,
          variants_count: variants.length,
          variants: mappedVariants,
          sold_units_30d: totalSold30d,
          sold_units_90d: totalSold90d,
          revenue_30d: totalSold30d * price,
          revenue_90d: totalSold90d * price,
          avg_rating: avgRating,
          review_count: reviewCount,
          quote_count: 0, // TODO: match by product type when we have product_id in quotes
          material: (meta.material as string) || '',
          weight: (meta.weight as number) || 0,
          dimensions: (meta.dimensions as string) || '',
          laser_available: !(meta.is_service === true),
          is_service: meta.is_service === true,
          production_days: (meta.production_days as number) || 5,
          created_at: p.created_at,
          updated_at: p.updated_at,
        };
      });

    // 4. Compute stats
    const activeProducts = products.filter(p => p.status === 'active');
    const totalCost = products.reduce((s, p) => s + (p.unit_cost as number) * (p.stock as number), 0);
    const totalRetail = products.reduce((s, p) => s + (p.price as number) * (p.stock as number), 0);
    const totalRev30d = products.reduce((s, p) => s + (p.revenue_30d as number), 0);
    const totalSold30d = products.reduce((s, p) => s + (p.sold_units_30d as number), 0);
    const ratingSum = products.reduce((s, p) => s + (p.avg_rating as number), 0);
    const ratingCount = products.filter(p => (p.avg_rating as number) > 0).length;

    const stats = {
      total_products: products.length,
      total_variants: products.reduce((s, p) => s + (p.variants_count as number), 0),
      active_count: activeProducts.length,
      draft_count: products.filter(p => p.status === 'draft').length,
      low_stock_count: products.filter(p => p.stock_level === 'low_stock').length,
      out_of_stock_count: products.filter(p => p.stock_level === 'out_of_stock').length,
      inventory_cost: totalCost,
      inventory_retail: totalRetail,
      margin_percent: totalRetail > 0 ? ((totalRetail - totalCost) / totalRetail * 100) : 0,
      total_revenue_30d: totalRev30d,
      total_sold_30d: totalSold30d,
      avg_rating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
    };

    return jsonOk({
      products,
      stats,
      count: medusaData.count ?? products.length,
      offset: parseInt(offset),
      limit: parseInt(limit),
    });
  } catch (err: unknown) {
    return jsonErr(err instanceof Error ? err.message : "Error desconocido");
  }
}

// ── PATCH: Update product status, archive, etc ──
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, product_id } = body;

    if (!product_id) return jsonErr("product_id requerido", 400);

    if (action === "update_status") {
      const { status } = body;
      if (!status) return jsonErr("status requerido", 400);
      const resp = await medusaAdminFetch(`/admin/products/${product_id}`, {
        method: "POST",
        body: JSON.stringify({ status: status === 'active' ? 'published' : 'draft' }),
      });
      if (!resp.ok) return jsonErr("Error actualizando producto en Medusa", resp.status);
      return jsonOk({ success: true });
    }

    if (action === "duplicate") {
      // Fetch original
      const resp = await medusaAdminFetch(`/admin/products/${product_id}`);
      if (!resp.ok) return jsonErr("Producto no encontrado", 404);
      const { product } = await resp.json();

      // Create copy
      const createResp = await medusaAdminFetch("/admin/products", {
        method: "POST",
        body: JSON.stringify({
          title: `${product.title} (copia)`,
          handle: `${product.handle}-copy-${Date.now()}`,
          status: "draft",
          description: product.description,
          thumbnail: product.thumbnail,
          metadata: product.metadata,
        }),
      });
      if (!createResp.ok) return jsonErr("Error duplicando producto", 500);
      const { product: newProduct } = await createResp.json();
      return jsonOk({ success: true, new_product_id: newProduct.id });
    }

    if (action === "bulk_status") {
      const { product_ids, status } = body;
      if (!Array.isArray(product_ids) || !status) return jsonErr("product_ids y status requeridos", 400);
      const medusaStatus = status === 'active' ? 'published' : 'draft';
      let updated = 0;
      for (const pid of product_ids) {
        const resp = await medusaAdminFetch(`/admin/products/${pid}`, {
          method: "POST",
          body: JSON.stringify({ status: medusaStatus }),
        });
        if (resp.ok) updated++;
      }
      return jsonOk({ success: true, updated });
    }

    return jsonErr("Acción no reconocida", 400);
  } catch (err: unknown) {
    return jsonErr(err instanceof Error ? err.message : "Error desconocido");
  }
}

// ── DELETE: Remove product ──
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return jsonErr("id requerido", 400);

    const resp = await medusaAdminFetch(`/admin/products/${id}`, { method: "DELETE" });
    if (!resp.ok) return jsonErr("Error eliminando producto", resp.status);
    return jsonOk({ success: true });
  } catch (err: unknown) {
    return jsonErr(err instanceof Error ? err.message : "Error desconocido");
  }
}
