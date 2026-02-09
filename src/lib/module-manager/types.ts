export interface ModuleConfig<T = unknown> {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  settings: T;
  dependencies?: string[];
  hooks?: {
    onEnable?: () => Promise<void>;
    onDisable?: () => Promise<void>;
    onConfigChange?: (newConfig: unknown) => Promise<void>;
  };
}
