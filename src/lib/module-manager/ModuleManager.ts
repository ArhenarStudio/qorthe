import { ModuleConfig } from "./types";

export class ModuleManager {
  private static instance: ModuleManager;
  private modules: Map<string, ModuleConfig>;

  private constructor() {
    this.modules = new Map();
  }

  static getInstance(): ModuleManager {
    if (!ModuleManager.instance) {
      ModuleManager.instance = new ModuleManager();
    }
    return ModuleManager.instance;
  }

  register(moduleConfig: ModuleConfig): void {
    this.modules.set(moduleConfig.id, moduleConfig);
  }

  isEnabled(moduleId: string): boolean {
    const module = this.modules.get(moduleId);
    return module?.enabled ?? false;
  }

  getConfig<T = unknown>(moduleId: string): T | undefined {
    const module = this.modules.get(moduleId);
    return module?.settings as T | undefined;
  }

  getModule(moduleId: string): ModuleConfig | undefined {
    return this.modules.get(moduleId);
  }

  async updateConfig(moduleId: string, newSettings: unknown): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    module.settings = {
      ...(module.settings as object),
      ...(newSettings as object),
    } as typeof module.settings;

    if (module.hooks?.onConfigChange) {
      await module.hooks.onConfigChange(newSettings as typeof module.settings);
    }
  }

  async enableModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    module.enabled = true;

    if (module.hooks?.onEnable) {
      await module.hooks.onEnable();
    }
  }

  async disableModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    module.enabled = false;

    if (module.hooks?.onDisable) {
      await module.hooks.onDisable();
    }
  }

  getAllModules(): ModuleConfig[] {
    return Array.from(this.modules.values());
  }
}

export const moduleManager = ModuleManager.getInstance();
