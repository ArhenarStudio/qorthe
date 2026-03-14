// GET /api/admin/plans — lista planes con módulos incluidos

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PlanModuleInclude {
  plan_id: string;
  module_id: string;
  // Supabase foreign key join puede devolver objeto, array o null
  platform_modules: unknown;
}

export async function GET(_req: NextRequest) {
  try {
    const { data: plans, error } = await supabase
      .from("platform_plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: includes } = await supabase
      .from("plan_module_includes")
      .select("plan_id, module_id, platform_modules(name, group_name, is_core)");

    const planModules: Record<string, PlanModuleInclude[]> = {};
    for (const inc of (includes ?? []) as unknown as PlanModuleInclude[]) {
      if (!planModules[inc.plan_id]) planModules[inc.plan_id] = [];
      planModules[inc.plan_id].push(inc);
    }

    const enriched = (plans ?? []).map((plan: Record<string, unknown>) => ({
      ...plan,
      modules: planModules[plan.id as string] ?? [],
      module_count: (planModules[plan.id as string] ?? []).length,
    }));

    return NextResponse.json({ plans: enriched });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
