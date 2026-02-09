import type { ModuleConfig } from "@/lib/module-manager";

interface ProductModuleSettings {
  showBreadcrumb: boolean;
  showGallery: boolean;
  galleryLayout: "grid" | "slider";
  showTabs: boolean;
  enableZoom: boolean;
}

export const productConfig: ModuleConfig<ProductModuleSettings> = {
  id: "product",
  name: "Productos",
  description: "Sistema completo de visualización de productos",
  version: "1.0.0",
  enabled: true,
  settings: {
    showBreadcrumb: true,
    showGallery: true,
    galleryLayout: "grid",
    showTabs: true,
    enableZoom: true,
  },
};
