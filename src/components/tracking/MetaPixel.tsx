"use client";

// ═══════════════════════════════════════════════════════════════
// MetaPixel — Client component that loads Meta Pixel script
// and fires PageView on every route change.
//
// Placed in the root layout via providers.tsx.
// Uses Next.js App Router usePathname() to detect navigation.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { fbPageView } from "@/lib/meta-pixel";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialized = useRef(false);

  // Fire PageView on every route change
  useEffect(() => {
    if (!PIXEL_ID) return;

    // Skip the very first render — the inline script already fires PageView via fbq('track', 'PageView')
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }

    // Subsequent navigations (SPA transitions)
    fbPageView();
  }, [pathname, searchParams]);

  if (!PIXEL_ID) {
    return null;
  }

  return (
    <>
      {/* Meta Pixel Base Code */}
      <Script
        id="meta-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      {/* Meta Pixel noscript fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
