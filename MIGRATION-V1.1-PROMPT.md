# DSD V1.1 → Next.js — Migración completa

## CONTEXTO
Estamos migrando DSD V1.1 de Figma Make (Vite + React Router) a Next.js 16.
La fundación ya está creada: layouts, contexts, globals.css, providers, rutas en app/.
Tu trabajo es copiar y convertir TODOS los componentes.

## FUENTE
```
~/Documents/DavidSons Design - Figma/DSD V1.1/src/
```

## DESTINO
```
~/Documents/davidsons-design/
```

## REGLAS DE CONVERSIÓN (APLICAR A CADA ARCHIVO)

1. **"use client"** — Agregar al inicio si el componente usa hooks, state, events, o browser APIs
2. **react-router → next/navigation:**
   - `import { useNavigate } from 'react-router'` → `import { useRouter } from 'next/navigation'`
   - `const navigate = useNavigate()` → `const router = useRouter()`
   - `navigate('/path')` → `router.push('/path')`
   - `import { useLocation } from 'react-router'` → `import { usePathname } from 'next/navigation'`
   - `const location = useLocation()` → `const pathname = usePathname()`
   - `location.pathname` → `pathname`
   - `import { Link } from 'react-router'` → `import Link from 'next/link'`
3. **figma:asset → /images/:**
   - `import xxx from 'figma:asset/HASH.png'` → Copiar el asset de DSD V1.1/src/assets/ a public/images/ con nombre descriptivo, cambiar import a `const xxx = '/images/nombre.png'`
4. **Imports relativos → aliases @/:**
   - `from '../components/...'` → `from '@/components/...'`
   - `from '../context/ThemeContext'` → `from '@/contexts/ThemeContext'`
   - `from '../context/FeatureToggleContext'` → `from '@/contexts/FeatureToggleContext'`
   - `from '../data/...'` → `from '@/data/...'`
   - `from '../utils/...'` → `from '@/utils/...'`
   - `from '../types/...'` → `from '@/types/...'`
5. **NO cambiar** lógica, diseño, estilos, o estructura del componente — solo las conversiones arriba

## MAPEO DE ARCHIVOS — EJECUTAR EN ESTE ORDEN

### PASO 1: Assets
Copiar todos los archivos de:
`~/Documents/DavidSons Design - Figma/DSD V1.1/src/assets/`
a:
`~/Documents/davidsons-design/public/images/`
Renombrar cada archivo hash a un nombre descriptivo (ej: `02a0220e...png` → `logo-dsd.png`). Abrir los componentes que los importan para entender qué es cada imagen.

### PASO 2: Data, Types, Utils
Copiar y convertir:
- `DSD V1.1/src/app/data/mockData.ts` → `src/data/mockData.ts`
- `DSD V1.1/src/app/data/products.ts` → `src/data/products.ts`
- `DSD V1.1/src/app/data/locations.ts` → `src/data/locations.ts`
- `DSD V1.1/src/app/config/loyalty.ts` → `src/data/loyalty.ts`
- `DSD V1.1/src/types/review.ts` → `src/types/review.ts`
- `DSD V1.1/src/utils/api.ts` → `src/utils/api.ts`
- `DSD V1.1/src/utils/image.ts` → `src/utils/image.ts`
- `DSD V1.1/src/app/utils/cartActions.tsx` → `src/utils/cartActions.tsx`

### PASO 3: UI Components (shadcn)
Copiar TODOS los archivos de:
`DSD V1.1/src/app/components/ui/`
a:
`src/components/ui/`
Estos generalmente no necesitan conversión — solo verificar imports.

### PASO 4: Layout Components
Copiar y convertir:
- `DSD V1.1/src/app/components/layout/GlobalHeader.tsx` → `src/components/layout/GlobalHeader.tsx`
- `DSD V1.1/src/app/components/layout/GlobalFooter.tsx` → `src/components/layout/GlobalFooter.tsx`
- `DSD V1.1/src/app/components/layout/DesktopMenu.tsx` → `src/components/layout/DesktopMenu.tsx`
- `DSD V1.1/src/app/components/layout/NavigationOverlay.tsx` → `src/components/layout/NavigationOverlay.tsx`
- `DSD V1.1/src/app/components/layout/CheckoutHeader.tsx` → `src/components/layout/CheckoutHeader.tsx`
- `DSD V1.1/src/app/components/layout/CheckoutFooter.tsx` → `src/components/layout/CheckoutFooter.tsx`
- `DSD V1.1/src/app/components/layout/LegalLayout.tsx` → `src/components/layout/LegalLayout.tsx`

### PASO 5: Feature Components
Copiar y convertir TODOS de `DSD V1.1/src/app/components/features/` a `src/components/features/`

### PASO 6: Auth, Cart, Search, Shop, Reviews, Newsletter, Figma, Pages
Copiar y convertir:
- `DSD V1.1/src/app/components/auth/` → `src/components/auth/`
- `DSD V1.1/src/app/components/cart/` → `src/components/cart/`
- `DSD V1.1/src/app/components/search/` → `src/components/search/`
- `DSD V1.1/src/app/components/shop/` → `src/components/shop/`
- `DSD V1.1/src/app/components/reviews/` → `src/components/reviews/`
- `DSD V1.1/src/app/components/newsletter/` → `src/components/newsletter/`
- `DSD V1.1/src/app/components/figma/` → `src/components/figma/`
- `DSD V1.1/src/app/components/pages/` → `src/components/pages/`

### PASO 7: Account Components (29 archivos)
Copiar y convertir TODOS de `DSD V1.1/src/app/components/account/` a `src/components/account/`
Incluye billing/ subdirectory.

### PASO 8: Quote Components (10 archivos + types)
Copiar y convertir TODOS de `DSD V1.1/src/app/components/quote/` a `src/components/quote/`

### PASO 9: Page wrappers en app/
Para CADA página, crear el wrapper en app/ que importa el componente.
Mapeo de rutas:

| Ruta App | Componente Page | Import |
|---|---|---|
| `app/(main)/page.tsx` | Home | `@/components/pages/Home` — NOTA: Home.tsx está en `DSD V1.1/src/app/pages/Home.tsx`, copiarlo a `src/components/pages/Home.tsx` |
| `app/(main)/shop/page.tsx` | ShopPage | `@/components/pages/ShopPage` |
| `app/(main)/shop/[id]/page.tsx` | ProductDetailPage | `@/components/pages/ProductDetailPage` |
| `app/(main)/cart/page.tsx` | CartPage | `@/components/pages/CartPage` |
| `app/(main)/account/page.tsx` | AccountPage | `@/components/pages/AccountPage` |
| `app/(main)/admin/page.tsx` | AdminDashboard | `@/components/pages/AdminDashboard` |
| `app/(main)/auth/page.tsx` | AuthPage | `@/components/pages/AuthPage` |
| `app/(main)/loyalty/page.tsx` | LoyaltyPage | `@/components/pages/LoyaltyPage` |
| `app/(main)/quote/page.tsx` | QuotePage | `@/components/pages/QuotePage` |
| `app/(main)/search/page.tsx` | SearchResultsPage | `@/components/pages/SearchResultsPage` |
| `app/(main)/about/page.tsx` | AboutPage | `@/components/pages/AboutPage` |
| `app/(main)/philosophy/page.tsx` | PhilosophyPage | `@/components/pages/PhilosophyPage` |
| `app/(main)/faq/page.tsx` | FaqPage | `@/components/pages/FaqPage` |
| `app/(main)/contact/page.tsx` | ContactPage | `@/components/pages/ContactPage` |
| `app/(main)/legal-notice/page.tsx` | LegalNoticePage | `@/components/pages/LegalNoticePage` |
| `app/(main)/terms/page.tsx` | TermsPage | `@/components/pages/TermsPage` |
| `app/(main)/sales-conditions/page.tsx` | SalesConditionsPage | `@/components/pages/SalesConditionsPage` |
| `app/(main)/shipping-policy/page.tsx` | ShippingPolicyPage | `@/components/pages/ShippingPolicyPage` |
| `app/(main)/returns-policy/page.tsx` | ReturnsPolicyPage | `@/components/pages/ReturnsPolicyPage` |
| `app/(main)/warranty-policy/page.tsx` | WarrantyPolicyPage | `@/components/pages/WarrantyPolicyPage` |
| `app/(main)/privacy-policy/page.tsx` | PrivacyPolicyPage | `@/components/pages/PrivacyPolicyPage` |
| `app/(main)/cookies-policy/page.tsx` | CookiesPolicyPage | `@/components/pages/CookiesPolicyPage` |
| `app/(main)/intellectual-property/page.tsx` | IntellectualPropertyPage | `@/components/pages/IntellectualPropertyPage` |
| `app/(main)/dispute-resolution/page.tsx` | DisputeResolutionPage | `@/components/pages/DisputeResolutionPage` |
| `app/(checkout)/checkout/page.tsx` | CheckoutPage | `@/components/pages/CheckoutPage` |
| `app/(checkout)/checkout/success/page.tsx` | CheckoutSuccessPage | `@/components/pages/CheckoutSuccessPage` |

Todas las page files en `DSD V1.1/src/app/pages/` deben copiarse a `src/components/pages/` con las conversiones aplicadas.

Cada wrapper en app/ tiene este formato:
```tsx
import { ComponentName } from "@/components/pages/ComponentName";

export default function Page() {
  return <ComponentName />;
}
```

### PASO 10: Supabase utility
Copiar `DSD V1.1/src/app/utils/supabaseClient.ts` a `src/utils/supabaseClient.ts`.
NOTA: Si este archivo configura un cliente Supabase, verificar que no duplique lo que ya existe en `src/lib/supabase/client.ts`. Si es redundante, NO copiarlo y actualizar los imports de componentes que lo usen para apuntar a `@/lib/supabase`.

### PASO 11: Validación
```bash
cd ~/Documents/davidsons-design
npx tsc --noEmit
```
Corregir TODOS los errores antes de continuar.

### PASO 12: Commit
```bash
cd ~/Documents/davidsons-design
git add -A
git commit -m "feat: DSD V1.1 complete migration from Figma — fresh start

- 95+ components migrated from Vite/React Router to Next.js 16
- New design system with Tailwind v4 CSS @theme tokens
- Separated contexts: ThemeContext + FeatureToggleContext
- Route groups: (main) with Header/Footer, (checkout) standalone
- Account module: 29 components including billing, subscriptions, wallet
- Quote builder: 10 components with engraving configurator
- Commerce abstraction layer preserved (Shopify active, Medusa ready)
- All legal pages, content pages, and admin dashboard"
git push
```
