import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WishlistRouteClient from "./WishlistRouteClient";

export const dynamic = "force-dynamic";

export default async function WishlistRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account/wishlist");
  }

  return <WishlistRouteClient />;
}
