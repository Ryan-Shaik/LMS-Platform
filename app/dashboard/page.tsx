import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Clock, TrendingUp } from "lucide-react";
import { createOrUpdateUser } from "@/controllers/UserController";
import { getUserCompanions, getCompanionStats } from "@/controllers/CompanionController";
import { getUserSessions, getUserSessionStats } from "@/controllers/SessionController";
import CompanionCard from "@/views/components/CompanionCard";
import SessionCard from "@/views/components/SessionCard";
import { ROUTES } from "@/lib/constants";

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect(ROUTES.SIGN_IN);
  }

  // Initialize user if needed
  await createOrUpdateUser();

  // Fetch data
  const [
    userCompanionsResult,
    recentSessionsResult,
    sessionStatsResult,
    companionStatsResult
  ] = await Promise.all([
    getUserCompanions(6),
    getUserSessions(6),
    getUserSessionStats(),
    getCompanionStats()
  ]);

  const userCompanions = userCompanionsResult.data || [];
  const recentSessions = recentSessionsResult.data || [];
  const sessionStats = sessionStatsResult.data || { totalSessions: 0, totalDuration: 0, averageRating: 0 };
  const companionStats = companionStatsResult.data || { totalCompanions: 0, userCompanions: 0 };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your learning overview.</p>
        </div>
        <Link href="/companions/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Companion
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Companions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companionStats.userCompanions}</div>
            <p className="text-xs text-muted-foreground">
              AI tutors you've created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Learning sessions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(sessionStats.totalDuration / 60)}h</div>
            <p className="text-xs text-muted-foreground">
              Total time spent learning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessionStats.averageRating > 0 ? sessionStats.averageRating.toFixed(1) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Session satisfaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Companions */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Companions</h2>
          <Link href={ROUTES.COMPANIONS}>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        
        {userCompanions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCompanions.map((companion) => (
              <CompanionCard key={companion.id} companion={companion} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No companions yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first AI tutor to get started with personalized learning.
              </p>
              <Link href="/companions/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Companion
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recent Sessions */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Sessions</h2>
          <Link href={ROUTES.SESSIONS}>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        
        {recentSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No sessions yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start learning with your AI companions to see your session history here.
              </p>
              <Link href={ROUTES.COMPANIONS}>
                <Button>
                  Browse Companions
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}