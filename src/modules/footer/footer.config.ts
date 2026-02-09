import type { ModuleConfig } from "@/lib/module-manager";

interface FooterModuleSettings {
  showDescription: boolean;
  showNavigation: boolean;
  showContact: boolean;
  showSocial: boolean;
  showNewsletter: boolean;
  layout: "columns-4" | "columns-3" | "columns-2";
}

export const footerConfig: ModuleConfig<FooterModuleSettings> = {
  id: "footer",
  name: "Footer",
  description: "Footer del sitio",
  version: "1.0.0",
  enabled: true,
  settings: {
    showDescription: true,
    showNavigation: true,
    showContact: true,
    showSocial: false,
    showNewsletter: false,
    layout: "columns-4",
  },
};
