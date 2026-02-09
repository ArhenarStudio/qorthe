import type { ModuleConfig } from "@/lib/module-manager";

interface CartModuleSettings {
  drawer: {
    enabled: boolean;
    position: "left" | "right";
    width: number;
    showOnAdd: boolean;
  };
  page: {
    enabled: boolean;
    showRecommendations: boolean;
    showCoupon: boolean;
  };
  behavior: {
    maxQuantity: number;
    persistOnClose: boolean;
  };
}

export const cartConfig: ModuleConfig<CartModuleSettings> = {
  id: "cart",
  name: "Carrito",
  description: "Sistema de carrito de compras",
  version: "1.0.0",
  enabled: true,
  settings: {
    drawer: {
      enabled: true,
      position: "right",
      width: 400,
      showOnAdd: true,
    },
    page: {
      enabled: true,
      showRecommendations: true,
      showCoupon: true,
    },
    behavior: {
      maxQuantity: 10,
      persistOnClose: true,
    },
  },
};
