// /api/admin/agents — Support agents + routing rules CRUD
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: NextRequest) {
  try {
    const type = new URL(req.url).searchParams.get("type") || "agents";
    const supabase = getSupabase();

    if (type === "routing") {
      const { data } = await supabase.from("routing_rules").select("*").order("category");
      return NextResponse.json({ rules: data || [] });
    }

    if (type === "departments") {
      const { data: agents } = await supabase.from("support_agents").select("department").eq("is_active", true);
      const departments = [...new Set((agents || []).map(a => a.department))].sort();
      return NextResponse.json({ departments });
    }

    // Agents list with ticket counts
    const { data: agents } = await supabase.from("support_agents").select("*").order("department");
    const { data: tickets } = await supabase.from("support_tickets").select("assigned_agent_id, status");

    const agentsWithCounts = (agents || []).map((a: any) => {
      const myTickets = (tickets || []).filter((t: any) => t.assigned_agent_id === a.id);
      return {
        ...a,
        ticketCount: myTickets.length,
        openTickets: myTickets.filter((t: any) => !['resolved', 'closed'].includes(t.status)).length,
      };
    });

    return NextResponse.json({ agents: agentsWithCounts });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabase();

    if (body._type === "agent") {
      const { _type, ...agentData } = body;
      const { data, error } = await supabase.from("support_agents").insert(agentData).select().single();
      if (error) throw error;
      return NextResponse.json({ success: true, agent: data });
    }

    if (body._type === "routing") {
      const { _type, ...ruleData } = body;
      const { data, error } = await supabase.from("routing_rules").insert(ruleData).select().single();
      if (error) throw error;
      return NextResponse.json({ success: true, rule: data });
    }

    // Route a ticket: find department + agent based on category and keywords
    if (body._type === "route_ticket") {
      const { ticket_id, category, subject, description } = body;
      const { data: rules } = await supabase.from("routing_rules").select("*").eq("is_active", true);

      let department = "Administracion";
      let matchedRule = null;

      // Match by category first
      const categoryRule = (rules || []).find((r: any) => r.category === category);
      if (categoryRule) {
        department = categoryRule.department;
        matchedRule = categoryRule;
      }

      // Also check keywords in subject/description
      const text = `${subject || ''} ${description || ''}`.toLowerCase();
      for (const rule of rules || []) {
        if (rule.priority_keywords?.some((kw: string) => text.includes(kw.toLowerCase()))) {
          department = rule.department;
          matchedRule = rule;
          break;
        }
      }

      // Find available agent in department
      const { data: agents } = await supabase.from("support_agents").select("*").eq("department", department).eq("is_active", true);
      const { data: tickets } = await supabase.from("support_tickets").select("assigned_agent_id, status").in("status", ["open", "in_progress"]);

      let assignedAgent = null;
      if (agents?.length) {
        // Find agent with fewest open tickets
        const agentLoads = agents.map((a: any) => ({
          ...a,
          load: (tickets || []).filter((t: any) => t.assigned_agent_id === a.id).length,
        }));
        agentLoads.sort((a: any, b: any) => a.load - b.load);
        assignedAgent = agentLoads[0];
      }

      // Update ticket
      const updates: any = { department };
      if (assignedAgent) {
        updates.assigned_agent_id = assignedAgent.id;
        updates.assigned_to = assignedAgent.name;
      }

      await supabase.from("support_tickets").update(updates).eq("id", ticket_id);

      return NextResponse.json({
        success: true,
        department,
        assignedAgent: assignedAgent ? { id: assignedAgent.id, name: assignedAgent.name } : null,
        matchedRule: matchedRule?.category,
      });
    }

    return NextResponse.json({ error: "_type required" }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, _type, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const supabase = getSupabase();

    if (_type === "agent") {
      await supabase.from("support_agents").update(updates).eq("id", id);
    } else if (_type === "routing") {
      await supabase.from("routing_rules").update(updates).eq("id", id);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, _type } = await req.json();
    const supabase = getSupabase();
    if (_type === "agent") await supabase.from("support_agents").delete().eq("id", id);
    if (_type === "routing") await supabase.from("routing_rules").delete().eq("id", id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}
