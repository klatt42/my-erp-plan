"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, CreditCard, AlertCircle } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { SUBSCRIPTION_TIERS, SubscriptionTier } from "@/lib/stripe/tiers";

interface Organization {
  id: string;
  name: string;
  subscription_tier: SubscriptionTier;
  subscription_status: string | null;
  stripe_subscription_id: string | null;
}

export default function BillingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = params.orgId as string;

  const [org, setOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    loadOrganization();

    // Check for success/canceled parameters
    if (searchParams.get("success") === "true") {
      toast.success("Subscription activated successfully!");
      router.replace(`/${orgId}/billing`);
    } else if (searchParams.get("canceled") === "true") {
      toast.error("Checkout canceled");
      router.replace(`/${orgId}/billing`);
    }
  }, []);

  const loadOrganization = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/organizations/${orgId}`);
      if (response.ok) {
        const data = await response.json();
        setOrg(data.organization);
      }
    } catch (error) {
      console.error("Error loading organization:", error);
      toast.error("Failed to load organization");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (tier: SubscriptionTier) => {
    const tierData = SUBSCRIPTION_TIERS[tier];
    if (!tierData.priceId) {
      toast.error("Price ID not configured");
      return;
    }

    try {
      setCheckoutLoading(tier);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: tierData.priceId,
          orgId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      toast.error("Error creating checkout session");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to open billing portal");
      }
    } catch (error) {
      toast.error("Error opening billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Organization not found</p>
      </div>
    );
  }

  const currentTier = org.subscription_tier || "free";
  const hasActiveSubscription = org.stripe_subscription_id && org.subscription_status === "active";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Manage your subscription and billing settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold">
                  {SUBSCRIPTION_TIERS[currentTier].name}
                </h3>
                <Badge variant={hasActiveSubscription ? "default" : "secondary"}>
                  {org.subscription_status || "free"}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                ${SUBSCRIPTION_TIERS[currentTier].price}/month
              </p>
            </div>
            {hasActiveSubscription && (
              <Button
                onClick={handleManageSubscription}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Subscription
                  </>
                )}
              </Button>
            )}
          </div>

          {org.subscription_status === "past_due" && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Payment Required</p>
                <p className="text-sm text-muted-foreground">
                  Your subscription payment failed. Please update your payment method.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(Object.keys(SUBSCRIPTION_TIERS) as SubscriptionTier[]).map((tier) => {
          const tierData = SUBSCRIPTION_TIERS[tier];
          const isCurrent = currentTier === tier;
          const isUpgrade = tierData.price > SUBSCRIPTION_TIERS[currentTier].price;

          return (
            <Card
              key={tier}
              className={isCurrent ? "border-primary shadow-md" : ""}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>{tierData.name}</CardTitle>
                  {isCurrent && (
                    <Badge variant="default">Current</Badge>
                  )}
                </div>
                <div className="text-3xl font-bold">
                  ${tierData.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tierData.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier !== "free" && !isCurrent && (
                  <Button
                    className="w-full"
                    onClick={() => handleSubscribe(tier)}
                    disabled={checkoutLoading !== null}
                    variant={isUpgrade ? "default" : "outline"}
                  >
                    {checkoutLoading === tier ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>{isUpgrade ? "Upgrade" : "Subscribe"}</>
                    )}
                  </Button>
                )}

                {isCurrent && tier !== "free" && (
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled
                  >
                    Current Plan
                  </Button>
                )}

                {tier === "free" && !isCurrent && (
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled
                  >
                    Downgrade via Portal
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Usage Information */}
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
          <CardDescription>
            Current usage for your {SUBSCRIPTION_TIERS[currentTier].name} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Emergency Plans</p>
              <p className="text-2xl font-bold">
                {SUBSCRIPTION_TIERS[currentTier].limits.maxPlans === -1
                  ? "Unlimited"
                  : `Up to ${SUBSCRIPTION_TIERS[currentTier].limits.maxPlans}`}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Team Members</p>
              <p className="text-2xl font-bold">
                {SUBSCRIPTION_TIERS[currentTier].limits.maxUsers === -1
                  ? "Unlimited"
                  : `Up to ${SUBSCRIPTION_TIERS[currentTier].limits.maxUsers}`}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Resources</p>
              <p className="text-2xl font-bold">
                {SUBSCRIPTION_TIERS[currentTier].limits.maxResources === -1
                  ? "Unlimited"
                  : `Up to ${SUBSCRIPTION_TIERS[currentTier].limits.maxResources}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
