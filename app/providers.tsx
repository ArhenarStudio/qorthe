"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { FeatureToggleProvider } from "@/contexts/FeatureToggleContext";
import { AuthProvider } from "@/contexts/AuthContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <FeatureToggleProvider>
          {children}
        </FeatureToggleProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
