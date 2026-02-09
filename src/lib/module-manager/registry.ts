import { moduleManager } from "./ModuleManager";
import { productConfig } from "@/modules/product/product.config";
import { headerConfig } from "@/modules/header/header.config";
import { footerConfig } from "@/modules/footer/footer.config";
import { cartConfig } from "@/modules/cart/cart.config";

export function registerModules() {
  moduleManager.register(productConfig);
  moduleManager.register(headerConfig);
  moduleManager.register(footerConfig);
  moduleManager.register(cartConfig);
}

registerModules();
