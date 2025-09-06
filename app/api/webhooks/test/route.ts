import { NextResponse } from "next/server";
import { UserModel } from "@/models/User";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";

export async function GET() {
  try {
    const userModel = new UserModel();

    // Test database connection
    const testUser = await userModel.getUserByClerkId("test");
    console.log("Database connection test:", testUser === null ? "OK" : "Unexpected result");

    // Check webhook secret
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    const hasWebhookSecret = !!webhookSecret;

    // Test Clerk client
    let clerkStatus = "unknown";
    let clerkPermissions = "unknown";
    try {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const client = await clerkClient();
      clerkStatus = "connected";

      // Test if we can access users API
      try {
        // This will test if we have proper permissions
        await client.users.getUserList({ limit: 1 });
        clerkPermissions = "OK";
      } catch (permError) {
        console.error("Clerk permissions test failed:", permError);
        clerkPermissions = "insufficient";
      }
    } catch (clerkError) {
      console.error("Clerk client test failed:", clerkError);
      clerkStatus = "failed";
      clerkPermissions = "failed";
    }

    return NextResponse.json({
      status: "OK",
      database: "connected",
      webhookSecret: hasWebhookSecret ? "configured" : "missing",
      clerkClient: clerkStatus,
      clerkPermissions: clerkPermissions,
      plans: SUBSCRIPTION_PLANS.map(p => ({ id: p.id, clerkPlanId: p.clerkPlanId })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Webhook test failed:", error);
    return NextResponse.json({
      status: "ERROR",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}