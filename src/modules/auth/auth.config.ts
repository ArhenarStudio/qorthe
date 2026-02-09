import type { ModuleConfig } from "@/lib/module-manager";

interface AuthModuleSettings {
  providers: {
    email: boolean;
    google?: boolean;
    github?: boolean;
  };
  redirects: {
    afterLogin: string;
    afterLogout: string;
    afterSignUp: string;
  };
  session: {
    persist: boolean;
    refreshThresholdSeconds: number;
  };
}

export const authConfig: ModuleConfig<AuthModuleSettings> = {
  id: "auth",
  name: "Autenticación",
  description: "Supabase Auth: login, registro, sesión y protección de rutas",
  version: "1.0.0",
  enabled: true,
  settings: {
    providers: {
      email: true,
    },
    redirects: {
      afterLogin: "/account",
      afterLogout: "/",
      afterSignUp: "/account",
    },
    session: {
      persist: true,
      refreshThresholdSeconds: 60,
    },
  },
};
