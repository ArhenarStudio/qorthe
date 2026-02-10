"use client";

import { Users, Hammer, TreePine, Award } from "lucide-react";
import { ContentPageShell, useContentPage } from "./ContentPageShell";

const translations = {
  es: {
    title: "Quiénes Somos",
    subtitle: "La historia y esencia de DavidSon's Design",
    story: {
      title: "Nuestra Historia",
      description:
        "DavidSon's Design nace de la pasión por la madera y el diseño minimalista mexicano. Fundada en Hermosillo, Sonora, nuestra marca es el resultado de años de experiencia en carpintería artesanal y un profundo respeto por las tradiciones de nuestro país.",
    },
    team: {
      title: "Nuestro Equipo",
      description:
        "Contamos con un equipo de artesanos mexicanos altamente capacitados, diseñadores apasionados y profesionales comprometidos con la excelencia.",
    },
    process: {
      title: "Nuestro Proceso",
      description:
        "Desde la selección de maderas nobles hasta el acabado final, cada paso de nuestro proceso está cuidadosamente pensado.",
    },
    commitment: {
      title: "Nuestro Compromiso",
      description:
        "Nos comprometemos a crear muebles sostenibles, utilizando madera de fuentes responsables y procesos que minimizan nuestro impacto ambiental.",
    },
    stats: [
      { number: "15+", label: "Años de Experiencia" },
      { number: "500+", label: "Proyectos Completados" },
      { number: "30+", label: "Artesanos Especializados" },
      { number: "100%", label: "Satisfacción del Cliente" },
    ],
  },
  en: {
    title: "Who We Are",
    subtitle: "The story and essence of DavidSon's Design",
    story: {
      title: "Our Story",
      description:
        "DavidSon's Design is born from a passion for wood and Mexican minimalist design. Founded in Hermosillo, Sonora, our brand is the result of years of experience in artisanal carpentry and a deep respect for our country's traditions.",
    },
    team: {
      title: "Our Team",
      description:
        "We have a team of highly skilled Mexican artisans, passionate designers, and professionals committed to excellence.",
    },
    process: {
      title: "Our Process",
      description:
        "From the selection of noble woods to the final finish, every step of our process is carefully thought out.",
    },
    commitment: {
      title: "Our Commitment",
      description:
        "We are committed to creating sustainable furniture, using wood from responsible sources and processes that minimize our environmental impact.",
    },
    stats: [
      { number: "15+", label: "Years of Experience" },
      { number: "500+", label: "Completed Projects" },
      { number: "30+", label: "Specialized Artisans" },
      { number: "100%", label: "Client Satisfaction" },
    ],
  },
};

function AboutContent() {
  const { language, isDarkMode } = useContentPage();
  const t = translations[language];
  const sections = [
    { icon: Users, title: t.team.title, description: t.team.description },
    { icon: Hammer, title: t.process.title, description: t.process.description },
    { icon: TreePine, title: t.commitment.title, description: t.commitment.description },
  ];

  return (
    <>
      <section
        className={`border-b pt-32 pb-16 md:pb-20 ${
          isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h1
              className={`text-4xl tracking-tight md:text-5xl lg:text-6xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <span className="font-bold">{t.title}</span>
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

      <section className="py-20 md:py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <Award
              className={`mx-auto h-16 w-16 ${
                isDarkMode ? "text-[#8b6f47]" : "text-[#3d2f23]"
              }`}
            />
            <h2
              className={`text-3xl tracking-tight md:text-4xl lg:text-5xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t.story.title}
            </h2>
            <p
              className={`text-lg leading-relaxed ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              {t.story.description}
            </p>
          </div>
        </div>
      </section>

      <section
        className={`border-y py-16 md:py-20 ${
          isDarkMode ? "border-[#3d2f23] bg-[#1a1512]" : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-2 gap-8 md:gap-12 lg:grid-cols-4">
            {t.stats.map((stat, index) => (
              <div key={index} className="space-y-2 text-center">
                <div
                  className={`text-4xl font-bold md:text-5xl ${
                    isDarkMode ? "text-[#8b6f47]" : "text-[#3d2f23]"
                  }`}
                >
                  {stat.number}
                </div>
                <div
                  className={`text-sm md:text-base ${
                    isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                  }`}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
          <div className="space-y-20 md:space-y-24">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={index}
                  className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20"
                >
                  <div className={isEven ? "order-2 lg:order-1" : "order-2"}>
                    <div className="space-y-6">
                      <Icon
                        className={`h-12 w-12 ${
                          isDarkMode ? "text-[#8b6f47]" : "text-[#3d2f23]"
                        }`}
                      />
                      <h2
                        className={`text-3xl tracking-tight md:text-4xl lg:text-5xl ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {section.title}
                      </h2>
                      <p
                        className={`text-lg leading-relaxed ${
                          isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                        }`}
                      >
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`rounded-2xl p-12 md:p-16 ${
                      isEven ? "order-1 lg:order-2" : "order-1"
                    } ${isDarkMode ? "bg-[#2d2419]" : "bg-gray-50"}`}
                  >
                    <div className="aspect-square" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export function AboutUs() {
  return (
    <ContentPageShell>
      <AboutContent />
    </ContentPageShell>
  );
}
