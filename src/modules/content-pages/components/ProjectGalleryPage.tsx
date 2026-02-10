"use client";

import { useState } from "react";
import { MapPin, Calendar, ImageIcon, X } from "lucide-react";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { ContentPageShell, useContentPage } from "./ContentPageShell";

interface Project {
  id: string;
  title: string;
  location: string;
  year: string;
  description: string;
  images: string[];
  category: string;
}

const categories = {
  es: ["all", "Residencial", "Comercial", "Restaurantes", "Hoteles"],
  en: ["all", "Residential", "Commercial", "Restaurants", "Hotels"],
};

const projects: Record<"es" | "en", Project[]> = {
  es: [
    {
      id: "1",
      title: "Casa Moderna en Valle Real",
      location: "Hermosillo, Sonora",
      year: "2025",
      description:
        "Proyecto residencial completo con muebles de nogal y parota. Sala, comedor y recámaras con diseño contemporáneo.",
      category: "Residencial",
      images: [
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
      ],
    },
    {
      id: "2",
      title: "Restaurante La Parota",
      location: "San Carlos, Sonora",
      year: "2025",
      description:
        "Mobiliario completo para restaurante de cocina fusión. Mesas, sillas y barra de bar en madera de parota.",
      category: "Restaurantes",
      images: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200",
      ],
    },
    {
      id: "3",
      title: "Oficinas Corporativas TechHub",
      location: "Ciudad de México",
      year: "2024",
      description:
        "Espacios de trabajo colaborativo con mesas de juntas y escritorios ejecutivos. Diseño minimalista.",
      category: "Comercial",
      images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
      ],
    },
  ],
  en: [
    {
      id: "1",
      title: "Modern Home in Valle Real",
      location: "Hermosillo, Sonora",
      year: "2025",
      description:
        "Complete residential project with walnut and parota furniture. Living room, dining room and bedrooms.",
      category: "Residential",
      images: [
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
      ],
    },
    {
      id: "2",
      title: "La Parota Restaurant",
      location: "San Carlos, Sonora",
      year: "2025",
      description:
        "Complete furniture for fusion cuisine restaurant. Tables, chairs and bar in parota wood.",
      category: "Restaurants",
      images: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200",
      ],
    },
    {
      id: "3",
      title: "TechHub Corporate Offices",
      location: "Mexico City",
      year: "2024",
      description:
        "Collaborative work spaces with conference tables and executive desks. Minimalist design.",
      category: "Commercial",
      images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
      ],
    },
  ],
};

const pageTranslations = {
  es: {
    title: "Galería de Proyectos",
    subtitle:
      "Espacios únicos transformados con nuestros muebles artesanales",
    allCategories: "Todos",
    viewProject: "Ver Proyecto",
    closeGallery: "Cerrar Galería",
    imagesCount: "imágenes",
  },
  en: {
    title: "Project Gallery",
    subtitle: "Unique spaces transformed with our handcrafted furniture",
    allCategories: "All",
    viewProject: "View Project",
    closeGallery: "Close Gallery",
    imagesCount: "images",
  },
};

function ProjectGalleryContent() {
  const { language, isDarkMode } = useContentPage();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const t = pageTranslations[language];
  const currentCategories = categories[language];
  const currentProjects = projects[language];

  const filteredProjects = currentProjects.filter(
    (p) => selectedCategory === "all" || p.category === selectedCategory
  );

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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`group cursor-pointer overflow-hidden rounded-lg border transition-all hover:shadow-lg ${
                isDarkMode
                  ? "border-[#3d2f23] bg-[#2d2419] hover:border-[#8b6f47]"
                  : "border-gray-200 bg-white hover:border-[#8b6f47]"
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <ImageWithFallback
                  src={project.images[0]}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
                  <ImageIcon className="h-3.5 w-3.5" />
                  {project.images.length} {t.imagesCount}
                </div>
              </div>
              <div className="space-y-3 p-6">
                <span className="inline-block rounded-full bg-[#8b6f47] px-3 py-1 text-xs text-white">
                  {project.category}
                </span>
                <h3
                  className={`text-xl font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {project.title}
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <span
                    className={`inline-flex items-center gap-1.5 ${
                      isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                    {project.location}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 ${
                      isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    {project.year}
                  </span>
                </div>
                <p
                  className={`line-clamp-2 text-sm ${
                    isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                  }`}
                >
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90">
          <div className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-4xl">
              <div className="mb-6 flex items-center justify-between">
                <h2
                  className={`text-2xl font-medium ${
                    isDarkMode ? "text-white" : "text-white"
                  }`}
                >
                  {selectedProject.title}
                </h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="rounded-lg p-2 text-white transition-colors hover:bg-white/10"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                {selectedProject.images.map((img, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-lg"
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`${selectedProject.title} ${i + 1}`}
                      className="w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p
                className={`mt-6 text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-300"
                }`}
              >
                {selectedProject.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ProjectGalleryPage() {
  return (
    <ContentPageShell>
      <ProjectGalleryContent />
    </ContentPageShell>
  );
}
