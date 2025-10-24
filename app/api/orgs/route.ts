import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
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
    // Use regular client for auth check
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

    // Use service role client to bypass RLS for org creation
    // This is necessary because RLS policies can't check organization_members
    // before the org exists
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify we have a user ID
    if (!user.id) {
      console.error("No user ID available");
      return NextResponse.json(
        { error: "User authentication failed" },
        { status: 401 }
      );
    }

    console.log("Creating org for user:", user.id);

    // Create organization with service role
    const { data: org, error: orgError } = await supabaseAdmin
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
      console.error("Organization creation error:", orgError);
      return NextResponse.json(
        { error: orgError.message },
        { status: 400 }
      );
    }

    console.log("Organization created:", org.id);

    // Add creator as admin (service role bypasses RLS)
    // Explicitly pass user.id from the authenticated session
    const { error: memberError } = await supabaseAdmin
      .from("organization_members")
      .insert({
        org_id: org.id,
        user_id: user.id, // Use the authenticated user's ID
        role: "admin",
        invited_by: user.id,
      });

    if (memberError) {
      console.error("Member creation error:", memberError);
      console.error("Attempted to insert:", {
        org_id: org.id,
        user_id: user.id,
        role: "admin",
      });
      // If member creation fails, clean up the org
      await supabaseAdmin.from("organizations").delete().eq("id", org.id);
      return NextResponse.json(
        { error: "Failed to set up organization membership: " + memberError.message },
        { status: 500 }
      );
    }

    console.log("Member added successfully");

    // Organization created successfully!
    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
