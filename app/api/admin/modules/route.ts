// GET /api/admin/modules — lista módulos con estado por tenant
// GET /api/admin/modules?plan=pro — lista módulos de un plan específico
// PATCH /api/admin/modules — activar/desactivar módulo para tenant

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TENANT_ID = "tenant_0"; // DSD — hardcode por ahora, multi-tenant después

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const planFilter = searchParams.get("plan");

    const { data: modules, error: modErr } = await supabase
      .from("platform_modules")
      .select("*")
      .order("sort_order");

    if (modErr) return NextResponse.json({ error: modErr.message }, { status: 500 });

    const { data: sub } = await supabase
      .from("tenant_subscriptions")
      .select("*, platform_plans(*)")
      .eq("tenant_id", TENANT_ID)
      .single();

    const { data: planIncludes } = await supabase
      .from("plan_module_includes")
      .select("module_id")
      .eq("plan_id", (sub as { plan_id?: string } | null)?.plan_id ?? "free");

    const includedIds = new Set(
      (planIncludes ?? []).map((p: { module_id: string }) => p.module_id)
    );
    const addonIds = new Set(
      ((sub as { addon_modules?: string[] } | null)?.addon_modules ?? [])
    );
    const disabledIds = new Set(
      ((sub as { disabled_modules?: string[] } | null)?.disabled_modules ?? [])
    );

    if (planFilter) {
      const { data: filterIncludes } = await supabase
        .from("plan_module_includes")
        .select("module_id")
        .eq("plan_id", planFilter);
      const filterIds = new Set(
        (filterIncludes ?? []).map((p: { module_id: string }) => p.module_id)
      );

      const filtered = (modules ?? []).map((m: Record<string, unknown>) => ({
        ...m,
        included_in_plan: filterIds.has(m.id as string),
      }));

      return NextResponse.json({ modules: filtered, plan: planFilter });
    }

    const enriched = (modules ?? []).map((m: Record<string, unknown>) => {
      const includedInPlan = includedIds.has(m.id as string);
      const isAddon = addonIds.has(m.id as string);
      const isDisabled = disabledIds.has(m.id as string);
      const isActive =
        (includedInPlan || isAddon) && !isDisabled && m.status === "active";

      return {
        ...m,
        included_in_plan: includedInPlan,
        is_addon: isAddon,
        is_disabled: isDisabled,
        is_active: isActive,
      };
    });

    return NextResponse.json({
      modules: enriched,
      subscription: sub,
      plan: (sub as Record<string, unknown> | null)?.platform_plans,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      module_id?: string;
      action?: "enable" | "disable" | "add_addon" | "remove_addon";
    };
    const { module_id, action } = body;

    if (!module_id || !action) {
      return NextResponse.json(
        { error: "module_id and action required" },
        { status: 400 }
      );
    }

    const { data: sub } = await supabase
      .from("tenant_subscriptions")
      .select("*")
      .eq("tenant_id", TENANT_ID)
      .single();

    if (!sub) return NextResponse.json({ error: "No subscription found" }, { status: 404 });

    const typedSub = sub as {
      disabled_modules: string[];
      addon_modules: string[];
    };

    let disabled = [...(typedSub.disabled_modules ?? [])];
    let addons = [...(typedSub.addon_modules ?? [])];

    switch (action) {
      case "enable":
        disabled = disabled.filter((id) => id !== module_id);
        break;
      case "disable":
        if (!disabled.includes(module_id)) disabled.push(module_id);
        break;
      case "add_addon":
        if (!addons.includes(module_id)) addons.push(module_id);
        break;
      case "remove_addon":
        addons = addons.filter((id) => id !== module_id);
        break;
    }

    const { data, error } = await supabase
      .from("tenant_subscriptions")
      .update({ disabled_modules: disabled, addon_modules: addons })
      .eq("tenant_id", TENANT_ID)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ subscription: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
