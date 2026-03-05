// /api/admin/quotes/convert — Convert approved quote to Medusa draft order
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { medusaAdminFetch } from "../../_helpers";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const REGION_ID = "reg_01KJ4BB2Z46YY1HWG0Q2N4KBVX"; // México

export async function POST(req: NextRequest) {
  try {
    const { quote_id } = await req.json();
    if (!quote_id) {
      return NextResponse.json({ error: "quote_id required" }, { status: 400 });
    }

    const supabase = getSupabase();

    // 1. Fetch quote
    const { data: quote, error: fetchErr } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quote_id)
      .single();

    if (fetchErr || !quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // 2. Validate status
    const convertibleStatuses = ["aprobada", "anticipo_recibido"];
    if (!convertibleStatuses.includes(quote.status)) {
      return NextResponse.json(
        { error: `No se puede convertir una cotización con estado "${quote.status}". Debe estar aprobada o con anticipo.` },
        { status: 400 }
      );
    }

    // 3. Build draft order for Medusa
    // Since quotes have custom pieces (not necessarily existing products),
    // we create a draft order with custom line items
    const pieces = (quote.pieces || []) as any[];

    const draftPayload: any = {
      email: quote.customer_email,
      region_id: REGION_ID,
      items: pieces.map((p: any) => ({
        title: `${p.type} — ${p.material}`,
        quantity: p.quantity,
        unit_price: Math.round((p.unitPrice || p.lineTotal / p.quantity) * 100), // to centavos
        metadata: {
          quote_id: quote.id,
          quote_number: quote.number,
          category: p.category,
          dimensions: p.dimensions || null,
          engraving: p.engraving || null,
          textile: p.textile || null,
          notes: p.notes || null,
        },
      })),
      shipping_methods: [],
      metadata: {
        source: "quote",
        quote_id: quote.id,
        quote_number: quote.number,
        project_name: quote.project_name,
      },
    };

    // 4. Create draft order in Medusa
    const resp = await medusaAdminFetch("/admin/draft-orders", {
      method: "POST",
      body: JSON.stringify(draftPayload),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("[quotes/convert] Medusa draft order failed:", resp.status, errText);

      // Fallback: if draft orders not available, just mark as converted
      // and return success with note
      if (resp.status === 404 || resp.status === 400) {
        await supabase
          .from("quotes")
          .update({
            status: "en_produccion",
            internal_notes: [
              ...(quote.internal_notes || []),
              {
                text: `Cotización convertida a producción (sin draft order — endpoint no disponible). Total: $${quote.total}`,
                date: new Date().toISOString(),
                by: "system",
              },
            ],
            updated_at: new Date().toISOString(),
          })
          .eq("id", quote_id);

        return NextResponse.json({
          success: true,
          fallback: true,
          message: "Cotización marcada en producción (draft orders no disponible en este plan de Medusa)",
        });
      }

      return NextResponse.json(
        { error: `Medusa error: ${resp.status}` },
        { status: 500 }
      );
    }

    const orderData = await resp.json();
    const orderId = orderData.draft_order?.id || orderData.id;

    // 5. Update quote status
    await supabase
      .from("quotes")
      .update({
        status: "en_produccion",
        internal_notes: [
          ...(quote.internal_notes || []),
          {
            text: `Convertida a orden Medusa: ${orderId}`,
            date: new Date().toISOString(),
            by: "system",
          },
        ],
        updated_at: new Date().toISOString(),
      })
      .eq("id", quote_id);

    return NextResponse.json({
      success: true,
      order_id: orderId,
      message: `Orden ${orderId} creada desde cotización ${quote.number}`,
    });
  } catch (err: unknown) {
    console.error("[quotes/convert] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
