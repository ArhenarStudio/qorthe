// ═══════════════════════════════════════════════════════════════
// GET /api/admin/products — Full products list with variants
//
// Proxies to Medusa admin /admin/products with pagination,
// search, and inventory info.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { medusaAdminFetch } from "../_helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "20";
    const offset = searchParams.get("offset") || "0";
    const status = searchParams.get("status"); // published, draft
    const q = searchParams.get("q");

    let query = `/admin/products?limit=${limit}&offset=${offset}&order=-created_at`;

    if (status && status !== "all") {
      query += `&status=${status}`;
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

    // Transform products for frontend
    const products = (data.products || []).map((p: any) => {
      const variants = p.variants || [];
      const totalStock = variants.reduce(
        (sum: number, v: any) => sum + (v.inventory_quantity ?? 0),
        0
      );
      const prices = variants.flatMap((v: any) =>
        (v.prices || []).map((pr: any) => ({
          amount: pr.amount ? pr.amount / 100 : 0,
          currency: pr.currency_code || "mxn",
        }))
      );
      const minPrice = prices.length
        ? Math.min(...prices.map((p: any) => p.amount))
        : 0;
      const maxPrice = prices.length
        ? Math.max(...prices.map((p: any) => p.amount))
        : 0;

      return {
        id: p.id,
        title: p.title,
        handle: p.handle,
        status: p.status,
        thumbnail: p.thumbnail,
        created_at: p.created_at,
        updated_at: p.updated_at,
        collection: p.collection
          ? { id: p.collection.id, title: p.collection.title }
          : null,
        categories: (p.categories || []).map((c: any) => ({
          id: c.id,
          name: c.name,
        })),
        variants_count: variants.length,
        total_stock: totalStock,
        low_stock: totalStock <= 5 && totalStock > 0,
        out_of_stock: totalStock === 0,
        price_range: {
          min: minPrice,
          max: maxPrice,
          currency: "mxn",
        },
        variants: variants.map((v: any) => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
          inventory_quantity: v.inventory_quantity ?? 0,
          manage_inventory: v.manage_inventory ?? false,
          prices: (v.prices || []).map((pr: any) => ({
            amount: pr.amount ? pr.amount / 100 : 0,
            currency: pr.currency_code || "mxn",
          })),
        })),
      };
    });

    return NextResponse.json({
      products,
      count: data.count ?? products.length,
      offset: parseInt(offset),
      limit: parseInt(limit),
    });
  } catch (error: any) {
    console.error("[Admin Products]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
