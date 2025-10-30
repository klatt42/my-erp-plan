import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { NextRequest, NextResponse } from "next/server";

// POST /api/stripe/checkout - Create checkout session
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { priceId, orgId } = body;

    if (!priceId || !orgId) {
      return NextResponse.json(
        { error: "Price ID and Org ID required" },
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

    // Get or create Stripe customer
    const { data: org } = await supabase
      .from("organizations")
      .select("stripe_customer_id, name")
      .eq("id", orgId)
      .single();

    let customerId = org?.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          org_id: orgId,
          user_id: user.id,
        },
      });

      customerId = customer.id;

      // Update org with customer ID
      await supabase
        .from("organizations")
        .update({ stripe_customer_id: customerId })
        .eq("id", orgId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${orgId}/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${orgId}/billing?canceled=true`,
      metadata: {
        org_id: orgId,
        user_id: user.id,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("[POST /api/stripe/checkout] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
