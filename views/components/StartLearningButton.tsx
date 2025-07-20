"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { startLearningSession } from "@/controllers/LearningSessionController";

interface StartLearningButtonProps {
  companionId: string;
  companionName: string;
}

export default function StartLearningButton({ companionId, companionName }: StartLearningButtonProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleStartLearning = async () => {
    setIsStarting(true);
    setError(null);

    try {
      const result = await startLearningSession(companionId);

      if (result.success && result.data) {
        // Redirect to the learning session page
        router.push(`/sessions/${result.data.id}`);
      } else {
        setError(result.error || "Failed to start learning session");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      <Button 
        onClick={handleStartLearning}
        disabled={isStarting}
        className="w-full"
        size="lg"
      >
        {isStarting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Starting Session...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Start Learning with {companionName}
          </>
        )}
      </Button>
    </div>
  );
}