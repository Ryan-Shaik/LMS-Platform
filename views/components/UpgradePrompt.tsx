"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Crown, Zap, Star, X } from "lucide-react";
import { UpgradePromptData, SubscriptionTier } from "@/models/types";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  upgradeData: UpgradePromptData;
}

const getTierIcon = (tier: SubscriptionTier) => {
  switch (tier) {
    case SubscriptionTier.BASIC:
      return <Zap className="w-5 h-5" />;
    case SubscriptionTier.PRO:
      return <Crown className="w-5 h-5" />;
    case SubscriptionTier.ENTERPRISE:
      return <Star className="w-5 h-5" />;
    default:
      return <Zap className="w-5 h-5" />;
  }
};

const getTierColor = (tier: SubscriptionTier) => {
  switch (tier) {
    case SubscriptionTier.BASIC:
      return "bg-blue-500";
    case SubscriptionTier.PRO:
      return "bg-purple-500";
    case SubscriptionTier.ENTERPRISE:
      return "bg-amber-500";
    default:
      return "bg-blue-500";
  }
};

const getTierBenefits = (tier: SubscriptionTier) => {
  switch (tier) {
    case SubscriptionTier.BASIC:
      return [
        "15 AI Companions",
        "100 Learning Sessions/month",
        "Advanced voice interactions",
        "Session analytics",
        "Priority support"
      ];
    case SubscriptionTier.PRO:
      return [
        "Unlimited AI Companions",
        "Unlimited Learning Sessions",
        "Premium voice models",
        "Advanced analytics",
        "API access",
        "Early access to features"
      ];
    case SubscriptionTier.ENTERPRISE:
      return [
        "Everything in Pro",
        "White-label solution",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee"
      ];
    default:
      return [];
  }
};

export default function UpgradePrompt({ isOpen, onClose, upgradeData }: UpgradePromptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = () => {
    setIsLoading(true);
    router.push(`/pricing?upgrade=${upgradeData.requiredTier}`);
  };

  const tierBenefits = getTierBenefits(upgradeData.requiredTier);
  const tierColor = getTierColor(upgradeData.requiredTier);
  const tierIcon = getTierIcon(upgradeData.requiredTier);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-full ${tierColor} text-white`}>
                {tierIcon}
              </div>
              <DialogTitle className="text-xl">
                Upgrade to {upgradeData.requiredTier.charAt(0).toUpperCase() + upgradeData.requiredTier.slice(1)}
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-base">
            {upgradeData.message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current vs Required */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600">Current Plan</p>
              <Badge variant="outline" className="mt-1">
                {upgradeData.currentTier.charAt(0).toUpperCase() + upgradeData.currentTier.slice(1)}
              </Badge>
            </div>
            <div className="text-gray-400">→</div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Recommended</p>
              <Badge className={`mt-1 ${tierColor} text-white`}>
                {upgradeData.requiredTier.charAt(0).toUpperCase() + upgradeData.requiredTier.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Benefits */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">What you'll get:</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {tierBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${tierColor}`} />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className={`w-full sm:w-auto ${tierColor} hover:opacity-90`}
          >
            {isLoading ? "Loading..." : `Upgrade to ${upgradeData.requiredTier.charAt(0).toUpperCase() + upgradeData.requiredTier.slice(1)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}