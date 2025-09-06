import { clerkClient } from "@clerk/nextjs/server";
import { SubscriptionPlan } from "@/models/types";

export class ClerkBillingService {
  private async getClient() {
    return await clerkClient();
  }

  /**
   * Create a subscription for a user
   */
  async createSubscription(userId: string, planId: string): Promise<any> {
    try {
      const client = await this.getClient();
      // Store subscription info in user metadata
      const subscriptionData = {
        planId: planId,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
      };

      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          subscription: subscriptionData,
        },
      });
      
      return subscriptionData;
    } catch (error) {
      console.error("Error creating Clerk subscription:", error);
      throw error;
    }
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<any> {
    try {
      const client = await this.getClient();
      const user = await client.users.getUser(userId);
      
      // Check if user has active subscriptions
      if (user.publicMetadata?.subscription) {
        return user.publicMetadata.subscription;
      }
      
      return null;
    } catch (error) {
      console.error("Error getting user subscription:", error);
      return null;
    }
  }

  /**
   * Update user's subscription
   */
  async updateSubscription(userId: string, planId: string): Promise<any> {
    try {
      const client = await this.getClient();
      const user = await client.users.getUser(userId);
      const currentSubscription = user.publicMetadata?.subscription as any;
      
      // Update subscription info in user metadata
      const updatedSubscription = {
        ...currentSubscription,
        planId: planId,
        updatedAt: new Date().toISOString(),
      };

      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          subscription: updatedSubscription,
        },
      });
      
      return updatedSubscription;
    } catch (error) {
      console.error("Error updating Clerk subscription:", error);
      throw error;
    }
  }

  /**
   * Cancel user's subscription
   */
  async cancelSubscription(userId: string): Promise<any> {
    try {
      const client = await this.getClient();
      const user = await client.users.getUser(userId);
      const currentSubscription = user.publicMetadata?.subscription as any;
      
      // Mark subscription as cancelled in user metadata
      const cancelledSubscription = {
        ...currentSubscription,
        status: 'cancelled',
        cancelAtPeriodEnd: true,
        cancelledAt: new Date().toISOString(),
      };

      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          subscription: cancelledSubscription,
        },
      });
      
      return cancelledSubscription;
    } catch (error) {
      console.error("Error cancelling Clerk subscription:", error);
      throw error;
    }
  }

  /**
   * Get subscription portal URL for user to manage their subscription
   */
  async getPortalUrl(userId: string, returnUrl?: string): Promise<string> {
    try {
      // For now, redirect to the pricing page where users can manage subscriptions
      return `${process.env.NEXT_PUBLIC_APP_URL}/pricing?userId=${userId}&return=${encodeURIComponent(returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)}`;
    } catch (error) {
      console.error("Error creating portal session:", error);
      throw error;
    }
  }

  /**
   * Create a checkout session for a subscription
   */
  async createCheckoutSession(userId: string, planId: string, successUrl?: string, cancelUrl?: string): Promise<string> {
    try {
      // For now, redirect to the pricing page with plan selection
      return `${process.env.NEXT_PUBLIC_APP_URL}/pricing/checkout?plan=${planId}&userId=${userId}&success=${encodeURIComponent(successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`)}&cancel=${encodeURIComponent(cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`)}`;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
  }

  /**
   * Sync subscription status from Clerk to our database
   */
  async syncSubscriptionStatus(userId: string): Promise<any> {
    try {
      const client = await this.getClient();
      const user = await client.users.getUser(userId);
      
      // Extract subscription info from user metadata
      const subscription = user.publicMetadata?.subscription;
      
      if (subscription && typeof subscription === 'object') {
        const sub = subscription as any;
        return {
          planId: sub.planId,
          status: sub.status,
          currentPeriodStart: new Date(sub.currentPeriodStart),
          currentPeriodEnd: new Date(sub.currentPeriodEnd),
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd || false,
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error syncing subscription status:", error);
      return null;
    }
  }

  /**
   * Update user metadata with subscription info
   */
  async updateUserMetadata(userId: string, subscriptionData: any): Promise<void> {
    try {
      const client = await this.getClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          subscription: subscriptionData,
        },
      });
    } catch (error) {
      console.error("Error updating user metadata:", error);
      throw error;
    }
  }

  /**
   * Check if user has access to a specific feature based on their subscription
   */
  async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return false; // Free tier
      }
      
      // Define feature access based on plan
      const featureAccess: Record<string, string[]> = {
        basic: ['advanced_voice', 'priority_support', 'analytics'],
        core_learner: ['advanced_voice', 'priority_support', 'analytics', 'progress_tracking', 'recommendations'],
        pro: ['advanced_voice', 'priority_support', 'analytics', 'progress_tracking', 'recommendations', 'api_access', 'custom_branding', 'unlimited'],
      };
      
      const planFeatures = featureAccess[subscription.planId] || [];
      return planFeatures.includes(feature);
    } catch (error) {
      console.error("Error checking feature access:", error);
      return false;
    }
  }
}

export const clerkBilling = new ClerkBillingService();