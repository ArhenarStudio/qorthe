# DSD V5 – Structure Report

**Fecha:** 2026-02-10  
**Objetivo:** Convención DSD V5 (B): manifest + mapping sin romper build.

---

## 1. Resumen (qué se detectó)

- **Pages:** 30 rutas `app/**/page.tsx` (home, products, product detail, cart, checkout en 3 pasos, login, register, account y subrutas, forgot/update password, about, team, mission-vision, timeline, gallery, faq, blog, appointment, certifications, compare, financing-calculator, terms, privacy, cookies).
- **Módulos:** 17 módulos en `src/modules/` (app-state, auth, cart, chat-widget, checkout, content-pages, customer-account, financing-calculator, footer, header, landing, newsletter, product, product-comparison, product-reviews, settings, whatsapp-button).
- **Widgets globales:** `GlobalWidgets.tsx` agrupa WhatsAppButton, ChatWidget, SettingsModule, ScrollToTop, CookieConsent; CartDrawer y Newsletter se usan desde landing/header/footer.
- **Protegidos:** auth, cart, checkout (módulos + componentes), `src/lib/shopify`, `src/lib/supabase` (sin tocar).
- **Callers actualizados:** Rutas en `app/` que pasan props a módulos (Content Only V5): page.tsx raíz, ProductsCatalogClient, CartPageRouteClient, LoginRouteClient, RegisterRouteClient, checkout/page, checkout/payment/page, checkout/confirmation/page, AccountPageClient, OrdersRouteClient, AddressesRouteClient, OrderDetailRouteClient, WishlistRouteClient.
- **Layout:** Header/Footer no están en `app/layout.tsx`; se usan en `app/products/layout.tsx`, `app/products/[handle]/ProductDetailLayout.tsx`, y en páginas legales (terms, privacy, cookies) de forma explícita.

---

## 2. Lista de rutas (pages)

| Ruta app/ |
|-----------|
| app/page.tsx |
| app/products/page.tsx |
| app/products/[handle]/page.tsx |
| app/cart/page.tsx |
| app/checkout/page.tsx |
| app/checkout/payment/page.tsx |
| app/checkout/confirmation/page.tsx |
| app/login/page.tsx |
| app/register/page.tsx |
| app/account/page.tsx |
| app/account/orders/page.tsx |
| app/account/orders/[id]/page.tsx |
| app/account/wishlist/page.tsx |
| app/account/addresses/page.tsx |
| app/forgot-password/page.tsx |
| app/update-password/page.tsx |
| app/about/page.tsx |
| app/team/page.tsx |
| app/mission-vision/page.tsx |
| app/timeline/page.tsx |
| app/gallery/page.tsx |
| app/faq/page.tsx |
| app/blog/page.tsx |
| app/appointment/page.tsx |
| app/certifications/page.tsx |
| app/compare/page.tsx |
| app/financing-calculator/page.tsx |
| app/terms/page.tsx |
| app/privacy/page.tsx |
| app/cookies/page.tsx |

---

## 3. Lista de módulos (src/modules)

| Módulo |
|--------|
| src/modules/app-state |
| src/modules/auth |
| src/modules/cart |
| src/modules/chat-widget |
| src/modules/checkout |
| src/modules/content-pages |
| src/modules/customer-account |
| src/modules/financing-calculator |
| src/modules/footer |
| src/modules/header |
| src/modules/landing |
| src/modules/newsletter |
| src/modules/product |
| src/modules/product-comparison |
| src/modules/product-reviews |
| src/modules/settings |
| src/modules/whatsapp-button |

---

## 4. Lista de widgets (GlobalWidgets y flotantes)

| Widget | Ubicación |
|--------|-----------|
| GlobalWidgets (contenedor) | app/components/GlobalWidgets.tsx |
| WhatsAppButton | src/modules/whatsapp-button/components/WhatsAppButton.tsx |
| ChatWidget | src/modules/chat-widget/components/ChatWidget.tsx |
| SettingsModule | src/modules/settings/components/SettingsModule.tsx |
| ScrollToTop | src/components/shared/ScrollToTop.tsx |
| CookieConsent | src/components/shared/CookieConsent.tsx |
| CartDrawer | src/modules/cart/components/CartDrawer.tsx (usado desde layout/header/landing) |
| Newsletter | src/modules/newsletter/components/Newsletter.tsx (usado en footer/landing) |

---

## 5. Lista de protegidos (auth / cart / checkout / shopify / supabase)

- **Auth:** `src/modules/auth`, `useAuth.ts`, `auth.config.ts`
- **Cart:** `src/modules/cart`, `useCart.ts`, `CartPage.tsx`, `CartDrawer.tsx`
- **Checkout:** `src/modules/checkout`, `CheckoutPage.tsx`, `PaymentPage.tsx`, `OrderConfirmationPage.tsx`
- **Shopify:** `src/lib/shopify` (client.ts, cart.ts, customer.ts, queries.ts, types.ts, index.ts)
- **Supabase:** `src/lib/supabase` (client.ts, server.ts, middleware.ts, index.ts)

---

## 6. Riesgos

- **OrderConfirmation con mocks:** La página de confirmación (`app/checkout/confirmation/page.tsx`) usa `orderId` de query + datos mock (mockItems, mockShippingAddress, userEmail fijo). No consume pedidos reales de Shopify. Para producción habría que alimentar desde Shopify (post-checkout redirect o API).
- **Payment CTA:** El paso `/checkout/payment` ya redirige a `checkoutUrl` de Shopify; la UI de PaymentPage (formulario de pago) es solo visual, el pago real ocurre en Shopify.
- **Header/Footer no globales:** El layout raíz no incluye Header/Footer. Productos y legal los montan en sus layouts/páginas. Cualquier nueva ruta que deba mostrar Header/Footer debe incluirlos explícitamente o mediante un layout compartido.

---

## 7. Próximo paso recomendado

1. **Opcional – Layout con Header/Footer:** Si se quiere Header/Footer en todas las páginas excepto las ya “content only”, valorar un layout grupal (ej. `(main)/layout.tsx`) que envuelva rutas y monte Header + children + Footer, y dejar fuera solo las que deban ser full-screen (ej. checkout externo).
2. **OrderConfirmation:** Definir si la confirmación post-Shopify se hará por redirect URL de Shopify con order token y luego consultar order por API, o por otra vía; sustituir mocks por datos reales.
3. **Naming físico (si aplica V5 B):** Si en una fase posterior se renombran archivos según PAGE__/MODULE__/WIDGET__, usar `v5-mapping.md` como referencia y actualizar imports en un solo paso.

---

## 8. Validación tsc

Se ejecutó `npx tsc --noEmit` el 2026-02-10. **Resultado: OK** (exit 0, sin errores ni warnings de TypeScript).
