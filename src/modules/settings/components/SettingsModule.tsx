"use client";

import {
  Sun,
  Moon,
  Globe,
  MessageCircle,
  MessageSquare,
} from "lucide-react";

interface SettingsModuleProps {
  language: "es" | "en";
  isDarkMode: boolean;
  showWhatsApp: boolean;
  showChat: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onToggleWhatsApp: () => void;
  onToggleChat: () => void;
}

export function SettingsModule({
  language,
  isDarkMode,
  showWhatsApp,
  showChat,
  onToggleLanguage,
  onToggleDarkMode,
  onToggleWhatsApp,
  onToggleChat,
}: SettingsModuleProps) {
  return (
    <div
      className={`border-t ${
        isDarkMode
          ? "border-[#3d2f23] bg-[#0a0806]"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center gap-2">
              <span
                className={`text-xs md:text-sm ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {language === "es" ? "Tema" : "Theme"}
              </span>
              <button
                type="button"
                onClick={onToggleDarkMode}
                className={`flex items-center gap-2 rounded-full border px-2 py-1.5 transition-all duration-300 md:px-3 ${
                  isDarkMode
                    ? "border-[#3d2f23] bg-[#2d2419] hover:border-[#8b6f47]"
                    : "border-gray-300 bg-gray-50 hover:border-[#8b6f47]"
                }`}
                aria-label="Toggle theme"
              >
                <Sun
                  className={`h-3 w-3 transition-all md:h-3.5 md:w-3.5 ${
                    isDarkMode ? "opacity-40" : "opacity-100"
                  }`}
                />
                <div
                  className={`relative h-4 w-8 rounded-full md:w-9 ${
                    isDarkMode ? "bg-[#1a1512]" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-3 w-3 rounded-full bg-[#8b6f47] transition-all duration-300 ${
                      isDarkMode ? "left-[1.125rem] md:left-5" : "left-0.5"
                    }`}
                  />
                </div>
                <Moon
                  className={`h-3 w-3 transition-all md:h-3.5 md:w-3.5 ${
                    isDarkMode ? "opacity-100" : "opacity-40"
                  }`}
                />
              </button>
            </div>

            <span
              className={`h-1 w-1 rounded-full ${
                isDarkMode ? "bg-[#3d2f23]" : "bg-gray-300"
              }`}
            />

            {/* Language Toggle */}
            <div className="flex items-center gap-2">
              <span
                className={`text-xs md:text-sm ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {language === "es" ? "Idioma" : "Language"}
              </span>
              <button
                type="button"
                onClick={onToggleLanguage}
                className={`flex items-center gap-2 rounded-full border px-2 py-1.5 transition-all duration-300 md:px-3 ${
                  isDarkMode
                    ? "border-[#3d2f23] bg-[#2d2419] hover:border-[#8b6f47]"
                    : "border-gray-300 bg-gray-50 hover:border-[#8b6f47]"
                }`}
                aria-label="Toggle language"
              >
                <span
                  className={`text-[10px] font-medium transition-all md:text-xs ${
                    language === "es" ? "opacity-100" : "opacity-40"
                  }`}
                >
                  ES
                </span>
                <div
                  className={`relative h-4 w-8 rounded-full md:w-9 ${
                    isDarkMode ? "bg-[#1a1512]" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-3 w-3 rounded-full bg-[#8b6f47] transition-all duration-300 ${
                      language === "en" ? "left-[1.125rem] md:left-5" : "left-0.5"
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium transition-all md:text-xs ${
                    language === "en" ? "opacity-100" : "opacity-40"
                  }`}
                >
                  EN
                </span>
              </button>
            </div>

            <span
              className={`h-1 w-1 rounded-full ${
                isDarkMode ? "bg-[#3d2f23]" : "bg-gray-300"
              }`}
            />

            {/* WhatsApp Toggle */}
            <div className="flex items-center gap-2">
              <span
                className={`text-xs md:text-sm ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                WhatsApp
              </span>
              <button
                type="button"
                onClick={onToggleWhatsApp}
                className={`flex items-center gap-2 rounded-full border px-2 py-1.5 transition-all duration-300 md:px-3 ${
                  isDarkMode
                    ? "border-[#3d2f23] bg-[#2d2419] hover:border-[#8b6f47]"
                    : "border-gray-300 bg-gray-50 hover:border-[#8b6f47]"
                }`}
                aria-label="Toggle WhatsApp button"
              >
                <MessageCircle
                  className={`h-3 w-3 transition-all md:h-3.5 md:w-3.5 ${
                    showWhatsApp ? "opacity-100" : "opacity-40"
                  }`}
                />
                <div
                  className={`relative h-4 w-8 rounded-full md:w-9 ${
                    isDarkMode ? "bg-[#1a1512]" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-3 w-3 rounded-full bg-[#8b6f47] transition-all duration-300 ${
                      showWhatsApp ? "left-[1.125rem] md:left-5" : "left-0.5"
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium transition-all md:text-xs ${
                    showWhatsApp ? "opacity-100" : "opacity-40"
                  }`}
                >
                  {showWhatsApp ? "ON" : "OFF"}
                </span>
              </button>
            </div>

            <span
              className={`h-1 w-1 rounded-full ${
                isDarkMode ? "bg-[#3d2f23]" : "bg-gray-300"
              }`}
            />

            {/* Chat Toggle */}
            <div className="flex items-center gap-2">
              <span
                className={`text-xs md:text-sm ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                Chat
              </span>
              <button
                type="button"
                onClick={onToggleChat}
                className={`flex items-center gap-2 rounded-full border px-2 py-1.5 transition-all duration-300 md:px-3 ${
                  isDarkMode
                    ? "border-[#3d2f23] bg-[#2d2419] hover:border-[#8b6f47]"
                    : "border-gray-300 bg-gray-50 hover:border-[#8b6f47]"
                }`}
                aria-label="Toggle chat button"
              >
                <MessageSquare
                  className={`h-3 w-3 transition-all md:h-3.5 md:w-3.5 ${
                    showChat ? "opacity-100" : "opacity-40"
                  }`}
                />
                <div
                  className={`relative h-4 w-8 rounded-full md:w-9 ${
                    isDarkMode ? "bg-[#1a1512]" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-3 w-3 rounded-full bg-[#8b6f47] transition-all duration-300 ${
                      showChat ? "left-[1.125rem] md:left-5" : "left-0.5"
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium transition-all md:text-xs ${
                    showChat ? "opacity-100" : "opacity-40"
                  }`}
                >
                  {showChat ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          </div>

          <p
            className={`text-xs ${
              isDarkMode ? "text-[#b8a99a]/60" : "text-gray-500"
            }`}
          >
            Powered by{" "}
            <a
              href="https://www.rockstage.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#8b6f47] transition-opacity hover:opacity-80"
            >
              RockStage
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
