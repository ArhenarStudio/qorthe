// /api/admin/warranty — Warranty claims management + policy config
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "claims";
    const supabase = getSupabase();

    if (type === "policy") {
      const { data } = await supabase.from("warranty_policies").select("*").eq("id", "default").single();
      return NextResponse.json({ policy: data });
    }

    // Claims list
    const status = searchParams.get("status");
    let query = supabase.from("warranty_claims").select("*").order("created_at", { ascending: false }).limit(100);
    if (status && status !== "all") query = query.eq("status", status);

    const { data: claims, error } = await query;
    if (error && error.code === "42P01") return NextResponse.json({ claims: [], stats: {}, policy: null });
    if (error) throw error;

    const all = claims || [];
    return NextResponse.json({
      claims: all,
      stats: {
        total: all.length,
        submitted: all.filter(c => c.status === "submitted").length,
        reviewing: all.filter(c => c.status === "reviewing").length,
        approved: all.filter(c => c.status === "approved").length,
        rejected: all.filter(c => c.status === "rejected").length,
        withinWarranty: all.filter(c => c.is_within_warranty).length,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabase();

    // Update policy
    if (body._type === "policy") {
      const { _type, ...policyData } = body;
      await supabase.from("warranty_policies").update({ ...policyData, updated_at: new Date().toISOString() }).eq("id", "default");
      return NextResponse.json({ success: true });
    }

    // Create warranty claim
    // Auto-calculate if within warranty
    let isWithinWarranty = false;
    if (body.purchase_date && body.warranty_days) {
      const purchaseDate = new Date(body.purchase_date);
      const warrantyEnd = new Date(purchaseDate.getTime() + body.warranty_days * 86400000);
      isWithinWarranty = new Date() <= warrantyEnd;
    }

    // Auto-approve criteria
    let autoStatus = "submitted";
    try {
      const { data: policy } = await supabase.from("warranty_policies").select("auto_approve_criteria").eq("id", "default").single();
      const criteria = policy?.auto_approve_criteria || {};
      if (criteria.shipping_damage && body.defect_type === "Pieza rota en envio") autoStatus = "approved";
      if (criteria.within_30_days && body.purchase_date) {
        const daysSincePurchase = (Date.now() - new Date(body.purchase_date).getTime()) / 86400000;
        if (daysSincePurchase <= 30) autoStatus = "approved";
      }
    } catch {}

    const { data, error } = await supabase.from("warranty_claims").insert({
      ...body,
      is_within_warranty: isWithinWarranty,
      status: autoStatus,
      reviewed_at: autoStatus === "approved" ? new Date().toISOString() : null,
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, claim: data, autoApproved: autoStatus === "approved" });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const supabase = getSupabase();

    const patchData: any = { ...updates, updated_at: new Date().toISOString() };
    if (updates.status === "approved" || updates.status === "rejected") patchData.reviewed_at = new Date().toISOString();
    if (updates.status === "replaced" || updates.status === "refunded") patchData.resolved_at = new Date().toISOString();

    const { error } = await supabase.from("warranty_claims").update(patchData).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}
