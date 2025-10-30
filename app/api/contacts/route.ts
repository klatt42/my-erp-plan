import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/contacts - List emergency contacts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: contacts, error } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("org_id", orgId)
      .order("priority");

    if (error) {
      console.error("[GET /api/contacts] Error:", error);
      return NextResponse.json(
        { error: "Failed to fetch contacts" },
        { status: 500 }
      );
    }

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("[GET /api/contacts] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Create a new emergency contact
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { orgId, name, role, phone, email, priority } = body;

    if (!orgId || !name || !role || !phone) {
      return NextResponse.json(
        { error: "Organization ID, name, role, and phone are required" },
        { status: 400 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: contact, error } = await supabase
      .from("emergency_contacts")
      .insert({
        org_id: orgId,
        name,
        role,
        phone,
        email,
        priority: priority || 5,
      })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/contacts] Error:", error);
      return NextResponse.json(
        { error: "Failed to create contact" },
        { status: 500 }
      );
    }

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/contacts] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
