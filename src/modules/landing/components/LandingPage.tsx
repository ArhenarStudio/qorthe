"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Header } from "@/modules/header";
import { Footer } from "@/modules/footer";
import { CartDrawer } from "@/modules/cart";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import {
  AnimatedSection,
  StaggerContainer,
  staggerItem,
} from "@/components/shared/AnimatedSection";

const translations = {
  es: {
    nav: { products: "Productos", about: "Nosotros", contact: "Contacto" },
    hero: {
      title: ["Muebles", "Artesanales", "Premium"],
      description:
        "Cada pieza es elaborada a mano por artesanos mexicanos, combinando técnicas tradicionales con diseño contemporáneo para crear muebles únicos y atemporales.",
      cta: "Explorar Colección",
    },
    collections: {
      title: "Nuestras Colecciones",
      subtitle: "Descubre piezas únicas diseñadas para transformar tu espacio",
      chairs: {
        title: "Sillas & Sillones",
        description: "Diseños ergonómicos con carácter artesanal",
        cta: "Ver Colección",
      },
      tables: {
        title: "Mesas de Comedor",
        description: "El centro de reunión de tu hogar",
        cta: "Ver Colección",
      },
      bedrooms: {
        title: "Recámaras",
        description: "Espacios de descanso con elegancia",
        cta: "Ver Colección",
      },
    },
    process: {
      title: ["Artesanía", "Mexicana", "Auténtica"],
      paragraph1:
        "Cada mueble de Davidsons Design nace de la pasión y dedicación de maestros artesanos mexicanos que han perfeccionado su oficio a lo largo de generaciones.",
      paragraph2:
        "Seleccionamos cuidadosamente maderas nobles y materiales sostenibles, transformándolos en piezas únicas que cuentan una historia y perduran en el tiempo.",
      paragraph3:
        "Nuestro compromiso es preservar las técnicas tradicionales mientras exploramos nuevas formas de diseño contemporáneo.",
      stats: {
        years: "Años de Experiencia",
        handmade: "Hecho a Mano",
        pieces: "Piezas Creadas",
      },
    },
    testimonials: {
      title: "Lo Que Dicen Nuestros Clientes",
      testimonial1: {
        text: "La calidad y atención al detalle son excepcionales. Cada pieza es verdaderamente una obra de arte que transforma nuestro hogar.",
        name: "María Fernández",
        location: "Ciudad de México",
      },
      testimonial2: {
        text: "Invertir en muebles Davidsons fue la mejor decisión. Son piezas atemporales que valoraremos por generaciones.",
        name: "Carlos Jiménez",
        location: "Monterrey",
      },
      testimonial3: {
        text: "El servicio personalizado y la artesanía son incomparables. Cada detalle refleja pasión y dedicación.",
        name: "Ana Martínez",
        location: "Guadalajara",
      },
    },
    cta: {
      title: "Crea Tu Espacio Ideal",
      description:
        "Agenda una consulta personalizada con nuestros diseñadores y descubre cómo podemos transformar tu hogar.",
      button: "Agendar Consulta",
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
    nav: { products: "Products", about: "About Us", contact: "Contact" },
    hero: {
      title: ["Premium", "Handcrafted", "Furniture"],
      description:
        "Each piece is handcrafted by Mexican artisans, combining traditional techniques with contemporary design to create unique and timeless furniture.",
      cta: "Explore Collection",
    },
    collections: {
      title: "Our Collections",
      subtitle: "Discover unique pieces designed to transform your space",
      chairs: {
        title: "Chairs & Armchairs",
        description: "Ergonomic designs with artisan character",
        cta: "View Collection",
      },
      tables: {
        title: "Dining Tables",
        description: "The gathering center of your home",
        cta: "View Collection",
      },
      bedrooms: {
        title: "Bedrooms",
        description: "Rest spaces with elegance",
        cta: "View Collection",
      },
    },
    process: {
      title: ["Authentic", "Mexican", "Craftsmanship"],
      paragraph1:
        "Every piece of Davidsons Design furniture is born from the passion and dedication of Mexican master artisans who have perfected their craft over generations.",
      paragraph2:
        "We carefully select noble woods and sustainable materials, transforming them into unique pieces that tell a story and endure over time.",
      paragraph3:
        "Our commitment is to preserve traditional techniques while exploring new forms of contemporary design.",
      stats: {
        years: "Years of Experience",
        handmade: "Handmade",
        pieces: "Pieces Created",
      },
    },
    testimonials: {
      title: "What Our Customers Say",
      testimonial1: {
        text: "The quality and attention to detail are exceptional. Each piece is truly a work of art that transforms our home.",
        name: "María Fernández",
        location: "Mexico City",
      },
      testimonial2: {
        text: "Investing in Davidsons furniture was the best decision. They are timeless pieces that we will value for generations.",
        name: "Carlos Jiménez",
        location: "Monterrey",
      },
      testimonial3: {
        text: "The personalized service and craftsmanship are incomparable. Every detail reflects passion and dedication.",
        name: "Ana Martínez",
        location: "Guadalajara",
      },
    },
    cta: {
      title: "Create Your Ideal Space",
      description:
        "Schedule a personalized consultation with our designers and discover how we can transform your home.",
      button: "Schedule Consultation",
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

export function LandingPage() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<
    { id: string; name: string; price: number; quantity: number; image: string }[]
  >([]);

  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goProducts = () => (window.location.href = "/products");

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
          onNavigateProducts={goProducts}
          onNavigateCart={() => setIsCartOpen(true)}
          onNavigateAccount={() => (window.location.href = "/login")}
          translations={t}
          cartItemsCount={cartItems.reduce((s, i) => s + i.quantity, 0)}
        />

        {/* Hero */}
        <section className="pb-12 pt-20 md:pb-16 md:pt-24 lg:pb-20 lg:pt-32">
          <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
            <div className="grid min-h-[calc(100vh-8rem)] grid-cols-1 items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="space-y-6 text-center md:space-y-8 lg:text-left"
              >
                <div className="space-y-4 md:space-y-6">
                  <h2
                    className={`text-3xl leading-tight tracking-tight md:text-5xl lg:text-6xl ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {t.hero.title.map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < t.hero.title.length - 1 && <br />}
                      </span>
                    ))}
                  </h2>
                  <p
                    className={`mx-auto max-w-xl text-base md:text-lg lg:mx-0 lg:text-xl ${
                      isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                    }`}
                  >
                    {t.hero.description}
                  </p>
                </div>
                <motion.button
                  onClick={goProducts}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-3 tracking-wide transition-opacity md:px-8 md:py-4 ${
                    isDarkMode
                      ? "bg-[#8b6f47] text-white hover:opacity-90"
                      : "bg-[#3d2f23] text-white hover:opacity-90"
                  }`}
                >
                  {t.hero.cta}
                </motion.button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative aspect-square md:aspect-[4/3] lg:aspect-square"
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"
                  alt="Mueble artesanal premium"
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Collections */}
        <section
          id="collections"
          className={`border-t py-12 md:py-16 lg:py-20 ${
            isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
          }`}
        >
          <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
            <AnimatedSection className="mb-10 text-center md:mb-12 lg:mb-16">
              <h2
                className={`mb-3 text-2xl tracking-tight md:mb-4 md:text-3xl lg:text-4xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.collections.title}
              </h2>
              <p
                className={`mx-auto max-w-2xl text-base md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.collections.subtitle}
              </p>
            </AnimatedSection>
            <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              {[
                {
                  key: "chairs",
                  src: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80",
                  alt: "Sillas artesanales",
                  ...t.collections.chairs,
                },
                {
                  key: "tables",
                  src: "https://images.unsplash.com/photo-1617098900591-3f90928e8c54?w=600&q=80",
                  alt: "Mesas de comedor",
                  ...t.collections.tables,
                },
                {
                  key: "bedrooms",
                  src: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80",
                  alt: "Recámaras",
                  ...t.collections.bedrooms,
                },
              ].map((col) => (
                <motion.div
                  key={col.key}
                  variants={staggerItem}
                  role="button"
                  tabIndex={0}
                  onClick={goProducts}
                  onKeyDown={(e) => e.key === "Enter" && goProducts()}
                  className="group cursor-pointer"
                >
                  <div className="relative mb-4 aspect-[3/4] overflow-hidden md:mb-6">
                    <ImageWithFallback
                      src={col.src}
                      alt={col.alt}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3
                    className={`mb-2 text-xl tracking-tight md:text-2xl ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {col.title}
                  </h3>
                  <p
                    className={`mb-3 text-sm md:mb-4 md:text-base ${
                      isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                    }`}
                  >
                    {col.description}
                  </p>
                  <span
                    className={`text-sm tracking-wide transition-colors ${
                      isDarkMode
                        ? "text-[#8b6f47] group-hover:text-white"
                        : "text-[#3d2f23] group-hover:text-[#8b6f47]"
                    }`}
                  >
                    {col.cta} →
                  </span>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Process */}
        <section
          id="about"
          className={`border-t py-12 md:py-16 lg:py-20 ${
            isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
          }`}
        >
          <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
            <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16">
              <AnimatedSection direction="left" className="relative aspect-[4/3]">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=800&q=80"
                  alt="Artesano trabajando"
                  className="h-full w-full object-cover"
                />
              </AnimatedSection>
              <AnimatedSection
                direction="right"
                delay={0.15}
                className="flex flex-col justify-center space-y-6 md:space-y-8"
              >
                <h2
                  className={`text-2xl tracking-tight md:text-3xl lg:text-4xl ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {t.process.title.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < t.process.title.length - 1 && <br />}
                    </span>
                  ))}
                </h2>
                <div className="space-y-4 md:space-y-6">
                  <p
                    className={`text-sm md:text-base ${
                      isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                    }`}
                  >
                    {t.process.paragraph1}
                  </p>
                  <p
                    className={`text-sm md:text-base ${
                      isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                    }`}
                  >
                    {t.process.paragraph2}
                  </p>
                  <p
                    className={`text-sm md:text-base ${
                      isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                    }`}
                  >
                    {t.process.paragraph3}
                  </p>
                </div>
                <StaggerContainer
                  staggerDelay={0.1}
                  className="grid grid-cols-3 gap-4 pt-4 md:gap-6 md:pt-6"
                >
                  <motion.div variants={staggerItem}>
                    <div
                      className={`mb-1 text-2xl md:mb-2 md:text-3xl lg:text-4xl ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      28+
                    </div>
                    <div
                      className={`text-xs md:text-sm ${
                        isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                      }`}
                    >
                      {t.process.stats.years}
                    </div>
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <div
                      className={`mb-1 text-2xl md:mb-2 md:text-3xl lg:text-4xl ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      100%
                    </div>
                    <div
                      className={`text-xs md:text-sm ${
                        isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                      }`}
                    >
                      {t.process.stats.handmade}
                    </div>
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <div
                      className={`mb-1 text-2xl md:mb-2 md:text-3xl lg:text-4xl ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      5000+
                    </div>
                    <div
                      className={`text-xs md:text-sm ${
                        isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                      }`}
                    >
                      {t.process.stats.pieces}
                    </div>
                  </motion.div>
                </StaggerContainer>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section
          className={`border-t py-12 md:py-16 lg:py-20 ${
            isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
          }`}
        >
          <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
            <AnimatedSection className="mb-10 text-center md:mb-12 lg:mb-16">
              <h2
                className={`text-2xl tracking-tight md:text-3xl lg:text-4xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.testimonials.title}
              </h2>
            </AnimatedSection>
            <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              {[
                t.testimonials.testimonial1,
                t.testimonials.testimonial2,
                t.testimonials.testimonial3,
              ].map((test, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className={`border p-6 md:p-8 ${
                    isDarkMode
                      ? "border-[#3d2f23] bg-[#1a1512]"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <p
                    className={`mb-4 text-sm md:mb-6 md:text-base ${
                      isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                    }`}
                  >
                    &quot;{test.text}&quot;
                  </p>
                  <div>
                    <p
                      className={`font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {test.name}
                    </p>
                    <p
                      className={`text-xs md:text-sm ${
                        isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                      }`}
                    >
                      {test.location}
                    </p>
                  </div>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* CTA */}
        <section
          className={`border-t py-12 md:py-16 lg:py-20 ${
            isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
          }`}
        >
          <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
            <AnimatedSection
              className={`p-8 text-center md:p-12 lg:p-16 ${
                isDarkMode ? "bg-[#1a1512]" : "bg-gray-50"
              }`}
            >
              <h2
                className={`mb-4 text-2xl tracking-tight md:mb-6 md:text-3xl lg:text-4xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.cta.title}
              </h2>
              <p
                className={`mx-auto mb-6 max-w-2xl text-base md:mb-8 md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.cta.description}
              </p>
              <motion.button
                onClick={goProducts}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`px-6 py-3 tracking-wide transition-opacity md:px-8 md:py-4 ${
                  isDarkMode
                    ? "bg-[#8b6f47] text-white hover:opacity-90"
                    : "bg-[#3d2f23] text-white hover:opacity-90"
                }`}
              >
                {t.cta.button}
              </motion.button>
            </AnimatedSection>
          </div>
        </section>

        <Footer
          language={language}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode((m) => !m)}
          onNavigatePrivacy={() => (window.location.href = "/privacy")}
          onNavigateTerms={() => (window.location.href = "/terms")}
          onNavigateCookies={() => (window.location.href = "/cookies")}
          onNavigateCatalog={goProducts}
          translations={t}
        />
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        isDarkMode={isDarkMode}
        language={language}
        items={cartItems}
        onUpdateQuantity={(id, qty) => {
          setCartItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
          );
        }}
        onRemoveItem={(id) =>
          setCartItems((prev) => prev.filter((i) => i.id !== id))
        }
        onCheckout={() => (window.location.href = "/cart")}
        onContinueShopping={() => setIsCartOpen(false)}
      />
    </div>
  );
}
