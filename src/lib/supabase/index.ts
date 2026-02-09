export { createClient } from "./client";
export { createClient as createBrowserClient } from "./client";
// Server Components must import directly: import { createClient } from "@/lib/supabase/server"
// Do not re-export server here (uses next/headers, server-only).
