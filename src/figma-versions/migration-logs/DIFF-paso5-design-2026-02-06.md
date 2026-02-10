# Diff Paso 5 — Modificaciones de Diseño (pre-aplicación)

**Fecha:** 2026-02-06  
**Reglas:** Solo CSS/JSX/layout. NO imports, hooks, useAuth, useCart, integraciones Shopify/Supabase.

---

## Backups creados

| Archivo | Backup |
|---------|--------|
| Footer.tsx | `src/modules/footer/versions/Footer.pre-v3-design-2026-02-06.tsx` |
| LandingPage.tsx | `src/modules/landing/versions/LandingPage.pre-v3-design-2026-02-06.tsx` |
| WishlistPage.tsx | `src/modules/customer-account/versions/WishlistPage.pre-v3-design-2026-02-06.tsx` |
| cookies/page.tsx | `src/figma-versions/backups/cookies-page.pre-v3-design-2026-02-06.tsx` |
| privacy/page.tsx | `src/figma-versions/backups/privacy-page.pre-v3-design-2026-02-06.tsx` |
| terms/page.tsx | `src/figma-versions/backups/terms-page.pre-v3-design-2026-02-06.tsx` |

---

## 1. Footer.tsx

### Cambios propuestos (solo diseño)

**1.1 Icono X (Twitter) → SVG de X**

```diff
- import {
-   Sun,
-   Moon,
-   Facebook,
-   Twitter,
-   Instagram,
-   Youtube,
-   Linkedin,
- } from "lucide-react";
+ import {
+   Sun,
+   Moon,
+   Facebook,
+   Instagram,
+   Youtube,
+   Linkedin,
+ } from "lucide-react";
```

```diff
                <a
                  href="https://x.com/davidsonsdesign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={...}
                  aria-label="X"
                >
-                 <Twitter className="h-5 w-5" />
+                 <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
+                   <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
+                 </svg>
                </a>
```

**Nota:** Se elimina `Twitter` del import (ya no se usa). Regla: "no añadir imports" — no se añade ninguno nuevo.

**1.2 Redes sociales — Quitar TikTok y Pinterest**

```diff
                </a>
-               <a
-                 href="https://tiktok.com/@davidsonsdesign"
-                 target="_blank"
-                 rel="noopener noreferrer"
-                 className={...}
-                 aria-label="TikTok"
-               >
-                 <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">...</svg>
-               </a>
-               <a
-                 href="https://pinterest.com/davidsonsdesign"
-                 target="_blank"
-                 rel="noopener noreferrer"
-                 className={...}
-                 aria-label="Pinterest"
-               >
-                 <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">...</svg>
-               </a>
                <a
                  href="https://linkedin.com/company/davidsonsdesign"
```

**1.3 Newsletter**
- V3 incluye sección Newsletter. Añadirla requeriría `import { Newsletter } from "@/modules/newsletter"`.
- Por regla "NO añadir imports", **no se aplica**.

---

## 2. LandingPage.tsx

### Estado actual vs V3

- **Actual:** Header fijo simple, secciones Hero / Collections / Process / Testimonials / CTA.
- **V3:** Header que se oculta al scroll y muestra una barra tipo “píldora” centrada; mismo conjunto de secciones.

### Cambios propuestos (solo diseño)

- **Ningún cambio de lógica:** Se mantiene Header, Footer, CartDrawer, AnimatedSection, motion.
- Posibles ajustes de clase CSS (espaciado, tamaños) para alinear visual con V3, sin cambiar estructura ni imports.
- **Recomendación:** Sin cambios sustanciales, dado que la estructura actual ya es coherente. Si deseas ajustes puntuales de espaciado/colores, indícalos.

---

## 3. WishlistPage.tsx

### Estado actual vs V3

- Ambos tienen sidebar (menú usuario) + grid de productos / empty state.
- Estructura y estilos muy similares.

### Cambios propuestos (solo diseño)

- Sin cambios necesarios si el diseño actual cumple los requisitos.
- Opcionales: ajustar `rounded`, espaciado o clases de tarjeta para acercar al look de V3.

---

## 4. CookiePolicy.tsx (app/cookies/page.tsx)

### Regla

- Solo CSS/JSX/layout. No modificar contenido textual ni imports.

### Cambios propuestos

- Sin cambios previstos. La estructura actual (Header, Footer, secciones) se mantiene.
- Si hay diferencias de estilo en V3 (por ejemplo, bordes, padding), se pueden aplicar clases equivalentes manteniendo la misma estructura.

---

## 5. PrivacyPolicy.tsx (app/privacy/page.tsx)

### Regla

- Solo CSS/JSX/layout. No modificar contenido textual ni imports.

### Cambios propuestos

- Sin cambios previstos. Misma lógica que CookiePolicy.

---

## 6. TermsAndConditions.tsx (app/terms/page.tsx)

### Regla

- Solo CSS/JSX/layout. No modificar contenido textual ni imports.

### Cambios propuestos

- Sin cambios previstos. Misma lógica que las otras páginas legales.

---

## Resumen

| Archivo | Cambios a aplicar | Requiere tu aprobación |
|---------|-------------------|------------------------|
| Footer | 1) X SVG en lugar de Twitter 2) Quitar TikTok y Pinterest | Sí |
| LandingPage | Ninguno o mínimos de estilo | Opcional |
| WishlistPage | Ninguno | Opcional |
| cookies/page | Ninguno | No |
| privacy/page | Ninguno | No |
| terms/page | Ninguno | No |

---

**¿Procedo con los cambios de Footer (X SVG + quitar TikTok/Pinterest)?**  
Responde "sí" para aplicar solo esos cambios, o indica qué archivos y ajustes quieres que modifique.
