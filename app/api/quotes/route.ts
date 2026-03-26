// /api/quotes — Public API for customers to submit quotation requests
// Creates quote in Supabase + sends confirmation email + notifies admin
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "arhenarstudio@gmail.com";
const STORE_URL = "https://qorthe.com";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── Email helpers ───────────────────────────────────────

function formatMXN(amount: number): string {
  return `$${amount.toLocaleString("es-MX")}`;
}

async function sendResendEmail(to: string, subject: string, html: string, from?: string) {
  if (!RESEND_API_KEY) {
    console.warn("[quotes] RESEND_API_KEY not set, skipping email to:", to);
    return;
  }
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: from || "Qorthe <pedidos@qorthe.com>",
        to: [to],
        subject,
        html,
      }),
    });
  } catch (err) {
    console.error("[quotes] Email send error:", err);
  }
}

interface QuotePiece {
  type: string;
  category: string;
  material: string;
  dimensions?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  engraving?: { type: string; complexity: string; zones: string[] };
  textile?: { technique: string; color: string; printZone: string };
  notes?: string;
}

function buildCustomerEmail(name: string, number: string, pieces: QuotePiece[], total: number, validUntil: string): string {
  const piecesHtml = pieces.map((p, i) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;font-size:14px;">${i + 1}. ${p.type}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;font-size:14px;">${p.material}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;font-size:14px;text-align:center;">${p.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e8dfd0;font-size:14px;text-align:right;">${formatMXN(p.lineTotal)}</td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#faf6f0;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf6f0;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <!-- Header -->
  <tr><td style="background:#1a1208;padding:32px;text-align:center;">
    <img src="https://www.qorthe.com/images/logo-dsd.png" width="100" alt="Qorthe" style="display:block;margin:0 auto;"/>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:32px;">
    <h1 style="font-family:Georgia,serif;font-size:24px;color:#1a1208;margin:0 0 8px;">¡Cotización Recibida!</h1>
    <p style="color:#7a6340;font-size:15px;margin:0 0 24px;">
      Hola <strong>${name}</strong>, hemos recibido tu solicitud de cotización <strong style="color:#c5a065;">${number}</strong>.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8dfd0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#f5f0e8;">
        <th style="padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7a6340;">Pieza</th>
        <th style="padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7a6340;">Material</th>
        <th style="padding:10px 12px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7a6340;">Cant.</th>
        <th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7a6340;">Subtotal</th>
      </tr>
      ${piecesHtml}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="font-size:18px;font-family:Georgia,serif;color:#1a1208;font-weight:bold;">Total Estimado</td>
        <td style="font-size:24px;font-family:Georgia,serif;color:#c5a065;font-weight:bold;text-align:right;">${formatMXN(total)} MXN</td>
      </tr>
    </table>
    <p style="font-size:13px;color:#9e8562;margin:0 0 24px;">
      Vigencia: hasta <strong>${new Date(validUntil).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}</strong>
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <a href="${STORE_URL}/account" style="display:inline-block;background:#1a1208;color:#faf6f0;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:bold;text-decoration:none;text-transform:uppercase;letter-spacing:1px;">
        Ver Mi Cotización
      </a>
    </td></tr></table>
    <p style="font-size:13px;color:#9e8562;margin:24px 0 0;text-align:center;">
      Te contactaremos pronto con los detalles finales. Si tienes preguntas, responde a este email.
    </p>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f5f0e8;padding:20px 32px;text-align:center;">
    <p style="font-size:12px;color:#9e8562;margin:0;">Qorthe — Madera con Alma</p>
    <p style="font-size:11px;color:#9e8562;margin:4px 0 0;">
      <a href="${STORE_URL}" style="color:#c5a065;">qorthe.com</a>
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function buildAdminEmail(name: string, email: string, phone: string, number: string, pieces: QuotePiece[], total: number): string {
  const piecesText = pieces.map((p, i) =>
    `<li style="margin-bottom:8px;font-size:14px;color:#1a1208;">
      <strong>${p.type}</strong> (${p.material}) — x${p.quantity} — ${formatMXN(p.lineTotal)}
      ${p.engraving ? `<br/><span style="color:#c5a065;">✂ Grabado ${p.engraving.complexity}: ${p.engraving.type}</span>` : ""}
      ${p.textile ? `<br/><span style="color:#7a6340;">🎨 ${p.textile.technique} — ${p.textile.color}</span>` : ""}
    </li>`
  ).join("");

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
  <tr><td>
    <h2 style="font-family:Georgia,serif;color:#1a1208;margin:0 0 4px;">Nueva Cotización ${number}</h2>
    <p style="color:#c5a065;font-size:20px;font-weight:bold;margin:0 0 16px;">${formatMXN(total)} MXN</p>
    <table style="margin-bottom:16px;font-size:14px;" cellpadding="4">
      <tr><td style="color:#7a6340;">Cliente:</td><td><strong>${name}</strong></td></tr>
      <tr><td style="color:#7a6340;">Email:</td><td><a href="mailto:${email}" style="color:#c5a065;">${email}</a></td></tr>
      <tr><td style="color:#7a6340;">Teléfono:</td><td><a href="tel:${phone}" style="color:#c5a065;">${phone}</a></td></tr>
    </table>
    <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#7a6340;margin:16px 0 8px;">Piezas</h3>
    <ol style="padding-left:20px;margin:0 0 16px;">${piecesText}</ol>
    <a href="${STORE_URL}/admin/quotes" style="display:inline-block;background:#c5a065;color:#1a1208;padding:10px 24px;border-radius:6px;font-size:13px;font-weight:bold;text-decoration:none;">
      Ver en Admin →
    </a>
  </td></tr>
</table>
</body></html>`;
}

// ── GET: Fetch user's quotes ────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("quotes")
      .select("id, number, status, project_name, pieces, subtotal, total, timeline, valid_until, created_at")
      .eq("customer_email", email)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ quotes: data || [] });
  } catch (err: unknown) {
    console.error("[api/quotes] GET error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 }
    );
  }
}

// ── POST: Create new quote ──────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabase();

    if (!body.customer_email || !body.customer_name || !body.customer_phone) {
      return NextResponse.json(
        { error: "Nombre, email y teléfono son obligatorios" },
        { status: 400 }
      );
    }

    if (!body.pieces || body.pieces.length === 0) {
      return NextResponse.json(
        { error: "Debe incluir al menos una pieza" },
        { status: 400 }
      );
    }

    // Generate quote number
    let num: number;
    try {
      const { data: seqData } = await supabase
        .rpc("nextval", { seq_name: "quote_number_seq" })
        .single();
      num = (typeof seqData === "number" ? seqData : null) || Math.floor(Math.random() * 9000 + 1000);
    } catch {
      num = Math.floor(Math.random() * 9000 + 1000);
    }

    const number = `COT-${new Date().getFullYear()}-${String(num).padStart(3, "0")}`;
    const validityDays = 15;
    const validUntil = new Date(Date.now() + validityDays * 86400000).toISOString();

    const { data, error } = await supabase
      .from("quotes")
      .insert({
        number,
        status: "nueva",
        customer_email: body.customer_email,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_tier: body.customer_tier || null,
        project_name:
          body.project_name ||
          `${body.pieces[0]?.type || "Cotización"}${body.pieces.length > 1 ? ` + ${body.pieces.length - 1} más` : ""}`,
        pieces: body.pieces,
        timeline: body.timeline || "4-6 semanas",
        validity_days: validityDays,
        valid_until: validUntil,
        deposit_percent: 50,
        conditions: [
          { text: "Anticipo 50% para iniciar producción", checked: true },
          { text: "Saldo 50% al completar antes de envío", checked: true },
          { text: "Fotos de avance durante la producción", checked: true },
        ],
        messages: body.notes
          ? [{ from: "customer", name: body.customer_name, text: body.notes, date: new Date().toISOString() }]
          : [],
        internal_notes: [],
        subtotal: body.subtotal || 0,
        total: body.total || 0,
        cost_estimate: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("[api/quotes] Supabase insert error:", error);
      throw error;
    }

    // ── Send emails (non-blocking) ──────────────────────
    const pieces = body.pieces as QuotePiece[];
    const total = body.total || 0;

    // 1. Confirmation to customer
    sendResendEmail(
      body.customer_email,
      `Cotización ${number} — Qorthe`,
      buildCustomerEmail(body.customer_name, number, pieces, total, validUntil),
      "Qorthe <qorthedesign@gmail.com>"
    ).catch(() => {});

    // 2. Notification to admin
    sendResendEmail(
      ADMIN_EMAIL,
      `Nueva cotización ${number} — ${formatMXN(total)} — ${body.customer_name}`,
      buildAdminEmail(body.customer_name, body.customer_email, body.customer_phone, number, pieces, total)
    ).catch(() => {});

    return NextResponse.json({
      success: true,
      quote: {
        id: data.id,
        number: data.number,
        status: data.status,
      },
    });
  } catch (err: unknown) {
    console.error("[api/quotes] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
