// ═══════════════════════════════════════════════════════════════
// /api/account/addresses — CRUD Customer Addresses via Medusa
//
// GET    — List addresses (from medusaCustomer via auth-sync)
// POST   — Add new address
// PUT    — Update address (address_id in body)
// DELETE — Delete address (address_id in query)
//
// Auth: Supabase token → email → Medusa customer_id → addresses
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { medusaAdminFetch } from "../../admin/_helpers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper: verify Supabase token and get customer_id from Medusa
async function getCustomerId(req: NextRequest): Promise<{ customerId: string; email: string } | NextResponse> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const supaResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
  });

  if (!supaResp.ok) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const supaUser = await supaResp.json();
  const email = supaUser.email;
  if (!email) {
    return NextResponse.json({ error: "No email" }, { status: 400 });
  }

  // Find Medusa customer by email
  const custResp = await medusaAdminFetch(`/admin/customers?q=${encodeURIComponent(email)}&limit=1`);
  if (!custResp.ok) {
    return NextResponse.json({ error: "Failed to find customer" }, { status: 500 });
  }

  const custData = await custResp.json();
  const customer = (custData.customers || []).find((c: any) => c.email === email);
  if (!customer) {
    return NextResponse.json({ error: "Customer not found in Medusa" }, { status: 404 });
  }

  return { customerId: customer.id, email };
}

// GET: List addresses
export async function GET(req: NextRequest) {
  try {
    const auth = await getCustomerId(req);
    if (auth instanceof NextResponse) return auth;

    const resp = await medusaAdminFetch(`/admin/customers/${auth.customerId}`);
    if (!resp.ok) {
      return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
    }

    const data = await resp.json();
    const addresses = (data.customer?.addresses || []).map((a: any) => ({
      id: a.id,
      first_name: a.first_name || "",
      last_name: a.last_name || "",
      address_1: a.address_1 || "",
      address_2: a.address_2 || "",
      city: a.city || "",
      province: a.province || "",
      postal_code: a.postal_code || "",
      country_code: a.country_code || "mx",
      phone: a.phone || "",
      company: a.company || "",
      is_default_shipping: a.is_default_shipping || false,
      metadata: a.metadata || {},
    }));

    return NextResponse.json({ addresses });
  } catch (error: any) {
    console.error("[Addresses GET]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Add address
export async function POST(req: NextRequest) {
  try {
    const auth = await getCustomerId(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { first_name, last_name, address_1, address_2, city, province, postal_code, phone, company, metadata } = body;

    const resp = await medusaAdminFetch(`/admin/customers/${auth.customerId}/addresses`, {
      method: "POST",
      body: JSON.stringify({
        address: {
          first_name: first_name || "",
          last_name: last_name || "",
          address_1: address_1 || "",
          address_2: address_2 || "",
          city: city || "",
          province: province || "",
          postal_code: postal_code || "",
          country_code: "mx",
          phone: phone || "",
          company: company || "",
          metadata: metadata || {},
        },
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error("[Addresses POST]", resp.status, err);
      return NextResponse.json({ error: "Failed to add address" }, { status: 500 });
    }

    const data = await resp.json();
    return NextResponse.json({ success: true, customer: data.customer });
  } catch (error: any) {
    console.error("[Addresses POST]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update address
export async function PUT(req: NextRequest) {
  try {
    const auth = await getCustomerId(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { address_id, ...addressData } = body;

    if (!address_id) {
      return NextResponse.json({ error: "address_id required" }, { status: 400 });
    }

    const resp = await medusaAdminFetch(`/admin/customers/${auth.customerId}/addresses/${address_id}`, {
      method: "POST", // Medusa uses POST for updates on addresses
      body: JSON.stringify({
        address: {
          first_name: addressData.first_name || "",
          last_name: addressData.last_name || "",
          address_1: addressData.address_1 || "",
          address_2: addressData.address_2 || "",
          city: addressData.city || "",
          province: addressData.province || "",
          postal_code: addressData.postal_code || "",
          country_code: "mx",
          phone: addressData.phone || "",
          company: addressData.company || "",
          metadata: addressData.metadata || {},
        },
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error("[Addresses PUT]", resp.status, err);
      return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
    }

    const data = await resp.json();
    return NextResponse.json({ success: true, customer: data.customer });
  } catch (error: any) {
    console.error("[Addresses PUT]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove address
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getCustomerId(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get("id");
    if (!addressId) {
      return NextResponse.json({ error: "id query param required" }, { status: 400 });
    }

    const resp = await medusaAdminFetch(`/admin/customers/${auth.customerId}/addresses/${addressId}`, {
      method: "DELETE",
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error("[Addresses DELETE]", resp.status, err);
      return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Addresses DELETE]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
