import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { getTierByPriceId } from "@/lib/stripe/tiers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Disable body parsing for webhook
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.org_id;
        const subscriptionId = session.subscription as string;

        if (!orgId || !subscriptionId) {
          console.error("[Stripe Webhook] Missing metadata in checkout session");
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const tier = getTierByPriceId(priceId);

        if (!tier) {
          console.error("[Stripe Webhook] Unknown price ID:", priceId);
          break;
        }

        // Update organization
        await supabase
          .from("organizations")
          .update({
            stripe_subscription_id: subscriptionId,
            subscription_tier: tier,
            subscription_status: subscription.status,
          })
          .eq("id", orgId);

        console.log(`[Stripe Webhook] Subscription activated for org ${orgId}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find org by customer ID
        const { data: org } = await supabase
          .from("organizations")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!org) {
          console.error("[Stripe Webhook] Org not found for customer:", customerId);
          break;
        }

        const priceId = subscription.items.data[0].price.id;
        const tier = getTierByPriceId(priceId);

        if (!tier) {
          console.error("[Stripe Webhook] Unknown price ID:", priceId);
          break;
        }

        // Update subscription
        await supabase
          .from("organizations")
          .update({
            subscription_tier: tier,
            subscription_status: subscription.status,
          })
          .eq("id", org.id);

        console.log(`[Stripe Webhook] Subscription updated for org ${org.id}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find org by customer ID
        const { data: org } = await supabase
          .from("organizations")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!org) {
          console.error("[Stripe Webhook] Org not found for customer:", customerId);
          break;
        }

        // Downgrade to free tier
        await supabase
          .from("organizations")
          .update({
            subscription_tier: "free",
            subscription_status: "canceled",
            stripe_subscription_id: null,
          })
          .eq("id", org.id);

        console.log(`[Stripe Webhook] Subscription canceled for org ${org.id}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find org by customer ID
        const { data: org } = await supabase
          .from("organizations")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!org) {
          console.error("[Stripe Webhook] Org not found for customer:", customerId);
          break;
        }

        // Mark subscription as past_due
        await supabase
          .from("organizations")
          .update({
            subscription_status: "past_due",
          })
          .eq("id", org.id);

        console.log(`[Stripe Webhook] Payment failed for org ${org.id}`);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
