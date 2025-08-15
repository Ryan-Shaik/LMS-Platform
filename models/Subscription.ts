import { supabase } from "@/lib/supabase";
import { UserSubscription, SubscriptionTier, UsageStats } from "./types";

export class SubscriptionModel {
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("userId", userId)
        .eq("status", "active")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No subscription found, return null
          return null;
        }
        throw error;
      }

      return {
        ...data,
        currentPeriodStart: new Date(data.currentPeriodStart),
        currentPeriodEnd: new Date(data.currentPeriodEnd),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error) {
      console.error("Error getting user subscription:", error);
      throw error;
    }
  }

  async createUserSubscription(subscription: Omit<UserSubscription, "id" | "createdAt" | "updatedAt">): Promise<UserSubscription> {
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .insert({
          ...subscription,
          currentPeriodStart: subscription.currentPeriodStart.toISOString(),
          currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        currentPeriodStart: new Date(data.currentPeriodStart),
        currentPeriodEnd: new Date(data.currentPeriodEnd),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error) {
      console.error("Error creating user subscription:", error);
      throw error;
    }
  }

  async updateUserSubscription(id: string, updates: Partial<UserSubscription>): Promise<UserSubscription> {
    try {
      const updateData: any = { ...updates };
      
      // Convert dates to ISO strings
      if (updates.currentPeriodStart) {
        updateData.currentPeriodStart = updates.currentPeriodStart.toISOString();
      }
      if (updates.currentPeriodEnd) {
        updateData.currentPeriodEnd = updates.currentPeriodEnd.toISOString();
      }

      const { data, error } = await supabase
        .from("user_subscriptions")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        currentPeriodStart: new Date(data.currentPeriodStart),
        currentPeriodEnd: new Date(data.currentPeriodEnd),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error) {
      console.error("Error updating user subscription:", error);
      throw error;
    }
  }

  async cancelUserSubscription(userId: string): Promise<UserSubscription> {
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .update({ 
          status: "cancelled",
          cancelAtPeriodEnd: true 
        })
        .eq("userId", userId)
        .eq("status", "active")
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        currentPeriodStart: new Date(data.currentPeriodStart),
        currentPeriodEnd: new Date(data.currentPeriodEnd),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error) {
      console.error("Error cancelling user subscription:", error);
      throw error;
    }
  }

  async getUserTier(userId: string): Promise<SubscriptionTier> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription || subscription.status !== "active") {
        return SubscriptionTier.FREE;
      }

      // Check if subscription has expired
      if (new Date() > subscription.currentPeriodEnd) {
        return SubscriptionTier.FREE;
      }

      return subscription.tier;
    } catch (error) {
      console.error("Error getting user tier:", error);
      return SubscriptionTier.FREE;
    }
  }

  async getUserUsageStats(userId: string): Promise<UsageStats> {
    try {
      const tier = await this.getUserTier(userId);
      
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
      const companionLimit = this.getCompanionLimit(tier);
      const sessionLimit = this.getSessionLimit(tier);

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
      console.error("Error getting user usage stats:", error);
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

  private getCompanionLimit(tier: SubscriptionTier): number {
    switch (tier) {
      case SubscriptionTier.FREE:
        return 3;
      case SubscriptionTier.BASIC:
        return 15;
      case SubscriptionTier.PRO:
      case SubscriptionTier.ENTERPRISE:
        return -1; // unlimited
      default:
        return 3;
    }
  }

  private getSessionLimit(tier: SubscriptionTier): number {
    switch (tier) {
      case SubscriptionTier.FREE:
        return 10;
      case SubscriptionTier.BASIC:
        return 100;
      case SubscriptionTier.PRO:
      case SubscriptionTier.ENTERPRISE:
        return -1; // unlimited
      default:
        return 10;
    }
  }
}