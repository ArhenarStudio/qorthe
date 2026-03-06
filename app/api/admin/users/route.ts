// ═══════════════════════════════════════════════════════════════
// /api/admin/users — Admin Users, Roles & Audit CRUD
// Supabase tables: admin_users, admin_roles, admin_audit_log
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function jsonOk(data: Record<string, unknown>) { return NextResponse.json(data); }
function jsonErr(msg: string, status = 500) { return NextResponse.json({ error: msg }, { status }); }

// ── GET ──
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "users";
    const supabase = getSupabase();

    if (action === "roles") {
      const { data: roles } = await supabase
        .from("admin_roles")
        .select("*")
        .order("name");

      // Count users per role
      const { data: users } = await supabase
        .from("admin_users")
        .select("role_id");

      const countMap = new Map<string, number>();
      (users || []).forEach(u => {
        const rid = u.role_id as string;
        countMap.set(rid, (countMap.get(rid) || 0) + 1);
      });

      const enriched = (roles || []).map(r => ({
        ...r,
        user_count: countMap.get(r.id) || 0,
      }));

      return jsonOk({ roles: enriched });
    }

    if (action === "audit") {
      const limit = parseInt(searchParams.get("limit") || "100");
      const module = searchParams.get("module");
      const userEmail = searchParams.get("user");

      let query = supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (module) query = query.eq("module", module);
      if (userEmail) query = query.eq("user_email", userEmail);

      const { data } = await query;
      return jsonOk({ audit: data || [] });
    }

    if (action === "check_email") {
      const email = searchParams.get("email");
      if (!email) return jsonErr("email requerido", 400);
      const { data } = await supabase
        .from("admin_users")
        .select("id, email, status")
        .eq("email", email.toLowerCase())
        .single();
      return jsonOk({ exists: !!data, user: data || null });
    }

    // Default: users list with role info
    const { data: users } = await supabase
      .from("admin_users")
      .select("*, admin_roles(name, color, scope)")
      .order("full_name");

    const mapped = (users || []).map(u => {
      const role = u.admin_roles as Record<string, unknown> | null;
      return {
        ...u,
        role_name: (role?.name as string) || "Sin rol",
        role_color: (role?.color as string) || "#999",
        admin_roles: undefined,
      };
    });

    // Stats
    const active = mapped.filter(u => u.status === "active").length;
    const inactive = mapped.filter(u => u.status === "inactive").length;
    const invited = mapped.filter(u => u.status === "invited").length;
    const departments = [...new Set(mapped.map(u => u.department).filter(Boolean))];

    return jsonOk({
      users: mapped,
      stats: {
        total: mapped.length,
        active,
        inactive,
        invited,
        departments: departments.length,
      },
    });
  } catch (err: unknown) {
    return jsonErr(err instanceof Error ? err.message : "Error desconocido");
  }
}

// ── POST ──
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabase();

    if (body.action === "create_user") {
      const { email, full_name, phone, role_id, department, position,
        hire_date, birth_date, emergency_contact, emergency_phone,
        address, rfc, curp, nss, bank_name, bank_clabe, notes } = body;

      if (!email || !full_name) return jsonErr("Email y nombre son requeridos", 400);

      // Check duplicate
      const { data: existing } = await supabase
        .from("admin_users")
        .select("id")
        .eq("email", email.toLowerCase())
        .single();

      if (existing) return jsonErr("Ya existe un usuario con ese email", 409);

      const { data, error } = await supabase.from("admin_users").insert({
        email: email.toLowerCase(),
        full_name, phone: phone || "",
        role_id: role_id || null,
        status: "invited",
        department: department || "Administración",
        position: position || "",
        hire_date: hire_date || null,
        birth_date: birth_date || null,
        emergency_contact: emergency_contact || "",
        emergency_phone: emergency_phone || "",
        address: address || "",
        rfc: rfc || "", curp: curp || "", nss: nss || "",
        bank_name: bank_name || "", bank_clabe: bank_clabe || "",
        notes: notes || "",
        created_by: body.created_by || "admin",
      }).select().single();

      if (error) return jsonErr(error.message);

      // Audit
      await supabase.from("admin_audit_log").insert({
        user_email: body.created_by || "admin",
        user_name: "Admin",
        action: "user_created",
        module: "users",
        detail: `Usuario ${full_name} (${email}) creado con status invitado`,
      });

      return jsonOk({ success: true, user: data });
    }

    if (body.action === "create_role") {
      const { name, description, color, scope, permissions } = body;
      if (!name) return jsonErr("Nombre del rol requerido", 400);

      const { data, error } = await supabase.from("admin_roles").insert({
        name,
        description: description || "",
        color: color || "#C5A065",
        scope: scope || "all",
        permissions: permissions || {},
        is_default: false,
      }).select().single();

      if (error) return jsonErr(error.message);
      return jsonOk({ success: true, role: data });
    }

    return jsonErr("Acción no reconocida", 400);
  } catch (err: unknown) {
    return jsonErr(err instanceof Error ? err.message : "Error desconocido");
  }
}

// ── PATCH ──
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabase();

    if (body.action === "update_user") {
      const { user_id, ...updates } = body;
      if (!user_id) return jsonErr("user_id requerido", 400);

      // Remove action from updates
      const { action: _, ...cleanUpdates } = updates;
      const { error } = await supabase
        .from("admin_users")
        .update(cleanUpdates)
        .eq("id", user_id);

      if (error) return jsonErr(error.message);

      // Audit
      const fields = Object.keys(cleanUpdates).filter(k => k !== "user_id").join(", ");
      await supabase.from("admin_audit_log").insert({
        user_email: body.updated_by || "admin",
        user_name: "Admin",
        action: "user_updated",
        module: "users",
        detail: `Usuario ${user_id} actualizado: ${fields}`,
      });

      return jsonOk({ success: true });
    }

    if (body.action === "update_status") {
      const { user_id, status } = body;
      if (!user_id || !status) return jsonErr("user_id y status requeridos", 400);

      const { error } = await supabase
        .from("admin_users")
        .update({ status })
        .eq("id", user_id);

      if (error) return jsonErr(error.message);

      await supabase.from("admin_audit_log").insert({
        user_email: body.updated_by || "admin",
        user_name: "Admin",
        action: "user_status_changed",
        module: "users",
        detail: `Status cambiado a ${status} para usuario ${user_id}`,
      });

      return jsonOk({ success: true });
    }

    if (body.action === "update_role") {
      const { role_id, ...updates } = body;
      if (!role_id) return jsonErr("role_id requerido", 400);
      const { action: _, ...cleanUpdates } = updates;

      const { error } = await supabase
        .from("admin_roles")
        .update(cleanUpdates)
        .eq("id", role_id);

      if (error) return jsonErr(error.message);
      return jsonOk({ success: true });
    }

    return jsonErr("Acción no reconocida", 400);
  } catch (err: unknown) {
    return jsonErr(err instanceof Error ? err.message : "Error desconocido");
  }
}

// ── DELETE ──
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "user";
    if (!id) return jsonErr("id requerido", 400);

    const supabase = getSupabase();

    if (type === "role") {
      // Check if role has users
      const { count } = await supabase
        .from("admin_users")
        .select("id", { count: "exact", head: true })
        .eq("role_id", id);

      if ((count || 0) > 0) return jsonErr("No se puede eliminar un rol con usuarios asignados", 400);

      const { error } = await supabase.from("admin_roles").delete().eq("id", id);
      if (error) return jsonErr(error.message);
      return jsonOk({ success: true });
    }

    const { error } = await supabase.from("admin_users").delete().eq("id", id);
    if (error) return jsonErr(error.message);
    return jsonOk({ success: true });
  } catch (err: unknown) {
    return jsonErr(err instanceof Error ? err.message : "Error desconocido");
  }
}
