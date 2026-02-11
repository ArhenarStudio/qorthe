"use client";

import { useState, useEffect } from "react";
import { useAppState } from "@/modules/app-state";

const translations = {
  es: {
    nav: { products: "Productos", about: "Nosotros", contact: "Contacto" },
    title: "Política de Cookies",
    lastUpdated: "Última actualización: 8 de febrero de 2026",
    sections: {
      intro: {
        title: "Introducción",
        content:
          "DavidSon´s Design utiliza cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web. Esta Política de Cookies explica qué son las cookies, cómo las utilizamos, y cómo puede gestionarlas.",
      },
      what: {
        title: "1. ¿Qué son las Cookies?",
        content:
          "Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (ordenador, tablet o móvil) cuando visita un sitio web. Permiten que el sitio web reconozca su dispositivo y recuerde información sobre su visita, como sus preferencias de idioma y otras configuraciones.",
      },
      types: {
        title: "2. Tipos de Cookies que Utilizamos",
        essential: {
          title: "Cookies Esenciales",
          content:
            "Estas cookies son necesarias para que el sitio web funcione correctamente. Sin ellas, no podríamos proporcionar los servicios que solicita.",
          items: [
            "Cookies de sesión para mantenerlo conectado",
            "Cookies de seguridad para proteger contra fraudes",
            "Cookies de preferencias de idioma y tema (claro/oscuro)",
          ],
        },
        analytics: {
          title: "Cookies Analíticas",
          content:
            "Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web, proporcionando información sobre las áreas visitadas, el tiempo de permanencia y los problemas encontrados.",
          items: [
            "Número de visitantes del sitio",
            "Páginas más visitadas",
            "Fuente de tráfico",
            "Comportamiento de navegación",
          ],
        },
        functional: {
          title: "Cookies Funcionales",
          content:
            "Estas cookies permiten que el sitio web recuerde las elecciones que hace y proporcione características mejoradas y más personales.",
          items: [
            "Recordar sus preferencias de visualización",
            "Recordar productos vistos recientemente",
            "Mantener el carrito de compras",
            "Personalizar la experiencia según su historial",
          ],
        },
        marketing: {
          title: "Cookies de Marketing",
          content:
            "Utilizamos estas cookies para mostrarle anuncios relevantes y medir la efectividad de nuestras campañas publicitarias.",
          items: [
            "Seguimiento de conversiones",
            "Retargeting de productos vistos",
            "Análisis de efectividad publicitaria",
            "Personalización de contenido promocional",
          ],
        },
      },
      thirdParty: {
        title: "3. Cookies de Terceros",
        content: "Además de nuestras propias cookies, también utilizamos cookies de terceros:",
        items: [
          "Google Analytics: Para análisis de tráfico web",
          "Redes sociales: Para compartir contenido en plataformas sociales",
          "Proveedores de pago: Para procesar transacciones de forma segura",
          "Servicios de mapas: Para mostrar ubicaciones de nuestros showrooms",
        ],
      },
      duration: {
        title: "4. Duración de las Cookies",
        session: {
          title: "Cookies de Sesión",
          content: "Se eliminan automáticamente cuando cierra su navegador.",
        },
        persistent: {
          title: "Cookies Persistentes",
          content:
            "Permanecen en su dispositivo durante un período específico o hasta que las elimine manualmente. Normalmente, nuestras cookies persistentes duran entre 30 días y 2 años.",
        },
      },
      management: {
        title: "5. Gestión de Cookies",
        content: "Puede controlar y gestionar las cookies de varias maneras:",
        browser: {
          title: "Configuración del Navegador",
          content: "La mayoría de los navegadores le permiten:",
          items: [
            "Ver qué cookies están almacenadas y eliminarlas individualmente",
            "Bloquear cookies de terceros",
            "Bloquear todas las cookies",
            "Eliminar todas las cookies al cerrar el navegador",
            "Recibir una advertencia antes de que se almacene una cookie",
          ],
        },
        instructions: {
          title: "Instrucciones por Navegador",
          chrome:
            "Chrome: Configuración > Privacidad y seguridad > Cookies y otros datos de sitios",
          firefox:
            "Firefox: Opciones > Privacidad y seguridad > Cookies y datos del sitio",
          safari:
            "Safari: Preferencias > Privacidad > Gestionar datos del sitio web",
          edge:
            "Edge: Configuración > Cookies y permisos del sitio > Cookies y datos del sitio",
        },
      },
      consequences: {
        title: "6. Consecuencias de Deshabilitar Cookies",
        content:
          "Si decide bloquear o eliminar cookies, algunas partes de nuestro sitio web pueden no funcionar correctamente:",
        items: [
          "No podrá mantener productos en su carrito de compras",
          "Sus preferencias de idioma y tema no se guardarán",
          "Algunas funciones personalizadas no estarán disponibles",
          "La navegación puede ser menos fluida",
          "No podremos recordar sus preferencias de visualización",
        ],
      },
      consent: {
        title: "7. Consentimiento",
        content:
          "Al utilizar nuestro sitio web, usted acepta el uso de cookies de acuerdo con esta Política de Cookies. Cuando visita nuestro sitio por primera vez, le pedimos su consentimiento para utilizar cookies no esenciales. Puede retirar su consentimiento en cualquier momento modificando la configuración de su navegador.",
      },
      updates: {
        title: "8. Actualizaciones de esta Política",
        content:
          "Podemos actualizar esta Política de Cookies periódicamente para reflejar cambios en las cookies que utilizamos o por razones operativas, legales o reglamentarias. Le recomendamos que revise esta página regularmente para estar informado sobre cómo utilizamos las cookies.",
      },
      contact: {
        title: "9. Contacto",
        content:
          "Si tiene preguntas sobre nuestra Política de Cookies, puede contactarnos en:",
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
    title: "Cookie Policy",
    lastUpdated: "Last updated: February 8, 2026",
    sections: {
      intro: {
        title: "Introduction",
        content:
          "DavidSon´s Design uses cookies and similar technologies to improve your experience on our website. This Cookie Policy explains what cookies are, how we use them, and how you can manage them.",
      },
      what: {
        title: "1. What are Cookies?",
        content:
          "Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They allow the website to recognize your device and remember information about your visit, such as your language preferences and other settings.",
      },
      types: {
        title: "2. Types of Cookies We Use",
        essential: {
          title: "Essential Cookies",
          content:
            "These cookies are necessary for the website to function properly. Without them, we could not provide the services you request.",
          items: [
            "Session cookies to keep you logged in",
            "Security cookies to protect against fraud",
            "Language and theme (light/dark) preference cookies",
          ],
        },
        analytics: {
          title: "Analytics Cookies",
          content:
            "They help us understand how visitors interact with our website, providing information about visited areas, time spent, and problems encountered.",
          items: [
            "Number of site visitors",
            "Most visited pages",
            "Traffic source",
            "Browsing behavior",
          ],
        },
        functional: {
          title: "Functional Cookies",
          content:
            "These cookies allow the website to remember the choices you make and provide enhanced and more personal features.",
          items: [
            "Remember your viewing preferences",
            "Remember recently viewed products",
            "Maintain shopping cart",
            "Personalize experience based on your history",
          ],
        },
        marketing: {
          title: "Marketing Cookies",
          content:
            "We use these cookies to show you relevant ads and measure the effectiveness of our advertising campaigns.",
          items: [
            "Conversion tracking",
            "Retargeting of viewed products",
            "Advertising effectiveness analysis",
            "Promotional content personalization",
          ],
        },
      },
      thirdParty: {
        title: "3. Third-Party Cookies",
        content: "In addition to our own cookies, we also use third-party cookies:",
        items: [
          "Google Analytics: For web traffic analysis",
          "Social networks: To share content on social platforms",
          "Payment providers: To securely process transactions",
          "Map services: To display our showroom locations",
        ],
      },
      duration: {
        title: "4. Cookie Duration",
        session: {
          title: "Session Cookies",
          content: "They are automatically deleted when you close your browser.",
        },
        persistent: {
          title: "Persistent Cookies",
          content:
            "They remain on your device for a specific period or until you manually delete them. Typically, our persistent cookies last between 30 days and 2 years.",
        },
      },
      management: {
        title: "5. Cookie Management",
        content: "You can control and manage cookies in several ways:",
        browser: {
          title: "Browser Settings",
          content: "Most browsers allow you to:",
          items: [
            "See which cookies are stored and delete them individually",
            "Block third-party cookies",
            "Block all cookies",
            "Delete all cookies when closing the browser",
            "Receive a warning before a cookie is stored",
          ],
        },
        instructions: {
          title: "Browser Instructions",
          chrome:
            "Chrome: Settings > Privacy and security > Cookies and other site data",
          firefox:
            "Firefox: Options > Privacy and security > Cookies and site data",
          safari:
            "Safari: Preferences > Privacy > Manage website data",
          edge:
            "Edge: Settings > Cookies and site permissions > Cookies and site data",
        },
      },
      consequences: {
        title: "6. Consequences of Disabling Cookies",
        content:
          "If you decide to block or delete cookies, some parts of our website may not function properly:",
        items: [
          "You will not be able to keep products in your shopping cart",
          "Your language and theme preferences will not be saved",
          "Some custom features will not be available",
          "Navigation may be less smooth",
          "We will not be able to remember your viewing preferences",
        ],
      },
      consent: {
        title: "7. Consent",
        content:
          "By using our website, you agree to the use of cookies in accordance with this Cookie Policy. When you visit our site for the first time, we ask for your consent to use non-essential cookies. You can withdraw your consent at any time by modifying your browser settings.",
      },
      updates: {
        title: "8. Policy Updates",
        content:
          "We may update this Cookie Policy periodically to reflect changes in the cookies we use or for operational, legal, or regulatory reasons. We recommend that you review this page regularly to stay informed about how we use cookies.",
      },
      contact: {
        title: "9. Contact",
        content:
          "If you have questions about our Cookie Policy, you can contact us at:",
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

export default function CookiesPage() {
  const { language, isDarkMode } = useAppState();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sectionClass = (isH2: boolean) =>
    isH2
      ? `mb-3 text-xl tracking-tight md:mb-4 md:text-2xl ${isDarkMode ? "text-white" : "text-gray-900"}`
      : `mb-2 text-lg tracking-tight md:mb-3 md:text-xl ${isDarkMode ? "text-white" : "text-gray-900"}`;
  const textClass = `text-base leading-relaxed md:text-lg ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`;
  const listClass = `list-inside list-disc space-y-2 text-base md:text-lg ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`;

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDarkMode ? "bg-[#0a0806]" : "bg-white"
        }`}
      >
        <main className="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-20 lg:px-12 lg:py-24">
          <div className="mb-10 md:mb-12 lg:mb-16">
            <h1 className={`mb-4 text-3xl tracking-tight md:text-4xl lg:text-5xl ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {t.title}
            </h1>
            <p className={textClass}>{t.lastUpdated}</p>
          </div>

          <div className="space-y-8 md:space-y-10">
            <section>
              <h2 className={sectionClass(true)}>{t.sections.intro.title}</h2>
              <p className={textClass}>{t.sections.intro.content}</p>
            </section>

            <section>
              <h2 className={sectionClass(true)}>{t.sections.what.title}</h2>
              <p className={textClass}>{t.sections.what.content}</p>
            </section>

            <section>
              <h2 className={`${sectionClass(true)} mb-4 md:mb-6`}>{t.sections.types.title}</h2>
              {(["essential", "analytics", "functional", "marketing"] as const).map((key) => (
                <div key={key} className="mb-6 last:mb-0">
                  <h3 className={sectionClass(false)}>{t.sections.types[key].title}</h3>
                  <p className={`${textClass} mb-3`}>{t.sections.types[key].content}</p>
                  <ul className={listClass}>
                    {t.sections.types[key].items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            <section>
              <h2 className={sectionClass(true)}>{t.sections.thirdParty.title}</h2>
              <p className={`${textClass} mb-4`}>{t.sections.thirdParty.content}</p>
              <ul className={listClass}>
                {t.sections.thirdParty.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className={`${sectionClass(true)} mb-4 md:mb-6`}>{t.sections.duration.title}</h2>
              <div className="mb-4">
                <h3 className={sectionClass(false)}>{t.sections.duration.session.title}</h3>
                <p className={textClass}>{t.sections.duration.session.content}</p>
              </div>
              <div>
                <h3 className={sectionClass(false)}>{t.sections.duration.persistent.title}</h3>
                <p className={textClass}>{t.sections.duration.persistent.content}</p>
              </div>
            </section>

            <section>
              <h2 className={sectionClass(true)}>{t.sections.management.title}</h2>
              <p className={`${textClass} mb-4`}>{t.sections.management.content}</p>
              <div className="mb-6">
                <h3 className={sectionClass(false)}>{t.sections.management.browser.title}</h3>
                <p className={`${textClass} mb-3`}>{t.sections.management.browser.content}</p>
                <ul className={listClass}>
                  {t.sections.management.browser.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className={`${sectionClass(false)} mb-3 md:mb-4`}>
                  {t.sections.management.instructions.title}
                </h3>
                <div className={`space-y-2 text-base md:text-lg ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}>
                  <p>• {t.sections.management.instructions.chrome}</p>
                  <p>• {t.sections.management.instructions.firefox}</p>
                  <p>• {t.sections.management.instructions.safari}</p>
                  <p>• {t.sections.management.instructions.edge}</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className={sectionClass(true)}>{t.sections.consequences.title}</h2>
              <p className={`${textClass} mb-4`}>{t.sections.consequences.content}</p>
              <ul className={listClass}>
                {t.sections.consequences.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className={sectionClass(true)}>{t.sections.consent.title}</h2>
              <p className={textClass}>{t.sections.consent.content}</p>
            </section>

            <section>
              <h2 className={sectionClass(true)}>{t.sections.updates.title}</h2>
              <p className={textClass}>{t.sections.updates.content}</p>
            </section>

            <section className={`border-t pt-8 ${isDarkMode ? "border-[#3d2f23]" : "border-gray-200"}`}>
              <h2 className={sectionClass(true)}>{t.sections.contact.title}</h2>
              <p className={`${textClass} mb-4`}>{t.sections.contact.content}</p>
              <div className={`space-y-2 text-base md:text-lg ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}>
                <p>{t.contactInfo.email}</p>
                <p>{t.contactInfo.location}</p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
