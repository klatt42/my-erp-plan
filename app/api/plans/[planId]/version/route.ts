import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/plans/[planId]/version - Create a new version of a plan
export async function POST(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the existing plan
    const { data: existingPlan, error: fetchError } = await supabase
      .from("emergency_plans")
      .select("*")
      .eq("id", params.planId)
      .single();

    if (fetchError || !existingPlan) {
      console.error("[POST /api/plans/[planId]/version] Plan not found:", fetchError);
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Verify user has access to this plan's organization
    const { data: membership, error: membershipError } = await supabase
      .from("organization_members")
      .select("org_id, role")
      .eq("user_id", user.id)
      .eq("org_id", existingPlan.org_id)
      .single();

    if (membershipError || !membership) {
      console.error(
        "[POST /api/plans/[planId]/version] User does not have access to organization"
      );
      return NextResponse.json(
        { error: "You do not have access to this organization" },
        { status: 403 }
      );
    }

    // Check if user has permission to create versions (admin or editor)
    if (membership.role === "viewer") {
      return NextResponse.json(
        { error: "You do not have permission to create plan versions" },
        { status: 403 }
      );
    }

    // Calculate new version number
    const currentVersion = existingPlan.version;
    let newVersionNumber: string;

    // Parse version (assuming format like "1.0" or "2.3")
    const versionMatch = currentVersion.match(/^(\d+)\.(\d+)$/);
    if (versionMatch) {
      const major = parseInt(versionMatch[1]);
      const minor = parseInt(versionMatch[2]);
      newVersionNumber = `${major}.${minor + 1}`;
    } else {
      // If version format doesn't match, just append
      newVersionNumber = `${currentVersion}.1`;
    }

    // Archive the old active plan if this plan is active
    if (existingPlan.status === "active") {
      await supabase
        .from("emergency_plans")
        .update({ status: "archived" })
        .eq("id", params.planId);
    }

    // Create new plan version
    const { data: newPlan, error: createError } = await supabase
      .from("emergency_plans")
      .insert({
        org_id: existingPlan.org_id,
        version: newVersionNumber,
        status: "draft",
        content_json: existingPlan.content_json,
        created_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error("[POST /api/plans/[planId]/version] Create error:", createError);
      return NextResponse.json(
        { error: "Failed to create new version" },
        { status: 500 }
      );
    }

    console.log(
      `[POST /api/plans/[planId]/version] New version created: ${newPlan.id} (v${newVersionNumber})`
    );

    return NextResponse.json({ plan: newPlan });
  } catch (error) {
    console.error("[POST /api/plans/[planId]/version] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
