"use client";

import { useState } from "react";
import {
  ChevronDown,
  Search,
  Package,
  Truck,
  CreditCard,
  Hammer,
  Shield,
  Phone,
} from "lucide-react";
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
        "Cada pieza es elaborada a mano bajo pedido. El tiempo de elaboración varía según la complejidad: sillas y sillones toman de 3-4 semanas, mesas de comedor de 4-6 semanas, y recámaras completas de 6-8 semanas. Te mantendremos informado del progreso de tu pedido.",
      category: "products",
    },
    {
      question: "¿Qué tipos de madera utilizan?",
      answer:
        "Trabajamos principalmente con maderas nobles mexicanas como nogal, parota, encino y cedro rojo. Todas nuestras maderas provienen de fuentes sustentables certificadas y son seleccionadas cuidadosamente por su calidad y belleza natural.",
      category: "products",
    },
    {
      question: "¿Puedo personalizar un mueble?",
      answer:
        "Absolutamente. Ofrecemos servicio de personalización en dimensiones, acabados, tapizados y detalles específicos. Agenda una consulta gratuita con nuestros diseñadores para discutir tu proyecto.",
      category: "products",
    },
    {
      question: "¿Realizan envíos a toda la República Mexicana?",
      answer:
        "Sí, realizamos envíos a todo México. Utilizamos empresas de paquetería especializadas en el manejo de muebles. El costo de envío se calcula según el destino y tamaño del pedido. El envío es gratuito en compras mayores a $50,000 MXN.",
      category: "shipping",
    },
    {
      question: "¿Cómo se embalan los muebles para el envío?",
      answer:
        "Cada pieza se protege con mantas especiales, plástico burbuja y esquineros de cartón. Los muebles se embalan en cajas de madera personalizadas para garantizar que lleguen en perfectas condiciones.",
      category: "shipping",
    },
    {
      question: "¿Cuánto tiempo tarda el envío?",
      answer:
        "Una vez completada la elaboración, el envío tarda de 5-10 días hábiles dependiendo del destino. Para Hermosillo y alrededores ofrecemos entrega personal sin costo adicional.",
      category: "shipping",
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer:
        "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencias bancarias y efectivo. También ofrecemos planes de financiamiento de 3, 6 y 12 meses sin intereses en compras mayores a $20,000 MXN.",
      category: "payments",
    },
    {
      question: "¿Se requiere anticipo?",
      answer:
        "Sí, solicitamos un anticipo del 50% al confirmar el pedido. El saldo restante se paga antes del envío. Para pedidos personalizados, el anticipo es del 60%.",
      category: "payments",
    },
    {
      question: "¿Qué garantía tienen los muebles?",
      answer:
        "Todos nuestros muebles cuentan con garantía de por vida en la estructura de madera contra defectos de fabricación. Los acabados y tapizados tienen garantía de 2 años. La garantía no cubre daños por mal uso o desgaste natural.",
      category: "warranty",
    },
    {
      question: "¿Qué cuidados requieren los muebles?",
      answer:
        "Recomendamos limpiar con un paño suave y seco regularmente. Evitar exposición directa al sol y fuentes de calor. Los acabados con aceite natural requieren re-aplicación cada 6-12 meses (incluimos un kit de mantenimiento con cada compra).",
      category: "warranty",
    },
    {
      question: "¿Ofrecen servicio de reparación?",
      answer:
        "Sí, ofrecemos servicio de restauración y reparación para todos nuestros muebles, incluso fuera del período de garantía. Contáctanos para una evaluación.",
      category: "warranty",
    },
    {
      question: "¿Tienen showroom físico?",
      answer:
        "Sí, nuestro showroom y taller están ubicados en Hermosillo, Sonora. Abrimos de lunes a sábado de 10:00 a 18:00 hrs. Te recomendamos agendar una cita para una atención personalizada.",
      category: "contact",
    },
    {
      question: "¿Cómo puedo agendar una consulta de diseño?",
      answer:
        "Puedes agendar una consulta gratuita a través de nuestra página de Citas, por WhatsApp al +52 662 123 4567, o llamando a nuestro showroom. Las consultas pueden ser presenciales o virtuales.",
      category: "contact",
    },
  ],
  en: [
    {
      question: "How long does furniture crafting take?",
      answer:
        "Each piece is handcrafted to order. Crafting time varies by complexity: chairs and armchairs take 3-4 weeks, dining tables 4-6 weeks, and complete bedroom sets 6-8 weeks. We will keep you informed of your order progress.",
      category: "products",
    },
    {
      question: "What types of wood do you use?",
      answer:
        "We primarily work with Mexican noble woods such as walnut, parota, oak, and red cedar. All our woods come from certified sustainable sources and are carefully selected for their quality and natural beauty.",
      category: "products",
    },
    {
      question: "Can I customize a piece of furniture?",
      answer:
        "Absolutely. We offer customization services for dimensions, finishes, upholstery, and specific details. Schedule a free consultation with our designers to discuss your project.",
      category: "products",
    },
    {
      question: "Do you ship throughout Mexico?",
      answer:
        "Yes, we ship throughout Mexico. We use specialized furniture handling companies. Shipping cost is calculated based on destination and order size. Shipping is free on purchases over $50,000 MXN.",
      category: "shipping",
    },
    {
      question: "How are furniture items packed for shipping?",
      answer:
        "Each piece is protected with special blankets, bubble wrap, and cardboard corners. Furniture is packed in custom wooden crates to ensure perfect condition upon arrival.",
      category: "shipping",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Once crafting is complete, shipping takes 5-10 business days depending on destination. For Hermosillo and surrounding areas, we offer personal delivery at no additional cost.",
      category: "shipping",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept credit and debit cards (Visa, Mastercard, American Express), bank transfers, and cash. We also offer 3, 6, and 12-month interest-free financing plans on purchases over $20,000 MXN.",
      category: "payments",
    },
    {
      question: "Is a deposit required?",
      answer:
        "Yes, we require a 50% deposit when confirming the order. The remaining balance is paid before shipping. For custom orders, the deposit is 60%.",
      category: "payments",
    },
    {
      question: "What warranty do the furniture pieces have?",
      answer:
        "All our furniture comes with a lifetime warranty on the wood structure against manufacturing defects. Finishes and upholstery have a 2-year warranty. Warranty does not cover damage from misuse or natural wear.",
      category: "warranty",
    },
    {
      question: "What care do the furniture pieces require?",
      answer:
        "We recommend cleaning with a soft, dry cloth regularly. Avoid direct sun exposure and heat sources. Natural oil finishes require reapplication every 6-12 months (we include a maintenance kit with each purchase).",
      category: "warranty",
    },
    {
      question: "Do you offer repair services?",
      answer:
        "Yes, we offer restoration and repair services for all our furniture, even outside the warranty period. Contact us for an evaluation.",
      category: "warranty",
    },
    {
      question: "Do you have a physical showroom?",
      answer:
        "Yes, our showroom and workshop are located in Hermosillo, Sonora. We are open Monday to Saturday from 10:00 AM to 6:00 PM. We recommend scheduling an appointment for personalized attention.",
      category: "contact",
    },
    {
      question: "How can I schedule a design consultation?",
      answer:
        "You can schedule a free consultation through our Appointments page, via WhatsApp at +52 662 123 4567, or by calling our showroom. Consultations can be in-person or virtual.",
      category: "contact",
    },
  ],
};

const pageTranslations = {
  es: {
    title: "Preguntas Frecuentes",
    subtitle:
      "Encuentra respuestas a las preguntas más comunes sobre nuestros muebles artesanales",
    searchPlaceholder: "Buscar pregunta...",
    noResults: "No se encontraron preguntas que coincidan con tu búsqueda.",
    contactCTA: "¿No encuentras lo que buscas?",
    contactButton: "Contáctanos",
  },
  en: {
    title: "Frequently Asked Questions",
    subtitle:
      "Find answers to common questions about our handcrafted furniture",
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
