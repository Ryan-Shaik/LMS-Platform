import { clerkClient } from "@clerk/nextjs/server";
import { SubscriptionPlan } from "@/models/types";

export class ClerkBillingService {
  private client = clerkClient;

  /**
   * Create a subscription for a user
   */
  async createSubscription(userId: string, planId: string): Promise<any> {
    try {
      // Create subscription using Clerk's billing API
      const subscription = await this.client.users.createUserSubscription(userId, {
        planId: planId,
      });
      
      return subscription;
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
      const user = await this.client.users.getUser(userId);
      
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
      // Update subscription using Clerk's billing API
      const subscription = await this.client.users.updateUserSubscription(userId, {
        planId: planId,
      });
      
      return subscription;
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
      // Cancel subscription using Clerk's billing API
      const result = await this.client.users.cancelUserSubscription(userId);
      
      return result;
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
      const portalSession = await this.client.users.createUserSubscriptionPortalSession(userId, {
        returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      });
      
      return portalSession.url;
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
      const checkoutSession = await this.client.users.createUserSubscriptionCheckoutSession(userId, {
        planId: planId,
        successUrl: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
        cancelUrl: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      });
      
      return checkoutSession.url;
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
      const user = await this.client.users.getUser(userId);
      
      // Extract subscription info from user metadata
      const subscription = user.publicMetadata?.subscription;
      
      if (subscription) {
        return {
          planId: subscription.planId,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.currentPeriodStart),
          currentPeriodEnd: new Date(subscription.currentPeriodEnd),
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
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
      await this.client.users.updateUserMetadata(userId, {
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