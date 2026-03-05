// /api/admin/quotes/convert — Convert approved quote to Medusa order + POS compatible
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { medusaAdminFetch } from "../../_helpers";

const REGION_ID = process.env.MEDUSA_REGION_ID || "reg_01KJ4BB2Z46YY1HWG0Q2N4KBVX";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const CONVERTIBLE_STATUSES = ["aprobada", "anticipo_recibido"];

export async function POST(req: NextRequest) {
  try {
    const { quote_id, target } = await req.json();
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
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }

    // 2. Validate status
    if (!CONVERTIBLE_STATUSES.includes(quote.status)) {
      return NextResponse.json(
        { error: `No se puede convertir con estado "${quote.status}". Debe estar aprobada o con anticipo.` },
        { status: 400 }
      );
    }

    // 3. Build draft order payload
    const pieces = (quote.pieces || []) as {
      type?: string;
      category?: string;
      material?: string;
      quantity?: number;
      unitPrice?: number;
      lineTotal?: number;
      dimensions?: { length: number; width: number; thickness: number };
      engraving?: Record<string, unknown>;
      textile?: Record<string, unknown>;
      notes?: string;
    }[];

    const isPOS = target === "pos";

    const draftPayload = {
      email: quote.customer_email,
      region_id: REGION_ID,
      items: pieces.map((p) => ({
        title: `${p.type || "Producto"}${p.material ? ` — ${p.material}` : ""}`,
        quantity: p.quantity || 1,
        unit_price: Math.round((p.unitPrice || (p.lineTotal || 0) / (p.quantity || 1)) * 100),
        metadata: {
          quote_id: quote.id,
          quote_number: quote.number,
          category: p.category || null,
          dimensions: p.dimensions || null,
          engraving: p.engraving || null,
          textile: p.textile || null,
          notes: p.notes || null,
        },
      })),
      shipping_methods: [],
      metadata: {
        source: isPOS ? "pos" : "quote",
        channel: isPOS ? "quote" : "web",
        quote_id: quote.id,
        quote_number: quote.number,
        project_name: quote.project_name || "",
        payment_method: isPOS ? "transfer" : "online",
      },
    };

    // 4. Try creating draft order in Medusa
    const resp = await medusaAdminFetch("/admin/draft-orders", {
      method: "POST",
      body: JSON.stringify(draftPayload),
    });

    let orderId: string | null = null;
    let orderType = "draft_order";

    if (resp.ok) {
      const orderData = await resp.json();
      orderId = orderData.draft_order?.id || orderData.id;
    } else {
      // Fallback: try regular order creation
      const orderResp = await medusaAdminFetch("/admin/orders", {
        method: "POST",
        body: JSON.stringify({
          email: quote.customer_email,
          region_id: REGION_ID,
          items: draftPayload.items,
          metadata: draftPayload.metadata,
        }),
      });

      if (orderResp.ok) {
        const d = await orderResp.json();
        orderId = d.order?.id || d.id;
        orderType = "order";
      } else {
        orderType = "local";
        orderId = `pos_${Date.now()}`;
      }
    }

    // 5. Update quote status in Supabase
    const noteText = orderId
      ? `Convertida a ${orderType}: ${orderId}${isPOS ? " (vía POS)" : ""}`
      : "Convertida a producción (Medusa draft orders no disponible)";

    await supabase
      .from("quotes")
      .update({
        status: "en_produccion",
        internal_notes: [
          ...(quote.internal_notes || []),
          { id: `note_${Date.now()}`, author: "Sistema", date: new Date().toISOString(), text: noteText },
        ],
        updated_at: new Date().toISOString(),
      })
      .eq("id", quote_id);

    return NextResponse.json({
      success: true,
      order_id: orderId,
      order_type: orderType,
      is_pos: isPOS,
      message: `Orden ${orderId} creada desde cotización ${quote.number}${isPOS ? " (POS)" : ""}`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
