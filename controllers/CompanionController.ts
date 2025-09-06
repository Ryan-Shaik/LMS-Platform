"use server";

import { currentUser } from "@clerk/nextjs/server";
import { CompanionModel } from "@/models/Companion";
import { UserModel } from "@/models/User";
import { Companion, CreateCompanionData, GetCompanionsQuery, ApiResponse } from "@/models/types";
import { vapiService } from "@/lib/vapi";
import { createVapiAssistant } from "./VapiController";
import { checkCompanionLimit } from "./SubscriptionController";

const companionModel = new CompanionModel();
const userModel = new UserModel();

export async function createCompanion(companionData: CreateCompanionData): Promise<ApiResponse<Companion>> {
  try {
    console.log("Creating companion with data:", companionData);
    
    const user = await currentUser();
    
    if (!user) {
      console.log("No user authenticated");
      return { success: false, error: "User not authenticated" };
    }

    console.log("Current user:", user.id, user.emailAddresses[0]?.emailAddress);

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      console.log("User not found in database for clerkId:", user.id);
      return { success: false, error: "User not found" };
    }

    console.log("Database user found:", dbUser.id, dbUser.email);

    // Check companion creation limits based on subscription
    const limitCheck = await checkCompanionLimit();
    
    if (!limitCheck.success) {
      return { success: false, error: limitCheck.error || "Failed to check companion limit" };
    }

    if (!limitCheck.data?.canCreate) {
      const upgradePrompt = limitCheck.data?.upgradePrompt;
      return {
        success: false,
        error: upgradePrompt?.message || "Companion limit reached. Please upgrade your plan."
      };
    }

    // Generate instructions for the AI assistant
    const instructions = companionData.instructions || vapiService.generateInstructions({
      name: companionData.name,
      subject: companionData.subject,
      topic: companionData.topic,
      style: companionData.style,
      duration: companionData.duration,
    });

    console.log("Generated instructions length:", instructions.length);

    // Create Vapi assistant
    let vapiAssistantId: string | undefined;
    try {
      const vapiResult = await createVapiAssistant({
        name: companionData.name,
        instructions,
        voice: vapiService.getVoiceConfig(companionData.voice),
      });
      
      if (vapiResult.success && vapiResult.data) {
        vapiAssistantId = vapiResult.data.id;
        console.log("Created Vapi assistant:", vapiAssistantId);
      }
    } catch (vapiError) {
      console.error("Error creating Vapi assistant:", vapiError);
      // Continue without Vapi assistant for now
    }

    const companionToCreate = {
      ...companionData,
      instructions,
      vapiAssistantId,
      authorId: dbUser.id
    };

    console.log("Creating companion in database:", companionToCreate);

    const companion = await companionModel.createCompanion(companionToCreate);
    
    if (!companion) {
      console.log("Failed to create companion in database");
      return { success: false, error: "Failed to create companion" };
    }

    console.log("Successfully created companion:", companion.id);

    return { success: true, data: companion, message: "Companion created successfully" };
  } catch (error) {
    console.error("Error creating companion:", error);
    return { success: false, error: `Failed to create companion: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export async function getAllCompanions(query: GetCompanionsQuery = {}): Promise<ApiResponse<Companion[]>> {
  try {
    const companions = await companionModel.getAllCompanions(query);
    
    return { success: true, data: companions };
  } catch (error) {
    console.error("Error getting companions:", error);
    return { success: false, error: "Failed to get companions" };
  }
}

export async function getCompanionById(id: string): Promise<ApiResponse<Companion>> {
  try {
    const companion = await companionModel.getCompanionById(id);
    
    if (!companion) {
      return { success: false, error: "Companion not found" };
    }

    return { success: true, data: companion };
  } catch (error) {
    console.error("Error getting companion:", error);
    return { success: false, error: "Failed to get companion" };
  }
}

export async function getUserCompanions(limit = 10): Promise<ApiResponse<Companion[]>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    const companions = await companionModel.getUserCompanions(dbUser.id, limit);
    
    return { success: true, data: companions };
  } catch (error) {
    console.error("Error getting user companions:", error);
    return { success: false, error: "Failed to get user companions" };
  }
}

export async function updateCompanion(id: string, updates: Partial<Companion>): Promise<ApiResponse<Companion>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    // Check if user owns the companion
    const companion = await companionModel.getCompanionById(id);
    
    if (!companion) {
      return { success: false, error: "Companion not found" };
    }

    if (companion.authorId !== dbUser.id) {
      return { success: false, error: "Unauthorized to update this companion" };
    }

    const updatedCompanion = await companionModel.updateCompanion(id, updates);
    
    if (!updatedCompanion) {
      return { success: false, error: "Failed to update companion" };
    }

    return { success: true, data: updatedCompanion, message: "Companion updated successfully" };
  } catch (error) {
    console.error("Error updating companion:", error);
    return { success: false, error: "Failed to update companion" };
  }
}

export async function deleteCompanion(id: string): Promise<ApiResponse<boolean>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    // Check if user owns the companion
    const companion = await companionModel.getCompanionById(id);
    
    if (!companion) {
      return { success: false, error: "Companion not found" };
    }

    if (companion.authorId !== dbUser.id) {
      return { success: false, error: "Unauthorized to delete this companion" };
    }

    const deleted = await companionModel.deleteCompanion(id);
    
    if (!deleted) {
      return { success: false, error: "Failed to delete companion" };
    }

    return { success: true, data: true, message: "Companion deleted successfully" };
  } catch (error) {
    console.error("Error deleting companion:", error);
    return { success: false, error: "Failed to delete companion" };
  }
}

export async function getCompanionStats(): Promise<ApiResponse<{ totalCompanions: number; userCompanions: number }>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    const [totalCompanions, userCompanions] = await Promise.all([
      companionModel.getAllCompanions({ limit: 1000 }),
      companionModel.getUserCompanions(dbUser.id, 1000)
    ]);

    return {
      success: true,
      data: {
        totalCompanions: totalCompanions.length,
        userCompanions: userCompanions.length
      }
    };
  } catch (error) {
    console.error("Error getting companion stats:", error);
    return { success: false, error: "Failed to get companion stats" };
  }
}