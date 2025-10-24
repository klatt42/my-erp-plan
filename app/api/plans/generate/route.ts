/**
 * POST /api/plans/generate - Generate AI-powered Emergency Response Plan
 *
 * This endpoint:
 * 1. Accepts a facility profile from the onboarding questionnaire
 * 2. Calls the Anthropic Claude 4 API to generate a comprehensive ERP
 * 3. Saves the generated plan to the database
 * 4. Returns the plan ID for redirect
 */

import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";
import { generateERP } from "@/lib/anthropic/client";
import type { FacilityProfile } from "@/lib/anthropic/types";

export async function POST(request: Request) {
  console.log("[/api/plans/generate] POST request received");

  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("[/api/plans/generate] Unauthorized - no user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[/api/plans/generate] User authenticated: ${user.id}`);

    // Parse request body
    const body = await request.json();
    const { facilityProfile } = body as { facilityProfile: FacilityProfile };

    if (!facilityProfile) {
      return NextResponse.json(
        { error: "Missing facilityProfile in request body" },
        { status: 400 }
      );
    }

    console.log(`[/api/plans/generate] Generating ERP for: ${facilityProfile.name} (${facilityProfile.type})`);

    // Get user's organization (use first org for now, or from request)
    const { data: memberships, error: membershipError } = await supabase
      .from("organization_members")
      .select("org_id, organizations(name)")
      .eq("user_id", user.id)
      .limit(1);

    if (membershipError || !memberships || memberships.length === 0) {
      console.error("[/api/plans/generate] No organization found for user");
      return NextResponse.json(
        { error: "No organization found. Please create an organization first." },
        { status: 400 }
      );
    }

    const orgId = memberships[0].org_id;
    console.log(`[/api/plans/generate] Using organization: ${orgId}`);

    // Generate ERP using Claude 4
    console.log("[/api/plans/generate] Calling generateERP()...");
    const startTime = Date.now();

    const result = await generateERP(facilityProfile, {
      includeTemplates: true,
      includeChecklists: true,
    });

    const duration = Date.now() - startTime;
    console.log(`[/api/plans/generate] ERP generation completed in ${duration}ms`);

    if (!result.success) {
      console.error("[/api/plans/generate] ERP generation failed:", result.error);
      return NextResponse.json(
        {
          error: result.error?.message || "Failed to generate emergency plan",
          code: result.error?.code,
          retryable: result.error?.retryable,
        },
        { status: 500 }
      );
    }

    const generatedERP = result.data!;
    console.log(`[/api/plans/generate] ERP generated successfully. Tokens used: ${generatedERP.tokensUsed?.total || 'unknown'}`);

    // Use service role to bypass RLS for plan creation
    const serviceSupabase = createServerClient();

    // Create the emergency plan in the database
    const { data: plan, error: createError } = await serviceSupabase
      .from("emergency_plans")
      .insert({
        org_id: orgId,
        version: generatedERP.version,
        status: "draft",
        content_json: {
          generatedAt: generatedERP.generatedAt,
          facilityName: generatedERP.facilityName,
          facilityType: generatedERP.facilityType,
          executiveSummary: generatedERP.executiveSummary,
          sections: generatedERP.sections,
          tokensUsed: generatedERP.tokensUsed,
          facilityProfile: facilityProfile, // Store original input for reference
        },
        created_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error("[/api/plans/generate] Database insert error:", createError);
      return NextResponse.json(
        { error: "Failed to save emergency plan", details: createError.message },
        { status: 500 }
      );
    }

    console.log(`[/api/plans/generate] Plan saved to database: ${plan.id}`);

    // Return success with plan details
    return NextResponse.json(
      {
        success: true,
        plan: {
          id: plan.id,
          org_id: plan.org_id,
          version: plan.version,
          status: plan.status,
          created_at: plan.created_at,
        },
        tokensUsed: generatedERP.tokensUsed,
        message: "Emergency Response Plan generated successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[/api/plans/generate] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
