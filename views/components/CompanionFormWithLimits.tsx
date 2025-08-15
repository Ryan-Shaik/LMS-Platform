"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCompanion } from "@/controllers/CompanionController";
import { CreateCompanionData, UpgradePromptData } from "@/models/types";
import UpgradePrompt from "./UpgradePrompt";
import CompanionForm from "../forms/CompanionForm";

export default function CompanionFormWithLimits() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeData, setUpgradeData] = useState<UpgradePromptData | null>(null);
  const router = useRouter();

  const handleSubmit = async (data: CreateCompanionData) => {
    setIsSubmitting(true);
    
    try {
      const result = await createCompanion(data);
      
      if (result.success) {
        router.push("/companions");
      } else {
        // Check if this is a limit error with upgrade prompt
        if (result.data && typeof result.data === 'object' && 'currentTier' in result.data) {
          setUpgradeData(result.data as UpgradePromptData);
          setShowUpgradePrompt(true);
        } else {
          // Handle other errors
          alert(result.error || "Failed to create companion");
        }
      }
    } catch (error) {
      console.error("Error creating companion:", error);
      alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CompanionForm 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      
      {upgradeData && (
        <UpgradePrompt
          isOpen={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          upgradeData={upgradeData}
        />
      )}
    </>
  );
}