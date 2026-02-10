"use client";

import {
  Award,
  Shield,
  Leaf,
  Star,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ContentPageShell, useContentPage } from "./ContentPageShell";

interface CertItem {
  name: string;
  description: string;
  year: string;
  icon: LucideIcon;
}

const translations = {
  es: {
    title: "Certificaciones y Premios",
    subtitle: "Reconocimientos que respaldan nuestra excelencia",
    description:
      "Nuestro compromiso con la calidad, sostenibilidad y diseño nos ha merecido diversos reconocimientos nacionales e internacionales.",
    certifications: "Certificaciones",
    awards: "Premios y Reconocimientos",
    items: {
      certifications: [
        {
          name: "FSC® (Forest Stewardship Council)",
          description:
            "Certificación de manejo forestal responsable. Todas nuestras maderas provienen de bosques certificados.",
          year: "2020",
          icon: Leaf,
        },
        {
          name: "ISO 9001:2015",
          description:
            "Sistema de gestión de calidad que garantiza procesos consistentes y productos de alta calidad.",
          year: "2018",
          icon: Shield,
        },
        {
          name: "Distintivo ESR",
          description:
            "Empresa Socialmente Responsable por nuestro compromiso con el medio ambiente y la comunidad.",
          year: "2019",
          icon: CheckCircle,
        },
        {
          name: "NOM-003-SCFI",
          description:
            "Norma oficial mexicana de productos de madera para uso en interiores.",
          year: "2017",
          icon: Shield,
        },
      ] as CertItem[],
      awards: [
        {
          name: "Premio Nacional de Diseño Artesanal",
          description: "Primer lugar en la categoría de mobiliario contemporáneo.",
          year: "2008",
          icon: Award,
        },
        {
          name: "Design Week México - Best of Show",
          description:
            "Reconocimiento a la mejor colección de diseño mexicano contemporáneo.",
          year: "2015",
          icon: Star,
        },
        {
          name: "Mención Honorífica - Bienal de Diseño",
          description: "Por innovación en técnicas tradicionales de carpintería.",
          year: "2019",
          icon: Award,
        },
        {
          name: "Top 10 Talleres Artesanales de México",
          description: "Reconocimiento por Architectural Digest México.",
          year: "2021",
          icon: Star,
        },
      ] as CertItem[],
    },
  },
  en: {
    title: "Certifications and Awards",
    subtitle: "Recognition that supports our excellence",
    description:
      "Our commitment to quality, sustainability and design has earned us various national and international recognition.",
    certifications: "Certifications",
    awards: "Awards and Recognition",
    items: {
      certifications: [
        {
          name: "FSC® (Forest Stewardship Council)",
          description:
            "Certification for responsible forest management. All our woods come from certified forests.",
          year: "2020",
          icon: Leaf,
        },
        {
          name: "ISO 9001:2015",
          description:
            "Quality management system that guarantees consistent processes and high quality products.",
          year: "2018",
          icon: Shield,
        },
        {
          name: "ESR Distinctive",
          description:
            "Socially Responsible Company for our commitment to the environment and community.",
          year: "2019",
          icon: CheckCircle,
        },
        {
          name: "NOM-003-SCFI",
          description:
            "Mexican official standard for wood products for indoor use.",
          year: "2017",
          icon: Shield,
        },
      ] as CertItem[],
      awards: [
        {
          name: "National Artisan Design Award",
          description: "First place in the contemporary furniture category.",
          year: "2008",
          icon: Award,
        },
        {
          name: "Design Week México - Best of Show",
          description:
            "Recognition for the best contemporary Mexican design collection.",
          year: "2015",
          icon: Star,
        },
        {
          name: "Honorable Mention - Design Biennial",
          description: "For innovation in traditional carpentry techniques.",
          year: "2019",
          icon: Award,
        },
        {
          name: "Top 10 Artisan Workshops in Mexico",
          description: "Recognition by Architectural Digest México.",
          year: "2021",
          icon: Star,
        },
      ] as CertItem[],
    },
  },
};

function CertificationsContent() {
  const { language, isDarkMode, nav } = useContentPage();
  const content = translations[language];

  return (
    <>
      <Breadcrumbs
        items={[{ label: content.title }]}
        isDarkMode={isDarkMode}
        language={language}
        onNavigateHome={nav("/")}
      />
      <div className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h1
            className={`mb-6 text-4xl tracking-tight md:text-5xl lg:text-6xl ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {content.title}
          </h1>
          <p
            className={`mb-4 text-xl md:text-2xl ${
              isDarkMode ? "text-[#8b6f47]" : "text-[#8b6f47]"
            }`}
          >
            {content.subtitle}
          </p>
          <p
            className={`text-lg leading-relaxed ${
              isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
            }`}
          >
            {content.description}
          </p>
        </div>

        <div className="mb-20">
          <h2
            className={`mb-8 text-center text-3xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {content.certifications}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {content.items.certifications.map((cert, index) => {
              const Icon = cert.icon;
              return (
                <div
                  key={index}
                  className={`group rounded-xl border p-6 transition-all duration-300 hover:shadow-xl ${
                    isDarkMode
                      ? "border-[#3d2f23] bg-[#1a1512] hover:border-[#8b6f47]"
                      : "border-gray-200 bg-white hover:border-[#8b6f47]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-xl p-4 ${
                        isDarkMode ? "bg-[#2d2419]" : "bg-gray-100"
                      }`}
                    >
                      <Icon className="h-8 w-8 text-[#8b6f47]" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-3 flex items-start justify-between">
                        <h3
                          className={`text-lg font-bold ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {cert.name}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            isDarkMode
                              ? "bg-[#2d2419] text-[#8b6f47]"
                              : "bg-gray-100 text-[#8b6f47]"
                          }`}
                        >
                          {cert.year}
                        </span>
                      </div>
                      <p
                        className={`text-sm leading-relaxed ${
                          isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                        }`}
                      >
                        {cert.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2
            className={`mb-8 text-center text-3xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {content.awards}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {content.items.awards.map((award, index) => {
              const Icon = award.icon;
              return (
                <div
                  key={index}
                  className={`group rounded-xl border p-6 text-center transition-all duration-300 hover:shadow-xl ${
                    isDarkMode
                      ? "border-[#3d2f23] bg-[#1a1512] hover:border-[#8b6f47]"
                      : "border-gray-200 bg-white hover:border-[#8b6f47]"
                  }`}
                >
                  <div
                    className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                      isDarkMode ? "bg-[#2d2419]" : "bg-gray-100"
                    }`}
                  >
                    <Icon className="h-8 w-8 text-[#8b6f47]" />
                  </div>
                  <span
                    className={`mb-3 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                      isDarkMode
                        ? "bg-[#2d2419] text-[#8b6f47]"
                        : "bg-gray-100 text-[#8b6f47]"
                    }`}
                  >
                    {award.year}
                  </span>
                  <h3
                    className={`mb-3 text-lg font-bold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {award.name}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                    }`}
                  >
                    {award.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export function Certifications() {
  return (
    <ContentPageShell>
      <CertificationsContent />
    </ContentPageShell>
  );
}
