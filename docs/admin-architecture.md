# Arhenar Commerce — Admin Panel Architecture

> **Última actualización:** 2026-03-10
> **Aplica a:** Qorthe (Tenant 0) y cualquier tenant futuro de Arhenar Commerce

---

## 1. Visión general

El panel admin está construido sobre **un único sistema de temas** que gobierna
todos los colores, espaciados, tipografías y componentes UI a través de CSS custom
properties (CSS vars) aplicadas en `:root`.

```
AdminThemeProvider
  └── applyTokensToDOM()   ← escribe CSS vars en :root
        └── 41 módulos     ← leen var(--token) directamente
```

Cualquier cambio de tema modifica **un solo objeto** — todos los módulos
lo reflejan automáticamente sin recompilación.

---

## 2. Archivos clave

| Archivo | Rol |
|---------|-----|
| `src/admin/types.ts` | Tipos TypeScript: `AdminDesignTokens`, `AdminUITheme`, `AdminSidebarProps`, `AdminHeaderProps` |
| `src/admin/themes/themeRegistry.ts` | Registro de temas disponibles. Agregar nuevos temas aquí |
| `src/contexts/AdminThemeContext.tsx` | Provider único. Hook `useAdminTheme()`. Aplica tokens al DOM |
| `src/admin/navigation.ts` | Navegación declarativa. Los temas la consumen pero no la definen |
| `src/admin/themes/default/` | Componentes del tema `dsd-classic` (Sidebar, Header, Card, Badge...) |
| `app/(admin)/layout.tsx` | Layout raíz: AuthGate → AdminThemeProvider → AdminProvider → AdminShell |

---

## 3. Sistema de tokens

Cada tema define un objeto `AdminDesignTokens` con ~45 tokens tipados.

### Tokens disponibles en todos los módulos (vía CSS vars):

```css
/* Fondos */
var(--bg)           /* fondo de página */
var(--surface)      /* cards, modales */
var(--surface2)     /* inputs, filas alternas */
var(--surface3)     /* hover states */
var(--surface-rgb)  /* para rgba(var(--surface-rgb), 0.7) */

/* Texto */
var(--text)           /* texto principal */
var(--text-secondary) /* subtítulos */
var(--text-muted)     /* placeholders */

/* Bordes */
var(--border)        /* bordes estándar */
var(--border-strong) /* bordes de énfasis */
var(--shadow)        /* sombra sutil */
var(--shadow-lg)     /* sombra cards */

/* Acento (brand) */
var(--accent)        /* color primario */
var(--accent-hover)  /* hover del primario */
var(--accent-subtle) /* fondo sutil de acento */
var(--accent-text)   /* texto sobre accent */

/* Sidebar */
var(--sidebar-bg) var(--sidebar-text) var(--sidebar-active) etc.

/* Header */
var(--header-bg) var(--header-border) var(--header-text)

/* Estados semánticos */
var(--success) var(--success-subtle)
var(--error)   var(--error-subtle)
var(--warning) var(--warning-subtle)
var(--info)    var(--info-subtle)

/* Radios */
var(--radius-card) var(--radius-button) var(--radius-input) var(--radius-badge)

/* Tipografía */
var(--font-heading) var(--font-body) var(--font-mono) var(--font-size-base)
```

### Fallback system

Si un tema parcial omite un token, `applyTokensToDOM` usa automáticamente
el valor correspondiente de `dsd-classic`. En desarrollo, un `console.warn`
indica exactamente qué token falta y qué fallback se usó.

---

## 4. Cómo consumen el tema los módulos

Patrón estándar en cualquier módulo admin:

```typescript
import { useAdminTheme } from '@/src/contexts/AdminThemeContext';

export default function MiModulo() {
  const { theme } = useAdminTheme();
  const t = theme.tokens;

  return (
    <div style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}>
      <h1 style={{ color: t.text, fontFamily: t.fontHeading }}>Título</h1>
    </div>
  );
}
```

**Reglas obligatorias:**
- Cero colores hex fijos (`#C5A065`, `#2D2419`, etc.)
- Cero clases Tailwind de color (`bg-white`, `text-gray-900`, etc.)
- Siempre `t.token` en `style={{}}` o `var(--token)` en CSS

---

## 5. Cómo agregar un nuevo tema

1. **Crear los tokens** — copiar `dsd-classic` como base:

```typescript
// src/admin/themes/mi-tema/index.ts
import type { AdminUITheme } from '@/src/admin/types';

export const miTema: AdminUITheme = {
  id: 'mi-tema',
  name: 'Mi Tema',
  mode: 'light',                    // 'light' | 'dark'
  description: 'Descripción breve',
  preview: { sidebar: '#1a1a2e', bg: '#f8f9fa', accent: '#6366f1', card: '#ffffff' },
  Sidebar: DefaultSidebar,           // opcional: crear Sidebar propio
  Header: DefaultHeader,             // opcional: crear Header propio
  tokens: {
    bg: '#f8f9fa',
    surface: '#ffffff',
    // ... todos los tokens requeridos por AdminDesignTokens
  },
  fonts: { heading: '...', body: '...', mono: '...' },
};
```

2. **Registrar en themeRegistry.ts:**

```typescript
import { miTema } from './mi-tema';

export const adminThemes: Record<string, AdminUITheme> = {
  'dsd-classic': dsdClassicTheme,
  'mi-tema':     miTema,           // ← agregar aquí
};
```

3. **Listo.** Los 41 módulos existentes adoptan el nuevo tema automáticamente.
   El ThemeEditorPage (`/admin/theme`) lo mostrará en la lista de selección.

---

## 6. Sistema de navegación

La navegación es **declarativa** — los temas la consumen pero no la controlan.

```typescript
// src/admin/navigation.ts
export interface NavItem {
  id: AdminPage;     // 'dashboard' | 'orders' | 'products' | ...
  label: string;
  icon: LucideIcon;
  badge?: number;    // notificaciones (ej: pedidos pendientes)
  route?: string;    // si se omite, se deriva como /admin/{id}
}
```

Para agregar una nueva página al panel:
1. Añadir el ID en el union type `AdminPage`
2. Agregar el ícono en `adminIcons`
3. Agregar el item en el `NavGroup` correspondiente de `adminNavigation`
4. Crear la página en `app/(admin)/` y el componente en `src/components/admin/`

---

## 7. Estructura del layout

```
app/(admin)/layout.tsx
  AdminThemeProvider          ← monta una sola vez, aplica tokens al DOM
    AuthGate                  ← verifica sesión + autorización
      AdminProvider           ← estado del panel (currentPage, period, etc.)
        AdminShell
          Sidebar             ← componente del tema activo
          Header              ← componente del tema activo
          <main>
            {children}        ← página activa del panel
```

**Regla:** `AdminThemeProvider` siempre es el wrapper exterior.
Nunca anidar otro ThemeProvider dentro del panel admin.

---

## 8. Convenciones de código (no negociables)

| Regla | Correcto | Incorrecto |
|-------|----------|------------|
| Colores | `t.accent` / `var(--accent)` | `#C5A065` / `bg-amber-500` |
| Íconos | Lucide React | Emojis |
| Modales de confirmación | Componente inline | `window.confirm()` |
| Datos iniciales | API real | `useState([mockData])` |
| TypeScript | 0 errores `npx tsc --noEmit` | `as any` / `@ts-ignore` |

---

## 9. DSD como Tenant 0 de Arhenar Commerce

`Qorthe` es el Tenant 0 — corre sobre la misma infraestructura
que cualquier tenant futuro de Arhenar Commerce.

- El tema `dsd-classic` es la identidad visual de DSD
- Otros tenants tendrán sus propios temas registrados en `themeRegistry.ts`
- La arquitectura ya soporta múltiples temas — solo falta registrarlos
- Los módulos admin son productos de **Arhenar Commerce**, no de DSD

Para escalar a multi-tenant, el `themeRegistry` se migrará a una fuente
dinámica (DB por tenant) sin modificar ningún módulo existente.

---

## 10. Checklist pre-commit (architecture guardrails)

Antes de cada commit que modifique el panel admin, verificar:

- [ ] **Sin colores fijos** — cero `bg-white`, `text-gray-*`, `#hex`, `bg-[#...]`
- [ ] **Sin lógica de tema en módulos** — los módulos solo consumen `useAdminTheme()`
- [ ] **Sin nuevos contextos globales** sin justificación (ya existen: Theme, Auth, Admin)
- [ ] **Sin imports cruzados entre módulos** — la lógica compartida va en `src/lib/`
- [ ] **Sin segundos sistemas de temas** — todo pasa por `AdminThemeContext`
- [ ] **AdminShell intacto** — cambios al shell son excepcionales y justificados
- [ ] **Módulos < 400 líneas** — si supera, considerar split en sub-componentes
- [ ] **Rutas `/admin/*` no renombradas** sin actualizar navegación y docs
- [ ] **Tema nuevo = solo themeRegistry.ts** — si requiere tocar módulos, hay un bug de arquitectura
- [ ] **`/docs/admin-architecture.md` actualizado** si hubo cambio estructural
- [ ] **`npx tsc --noEmit` → 0 errores** antes del push
