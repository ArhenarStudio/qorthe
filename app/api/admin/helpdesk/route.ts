// /api/admin/helpdesk — Support tickets (Resend emails) + open chat conversations
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET() {
  try {
    const supabase = getSupabase();
    const tickets: any[] = [];

    // 1. Chat conversations as tickets
    try {
      const { data: convs } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("last_message_at", { ascending: false })
        .limit(50);

      (convs || []).forEach((c: any) => {
        tickets.push({
          id: `chat-${c.id}`,
          type: "chat",
          customer: c.customer_name || c.customer_email?.split("@")[0] || "Cliente",
          email: c.customer_email,
          subject: c.last_message_preview || "Conversación de chat",
          status: c.status === "open" ? "open" : "closed",
          unread: c.unread_admin || 0,
          createdAt: c.created_at,
          updatedAt: c.last_message_at,
        });
      });
    } catch {}

    // 2. Contact form emails from Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
        });
        if (res.ok) {
          const data = await res.json();
          (data.data || []).filter((e: any) => e.subject?.includes("[Soporte]")).forEach((e: any) => {
            tickets.push({
              id: `email-${e.id}`,
              type: "email",
              customer: e.reply_to || "Cliente",
              email: e.reply_to || "",
              subject: e.subject?.replace("[Soporte] ", "") || "Ticket",
              status: "received",
              unread: 0,
              createdAt: e.created_at,
              updatedAt: e.created_at,
            });
          });
        }
      } catch {}
    }

    // Sort by most recent
    tickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({
      tickets,
      stats: {
        total: tickets.length,
        open: tickets.filter(t => t.status === "open").length,
        unread: tickets.reduce((s, t) => s + t.unread, 0),
        chats: tickets.filter(t => t.type === "chat").length,
        emails: tickets.filter(t => t.type === "email").length,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
