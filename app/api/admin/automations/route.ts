// /api/admin/automations — List active automations (Medusa subscribers + chat auto-replies)
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET() {
  try {
    // These are the actual Medusa subscribers deployed in backend
    const workflows = [
      { id: "order-placed", name: "Confirmación de pedido", trigger: "order.placed", actions: ["Email al cliente (OrderConfirmation)", "Email al admin (AdminNewOrder)"], enabled: true, category: "Pedidos" },
      { id: "order-canceled", name: "Cancelación de pedido", trigger: "order.canceled", actions: ["Email al cliente (OrderCancelled)", "Email al admin (AdminOrderCancelled)"], enabled: true, category: "Pedidos" },
      { id: "order-refund", name: "Reembolso procesado", trigger: "order.refund_created", actions: ["Email al cliente (OrderRefunded)"], enabled: true, category: "Pedidos" },
      { id: "fulfillment-created", name: "Pedido enviado", trigger: "fulfillment.created", actions: ["Email al cliente (OrderShipped) con tracking"], enabled: true, category: "Envíos" },
      { id: "payment-failed", name: "Pago fallido", trigger: "payment.failed", actions: ["Email al cliente (PaymentFailed)", "Alerta al tech admin"], enabled: true, category: "Pagos" },
      { id: "customer-created", name: "Bienvenida nuevo cliente", trigger: "customer.created", actions: ["Email de bienvenida (WelcomeEmail)"], enabled: true, category: "Clientes" },
      { id: "password-reset", name: "Reset de contraseña", trigger: "auth.password_reset", actions: ["Email con link (PasswordReset)"], enabled: true, category: "Auth" },
      { id: "meta-capi", name: "Meta CAPI — Purchase", trigger: "order.placed", actions: ["Enviar evento Purchase a Meta Conversions API"], enabled: true, category: "Marketing" },
      { id: "loyalty-points", name: "Puntos de lealtad", trigger: "order.placed (post-payment)", actions: ["Calcular y acreditar puntos según tier"], enabled: true, category: "Lealtad" },
    ];

    // Chat auto-replies from config
    const supabase = getSupabase();
    try {
      const { data: config } = await supabase.from("chat_config").select("auto_replies, faqs").eq("id", "default").single();
      if (config?.auto_replies?.length) {
        config.auto_replies.forEach((ar: any, i: number) => {
          if (ar.keyword && ar.response) {
            workflows.push({ id: `chat-auto-${i}`, name: `Chat: "${ar.keyword}"`, trigger: `Mensaje contiene "${ar.keyword}"`, actions: [`Respuesta automática: "${ar.response.slice(0, 60)}..."`], enabled: true, category: "Chat" });
          }
        });
      }
    } catch {}

    const stats = {
      total: workflows.length,
      enabled: workflows.filter(w => w.enabled).length,
      categories: [...new Set(workflows.map(w => w.category))],
    };

    return NextResponse.json({ automations: workflows, stats });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
