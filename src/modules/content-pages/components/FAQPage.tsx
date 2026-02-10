"use client";

import { useState } from "react";
import { ChevronDown, Search, Package, Truck, CreditCard, Hammer, Shield, Phone } from "lucide-react";
import { ContentPageShell, useContentPage } from "./ContentPageShell";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const categories = {
  es: [
    { id: "all", name: "Todas", icon: Package },
    { id: "products", name: "Productos", icon: Hammer },
    { id: "shipping", name: "Envíos", icon: Truck },
    { id: "payments", name: "Pagos", icon: CreditCard },
    { id: "warranty", name: "Garantía", icon: Shield },
    { id: "contact", name: "Contacto", icon: Phone },
  ],
  en: [
    { id: "all", name: "All", icon: Package },
    { id: "products", name: "Products", icon: Hammer },
    { id: "shipping", name: "Shipping", icon: Truck },
    { id: "payments", name: "Payments", icon: CreditCard },
    { id: "warranty", name: "Warranty", icon: Shield },
    { id: "contact", name: "Contact", icon: Phone },
  ],
};

const faqs: Record<"es" | "en", FAQItem[]> = {
  es: [
    {
      question: "¿Cuánto tiempo tarda la elaboración de un mueble?",
      answer:
        "Cada pieza es elaborada a mano bajo pedido. El tiempo varía según la complejidad: sillas y sillones de 3-4 semanas, mesas de comedor de 4-6 semanas, y recámaras completas de 6-8 semanas.",
      category: "products",
    },
    {
      question: "¿Qué tipos de madera utilizan?",
      answer:
        "Trabajamos principalmente con maderas nobles mexicanas como nogal, parota, encino y cedro rojo. Todas provienen de fuentes sustentables certificadas.",
      category: "products",
    },
    {
      question: "¿Realizan envíos a toda la República Mexicana?",
      answer:
        "Sí, realizamos envíos a todo México. El costo se calcula según destino y tamaño. Envío gratuito en compras mayores a $50,000 MXN.",
      category: "shipping",
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer:
        "Aceptamos tarjetas de crédito y débito, transferencias bancarias y efectivo. Planes de financiamiento de 3, 6 y 12 meses sin intereses en compras mayores a $20,000 MXN.",
      category: "payments",
    },
    {
      question: "¿Qué garantía tienen los muebles?",
      answer:
        "Garantía de por vida en la estructura de madera contra defectos de fabricación. Acabados y tapizados tienen garantía de 2 años.",
      category: "warranty",
    },
    {
      question: "¿Tienen showroom físico?",
      answer:
        "Sí, nuestro showroom y taller están en Hermosillo, Sonora. Abrimos de lunes a sábado de 10:00 a 18:00 hrs. Recomendamos agendar una cita.",
      category: "contact",
    },
  ],
  en: [
    {
      question: "How long does furniture crafting take?",
      answer:
        "Each piece is handcrafted to order. Time varies by complexity: chairs 3-4 weeks, dining tables 4-6 weeks, complete bedrooms 6-8 weeks.",
      category: "products",
    },
    {
      question: "What types of wood do you use?",
      answer:
        "We primarily work with Mexican noble woods such as walnut, parota, oak, and red cedar. All from certified sustainable sources.",
      category: "products",
    },
    {
      question: "Do you ship throughout Mexico?",
      answer:
        "Yes, we ship throughout Mexico. Cost is calculated by destination and size. Free shipping on purchases over $50,000 MXN.",
      category: "shipping",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept credit and debit cards, bank transfers, and cash. 3, 6, and 12-month interest-free financing on purchases over $20,000 MXN.",
      category: "payments",
    },
    {
      question: "What warranty do the furniture pieces have?",
      answer:
        "Lifetime warranty on wood structure against manufacturing defects. Finishes and upholstery have a 2-year warranty.",
      category: "warranty",
    },
    {
      question: "Do you have a physical showroom?",
      answer:
        "Yes, our showroom and workshop are in Hermosillo, Sonora. We are open Monday to Saturday from 10:00 AM to 6:00 PM. We recommend scheduling an appointment.",
      category: "contact",
    },
  ],
};

const pageTranslations = {
  es: {
    title: "Preguntas Frecuentes",
    subtitle: "Encuentra respuestas a las preguntas más comunes sobre nuestros muebles artesanales",
    searchPlaceholder: "Buscar pregunta...",
    noResults: "No se encontraron preguntas que coincidan con tu búsqueda.",
    contactCTA: "¿No encuentras lo que buscas?",
    contactButton: "Contáctanos",
  },
  en: {
    title: "Frequently Asked Questions",
    subtitle: "Find answers to common questions about our handcrafted furniture",
    searchPlaceholder: "Search question...",
    noResults: "No questions found matching your search.",
    contactCTA: "Can't find what you're looking for?",
    contactButton: "Contact Us",
  },
};

function FAQContent() {
  const { language, isDarkMode } = useContentPage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const t = pageTranslations[language];
  const currentCategories = categories[language];
  const currentFaqs = faqs[language];

  const filteredFaqs = currentFaqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <section
        className={`border-b pt-32 pb-16 md:py-24 ${
          isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <h1
              className={`text-4xl tracking-tight md:text-5xl lg:text-6xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t.title}
            </h1>
            <p
              className={`text-lg md:text-xl ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              {t.subtitle}
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-2xl">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-400"
                }`}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className={`w-full rounded-lg border py-4 pl-12 pr-4 transition-all focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? "border-[#3d2f23] bg-[#2d2419] text-white placeholder-[#b8a99a]/50 focus:border-[#8b6f47] focus:ring-[#8b6f47]"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#8b6f47] focus:ring-[#8b6f47]"
                }`}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className={`border-b py-8 ${isDarkMode ? "border-[#3d2f23]" : "border-gray-200"}`}
      >
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
          <div className="flex flex-wrap justify-center gap-3">
            {currentCategories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all ${
                    isActive
                      ? "bg-[#8b6f47] text-white"
                      : isDarkMode
                        ? "bg-[#2d2419] text-[#b8a99a] hover:bg-[#3d2f23]"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-16 md:px-8 lg:px-12">
        {filteredFaqs.length === 0 ? (
          <div className="py-12 text-center">
            <p
              className={`text-lg ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              {t.noResults}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className={`rounded-lg border transition-all ${
                  isDarkMode
                    ? "border-[#3d2f23] bg-[#2d2419] hover:border-[#8b6f47]"
                    : "border-gray-200 bg-white hover:border-[#8b6f47]"
                }`}
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
                >
                  <span
                    className={`text-lg font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    } ${isDarkMode ? "text-[#b8a99a]" : "text-gray-400"}`}
                  />
                </button>
                {openIndex === index && (
                  <div
                    className={`px-6 pb-5 ${
                      isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                    }`}
                  >
                    <p className="leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div
          className={`mt-16 rounded-lg p-8 text-center ${
            isDarkMode ? "bg-[#2d2419]" : "bg-gray-50"
          }`}
        >
          <p
            className={`mb-4 text-lg ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {t.contactCTA}
          </p>
          <a
            href="https://wa.me/526621234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-[#8b6f47] px-8 py-3 font-medium text-white transition-colors hover:bg-[#6d5638]"
          >
            {t.contactButton}
          </a>
        </div>
      </div>
    </>
  );
}

export function FAQPage() {
  return (
    <ContentPageShell>
      <FAQContent />
    </ContentPageShell>
  );
}
