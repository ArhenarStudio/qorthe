// ═══════════════════════════════════════════════════════════════
// POST /api/contact — Send support ticket via Resend
// Sends email to admin (pedidos@davidsonsdesign.com) with ticket details
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { logger } from '@/src/lib/logger';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "hola@davidsonsdesign.com";
const ADMIN_EMAIL = "pedidos@davidsonsdesign.com";

export async function POST(req: NextRequest) {
  try {
    const { subject, category, message, email, name } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: "subject and message required" }, { status: 400 });
    }

    if (!RESEND_API_KEY) {
      logger.warn("[Contact] RESEND_API_KEY not set, logging only");
      logger.debug(`[Contact] Ticket: ${subject} | ${category} | From: ${email || 'anon'}`);
      return NextResponse.json({ success: true, _note: "logged_only" });
    }

    const htmlBody = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d2419; font-family: 'Playfair Display', serif;">Nuevo Ticket de Soporte</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #888; font-size: 12px;">Asunto</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 600;">${subject}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #888; font-size: 12px;">Categoría</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${category || 'General'}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #888; font-size: 12px;">Cliente</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${name || 'N/A'} (${email || 'sin email'})</td></tr>
        </table>
        <div style="background: #f9f7f4; padding: 16px; border-radius: 8px; margin-top: 16px;">
          <p style="font-size: 12px; color: #888; margin: 0 0 8px;">Mensaje:</p>
          <p style="font-size: 14px; color: #2d2419; white-space: pre-wrap; margin: 0;">${message}</p>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `DavidSon's Design <${FROM_EMAIL}>`,
        to: [ADMIN_EMAIL],
        reply_to: email || undefined,
        subject: `[Soporte] ${subject}`,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[Contact] Resend error:", err);
      return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }

    const data = await res.json();
    logger.debug(`[Contact] Ticket sent: ${data.id} — ${subject}`);

    return NextResponse.json({ success: true, email_id: data.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Contact]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
