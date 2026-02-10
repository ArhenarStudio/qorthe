"use client";

import { Mail, Linkedin } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ContentPageShell, useContentPage } from "./ContentPageShell";

const translations = {
  es: {
    title: "Nuestro Equipo",
    subtitle: "Los artesanos detrás de cada pieza",
    description:
      "Un equipo de expertos carpinteros y diseñadores dedicados a crear muebles excepcionales que combinan tradición y modernidad.",
    members: [
      {
        name: "David González",
        role: "Fundador y Maestro Carpintero",
        bio: "Con más de 25 años de experiencia en carpintería artesanal, David lidera el taller con pasión y dedicación a la excelencia.",
        email: "david@davidsonsdesign.com",
        linkedin: "#",
      },
      {
        name: "María Rodríguez",
        role: "Directora de Diseño",
        bio: "Especialista en diseño de interiores con un enfoque minimalista, María transforma ideas en piezas funcionales y elegantes.",
        email: "maria@davidsonsdesign.com",
        linkedin: "#",
      },
      {
        name: "Carlos Mendoza",
        role: "Maestro Ebanista",
        bio: "Experto en técnicas tradicionales de ebanistería, Carlos aporta precisión y artesanía de alta calidad a cada proyecto.",
        email: "carlos@davidsonsdesign.com",
        linkedin: "#",
      },
      {
        name: "Ana Torres",
        role: "Especialista en Acabados",
        bio: "Con un ojo meticuloso para el detalle, Ana perfecciona cada pieza con acabados impecables y duraderos.",
        email: "ana@davidsonsdesign.com",
        linkedin: "#",
      },
    ],
  },
  en: {
    title: "Our Team",
    subtitle: "The artisans behind each piece",
    description:
      "A team of expert carpenters and designers dedicated to creating exceptional furniture that combines tradition and modernity.",
    members: [
      {
        name: "David González",
        role: "Founder and Master Carpenter",
        bio: "With over 25 years of experience in artisanal carpentry, David leads the workshop with passion and dedication to excellence.",
        email: "david@davidsonsdesign.com",
        linkedin: "#",
      },
      {
        name: "María Rodríguez",
        role: "Design Director",
        bio: "Interior design specialist with a minimalist approach, María transforms ideas into functional and elegant pieces.",
        email: "maria@davidsonsdesign.com",
        linkedin: "#",
      },
      {
        name: "Carlos Mendoza",
        role: "Master Cabinetmaker",
        bio: "Expert in traditional cabinetry techniques, Carlos brings precision and high-quality craftsmanship to every project.",
        email: "carlos@davidsonsdesign.com",
        linkedin: "#",
      },
      {
        name: "Ana Torres",
        role: "Finishing Specialist",
        bio: "With a meticulous eye for detail, Ana perfects each piece with impeccable and lasting finishes.",
        email: "ana@davidsonsdesign.com",
        linkedin: "#",
      },
    ],
  },
};

function TeamContent() {
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {content.members.map((member, index) => (
            <div
              key={index}
              className={`group rounded-xl border p-8 transition-all duration-300 hover:shadow-xl ${
                isDarkMode
                  ? "border-[#3d2f23] bg-[#1a1512] hover:border-[#8b6f47]"
                  : "border-gray-200 bg-white hover:border-[#8b6f47]"
              }`}
            >
              <div
                className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold ${
                  isDarkMode ? "bg-[#2d2419] text-[#8b6f47]" : "bg-gray-100 text-[#8b6f47]"
                }`}
              >
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="space-y-3 text-center">
                <h3
                  className={`text-xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {member.name}
                </h3>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-[#8b6f47]" : "text-[#8b6f47]"
                  }`}
                >
                  {member.role}
                </p>
                <p
                  className={`text-sm leading-relaxed ${
                    isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                  }`}
                >
                  {member.bio}
                </p>
                <div className="flex justify-center gap-3 pt-4">
                  <a
                    href={`mailto:${member.email}`}
                    className={`rounded-lg p-2 transition-all ${
                      isDarkMode
                        ? "bg-[#2d2419] text-[#b8a99a] hover:bg-[#8b6f47] hover:text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-[#8b6f47] hover:text-white"
                    }`}
                    aria-label="Email"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-lg p-2 transition-all ${
                      isDarkMode
                        ? "bg-[#2d2419] text-[#b8a99a] hover:bg-[#8b6f47] hover:text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-[#8b6f47] hover:text-white"
                    }`}
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function Team() {
  return (
    <ContentPageShell>
      <TeamContent />
    </ContentPageShell>
  );
}
