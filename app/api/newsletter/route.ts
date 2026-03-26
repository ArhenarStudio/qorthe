// ═══════════════════════════════════════════════════════════════
// POST /api/newsletter — Subscribe to newsletter
//
// Stores subscriber email via Resend Contacts API.
// Sends welcome email to subscriber.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID; // Create in Resend dashboard

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // 1. Add to Resend Audience (if configured)
    if (RESEND_API_KEY && AUDIENCE_ID) {
      try {
        const contactResp = await fetch(`https://api.resend.com/audiences/${AUDIENCE_ID}/contacts`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            unsubscribed: false,
          }),
        });

        if (!contactResp.ok) {
          const err = await contactResp.text();
          console.warn("[Newsletter] Resend contact error:", err);
          // Don't fail — still send welcome email
        }
      } catch (err) {
        console.warn("[Newsletter] Resend audience error:", err);
      }
    }

    // 2. Send welcome email
    if (RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Qorthe <hola@qorthe.com>",
            to: email,
            subject: "¡Bienvenido a Qorthe! 🌿",
            html: `
              <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="color: #2d2419; font-size: 28px; margin-bottom: 16px;">
                  ¡Gracias por suscribirte!
                </h1>
                <p style="color: #5c4f3d; font-size: 16px; line-height: 1.6;">
                  Ahora serás de los primeros en enterarte de nuestros nuevos diseños,
                  ofertas exclusivas y novedades del mundo de la madera artesanal.
                </p>
                <p style="color: #5c4f3d; font-size: 16px; line-height: 1.6;">
                  Cada pieza que creamos es única, hecha a mano con maderas selectas
                  y grabado láser personalizado.
                </p>
                <div style="margin-top: 30px;">
                  <a href="https://qorthe.com/shop" 
                     style="background-color: #2d2419; color: white; padding: 12px 30px; 
                            text-decoration: none; border-radius: 8px; font-size: 14px;">
                    Explorar colección
                  </a>
                </div>
                <p style="color: #9a8c7a; font-size: 12px; margin-top: 40px;">
                  Qorthe — Muebles artesanales de madera hechos en México
                </p>
              </div>
            `,
          }),
        });
      } catch (err) {
        console.warn("[Newsletter] Welcome email error:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Newsletter]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
