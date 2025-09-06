import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

// Voice configurations
export const voices = {
  male: { casual: "2BJW5coyhAzSr8STdHbE", formal: "c6SfcYrb2t09NHXiT80T" },
  female: { casual: "ZIlrSGI4jZqobxRKprJz", formal: "sarah" },
};

export const configureAssistant = (voice: string, style: string) => {
  console.log("Configuring assistant with voice:", voice, "style:", style);
  
  // Get voice ID with better error handling
  let voiceId = "sarah"; // default fallback
  try {
    const voiceConfig = voices[voice as keyof typeof voices];
    if (voiceConfig) {
      voiceId = voiceConfig[style as keyof typeof voiceConfig] || "sarah";
    }
  } catch (error) {
    console.warn("Error getting voice ID, using default:", error);
  }
  
  console.log("Using voice ID:", voiceId);

  const vapiAssistant: CreateAssistantDTO = {
    name: "AI Tutor",
    firstMessage: "Hello! I'm your AI tutor. I'm excited to start our learning session together. Let's begin!",
    firstMessageMode: "assistant-speaks-first" as const,
    transcriber: {
      provider: "deepgram" as const,
      model: "nova-2" as const,
      language: "en-US" as const,
    },
    voice: {
      provider: "11labs" as const,
      voiceId: voiceId,
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.0,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai" as const,
      model: "gpt-4o-mini" as const,
      messages: [
        {
          role: "system" as const,
          content: "You are a helpful AI tutor. Keep your responses short and conversational. Always be encouraging and speak naturally. Start the conversation immediately when the session begins.",
        },
      ],
      temperature: 0.7,
      maxTokens: 150,
    },
  };
  
  console.log("Assistant configuration created:", vapiAssistant);
  return vapiAssistant;
};