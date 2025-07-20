import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Settings } from "lucide-react";
import { createOrUpdateUser, getUserProfile } from "@/controllers/UserController";
import { getCompanionStats } from "@/controllers/CompanionController";
import { getUserSessionStats } from "@/controllers/SessionController";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect(ROUTES.SIGN_IN);
  }

  // Ensure user exists in our database
  await createOrUpdateUser();

  // Fetch user data
  const [
    userProfileResult,
    sessionStatsResult,
    companionStatsResult
  ] = await Promise.all([
    getUserProfile(),
    getUserSessionStats(),
    getCompanionStats()
  ]);

  const userProfile = userProfileResult.data;
  const sessionStats = sessionStatsResult.data || { totalSessions: 0, totalDuration: 0, averageRating: 0 };
  const companionStats = companionStatsResult.data || { totalCompanions: 0, userCompanions: 0 };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account and learning preferences.</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            {clerkUser.imageUrl && (
              <img
                src={clerkUser.imageUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold">
                {clerkUser.firstName} {clerkUser.lastName}
              </h3>
              <div className="flex items-center text-gray-600 mt-1">
                <Mail className="w-4 h-4 mr-1" />
                {clerkUser.emailAddresses[0]?.emailAddress}
              </div>
              <div className="flex items-center text-gray-600 mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                Joined {formatDate(clerkUser.createdAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {companionStats.userCompanions}
              </div>
              <p className="text-sm text-gray-600">Companions Created</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {sessionStats.totalSessions}
              </div>
              <p className="text-sm text-gray-600">Sessions Completed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {Math.round(sessionStats.totalDuration / 60)}h
              </div>
              <p className="text-sm text-gray-600">Total Learning Time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Learning Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {userProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Theme</label>
                <div className="mt-1">
                  <Badge variant="secondary">
                    {userProfile.preferences.theme}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Language</label>
                <div className="mt-1">
                  <Badge variant="secondary">
                    {userProfile.preferences.language}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Voice Preference</label>
                <div className="mt-1">
                  <Badge variant="secondary">
                    {userProfile.preferences.voicePreference}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Teaching Style</label>
                <div className="mt-1">
                  <Badge variant="secondary">
                    {userProfile.preferences.stylePreference}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Loading preferences...</p>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Manage your account settings and data through Clerk's user management.
          </p>
          <div className="text-sm text-gray-500">
            For account deletion or data export, please contact support.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}