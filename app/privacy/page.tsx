"use client";

import { useState, useEffect } from "react";
import { Header } from "@/modules/header";
import { Footer } from "@/modules/footer";

const translations = {
  es: {
    nav: { products: "Productos", about: "Nosotros", contact: "Contacto" },
    title: "Aviso de Privacidad",
    lastUpdated: "Última actualización: 8 de febrero de 2026",
    sections: {
      intro: {
        title: "Introducción",
        content:
          "En DavidSon´s Design, nos comprometemos a proteger la privacidad de nuestros clientes y visitantes. Este Aviso de Privacidad describe cómo recopilamos, usamos, compartimos y protegemos su información personal de acuerdo con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares de México.",
      },
      responsible: {
        title: "1. Responsable del Tratamiento de Datos",
        content:
          "DavidSon´s Design, con domicilio en Hermosillo, Sonora, México, es el responsable del tratamiento de sus datos personales. Para cualquier duda o solicitud relacionada con la protección de datos, puede contactarnos en soporte@davidsonsdesign.com",
      },
      collection: {
        title: "2. Datos Personales que Recopilamos",
        content: "Recopilamos los siguientes tipos de información personal:",
        items: [
          "Datos de identificación: nombre completo, dirección, teléfono, correo electrónico",
          "Datos de facturación: información fiscal necesaria para emitir facturas",
          "Datos de entrega: dirección de entrega e instrucciones especiales",
          "Historial de compras y preferencias de productos",
          "Información de navegación: cookies, dirección IP, tipo de navegador",
        ],
      },
      usage: {
        title: "3. Finalidades del Tratamiento",
        content: "Sus datos personales serán utilizados para las siguientes finalidades:",
        items: [
          "Procesar y gestionar sus pedidos de muebles",
          "Coordinar la entrega e instalación de productos",
          "Emitir facturas y comprobantes fiscales",
          "Proporcionar servicio al cliente y soporte post-venta",
          "Enviar comunicaciones sobre el estado de su pedido",
          "Mejorar nuestros productos y servicios",
          "Cumplir con obligaciones legales y fiscales",
        ],
      },
      marketing: {
        title: "4. Finalidades Secundarias",
        content: "De manera adicional, utilizaremos su información personal para:",
        items: [
          "Enviar promociones y ofertas especiales",
          "Realizar encuestas de satisfacción",
          "Enviar catálogos y novedades de productos",
          "Invitaciones a eventos y showrooms",
        ],
        footer:
          "Si no desea que sus datos sean tratados para estas finalidades secundarias, puede manifestarlo enviando un correo a soporte@davidsonsdesign.com",
      },
      sharing: {
        title: "5. Compartición de Datos",
        content: "Sus datos personales pueden ser compartidos con:",
        items: [
          "Empresas de mensajería y logística para realizar entregas",
          "Proveedores de servicios de instalación",
          "Instituciones financieras para procesar pagos",
          "Autoridades competentes cuando sea requerido por ley",
          "Artesanos colaboradores para la fabricación personalizada",
        ],
      },
      rights: {
        title: "6. Derechos ARCO",
        content: "Usted tiene derecho a:",
        items: [
          "Acceder a sus datos personales en nuestra posesión",
          "Rectificar datos inexactos o incompletos",
          "Cancelar sus datos cuando considere que no se requieren",
          "Oponerse al tratamiento de sus datos para fines específicos",
        ],
        footer:
          "Para ejercer sus derechos ARCO, envíe una solicitud a soporte@davidsonsdesign.com con copia de identificación oficial.",
      },
      security: {
        title: "7. Medidas de Seguridad",
        content:
          "Implementamos medidas de seguridad administrativas, técnicas y físicas para proteger sus datos personales contra daño, pérdida, alteración, destrucción o uso no autorizado. Nuestro personal está capacitado en el manejo confidencial de información personal.",
      },
      cookies: {
        title: "8. Uso de Cookies",
        content:
          "Nuestro sitio web utiliza cookies y tecnologías similares para mejorar su experiencia de navegación, analizar el tráfico del sitio y personalizar contenido. Puede configurar su navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades del sitio.",
      },
      children: {
        title: "9. Datos de Menores",
        content:
          "No recopilamos intencionalmente información personal de menores de 18 años. Si descubrimos que hemos recopilado inadvertidamente datos de un menor, tomaremos medidas para eliminar dicha información.",
      },
      changes: {
        title: "10. Modificaciones al Aviso de Privacidad",
        content:
          "Nos reservamos el derecho de modificar este Aviso de Privacidad en cualquier momento. Las modificaciones estarán disponibles en nuestro sitio web con la fecha de actualización correspondiente. Le recomendamos revisar periódicamente este aviso.",
      },
      contact: {
        title: "11. Contacto",
        content:
          "Para cualquier duda, comentario o solicitud relacionada con este Aviso de Privacidad, puede contactarnos en:",
      },
    },
    contactInfo: {
      email: "Correo electrónico: soporte@davidsonsdesign.com",
      location: "Ubicación: Hermosillo, Sonora, México",
      attention: "Atención: Departamento de Protección de Datos",
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
    title: "Privacy Policy",
    lastUpdated: "Last updated: February 8, 2026",
    sections: {
      intro: {
        title: "Introduction",
        content:
          "At DavidSon´s Design, we are committed to protecting the privacy of our customers and visitors. This Privacy Policy describes how we collect, use, share, and protect your personal information in accordance with the Federal Law on Protection of Personal Data Held by Private Parties of Mexico.",
      },
      responsible: {
        title: "1. Data Controller",
        content:
          "DavidSon´s Design, located in Hermosillo, Sonora, Mexico, is responsible for the processing of your personal data. For any questions or requests related to data protection, you can contact us at soporte@davidsonsdesign.com",
      },
      collection: {
        title: "2. Personal Data We Collect",
        content: "We collect the following types of personal information:",
        items: [
          "Identification data: full name, address, phone number, email",
          "Billing information: tax information necessary to issue invoices",
          "Delivery data: delivery address and special instructions",
          "Purchase history and product preferences",
          "Browsing information: cookies, IP address, browser type",
        ],
      },
      usage: {
        title: "3. Processing Purposes",
        content: "Your personal data will be used for the following purposes:",
        items: [
          "Process and manage your furniture orders",
          "Coordinate product delivery and installation",
          "Issue invoices and tax receipts",
          "Provide customer service and post-sale support",
          "Send communications about your order status",
          "Improve our products and services",
          "Comply with legal and tax obligations",
        ],
      },
      marketing: {
        title: "4. Secondary Purposes",
        content: "Additionally, we will use your personal information to:",
        items: [
          "Send promotions and special offers",
          "Conduct satisfaction surveys",
          "Send catalogs and product news",
          "Invitations to events and showrooms",
        ],
        footer:
          "If you do not want your data to be processed for these secondary purposes, you can express this by sending an email to soporte@davidsonsdesign.com",
      },
      sharing: {
        title: "5. Data Sharing",
        content: "Your personal data may be shared with:",
        items: [
          "Courier and logistics companies to make deliveries",
          "Installation service providers",
          "Financial institutions to process payments",
          "Competent authorities when required by law",
          "Collaborating artisans for custom manufacturing",
        ],
      },
      rights: {
        title: "6. ARCO Rights",
        content: "You have the right to:",
        items: [
          "Access your personal data in our possession",
          "Rectify inaccurate or incomplete data",
          "Cancel your data when you consider it is not required",
          "Object to the processing of your data for specific purposes",
        ],
        footer:
          "To exercise your ARCO rights, send a request to soporte@davidsonsdesign.com with a copy of official identification.",
      },
      security: {
        title: "7. Security Measures",
        content:
          "We implement administrative, technical, and physical security measures to protect your personal data against damage, loss, alteration, destruction, or unauthorized use. Our staff is trained in the confidential handling of personal information.",
      },
      cookies: {
        title: "8. Use of Cookies",
        content:
          "Our website uses cookies and similar technologies to improve your browsing experience, analyze site traffic, and personalize content. You can configure your browser to reject cookies, although this may affect some site functionalities.",
      },
      children: {
        title: "9. Children's Data",
        content:
          "We do not intentionally collect personal information from minors under 18 years of age. If we discover that we have inadvertently collected data from a minor, we will take steps to delete such information.",
      },
      changes: {
        title: "10. Privacy Policy Modifications",
        content:
          "We reserve the right to modify this Privacy Policy at any time. Modifications will be available on our website with the corresponding update date. We recommend you periodically review this notice.",
      },
      contact: {
        title: "11. Contact",
        content:
          "For any questions, comments, or requests related to this Privacy Policy, you can contact us at:",
      },
    },
    contactInfo: {
      email: "Email: soporte@davidsonsdesign.com",
      location: "Location: Hermosillo, Sonora, Mexico",
      attention: "Attention: Data Protection Department",
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

export default function PrivacyPage() {
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
            <section>
              <h2
                className={`mb-3 text-xl tracking-tight md:mb-4 md:text-2xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.sections.intro.title}
              </h2>
              <p
                className={`text-base leading-relaxed md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.intro.content}
              </p>
            </section>

            <section>
              <h2
                className={`mb-3 text-xl tracking-tight md:mb-4 md:text-2xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.sections.responsible.title}
              </h2>
              <p
                className={`text-base leading-relaxed md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.responsible.content}
              </p>
            </section>

            <section>
              <h2
                className={`mb-3 text-xl tracking-tight md:mb-4 md:text-2xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.sections.collection.title}
              </h2>
              <p
                className={`mb-4 text-base leading-relaxed md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.collection.content}
              </p>
              <ul
                className={`list-inside list-disc space-y-2 text-base md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.collection.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2
                className={`mb-3 text-xl tracking-tight md:mb-4 md:text-2xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.sections.usage.title}
              </h2>
              <p
                className={`mb-4 text-base leading-relaxed md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.usage.content}
              </p>
              <ul
                className={`list-inside list-disc space-y-2 text-base md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.usage.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2
                className={`mb-3 text-xl tracking-tight md:mb-4 md:text-2xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.sections.marketing.title}
              </h2>
              <p
                className={`mb-4 text-base leading-relaxed md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.marketing.content}
              </p>
              <ul
                className={`mb-4 list-inside list-disc space-y-2 text-base md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.marketing.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <p
                className={`text-base italic leading-relaxed md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.marketing.footer}
              </p>
            </section>

            <section>
              <h2
                className={`mb-3 text-xl tracking-tight md:mb-4 md:text-2xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.sections.sharing.title}
              </h2>
              <p
                className={`mb-4 text-base leading-relaxed md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.sharing.content}
              </p>
              <ul
                className={`list-inside list-disc space-y-2 text-base md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.sharing.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2
                className={`mb-3 text-xl tracking-tight md:mb-4 md:text-2xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.sections.rights.title}
              </h2>
              <p
                className={`mb-4 text-base leading-relaxed md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.rights.content}
              </p>
              <ul
                className={`mb-4 list-inside list-disc space-y-2 text-base md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.rights.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <p
                className={`text-base italic leading-relaxed md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.rights.footer}
              </p>
            </section>

            <section>
              <h2
                className={`mb-3 text-xl tracking-tight md:mb-4 md:text-2xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.sections.security.title}
              </h2>
              <p
                className={`text-base leading-relaxed md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.security.content}
              </p>
            </section>

            <section>
              <h2
                className={`mb-3 text-xl tracking-tight md:mb-4 md:text-2xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.sections.cookies.title}
              </h2>
              <p
                className={`text-base leading-relaxed md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.cookies.content}
              </p>
            </section>

            <section>
              <h2
                className={`mb-3 text-xl tracking-tight md:mb-4 md:text-2xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.sections.children.title}
              </h2>
              <p
                className={`text-base leading-relaxed md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.children.content}
              </p>
            </section>

            <section>
              <h2
                className={`mb-3 text-xl tracking-tight md:mb-4 md:text-2xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.sections.changes.title}
              </h2>
              <p
                className={`text-base leading-relaxed md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.sections.changes.content}
              </p>
            </section>

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
                <p>{t.contactInfo.attention}</p>
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
