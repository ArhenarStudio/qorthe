# ═══════════════════════════════════════════════════════════════
# DavidSon's Design + RockStage Commerce
# INVENTARIO COMPLETO DE SERVICIOS DEL ECOSISTEMA
# ═══════════════════════════════════════════════════════════════
#
# Cada servicio que conforma la plataforma, qué aloja,
# qué corre, y cuál es su objetivo y función.
#
# Fecha: 2026-02-23
# ═══════════════════════════════════════════════════════════════


## DIAGRAMA COMPLETO DEL ECOSISTEMA

```
                         ┌──────────────┐
                         │   FIGMA      │ ← Diseño (fuente de verdad visual)
                         └──────┬───────┘
                                │ export
                                ▼
┌──────────┐            ┌──────────────┐            ┌──────────────┐
│  CURSOR  │───commit──▶│   GITHUB     │───trigger──▶│   VERCEL     │
│  (IDE)   │            │  (2 repos)   │───trigger──▶│ DIGITALOCEAN │
└──────────┘            └──────────────┘            └──────┬───────┘
                                                           │
                    ┌──────────────────────────────────────┤
                    │                                      │
              ┌─────▼──────┐                        ┌──────▼───────┐
              │   VERCEL   │                        │ DIGITALOCEAN │
              │ (Frontend) │                        │  (Backend)   │
              └─────┬──────┘                        └──────┬───────┘
                    │                                      │
        ┌───────┬──┴───┬────────┐                         │
        ▼       ▼      ▼        ▼                         ▼
  ┌─────────┐┌──────┐┌───┐┌─────────┐              ┌──────────┐
  │SUPABASE ││STRIPE││ MP ││CLOUDFLR ││              │   NEON    │
  │ (Auth)  ││(Pay) ││(Pay)│(DNS)   │              │(Postgres) │
  └─────────┘└──────┘└───┘└─────────┘              └──────────┘
                                                         │
                                              ┌──────────┤ (futuro)
                                              ▼          ▼
                                        ┌─────────┐┌─────────┐
                                        │ UPSTASH ││ RESEND  │
                                        │ (Redis) ││ (Email) │
                                        └─────────┘└─────────┘
```


## ═══════════════════════════════════════════
## SERVICIOS ACTIVOS (ya configurados)
## ═══════════════════════════════════════════


### 1. VERCEL — Frontend Hosting
```
URL:        https://davidsonsdesign.com
Tipo:       Plataforma de hosting (PaaS)
Costo:      $0/mo (Hobby plan)
Estado:     ✅ Live
```

**¿Qué aloja?**
- Aplicación Next.js 16 completa (App Router, SSR/SSG)
- 26 páginas/rutas del sitio web
- 3 API routes serverless:
  - /api/stripe/create-payment-intent
  - /api/stripe/confirm-payment
  - /api/mercadopago/process-payment
- Archivos estáticos (imágenes, CSS, JS bundles)

**¿Qué sistemas corren aquí?**
- Sistema de renderizado de páginas (SSR + SSG)
- Sistema de routing (App Router)
- Módulo de checkout (Stripe Elements + MP Bricks)
- Módulo de cotizador (QuoteWizard, 10 componentes)
- Módulo de cuenta de usuario (25 componentes)
- Módulo de lealtad (LoyaltyDashboard)
- CartContext (estado del carrito)
- AuthContext (estado de autenticación via Supabase)
- ThemeContext (dark/light mode)
- FeatureToggleContext (feature flags)
- ModuleManager (activar/desactivar módulos)
- Commerce adapter (medusa-adapter.ts — comunicación con backend)

**Env vars almacenadas (8):**
- NEXT_PUBLIC_MEDUSA_BACKEND_URL
- NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
- MERCADOPAGO_ACCESS_TOKEN
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

**Panel/Dashboard:** https://vercel.com/david-alejandro-perez-reas-projects/davidsons-design
**Login:** OAuth via GitHub


---


### 2. DIGITALOCEAN APP PLATFORM — Backend Hosting
```
URL:        https://urchin-app-u62qc.ondigitalocean.app
Tipo:       Plataforma de hosting de containers (PaaS)
Costo:      $12/mo (1 vCPU, 1GB RAM)
Estado:     ✅ Live (health OK)
```

**¿Qué aloja?**
- MedusaJS v2 — framework de e-commerce headless (Node.js)
- Dockerfile que construye y despliega el backend
- Admin UI de Medusa (React/Vite) en /app — ⚠️ actualmente 404

**¿Qué sistemas corren aquí?**
- API REST completa de comercio (/store/* y /admin/*):
  - Productos, variantes, precios
  - Carritos (crear, line items, completar)
  - Órdenes (crear, fulfillment, cancelar)
  - Clientes (registro, direcciones)
  - Regiones y shipping options
  - Payment sessions (Stripe + MercadoPago)
  - Inventory y stock locations
  - Sales channels
- Plugin de pagos Stripe (@medusajs/medusa/payment-stripe)
- Plugin de pagos MercadoPago (@nicogorga/medusa-payment-mercadopago)
- Webhooks de pagos (endpoints para Stripe y MP)
- Admin UI built-in de MedusaJS (panel para gestionar productos, órdenes, etc.)
- Migraciones de DB (se ejecutan automáticamente en build)

**Env vars almacenadas (11 activas, 3 pendientes):**
- DATABASE_URL (linked to Neon)
- STORE_CORS, ADMIN_CORS, AUTH_CORS
- JWT_SECRET, COOKIE_SECRET (encrypted)
- MERCADOPAGO_ACCESS_TOKEN (encrypted)
- STRIPE_API_KEY (encrypted)
- NODE_ENV=production
- MEDUSA_ADMIN_ONBOARDING_TYPE
- ❌ REDIS_URL — pendiente
- ❌ STRIPE_WEBHOOK_SECRET — pendiente
- ❌ MERCADOPAGO_WEBHOOK_SECRET — pendiente

**Panel/Dashboard:** https://cloud.digitalocean.com/apps/2afb6cf5-1e70-4740-9161-7ed74ade8032
**Login:** OAuth (cuenta DO de David)


---


### 3. NEON — Base de Datos PostgreSQL (Commerce)
```
URL:        Conexión interna via DATABASE_URL
Tipo:       PostgreSQL serverless (DBaaS)
Costo:      $0/mo (Free tier — 0.5GB, auto-suspend)
Estado:     ✅ Conectada
```

**¿Qué aloja?**
- TODA la data de comercio de MedusaJS (50+ tablas):

**Datos de catálogo:**
- Productos (4 tablas de cortar artesanales)
- Variantes (tamaños, opciones)
- Precios en MXN
- Colecciones y categorías
- Imágenes de productos (URLs)

**Datos transaccionales:**
- Carritos activos y abandonados
- Órdenes completadas
- Payment sessions y captures
- Fulfillments (envíos)
- Returns y refunds

**Datos de configuración:**
- Regiones (México, MXN)
- Sales channels
- Shipping options y profiles
- Payment providers (Stripe, MercadoPago)
- Stock locations e inventario
- Tax rates

**Datos de usuarios (commerce side):**
- Admin users (admin@davidsonsdesign.com)
- Customers (datos de compra, direcciones)
- API keys (publishable keys)

**IDs importantes:**
- Region México: reg_01KJ4BB2Z46YY1HWG0Q2N4KBVX
- Sales Channel: sc_01KJ485GC7X4594D7NK780ECQM
- Publishable Key: pk_9bd7739c...
- 4 Product IDs documentados en DSD-MASTER-CONFIG.md

**Panel/Dashboard:** https://console.neon.tech/app/projects/broad-sun-21599350
**SQL Editor:** https://console.neon.tech/.../sql-editor?database=neondb
**Login:** OAuth (cuenta Neon de David)


---


### 4. SUPABASE — Autenticación + Datos Custom
```
URL:        https://tpcwpkdicrhmkopokitw.supabase.co
Tipo:       Backend-as-a-Service (BaaS)
Costo:      $0/mo (Free tier — 50K users, 1GB DB, 1GB storage)
Estado:     ✅ Funcional
```

**¿Qué aloja AHORA?**
- Sistema de autenticación completo:
  - Login con email/password
  - Registro de usuarios
  - OAuth (Google, GitHub)
  - Gestión de sesiones (JWT)
  - Password reset
  - Auth callbacks (/auth/callback)
- Base de datos PostgreSQL separada (solo auth tables por ahora)

**¿Qué alojará EN EL FUTURO? (Fases 7-11)**
- Tabla wishlists (productos favoritos por usuario)
- Tabla reviews (reseñas de productos con moderación)
- Tabla loyalty_profiles (puntos, tier, lifetime_spend)
- Tabla loyalty_transactions (earn/redeem de puntos)
- Tabla quotations (cotizaciones guardadas)
- Tabla billing_profiles (datos fiscales: RFC, razón social)
- Supabase Storage:
  - Avatares de perfil de usuarios
  - PDFs de cotizaciones
  - Fotos de reviews
- Row Level Security (RLS) en todas las tablas custom

**Keys almacenadas:**
- Anon Key (pública, usada en frontend)
- Service Role Key (privada, para operaciones admin — no configurada aún)

**Panel/Dashboard:** https://supabase.com/dashboard/project/tpcwpkdicrhmkopokitw
**Login:** OAuth (cuenta Supabase de David)


---


### 5. STRIPE — Procesador de Pagos (Tarjeta)
```
URL:        API externa (api.stripe.com)
Tipo:       Payment processor (SaaS)
Costo:      2.9% + 30¢ por transacción
Estado:     ✅ Configurado — ⚠️ TEST MODE
```

**¿Qué aloja/maneja?**
- Procesamiento de pagos con tarjeta (Visa, MC, Amex)
- PaymentIntents (intenciones de pago)
- Confirmación y captura de pagos
- Webhooks para notificaciones asíncronas (pendiente configurar)
- Dashboard con historial de transacciones y disputes

**¿Dónde viven sus componentes?**
- Frontend (Vercel): Stripe Elements UI (formulario de tarjeta)
- Frontend (Vercel): API routes /api/stripe/* (create-payment-intent, confirm-payment)
- Backend (DO): Plugin @medusajs/medusa/payment-stripe
- Backend (DO): Endpoint de webhook /hooks/payment/stripe_stripe

**Keys:**
- Publishable Key (pk_test_...) → en Vercel
- Secret Key (sk_test_...) → en Vercel + DigitalOcean
- Webhook Secret → ❌ NO CONFIGURADO

**Panel/Dashboard:** https://dashboard.stripe.com/test/apikeys
**Login:** Cuenta Stripe de David


---


### 6. MERCADOPAGO — Procesador de Pagos (México)
```
URL:        API externa (api.mercadopago.com)
Tipo:       Payment processor (SaaS)
Costo:      3.49% + $4 MXN por transacción
Estado:     ✅ Configurado
```

**¿Qué aloja/maneja?**
- Procesamiento de pagos mexicanos (OXXO, SPEI, tarjeta débito/crédito)
- Checkout Bricks (componentes UI pre-hechos)
- Webhooks para notificaciones de pago (pendiente configurar)

**¿Dónde viven sus componentes?**
- Frontend (Vercel): MercadoPago Bricks UI (MercadoPagoBrick.tsx)
- Frontend (Vercel): API route /api/mercadopago/process-payment
- Backend (DO): Plugin @nicogorga/medusa-payment-mercadopago
- Backend (DO): Endpoint de webhook /hooks/payment/mercadopago_mercadopago

**Keys:**
- Public Key → en Vercel
- Access Token → en Vercel + DigitalOcean
- Webhook Secret → ❌ NO CONFIGURADO

**Panel/Dashboard:** https://www.mercadopago.com.mx/developers/panel/app/5033797200651848
**Login:** Cuenta MP de David


---


### 7. CLOUDFLARE — DNS, Dominio & CDN
```
URL:        davidsonsdesign.com
Tipo:       DNS + CDN + Security (SaaS)
Costo:      $0/mo (plan free) + ~$10-15/año dominio
Estado:     ✅ Funcional
```

**¿Qué aloja/maneja?**
- Registro del dominio davidsonsdesign.com
- DNS records:
  - davidsonsdesign.com → Vercel (A records)
  - www.davidsonsdesign.com → Vercel (CNAME)
  - (futuro) api.davidsonsdesign.com → DigitalOcean backend
- SSL/TLS certificates
- (futuro) CDN para imágenes de productos
- (futuro) Email domain records (SPF, DKIM, DMARC) para emails transaccionales
- (futuro) Page rules, firewall, rate limiting

**Panel/Dashboard:** Cloudflare Dashboard (URL pendiente confirmar)
**Login:** Cuenta Cloudflare de David


---


### 8. GITHUB — Código Fuente & CI/CD Trigger
```
URL:        github.com/StudioRockStage
Tipo:       Version control + CI/CD trigger
Costo:      $0/mo
Estado:     ✅ Funcional
```

**¿Qué aloja?**
- Repositorio frontend: StudioRockStage/davidsons-design (público)
  - Código Next.js 16 completo
  - 26 páginas, 65+ componentes, 4 contextos
  - Módulos: header, footer, landing, product, cart, checkout, account, quote, etc.
  - .cursorrules (instrucciones para Cursor IDE)
  - .env.local (NO comiteado — solo local)

- Repositorio backend: StudioRockStage/davidsons-backend (privado)
  - Código MedusaJS v2
  - Dockerfile para builds
  - Plugins de Stripe y MercadoPago
  - Scripts de seed
  - Configuración de medusa (medusa-config.ts)
  - .env (NO comiteado — solo local)

**CI/CD automático:**
- Push a main en davidsons-design → Vercel auto-deploy frontend
- Push a main en davidsons-backend → DigitalOcean auto-deploy backend

**Auth:** SSH key configurada en Cursor para pushes automáticos
**Org:** StudioRockStage


---


## ═══════════════════════════════════════════
## HERRAMIENTAS DE DESARROLLO (no hosting)
## ═══════════════════════════════════════════


### 9. NEXT.js 16 — Framework Frontend
```
Tipo:       Framework de React (App Router)
Versión:    16
Corre en:   Vercel (prod) + localhost:3000 (dev)
```

**¿Qué hace?**
- Framework que estructura toda la aplicación frontend
- Server-Side Rendering (SSR) para SEO y performance
- Static Site Generation (SSG) para páginas estáticas
- API Routes (serverless functions) para lógica de pagos
- App Router para routing basado en carpetas
- Middleware para auth y redirects

**Lo que define:**
- Estructura de carpetas app/ (cada carpeta = una ruta)
- Layout system (layout.tsx para header/footer compartidos)
- Separación client components ("use client") vs server components
- Image optimization (next/image)
- Font optimization (next/font)


---


### 10. TAILWIND CSS v4 — Sistema de Estilos
```
Tipo:       Framework CSS utility-first
Versión:    4 (con CSS theme tokens)
Corre en:   Build time (compilación) + browser
```

**¿Qué hace?**
- Define TODOS los estilos visuales del sitio
- CSS theme tokens para colores, tipografía, espaciado
- Dark mode support (via ThemeContext)
- Responsive design (mobile-first)
- Animaciones y transiciones

**Design tokens del proyecto:**
- Colores: wood-50 a wood-950, sand-50 a sand-950, accent, etc.
- Tipografía: Inter (body), Playfair Display (headings)
- Breakpoints: sm, md, lg, xl, 2xl


---


### 11. MEDUSAJS v2 — Framework de E-Commerce
```
Tipo:       E-commerce headless framework (Node.js)
Versión:    2.13.1
Corre en:   DigitalOcean (prod) + localhost:9000 (dev)
```

**¿Qué hace?**
- Framework que estructura todo el backend de comercio
- Define modelos de datos (productos, órdenes, carritos, etc.)
- Expone API REST automática (/store/* para clientes, /admin/* para admin)
- Sistema de plugins para pagos, envíos, notificaciones
- Admin UI built-in (React/Vite en /app)
- Sistema de workflows y subscribers (eventos async)
- Sistema de módulos extensibles
- Migraciones automáticas de base de datos

**Plugins activos:**
- @medusajs/medusa/payment-stripe
- @nicogorga/medusa-payment-mercadopago

**Admin credentials:**
- Email: admin@davidsonsdesign.com
- Password: Admin123!


---


### 12. FIGMA — Diseño UI/UX
```
Tipo:       Herramienta de diseño
Corre en:   Browser (figma.com) + Figma Make (export)
```

**¿Qué hace?**
- Fuente de verdad visual del diseño del sitio
- Diseño de todas las páginas, componentes y flujos
- Export a código React via Figma Make (Vite/React Router)
- Los exports se guardan en /DSD-Project/figma/

**Versiones:**
- DSD V1.0 — Diseño original
- DSD V1.1 — Iteración actual (migrada a Next.js)
- DSD V2, V3, V4 — Iteraciones futuras

**Flujo de trabajo:**
1. David diseña en Figma
2. Export con Figma Make → código React (Vite)
3. Se guarda en /figma/ como nueva versión
4. Claude/Cursor migra los cambios de Vite → Next.js
5. Solo se migran diffs (cambios), no el export completo


---


### 13. CURSOR — IDE de Desarrollo
```
Tipo:       IDE con AI integrado (fork de VS Code)
Corre en:   macOS local de David
```

**¿Qué hace?**
- Editor principal de código
- AI assistant integrado para código
- SSH key configurada para GitHub pushes automáticos
- .cursorrules define reglas de arquitectura del proyecto
- Workflow: editar → verificar (tsc) → commit → push → auto-deploy

**Configuración:**
- SSH key para GitHub (StudioRockStage)
- Git workflow: git add -A && git commit -m "msg" && git push origin main
- TypeScript check: npx tsc --noEmit antes de commits


---


## ═══════════════════════════════════════════
## SERVICIOS PENDIENTES (por configurar)
## ═══════════════════════════════════════════


### 14. UPSTASH — Redis (Cache & Jobs)
```
Tipo:       Redis serverless (DBaaS)
Costo:      $0/mo (Free tier — 10K commands/day)
Estado:     ❌ NO CONFIGURADO — Fase 14.1
```

**¿Qué va a alojar?**
- Cache de sesiones de MedusaJS
- Rate limiting para API
- Colas de jobs en background:
  - Envío de emails post-compra
  - Procesamiento de webhooks async
  - Cálculo de puntos de lealtad
- Cache de consultas frecuentes (productos, categorías)

**¿Dónde se configura?**
- Env var REDIS_URL en DigitalOcean
- MedusaJS lo detecta automáticamente si REDIS_URL existe

**Alternativas:** Redis de DigitalOcean ($15/mo), Vercel KV, Railway Redis


---


### 15. RESEND (o SendGrid/SES) — Emails Transaccionales
```
Tipo:       Email delivery service
Costo:      $0/mo (Free tier — 3K emails/mo en Resend)
Estado:     ❌ NO CONFIGURADO — Fase 5
```

**¿Qué va a alojar/manejar?**
- Envío de emails transaccionales:
  - Confirmación de orden (order.placed)
  - Orden enviada con tracking (order.fulfillment_created)
  - Bienvenida post-registro
  - Reset de contraseña (personalizado, complementa Supabase)
  - Invitación a dejar review (7 días post-compra)
  - Notificaciones de lealtad (tier upgrade, puntos)
- Templates de email (HTML responsive)
- Dominio de envío: noreply@davidsonsdesign.com

**¿Dónde se configura?**
- Env var del proveedor en DigitalOcean (RESEND_API_KEY o similar)
- DNS records en Cloudflare (SPF, DKIM, DMARC)
- Subscribers en MedusaJS (backend/src/subscribers/)

**Alternativas:** SendGrid ($0 free 100/day), Amazon SES ($0.10/1K emails)


---


### 16. SKYDROPX o ENVIA.COM — Envíos y Guías
```
Tipo:       Shipping aggregator API
Costo:      Variable por guía (~$80-200 MXN por envío nacional)
Estado:     ❌ NO CONFIGURADO — Fase 6
```

**¿Qué va a alojar/manejar?**
- Cotización de envíos en tiempo real (por CP destino + peso/dimensiones)
- Generación de guías de envío automáticas
- Números de tracking
- Múltiples paqueterías (DHL, FedEx, Estafeta, etc.)
- Integración en checkout (mostrar opciones y precios de envío)
- Integración en admin (generar guía post-venta)

**¿Dónde se configura?**
- API key en DigitalOcean env vars
- Módulo custom en MedusaJS (backend/src/modules/)
- Subscriber: order.placed → crear guía automática


---


### 17. FACTURAPI (o similar) — Facturación Electrónica CFDI
```
Tipo:       Facturación electrónica API (SaaS)
Costo:      ~$200-500 MXN/mo según volumen
Estado:     ❌ NO CONFIGURADO — Fase 11
```

**¿Qué va a alojar/manejar?**
- Generación de CFDI (Comprobantes Fiscales Digitales por Internet)
- Timbrado de facturas ante el SAT
- Generación de XML y PDF de facturas
- Notas de crédito y cancelaciones
- Catálogo de uso CFDI y régimen fiscal

**¿Dónde se configura?**
- API key en DigitalOcean env vars (o Vercel API route)
- Tabla billing_profiles en Supabase (datos fiscales del cliente)
- Componentes en frontend: FiscalProfileForm, InvoiceRequestModal, BillingDashboard


---


### 18. SENTRY (o similar) — Monitoreo y Error Tracking
```
Tipo:       Application monitoring (SaaS)
Costo:      $0/mo (Free tier — 5K events/mo)
Estado:     ❌ NO CONFIGURADO — Fase 14.4
```

**¿Qué va a alojar/manejar?**
- Captura de errores en frontend (Next.js) y backend (MedusaJS)
- Stack traces completos
- Performance monitoring (tiempos de carga, API response times)
- Alertas cuando hay errores nuevos o spikes
- Session replay (opcional)

**¿Dónde se configura?**
- SDK en frontend (next.config.ts + sentry.client/server.config)
- SDK en backend (instrumentation.ts ya existe)
- Env vars: SENTRY_DSN en Vercel + DigitalOcean


---


## ═══════════════════════════════════════════
## RESUMEN: QUÉ VIVE EN CADA LUGAR
## ═══════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────┐
│ VERCEL                                                          │
│ ├── Sitio web completo (26 páginas)                             │
│ ├── API routes de pagos (3 serverless functions)                │
│ ├── UI components (65+ componentes React)                       │
│ ├── Contextos (Auth, Cart, Theme, FeatureToggle)                │
│ ├── ModuleManager (sistema de plugins)                          │
│ ├── Commerce adapter (medusa-adapter.ts)                        │
│ ├── Supabase clients (auth browser + server)                    │
│ └── 8 env vars (keys de todos los servicios)                    │
├─────────────────────────────────────────────────────────────────┤
│ DIGITALOCEAN                                                    │
│ ├── MedusaJS v2 API completa (/store/*, /admin/*)               │
│ ├── Admin UI de Medusa (/app) ← pendiente fix                  │
│ ├── Plugin Stripe (payment-stripe)                              │
│ ├── Plugin MercadoPago (medusa-payment-mercadopago)             │
│ ├── Webhook endpoints (/hooks/payment/*)                        │
│ ├── (futuro) Subscribers para emails y jobs                     │
│ ├── (futuro) Custom modules para envíos                         │
│ └── 11+ env vars (DB, CORS, secrets, API keys)                  │
├─────────────────────────────────────────────────────────────────┤
│ NEON                                                            │
│ ├── 50+ tablas de MedusaJS                                      │
│ ├── Productos, variantes, precios (catálogo)                    │
│ ├── Carritos, órdenes, payments (transaccional)                 │
│ ├── Customers, addresses (usuarios commerce)                    │
│ ├── Regions, shipping, inventory (configuración)                │
│ ├── Admin users y API keys                                      │
│ └── Migraciones automáticas en cada deploy                      │
├─────────────────────────────────────────────────────────────────┤
│ SUPABASE                                                        │
│ ├── Auth (login, registro, OAuth, sessions, JWT)                │
│ ├── (futuro) wishlists table                                    │
│ ├── (futuro) reviews table                                      │
│ ├── (futuro) loyalty_profiles + loyalty_transactions tables     │
│ ├── (futuro) quotations table                                   │
│ ├── (futuro) billing_profiles table                             │
│ └── (futuro) Storage (avatares, PDFs, fotos de reviews)         │
├─────────────────────────────────────────────────────────────────┤
│ CLOUDFLARE                                                      │
│ ├── Dominio davidsonsdesign.com                                 │
│ ├── DNS records (→ Vercel, futuro → DO)                         │
│ ├── SSL/TLS                                                     │
│ ├── (futuro) CDN de imágenes                                    │
│ └── (futuro) Email domain records (SPF, DKIM, DMARC)            │
├─────────────────────────────────────────────────────────────────┤
│ GITHUB                                                          │
│ ├── Repo frontend: davidsons-design (código Next.js)            │
│ ├── Repo backend: davidsons-backend (código MedusaJS)           │
│ ├── CI/CD trigger → Vercel auto-deploy                          │
│ ├── CI/CD trigger → DigitalOcean auto-deploy                    │
│ └── Historial de cambios y versiones                            │
├─────────────────────────────────────────────────────────────────┤
│ STRIPE                                                          │
│ ├── Procesamiento de pagos con tarjeta                          │
│ ├── PaymentIntents y confirmaciones                             │
│ ├── (futuro) Webhooks automáticos                               │
│ └── Dashboard de transacciones                                  │
├─────────────────────────────────────────────────────────────────┤
│ MERCADOPAGO                                                     │
│ ├── Procesamiento de pagos mexicanos (OXXO, SPEI, tarjeta)     │
│ ├── Checkout Bricks (UI components)                             │
│ ├── (futuro) Webhooks automáticos                               │
│ └── Dashboard de transacciones                                  │
├─────────────────────────────────────────────────────────────────┤
│ FIGMA                                                           │
│ ├── Diseño UI/UX (fuente de verdad visual)                      │
│ ├── Exports de código React (Figma Make)                        │
│ └── Versionamiento de diseño (V1.0, V1.1, V2...)               │
├─────────────────────────────────────────────────────────────────┤
│ CURSOR                                                          │
│ ├── IDE principal de desarrollo                                 │
│ ├── SSH key para GitHub                                         │
│ ├── .cursorrules (reglas de arquitectura)                       │
│ └── Git workflow automatizado                                   │
└─────────────────────────────────────────────────────────────────┘

PENDIENTES POR AGREGAR:
┌─────────────────────────────────────────────────────────────────┐
│ UPSTASH (Redis)    → Cache, jobs, rate limiting                 │
│ RESEND (Email)     → Emails transaccionales                     │
│ SKYDROPX (Envíos)  → Cotización y guías de envío                │
│ FACTURAPI (CFDI)   → Facturación electrónica México             │
│ SENTRY (Monitor)   → Error tracking y performance               │
└─────────────────────────────────────────────────────────────────┘
```


## ═══════════════════════════════════════════
## COSTOS TOTALES
## ═══════════════════════════════════════════

### Actuales
```
Vercel              $0/mo    (Hobby)
DigitalOcean        $12/mo   (Basic)
Neon                $0/mo    (Free tier)
Supabase            $0/mo    (Free tier)
Cloudflare          $0/mo    + ~$12/año dominio
GitHub              $0/mo
Stripe              Solo comisiones
MercadoPago         Solo comisiones
Figma               $0/mo    (Free plan) o $15/mo (Pro)
Cursor              $20/mo   (Pro plan)
─────────────────────────────────────────
TOTAL ACTUAL:       ~$32/mo  + dominio anual
```

### Proyectados (con servicios pendientes)
```
+ Upstash (Redis)   $0/mo    (Free tier)
+ Resend (Email)    $0/mo    (Free — 3K emails/mo)
+ Skydropx          Variable (por guía, ~$80-200 MXN c/u)
+ Facturapi         ~$200-500 MXN/mo
+ Sentry            $0/mo    (Free tier)
─────────────────────────────────────────
TOTAL PROYECTADO:   ~$32/mo + $200-500 MXN/mo facturación
                    + costo por guía de envío
```
