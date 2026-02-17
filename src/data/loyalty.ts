// src/data/loyalty.ts

export interface LoyaltyTier {
  id: string;
  name: string;
  minSpend: number;
  maxSpend: number | null;
  benefits: string[];
  styles: {
    card: string;
    icon: string;
    badge: string;
    text: string;
    border: string;
  };
}

export const LOYALTY_TIERS: LoyaltyTier[] = [
  { 
    id: 'bronze', 
    name: 'Bronce', 
    minSpend: 0, 
    maxSpend: 2999, 
    benefits: ['Acumulación de puntos (1 punto = $1 MXN)', 'Canje de puntos en compras'],
    styles: {
      card: 'bg-gradient-to-br from-[#E7CBA5] via-[#CD7F32] to-[#A05A2C]',
      icon: 'bg-[#6D3B16] text-[#E7CBA5]',
      badge: 'bg-[#CD7F32]/15 text-[#5D3A1F] border border-[#CD7F32]/30',
      text: 'text-[#4A2511]', 
      border: 'border-[#E7CBA5]/60'
    }
  },
  { 
    id: 'silver', 
    name: 'Plata', 
    minSpend: 3000, 
    maxSpend: 9999, 
    benefits: ['Beneficios nivel Bronce', 'Multiplicador de puntos 1.2x', 'Prioridad en producción (+1 día)'],
    styles: {
      card: 'bg-gradient-to-br from-[#F5F5F7] via-[#D1D1D6] to-[#9CA3AF]',
      icon: 'bg-[#4B5563] text-[#F5F5F7]',
      badge: 'bg-[#9CA3AF]/15 text-[#374151] border border-[#9CA3AF]/30',
      text: 'text-[#1F2937]',
      border: 'border-[#F5F5F7]/60'
    }
  },
  { 
    id: 'gold', 
    name: 'Oro', 
    minSpend: 10000, 
    maxSpend: 24999, 
    benefits: ['Beneficios nivel Plata', 'Grabado láser sin costo (1/mes)', 'Acceso anticipado a colecciones', 'Soporte prioritario 24/7'],
    styles: {
      card: 'bg-gradient-to-br from-[#FCEabb] via-[#F0C24D] to-[#BF953F]',
      icon: 'bg-[#704F18] text-[#FCEabb]',
      badge: 'bg-[#F0C24D]/15 text-[#5C4010] border border-[#F0C24D]/30',
      text: 'text-[#422A06]',
      border: 'border-[#FCEabb]/60'
    }
  },
  { 
    id: 'platinum', 
    name: 'Platino', 
    minSpend: 25000, 
    maxSpend: null, 
    benefits: ['Beneficios nivel Oro', 'Descuento permanente 5%', 'Concierge personal', 'Envíos express gratuitos'],
    styles: {
      card: 'bg-gradient-to-br from-[#F0F2F5] via-[#BCC6CC] to-[#788896]',
      icon: 'bg-[#37474F] text-[#F0F2F5]',
      badge: 'bg-[#BCC6CC]/20 text-[#263238] border border-[#BCC6CC]/40',
      text: 'text-[#102027]',
      border: 'border-[#F0F2F5]/60'
    }
  }
];
