# Changelog – Módulo Customer Account

## V1 - 2026-02-09 – Backup y rutas en app

Backups de los 8 componentes en `versions/*.v1.tsx`. Componentes activos en `components/`. Rutas de la app que importan desde `@/modules/customer-account`.

### Componentes

| Componente | Ruta app | Descripción |
|------------|----------|-------------|
| **LoginPage** | `app/login/page.tsx` | Inicio de sesión; enlace "¿No tienes cuenta?" → /register; login exitoso → /account. |
| **RegisterPage** | `app/register/page.tsx` | Registro; enlace "¿Ya tienes cuenta?" → /login. |
| **AccountDashboard** | `app/account/page.tsx` | Panel de cuenta; enlaces a /account/orders, /account/addresses, /account/wishlist. |
| **AddressModal** | — | Modal usado dentro de AddressesPage; sin ruta propia. |
| **AddressesPage** | `app/account/addresses/page.tsx` | Lista y gestión de direcciones. |
| **OrdersPage** | `app/account/orders/page.tsx` | Lista de pedidos; enlace a detalle por id. |
| **OrderDetailPage** | `app/account/orders/[id]/page.tsx` | Detalle de un pedido; vuelve a /account/orders. |
| **WishlistPage** | `app/account/wishlist/page.tsx` | Lista de favoritos. |

### Navegación conectada

- Login: "¿No tienes cuenta?" → `/register` (onNavigateRegister).
- Register: "¿Ya tienes cuenta?" → `/login` (onNavigateLogin).
- Login exitoso: `onLogin` en wrapper redirige a `/account`.
- AccountDashboard: links a `/account/orders`, `/account/addresses`, `/account/wishlist`.
- Header: icono de cuenta sigue apuntando a `/account` (o `/login` según implementación en cada página).

### Diff Figma V1 → V2

Según `src/figma-versions/migration-logs/diff-V1-vs-V2-2026-02-09.md`, **LoginPage**, **RegisterPage**, **AccountDashboard**, **AddressesPage**, **AddressModal**, **OrdersPage**, **OrderDetailPage** y **WishlistPage** figuran como **sin cambios** entre DSD V1 y DSD V2. No se aplicaron cambios de Figma.

---

## V2 - 2026-02-06 – Supabase Auth

- **LoginPage:** Conectado a `useAuth()`. Formulario llama a `signIn(email, password)`; redirección a `?redirect=` o `/account`; "¿Olvidaste tu contraseña?" llama a `resetPassword(email)` y muestra confirmación; mensaje tras actualizar contraseña (`?message=password_updated`). Backups: `LoginPage.v2.tsx`.
- **RegisterPage:** Conectado a `useAuth()`. Formulario con nombre, apellido, email, teléfono (opcional), contraseña y confirmar; `signUp(email, password, { firstName, lastName, phone })`; validaciones client-side (email, contraseña ≥8, coincidencia, nombre/apellido requeridos); tras éxito se muestra mensaje de email de confirmación. Backups: `RegisterPage.v2.tsx`.
- Rutas **app/login** y **app/register** sin mocks; auth manejada dentro de los componentes.
- Nuevas rutas: **app/forgot-password** (formulario email + `resetPassword`) y **app/update-password** (`supabase.auth.updateUser({ password })` → redirección a `/login?message=password_updated`).
