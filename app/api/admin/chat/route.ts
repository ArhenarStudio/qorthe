// ═══════════════════════════════════════════════════════════════
// /api/admin/chat — Admin chat management
// GET    — List conversations (with unread counts)
// POST   — Send admin reply
// PATCH  — Close/reopen conversation
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
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("id");
    const status = searchParams.get("status") || "open";

    const supabase = getSupabaseAdmin();

    // Single conversation detail
    if (conversationId) {
      const { data: conv } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (!conv) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }

      const { data: messages } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(200);

      // Mark customer messages as read by admin
      await supabase
        .from("chat_messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .eq("sender", "customer")
        .eq("read", false);

      // Reset admin unread
      await supabase
        .from("chat_conversations")
        .update({ unread_admin: 0 })
        .eq("id", conversationId);

      return NextResponse.json({ conversation: conv, messages: messages || [] });
    }

    // List all conversations
    let query = supabase
      .from("chat_conversations")
      .select("*")
      .order("last_message_at", { ascending: false })
      .limit(50);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: conversations, error } = await query;

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ conversations: [], stats: { total: 0, open: 0, unread: 0 }, _info: "Table not created yet" });
      }
      throw error;
    }

    const stats = {
      total: (conversations || []).length,
      open: (conversations || []).filter((c: any) => c.status === "open").length,
      unread: (conversations || []).reduce((s: number, c: any) => s + (c.unread_admin || 0), 0),
    };

    return NextResponse.json({ conversations: conversations || [], stats });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Admin Chat GET]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { conversation_id, text } = await req.json();
    if (!conversation_id || !text) {
      return NextResponse.json({ error: "conversation_id and text required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: message, error } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id,
        sender: "admin",
        text: text.trim(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation
    await supabase
      .from("chat_conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: `Admin: ${text.trim().slice(0, 80)}`,
        unread_customer: 1, // Simple increment
        status: "open",
      })
      .eq("id", conversation_id);

    return NextResponse.json({ success: true, message });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Admin Chat POST]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    await supabase
      .from("chat_conversations")
      .update({ status })
      .eq("id", id);

    if (status === "closed") {
      await supabase.from("chat_messages").insert({
        conversation_id: id,
        sender: "system",
        text: "Esta conversación ha sido cerrada por el equipo de soporte.",
      });
    }

    return NextResponse.json({ success: true, status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
