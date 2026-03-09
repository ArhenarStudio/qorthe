// middleware.ts — Next.js Edge Middleware
// Protects /admin/* and /account/* routes
// Refreshes Supabase session cookies on every request

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Emails con acceso al panel de administración
const ADMIN_EMAILS = [
  "admin@davidsonsdesign.com",
  "designdavidsons@gmail.com",
  "studiorockstage@gmail.com",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute   = pathname.startsWith("/admin");
  const isAccountRoute = pathname.startsWith("/account");

  // Pass through public routes early
  if (!isAdminRoute && !isAccountRoute) {
    return refreshSession(request);
  }

  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Env missing — allow through, layout will handle auth
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  let email: string | null = null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    email = user?.email?.toLowerCase() ?? null;
  } catch (_err) {
    void _err;
  }

  // ── /account/* — require any authenticated user ──────────────
  if (isAccountRoute && !email) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // ── /admin/* — require admin email ───────────────────────────
  if (isAdminRoute) {
    if (!email) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (!ADMIN_EMAILS.includes(email)) {
      // Authenticated but not admin — redirect to home
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

// Refresh session for all routes that need cookies updated
async function refreshSession(request: NextRequest) {
  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.next({ request });

  const response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  try { await supabase.auth.getUser(); } catch (_err) { void _err; }
  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|images/|api/).*)",
  ],
};
