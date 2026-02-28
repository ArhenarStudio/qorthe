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

const ENVIA_API_KEY = process.env.ENVIA_API_KEY || "";
const ENVIA_BASE_URL = process.env.ENVIA_BASE_URL || "https://api-test.envia.com";

// Origin: DavidSon's Design workshop in Hermosillo
const ORIGIN = {
  name: "DavidSon's Design",
  company: "DavidSon's Design",
  email: "designdavidsons@gmail.com",
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

    const destination = {
      name: "Cliente",
      phone: "0000000000",
      street: "N/A",
      number: "",
      city: body.city || "",
      state: body.state || "",
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

        console.log(`[Shipping Quote] Quoting ${carrier} to CP ${body.postalCode}`);

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
          console.warn(`[Shipping Quote] No rates for ${carrier} (${resp.status}):`, data.meta || data.error || data.message);
          return null;
        }

        // Get cheapest service for this carrier
        const cheapest = data.data.reduce((min: any, rate: any) =>
          rate.total_price < min.total_price ? rate : min
        );

        return {
          carrier,
          shippingOptionId: CARRIER_OPTION_MAP[carrier] || "",
          service: cheapest.service || carrier,
          totalPrice: cheapest.total_price,
          deliveryDays: cheapest.delivery_estimate?.days,
          deliveryEstimate: cheapest.delivery_estimate?.label || cheapest.delivery_estimate?.date,
        };
      } catch (err: any) {
        console.warn(`[Shipping Quote] Error quoting ${carrier}:`, err.message);
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
