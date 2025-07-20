"use server";

import { currentUser } from "@clerk/nextjs/server";
import { LearningSessionModel } from "@/models/LearningSession";
import { CompanionModel } from "@/models/Companion";
import { UserModel } from "@/models/User";
import { LearningSession, CreateLearningSessionData, ApiResponse } from "@/models/types";
import { createVapiCall, getVapiCall } from "./VapiController";

const learningSessionModel = new LearningSessionModel();
const companionModel = new CompanionModel();
const userModel = new UserModel();

export async function startLearningSession(companionId: string): Promise<ApiResponse<LearningSession>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    // Get companion details
    const companion = await companionModel.getCompanionById(companionId);
    
    if (!companion) {
      return { success: false, error: "Companion not found" };
    }

    // Create learning session
    const sessionData: CreateLearningSessionData = {
      companionId,
      userId: dbUser.id,
    };

    const session = await learningSessionModel.createSession(sessionData);
    
    if (!session) {
      return { success: false, error: "Failed to create learning session" };
    }

    // If companion has Vapi assistant, create a call
    if (companion.vapiAssistantId) {
      try {
        const vapiCallResult = await createVapiCall({
          assistantId: companion.vapiAssistantId,
          assistantOverrides: {
            variableValues: {
              studentName: dbUser.name,
              sessionId: session.id,
              subject: companion.subject,
              topic: companion.topic,
            }
          }
        });

        if (vapiCallResult.success && vapiCallResult.data) {
          // Update session with Vapi call ID
          await learningSessionModel.updateSession(session.id, {
            vapiCallId: vapiCallResult.data.id,
            status: 'active',
          });
        }
      } catch (vapiError) {
        console.error("Error creating Vapi call:", vapiError);
        // Continue without Vapi call
      }
    }

    return { success: true, data: session, message: "Learning session started successfully" };
  } catch (error) {
    console.error("Error starting learning session:", error);
    return { success: false, error: "Failed to start learning session" };
  }
}

export async function getLearningSession(sessionId: string): Promise<ApiResponse<LearningSession>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    const session = await learningSessionModel.getSessionById(sessionId);
    
    if (!session) {
      return { success: false, error: "Learning session not found" };
    }

    // Check if user owns the session
    if (session.userId !== dbUser.id) {
      return { success: false, error: "Unauthorized to access this session" };
    }

    return { success: true, data: session };
  } catch (error) {
    console.error("Error getting learning session:", error);
    return { success: false, error: "Failed to get learning session" };
  }
}

export async function getUserLearningSessions(limit = 10): Promise<ApiResponse<LearningSession[]>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    const sessions = await learningSessionModel.getUserSessions(dbUser.id, limit);
    
    return { success: true, data: sessions };
  } catch (error) {
    console.error("Error getting user learning sessions:", error);
    return { success: false, error: "Failed to get learning sessions" };
  }
}

export async function completeLearningSession(
  sessionId: string, 
  data: {
    feedback?: string;
    rating?: number;
  }
): Promise<ApiResponse<LearningSession>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    const session = await learningSessionModel.getSessionById(sessionId);
    
    if (!session) {
      return { success: false, error: "Learning session not found" };
    }

    // Check if user owns the session
    if (session.userId !== dbUser.id) {
      return { success: false, error: "Unauthorized to access this session" };
    }

    // Get call details from Vapi if available
    let transcript: string | undefined;
    let duration: number | undefined;

    if (session.vapiCallId) {
      try {
        const vapiCallResult = await getVapiCall(session.vapiCallId);
        
        if (vapiCallResult.success && vapiCallResult.data) {
          const vapiCall = vapiCallResult.data;
          transcript = vapiCall.transcript;
          
          if (vapiCall.startedAt && vapiCall.endedAt) {
            const startTime = new Date(vapiCall.startedAt).getTime();
            const endTime = new Date(vapiCall.endedAt).getTime();
            duration = Math.round((endTime - startTime) / 1000 / 60); // Duration in minutes
          }
        }
      } catch (vapiError) {
        console.error("Error getting Vapi call details:", vapiError);
      }
    }

    // Calculate duration if not available from Vapi
    if (!duration && session.startedAt) {
      const startTime = new Date(session.startedAt).getTime();
      const endTime = new Date().getTime();
      duration = Math.round((endTime - startTime) / 1000 / 60);
    }

    const completedSession = await learningSessionModel.completeSession(sessionId, {
      ...data,
      transcript,
      duration,
    });
    
    if (!completedSession) {
      return { success: false, error: "Failed to complete learning session" };
    }

    return { success: true, data: completedSession, message: "Learning session completed successfully" };
  } catch (error) {
    console.error("Error completing learning session:", error);
    return { success: false, error: "Failed to complete learning session" };
  }
}

export async function getLearningStats(): Promise<ApiResponse<{
  totalSessions: number;
  totalDuration: number;
  averageRating: number;
  completedSessions: number;
}>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    const stats = await learningSessionModel.getSessionStats(dbUser.id);
    
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error getting learning stats:", error);
    return { success: false, error: "Failed to get learning stats" };
  }
}