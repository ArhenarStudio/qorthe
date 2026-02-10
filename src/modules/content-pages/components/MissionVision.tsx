"use client";

import { motion } from "motion/react";
import { Target, Eye, Heart } from "lucide-react";
import { ContentPageShell, useContentPage } from "./ContentPageShell";

const translations = {
  es: {
    title: "Misión y Visión",
    subtitle: "El propósito y dirección de DavidSon's Design",
    mission: {
      title: "Nuestra Misión",
      description:
        "Crear muebles artesanales de diseño mexicano que combinen la tradición de la carpintería con el diseño contemporáneo. Nos comprometemos a ofrecer piezas únicas, elaboradas con materiales de la más alta calidad, que transformen espacios y perduren en el tiempo, valorando el trabajo artesanal y la sostenibilidad.",
    },
    vision: {
      title: "Nuestra Visión",
      description:
        "Ser reconocidos como la marca líder en muebles artesanales premium en México, expandiendo nuestra presencia a nivel internacional. Aspiramos a ser un referente en diseño consciente, donde cada pieza cuente una historia y cada cliente encuentre en nuestros muebles la perfecta combinación entre funcionalidad, belleza y calidad excepcional.",
    },
    values: {
      title: "Nuestros Valores",
      items: [
        { title: "Artesanía", description: "Valoramos el trabajo manual y la dedicación en cada detalle." },
        { title: "Calidad", description: "Utilizamos solo los mejores materiales y técnicas de fabricación." },
        { title: "Diseño", description: "Creamos piezas atemporales con estética minimalista y elegante." },
        { title: "Sostenibilidad", description: "Trabajamos de forma responsable con el medio ambiente." },
        { title: "Autenticidad", description: "Cada pieza es única y refleja nuestra identidad mexicana." },
        { title: "Excelencia", description: "Nos esforzamos por superar las expectativas en cada proyecto." },
      ],
    },
  },
  en: {
    title: "Mission & Vision",
    subtitle: "The purpose and direction of DavidSon's Design",
    mission: {
      title: "Our Mission",
      description:
        "To create handcrafted furniture of Mexican design that combines traditional carpentry with contemporary design. We are committed to offering unique pieces, made with the highest quality materials, that transform spaces and endure over time, valuing artisanal work and sustainability.",
    },
    vision: {
      title: "Our Vision",
      description:
        "To be recognized as the leading brand in premium handcrafted furniture in Mexico, expanding our presence internationally. We aspire to be a benchmark in conscious design, where each piece tells a story and each client finds in our furniture the perfect combination of functionality, beauty, and exceptional quality.",
    },
    values: {
      title: "Our Values",
      items: [
        { title: "Craftsmanship", description: "We value manual work and dedication in every detail." },
        { title: "Quality", description: "We use only the best materials and manufacturing techniques." },
        { title: "Design", description: "We create timeless pieces with minimalist and elegant aesthetics." },
        { title: "Sustainability", description: "We work responsibly with the environment." },
        { title: "Authenticity", description: "Each piece is unique and reflects our Mexican identity." },
        { title: "Excellence", description: "We strive to exceed expectations in every project." },
      ],
    },
  },
};

function MissionVisionContent() {
  const { language, isDarkMode } = useContentPage();
  const t = translations[language];

  return (
    <>
      <section
        className={`border-b pt-32 pb-16 md:pb-20 ${
          isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl space-y-6 text-center"
          >
            <h1
              className={`text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl ${
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
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20"
          >
            <div
              className={`rounded-2xl p-12 md:p-16 ${
                isDarkMode ? "bg-[#2d2419]" : "bg-gray-50"
              }`}
            >
              <Target
                className={`mb-6 h-16 w-16 ${
                  isDarkMode ? "text-[#8b6f47]" : "text-[#3d2f23]"
                }`}
              />
            </div>
            <div className="space-y-6">
              <h2
                className={`text-3xl tracking-tight md:text-4xl lg:text-5xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.mission.title}
              </h2>
              <p
                className={`text-lg leading-relaxed ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.mission.description}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        className={`border-t py-20 md:py-24 lg:py-32 ${
          isDarkMode ? "border-[#3d2f23] bg-[#0a0806]" : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20"
          >
            <div className="order-2 space-y-6 lg:order-1">
              <h2
                className={`text-3xl tracking-tight md:text-4xl lg:text-5xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.vision.title}
              </h2>
              <p
                className={`text-lg leading-relaxed ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.vision.description}
              </p>
            </div>
            <div
              className={`order-1 rounded-2xl p-12 md:p-16 lg:order-2 ${
                isDarkMode ? "bg-[#2d2419]" : "bg-white"
              }`}
            >
              <Eye
                className={`mb-6 h-16 w-16 ${
                  isDarkMode ? "text-[#8b6f47]" : "text-[#3d2f23]"
                }`}
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 space-y-6 text-center"
          >
            <Heart
              className={`mx-auto h-12 w-12 ${
                isDarkMode ? "text-[#8b6f47]" : "text-[#3d2f23]"
              }`}
            />
            <h2
              className={`text-3xl tracking-tight md:text-4xl lg:text-5xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t.values.title}
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {t.values.items.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`rounded-xl border p-8 transition-colors duration-300 ${
                  isDarkMode
                    ? "border-[#3d2f23] bg-[#1a1512] hover:border-[#8b6f47]"
                    : "border-gray-200 bg-white hover:border-[#8b6f47]"
                }`}
              >
                <h3
                  className={`mb-3 text-xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {value.title}
                </h3>
                <p className={isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function MissionVision() {
  return (
    <ContentPageShell>
      <MissionVisionContent />
    </ContentPageShell>
  );
}
