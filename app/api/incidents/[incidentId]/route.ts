import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/incidents/[incidentId] - Update incident status
export async function PUT(
  request: NextRequest,
  { params }: { params: { incidentId: string } }
) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status required" }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updateData: any = { status };
    if (status === "resolved") {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data: incident, error } = await supabase
      .from("incidents")
      .update(updateData)
      .eq("id", params.incidentId)
      .select()
      .single();

    if (error) {
      console.error("[PUT /api/incidents] Error:", error);
      return NextResponse.json({ error: "Failed to update incident" }, { status: 500 });
    }

    return NextResponse.json({ incident });
  } catch (error) {
    console.error("[PUT /api/incidents] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
