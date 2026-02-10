"use client";

import { useEffect } from "react";

export interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: "summary" | "summary_large_image";
  language?: "es" | "en";
}

export function MetaTags({
  title = "DavidSon's Design - Muebles Artesanales Mexicanos",
  description = "Muebles artesanales de alta calidad con diseño minimalista y elegante. Fabricados a mano en México con maderas certificadas.",
  keywords = "muebles artesanales, diseño mexicano, mobiliario premium, carpintería, muebles de madera",
  ogTitle,
  ogDescription,
  ogImage = "/og-image.jpg",
  ogUrl = "https://davidsonsdesign.com",
  twitterCard = "summary_large_image",
  language = "es",
}: MetaTagsProps) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    document.title = title;

    const updateMetaTag = (
      name: string,
      content: string,
      property?: boolean
    ) => {
      const attribute = property ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${name}"]`);

      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }

      element.setAttribute("content", content);
    };

    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);
    updateMetaTag("author", "DavidSon's Design");
    updateMetaTag("language", language);

    updateMetaTag("og:title", ogTitle || title, true);
    updateMetaTag("og:description", ogDescription || description, true);
    updateMetaTag("og:image", ogImage, true);
    updateMetaTag("og:url", ogUrl, true);
    updateMetaTag("og:type", "website", true);
    updateMetaTag("og:site_name", "DavidSon's Design", true);
    updateMetaTag(
      "og:locale",
      language === "es" ? "es_MX" : "en_US",
      true
    );

    updateMetaTag("twitter:card", twitterCard);
    updateMetaTag("twitter:title", ogTitle || title);
    updateMetaTag("twitter:description", ogDescription || description);
    updateMetaTag("twitter:image", ogImage);
    updateMetaTag("twitter:site", "@davidsonsdesign");

    updateMetaTag("robots", "index, follow");
    updateMetaTag("theme-color", "#8b6f47");
  }, [
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    twitterCard,
    language,
  ]);

  return null;
}

export const metaConfigs = {
  home: (lang: "es" | "en") => ({
    title:
      lang === "es"
        ? "DavidSon's Design - Muebles Artesanales Mexicanos de Lujo"
        : "DavidSon's Design - Luxury Mexican Artisan Furniture",
    description:
      lang === "es"
        ? "Descubre nuestra colección exclusiva de muebles artesanales de madera. Diseño minimalista, calidad premium y tradición mexicana en cada pieza."
        : "Discover our exclusive collection of handcrafted wooden furniture. Minimalist design, premium quality and Mexican tradition in every piece.",
    keywords:
      lang === "es"
        ? "muebles artesanales, diseño mexicano, mobiliario premium, carpintería artesanal, muebles de lujo"
        : "artisan furniture, Mexican design, premium furniture, artisan carpentry, luxury furniture",
  }),

  catalog: (lang: "es" | "en") => ({
    title: lang === "es" ? "Catálogo - DavidSon's Design" : "Catalog - DavidSon's Design",
    description:
      lang === "es"
        ? "Explora nuestro catálogo completo de muebles artesanales: salas, comedores, recámaras y oficinas. Piezas únicas de diseño mexicano."
        : "Explore our complete catalog of artisan furniture: living rooms, dining rooms, bedrooms and offices. Unique pieces of Mexican design.",
  }),

  about: (lang: "es" | "en") => ({
    title:
      lang === "es" ? "Sobre Nosotros - DavidSon's Design" : "About Us - DavidSon's Design",
    description:
      lang === "es"
        ? "Conoce la historia de DavidSon's Design y nuestro equipo de artesanos dedicados a crear muebles excepcionales desde 1998."
        : "Learn about DavidSon's Design history and our team of artisans dedicated to creating exceptional furniture since 1998.",
  }),

  team: (lang: "es" | "en") => ({
    title:
      lang === "es" ? "Nuestro Equipo - DavidSon's Design" : "Our Team - DavidSon's Design",
    description:
      lang === "es"
        ? "Conoce a los maestros carpinteros y diseñadores que dan vida a cada pieza en DavidSon's Design."
        : "Meet the master carpenters and designers who bring each piece to life at DavidSon's Design.",
  }),

  contact: (lang: "es" | "en") => ({
    title:
      lang === "es" ? "Contacto - DavidSon's Design" : "Contact - DavidSon's Design",
    description:
      lang === "es"
        ? "Contáctanos para cotizaciones, consultas o visitas a nuestro taller en Hermosillo, Sonora."
        : "Contact us for quotes, inquiries or visits to our workshop in Hermosillo, Sonora.",
  }),
};
