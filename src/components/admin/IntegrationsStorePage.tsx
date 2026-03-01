"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plug, Search, Filter, Grid3X3, List, Star, Check, X, ChevronRight,
  ExternalLink, Download, Trash2, Settings, ToggleLeft, ToggleRight,
  Shield, Clock, AlertTriangle, RefreshCw, Eye, Copy, Zap,
  CreditCard, Truck, Mail, FileText, BarChart3, MessageSquare,
  Instagram, Database, Brain, ShoppingBag, Users, Globe, Lock,
  Activity, ChevronDown, ArrowLeft, BadgeCheck
} from 'lucide-react';
import { toast } from 'sonner';

// ===== TYPES =====
type ViewMode = 'marketplace' | 'installed' | 'detail';
type AppStatus = 'not_installed' | 'installed' | 'needs_config';
type AppCategory = 'all' | 'pagos' | 'envios' | 'email' | 'facturacion' | 'analytics' | 'chat' | 'redes' | 'erp' | 'crm' | 'almacen' | 'ia';

interface AppReview {
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface IntegrationApp {
  id: string;
  name: string;
  logo: string;
  logoColor: string;
  category: AppCategory;
  categoryLabel: string;
  shortDesc: string;
  longDesc: string;
  pricing: string;
  pricingType: 'free' | 'paid' | 'usage';
  status: AppStatus;
  enabled: boolean;
  version: string;
  lastUpdate: string;
  developer: string;
  isRockStage: boolean;
  rating: number;
  reviewCount: number;
  installs: string;
  permissions: string[];
  reviews: AppReview[];
  syncData?: string;
  lastSync?: string;
  configFields?: Array<{ label: string; type: 'text' | 'toggle' | 'select'; value: string; masked?: boolean }>;
  logs?: Array<{ time: string; type: 'success' | 'error' | 'info'; message: string }>;
}

// ===== MOCK DATA =====
const categories: Array<{ id: AppCategory; label: string; icon: React.ElementType }> = [
  { id: 'all', label: 'Todas', icon: Grid3X3 },
  { id: 'pagos', label: 'Pagos', icon: CreditCard },
  { id: 'envios', label: 'Envios', icon: Truck },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'facturacion', label: 'Facturacion MX', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'redes', label: 'Redes Sociales', icon: Instagram },
  { id: 'erp', label: 'ERP', icon: Database },
  { id: 'crm', label: 'CRM', icon: Users },
  { id: 'almacen', label: 'Almacen', icon: ShoppingBag },
  { id: 'ia', label: 'IA', icon: Brain },
];

const apps: IntegrationApp[] = [
  // === PAGOS ===
  {
    id: 'stripe', name: 'Stripe', logo: 'S', logoColor: '#635BFF',
    category: 'pagos', categoryLabel: 'Pagos', shortDesc: 'Pagos con tarjeta de credito y debito',
    longDesc: 'Acepta pagos globales con tarjeta de credito, debito, Apple Pay y Google Pay. Soporte completo para suscripciones, facturacion recurrente y payouts. Dashboard unificado con reportes de ingresos en tiempo real.',
    pricing: 'Gratis', pricingType: 'free', status: 'installed', enabled: true,
    version: '3.2.1', lastUpdate: '15 Feb 2026', developer: 'RockStage', isRockStage: true,
    rating: 4.9, reviewCount: 1247, installs: '12,400+',
    permissions: ['Leer/escribir pedidos', 'Leer clientes', 'Procesar pagos', 'Gestionar reembolsos'],
    reviews: [
      { user: 'Artesanias Oaxaca', rating: 5, comment: 'Integracion perfecta, cero problemas en 6 meses', date: 'Feb 2026' },
      { user: 'Muebles Victoria', rating: 5, comment: 'El checkout es rapidisimo', date: 'Ene 2026' },
    ],
    syncData: '1,847 transacciones', lastSync: 'Hace 5 min',
    configFields: [
      { label: 'API Key (Publishable)', type: 'text', value: 'pk_test_51N...', masked: true },
      { label: 'API Key (Secret)', type: 'text', value: 'sk_test_51N...', masked: true },
      { label: 'Modo', type: 'select', value: 'Test' },
      { label: 'Webhooks activos', type: 'toggle', value: 'true' },
    ],
    logs: [
      { time: '10:35', type: 'success', message: 'Pago #1847 procesado — $2,450 MXN' },
      { time: '10:30', type: 'success', message: 'Webhook payment_intent.succeeded recibido' },
      { time: '09:15', type: 'info', message: 'Sincronizacion de transacciones completada' },
      { time: '08:00', type: 'success', message: 'Pago #1846 procesado — $890 MXN' },
    ],
  },
  {
    id: 'mercadopago', name: 'MercadoPago', logo: 'MP', logoColor: '#009EE3',
    category: 'pagos', categoryLabel: 'Pagos', shortDesc: 'Pagos MX: debito, OXXO, transferencia',
    longDesc: 'Solucion de pagos lider en Mexico y LATAM. Acepta tarjetas, OXXO Pay, transferencia bancaria (SPEI), y pagos a meses sin intereses. Ideal para el mercado mexicano con altas tasas de conversion.',
    pricing: 'Gratis', pricingType: 'free', status: 'installed', enabled: true,
    version: '2.8.0', lastUpdate: '10 Feb 2026', developer: 'RockStage', isRockStage: true,
    rating: 4.7, reviewCount: 892, installs: '8,900+',
    permissions: ['Leer/escribir pedidos', 'Leer clientes', 'Procesar pagos'],
    reviews: [
      { user: 'Carpinteria MX', rating: 5, comment: 'OXXO Pay es esencial para Mexico', date: 'Feb 2026' },
    ],
    syncData: '623 transacciones', lastSync: 'Hace 10 min',
    configFields: [
      { label: 'Public Key', type: 'text', value: 'APP_USR-...', masked: true },
      { label: 'Access Token', type: 'text', value: 'APP_USR-...', masked: true },
      { label: 'Modo', type: 'select', value: 'Test' },
    ],
    logs: [
      { time: '10:20', type: 'success', message: 'Pago OXXO confirmado — $1,200 MXN' },
      { time: '09:00', type: 'info', message: 'Webhook de estado actualizado' },
    ],
  },
  {
    id: 'paypal', name: 'PayPal', logo: 'PP', logoColor: '#003087',
    category: 'pagos', categoryLabel: 'Pagos', shortDesc: 'Pagos internacionales con PayPal',
    longDesc: 'Acepta pagos de clientes internacionales con PayPal. Soporte para Express Checkout, suscripciones y proteccion al comprador. Ideal para ventas cross-border.',
    pricing: 'Gratis', pricingType: 'free', status: 'not_installed', enabled: false,
    version: '2.1.0', lastUpdate: '01 Feb 2026', developer: 'RockStage', isRockStage: true,
    rating: 4.5, reviewCount: 2103, installs: '15,600+',
    permissions: ['Leer/escribir pedidos', 'Procesar pagos', 'Gestionar disputas'],
    reviews: [
      { user: 'Export MX', rating: 4, comment: 'Funciona bien para ventas internacionales', date: 'Ene 2026' },
    ],
  },
  {
    id: 'conekta', name: 'Conekta', logo: 'CK', logoColor: '#0B1F3A',
    category: 'pagos', categoryLabel: 'Pagos', shortDesc: 'Pagos online para Mexico (tarjeta, OXXO, SPEI)',
    longDesc: 'Plataforma de pagos mexicana con soporte para tarjetas, OXXO, SPEI y meses sin intereses. Certificacion PCI DSS nivel 1.',
    pricing: 'Gratis', pricingType: 'free', status: 'not_installed', enabled: false,
    version: '1.9.2', lastUpdate: '20 Ene 2026', developer: 'Conekta Inc.', isRockStage: false,
    rating: 4.3, reviewCount: 456, installs: '3,200+',
    permissions: ['Leer/escribir pedidos', 'Procesar pagos'],
    reviews: [],
  },
  // === ENVIOS ===
  {
    id: 'envia', name: 'Envia.com', logo: 'EN', logoColor: '#FF6B00',
    category: 'envios', categoryLabel: 'Envios', shortDesc: 'Multi-carrier: Fedex, DHL, Estafeta, Redpack',
    longDesc: 'Conecta con +30 paqueterias desde un solo dashboard. Compara tarifas en tiempo real, genera guias automaticamente y rastrea todos tus envios. Las mejores tarifas negociadas para pymes mexicanas.',
    pricing: 'Gratis', pricingType: 'free', status: 'installed', enabled: true,
    version: '4.1.0', lastUpdate: '20 Feb 2026', developer: 'RockStage', isRockStage: true,
    rating: 4.6, reviewCount: 678, installs: '6,700+',
    permissions: ['Leer pedidos', 'Leer direcciones de clientes', 'Generar guias de envio'],
    reviews: [
      { user: 'Tienda MX', rating: 5, comment: 'Ahorramos 30% en envios con las tarifas negociadas', date: 'Feb 2026' },
    ],
    syncData: '342 guias generadas', lastSync: 'Hace 15 min',
    configFields: [
      { label: 'API Key', type: 'text', value: 'env_live_...', masked: true },
      { label: 'Carrier preferido', type: 'select', value: 'FedEx' },
      { label: 'Auto-generar guia', type: 'toggle', value: 'true' },
    ],
    logs: [
      { time: '10:30', type: 'success', message: 'Guia FedEx generada — #165 → CDMX' },
      { time: '10:25', type: 'info', message: 'Cotizacion multi-carrier solicitada' },
    ],
  },
  {
    id: 'skydropx', name: 'Skydropx', logo: 'SK', logoColor: '#00C2FF',
    category: 'envios', categoryLabel: 'Envios', shortDesc: 'Plataforma de envios con IA',
    longDesc: 'Envios inteligentes con seleccion automatica del mejor carrier basada en destino, peso y urgencia. Dashboard de tracking en tiempo real.',
    pricing: '$299/mes', pricingType: 'paid', status: 'not_installed', enabled: false,
    version: '2.5.0', lastUpdate: '05 Feb 2026', developer: 'Skydropx SA', isRockStage: false,
    rating: 4.4, reviewCount: 321, installs: '2,800+',
    permissions: ['Leer pedidos', 'Leer direcciones', 'Generar guias'],
    reviews: [],
  },
  {
    id: '99minutos', name: '99 Minutos', logo: '99', logoColor: '#FF2D55',
    category: 'envios', categoryLabel: 'Envios', shortDesc: 'Entrega mismo dia en CDMX, GDL, MTY',
    longDesc: 'Servicio de entrega express en las principales ciudades de Mexico. Ideal para entregas urgentes y same-day delivery.',
    pricing: 'Por uso', pricingType: 'usage', status: 'not_installed', enabled: false,
    version: '1.3.0', lastUpdate: '15 Ene 2026', developer: '99 Minutos SA', isRockStage: false,
    rating: 4.2, reviewCount: 189, installs: '1,400+',
    permissions: ['Leer pedidos', 'Leer direcciones'],
    reviews: [],
  },
  // === EMAIL ===
  {
    id: 'resend', name: 'Resend', logo: 'RE', logoColor: '#000000',
    category: 'email', categoryLabel: 'Email', shortDesc: 'Email transaccional moderno para developers',
    longDesc: 'API de email de nueva generacion con las mejores tasas de entrega. Plantillas React, analytics detallados y logs en tiempo real. La opcion preferida por equipos modernos.',
    pricing: 'Gratis (3K/mes)', pricingType: 'free', status: 'installed', enabled: true,
    version: '1.5.0', lastUpdate: '25 Feb 2026', developer: 'RockStage', isRockStage: true,
    rating: 4.8, reviewCount: 567, installs: '5,200+',
    permissions: ['Leer clientes (email)', 'Enviar emails', 'Leer plantillas'],
    reviews: [
      { user: 'Dev Studio', rating: 5, comment: 'La mejor API de email que he usado', date: 'Feb 2026' },
    ],
    syncData: '4,218 emails enviados', lastSync: 'Hace 2 min',
    configFields: [
      { label: 'API Key', type: 'text', value: 're_live_...', masked: true },
      { label: 'Dominio verificado', type: 'text', value: 'mail.davidsonsdesign.com' },
    ],
    logs: [
      { time: '10:35', type: 'success', message: 'Email confirmacion enviado a cliente #248' },
      { time: '10:20', type: 'success', message: 'Email seguimiento enviado a cliente #245' },
    ],
  },
  {
    id: 'klaviyo', name: 'Klaviyo', logo: 'KL', logoColor: '#222222',
    category: 'email', categoryLabel: 'Email', shortDesc: 'Email marketing + SMS con IA',
    longDesc: 'Plataforma lider de email marketing para ecommerce. Segmentacion avanzada, flujos automatizados, A/B testing y predicciones con IA. Integracion nativa con datos de pedidos.',
    pricing: '$45/mes', pricingType: 'paid', status: 'not_installed', enabled: false,
    version: '3.0.1', lastUpdate: '10 Feb 2026', developer: 'Klaviyo Inc.', isRockStage: false,
    rating: 4.7, reviewCount: 3421, installs: '28,000+',
    permissions: ['Leer clientes', 'Leer pedidos', 'Leer productos', 'Enviar emails'],
    reviews: [
      { user: 'Fashion MX', rating: 5, comment: 'ROI increible con los flujos automatizados', date: 'Feb 2026' },
    ],
  },
  // === FACTURACION MX ===
  {
    id: 'facturapi', name: 'Facturapi', logo: 'FA', logoColor: '#2563EB',
    category: 'facturacion', categoryLabel: 'Facturacion MX', shortDesc: 'Facturacion electronica CFDI 4.0 automatizada',
    longDesc: 'Genera facturas CFDI 4.0 automaticamente desde cada pedido. Complementos de pago, notas de credito, y retenciones. Cumple 100% con SAT. API moderna y dashboard para tu contador.',
    pricing: '$199/mes', pricingType: 'paid', status: 'needs_config', enabled: false,
    version: '2.2.0', lastUpdate: '18 Feb 2026', developer: 'Facturapi MX', isRockStage: false,
    rating: 4.6, reviewCount: 892, installs: '7,400+',
    permissions: ['Leer pedidos', 'Leer datos fiscales de clientes', 'Generar CFDI'],
    reviews: [
      { user: 'Contador MX', rating: 5, comment: 'Automatizo el 90% de la facturacion', date: 'Ene 2026' },
    ],
    configFields: [
      { label: 'API Key', type: 'text', value: '', masked: true },
      { label: 'RFC Emisor', type: 'text', value: '' },
      { label: 'Regimen Fiscal', type: 'select', value: '' },
      { label: 'Auto-facturar', type: 'toggle', value: 'false' },
    ],
  },
  // === ANALYTICS ===
  {
    id: 'ga4', name: 'Google Analytics 4', logo: 'GA', logoColor: '#F9AB00',
    category: 'analytics', categoryLabel: 'Analytics', shortDesc: 'Tracking de trafico, conversiones y comportamiento',
    longDesc: 'Conecta GA4 con tu tienda para trackear visitas, funnel de compra, conversiones y comportamiento de usuarios. Enhanced ecommerce tracking automatico.',
    pricing: 'Gratis', pricingType: 'free', status: 'installed', enabled: true,
    version: '2.0.0', lastUpdate: '01 Feb 2026', developer: 'RockStage', isRockStage: true,
    rating: 4.5, reviewCount: 4521, installs: '42,000+',
    permissions: ['Leer datos de sesion', 'Enviar eventos ecommerce'],
    reviews: [],
    syncData: '12,847 eventos (30d)', lastSync: 'Tiempo real',
    configFields: [
      { label: 'Measurement ID', type: 'text', value: 'G-XXXXXXXXXX' },
      { label: 'Enhanced Ecommerce', type: 'toggle', value: 'true' },
    ],
    logs: [
      { time: '10:35', type: 'info', message: 'Evento purchase enviado — #1847' },
      { time: '10:30', type: 'info', message: 'Evento add_to_cart enviado' },
    ],
  },
  {
    id: 'fbpixel', name: 'Facebook Pixel', logo: 'FB', logoColor: '#1877F2',
    category: 'analytics', categoryLabel: 'Analytics', shortDesc: 'Conversion tracking para Meta Ads',
    longDesc: 'Trackea conversiones de Facebook e Instagram Ads. Optimiza campanas con datos de compra y crea audiencias personalizadas basadas en comportamiento de compra.',
    pricing: 'Gratis', pricingType: 'free', status: 'not_installed', enabled: false,
    version: '1.8.0', lastUpdate: '20 Ene 2026', developer: 'RockStage', isRockStage: true,
    rating: 4.4, reviewCount: 3210, installs: '35,000+',
    permissions: ['Leer datos de sesion', 'Enviar eventos de conversion'],
    reviews: [],
  },
  {
    id: 'hotjar', name: 'Hotjar', logo: 'HJ', logoColor: '#FF3C00',
    category: 'analytics', categoryLabel: 'Analytics', shortDesc: 'Heatmaps, grabaciones y encuestas',
    longDesc: 'Entiende como navegan tus clientes con heatmaps, grabaciones de sesion y encuestas. Identifica puntos de friccion y optimiza la experiencia de compra.',
    pricing: '$39/mes', pricingType: 'paid', status: 'not_installed', enabled: false,
    version: '1.2.0', lastUpdate: '10 Ene 2026', developer: 'Hotjar Ltd.', isRockStage: false,
    rating: 4.5, reviewCount: 1890, installs: '14,000+',
    permissions: ['Leer datos de sesion'],
    reviews: [],
  },
  // === CHAT ===
  {
    id: 'whatsapp_biz', name: 'WhatsApp Business', logo: 'WA', logoColor: '#25D366',
    category: 'chat', categoryLabel: 'Chat', shortDesc: 'Atencion al cliente por WhatsApp',
    longDesc: 'Conecta tu numero de WhatsApp Business para recibir consultas de clientes, enviar confirmaciones de pedido y notificaciones de envio directamente por WhatsApp.',
    pricing: 'Por uso', pricingType: 'usage', status: 'not_installed', enabled: false,
    version: '1.5.0', lastUpdate: '15 Feb 2026', developer: 'RockStage', isRockStage: true,
    rating: 4.6, reviewCount: 1234, installs: '9,800+',
    permissions: ['Leer pedidos', 'Leer clientes (telefono)', 'Enviar mensajes'],
    reviews: [
      { user: 'Tienda Local', rating: 5, comment: 'Mis clientes prefieren WhatsApp por mucho', date: 'Feb 2026' },
    ],
  },
  // === REDES ===
  {
    id: 'instagram_shop', name: 'Instagram Shopping', logo: 'IG', logoColor: '#E4405F',
    category: 'redes', categoryLabel: 'Redes Sociales', shortDesc: 'Vende desde Instagram con catalogo sincronizado',
    longDesc: 'Sincroniza tu catalogo de productos con Instagram Shopping. Etiqueta productos en posts y stories, y permite compras directas desde la app.',
    pricing: 'Gratis', pricingType: 'free', status: 'not_installed', enabled: false,
    version: '2.0.0', lastUpdate: '05 Feb 2026', developer: 'RockStage', isRockStage: true,
    rating: 4.3, reviewCount: 2456, installs: '18,000+',
    permissions: ['Leer productos', 'Leer inventario', 'Sincronizar catalogo'],
    reviews: [],
  },
  {
    id: 'tiktok_shop', name: 'TikTok Shop', logo: 'TT', logoColor: '#000000',
    category: 'redes', categoryLabel: 'Redes Sociales', shortDesc: 'Vende en TikTok con catalogo integrado',
    longDesc: 'Conecta tu tienda con TikTok Shop para vender directamente en la plataforma. Sincronizacion de productos, pedidos y tracking automatico.',
    pricing: 'Gratis', pricingType: 'free', status: 'not_installed', enabled: false,
    version: '1.0.0', lastUpdate: '20 Feb 2026', developer: 'TikTok Commerce', isRockStage: false,
    rating: 4.0, reviewCount: 567, installs: '4,500+',
    permissions: ['Leer/escribir productos', 'Leer/escribir pedidos'],
    reviews: [],
  },
  // === CRM ===
  {
    id: 'hubspot', name: 'HubSpot CRM', logo: 'HS', logoColor: '#FF7A59',
    category: 'crm', categoryLabel: 'CRM', shortDesc: 'CRM completo con marketing automation',
    longDesc: 'Sincroniza clientes y pedidos con HubSpot. Automatiza follow-ups, nurture leads y gestiona el pipeline de ventas desde un solo lugar.',
    pricing: 'Gratis (basico)', pricingType: 'free', status: 'not_installed', enabled: false,
    version: '2.1.0', lastUpdate: '01 Feb 2026', developer: 'HubSpot Inc.', isRockStage: false,
    rating: 4.6, reviewCount: 4567, installs: '32,000+',
    permissions: ['Leer clientes', 'Leer pedidos', 'Crear/editar contactos CRM'],
    reviews: [],
  },
  // === IA ===
  {
    id: 'ai_recommendations', name: 'RockStage AI Recs', logo: 'AI', logoColor: '#8B5CF6',
    category: 'ia', categoryLabel: 'IA', shortDesc: 'Recomendaciones de producto con IA',
    longDesc: 'Motor de recomendaciones basado en machine learning. Sugiere productos relevantes a cada cliente basandose en su historial de compra, navegacion y clientes similares. Aumenta el AOV hasta un 25%.',
    pricing: '$99/mes', pricingType: 'paid', status: 'not_installed', enabled: false,
    version: '1.0.0', lastUpdate: '25 Feb 2026', developer: 'RockStage', isRockStage: true,
    rating: 4.8, reviewCount: 234, installs: '1,800+',
    permissions: ['Leer productos', 'Leer pedidos', 'Leer comportamiento de usuarios'],
    reviews: [
      { user: 'Ecommerce Pro', rating: 5, comment: 'Aumento del 18% en AOV en el primer mes', date: 'Feb 2026' },
    ],
  },
  {
    id: 'ai_chatbot', name: 'RockStage AI Chat', logo: 'AC', logoColor: '#10B981',
    category: 'ia', categoryLabel: 'IA', shortDesc: 'Chatbot IA entrenado con tus productos',
    longDesc: 'Chatbot inteligente que conoce tu catalogo, politicas y procesos. Responde preguntas de clientes 24/7, sugiere productos y escala a humano cuando es necesario.',
    pricing: '$149/mes', pricingType: 'paid', status: 'not_installed', enabled: false,
    version: '1.2.0', lastUpdate: '20 Feb 2026', developer: 'RockStage', isRockStage: true,
    rating: 4.7, reviewCount: 178, installs: '1,200+',
    permissions: ['Leer productos', 'Leer pedidos', 'Leer FAQ/CMS', 'Chat con clientes'],
    reviews: [],
  },
  // === ERP ===
  {
    id: 'quickbooks', name: 'QuickBooks', logo: 'QB', logoColor: '#2CA01C',
    category: 'erp', categoryLabel: 'ERP', shortDesc: 'Contabilidad y facturacion sincronizada',
    longDesc: 'Sincroniza ventas, gastos e inventario con QuickBooks. Automatiza la conciliacion bancaria y genera reportes financieros precisos.',
    pricing: 'Gratis', pricingType: 'free', status: 'not_installed', enabled: false,
    version: '1.8.0', lastUpdate: '10 Feb 2026', developer: 'Intuit Inc.', isRockStage: false,
    rating: 4.4, reviewCount: 2345, installs: '19,000+',
    permissions: ['Leer pedidos', 'Leer productos', 'Crear transacciones contables'],
    reviews: [],
  },
];

// ===== SHARED =====
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={'bg-white rounded-xl border border-wood-100 shadow-sm ' + className}>{children}</div>;
}

function Stars({ rating, size = 10 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-wood-200'}
        />
      ))}
    </div>
  );
}

function PricingBadge({ pricing, type }: { pricing: string; type: string }) {
  const cls = type === 'free' ? 'bg-green-50 text-green-700 border-green-200'
    : type === 'usage' ? 'bg-purple-50 text-purple-700 border-purple-200'
    : 'bg-blue-50 text-blue-700 border-blue-200';
  return <span className={'text-[9px] px-1.5 py-0.5 rounded-full border ' + cls}>{pricing}</span>;
}

function StatusBadge({ status }: { status: AppStatus }) {
  const cfg: Record<AppStatus, { label: string; cls: string }> = {
    installed: { label: 'Instalada', cls: 'bg-green-50 text-green-700 border-green-200' },
    needs_config: { label: 'Requiere config', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    not_installed: { label: 'No instalada', cls: 'bg-wood-50 text-wood-500 border-wood-200' },
  };
  const c = cfg[status];
  return <span className={'text-[9px] px-1.5 py-0.5 rounded-full border ' + c.cls}>{c.label}</span>;
}

// ===== APP CARD =====
function AppCard({ app, onSelect }: { app: IntegrationApp; onSelect: () => void }) {
  return (
    <Card className="p-4 hover:border-wood-200 transition-colors cursor-pointer group" >
      <div onClick={onSelect}>
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm"
            style={{ backgroundColor: app.logoColor }}
          >
            {app.logo}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-medium text-wood-900 truncate">{app.name}</h4>
              {app.isRockStage && (
                <BadgeCheck size={12} className="text-accent-gold shrink-0" />
              )}
            </div>
            <p className="text-[10px] text-wood-400 mt-0.5 line-clamp-2">{app.shortDesc}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Stars rating={app.rating} size={8} />
              <span className="text-[9px] text-wood-400">{app.rating}</span>
            </div>
            <span className="text-[9px] text-wood-300">|</span>
            <span className="text-[9px] text-wood-400">{app.installs}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <PricingBadge pricing={app.pricing} type={app.pricingType} />
            <StatusBadge status={app.status} />
          </div>
        </div>
      </div>
    </Card>
  );
}

// ===== MARKETPLACE VIEW =====
function MarketplaceView({ onSelect }: { onSelect: (app: IntegrationApp) => void }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<AppCategory>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  const filtered = apps.filter(a => {
    if (catFilter !== 'all' && a.category !== catFilter) return false;
    if (priceFilter === 'free' && a.pricingType !== 'free') return false;
    if (priceFilter === 'paid' && a.pricingType === 'free') return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.shortDesc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-wood-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar apps, integraciones..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-wood-200 rounded-lg outline-none focus:border-accent-gold/50 bg-white"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'free', 'paid'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPriceFilter(p)}
              className={
                'px-2.5 py-1.5 text-[10px] rounded-lg border transition-colors ' +
                (priceFilter === p ? 'border-accent-gold bg-accent-gold/10 text-accent-gold font-medium' : 'border-wood-200 text-wood-500 hover:bg-wood-50')
              }
            >
              {p === 'all' ? 'Todas' : p === 'free' ? 'Gratis' : 'De pago'}
            </button>
          ))}
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map(c => {
          const CIcon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => setCatFilter(c.id)}
              className={
                'flex items-center gap-1 px-2.5 py-1.5 text-[10px] rounded-lg border whitespace-nowrap transition-colors shrink-0 ' +
                (catFilter === c.id ? 'border-accent-gold bg-accent-gold/10 text-accent-gold font-medium' : 'border-wood-200 text-wood-500 hover:bg-wood-50')
              }
            >
              <CIcon size={10} /> {c.label}
            </button>
          );
        })}
      </div>

      {/* Apps grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map(app => (
          <AppCard key={app.id} app={app} onSelect={() => onSelect(app)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-xs text-wood-400">
          No se encontraron apps con estos filtros
        </div>
      )}
    </div>
  );
}

// ===== INSTALLED VIEW =====
function InstalledView({ onSelect, onToggle }: { onSelect: (app: IntegrationApp) => void; onToggle: (id: string) => void }) {
  const installed = apps.filter(a => a.status !== 'not_installed');

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Apps instaladas', value: installed.length.toString() },
          { label: 'Activas', value: installed.filter(a => a.enabled).length.toString() },
          { label: 'Requieren config', value: installed.filter(a => a.status === 'needs_config').length.toString() },
          { label: 'By RockStage', value: installed.filter(a => a.isRockStage).length.toString() },
        ].map(k => (
          <Card key={k.label} className="p-3 text-center">
            <p className="text-lg font-serif text-wood-900">{k.value}</p>
            <p className="text-[10px] text-wood-400">{k.label}</p>
          </Card>
        ))}
      </div>

      {/* Installed apps list */}
      <div className="space-y-3">
        {installed.map(app => (
          <Card key={app.id} className="p-4 hover:border-wood-200 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => onSelect(app)}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: app.logoColor }}
                >
                  {app.logo}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-medium text-wood-900">{app.name}</h4>
                    {app.isRockStage && <BadgeCheck size={11} className="text-accent-gold" />}
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-[10px] text-wood-400 truncate">{app.shortDesc}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {app.syncData && (
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-wood-500">{app.syncData}</p>
                    <p className="text-[9px] text-wood-400 flex items-center gap-0.5 justify-end">
                      <RefreshCw size={8} /> {app.lastSync}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => onToggle(app.id)}
                  className={'p-1.5 rounded-lg transition-colors ' + (app.enabled ? 'text-green-600 hover:bg-green-50' : 'text-wood-400 hover:bg-wood-50')}
                  title={app.enabled ? 'Desactivar' : 'Activar'}
                >
                  {app.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
                <button
                  onClick={() => onSelect(app)}
                  className="p-1.5 rounded-lg border border-wood-200 text-wood-500 hover:bg-wood-50 transition-colors"
                  title="Configurar"
                >
                  <Settings size={12} />
                </button>
              </div>
            </div>

            {/* Logs preview */}
            {app.logs && app.logs.length > 0 && (
              <div className="mt-3 pt-3 border-t border-wood-50">
                <div className="flex items-center gap-4">
                  {app.logs.slice(0, 2).map((log, i) => (
                    <span key={i} className="flex items-center gap-1 text-[9px] text-wood-400">
                      <span className={'w-1 h-1 rounded-full ' + (log.type === 'success' ? 'bg-green-500' : log.type === 'error' ? 'bg-red-500' : 'bg-blue-400')} />
                      <span className="font-mono">{log.time}</span> {log.message}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}

        {installed.length === 0 && (
          <div className="py-16 text-center">
            <Plug size={32} className="text-wood-200 mx-auto mb-3" />
            <p className="text-xs text-wood-400">No tienes apps instaladas aun</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== DETAIL VIEW =====
function AppDetailView({ app, onBack }: { app: IntegrationApp; onBack: () => void }) {
  const [activeSection, setActiveSection] = useState<'overview' | 'config' | 'logs'>('overview');
  const [showMasked, setShowMasked] = useState<Record<string, boolean>>({});

  const isInstalled = app.status !== 'not_installed';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-wood-50 text-wood-400 hover:text-wood-600 transition-colors mt-1">
          <ArrowLeft size={16} />
        </button>
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-md"
          style={{ backgroundColor: app.logoColor }}
        >
          {app.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-serif text-wood-900">{app.name}</h2>
            {app.isRockStage && (
              <span className="flex items-center gap-1 text-[9px] bg-accent-gold/15 text-accent-gold px-2 py-0.5 rounded-full font-medium">
                <BadgeCheck size={10} /> By RockStage
              </span>
            )}
            <StatusBadge status={app.status} />
          </div>
          <p className="text-xs text-wood-500 mt-0.5">{app.shortDesc}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              <Stars rating={app.rating} />
              <span className="text-[10px] text-wood-500">{app.rating} ({app.reviewCount} reviews)</span>
            </div>
            <span className="text-[10px] text-wood-300">|</span>
            <span className="text-[10px] text-wood-400">{app.installs} instalaciones</span>
            <span className="text-[10px] text-wood-300">|</span>
            <PricingBadge pricing={app.pricing} type={app.pricingType} />
          </div>
        </div>
        <div className="shrink-0 flex flex-col gap-2">
          {!isInstalled ? (
            <button
              onClick={() => toast.success(`${app.name} instalada exitosamente`)}
              className="px-4 py-2 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors flex items-center gap-1.5"
            >
              <Download size={12} /> Instalar
            </button>
          ) : (
            <>
              <button
                onClick={() => toast.success(`${app.name} ${app.enabled ? 'desactivada' : 'activada'}`)}
                className={
                  'px-4 py-2 text-xs rounded-lg transition-colors flex items-center gap-1.5 ' +
                  (app.enabled ? 'bg-wood-100 text-wood-600 hover:bg-wood-200' : 'bg-green-50 text-green-700 hover:bg-green-100')
                }
              >
                {app.enabled ? <><Zap size={12} /> Activa</> : <><Zap size={12} /> Activar</>}
              </button>
              <button
                onClick={() => toast.error(`${app.name} desinstalada`)}
                className="px-4 py-2 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={12} /> Desinstalar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sub-nav for installed apps */}
      {isInstalled && (
        <div className="flex gap-1 border-b border-wood-100">
          {([
            { id: 'overview' as const, label: 'Informacion' },
            { id: 'config' as const, label: 'Configuracion' },
            { id: 'logs' as const, label: 'Logs' },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={
                'px-3 py-2 text-xs border-b-2 transition-colors ' +
                (activeSection === tab.id
                  ? 'border-accent-gold text-accent-gold font-medium'
                  : 'border-transparent text-wood-500 hover:text-wood-700')
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Overview */}
      {(activeSection === 'overview' || !isInstalled) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Description */}
            <Card className="p-5">
              <h3 className="text-xs font-medium text-wood-900 mb-2">Descripcion</h3>
              <p className="text-xs text-wood-600 leading-relaxed">{app.longDesc}</p>
            </Card>

            {/* Reviews */}
            <Card className="p-5">
              <h3 className="text-xs font-medium text-wood-900 mb-3">Reviews de otros tenants</h3>
              {app.reviews.length > 0 ? (
                <div className="space-y-3">
                  {app.reviews.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 pb-3 border-b border-wood-50 last:border-0 last:pb-0">
                      <div className="w-7 h-7 rounded-full bg-sand-100 flex items-center justify-center text-[9px] font-medium text-wood-600 shrink-0">
                        {r.user.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-wood-900">{r.user}</span>
                          <Stars rating={r.rating} size={8} />
                          <span className="text-[9px] text-wood-400">{r.date}</span>
                        </div>
                        <p className="text-[10px] text-wood-500 mt-0.5">{r.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-wood-400">Aun no hay reviews para esta app</p>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            {/* Metadata */}
            <Card className="p-4">
              <h3 className="text-xs font-medium text-wood-900 mb-3">Informacion</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Desarrollador', value: app.developer },
                  { label: 'Version', value: app.version },
                  { label: 'Ultima actualizacion', value: app.lastUpdate },
                  { label: 'Categoria', value: app.categoryLabel },
                  { label: 'Precio', value: app.pricing },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-[10px] text-wood-400">{item.label}</span>
                    <span className="text-[10px] text-wood-700 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Permissions */}
            <Card className="p-4">
              <h3 className="text-xs font-medium text-wood-900 mb-3 flex items-center gap-1.5">
                <Shield size={12} className="text-accent-gold" /> Permisos requeridos
              </h3>
              <div className="space-y-1.5">
                {app.permissions.map((perm, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-wood-600">
                    <Lock size={8} className="text-wood-400 shrink-0" />
                    {perm}
                  </div>
                ))}
              </div>
            </Card>

            {/* Sync data for installed */}
            {isInstalled && app.syncData && (
              <Card className="p-4">
                <h3 className="text-xs font-medium text-wood-900 mb-3 flex items-center gap-1.5">
                  <Activity size={12} className="text-accent-gold" /> Datos sincronizados
                </h3>
                <p className="text-sm font-serif text-wood-900">{app.syncData}</p>
                <p className="text-[9px] text-wood-400 mt-1 flex items-center gap-1">
                  <RefreshCw size={8} /> Ultima sync: {app.lastSync}
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Config */}
      {activeSection === 'config' && isInstalled && (
        <Card className="p-5">
          <h3 className="text-xs font-medium text-wood-900 mb-4">Configuracion de {app.name}</h3>
          {app.configFields && app.configFields.length > 0 ? (
            <div className="space-y-4 max-w-lg">
              {app.configFields.map((field, i) => (
                <div key={i}>
                  <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">{field.label}</label>
                  {field.type === 'text' && (
                    <div className="relative">
                      <input
                        type={field.masked && !showMasked[field.label] ? 'password' : 'text'}
                        defaultValue={field.value}
                        className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white outline-none focus:border-accent-gold/50 font-mono pr-16"
                        placeholder={field.value ? undefined : 'Ingresa valor...'}
                      />
                      {field.masked && (
                        <button
                          onClick={() => setShowMasked(prev => ({ ...prev, [field.label]: !prev[field.label] }))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-wood-400 hover:text-wood-600 p-1"
                        >
                          {showMasked[field.label] ? <Eye size={12} /> : <Eye size={12} />}
                        </button>
                      )}
                    </div>
                  )}
                  {field.type === 'select' && (
                    <select defaultValue={field.value} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white outline-none">
                      <option>{field.value || 'Seleccionar...'}</option>
                      {field.label.includes('Modo') && <><option>Live</option><option>Test</option></>}
                      {field.label.includes('Carrier') && <><option>FedEx</option><option>DHL</option><option>Estafeta</option><option>Redpack</option></>}
                      {field.label.includes('Regimen') && <><option>601 - General de Ley</option><option>612 - Personas Fisicas</option><option>625 - RESICO</option></>}
                    </select>
                  )}
                  {field.type === 'toggle' && (
                    <button className={'flex items-center gap-2 text-xs ' + (field.value === 'true' ? 'text-green-600' : 'text-wood-400')}>
                      {field.value === 'true' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      {field.value === 'true' ? 'Activado' : 'Desactivado'}
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => toast.success('Configuracion guardada')}
                className="px-4 py-2 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors flex items-center gap-1.5 mt-2"
              >
                <Check size={12} /> Guardar configuracion
              </button>
            </div>
          ) : (
            <p className="text-xs text-wood-400">Esta app no tiene opciones de configuracion</p>
          )}
        </Card>
      )}

      {/* Logs */}
      {activeSection === 'logs' && isInstalled && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-wood-900 flex items-center gap-1.5">
              <Activity size={12} className="text-accent-gold" /> Logs de integracion
            </h3>
            <button className="text-[10px] text-accent-gold hover:underline">Exportar logs</button>
          </div>
          {app.logs && app.logs.length > 0 ? (
            <div className="space-y-2">
              {app.logs.map((log, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-wood-50 last:border-0">
                  <span className="text-[10px] text-wood-400 font-mono w-12 shrink-0">{log.time}</span>
                  <span className={
                    'text-[9px] px-1.5 py-0.5 rounded-full w-14 text-center shrink-0 ' +
                    (log.type === 'success' ? 'bg-green-50 text-green-700' : log.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700')
                  }>
                    {log.type === 'success' ? 'OK' : log.type === 'error' ? 'Error' : 'Info'}
                  </span>
                  <span className="text-[10px] text-wood-600">{log.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-wood-400">No hay logs recientes para esta integracion</p>
          )}
        </Card>
      )}
    </div>
  );
}

// ===== MAIN COMPONENT =====
export const IntegrationsStorePage: React.FC = () => {
  const [view, setView] = useState<ViewMode>('marketplace');
  const [selectedApp, setSelectedApp] = useState<IntegrationApp | null>(null);

  const handleSelect = useCallback((app: IntegrationApp) => {
    setSelectedApp(app);
    setView('detail');
  }, []);

  const handleToggle = useCallback((id: string) => {
    const app = apps.find(a => a.id === id);
    if (app) {
      toast.success(`${app.name} ${app.enabled ? 'desactivada' : 'activada'}`);
    }
  }, []);

  if (view === 'detail' && selectedApp) {
    return (
      <div className="space-y-5">
        <AppDetailView app={selectedApp} onBack={() => { setView('marketplace'); setSelectedApp(null); }} />
      </div>
    );
  }

  const installedCount = apps.filter(a => a.status !== 'not_installed').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-serif text-wood-900 flex items-center gap-2">
            <Plug size={20} className="text-accent-gold" /> Centro de Integraciones
          </h1>
          <p className="text-xs text-wood-400 mt-0.5">Descubre, instala y configura apps para potenciar tu tienda</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-wood-100">
        {([
          { id: 'marketplace' as ViewMode, label: 'Marketplace', count: apps.length },
          { id: 'installed' as ViewMode, label: 'Instaladas', count: installedCount },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={
              'flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors ' +
              (view === tab.id
                ? 'border-accent-gold text-accent-gold font-medium'
                : 'border-transparent text-wood-500 hover:text-wood-700')
            }
          >
            {tab.label}
            <span className="text-[9px] bg-sand-100 text-wood-400 px-1.5 py-0.5 rounded-full">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {view === 'marketplace' && <MarketplaceView onSelect={handleSelect} />}
          {view === 'installed' && <InstalledView onSelect={handleSelect} onToggle={handleToggle} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
