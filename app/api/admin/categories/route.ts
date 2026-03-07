// ═══════════════════════════════════════════════════════════════
// /api/admin/categories — Product Categories from Medusa
// Fase 12.Categories: CRUD categories + collections
//
// GET    — List all product categories (tree structure)
// POST   — Create category
// PATCH  — Update category
// DELETE — Delete category
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { medusaAdminFetch } from "../_helpers";

function mapCategory(c: any, allCategories: any[]): any {
  const childCount = allCategories.filter((ch: any) => ch.parent_category_id === c.id).length;
  const productCount = c.products?.length || c.product_count || 0;

  return {
    id: c.id,
    name: c.name,
    slug: c.handle || c.name.toLowerCase().replace(/\s+/g, "-"),
    parentId: c.parent_category_id || null,
    products: productCount,
    salesMonth: 0, // Medusa doesn't track this natively
    status: c.is_active === false ? "hidden" : "active",
    hasImage: !!(c.metadata?.image),
    hasSeo: !!(c.metadata?.meta_title),
    icon: c.metadata?.icon || "📁",
    order: c.rank || 0,
    description: c.description || "",
    metaTitle: c.metadata?.meta_title || "",
    metaDescription: c.metadata?.meta_description || "",
    layout: c.metadata?.layout || "grid",
    productsPerPage: 12,
    sortDefault: "manual",
    filters: { wood: true, price: true, finish: false, size: false },
    banner: null,
    showInMenu: c.is_internal !== true,
    showInFooter: false,
    showInSidebar: true,
    showInHomepage: c.metadata?.show_in_homepage === true,
    childCount,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    _raw: c,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const includeProducts = searchParams.get("products") === "true";

    // Always include products for sales mapping
    const res = await medusaAdminFetch(
      `/admin/product-categories?limit=200&offset=0&include_descendants_tree=true&fields=*products`
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("[Categories GET] Medusa error:", err);
      return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }

    const data = await res.json();
    const allRaw = data.product_categories || [];
    let categories = allRaw.map((c: any) => mapCategory(c, allRaw));

    // Apply search
    if (search) {
      const q = search.toLowerCase();
      categories = categories.filter(
        (c: any) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
      );
    }

    // Stats
    const rootCount = categories.filter((c: any) => !c.parentId).length;
    const totalProducts = categories.reduce((s: number, c: any) => s + c.products, 0);
    const activeCount = categories.filter((c: any) => c.status === "active").length;
    const hiddenCount = categories.filter((c: any) => c.status === "hidden").length;
    const withSeo = categories.filter((c: any) => c.hasSeo).length;

    // Collections from Medusa
    let collections: any[] = [];
    try {
      const colRes = await medusaAdminFetch("/admin/collections?limit=100&offset=0");
      if (colRes.ok) {
        const colData = await colRes.json();
        collections = (colData.collections || []).map((c: any) => ({
          id: c.id,
          title: c.title,
          handle: c.handle,
          productCount: c.products?.length || 0,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }));
      }
    } catch { /* collections optional */ }

    // Category sales from recent orders (aggregate order_items → product → category)
    let categorySales: Record<string, { revenue: number; orders: number }> = {};
    try {
      const ordRes = await medusaAdminFetch("/admin/orders?limit=200&fields=id,items.product_id,items.unit_price,items.quantity,status,payment_status&order=-created_at");
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        const completedOrders = (ordData.orders || []).filter((o: any) => o.payment_status === "captured" && o.status !== "canceled");
        // Map product_id → category_id from the categories we already have
        const productCategoryMap: Record<string, string> = {};
        for (const cat of allRaw) {
          for (const p of (cat.products || [])) {
            productCategoryMap[p.id] = cat.id;
          }
        }
        for (const order of completedOrders) {
          for (const item of (order.items || [])) {
            const catId = productCategoryMap[item.product_id];
            if (catId) {
              if (!categorySales[catId]) categorySales[catId] = { revenue: 0, orders: 0 };
              categorySales[catId].revenue += ((item.unit_price || 0) * (item.quantity || 1)) / 100;
              categorySales[catId].orders += 1;
            }
          }
        }
      }
    } catch { /* sales aggregation optional */ }

    // Enrich categories with sales data
    categories = categories.map((c: any) => ({
      ...c,
      salesMonth: categorySales[c.id]?.revenue || 0,
      orderCount: categorySales[c.id]?.orders || 0,
    }));

    return NextResponse.json({
      categories,
      collections,
      total: categories.length,
      stats: {
        total: categories.length,
        root: rootCount,
        active: activeCount,
        hidden: hiddenCount,
        totalProducts,
        withSeo,
        seoPercent: categories.length > 0 ? Math.round((withSeo / categories.length) * 100) : 0,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Categories GET]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, handle, description, parent_category_id, is_active, is_internal, metadata } = body;

    if (!name) {
      return NextResponse.json({ error: "name required" }, { status: 400 });
    }

    const categoryBody: any = {
      name,
      handle: handle || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      is_active: is_active !== false,
      is_internal: is_internal || false,
    };

    if (description) categoryBody.description = description;
    if (parent_category_id) categoryBody.parent_category_id = parent_category_id;
    if (metadata) categoryBody.metadata = metadata;

    const res = await medusaAdminFetch("/admin/product-categories", {
      method: "POST",
      body: JSON.stringify(categoryBody),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[Categories POST] Medusa error:", err);
      return NextResponse.json({ error: err.message || "Failed to create" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, category: mapCategory(data.product_category, []) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const res = await medusaAdminFetch(`/admin/product-categories/${id}`, {
      method: "POST",
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message || "Failed to update" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, category: mapCategory(data.product_category, []) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const res = await medusaAdminFetch(`/admin/product-categories/${id}`, {
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
