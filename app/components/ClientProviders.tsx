"use client";

import { AppStateProvider } from "@/modules/app-state";

export function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppStateProvider>{children}</AppStateProvider>;
}
