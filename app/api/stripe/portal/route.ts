import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { NextRequest, NextResponse } from "next/server";

// POST /api/stripe/portal - Create customer portal session
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { orgId } = body;

    if (!orgId) {
      return NextResponse.json(
        { error: "Org ID required" },
        { status: 400 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this org
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.role !== "admin") {
      return NextResponse.json(
        { error: "Only organization admins can manage billing" },
        { status: 403 }
      );
    }

    // Get org with Stripe customer ID
    const { data: org } = await supabase
      .from("organizations")
      .select("stripe_customer_id")
      .eq("id", orgId)
      .single();

    if (!org?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/${orgId}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[POST /api/stripe/portal] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
