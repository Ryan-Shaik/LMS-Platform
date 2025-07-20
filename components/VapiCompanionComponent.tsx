"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi-client";
import { configureAssistant } from "@/lib/vapi-utils";
import { subjectsColors } from "@/constants";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from "@/constants/soundwaves.json";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  ERROR = "ERROR",
}

interface VapiCompanionComponentProps {
  companionId: string;
  subject: string;
  topic: string;
  name: string;
  userName: string;
  userImage: string;
  voice: string;
  style: string;
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface Message {
  type: string;
  role: string;
  transcriptType?: string;
  transcript?: string;
}

const getSubjectColor = (subject: string) => {
  return subjectsColors[subject as keyof typeof subjectsColors] || "#E5D0FF";
};

const VapiCompanionComponent = ({
  companionId,
  subject,
  topic,
  name,
  userName,
  userImage,
  style,
  voice,
}: VapiCompanionComponentProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);

  const lottieRef = useRef<LottieRefCurrentProps>(null);

  // Check microphone permissions on component mount
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission(true);
        stream.getTracks().forEach(track => track.stop()); // Stop the stream
        console.log("Microphone permission granted");
      } catch (error) {
        console.error("Microphone permission denied:", error);
        setMicPermission(false);
        setError("Microphone permission is required for voice sessions");
      }
    };

    checkMicPermission();
  }, []);

  useEffect(() => {
    if (lottieRef) {
      if (isSpeaking) {
        lottieRef.current?.play();
      } else {
        lottieRef.current?.stop();
      }
    }
  }, [isSpeaking, lottieRef]);

  useEffect(() => {
    const onCallStart = () => {
      console.log("✅ Call started successfully");
      setCallStatus(CallStatus.ACTIVE);
      setError(null);
    };

    const onCallEnd = () => {
      console.log("📞 Call ended");
      setCallStatus(CallStatus.FINISHED);
      // Add session history logic here if needed
    };

    const onMessage = (message: Message) => {
      console.log("💬 Received message:", message);
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role as "user" | "assistant", content: message.transcript || "" };
        setMessages((prev) => [newMessage, ...prev]);
      }
    };

    const onSpeechStart = () => {
      console.log("🗣️ Speech started");
      setIsSpeaking(true);
    };
    
    const onSpeechEnd = () => {
      console.log("🔇 Speech ended");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.error("❌ Vapi Error:", error);
      setCallStatus(CallStatus.ERROR);
      setError(error.message || "An error occurred during the call");
    };

    // Register event listeners
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);

    return () => {
      // Cleanup event listeners
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("error", onError);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
    };
  }, [companionId]);

  const toggleMicrophone = () => {
    try {
      const isMuted = vapi.isMuted();
      vapi.setMuted(!isMuted);
      setIsMuted(!isMuted);
      console.log("🎤 Microphone toggled:", !isMuted ? "muted" : "unmuted");
    } catch (error) {
      console.error("Error toggling microphone:", error);
    }
  };

  const handleCall = async () => {
    console.log("🚀 Starting call...");
    
    // Check microphone permission first
    if (micPermission === false) {
      setError("Please allow microphone access to start the session");
      return;
    }

    setCallStatus(CallStatus.CONNECTING);
    setError(null);

    try {
      // Configure assistant
      const assistantConfig = configureAssistant(voice || "female", style || "casual");
      
      console.log("📋 Assistant config:", assistantConfig);
      console.log("🎯 Session details - Voice:", voice, "Style:", style, "Subject:", subject, "Topic:", topic);

      // Start the call with assistant configuration
      await vapi.start(assistantConfig);
      
      console.log("✅ Vapi call started successfully");
      
    } catch (error: any) {
      console.error("❌ Failed to start Vapi call:", error);
      setCallStatus(CallStatus.ERROR);
      setError(error.message || "Failed to start the session. Please try again.");
    }
  };

  const handleDisconnect = () => {
    console.log("🛑 Disconnecting call...");
    try {
      vapi.stop();
      setCallStatus(CallStatus.FINISHED);
    } catch (error) {
      console.error("Error disconnecting call:", error);
    }
  };

  const getButtonText = () => {
    switch (callStatus) {
      case CallStatus.CONNECTING:
        return "Connecting...";
      case CallStatus.ACTIVE:
        return "End Session";
      case CallStatus.ERROR:
        return "Try Again";
      default:
        return "Start Session";
    }
  };

  const getButtonColor = () => {
    switch (callStatus) {
      case CallStatus.ACTIVE:
        return "bg-red-700";
      case CallStatus.ERROR:
        return "bg-orange-600";
      case CallStatus.CONNECTING:
        return "bg-blue-600 animate-pulse";
      default:
        return "bg-blue-600";
    }
  };

  return (
    <section className="flex flex-col h-[70vh] mb-20">
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Microphone Permission Warning */}
      {micPermission === false && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <strong>Microphone Access Required:</strong> Please allow microphone access in your browser to use voice sessions.
        </div>
      )}

      <section className="flex gap-8 max-sm:flex-col">
        <div className="flex flex-col items-center">
          <div
            className="relative w-40 h-40 rounded-full flex items-center justify-center"
            style={{ backgroundColor: getSubjectColor(subject) }}
          >
            <div
              className={cn(
                "absolute transition-opacity duration-1000",
                callStatus === CallStatus.FINISHED ||
                  callStatus === CallStatus.INACTIVE ||
                  callStatus === CallStatus.ERROR
                  ? "opacity-100"
                  : "opacity-0",
                callStatus === CallStatus.CONNECTING &&
                  "opacity-100 animate-pulse"
              )}
            >
              <Image
                src={`/icons/${subject}.svg`}
                alt={subject}
                width={80}
                height={80}
                className="max-sm:w-fit"
              />
            </div>

            <div
              className={cn(
                "absolute transition-opacity duration-1000",
                callStatus === CallStatus.ACTIVE ? "opacity-100" : "opacity-0"
              )}
            >
              <Lottie
                lottieRef={lottieRef}
                animationData={soundwaves}
                autoplay={false}
                className="w-32 h-32"
              />
            </div>
          </div>
          <p className="font-bold text-2xl mt-4">{name}</p>
          
          {/* Status indicator */}
          <p className="text-sm text-gray-600 mt-2">
            Status: {callStatus.toLowerCase().replace('_', ' ')}
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-4">
            <Image
              src={userImage}
              alt={userName}
              width={130}
              height={130}
              className="rounded-lg"
            />
            <p className="font-bold text-2xl mt-2">{userName}</p>
          </div>
          
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg mb-4"
            onClick={toggleMicrophone}
            disabled={callStatus !== CallStatus.ACTIVE}
          >
            <Image
              src={isMuted ? "/icons/mic-off.svg" : "/icons/mic-on.svg"}
              alt="mic"
              width={24}
              height={24}
            />
            <p className="max-sm:hidden">
              {isMuted ? "Turn on microphone" : "Turn off microphone"}
            </p>
          </button>
          
          <button
            className={cn(
              "rounded-lg py-3 px-6 cursor-pointer transition-colors w-full text-white font-semibold",
              getButtonColor()
            )}
            onClick={
              callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall
            }
            disabled={callStatus === CallStatus.CONNECTING || micPermission === false}
          >
            {getButtonText()}
          </button>
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Conversation</h3>
        <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto">
          {messages.length === 0 && callStatus === CallStatus.ACTIVE && (
            <p className="text-gray-500 italic">Waiting for conversation to start...</p>
          )}
          {messages.map((message, index) => {
            if (message.role === "assistant") {
              return (
                <p key={index} className="mb-2 max-sm:text-sm">
                  <strong>{name.split(" ")[0]}:</strong> {message.content}
                </p>
              );
            } else {
              return (
                <p key={index} className="mb-2 text-blue-600 max-sm:text-sm">
                  <strong>{userName}:</strong> {message.content}
                </p>
              );
            }
          })}
        </div>
      </section>
    </section>
  );
};

export default VapiCompanionComponent;