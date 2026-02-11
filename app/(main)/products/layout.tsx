"use client";

import { useAppState } from "@/modules/app-state";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDarkMode } = useAppState();

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div
        className={`flex min-h-screen flex-col transition-colors duration-300 ${
          isDarkMode ? "bg-[#0a0806]" : "bg-white"
        }`}
      >
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
