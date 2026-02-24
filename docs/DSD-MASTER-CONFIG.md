# ═══════════════════════════════════════════════════════════════
# DavidSon's Design — MASTER CONFIG & CREDENTIALS
# ═══════════════════════════════════════════════════════════════
#
# ⚠️  CONFIDENCIAL — NO COMMITEAR A GIT
#
# ARCHIVO ÚNICO de referencia para credenciales, env vars,
# IDs internos, y problemas conocidos.
#
# Para entender QUÉ HACE cada servicio → ver DSD-ARCHITECTURE.md
# Para ver el plan de trabajo → ver DSD-ROADMAP-OFICIAL.md
#
# Última actualización: 2026-02-24
# ═══════════════════════════════════════════════════════════════


## 1. CREDENCIALES POR SERVICIO

### ─────────────────────────────────────────
### 1.1 VERCEL (Frontend Hosting)
### ─────────────────────────────────────────
```
Dashboard:    https://vercel.com/david-alejandro-perez-reas-projects/davidsons-design
Project:      davidsons-design
Login:        OAuth via GitHub (StudioRockStage)
Plan:         Hobby (gratis)
Domains:      davidsonsdesign.com, www.davidsonsdesign.com
Preview:      https://davidsons-design.vercel.app
Git Source:   StudioRockStage/davidsons-design (main) — auto-deploy
```

**ENV VARS (8 configuradas — Production + Preview + Development):**
```
NEXT_PUBLIC_MEDUSA_BACKEND_URL       = https://urchin-app-u62qc.ondigitalocean.app
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY   = pk_***REDACTED***
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY   = pk_test_***REDACTED***
STRIPE_SECRET_KEY                    = sk_test_***REDACTED***
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY   = TEST-***REDACTED***  ← 🟡 TEST MODE (cambiar a PROD antes de go-live)
MERCADOPAGO_ACCESS_TOKEN             = TEST-***REDACTED***  ← 🟡 TEST MODE
NEXT_PUBLIC_SUPABASE_URL             = https://tpcwpkdicrhmkopokitw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY        = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...mzpVwaHEswU4rzzMr5ClXxcNMCaZwmNZIeaw9vuu-Tw
```


### ─────────────────────────────────────────
### 1.2 DIGITALOCEAN APP PLATFORM (Backend)
### ─────────────────────────────────────────
```
Dashboard:    https://cloud.digitalocean.com/apps/2afb6cf5-1e70-4740-9161-7ed74ade8032
Account:      My Team (MT)
App Name:     urchin-app
App ID:       2afb6cf5-1e70-4740-9161-7ed74ade8032
Region:       NYC1 (New York)
URL:          https://urchin-app-u62qc.ondigitalocean.app
Health:       https://urchin-app-u62qc.ondigitalocean.app/health → ✅ OK
Instance:     Basic ($12/mo) — 1 vCPU, 1GB RAM
Git Source:   StudioRockStage/davidsons-backend (main) — Dockerfile
Port:         9000
Login:        OAuth (cuenta DigitalOcean de David)
```

**ENV VARS (11 configuradas, 3 pendientes):**
```
✅ DATABASE_URL                  = (linked to Neon — Run+Build scope)
✅ STORE_CORS                    = https://davidsonsdesign.com,https://www.davidsonsdesign.com,https://davidsons-design.vercel.app,http://localhost:3000
✅ ADMIN_CORS                    = https://davidsonsdesign.com,https://www.davidsonsdesign.com,https://davidsons-design.vercel.app,http://localhost:9000
✅ AUTH_CORS                     = https://davidsonsdesign.com,https://www.davidsonsdesign.com,https://davidsons-design.vercel.app,http://localhost:3000
✅ JWT_SECRET                    = (encrypted)
✅ COOKIE_SECRET                 = (encrypted)
✅ MERCADOPAGO_ACCESS_TOKEN      = (encrypted)
✅ STRIPE_API_KEY                = (encrypted)
✅ NODE_ENV                      = production
✅ MEDUSA_ADMIN_ONBOARDING_TYPE  = default
❌ REDIS_URL                     — NO configurado (Fase 14.1)
❌ STRIPE_WEBHOOK_SECRET         — NO configurado (Fase 4.3)
❌ MERCADOPAGO_WEBHOOK_SECRET    — NO configurado (Fase 4.4)
```

**⚠️ Admin UI Medusa:** /app NO CARGA en producción. Requiere investigación.


### ─────────────────────────────────────────
### 1.3 NEON (PostgreSQL Database)
### ─────────────────────────────────────────
```
Dashboard:    https://console.neon.tech/app/projects/broad-sun-21599350
Project ID:   broad-sun-21599350
Project Name: davidsons-backend
Branch:       production (br-lingering-haze-aicjk9i7)
Database:     neondb
Plan:         Free tier (0.5 GB, auto-suspend)
SQL Editor:   https://console.neon.tech/app/projects/broad-sun-21599350/branches/br-lingering-haze-aicjk9i7/sql-editor?database=neondb
Login:        OAuth (cuenta Neon de David)
```

**Datos actuales en DB:**
- 4 productos (tablas de cortar artesanales, precios en MXN)
- 1 región: México (MXN)
- 1 sales channel: Default Sales Channel
- 1 admin user: admin@davidsonsdesign.com
- Shipping options configuradas


### ─────────────────────────────────────────
### 1.4 SUPABASE (Auth)
### ─────────────────────────────────────────
```
Dashboard:    https://supabase.com/dashboard/project/tpcwpkdicrhmkopokitw
Project Ref:  tpcwpkdicrhmkopokitw
API URL:      https://tpcwpkdicrhmkopokitw.supabase.co
Anon Key:     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...mzpVwaHEswU4rzzMr5ClXxcNMCaZwmNZIeaw9vuu-Tw
Plan:         Free tier (50K users, 1GB DB)
Login:        OAuth (cuenta Supabase de David)
```

**Tablas custom:** Ninguna aún (solo auth built-in)
**Uso actual:** Login/registro, OAuth, sessions
**Uso futuro:** Wishlists, Reviews, Loyalty, Quotations, Billing


### ─────────────────────────────────────────
### 1.5 STRIPE (Pagos Tarjeta)
### ─────────────────────────────────────────
```
Dashboard:    https://dashboard.stripe.com/test/apikeys
Account ID:   acct_1T2mj80SK6lqpnLv
Mode:         ⚠️ TEST
Login:        Cuenta Stripe de David
```

**Credenciales TEST:**
```
PK: pk_test_***REDACTED***
SK: sk_test_***REDACTED***
Webhook: ❌ NO CONFIGURADO (Fase 4.3)
```

**Credenciales LIVE:** No activadas (Fase 15)

**Tarjetas de prueba:**
- Éxito: `4242 4242 4242 4242` (cualquier fecha futura, cualquier CVC 3 dígitos)
- Rechazo: `4000 0000 0000 0002`
- Auth requerida: `4000 0025 0000 3155`


### ─────────────────────────────────────────
### 1.6 MERCADOPAGO (Pagos México)
### ─────────────────────────────────────────
```
Dashboard:    https://www.mercadopago.com.mx/developers/panel/app/5033797200651848
App ID:       5033797200651848
Login:        Cuenta MP de David
Webhook:      ❌ NO CONFIGURADO (Fase 4.4)
```

**Credenciales PRODUCCIÓN (para go-live — Fase 15):**
```
Public Key:     APP_USR-***REDACTED***
Access Token:   APP_USR-***REDACTED***
```

**Credenciales TEST (para e2e testing con tarjetas de prueba):**
```
Public Key:     TEST-***REDACTED***
Access Token:   TEST-***REDACTED***
```

**🟡 Estado actual en Vercel + DO:** TEST (cambiado 2026-02-24 para e2e testing)

**Tarjetas de prueba México (usar con credenciales TEST):**
```
Mastercard:       5474 9254 3267 0366  CVV: 123  Exp: 11/30
Visa:             4075 5957 1648 3764  CVV: 123  Exp: 11/30
Mastercard Deb:   5579 0534 6148 2647  CVV: 1234 Exp: 11/30
Visa Debito:      4189 1412 2126 7633  CVV: 123  Exp: 11/30

Nombre titular controla resultado:
  APRO → Pago aprobado
  OTHE → Rechazado
  CONT → Pendiente
  CALL → Rechazado con validación
```
**⚠️ IMPORTANTE: Revertir a credenciales de PRODUCCIÓN antes de go-live (Fase 15)**
**📝 Para revertir: cambiar NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY y MERCADOPAGO_ACCESS_TOKEN en Vercel + DO a los valores APP_USR-... de arriba**


### ─────────────────────────────────────────
### 1.7 GITHUB
### ─────────────────────────────────────────
```
Org:          StudioRockStage
Frontend:     https://github.com/StudioRockStage/davidsons-design (main, público)
Backend:      https://github.com/StudioRockStage/davidsons-backend (main, privado)
Auth:         SSH key configurada en Cursor
```


### ─────────────────────────────────────────
### 1.8 CLOUDFLARE (DNS)
### ─────────────────────────────────────────
```
Dominio:      davidsonsdesign.com
Función:      DNS → Vercel
Dashboard:    ❓ Pendiente confirmar URL exacta
Login:        ❓ Pendiente confirmar credenciales
```


### ─────────────────────────────────────────
### 1.9 MEDUSA ADMIN
### ─────────────────────────────────────────
```
URL Producción: https://urchin-app-u62qc.ondigitalocean.app/app ← ❌ NO FUNCIONA
URL Local:      http://localhost:9000/app
Email:          admin@davidsonsdesign.com
Password:       ***REDACTED***  ← ✅ Reseteado 2026-02-23 via Neon SQL (scrypt-kdf hash)
⚠️ NOTA: También existe dev@davidsonsdesign.com (password desconocido)
```


---


## 2. IDs INTERNOS DE MEDUSA (Producción)

```
Region México:         reg_01KJ4BB2Z46YY1HWG0Q2N4KBVX
Sales Channel:         sc_01KJ485GC7X4594D7NK780ECQM
Publishable API Key:   pk_***REDACTED***
Admin User:            user_01KJ4E4TQXYGBJH435C79PZVBS

Shipping Options:
  so_01KJ619T56SW3JP5JSKEAWXC5V  — Envío Estándar México ($150 MXN)
  so_01KJ61A3JQW6X3RXS186XT17R1  — Envío Gratis (compras +$2,500)
  ⚠️ so_01KHYGRQ2SMPV2TQ29PKFGJWSD — ID viejo hardcodeado en frontend, YA NO EXISTE

Stock Location:    sloc_01KJ4BE3A3RX49GZ0BVT62AERR (Taller DavidSons)

Inventory (10 unidades c/u — actualizado 2026-02-23):
  iitem_01KJ4E6ZV3Z5A3JA8JQ6P44DT8  — DSD-PAROTA-MED-001
  iitem_01KJ4E7RZSXHSRCTYVYCRP3BGT  — DSD-CEDRO-GDE-001
  iitem_01KJ4E7TCKR7NM9DD406FHYV69  — DSD-ROSA-MED-001
  iitem_01KJ4E7VTZR2V5FX6H215QBN63  — DSD-SET3-001

Productos:
  prod_01KJ4E6ZFNMMVE9SQES7TJDH1J  — Tabla para Picar y Charcutería de Parota ($850 MXN)
  prod_01KJ4E7RPPZZ4N9YR0PE0Y7RBS  — Tabla para Cortar de Cedro Rojo ($1,200 MXN)
  prod_01KJ4E7T4VJVW4GPGPDVNZM5AC  — Tabla Gourmet de Rosa Morada
  prod_01KJ4E7VJMBHMZC4M78RB495VH  — Set de 3 Tablas Artesanales DavidSons
```


---


## 3. CONFIGURACIÓN LOCAL (Desarrollo)

### Frontend
```
Directorio:  /Users/davidalejandroperezrea/Documents/DSD-Project/frontend
Comando:     npm run dev (puerto 3000)
Env file:    .env.local
```

### Backend
```
Directorio:  /Users/davidalejandroperezrea/Documents/DSD-Project/backend
Comando:     npx medusa develop (puerto 9000)
Env file:    .env
DB local:    postgres://davidalejandroperezrea@localhost/medusa-davidsons-backend
Redis local: redis://localhost:6379
```


---


## 4. PROBLEMAS CONOCIDOS / BLOCKERS

| # | Problema | Impacto | Fase |
|---|----------|---------|------|
| B1 | Admin UI Medusa no carga en prod (/app) | No gestionar productos via UI | Investigar |
| B2 | ~~Admin password no funciona en prod~~ | ✅ RESUELTO 2026-02-23 | — |
| B8 | ~~Stripe PaymentElement unmount en submit~~ | ✅ RESUELTO 2026-02-24 (overlay pattern) | — |
| B3 | Redis no configurado en producción | Sin caché, sin jobs | Fase 14.1 |
| B4 | Webhooks Stripe/MP no configurados | Pagos no confirman automáticamente | Fase 4.3-4.4 |
| B5 | Emails transaccionales no configurados | Cliente no recibe confirmaciones | Fase 5 |
| B6 | Envíos API no conectado | Costos de envío no son reales | Fase 6 |
| B7 | Stripe en TEST mode | No se pueden hacer cobros reales | Fase 15 |


---


## 5. API ROUTES DEL FRONTEND (CHECKOUT)

```
POST /api/checkout/preflight         — Valida cart antes de pago (email, address, shipping vigente)
POST /api/mercadopago/process-payment — Cobra con MP (preflight inline + auto-refund si falla orden)
POST /api/stripe/create-payment-intent — Crea PaymentIntent de Stripe
POST /api/stripe/confirm-payment       — Confirma pago Stripe y crea orden
```

### Guardrails implementados (2026-02-24):
- Preflight validation: cart debe tener email, address, shipping method válido, items, total > 0
- Server-side amount validation: monto del frontend se ignora, se usa cart.total de Medusa
- Idempotency keys: `mp_pay_{cart_id}_{10min_bucket}` para pagos, `refund_{payment_id}_{cart_id}` para refunds
- Auto-refund: si completeCartToOrder() falla después del pago, se inicia reembolso automático vía MP API
- X-Idempotency-Key obligatorio en todos los calls a MP API

### Problema conocido:
- El Payment Brick de MP captura directamente (no soporta authorize/reserve fácilmente)
- Por eso usamos "preflight + refund" en vez de "authorize → capture"
- Evaluar migrar a Checkout API o provider custom para authorize/capture en futuro


## 6. ARCHIVOS DE DOCUMENTACIÓN DEL PROYECTO

```
/Users/davidalejandroperezrea/Documents/DSD-Project/
├── DSD-MASTER-CONFIG.md    ← ESTE ARCHIVO (credenciales, env vars, IDs)
├── DSD-ARCHITECTURE.md     ← Qué hace cada servicio y su rol
├── DSD-ROADMAP-OFICIAL.md  ← Plan de trabajo por fases
├── DEPLOY-CONFIG.md        ← DEPRECADO → usar DSD-MASTER-CONFIG.md
├── DSD-CREDENTIALS.md      ← DEPRECADO → usar DSD-MASTER-CONFIG.md
├── frontend/               ← Código Next.js
└── backend/                ← Código MedusaJS
```


---


## 6. INSTRUCCIONES PARA CHATS NUEVOS

Al iniciar cada chat nuevo, comparte estos archivos y di:

```
Lee estos archivos y continúa donde nos quedamos:
1. DSD-ROADMAP-OFICIAL.md   (plan de trabajo)
2. DSD-MASTER-CONFIG.md     (credenciales y estado)
3. DSD-ARCHITECTURE.md      (qué hace cada servicio)

Continúa con: Fase [X], paso [X.Y]
```
