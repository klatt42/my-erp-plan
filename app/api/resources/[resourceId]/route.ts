import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/resources/[resourceId] - Get a single resource
export async function GET(
  request: NextRequest,
  { params }: { params: { resourceId: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: resource, error } = await supabase
      .from("resources")
      .select("*")
      .eq("id", params.resourceId)
      .single();

    if (error || !resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json({ resource });
  } catch (error) {
    console.error("[GET /api/resources/[resourceId]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/resources/[resourceId] - Update a resource
export async function PUT(
  request: NextRequest,
  { params }: { params: { resourceId: string } }
) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { name, details_json } = body;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: resource, error } = await supabase
      .from("resources")
      .update({
        name,
        details_json,
      })
      .eq("id", params.resourceId)
      .select()
      .single();

    if (error) {
      console.error("[PUT /api/resources/[resourceId]] Error:", error);
      return NextResponse.json(
        { error: "Failed to update resource" },
        { status: 500 }
      );
    }

    return NextResponse.json({ resource });
  } catch (error) {
    console.error("[PUT /api/resources/[resourceId]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/resources/[resourceId] - Delete a resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: { resourceId: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("resources")
      .delete()
      .eq("id", params.resourceId);

    if (error) {
      console.error("[DELETE /api/resources/[resourceId]] Error:", error);
      return NextResponse.json(
        { error: "Failed to delete resource" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/resources/[resourceId]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
