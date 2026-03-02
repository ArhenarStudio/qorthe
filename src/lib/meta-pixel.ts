// ═══════════════════════════════════════════════════════════════
// Meta Pixel — Helper functions for tracking events
//
// Provides type-safe functions to fire Meta Pixel events
// from anywhere in the app. Each event generates a unique
// event_id for deduplication with CAPI (server-side).
//
// Usage:
//   import { fbEvent, FB_EVENTS } from '@/lib/meta-pixel';
//   fbEvent(FB_EVENTS.ADD_TO_CART, { content_ids: ['prod_123'], value: 850, currency: 'MXN' });
// ═══════════════════════════════════════════════════════════════

// Generate a unique event ID for deduplication with CAPI
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Standard Meta Pixel event names
export const FB_EVENTS = {
  PAGE_VIEW: 'PageView',
  ADD_TO_CART: 'AddToCart',
  INITIATE_CHECKOUT: 'InitiateCheckout',
  PURCHASE: 'Purchase',
  VIEW_CONTENT: 'ViewContent',
  SEARCH: 'Search',
  ADD_TO_WISHLIST: 'AddToWishlist',
} as const;

type FbEventName = typeof FB_EVENTS[keyof typeof FB_EVENTS];

interface FbEventParams {
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  currency?: string;
  value?: number;
  num_items?: number;
  search_string?: string;
  event_id?: string;
  [key: string]: unknown;
}

// Safely access the fbq function
function getFbq(): ((...args: unknown[]) => void) | null {
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    return (window as any).fbq;
  }
  return null;
}

/**
 * Fire a Meta Pixel event with automatic event_id generation.
 * Returns the event_id so it can be sent to CAPI for deduplication.
 */
export function fbEvent(eventName: FbEventName, params: FbEventParams = {}): string | null {
  const fbq = getFbq();
  if (!fbq) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Meta Pixel] (not loaded) ${eventName}`, params);
    }
    return null;
  }

  const eventId = params.event_id || generateEventId();
  const eventParams = { ...params, event_id: eventId };

  // Remove our custom event_id from the params sent to fbq
  // (fbq uses eventID in the options object, not in params)
  const { event_id: _, ...cleanParams } = eventParams;

  fbq('track', eventName, cleanParams, { eventID: eventId });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Meta Pixel] ${eventName}`, { eventId, ...cleanParams });
  }

  return eventId;
}

/**
 * Fire a PageView event. Called automatically by MetaPixel component on route change.
 */
export function fbPageView(): string | null {
  const fbq = getFbq();
  if (!fbq) return null;

  const eventId = generateEventId();
  fbq('track', 'PageView', {}, { eventID: eventId });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Meta Pixel] PageView`, { eventId });
  }

  return eventId;
}
