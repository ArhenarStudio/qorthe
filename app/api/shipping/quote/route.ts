// ═══════════════════════════════════════════════════════════════
// POST /api/shipping/quote — Envia.com Rate Quote
//
// Calls Envia.com API directly to get real shipping rates for
// each carrier based on destination postal code + package weight.
//
// This exists because Medusa v2's GET /store/shipping-options
// does NOT invoke calculatePrice for "calculated" options —
// it only returns the stored amount (0 for calculated).
//
// The frontend calls this after the user enters their postal code
// to show real prices before selecting a shipping method.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { logger } from '@/src/lib/logger';

const ENVIA_API_KEY = process.env.ENVIA_API_KEY || "";
const ENVIA_BASE_URL = process.env.ENVIA_BASE_URL || "https://api-test.envia.com";

// ─── Mexican State Name → Envia 2-letter Code ───
// Envia API requires short state codes, not full names.
const STATE_CODE_MAP: Record<string, string> = {
  'aguascalientes': 'AG',
  'baja california': 'BC',
  'baja california sur': 'BS',
  'campeche': 'CM',
  'chiapas': 'CS',
  'chihuahua': 'CH',
  'ciudad de méxico': 'DF',
  'ciudad de mexico': 'DF',
  'cdmx': 'DF',
  'coahuila': 'CO',
  'coahuila de zaragoza': 'CO',
  'colima': 'CL',
  'durango': 'DG',
  'guanajuato': 'GT',
  'guerrero': 'GR',
  'hidalgo': 'HG',
  'jalisco': 'JA',
  'méxico': 'EM',
  'mexico': 'EM',
  'estado de méxico': 'EM',
  'estado de mexico': 'EM',
  'michoacán': 'MI',
  'michoacan': 'MI',
  'michoacán de ocampo': 'MI',
  'michoacan de ocampo': 'MI',
  'morelos': 'MO',
  'nayarit': 'NA',
  'nuevo león': 'NL',
  'nuevo leon': 'NL',
  'oaxaca': 'OA',
  'puebla': 'PU',
  'querétaro': 'QT',
  'queretaro': 'QT',
  'quintana roo': 'QR',
  'san luis potosí': 'SL',
  'san luis potosi': 'SL',
  'sinaloa': 'SI',
  'sonora': 'SO',
  'tabasco': 'TB',
  'tamaulipas': 'TM',
  'tlaxcala': 'TL',
  'veracruz': 'VE',
  'veracruz de ignacio de la llave': 'VE',
  'yucatán': 'YU',
  'yucatan': 'YU',
  'zacatecas': 'ZA',
};

/** Convert state name to 2-letter Envia code */
function toStateCode(state: string): string {
  if (!state) return '';
  const trimmed = state.trim();
  // Already a 2-letter code?
  if (/^[A-Z]{2}$/.test(trimmed)) return trimmed;
  const mapped = STATE_CODE_MAP[trimmed.toLowerCase()];
  if (mapped) return mapped;
  // Fallback: return first 2 chars uppercased (better than sending full name)
  logger.warn(`[Shipping Quote] Unknown state "${trimmed}", using first 2 chars`);
  return trimmed.slice(0, 2).toUpperCase();
}

// Origin: Qorthe workshop in Hermosillo
const ORIGIN = {
  name: "Qorthe",
  company: "Qorthe",
  email: "arhenarstudio@gmail.com",
  phone: "6623610742",
  street: "Blvd Rodriguez",
  number: "100",
  district: "Centro",
  city: "Hermosillo",
  state: "SO",
  country: "MX",
  postalCode: "83000",
};

// Carrier → Shipping Option ID mapping
const CARRIER_OPTION_MAP: Record<string, string> = {
  estafeta: "so_01KJG6RH6AGZJJEFY8ZVSJG1EW",
  dhl: "so_01KJG79VKX2C8MKZ8VFM83Z2ZH",
  fedex: "so_01KJGDJYAFG3XZWR7TZCYYB6DS",
};

type QuoteRequest = {
  postalCode: string;
  city?: string;
  state?: string;
  country?: string;
  weight?: number; // kg
  declaredValue?: number; // MXN
};

type CarrierQuote = {
  carrier: string;
  shippingOptionId: string;
  service: string;
  totalPrice: number; // MXN (pesos, not centavos)
  deliveryDays?: number;
  deliveryEstimate?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: QuoteRequest = await request.json();

    if (!body.postalCode || body.postalCode.length < 4) {
      return NextResponse.json(
        { error: "Código postal requerido" },
        { status: 400 }
      );
    }

    if (!ENVIA_API_KEY) {
      console.error("[Shipping Quote] ENVIA_API_KEY not configured");
      return NextResponse.json(
        { error: "Servicio de envíos no configurado" },
        { status: 500 }
      );
    }

    const stateCode = toStateCode(body.state || '');
    const destination = {
      name: "Cliente",
      phone: "0000000000",
      street: "N/A",
      number: "",
      city: body.city || "",
      state: stateCode,
      country: (body.country || "MX").toUpperCase(),
      postalCode: body.postalCode,
    };

    const pkg = {
      content: "Tabla artesanal de madera",
      amount: 1,
      type: "box",
      weight: body.weight || 3,
      weightUnit: "KG",
      lengthUnit: "CM",
      dimensions: { length: 50, width: 30, height: 10 },
      insurance: 0,
      declaredValue: body.declaredValue || 1000,
    };

    // Quote all 3 carriers in parallel
    const carriers = ["estafeta", "dhl", "fedex"];
    const quotePromises = carriers.map(async (carrier): Promise<CarrierQuote | null> => {
      try {
        const requestBody = {
          origin: ORIGIN,
          destination,
          packages: [pkg],
          shipment: { carrier, type: 1 },
        };

        logger.debug(`[Shipping Quote] Quoting ${carrier} to CP ${body.postalCode}, state=${stateCode} via ${ENVIA_BASE_URL} (key: ${ENVIA_API_KEY.slice(0, 8)}...)`);

        const resp = await fetch(`${ENVIA_BASE_URL}/ship/rate/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ENVIA_API_KEY}`,
          },
          body: JSON.stringify(requestBody),
        });

        const rawText = await resp.text();

        let data: any;
        try {
          data = JSON.parse(rawText);
        } catch {
          console.error(`[Shipping Quote] Non-JSON response for ${carrier} (${resp.status}):`, rawText.slice(0, 200));
          return null;
        }

        if (!resp.ok || !data.data || data.data.length === 0) {
          logger.warn(`[Shipping Quote] No rates for ${carrier} (${resp.status}):`, JSON.stringify(data).slice(0, 500));
          return null;
        }

        // Get cheapest service for this carrier
        // Envia API uses camelCase (totalPrice) not snake_case (total_price)
        const cheapest = data.data.reduce((min: any, rate: any) =>
          (rate.totalPrice || rate.total_price) < (min.totalPrice || min.total_price) ? rate : min
        );

        const price = cheapest.totalPrice || cheapest.total_price || 0;

        return {
          carrier,
          shippingOptionId: CARRIER_OPTION_MAP[carrier] || "",
          service: cheapest.service || carrier,
          totalPrice: price,
          deliveryDays: cheapest.deliveryDate?.dateDifference || cheapest.delivery_estimate?.days,
          deliveryEstimate: cheapest.deliveryEstimate || cheapest.delivery_estimate?.label || cheapest.deliveryDate?.date,
        };
      } catch (err: any) {
        logger.warn(`[Shipping Quote] Error quoting ${carrier}:`, err.message);
        return null;
      }
    });

    const results = await Promise.all(quotePromises);
    const quotes = results.filter((r): r is CarrierQuote => r !== null);

    return NextResponse.json({
      quotes,
      postalCode: body.postalCode,
      quotedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Shipping Quote] Unexpected error:", err.message);
    return NextResponse.json(
      { error: "Error al cotizar envío" },
      { status: 500 }
    );
  }
}
