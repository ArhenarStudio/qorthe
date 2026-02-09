"use client";

import { useState, useEffect } from "react";
import { Header } from "@/modules/header";
import { Footer } from "@/modules/footer";

const translations = {
  es: {
    nav: { products: "Productos", about: "Nosotros", contact: "Contacto" },
    title: "Términos y Condiciones",
    lastUpdated: "Última actualización: 8 de febrero de 2026",
    sections: {
      acceptance: {
        title: "1. Aceptación de los Términos",
        content:
          "Al acceder y utilizar el sitio web de DavidSon´s Design, usted acepta estar sujeto a estos términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro sitio web.",
      },
      products: {
        title: "2. Productos y Servicios",
        content:
          "Todos nuestros muebles son piezas artesanales únicas elaboradas a mano por maestros artesanos mexicanos. Los tiempos de fabricación pueden variar según la complejidad de cada pieza. Las imágenes mostradas son representativas y pueden presentar ligeras variaciones debido a la naturaleza artesanal de nuestros productos.",
      },
      orders: {
        title: "3. Pedidos y Pagos",
        content:
          "Los pedidos están sujetos a disponibilidad y confirmación del precio. Nos reservamos el derecho de rechazar cualquier pedido. Los precios están sujetos a cambios sin previo aviso. Se requiere un depósito del 50% para iniciar la fabricación de cualquier pieza personalizada.",
      },
      delivery: {
        title: "4. Entrega e Instalación",
        content:
          "Los tiempos de entrega son estimados y pueden variar. DavidSon´s Design no se hace responsable por retrasos causados por circunstancias fuera de nuestro control. La entrega e instalación profesional está disponible en Hermosillo, Sonora y áreas circundantes. Para entregas fuera de esta área, se aplicarán cargos adicionales.",
      },
      returns: {
        title: "5. Devoluciones y Garantía",
        content:
          "Debido a la naturaleza personalizada de nuestros productos, no aceptamos devoluciones de piezas personalizadas. Todos nuestros muebles cuentan con garantía de 2 años contra defectos de fabricación. La garantía no cubre daños por uso inadecuado, desgaste natural o modificaciones no autorizadas.",
      },
      intellectual: {
        title: "6. Propiedad Intelectual",
        content:
          "Todo el contenido de este sitio web, incluyendo textos, imágenes, diseños y logotipos, es propiedad de DavidSon´s Design y está protegido por las leyes de propiedad intelectual. Queda prohibida la reproducción, distribución o modificación sin autorización expresa.",
      },
      liability: {
        title: "7. Limitación de Responsabilidad",
        content:
          "DavidSon´s Design no será responsable por daños indirectos, incidentales o consecuentes que surjan del uso de nuestros productos o servicios. Nuestra responsabilidad se limita al precio pagado por el producto en cuestión.",
      },
      changes: {
        title: "8. Modificaciones",
        content:
          "Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web. Es responsabilidad del usuario revisar periódicamente estos términos.",
      },
      law: {
        title: "9. Ley Aplicable",
        content:
          "Estos términos y condiciones se rigen por las leyes de México. Cualquier disputa será resuelta en los tribunales competentes de Hermosillo, Sonora.",
      },
      contact: {
        title: "10. Contacto",
        content:
          "Si tiene alguna pregunta sobre estos términos y condiciones, puede contactarnos en:",
      },
    },
    contactInfo: {
      email: "Correo electrónico: soporte@davidsonsdesign.com",
      location: "Ubicación: Hermosillo, Sonora, México",
    },
    footer: {
      description:
        "Muebles artesanales premium elaborados con pasión y dedicación por maestros artesanos mexicanos desde 1998.",
      navigation: "Navegación",
      catalog: "Catálogo",
      contactTitle: "Contacto",
      location: "Hermosillo, Sonora.",
      copyright: "© 2026 Davidsons Design. Todos los derechos reservados.",
      privacy: "Política de Privacidad",
      terms: "Términos y Condiciones",
      cookies: "Política de Cookies",
    },
  },
  en: {
    nav: { products: "Products", about: "About", contact: "Contact" },
    title: "Terms and Conditions",
    lastUpdated: "Last updated: February 8, 2026",
    sections: {
      acceptance: {
        title: "1. Acceptance of Terms",
        content:
          "By accessing and using the DavidSon´s Design website, you agree to be bound by these terms and conditions of use. If you do not agree with any part of these terms, you should not use our website.",
      },
      products: {
        title: "2. Products and Services",
        content:
          "All our furniture pieces are unique handcrafted items made by Mexican master artisans. Manufacturing times may vary depending on the complexity of each piece. The images shown are representative and may present slight variations due to the handcrafted nature of our products.",
      },
      orders: {
        title: "3. Orders and Payments",
        content:
          "Orders are subject to availability and price confirmation. We reserve the right to refuse any order. Prices are subject to change without notice. A 50% deposit is required to begin manufacturing any custom piece.",
      },
      delivery: {
        title: "4. Delivery and Installation",
        content:
          "Delivery times are estimated and may vary. DavidSon´s Design is not responsible for delays caused by circumstances beyond our control. Professional delivery and installation is available in Hermosillo, Sonora and surrounding areas. For deliveries outside this area, additional charges will apply.",
      },
      returns: {
        title: "5. Returns and Warranty",
        content:
          "Due to the customized nature of our products, we do not accept returns on custom pieces. All our furniture comes with a 2-year warranty against manufacturing defects. The warranty does not cover damage from improper use, natural wear, or unauthorized modifications.",
      },
      intellectual: {
        title: "6. Intellectual Property",
        content:
          "All content on this website, including text, images, designs, and logos, is owned by DavidSon´s Design and is protected by intellectual property laws. Reproduction, distribution, or modification without express authorization is prohibited.",
      },
      liability: {
        title: "7. Limitation of Liability",
        content:
          "DavidSon´s Design shall not be liable for indirect, incidental, or consequential damages arising from the use of our products or services. Our liability is limited to the price paid for the product in question.",
      },
      changes: {
        title: "8. Modifications",
        content:
          "We reserve the right to modify these terms and conditions at any time. Modifications will take effect immediately upon posting on the website. It is the user's responsibility to periodically review these terms.",
      },
      law: {
        title: "9. Applicable Law",
        content:
          "These terms and conditions are governed by the laws of Mexico. Any disputes will be resolved in the competent courts of Hermosillo, Sonora.",
      },
      contact: {
        title: "10. Contact",
        content:
          "If you have any questions about these terms and conditions, you can contact us at:",
      },
    },
    contactInfo: {
      email: "Email: soporte@davidsonsdesign.com",
      location: "Location: Hermosillo, Sonora, Mexico",
    },
    footer: {
      description:
        "Premium handcrafted furniture made with passion and dedication by Mexican master artisans since 1998.",
      navigation: "Navigation",
      catalog: "Catalog",
      contactTitle: "Contact",
      location: "Hermosillo, Sonora.",
      copyright: "© 2026 Davidsons Design. All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms and Conditions",
      cookies: "Cookie Policy",
    },
  },
};

export default function TermsPage() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDarkMode ? "bg-[#0a0806]" : "bg-white"
        }`}
      >
        <Header
          isScrolled={isScrolled}
          language={language}
          isDarkMode={isDarkMode}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleLanguage={() => setLanguage((l) => (l === "es" ? "en" : "es"))}
          onToggleDarkMode={() => setIsDarkMode((m) => !m)}
          onToggleMobileMenu={() => setIsMobileMenuOpen((m) => !m)}
          onNavigateHome={() => (window.location.href = "/")}
          onNavigateProducts={() => (window.location.href = "/products")}
          onNavigateCart={() => {}}
          onNavigateAccount={() => (window.location.href = "/login")}
          translations={t}
        />

        <main className="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-20 lg:px-12 lg:py-24">
          <div className="mb-10 md:mb-12 lg:mb-16">
            <h1
              className={`mb-4 text-3xl tracking-tight md:text-4xl lg:text-5xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t.title}
            </h1>
            <p
              className={`text-sm md:text-base ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              {t.lastUpdated}
            </p>
          </div>

          <div className="space-y-8 md:space-y-10">
            {(
              [
                "acceptance",
                "products",
                "orders",
                "delivery",
                "returns",
                "intellectual",
                "liability",
                "changes",
                "law",
              ] as const
            ).map((key) => (
              <section key={key}>
                <h2
                  className={`mb-3 text-xl tracking-tight md:mb-4 md:text-2xl ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {t.sections[key].title}
                </h2>
                <p
                  className={`text-base leading-relaxed md:text-lg ${
                    isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                  }`}
                >
                  {t.sections[key].content}
                </p>
              </section>
            ))}

            <section
              className={`border-t pt-8 ${
                isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
              }`}
            >
              <h2
                className={`mb-3 text-xl tracking-tight md:mb-4 md:text-2xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.sections.contact.title}
              </h2>
              <p
                className={`mb-4 text-base leading-relaxed md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.contact.content}
              </p>
              <div
                className={`space-y-2 text-base md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                <p>{t.contactInfo.email}</p>
                <p>{t.contactInfo.location}</p>
              </div>
            </section>
          </div>
        </main>

        <Footer
          language={language}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode((m) => !m)}
          onNavigatePrivacy={() => (window.location.href = "/privacy")}
          onNavigateTerms={() => (window.location.href = "/terms")}
          onNavigateCookies={() => (window.location.href = "/cookies")}
          translations={t}
        />
      </div>
    </div>
  );
}
