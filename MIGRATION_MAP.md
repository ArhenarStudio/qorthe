# 🗺️ MIGRATION MAP — Figma V4 → Next.js Production

> Este archivo es leído por Cursor automáticamente al ejecutar migraciones.
> NO borrar. Se actualiza con cada versión de Figma.
> Última versión: V4 (Febrero 2026)

---

## FUENTES

| Tipo | Ruta | Formato |
|---|---|---|
| Figma originales (Vite) | `~/Documents/DavidSons Design - Figma/DSD V4/src/app/` | Vite + React Router + Props |
| Figma convertidos (Next.js) | `~/Documents/DavidSons Design - Figma/DSD V4/exports/` | Next.js + useAppState |
| Producción | `~/Documents/davidsons-design/` | Next.js + Shopify + Supabase |

---

## REGLA DE PRIORIDAD DE FUENTE

1. Si existe en `/exports/` (convertido a Next.js) → **usar ese archivo directamente**
2. Si NO existe en `/exports/` pero sí en `/src/app/components/` → **convertir de Vite a Next.js**
3. Si ya existe en producción con integraciones reales → **solo actualizar diseño/UI, NO lógica**

---

## CONVERSIONES REQUERIDAS (Vite → Next.js)

Cuando se usa un archivo de Figma original (Vite), aplicar estas transformaciones:

| Vite (Figma) | Next.js (Producción) |
|---|---|
| Sin directiva | Agregar `"use client"` al inicio |
| `import { useNavigate } from 'react-router'` | `import { useRouter } from 'next/navigation'` |
| `navigate('/path')` | `router.push('/path')` |
| `<a href="/path">` para rutas internas | `<Link href="/path">` de `next/link` |
| `language: 'es' \| 'en'` como prop | `const { language } = useAppState()` |
| `isDarkMode: boolean` como prop | `const { isDarkMode } = useAppState()` |
| `onToggleDarkMode: () => void` como prop | `const { toggleDarkMode } = useAppState()` |
| `onToggleLanguage: () => void` como prop | `const { toggleLanguage } = useAppState()` |
| `onNavigateXxx: () => void` como prop | `<Link href="/xxx">` o `router.push('/xxx')` |
| `import { Footer } from './Footer'` | NO importar Footer (viene de layout global) |
| `import { motion } from 'motion/react'` | Verificar si `motion` está en package.json |
| Props de `isAuthenticated`, `userName` | `const { isAuthenticated, user } = useAuth()` |
| Props de `cartItemsCount` | `const { cart } = useCart()` |

---

## MAPA COMPLETO: FIGMA → PRODUCCIÓN

### 🟢 USAR DIRECTAMENTE (ya convertido en /exports/)

| Archivo Export | Destino Producción | Acción |
|---|---|---|
| `exports/Header.tsx` | `src/modules/header/components/Header.tsx` | **REEMPLAZAR** — tiene 6 secciones menú |
| `exports/DSD-V4/src/modules/footer/components/Footer.tsx` | `src/modules/footer/components/Footer.tsx` | **REEMPLAZAR** — diseño V4 |
| `exports/DSD-V4/src/modules/newsletter/components/Newsletter.tsx` | `src/modules/newsletter/components/Newsletter.tsx` | **REEMPLAZAR** |
| `exports/DSD-V4/src/modules/whatsapp-button/components/WhatsAppButton.tsx` | `src/modules/whatsapp-button/components/WhatsAppButton.tsx` | **REEMPLAZAR** |

### 🟡 CONVERTIR DE VITE (solo actualizar diseño, preservar lógica existente)

| Archivo Figma V4 | Destino Producción | Protegido | Acción |
|---|---|---|---|
| `components/LandingPage.tsx` | `src/modules/landing/components/LandingPage.tsx` | NO | Convertir + reemplazar |
| `components/AboutUs.tsx` | `src/modules/content-pages/components/AboutUs.tsx` | NO | Convertir + reemplazar |
| `components/MissionVision.tsx` | `src/modules/content-pages/components/MissionVision.tsx` | NO | Convertir + reemplazar |
| `components/BlogPage.tsx` | `src/modules/content-pages/components/BlogPage.tsx` | NO | Convertir + reemplazar |
| `components/FAQPage.tsx` | `src/modules/content-pages/components/FAQPage.tsx` | NO | Convertir + reemplazar |
| `components/AppointmentPage.tsx` | `src/modules/content-pages/components/AppointmentPage.tsx` | NO | Convertir + reemplazar |
| `components/ProjectGalleryPage.tsx` | `src/modules/content-pages/components/ProjectGalleryPage.tsx` | NO | Convertir + reemplazar |
| `pages/Team.tsx` | `src/modules/content-pages/components/Team.tsx` | NO | Convertir + reemplazar |
| `pages/Timeline.tsx` | `src/modules/content-pages/components/Timeline.tsx` | NO | Convertir + reemplazar |
| `pages/Certifications.tsx` | `src/modules/content-pages/components/Certifications.tsx` | NO | Convertir + reemplazar |
| `components/ChatWidget.tsx` | `src/modules/chat-widget/components/ChatWidget.tsx` | NO | Convertir + reemplazar |
| `modules/settings/SettingsModule.tsx` | `src/modules/settings/components/SettingsModule.tsx` | NO | Convertir + reemplazar |
| `modules/financing-calculator/FinancingCalculator.tsx` | `src/modules/financing-calculator/components/FinancingCalculator.tsx` | NO | Convertir + reemplazar |
| `modules/product-comparison/ProductComparison.tsx` | `src/modules/product-comparison/components/ProductComparison.tsx` | NO | Convertir + reemplazar |
| `modules/product-reviews/ProductReviews.tsx` | `src/modules/product-reviews/components/ProductReviews.tsx` | NO | Convertir + reemplazar |
| `components/FinancingCalculatorPage.tsx` | `app/financing-calculator/page.tsx` | NO | Convertir a page wrapper |
| `components/ProductComparisonPage.tsx` | `app/compare/page.tsx` | NO | Convertir to page wrapper |

### 🔴 PROTEGIDOS — SOLO DISEÑO, NO LÓGICA

| Archivo Figma V4 | Destino Producción | Qué tomar | Qué preservar |
|---|---|---|---|
| `components/CartDrawer.tsx` | `src/modules/cart/components/CartDrawer.tsx` | CSS, layout, colores | useCart hook, Shopify API |
| `components/CartPage.tsx` | `src/modules/cart/components/CartPage.tsx` | CSS, layout | useCart, checkout redirect |
| `components/CheckoutPage.tsx` | `src/modules/checkout/components/CheckoutPage.tsx` | CSS, layout | Shopify Checkout flow |
| `components/PaymentPage.tsx` | `src/modules/checkout/components/PaymentPage.tsx` | CSS, layout | Shopify payment |
| `components/OrderConfirmationPage.tsx` | `src/modules/checkout/components/OrderConfirmationPage.tsx` | CSS, layout | Order data flow |
| `components/LoginPage.tsx` | `src/modules/customer-account/components/LoginPage.tsx` | CSS, layout | Supabase signIn |
| `components/RegisterPage.tsx` | `src/modules/customer-account/components/RegisterPage.tsx` | CSS, layout | Supabase signUp |
| `components/AccountDashboard.tsx` | `src/modules/customer-account/components/AccountDashboard.tsx` | CSS, layout | useAuth, user data |
| `components/OrdersPage.tsx` | `src/modules/customer-account/components/OrdersPage.tsx` | CSS, layout | Order fetch |
| `components/OrderDetailPage.tsx` | `src/modules/customer-account/components/OrderDetailPage.tsx` | CSS, layout | Order detail fetch |
| `components/AddressesPage.tsx` | `src/modules/customer-account/components/AddressesPage.tsx` | CSS, layout | Address CRUD |
| `components/AddressModal.tsx` | `src/modules/customer-account/components/AddressModal.tsx` | CSS, layout | Form logic |
| `components/WishlistPage.tsx` | `src/modules/customer-account/components/WishlistPage.tsx` | CSS, layout | Wishlist data |
| `components/ProductCatalog.tsx` | `src/modules/product/components/ProductCatalog.tsx` | CSS, layout | Shopify query |
| `components/ProductDetail.tsx` | `src/modules/product/components/ProductDetail.tsx` | CSS, layout | Shopify metafields |
| `components/ProductSearch.tsx` | `src/modules/product/components/ProductSearch.tsx` | CSS, layout | Search logic |
| `components/ProductReviews.tsx` | `src/modules/product-reviews/components/ProductReviews.tsx` | CSS, layout | Review data |

### ⚫ NO MIGRAR (mock data / ya existen con datos reales)

| Archivo Figma V4 | Razón |
|---|---|
| `data/products.ts` | Productos vienen de Shopify |
| `hooks/useCart.ts` | Conectado a Shopify Cart API |
| `hooks/useWishlist.ts` | Conectado a Supabase |
| `App.tsx` | No aplica (Next.js usa layout.tsx) |
| `main.tsx` | No aplica (Next.js entry point) |
| `pages/NotFound.tsx` | Ya existe configurado para Vercel |

### 🔵 NUEVOS (no existen en producción — crear)

| Archivo Figma V4 | Destino Producción | Tipo |
|---|---|---|
| `components/AnimatedSection.tsx` | `src/components/shared/AnimatedSection.tsx` | Shared component |
| `components/Breadcrumbs.tsx` | `src/components/shared/Breadcrumbs.tsx` | Shared component |
| `components/ConfirmModal.tsx` | `src/components/shared/ConfirmModal.tsx` | Shared component |
| `components/CookieConsent.tsx` | `src/components/shared/CookieConsent.tsx` | Ya existe, actualizar diseño |
| `components/CookiePolicy.tsx` | `src/modules/legal/components/CookiePolicy.tsx` | Legal page |
| `components/ErrorBoundary.tsx` | `src/components/shared/ErrorBoundary.tsx` | Shared component |
| `components/LoadingScreen.tsx` | `src/components/shared/LoadingScreen.tsx` | Ya existe, actualizar diseño |
| `components/MetaTags.tsx` | `src/components/shared/MetaTags.tsx` | Ya existe, actualizar |
| `components/PrivacyPolicy.tsx` | `src/modules/legal/components/PrivacyPolicy.tsx` | Legal page |
| `components/ScrollToTop.tsx` | `src/components/shared/ScrollToTop.tsx` | Ya existe, actualizar diseño |
| `components/SkeletonLoader.tsx` | `src/components/shared/SkeletonLoader.tsx` | Ya existe, actualizar diseño |
| `components/TermsAndConditions.tsx` | `src/modules/legal/components/TermsAndConditions.tsx` | Legal page |
| `components/Toast.tsx` | `src/components/shared/Toast.tsx` | Shared component |
| `components/ToastContainer.tsx` | `src/components/shared/ToastContainer.tsx` | Shared component |

### 🟣 UI COMPONENTS (shadcn — solo agregar faltantes)

Comparar `DSD V4/src/app/components/ui/` vs `producción/src/components/ui/`
Solo copiar los que NO existan en producción. NUNCA reemplazar existentes.

Nuevos en V4 que podrían faltar:
- `chart.tsx`, `pagination.tsx`, `sidebar.tsx`, `use-mobile.ts`, `utils.ts`

---

## ESTILOS

| Archivo V4 | Destino | Acción |
|---|---|---|
| `styles/theme.css` | `app/globals.css` | Merge variables CSS faltantes (input-background, switch-background, chart colors) |
| `styles/fonts.css` | Ya configurado en layout.tsx | Verificar ITC Avant Garde |

---

## VERIFICACIÓN POST-MIGRACIÓN

```bash
# 1. TypeScript
npx tsc --noEmit

# 2. Verificar todas las rutas
# Cada page.tsx en app/ debe existir y compilar

# 3. Verificar integraciones protegidas
grep -r "useCart" src/modules/cart/  # Debe seguir usando Shopify
grep -r "useAuth" src/modules/auth/  # Debe seguir usando Supabase
grep -r "createClient" src/lib/      # No debe haber cambiado

# 4. Verificar state global
grep -r "useAppState" src/modules/header/  # Header debe usar contexto
grep -r "useAppState" src/modules/footer/  # Footer debe usar contexto

# 5. Build test
npm run build
```
