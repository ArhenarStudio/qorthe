# DSD V5 – Mapping (PAGE / MODULE / WIDGET / CONTENT)

Fecha: 2026-02-10. Solo mapping; no se renombraron archivos.

---

## PAGE__ → app/

| PAGE__ | app/ route |
|--------|------------|
| PAGE__HOME | app/page.tsx |
| PAGE__PRODUCTS | app/products/page.tsx |
| PAGE__PRODUCT_DETAIL | app/products/[handle]/page.tsx |
| PAGE__CART | app/cart/page.tsx |
| PAGE__CHECKOUT | app/checkout/page.tsx |
| PAGE__CHECKOUT_PAYMENT | app/checkout/payment/page.tsx |
| PAGE__CHECKOUT_CONFIRMATION | app/checkout/confirmation/page.tsx |
| PAGE__LOGIN | app/login/page.tsx |
| PAGE__REGISTER | app/register/page.tsx |
| PAGE__ACCOUNT | app/account/page.tsx |
| PAGE__ACCOUNT_ORDERS | app/account/orders/page.tsx |
| PAGE__ACCOUNT_ORDER_DETAIL | app/account/orders/[id]/page.tsx |
| PAGE__ACCOUNT_WISHLIST | app/account/wishlist/page.tsx |
| PAGE__ACCOUNT_ADDRESSES | app/account/addresses/page.tsx |
| PAGE__FORGOT_PASSWORD | app/forgot-password/page.tsx |
| PAGE__UPDATE_PASSWORD | app/update-password/page.tsx |
| PAGE__ABOUT | app/about/page.tsx |
| PAGE__TEAM | app/team/page.tsx |
| PAGE__MISSION_VISION | app/mission-vision/page.tsx |
| PAGE__TIMELINE | app/timeline/page.tsx |
| PAGE__GALLERY | app/gallery/page.tsx |
| PAGE__FAQ | app/faq/page.tsx |
| PAGE__BLOG | app/blog/page.tsx |
| PAGE__APPOINTMENT | app/appointment/page.tsx |
| PAGE__CERTIFICATIONS | app/certifications/page.tsx |
| PAGE__COMPARE | app/compare/page.tsx |
| PAGE__FINANCING_CALCULATOR | app/financing-calculator/page.tsx |
| PAGE__TERMS | app/terms/page.tsx |
| PAGE__PRIVACY | app/privacy/page.tsx |
| PAGE__COOKIES | app/cookies/page.tsx |

---

## MODULE__ → src/modules/

| MODULE__ | src/modules/ path |
|----------|-------------------|
| MODULE__APP_STATE | src/modules/app-state |
| MODULE__AUTH | src/modules/auth |
| MODULE__CART | src/modules/cart |
| MODULE__CHAT_WIDGET | src/modules/chat-widget |
| MODULE__CHECKOUT | src/modules/checkout |
| MODULE__CONTENT_PAGES | src/modules/content-pages |
| MODULE__CUSTOMER_ACCOUNT | src/modules/customer-account |
| MODULE__FINANCING_CALCULATOR | src/modules/financing-calculator |
| MODULE__FOOTER | src/modules/footer |
| MODULE__HEADER | src/modules/header |
| MODULE__LANDING | src/modules/landing |
| MODULE__NEWSLETTER | src/modules/newsletter |
| MODULE__PRODUCT | src/modules/product |
| MODULE__PRODUCT_COMPARISON | src/modules/product-comparison |
| MODULE__PRODUCT_REVIEWS | src/modules/product-reviews |
| MODULE__SETTINGS | src/modules/settings |
| MODULE__WHATSAPP_BUTTON | src/modules/whatsapp-button |

---

## WIDGET__ → src/modules/ o src/components/shared/

| WIDGET__ | Ruta |
|----------|------|
| WIDGET__GLOBAL_CONTAINER | app/components/GlobalWidgets.tsx |
| WIDGET__WHATSAPP | src/modules/whatsapp-button/components/WhatsAppButton.tsx |
| WIDGET__CHAT | src/modules/chat-widget/components/ChatWidget.tsx |
| WIDGET__SETTINGS | src/modules/settings/components/SettingsModule.tsx |
| WIDGET__SCROLL_TO_TOP | src/components/shared/ScrollToTop.tsx |
| WIDGET__COOKIE_CONSENT | src/components/shared/CookieConsent.tsx |
| WIDGET__CART_DRAWER | src/modules/cart/components/CartDrawer.tsx |
| WIDGET__NEWSLETTER | src/modules/newsletter/components/Newsletter.tsx |

---

## CONTENT__ (legal) → app/ o páginas legales

| CONTENT__ | Ruta |
|-----------|------|
| CONTENT__TERMS | app/terms/page.tsx |
| CONTENT__PRIVACY | app/privacy/page.tsx |
| CONTENT__COOKIES | app/cookies/page.tsx |

Backups de legal (pre-V3): `src/figma-versions/backups/terms-page.pre-v3-design-2026-02-06.tsx`, `privacy-page.*`, `cookies-page.*`.
