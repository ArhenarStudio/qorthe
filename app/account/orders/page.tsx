import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrdersRouteClient from "./OrdersRouteClient";

export const dynamic = "force-dynamic";

export default async function OrdersRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account/orders");
  }

  return <OrdersRouteClient />;
}
