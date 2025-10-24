import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createOrganizationSchema } from "@/lib/validations/org";
import { slugify } from "@/lib/utils";

/**
 * GET /api/orgs - List organizations for the current user
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: members } = await supabase
      .from("organization_members")
      .select("org_id, organizations(*)")
      .eq("user_id", user.id);

    const organizations = members?.map((m: any) => m.organizations) || [];

    return NextResponse.json({ organizations });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orgs - Create a new organization
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
    const validation = createOrganizationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const data = validation.data;
    const slug = slugify(data.name);

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: data.name,
        slug,
        tier: "free",
        settings: {
          industry: data.industry,
          size: data.size,
          location: data.location,
        },
      })
      .select()
      .single();

    if (orgError) {
      return NextResponse.json(
        { error: orgError.message },
        { status: 400 }
      );
    }

    // Add user as admin
    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({
        org_id: org.id,
        user_id: user.id,
        role: "admin",
      });

    if (memberError) {
      return NextResponse.json(
        { error: memberError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
