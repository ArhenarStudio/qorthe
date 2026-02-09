# Changelog – Módulo Product

## V1 - 2026-02-09 – Backup y documentación del sistema modular

Backups de los componentes actuales guardados en `versions/*.v1.tsx`. El componente activo de cada uno está en `components/`.

### ProductBreadcrumb
- **Ubicación activa:** `components/ProductBreadcrumb.tsx`
- **Backup:** `versions/ProductBreadcrumb.v1.tsx`
- **Contenido:** Navegación tipo breadcrumb (Inicio / Categoría / Nombre producto) con `Link` de Next.js. Props: `category`, `categoryHref`, `productName`.

### ProductGallery
- **Ubicación activa:** `components/ProductGallery.tsx`
- **Backup:** `versions/ProductGallery.v1.tsx`
- **Contenido:** Galería de imágenes con imagen principal y miniaturas; estado de índice activo. Exporta tipo `ProductImage`. Usa `next/image`. Props: `images`, `productTitle`.

### ProductInfo
- **Ubicación activa:** `components/ProductInfo.tsx`
- **Backup:** `versions/ProductInfo.v1.tsx`
- **Contenido:** Bloque de información del producto: título, precio (con opcional originalPrice/descuento), descripción, características, dimensiones, selector de cantidad, botón “Agregar al Carrito”, datos de fabricación/garantía/artesano. Props: `title`, `price`, `description`, `features`, `dimensions`, etc.

### ProductTabs
- **Ubicación activa:** `components/ProductTabs.tsx`
- **Backup:** `versions/ProductTabs.v1.tsx`
- **Contenido:** Tabs (Descripción, Especificaciones, Cuidado y Mantenimiento, El Artesano) con contenido en HTML. Usa `next/image` para foto del artesano. Props: `description`, `specifications`, `care`, `artist`.

### ProductDetail
- **Ubicación activa:** `components/ProductDetail.tsx`
- **Backup:** `versions/ProductDetail.v1.tsx`
- **Contenido:** Página completa de detalle de producto: Header/Footer de módulos, botón volver, ProductBreadcrumb, ProductGallery, ProductInfo, ProductTabs y bloque de productos relacionados. Exporta tipo `DetailProduct`. Props: `product`, `relatedProducts`, callbacks de navegación e idioma/tema.

### ProductCatalog
- **Ubicación activa:** `components/ProductCatalog.tsx`
- **Backup:** `versions/ProductCatalog.v1.tsx`
- **Contenido:** Página de catálogo: Header/Footer de módulos, título, filtros por categoría (all/chairs/tables/bedrooms), grid de productos con imagen, precio, descripción y “Ver Detalles”. Exporta tipo `CatalogProduct`. Props: `products`, `onViewProduct`, `onBackToHome`, idioma/tema y callbacks de navegación/cuenta.

### Uso en el proyecto
- **app/products/page.tsx:** importa `ProductCatalog` y `CatalogProduct` desde `@/modules/product`.
- **app/products/[handle]/page.tsx:** importa `ProductBreadcrumb`, `ProductGallery`, `ProductInfo`, `ProductTabs` desde `@/modules/product`; usa `ProductDetailLayout` local que renderiza esos componentes.

### Diff Figma V1 → V2
Según el reporte existente (`src/figma-versions/migration-logs/diff-V1-vs-V2-2026-02-09.md`), **ProductDetail.tsx** y **ProductCatalog.tsx** figuran como **sin cambios** entre DSD V1 y DSD V2. No se aplicaron cambios de Figma en esta migración.
