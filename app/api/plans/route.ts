import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createPlanSchema } from "@/lib/validations/plan";
import { generatePlanContent } from "@/lib/anthropic/client";

/**
 * POST /api/plans - Create a new emergency plan
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createPlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify user has access to the organization
    const { data: membership } = await supabase
      .from("organization_members")
      .select("org_id")
      .eq("org_id", body.org_id)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate plan content with Claude
    const generatedContent = await generatePlanContent(data.prompt);

    // Create the plan
    const { data: plan, error: createError } = await supabase
      .from("emergency_plans")
      .insert({
        org_id: body.org_id,
        version: data.version,
        status: "draft",
        content_json: { generated_content: generatedContent },
        created_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
