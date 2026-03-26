"use client";
// ═══════════════════════════════════════════════════════════════
// rocksage-teal-dark/Sidebar.tsx
// En el tema Komerzly OS, el "sidebar" no existe como panel lateral.
// Todo el shell del OS (menubar + desktop + dock) está en OSDesktop.tsx
// que se monta directamente desde layout.tsx cuando layout === 'os-panel'.
// Este archivo existe solo para satisfacer el contrato del tema (SidebarComponent).
// ═══════════════════════════════════════════════════════════════

export default function Sidebar() {
  return null;
}
