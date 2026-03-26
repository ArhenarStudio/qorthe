// ═══════════════════════════════════════════════════════════════
// Shared helper: authenticate as Medusa admin
//
// Gets a JWT token from Medusa admin auth endpoint.
// Used by admin proxy API routes.
// ═══════════════════════════════════════════════════════════════

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "";
const ADMIN_EMAIL = "admin@qorthe.com";
const ADMIN_PASSWORD = "Admin123!";

let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getMedusaAdminToken(): Promise<string> {
  // Return cached token if still valid (with 5min buffer)
  if (cachedToken && Date.now() < tokenExpiry - 5 * 60 * 1000) {
    return cachedToken;
  }

  const resp = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!resp.ok) {
    throw new Error(`Medusa admin auth failed: ${resp.status}`);
  }

  const { token } = await resp.json();
  cachedToken = token;
  // JWT typically expires in 24h, cache for 23h
  tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;

  return token;
}

export async function medusaAdminFetch(path: string, options?: RequestInit) {
  const token = await getMedusaAdminToken();

  return fetch(`${MEDUSA_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
}
