"use server";

import { currentUser } from "@clerk/nextjs/server";
import { SessionHistoryModel } from "@/models/SessionHistory";
import { UserModel } from "@/models/User";
import { SessionHistory, ApiResponse } from "@/models/types";

const sessionModel = new SessionHistoryModel();
const userModel = new UserModel();

export async function createSession(companionId: string, duration: number): Promise<ApiResponse<SessionHistory>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    const session = await sessionModel.createSession({
      userId: dbUser.id,
      companionId,
      duration
    });
    
    if (!session) {
      return { success: false, error: "Failed to create session" };
    }

    return { success: true, data: session, message: "Session recorded successfully" };
  } catch (error) {
    console.error("Error creating session:", error);
    return { success: false, error: "Failed to create session" };
  }
}

export async function getUserSessions(limit = 10): Promise<ApiResponse<SessionHistory[]>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    const sessions = await sessionModel.getUserSessions(dbUser.id, limit);
    
    return { success: true, data: sessions };
  } catch (error) {
    console.error("Error getting user sessions:", error);
    return { success: false, error: "Failed to get user sessions" };
  }
}

export async function getRecentSessions(limit = 10): Promise<ApiResponse<SessionHistory[]>> {
  try {
    const sessions = await sessionModel.getRecentSessions(limit);
    
    return { success: true, data: sessions };
  } catch (error) {
    console.error("Error getting recent sessions:", error);
    return { success: false, error: "Failed to get recent sessions" };
  }
}

export async function getSessionById(id: string): Promise<ApiResponse<SessionHistory>> {
  try {
    const session = await sessionModel.getSessionById(id);
    
    if (!session) {
      return { success: false, error: "Session not found" };
    }

    return { success: true, data: session };
  } catch (error) {
    console.error("Error getting session:", error);
    return { success: false, error: "Failed to get session" };
  }
}

export async function updateSessionFeedback(id: string, feedback: string, rating?: number): Promise<ApiResponse<SessionHistory>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const dbUser = await userModel.getUserByClerkId(user.id);
    
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    // Check if user owns the session
    const session = await sessionModel.getSessionById(id);
    
    if (!session) {
      return { success: false, error: "Session not found" };
    }

    if (session.userId !== dbUser.id) {
      return { success: false, error: "Unauthorized to update this session" };
    }

    const updatedSession = await sessionModel.updateSession(id, {
      feedback,
      rating
    });
    
    if (!updatedSession) {
      return { success: false, error: "Failed to update session" };
    }

    return { success: true, data: updatedSession, message: "Session feedback updated successfully" };
  } catch (error) {
    console.error("Error updating session feedback:", error);
    return { success: false, error: "Failed to update session feedback" };
  }
}

export async function getUserSessionStats(): Promise<ApiResponse<{
  totalSessions: number;
  totalDuration: number;
  averageRating: number;
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

    const stats = await sessionModel.getUserSessionStats(dbUser.id);
    
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error getting user session stats:", error);
    return { success: false, error: "Failed to get user session stats" };
  }
}