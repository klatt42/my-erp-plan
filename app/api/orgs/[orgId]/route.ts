import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { updateOrganizationSchema } from "@/lib/validations/org";

/**
 * GET /api/orgs/[orgId] - Get organization details
 */
export async function GET(
  request: Request,
  { params }: { params: { orgId: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this organization
    const { data: membership } = await supabase
      .from("organization_members")
      .select("id")
      .eq("org_id", params.orgId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: organization } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", params.orgId)
      .single();

    return NextResponse.json({ organization });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orgs/[orgId] - Update organization
 */
export async function PATCH(
  request: Request,
  { params }: { params: { orgId: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is admin
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("org_id", params.orgId)
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateOrganizationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const { data: organization, error: updateError } = await supabase
      .from("organizations")
      .update(validation.data)
      .eq("id", params.orgId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ organization });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orgs/[orgId] - Delete organization
 */
export async function DELETE(
  request: Request,
  { params }: { params: { orgId: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is admin
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("org_id", params.orgId)
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from("organizations")
      .delete()
      .eq("id", params.orgId);

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
