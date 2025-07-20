import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from "@clerk/nextjs/server";
import { CompanionModel } from "@/models/Companion";
import { UserModel } from "@/models/User";

const companionModel = new CompanionModel();
const userModel = new UserModel();

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    console.log("Current user:", user.id, user.emailAddresses[0]?.emailAddress);

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    console.log("Database user:", dbUser);

    // Test creating a companion
    const testCompanionData = {
      name: "API Test Companion",
      subject: "maths",
      topic: "Test Topic",
      voice: "female",
      style: "casual",
      duration: 30,
      isPublic: false,
      authorId: dbUser.id,
      instructions: "Test instructions",
      vapiAssistantId: "test_assistant_id"
    };

    console.log("Creating companion with data:", testCompanionData);

    const companion = await companionModel.createCompanion(testCompanionData);
    
    if (!companion) {
      return NextResponse.json({ error: "Failed to create companion" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      companion,
      user: dbUser 
    });

  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}