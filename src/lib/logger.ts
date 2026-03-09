// /src/lib/logger.ts
// Production-safe logger — silences debug logs in production (NODE_ENV=production)
// Usage: import { logger } from '@/src/lib/logger'
//        logger.debug('[MP] Cart processed')   → only in development
//        logger.info('[Order] Created: DSD-42') → only in development
//        logger.error('[MP] Payment failed', err) → always (both envs)

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  // Only logs in development
  debug: (...args: unknown[]) => { if (isDev) console.log(...args); },
  info:  (...args: unknown[]) => { if (isDev) console.log(...args); },
  // Always logs (errors should always surface)
  error: (...args: unknown[]) => { console.error(...args); },
  warn:  (...args: unknown[]) => { if (isDev) console.warn(...args); },
};
