"use client";

import { useAppState } from "@/modules/app-state";

export function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDarkMode } = useAppState();

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDarkMode ? "bg-[#0a0806]" : "bg-white"
        }`}
      >
        <div className="pt-20 md:pt-24">{children}</div>
      </div>
    </div>
  );
}
