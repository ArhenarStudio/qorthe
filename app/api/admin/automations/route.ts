// /api/admin/automations — Automations from Medusa subscribers + Supabase rules + chat auto-replies
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET() {
  try {
    const supabase = getSupabase();

    // 1. Read automation_rules from Supabase (configurable)
    let rules: any[] = [];
    try {
      const { data } = await supabase.from("automation_rules").select("*").order("category", { ascending: true });
      rules = data || [];
    } catch {}

    // 2. Static list of Medusa subscribers (these always run, can't be disabled from UI)
    const subscribers = [
      { id: "sub-order-placed", name: "Confirmación de pedido", trigger: "order.placed", actions: ["Email OrderConfirmation + AdminNewOrder"], category: "Pedidos", type: "subscriber" },
      { id: "sub-order-canceled", name: "Cancelación de pedido", trigger: "order.canceled", actions: ["Email OrderCancelled + AdminOrderCancelled"], category: "Pedidos", type: "subscriber" },
      { id: "sub-order-refund", name: "Reembolso procesado", trigger: "order.refund_created", actions: ["Email OrderRefunded"], category: "Pedidos", type: "subscriber" },
      { id: "sub-fulfillment", name: "Pedido enviado", trigger: "fulfillment.created", actions: ["Email OrderShipped + ReviewRequest"], category: "Envíos", type: "subscriber" },
      { id: "sub-payment-failed", name: "Pago fallido", trigger: "payment.failed", actions: ["Email PaymentFailed + tech alert"], category: "Pagos", type: "subscriber" },
      { id: "sub-customer-created", name: "Bienvenida", trigger: "customer.created", actions: ["Email WelcomeEmail"], category: "Clientes", type: "subscriber" },
      { id: "sub-password-reset", name: "Reset contraseña", trigger: "auth.password_reset", actions: ["Email PasswordReset"], category: "Auth", type: "subscriber" },
      { id: "sub-meta-capi", name: "Meta CAPI Purchase", trigger: "order.placed", actions: ["Send Purchase event to Meta"], category: "Marketing", type: "subscriber" },
      { id: "sub-loyalty", name: "Puntos de lealtad", trigger: "order.placed", actions: ["Award points based on tier"], category: "Lealtad", type: "subscriber" },
    ];

    // 3. Chat auto-replies
    try {
      const { data: config } = await supabase.from("chat_config").select("auto_replies").eq("id", "default").single();
      if (config?.auto_replies?.length) {
        config.auto_replies.forEach((ar: any, i: number) => {
          if (ar.keyword && ar.response) {
            subscribers.push({ id: `chat-auto-${i}`, name: `Chat: "${ar.keyword}"`, trigger: `Keyword match`, actions: [`Auto-reply: "${ar.response.slice(0, 50)}"`], category: "Chat", type: "chat_auto" });
          }
        });
      }
    } catch {}

    // Merge: rules (configurable) + subscribers (static)
    const all = [
      ...rules.map(r => ({ ...r, type: "rule", enabled: r.is_enabled })),
      ...subscribers.map(s => ({ ...s, enabled: true, is_system: true })),
    ];

    return NextResponse.json({
      automations: all,
      rules,
      subscribers,
      stats: {
        total: all.length,
        rules: rules.length,
        rulesEnabled: rules.filter(r => r.is_enabled).length,
        subscribers: subscribers.length,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const { id, is_enabled, config: ruleConfig } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (typeof is_enabled === "boolean") updates.is_enabled = is_enabled;
    if (ruleConfig) updates.config = ruleConfig;

    const { data, error } = await supabase.from("automation_rules").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, rule: data });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}
