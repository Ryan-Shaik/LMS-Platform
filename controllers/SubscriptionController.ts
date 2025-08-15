"use server";

import { currentUser } from "@clerk/nextjs/server";
import { SubscriptionModel } from "@/models/Subscription";
import { UserModel } from "@/models/User";
import { 
  UserSubscription, 
  SubscriptionTier, 
  UsageStats, 
  ApiResponse,
  UpgradePromptData 
} from "@/models/types";
import { SUBSCRIPTION_PLANS, getSubscriptionPlan } from "@/lib/subscription-plans";
import { clerkBilling } from "@/lib/clerk-billing";
import { supabase } from "@/lib/supabase";

const subscriptionModel = new SubscriptionModel();
const userModel = new UserModel();

export async function getUserSubscription(): Promise<ApiResponse<UserSubscription | null>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    const subscription = await subscriptionModel.getUserSubscription(dbUser.id);
    
    return { success: true, data: subscription };
  } catch (error) {
    console.error("Error getting user subscription:", error);
    return { success: false, error: "Failed to get subscription" };
  }
}

export async function getUserTier(): Promise<ApiResponse<SubscriptionTier>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check Clerk user metadata for subscription info
    const subscription = user.publicMetadata?.subscription as any;
    
    if (subscription && subscription.status === 'active') {
      // Map Clerk plan IDs to our tiers
      switch (subscription.planId) {
        case 'basic':
          return { success: true, data: SubscriptionTier.BASIC };
        case 'core_learner':
          return { success: true, data: SubscriptionTier.BASIC }; // Core Learner maps to BASIC tier
        case 'pro':
          return { success: true, data: SubscriptionTier.PRO };
        default:
          return { success: true, data: SubscriptionTier.FREE };
      }
    }

    // Fallback to database check
    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (dbUser) {
      const tier = await subscriptionModel.getUserTier(dbUser.id);
      return { success: true, data: tier };
    }
    
    return { success: true, data: SubscriptionTier.FREE };
  } catch (error) {
    console.error("Error getting user tier:", error);
    return { success: true, data: SubscriptionTier.FREE }; // Default to free on error
  }
}

export async function getUserUsageStats(): Promise<ApiResponse<UsageStats>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get user tier first
    const tierResult = await getUserTier();
    const tier = tierResult.data || SubscriptionTier.FREE;

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    // Get usage stats with tier-based limits
    const usageStats = await getUsageStatsForUser(dbUser.id, tier);
    
    return { success: true, data: usageStats };
  } catch (error) {
    console.error("Error getting user usage stats:", error);
    return { success: false, error: "Failed to get usage stats" };
  }
}

async function getUsageStatsForUser(userId: string, tier: SubscriptionTier): Promise<UsageStats> {
  try {
    // Get companion count
    const { count: companionCount, error: companionError } = await supabase
      .from("companions")
      .select("*", { count: "exact", head: true })
      .eq("authorId", userId);

    if (companionError) throw companionError;

    // Get session count for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: sessionCount, error: sessionError } = await supabase
      .from("learning_sessions")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId)
      .gte("createdAt", startOfMonth.toISOString());

    if (sessionError) throw sessionError;

    // Get limits based on tier
    const companionLimit = getCompanionLimitForTier(tier);
    const sessionLimit = getSessionLimitForTier(tier);

    const companionsUsed = companionCount || 0;
    const sessionsUsed = sessionCount || 0;

    return {
      companionsUsed,
      companionLimit,
      sessionsUsed,
      sessionLimit,
      canCreateCompanion: companionLimit === -1 || companionsUsed < companionLimit,
      canStartSession: sessionLimit === -1 || sessionsUsed < sessionLimit,
    };
  } catch (error) {
    console.error("Error getting usage stats for user:", error);
    // Return safe defaults
    return {
      companionsUsed: 0,
      companionLimit: 3,
      sessionsUsed: 0,
      sessionLimit: 10,
      canCreateCompanion: true,
      canStartSession: true,
    };
  }
}

function getCompanionLimitForTier(tier: SubscriptionTier): number {
  switch (tier) {
    case SubscriptionTier.FREE:
      return 3;
    case SubscriptionTier.BASIC:
      return 25; // Core Learner gets 25
    case SubscriptionTier.PRO:
      return -1; // unlimited
    case SubscriptionTier.ENTERPRISE:
      return -1; // unlimited
    default:
      return 3;
  }
}

function getSessionLimitForTier(tier: SubscriptionTier): number {
  switch (tier) {
    case SubscriptionTier.FREE:
      return 10;
    case SubscriptionTier.BASIC:
      return 250; // Core Learner gets 250
    case SubscriptionTier.PRO:
      return -1; // unlimited
    case SubscriptionTier.ENTERPRISE:
      return -1; // unlimited
    default:
      return 10;
  }
}

export async function checkCompanionLimit(): Promise<ApiResponse<{ canCreate: boolean; upgradePrompt?: UpgradePromptData }>> {
  try {
    const usageResult = await getUserUsageStats();
    
    if (!usageResult.success || !usageResult.data) {
      return { success: false, error: "Failed to check companion limit" };
    }

    const usage = usageResult.data;
    
    if (usage.canCreateCompanion) {
      return { success: true, data: { canCreate: true } };
    }

    const tierResult = await getUserTier();
    const currentTier = tierResult.data || SubscriptionTier.FREE;
    
    let requiredTier: SubscriptionTier;
    if (currentTier === SubscriptionTier.FREE) {
      requiredTier = SubscriptionTier.BASIC;
    } else if (currentTier === SubscriptionTier.BASIC) {
      requiredTier = SubscriptionTier.PRO;
    } else {
      requiredTier = SubscriptionTier.PRO;
    }

    const upgradePrompt: UpgradePromptData = {
      currentTier,
      requiredTier,
      feature: "Create More Companions",
      message: `You've reached your companion limit of ${usage.companionLimit}. Upgrade to ${requiredTier} to create more AI tutors.`
    };

    return { 
      success: true, 
      data: { 
        canCreate: false, 
        upgradePrompt 
      } 
    };
  } catch (error) {
    console.error("Error checking companion limit:", error);
    return { success: false, error: "Failed to check companion limit" };
  }
}

export async function checkSessionLimit(): Promise<ApiResponse<{ canStart: boolean; upgradePrompt?: UpgradePromptData }>> {
  try {
    const usageResult = await getUserUsageStats();
    
    if (!usageResult.success || !usageResult.data) {
      return { success: false, error: "Failed to check session limit" };
    }

    const usage = usageResult.data;
    
    if (usage.canStartSession) {
      return { success: true, data: { canStart: true } };
    }

    const tierResult = await getUserTier();
    const currentTier = tierResult.data || SubscriptionTier.FREE;
    
    let requiredTier: SubscriptionTier;
    if (currentTier === SubscriptionTier.FREE) {
      requiredTier = SubscriptionTier.BASIC;
    } else if (currentTier === SubscriptionTier.BASIC) {
      requiredTier = SubscriptionTier.PRO;
    } else {
      requiredTier = SubscriptionTier.PRO;
    }

    const upgradePrompt: UpgradePromptData = {
      currentTier,
      requiredTier,
      feature: "Start More Sessions",
      message: `You've reached your monthly session limit of ${usage.sessionLimit}. Upgrade to ${requiredTier} for more learning sessions.`
    };

    return { 
      success: true, 
      data: { 
        canStart: false, 
        upgradePrompt 
      } 
    };
  } catch (error) {
    console.error("Error checking session limit:", error);
    return { success: false, error: "Failed to check session limit" };
  }
}

export async function getSubscriptionPlans(): Promise<ApiResponse<typeof SUBSCRIPTION_PLANS>> {
  try {
    return { success: true, data: SUBSCRIPTION_PLANS };
  } catch (error) {
    console.error("Error getting subscription plans:", error);
    return { success: false, error: "Failed to get subscription plans" };
  }
}

export async function createSubscription(planId: string): Promise<ApiResponse<UserSubscription>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    const plan = getSubscriptionPlan(planId);
    
    if (!plan) {
      return { success: false, error: "Invalid subscription plan" };
    }

    // Check if user already has an active subscription
    const existingSubscription = await subscriptionModel.getUserSubscription(dbUser.id);
    
    if (existingSubscription && existingSubscription.status === "active") {
      return { success: false, error: "User already has an active subscription" };
    }

    // Calculate period dates
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    
    if (plan.interval === "month") {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    const subscription = await subscriptionModel.createUserSubscription({
      userId: dbUser.id,
      planId: plan.id,
      tier: plan.tier,
      status: "active",
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
    });

    return { success: true, data: subscription, message: "Subscription created successfully" };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return { success: false, error: "Failed to create subscription" };
  }
}

export async function cancelSubscription(): Promise<ApiResponse<UserSubscription>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    // Cancel subscription in Clerk
    try {
      await clerkBilling.cancelSubscription(user.id);
    } catch (clerkError) {
      console.error("Error cancelling Clerk subscription:", clerkError);
      // Continue with local cancellation even if Clerk fails
    }

    const subscription = await subscriptionModel.cancelUserSubscription(dbUser.id);
    
    return { success: true, data: subscription, message: "Subscription cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return { success: false, error: "Failed to cancel subscription" };
  }
}

export async function createClerkCheckoutSession(planId: string): Promise<ApiResponse<string>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const plan = getSubscriptionPlan(planId);
    
    if (!plan || !plan.clerkPlanId) {
      return { success: false, error: "Invalid subscription plan or Clerk plan ID not configured" };
    }

    // Create checkout session with Clerk
    const checkoutUrl = await clerkBilling.createCheckoutSession(
      user.id,
      plan.clerkPlanId,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?subscribed=true`,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`
    );

    return { success: true, data: checkoutUrl };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { success: false, error: "Failed to create checkout session" };
  }
}

export async function getSubscriptionPortalUrl(): Promise<ApiResponse<string>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get portal URL from Clerk
    const portalUrl = await clerkBilling.getPortalUrl(
      user.id,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
    );

    return { success: true, data: portalUrl };
  } catch (error) {
    console.error("Error getting portal URL:", error);
    return { success: false, error: "Failed to get subscription portal URL" };
  }
}

export async function syncSubscriptionFromClerk(): Promise<ApiResponse<UserSubscription | null>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    // Get subscription status from Clerk
    const clerkSubscription = await clerkBilling.syncSubscriptionStatus(user.id);
    
    if (!clerkSubscription) {
      // User has no active subscription in Clerk
      return { success: true, data: null };
    }

    // Find the plan that matches the Clerk plan ID
    const plan = SUBSCRIPTION_PLANS.find(p => p.clerkPlanId === clerkSubscription.planId);
    
    if (!plan) {
      console.error("No local plan found for Clerk plan ID:", clerkSubscription.planId);
      return { success: false, error: "Plan configuration mismatch" };
    }

    // Check if we have an existing subscription in our database
    let subscription = await subscriptionModel.getUserSubscription(dbUser.id);
    
    if (subscription) {
      // Update existing subscription
      subscription = await subscriptionModel.updateUserSubscription(subscription.id, {
        planId: plan.id,
        tier: plan.tier,
        status: clerkSubscription.status,
        currentPeriodStart: clerkSubscription.currentPeriodStart,
        currentPeriodEnd: clerkSubscription.currentPeriodEnd,
        cancelAtPeriodEnd: clerkSubscription.cancelAtPeriodEnd,
      });
    } else {
      // Create new subscription
      subscription = await subscriptionModel.createUserSubscription({
        userId: dbUser.id,
        planId: plan.id,
        tier: plan.tier,
        status: clerkSubscription.status,
        currentPeriodStart: clerkSubscription.currentPeriodStart,
        currentPeriodEnd: clerkSubscription.currentPeriodEnd,
        cancelAtPeriodEnd: clerkSubscription.cancelAtPeriodEnd,
      });
    }

    return { success: true, data: subscription };
  } catch (error) {
    console.error("Error syncing subscription from Clerk:", error);
    return { success: false, error: "Failed to sync subscription" };
  }
}

export async function hasFeatureAccess(feature: string): Promise<ApiResponse<boolean>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const hasAccess = await clerkBilling.hasFeatureAccess(user.id, feature);
    
    return { success: true, data: hasAccess };
  } catch (error) {
    console.error("Error checking feature access:", error);
    return { success: false, error: "Failed to check feature access" };
  }
}