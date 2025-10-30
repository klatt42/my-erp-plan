import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/resources - List resources for an organization
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    const type = searchParams.get("type"); // personnel, equipment, facility, contact

    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this organization
    const { data: membership, error: membershipError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build query
    let query = supabase
      .from("resources")
      .select("*")
      .eq("org_id", orgId)
      .order("name");

    // Filter by type if provided
    if (type) {
      query = query.eq("resource_type", type);
    }

    const { data: resources, error: resourcesError } = await query;

    if (resourcesError) {
      console.error("[GET /api/resources] Error:", resourcesError);
      return NextResponse.json(
        { error: "Failed to fetch resources" },
        { status: 500 }
      );
    }

    return NextResponse.json({ resources });
  } catch (error) {
    console.error("[GET /api/resources] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/resources - Create a new resource
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { orgId, resource_type, name, details_json } = body;

    if (!orgId || !resource_type || !name) {
      return NextResponse.json(
        { error: "Organization ID, resource type, and name are required" },
        { status: 400 }
      );
    }

    // Validate resource_type
    const validTypes = ["personnel", "equipment", "facility", "contact"];
    if (!validTypes.includes(resource_type)) {
      return NextResponse.json(
        { error: "Invalid resource type" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has editor or admin access
    const { data: membership, error: membershipError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (membership.role === "viewer") {
      return NextResponse.json(
        { error: "You do not have permission to create resources" },
        { status: 403 }
      );
    }

    // Create resource
    const { data: resource, error: createError } = await supabase
      .from("resources")
      .insert({
        org_id: orgId,
        resource_type,
        name,
        details_json: details_json || {},
      })
      .select()
      .single();

    if (createError) {
      console.error("[POST /api/resources] Error:", createError);
      return NextResponse.json(
        { error: "Failed to create resource" },
        { status: 500 }
      );
    }

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/resources] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
