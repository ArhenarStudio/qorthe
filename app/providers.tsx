"use client";

import { Suspense } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FeatureToggleProvider } from "@/contexts/FeatureToggleContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import MetaPixel from "@/components/tracking/MetaPixel";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
        <ThemeProvider>
          <FeatureToggleProvider>
            <Suspense fallback={null}>
              <MetaPixel />
            </Suspense>
            {children}
          </FeatureToggleProvider>
        </ThemeProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
