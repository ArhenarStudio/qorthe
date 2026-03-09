// proxy.ts — Next.js 16 Edge Proxy (reemplaza middleware.ts)
// Refresca sesión Supabase + protege /admin/* y /account/*

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Emails con acceso al panel de administración
const ADMIN_EMAILS = [
  "admin@davidsonsdesign.com",
  "designdavidsons@gmail.com",
  "studiorockstage@gmail.com",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute   = pathname.startsWith("/admin");
  const isAccountRoute = pathname.startsWith("/account");

  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
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

  // Refrescar sesión siempre
  let email: string | null = null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    email = user?.email?.toLowerCase() ?? null;
  } catch (_err) {
    void _err;
  }

  // Proteger /account/* — requiere usuario autenticado
  if (isAccountRoute && !email) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Proteger /admin/* — requiere email de admin
  if (isAdminRoute) {
    if (!email) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (!ADMIN_EMAILS.includes(email)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
