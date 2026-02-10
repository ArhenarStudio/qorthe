"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { ContentPageShell, useContentPage } from "./ContentPageShell";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
}

const categories = {
  es: ["all", "Tendencias", "Cuidados", "Artesanos", "Diseño", "Sustentabilidad"],
  en: ["all", "Trends", "Care", "Artisans", "Design", "Sustainability"],
};

const blogPosts: Record<"es" | "en", BlogPost[]> = {
  es: [
    {
      id: "1",
      title: "Tendencias 2026 en Diseño de Interiores: El Retorno de lo Artesanal",
      excerpt:
        "Descubre cómo el diseño contemporáneo está volviendo a sus raíces artesanales, priorizando piezas únicas y técnicas tradicionales sobre la producción masiva.",
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
      date: "8 de Febrero, 2026",
      readTime: "5 min",
      category: "Tendencias",
      author: "María González",
    },
    {
      id: "2",
      title: "Cómo Cuidar Muebles de Madera Maciza: Guía Completa",
      excerpt:
        "Aprende los secretos para mantener tus muebles de madera en perfecto estado durante décadas. Tips de limpieza, aceites y mantenimiento preventivo.",
      image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800",
      date: "5 de Febrero, 2026",
      readTime: "7 min",
      category: "Cuidados",
      author: "Carlos Ramírez",
    },
    {
      id: "3",
      title: "Maestros Artesanos: La Historia de Don Pedro y Sus 40 Años de Carpintería",
      excerpt:
        "Conoce la inspiradora historia de uno de nuestros maestros carpinteros, quien ha dedicado su vida a perfeccionar el arte de trabajar la madera.",
      image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800",
      date: "1 de Febrero, 2026",
      readTime: "6 min",
      category: "Artesanos",
      author: "Ana Martínez",
    },
    {
      id: "4",
      title: "Maximiza Espacios Pequeños con Muebles Multifuncionales",
      excerpt:
        "Descubre cómo nuestros diseños inteligentes pueden transformar espacios reducidos en ambientes funcionales y elegantes sin sacrificar estilo.",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
      date: "28 de Enero, 2026",
      readTime: "4 min",
      category: "Diseño",
      author: "Luis Hernández",
    },
    {
      id: "5",
      title: "Maderas Sustentables: Nuestro Compromiso con el Medio Ambiente",
      excerpt:
        "Conoce las certificaciones forestales que respaldan nuestros materiales y cómo aseguramos que cada pieza sea ecológicamente responsable.",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
      date: "25 de Enero, 2026",
      readTime: "5 min",
      category: "Sustentabilidad",
      author: "Roberto Silva",
    },
    {
      id: "6",
      title: "La Psicología del Color en el Diseño de Interiores",
      excerpt:
        "Explora cómo los tonos de madera y acabados pueden influir en el ambiente y estado de ánimo de tus espacios.",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800",
      date: "20 de Enero, 2026",
      readTime: "6 min",
      category: "Diseño",
      author: "María González",
    },
  ],
  en: [
    {
      id: "1",
      title: "2026 Interior Design Trends: The Return of Craftsmanship",
      excerpt:
        "Discover how contemporary design is returning to its artisanal roots, prioritizing unique pieces and traditional techniques over mass production.",
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
      date: "February 8, 2026",
      readTime: "5 min",
      category: "Trends",
      author: "María González",
    },
    {
      id: "2",
      title: "How to Care for Solid Wood Furniture: Complete Guide",
      excerpt:
        "Learn the secrets to keeping your wood furniture in perfect condition for decades. Cleaning tips, oils, and preventive maintenance.",
      image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800",
      date: "February 5, 2026",
      readTime: "7 min",
      category: "Care",
      author: "Carlos Ramírez",
    },
    {
      id: "3",
      title: "Master Artisans: The Story of Don Pedro and His 40 Years of Carpentry",
      excerpt:
        "Meet the inspiring story of one of our master carpenters, who has dedicated his life to perfecting the art of woodworking.",
      image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800",
      date: "February 1, 2026",
      readTime: "6 min",
      category: "Artisans",
      author: "Ana Martínez",
    },
    {
      id: "4",
      title: "Maximize Small Spaces with Multifunctional Furniture",
      excerpt:
        "Discover how our intelligent designs can transform small spaces into functional and elegant environments without sacrificing style.",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
      date: "January 28, 2026",
      readTime: "4 min",
      category: "Design",
      author: "Luis Hernández",
    },
    {
      id: "5",
      title: "Sustainable Woods: Our Commitment to the Environment",
      excerpt:
        "Learn about the forestry certifications backing our materials and how we ensure each piece is ecologically responsible.",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
      date: "January 25, 2026",
      readTime: "5 min",
      category: "Sustainability",
      author: "Roberto Silva",
    },
    {
      id: "6",
      title: "The Psychology of Color in Interior Design",
      excerpt:
        "Explore how wood tones and finishes can influence the atmosphere and mood of your spaces.",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800",
      date: "January 20, 2026",
      readTime: "6 min",
      category: "Design",
      author: "María González",
    },
  ],
};

const pageTranslations = {
  es: {
    title: "Blog de Diseño",
    subtitle:
      "Inspiración, consejos y historias sobre el arte de crear espacios únicos",
    searchPlaceholder: "Buscar artículos...",
    allCategories: "Todas",
    readMore: "Leer más",
    noResults: "No se encontraron artículos que coincidan con tu búsqueda.",
  },
  en: {
    title: "Design Blog",
    subtitle:
      "Inspiration, tips, and stories about the art of creating unique spaces",
    searchPlaceholder: "Search articles...",
    allCategories: "All",
    readMore: "Read more",
    noResults: "No articles found matching your search.",
  },
};

function BlogContent() {
  const { language, isDarkMode } = useContentPage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const t = pageTranslations[language];
  const currentCategories = categories[language];
  const currentPosts = blogPosts[language];

  const filteredPosts = currentPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;
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
              const isActive = selectedCategory === category;
              const displayName =
                category === "all" ? t.allCategories : category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-lg px-4 py-2.5 transition-all ${
                    isActive
                      ? "bg-[#8b6f47] text-white"
                      : isDarkMode
                        ? "bg-[#2d2419] text-[#b8a99a] hover:bg-[#3d2f23]"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-sm font-medium">{displayName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 lg:px-12">
        {filteredPosts.length === 0 ? (
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className={`group overflow-hidden rounded-lg border transition-all hover:shadow-lg ${
                  isDarkMode
                    ? "border-[#3d2f23] bg-[#2d2419] hover:border-[#8b6f47]"
                    : "border-gray-200 bg-white hover:border-[#8b6f47]"
                }`}
              >
                <Link href="/blog" className="block">
                  <div className="aspect-[16/10] overflow-hidden">
                    <ImageWithFallback
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-4 p-6">
                    <div className="flex items-center gap-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-1.5 ${
                          isDarkMode ? "text-[#b8a99a]" : "text-gray-500"
                        }`}
                      >
                        <Calendar className="h-4 w-4" />
                        {post.date}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 ${
                          isDarkMode ? "text-[#b8a99a]" : "text-gray-500"
                        }`}
                      >
                        <Clock className="h-4 w-4" />
                        {post.readTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[#8b6f47]" />
                      <span className="text-sm font-medium text-[#8b6f47]">
                        {post.category}
                      </span>
                    </div>
                    <h2
                      className={`line-clamp-2 text-xl font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {post.title}
                    </h2>
                    <p
                      className={`line-clamp-3 text-sm ${
                        isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                      }`}
                    >
                      {post.excerpt}
                    </p>
                    <span
                      className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                        isDarkMode
                          ? "text-[#8b6f47] group-hover:text-[#b8a99a]"
                          : "text-[#8b6f47] group-hover:text-[#6d5638]"
                      }`}
                    >
                      {t.readMore}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function BlogPage() {
  return (
    <ContentPageShell>
      <BlogContent />
    </ContentPageShell>
  );
}
