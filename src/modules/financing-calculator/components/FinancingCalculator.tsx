"use client";

import { useState, useEffect } from "react";
import { Calculator, TrendingDown, Calendar } from "lucide-react";

interface FinancingCalculatorProps {
  productPrice: number;
  isDarkMode: boolean;
  language: "es" | "en";
}

export function FinancingCalculator({
  productPrice,
  isDarkMode,
  language,
}: FinancingCalculatorProps) {
  const [downPayment, setDownPayment] = useState(productPrice * 0.3);
  const [term, setTerm] = useState(6);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  const translations = {
    es: {
      title: "Calculadora de Financiamiento",
      subtitle: "Calcula tu plan de pago sin intereses",
      productPrice: "Precio del Producto",
      downPaymentLabel: "Anticipo",
      termLabel: "Plazo",
      months: "meses",
      month: "mes",
      monthlyPayment: "Pago Mensual",
      totalToPay: "Total a Pagar",
      summary: "Resumen de Financiamiento",
      benefits: [
        "Sin intereses en pagos a meses",
        "Sin comisión por apertura",
        "Aprobación inmediata",
        "Flexibilidad en anticipo",
      ],
      applyNow: "Solicitar Financiamiento",
      note: "El financiamiento está sujeto a aprobación crediticia",
    },
    en: {
      title: "Financing Calculator",
      subtitle: "Calculate your interest-free payment plan",
      productPrice: "Product Price",
      downPaymentLabel: "Down Payment",
      termLabel: "Term",
      months: "months",
      month: "month",
      monthlyPayment: "Monthly Payment",
      totalToPay: "Total to Pay",
      summary: "Financing Summary",
      benefits: [
        "Interest-free monthly payments",
        "No opening fee",
        "Immediate approval",
        "Flexible down payment",
      ],
      applyNow: "Apply for Financing",
      note: "Financing subject to credit approval",
    },
  };

  const t = translations[language];

  useEffect(() => {
    const remainingAmount = productPrice - downPayment;
    const monthly = remainingAmount / term;
    setMonthlyPayment(monthly);
  }, [productPrice, downPayment, term]);

  const downPaymentPercentage = (downPayment / productPrice) * 100;

  return (
    <div
      className={`rounded-lg border p-6 ${
        isDarkMode
          ? "border-[#3d2f23] bg-[#2d2419]"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="mb-6 flex items-start gap-3">
        <div
          className={`rounded-lg p-2 ${
            isDarkMode ? "bg-[#3d2f23]" : "bg-white"
          }`}
        >
          <Calculator className="h-5 w-5 text-[#8b6f47]" />
        </div>
        <div>
          <h3
            className={`mb-1 text-xl font-medium ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {t.title}
          </h3>
          <p
            className={`text-sm ${
              isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
            }`}
          >
            {t.subtitle}
          </p>
        </div>
      </div>

      <div
        className={`mb-6 rounded-lg p-4 ${
          isDarkMode ? "bg-[#1a1512]" : "bg-white"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-sm ${
              isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
            }`}
          >
            {t.productPrice}
          </span>
          <span
            className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            ${productPrice.toLocaleString()} MXN
          </span>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <label
            className={`text-sm font-medium ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {t.downPaymentLabel}
          </label>
          <span
            className={`text-sm font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            ${downPayment.toLocaleString()} ({downPaymentPercentage.toFixed(0)}
            %)
          </span>
        </div>
        <input
          type="range"
          min={productPrice * 0.2}
          max={productPrice * 0.8}
          step={productPrice * 0.05}
          value={downPayment}
          onChange={(e) => setDownPayment(Number(e.target.value))}
          className="w-full accent-[#8b6f47]"
        />
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className={isDarkMode ? "text-[#b8a99a]" : "text-gray-500"}>
            20%
          </span>
          <span className={isDarkMode ? "text-[#b8a99a]" : "text-gray-500"}>
            80%
          </span>
        </div>
      </div>

      <div className="mb-6">
        <label
          className={`mb-3 block text-sm font-medium ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {t.termLabel}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[3, 6, 9, 12].map((months) => (
            <button
              key={months}
              onClick={() => setTerm(months)}
              className={`rounded-lg border-2 px-4 py-3 text-center transition-all ${
                term === months
                  ? "border-[#8b6f47] bg-[#8b6f47]/10"
                  : isDarkMode
                    ? "border-[#3d2f23] hover:border-[#8b6f47]"
                    : "border-gray-200 hover:border-[#8b6f47]"
              }`}
            >
              <div
                className={`text-lg font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {months}
              </div>
              <div
                className={`text-xs ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {months === 1 ? t.month : t.months}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div
        className={`mb-6 rounded-lg border-2 p-6 ${
          isDarkMode
            ? "border-[#8b6f47] bg-[#1a1512]"
            : "border-[#8b6f47] bg-[#8b6f47]/5"
        }`}
      >
        <div className="mb-2 flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-[#8b6f47]" />
          <span
            className={`text-sm font-medium ${
              isDarkMode ? "text-[#b8a99a]" : "text-gray-700"
            }`}
          >
            {t.monthlyPayment}
          </span>
        </div>
        <div
          className={`text-4xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          $
          {monthlyPayment.toLocaleString(
            language === "es" ? "es-MX" : "en-US",
            {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }
          )}{" "}
          <span className="text-2xl">MXN</span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-sm">
          <Calendar
            className={`h-4 w-4 ${
              isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
            }`}
          />
          <span className={isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}>
            {term} {term === 1 ? t.month : t.months}
          </span>
        </div>
      </div>

      <div
        className={`mb-6 space-y-3 rounded-lg p-4 ${
          isDarkMode ? "bg-[#1a1512]" : "bg-white"
        }`}
      >
        <h4
          className={`mb-3 text-sm font-medium ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {t.summary}
        </h4>

        {t.benefits.map((benefit, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#8b6f47]" />
            <span
              className={`text-sm ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              {benefit}
            </span>
          </div>
        ))}
      </div>

      <button className="mb-3 w-full rounded-lg bg-[#8b6f47] px-6 py-3.5 font-medium text-white transition-colors hover:bg-[#6d5638]">
        {t.applyNow}
      </button>

      <p
        className={`text-center text-xs ${
          isDarkMode ? "text-[#b8a99a]/60" : "text-gray-500"
        }`}
      >
        {t.note}
      </p>
    </div>
  );
}
