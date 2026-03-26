"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Store, Package, CreditCard, Truck, Shield, Palette, Users, Bell, Rocket,
  Check, ChevronRight, ChevronLeft, X, ArrowRight, ExternalLink, Sparkles,
} from "lucide-react";
import { useAdminTheme } from "@/contexts/AdminThemeContext";
import { toast } from "sonner";

interface WizardStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  fields: WizardField[];
  helpText?: string;
  linkTo?: string; // Admin module to link to for full config
}

interface WizardField {
  key: string;
  label: string;
  type: "text" | "email" | "url" | "textarea" | "select" | "toggle" | "info";
  placeholder?: string;
  value?: string;
  options?: { label: string; value: string }[];
  description?: string;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: "store",
    title: "Tu Tienda",
    subtitle: "Información básica de tu negocio",
    icon: <Store size={20} />,
    linkTo: "settings",
    fields: [
      { key: "store_name", label: "Nombre de la tienda", type: "text", placeholder: "Qorthe" },
      { key: "store_email", label: "Email de contacto", type: "email", placeholder: "contacto@tutienda.com" },
      { key: "store_url", label: "URL del sitio", type: "url", placeholder: "https://tutienda.com" },
      { key: "store_description", label: "Descripción corta", type: "textarea", placeholder: "Describe tu tienda en 1-2 frases..." },
    ],
    helpText: "Esta información se mostrará en emails, facturas y metadatos del sitio.",
  },
  {
    id: "products",
    title: "Productos",
    subtitle: "Configura tu catálogo",
    icon: <Package size={20} />,
    linkTo: "products",
    fields: [
      { key: "products_info", label: "", type: "info", description: "Para agregar productos necesitas configurar tu catálogo en Medusa. Puedes hacerlo desde el módulo de Productos." },
      { key: "currency", label: "Moneda principal", type: "select", options: [{ label: "MXN (Peso Mexicano)", value: "mxn" }, { label: "USD (Dólar)", value: "usd" }] },
      { key: "inventory_tracking", label: "Rastreo de inventario", type: "toggle", description: "Controlar stock automáticamente al vender" },
    ],
    helpText: "Puedes agregar productos individuales o importarlos masivamente desde el módulo de Productos.",
  },
  {
    id: "payments",
    title: "Pagos",
    subtitle: "Métodos de cobro",
    icon: <CreditCard size={20} />,
    linkTo: "integrations",
    fields: [
      { key: "stripe_enabled", label: "Stripe (Tarjeta de crédito/débito)", type: "toggle", description: "Visa, Mastercard, AMEX" },
      { key: "mercadopago_enabled", label: "MercadoPago", type: "toggle", description: "OXXO, transferencia, tarjetas mexicanas" },
      { key: "paypal_enabled", label: "PayPal", type: "toggle", description: "Pagos internacionales" },
    ],
    helpText: "Configura las API keys de cada procesador en Integraciones. El checkout se activa automáticamente.",
  },
  {
    id: "shipping",
    title: "Envíos",
    subtitle: "Logística y entregas",
    icon: <Truck size={20} />,
    linkTo: "shipping?tab=config",
    fields: [
      { key: "shipping_provider", label: "Proveedor de envíos", type: "select", options: [{ label: "Envia.com (DHL, Estafeta, FedEx)", value: "envia" }, { label: "Manual (tarifas fijas)", value: "manual" }] },
      { key: "local_delivery", label: "Entrega local", type: "toggle", description: "Ofrecer entrega en tu ciudad" },
      { key: "free_shipping_threshold", label: "Envío gratis a partir de (MXN)", type: "text", placeholder: "2500" },
    ],
    helpText: "Configura zonas, tarifas y condiciones avanzadas en el módulo de Envíos → Configuración.",
  },
  {
    id: "legal",
    title: "Legal",
    subtitle: "Páginas legales de tu tienda",
    icon: <Shield size={20} />,
    linkTo: "cms",
    fields: [
      { key: "legal_info", label: "", type: "info", description: "Tu tienda incluye 10 páginas legales pre-configuradas (Términos, Privacidad, Cookies, Envíos, Devoluciones, Garantía, etc.) que puedes personalizar desde el CMS." },
      { key: "company_name", label: "Razón social", type: "text", placeholder: "Qorthe Co." },
      { key: "company_address", label: "Domicilio fiscal", type: "text", placeholder: "Hermosillo, Sonora, México" },
      { key: "company_rfc", label: "RFC (opcional)", type: "text", placeholder: "XAXX010101000" },
    ],
    helpText: "Edita el contenido de cada página legal desde CMS → Páginas.",
  },
  {
    id: "branding",
    title: "Marca",
    subtitle: "Identidad visual",
    icon: <Palette size={20} />,
    linkTo: "theme",
    fields: [
      { key: "branding_info", label: "", type: "info", description: "Personaliza los colores, tipografía y logo de tu tienda desde el Editor de Tema. También puedes cambiar el diseño del panel admin desde Apariencia." },
      { key: "brand_primary_color", label: "Color primario", type: "text", placeholder: "var(--accent)" },
      { key: "brand_font", label: "Fuente de headings", type: "select", options: [{ label: "Playfair Display (serif)", value: "playfair" }, { label: "Sora (sans-serif)", value: "sora" }, { label: "Inter (sans-serif)", value: "inter" }] },
    ],
    helpText: "Los colores y fuentes se aplican en todo el sitio público.",
  },
  {
    id: "team",
    title: "Equipo",
    subtitle: "Invita a tu equipo",
    icon: <Users size={20} />,
    linkTo: "users",
    fields: [
      { key: "team_info", label: "", type: "info", description: "Invita a miembros de tu equipo y asígnales roles (Admin, Editor, Ventas, Soporte). Cada rol tiene permisos específicos." },
      { key: "invite_email", label: "Email del primer miembro", type: "email", placeholder: "equipo@tutienda.com" },
      { key: "invite_role", label: "Rol", type: "select", options: [{ label: "Administrador", value: "admin" }, { label: "Editor", value: "editor" }, { label: "Ventas", value: "sales" }, { label: "Soporte", value: "support" }] },
    ],
    helpText: "Puedes invitar más miembros después desde Equipo.",
  },
  {
    id: "notifications",
    title: "Notificaciones",
    subtitle: "Emails y alertas",
    icon: <Bell size={20} />,
    linkTo: "notifications",
    fields: [
      { key: "notif_info", label: "", type: "info", description: "Tu tienda tiene 11 emails transaccionales pre-configurados (confirmación de pedido, envío, bienvenida, etc.). Puedes activar/desactivar cada uno." },
      { key: "order_confirmation", label: "Email de confirmación de pedido", type: "toggle" },
      { key: "shipping_notification", label: "Email de envío con tracking", type: "toggle" },
      { key: "review_request", label: "Solicitar reseña post-entrega", type: "toggle" },
    ],
    helpText: "Configura templates y triggers desde Notificaciones.",
  },
  {
    id: "launch",
    title: "Lanzamiento",
    subtitle: "¡Tu tienda está lista!",
    icon: <Rocket size={20} />,
    linkTo: "dashboard",
    fields: [
      { key: "launch_info", label: "", type: "info", description: "Has completado la configuración básica. Tu tienda está lista para recibir clientes. Revisa el checklist final antes de activar." },
    ],
    helpText: "Puedes volver a este asistente desde Configuración → Reabrir asistente.",
  },
];

export const SetupWizard: React.FC<{ onComplete: () => void; onDismiss: () => void }> = ({ onComplete, onDismiss }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({
    stripe_enabled: true, mercadopago_enabled: true, paypal_enabled: false,
    inventory_tracking: true, local_delivery: true,
    order_confirmation: true, shipping_notification: true, review_request: true,
    currency: "mxn", shipping_provider: "envia", brand_font: "playfair",
  });

  const step = WIZARD_STEPS[currentStep];
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      toast.success("¡Configuración completada! Tu tienda está lista.");
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: `1px solid var(--border)`, boxShadow: "var(--shadow-lg)" }}>
      {/* Header with progress */}
      <div className="p-6 pb-4" style={{ borderBottom: `1px solid var(--border)` }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-card)] flex items-center justify-center" style={{ background: `var(--accent)20` }}>
              <Sparkles size={18} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h2 className="text-base font-medium" style={{ color: "var(--text)", fontFamily: "var(--font-heading)" }}>Configura tu tienda</h2>
              <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>Paso {currentStep + 1} de {WIZARD_STEPS.length}</p>
            </div>
          </div>
          <button onClick={onDismiss} className="p-2 rounded-[var(--radius-card)] hover:opacity-80 transition-opacity" style={{ color: "var(--text-muted)" }}>
            <X size={16} />
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1 rounded-[var(--radius-badge)] overflow-hidden" style={{ background: "var(--border)" }}>
          <motion.div className="h-full rounded-[var(--radius-badge)]" style={{ background: "var(--accent)" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
        {/* Step indicators */}
        <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
          {WIZARD_STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(i)}
              className="flex items-center gap-1 px-2 py-1 rounded-[var(--radius-card)] text-[10px] font-medium shrink-0 transition-colors"
              style={{
                background: i === currentStep ? `var(--accent)15` : "transparent",
                color: i === currentStep ? "var(--accent)" : i < currentStep ? "var(--text-secondary)" : "var(--text-muted)",
              }}
            >
              {i < currentStep ? <Check size={10} /> : null}
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-[var(--radius-card)] flex items-center justify-center" style={{ background: `var(--accent)15`, color: "var(--accent)" }}>
              {step.icon}
            </div>
            <div>
              <h3 className="text-sm font-medium" style={{ color: "var(--text)", fontFamily: "var(--font-heading)" }}>{step.title}</h3>
              <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{step.subtitle}</p>
            </div>
          </div>

          <div className="space-y-4">
            {step.fields.map((field) => {
              if (field.type === "info") {
                return (
                  <div key={field.key} className="p-3 rounded-[var(--radius-card)] text-[12px] leading-relaxed" style={{ background: "var(--surface2)", color: "var(--text-secondary)" }}>
                    {field.description}
                  </div>
                );
              }
              if (field.type === "toggle") {
                return (
                  <div key={field.key} className="flex items-center justify-between p-3 rounded-[var(--radius-card)]" style={{ background: "var(--surface2)" }}>
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--text)" }}>{field.label}</p>
                      {field.description && <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{field.description}</p>}
                    </div>
                    <button
                      onClick={() => updateField(field.key, !formData[field.key])}
                      className="w-9 h-5 rounded-[var(--radius-badge)] transition-colors"
                      style={{ background: formData[field.key] ? "var(--accent)" : "var(--border)" }}
                    >
                      <div className="w-4 h-4 bg-[var(--surface)] rounded-[var(--radius-badge)] shadow transition-transform" style={{ transform: formData[field.key] ? "translateX(16px)" : "translateX(2px)" }} />
                    </button>
                  </div>
                );
              }
              if (field.type === "select") {
                return (
                  <div key={field.key}>
                    <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>{field.label}</label>
                    <select
                      value={formData[field.key] || ""}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-[var(--radius-card)] outline-none"
                      style={{ background: "var(--surface2)", color: "var(--text)", border: `1px solid var(--border)`, borderRadius: "var(--radius-input)" }}
                    >
                      {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                );
              }
              // text, email, url, textarea
              return (
                <div key={field.key}>
                  <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={formData[field.key] || ""}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-3 py-2 text-xs outline-none resize-y"
                      style={{ background: "var(--surface2)", color: "var(--text)", border: `1px solid var(--border)`, borderRadius: "var(--radius-input)" }}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.key] || ""}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 text-xs outline-none"
                      style={{ background: "var(--surface2)", color: "var(--text)", border: `1px solid var(--border)`, borderRadius: "var(--radius-input)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {step.helpText && (
            <p className="text-[10px] mt-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              💡 {step.helpText}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer buttons */}
      <div className="p-4 flex items-center gap-2" style={{ borderTop: `1px solid var(--border)` }}>
        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep((s) => s - 1)}
            className="px-3 py-2 text-xs font-medium rounded-[var(--radius-card)] flex items-center gap-1 transition-colors hover:opacity-80"
            style={{ color: "var(--text-secondary)", border: `1px solid var(--border)`, borderRadius: "var(--radius-button)" }}
          >
            <ChevronLeft size={14} /> Anterior
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={onDismiss}
          className="px-3 py-2 text-xs rounded-[var(--radius-card)] transition-colors hover:opacity-80"
          style={{ color: "var(--text-muted)", borderRadius: "var(--radius-button)" }}
        >
          Saltar todo
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 text-xs font-medium rounded-[var(--radius-card)] flex items-center gap-1 transition-colors hover:opacity-90"
          style={{ background: "var(--accent)", color: "var(--accent-text)", borderRadius: "var(--radius-button)" }}
        >
          {isLastStep ? "Completar" : "Siguiente"} {isLastStep ? <Rocket size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
    </div>
  );
};
