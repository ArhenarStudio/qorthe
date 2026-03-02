"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { FeatureToggleProvider } from "@/contexts/FeatureToggleContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
        <ThemeProvider>
          <FeatureToggleProvider>
            {children}
          </FeatureToggleProvider>
        </ThemeProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
