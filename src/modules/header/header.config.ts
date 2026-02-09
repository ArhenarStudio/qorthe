import type { ModuleConfig } from "@/lib/module-manager";

interface HeaderModuleSettings {
  showLogo: boolean;
  showNavigation: boolean;
  showSearch: boolean;
  showLanguageToggle: boolean;
  showThemeToggle: boolean;
  sticky: {
    enabled: boolean;
    showOnScroll: number;
    style: "pill" | "full";
  };
  mobile: {
    menuStyle: "drawer" | "dropdown";
    position: "left" | "right";
  };
}

export const headerConfig: ModuleConfig<HeaderModuleSettings> = {
  id: "header",
  name: "Header",
  description: "Header principal y sticky header",
  version: "1.0.0",
  enabled: true,
  settings: {
    showLogo: true,
    showNavigation: true,
    showSearch: false,
    showLanguageToggle: true,
    showThemeToggle: true,
    sticky: {
      enabled: true,
      showOnScroll: 100,
      style: "pill",
    },
    mobile: {
      menuStyle: "drawer",
      position: "right",
    },
  },
};
