// /api/admin/tickets — Support ticket system CRUD
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const supabase = getSupabase();

    // Single ticket with messages
    if (id) {
      const { data: ticket } = await supabase.from("support_tickets").select("*").eq("id", id).single();
      if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const { data: messages } = await supabase.from("ticket_messages").select("*").eq("ticket_id", id).order("created_at", { ascending: true });
      return NextResponse.json({ ticket, messages: messages || [] });
    }

    // List tickets
    let query = supabase.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(100);
    if (status && status !== "all") query = query.eq("status", status);
    if (search) query = query.or(`subject.ilike.%${search}%,customer_email.ilike.%${search}%,customer_name.ilike.%${search}%`);

    const { data: tickets, error } = await query;
    if (error && error.code === "42P01") return NextResponse.json({ tickets: [], stats: {} });
    if (error) throw error;

    const all = tickets || [];
    return NextResponse.json({
      tickets: all,
      stats: {
        total: all.length,
        open: all.filter(t => t.status === "open").length,
        inProgress: all.filter(t => t.status === "in_progress").length,
        waiting: all.filter(t => t.status === "waiting_customer").length,
        resolved: all.filter(t => t.status === "resolved").length,
        urgent: all.filter(t => t.priority === "urgent" || t.priority === "high").length,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabase();

    // Create ticket or add message
    if (body.ticket_id && body.text) {
      // Add message to existing ticket
      const { data, error } = await supabase.from("ticket_messages").insert({
        ticket_id: body.ticket_id,
        sender: body.sender || "admin",
        text: body.text,
        is_internal: body.is_internal || false,
      }).select().single();
      if (error) throw error;

      // Update ticket timestamp
      await supabase.from("support_tickets").update({ updated_at: new Date().toISOString() }).eq("id", body.ticket_id);
      return NextResponse.json({ success: true, message: data });
    }

    // Create new ticket
    const { data, error } = await supabase.from("support_tickets").insert({
      customer_email: body.customer_email,
      customer_name: body.customer_name,
      order_id: body.order_id,
      category: body.category || "otro",
      priority: body.priority || "normal",
      subject: body.subject,
      description: body.description,
      tags: body.tags,
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, ticket: data });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const supabase = getSupabase();

    const patchData: any = { ...updates, updated_at: new Date().toISOString() };
    if (updates.status === "resolved") patchData.resolved_at = new Date().toISOString();
    if (updates.status === "closed") patchData.closed_at = new Date().toISOString();

    const { error } = await supabase.from("support_tickets").update(patchData).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}
