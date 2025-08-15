import { SubscriptionPlan, SubscriptionTier } from "@/models/types";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    tier: SubscriptionTier.FREE,
    price: 0,
    interval: "month",
    companionLimit: 3,
    sessionLimit: 10,
    clerkPlanId: null,
    features: [
      "3 AI Companions",
      "10 Learning Sessions per month",
      "Basic voice interactions",
      "Session history",
      "Community companions access"
    ]
  },
  {
    id: "basic",
    name: "Basic",
    tier: SubscriptionTier.BASIC,
    price: 9.99,
    interval: "month",
    companionLimit: 15,
    sessionLimit: 100,
    clerkPlanId: "basic", // This should match your Clerk plan ID
    features: [
      "15 AI Companions",
      "100 Learning Sessions per month",
      "Advanced voice interactions",
      "Priority support",
      "Session analytics",
      "Custom companion sharing",
      "Export session transcripts"
    ]
  },
  {
    id: "core-learner",
    name: "Core Learner",
    tier: SubscriptionTier.BASIC,
    price: 19.99,
    interval: "month",
    companionLimit: 25,
    sessionLimit: 250,
    clerkPlanId: "core_learner", // This should match your Clerk plan ID
    isPopular: true,
    features: [
      "25 AI Companions",
      "250 Learning Sessions per month",
      "Advanced voice interactions",
      "Priority support",
      "Advanced session analytics",
      "Custom companion sharing",
      "Export session transcripts",
      "Learning progress tracking",
      "Personalized recommendations"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    tier: SubscriptionTier.PRO,
    price: 39.99,
    interval: "month",
    companionLimit: -1, // unlimited
    sessionLimit: -1, // unlimited
    clerkPlanId: "pro", // This should match your Clerk plan ID
    features: [
      "Unlimited AI Companions",
      "Unlimited Learning Sessions",
      "Premium voice models",
      "Advanced analytics & insights",
      "Custom branding",
      "API access",
      "Priority support",
      "Early access to new features",
      "Team collaboration tools",
      "White-label options"
    ]
  }
];

export const getSubscriptionPlan = (planId: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
};

export const getSubscriptionPlansByTier = (tier: SubscriptionTier): SubscriptionPlan[] => {
  return SUBSCRIPTION_PLANS.filter(plan => plan.tier === tier);
};

export const getDefaultPlanForTier = (tier: SubscriptionTier): SubscriptionPlan | undefined => {
  const plans = getSubscriptionPlansByTier(tier);
  return plans.find(plan => plan.interval === "month") || plans[0];
};

export const COMPANION_LIMITS = {
  [SubscriptionTier.FREE]: 3,
  [SubscriptionTier.BASIC]: 15,
  [SubscriptionTier.PRO]: -1, // unlimited
  [SubscriptionTier.ENTERPRISE]: -1, // unlimited
} as const;

export const SESSION_LIMITS = {
  [SubscriptionTier.FREE]: 10,
  [SubscriptionTier.BASIC]: 100,
  [SubscriptionTier.PRO]: -1, // unlimited
  [SubscriptionTier.ENTERPRISE]: -1, // unlimited
} as const;