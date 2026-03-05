// /api/admin/quotes — Full quotation management (Supabase)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function mapToFullQuote(q: any): any {
  return {
    id: q.id,
    number: q.number,
    date: q.created_at,
    validUntil: q.valid_until || new Date(new Date(q.created_at).getTime() + (q.validity_days || 15) * 86400000).toISOString(),
    status: q.status,
    customer: {
      name: q.customer_name || q.customer_email?.split('@')[0] || '',
      email: q.customer_email || '',
      phone: q.customer_phone || '',
      tier: q.customer_tier || null,
      points: 0, totalSpent: 0, orders: 0,
    },
    projectName: q.project_name,
    pieces: q.pieces || [],
    discount: q.discount,
    shippingIncluded: q.shipping_included || false,
    timeline: q.timeline || '3-4 semanas',
    validityDays: q.validity_days || 15,
    depositPercent: q.deposit_percent || 50,
    depositPaid: q.deposit_paid,
    conditions: q.conditions || [],
    messages: q.messages || [],
    internalNotes: q.internal_notes || [],
    productionProgress: q.production_progress,
    rejectionReason: q.rejection_reason,
    closedDate: q.closed_date,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");
    const supabase = getSupabase();

    if (id) {
      const { data, error } = await supabase.from("quotes").select("*").eq("id", id).single();
      if (error) throw error;
      return NextResponse.json({ quote: mapToFullQuote(data) });
    }

    let query = supabase.from("quotes").select("*").order("created_at", { ascending: false }).limit(100);
    if (status && status !== "all") query = query.eq("status", status);

    const { data: quotes, error } = await query;
    if (error && error.code === "42P01") return NextResponse.json({ quotes: [], stats: {} });
    if (error) throw error;

    const all = (quotes || []).map(mapToFullQuote);
    const activeStatuses = ['nueva', 'en_revision', 'cotizacion_enviada', 'en_negociacion', 'aprobada', 'anticipo_recibido', 'en_produccion'];

    return NextResponse.json({
      quotes: all,
      stats: {
        total: all.length,
        active: all.filter((q: any) => activeStatuses.includes(q.status)).length,
        nuevas: all.filter((q: any) => q.status === 'nueva').length,
        negociacion: all.filter((q: any) => ['en_revision', 'cotizacion_enviada', 'en_negociacion'].includes(q.status)).length,
        aprobadas: all.filter((q: any) => ['aprobada', 'anticipo_recibido'].includes(q.status)).length,
        produccion: all.filter((q: any) => q.status === 'en_produccion').length,
        totalValue: all.reduce((s: number, q: any) => s + (q.pieces || []).reduce((ps: number, p: any) => ps + ((p.adminPrice || p.autoPrice || 0) * (p.quantity || 1)), 0), 0),
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

    // Generate quote number
    const { data: seqData } = await supabase.rpc('nextval', { seq_name: 'quote_number_seq' }).single();
    const num = seqData || Math.floor(Math.random() * 9000 + 1000);
    const number = `COT-${new Date().getFullYear()}-${String(num).padStart(3, '0')}`;

    const validUntil = new Date(Date.now() + (body.validity_days || 15) * 86400000).toISOString();

    const { data, error } = await supabase.from("quotes").insert({
      number,
      status: body.status || 'nueva',
      customer_email: body.customer_email,
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      customer_tier: body.customer_tier,
      project_name: body.project_name,
      pieces: body.pieces || [],
      discount: body.discount,
      shipping_included: body.shipping_included || false,
      timeline: body.timeline || '3-4 semanas',
      validity_days: body.validity_days || 15,
      valid_until: validUntil,
      deposit_percent: body.deposit_percent || 50,
      conditions: body.conditions || [
        { text: 'Anticipo 50% para iniciar producción', checked: true },
        { text: 'Saldo 50% al completar antes de envío', checked: true },
        { text: 'Fotos de avance durante la producción', checked: true },
      ],
      messages: body.messages || [],
      internal_notes: body.internal_notes || [],
      subtotal: body.subtotal || 0,
      total: body.total || 0,
      cost_estimate: body.cost_estimate || 0,
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, quote: mapToFullQuote(data) });
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
    if (updates.status === 'completada' || updates.status === 'rechazada' || updates.status === 'cancelada') {
      patchData.closed_date = new Date().toISOString();
    }

    const { error } = await supabase.from("quotes").update(patchData).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const supabase = getSupabase();
    await supabase.from("quotes").delete().eq("id", id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}
