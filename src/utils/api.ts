const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const projectId = supabaseUrl.replace(/^https:\/\/([^.]+)\.supabase\.co.*/, "$1");

export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8a0f5a37`;
