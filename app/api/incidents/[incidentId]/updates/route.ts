import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/incidents/[incidentId]/updates - List updates for an incident
export async function GET(
  request: NextRequest,
  { params }: { params: { incidentId: string } }
) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: updates, error } = await supabase
      .from("incident_updates")
      .select("*")
      .eq("incident_id", params.incidentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/incidents/updates] Error:", error);
      return NextResponse.json({ error: "Failed to fetch updates" }, { status: 500 });
    }

    return NextResponse.json({ updates });
  } catch (error) {
    console.error("[GET /api/incidents/updates] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/incidents/[incidentId]/updates - Add update to incident
export async function POST(
  request: NextRequest,
  { params }: { params: { incidentId: string } }
) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { update_type, content, photo_url } = body;

    if (!update_type || !content) {
      return NextResponse.json({ error: "Type and content required" }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: update, error } = await supabase
      .from("incident_updates")
      .insert({
        incident_id: params.incidentId,
        user_id: user.id,
        update_type,
        content,
        photo_url,
      })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/incidents/updates] Error:", error);
      return NextResponse.json({ error: "Failed to create update" }, { status: 500 });
    }

    return NextResponse.json({ update }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/incidents/updates] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
