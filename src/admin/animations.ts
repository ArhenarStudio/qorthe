// ═══════════════════════════════════════════════════════════════
// Admin Animation System — Themes define animation tokens
// Components use these instead of hardcoding motion values
// ═══════════════════════════════════════════════════════════════

import type { AdminUITheme, AdminAnimationTokens } from '@/src/admin/types';

const defaultAnimations: AdminAnimationTokens = {
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

export function getAnimations(theme: AdminUITheme): AdminAnimationTokens {
  return { ...defaultAnimations, ...(theme.animations || {}) };
}

export function getPageTransition(theme: AdminUITheme) {
  const anims = getAnimations(theme);
  return anims.pageTransition;
}
