export const baseTranslations = {
  es: {
    nav: { products: "Productos", about: "Nosotros", contact: "Contacto" },
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
} as const;

export type ContentPageTranslations = (typeof baseTranslations)["es"];
