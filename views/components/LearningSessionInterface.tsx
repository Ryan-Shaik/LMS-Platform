"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Clock, 
  User, 
  MessageSquare,
  Star,
  X
} from "lucide-react";
import { LearningSession, Companion } from "@/models/types";
import { completeLearningSession } from "@/controllers/LearningSessionController";
import { getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi-client";
import { configureAssistant } from "@/lib/vapi-utils";

interface LearningSessionInterfaceProps {
  session: LearningSession;
  companion: Companion;
}

export default function LearningSessionInterface({ 
  session, 
  companion 
}: LearningSessionInterfaceProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<Date>();

  const subjectColor = getSubjectColor(companion.subject);

  useEffect(() => {
    // Auto-start the call when component mounts
    handleStartCall();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleStartCall = async () => {
    console.log("🚀 Starting real Vapi call...");
    
    try {
      // Start duration timer
      startTimeRef.current = new Date();
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
          setDuration(elapsed);
        }
      }, 1000);

      // Configure the assistant for this specific companion
      const assistantConfig = configureAssistant("female", "casual");
      
      // Override the first message to be specific to this companion
      assistantConfig.firstMessage = `Hello! I'm ${companion.name}, your ${companion.subject} tutor. Today we'll be learning about ${companion.topic}. I'm excited to start our session together!`;
      
      // Add companion-specific system message
      assistantConfig.model.messages = [
        {
          role: "system",
          content: `You are ${companion.name}, a ${companion.subject} tutor. You are teaching about ${companion.topic}. Keep responses short and conversational. Be encouraging and educational. Always speak first when the session starts.`,
        },
      ];

      console.log("📋 Starting call with config:", assistantConfig);
      
      // Start the actual Vapi call
      await vapi.start(assistantConfig);
      
      setIsCallActive(true);
      console.log("✅ Vapi call started successfully");
      
    } catch (error: any) {
      console.error("❌ Failed to start Vapi call:", error);
      alert(`Failed to start session: ${error.message}`);
    }
  };

  const handleEndCall = () => {
    console.log("🛑 Ending Vapi call...");
    
    try {
      vapi.stop();
    } catch (error) {
      console.error("Error stopping Vapi call:", error);
    }
    
    setIsCallActive(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Show feedback form
    setShowFeedback(true);
  };

  const handleToggleMute = () => {
    try {
      const currentMuted = vapi.isMuted();
      vapi.setMuted(!currentMuted);
      setIsMuted(!currentMuted);
      console.log("🎤 Microphone toggled:", !currentMuted ? "muted" : "unmuted");
    } catch (error) {
      console.error("Error toggling microphone:", error);
      // Fallback to local state
      setIsMuted(!isMuted);
    }
  };

  const handleSubmitFeedback = async () => {
    setIsSubmitting(true);
    
    try {
      const result = await completeLearningSession(session.id, {
        feedback: feedback.trim() || undefined,
        rating: rating || undefined,
      });

      if (result.success) {
        router.push("/sessions");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipFeedback = async () => {
    setIsSubmitting(true);
    
    try {
      await completeLearningSession(session.id, {});
      router.push("/sessions");
    } catch (error) {
      console.error("Error completing session:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (showFeedback) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Session Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600">
                You spent {formatTime(duration)} learning with {companion.name}
              </p>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rate your experience:</label>
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1 ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Feedback (optional):</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="How was your learning experience?"
                className="w-full p-3 border rounded-md resize-none"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
              <Button
                onClick={handleSkipFeedback}
                variant="outline"
                disabled={isSubmitting}
              >
                Skip
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge 
              style={{ backgroundColor: subjectColor }}
              className="text-white"
            >
              {companion.subject}
            </Badge>
            <h1 className="text-lg font-semibold">{companion.name}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatTime(duration)}</span>
            </div>
            
            <Button
              onClick={() => router.push("/companions")}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Avatar/Status */}
          <div className="space-y-4">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
              isCallActive ? "bg-green-100 animate-pulse" : "bg-gray-100"
            }`}>
              <User className={`w-16 h-16 ${
                isCallActive ? "text-green-600" : "text-gray-400"
              }`} />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{companion.name}</h2>
              <p className="text-gray-600">{companion.topic}</p>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            {isCallActive ? (
              <>
                <p className="text-lg font-medium text-green-600">
                  Learning session in progress
                </p>
                <p className="text-gray-600">
                  Speak naturally with your AI tutor
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-600">
                  Connecting to your AI tutor...
                </p>
                <p className="text-gray-500">
                  Please wait while we establish the connection
                </p>
              </>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleToggleMute}
              variant={isMuted ? "destructive" : "outline"}
              size="lg"
              className="rounded-full w-16 h-16"
              disabled={!isCallActive}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </Button>
            
            <Button
              onClick={isCallActive ? handleEndCall : handleStartCall}
              variant={isCallActive ? "destructive" : "default"}
              size="lg"
              className="rounded-full w-16 h-16"
            >
              {isCallActive ? (
                <PhoneOff className="w-6 h-6" />
              ) : (
                <Phone className="w-6 h-6" />
              )}
            </Button>
          </div>

          {/* Instructions */}
          {isCallActive && (
            <Card className="max-w-md mx-auto">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-left">
                    <p className="font-medium mb-1">Tips for your session:</p>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Speak clearly and naturally</li>
                      <li>• Ask questions when you need clarification</li>
                      <li>• Take your time to understand concepts</li>
                      <li>• Click the red button when you're done</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}