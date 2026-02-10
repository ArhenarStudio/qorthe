"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";

interface NewsletterProps {
  isDarkMode: boolean;
  language: "es" | "en";
}

export function Newsletter({ isDarkMode, language }: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const translations = {
    es: {
      title: "Suscríbete a Nuestro Newsletter",
      description:
        "Recibe las últimas novedades, promociones exclusivas y consejos de diseño.",
      placeholder: "tu@email.com",
      button: "Suscribirse",
      loading: "Enviando...",
      success: "¡Gracias por suscribirte!",
      errorInvalid: "Por favor ingresa un email válido",
      errorGeneral: "Ocurrió un error. Intenta de nuevo.",
    },
    en: {
      title: "Subscribe to Our Newsletter",
      description:
        "Receive the latest news, exclusive promotions and design tips.",
      placeholder: "your@email.com",
      button: "Subscribe",
      loading: "Sending...",
      success: "Thank you for subscribing!",
      errorInvalid: "Please enter a valid email",
      errorGeneral: "An error occurred. Try again.",
    },
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage(t.errorInvalid);
      return;
    }

    setStatus("loading");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatus("success");
      setEmail("");

      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    } catch {
      setStatus("error");
      setErrorMessage(t.errorGeneral);

      setTimeout(() => {
        setStatus("idle");
        setErrorMessage("");
      }, 3000);
    }
  };

  return (
    <div
      className={`border-t ${
        isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 lg:px-12">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <div className="space-y-3">
            <h3
              className={`text-2xl tracking-tight md:text-3xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t.title}
            </h3>
            <p
              className={`text-base ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              {t.description}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Mail
                className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-400"
                }`}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholder}
                disabled={status === "loading" || status === "success"}
                className={`w-full rounded-lg border py-3.5 pl-12 pr-4 transition-all outline-none focus:ring-2 ${
                  isDarkMode
                    ? "border-[#3d2f23] bg-[#2d2419] text-white placeholder-[#b8a99a]/50 focus:border-[#8b6f47] focus:ring-[#8b6f47]"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#8b6f47] focus:ring-[#8b6f47]"
                } ${status === "error" ? "border-red-500" : ""}`}
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className={`flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-8 py-3.5 font-medium transition-all ${
                status === "success"
                  ? "cursor-default bg-green-600 text-white"
                  : "bg-[#8b6f47] text-white hover:bg-[#6d5638] disabled:cursor-not-allowed disabled:opacity-50"
              }`}
            >
              {status === "loading" && (
                <Loader2 className="h-5 w-5 animate-spin" />
              )}
              {status === "success" && <Check className="h-5 w-5" />}

              {status === "idle" && t.button}
              {status === "loading" && t.loading}
              {status === "success" && t.success}
              {status === "error" && t.button}
            </button>
          </form>

          {status === "error" && errorMessage && (
            <p className="animate-fade-in text-sm text-red-500">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
