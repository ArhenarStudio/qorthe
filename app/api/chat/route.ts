// ═══════════════════════════════════════════════════════════════
// /api/chat — Live chat (customer side)
// GET  — Get or create conversation + messages for current user
// POST — Send a message
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  try {
    const email = new URL(req.url).searchParams.get("email");
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

    const supabase = getSupabaseAdmin();

    // Find or create conversation
    let { data: conv } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("customer_email", email.toLowerCase())
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!conv) {
      // Create new conversation
      const { data: newConv, error } = await supabase
        .from("chat_conversations")
        .insert({
          customer_email: email.toLowerCase(),
          customer_name: email.split("@")[0],
          status: "open",
        })
        .select()
        .single();

      if (error) {
        // Table may not exist yet
        if (error.code === "42P01") {
          return NextResponse.json({ conversation: null, messages: [], _info: "Table not created yet" });
        }
        throw error;
      }
      conv = newConv;

      // Insert welcome message
      await supabase.from("chat_messages").insert({
        conversation_id: conv.id,
        sender: "system",
        text: "¡Hola! Bienvenido al chat de soporte de DavidSon's Design. Un agente te atenderá pronto.",
        read: true,
      });
    }

    // Fetch messages
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true })
      .limit(100);

    // Mark admin messages as read by customer
    await supabase
      .from("chat_messages")
      .update({ read: true })
      .eq("conversation_id", conv.id)
      .in("sender", ["admin", "system"])
      .eq("read", false);

    // Reset unread counter for customer
    await supabase
      .from("chat_conversations")
      .update({ unread_customer: 0 })
      .eq("id", conv.id);

    return NextResponse.json({
      conversation: conv,
      messages: messages || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Chat GET]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, text, conversation_id } = await req.json();
    if (!email || !text) {
      return NextResponse.json({ error: "email and text required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get or use provided conversation
    let convId = conversation_id;
    if (!convId) {
      const { data: conv } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("customer_email", email.toLowerCase())
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!conv) {
        return NextResponse.json({ error: "No open conversation" }, { status: 404 });
      }
      convId = conv.id;
    }

    // Insert message
    const { data: message, error } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: convId,
        sender: "customer",
        text: text.trim(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation with incremented unread
    const { data: currentConv } = await supabase
      .from("chat_conversations")
      .select("unread_admin")
      .eq("id", convId)
      .single();

    await supabase
      .from("chat_conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: text.trim().slice(0, 100),
        unread_admin: (currentConv?.unread_admin || 0) + 1,
      })
      .eq("id", convId);

    return NextResponse.json({ success: true, message });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Chat POST]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
