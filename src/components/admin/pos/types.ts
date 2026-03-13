// ═══════════════════════════════════════════════════════════════
// POS Types, Config & Helpers
// Shared across POSCatalog, POSCart, POSPage
// ═══════════════════════════════════════════════════════════════

import React from "react";
import {
  MessageSquare, Phone, Instagram, Facebook, Store, Globe,
  Banknote, ArrowRightLeft, CreditCard, Smartphone,
} from "lucide-react";

// ═══════ TYPES ═══════

export interface POSOrderResult {
  id: string;
  display_id?: number;
  status: string;
  email: string;
  customer_name?: string;
  total?: number;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface POSOrderHistoryItem {
  id: string;
  display_id: number;
  email: string;
  total: number;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  items_count: number;
  source: string;
  channel: string;
  payment_method: string;
  created_at: string;
  customer_name: string;
}

export interface POSDailyStats {
  today_revenue: number;
  today_count: number;
  pos_count: number;
  total_count: number;
}

export interface POSProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  status: string;
  category: string | null;
  variants: POSVariant[];
}

export interface POSVariant {
  id: string;
  title: string;
  sku: string | null;
  inventory_quantity: number;
  prices: { amount: number; currency_code: string }[];
}

export interface CartItem {
  variant_id: string;
  product_id: string;
  product_title: string;
  variant_title: string;
  sku: string;
  price: number;
  quantity: number;
  thumbnail: string | null;
  metadata?: Record<string, unknown>;
}

export interface POSCustomer {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export type Channel = "whatsapp" | "phone" | "instagram" | "facebook" | "in_person" | "other";
export type PaymentMethod = "cash" | "transfer" | "terminal" | "online";
export type ShippingType = string | null;

// ═══════ CONFIG ═══════

export const channelConfig: Record<Channel, { label: string; icon: React.ElementType; color: string }> = {
  whatsapp: { label: "WhatsApp", icon: MessageSquare, color: "bg-[var(--success-subtle)] text-[var(--success)] border-[var(--success)]" },
  phone: { label: "Teléfono", icon: Phone, color: "bg-[var(--info-subtle)] text-[var(--info)] border-[var(--info)]" },
  instagram: { label: "Instagram", icon: Instagram, color: "bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]" },
  facebook: { label: "Facebook", icon: Facebook, color: "bg-[var(--info-subtle)] text-[var(--info)] border-[var(--info)]" },
  in_person: { label: "En persona", icon: Store, color: "bg-[var(--warning-subtle)] text-[var(--warning)] border-[var(--warning)]" },
  other: { label: "Otro", icon: Globe, color: "bg-[var(--surface2)] text-[var(--text-secondary)] border-[var(--border)]" },
};

export const paymentConfig: Record<PaymentMethod, { label: string; icon: React.ElementType; color: string }> = {
  cash: { label: "Efectivo", icon: Banknote, color: "bg-[var(--success-subtle)] text-[var(--success)] border-[var(--success)]" },
  transfer: { label: "Transferencia", icon: ArrowRightLeft, color: "bg-[var(--info-subtle)] text-[var(--info)] border-[var(--info)]" },
  terminal: { label: "Terminal", icon: CreditCard, color: "bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]" },
  online: { label: "Pago en línea", icon: Smartphone, color: "bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]" },
};

// ═══════ HELPERS ═══════

export const fmtMXN = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

export const getMXNPrice = (prices: { amount: number; currency_code: string }[]): number =>
  prices.find(p => p.currency_code === "mxn")?.amount ?? prices[0]?.amount ?? 0;
