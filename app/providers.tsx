"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { FeatureToggleProvider } from "@/contexts/FeatureToggleContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          <FeatureToggleProvider>
            {children}
          </FeatureToggleProvider>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}
