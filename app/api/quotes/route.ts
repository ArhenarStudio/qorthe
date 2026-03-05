// /api/quotes — Public API for customers to submit quotation requests
// This is separate from /api/admin/quotes which requires admin auth
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabase();

    // Validate required fields
    if (!body.customer_email || !body.customer_name || !body.customer_phone) {
      return NextResponse.json(
        { error: "Nombre, email y teléfono son obligatorios" },
        { status: 400 }
      );
    }

    if (!body.pieces || body.pieces.length === 0) {
      return NextResponse.json(
        { error: "Debe incluir al menos una pieza" },
        { status: 400 }
      );
    }

    // Generate quote number: COT-YYYY-NNN
    let num: number;
    try {
      const { data: seqData } = await supabase
        .rpc("nextval", { seq_name: "quote_number_seq" })
        .single();
      num = (typeof seqData === 'number' ? seqData : null) || Math.floor(Math.random() * 9000 + 1000);
    } catch {
      // If sequence doesn't exist, use random
      num = Math.floor(Math.random() * 9000 + 1000);
    }

    const number = `COT-${new Date().getFullYear()}-${String(num).padStart(3, "0")}`;
    const validityDays = 15;
    const validUntil = new Date(
      Date.now() + validityDays * 86400000
    ).toISOString();

    const { data, error } = await supabase
      .from("quotes")
      .insert({
        number,
        status: "nueva",
        customer_email: body.customer_email,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_tier: null,
        project_name:
          body.project_name ||
          `${body.pieces[0]?.type || "Cotización"}${
            body.pieces.length > 1 ? ` + ${body.pieces.length - 1} más` : ""
          }`,
        pieces: body.pieces,
        timeline: body.timeline || "4-6 semanas",
        validity_days: validityDays,
        valid_until: validUntil,
        deposit_percent: 50,
        conditions: [
          { text: "Anticipo 50% para iniciar producción", checked: true },
          { text: "Saldo 50% al completar antes de envío", checked: true },
          { text: "Fotos de avance durante la producción", checked: true },
        ],
        messages: body.notes
          ? [
              {
                from: "customer",
                name: body.customer_name,
                text: body.notes,
                date: new Date().toISOString(),
              },
            ]
          : [],
        internal_notes: [],
        subtotal: body.subtotal || 0,
        total: body.total || 0,
        cost_estimate: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("[api/quotes] Supabase insert error:", error);
      throw error;
    }

    // TODO: Send confirmation email to customer + notification to admin
    // This will be added in Fase 10 Email integration

    return NextResponse.json({
      success: true,
      quote: {
        id: data.id,
        number: data.number,
        status: data.status,
      },
    });
  } catch (err: unknown) {
    console.error("[api/quotes] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
