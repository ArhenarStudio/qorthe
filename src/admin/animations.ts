// ═══════════════════════════════════════════════════════════════
// src/admin/animations.ts
// Tokens de animación para el panel admin
// ═══════════════════════════════════════════════════════════════

const defaultAnimations = {
  pageTransition: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.2 },
  },
  sidebarExpand: 'transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
  cardHover: 'hover:shadow-md transition-shadow duration-200',
  modalEnter: 'transition-all duration-200 ease-out',
};

export function getAnimations() {
  return defaultAnimations;
}

export function getPageTransition() {
  return defaultAnimations.pageTransition;
}
