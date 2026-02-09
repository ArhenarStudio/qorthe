# Changelog – Módulo Checkout

## V1 - 2026-02-09 – Backup y rutas en app

Backups de los componentes actuales en `versions/*.v1.tsx`. Componentes activos en `components/`. Rutas de la app creadas como wrappers que importan desde `@/modules/checkout`.

### CheckoutPage
- **Ubicación activa:** `components/CheckoutPage.tsx`
- **Backup:** `versions/CheckoutPage.v1.tsx`
- **Contenido:** Paso 1 del checkout: dirección de envío, método de envío, resumen del pedido. Props: idioma/tema, callbacks de navegación, `cartItems`, `savedAddresses`, `selectedAddressId`, `onSelectAddress`, `onAddAddress`, `onEditAddress`, `onNavigatePayment`.
- **Ruta app:** `app/checkout/page.tsx` → wrapper con estado y datos mock.

### PaymentPage
- **Ubicación activa:** `components/PaymentPage.tsx`
- **Backup:** `versions/PaymentPage.v1.tsx`
- **Contenido:** Paso 2: método de pago (tarjeta, PayPal, transferencia), formulario de tarjeta, resumen. Props: idioma/tema, `cartItems`, `subtotal`, `shipping`, `total`, `onPlaceOrder`, `onNavigateCheckout`.
- **Ruta app:** `app/checkout/payment/page.tsx` → wrapper; `onPlaceOrder` redirige a `/checkout/confirmation?orderId=...`.

### OrderConfirmationPage
- **Ubicación activa:** `components/OrderConfirmationPage.tsx`
- **Backup:** `versions/OrderConfirmationPage.v1.tsx`
- **Contenido:** Paso 3: confirmación del pedido, número de orden, detalles, dirección de envío, resumen, próximos pasos. Props: idioma/tema, `orderId`, `orderDate`, `items`, totales, `shippingAddress`, `paymentMethod`, `estimatedDelivery`, `userEmail`, callbacks a home/products/orders.
- **Ruta app:** `app/checkout/confirmation/page.tsx` → wrapper con `useSearchParams` para `orderId`; datos mock para el resto.

### Cambios adicionales
- **app/cart/page.tsx:** `onCheckout` actualizado de `console.log("Checkout")` a `window.location.href = "/checkout"` para enlazar con la nueva ruta.

### Diff Figma V1 → V2
Según `src/figma-versions/migration-logs/diff-V1-vs-V2-2026-02-09.md`, **CheckoutPage.tsx**, **PaymentPage.tsx** y **OrderConfirmationPage.tsx** figuran como **sin cambios** entre DSD V1 y DSD V2. No se aplicaron cambios de Figma.
