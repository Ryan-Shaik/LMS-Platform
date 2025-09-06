import { NextResponse } from "next/server";
import { refreshSubscriptionData } from "@/controllers/SubscriptionController";

export async function POST() {
  try {
    const result = await refreshSubscriptionData();
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Error in subscription refresh API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}