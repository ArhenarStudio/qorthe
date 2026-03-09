// ═══════════════════════════════════════════════════════════════
// src/theme/tokens.ts
// 5 temas admin con design tokens completos
// Fuente única de verdad — todos los componentes leen de aquí
// ═══════════════════════════════════════════════════════════════

export interface ThemeTokens {
  id: string;
  name: string;
  mode: "light" | "dark";
  description: string;

  // Layout
  sidebarWidth: number;       // px — ancho del sidebar expandido
  sidebarCollapsedWidth: number; // px — ancho colapsado / rail
  sidebarStyle: "wide" | "rail" | "mini"; // tipo de sidebar

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

  // Efectos especiales (glassmorphism, etc.)
  glassBlur?: string;
  glassBg?: string;
  glassBorder?: string;
  gradientAccent?: string;
}

// ═══════════════════════════════════════════════════════════════
// TEMA 1 — DSD Classic
// Madera cálida, serif, dorado. Sidebar ancho con grupos
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
// TEMA 2 — Indigo Glass
// Glassmorphism luminoso, rail compacto 68px, blur en cards
// ═══════════════════════════════════════════════════════════════
export const indigoGlass: ThemeTokens = {
  id: "indigo-glass",
  name: "Indigo Glass",
  mode: "light",
  description: "Glassmorphism luminoso con sidebar rail compacto y acentos índigo.",
  sidebarWidth: 68,
  sidebarCollapsedWidth: 68,
  sidebarStyle: "rail",
  bg: "#F0F2FF",
  surface: "rgba(255,255,255,0.82)",
  surface2: "rgba(241,245,249,0.90)",
  surface3: "rgba(226,232,240,0.80)",
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  border: "rgba(255,255,255,0.60)",
  borderStrong: "rgba(99,102,241,0.20)",
  shadow: "0 2px 12px rgba(99,102,241,0.08)",
  shadowLg: "0 12px 40px rgba(99,102,241,0.14)",
  accent: "#6366F1",
  accentHover: "#4F46E5",
  accentSubtle: "rgba(99,102,241,0.10)",
  accentText: "#FFFFFF",
  sidebarBg: "#0F0F1A",
  sidebarText: "#C7D2FE",
  sidebarTextMuted: "#4B5563",
  sidebarActive: "rgba(99,102,241,0.20)",
  sidebarActiveText: "#FFFFFF",
  sidebarHover: "rgba(255,255,255,0.06)",
  sidebarBorder: "rgba(99,102,241,0.12)",
  sidebarAccent: "#6366F1",
  headerBg: "rgba(255,255,255,0.85)",
  headerBorder: "rgba(99,102,241,0.12)",
  headerText: "#0F172A",
  success: "#10B981",
  successSubtle: "rgba(16,185,129,0.10)",
  error: "#EF4444",
  errorSubtle: "rgba(239,68,68,0.10)",
  warning: "#F59E0B",
  warningSubtle: "rgba(245,158,11,0.10)",
  info: "#06B6D4",
  infoSubtle: "rgba(6,182,212,0.10)",
  fontHeading: "'Inter', system-ui, sans-serif",
  fontBody: "'Inter', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
  fontSizeBase: "13px",
  fontWeightHeading: "700",
  radiusCard: "16px",
  radiusButton: "10px",
  radiusInput: "10px",
  radiusBadge: "99px",
  glassBlur: "blur(16px)",
  glassBg: "rgba(255,255,255,0.82)",
  glassBorder: "rgba(255,255,255,0.60)",
  gradientAccent: "linear-gradient(135deg,#6366F1,#8B5CF6)",
};

// ═══════════════════════════════════════════════════════════════
// TEMA 3 — Teal Noir
// Dark analytics premium, datos densos, teal vibrante
// ═══════════════════════════════════════════════════════════════
export const tealNoir: ThemeTokens = {
  id: "teal-noir",
  name: "Teal Noir",
  mode: "dark",
  description: "Oscuro premium orientado a analytics. Teal vibrante sobre negro profundo.",
  sidebarWidth: 260,
  sidebarCollapsedWidth: 64,
  sidebarStyle: "wide",
  bg: "#080A0C",
  surface: "#0F1215",
  surface2: "#161B20",
  surface3: "#1E252C",
  text: "#E8EDF2",
  textSecondary: "#8899AA",
  textMuted: "#4D6070",
  border: "#1E2830",
  borderStrong: "#2A3A46",
  shadow: "0 2px 8px rgba(0,0,0,0.40)",
  shadowLg: "0 12px 36px rgba(0,0,0,0.60)",
  accent: "#14B8A6",
  accentHover: "#0D9488",
  accentSubtle: "rgba(20,184,166,0.12)",
  accentText: "#080A0C",
  sidebarBg: "#0B0E11",
  sidebarText: "#8899AA",
  sidebarTextMuted: "#4D6070",
  sidebarActive: "rgba(20,184,166,0.14)",
  sidebarActiveText: "#14B8A6",
  sidebarHover: "rgba(255,255,255,0.04)",
  sidebarBorder: "#1A2228",
  sidebarAccent: "#14B8A6",
  headerBg: "#0B0E11",
  headerBorder: "#1A2228",
  headerText: "#E8EDF2",
  success: "#22C55E",
  successSubtle: "rgba(34,197,94,0.12)",
  error: "#EF4444",
  errorSubtle: "rgba(239,68,68,0.12)",
  warning: "#F59E0B",
  warningSubtle: "rgba(245,158,11,0.12)",
  info: "#6366F1",
  infoSubtle: "rgba(99,102,241,0.12)",
  fontHeading: "'Sora', 'Inter', sans-serif",
  fontBody: "'DM Sans', 'Inter', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
  fontSizeBase: "13px",
  fontWeightHeading: "600",
  radiusCard: "10px",
  radiusButton: "8px",
  radiusInput: "8px",
  radiusBadge: "5px",
};

// ═══════════════════════════════════════════════════════════════
// TEMA 4 — Coral Forge
// Dark warm, naranja fuego, sidebar rail 72px con labels
// ═══════════════════════════════════════════════════════════════
export const coralForge: ThemeTokens = {
  id: "coral-forge",
  name: "Coral Forge",
  mode: "dark",
  description: "Oscuro cálido con acento naranja fuego. Rail lateral con iconos y labels.",
  sidebarWidth: 72,
  sidebarCollapsedWidth: 72,
  sidebarStyle: "rail",
  bg: "#09090C",
  surface: "#111116",
  surface2: "#18181F",
  surface3: "#222228",
  text: "#EEEEF4",
  textSecondary: "#9090A8",
  textMuted: "#56566A",
  border: "#1E1E28",
  borderStrong: "#2A2A38",
  shadow: "0 2px 8px rgba(0,0,0,0.50)",
  shadowLg: "0 12px 36px rgba(0,0,0,0.70)",
  accent: "#F97316",
  accentHover: "#EA6C0C",
  accentSubtle: "rgba(249,115,22,0.12)",
  accentText: "#FFFFFF",
  sidebarBg: "#0D0D12",
  sidebarText: "#9090A8",
  sidebarTextMuted: "#45455A",
  sidebarActive: "rgba(249,115,22,0.16)",
  sidebarActiveText: "#F97316",
  sidebarHover: "rgba(255,255,255,0.05)",
  sidebarBorder: "#1A1A24",
  sidebarAccent: "#F97316",
  headerBg: "#111116",
  headerBorder: "#1E1E28",
  headerText: "#EEEEF4",
  success: "#22C55E",
  successSubtle: "rgba(34,197,94,0.12)",
  error: "#EF4444",
  errorSubtle: "rgba(239,68,68,0.12)",
  warning: "#F59E0B",
  warningSubtle: "rgba(245,158,11,0.12)",
  info: "#3B82F6",
  infoSubtle: "rgba(59,130,246,0.12)",
  fontHeading: "'Sora', 'Inter', sans-serif",
  fontBody: "'DM Sans', 'Inter', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
  fontSizeBase: "13px",
  fontWeightHeading: "600",
  radiusCard: "10px",
  radiusButton: "8px",
  radiusInput: "8px",
  radiusBadge: "5px",
  gradientAccent: "linear-gradient(135deg,#F97316,#FB923C)",
};

// ═══════════════════════════════════════════════════════════════
// TEMA 5 — Arctic Light
// Nórdico minimalista, blanco total, azul hielo, sidebar delgado
// ═══════════════════════════════════════════════════════════════
export const arcticLight: ThemeTokens = {
  id: "arctic-light",
  name: "Arctic Light",
  mode: "light",
  description: "Nórdico ultra-limpio. Blanco total, azul hielo, espaciado generoso.",
  sidebarWidth: 240,
  sidebarCollapsedWidth: 56,
  sidebarStyle: "mini",
  bg: "#F7F9FC",
  surface: "#FFFFFF",
  surface2: "#F0F4F8",
  surface3: "#E4ECF4",
  text: "#0D1B2A",
  textSecondary: "#3D5A7A",
  textMuted: "#7FA0BF",
  border: "#D8E6F0",
  borderStrong: "#AACAE0",
  shadow: "0 1px 4px rgba(13,27,42,0.06)",
  shadowLg: "0 8px 28px rgba(13,27,42,0.09)",
  accent: "#0EA5E9",
  accentHover: "#0284C7",
  accentSubtle: "rgba(14,165,233,0.10)",
  accentText: "#FFFFFF",
  sidebarBg: "#FFFFFF",
  sidebarText: "#3D5A7A",
  sidebarTextMuted: "#7FA0BF",
  sidebarActive: "rgba(14,165,233,0.10)",
  sidebarActiveText: "#0EA5E9",
  sidebarHover: "#F0F4F8",
  sidebarBorder: "#D8E6F0",
  sidebarAccent: "#0EA5E9",
  headerBg: "#FFFFFF",
  headerBorder: "#D8E6F0",
  headerText: "#0D1B2A",
  success: "#10B981",
  successSubtle: "rgba(16,185,129,0.10)",
  error: "#EF4444",
  errorSubtle: "rgba(239,68,68,0.10)",
  warning: "#F59E0B",
  warningSubtle: "rgba(245,158,11,0.10)",
  info: "#0EA5E9",
  infoSubtle: "rgba(14,165,233,0.10)",
  fontHeading: "'Inter', system-ui, sans-serif",
  fontBody: "'Inter', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
  fontSizeBase: "13px",
  fontWeightHeading: "600",
  radiusCard: "8px",
  radiusButton: "6px",
  radiusInput: "6px",
  radiusBadge: "4px",
};

// ═══════════════════════════════════════════════════════════════
// Registry — mapa de todos los temas
// ═══════════════════════════════════════════════════════════════
export const THEMES: Record<string, ThemeTokens> = {
  "dsd-classic": dsdClassic,
  "indigo-glass": indigoGlass,
  "teal-noir": tealNoir,
  "coral-forge": coralForge,
  "arctic-light": arcticLight,
};

export const THEME_LIST: ThemeTokens[] = Object.values(THEMES);

export function getThemeTokens(id: string): ThemeTokens {
  return THEMES[id] ?? dsdClassic;
}
