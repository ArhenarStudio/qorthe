"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { ContentPageShell, useContentPage } from "./ContentPageShell";

const translations = {
  es: {
    title: "Agenda Tu Consulta",
    subtitle:
      "Nuestros diseñadores te ayudarán a crear el espacio perfecto para ti",
    formTitle: "Información de Contacto",
    name: "Nombre Completo",
    namePlaceholder: "Tu nombre",
    email: "Correo Electrónico",
    emailPlaceholder: "tu@email.com",
    phone: "Teléfono",
    phonePlaceholder: "+52 662 123 4567",
    dateLabel: "Fecha Preferida",
    timeLabel: "Hora Preferida",
    selectTime: "Selecciona una hora",
    serviceType: "Tipo de Servicio",
    selectService: "Selecciona un servicio",
    consultationType: "Tipo de Consulta",
    presencial: "Presencial en Showroom",
    virtual: "Videollamada",
    message: "Mensaje (Opcional)",
    messagePlaceholder: "Cuéntanos sobre tu proyecto...",
    submit: "Agendar Consulta",
    submitting: "Agendando...",
    successTitle: "¡Cita Agendada!",
    successMessage:
      "Hemos enviado la confirmación a tu correo. Nos pondremos en contacto contigo pronto.",
    backButton: "Agendar Otra Cita",
    backHome: "Volver al Inicio",
    services: {
      furniture: "Selección de Muebles",
      custom: "Diseño Personalizado",
      renovation: "Renovación de Espacios",
      consultation: "Consultoría de Diseño",
    },
    times: {
      morning: "10:00 - 12:00",
      midday: "12:00 - 14:00",
      afternoon: "14:00 - 16:00",
      evening: "16:00 - 18:00",
    },
    benefits: {
      title: "¿Qué Incluye Tu Consulta?",
      items: [
        "Asesoría personalizada con nuestros diseñadores",
        "Análisis de tus necesidades y presupuesto",
        "Propuestas de diseño y selección de materiales",
        "Cotización detallada sin compromiso",
        "Tour por nuestro showroom (presencial)",
      ],
    },
    required: "Este campo es requerido",
    invalidEmail: "Correo electrónico inválido",
  },
  en: {
    title: "Schedule Your Consultation",
    subtitle:
      "Our designers will help you create the perfect space for you",
    formTitle: "Contact Information",
    name: "Full Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "your@email.com",
    phone: "Phone",
    phonePlaceholder: "+52 662 123 4567",
    dateLabel: "Preferred Date",
    timeLabel: "Preferred Time",
    selectTime: "Select a time",
    serviceType: "Service Type",
    selectService: "Select a service",
    consultationType: "Consultation Type",
    presencial: "In-Person at Showroom",
    virtual: "Video Call",
    message: "Message (Optional)",
    messagePlaceholder: "Tell us about your project...",
    submit: "Schedule Consultation",
    submitting: "Scheduling...",
    successTitle: "Appointment Scheduled!",
    successMessage:
      "We have sent the confirmation to your email. We will contact you soon.",
    backButton: "Schedule Another Appointment",
    backHome: "Back to Home",
    services: {
      furniture: "Furniture Selection",
      custom: "Custom Design",
      renovation: "Space Renovation",
      consultation: "Design Consultation",
    },
    times: {
      morning: "10:00 AM - 12:00 PM",
      midday: "12:00 PM - 2:00 PM",
      afternoon: "2:00 PM - 4:00 PM",
      evening: "4:00 PM - 6:00 PM",
    },
    benefits: {
      title: "What Does Your Consultation Include?",
      items: [
        "Personalized advice from our designers",
        "Analysis of your needs and budget",
        "Design proposals and material selection",
        "Detailed quote with no obligation",
        "Tour of our showroom (in-person)",
      ],
    },
    required: "This field is required",
    invalidEmail: "Invalid email address",
  },
};

function AppointmentContent() {
  const { language, isDarkMode, nav } = useContentPage();
  const t = translations[language];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    serviceType: "",
    consultationType: "presencial" as "presencial" | "virtual",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t.required;
    if (!formData.email.trim()) {
      newErrors.email = t.required;
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = t.invalidEmail;
    }
    if (!formData.phone.trim()) newErrors.phone = t.required;
    if (!formData.date) newErrors.date = t.required;
    if (!formData.time) newErrors.time = t.required;
    if (!formData.serviceType) newErrors.serviceType = t.required;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setStatus("loading");
    try {
      await new Promise((r) => setTimeout(r, 2000));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      serviceType: "",
      consultationType: "presencial",
      message: "",
    });
    setStatus("idle");
    setErrors({});
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border px-4 py-3 transition-all focus:outline-none focus:ring-2 ${
      hasError
        ? "border-red-500 focus:ring-red-500"
        : isDarkMode
          ? "border-[#3d2f23] bg-[#2d2419] text-white placeholder-[#b8a99a]/50 focus:border-[#8b6f47] focus:ring-[#8b6f47]"
          : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-[#8b6f47] focus:ring-[#8b6f47]"
    }`;

  if (status === "success") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center md:px-8">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1
          className={`mt-6 text-3xl font-medium md:text-4xl ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {t.successTitle}
        </h1>
        <p
          className={`mt-4 text-lg ${
            isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
          }`}
        >
          {t.successMessage}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={handleReset}
            className="rounded-lg bg-[#8b6f47] px-6 py-3 font-medium text-white transition-colors hover:bg-[#6d5638]"
          >
            {t.backButton}
          </button>
          <button
            onClick={nav("/")}
            className={`rounded-lg px-6 py-3 font-medium transition-colors ${
              isDarkMode
                ? "bg-[#2d2419] text-[#b8a99a] hover:bg-[#3d2f23]"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t.backHome}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section
        className={`border-b py-16 md:py-24 ${
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

      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div
            className={`sticky top-24 rounded-lg border p-6 ${
              isDarkMode
                ? "border-[#3d2f23] bg-[#2d2419]"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <h3
              className={`mb-6 text-xl font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t.benefits.title}
            </h3>
            <ul className="space-y-4">
              {t.benefits.items.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#8b6f47]" />
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                    }`}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              <h2
                className={`mb-6 text-2xl font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.formTitle}
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <User className="mr-2 inline h-4 w-4" />
                    {t.name}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={t.namePlaceholder}
                    className={inputClass(!!errors.name)}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <Mail className="mr-2 inline h-4 w-4" />
                    {t.email}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder={t.emailPlaceholder}
                    className={inputClass(!!errors.email)}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <Phone className="mr-2 inline h-4 w-4" />
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder={t.phonePlaceholder}
                    className={inputClass(!!errors.phone)}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {t.serviceType}
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceType: e.target.value })
                    }
                    className={inputClass(!!errors.serviceType)}
                  >
                    <option value="">{t.selectService}</option>
                    <option value="furniture">{t.services.furniture}</option>
                    <option value="custom">{t.services.custom}</option>
                    <option value="renovation">{t.services.renovation}</option>
                    <option value="consultation">
                      {t.services.consultation}
                    </option>
                  </select>
                  {errors.serviceType && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.serviceType}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <Calendar className="mr-2 inline h-4 w-4" />
                    {t.dateLabel}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className={inputClass(!!errors.date)}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <Clock className="mr-2 inline h-4 w-4" />
                    {t.timeLabel}
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className={inputClass(!!errors.time)}
                  >
                    <option value="">{t.selectTime}</option>
                    <option value="morning">{t.times.morning}</option>
                    <option value="midday">{t.times.midday}</option>
                    <option value="afternoon">{t.times.afternoon}</option>
                    <option value="evening">{t.times.evening}</option>
                  </select>
                  {errors.time && (
                    <p className="mt-1 text-sm text-red-500">{errors.time}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label
                  className={`mb-3 block text-sm font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {t.consultationType}
                </label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        consultationType: "presencial",
                      })
                    }
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      formData.consultationType === "presencial"
                        ? "border-[#8b6f47] bg-[#8b6f47]/10"
                        : isDarkMode
                          ? "border-[#3d2f23] hover:border-[#8b6f47]"
                          : "border-gray-200 hover:border-[#8b6f47]"
                    }`}
                  >
                    <span
                      className={`font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {t.presencial}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        consultationType: "virtual",
                      })
                    }
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      formData.consultationType === "virtual"
                        ? "border-[#8b6f47] bg-[#8b6f47]/10"
                        : isDarkMode
                          ? "border-[#3d2f23] hover:border-[#8b6f47]"
                          : "border-gray-200 hover:border-[#8b6f47]"
                    }`}
                  >
                    <span
                      className={`font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {t.virtual}
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <label
                  className={`mb-2 block text-sm font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <MessageSquare className="mr-2 inline h-4 w-4" />
                  {t.message}
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder={t.messagePlaceholder}
                  rows={4}
                  className={`${inputClass(false)} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#8b6f47] px-8 py-4 font-medium text-white transition-colors hover:bg-[#6d5638] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "loading" && (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
                {status === "loading" ? t.submitting : t.submit}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export function AppointmentPage() {
  return (
    <ContentPageShell>
      <AppointmentContent />
    </ContentPageShell>
  );
}
