import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountPageClient } from "./AccountPageClient";

export default async function AccountRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  return <AccountPageClient />;
}
