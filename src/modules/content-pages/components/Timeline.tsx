"use client";

import {
  Calendar,
  Award,
  Users,
  Hammer,
  TrendingUp,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ContentPageShell, useContentPage } from "./ContentPageShell";

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const translations = {
  es: {
    title: "Nuestra Historia",
    subtitle: "Un viaje de pasión y dedicación",
    description:
      "Desde nuestros humildes comienzos hasta convertirnos en referente del diseño artesanal mexicano.",
    events: [
      {
        year: "1998",
        title: "Los Inicios",
        description:
          "David González abre su primer taller de carpintería en Guadalajara, con el sueño de crear muebles que honren la tradición mexicana.",
        icon: Hammer,
      },
      {
        year: "2003",
        title: "Primera Expansión",
        description:
          "El equipo crece a 5 artesanos y comenzamos a trabajar con diseñadores de interiores reconocidos.",
        icon: Users,
      },
      {
        year: "2008",
        title: "Reconocimiento Nacional",
        description:
          'Ganamos el Premio Nacional de Diseño Artesanal por nuestra colección "Esencia Mexicana".',
        icon: Award,
      },
      {
        year: "2012",
        title: "Tecnología y Tradición",
        description:
          "Implementamos tecnología CNC sin perder el toque artesanal, optimizando precisión y tiempos.",
        icon: TrendingUp,
      },
      {
        year: "2016",
        title: "Presencia Internacional",
        description:
          "Nuestros muebles llegan a Estados Unidos y Canadá, llevando el diseño mexicano al mundo.",
        icon: Globe,
      },
      {
        year: "2020",
        title: "DavidSon's Design",
        description:
          "Redefinimos nuestra marca y lanzamos nuestra plataforma digital para conectar con más clientes.",
        icon: Calendar,
      },
      {
        year: "2026",
        title: "El Futuro",
        description:
          "Continuamos innovando mientras honramos nuestras raíces, creando piezas que perduran generaciones.",
        icon: TrendingUp,
      },
    ] as TimelineEvent[],
  },
  en: {
    title: "Our History",
    subtitle: "A journey of passion and dedication",
    description:
      "From our humble beginnings to becoming a reference in Mexican artisanal design.",
    events: [
      {
        year: "1998",
        title: "The Beginning",
        description:
          "David González opens his first carpentry workshop in Guadalajara, with the dream of creating furniture that honors Mexican tradition.",
        icon: Hammer,
      },
      {
        year: "2003",
        title: "First Expansion",
        description:
          "The team grows to 5 artisans and we begin working with renowned interior designers.",
        icon: Users,
      },
      {
        year: "2008",
        title: "National Recognition",
        description:
          'We win the National Artisan Design Award for our "Mexican Essence" collection.',
        icon: Award,
      },
      {
        year: "2012",
        title: "Technology and Tradition",
        description:
          "We implement CNC technology without losing the artisanal touch, optimizing precision and time.",
        icon: TrendingUp,
      },
      {
        year: "2016",
        title: "International Presence",
        description:
          "Our furniture reaches the United States and Canada, bringing Mexican design to the world.",
        icon: Globe,
      },
      {
        year: "2020",
        title: "DavidSon's Design",
        description:
          "We rebrand and launch our digital platform to connect with more clients.",
        icon: Calendar,
      },
      {
        year: "2026",
        title: "The Future",
        description:
          "We continue innovating while honoring our roots, creating pieces that last generations.",
        icon: TrendingUp,
      },
    ] as TimelineEvent[],
  },
};

function TimelineContent() {
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
        <div className="mx-auto mb-20 max-w-3xl text-center">
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
        <div className="relative">
          <div
            className={`absolute left-8 top-0 bottom-0 w-0.5 md:left-1/2 ${
              isDarkMode ? "bg-[#3d2f23]" : "bg-gray-200"
            }`}
          />
          <div className="space-y-12">
            {content.events.map((event, index) => {
              const Icon = event.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={`relative flex items-center ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div
                    className={`absolute left-8 h-4 w-4 -translate-x-1/2 transform rounded-full border-4 md:left-1/2 ${
                      isDarkMode
                        ? "border-[#0a0806] bg-[#8b6f47]"
                        : "border-white bg-[#8b6f47]"
                    }`}
                  />
                  <div
                    className={`ml-20 md:ml-0 ${
                      isEven ? "md:w-1/2 md:pr-12 md:text-right" : "md:w-1/2 md:pl-12"
                    }`}
                  >
                    <div
                      className={`group rounded-xl border p-6 transition-all duration-300 hover:shadow-xl ${
                        isDarkMode
                          ? "border-[#3d2f23] bg-[#1a1512] hover:border-[#8b6f47]"
                          : "border-gray-200 bg-white hover:border-[#8b6f47]"
                      }`}
                    >
                      <div
                        className={`mb-4 flex items-center gap-4 ${
                          isEven ? "md:justify-end" : ""
                        }`}
                      >
                        <div
                          className={`rounded-lg p-3 ${
                            isDarkMode ? "bg-[#2d2419]" : "bg-gray-100"
                          }`}
                        >
                          <Icon className="h-6 w-6 text-[#8b6f47]" />
                        </div>
                        <span
                          className={`text-3xl font-bold ${
                            isDarkMode ? "text-[#8b6f47]" : "text-[#8b6f47]"
                          }`}
                        >
                          {event.year}
                        </span>
                      </div>
                      <h3
                        className={`mb-3 text-xl font-bold ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {event.title}
                      </h3>
                      <p
                        className={`leading-relaxed ${
                          isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                        }`}
                      >
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export function Timeline() {
  return (
    <ContentPageShell>
      <TimelineContent />
    </ContentPageShell>
  );
}
