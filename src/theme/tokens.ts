// ═══════════════════════════════════════════════════════════════
// src/theme/tokens.ts
// Design tokens del sistema de temas admin
// Fuente única de verdad — todos los componentes leen de aquí
// ═══════════════════════════════════════════════════════════════

export interface ThemeTokens {
  id: string;
  name: string;
  mode: "light" | "dark";
  description: string;

  // Layout
  sidebarWidth: number;
  sidebarCollapsedWidth: number;
  sidebarStyle: "wide" | "rail" | "mini";

  // Colores base
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;

  // Texto
  text: string;
  textSecondary: string;
  textMuted: string;

  // Bordes y sombras
  border: string;
  borderStrong: string;
  shadow: string;
  shadowLg: string;

  // Acento principal
  accent: string;
  accentHover: string;
  accentSubtle: string;
  accentText: string;

  // Sidebar
  sidebarBg: string;
  sidebarText: string;
  sidebarTextMuted: string;
  sidebarActive: string;
  sidebarActiveText: string;
  sidebarHover: string;
  sidebarBorder: string;
  sidebarAccent: string;

  // Header
  headerBg: string;
  headerBorder: string;
  headerText: string;

  // Estados semánticos
  success: string;
  successSubtle: string;
  error: string;
  errorSubtle: string;
  warning: string;
  warningSubtle: string;
  info: string;
  infoSubtle: string;

  // Tipografía
  fontHeading: string;
  fontBody: string;
  fontMono: string;
  fontSizeBase: string;
  fontWeightHeading: string;

  // Radios
  radiusCard: string;
  radiusButton: string;
  radiusInput: string;
  radiusBadge: string;

  // Efectos especiales opcionales
  glassBlur?: string;
  glassBg?: string;
  glassBorder?: string;
  gradientAccent?: string;
}

// ═══════════════════════════════════════════════════════════════
// TEMA BASE — DSD Classic
// Madera cálida, serif, dorado. Referencia para todos los nuevos temas.
// ═══════════════════════════════════════════════════════════════
export const dsdClassic: ThemeTokens = {
  id: "dsd-classic",
  name: "DSD Classic",
  mode: "light",
  description: "Tonos cálidos de madera artesanal con acentos dorados. El original.",
  sidebarWidth: 260,
  sidebarCollapsedWidth: 64,
  sidebarStyle: "wide",
  bg: "#FAF8F5",
  surface: "#FFFFFF",
  surface2: "#F5F2EE",
  surface3: "#EDE8E1",
  text: "#2D2419",
  textSecondary: "#7A6148",
  textMuted: "#B09878",
  border: "#E8E0D4",
  borderStrong: "#C8B89A",
  shadow: "0 1px 3px rgba(45,36,25,0.07)",
  shadowLg: "0 8px 24px rgba(45,36,25,0.10)",
  accent: "#C5A065",
  accentHover: "#A8844E",
  accentSubtle: "rgba(197,160,101,0.12)",
  accentText: "#FFFFFF",
  sidebarBg: "#2D2419",
  sidebarText: "#E8E0D4",
  sidebarTextMuted: "#8B7355",
  sidebarActive: "rgba(197,160,101,0.18)",
  sidebarActiveText: "#C5A065",
  sidebarHover: "rgba(255,255,255,0.06)",
  sidebarBorder: "rgba(255,255,255,0.07)",
  sidebarAccent: "#C5A065",
  headerBg: "#FFFFFF",
  headerBorder: "#E8E0D4",
  headerText: "#2D2419",
  success: "#16A34A",
  successSubtle: "rgba(22,163,74,0.10)",
  error: "#DC2626",
  errorSubtle: "rgba(220,38,38,0.10)",
  warning: "#D97706",
  warningSubtle: "rgba(217,119,6,0.10)",
  info: "#2563EB",
  infoSubtle: "rgba(37,99,235,0.10)",
  fontHeading: "'Playfair Display', Georgia, serif",
  fontBody: "'Inter', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', monospace",
  fontSizeBase: "13px",
  fontWeightHeading: "600",
  radiusCard: "12px",
  radiusButton: "8px",
  radiusInput: "8px",
  radiusBadge: "6px",
};

// ═══════════════════════════════════════════════════════════════
// REGISTRO — agregar nuevos temas aquí después de Figma
// ═══════════════════════════════════════════════════════════════
export const THEMES: Record<string, ThemeTokens> = {
  "dsd-classic": dsdClassic,
};

export const THEME_LIST: ThemeTokens[] = Object.values(THEMES);

export function getThemeTokens(id: string): ThemeTokens {
  return THEMES[id] ?? dsdClassic;
}
