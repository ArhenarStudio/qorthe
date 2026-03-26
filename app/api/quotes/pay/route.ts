// /api/quotes/pay — Create Stripe Checkout Session for approved quote
// Creates a payment session for the deposit amount of an approved quote
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || "https://qorthe.com";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, { apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion });
}

const PAYABLE_STATUSES = ["aprobada", "anticipo_recibido"];

interface QuotePiece {
  type?: string;
  material?: string;
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { quote_id, pay_type } = await req.json();
    if (!quote_id) {
      return NextResponse.json({ error: "quote_id requerido" }, { status: 400 });
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
    if (!PAYABLE_STATUSES.includes(quote.status)) {
      return NextResponse.json(
        { error: `Cotización no está en estado pagable (estado actual: ${quote.status})` },
        { status: 400 }
      );
    }

    // 3. Validate not expired
    if (quote.valid_until && new Date(quote.valid_until) < new Date()) {
      return NextResponse.json({ error: "Cotización vencida" }, { status: 400 });
    }

    // 4. Calculate amount
    const pieces = (quote.pieces || []) as QuotePiece[];
    const quoteTotal = pieces.reduce(
      (sum, p) => sum + (p.lineTotal || (p.unitPrice || 0) * (p.quantity || 1)),
      0
    );
    const depositPercent = quote.deposit_percent || 50;

    // pay_type: "deposit" (default) or "full"
    const isDeposit = pay_type !== "full";
    const payAmount = isDeposit ? Math.round(quoteTotal * depositPercent / 100) : quoteTotal;

    if (payAmount <= 0) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }

    // 5. Build Stripe Checkout Session line items
    const stripe = getStripe();

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = isDeposit
      ? [{
          price_data: {
            currency: "mxn",
            product_data: {
              name: `Anticipo Cotización ${quote.number}`,
              description: `Anticipo ${depositPercent}% — ${quote.project_name || quote.number}`,
            },
            unit_amount: payAmount * 100, // centavos
          },
          quantity: 1,
        }]
      : pieces.map((p) => ({
          price_data: {
            currency: "mxn",
            product_data: {
              name: `${p.type || "Pieza"}${p.material ? ` — ${p.material}` : ""}`,
            },
            unit_amount: Math.round((p.unitPrice || 0) * 100),
          },
          quantity: p.quantity || 1,
        }));

    // 6. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: quote.customer_email,
      metadata: {
        quote_id: quote.id,
        quote_number: quote.number,
        pay_type: isDeposit ? "deposit" : "full",
        deposit_percent: String(depositPercent),
      },
      success_url: `${STORE_URL}/quote/pay/success?session_id={CHECKOUT_SESSION_ID}&quote_id=${quote.id}`,
      cancel_url: `${STORE_URL}/quote/pay?id=${quote.id}`,
    });

    // 7. Record payment intent in quote
    await supabase
      .from("quotes")
      .update({
        internal_notes: [
          ...(quote.internal_notes || []),
          {
            id: `note_${Date.now()}`,
            author: "Sistema",
            date: new Date().toISOString(),
            text: `Checkout Stripe iniciado: ${session.id} (${isDeposit ? `anticipo ${depositPercent}%` : "pago completo"}: $${payAmount} MXN)`,
          },
        ],
        updated_at: new Date().toISOString(),
      })
      .eq("id", quote.id);

    return NextResponse.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
      amount: payAmount,
      pay_type: isDeposit ? "deposit" : "full",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
