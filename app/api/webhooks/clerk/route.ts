import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { SubscriptionModel } from "@/models/Subscription";
import { UserModel } from "@/models/User";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

if (!webhookSecret) {
  console.warn("CLERK_WEBHOOK_SECRET not found - webhook endpoint will be disabled");
}

const subscriptionModel = new SubscriptionModel();
const userModel = new UserModel();

export async function POST(req: NextRequest) {
  console.log("=== WEBHOOK RECEIVED ===");
  console.log("Timestamp:", new Date().toISOString());

  // Check if webhook secret is configured
  if (!webhookSecret) {
    console.log("❌ CLERK_WEBHOOK_SECRET not configured");
    return NextResponse.json({
      error: "Webhook not configured - please set CLERK_WEBHOOK_SECRET environment variable"
    }, { status: 501 });
  }

  console.log("✅ Webhook secret configured");

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log("Received Clerk webhook:", eventType);

  try {
    switch (eventType) {
      case "user.created":
        await handleUserCreated(evt.data);
        break;
      case "user.updated":
        await handleUserUpdated(evt.data);
        break;
      case "subscription.created":
        await handleSubscriptionCreated(evt.data);
        break;
      case "subscription.updated":
        await handleSubscriptionUpdated(evt.data);
        break;
      case "subscription.cancelled":
        await handleSubscriptionCancelled(evt.data);
        break;
      default:
        console.log("Unhandled webhook event:", eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return new Response(`Error processing webhook: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
  }
}

async function handleUserCreated(userData: any) {
  console.log("User created:", userData.id);
  
  try {
    // The user creation is already handled in the UserController
    // when they first access the dashboard
    console.log("User creation webhook received for:", userData.id);
  } catch (error) {
    console.error("Error handling user created webhook:", error);
  }
}

async function handleUserUpdated(userData: any) {
  console.log("User updated:", userData.id);
  
  try {
    // Update user information if needed
    const dbUser = await userModel.getUserByClerkId(userData.id);
    
    if (dbUser) {
      await userModel.updateUser(dbUser.id, {
        email: userData.email_addresses?.[0]?.email_address || dbUser.email,
        name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || dbUser.name,
        image: userData.image_url || dbUser.image,
      });
    }
  } catch (error) {
    console.error("Error handling user updated webhook:", error);
  }
}

async function handleSubscriptionCreated(subscriptionData: any) {
  console.log("Subscription created:", subscriptionData);
  
  try {
    const userId = subscriptionData.user_id;
    const planId = subscriptionData.plan_id;
    
    // Find our local user
    const dbUser = await userModel.getUserByClerkId(userId);
    if (!dbUser) {
      console.error("User not found for subscription creation:", userId);
      return;
    }

    // Find the plan that matches the Clerk plan ID
    const plan = SUBSCRIPTION_PLANS.find(p => p.clerkPlanId === planId);
    if (!plan) {
      console.error("No local plan found for Clerk plan ID:", planId);
      return;
    }

    // Create subscription in our database
    await subscriptionModel.createUserSubscription({
      userId: dbUser.id,
      planId: plan.id,
      tier: plan.tier,
      status: subscriptionData.status || "active",
      currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
      currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
      cancelAtPeriodEnd: subscriptionData.cancel_at_period_end || false,
      stripeCustomerId: subscriptionData.customer,
      stripeSubscriptionId: subscriptionData.id,
    });

    // Update Clerk user metadata to ensure immediate tier detection
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        subscription: {
          planId: planId,
          status: subscriptionData.status || "active",
          tier: plan.tier,
          currentPeriodStart: subscriptionData.current_period_start * 1000,
          currentPeriodEnd: subscriptionData.current_period_end * 1000,
          cancelAtPeriodEnd: subscriptionData.cancel_at_period_end || false,
        }
      }
    });

    console.log("Subscription created successfully for user:", userId);
  } catch (error) {
    console.error("Error handling subscription created webhook:", error);
  }
}

async function handleSubscriptionUpdated(subscriptionData: any) {
  console.log("Subscription updated:", subscriptionData);

  try {
    const userId = subscriptionData.user_id;
    const planId = subscriptionData.plan_id;

    console.log("Processing subscription update for user:", userId, "plan:", planId);

    // Find our local user
    const dbUser = await userModel.getUserByClerkId(userId);
    if (!dbUser) {
      console.error("User not found in database for subscription update:", userId);
      throw new Error(`User ${userId} not found in database`);
    }

    console.log("Found database user:", dbUser.id, dbUser.email);

    // Find the plan that matches the Clerk plan ID
    let plan = SUBSCRIPTION_PLANS.find(p => p.clerkPlanId === planId);

    // Fallback: try to match by plan name or ID
    if (!plan) {
      console.log("Exact plan match not found, trying fallback for:", planId);
      // Try to match by plan ID directly
      plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    }

    if (!plan) {
      console.error("No local plan found for Clerk plan ID:", planId);
      console.log("Available plans:", SUBSCRIPTION_PLANS.map(p => ({ id: p.id, clerkPlanId: p.clerkPlanId })));
      console.log("Received plan ID from Clerk:", planId);

      // Create a fallback plan for unknown plan IDs
      if (planId.includes('basic') || planId.includes('core')) {
        plan = SUBSCRIPTION_PLANS.find(p => p.id === 'core-learner');
        console.log("Using fallback plan: core-learner");
      } else if (planId.includes('pro')) {
        plan = SUBSCRIPTION_PLANS.find(p => p.id === 'pro');
        console.log("Using fallback plan: pro");
      }
    }

    if (!plan) {
      throw new Error(`Plan ${planId} not found in local plans and no fallback available`);
    }

    console.log("Found matching plan:", plan.id, plan.tier);

    // Find existing subscription
    const existingSubscription = await subscriptionModel.getUserSubscription(dbUser.id);
    console.log("Existing subscription:", existingSubscription ? "found" : "not found");

    if (existingSubscription) {
      // Update existing subscription
      console.log("Updating existing subscription:", existingSubscription.id);
      await subscriptionModel.updateUserSubscription(existingSubscription.id, {
        planId: plan.id,
        tier: plan.tier,
        status: subscriptionData.status || "active",
        currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
        currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
        cancelAtPeriodEnd: subscriptionData.cancel_at_period_end || false,
        stripeCustomerId: subscriptionData.customer,
        stripeSubscriptionId: subscriptionData.id,
      });
    } else {
      // Create new subscription if it doesn't exist
      console.log("Creating new subscription for user:", dbUser.id);
      await subscriptionModel.createUserSubscription({
        userId: dbUser.id,
        planId: plan.id,
        tier: plan.tier,
        status: subscriptionData.status || "active",
        currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
        currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
        cancelAtPeriodEnd: subscriptionData.cancel_at_period_end || false,
        stripeCustomerId: subscriptionData.customer,
        stripeSubscriptionId: subscriptionData.id,
      });
    }

    // Update Clerk user metadata to ensure immediate tier detection
    console.log("Updating Clerk user metadata...");
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        subscription: {
          planId: planId,
          status: subscriptionData.status || "active",
          tier: plan.tier,
          currentPeriodStart: subscriptionData.current_period_start * 1000,
          currentPeriodEnd: subscriptionData.current_period_end * 1000,
          cancelAtPeriodEnd: subscriptionData.cancel_at_period_end || false,
        }
      }
    });

    console.log("Subscription updated successfully for user:", userId);
  } catch (error) {
    console.error("Error handling subscription updated webhook:", error);
    throw error; // Re-throw to trigger webhook failure
  }
}

async function handleSubscriptionCancelled(subscriptionData: any) {
  console.log("Subscription cancelled:", subscriptionData);
  
  try {
    const userId = subscriptionData.user_id;
    
    // Find our local user
    const dbUser = await userModel.getUserByClerkId(userId);
    if (!dbUser) {
      console.error("User not found for subscription cancellation:", userId);
      return;
    }

    // Cancel subscription in our database
    await subscriptionModel.cancelUserSubscription(dbUser.id);

    console.log("Subscription cancelled successfully for user:", userId);
  } catch (error) {
    console.error("Error handling subscription cancelled webhook:", error);
  }
}