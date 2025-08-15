"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Crown, Users, Clock, TrendingUp } from "lucide-react";
import { UsageStats, SubscriptionTier } from "@/models/types";
import SubscriptionManagement from "./SubscriptionManagement";
import Link from "next/link";

interface UsageStatsProps {
  usage: UsageStats;
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

const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return "bg-red-500";
  if (percentage >= 75) return "bg-yellow-500";
  return "bg-green-500";
};

export default function UsageStats({ usage, tier }: UsageStatsProps) {
  const companionPercentage = usage.companionLimit === -1 
    ? 0 
    : (usage.companionsUsed / usage.companionLimit) * 100;
    
  const sessionPercentage = usage.sessionLimit === -1 
    ? 0 
    : (usage.sessionsUsed / usage.sessionLimit) * 100;

  const isNearCompanionLimit = companionPercentage >= 80;
  const isNearSessionLimit = sessionPercentage >= 80;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Current Plan</CardTitle>
          <Badge className={`${getTierColor(tier)} text-white`}>
            <Crown className="w-3 h-3 mr-1" />
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {tier === SubscriptionTier.FREE 
                ? "Free plan with basic features" 
                : `${tier.charAt(0).toUpperCase() + tier.slice(1)} plan with premium features`
              }
            </p>
            {tier === SubscriptionTier.FREE && (
              <Link href="/pricing">
                <Button size="sm" variant="outline">
                  Upgrade
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Companions Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Companions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{usage.companionsUsed}</span>
                <span className="text-sm text-gray-600">
                  {usage.companionLimit === -1 ? "Unlimited" : `of ${usage.companionLimit}`}
                </span>
              </div>
              
              {usage.companionLimit !== -1 && (
                <div className="space-y-1">
                  <Progress 
                    value={companionPercentage} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{Math.round(companionPercentage)}% used</span>
                    {isNearCompanionLimit && (
                      <span className="text-orange-600 font-medium">
                        Near limit
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {!usage.canCreateCompanion && (
                <div className="mt-2">
                  <Link href="/pricing">
                    <Button size="sm" variant="outline" className="w-full">
                      Upgrade for More
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sessions Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{usage.sessionsUsed}</span>
                <span className="text-sm text-gray-600">
                  {usage.sessionLimit === -1 ? "Unlimited" : `of ${usage.sessionLimit}`}
                </span>
              </div>
              
              {usage.sessionLimit !== -1 && (
                <div className="space-y-1">
                  <Progress 
                    value={sessionPercentage} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{Math.round(sessionPercentage)}% used</span>
                    {isNearSessionLimit && (
                      <span className="text-orange-600 font-medium">
                        Near limit
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {!usage.canStartSession && (
                <div className="mt-2">
                  <Link href="/pricing">
                    <Button size="sm" variant="outline" className="w-full">
                      Upgrade for More
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Recommendation */}
      {(isNearCompanionLimit || isNearSessionLimit) && tier === SubscriptionTier.FREE && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-900">
                  You're approaching your limits
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  Upgrade to continue creating companions and starting sessions without interruption.
                </p>
                <Link href="/pricing">
                  <Button size="sm" className="mt-3 bg-orange-600 hover:bg-orange-700">
                    View Upgrade Options
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}