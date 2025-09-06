"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  ExternalLink,
  Crown,
  RefreshCw
} from "lucide-react";
import { SubscriptionTier } from "@/models/types";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SubscriptionManagementProps {
  tier: SubscriptionTier;
}

const getTierColor = (tier: SubscriptionTier) => {
  switch (tier) {
    case SubscriptionTier.FREE:
      return "bg-gray-500";
    case SubscriptionTier.BASIC:
      return "bg-blue-500";
    case SubscriptionTier.PRO:
      return "bg-purple-500";
    case SubscriptionTier.ENTERPRISE:
      return "bg-amber-500";
    default:
      return "bg-gray-500";
  }
};

export default function SubscriptionManagement({ tier }: SubscriptionManagementProps) {
  const { user } = useUser();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get subscription info from Clerk user metadata
  const subscription = user?.publicMetadata?.subscription as any;

  const handleRefreshSubscription = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/subscription/refresh', {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh the page to show updated data
        router.refresh();
      } else {
        console.error('Failed to refresh subscription');
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Subscription Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Current Plan</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={`${getTierColor(tier)} text-white`}>
                <Crown className="w-3 h-3 mr-1" />
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </Badge>
              {subscription && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Active
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Plan Description */}
        <div className="text-sm text-gray-600">
          {tier === SubscriptionTier.FREE && "Free plan with basic features"}
          {tier === SubscriptionTier.BASIC && "Basic plan with enhanced features"}
          {tier === SubscriptionTier.PRO && "Pro plan with unlimited access"}
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2">
          {tier === SubscriptionTier.FREE ? (
            <Link href="/pricing">
              <Button className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
          ) : (
            <Link href="/pricing">
              <Button className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
            </Link>
          )}
          
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshSubscription}
            disabled={isRefreshing}
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        </div>

        {/* Note */}
        <div className="text-xs text-gray-500 text-center">
          {tier === SubscriptionTier.FREE 
            ? "Upgrade to unlock more companions and sessions"
            : "Manage your subscription through Clerk's secure billing portal"
          }
        </div>
      </CardContent>
    </Card>
  );
}