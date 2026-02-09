# Changelog – Módulo Auth

## V1 - 2026-02-06 – Supabase Auth

- Integración con Supabase Auth vía `@supabase/ssr` y `@supabase/supabase-js`.
- Cliente browser (`createBrowserClient`) y servidor (`createServerClient`) en `src/lib/supabase/`.
- Middleware de Next.js para refrescar sesión y proteger `/account/*` (redirección a `/login` sin sesión).
- Hook `useAuth`: `user`, `session`, `isLoading`, `isAuthenticated`, `signUp`, `signIn`, `signOut`, `resetPassword`.
- Tipos: `AuthUser`, `AuthSession`, `SignUpData`, `SignInData`.
- `signUp` acepta metadata opcional: `firstName`, `lastName`, `phone`.
