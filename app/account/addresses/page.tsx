import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddressesRouteClient from "./AddressesRouteClient";

export const dynamic = "force-dynamic";

export default async function AddressesRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account/addresses");
  }

  return <AddressesRouteClient />;
}
