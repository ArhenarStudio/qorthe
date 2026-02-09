import type { ModuleConfig } from "@/lib/module-manager";

interface LandingModuleSettings {
  showHero: boolean;
  showCollections: boolean;
  showProcess: boolean;
  showTestimonials: boolean;
  showCta: boolean;
  useAnimations: boolean;
}

export const landingConfig: ModuleConfig<LandingModuleSettings> = {
  id: "landing",
  name: "Landing",
  description: "Página de inicio / Homepage",
  version: "1.0.0",
  enabled: true,
  settings: {
    showHero: true,
    showCollections: true,
    showProcess: true,
    showTestimonials: true,
    showCta: true,
    useAnimations: false,
  },
};
