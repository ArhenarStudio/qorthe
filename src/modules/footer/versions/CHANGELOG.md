# Changelog - Footer

Registro de cambios por versión del módulo Footer.

---

## V1 (actual / backup)

- **Archivo:** `Footer.v1.tsx`
- **Estado:** Backup de la versión en producción.
- **Características:**
  - Logo DavidSon's Design
  - Descripción, navegación (Productos, Nosotros, Contacto, Catálogo)
  - Contacto (email, ubicación)
  - Barra inferior: copyright, toggle tema, enlaces legales (Privacidad, Términos, Cookies)
  - Soporte multiidioma (ES/EN) y dark mode
  - Props: `language`, `isDarkMode`, `onToggleDarkMode`, `onNavigatePrivacy`, `onNavigateTerms`, `onNavigateCookies`, `translations`

---

## V2 - 2026-02-09 (aplicado desde Figma DSD V2)

### Cambios desde V1
- Layout: logo + descripción centrados arriba (título más grande), luego 3 columnas: Navegación, Contacto, Redes Sociales.
- Nueva descripción de empresa (copy fijo ES/EN): "Una herencia sin nombre que hoy encuentra forma..."
- Catálogo como botón con `onNavigateCatalog` (opcional).
- Sección "Síguenos" con iconos: Facebook, X, Instagram, YouTube, TikTok, Pinterest, LinkedIn.
- Barra inferior: copyright, legales (Privacidad, Términos, Cookies), toggle tema, "Powered by RockStage" resaltado.
- Se mantiene `onNavigateCookies` y enlace a Política de Cookies.

### Archivos afectados
- `components/Footer.tsx` (actualizado a V2)
- `versions/Footer.v1.tsx` (backup del estado anterior)
