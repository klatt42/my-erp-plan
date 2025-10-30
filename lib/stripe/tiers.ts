export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    features: [
      "1 Emergency Plan",
      "Basic plan templates",
      "Up to 3 team members",
      "Email support",
    ],
    limits: {
      maxPlans: 1,
      maxUsers: 3,
      maxResources: 10,
      aiAssistEnabled: false,
      emergencyModeEnabled: false,
    },
  },
  essential: {
    name: "Essential",
    price: 79,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ESSENTIAL_PRICE_ID,
    features: [
      "Up to 5 Emergency Plans",
      "All plan templates",
      "Up to 10 team members",
      "Priority email support",
      "AI-powered plan generation",
      "Emergency mode activation",
      "Resource management",
    ],
    limits: {
      maxPlans: 5,
      maxUsers: 10,
      maxResources: 50,
      aiAssistEnabled: true,
      emergencyModeEnabled: true,
    },
  },
  professional: {
    name: "Professional",
    price: 129,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID,
    features: [
      "Unlimited Emergency Plans",
      "All plan templates",
      "Up to 50 team members",
      "24/7 priority support",
      "AI-powered plan generation",
      "Emergency mode activation",
      "Advanced resource management",
      "Custom plan templates",
      "Version history & rollback",
    ],
    limits: {
      maxPlans: -1, // -1 = unlimited
      maxUsers: 50,
      maxResources: 200,
      aiAssistEnabled: true,
      emergencyModeEnabled: true,
    },
  },
  enterprise: {
    name: "Enterprise",
    price: 199,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      "Unlimited Emergency Plans",
      "All plan templates",
      "Unlimited team members",
      "Dedicated account manager",
      "AI-powered plan generation",
      "Emergency mode activation",
      "Advanced resource management",
      "Custom plan templates",
      "Version history & rollback",
      "SSO/SAML integration",
      "Custom integrations",
      "SLA guarantees",
    ],
    limits: {
      maxPlans: -1,
      maxUsers: -1,
      maxResources: -1,
      aiAssistEnabled: true,
      emergencyModeEnabled: true,
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export function getTierByPriceId(priceId: string): SubscriptionTier | null {
  for (const [tier, data] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (data.priceId === priceId) {
      return tier as SubscriptionTier;
    }
  }
  return null;
}

export function canAccessFeature(
  tier: SubscriptionTier,
  feature: keyof typeof SUBSCRIPTION_TIERS.free.limits
): boolean {
  return SUBSCRIPTION_TIERS[tier].limits[feature] as boolean;
}

export function hasReachedLimit(
  tier: SubscriptionTier,
  feature: keyof typeof SUBSCRIPTION_TIERS.free.limits,
  currentCount: number
): boolean {
  const limit = SUBSCRIPTION_TIERS[tier].limits[feature];
  if (typeof limit === "number") {
    return limit !== -1 && currentCount >= limit;
  }
  return false;
}
