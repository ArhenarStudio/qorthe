// /api/support — Customer-facing support: create tickets + warranty claims
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logger } from '@/src/lib/logger';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: NextRequest) {
  try {
    const email = new URL(req.url).searchParams.get("email");
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
    const supabase = getSupabase();

    // Get customer's tickets
    const { data: tickets } = await supabase.from("support_tickets").select("id, ticket_number, subject, status, priority, category, created_at, updated_at").eq("customer_email", email.toLowerCase()).order("created_at", { ascending: false }).limit(20);

    // Get customer's warranty claims
    const { data: claims } = await supabase.from("warranty_claims").select("id, claim_number, product_title, defect_type, status, is_within_warranty, created_at").eq("customer_email", email.toLowerCase()).order("created_at", { ascending: false }).limit(20);

    // Get warranty policy for defect types dropdown
    const { data: policy } = await supabase.from("warranty_policies").select("defect_types, default_days, categories").eq("id", "default").single();

    return NextResponse.json({
      tickets: tickets || [],
      warrantyClaims: claims || [],
      warrantyPolicy: policy,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabase();

    if (body._type === "ticket") {
      const { _type, ...ticketData } = body;
      const { data, error } = await supabase.from("support_tickets").insert({
        customer_email: ticketData.email?.toLowerCase(),
        customer_name: ticketData.name,
        order_id: ticketData.order_id,
        category: ticketData.category || "otro",
        priority: "normal",
        subject: ticketData.subject,
        description: ticketData.description,
      }).select().single();
      if (error) throw error;

      // Auto-route ticket to correct department
      try {
        await fetch(new URL('/api/admin/agents', req.url).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _type: 'route_ticket', ticket_id: data.id, category: ticketData.category, subject: ticketData.subject, description: ticketData.description }),
        });
      } catch (_err) { logger.warn("[fire-and-forget] non-critical error suppressed", _err); }

      // Send email notification to admin
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (RESEND_API_KEY) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
              from: "Qorthe <qorthedesign@gmail.com>",
              to: ["pedidos@qorthe.com"],
              reply_to: ticketData.email,
              subject: `[Ticket #${data.ticket_number}] ${ticketData.subject}`,
              html: `<p><strong>Nuevo ticket de soporte</strong></p><p>Cliente: ${ticketData.name || ticketData.email}</p><p>Categoría: ${ticketData.category}</p><p>Asunto: ${ticketData.subject}</p><p>Descripción: ${ticketData.description || "Sin descripción"}</p>`,
            }),
          });
        } catch (_err) { logger.warn("[fire-and-forget] non-critical error suppressed", _err); }
      }

      return NextResponse.json({ success: true, ticket: data });
    }

    if (body._type === "warranty") {
      const { _type, ...claimData } = body;

      // Calculate warranty status
      let isWithinWarranty = false;
      let warrantyDays = 365;
      try {
        const { data: policy } = await supabase.from("warranty_policies").select("*").eq("id", "default").single();
        if (policy?.categories && claimData.product_category) {
          warrantyDays = policy.categories[claimData.product_category] || policy.default_days;
        }
        if (claimData.purchase_date) {
          const warrantyEnd = new Date(new Date(claimData.purchase_date).getTime() + warrantyDays * 86400000);
          isWithinWarranty = new Date() <= warrantyEnd;
        }
      } catch (_err) { logger.warn("[fire-and-forget] non-critical error suppressed", _err); }

      // Auto-approve for shipping damage within 30 days
      let status = "submitted";
      if (claimData.defect_type === "Pieza rota en envio") status = "approved";

      const { data, error } = await supabase.from("warranty_claims").insert({
        customer_email: claimData.email?.toLowerCase(),
        customer_name: claimData.name,
        order_id: claimData.order_id,
        order_display_id: claimData.order_display_id,
        product_title: claimData.product_title,
        product_id: claimData.product_id,
        purchase_date: claimData.purchase_date,
        defect_type: claimData.defect_type,
        defect_description: claimData.defect_description,
        photo_urls: claimData.photo_urls,
        warranty_days: warrantyDays,
        is_within_warranty: isWithinWarranty,
        status,
      }).select().single();
      if (error) throw error;
      return NextResponse.json({ success: true, claim: data, autoApproved: status === "approved" });
    }

    return NextResponse.json({ error: "_type must be 'ticket' or 'warranty'" }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}
