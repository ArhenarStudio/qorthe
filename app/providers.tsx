"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { FeatureToggleProvider } from "@/contexts/FeatureToggleContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <FeatureToggleProvider>
        {children}
      </FeatureToggleProvider>
    </ThemeProvider>
  );
}
