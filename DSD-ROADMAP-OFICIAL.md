# ═══════════════════════════════════════════════════════════════
# Qorthe — ROADMAP OFICIAL
# Última actualización: 2026-02-24
# ═══════════════════════════════════════════════════════════════

## ESTADO DE INFRAESTRUCTURA

| Componente | Servicio | Estado |
|---|---|---|
| Frontend | Vercel (Next.js 16) | ✅ Live — qorthe.com |
| Backend | DigitalOcean App Platform (MedusaJS) | ✅ Live — urchin-app |
| Base de datos | Neon PostgreSQL | ✅ Conectada |
| Auth | Supabase | ✅ Funcional (login/registro) |
| Pagos — Stripe | Test keys configuradas (frontend + backend) | ✅ Configurado |
| Pagos — MercadoPago | Credenciales configuradas (frontend + backend) | ✅ Configurado |
| Redis | No configurado | ❌ Pendiente |
| CDN imágenes | No configurado | ❌ Pendiente |
| Emails transaccionales | No configurado | ❌ Pendiente |
| Envíos (API) | No conectado | ❌ Pendiente |
| Admin panel custom | Estructura vacía (src/admin/) | ❌ Pendiente |

---

## INVENTARIO DE ENV VARS

### Vercel (Frontend) — 8 variables (Shopify eliminado ✅)
```
✅ STRIPE_SECRET_KEY                        (Feb 23)
✅ MERCADOPAGO_ACCESS_TOKEN                 (Feb 23)
✅ NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY       (Feb 23)
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY       (Feb 23)
✅ NEXT_PUBLIC_MEDUSA_BACKEND_URL           (Feb 22)
✅ NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY       (Feb 22)
✅ NEXT_PUBLIC_SUPABASE_URL                 (Feb 9)
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY            (Feb 9)
```

### DigitalOcean (Backend) — 11 variables
```
✅ DATABASE_URL (linked to dev-db)
✅ STORE_CORS
✅ ADMIN_CORS
✅ AUTH_CORS
✅ JWT_SECRET (encrypted)
✅ COOKIE_SECRET (encrypted)
✅ MERCADOPAGO_ACCESS_TOKEN (encrypted)
✅ NODE_ENV=production
✅ MEDUSA_ADMIN_ONBOARDING_TYPE
✅ STRIPE_API_KEY (encrypted)
❌ REDIS_URL — no existe
❌ STRIPE_WEBHOOK_SECRET — no existe
❌ MERCADOPAGO_WEBHOOK_SECRET — no existe
```

---

## INVENTARIO DE COMPONENTES FRONTEND

### Páginas (26 rutas)
```
COMMERCE:
  ✅ / (Home)
  ✅ /shop (catálogo con 4 productos)
  ✅ /shop/[id] (detalle de producto)
  ✅ /cart (carrito)
  ✅ /checkout (checkout con Stripe + MP)
  ✅ /checkout/success (confirmación)
  ✅ /quote (cotizador)

CUENTA:
  ✅ /account (panel con 14 módulos)
  ✅ /auth (login/registro con Supabase)
  ✅ /auth/callback (OAuth callback)
  ✅ /loyalty (programa de lealtad)

CONTENIDO:
  ✅ /about
  ✅ /philosophy
  ✅ /contact
  ✅ /faq
  ✅ /search

LEGALES (8 páginas):
  ✅ /terms, /privacy-policy, /cookies-policy, /returns-policy
  ✅ /shipping-policy, /warranty-policy, /sales-conditions
  ✅ /dispute-resolution, /intellectual-property, /legal-notice
```

### Componentes de Cuenta (25 archivos) — TODOS con datos mock
```
AccountOverview.tsx        — Dashboard con tarjeta de membresía, pedido activo, notificaciones
AccountSecurity.tsx        — Cambiar contraseña, 2FA
AccountSettings.tsx        — Perfil, preferencias
AccountSidebar.tsx         — Navegación lateral del panel
AddressBook.tsx            — CRUD de direcciones
BusinessDashboard.tsx      — Dashboard B2B
CommunicationModal.tsx     — Preferencias de comunicación
DesignLibrary.tsx          — Diseños guardados del cotizador
EmptyStates.tsx            — 5 estados vacíos (Orders, Addresses, Reviews, Quotations, Designs)
HelpModal.tsx              — Centro de ayuda
LoyaltyDashboard.tsx       — Dashboard de lealtad con tiers
NotificationsModal.tsx     — Centro de notificaciones
OrderDetail.tsx            — Detalle de pedido con timeline
OrdersList.tsx             — Lista de pedidos
PrivacyModal.tsx           — Configuración de privacidad
ProfilePictureModal.tsx    — Subir foto de perfil
QuotationsList.tsx         — Historial de cotizaciones
SavedDesigns.tsx           — Diseños guardados
SecurityModal.tsx          — Seguridad avanzada
SubscriptionManagementModal.tsx — Gestión de suscripciones
SubscriptionsList.tsx      — Lista de suscripciones
UserReviews.tsx            — Reviews del usuario
UserSubscriptions.tsx      — Suscripciones activas
Wallet.tsx                 — Saldo/wallet digital
Wishlist.tsx               — Lista de deseos
billing/BillingDashboard.tsx   — Facturación
billing/BillingStats.tsx       — Estadísticas de facturación
billing/FiscalProfileForm.tsx  — Datos fiscales (RFC)
billing/InvoiceRequestModal.tsx — Solicitar factura
```

### Componentes de Checkout (2 archivos)
```
StripeCheckout.tsx         — Integración Stripe Elements con useImperativeHandle
MercadoPagoBrick.tsx       — Integración MercadoPago Bricks
```

### API Routes del Frontend (3 rutas)
```
/api/stripe/create-payment-intent  — Crea PaymentIntent con STRIPE_SECRET_KEY
/api/stripe/confirm-payment        — Confirma pago y crea orden en Medusa
/api/mercadopago/process-payment   — Procesa pago MP y crea orden en Medusa
```

### Cotizador (10 archivos)
```
QuoteWizardModal.tsx       — Modal wizard multi-step
QuoteConfiguratorStage.tsx — Configurador de producto
WoodSelector.tsx           — Selector visual de maderas
EngravingConfigurator.tsx  — Configurador de grabado láser
QuoteProductBlock.tsx      — Bloque de producto
QuoteItemSidebar.tsx       — Sidebar de items
QuoteSummaryPanel.tsx      — Panel de resumen
QuoteExportActions.tsx     — Exportar/enviar cotización
QuoteBuilderModule.tsx     — Módulo contenedor
types.ts                   — 7 ProductTypes, 5 WoodTypes, 4 UsageTypes
```

### Contextos (4)
```
AuthContext.tsx             — Supabase auth state (user, session, signOut)
CartContext.tsx             — MedusaJS cart state (items, add, remove, drawer)
ThemeContext.tsx            — Dark/light mode
FeatureToggleContext.tsx    — Feature flags
```

### Lib/Infraestructura
```
commerce/medusa-adapter.ts  — Adapter para MedusaJS Store API
commerce/types.ts           — Tipos compartidos de commerce
module-manager/ModuleManager.ts — Sistema de módulos activables/desactivables
module-manager/registry.ts  — Registro de módulos
supabase/client.ts          — Supabase browser client
supabase/server.ts          — Supabase server client
supabase/middleware.ts       — Middleware de auth
```

### Backend MedusaJS (src/)
```
admin/       — Solo i18n config (admin UI viene built-in con Medusa)
api/admin/custom/route.ts  — 1 ruta admin custom
api/store/custom/route.ts  — 1 ruta store custom
jobs/        — Vacío (solo README)
links/       — Vacío
modules/     — Vacío (no hay módulos custom)
scripts/seed.ts — Script de seed
subscribers/ — Vacío (no hay event subscribers)
workflows/   — Vacío (no hay workflows custom)
```

### Plugins MedusaJS configurados
```
@medusajs/medusa/payment-stripe     — Provider "stripe"
@nicogorga/medusa-payment-mercadopago — Provider "mercadopago"
```

---

## ROADMAP POR FASES

### ══════════════════════════════════════════
### FASE 4 — Checkout E2E & Webhooks ← ACTUAL
### ══════════════════════════════════════════

**Objetivo:** Que un cliente pueda comprar y pagar de verdad.

```
4.1  [x] Test checkout e2e con Stripe (test mode) — ✅ COMPLETADO 2026-02-24
         — ✅ Admin auth reseteado (password: Admin123!)
         — ✅ Stock Location verificado (sloc_01KJ4BE3A3RX49GZ0BVT62AERR)
         — ✅ Inventory levels creados (10 unidades × 4 productos)
         — ✅ Shipping options funcionan con cart_id
         — ✅ Shipping option ID corregido en frontend
         — ✅ Agregar producto al carrito
         — ✅ Completar formulario de envío
         — ✅ Pagar con tarjeta de prueba 4242...
         — ✅ Redirect a página de éxito
         — Fix: PaymentElement unmount (overlay pattern, issue #296 react-stripe-js)
         — Pendiente: Verificar orden creada en Medusa admin (siguiente paso)
4.1b [x] Auditoría SaaS de seguridad en pagos — ✅ COMPLETADO 2026-02-24
         — ✅ Server-side amount validation (Medusa cart.total, no frontend)
         — ✅ Server-side payment verification (Stripe retrieve PI, MP GET payment)
         — ✅ Idempotency keys (Stripe: pi_create_{cart_id}, MP: mp_pay_{cart_id})
         — ✅ Cart ID cross-check (PI metadata.cart_id must match request)
         — ✅ Shared medusa-helpers.ts (DRY: medusaFetch, getVerifiedCartTotal, completeCartToOrder)
         — ✅ MP additional_info (items, payer, shipments) para mejor tasa de aprobación
         — Commit: 4b571e3
4.2  [ ] Test checkout e2e con MercadoPago
         — Mismo flujo con MP test credentials
4.3  [ ] Configurar Stripe webhook en producción
         — URL: https://[backend-url]/hooks/payment/stripe_stripe
         — Eventos: payment_intent.succeeded, payment_intent.payment_failed
         — Agregar STRIPE_WEBHOOK_SECRET en DO env vars
4.4  [ ] Configurar MercadoPago webhook en producción
         — URL: https://[backend-url]/hooks/payment/mercadopago_mercadopago
         — Agregar MERCADOPAGO_WEBHOOK_SECRET en DO env vars
4.5  [ ] Verificar que webhooks crean/actualizan órdenes correctamente
4.6  [x] Fix: Variables legacy de Shopify eliminadas de Vercel ✅
```

### ══════════════════════════════════════════
### FASE 5 — Emails Transaccionales
### ══════════════════════════════════════════

**Objetivo:** El cliente recibe confirmaciones por email.

```
5.1  [ ] Elegir proveedor de email (Resend, SendGrid, o Amazon SES)
5.2  [ ] Configurar dominio de envío (noreply@qorthe.com)
         — DNS records (SPF, DKIM, DMARC) en Cloudflare
5.3  [ ] Crear templates de email:
         — Confirmación de orden
         — Orden enviada (con tracking)
         — Bienvenida (post-registro)
         — Reset de contraseña (ya existe vía Supabase, pero personalizar)
5.4  [ ] Crear subscribers en MedusaJS (backend/src/subscribers/):
         — order.placed → enviar email de confirmación
         — order.fulfillment_created → enviar email con tracking
5.5  [ ] Configurar env var del proveedor de email en DO
5.6  [ ] Test e2e: comprar → recibir email de confirmación
```

### ══════════════════════════════════════════
### FASE 6 — Envíos (API + Guías)
### ══════════════════════════════════════════

**Objetivo:** Cotizar envíos reales y generar guías automáticas.

```
6.1  [ ] Elegir proveedor de envíos (Skydropx, Envia.com, o manual)
6.2  [ ] Integrar API de cotización de envíos
         — Calcular costo real basado en CP destino + peso/dimensiones
         — Mostrar opciones al cliente en checkout (estándar, express)
6.3  [ ] Generar guías de envío automáticas post-compra
         — Webhook order.placed → crear guía → obtener número de tracking
6.4  [ ] Integrar tracking en el panel de cuenta del cliente
         — OrderDetail.tsx → mostrar estado real del envío
6.5  [ ] Notificación por email cuando se genera la guía
6.6  [ ] Página de rastreo pública (opcional: /tracking/[id])
```

### ══════════════════════════════════════════
### FASE 7 — Panel de Cuenta Conectado
### ══════════════════════════════════════════

**Objetivo:** El panel /account muestra datos reales del usuario.

```
7.1  [ ] Nombre real del usuario en header y AccountOverview
         — Supabase user metadata → GlobalHeader + AccountOverview
7.2  [ ] Pedidos reales desde Medusa
         — OrdersList.tsx ↔ Medusa GET /store/orders (con auth)
         — OrderDetail.tsx ↔ Medusa GET /store/orders/:id
         — Timeline de pedido con estados reales
7.3  [ ] Direcciones guardadas
         — AddressBook.tsx ↔ Medusa Customer Addresses API
         — CRUD completo (agregar, editar, eliminar, marcar default)
7.4  [ ] Perfil de cuenta editable
         — AccountSettings.tsx ↔ Supabase user metadata update
         — ProfilePictureModal.tsx ↔ Supabase Storage (avatar)
7.5  [ ] Seguridad de cuenta
         — AccountSecurity.tsx ↔ Supabase cambio de contraseña
         — SecurityModal.tsx ↔ 2FA con Supabase MFA (opcional)
```

### ══════════════════════════════════════════
### FASE 8 — Wishlist & Reviews
### ══════════════════════════════════════════

**Objetivo:** Los usuarios pueden guardar favoritos y dejar reseñas.

```
8.1  [ ] Crear tabla "wishlists" en Supabase
         — user_id, product_id, variant_id, created_at
         — Row Level Security: solo el owner puede ver/editar
8.2  [ ] Conectar Wishlist.tsx ↔ Supabase
         — Agregar/quitar desde ProductDetailPage y ShopPage
         — Sincronizar corazón en ProductCard
8.3  [ ] Crear tabla "reviews" en Supabase
         — user_id, product_id, order_id, rating, title, body, photos[], status
         — Status: pending/approved/rejected (moderación)
8.4  [ ] Conectar ProductReviews.tsx ↔ Supabase
         — Mostrar reviews aprobados en página de producto
         — Promedio de estrellas y distribución
8.5  [ ] Conectar UserReviews.tsx ↔ Supabase
         — "Mis reseñas" en el panel de cuenta
         — Solo puede reseñar productos que compró (verificar con Medusa orders)
8.6  [ ] Notificación post-compra invitando a dejar reseña (email, 7 días después)
```

### ══════════════════════════════════════════
### FASE 9 — Sistema de Membresía/Lealtad
### ══════════════════════════════════════════

**Objetivo:** Programa de lealtad funcional con tiers y puntos.

```
9.1  [ ] Crear tablas en Supabase:
         — "loyalty_profiles": user_id, points, tier, lifetime_spend, joined_at
         — "loyalty_transactions": id, user_id, points, type (earn/redeem), 
           order_id, description, created_at
9.2  [ ] Lógica de acumulación de puntos
         — Trigger post-compra: order total → puntos (1 punto = $1 MXN)
         — Subscriber en Medusa: order.placed → Supabase insert
9.3  [ ] Cálculo automático de tier
         — Bronce ($0-2,999), Plata ($3,000-7,999), Oro ($8,000-14,999), Diamante ($15,000+)
         — Actualizar tier cuando lifetime_spend cambia
9.4  [ ] Conectar LoyaltyDashboard.tsx ↔ Supabase
         — Puntos actuales, tier, progreso al siguiente tier
         — Historial de transacciones de puntos
9.5  [ ] Conectar AccountOverview.tsx tarjeta de membresía ↔ datos reales
9.6  [ ] Canje de puntos en checkout
         — Aplicar descuento basado en puntos disponibles
         — Registrar transacción de redención
9.7  [ ] Beneficios por tier
         — Descuentos automáticos en checkout según tier
         — Envío gratis para Oro y Diamante
         — Acceso anticipado a nuevos productos (feature flag)
```

### ══════════════════════════════════════════
### FASE 10 — Cotizador Conectado
### ══════════════════════════════════════════

**Objetivo:** El cotizador guarda, genera PDF y envía cotizaciones.

```
10.1 [ ] Crear tabla "quotations" en Supabase
         — user_id, items[], total, status, pdf_url, created_at, expires_at
10.2 [ ] Guardar cotizaciones desde QuoteWizardModal ↔ Supabase
10.3 [ ] Generación de PDF de cotización
         — Server-side con puppeteer o react-pdf
         — Guardar en Supabase Storage
10.4 [ ] QuoteExportActions.tsx: descargar PDF, enviar por email, compartir link
10.5 [ ] QuotationsList.tsx ↔ Supabase (historial en panel de cuenta)
10.6 [ ] Convertir cotización en orden (botón "Comprar esta cotización")
10.7 [ ] Notificación al admin cuando se crea una cotización nueva
```

### ══════════════════════════════════════════
### FASE 11 — Facturación Electrónica (México)
### ══════════════════════════════════════════

**Objetivo:** Generar facturas CFDI para clientes que lo soliciten.

```
11.1 [ ] Integrar proveedor de facturación (Facturapi, Conekta Billing, o SAT directo)
11.2 [ ] FiscalProfileForm.tsx ↔ Supabase (guardar datos fiscales: RFC, razón social, etc.)
11.3 [ ] InvoiceRequestModal.tsx ↔ API de facturación
         — Solicitar factura post-compra
         — Generar CFDI y enviar por email
11.4 [ ] BillingDashboard.tsx ↔ historial de facturas
11.5 [ ] Descarga de XML y PDF de facturas
```

### ══════════════════════════════════════════
### FASE 12 — Admin Panel Custom
### ══════════════════════════════════════════

**Objetivo:** Panel /admin para gestión completa del negocio.

```
NOTA: MedusaJS ya trae admin UI built-in para productos, órdenes, etc.
Este admin custom es para funcionalidades que Medusa no cubre.

12.1 [ ] Autenticación admin con Supabase (rol "admin" en metadata)
12.2 [ ] Dashboard principal:
         — Ventas del día/semana/mes (desde Medusa orders)
         — Órdenes pendientes de envío
         — Ingresos totales y promedio por orden
         — Gráficas de ventas (recharts)
12.3 [ ] Gestión de envíos:
         — Lista de órdenes pendientes de guía
         — Generar guía desde el admin
         — Marcar como enviado → notificar al cliente
12.4 [ ] Moderación de reviews:
         — Lista de reviews pendientes de aprobación
         — Aprobar/rechazar/responder
12.5 [ ] Gestión de cotizaciones:
         — Lista de cotizaciones recibidas
         — Contactar al cliente, aprobar, convertir en orden
12.6 [ ] Gestión de membresías:
         — Ver miembros por tier
         — Ajustar puntos manualmente
         — Ver historial de transacciones
12.7 [ ] Gestión de contenido (CMS ligero):
         — Editar menús de navegación
         — Editar FAQ
         — Editar páginas de contenido (About, Philosophy, etc.)
12.8 [ ] ModuleManager visual:
         — Activar/desactivar módulos desde UI
         — Configurar settings de cada módulo
12.9 [ ] Notificaciones del admin:
         — Nueva venta → notificación push/email al admin
         — Nueva cotización → notificación
         — Review nuevo → notificación
```

### ══════════════════════════════════════════
### FASE 13 — B2B / Mayoreo
### ══════════════════════════════════════════

**Objetivo:** Portal para clientes de mayoreo.

```
13.1 [ ] Registro de cuenta B2B (con aprobación manual)
13.2 [ ] Precios de mayoreo por tier/volumen
13.3 [ ] BusinessDashboard.tsx ↔ backend (catálogo B2B, historial)
13.4 [ ] Cotizaciones especiales para B2B
13.5 [ ] Facturación automática para B2B
13.6 [ ] Términos de pago extendidos (crédito 30/60/90 días)
```

### ══════════════════════════════════════════
### FASE 14 — Infraestructura & Performance
### ══════════════════════════════════════════

**Objetivo:** Optimización, cache, monitoreo.

```
14.1 [ ] Redis — configurar en DO o servicio externo (Upstash)
         — Cache de sesiones
         — Rate limiting
         — Colas de emails y jobs
         — Agregar REDIS_URL en DO env vars
14.2 [ ] CDN de imágenes (Cloudflare Images o imgproxy)
14.3 [ ] Dominio personalizado para backend: api.qorthe.com
         — DNS en Cloudflare
         — SSL automático
         — Actualizar CORS y env vars con nuevo dominio
14.4 [ ] Monitoreo y logging (Sentry o similar)
14.5 [ ] Backups automáticos de Neon PostgreSQL
14.6 [ ] SEO completo (metadata por página, sitemap.xml, robots.txt)
14.7 [ ] Performance audit (Lighthouse, Core Web Vitals)
14.8 [ ] i18n — activar sistema de traducciones (EN/ES)
         — LanguageSwitcher.tsx ya existe en UI
         — Extraer CONTENT dictionaries a archivos de locale
```

### ══════════════════════════════════════════
### FASE 15 — Stripe LIVE & Lanzamiento
### ══════════════════════════════════════════

**Objetivo:** Pasar de test a producción real.

```
15.1 [ ] Switch Stripe a LIVE keys
         — Reemplazar sk_test_ → sk_live_ en DO y Vercel
         — Reemplazar pk_test_ → pk_live_ en Vercel
15.2 [ ] Switch MercadoPago a credenciales de producción (si aplica)
15.3 [ ] QA final: mobile + desktop, todas las páginas
15.4 [ ] Test de compra real con tarjeta real
15.5 [ ] Lanzamiento público
```

---

## PRIORIDAD SUGERIDA

```
INMEDIATO (semana actual):
  Fase 4  — Checkout e2e (ya casi listo, solo falta testear)

CORTO PLAZO (1-2 semanas):
  Fase 5  — Emails transaccionales
  Fase 6  — Envíos
  Fase 15 — Stripe LIVE → LANZAMIENTO MÍNIMO VIABLE

MEDIO PLAZO (3-4 semanas):
  Fase 7  — Panel de cuenta conectado
  Fase 8  — Wishlist & Reviews
  Fase 9  — Membresía/Lealtad

LARGO PLAZO (1-2 meses):
  Fase 10 — Cotizador conectado
  Fase 11 — Facturación electrónica
  Fase 12 — Admin panel custom
  Fase 13 — B2B
  Fase 14 — Infraestructura & Performance
```

---

## INSTRUCCIONES PARA CHATS NUEVOS

Al iniciar cada chat nuevo, di:
"Lee /Users/davidalejandroperezrea/Documents/DSD-Project/DSD-ROADMAP-OFICIAL.md y continúa con la Fase [X], paso [X.Y]"

Esto le da a Claude el contexto completo sin necesidad de adjuntar archivos.
