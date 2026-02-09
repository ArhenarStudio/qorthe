# Changelog – Módulo Landing

## 2026-02-09 – Migración al módulo + animaciones V2

- **Componente activo:** `components/LandingPage.tsx` — Homepage migrada desde `app/page.tsx`.
- **Backup V1:** `versions/LandingPage.v1.tsx` — Código original de la homepage antes de la migración.
- **Cambios:** Integración con Header/Footer/CartDrawer desde módulos; animaciones con `motion` (motion/react) y `AnimatedSection` / `StaggerContainer` / `staggerItem` (src/components/shared/AnimatedSection); Hero con motion entrance; Collections, Process, Testimonials y CTA con animaciones al scroll.
- **app/page.tsx:** Reducido a importar y renderizar `<LandingPage />` desde `@/modules/landing`.
- Referencia Figma V2: `versions/LandingPage.v2.tsx` (sin usar directamente).

## 2026-02-09 – Estructura inicial (sin migración)

- Creada estructura del módulo: `landing.config.ts`, `index.ts`, `components/`, `versions/`.
- Guardado `LandingPage.v2.tsx` como referencia desde Figma DSD V2 (no integrado; migración en pausa).
- Contenido activo de la homepage pasó a `components/LandingPage.tsx` (ver entrada superior).
