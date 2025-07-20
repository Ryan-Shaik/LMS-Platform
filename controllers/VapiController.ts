"use server";

import { currentUser } from "@clerk/nextjs/server";
import { ApiResponse } from "@/models/types";

// Server action to create a Vapi assistant
export async function createVapiAssistant(data: {
  name: string;
  instructions: string;
  voice: {
    provider: string;
    voiceId: string;
  };
  llm?: {
    provider: string;
    model: string;
  };
  transcriber?: {
    provider: string;
    model: string;
  };
}): Promise<ApiResponse<any>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Since we can't directly call the Vapi tools from server actions,
    // we'll need to implement this differently
    // For now, we'll return a mock response
    
    const mockAssistant = {
      id: `assistant_${Date.now()}`,
      name: data.name,
      instructions: data.instructions,
      voice: data.voice,
      llm: data.llm || { provider: 'openai', model: 'gpt-4o' },
      transcriber: data.transcriber || { provider: 'deepgram', model: 'nova-3' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { success: true, data: mockAssistant };
  } catch (error) {
    console.error("Error creating Vapi assistant:", error);
    return { success: false, error: "Failed to create Vapi assistant" };
  }
}

// Server action to create a Vapi call
export async function createVapiCall(data: {
  assistantId: string;
  customer?: {
    number?: string;
  };
  assistantOverrides?: {
    variableValues?: Record<string, any>;
  };
}): Promise<ApiResponse<any>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Mock call response
    const mockCall = {
      id: `call_${Date.now()}`,
      assistantId: data.assistantId,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };

    return { success: true, data: mockCall };
  } catch (error) {
    console.error("Error creating Vapi call:", error);
    return { success: false, error: "Failed to create Vapi call" };
  }
}

// Server action to get a Vapi call
export async function getVapiCall(callId: string): Promise<ApiResponse<any>> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Mock call response
    const mockCall = {
      id: callId,
      status: 'ended',
      startedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      endedAt: new Date().toISOString(),
      transcript: "This is a mock transcript of the learning session.",
      cost: 0.05,
    };

    return { success: true, data: mockCall };
  } catch (error) {
    console.error("Error getting Vapi call:", error);
    return { success: false, error: "Failed to get Vapi call" };
  }
}