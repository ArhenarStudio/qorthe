"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";

interface ChatWidgetProps {
  isDarkMode: boolean;
  language: "es" | "en";
  enabled?: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function ChatWidget({
  isDarkMode,
  language,
  enabled = true,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text:
        language === "es"
          ? "¡Hola! Soy el asistente virtual de DavidSon's Design. ¿En qué puedo ayudarte hoy?"
          : "Hello! I'm the virtual assistant of DavidSon's Design. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  if (!enabled) {
    return null;
  }

  const t = {
    es: {
      title: "Chat en vivo",
      placeholder: "Escribe tu mensaje...",
      send: "Enviar",
      online: "En línea",
      quickReplies: ["Ver catálogo", "Agendar cita", "Cotización", "Envíos"],
    },
    en: {
      title: "Live chat",
      placeholder: "Type your message...",
      send: "Send",
      online: "Online",
      quickReplies: [
        "View catalog",
        "Schedule appointment",
        "Quote",
        "Shipping",
      ],
    },
  };

  const content = t[language];

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInput("");

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text:
          language === "es"
            ? "Gracias por tu mensaje. Un representante te contactará pronto."
            : "Thank you for your message. A representative will contact you soon.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-[#8b6f47] p-4 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-[#a68760]"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-3 rounded-full border px-4 py-3 shadow-2xl transition-all ${
            isDarkMode
              ? "border-[#3d2f23] bg-[#1a1512]"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
          <span
            className={`font-medium ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {content.title}
          </span>
          <MessageCircle
            className={`h-5 w-5 ${
              isDarkMode ? "text-[#8b6f47]" : "text-[#8b6f47]"
            }`}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <div
        className={`overflow-hidden rounded-2xl border-2 shadow-2xl ${
          isDarkMode
            ? "border-[#8b6f47]/20 bg-[#1a1512]"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex items-center justify-between bg-[#8b6f47] p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-bold">
              DD
            </div>
            <div>
              <h3 className="font-bold">{content.title}</h3>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span>{content.online}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="rounded-lg p-2 transition-colors hover:bg-white/10"
              aria-label="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 transition-colors hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className={`h-96 space-y-4 overflow-y-auto p-4 ${
            isDarkMode ? "bg-[#0a0806]" : "bg-gray-50"
          }`}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.sender === "user"
                    ? "rounded-br-none bg-[#8b6f47] text-white"
                    : isDarkMode
                      ? "rounded-bl-none bg-[#2d2419] text-white"
                      : "rounded-bl-none bg-white text-gray-900"
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`border-t px-4 py-2 ${
            isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
          }`}
        >
          <div className="flex flex-wrap gap-2">
            {content.quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  isDarkMode
                    ? "bg-[#2d2419] text-[#b8a99a] hover:bg-[#3d2f23]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`border-t p-4 ${
            isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
          }`}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder={content.placeholder}
              className={`flex-1 rounded-lg border px-4 py-2 outline-none transition-colors ${
                isDarkMode
                  ? "border-[#3d2f23] bg-[#2d2419] text-white placeholder-[#b8a99a]/50 focus:border-[#8b6f47]"
                  : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-[#8b6f47]"
              }`}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="rounded-lg bg-[#8b6f47] px-4 py-2 text-white transition-colors hover:bg-[#a68760] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={content.send}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
