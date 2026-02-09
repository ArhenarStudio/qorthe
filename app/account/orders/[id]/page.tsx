import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderDetailRouteClient from "./OrderDetailRouteClient";

export default async function OrderDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { id } = await params;
    redirect(`/login?redirect=/account/orders/${id}`);
  }

  return <OrderDetailRouteClient />;
}
