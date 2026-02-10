"use client";

import { useAppState } from "@/modules/app-state";
import { FinancingCalculator } from "@/modules/financing-calculator";

export default function FinancingCalculatorPage() {
  const { isDarkMode, language } = useAppState();
  return (
    <FinancingCalculator
      productPrice={50000}
      isDarkMode={isDarkMode}
      language={language}
    />
  );
}
