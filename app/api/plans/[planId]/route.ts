import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";
import { updatePlanSchema } from "@/lib/validations/plan";

/**
 * GET /api/plans/[planId] - Get plan details
 */
export async function GET(
  request: Request,
  { params }: { params: { planId: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: plan } = await supabase
      .from("emergency_plans")
      .select("*")
      .eq("id", params.planId)
      .single();

    if (!plan) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify user has access to the organization
    const { data: membership } = await supabase
      .from("organization_members")
      .select("id")
      .eq("org_id", plan.org_id)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/plans/[planId] - Update plan
 */
export async function PATCH(
  request: Request,
  { params }: { params: { planId: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: plan } = await supabase
      .from("emergency_plans")
      .select("org_id")
      .eq("id", params.planId)
      .single();

    if (!plan) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify user has access to the organization
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("org_id", plan.org_id)
      .eq("user_id", user.id)
      .single();

    if (!membership || (membership.role !== "admin" && membership.role !== "editor")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = updatePlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    // Use service role for operations that might affect multiple plans
    const serviceSupabase = createServerClient();

    // If activating this plan, deactivate all other plans in the organization
    if (validation.data.status === "active") {
      console.log(
        `[/api/plans/${params.planId}] Activating plan - deactivating other plans in org ${plan.org_id}`
      );

      // Deactivate all other active plans in this organization
      const { error: deactivateError } = (await serviceSupabase
        .from("emergency_plans")
        .update({ status: "archived" } as any)
        .eq("org_id", plan.org_id)
        .eq("status", "active")
        .neq("id", params.planId)) as any;

      if (deactivateError) {
        console.error(
          `[/api/plans/${params.planId}] Error deactivating other plans:`,
          deactivateError
        );
        return NextResponse.json(
          {
            error: "Failed to deactivate existing active plans",
            details: deactivateError.message,
          },
          { status: 500 }
        );
      }
    }

    // Update the plan
    const updateData = {
      ...validation.data,
      activated_at: validation.data.status === "active" ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedPlan, error: updateError } = (await serviceSupabase
      .from("emergency_plans")
      .update(updateData as any)
      .eq("id", params.planId)
      .select()
      .single()) as any;

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      plan: updatedPlan,
      message:
        validation.data.status === "active"
          ? "Plan activated successfully. Other active plans have been archived."
          : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/plans/[planId] - Delete plan
 */
export async function DELETE(
  request: Request,
  { params }: { params: { planId: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: plan } = await supabase
      .from("emergency_plans")
      .select("org_id")
      .eq("id", params.planId)
      .single();

    if (!plan) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify user is admin
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("org_id", plan.org_id)
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from("emergency_plans")
      .delete()
      .eq("id", params.planId);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
