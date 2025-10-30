import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/incidents - List incidents
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    const status = searchParams.get("status"); // active, monitoring, resolved

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID required" }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let query = supabase
      .from("incidents")
      .select("*, emergency_plans(version, content_json)")
      .eq("org_id", orgId)
      .order("activated_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: incidents, error } = await query;

    if (error) {
      console.error("[GET /api/incidents] Error:", error);
      return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 });
    }

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error("[GET /api/incidents] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/incidents - Create (activate) incident
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { orgId, planId } = body;

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID required" }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has editor/admin access
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.role === "viewer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: incident, error } = await supabase
      .from("incidents")
      .insert({
        org_id: orgId,
        plan_id: planId,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/incidents] Error:", error);
      return NextResponse.json({ error: "Failed to create incident" }, { status: 500 });
    }

    return NextResponse.json({ incident }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/incidents] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
